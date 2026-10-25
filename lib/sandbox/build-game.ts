// Turns a 1v1 aoe4world game summary into the sandbox board data: every building, unit and tech
// each player made, when, and what they could have made. Server only (uses the reference data).
import {
  TIER_ATTRIB, buildingsByBase, byPbgid, catalog, civsByBase, getVariant, idx, unitBaseByKey, unitVariant,
  type CatalogEntry, type IdxEntry,
} from "./reference";
import type {
  ArmyCard, Building, FortSlot, GameData, Item, ItemGroup, Player, Selector, StatEffect, Tech, TechGroup, Tier, UnitVariant,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any -- raw summary JSON */
type Raw = Record<string, any>;

// each civ's land trader (Abbasid/Ayyubid use a Trade Caravan); always shown, even when never made
export const LAND_TRADERS = ["trader", "trade-caravan", "reindeer-trader"];
const ECO_UNITS = new Set(["villager", "scout", ...LAND_TRADERS]);

const STAT_PROPS = new Set(["hitpoints", "meleeArmor", "rangedArmor", "meleeAttack", "rangedAttack"]);

// fortification column, top to bottom; each option is (building, its gate) and a civ uses the ones it can build
const FORT_SLOTS: [string, string, [string, string | null][]][] = [
  // Rus have no outpost; their Wooden Fortress fills that role
  ["outpost", "Outpost", [["outpost", null], ["toll-outpost", null], ["fortified-outpost", null],
    ["wooden-fortress", null]]],
  ["wood-wall", "Wooden wall", [["palisade", "palisade-gate"],
    ["fortified-palisade-wall", "fortified-palisade-gate"]]],
  ["stone-wall", "Stone wall", [["stone-wall", "stone-wall-gate"]]],
  ["tower", "Wall tower", [["stone-wall-tower", null]]],
  ["fort", "Forts", [["keep", null], ["castle", null], ["tughlaqabad-fort", null]]],
];
const FORT_BASES = new Set(FORT_SLOTS.flatMap(([, , opts]) => opts.flat().filter((b): b is string => !!b)));

const CIV_CODES: Record<string, string> = {
  rus: "ru", abbasid_dynasty: "ab", english: "en", french: "fr", holy_roman_empire: "hr",
  chinese: "ch", delhi_sultanate: "de", mongols: "mo", ottomans: "ot", malians: "ma",
  japanese: "ja", byzantines: "by", ayyubids: "ay", order_of_the_dragon: "od",
  zhu_xis_legacy: "zx", jeanne_darc: "je",
};
const DROPOFFS = new Set(["mill", "lumber-camp", "mining-camp", "hunting-cabin", "ger", "farmhouse", "pasture", "cattle-ranch"]);
// display order of research buildings; anything else goes after, sorted by name
const BUILDING_ORDER = ["dropoffs", "town-center", "blacksmith", "barracks", "archery-range", "stable",
  "siege-workshop", "university", "madrasa", "monastery", "mosque", "abbey-of-the-trinity",
  "house-of-wisdom", "market", "outpost", "wooden-fortress", "keep", "dock"];

// villager upgrades shown beside the villager (displayClass prefix -> line); tiered lines share one slot
const GATHER_LINES: [string, string][] = [["Food Gathering Technology", "food"], ["Hunting Technology", "hunting"],
  ["Wood Gathering Technology", "wood"], ["Woodcutting Technology", "woodcutting"],
  ["Mining Technology", "mining"], ["Villager Technology", "villager"]];
const NOT_VILLAGER = new Set(["professional-scouts"]); // filed under hunting, but it upgrades scouts

// techs whose aoe4world entry has no effects, so nothing says which units they boost; read off their descriptions
const SELECT_FALLBACK: Record<string, Selector[]> = {
  "serpentine-powder": [{ class: [["handcannon"]] }], // "Handcannoneers gain +5 damage..."
  "silk-bowstrings": [{ class: [["archer"]] }], // "Archers +1 range and Mounted Archers +0.5 range"
};

// army is shown as one card per production building; these always get a card, built or not
// (the dock's card goes in its own Navy section)
const CORE_PRODUCTION = ["barracks", "archery-range", "stable", "siege-workshop", "dock"];
// the civ's religious building also always gets a card: it holds the stored relics
const RELIGIOUS = ["monastery", "mosque", "prayer-tent", "buddhist-temple", "shinto-shrine"];

const ECO_BUILDINGS = new Set(["House", "Mill", "Hunting Cabin", "Mining Camp", "Lumber Camp", "Farm", "Town Center",
  "Capital Town Center", "Market"]);

const ECO_CLASSES = ["economic_upgrade", "scar_economic_upgrade"];
const byNum = (a: number, b: number) => a - b;
const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
/** Python's str.title(): "abbasid dynasty" -> "Abbasid Dynasty" */
const title = (s: string) => s.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase());

function civTrader(civ: string): [string, UnitVariant] | [null, null] {
  for (const base of LAND_TRADERS) {
    for (let age = 1; age <= 4; age++) {
      const v = getVariant(base, age, civ);
      if (v) return [base, v];
    }
  }
  return [null, null];
}

/** Passive stat changes from researched techs, with when they kicked in. */
function statEffects(researched: [number, number][]): StatEffect[] {
  const out: StatEffect[] = [];
  for (const [pbgid, time] of researched) {
    const e = byPbgid.get(pbgid);
    const effects = (e?.effects ?? [])
      .filter((fx) => fx.type === "passive" && STAT_PROPS.has(fx.property ?? ""))
      .map((fx) => ({ property: fx.property!, select: fx.select!, effect: fx.effect!, value: fx.value! }));
    if (effects.length) out.push({ t: time, name: e!.name, effects });
  }
  return out;
}

/** Economic tech with an effect aimed at villagers, e.g. Abbasid Agriculture or Improved Processing. */
function boostsVillagers(e: CatalogEntry): boolean {
  const eco = (e.classes ?? []).some((c) => ECO_CLASSES.includes(c));
  return eco && (e.effects ?? []).some((fx) =>
    (fx.select?.class ?? []).some((g) => g.includes("worker") || g.includes("villager"))
    || (fx.select?.id ?? []).includes("villager"));
}

function researchGroup(producers: string[]): string {
  if (producers.some((p) => DROPOFFS.has(p))) return "dropoffs";
  // defense techs file under the fort they equip, not a landmark that can also research them
  const fort = producers.find((p) => FORT_BASES.has(p));
  if (fort) return fort;
  const p = producers[0] ?? "other";
  return p === "capital-town-center" ? "town-center" : p;
}

function techName(e: CatalogEntry): string {
  // unit upgrades are all called "Upgrade to Veteran"; the description names the result
  const m = / to (.+?)\./.exec(e.description ?? "");
  return e.type === "upgrade" && m ? m[1] : e.name;
}

/** All techs a civ can research, grouped by building; researched ones carry their time. */
function techGroups(civ: string, researched: [number, number][], landmarkIds: Set<number>,
  researchTimes: Map<number, number[]>): TechGroup[] {
  const landmarkBases = new Set([...landmarkIds].filter((p) => byPbgid.has(p)).map((p) => byPbgid.get(p)!.baseId));
  const techs = new Map<string, Tech>();
  for (const e of catalog) {
    // no producer = automatic (e.g. militia age-up), not researched anywhere
    if (!e.civs.includes(civ) || !e.producedBy?.length) continue;
    const prev = techs.get(e.baseId);
    if (prev && e.age >= prev.age) continue;
    const eco = (e.classes ?? []).some((c) => ECO_CLASSES.includes(c));
    const tech: Tech = {
      id: e.baseId, name: techName(e), icon: e.icon, age: e.age,
      kind: eco ? "eco" : "mil", unique: !!e.unique, type: e.type,
      // an age-up researched as a tech (Abbasid wings): shown on its building,
      // but the age itself is the advantage, not the tech
      landmark: landmarkBases.has(e.baseId),
      // who each effect applies to, used to hang the tech on a unit or building
      select: (() => {
        const sel = (e.effects ?? []).filter((fx) => fx.select && Object.keys(fx.select).length).map((fx) => fx.select!);
        return sel.length ? sel : SELECT_FALLBACK[e.baseId] ?? [];
      })(),
      group: researchGroup(e.producedBy ?? []), t: null,
      // bought per building (Arrowslits, Springald Emplacement...), not fort-wide
      equip: (e.classes ?? []).includes("emplacement_upgrade")
        || (e.displayClasses ?? []).some((dc) => dc.endsWith("Emplacement")),
    };
    // tiered lines, e.g. "Melee Damage Technology 2/3" -> line "Melee Damage", tier 2
    for (const dc of e.displayClasses ?? []) {
      const gather = GATHER_LINES.find(([prefix]) => dc.startsWith(prefix))?.[1];
      if (gather && !NOT_VILLAGER.has(e.baseId)) tech.gather = gather;
      const m = /^(.+) Technology (\d)\/\d$/.exec(dc);
      if (m) Object.assign(tech, { line: m[1], tier: Number(m[2]) });
    }
    if (tech.gather === undefined && boostsVillagers(e)) {
      // civ-specific villager boosts: "Farm Technology" -> "farm", "Economic Technology" -> "economic"
      const dc = (e.displayClasses?.length ? e.displayClasses : ["Economic Technology"])[0];
      tech.gather = dc.replace(" Technology", "").toLowerCase();
    }
    techs.set(e.baseId, tech);
  }
  for (const [pbgid, time] of researched) {
    const e = byPbgid.get(pbgid);
    const tech = e && techs.get(e.baseId);
    if (tech) {
      tech.t = time;
      // emplacements are bought per building, so keep every purchase to count them
      tech.times = researchTimes.get(pbgid);
    }
  }
  const groups = new Map<string, Tech[]>();
  for (const tech of techs.values()) groups.set(tech.group, [...(groups.get(tech.group) ?? []), tech]);
  const rank = (k: string) => (BUILDING_ORDER.includes(k) ? BUILDING_ORDER.indexOf(k) : 99);
  return [...groups.keys()].sort((a, b) => rank(a) - rank(b) || cmp(a, b)).map((key) => {
    let label: string, icon: string | undefined;
    if (key === "dropoffs") {
      [label, icon] = ["Dropoffs", buildingsByBase.get("mill")!.icon];
    } else {
      const b = buildingsByBase.get(key);
      [label, icon] = [b?.name ?? title(key.replace(/-/g, " ")), b?.icon];
    }
    const sorted = groups.get(key)!.sort((a, b) => a.age - b.age || cmp(a.name, b.name));
    return { key, label, icon, techs: sorted };
  });
}

/** Fixed fortification slots; each holds the civ's own variants with their build/loss times. */
function fortSlots(civ: string, built: Map<string, { t: number[]; dead: number[] }>): FortSlot[] {
  const entry = (base: string) => {
    const b = buildingsByBase.get(base)!;
    const times = built.get(base) ?? { t: [], dead: [] };
    return { key: base, name: b.name, icon: b.icon, t: times.t, dead: times.dead };
  };
  return FORT_SLOTS.map(([key, label, options]) => ({
    key, label,
    entries: options.filter(([main]) => civsByBase.get(main)?.has(civ)).map(([main, gate]) =>
      gate ? { ...entry(main), gate: entry(gate) } : entry(main)),
  }));
}

/** {unit baseId: [lowest age, variant]} for military units this civ trains at this building. */
function trainable(civ: string, building: string): Map<string, [number, UnitVariant]> {
  const out = new Map<string, [number, UnitVariant]>();
  for (const [k, v] of unitVariant) {
    const [base, ageStr, c] = k.split("|");
    const age = Number(ageStr);
    if (c === civ && v.producedBy.includes(building) && !ECO_UNITS.has(base)) {
      const prev = out.get(base);
      if (!prev || age < prev[0]) out.set(base, [age, v]);
    }
  }
  return out;
}

type Merged = Map<string, Item>;
const mkey = (key: string, group: string) => `${key}\u0000${group}`;

/** Pull production buildings out of 'military buildings' and hang each army unit under the one that trains it. */
function armyCards(merged: Merged, civ: string): ArmyCard[] {
  const built = new Map<string, string>(); // baseId -> merged key; a later match wins
  for (const [k, it] of merged) if (it.group === "mil-buildings" && it.baseId) built.set(it.baseId, k);
  const order = [...CORE_PRODUCTION];
  const unitsBy = new Map<string, string[]>();
  const armyItems = [...merged.values()].filter((i) => i.group === "army").sort((a, b) => a.t[0] - b.t[0]);
  for (const it of armyItems) {
    const producers = it.tiers?.[0]?.producedBy ?? [];
    // prefer a building this player actually built (Warrior Monk: Monastery over Abbey of the Trinity)
    const p = producers.find((b) => built.has(b)) ?? producers.find((b) => CORE_PRODUCTION.includes(b))
      ?? producers[0] ?? "other";
    unitsBy.set(p, [...(unitsBy.get(p) ?? []), it.key]);
    if (!order.includes(p)) order.push(p);
  }
  const religious = RELIGIOUS.find((b) => civsByBase.get(b)?.has(civ));
  if (religious && !order.includes(religious)) order.push(religious);
  const cards: ArmyCard[] = [];
  const placed = new Set([...unitsBy.values()].flat());
  for (const b of order) {
    let building: Building;
    if (built.has(b)) {
      const k = built.get(b)!;
      const it = merged.get(k)!;
      merged.delete(k);
      building = it;
    } else {
      const meta = buildingsByBase.get(b);
      if (civsByBase.has(b) && !civsByBase.get(b)!.has(civ)) continue; // civ can't build it at all
      building = { name: meta?.name ?? b, icon: meta?.icon, t: [], dead: [] };
    }
    // every unit this building can train for the civ, even never-made ones (shown faded)
    const canTrain = trainable(civ, b);
    const units = [...(unitsBy.get(b) ?? [])];
    for (const [base, [, variant]] of canTrain) {
      if (placed.has(base)) continue;
      placed.add(base);
      const key = `unbuilt:${base}`;
      merged.set(mkey(key, "army"), { name: variant.name, icon: variant.icon, group: "army",
        key, baseId: base, classes: variant.classes, t: [], dead: [] });
      units.push(key);
    }
    // fixed order (age, then name) so a unit sits in the same spot in every game
    const rank = (key: string): [number, string] => {
      const it = [...merged.values()].find((i) => i.key === key && i.group === "army")!;
      const age = it.baseId !== undefined && canTrain.has(it.baseId)
        ? canTrain.get(it.baseId)![0] : (it.tiers ?? [{ tier: 9 }])[0].tier ?? 9;
      return [age, it.name];
    };
    units.sort((a, b) => { const [x, y] = [rank(a), rank(b)]; return x[0] - y[0] || cmp(x[1], y[1]); });
    cards.push({ key: b, building, units, naval: b === "dock", religious: b === religious });
  }
  return cards;
}

function buildPlayer(pl: Raw): Player {
  const civ = CIV_CODES[pl.civilization];
  const landmarks: Raw[] = pl.analysis.landmarks;
  const landmarkIds = new Set<number>(landmarks.map((l) => l.pbgid));
  const ages = landmarks.filter((l) => l.newAge).map((l) => ({ age: l.newAge, t: l.gameTime, name: l.name }));
  const buildOrder: Raw[] = pl.buildOrder;
  const timesOf = (b: Raw): number[] => (b.finished?.length ? b.finished : b.constructed) ?? [];

  // when each unit type reached each tier: its upgrade finishing, or the first unit of that tier, whichever is first
  const tierFrom = new Map<string, number>(); // "baseId|tier" -> time
  const reach = (base: string, tier: number, time: number) => {
    const k = `${base}|${tier}`;
    tierFrom.set(k, Math.min(time, tierFrom.get(k) ?? time));
  };
  for (const b of buildOrder) {
    const times = timesOf(b);
    const meta = idx.get(b.pbgid);
    if (!times.length || !meta) continue;
    if (b.type === "Unit") {
      reach(meta.baseId, meta.age!, Math.min(...times));
    } else if (b.type === "Upgrade" && meta.attribName.startsWith("upgrade_unit_")) {
      const m = TIER_ATTRIB.exec(meta.attribName);
      const base = m && unitBaseByKey.get(`${m[1]}|${civ}`);
      if (base) reach(base, Number(m![2]), Math.min(...times));
    }
  }

  const items: Item[] = [];
  const fortsBuilt = new Map<string, { t: number[]; dead: number[] }>();
  for (const b of buildOrder) {
    if (b.type === "Animal" || b.type === "Age") continue;
    const meta: IdxEntry | undefined = idx.get(b.pbgid);
    if (!meta) continue;
    const times = [...timesOf(b)].sort(byNum);
    if (!times.length) continue;
    if (FORT_BASES.has(meta.baseId)) {
      const f = fortsBuilt.get(meta.baseId) ?? { t: [], dead: [] };
      f.t = [...f.t, ...times].sort(byNum);
      f.dead = [...f.dead, ...b.destroyed].sort(byNum);
      fortsBuilt.set(meta.baseId, f);
      continue;
    }
    const name = meta.name;
    // wing-style age-up: lives on its building as a tech, not as its own landmark tile
    if (landmarkIds.has(b.pbgid) && byPbgid.has(b.pbgid)) continue;
    let group: ItemGroup;
    if (landmarkIds.has(b.pbgid)) group = "landmarks";
    else if (b.type === "Building") group = ECO_BUILDINGS.has(name) ? "eco-buildings" : "mil-buildings";
    else if (b.type === "Unit") group = ECO_UNITS.has(meta.baseId) ? "economy" : "army";
    else group = "tech";
    const item: Item = { name, icon: meta.icon, group, baseId: meta.baseId,
      t: times, dead: [...b.destroyed].sort(byNum), key: meta.icon };
    if (b.type === "Unit") {
      // one tile per unit type; its icon/name follow the highest tier reached
      const base = meta.baseId;
      item.key = base;
      item.tiers = [...tierFrom].filter(([k]) => k.split("|")[0] === base).map(([k, time]) => {
        const tier = Number(k.split("|")[1]);
        return { from: time, tier, baseId: base, ...(getVariant(base, tier, civ) ?? meta) } as Tier;
      }).sort((x, y) => x.tier - y.tier);
    }
    items.push(item);
  }
  // merge duplicate entries (unit tiers, two palisade variants) into one tile
  const merged: Merged = new Map();
  for (const it of items) {
    const k = mkey(it.key, it.group);
    const prev = merged.get(k);
    if (prev) {
      prev.t = [...prev.t, ...it.t].sort(byNum);
      prev.dead = [...prev.dead, ...it.dead].sort(byNum);
    } else {
      merged.set(k, it);
    }
  }
  for (const it of merged.values()) {
    if (it.tiers?.length) Object.assign(it, { icon: it.tiers[0].icon, name: it.tiers[0].name });
  }
  // one Town Center tile under economy buildings that also counts the capital (which stays in Landmarks too),
  // so it is there from 0:00 and fades if every TC is lost
  const tcs = [...merged].filter(([, it]) => (it.baseId ?? "").includes("town-center")).map(([k]) => k);
  if (tcs.length) {
    const parts = tcs.map((k) => merged.get(k)!);
    for (const k of tcs) if (merged.get(k)!.group === "eco-buildings") merged.delete(k);
    merged.set(mkey("town-centers", "eco-buildings"), {
      name: "Town Center (capital included)", icon: buildingsByBase.get("town-center")!.icon,
      group: "eco-buildings", key: "town-centers", baseId: "town-center-all",
      t: parts.flatMap((p) => p.t).sort(byNum), dead: parts.flatMap((p) => p.dead).sort(byNum),
    });
  }
  // all dropoff camps (mill, lumber, mining, hunting cabin...) collapse into one tile that keeps the breakdown
  const drops = [...merged].filter(([, it]) => it.group === "eco-buildings" && DROPOFFS.has(it.baseId ?? "")).map(([k]) => k);
  if (drops.length) {
    const parts = drops.map((k) => { const it = merged.get(k)!; merged.delete(k); return it; });
    merged.set(mkey("dropoffs", "eco-buildings"), {
      name: "Dropoffs", icon: parts[0].icon, group: "eco-buildings", key: "dropoffs",
      t: parts.flatMap((p) => p.t).sort(byNum), dead: parts.flatMap((p) => p.dead).sort(byNum),
      parts: [...parts].sort((a, b) => a.t[0] - b.t[0]).map((p) => ({ name: p.name, icon: p.icon, t: p.t, dead: p.dead })),
    });
  }
  // the market stays in Economy infrastructure even when it was never built
  if (civsByBase.get("market")?.has(civ) && ![...merged.values()].some((it) => it.baseId === "market")) {
    const m = buildingsByBase.get("market")!;
    merged.set(mkey("market", "eco-buildings"), { name: m.name, icon: m.icon, group: "eco-buildings",
      baseId: "market", t: [], dead: [], key: "market" });
  }
  const [traderBase, trader] = civTrader(civ);
  if (traderBase && trader && !merged.has(mkey(traderBase, "economy"))) {
    merged.set(mkey(traderBase, "economy"), { name: trader.name, icon: trader.icon, group: "economy",
      t: [], dead: [], key: traderBase });
  }
  for (const l of landmarks) {
    const k = mkey(l.icon, "landmarks");
    if (!merged.has(k) && !byPbgid.has(l.pbgid)) {
      merged.set(k, { name: l.name, icon: l.icon, group: "landmarks", t: [l.gameTime], dead: [], key: l.icon });
    }
  }
  const cards = armyCards(merged, civ);
  // the blacksmith moves into the army section; take it out of military buildings
  const bsKey = [...merged].find(([, it]) => it.baseId === "blacksmith")?.[0];
  let blacksmith: Building;
  if (bsKey) {
    blacksmith = merged.get(bsKey)!;
    merged.delete(bsKey);
  } else {
    blacksmith = { name: "Blacksmith", icon: buildingsByBase.get("blacksmith")!.icon, t: [], dead: [] };
  }
  const researched: [number, number][] = buildOrder
    .filter((b) => b.type === "Upgrade" && timesOf(b).length)
    .map((b) => [b.pbgid, [...timesOf(b)].sort(byNum)[0]]);
  const researchTimes = new Map<number, number[]>();
  for (const b of buildOrder) {
    if (b.type === "Upgrade") researchTimes.set(b.pbgid, [...(researchTimes.get(b.pbgid) ?? []), ...timesOf(b)].sort(byNum));
  }
  const actions: Raw = pl.actions ?? {};
  return {
    name: pl.name, civ: title(pl.civilization.replace(/_/g, " ")), result: pl.result, ages,
    items: [...merged.values()].filter((i) => i.group !== "tech")
      .sort((a, b) => (a.t.length ? a.t[0] : Infinity) - (b.t.length ? b.t[0] : Infinity)),
    techGroups: techGroups(civ, researched, landmarkIds, researchTimes),
    forts: fortSlots(civ, fortsBuilt),
    statEffects: statEffects(researched),
    armyCards: cards, blacksmith,
    // relics placed into / taken out of buildings, from the summary's action log
    relics: { in: [...(actions.monkStatetreeDepositRelic ?? [])].sort(byNum),
      out: [...(actions.monkRemoveRelic ?? [])].sort(byNum) },
  };
}

/** Whether a summary is a game the sandbox can show: exactly two players with known civs. */
export const isSupported = (summary: Raw) =>
  summary.players?.length === 2 && summary.players.every((p: Raw) => p.civilization in CIV_CODES);

export function buildGame(summary: Raw): GameData {
  return { duration: summary.duration, map: summary.mapName, players: summary.players.map(buildPlayer) };
}

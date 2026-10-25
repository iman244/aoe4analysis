// Decides once, per player, where every tech is drawn: on a unit, on its building, by the villager,
// under a fort, or left for the "Technologies" section. Each tech shows up in exactly one place.
import { TRADERS, selects, upSlots, villagerSlots, type UpSlot } from "./rules";
import type { ArmyCard, Building, FortEntry, FortSlot, GameData, Item, Player, Tech, TechGroup } from "./types";

/** Upgrades hung on a tile: corner badges when they fit (1-2 slots), otherwise a frame beside it. */
export type Ups = { techs: Tech[]; frame: boolean };
export type Placed = { item: Item; ups: Ups };
export type ProdCard = { card: ArmyCard; head: Building; headUps: Ups; units: Placed[] };
export type EcoCard = { key: string; head: Item; headUps: Ups; units: Placed[] };
export type FortView = { slot: FortSlot; entries: { entry: FortEntry; equip: Tech[]; upgrades: Ups }[] };

export type PlayerLayout = {
  landmarks: Placed[];
  ecoCards: EcoCard[];
  ecoRest: Item[];
  /** anything left under military buildings (production buildings move to their own cards) */
  milBuildings: Item[];
  villagerSlots: UpSlot[];
  army: ProdCard[];
  navy: ProdCard[];
  blacksmithTechs: Tech[];
  forts: FortView[];
  /** what isn't shown anywhere else */
  techGroups: TechGroup[];
};

const ups = (techs: Tech[], frameIfMany = true): Ups => ({ techs, frame: frameIfMany && upSlots(techs).length > 2 });
const groupTechs = (p: Player, key: string | undefined) => p.techGroups.find((g) => g.key === key)?.techs ?? [];

// Military techs (University/Madrasa, Siege Workshop, the production buildings' own) are hung on
// the army cards: a tech that hits one unit sits beside that unit, one that hits several units of
// a building sits beside the building icon. The first effect that matches the roster decides.
const UNIT_TECH_SKIP = new Set(["blacksmith", "dropoffs", "market"]);
function unitTechs(p: Player) {
  const roster = p.armyCards.flatMap((card) => card.units.map((key) => {
    const it = p.items.find((i) => i.group === "army" && i.key === key)!;
    const v = it.tiers ? it.tiers[0] : it;
    return { key, card: card.key, unit: { classes: v.classes ?? [], baseId: it.baseId ?? (v as { baseId?: string }).baseId } };
  }));
  const byUnit = new Map<string, Tech[]>(), byCard = new Map<string, Tech[]>(), moved = new Set<string>();
  const add = (map: Map<string, Tech[]>, k: string, tech: Tech) => map.set(k, [...(map.get(k) ?? []), tech]);
  for (const tech of p.techGroups.flatMap((g) => g.techs)) {
    // military techs, plus the dock's economy ones (Drift Nets, Extended Lines) so they sit on the fishing boat
    if (tech.type !== "technology" || (tech.kind !== "mil" && tech.group !== "dock") || tech.gather
      || UNIT_TECH_SKIP.has(tech.group)) continue;
    let hit: typeof roster = [];
    for (const sel of tech.select) {
      hit = roster.filter((r) => selects(sel, r.unit));
      if (hit.length) break;
    }
    if (!hit.length) continue;
    moved.add(tech.id);
    for (const cardKey of new Set(hit.map((h) => h.card))) {
      const inCard = hit.filter((h) => h.card === cardKey);
      if (inCard.length === 1) add(byUnit, inCard[0].key, tech);
      else add(byCard, cardKey, tech);
    }
  }
  return { byUnit, byCard, moved };
}

export function layoutPlayer(p: Player): PlayerLayout {
  const moved = new Set<string>(); // tech ids already drawn somewhere
  /** a building's own techs not drawn elsewhere yet; claims them */
  const claimOwn = (key: string | undefined) => {
    const own = groupTechs(p, key).filter((x) => x.type === "technology" && !x.gather && !moved.has(x.id));
    own.forEach((x) => moved.add(x.id));
    return own;
  };

  // forts first: equipment is bought per building (emplacements, Fortify Outpost),
  // upgrades apply to every fort at once (Boiling Oil, Medical Centers) and ride on the tile's corners
  const forts: FortView[] = p.forts.map((slot) => ({
    slot,
    entries: slot.entries.map((entry) => {
      const techs = groupTechs(p, entry.key);
      techs.forEach((x) => moved.add(x.id));
      return { entry, equip: techs.filter((x) => x.equip), upgrades: ups(techs.filter((x) => !x.equip), false) };
    }),
  }));

  // claim the army/navy techs before earlier sections (landmarks) can take them
  const attach = unitTechs(p);
  attach.moved.forEach((id) => moved.add(id));

  // techs researched at a landmark (House of Wisdom, Abbey...) ride on it like other buildings
  const landmarks = p.items.filter((i) => i.group === "landmarks").map((item) => ({ item, ups: ups(claimOwn(item.baseId)) }));

  // like the army: Town Center card holds villagers and scouts, Market card holds the trader
  const eco = p.items.filter((i) => i.group === "economy");
  const ecoBuildings = p.items.filter((i) => i.group === "eco-buildings");
  const isTrader = (it: Item) => TRADERS.includes(it.key);
  const ecoCards: EcoCard[] = [];
  for (const [key, units] of [["town-centers", eco.filter((i) => !isTrader(i))], ["market", eco.filter(isTrader)]] as const) {
    const head = ecoBuildings.find((i) => i.key === key);
    if (!head) continue;
    // the building's own leftover techs (e.g. Armored Caravans at the Market) ride on its corners
    const headUps = ups(claimOwn(key === "town-centers" ? "town-center" : key), false);
    const placed = units.map((item) => {
      if (item.key === "villager") return { item, ups: ups([], false) };
      // techs aimed at this unit by name (Professional Scouts, Spyglass) ride on its corners
      const own = p.techGroups.flatMap((g) => g.techs).filter((x) => x.type === "technology" && !x.gather
        && !moved.has(x.id) && !!item.baseId && x.select.some((sel) => (sel.id ?? []).includes(item.baseId!)));
      own.forEach((x) => moved.add(x.id));
      return { item, ups: ups(own, false) };
    });
    ecoCards.push({ key, head, headUps, units: placed });
  }
  const ecoRest = ecoBuildings.filter((i) => !ecoCards.some((c) => c.key === i.key));

  // one card per production building: units with the techs that hit only them, the building with the rest
  const prodCards = (naval: boolean) => p.armyCards.filter((card) => card.naval === naval).map((card) => {
    const units = card.units.map((key) => ({
      item: p.items.find((i) => i.group === "army" && i.key === key)!,
      ups: ups(attach.byUnit.get(key) ?? []),
    }));
    // plus the building's own techs that hit no unit (e.g. Naval Arrowslits on the Dock)
    const headUps = ups([...(attach.byCard.get(card.key) ?? []), ...claimOwn(card.key)]);
    return { card, head: card.building, headUps, units };
  });
  const army = prodCards(false);
  const navy = prodCards(true);

  return {
    landmarks, ecoCards, ecoRest,
    milBuildings: p.items.filter((i) => i.group === "mil-buildings"),
    villagerSlots: villagerSlots(p.techGroups.flatMap((g) => g.techs).filter((x) => x.gather)),
    army, navy,
    blacksmithTechs: groupTechs(p, "blacksmith"),
    forts,
    // only what isn't shown elsewhere: villager upgrades sit by the villager, unit/fort techs on their cards,
    // and Veteran/Elite promotions already show as the unit tile changing
    techGroups: p.techGroups.filter((g) => g.key !== "blacksmith")
      .map((g) => ({ ...g, techs: g.techs.filter((x) => !moved.has(x.id) && !x.gather && x.type !== "upgrade") }))
      .filter((g) => g.techs.length),
  };
}

export const layoutGame = (game: GameData) => game.players.map(layoutPlayer);

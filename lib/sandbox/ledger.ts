// Resource value of a building card at a moment, kept apart for its building, its units and its upgrades:
// what's standing or researched (asset), what died (lost), what's in production or waiting (queued), and
// all of it (spent).
import type { EcoCard, PlayerLayout, ProdCard, Ups } from "./placement";
import { countAt } from "./rules";
import type { Building, Item, Player, Tech } from "./types";

/** What a card holds: its building(s), the units it trains, and the techs drawn on it. */
export type Ledger = { buildings: (Item | Building)[]; units: Item[]; techs: Tech[] };
export type Value = { asset: number; lost: number; queued: number; spent: number };
export type Values = { buildings: Value; units: Value; upgrades: Value };

const upTechs = (list: { ups: Ups }[]) => list.flatMap((x) => x.ups.techs);

export const prodLedger = (c: ProdCard): Ledger =>
  ({ buildings: [c.head], units: c.units.map((u) => u.item), techs: [...c.headUps.techs, ...upTechs(c.units)] });

/** the Town Center card also owns the villager upgrades drawn beside the villager */
export const ecoLedger = (c: EcoCard, L: PlayerLayout): Ledger => ({
  buildings: [c.head], units: c.units.map((u) => u.item),
  techs: [...c.headUps.techs, ...upTechs(c.units), ...(c.key === "town-centers" ? L.villagerSlots.flatMap((s) => s.techs) : [])],
});

export const blacksmithLedger = (p: Player, L: PlayerLayout): Ledger =>
  ({ buildings: [p.blacksmith], units: [], techs: L.blacksmithTechs });

/** the army or navy itself, for its stats card: just the units */
export function forceLedger(L: PlayerLayout, naval: boolean): Ledger {
  const cards = naval ? L.navy : L.army.filter((c) => !c.card.religious);
  return { buildings: [], units: cards.flatMap((c) => c.units.map((u) => u.item)), techs: [] };
}

/** Everything the player has, each piece once: every building (the capital Town Center only in the Town
 *  Center card, not again under Landmarks), every unit, and every tech. */
export function playerLedger(p: Player, L: PlayerLayout): Ledger {
  const cards = [...L.army, ...L.navy];
  return {
    buildings: [
      ...L.landmarks.map((x) => x.item).filter((it) => !(it.baseId ?? "").includes("town-center")),
      ...L.ecoCards.map((c) => c.head), ...L.ecoRest, ...cards.map((c) => c.head), p.blacksmith, ...L.milBuildings,
      ...L.forts.flatMap((f) => f.entries.flatMap(({ entry }) => (entry.gate ? [entry, entry.gate] : [entry]))),
    ],
    units: [...L.ecoCards, ...cards].flatMap((c) => c.units.map((u) => u.item)),
    techs: p.techGroups.flatMap((g) => g.techs),
  };
}

/** The player's assets in the Advantage strip's groups, each piece in exactly one: age (landmarks and age-up
 *  techs), economy / military upgrades, economy / military buildings, economy / military units. Together they
 *  make up the player's whole asset value. */
export function assetGroups(p: Player, L: PlayerLayout): Record<string, Ledger> {
  const cards = [...L.army, ...L.navy];
  const techs = [...new Map(p.techGroups.flatMap((g) => g.techs).map((x) => [x.id, x])).values()];
  const none = { buildings: [], units: [], techs: [] };
  return {
    age: { ...none, buildings: L.landmarks.map((x) => x.item).filter((it) => !(it.baseId ?? "").includes("town-center")),
      techs: techs.filter((x) => x.ageUp) },
    ecoTechs: { ...none, techs: techs.filter((x) => !x.ageUp && x.kind === "eco") },
    milTechs: { ...none, techs: techs.filter((x) => !x.ageUp && x.kind === "mil") },
    ecoInfra: { ...none, buildings: [...L.ecoCards.map((c) => c.head), ...L.ecoRest] },
    milInfra: { ...none, buildings: [...cards.map((c) => c.head), p.blacksmith, ...L.milBuildings,
      ...L.forts.flatMap((f) => f.entries.flatMap(({ entry }) => (entry.gate ? [entry, entry.gate] : [entry])))] },
    ecoUnits: { ...none, units: L.ecoCards.flatMap((c) => c.units.map((u) => u.item)) },
    milUnits: { ...none, units: cards.flatMap((c) => c.units.map((u) => u.item)) },
  };
}

/** asset value of a ledger: buildings standing, units alive, techs researched */
export const assetAt = (ledger: Ledger, p: Player, t: number) => {
  const v = valueAt(ledger, p, t);
  return v.buildings.asset + v.units.asset + v.upgrades.asset;
};

/** made and lost by t, per piece (the dropoffs tile counts each camp type at its own cost) */
const pieces = (it: Item | Building) => ("parts" in it && it.parts?.length ? it.parts : [it]);
const withSpent = (v: Omit<Value, "spent">): Value => ({ ...v, spent: v.asset + v.lost + v.queued });

function standing(list: (Item | Building)[], t: number) {
  let asset = 0, lost = 0;
  for (const it of list) {
    for (const part of pieces(it)) {
      const made = countAt(part.t, t), dead = countAt(part.dead, t), cost = part.cost ?? 0;
      asset += Math.max(0, made - dead) * cost;
      lost += dead * cost;
    }
  }
  return { asset, lost };
}

/** value in production or waiting in a queue for these unit / tech ids */
function inQueue(p: Player, ids: Set<string>, t: number) {
  let queued = 0;
  for (const j of p.jobs) if (j.q <= t && t < j.e && ids.has(j.id)) queued += j.cost;
  return queued;
}

export function valueAt(ledger: Ledger, p: Player, t: number): Values {
  const unitIds = new Set(ledger.units.map((it) => it.baseId ?? it.key));
  const techs = [...new Map(ledger.techs.map((x) => [x.id, x])).values()];
  // equipment is bought once per building; other techs once
  const researched = techs.reduce((n, x) => n + (x.times ? countAt(x.times, t) : x.t !== null && x.t <= t ? 1 : 0) * x.cost, 0);
  return {
    buildings: withSpent({ ...standing(ledger.buildings, t), queued: 0 }),
    units: withSpent({ ...standing(ledger.units, t), queued: inQueue(p, unitIds, t) }),
    upgrades: withSpent({ asset: researched, lost: 0, queued: inQueue(p, new Set(techs.map((x) => x.id)), t) }),
  };
}

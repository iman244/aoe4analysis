// aoe4world reference data (buildings, units, technologies, upgrades), read once from data/aoe4world
// and indexed for the game builder. Server only: it reads files from disk.
import fs from "node:fs";
import path from "node:path";
import type { AttackKey, Selector, UnitVariant } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any -- raw aoe4world JSON, read field by field below */
type Raw = Record<string, any>;

const dataDir = path.join(process.cwd(), "data", "aoe4world");
const load = (name: string): Raw[] => JSON.parse(fs.readFileSync(path.join(dataDir, `${name}.json`), "utf-8")).data;

const buildings = load("buildings");
const units = load("units");
const technologies = load("technologies");
const upgrades = load("upgrades");

export type IdxEntry = { name: string; icon: string; baseId: string; age?: number; attribName: string };

/** pbgid -> name/icon/baseId; the first entry wins, buildings before units before techs */
export const idx = new Map<number, IdxEntry>();
for (const list of [buildings, units, technologies, upgrades]) {
  for (const e of list) {
    if (!idx.has(e.pbgid)) {
      idx.set(e.pbgid, { name: e.name, icon: e.icon, baseId: e.baseId, age: e.age, attribName: e.attribName ?? "" });
    }
  }
}
// the second palisade id has no entry of its own
idx.set(199624, { name: "Palisade", icon: "https://data.aoe4world.com/images/buildings/palisade-1.png",
  baseId: "palisade", attribName: "" });

export const TIER_ATTRIB = /^(?:upgrade_)?unit_(.+?)_(\d)(?:_|$)/; // unit_archer_3_abb / upgrade_unit_archer_3

// bonus damage targets folded into a few readable categories (target class combo -> category)
const BONUS_CATEGORY: Record<string, string> = {
  "cavalry": "cavalry", "heavy": "heavy", "ranged": "ranged", "siege": "siege",
  "light,melee,infantry": "light-infantry", "light,gunpowder,infantry": "light-infantry",
  "infantry,light": "light-infantry", "infantry": "infantry", "melee,infantry": "infantry",
  "war,elephant": "elephant", "worker,elephant": "elephant",
  "building": "building", "wall": "building", "naval,unit": "ship", "ship": "ship",
  "archer,ship": "ship",
};

const weaponDamage = (e: Raw, kind: string): number =>
  ((e.weapons ?? []) as Raw[]).find((w) => w.type === kind)?.damage ?? 0;

/** {category: bonus} for the unit's first weapon of this kind; overlapping targets keep the biggest. */
function weaponBonus(e: Raw, kind: string): Record<string, number> {
  const weapon = ((e.weapons ?? []) as Raw[]).find((w) => w.type === kind);
  const out: Record<string, number> = {};
  for (const mod of (weapon?.modifiers ?? []) as Raw[]) {
    for (const group of (mod.target?.class ?? []) as string[][]) {
      const cat = BONUS_CATEGORY[group.join(",")];
      if (cat && mod.effect === "change") out[cat] = Math.max(out[cat] ?? 0, mod.value);
    }
  }
  return out;
}

const key3 = (base: string, age: number, civ: string) => `${base}|${age}|${civ}`;

/** ("knight", "ru") -> "knight" but ("knight", "ab") -> "lancer": the attrib key alone is shared across civs */
export const unitBaseByKey = new Map<string, string>();
/** "baseId|tier|civ" -> icon, name and combat stats of that tier, in data order */
export const unitVariant = new Map<string, UnitVariant>();

for (const e of units) {
  const m = TIER_ATTRIB.exec(e.attribName ?? "");
  const armor: Record<string, number> = {};
  for (const a of (e.armor ?? []) as Raw[]) armor[a.type] = a.value;
  const variant: UnitVariant = {
    icon: e.icon, name: e.name, classes: e.classes, hp: "hitpoints" in e ? e.hitpoints : 0,
    producedBy: e.producedBy ?? [],
    meleeArmor: armor.melee ?? 0, rangedArmor: armor.ranged ?? 0,
    meleeAttack: weaponDamage(e, "melee"), rangedAttack: weaponDamage(e, "ranged"),
    bonus: { meleeAttack: weaponBonus(e, "melee"), rangedAttack: weaponBonus(e, "ranged") } as Record<AttackKey, Record<string, number>>,
  };
  for (const civ of e.civs as string[]) {
    if (m && !unitBaseByKey.has(`${m[1]}|${civ}`)) unitBaseByKey.set(`${m[1]}|${civ}`, e.baseId);
    const k = key3(e.baseId, e.age, civ);
    if (!unitVariant.has(k)) unitVariant.set(k, variant);
  }
}

export const getVariant = (base: string, age: number, civ: string) => unitVariant.get(key3(base, age, civ));

/** a building has one entry per civ variant: keep the first, and collect who can build it at all */
export const buildingsByBase = new Map<string, Raw>();
export const civsByBase = new Map<string, Set<string>>();
for (const e of buildings) {
  if (!buildingsByBase.has(e.baseId)) buildingsByBase.set(e.baseId, e);
  const civs = civsByBase.get(e.baseId) ?? new Set<string>();
  for (const c of e.civs) civs.add(c);
  civsByBase.set(e.baseId, civs);
}

export type CatalogEntry = {
  pbgid: number; baseId: string; name: string; icon: string; age: number; type: "technology" | "upgrade";
  civs: string[]; producedBy?: string[]; classes?: string[]; displayClasses?: string[]; description?: string;
  unique?: boolean; effects?: { type?: string; property?: string; select?: Selector; effect?: string; value?: number }[];
};

/** every researchable tech/upgrade with its producers */
export const catalog: CatalogEntry[] = [...technologies, ...upgrades] as CatalogEntry[];
export const byPbgid = new Map<number, CatalogEntry>();
for (const e of catalog) byPbgid.set(e.pbgid, e);

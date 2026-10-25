// Game-time rules shared by the server (placing techs on the board) and the client (drawing a moment):
// who a tech applies to, what is alive at time t, army totals, and who leads where.
import type { GameData, Item, Job, Player, Selector, StatKey, Tech } from "./types";

export const ROMAN = ["", "I", "II", "III", "IV"];
export const AGE = ["", "Dark", "Feudal", "Castle", "Imperial"];
export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
/** lead over the opponent as a percentage: 2000 vs 1000 -> +100%; nothing when the opponent has none */
export const ratio = (a: number, b: number) => (b === 0 ? "" : `+${Math.round((a / b - 1) * 100)}%`);
export const compact = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(1)}k` : Math.round(n).toLocaleString("en"));

export const STATS: [StatKey, string][] = [["hp", "HP"], ["meleeArmor", "Melee armor"], ["rangedArmor", "Ranged armor"],
  ["meleeAttack", "Melee damage"], ["rangedAttack", "Ranged damage"]];
export const BONUS_LABEL: Record<string, string> = { cavalry: "cavalry", heavy: "heavy units", ranged: "ranged units",
  siege: "siege", "light-infantry": "light infantry", infantry: "infantry", elephant: "elephants", building: "buildings",
  ship: "ships" };

type UnitRef = { classes: string[]; baseId?: string };
/** a tech's selector picks units by class combos (any group fully matching) or by unit id;
 *  ship techs name pairs like ["archer", "ship"] that the unit data stores joined, as "archer_ship" */
export const selects = (sel: Selector, unit: UnitRef) =>
  (sel.class ?? []).some((group) => group.every((c) => unit.classes.includes(c)) || unit.classes.includes(group.join("_")))
  || (!!unit.baseId && (sel.id ?? []).includes(unit.baseId));

export const countAt = (times: number[], t: number) => times.filter((x) => x <= t).length;

/** One unit or tech at time t: the ones in production now (one per building) and how many wait behind other items. */
export type InQueue = { making: Job[]; waiting: number };
export function queuesAt(p: Player, t: number) {
  const out = new Map<string, InQueue>();
  for (const j of p.jobs) {
    if (j.q > t || t >= j.e) continue;
    const q = out.get(j.id) ?? { making: [], waiting: 0 };
    if (j.s <= t) q.making.push(j);
    else q.waiting++;
    out.set(j.id, q);
  }
  return out;
}
export const aliveAt = (it: { t: number[]; dead: number[] }, t: number) => countAt(it.t, t) - countAt(it.dead, t);

/** relics held in buildings at time t: +1 when placed in, -1 when taken out */
export const relicsAt = (p: Player, t: number) => Math.max(0, countAt(p.relics.in, t) - countAt(p.relics.out, t));
/** each resource at time t, from the last 20 s sample before it: banked and gathered so far */
export function resourcesAt(p: Player, t: number) {
  const { t: times, kinds } = p.resources;
  let i = 0;
  while (i + 1 < times.length && times[i + 1] <= t) i++;
  return { at: times[i] ?? 0, kinds: kinds.map((k) => ({ key: k.key, stock: k.stock[i] ?? 0, gathered: k.gathered[i] ?? 0 })) };
}
/** age reached by time t: 1 = Dark, 2 = Feudal, 3 = Castle, 4 = Imperial */
export const ageAt = (p: Player, t: number) => (p.ages.filter((a) => a.t <= t).pop() ?? { age: 1 }).age;

/** tech ids each player has by time t, to mark techs only one side has */
export const ownedAt = (game: GameData, t: number) => game.players.map((p) => new Set(
  p.techGroups.flatMap((g) => g.techs).filter((x) => x.t !== null && x.t <= t).map((x) => x.id)));

/** One upgrade slot: a tiered line collapses into one slot (latest step shown). */
export type UpSlot = { line: string | null; techs: Tech[] };
export function upSlots(techs: Tech[]): UpSlot[] {
  const slots: UpSlot[] = [];
  for (const x of techs) {
    const s = x.line && x.tier ? slots.find((s) => s.line === x.line) : undefined;
    if (s) s.techs.push(x);
    else slots.push({ line: x.tier ? x.line ?? null : null, techs: [x] });
  }
  slots.forEach((s) => s.techs.sort((a, b) => (a.tier ?? 0) - (b.tier ?? 0)));
  return slots;
}

// gather-rate lines first so food, wood and mining sit side by side on the top row
const GATHER_ORDER = ["food", "wood", "mining", "hunting", "woodcutting", "villager", "farm", "economic"];
export const GATHER_LABEL: Record<string, string> = { food: "food gathering", farm: "farming", hunting: "hunting",
  wood: "wood gathering", woodcutting: "woodcutting", mining: "mining", economic: "economy", villager: "villager" };

/** fixed villager slots: one per tiered line (food/wood/mining), one per standalone tech (Forestry, Wheelbarrow...) */
export function villagerSlots(techs: Tech[]): UpSlot[] {
  const slots: UpSlot[] = [];
  // known lines first, then any civ-specific line the data brings (e.g. a new displayClass)
  const extra = [...new Set(techs.map((x) => x.gather!).filter((l) => !GATHER_ORDER.includes(l)))];
  for (const line of [...GATHER_ORDER, ...extra]) {
    const inLine = techs.filter((x) => x.gather === line);
    const tiered = inLine.filter((x) => x.tier).sort((a, b) => a.tier! - b.tier!);
    if (tiered.length) slots.push({ line, techs: tiered });
    inLine.filter((x) => !x.tier).sort((a, b) => a.age - b.age || a.name.localeCompare(b.name))
      .forEach((x) => slots.push({ line, techs: [x] }));
  }
  return slots;
}

/** What one upgrade slot shows at time t: the latest step researched by then (green if the opponent
 *  lacks it), otherwise the line's first step faded (future = researched later, never = not at all). */
export function slotState(techs: Tech[], t: number, theirs: Set<string>) {
  const latest = techs.filter((x) => x.t !== null && x.t <= t).sort((a, b) => a.t! - b.t!).pop();
  const tech = latest ?? techs[0];
  const step = tech.tier ? ` ${tech.tier}/3` : "";
  if (latest) {
    const ahead = !theirs.has(latest.id);
    return { tech, step, ahead, fresh: latest.t! > t - 20, future: false, never: false,
      note: `researched at ${fmt(latest.t!)}${ahead ? "\nOpponent doesn't have this" : ""}` };
  }
  const later = techs.some((x) => x.t !== null);
  return { tech, step, ahead: false, fresh: false, future: later, never: !later,
    note: later ? "researched later" : "not researched" };
}

export type Totals = Record<StatKey, number> & { bonus: Record<"meleeAttack" | "rangedAttack", Record<string, number>> };
const classesOf = (it: Item) => (it.tiers ? it.tiers[0].classes : it.classes) ?? [];

/** Every living unit added together, with researched upgrades. Ships count toward the navy (warships only). */
export function armyTotals(p: Player, t: number, naval = false): Totals {
  const sum: Totals = { hp: 0, meleeArmor: 0, rangedArmor: 0, meleeAttack: 0, rangedAttack: 0,
    bonus: { meleeAttack: {}, rangedAttack: {} } };
  const fx = p.statEffects.filter((e) => e.t <= t).flatMap((e) => e.effects);
  for (const it of p.items) {
    if (it.group !== "army" || !it.tiers || classesOf(it).includes("naval_unit") !== naval) continue;
    if (naval && !classesOf(it).includes("military")) continue;
    const alive = aliveAt(it, t);
    if (alive <= 0) continue;
    const unit = it.tiers.filter((x) => x.from <= t).pop() ?? it.tiers[0];
    const s: Record<StatKey, number> = { hp: unit.hp, meleeArmor: unit.meleeArmor, rangedArmor: unit.rangedArmor,
      meleeAttack: unit.meleeAttack, rangedAttack: unit.rangedAttack };
    for (const e of fx) {
      const key = (e.property === "hitpoints" ? "hp" : e.property) as StatKey;
      // upgrades only improve stats a unit already has (no ranged damage for a knight)
      if (!selects(e.select, unit) || (key !== "hp" && key.endsWith("Attack") && !s[key])) continue;
      s[key] = e.effect === "multiply" ? s[key] * e.value : s[key] + e.value;
    }
    for (const [k] of STATS) sum[k] += s[k] * alive;
    // bonus damage stays as listed per target; upgrades only raise the base hit
    for (const kind of ["meleeAttack", "rangedAttack"] as const) {
      for (const [cat, v] of Object.entries(unit.bonus?.[kind] ?? {})) sum.bonus[kind][cat] = (sum.bonus[kind][cat] ?? 0) + v * alive;
    }
  }
  return sum;
}

export const TRADERS = ["trader", "trade-caravan", "reindeer-trader"];

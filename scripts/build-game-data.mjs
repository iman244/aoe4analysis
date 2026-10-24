// Builds the game reference data in lib/aoe4/ from aoe4world/data (https://github.com/aoe4world/data):
//   names.json        pbgid -> { kind, key, name }   game summaries only carry pbgids ("166417" -> "Spearman")
//   unit-stats.json   pbgid -> health, armour, main weapon, cost and classes of every unit variant
//   tech-effects.json pbgid -> the combat effects of every technology (blacksmith upgrades and the like)
// Re-run after a game patch: `node scripts/build-game-data.mjs`.
import { writeFile } from "node:fs/promises"

const BASE = "https://data.aoe4world.com"
const COMBAT_PROPERTIES = new Set([
  "hitpoints",
  "meleeAttack",
  "rangedAttack",
  "siegeAttack",
  "meleeArmor",
  "rangedArmor",
  "attackSpeed",
])

async function load(kind) {
  const res = await fetch(`${BASE}/${kind}/all-unified.json`)
  if (!res.ok) throw new Error(`${kind} responded ${res.status}`)
  return (await res.json()).data
}

const [units, buildings, technologies] = await Promise.all([load("units"), load("buildings"), load("technologies")])

const names = {}
const unitStats = {}
const techEffects = {}

for (const [kind, items] of [["unit", units], ["building", buildings], ["technology", technologies]]) {
  for (const item of items) {
    for (const v of item.variations) {
      // baseId groups the age variants of a unit ("spearman-2", "spearman-3" -> "spearman")
      names[v.pbgid] = { kind, key: item.baseId ?? item.id, name: item.name }
    }
  }
}

for (const item of units) {
  for (const v of item.variations) {
    // The torch every unit carries is not its real attack, so the main weapon is the first non-fire one.
    const weapon = (v.weapons ?? []).find((w) => w.type !== "fire")
    const armor = (type) => v.armor?.find((a) => a.type === type)?.value ?? 0
    unitStats[v.pbgid] = {
      key: item.baseId ?? item.id,
      age: v.age,
      classes: v.classes ?? [],
      military: (v.classes ?? []).includes("military"),
      hitpoints: v.hitpoints ?? 0,
      meleeArmor: armor("melee"),
      rangedArmor: armor("ranged"),
      weapon: weapon ? { type: weapon.type, damage: weapon.damage, speed: weapon.speed } : null,
      cost: v.costs?.total ?? 0,
    }
  }
}

for (const item of technologies) {
  for (const v of item.variations) {
    const effects = (v.effects ?? []).filter((e) => COMBAT_PROPERTIES.has(e.property) && e.select)
    if (effects.length) {
      techEffects[v.pbgid] = effects.map(({ property, effect, value, select }) => ({ property, effect, value, select }))
    }
  }
}

for (const [file, data] of [["names", names], ["unit-stats", unitStats], ["tech-effects", techEffects]]) {
  await writeFile(new URL(`../lib/aoe4/${file}.json`, import.meta.url), JSON.stringify(data))
  console.log(`${file}.json: ${Object.keys(data).length} entries`)
}

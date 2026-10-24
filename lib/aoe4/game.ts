// Turns an aoe4world game summary into searchable stats and chart-ready time series.

export type BuildOrderEntry = {
  pbgid: number
  icon: string
  type: string
  finished: number[]
  constructed: number[]
  destroyed: number[]
}

export type PlayerSummary = {
  profileId: number
  name: string
  civilization: string
  team: number
  result: "win" | "loss"
  _stats: { gt: number }
  resources: { timestamps: number[] } & Record<string, number[]>
  buildOrder: BuildOrderEntry[]
}

export type GameSummary = {
  gameId: number
  mapName: string
  leaderboard: string
  winReason: string
  startedAt: number
  players: PlayerSummary[]
}

export type NameEntry = { kind: "unit" | "building" | "technology"; key: string; name: string }

export type UnitStats = {
  key: string
  age: number
  classes: string[]
  military: boolean
  hitpoints: number
  meleeArmor: number
  rangedArmor: number
  weapon: { type: string; damage: number; speed: number } | null
  cost: number
  /** Borrowed from the same unit and age of another civilization (new civs can be missing). */
  approx?: boolean
}

export type TechEffect = {
  property: string
  effect: "change" | "multiply"
  value: number
  select: { class?: string[][]; id?: string[] }
}

/** The reference data one game needs, small enough to send to the browser. */
export type GameData = {
  names: Record<number, NameEntry>
  units: Record<number, UnitStats>
  effects: Record<number, TechEffect[]>
}

export type StatGroup = "Army" | "Resources" | "Score" | "Units" | "Buildings"

export type Stat = {
  id: string
  group: StatGroup
  label: string
  description: string
  /** Counts change in steps; sampled values (every 20 s) are joined with straight lines. */
  curve: "step" | "linear"
  calculated?: boolean
}

export type SeriesRow = { t: number } & Record<string, number>

const RESOURCES = ["food", "wood", "gold", "stone"] as const
const SCORES = ["total", "military", "economy", "technology", "society"] as const
const COUNTED_TYPES: Record<string, StatGroup> = { Unit: "Units", Building: "Buildings" }

const ARMY_STATS: Stat[] = [
  { id: "army:count", group: "Army", label: "Army size", description: "Military units alive", curve: "step" },
  { id: "army:hitpoints", group: "Army", label: "Army health", description: "Total health of all military units alive", curve: "step" },
  { id: "army:dps", group: "Army", label: "Army damage per second", description: "Main-weapon damage per second of the whole army, before enemy armor and bonus damage", curve: "step" },
  { id: "army:meleeArmor", group: "Army", label: "Army melee armor", description: "Average melee armor of military units alive", curve: "step" },
  { id: "army:rangedArmor", group: "Army", label: "Army ranged armor", description: "Average ranged armor of military units alive", curve: "step" },
  { id: "army:value", group: "Army", label: "Army value", description: "Resources the military units alive cost", curve: "step" },
].map((s) => ({ ...(s as Stat), calculated: true }))

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const playerKey = (p: PlayerSummary) => `p${p.profileId}`

/** Players ordered by team, so colors and legends always read team by team. */
export function orderedPlayers(game: GameSummary) {
  return [...game.players].sort((a, b) => a.team - b.team)
}

/** Game time in seconds, as the game itself counts it. */
export function gameLength(game: GameSummary) {
  return Math.max(...game.players.map((p) => p._stats.gt))
}

// New civilizations can be missing from aoe4world/data; fall back to the icon's file name,
// e.g. "icons/races/jin/units/horse_archer_2" -> key "horse-archer", age 2, label "Horse Archer".
function iconName(icon: string) {
  const file = icon.split("/").pop()!
  const age = Number(file.match(/_(\d)$/)?.[1] ?? 1)
  const slug = file.replace(/_\d+$/, "")
  return { key: slug.replaceAll("_", "-"), age, label: slug.split("_").map(capitalize).join(" ") }
}

function nameFor(entry: BuildOrderEntry, data: GameData) {
  const known = data.names[entry.pbgid]
  return known ? { key: known.key, label: known.name } : iconName(entry.icon)
}

/** Only the reference data this game needs, so the browser doesn't download the whole set. */
export function gameDataFor(game: GameSummary, all: GameData): GameData {
  const data: GameData = { names: {}, units: {}, effects: {} }
  const byKeyAndAge = new Map<string, UnitStats>()
  for (const u of Object.values(all.units)) {
    if (!byKeyAndAge.has(`${u.key}:${u.age}`)) byKeyAndAge.set(`${u.key}:${u.age}`, u)
  }
  for (const p of game.players) {
    for (const entry of p.buildOrder) {
      const id = entry.pbgid
      if (all.names[id]) data.names[id] = all.names[id]
      if (all.effects[id]) data.effects[id] = all.effects[id]
      if (entry.type !== "Unit") continue
      if (all.units[id]) {
        data.units[id] = all.units[id]
      } else {
        const { key, age } = iconName(entry.icon)
        const standIn = byKeyAndAge.get(`${key}:${age}`) ?? byKeyAndAge.get(`${key}:1`)
        if (standIn) data.units[id] = { ...standIn, approx: true }
      }
    }
  }
  return data
}

export function statCatalog(game: GameSummary, data: GameData): Stat[] {
  const stats: Stat[] = [...ARMY_STATS]
  for (const r of RESOURCES) {
    const R = capitalize(r)
    stats.push(
      { id: `res:${r}`, group: "Resources", label: `${R} in stock`, description: `${R} collected but not yet spent`, curve: "linear" },
      { id: `res:${r}PerMin`, group: "Resources", label: `${R} gather rate`, description: `${R} gathered per minute`, curve: "linear" },
      // aoe4world calls this "foodGathered", but its final value equals the total *spent*.
      { id: `res:${r}Gathered`, group: "Resources", label: `${R} spent so far`, description: `Total ${r} spent up to this moment`, curve: "linear" },
    )
  }
  for (const s of SCORES) {
    stats.push({ id: `res:${s}`, group: "Score", label: `${capitalize(s)} score`, description: `The in-game ${s} score`, curve: "linear" })
  }

  const counted = new Map<string, Stat>()
  for (const p of game.players) {
    for (const entry of p.buildOrder) {
      const group = COUNTED_TYPES[entry.type]
      if (!group) continue
      const { key, label } = nameFor(entry, data)
      const id = `${group === "Units" ? "unit" : "building"}:${key}`
      if (!counted.has(id)) {
        const what = group === "Units" ? "alive" : "standing"
        counted.set(id, { id, group, label, description: `How many ${label} each player has ${what}`, curve: "step" })
      }
    }
  }
  const byLabel = (a: Stat, b: Stat) => a.label.localeCompare(b.label)
  return [...stats, ...[...counted.values()].sort(byLabel)]
}

const STEP_SECONDS = 10

type Change = { t: number; d: number }

function changesOf(entry: BuildOrderEntry): Change[] {
  return [
    ...[...entry.finished, ...entry.constructed].map((t) => ({ t, d: 1 })),
    ...entry.destroyed.map((t) => ({ t, d: -1 })),
  ]
}

const countAt = (changes: Change[], t: number) => Math.max(0, changes.reduce((n, c) => (c.t <= t ? n + c.d : n), 0))

function ticks(game: GameSummary) {
  const end = gameLength(game)
  return Array.from({ length: Math.floor(end / STEP_SECONDS) + 1 }, (_, i) => i * STEP_SECONDS)
}

// An effect applies when the unit has every class in one of its class groups, or is one of its units.
function selects(effect: TechEffect, unit: UnitStats) {
  const { class: groups, id } = effect.select
  return Boolean(groups?.some((g) => g.every((c) => unit.classes.includes(c))) || id?.includes(unit.key))
}

const ATTACK_FOR_WEAPON: Record<string, string> = { melee: "meleeAttack", ranged: "rangedAttack", siege: "siegeAttack" }

/** A unit's combat stats after the upgrades its player has finished. */
function upgraded(unit: UnitStats, effects: TechEffect[]) {
  let { hitpoints, meleeArmor, rangedArmor } = unit
  let damage = unit.weapon?.damage ?? 0
  let speed = unit.weapon?.speed ?? 0
  const apply = (v: number, e: TechEffect) => (e.effect === "multiply" ? v * e.value : v + e.value)
  for (const e of effects) {
    if (!selects(e, unit)) continue
    if (e.property === "hitpoints") hitpoints = apply(hitpoints, e)
    else if (e.property === "meleeArmor") meleeArmor = apply(meleeArmor, e)
    else if (e.property === "rangedArmor") rangedArmor = apply(rangedArmor, e)
    else if (e.property === "attackSpeed") speed = apply(speed, e)
    else if (unit.weapon && e.property === ATTACK_FOR_WEAPON[unit.weapon.type]) damage = apply(damage, e)
  }
  return { hitpoints, meleeArmor, rangedArmor, dps: speed > 0 ? damage / speed : 0 }
}

function armyAt(player: PlayerSummary, data: GameData, t: number) {
  const effects = player.buildOrder
    .filter((e) => e.type === "Upgrade" && e.finished.some((f) => f <= t))
    .flatMap((e) => data.effects[e.pbgid] ?? [])

  const army = { count: 0, hitpoints: 0, dps: 0, meleeArmor: 0, rangedArmor: 0, value: 0 }
  for (const entry of player.buildOrder) {
    const unit = data.units[entry.pbgid]
    if (entry.type !== "Unit" || !unit?.military) continue
    const n = countAt(changesOf(entry), t)
    if (!n) continue
    const s = upgraded(unit, effects)
    army.count += n
    army.hitpoints += n * s.hitpoints
    army.dps += n * s.dps
    army.meleeArmor += n * s.meleeArmor
    army.rangedArmor += n * s.rangedArmor
    army.value += n * unit.cost
  }
  // Armor is an average per unit; everything else is a total for the whole army.
  if (army.count) {
    army.meleeArmor /= army.count
    army.rangedArmor /= army.count
  }
  return army
}

const round = (v: number) => Math.round(v * 10) / 10

/**
 * One row per moment of the game; each player's value sits under their playerKey.
 * Players with no data for a unit or building are left out of that chart.
 */
export function seriesFor(stat: Stat, game: GameSummary, data: GameData): { rows: SeriesRow[]; players: PlayerSummary[] } {
  const players = orderedPlayers(game)
  const [kind, key] = stat.id.split(":")

  if (kind === "res") {
    const timestamps = players[0].resources.timestamps
    const rows = timestamps.map((t, i) => {
      const row: SeriesRow = { t }
      for (const p of players) row[playerKey(p)] = p.resources[key]?.[i] ?? 0
      return row
    })
    return { rows, players }
  }

  if (kind === "army") {
    const field = key as keyof ReturnType<typeof armyAt>
    const rows = ticks(game).map((t) => {
      const row: SeriesRow = { t }
      for (const p of players) row[playerKey(p)] = round(armyAt(p, data, t)[field])
      return row
    })
    return { rows, players }
  }

  // Count entities over time: +1 when made or built, -1 when destroyed.
  const changes = new Map<string, Change[]>()
  for (const p of players) {
    const list = p.buildOrder
      .filter((e) => COUNTED_TYPES[e.type] && nameFor(e, data).key === key)
      .flatMap(changesOf)
    if (list.length) changes.set(playerKey(p), list)
  }
  const present = players.filter((p) => changes.has(playerKey(p)))
  const rows = ticks(game).map((t) => {
    const row: SeriesRow = { t }
    for (const p of present) row[playerKey(p)] = countAt(changes.get(playerKey(p))!, t)
    return row
  })
  return { rows, players: present }
}

/** Unit types in this game whose stats were borrowed from another civilization. */
export function approximatedUnits(game: GameSummary, data: GameData) {
  const labels = new Set<string>()
  for (const p of game.players) {
    for (const e of p.buildOrder) {
      if (e.type === "Unit" && data.units[e.pbgid]?.approx) labels.add(nameFor(e, data).label)
    }
  }
  return [...labels].sort()
}

export function formatGameTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

const CIVS: Record<string, string> = {
  holy_roman_empire: "Holy Roman Empire",
  knights_templar: "Knights Templar",
  jin_dynasty: "Jin Dynasty",
}

export function civName(civ: string) {
  return CIVS[civ] ?? civ.split("_").map(capitalize).join(" ")
}

export function modeName(leaderboard: string) {
  const [kind, size] = leaderboard.split("_")
  return `${kind === "rm" ? "Ranked" : kind === "qm" ? "Quick match" : kind.toUpperCase()} ${size}`
}

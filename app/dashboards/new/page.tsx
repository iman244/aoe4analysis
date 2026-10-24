import type { Metadata } from "next"

import { CreateDashboard } from "@/components/create-dashboard"
import sampleGame from "@/data/sample-game.json"
import names from "@/lib/aoe4/names.json"
import effects from "@/lib/aoe4/tech-effects.json"
import units from "@/lib/aoe4/unit-stats.json"
import { gameDataFor, type GameData, type GameSummary } from "@/lib/aoe4/game"

export const metadata: Metadata = { title: "New dashboard · aoe4analysis" }

// Prototype: every new dashboard opens on one saved sample game (Himeyama, ranked 3v3).
// Loading the person's own last game comes once aoe4world data access is settled.
export default function NewDashboardPage() {
  const game = sampleGame as unknown as GameSummary
  const all = { names, units, effects } as unknown as GameData
  return <CreateDashboard game={game} data={gameDataFor(game, all)} />
}

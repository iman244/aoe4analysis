import type { ChartConfig } from "@/components/ui/chart"
import { orderedPlayers, playerKey, type GameSummary } from "./game"

// Validated categorical palette (dataviz reference instance), in fixed slot order.
// Slot order is the colour-blind safety mechanism: never reorder or cycle it.
// An 8-player game uses every slot; a player keeps one colour on every chart.
const LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"]
const DARK = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"]

export function playerChartConfig(game: GameSummary): ChartConfig {
  return Object.fromEntries(
    orderedPlayers(game).map((p, i) => [
      playerKey(p),
      { label: p.name, theme: { light: LIGHT[i], dark: DARK[i] } },
    ])
  )
}

"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatGameTime, gameLength, playerKey, seriesFor, type GameData, type GameSummary, type Stat } from "@/lib/aoe4/game"

const TICK_EVERY = 120 // one x-axis label per two minutes of game time

export function StatChart({
  stat,
  game,
  data,
  config,
  approximated,
  onRemove,
}: {
  stat: Stat
  game: GameSummary
  data: GameData
  config: ChartConfig
  /** Unit types whose stats were borrowed from another civilization; shown on army charts. */
  approximated: string[]
  onRemove: () => void
}) {
  const { rows, players } = seriesFor(stat, game, data)
  const end = gameLength(game)
  const ticks = Array.from({ length: Math.floor(end / TICK_EVERY) + 1 }, (_, i) => i * TICK_EVERY)

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{stat.label}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{stat.group}</Badge>
          {stat.calculated && <Badge variant="outline">Calculated</Badge>}
          {stat.description}
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" aria-label={`Remove ${stat.label} chart`} onClick={onRemove}>
            <XIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-56 w-full">
          {/* syncId: hovering one chart moves the time cursor on every chart. Charts sample time
              differently (every 20 s vs 10 s), so they sync by game time, not by row position. */}
          <LineChart
            accessibilityLayer
            data={rows}
            syncId="game"
            syncMethod="value"
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, end]}
              ticks={ticks}
              tickFormatter={formatGameTime}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis width={40} tickLine={false} axisLine={false} allowDecimals={stat.curve !== "step"} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="min-w-48"
                  indicator="line"
                  labelFormatter={(_, payload) => formatGameTime(payload[0]?.payload.t ?? 0)}
                />
              }
            />
            {players.map((p) => (
              <Line
                key={playerKey(p)}
                dataKey={playerKey(p)}
                type={stat.curve === "step" ? "stepAfter" : "linear"}
                stroke={`var(--color-${playerKey(p)})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
        {stat.group === "Army" && approximated.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Estimated with another civilization&apos;s stats: {approximated.join(", ")}. Their own stats aren&apos;t published yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

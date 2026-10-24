"use client"

import { useMemo, useState } from "react"
import { ChartLineIcon } from "lucide-react"

import { StatChart } from "@/components/stat-chart"
import { Card, CardContent } from "@/components/ui/card"
import { ChartStyle, type ChartConfig } from "@/components/ui/chart"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { playerChartConfig } from "@/lib/aoe4/colors"
import {
  civName,
  formatGameTime,
  gameLength,
  modeName,
  orderedPlayers,
  playerKey,
  statCatalog,
  approximatedUnits,
  type GameData,
  type GameSummary,
  type StatGroup,
} from "@/lib/aoe4/game"

const GROUPS: StatGroup[] = ["Army", "Resources", "Score", "Units", "Buildings"]

export function CreateDashboard({ game, data }: { game: GameSummary; data: GameData }) {
  const [title, setTitle] = useState("Untitled dashboard")
  const [chartIds, setChartIds] = useState<string[]>([])

  const catalog = useMemo(() => statCatalog(game, data), [game, data])
  const approximated = useMemo(() => approximatedUnits(game, data), [game, data])
  const config = useMemo(() => playerChartConfig(game), [game])
  const byId = useMemo(() => new Map(catalog.map((s) => [s.id, s])), [catalog])

  // Clicking a stat in the list turns its chart on or off. A new chart goes first,
  // so it appears right where the person is looking.
  const toggle = (id: string) => setChartIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids]))
  const remove = (id: string) => setChartIds((ids) => ids.filter((x) => x !== id))

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">New dashboard</p>
        <Input
          aria-label="Dashboard name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10 max-w-md text-lg font-semibold md:text-lg"
        />
        <GameHeader game={game} config={config} />
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[18rem_1fr]">
        {/* Plain "contains" matching: cmdk's default fuzzy match turns "gold" into Capital Town Center. */}
        <Command
          className="rounded-xl! border lg:sticky lg:top-4"
          filter={(_, search, keywords = []) => (keywords.join(" ").toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
        >
          <CommandInput placeholder="Search units, buildings, resources…" />
          <CommandList className="max-h-[60vh]">
            <CommandEmpty>Nothing with that name in this game.</CommandEmpty>
            {GROUPS.map((group) => (
              <CommandGroup key={group} heading={group}>
                {catalog
                  .filter((s) => s.group === group)
                  .map((s) => (
                    <CommandItem
                      key={s.id}
                      value={s.id}
                      keywords={[s.label, s.group, s.calculated ? "calculated" : ""]}
                      data-checked={chartIds.includes(s.id)}
                      onSelect={() => toggle(s.id)}
                    >
                      {s.label}
                      {s.calculated && <span className="text-xs text-muted-foreground">calculated</span>}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>

        {chartIds.length === 0 ? (
          <Empty className="min-h-80 border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ChartLineIcon />
              </EmptyMedia>
              <EmptyTitle>Add your first chart</EmptyTitle>
              <EmptyDescription>
                Search for a unit, building, resource or army stat (health, damage, armor) and click it. Its chart appears here, with game time along the
                bottom and one line per player.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <section aria-label="Charts" className="grid gap-4 xl:grid-cols-2">
            {chartIds.map((id) => (
              <StatChart
                key={id}
                stat={byId.get(id)!}
                game={game}
                data={data}
                config={config}
                approximated={approximated}
                onRemove={() => remove(id)}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

function GameHeader({ game, config }: { game: GameSummary; config: ChartConfig }) {
  const players = orderedPlayers(game)
  const teams = [...new Set(players.map((p) => p.team))]

  return (
    <Card size="sm" data-chart="game-legend">
      {/* Defines the same --color-<player> variables the charts use, for the legend dots. */}
      <ChartStyle id="game-legend" config={config} />
      <CardContent className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <div>
          <p className="font-medium">{game.mapName}</p>
          <p className="text-sm text-muted-foreground">
            {modeName(game.leaderboard)} · {formatGameTime(gameLength(game))} · won by {game.winReason.toLowerCase()}
          </p>
        </div>
        {/* The one legend for every chart: each player keeps the same colour everywhere. */}
        {teams.map((team) => {
          const members = players.filter((p) => p.team === team)
          return (
            <div key={team} className="text-sm">
              <p className="mb-1 text-xs text-muted-foreground">
                Team {team + 1} · {members[0].result === "win" ? "Won" : "Lost"}
              </p>
              <ul className="flex flex-col gap-0.5">
                {members.map((p) => (
                  <li key={p.profileId} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: `var(--color-${playerKey(p)})` }}
                    />
                    {p.name}
                    <span className="text-muted-foreground">· {civName(p.civilization)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

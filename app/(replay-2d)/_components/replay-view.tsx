"use client";

import { useEffect, useState } from "react";
import { loadReplay, PILOT_REPLAY } from "../_lib/load-replay";
import { parseMapEvents, type MapEvent } from "../_lib/replay-commands";
import { parseReplayHeader, type ReplayHeader } from "../_lib/replay-header";
import ReplayPlayback, { formatTime } from "./replay-playback";

// Blue and red, like the game's default player 1 and 2 colours.
const PLAYER_COLORS = [0x3b82f6, 0xef4444, 0x22c55e, 0xeab308, 0xa855f7, 0x14b8a6, 0xf97316, 0xec4899];

type Replay = { header: ReplayHeader; events: MapEvent[] };
type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; replay: Replay };

export default function ReplayView() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    loadReplay(PILOT_REPLAY.url)
      .then((bytes) => {
        const replay = { header: parseReplayHeader(bytes), events: parseMapEvents(bytes) };
        if (!cancelled) setState({ status: "ready", replay });
      })
      .catch((e: Error) => !cancelled && setState({ status: "error", message: e.message }));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") return <p className="p-4 text-sm text-zinc-500">Reading replay…</p>;
  if (state.status === "error") return <p className="p-4 text-sm text-red-600 dark:text-red-400">{state.message}</p>;

  const { header, events } = state.replay;
  const players = header.players.map((p, i) => ({ ...p, color: PLAYER_COLORS[i % PLAYER_COLORS.length] }));
  return (
    <>
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h1 className="text-base font-semibold capitalize text-zinc-900 dark:text-zinc-50">{header.map.replaceAll("_", " ")}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {header.mapWidth} × {header.mapHeight} · {header.biome} · seed {header.mapSeed.toString(16)} ·{" "}
          {formatTime(header.ticks)} · {header.date} · game {PILOT_REPLAY.gameId}
        </p>
        <ul className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300">
          {players.map((p) => (
            <li key={p.commandId} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: `#${p.color.toString(16).padStart(6, "0")}` }} />
              {p.name} ({p.civ})
            </li>
          ))}
        </ul>
        <p className="ml-auto text-xs text-zinc-500">
          ■ building · • move · ○ attack-move — space to play · drag to move · scroll to zoom ·
          double-click to fit
        </p>
      </header>
      <ReplayPlayback size={header.mapWidth} totalTicks={header.ticks} events={events} players={players} />
    </>
  );
}

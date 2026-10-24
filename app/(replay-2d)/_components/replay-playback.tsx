"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { MapEvent } from "../_lib/replay-commands";
import { TICKS_PER_SECOND } from "../_lib/replay-header";
import type { MapPlayer } from "./replay-map";
import ReplayMapLoader from "./replay-map-loader";

const SPEEDS = ["1", "4", "16", "64"];

type Props = { size: number; totalTicks: number; events: MapEvent[]; players: MapPlayer[] };

export default function ReplayPlayback({ size, totalTicks, events, players }: Props) {
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("16");
  // Playback stops by itself at the end of the game.
  const running = playing && tick < totalTicks;

  // Advance game time with the real clock while playing.
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const ticks = ((now - last) / 1000) * TICKS_PER_SECOND * Number(speed);
      last = now;
      setTick((t) => Math.min(t + ticks, totalTicks));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [running, speed, totalTicks]);

  const togglePlay = useCallback(() => {
    if (running) return setPlaying(false);
    if (tick >= totalTicks) setTick(0);
    setPlaying(true);
  }, [running, tick, totalTicks]);

  // Space bar plays and pauses, unless a control already has focus (it handles Space itself).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || (e.target instanceof HTMLElement && e.target.closest("button, input"))) return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  return (
    <>
      <main className="relative min-h-0 flex-1">
        <ReplayMapLoader size={size} events={events} players={players} tick={tick} />
        <p className="pointer-events-none absolute right-3 bottom-2 text-[10px] text-zinc-500">
          Building data: AoE4 World · Age of Empires IV © Microsoft Corporation, not endorsed by or affiliated with
          Microsoft
        </p>
      </main>
      <footer className="flex items-center gap-3 border-t border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <Button variant="outline" size="icon" onClick={togglePlay} aria-label={running ? "Pause" : "Play"}>
          {running ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <span className="w-28 shrink-0 font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-300">
          {formatTime(tick)} / {formatTime(totalTicks)}
        </span>
        <Slider
          className="flex-1"
          min={0}
          max={totalTicks}
          value={[tick]}
          onValueChange={(value) => setTick(Array.isArray(value) ? value[0] : value)}
          aria-label="Game time"
        />
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          value={[speed]}
          onValueChange={(value) => value[0] && setSpeed(value[0])}
          aria-label="Playback speed"
        >
          {SPEEDS.map((s) => (
            <ToggleGroupItem key={s} value={s}>
              {s}×
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </footer>
    </>
  );
}

export function formatTime(ticks: number) {
  const seconds = Math.floor(ticks / TICKS_PER_SECOND);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

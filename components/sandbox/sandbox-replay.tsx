"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { PlayerLayout } from "@/lib/sandbox/placement";
import { AGE, armyTotals, fmt, ownedAt } from "@/lib/sandbox/rules";
import type { GameData, StatIcons } from "@/lib/sandbox/types";
import { AdvantageStrip } from "./advantage-strip";
import { MomentProvider, cx, type Moment } from "./moment";
import { PlayerBoard } from "./player-board";
import { equippedNow } from "./tiles";

// speed = game seconds per real second
const SPEEDS = [1, 5, 10, 30, 60, 120];

/** The whole 1v1 board with a clock: drag the timeline or press play to watch the game build up. */
export function SandboxReplay({ game, layouts, icons }: { game: GameData; layouts: PlayerLayout[]; icons: StatIcons }) {
  const [t, setT] = useState(game.duration);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(30);
  const gameT = useRef(game.duration); // precise game time while playing; t is its whole seconds

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      gameT.current = Math.min(game.duration, gameT.current + ((now - last) / 1000) * speed);
      last = now;
      setT(Math.floor(gameT.current));
      if (gameT.current >= game.duration) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, game.duration]);

  const togglePlay = () => {
    if (!playing) gameT.current = t >= game.duration ? 0 : t;
    setPlaying(!playing);
  };
  const seek = (value: number) => {
    gameT.current = value;
    setT(value);
  };

  const moment: Moment = useMemo(() => ({
    game, layouts, icons, t,
    owned: ownedAt(game, t),
    equipped: layouts.map((L) => {
      const out: Record<string, number> = {};
      for (const f of L.forts) for (const e of f.entries) equippedNow(e.entry, e.equip, t, out);
      return out;
    }),
    totals: game.players.map((p) => armyTotals(p, t)),
    navyTotals: game.players.map((p) => armyTotals(p, t, true)),
  }), [game, layouts, icons, t]);

  const [p1, p2] = game.players;
  return (
    <MomentProvider value={moment}>
      <div className={cx("root")}>
        <header className={cx("header")}>
          <h1 className={cx("title")}>
            {p1.name} ({p1.civ}) vs {p2.name} ({p2.civ}) · {game.map} · {fmt(game.duration)}
          </h1>
          <div className={cx("sub")}>
            Hover any icon for its name. Drag the clock or press play: icons light up when they&apos;re made, fade when
            they&apos;re all lost.
          </div>
        </header>
        <div className={cx("clock")}>
          <div className={cx("clock-row")}>
            <Button className={cx("play")} onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} title="Play / pause">
              {playing ? <PauseIcon /> : <PlayIcon />}
            </Button>
            <div className={cx("time")}>{fmt(t)}</div>
            <div className={cx("track")}>
              <Slider className={cx("slider")} aria-label="Game time" min={0} max={game.duration} step={1} value={[t]}
                onValueChange={(v) => seek(Array.isArray(v) ? v[0] : v)} />
              {game.players.map((p, pi) => p.ages.map((a) => (
                <div key={`${pi}-${a.age}`} className={cx("age-tick", `p${pi + 1}`)} style={{ left: `${(a.t / game.duration) * 100}%` }}
                  title={`${p.name} reached ${AGE[a.age]} Age with ${a.name}`}>
                  ▼ {AGE[a.age]} {fmt(a.t)}
                </div>
              )))}
            </div>
            <ToggleGroup className={cx("speed")} spacing={0} value={[String(speed)]} aria-label="Playback speed"
              onValueChange={(v) => v.length && setSpeed(Number(v[0]))}>
              {SPEEDS.map((s) => (
                <ToggleGroupItem key={s} value={String(s)} className={cx("speed-item")} title="Playback speed (game time vs real time)">
                  {s}×
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <AdvantageStrip />
        <main className={cx("board")}>
          {game.players.map((_, pi) => <PlayerBoard key={pi} pi={pi} />)}
        </main>
      </div>
    </MomentProvider>
  );
}

"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "lucide-react";
import { MotionConfig, useMotionValue } from "motion/react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { PlayerLayout } from "@/lib/sandbox/placement";
import { AGE, armyTotals, fmt, ownedAt, queuesAt } from "@/lib/sandbox/rules";
import type { GameData, StatIcons } from "@/lib/sandbox/types";
import { AdvantageStrip } from "./advantage-strip";
import { MomentProvider, cx, type Moment } from "./moment";
import { PlayerBoard } from "./player-board";
import { SectionNav } from "./section-nav";
import { SectionsProvider } from "./sections";
import { equippedNow } from "./tiles";

// speed = game seconds per real second
const SPEEDS = [1, 5, 10, 30, 60, 120];

/** typing in a text field keeps its Space */
const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable
  || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
  || (el instanceof HTMLInputElement && !["range", "checkbox", "radio", "button"].includes(el.type)));

/** The whole 1v1 board with a clock: drag the timeline or press play to watch the game build up. */
export function SandboxReplay({ game, layouts, icons }: { game: GameData; layouts: PlayerLayout[]; icons: StatIcons }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);
  const gameT = useRef(0); // precise game time while playing; t is its whole seconds
  const clock = useMotionValue(0); // the same precise time, for progress bars

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      gameT.current = Math.min(game.duration, gameT.current + ((now - last) / 1000) * speed);
      last = now;
      clock.set(gameT.current);
      setT(Math.floor(gameT.current));
      if (gameT.current >= game.duration) setPlaying(false);
      else frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, game.duration, clock]);

  const togglePlay = () => {
    if (!playing) gameT.current = t >= game.duration ? 0 : t;
    setPlaying(!playing);
  };
  // Space plays / pauses from anywhere on the page
  const onSpace = useEffectEvent(togglePlay);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || isTyping(e.target)) return;
      e.preventDefault(); // no page scroll
      if (!e.repeat) onSpace();
    };
    // a focused button clicks on Space key-up; keep Space for the clock instead
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping(e.target)) e.preventDefault();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  const seek = (value: number) => {
    gameT.current = value;
    clock.set(value);
    setT(value);
  };

  const moment: Moment = useMemo(() => ({
    game, layouts, icons, t, clock,
    owned: ownedAt(game, t),
    equipped: layouts.map((L) => {
      const out: Record<string, number> = {};
      for (const f of L.forts) for (const e of f.entries) equippedNow(e.entry, e.equip, t, out);
      return out;
    }),
    queues: game.players.map((p) => queuesAt(p, t)),
    totals: game.players.map((p) => armyTotals(p, t)),
    navyTotals: game.players.map((p) => armyTotals(p, t, true)),
  }), [game, layouts, icons, t, clock]);

  const [p1, p2] = game.players;
  return (
    // honours the system's reduce-motion setting for every animation below
    <MotionConfig reducedMotion="user">
      <MomentProvider value={moment}>
        <SectionsProvider>
          <div className={cx("root")}>
            <header className={cx("header")}>
              <h1 className={cx("title")}>
                {p1.name} ({p1.civ}) vs {p2.name} ({p2.civ}) · {game.map} · {fmt(game.duration)}
              </h1>
              <div className={cx("sub")}>
                Hover any icon for its name. Drag the clock or press play (Space): icons light up when they&apos;re made,
                fade when they&apos;re all lost.
              </div>
            </header>
            <div className={cx("clock")}>
              <div className={cx("clock-row")}>
                <Button className={cx("play")} onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} title="Play / pause (Space)">
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
            <SectionNav />
          </div>
        </SectionsProvider>
      </MomentProvider>
    </MotionConfig>
  );
}

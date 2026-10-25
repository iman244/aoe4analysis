"use client";

import { createContext, useContext } from "react";
import type { PlayerLayout } from "@/lib/sandbox/placement";
import type { Totals } from "@/lib/sandbox/rules";
import type { GameData, StatIcons } from "@/lib/sandbox/types";
import styles from "./sandbox.module.css";

/** Everything a tile needs to draw itself at the current game time. */
export type Moment = {
  game: GameData;
  layouts: PlayerLayout[];
  icons: StatIcons;
  t: number;
  /** tech ids each player has by now */
  owned: Set<string>[];
  /** per player: defense equipment id -> how many buildings carry it now */
  equipped: Record<string, number>[];
  totals: Totals[];
  navyTotals: Totals[];
};

const MomentContext = createContext<Moment | null>(null);
export const MomentProvider = MomentContext.Provider;

export function useMoment(): Moment {
  const m = useContext(MomentContext);
  if (!m) throw new Error("useMoment must be used inside the sandbox replay");
  return m;
}

/** CSS module class names from plain names: cx("ic", ahead && "ahead") */
export const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter((n): n is string => !!n).map((n) => styles[n]).join(" ");

/** An inline game-icons.net SVG (stat or bonus icon) that takes the text colour.
 *  The markup comes from our own files in data/stat-icons, never from user input. */
export function StatIcon({ k }: { k: string }) {
  const { icons } = useMoment();
  return <span className={cx("si")} dangerouslySetInnerHTML={{ __html: icons[k] ?? "" }} />;
}

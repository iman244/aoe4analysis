"use client";
/* eslint-disable @next/next/no-img-element -- dozens of small remote game icons; plain img keeps them simple */

import type { ReactNode } from "react";
import { motion, useTransform } from "motion/react";
import type { Ups } from "@/lib/sandbox/placement";
import {
  GATHER_LABEL, aliveAt, countAt, fmt, slotState, upSlots, type InQueue, type UpSlot,
} from "@/lib/sandbox/rules";
import type { Building, Item, Job, Tech } from "@/lib/sandbox/types";
import { cx, useMoment } from "./moment";

/** What's queued now for a unit, or for any tech of a line, merged; nothing without a player. */
export function useQueue(pi: number | undefined, ids: string[]): InQueue | undefined {
  const { queues } = useMoment();
  if (pi === undefined) return undefined;
  const found = ids.map((id) => queues[pi].get(id)).filter((q) => !!q);
  if (!found.length) return undefined;
  return { making: found.flatMap((q) => q.making), waiting: found.reduce((n, q) => n + q.waiting, 0) };
}

/** tooltip lines for what's queued */
export function queueNote(q: InQueue | undefined, verb: string) {
  if (!q) return "";
  const n = q.making.length;
  return (n ? `\n${verb} now${n > 1 ? ` in ${n} buildings` : ""}, next done at ${fmt(Math.min(...q.making.map((j) => j.e)))}` : "")
    + (q.waiting ? `\n${q.waiting} more queued, waiting behind other items` : "");
}

/** a gold bar up the left edge of the icon, filling bottom to top as the one closest to done gets there */
export function QueueBar({ q }: { q: InQueue | undefined }) {
  const { t } = useMoment();
  if (!q?.making.length) return null;
  const done = (j: Job) => (t - j.s) / Math.max(1, j.e - j.s);
  const j = q.making.reduce((a, b) => (done(b) > done(a) ? b : a));
  // a new bar per item, so it starts empty instead of sliding back down from the last one
  return <ProgressBar key={`${j.s}:${j.e}`} s={j.s} e={j.e} />;
}

/** fills with the precise game clock every frame, so it moves smoothly between game seconds */
function ProgressBar({ s, e }: { s: number; e: number }) {
  const { clock } = useMoment();
  const scaleY = useTransform(clock, [s, Math.max(e, s + 1)], [0, 1], { clamp: true });
  return <motion.i className={cx("qbar")} style={{ scaleY }} />;
}

/** class for an icon with something queued: in production, or only waiting */
export const queueClass = (q: InQueue | undefined) => (q?.making.length ? "making" : q?.waiting ? "queued" : false);

/** A building or unit tile: lights up when made, shows how many are alive and lost, fades when all are gone.
 *  With the player, a unit tile also shows what's being trained: count +in production/waiting in a queue. */
export function Tile({ it, pi, extra = [], children }:
  { it: Item | Building; pi?: number; extra?: string[]; children?: ReactNode }) {
  const { t } = useMoment();
  const unit = "group" in it && (it.group === "army" || it.group === "economy");
  const q = useQueue(unit ? pi : undefined, unit ? [(it as Item).baseId ?? (it as Item).key] : []);
  const tiers = "tiers" in it ? it.tiers : undefined;
  const parts = "parts" in it ? it.parts : undefined;
  let name = it.name, icon = it.icon, tierUp = false;
  if (tiers?.length) {
    // unit tiles show the highest tier reached by now
    const cur = tiers.filter((x) => x.from <= t).pop() ?? tiers[0];
    [name, icon] = [cur.name, cur.icon];
    tierUp = cur !== tiers[0] && cur.from > t - 20;
  }
  const body = parts
    ? <div className={cx("mosaic")}>{parts.map((x) =>
      <img key={x.name} src={x.icon} alt={x.name} loading="lazy" className={cx(countAt(x.t, t) === 0 && "off")} />)}</div>
    : <img src={icon} alt={name} loading="lazy" />;
  if (!it.t.length) {
    return <div className={cx("ic", ...extra, "never")} title={`${it.name}: not built`}>{body}{children}</div>;
  }
  const made = countAt(it.t, t), lost = countAt(it.dead, t), alive = Math.max(0, made - lost);
  // the number shows once there are 2+ by now, or some were lost; with a queue it always shows,
  // so "1 +1" reads as one made and one in production
  const count = made > 1 || lost > 0 || (made > 0 && q) ? (lost ? alive : made) : "";
  let tierNote = tiers && tiers.length > 1 ? "\n" + tiers.map((x) => `${x.name} from ${fmt(x.from)}`).join("\n") : "";
  if (parts) {
    // dropoffs tile: list the split of camp types in the tooltip
    tierNote = "\n" + parts.map((x) => {
      const m = countAt(x.t, t), l = countAt(x.dead, t);
      return m ? `${x.name}: ${m - l}${l ? ` (${l} lost)` : ""}` : `${x.name}: none yet`;
    }).join("\n");
  }
  const title = made === 0
    ? `${name}: first made at ${fmt(it.t[0])}`
    : `${name}\n${made} made${lost ? `, ${lost} lost, ${alive} alive` : ""}\nFirst at ${fmt(it.t[0])}${tierNote}`;
  return (
    <div title={title + queueNote(q, "Training")} className={cx("ic", ...extra, made === 0 && "future", queueClass(q),
      made > 0 && alive === 0 && it.dead.length > 0 && "gone",
      (tierUp || it.t.some((x) => x <= t && x > t - 20)) && "fresh")}>
      {body}
      <QueueBar q={q} />
      {(count !== "" || q) && (
        <span className={cx("c")}>
          {count}{q && <em>{count !== "" && "\u2009"}+{q.making.length}{q.waiting > 0 && `/${q.waiting}`}</em>}
        </span>
      )}
      {lost > 0 && <span className={cx("d")}>−{lost}</span>}
      {children}
    </div>
  );
}

/** One small upgrade icon: the latest step of its line by now, green when the opponent lacks it. */
export function UpgradeIcon({ techs, pi, kind, line }: { techs: Tech[]; pi: number; kind: string; line: string }) {
  const { t, owned } = useMoment();
  const s = slotState(techs, t, owned[1 - pi]);
  const q = useQueue(pi, techs.map((x) => x.id));
  return (
    <div className={cx("ic", "mini", s.ahead && "ahead", s.fresh && "fresh", s.future && "future", s.never && "never", queueClass(q))}
      title={`${kind}: ${s.tech.name}\n${line}${s.step}, ${s.note}` + queueNote(q, "Researching")}>
      <img src={s.tech.icon} alt={s.tech.name} />
      <QueueBar q={q} />
    </div>
  );
}

const slotIcon = (s: UpSlot, pi: number, i: number) => (
  <UpgradeIcon key={s.techs[0].id ?? i} techs={s.techs} pi={pi} kind={s.techs[0].unique ? "Unique upgrade" : "Upgrade"}
    line={s.line ?? (s.techs[0].kind === "eco" ? "economy" : "military")} />
);

/** A tile with its upgrades: as corner badges when they fit, else in a frame beside it (unique ones after a divider). */
export function PlacedTile({ it, ups, pi, extra = [] }: { it: Item | Building; ups: Ups; pi: number; extra?: string[] }) {
  if (!ups.techs.length) return <Tile it={it} pi={pi} extra={extra} />;
  const slots = upSlots(ups.techs);
  if (!ups.frame) {
    return <Tile it={it} pi={pi} extra={extra}><div className={cx("ubadges")}>{slots.map((s, i) => slotIcon(s, pi, i))}</div></Tile>;
  }
  const common = slots.filter((s) => !s.techs[0].unique), unique = slots.filter((s) => s.techs[0].unique);
  return (
    <div className={cx("vil")}>
      <Tile it={it} pi={pi} extra={extra} />
      <div className={cx("gather")}>
        <div className={cx("u-col")}>{common.map((s, i) => slotIcon(s, pi, i))}</div>
        {unique.length > 0 && <div className={cx("u-col", "u-unique")}>{unique.map((s, i) => slotIcon(s, pi, i))}</div>}
      </div>
    </div>
  );
}

/** The villager and its gathering upgrades share one frame; the civ's unique ones sit after a divider. */
export function VillagerTile({ it, slots, pi }: { it: Item; slots: UpSlot[]; pi: number }) {
  const icon = (s: UpSlot) => (
    <UpgradeIcon key={s.techs[0].id} techs={s.techs} pi={pi}
      kind={s.techs[0].unique ? "Unique villager upgrade" : "Villager upgrade"} line={GATHER_LABEL[s.line!] ?? s.line!} />
  );
  const common = slots.filter((s) => !s.techs[0].unique), unique = slots.filter((s) => s.techs[0].unique);
  return (
    <div className={cx("vil")}>
      <Tile it={it} pi={pi} />
      <div className={cx("gather")}>
        <div className={cx("g-common")}>{common.map(icon)}</div>
        {unique.length > 0 && <div className={cx("g-unique")}>{unique.map(icon)}</div>}
      </div>
    </div>
  );
}

/** Defense equipment under its fort: how many of those buildings carry it now. */
export function EquipIcon({ tech, fort, pi }: { tech: Tech; fort: Building; pi: number }) {
  const { t, equipped } = useMoment();
  const n = equipped[pi][tech.id] ?? 0, theirs = equipped[1 - pi][tech.id] ?? 0;
  const q = useQueue(pi, [tech.id]);
  const bought = countAt(tech.times ?? [], t);
  let state: string[] = [], note: string;
  if (n > 0) {
    state = [n > theirs ? "ahead" : "", (tech.times ?? []).some((v) => v <= t && v > t - 20) ? "fresh" : ""];
    note = `on ${n} ${fort.name}${n > 1 ? "s" : ""} (opponent: ${theirs})`;
  } else if (bought) {
    state = ["gone"];
    note = `${bought} bought, those buildings are lost`;
  } else {
    state = [tech.t !== null ? "future" : "never"];
    note = tech.t !== null ? `first at ${fmt(tech.t)}` : "not researched";
  }
  return (
    <div className={cx("ic", "mini", ...state, queueClass(q))} title={`${tech.name}\n${note}` + queueNote(q, "Researching")}>
      <img src={tech.icon} alt={tech.name} />
      <QueueBar q={q} />
      {n > 0 && <span className={cx("n")}>{n}</span>}
    </div>
  );
}

/** how many of a fort building's equipment pieces are in place: purchases so far, at most the buildings alive */
export const equippedNow = (fort: Building, equip: Tech[], t: number, out: Record<string, number>) => {
  const alive = aliveAt(fort, t);
  for (const x of equip) out[x.id] = Math.min(countAt(x.times ?? [], t), Math.max(0, alive));
};

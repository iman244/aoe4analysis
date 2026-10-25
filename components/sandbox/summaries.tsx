"use client";
/* eslint-disable @next/next/no-img-element -- small remote game icons */

import type { ReactNode } from "react";
import { AGE, STATS, aliveAt, compact, countAt, fmt, relicsAt, type InQueue } from "@/lib/sandbox/rules";
import type { Building, Item, StatKey } from "@/lib/sandbox/types";
import { RelicIcon, StatIcon, cx, useMoment } from "./moment";

// What a folded section shows instead: the same things at a glance, at the current moment.

const nothing = <span className={cx("none")}>Nothing yet</span>;

/** One thing in a summary: its icon, how many are alive, and what's queued ("+making/waiting"). */
function Chip({ it, q }: { it: Item | Building; q?: InQueue }) {
  const { t } = useMoment();
  const alive = aliveAt(it, t), lost = countAt(it.dead, t);
  const tiers = "tiers" in it ? it.tiers : undefined;
  const cur = tiers?.filter((x) => x.from <= t).pop() ?? tiers?.[0];
  const name = cur?.name ?? it.name;
  return (
    <span className={cx("sum-chip")} title={`${name}: ${alive} alive${lost ? `, ${lost} lost` : ""}`
      + (q?.making.length ? `\n${q.making.length} in production` : "") + (q?.waiting ? `, ${q.waiting} waiting` : "")}>
      <img src={cur?.icon ?? it.icon} alt={name} /><b>{alive}</b>
      {q && <em>+{q.making.length}{q.waiting > 0 && `/${q.waiting}`}</em>}
    </span>
  );
}

/** chips for the things alive or queued now, most first */
function Chips({ pi, items, queued = true, empty = nothing }:
  { pi: number; items: (Item | Building)[]; queued?: boolean; empty?: ReactNode }) {
  const { t, queues } = useMoment();
  const shown = items.map((it) => ({
    it, alive: aliveAt(it, t),
    q: queued && "group" in it ? queues[pi].get(it.baseId ?? it.key) : undefined,
  })).filter((x) => x.alive > 0 || x.q).sort((a, b) => b.alive - a.alive);
  if (!shown.length) return empty;
  return <>{shown.map(({ it, q }) => <Chip key={("key" in it && it.key) || it.name} it={it} q={q} />)}</>;
}

export function LandmarksSummary({ pi }: { pi: number }) {
  const { game, layouts, t } = useMoment();
  const p = game.players[pi];
  const age = p.ages.filter((a) => a.t <= t).pop();
  const built = layouts[pi].landmarks.filter((x) => countAt(x.item.t, t) > 0);
  return (
    <>
      <span className={cx("sum-text")}>{AGE[age?.age ?? 1]} Age{age ? ` since ${fmt(age.t)}` : ""}</span>
      {built.map((x) => <img key={x.item.key} className={cx("sum-icon")} src={x.item.icon} alt={x.item.name} title={x.item.name} />)}
    </>
  );
}

export function EconomySummary({ pi }: { pi: number }) {
  const { layouts, t } = useMoment();
  const L = layouts[pi];
  const upgrades = L.villagerSlots.flatMap((s) => s.techs);
  const done = upgrades.filter((x) => x.t !== null && x.t <= t).length;
  return (
    <>
      <Chips pi={pi} items={[...L.ecoCards.flatMap((c) => [c.head, ...c.units.map((u) => u.item)]), ...L.ecoRest]} />
      <span className={cx("sum-text")}>{done}/{upgrades.length} villager upgrades</span>
    </>
  );
}

export function TechSummary({ pi }: { pi: number }) {
  const { layouts, t, queues } = useMoment();
  const techs = layouts[pi].techGroups.flatMap((g) => g.techs);
  const done = techs.filter((x) => x.t !== null && x.t <= t).length;
  const researching = techs.filter((x) => queues[pi].get(x.id)?.making.length);
  return (
    <span className={cx("sum-text")}>
      {done} of {techs.length} researched{researching.length ? ` · researching ${researching.map((x) => x.name).join(", ")}` : ""}
    </span>
  );
}

export function ReligionSummary({ pi }: { pi: number }) {
  const { game, layouts, t } = useMoment();
  const card = layouts[pi].army.find((c) => c.card.religious);
  return (
    <>
      <span className={cx("sum-chip")} title="Relics stored"><RelicIcon /><b>{relicsAt(game.players[pi], t)}</b></span>
      {card && <Chips pi={pi} items={card.units.map((u) => u.item)} empty={null} />}
    </>
  );
}

export const BuildingsSummary = ({ pi, items }: { pi: number; items: Item[] }) => <Chips pi={pi} items={items} queued={false} />;

export function DefenseSummary({ pi }: { pi: number }) {
  const { layouts } = useMoment();
  return <Chips pi={pi} items={layouts[pi].forts.flatMap((f) => f.entries.flatMap(({ entry }) => (entry.gate ? [entry, entry.gate] : [entry])))} queued={false} />;
}

/** Army or Navy: each unit type alive or in production, then the totals the stats card would show. */
export function ArmySummary({ pi, naval }: { pi: number; naval: boolean }) {
  const m = useMoment();
  const cards = (naval ? m.layouts[pi].navy : m.layouts[pi].army.filter((c) => !c.card.religious));
  const units = cards.flatMap((c) => c.units.map((u) => u.item));
  const tot = (naval ? m.navyTotals : m.totals)[pi];
  return (
    <>
      <Chips pi={pi} items={units} />
      {tot.hp > 0 && (
        <span className={cx("sum-stats")}>
          {STATS.map(([k, label]: [StatKey, string]) => (
            <span key={k} title={label}><StatIcon k={k} />{compact(tot[k])}</span>
          ))}
        </span>
      )}
    </>
  );
}

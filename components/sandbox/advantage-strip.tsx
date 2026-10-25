"use client";
/* eslint-disable @next/next/no-img-element -- small remote game icons */

import type { ReactNode } from "react";
import { AGE, ECO_ROLES, ROMAN, STATS, ageAt, aliveByRole, compact, fmt, ratio, relicsAt } from "@/lib/sandbox/rules";
import { StatIcon, cx, useMoment } from "./moment";

const None = () => <span className={cx("none")}>None</span>;

function Row({ label, count, children, icons = false }: { label: ReactNode; count: number; children: ReactNode; icons?: boolean }) {
  return (
    <div className={cx("adv-row")}>
      <div className={cx("rl")}><span>{label}</span><b>{count}</b></div>
      <div className={cx(icons ? "icons" : "chips")}>{children}</div>
    </div>
  );
}

/** Top strip: for each player, everything they lead in right now, row by row, with a total. */
export function AdvantageStrip() {
  const { game, t, owned, totals, navyTotals } = useMoment();
  const roles = game.players.map((p) => aliveByRole(p, t));
  return (
    <section className={cx("adv")}>
      {game.players.map((p, pi) => {
        const them = game.players[1 - pi];
        const mine = ageAt(p, t), theirs = ageAt(them, t);
        const ageLead = mine > theirs;
        // economy infrastructure: villagers, town centers, farms, traders, scouts alive beyond the opponent's
        const extra = ECO_ROLES.flatMap(([role, label]) => {
          const a = roles[pi][role]?.alive ?? 0, b = roles[1 - pi][role]?.alive ?? 0;
          return a > b ? [{ label, diff: a - b, mine: a, theirs: b, icon: roles[pi][role].icon }] : [];
        });
        // techs this player has that the opponent doesn't, in research order (age-up wings don't count)
        const ahead = p.techGroups.flatMap((g) => g.techs.map((x) => ({ ...x, building: g.label })))
          .filter((x) => x.t !== null && x.t <= t && !owned[1 - pi].has(x.id) && !x.landmark)
          .sort((a, b) => a.t! - b.t!);
        const leads = ([["Army", totals], ["Navy", navyTotals]] as const).map(([label, tot]) =>
          ({ label, tot, list: STATS.filter(([k]) => tot[pi][k] > tot[1 - pi][k]) }));
        const myRelics = relicsAt(p, t), theirRelics = relicsAt(them, t);
        const relicLead = myRelics > theirRelics;
        const total = Number(ageLead) + Number(relicLead) + extra.length + ahead.length
          + leads.reduce((n, l) => n + l.list.length, 0);
        return (
          <div key={pi} className={cx("adv-p", `p${pi + 1}`)}>
            <div className={cx("adv-h")}>
              <span className={cx("n")}>{p.name}</span>
              <span className={cx("r", p.result === "win" ? "win" : "loss")}>{p.result.toUpperCase()}</span>
              <span className={cx("l")}>Advantage</span>
              <span className={cx("k")}>{total}</span>
            </div>
            <Row label="Age" count={Number(ageLead)}>
              {ageLead ? (
                <span className={cx("chip")} title={`${AGE[mine]} Age vs ${AGE[theirs]} Age`}>
                  <span className={cx("age")}>{ROMAN[mine]}</span><b>vs {ROMAN[theirs]}</b>
                </span>
              ) : <None />}
            </Row>
            <Row label={<>Economy<br />infrastructure</>} count={extra.length}>
              {extra.length ? extra.map((x) => (
                <span key={x.label} className={cx("chip", "unit")} title={`${x.label}: ${x.mine} vs ${x.theirs} alive`}>
                  <img src={x.icon} alt={x.label} /><b>+{x.diff}</b>
                </span>
              )) : <None />}
            </Row>
            {([["eco", "Economy"], ["mil", "Military"]] as const).map(([kind, label]) => {
              const list = ahead.filter((x) => x.kind === kind);
              return (
                <Row key={kind} label={label} count={list.length} icons>
                  {list.length ? list.map((x) => (
                    <div key={x.id} className={cx("ic", "tech", "ahead", x.t! > t - 20 && "fresh")}
                      title={`${x.name} (${x.building})\nResearched at ${fmt(x.t!)}`}>
                      <img src={x.icon} alt={x.name} />
                    </div>
                  )) : <None />}
                </Row>
              );
            })}
            {leads.map(({ label, tot, list }) => (
              <Row key={label} label={label} count={list.length}>
                {list.length ? list.map(([k, name]) => {
                  const r = ratio(tot[pi][k], tot[1 - pi][k]);
                  return (
                    <span key={k} className={cx("chip")} title={`${name}: ${compact(tot[pi][k])} vs ${compact(tot[1 - pi][k])}`}>
                      <StatIcon k={k} />{r && <b>{r}</b>}
                    </span>
                  );
                }) : <None />}
              </Row>
            ))}
            <Row label="Relics" count={Number(relicLead)}>
              {relicLead ? (
                <span className={cx("chip")} title={`Relics stored: ${myRelics} vs ${theirRelics}`}>
                  <StatIcon k="relic" /><b>+{myRelics - theirRelics}</b>
                </span>
              ) : <None />}
            </Row>
          </div>
        );
      })}
    </section>
  );
}

"use client";

import { useMemo } from "react";
import { blacksmithLedger } from "@/lib/sandbox/ledger";
import type { FortView } from "@/lib/sandbox/placement";
import { AGE, BONUS_LABEL, ROMAN, STATS, ageAt, compact, fmt, ratio, upSlots } from "@/lib/sandbox/rules";
import type { StatKey, Tech } from "@/lib/sandbox/types";
import { StatIcon, cx, useMoment } from "./moment";
import { Fold, Section, SectionHead, useSections } from "./sections";
import { AssetValue, CardValue, PlayerAssets } from "./card-value";
import { DefenseSummary } from "./summaries";
import { EquipIcon, Tile, UpgradeIcon } from "./tiles";

/** Defense column: the current age on top, then one fixed slot per fort type, equipment under each fort. */
export function DefenseColumn({ pi }: { pi: number }) {
  const { game, layouts, t } = useMoment();
  const p = game.players[pi];
  const forts = layouts[pi].forts;
  // each fort slot is as tall as the bigger of the two players' stacks, so the columns line up;
  // a tile is 52px, plus rows of two 22px equipment icons under it
  const slotHeights = useMemo(() => layouts[0].forts.map((_, i) => Math.max(52, ...layouts.map((l) =>
    l.forts[i].entries.reduce((h, e, j) => {
      const rows = Math.ceil(e.equip.length / 2);
      return h + (j ? 6 : 0) + 52 + (rows ? 6 + rows * 22 + (rows - 1) * 4 : 0);
    }, 0)))), [layouts]);
  const mine = ageAt(p, t), theirs = ageAt(game.players[1 - pi], t);
  const since = p.ages.filter((a) => a.t <= t).pop();
  const ahead = mine - theirs;
  return (
    <div className={cx("fortcol")}>
      <div className={cx("fage-row")}>
        <span className={cx("fage", ahead > 0 && "ahead")} title={`${AGE[mine]} Age${since ? ` since ${fmt(since.t)} (${since.name})` : ""}`
          + (ahead > 0 ? `\n${ahead > 1 ? `${ahead} ages` : "One age"} ahead of the opponent` : "")}>{ROMAN[mine]}</span>
        <PlayerAssets pi={pi} />
      </div>
      <Section id="defense" title="Defense" summary={<DefenseSummary pi={pi} />}>
        <aside className={cx("forts")}>
          {forts.map((f: FortView, i) => (
            <div key={f.slot.key} className={cx("fslot")} style={{ minHeight: slotHeights[i] }}>
              {f.entries.length ? f.entries.map(({ entry, equip, upgrades }) => {
                // fort-wide upgrades ride on the tile's corners; the gate rides on its wall
                const tile = (
                  <Tile key={entry.key} it={entry}>
                    {upgrades.techs.length > 0 && <div className={cx("ubadges")}>{upSlots(upgrades.techs).map((s) =>
                      <UpgradeIcon key={s.techs[0].id} techs={s.techs} pi={pi} kind={s.techs[0].unique ? "Unique upgrade" : "Upgrade"}
                        line={s.line ?? (s.techs[0].kind === "eco" ? "economy" : "military")} />)}</div>}
                    {entry.gate && <Tile it={entry.gate} extra={["gate"]} />}
                  </Tile>
                );
                if (!equip.length) return tile;
                return (
                  <div key={entry.key} className={cx("fblock")}>
                    {tile}
                    <div className={cx("fups")}>{equip.map((x) => <EquipIcon key={x.id} tech={x} fort={entry} pi={pi} />)}</div>
                  </div>
                );
              }) : <div className={cx("empty")} title={`${p.civ} has no ${f.slot.label.toLowerCase()}`} />}
            </div>
          ))}
        </aside>
      </Section>
    </div>
  );
}

/** Army or Navy totals: HP alone, then the armor pair, then the damage pair with bonus damage. */
export function StatCard({ pi, naval }: { pi: number; naval: boolean }) {
  const m = useMoment();
  // a folded Army / Navy row carries these totals in its summary line
  const folded = useSections().closed.has(naval ? "navy" : "army");
  const totals = naval ? m.navyTotals : m.totals;
  const stat = (k: StatKey) => {
    const mine = totals[pi][k], theirs = totals[1 - pi][k];
    const lead = mine > theirs ? ratio(mine, theirs) : "";
    return (
      <div key={k} className={cx("astat", mine > theirs && "ahead")} title={STATS.find(([s]) => s === k)![1]}>
        <StatIcon k={k} />
        <b>{compact(mine)}</b>
        {lead && <i>{lead}</i>}
        {(k === "meleeAttack" || k === "rangedAttack") && (
          <div className={cx("bonus")}>
            {Object.entries(totals[pi].bonus[k]).sort((a, b) => b[1] - a[1]).map(([cat, v]) => (
              <div key={cat} title={`+${compact(v)} bonus damage vs ${BONUS_LABEL[cat]}`}>+{compact(v)}<StatIcon k={cat} /></div>
            ))}
          </div>
        )}
      </div>
    );
  };
  // slides away with its row when Army / Navy folds
  return (
    <Fold show={!folded} className={cx("side-card", naval ? "area-nstats" : "area-stats")}>
      <SectionHead id="stats" title={naval ? "Navy stats" : "Army stats"} foldable={false} />
      <div className={cx("astats")} title={naval
        ? "Navy totals: every living warship added together, with researched upgrades"
        : "Army totals: every living military unit added together, with researched upgrades"}>
        <div className={cx("arow")}><AssetValue pi={pi} naval={naval} /></div>
        {([["hp"], ["meleeArmor", "rangedArmor"], ["meleeAttack", "rangedAttack"]] as StatKey[][]).map((row) => (
          <div key={row[0]} className={cx("arow")}>{row.map(stat)}</div>
        ))}
      </div>
    </Fold>
  );
}

const BS_LINES = ["Melee Armor", "Ranged Armor", "Melee Damage", "Ranged Damage"];

/** Blacksmith: the building on top, then the latest step of each armor/damage line, other techs, unique ones last. */
export function BlacksmithCard({ pi }: { pi: number }) {
  const { game, layouts } = useMoment();
  const techs = layouts[pi].blacksmithTechs;
  const lines = BS_LINES.map((line) => techs.filter((x) => x.line === line).sort((a, b) => a.tier! - b.tier!))
    .filter((list) => list.length);
  const rest = techs.filter((x) => !x.line);
  const common = rest.filter((x) => !x.unique), unique = rest.filter((x) => x.unique);
  const slot = (list: Tech[]) => (
    <UpgradeIcon key={list[0].id} techs={list} pi={pi} kind="Blacksmith upgrade" line={list[0].line ?? "Blacksmith"} />
  );
  return (
    <div className={cx("bscard")}>
      <Tile it={{ ...game.players[pi].blacksmith, name: "Blacksmith" }} extra={["phead"]} />
      <div className={cx("bs")}>
        {[...lines, ...common.map((x) => [x])].map(slot)}
        {unique.length > 0 && <div className={cx("bs-sep")} />}
        {unique.map((x) => slot([x]))}
      </div>
      <CardValue pi={pi} ledger={blacksmithLedger(game.players[pi], layouts[pi])} />
    </div>
  );
}

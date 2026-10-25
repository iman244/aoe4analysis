"use client";

import { Building2Icon, ChevronsUpIcon, CoinsIcon, HourglassIcon, PackageIcon, SigmaIcon, SkullIcon, UsersIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useMemo } from "react";
import { forceLedger, playerLedger, valueAt, type Ledger, type Value, type Values } from "@/lib/sandbox/ledger";
import { compact, ratio } from "@/lib/sandbox/rules";
import { cx, useMoment } from "./moment";

const METRICS: [keyof Value, typeof PackageIcon, string][] = [
  ["asset", PackageIcon, "Asset: value of what's alive or standing now (upgrades: researched)"],
  ["lost", SkullIcon, "Lost: value of what died"],
  ["queued", HourglassIcon, "Queued: value of what's in production or waiting in a queue"],
  ["spent", CoinsIcon, "Spent: everything put in so far (asset + lost + queued)"],
];

// a building can't be queued here and an upgrade can't be lost: those cells show a dash
const ROWS: [keyof Values, typeof PackageIcon, string, (keyof Value)[]][] = [
  ["buildings", Building2Icon, "Building", ["queued"]],
  ["units", UsersIcon, "Units", []],
  ["upgrades", ChevronsUpIcon, "Upgrades", ["lost"]],
];

const sum = (v: Values, k: keyof Value) => v.buildings[k] + v.units[k] + v.upgrades[k];

/** The full numbers: building, units and upgrades kept apart, asset / lost / queued / spent across,
 *  summed under a line at the bottom. Rows with nothing in them are left out. */
function ValueTable({ v }: { v: Values }) {
  const rows = ROWS.filter(([row]) => v[row].spent > 0);
  return (
    <div className={cx("card-vals")}>
      <span />
      {METRICS.map(([key, Icon, title]) => (
        <span key={key} className={cx("cv-h", key)} title={title}><Icon />{title.split(":")[0]}</span>
      ))}
      {rows.flatMap(([row, RowIcon, label, na]) => [
        <span key={row} className={cx("cv-r")}><RowIcon />{label}</span>,
        ...METRICS.map(([key]) => {
          const n = v[row][key];
          return na.includes(key)
            ? <span key={`${row}-${key}`} className={cx("cv", "na")}>–</span>
            : <span key={`${row}-${key}`} className={cx("cv", key, n === 0 && "zero")}>{compact(n)}</span>;
        }),
      ])}
      <span className={cx("cv-sep")} />
      <span className={cx("cv-r", "sum")}><SigmaIcon />Spent</span>
      {METRICS.map(([key]) => <span key={key} className={cx("cv", "sum", key)}>{compact(sum(v, key))}</span>)}
    </div>
  );
}

/** A building card's resource value at a glance: one bar split into asset (building / units / upgrades) / lost /
 *  queued, with what was spent.
 *  Hover (or focus) it for the full table. Cards with nothing in them all game show nothing. */
export function CardValue({ pi, ledger }: { pi: number; ledger: Ledger }) {
  const { game, t } = useMoment();
  const p = game.players[pi];
  // decided over the whole game, so a card doesn't grow a bar mid-replay and push the others around
  if (sum(valueAt(ledger, p, game.duration), "spent") === 0) return null;
  const v = valueAt(ledger, p, t);
  const spent = sum(v, "spent");
  return (
    <HoverCard>
      <HoverCardTrigger delay={150} closeDelay={100}
        render={<button type="button" className={cx("vbar-row")} aria-label="Resource value details" />}>
        {/* asset split in shades: building darker, units lighter (upgrades in purple, as on the player's assets bar) */}
        <span className={cx("vbar")}>
          {([["asset-b", v.buildings.asset], ["asset-u", v.units.asset], ["asset-t", v.upgrades.asset],
            ["lost", sum(v, "lost")], ["queued", sum(v, "queued")]] as const).map(([k, n]) => (
            <i key={k} className={cx(k)} style={{ width: `${spent ? (n / spent) * 100 : 0}%` }} />
          ))}
        </span>
        <span className={cx("vbar-spent", spent === 0 && "zero")} title="Spent"><CoinsIcon />{compact(spent)}</span>
      </HoverCardTrigger>
      <HoverCardContent className={cx("valpop")} side="top">
        <ValueTable v={v} />
      </HoverCardContent>
    </HoverCard>
  );
}

/** Beside the age: what everything the player has is worth now, with a bar split into buildings / units /
 *  upgrades under it; hover for the numbers. */
export function PlayerAssets({ pi }: { pi: number }) {
  const { game, layouts, t } = useMoment();
  const p = game.players[pi], them = game.players[1 - pi];
  const ledgers = useMemo(() => [playerLedger(p, layouts[pi]), playerLedger(them, layouts[1 - pi])], [p, them, layouts, pi]);
  const v = valueAt(ledgers[0], p, t), w = valueAt(ledgers[1], them, t);
  const assetOf = (x: Values) => x.buildings.asset + x.units.asset + x.upgrades.asset;
  const asset = assetOf(v);
  const share = (n: number) => (asset ? (n / asset) * 100 : 0);
  // against the opponent's same part: green when ahead, red with a minus when behind
  const vs = (mine: number, theirs: number) => {
    if (!theirs) return <span className={cx("vs", "none")} title="The opponent has none">–</span>;
    const d = Math.round((mine / theirs - 1) * 100);
    return <span className={cx("vs", d > 0 ? "up" : d < 0 ? "down" : "even")}
      title={`${compact(mine)} vs the opponent's ${compact(theirs)}`}>{d > 0 ? "+" : ""}{d}%</span>;
  };
  return (
    <HoverCard>
      <HoverCardTrigger delay={150} closeDelay={100}
        render={<button type="button" className={cx("fage-asset")} aria-label="Assets by buildings, units and upgrades" />}>
        {/* the lead shows only for the player who has more; the pop-up compares both ways */}
        <span className={cx("fage-num")}><PackageIcon />{compact(asset)}{asset > assetOf(w) && vs(asset, assetOf(w))}</span>
        <span className={cx("abar")}>
          {ROWS.map(([row]) => <i key={row} className={cx(row)} style={{ width: `${share(v[row].asset)}%` }} />)}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className={cx("valpop")} side="bottom">
        <div className={cx("asset-split")}>
          <span className={cx("asset-split-h")}>
            Assets: what everything {p.name} has is worth now. Share of the total / compared with {them.name}
          </span>
          {ROWS.map(([row, RowIcon, label]) => [
            <span key={`${row}-l`} className={cx("cv-r")}>
              <i className={cx("dot", row)} /><RowIcon />{row === "buildings" ? "Buildings" : label}
            </span>,
            <span key={`${row}-n`} className={cx("cv", "asset")}>{compact(v[row].asset)}</span>,
            <span key={`${row}-p`} className={cx("cv", "pct")}>
              {Math.round(share(v[row].asset))}% <span className={cx("vs-sep")}>/</span> {vs(v[row].asset, w[row].asset)}
            </span>,
          ])}
          <span className={cx("cv-sep")} />
          <span className={cx("cv-r", "sum")}><SigmaIcon />Assets</span>
          <span className={cx("cv", "sum", "asset")}>{compact(asset)}</span>
          <span className={cx("cv", "pct", "sum")}><span className={cx("vs-sep")}>/</span> {vs(asset, assetOf(w))}</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/** The units' asset, for the Army / Navy stats cards; the lead over the opponent shows for the one who has more. */
export function AssetValue({ pi, naval }: { pi: number; naval: boolean }) {
  const { game, layouts, t } = useMoment();
  const [asset, theirs] = [pi, 1 - pi].map((i) => valueAt(forceLedger(layouts[i], naval), game.players[i], t).units.asset);
  const lead = asset > theirs ? ratio(asset, theirs) : "";
  return (
    <div className={cx("stat-asset", asset === 0 && "zero")}
      title={`Asset: value of the living units\n${Math.round(asset).toLocaleString("en")} vs the opponent's ${Math.round(theirs).toLocaleString("en")}`}>
      <PackageIcon />{compact(asset)}{lead && <span className={cx("vs", "up")}>{lead}</span>}
    </div>
  );
}

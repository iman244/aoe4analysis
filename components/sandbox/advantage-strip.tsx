"use client";
/* eslint-disable @next/next/no-img-element -- small remote game icons */

import type { ReactNode } from "react";
import { ChevronDownIcon, PackageIcon, ShipIcon, SwordsIcon, WheatIcon } from "lucide-react";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { assetAt, assetGroups } from "@/lib/sandbox/ledger";
import type { PlayerLayout } from "@/lib/sandbox/placement";
import { AGE, ROMAN, STATS, TRADERS, ageAt, aliveAt, compact, fmt, ratio, relicsAt } from "@/lib/sandbox/rules";
import type { Building, Item, Player, Tech } from "@/lib/sandbox/types";
import { RelicIcon, StatIcon, cx, useMoment, type Moment } from "./moment";
import { Fold, useSections } from "./sections";

// how many of each kind of building or unit are alive, keyed so both civs compare like for like
// (the Monastery and the Mosque are both "religious", every land trader is a "trader")
type Kind = { alive: number; icon: string; name: string };
type Kinds = Map<string, Kind>;
const add = (m: Kinds, key: string, it: Item | Building, alive: number, name = it.name) => {
  const k = m.get(key);
  if (k) k.alive += alive;
  else m.set(key, { alive, icon: it.icon, name });
};

function kindsAt(p: Player, L: PlayerLayout, t: number) {
  const ecoInfra: Kinds = new Map(), milInfra: Kinds = new Map(), ecoUnits: Kinds = new Map();
  for (const c of L.ecoCards) {
    add(ecoInfra, c.key, c.head, aliveAt(c.head, t));
    for (const { item } of c.units) add(ecoUnits, TRADERS.includes(item.key) ? "trader" : item.key, item, aliveAt(item, t));
  }
  for (const it of L.ecoRest) add(ecoInfra, it.baseId ?? it.key, it, aliveAt(it, t));
  for (const c of [...L.army, ...L.navy]) add(milInfra, c.card.religious ? "religious" : c.card.key, c.head, aliveAt(c.head, t));
  add(milInfra, "blacksmith", p.blacksmith, aliveAt(p.blacksmith, t), "Blacksmith");
  for (const it of L.milBuildings) add(milInfra, it.baseId ?? it.key, it, aliveAt(it, t));
  // defenses compare per slot (an outpost against the Rus wooden fortress), gates left out
  for (const f of L.forts) for (const { entry } of f.entries) add(milInfra, f.slot.key, entry, aliveAt(entry, t), f.slot.label);
  return { ecoInfra, milInfra, ecoUnits };
}

/** kinds this player has more of right now, with the difference */
const ahead = (mine: Kinds, theirs: Kinds) => [...mine].flatMap(([key, k]) => {
  const other = theirs.get(key)?.alive ?? 0;
  return k.alive > other ? [{ key, ...k, diff: k.alive - other, other }] : [];
});

/** Everything one player leads in at the moment, grouped the way the strip shows it. */
function advantages(m: Moment, pi: number) {
  const { game, layouts, t, owned, totals, navyTotals } = m;
  const p = game.players[pi], them = game.players[1 - pi];
  const age = { mine: ageAt(p, t), theirs: ageAt(them, t) };
  const relics = { mine: relicsAt(p, t), theirs: relicsAt(them, t) };
  // techs this player has that the opponent doesn't, in research order (age-up wings don't count)
  const techs = p.techGroups.flatMap((g) => g.techs.map((x) => ({ ...x, building: g.label })))
    .filter((x) => x.t !== null && x.t <= t && !owned[1 - pi].has(x.id) && !x.landmark)
    .sort((a, b) => a.t! - b.t!);
  const mine = kindsAt(p, layouts[pi], t), theirs = kindsAt(them, layouts[1 - pi], t);
  const stats = (tot: typeof totals) => STATS.filter(([k]) => tot[pi][k] > tot[1 - pi][k])
    .map(([k, name]) => ({ k, name, mine: tot[pi][k], theirs: tot[1 - pi][k] }));
  // asset value per group for both players, shown beside the group and column titles
  const [myAssets, theirAssets] = [pi, 1 - pi].map((i) => Object.fromEntries(Object.entries(assetGroups(game.players[i], layouts[i]))
    .map(([k, ledger]) => [k, assetAt(ledger, game.players[i], t)])));
  const pair = (...keys: string[]): Pair =>
    ({ mine: keys.reduce((n, k) => n + myAssets[k], 0), theirs: keys.reduce((n, k) => n + theirAssets[k], 0) });
  const assets = {
    age: pair("age"), ecoTechs: pair("ecoTechs"), milTechs: pair("milTechs"), techs: pair("ecoTechs", "milTechs"),
    ecoInfra: pair("ecoInfra"), milInfra: pair("milInfra"), infra: pair("ecoInfra", "milInfra"),
    ecoUnits: pair("ecoUnits"), milUnits: pair("milUnits"), units: pair("ecoUnits", "milUnits"),
  };
  const out = {
    age, relics, assets,
    ecoTechs: techs.filter((x) => x.kind === "eco"), milTechs: techs.filter((x) => x.kind === "mil"),
    ecoInfra: ahead(mine.ecoInfra, theirs.ecoInfra), milInfra: ahead(mine.milInfra, theirs.milInfra),
    ecoUnits: ahead(mine.ecoUnits, theirs.ecoUnits), army: stats(totals), navy: stats(navyTotals),
  };
  const counts = {
    age: Number(age.mine > age.theirs) + Number(relics.mine > relics.theirs),
    techs: out.ecoTechs.length + out.milTechs.length,
    infra: out.ecoInfra.length + out.milInfra.length,
    units: out.ecoUnits.length + out.army.length + out.navy.length,
  };
  return { ...out, counts, total: counts.age + counts.techs + counts.infra + counts.units };
}

const None = () => <span className={cx("none")}>None</span>;

type Pair = { mine: number; theirs: number };

/** Asset lead beside a title, only for the player who has more: how much more (in the text colour)
 *  and by what share (green). */
function AssetTag({ v, what }: { v: Pair; what: string }) {
  if (v.mine <= v.theirs) return null;
  const pct = ratio(v.mine, v.theirs);
  return (
    <span className={cx("adv-asset")}
      title={`Asset value of ${what}: ${Math.round(v.mine).toLocaleString("en")} vs ${Math.round(v.theirs).toLocaleString("en")}`}>
      <PackageIcon />+{compact(v.mine - v.theirs)}{pct && <i>{pct}</i>}
    </span>
  );
}

/** One group of the strip: its title with how many leads it holds, then its rows. */
function Group({ title, count, asset, what, children }:
  { title: string; count: number; asset: Pair; what: string; children: ReactNode }) {
  return (
    <div className={cx("adv-g")}>
      <div className={cx("adv-gt")}>
        <span>{title}</span><AssetTag v={asset} what={what} /><b className={cx(count === 0 && "zero")}>{count}</b>
      </div>
      {children}
    </div>
  );
}

/** Economy on the left, Military on the right, the same in every group, so each side reads as one column. */
function Split({ eco, mil, ecoAsset, milAsset, what }:
  { eco: ReactNode; mil: ReactNode; ecoAsset: Pair; milAsset: Pair; what: string }) {
  return (
    <div className={cx("adv-split")}>
      <div className={cx("adv-side", "eco")}>
        <div className={cx("adv-sl")}><WheatIcon />Economy<AssetTag v={ecoAsset} what={`economy ${what}`} /></div>
        <div className={cx("chips")}>{eco}</div>
      </div>
      <div className={cx("adv-side", "mil")}>
        <div className={cx("adv-sl")}><SwordsIcon />Military<AssetTag v={milAsset} what={`military ${what}`} /></div>
        <div className={cx("chips")}>{mil}</div>
      </div>
    </div>
  );
}

function TechIcons({ list }: { list: (Tech & { building: string })[] }) {
  const { t } = useMoment();
  if (!list.length) return <None />;
  return list.map((x) => (
    <div key={x.id} className={cx("ic", "tech", "ahead", x.t! > t - 20 && "fresh")}
      title={`${x.name} (${x.building})\nResearched at ${fmt(x.t!)}`}>
      <img src={x.icon} alt={x.name} />
    </div>
  ));
}

function KindChips({ list, what }: { list: ReturnType<typeof ahead>; what: string }) {
  if (!list.length) return <None />;
  return list.map((x) => (
    <span key={x.key} className={cx("chip", "unit")} title={`${x.name}: ${x.alive} vs ${x.other} ${what}`}>
      <img src={x.icon} alt={x.name} /><b>+{x.diff}</b>
    </span>
  ));
}

function StatChips({ list, icon }: { list: { k: string; name: string; mine: number; theirs: number }[]; icon: ReactNode }) {
  if (!list.length) return null;
  return (
    <>
      <span className={cx("adv-sub")}>{icon}</span>
      {list.map(({ k, name, mine, theirs }) => {
        const r = ratio(mine, theirs);
        return (
          <span key={k} className={cx("chip")} title={`${name}: ${compact(mine)} vs ${compact(theirs)}`}>
            <StatIcon k={k} />{r && <b>{r}</b>}
          </span>
        );
      })}
    </>
  );
}

/** Top strip: for each player, everything they lead in right now (age and relics, upgrades,
 *  infrastructure, units; economy and military apart), with a total. Folded, it keeps the header line. */
export function AdvantageStrip() {
  const m = useMoment();
  const { closed, toggle } = useSections();
  const open = !closed.has("advantage");
  return (
    <section className={cx("adv")} data-section="advantage">
      {m.game.players.map((p, pi) => {
        const a = advantages(m, pi);
        const ageLead = a.age.mine > a.age.theirs, relicLead = a.relics.mine > a.relics.theirs;
        return (
          <Collapsible key={pi} className={cx("adv-p", `p${pi + 1}`)} open={open} onOpenChange={() => toggle("advantage")}>
            <CollapsibleTrigger className={cx("adv-h")}>
              <ChevronDownIcon className={cx("chev")} />
              <span className={cx("n")}>{p.name}</span>
              <span className={cx("r", p.result === "win" ? "win" : "loss")}>{p.result.toUpperCase()}</span>
              <span className={cx("l")}>Advantage</span>
              <span className={cx("k")}>{a.total}</span>
            </CollapsibleTrigger>
            <Fold show={open}>
              <Group title="Age & relics" count={a.counts.age} asset={a.assets.age} what="landmarks and age-ups">
                <div className={cx("chips")}>
                  {ageLead && (
                    <span className={cx("chip")} title={`${AGE[a.age.mine]} Age vs ${AGE[a.age.theirs]} Age`}>
                      <span className={cx("age")}>{ROMAN[a.age.mine]}</span><b>vs {ROMAN[a.age.theirs]}</b>
                    </span>
                  )}
                  {relicLead && (
                    <span className={cx("chip")} title={`Relics stored: ${a.relics.mine} vs ${a.relics.theirs}`}>
                      <RelicIcon /><b>+{a.relics.mine - a.relics.theirs}</b>
                    </span>
                  )}
                  {!ageLead && !relicLead && <None />}
                </div>
              </Group>
              <Group title="Upgrades" count={a.counts.techs} asset={a.assets.techs} what="upgrades">
                <Split ecoAsset={a.assets.ecoTechs} milAsset={a.assets.milTechs} what="upgrades"
                  eco={<TechIcons list={a.ecoTechs} />} mil={<TechIcons list={a.milTechs} />} />
              </Group>
              <Group title="Infrastructure" count={a.counts.infra} asset={a.assets.infra} what="buildings">
                <Split ecoAsset={a.assets.ecoInfra} milAsset={a.assets.milInfra} what="buildings"
                  eco={<KindChips list={a.ecoInfra} what="standing" />} mil={<KindChips list={a.milInfra} what="standing" />} />
              </Group>
              <Group title="Units" count={a.counts.units} asset={a.assets.units} what="units">
                <Split ecoAsset={a.assets.ecoUnits} milAsset={a.assets.milUnits} what="units"
                  eco={<KindChips list={a.ecoUnits} what="alive" />}
                  mil={
                    <>
                      <StatChips list={a.army} icon={<SwordsIcon />} />
                      <StatChips list={a.navy} icon={<ShipIcon />} />
                      {!a.army.length && !a.navy.length && <None />}
                    </>
                  } />
              </Group>
            </Fold>
          </Collapsible>
        );
      })}
    </section>
  );
}

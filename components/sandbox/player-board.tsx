"use client";
/* eslint-disable @next/next/no-img-element -- small remote game icons */

import type { ProdCard } from "@/lib/sandbox/placement";
import { ROMAN, countAt, fmt, relicsAt } from "@/lib/sandbox/rules";
import type { Tech, TechGroup } from "@/lib/sandbox/types";
import { StatIcon, cx, useMoment } from "./moment";
import { BlacksmithCard, DefenseColumn, StatCard } from "./side-cards";
import { PlacedTile, Tile, VillagerTile } from "./tiles";

/** Stored relics under the Monastery / Mosque icon, green when ahead. */
function Relics({ pi }: { pi: number }) {
  const { game, t } = useMoment();
  const n = relicsAt(game.players[pi], t), theirs = relicsAt(game.players[1 - pi], t);
  return (
    <div className={cx("relics", n === 0 && "none", n > theirs && "ahead")}
      title={`Relics stored: ${n}` + (n > theirs ? `\nOpponent has ${theirs}` : "")}>
      <StatIcon k="relic" /><b>{n}</b>
    </div>
  );
}

/** One production building: its icon on top, the units it trains underneath. */
function ProductionCard({ card, pi }: { card: ProdCard; pi: number }) {
  return (
    <div className={cx("pcard")}>
      <PlacedTile it={card.head} ups={card.headUps} pi={pi} extra={["phead"]} />
      {card.card.religious && <Relics pi={pi} />}
      <div className={cx("icons")}>
        {card.units.map((u) => <PlacedTile key={u.item.key} it={u.item} ups={u.ups} pi={pi} />)}
      </div>
    </div>
  );
}

const LINE_ORDER = ["Melee Damage", "Melee Armor", "Ranged Damage", "Ranged Armor"];

function TechTile({ tech, pi }: { tech: Tech; pi: number }) {
  const { t, owned } = useMoment();
  const never = tech.t === null, has = !never && tech.t! <= t;
  const ahead = has && !owned[1 - pi].has(tech.id);
  return (
    <div className={cx("ic", "tech", never && "never", !never && !has && "future", has && tech.t! > t - 20 && "fresh", ahead && "ahead")}
      title={`${tech.name} (Age ${ROMAN[tech.age]})\n${never ? "Not researched" : `Researched at ${fmt(tech.t!)}`}`
        + (ahead ? "\nOpponent doesn't have this" : "")}>
      <img src={tech.icon} alt={tech.name} loading="lazy" />
    </div>
  );
}

/** A building's leftover techs; upgrade lines as rows (ages as columns) when it has any. */
function TechBox({ g, pi }: { g: TechGroup; pi: number }) {
  const { t } = useMoment();
  const done = countAt(g.techs.filter((x) => x.t !== null).map((x) => x.t!), t);
  const lines = LINE_ORDER.filter((l) => g.techs.some((x) => x.line === l));
  const rest = g.techs.filter((x) => !x.line);
  return (
    <div className={cx("tg")}>
      <div className={cx("tg-h")}>
        {g.icon && <img src={g.icon} alt="" />}<span>{g.label}</span><span className={cx("k")}>{done}/{g.techs.length}</span>
      </div>
      {lines.length ? (
        <div className={cx("ladder")}>
          {lines.flatMap((l) => [1, 2, 3].map((tier) => {
            const tech = g.techs.find((x) => x.line === l && x.tier === tier);
            return <div key={`${l}${tier}`} className={cx("cell")}>{tech && <TechTile tech={tech} pi={pi} />}</div>;
          }))}
          {rest.length > 0 && <div className={cx("sep")} />}
          {rest.length > 0 && <div className={cx("other")}>{rest.map((x) => <TechTile key={x.id} tech={x} pi={pi} />)}</div>}
        </div>
      ) : (
        <div className={cx("icons")}>{g.techs.map((x) => <TechTile key={x.id} tech={x} pi={pi} />)}</div>
      )}
    </div>
  );
}

/** One player's card: landmarks and economy with Defense beside them, then Army and Navy rows with their
 *  stats beside them, then the techs not shown anywhere else. */
export function PlayerBoard({ pi }: { pi: number }) {
  const { game, layouts } = useMoment();
  const p = game.players[pi], L = layouts[pi];
  return (
    <section className={cx("player", `p${pi + 1}`)}>
      <div className={cx("area-top")}>
        <div className={cx("ph")}><span className={cx("n")}>{p.name} · {p.civ}</span></div>
        {L.landmarks.length > 0 && (
          <div className={cx("group")}>
            <div className={cx("gt")}>Landmarks &amp; ages</div>
            <div className={cx("icons")}>
              {L.landmarks.map((x) => <PlacedTile key={x.item.key} it={x.item} ups={x.ups} pi={pi} extra={["landmark"]} />)}
            </div>
          </div>
        )}
        <div className={cx("group")}>
          <div className={cx("gt")}>Economy infrastructure</div>
          {/* like the army: Town Center card holds villagers and scouts, Market card holds the trader */}
          <div className={cx("pcards", "eco")}>
            {L.ecoCards.map((c) => (
              <div key={c.key} className={cx("pcard")}>
                <PlacedTile it={c.head} ups={c.headUps} pi={pi} extra={["phead"]} />
                <div className={cx("icons")}>
                  {c.units.map((u) => u.item.key === "villager"
                    ? <VillagerTile key={u.item.key} it={u.item} slots={L.villagerSlots} pi={pi} />
                    : <PlacedTile key={u.item.key} it={u.item} ups={u.ups} pi={pi} />)}
                </div>
              </div>
            ))}
            {/* the rest (dropoffs, houses, farms) stay as plain tiles beside the cards */}
            <div className={cx("icons")}>{L.ecoRest.map((it) => <Tile key={it.key} it={it} />)}</div>
          </div>
        </div>
        {L.milBuildings.length > 0 && (
          <div className={cx("group")}>
            <div className={cx("gt")}>Military buildings</div>
            <div className={cx("icons")}>{L.milBuildings.map((it) => <Tile key={it.key} it={it} />)}</div>
          </div>
        )}
      </div>
      <DefenseColumn pi={pi} />
      <div className={cx("group", "area-army")}>
        <div className={cx("gt")}>Army</div>
        {/* Blacksmith gets its own column; production cards wrap beside it */}
        <div className={cx("armybody")}>
          <BlacksmithCard pi={pi} />
          <div className={cx("pcards")}>{L.army.map((c) => <ProductionCard key={c.card.key} card={c} pi={pi} />)}</div>
        </div>
      </div>
      <StatCard pi={pi} naval={false} />
      <div className={cx("group", "area-navy")}>
        <div className={cx("gt")}>Navy</div>
        <div className={cx("pcards")}>{L.navy.map((c) => <ProductionCard key={c.card.key} card={c} pi={pi} />)}</div>
      </div>
      <StatCard pi={pi} naval />
      <div className={cx("group", "area-tech")}>
        <div className={cx("gt")}>Technologies · by building</div>
        <div className={cx("techs")}>{L.techGroups.map((g) => <TechBox key={g.key} g={g} pi={pi} />)}</div>
      </div>
    </section>
  );
}

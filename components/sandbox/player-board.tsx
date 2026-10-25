"use client";
/* eslint-disable @next/next/no-img-element -- small remote game icons */

import { ecoLedger, prodLedger } from "@/lib/sandbox/ledger";
import type { ProdCard } from "@/lib/sandbox/placement";
import { ROMAN, compact, countAt, fmt, relicsAt, resourcesAt } from "@/lib/sandbox/rules";
import type { Tech, TechGroup } from "@/lib/sandbox/types";
import { RelicIcon, cx, useMoment } from "./moment";
import { CardValue } from "./card-value";
import { Section } from "./sections";
import { BlacksmithCard, DefenseColumn, StatCard } from "./side-cards";
import {
  ArmySummary, BuildingsSummary, EconomySummary, LandmarksSummary, ReligionSummary, TechSummary,
} from "./summaries";
import { PlacedTile, QueueBar, Tile, VillagerTile, queueClass, queueNote, useQueue } from "./tiles";

/** Stored relics in the corner of the Monastery / Mosque card, green when ahead. */
function Relics({ pi }: { pi: number }) {
  const { game, t } = useMoment();
  const n = relicsAt(game.players[pi], t), theirs = relicsAt(game.players[1 - pi], t);
  return (
    <div className={cx("relics", n === 0 && "none", n > theirs && "ahead")}
      title={`Relics stored: ${n}` + (n > theirs ? `\nOpponent has ${theirs}` : "")}>
      <RelicIcon /><b>{n}</b>
    </div>
  );
}

const RESOURCE_NAME: Record<string, string> = { food: "Food", wood: "Wood", gold: "Gold", stone: "Stone", oliveoil: "Olive oil" };

/** Each resource beside the age: what's been gathered so far (small) over what's in the bank now (big). */
function Resources({ pi }: { pi: number }) {
  const { game, t } = useMoment();
  const r = resourcesAt(game.players[pi], t);
  if (!r.kinds.length) return null;
  return (
    <div className={cx("res")}>
      {r.kinds.map((k) => (
        <div key={k.key} className={cx("res-k")}
          title={`${RESOURCE_NAME[k.key] ?? k.key}: ${k.stock.toLocaleString("en")} in the bank, `
            + `${k.gathered.toLocaleString("en")} gathered so far\n(as of ${fmt(r.at)}; the game records every 20 s)`}>
          <img src={`/resources/${k.key}.png`} alt={RESOURCE_NAME[k.key] ?? k.key} />
          <div className={cx("res-n")}><span>{compact(k.gathered)}</span><b>{compact(k.stock)}</b></div>
        </div>
      ))}
    </div>
  );
}

/** One production building: its icon on top, the units it trains underneath, its resource value at the bottom. */
function ProductionCard({ card, pi }: { card: ProdCard; pi: number }) {
  return (
    <div className={cx("pcard")}>
      <PlacedTile it={card.head} ups={card.headUps} pi={pi} extra={["phead"]} />
      {card.card.religious && <Relics pi={pi} />}
      <div className={cx("icons")}>
        {card.units.map((u) => <PlacedTile key={u.item.key} it={u.item} ups={u.ups} pi={pi} />)}
      </div>
      <CardValue pi={pi} ledger={prodLedger(card)} />
    </div>
  );
}

const LINE_ORDER = ["Melee Damage", "Melee Armor", "Ranged Damage", "Ranged Armor"];

function TechTile({ tech, pi }: { tech: Tech; pi: number }) {
  const { t, owned } = useMoment();
  const never = tech.t === null, has = !never && tech.t! <= t;
  const ahead = has && !owned[1 - pi].has(tech.id);
  const q = useQueue(pi, [tech.id]);
  return (
    <div className={cx("ic", "tech", never && "never", !never && !has && "future", has && tech.t! > t - 20 && "fresh", ahead && "ahead",
      queueClass(q))}
      title={`${tech.name} (Age ${ROMAN[tech.age]})\n${never ? "Not researched" : `Researched at ${fmt(tech.t!)}`}`
        + (ahead ? "\nOpponent doesn't have this" : "") + queueNote(q, "Researching")}>
      <img src={tech.icon} alt={tech.name} loading="lazy" />
      <QueueBar q={q} />
    </div>
  );
}

/** A building's leftover techs; upgrade lines as rows (ages as columns) when it has any. */
function TechBox({ g, pi }: { g: TechGroup; pi: number }) {
  const { game, t } = useMoment();
  const done = countAt(g.techs.filter((x) => x.t !== null).map((x) => x.t!), t);
  const lines = LINE_ORDER.filter((l) => g.techs.some((x) => x.line === l));
  const rest = g.techs.filter((x) => !x.line);
  // techs unlocked by age-ups (House of Wisdom wings): one column per age-up, its techs down by age
  const unlockers = [...new Map(g.techs.filter((x) => x.unlockedBy).map((x) => [x.unlockedBy!.id, x.unlockedBy!])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
  if (unlockers.length) {
    // every tech a wing unlocks, even ones drawn elsewhere too (Agriculture by the villager, Medical Centers on the keep)
    const ids = new Set(unlockers.map((u) => u.id));
    const wingTechs = game.players[pi].techGroups.flatMap((x) => x.techs).filter((x) => x.unlockedBy && ids.has(x.unlockedBy.id));
    const ages = [...new Set(wingTechs.map((x) => x.unlockedBy!.age))].sort();
    const loose = g.techs.filter((x) => !x.unlockedBy);
    const shown = [...wingTechs, ...loose];
    const shownDone = countAt(shown.filter((x) => x.t !== null).map((x) => x.t!), t);
    return (
      <div className={cx("tg")}>
        <div className={cx("tg-h")}>
          {g.icon && <img src={g.icon} alt="" />}<span>{g.label}</span><span className={cx("k")}>{shownDone}/{shown.length}</span>
        </div>
        <div className={cx("wings")} style={{ gridTemplateColumns: `repeat(${unlockers.length}, 38px)` }}>
          {unlockers.map((u) => (
            <div key={u.id} className={cx("wing-h")} title={`${u.name}: makes the techs under it available`}>
              <img src={u.icon} alt={u.name} />
            </div>
          ))}
          {ages.flatMap((age) => unlockers.map((u) => {
            const tech = wingTechs.find((x) => x.unlockedBy!.id === u.id && x.unlockedBy!.age === age);
            return <div key={`${u.id}${age}`}>{tech && <TechTile tech={tech} pi={pi} />}</div>;
          }))}
          {loose.length > 0 && <div className={cx("sep")} />}
          {loose.length > 0 && <div className={cx("other")}>{loose.map((x) => <TechTile key={x.id} tech={x} pi={pi} />)}</div>}
        </div>
      </div>
    );
  }
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

/** One player's card: landmarks, economy, the techs not shown anywhere else and the religious building
 *  with Defense beside them, then Army and Navy rows with their stats beside them. Each section folds
 *  to a summary line. */
export function PlayerBoard({ pi }: { pi: number }) {
  const { game, layouts } = useMoment();
  const p = game.players[pi], L = layouts[pi];
  // the Monastery / Mosque card sits up top under the techs, not with the army
  const religious = L.army.find((c) => c.card.religious);
  return (
    <section className={cx("player", `p${pi + 1}`)}>
      <div className={cx("area-top")}>
        <div className={cx("ph")}><span className={cx("n")}>{p.name} · {p.civ}</span><Resources pi={pi} /></div>
        {L.landmarks.length > 0 && (
          <Section id="landmarks" title={<>Landmarks &amp; ages</>} summary={<LandmarksSummary pi={pi} />}>
            <div className={cx("icons")}>
              {L.landmarks.map((x) => <PlacedTile key={x.item.key} it={x.item} ups={x.ups} pi={pi} extra={["landmark"]} />)}
            </div>
          </Section>
        )}
        <Section id="economy" title="Economy infrastructure" summary={<EconomySummary pi={pi} />}>
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
                <CardValue pi={pi} ledger={ecoLedger(c, L)} />
              </div>
            ))}
          </div>
          {/* the rest (dropoffs, houses, farms) as plain tiles on their own row under the cards */}
          <div className={cx("icons", "eco-rest")}>{L.ecoRest.map((it) => <Tile key={it.key} it={it} />)}</div>
        </Section>
        {L.techGroups.length > 0 && (
          <Section id="tech" title="Technologies · by building" summary={<TechSummary pi={pi} />}>
            <div className={cx("techs")}>{L.techGroups.map((g) => <TechBox key={g.key} g={g} pi={pi} />)}</div>
          </Section>
        )}
        {religious && (
          <Section id="religion" title="Religion" summary={<ReligionSummary pi={pi} />}>
            <div className={cx("pcards")}><ProductionCard card={religious} pi={pi} /></div>
          </Section>
        )}
        {L.milBuildings.length > 0 && (
          <Section id="mil-buildings" title="Military buildings" summary={<BuildingsSummary pi={pi} items={L.milBuildings} />}>
            <div className={cx("icons")}>{L.milBuildings.map((it) => <Tile key={it.key} it={it} />)}</div>
          </Section>
        )}
      </div>
      <DefenseColumn pi={pi} />
      <Section id="army" title="Army" className="area-army" summary={<ArmySummary pi={pi} naval={false} />}>
        {/* Blacksmith gets its own column; production cards wrap beside it */}
        <div className={cx("armybody")}>
          <BlacksmithCard pi={pi} />
          <div className={cx("pcards")}>
            {L.army.filter((c) => !c.card.religious).map((c) => <ProductionCard key={c.card.key} card={c} pi={pi} />)}
          </div>
        </div>
      </Section>
      <StatCard pi={pi} naval={false} />
      <Section id="navy" title="Navy" className="area-navy" summary={<ArmySummary pi={pi} naval />}>
        <div className={cx("pcards")}>{L.navy.map((c) => <ProductionCard key={c.card.key} card={c} pi={pi} />)}</div>
      </Section>
      <StatCard pi={pi} naval />
    </section>
  );
}

**Step:** [1. Empathize](Step-1-Empathize) · **Status:** `Done` · **Owner:** iman244 · **Last updated:** 2026-10-22

> **Goal:** Learn business goals, constraints, success criteria and what the team already knows or assumes.

## Inputs

Check each input is done and linked before you start.

- [x] **[#41 Benchmark report](41-Benchmark-report)**
  - **Why it's needed:** The next round of stakeholder talks needs proof of what the last cycle achieved.
  - **How it's used:** Shows stakeholders the impact and ROI for the next cycle.
  - **Reference:** [Calculating ROI for Design Projects](https://www.nngroup.com/articles/calculating-roi-design-projects/) (NN/g states this)
  - **This cycle:** Not applicable. This is the first cycle, so there is no benchmark yet.

## Template

NN/g template: **Partial**

- [Stakeholder Interview Guide (HTML)](https://www.nngroup.com/articles/stakeholder-interviews/)

## Content

### Stakeholders interviewed

| Name | Role | Date | Notes link |
|---|---|---|---|
| iman244 | Product owner; uses aoe4world every day | 2026-10-22 | Claude Code session, 2026-10-22 (notes below) |

### Questions asked

| Question | Answer (summary) |
|---|---|
| What do you want first? | Better charts. Start with the basic pages needed, then move on to deeper analysis of a player's games. |
| What is the product idea? | Players build their own charts and dashboards, and help others see the data the same way. |
| "See others the same way": share, or reuse on other players? | Both. |
| What is a dashboard for? | Not only players. The objects are **players, civilizations, maps and games**. A dashboard can show one item or a group of them. Start with a **single game**. Anyone can open a dashboard someone else built and explore any game with it. |
| What would you want to see to understand a lost match? | Wrong question. The app does not answer questions for players. It is a **platform**: it gives people the tools to build the dashboards they want, so they see a game through their own lens or explore its data. |
| Have you used a chart or dashboard tool you liked or hated? | No. (So #7 Competitive analysis should look at dashboard builders as well as game-stats sites.) |
| What would make the app a success a few months after launch? | People using it. |
| When you picture someone using the app, what are they doing? | Building a dashboard to share their way of thinking about a game. |
| Who already shares their way of thinking about games? | Beasty (AoE4 pro and content creator); iman244; iman244's friends, who talk over each game afterwards: what went wrong and what they missed. |
| Walk me through the last time your group talked a game over. | They only have the in-game stats screen. Whoever knows aoe4world looks the game up there for more graphs. They discuss army composition, trade timing, map control, losing armies in 2v1 fights, timings, and whether upgrades were done before a battle. (Details below.) |
| Where does aoe4world let you down? | No map control. It doesn't let you make the extra charts you think are useful. Example: **army DPS per player over time**, calculated from the units each player had, the upgrades they researched, and aoe4world's free unit and upgrade data. |
| What would make you wince if the app got it wrong, even if it worked? | It being hard to use. Building dashboards and charts, and finding the data to build them from, must be **easy without instructions**. |
| Playback of the whole interview: what's wrong or missing? | Correct overall. The site is **English only**. **Anyone** can build dashboards, not only creators or pros. |
| Is there a target date for the first version? | No date. |

### Business goals heard

- Build a **dashboard builder** for Age of Empires IV data, not a fixed set of analysis pages.
- Give builders different charts and other ways to show data simply, so they can see a game through their own lens.
- Let anyone browse dashboards others have built and open any game with them.
- Builders need **calculated measures**, not only raw data. Example: army DPS over time, worked out by combining the game data with [aoe4world/data](https://github.com/aoe4world/data) (unit and upgrade stats).
- The key moment is **building to share**: a dashboard is how a person shows how they think about a game. People browsing are the audience for that.
- Version 1: dashboards for a **single game**. Later: players, civilizations, maps, groups of games, and player game analysis.

### Constraints (budget, time, tech, legal)

- **Data source:** the [aoe4world public API v0](https://aoe4world.com/api): player profile, player games, one game, last game, search, autocomplete.
- **Rich single-game data is not in the public API.** The per-game summary (resources every 20 s, score over time, build order with timestamps, age-ups and landmarks, APM, kills and losses, totals gathered and spent, win reason) comes from aoe4world's game summary endpoint. A server request to it on 2026-10-22 got HTTP 429: *"This endpoint has dynamic content and is not suitable for bots, contact devs."* We need permission from the aoe4world developers, or the data has to load in the user's browser.
- **Game reference data:** [aoe4world/data](https://github.com/aoe4world/data) has unit, building, technology and upgrade stats as hosted JSON (`data.aoe4world.com`). It has no license file; its README says it is "ready for developers to use in any project." We should credit aoe4world. It reflects the **current patch**, while each game has its own `patch`, so measures for older games can be slightly off.
- **Tech:** Next.js 16, React 19, TypeScript, Tailwind CSS 4 ([repo](https://github.com/iman244/aoe4analysis), public).
- **Team and budget:** iman244 with Claude. No budget. No target date (confirmed).
- **Language:** English only.

### How stakeholders define success

- **Failure even if it works:** the builder is hard to use. Making a dashboard, making a chart, and finding the data to use must all be easy without instructions.
- **People using it.** Still to define in [#13 UX success metrics](13-UX-success-metrics): what counts as using it (building dashboards, opening them, sharing them) and how many people.

### What is already known

- The player profile includes, per mode: rating history over time, civilization win rate and pick rate, and previous seasons (checked on player 4635035, 2026-10-22).
- The game list gives map, duration, server, patch, average rating and MMR, and per player: civilization, result, rating and MMR before and after.
- Game data and reference data link up through `pbgid`. Checked 2026-10-22: in game 256853280, `166417` is the Hardened Spearman (8 damage, 1.875 s attack interval) and `166389` is the Longbowman; upgrades `128070` and `171822` are Double Broadax and Specialized Pick.
- `buildOrder` records when units were made and when they died (`destroyed`), so we can count the army a player has at any moment.
- The game summary has enough data for a full single-game dashboard (sample game 256853280, Himeyama, rm_3v3, shared by iman244).

### How iman244's group reviews a game today (self-reported, 2026-10-22)

**Tools:** the in-game stats screen after the match. Whoever knows aoe4world searches for the game there to see more graphs.

**Questions they discuss, and whether the game summary data can answer them:**

| Their question | Data in the game summary | Can answer? |
|---|---|---|
| Was our army composition right? | `buildOrder` units with production times for every player; `unitprod`, `sqprod` | Yes, for both teams over time |
| Did going for trade earlier help us or hold us back? | Trade units in `buildOrder`; `goldPerMin`; `scores.economy` over time | Partly: trade income is not shown apart from other gold |
| Did we control the map well? | No positions or map events | **No** |
| When we got caught 2v1 and lost our armies, what happened? | Drops in `military` score over time; `destroyed` times; total `sqlost` and `sqkill` | Partly: we can see when an army was lost, not where or against whom |
| Were our timings good? | Age-ups (`actions.feudalAge`…), landmarks, when military production started | Yes |
| Did we finish our upgrades before a battle? | Upgrade times in `buildOrder` and `actions`, compared with when the military score drops | Yes, with battles worked out from score drops |

### Assumptions and open questions

- **Corrected:** Claude assumed single-game data was thin. Wrong: the game summary is rich.
- **Corrected:** Claude framed questions around one player's needs. Wrong: the product is a tool for building dashboards, not a set of answers.
- **Assumption (Claude):** saving and sharing dashboards needs user accounts and a database.
- **Open:** How do we get permission to use the game summary data?
- **Partly answered:** The main user is the **builder**, who shares their way of thinking. Browsers are the audience. **Anyone** can build dashboards. Examples named: **content creators and pros** like Beasty, who analyze games for an audience, and **friend groups** who review each game afterwards. These are persona candidates for [#9](09-Personas), not limits on who can build.
- **Research lead:** watch iman244's group talk over a game for [#4 Field study observations](04-Field-study-observations).
- **Open:** What does "people using it" mean in measurable terms?
- **Answered:** The site is English only. No other languages and no right-to-left layout.

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#2 Business goals and constraints](02-Business-goals-and-constraints)**
  - **Why it needs this result:** Without stakeholder input, the goals and constraints are the design team's guesses and won't get buy-in.
  - **How it's used:** Interviews surface the goals, constraints and success measures that get written down here.
- **[#3 User interview recordings and notes](03-User-interview-recordings-and-notes)**
  - **Why it needs this result:** Without it, user interviews repeat what is already known and miss the questions the business needs answered.
  - **How it's used:** Gaps in stakeholder knowledge become the questions you ask users.
- **[#13 UX success metrics](13-UX-success-metrics)**
  - **Why it needs this result:** Without it, UX metrics may measure things leadership doesn't care about, so results won't be acted on.
  - **How it's used:** Stakeholders' definition of success becomes measurable UX metrics.
- **[#20 Prioritized concepts](20-Prioritized-concepts)**
  - **Why it needs this result:** Without it, the team may prioritize concepts that can't be delivered.
  - **How it's used:** Stated constraints rule out concepts that can't be built.

## Definition of done

- [x] All inputs above are done and linked
- [x] Every section under Content is filled in, with evidence links
- [x] Reviewed by at least one other team member (iman244 confirmed the playback, 2026-10-22)
- [x] Status set to `Done` here and in the [tracker](Tracker)
- [x] Owners of the outputs under "Feeds into" are told

## References

- [Stakeholder Interviews 101](https://www.nngroup.com/articles/stakeholder-interviews/)

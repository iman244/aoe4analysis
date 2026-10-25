**Step:** [1. Empathize](Step-1-Empathize) · **Status:** `Done` · **Owner:** iman244 · **Last updated:** 2026-10-22

> **Goal:** One agreed record of goals, constraints and open questions (certainties, suppositions, doubts).

## Inputs

Check each input is done and linked before you start.

- [x] **[#1 Stakeholder interview notes](01-Stakeholder-interview-notes)**
  - **Why it's needed:** The goals record is a summary of what stakeholders said; there is nothing to record without the interviews.
  - **How it's used:** Interviews surface the goals, constraints and success measures that get written down here.
  - **Reference:** [Stakeholder Interviews 101](https://www.nngroup.com/articles/stakeholder-interviews/) (NN/g states this)
- [x] **[#31 Findings report](31-Findings-report)**
  - **Why it's needed:** The goals record should be updated with what research proved or disproved.
  - **How it's used:** Findings answer the doubts in the CSD matrix.
  - **Reference:** [CSD Matrix](https://www.nngroup.com/articles/csd-matrix/)
  - **This cycle:** Not applicable. This is the first cycle, so there are no findings yet.

## Template

NN/g template: **Yes**

- [Stakeholder Mapping Template (Excel)](https://media.nngroup.com/media/articles/attachments/stakeholder-mapping-template.xlsx)
- [CSD Matrix Template (Excel)](https://media.nngroup.com/media/articles/attachments/NN:g_-_CSD_Matrix_-_Excel_Template.xlsx)
- [CSD Matrix Template (Miro)](https://media.nngroup.com/media/articles/attachments/NN:g_-_CSD_Matrix_-_Miro_Template.rtb)

## Content

### Certainties (what we know)

| Statement | Source |
|---|---|
| The product is a platform for **building and sharing dashboards** of AoE4 data. It gives people tools; it does not give them answers. | [#1](01-Stakeholder-interview-notes) |
| Version 1 covers **single-game** dashboards. Players, civilizations, maps and groups of games come later. | [#1](01-Stakeholder-interview-notes) |
| **Anyone** can build a dashboard, and anyone can browse dashboards and open any game through one. | [#1](01-Stakeholder-interview-notes) |
| The site is **English only**. | [#1](01-Stakeholder-interview-notes) |
| There is no budget and no target date. | [#1](01-Stakeholder-interview-notes) |
| The game summary has economy over time (every 20 s), score over time, build order with timestamps, upgrades, age-ups, landmarks, APM, kills and losses, and totals gathered and spent. | Sample game 256853280, shared by iman244 |
| The game summary endpoint refuses server requests (HTTP 429, "not suitable for bots, contact devs"). | Request on 2026-10-22, see [#1](01-Stakeholder-interview-notes) |
| Game data links to [aoe4world/data](https://github.com/aoe4world/data) through `pbgid`, so calculated measures like army DPS are possible. | Check on 2026-10-22, see [#1](01-Stakeholder-interview-notes) |
| The data has no positions, so map control cannot be shown. | Field check of the game summary, see [#1](01-Stakeholder-interview-notes) |

### Suppositions (what we think)

| Statement | Source | How to verify |
|---|---|---|
| Saving and sharing dashboards needs user accounts and a database. | Claude | Look at other options in [#14 Brainstorm](14-Brainstorm-ideas), such as sharing a dashboard as a link with no account. |
| Players other than iman244 want to build dashboards, not only view them. | iman244 | [#3 User interviews](03-User-interview-recordings-and-notes) |
| Builders want calculated measures (such as DPS) as well as raw data. | iman244 | [#3 User interviews](03-User-interview-recordings-and-notes) |
| Friend groups review games together after each match, using the in-game stats and aoe4world. | iman244 (self-reported) | [#4 Field study](04-Field-study-observations): watch a review session |
| The game summary can be loaded in the user's browser instead of by our server. | Claude | Technical test |
| The aoe4world developers would allow us to use the game summary data. | Claude | Contact the aoe4world developers |
| Current-patch unit stats are close enough for older games. | Claude | Compare calculated measures across patches |

### Doubts (what we don't know)

| Question | Research method to answer it |
|---|---|
| What data and charts do builders reach for first? | [#3 User interviews](03-User-interview-recordings-and-notes), [#4 Field study](04-Field-study-observations) |
| What makes building a chart feel easy to a player who has never used a dashboard tool? | [#7 Competitive analysis](07-Competitive-analysis) of dashboard builders, then usability tests ([#25](25-Usability-test-tasks)) |
| How does someone find a dashboard worth opening? | [#3 User interviews](03-User-interview-recordings-and-notes) |
| How does someone get to the game they want to look at (game link, player search, last game)? | [#4 Field study](04-Field-study-observations), [#16 User flows](16-User-flows-and-task-flows) |
| What does "people using it" mean in numbers? | [#13 UX success metrics](13-UX-success-metrics) |

### Business goals, ranked

_Order confirmed by iman244, 2026-10-22._

| # | Goal | Owner |
|---|---|---|
| 1 | Building a dashboard and its charts is easy without instructions, including finding the data to use. | iman244 |
| 2 | Single-game dashboards work on the full game summary data, including calculated measures such as army DPS. | iman244 |
| 3 | Anyone can share a dashboard, and anyone can open any game through someone else's dashboard. | iman244 |
| 4 | People use it (to be turned into numbers in [#13](13-UX-success-metrics)). | iman244 |
| 5 | Later: dashboards for players, civilizations, maps and groups of games. | iman244 |

### Constraints

| Type | Constraint | Impact |
|---|---|---|
| Data access | The game summary endpoint blocks server requests. [aoe4world.com/api](https://aoe4world.com/api) also warns that game summaries are expensive to compute, that bulk scraping "will lead to blocks", and asks people to contact the developers. AoE4World game pages now show a "Click to load summary" check for bots (found in [#7](07-Competitive-analysis)). | Need the aoe4world developers' permission or loading in the browser. Without either, single-game dashboards don't work. |
| Data coverage | No positions or map events. | No map-control charts. |
| Reference data | aoe4world/data covers only the current patch and has no license file. | Older games can be slightly off. Credit aoe4world. |
| Language | English only. | No translation or right-to-left work. |
| Team | iman244 with Claude. | Keep the scope small. |
| Budget and time | No budget, no date. | Prefer free hosting and free services. |
| Tech | Next.js 16, React 19, TypeScript, Tailwind CSS 4. | Built on the existing repo. |
| Identity | Version 1: simple sign-up with any username, plus a Steam ID or Steam name field that the app trusts without checking. Steam sign-in later, when we publish (iman244, 2026-10-23). | Simple to build; who someone is can't be verified yet. |

### Stakeholder map

| Who | Role | Interest | Influence |
|---|---|---|---|
| iman244 | Owner; also a builder | High | Decides everything |
| aoe4world developers | Provide the API, the game summary and aoe4world/data | Medium | **High**: they control access to the core data |
| Builders (anyone; e.g. creators like Beasty, friend groups) | Main users | High | Medium: their use is the measure of success |
| Browsers (the audience for dashboards) | Secondary users | Medium | Low |
| Relic / World's Edge (game publisher) | Owner of the game and its data | Low | Medium: their terms of use apply to game data |

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#3 User interview recordings and notes](03-User-interview-recordings-and-notes)**
  - **Why it needs this result:** Without the doubts list, research has no clear questions and may skip the riskiest assumptions.
  - **How it's used:** Doubts in the CSD matrix become research questions for user interviews.
- **[#7 Competitive analysis](07-Competitive-analysis)**
  - **Why it needs this result:** Without goals, the comparison is unfocused and compares features that don't matter to the business.
  - **How it's used:** Business goals decide which competitors and features to compare.
- **[#12 Problem statement / How Might We](12-Problem-statement-How-Might-We)**
  - **Why it needs this result:** Without it, the team may frame a real user problem the business won't fund.
  - **How it's used:** Goals and constraints set the scope of the problem statement.
- **[#13 UX success metrics](13-UX-success-metrics)**
  - **Why it needs this result:** Without goals, metrics can't be tied to value or ROI.
  - **How it's used:** Business goals are translated into UX metrics to track.
- **[#20 Prioritized concepts](20-Prioritized-concepts)**
  - **Why it needs this result:** Without these criteria, prioritization turns into opinion.
  - **How it's used:** Constraints become criteria in the prioritization matrix.
- **[#34 Design system components](34-Design-system-components)**
  - **Why it needs this result:** Without it, components may be designed that developers can't build or maintain.
  - **How it's used:** Technical constraints shape what the design system can include.

## Definition of done

- [x] All inputs above are done and linked
- [x] Every section under Content is filled in, with evidence links
- [x] Reviewed by at least one other team member (iman244, 2026-10-22)
- [x] Status set to `Done` here and in the [tracker](Tracker)
- [x] Owners of the outputs under "Feeds into" are told

## References

- [CSD Matrix](https://www.nngroup.com/articles/csd-matrix/)
- [Stakeholder Analysis for UX Projects](https://www.nngroup.com/articles/stakeholder-analysis/)

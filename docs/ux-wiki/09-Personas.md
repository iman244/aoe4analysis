**Step:** [2. Define](Step-2-Define) · **Status:** `In progress` (proto-personas) · **Owner:** iman244 · **Last updated:** 2026-10-23

> **Goal:** Give the team shared, data-based archetypes of target users.

## Inputs

Check each input is done and linked before you start.

- [ ] **[#3 User interview recordings and notes](03-User-interview-recordings-and-notes)**
  - **Why it's needed:** Personas must be built from real user goals, behaviors and pain points.
  - **How it's used:** Interview data is used to build personas.
  - **Reference:** [User Interviews 101](https://www.nngroup.com/articles/user-interviews/) (NN/g states this)
- [ ] **[#4 Field study observations](04-Field-study-observations)**
  - **Why it's needed:** Personas need context: environment, tools, interruptions, workarounds.
  - **How it's used:** Contextual inquiry shapes personas.
  - **Reference:** [Contextual Inquiry](https://www.nngroup.com/articles/contextual-inquiry/) (NN/g states this)
- [ ] **[#8 Affinity diagram (themes)](08-Affinity-diagram-themes)**
  - **Why it's needed:** Personas need patterns shared across many users, not single quotes.
  - **How it's used:** Themes become persona traits, goals and pain points.
  - **Reference:** [Affinity Diagramming](https://www.nngroup.com/articles/affinity-diagram/)

## Template

NN/g template: **None**

- NN/g has no free template for this output. Use the sections below.

## Content

> **These are proto-personas: assumptions, not research results yet.** Reviewed and accepted by iman244 on 2026-10-23. They are built from the stakeholder interview ([#1](01-Stakeholder-interview-notes)) and the competitive analysis ([#7](07-Competitive-analysis)), because the inputs above (#3 survey, #4 field study, #8 themes) aren't ready. NN/g treats proto-personas as a valid starting point, as long as they are checked against research ([Proto-personas](https://www.nngroup.com/articles/persona-types/)). Each point is tagged **(heard)** if iman244 said it, **(seen)** if it was found in research, or **(assumption)**. When the survey answers arrive, each point is confirmed, changed or removed.

### Persona: The Squad Reviewer

- **Segment / role:** A player who plays team games with the same friends and talks over each game with them afterwards. Builds dashboards. **(heard)**
- **Goals:**
  - Find out what went wrong and what the team missed. **(heard)**
  - Analyse the game together with data: army composition, trade timing, map control, losing armies in 2v1 fights, timings, upgrades before a battle. It is a shared analysis, not a debate. **(heard)**
  - Show friends their point of view through a dashboard they built. **(heard)**
- **Behaviors:**
  - Plays almost every day; uses aoe4world daily. **(heard: iman244)**
  - Checks the in-game stats screen first. Whoever knows aoe4world looks the game up there for more graphs. **(heard)**
  - Reviews right after the game, together with the team. **(heard)**
  - Talks it over by voice (Discord or in game) while one person shares their screen. **(assumption)**
- **Pain points:**
  - In-game stats are too limited. **(heard)**
  - aoe4world shows a fixed set of charts; you can't make the one you need, such as army DPS over time. **(heard)**
  - Map control can't be checked at all. **(heard)**
  - Has never used a dashboard tool, so anything that feels like analytics software is a barrier. **(heard: no prior tools; assumption: barrier)**
- **Context and environment:** At home on a PC, right after a match, often still in the lobby with friends. Short attention span: the next game is minutes away. **(assumption)**
- **Quote:** "we discussed was that our army composition was correct? did we go for trade sooner was helping us or interrupting us… did we do all our upgrades before a battle" (iman244, [#1](01-Stakeholder-interview-notes))
- **Evidence (links to research):** [#1](01-Stakeholder-interview-notes). Waiting for: [#3 survey](03-User-interview-recordings-and-notes), [#4 field study](04-Field-study-observations).

### Persona: The Analyst Creator

- **Segment / role:** A pro, caster or content creator who breaks games down for an audience (for example Beasty). Builds dashboards to publish and reuse. **(heard: named by iman244)**
- **Goals:**
  - Explain a game to viewers clearly and quickly. **(assumption)**
  - Reuse the same dashboard on many games: their own games, tournament matches, viewer games. **(assumption, based on the "lens" idea in [#1](01-Stakeholder-interview-notes))**
  - Be credited when others use or remix their dashboard. **(assumption, based on Tableau Public's credit pattern in [#7](07-Competitive-analysis))**
- **Behaviors:**
  - Already shares breakdowns through videos and streams. **(heard: Beasty named)**
  - Uses aoe4world game pages and replays. **(assumption)**
  - Shares links in Discord, Reddit and Twitch chat, where a preview card matters. **(seen: AoE4 Game Review's shareable links, [#7](07-Competitive-analysis))**
- **Pain points:**
  - Charts on existing sites are fixed and can't be put together into a story. **(seen: no competitor allows this, [#7](07-Competitive-analysis))**
  - Calculated measures (efficiency, DPS) are paid, hidden in an extension, or missing. **(seen, [#7](07-Competitive-analysis))**
- **Context and environment:** On stream or editing a video, with an audience watching. Needs dashboards that read well on a big screen and in a screenshot. **(assumption)**
- **Quote:** _None yet. Try to reach a creator for a follow-up chat._
- **Evidence (links to research):** [#1](01-Stakeholder-interview-notes), [#7](07-Competitive-analysis). Waiting for: [#3 survey](03-User-interview-recordings-and-notes) (question 11 asks about breakdowns by others).

### Persona: The Lens Borrower

- **Segment / role:** A player who doesn't build, or not yet. Opens dashboards other people made and points them at their own games. The audience for builders. **(heard: "anybody can click to explore a dashboard that somebody had built")**
- **Goals:**
  - Look at their own last game through a dashboard someone they trust built. **(heard)**
  - Understand a game without setting anything up. **(assumption)**
  - Maybe copy and tweak a dashboard later, and so become a builder. **(assumption)**
- **Behaviors:**
  - Finds dashboards through links shared by friends and creators, or by browsing popular ones. **(assumption, based on AoE4 Guides' Trending/Top tabs in [#7](07-Competitive-analysis))**
  - Opens a dashboard, picks their own game, and reads it. **(assumption)**
- **Pain points:**
  - Doesn't know which dashboards are worth opening. **(seen: libraries without a quality signal fill with weak dashboards, Grafana reviews, [#7](07-Competitive-analysis))**
  - Getting from "a dashboard" to "my game" must be one step, or they leave. **(assumption)**
- **Context and environment:** On PC or phone, often clicking a link from Discord, Reddit or Twitch. **(assumption)**
- **Quote:** _None yet._
- **Evidence (links to research):** [#1](01-Stakeholder-interview-notes), [#7](07-Competitive-analysis). Waiting for: [#3 survey](03-User-interview-recordings-and-notes).

### What the survey must confirm

| Assumption | Survey question that checks it |
|---|---|
| Players look back at their games, and often do it together | Q4, Q6, Q7 |
| The in-game stats and aoe4world aren't enough | Q8 |
| Players make or show stats to make a point | Q9, Q10 |
| Breakdowns by others (creators, friends) are valued | Q11 |
| The data players reach for first | Q5, Q12 |

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#10 Empathy maps](10-Empathy-maps)**
  - **Why it needs this result:** Without a persona, the map mixes different users and becomes vague.
  - **How it's used:** An empathy map is made for one user type or persona.
- **[#11 Customer journey map](11-Customer-journey-map)**
  - **Why it needs this result:** Without a persona, the map blends different users' paths and loses accuracy.
  - **How it's used:** Each journey map is for one persona.
- **[#12 Problem statement / How Might We](12-Problem-statement-How-Might-We)**
  - **Why it needs this result:** Without it, the problem statement has no clear user.
  - **How it's used:** The 'user' in a need statement is the persona.
- **[#16 User flows and task flows](16-User-flows-and-task-flows)**
  - **Why it needs this result:** Without it, flows are designed for an average user who doesn't exist.
  - **How it's used:** Flows are designed around persona goals and scenarios.
- **[#20 Prioritized concepts](20-Prioritized-concepts)**
  - **Why it needs this result:** Without it, features are prioritized by internal preference.
  - **How it's used:** Personas are used to prioritize features.
- **[#25 Usability test tasks](25-Usability-test-tasks)**
  - **Why it needs this result:** Without it, the wrong people test the design and the results mislead.
  - **How it's used:** Persona traits become screening criteria for test participants.
- **[#38 Analytics data](38-Analytics-data)**
  - **Why it needs this result:** Without it, averages hide problems specific to one user group.
  - **How it's used:** Personas are used to segment analytics data.

## Definition of done

- [ ] All inputs above are done and linked
- [ ] Every section under Content is filled in, with evidence links
- [ ] Reviewed by at least one other team member
- [ ] Status set to `Done` here and in the [tracker](Tracker)
- [ ] Owners of the outputs under "Feeds into" are told

## References

- [Personas Make Users Memorable](https://www.nngroup.com/articles/persona/)
- [Personas: Study Guide](https://www.nngroup.com/articles/personas-study-guide/)

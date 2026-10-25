**Step:** [3. Ideate](Step-3-Ideate) · **Status:** `Done` · **Owner:** iman244 · **Last updated:** 2026-10-23

> **Goal:** Generate many possible solutions to the How Might We questions.

## Inputs

Check each input is done and linked before you start.

- [x] **[#7 Competitive analysis](07-Competitive-analysis)**
  - **Why it's needed:** Ideation benefits from seeing what has been tried and how it worked.
  - **How it's used:** Competitor solutions seed ideas.
  - **Reference:** [Competitive Usability Evaluations](https://www.nngroup.com/articles/competitive-usability-evaluations/)
- [x] **[#11 Customer journey map](11-Customer-journey-map)**
  - **Why it's needed:** Ideation needs specific opportunities to generate solutions for.
  - **How it's used:** Opportunities seed ideation.
  - **This cycle:** The Squad Reviewer draft is used; it is built on assumptions until the survey answers arrive.
  - **Reference:** [Journey Mapping 101](https://www.nngroup.com/articles/journey-mapping-101/)
- [x] **[#12 Problem statement / How Might We](12-Problem-statement-How-Might-We)**
  - **Why it's needed:** Ideation needs a clear, open prompt to generate useful ideas.
  - **How it's used:** How Might We questions focus ideation on the right problem.
  - **Reference:** [Using “How Might We” Questions](https://www.nngroup.com/articles/how-might-we-questions/) (NN/g states this)

## Template

NN/g template: **Partial**

- [Workshop Brief Template (PDF)](https://media.nngroup.com/media/articles/attachments/Workshop_Planning_Brief_Template_Print.pdf)
- [7 UX Workshop Activities Poster (PDF)](https://media.nngroup.com/media/articles/attachments/NNg_Foundational_Workshop_Activities.pdf)

## Content

### Session (date, participants, duration)

- **Date:** 2026-10-23
- **Participants:** Claude (ideas), seeded by research in [#7](07-Competitive-analysis). iman244 adds ideas and votes.
- **Method:** go wide first: several ideas for each HMW question, including wild ones (marked _Wild_). Narrowing happens in [#20 Prioritized concepts](20-Prioritized-concepts).

### HMW questions used

All 11 from [#12](12-Problem-statement-How-Might-We#how-might-we-questions). The **HMW** column below gives their numbers.

### Ideas

| # | Idea | Author | HMW |
|---|---|---|---|
| 1 | **"My last game" on the home page.** Enter your AoE4 name once; the app remembers you and always shows your latest game. | Claude | 1, 2 |
| 2 | **Paste anything.** One box accepts an aoe4world game link, a game ID or a player name, and works out what you meant. | Claude (seen: players share aoe4world links, #7) | 1, 2 |
| 3 | **Squad space.** A shared page for a group of players; new games from any member appear on their own. | Claude | 1, 10 |
| 4 | **"Open in aoe4analysis" button on aoe4world game pages** (browser extension). _Wild._ | Claude (seen: Replay Extension, #7) | 1 |
| 5 | **Discord bot.** `/review` posts the squad's last game, opened in the squad's dashboard. _Wild._ | Claude | 1, 7, 10 |
| 6 | **Data menu in game words.** Grouped as Economy, Military, Tech and upgrades, Ages and landmarks, and Events, with in-game icons. | Claude (seen: Metabase "Pick data", #7) | 3 |
| 7 | **Search the data.** Type "villagers", "DPS" or "gold" and get matching measures. | Claude | 3 |
| 8 | **Hover preview.** Hovering over a measure shows a tiny chart of it from the current game. | Claude | 3, 4 |
| 9 | **One-line explanations.** Each measure has a plain description, for example "Army DPS: damage per second of all living military units". | Claude | 3, 5 |
| 10 | **Drop to chart.** Drag or click a measure and a chart appears with sensible defaults: line over time, every player, age-ups marked. | Claude (seen: Metabase, PostHog, #7) | 4 |
| 11 | **Starter dashboard.** Every game opens in a ready "Match overview" dashboard you can edit. | Claude (seen: Metabase X-rays, #7) | 4, 6 |
| 12 | **Click a number to chart it.** Click APM, kills or any number in the match header to turn it into a chart. | Claude | 4 |
| 13 | **Chart suggestions.** 3–4 small previews of other ways to show the selected data, drawn from this game. | Claude (seen: Excel, Grafana, Tableau "Show Me", #7) | 4 |
| 14 | **Calculated measures in the same menu**, with a small "calculated" badge and a note on how each is worked out. | Claude | 5 |
| 15 | **Ready-made calculated measures:** army DPS, army HP, army value, villager count, idle Town Center time, unspent resources, upgrade coverage. | Claude (heard: army DPS, #1) | 5 |
| 16 | **Simple formulas in game terms** for advanced users, such as `Food + Wood` or `Military score ÷ Total score`. | Claude (seen: Metabase custom columns, #7) | 5 |
| 17 | **Community-made measures** that can be shared like dashboards. _Wild._ | Claude | 5, 9 |
| 18 | **Question templates.** "Was our army composition right?", "Did trade pay off?", "Were upgrades ready before fights?", "Who won the economy?" Each opens a ready dashboard. | Claude (heard: the squad's questions, #1) | 6 |
| 19 | **Ask in plain words.** "Show army composition at 12 minutes" draws the chart. _Wild; AI costs money._ | Claude | 3, 6 |
| 20 | **Fight finder.** Marks moments where military score dropped sharply; click one to jump all charts to it. | Claude | 6 |
| 21 | **Shared time cursor.** One line across all charts that moves together, so every chart shows the same moment. | Claude | 6 |
| 22 | **Team view.** Switch between each player and team totals. | Claude (seen: team games underserved, #7) | 6 |
| 23 | **One link, full view.** The link holds the dashboard, the game and whose view is shown. | Claude (seen: Grafana variables, OpenDota, #7) | 7 |
| 24 | **Preview card.** Links show an image of the dashboard on that game in Discord and Reddit. | Claude (seen: AoE4 Game Review, #7) | 7 |
| 25 | **Share a moment.** The link also keeps the time cursor (for example 12:30) and highlights one chart. | Claude | 7 |
| 26 | **Notes on charts.** Pin a note at a moment ("we lost the army here"); notes travel with the link. | Claude | 6, 7 |
| 27 | **View first, copy to edit.** Others' dashboards open in view mode; "Make a copy" to change it, with "Based on [author]'s dashboard" shown. | Claude (seen: Tableau Public, #7) | 8 |
| 28 | **Author updates.** Copies can pull in later changes from the original author. _Wild._ | Claude | 8 |
| 29 | **Gallery** with Trending, New and Top, filtered by question, civilization and mode (1v1 or team). | Claude (seen: AoE4 Guides, Grafana, #7) | 9 |
| 30 | **Try it on your game.** Preview any gallery dashboard on your own last game before opening it. | Claude | 9 |
| 31 | **Quality signals:** likes and "used on N games". | Claude (seen: Grafana downloads, #7) | 9 |
| 32 | **Creator profiles** you can follow. | Claude (seen: Tableau Public, #7) | 9 |
| 33 | **Dashboard of the week**, featured on the home page. | Claude (seen: Tableau Viz of the Day, #7) | 9 |
| 34 | **Default dashboard.** Your (or your squad's) favourite dashboard opens on every new game. | Claude | 10 |
| 35 | **New-game alert.** Tells the squad when a member's new game is ready. | Claude | 10 |
| 36 | **Compare with my last game** using the same dashboard. _Later phase: many games._ | Claude | 10 |
| 37 | **Honest gaps.** The data menu lists "Map control: not in the data" with a short reason. | Claude (heard: map control, #1) | 11 |
| 38 | **Request a measure.** A button for asking for a new measure, which also shows what people want. | Claude | 11, 5 |
| 39 | **No account to start.** Build and share without signing in; sign in only to keep dashboards on a profile. | Claude (supposition in #2) | 1, 7 |
| 40 | **Search a player.** In the "Pick a game" dialog, type a name, see that player's recent games, and pick one. Uses aoe4world's player search, autocomplete and games list. _Added 2026-10-23 after iman244 asked how to find other players' games._ | iman244, Claude | 1, 2 |

### Clusters

| Cluster | Ideas | What it is about |
|---|---|---|
| **A. Fast way in** | 1, 2, 3, 4, 5, 39, 40 | From "game ended" to the game in one step |
| **B. Data in game words** | 6, 7, 8, 9, 14, 15, 37, 38 | Finding the right measure without knowing field names, including calculated ones |
| **C. Chart first** | 10, 11, 12, 13, 16 | A chart appears before any choices; adjust afterwards |
| **D. Analysis aids** | 18, 19, 20, 21, 22, 26 | Help with looking into a specific question: templates, fights, shared time cursor, team view, notes |
| **E. Sharing** | 23, 24, 25 | One link, preview cards, sharing a moment |
| **F. Remix and gallery** | 17, 27, 28, 29, 30, 31, 32, 33 | Copying with credit, finding good dashboards, creators |
| **G. Coming back** | 34, 35, 36 | Dashboards that pay off again on the next game |

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#15 Crazy 8s sketches](15-Crazy-8s-sketches)**
  - **Why it needs this result:** Without brainstorming, sketches explore only one or two obvious ideas.
  - **How it's used:** The best ideas are sketched.
- **[#20 Prioritized concepts](20-Prioritized-concepts)**
  - **Why it needs this result:** Without a wide pool, the best idea may never be considered.
  - **How it's used:** Ideas are narrowed down by dot voting.

## Definition of done

- [x] All inputs above are done and linked
- [x] Every section under Content is filled in, with evidence links
- [x] Reviewed by at least one other team member (iman244, 2026-10-23: "the ideas seem good")
- [x] Status set to `Done` here and in the [tracker](Tracker)
- [ ] Owners of the outputs under "Feeds into" are told

## References

- [Ideation for Everyday Design Challenges](https://www.nngroup.com/articles/ux-ideation/)

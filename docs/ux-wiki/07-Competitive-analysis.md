**Step:** [1. Empathize](Step-1-Empathize) · **Status:** `Done` · **Owner:** iman244 (research by Claude) · **Last updated:** 2026-10-22

> **Goal:** Learn expected conventions, competitor strengths and weaknesses, and gaps to exploit.

## Inputs

Check each input is done and linked before you start.

- [x] **[#2 Business goals and constraints](02-Business-goals-and-constraints)**
  - **Why it's needed:** Competitive analysis needs a scope: which market, which competitors, which tasks.
  - **How it's used:** Business goals decide which competitors and features to compare.
  - **Reference:** [Competitive Usability Evaluations](https://www.nngroup.com/articles/competitive-usability-evaluations/)

## Template

NN/g template: **None**

- NN/g has no free template for this output. Use the sections below.

## Content

Desk research by Claude on 2026-10-22, in two tracks: **game-stats sites** and **dashboard builders**. Facts come from each product's own pages and docs (sources at the end). Anything marked _(unverified)_ could not be checked directly.

### Competitors

**Game-stats and match-analysis sites**

| Name | URL | Why chosen |
|---|---|---|
| AoE4World | [aoe4world.com](https://aoe4world.com) | Where AoE4 players already go; our data source |
| AoE4World Replay Extension | [GitHub](https://github.com/spartain-aoe/aoe4world-replay-extension) | Adds the charts players wanted to AoE4World's game page |
| AoE4 Game Review | [aoe4gamereview.com](https://aoe4gamereview.com/faq) | AoE4 match analysis built on AoE4World data |
| AoE4 Guides | [aoe4guides.com](https://aoe4guides.com/about) | AoE4's community library of build orders that people make, browse and vote on |
| AoE2 Insights | [aoe2insights.com](https://www.aoe2insights.com/pro) | Closest match page in the Age of Empires series, with paid calculated measures |
| OpenDota | [opendota.com](https://www.opendota.com/explorer) | Detailed Dota 2 match page, plus a query builder you share by link |
| STRATZ | [stratz.com](https://stratz.com) | Dota 2 match graphs and step-through playback |
| sc2replaystats | [sc2replaystats.com](https://sc2replaystats.com/blog/archives/1897) | StarCraft II; a personal chart dashboard ("New Chart / Edit Layout / Save") |
| Leetify | [leetify.com](https://leetify.com) | CS2 match details where you pick the metric to chart |

**Dashboard and chart builders**

| Name | URL | Why chosen |
|---|---|---|
| Grafana | [grafana.com/dashboards](https://grafana.com/grafana/dashboards/) | Public dashboard library; you import a dashboard and connect it to your own data |
| Tableau Public | [public.tableau.com](https://public.tableau.com/app/discover/viz-of-the-day) | Public gallery, "Make a copy" with credit to the author, chart suggestions |
| Looker Studio | [lookerstudio.google.com/gallery](https://lookerstudio.google.com/gallery) | Template gallery with "Use my own data" |
| Metabase | [metabase.com](https://www.metabase.com/docs/latest/questions/query-builder/editor) | Step-by-step chart builder for people who don't write code; auto-built dashboards |
| Datawrapper | [datawrapper.de](https://www.datawrapper.de/academy/how-to-use-the-river) | 4-step wizard aimed at beginners |
| Flourish | [flourish.studio](https://flourish.studio/product/data-visualization/) | Start from a template, then tell it which column goes where |
| Excel / Google Sheets | [Recommended Charts](https://support.microsoft.com/en-us/excel/create-a-chart-with-recommended-charts) | Automatic chart suggestions |
| PostHog | [posthog.com](https://posthog.com/docs/product-analytics/trends/overview) | Opens with a chart already drawn; dashboard templates |

### Tasks compared

The tasks come from the goals in [#2](02-Business-goals-and-constraints):

1. Find a game
2. See a game's data as charts
3. Build a chart (choose the data and the chart type)
4. Build and arrange a dashboard
5. Share it
6. Browse other people's dashboards
7. Open another game through someone else's dashboard
8. Use calculated measures (such as army DPS)

### Comparison

**Game-stats sites**

| Task | Us (planned) | AoE4World | AoE2 Insights | OpenDota | sc2replaystats | AoE4 Guides | Leetify |
|---|---|---|---|---|---|---|---|
| 1. Find a game | To design | Player → games list | Search or leaderboard | Search, ID, Explorer | Your own uploads | — | Your own matches |
| 2. See a game as charts | Yes | One chart; dropdown switches Army, Workers, Population | Paid tier only | Graphs tab | Mostly tables | — | Pick a metric |
| 3. Build a chart | Yes | No | No | Query builder, but tables only | Yes, but only across many games | No | No |
| 4. Build a dashboard | Yes | No | No | No | Yes (move, resize, save) | No | No |
| 5. Share | Yes | Copy link | Copy link | The link holds the query | _(unverified)_ | Link | Share button |
| 6. Browse others' work | Yes | No | No | Example queries | No | Yes (vote, filter, favourite) | No |
| 7. Apply someone's view to another game | Yes | No | No | Partly (edit the query) | No | No | No |
| 8. Calculated measures | Yes (e.g. army DPS) | Army value; unit DPS in Explorer only | Eco efficiency, idle TC (paid) | Benchmarks | Spending quotient | Villager split | Ratings |

**Dashboard builders**

| Task | Best pattern seen | What hurts beginners |
|---|---|---|
| Start from nothing vs. a template | Start from a template (Flourish, Looker gallery, PostHog). PostHog's empty dashboard suggests starting points. | Grafana opens on an empty panel and a query box. |
| Find the data | Metabase's "Pick data" step. Looker and Datawrapper colour-code fields by type. | Typing metric names from memory (Grafana). |
| Build a chart | Metabase and PostHog draw a chart straight away, then you adjust it. Excel, Grafana and Tableau "Show Me" suggest charts with live previews. | Choosing a chart type before seeing any data (Datawrapper, Looker). |
| Arrange a dashboard | A snapping grid where you drag and resize and other cards move aside (Metabase, Grafana, PostHog). | Free placement with no snapping (Looker). |
| Share | A link plus an embed code, everywhere. Grafana and Metabase keep filter choices in the link. | Only admins can make public links (Metabase). |
| Browse others' work | Tableau Public (Viz of the Day, likes, author profiles). Grafana's library (sort by downloads and rating). | Libraries with no quality signal fill up with weak dashboards (Grafana reviews). |
| Apply someone's dashboard to other data | Grafana: a shared dashboard has empty data slots that you fill in when you import it. Looker: "Use my own data" with automatic field matching. | Charts break when field names don't match (Looker). Imported dashboards silently use the wrong data ([Grafana issue #36040](https://github.com/grafana/grafana/issues/36040)). Datawrapper copies can't change their data. |
| Calculated measures | Spreadsheet-style formulas (Metabase custom columns, Looker calculated fields). | Analyst words like "aggregation", "dimension" and "measure". |

### Conventions users will expect

**From AoE4 and game-stats sites**

- **Getting to a game:** Leaderboard → Player → Games → Match. Players share AoE4World match links, so we should accept a pasted AoE4World link or game ID.
- **Match header:** map, mode (RM 1v1, QM…), duration and date, each side with civilization icons, rating and rating change, and who won. Each player keeps a consistent colour, ideally their in-game colour.
- **Words players know:** Score, Military, Economy, Technology, Society; Army Value; Villagers; Population; Resources Gathered and Spent; APM; K/D; Food, Wood, Gold, Stone (plus Olive Oil and Silver); Feudal, Castle and Imperial ages.
- **Chart types:**
  - line charts over game time, with age-ups marked
  - "lead" charts that show the gap between players, centred on zero
  - stacked areas for army composition
  - build orders as icon timelines
  - side-by-side stats tables
- **Browsing:** tabs for Trending, New and Top; civilization filters; votes and favourites (AoE4 Guides).

**From dashboard builders**

- The data list on the left, the chart in the middle, settings on the right.
- A chart appears with sensible defaults before you set anything.
- A gallery of chart types with the recommended ones marked.
- Dashboards on a snapping grid, where you can drag, resize and duplicate cards.
- A switch between Edit and View (a pencil icon).
- A Share button that gives a link and embed code.
- "Make a copy" on someone else's dashboard, with credit to the author.
- Dropdowns at the top that change what every chart shows (Grafana variables).

**Patterns that hurt beginners (avoid them)**

1. Typing a query language or remembering field names.
2. Choosing a chart type before seeing any data.
3. Reuse that breaks silently, with no explanation.
4. Analyst words such as dimension, measure, aggregation, join and transform.
5. Settings panels with hundreds of options and no presets.
6. Galleries with no quality signal and no preview.

### Gaps and opportunities

**What no one offers:**

1. **Charts you build for a single match.** sc2replaystats has "New Chart / Edit Layout / Save", but only for stats across many games. AoE4World match pages have one chart with a dropdown.
2. **A dashboard that works on any game.** No game-stats site keeps the dashboard separate from the game. Every AoE4 match has the same data shape, so a dashboard with slots for "the game" and "the players" can open any match. This avoids the field-matching breakage Looker and Grafana users hit.
3. **A community library of analyses.** AoE4 Guides shows that AoE4 players will browse, vote on and favourite things other players made, but nobody does this for charts.
4. **Free calculated measures.** Army DPS over time, villager efficiency and unspent resources are paid (AoE2 Insights Pro), hidden in a browser extension, or only shown per unit (AoE4World Explorer).
5. **Charts without opinions.** Coaching tools (AoE4 Game Review, Mobalytics) tell players what went wrong. A neutral tool for seeing a game your own way is an open position.
6. **Team games.** AoE4 Game Review covers ranked 1v1 only.

**Ideas to carry into [#14 Brainstorm](14-Brainstorm-ideas):**

- **Slots for the game and players:** a dashboard refers to "Player A" or "my team", never to a fixed game (from Grafana's empty data slots).
- **One link for "this game through that dashboard":** a game picker and a "whose view" dropdown at the top, both saved in the link (from Grafana variables and OpenDota Explorer).
- **A chart appears first:** picking "Army DPS" immediately draws it over game time for every player, with age-ups marked (from Metabase and PostHog).
- **Suggestions with previews:** 3–4 small previews drawn from the user's own match, so nobody starts at an empty list of chart types (from Excel, Grafana and Tableau "Show Me").
- **Data in game terms:** a data menu grouped as Economy, Military, Tech and upgrades, and Events, with icons and a one-line description each (from Metabase "Pick data").
- **Start from a ready dashboard:** a "Match overview" dashboard you can save and edit, plus templates (from Metabase X-rays and PostHog).
- **Gallery with remix and credit:** open any dashboard on your last game, then "Remix" to edit it, with the original author credited. Likes, plus a featured "Dashboard of the week" (from Tableau Public, Grafana and AoE4 Guides).
- **Ready-made calculated measures, plus simple formulas** like `Food + Wood` for advanced users (from Metabase custom columns).

### Sources

**Game-stats sites:**
- [aoe4world.com/faq](https://aoe4world.com/faq)
- [aoe4world.com/api](https://aoe4world.com/api)
- [aoe4world.com/tools](https://aoe4world.com/tools)
- [AoE4World Explorer: longbowman](https://aoe4world.com/explorer/civs/english/units/longbowman)
- [AoE4World Replay Extension](https://github.com/spartain-aoe/aoe4world-replay-extension)
- [aoe4gamereview.com/faq](https://aoe4gamereview.com/faq)
- [aoe4guides.com/about](https://aoe4guides.com/about)
- [aoeivbuilds.com](https://aoeivbuilds.com)
- [aoe2insights.com/pro](https://www.aoe2insights.com/pro)
- [aoestats.io](https://aoestats.io)
- [OpenDota graphs](https://www.opendota.com/matches/8000000000/graphs)
- [OpenDota Explorer](https://www.opendota.com/explorer)
- [sc2replaystats blog](https://sc2replaystats.com/blog/archives/1897)
- [Spawning Tool](https://lotv.spawningtool.com/build/)

**Dashboard builders:**
- [Grafana: import dashboards](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/import-dashboards/)
- [Grafana: variables](https://grafana.com/docs/grafana/latest/dashboards/variables/)
- [Grafana: panel editor](https://grafana.com/docs/grafana/latest/panels-visualizations/panel-editor-overview)
- [Grafana issue #36040](https://github.com/grafana/grafana/issues/36040)
- [Grafana reviews on G2](https://www.g2.com/products/grafana-labs/reviews)
- [Tableau: Show Me](https://help.tableau.com/current/pro/desktop/en-us/buildauto_showme.htm)
- [Tableau Public FAQ](https://help.tableau.com/current/pro/desktop/en-us/public_faq.htm)
- [Looker Studio: create a report from a template](https://cloud.google.com/looker/docs/studio/create-a-report-from-a-template)
- [Looker Studio: replace the data source](https://cloud.google.com/looker/docs/studio/replace-the-data-source-for-a-component-page-or-report)
- [Metabase: query builder](https://www.metabase.com/docs/latest/questions/query-builder/editor)
- [Metabase: X-rays](https://www.metabase.com/docs/latest/exploration-and-organization/x-rays)
- [Metabase: dashboard filters](https://www.metabase.com/docs/latest/dashboards/filters)
- [Datawrapper: the River](https://www.datawrapper.de/academy/how-to-use-the-river)
- [Flourish](https://flourish.studio/product/data-visualization/)
- [Excel: Recommended Charts](https://support.microsoft.com/en-us/excel/create-a-chart-with-recommended-charts)
- [PostHog: Trends](https://posthog.com/docs/product-analytics/trends/overview)
- [PostHog: dashboards](https://posthog.com/docs/product-analytics/dashboards)

**Could not check directly:**
- AoE4World game pages now sit behind a "Click to load summary" check for bots. Their contents are described from the FAQ, the launch post and the extension's source.
- sc2replaystats and Leetify pages were read from search-engine copies.
- STRATZ match pages would not load.

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#14 Brainstorm ideas](14-Brainstorm-ideas)**
  - **Why it needs this result:** Without it, the team may reinvent weaker versions of existing solutions.
  - **How it's used:** Competitor solutions seed ideas.
- **[#17 Information architecture / sitemap](17-Information-architecture-sitemap)**
  - **Why it needs this result:** Without it, the IA may use unfamiliar structures that confuse users.
  - **How it's used:** Competitors show the navigation and labels users already expect.
- **[#20 Prioritized concepts](20-Prioritized-concepts)**
  - **Why it needs this result:** Without it, the team may invest in features that failed for others.
  - **How it's used:** Shows which features are useless and where to invest.
- **[#41 Benchmark report](41-Benchmark-report)**
  - **Why it needs this result:** Without it, scores have no external reference point.
  - **How it's used:** Competitors act as a comparison standard for benchmarks.

## Definition of done

- [x] All inputs above are done and linked
- [x] Every section under Content is filled in, with evidence links
- [x] Reviewed by at least one other team member (iman244, 2026-10-22)
- [x] Status set to `Done` here and in the [tracker](Tracker)
- [x] Owners of the outputs under "Feeds into" are told

## References

- [Competitive Usability Evaluations](https://www.nngroup.com/articles/competitive-usability-evaluations/)

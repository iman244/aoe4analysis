**Step:** [3. Ideate](Step-3-Ideate) · **Status:** `Done` (check with #18 card sorting and #19 tree testing later) · **Owner:** iman244 · **Last updated:** 2026-10-23

> **Goal:** Organize and label content so users can find it.

## Inputs

Check each input is done and linked before you start.

- [ ] **[#4 Field study observations](04-Field-study-observations)**
  - **Why it's needed:** IA should reflect how users group and look for information in their real work.
  - **How it's used:** Contextual inquiry shapes architecture and content strategy.
  - **Reference:** [Contextual Inquiry](https://www.nngroup.com/articles/contextual-inquiry/) (NN/g states this)
- [x] **[#6 Analytics and support-ticket review](06-Analytics-and-support-ticket-review)**
  - **Why it's needed:** IA work needs evidence of where users get lost and what words they search for.
  - **How it's used:** Analytics and search terms reveal IA problems and missing content.
  - **Reference:** [5 IA Warning Signs in Your Analytics Reports](https://www.nngroup.com/articles/ia-warning-signs-analytics/) (NN/g states this)
- [x] **[#7 Competitive analysis](07-Competitive-analysis)**
  - **Why it's needed:** IA should match conventions users learned on other sites (Jakob's Law).
  - **How it's used:** Competitors show the navigation and labels users already expect.
  - **Reference:** [Competitive Usability Evaluations](https://www.nngroup.com/articles/competitive-usability-evaluations/)
- [x] **[#16 User flows and task flows](16-User-flows-and-task-flows)**
  - **Why it's needed:** IA must include every page and item the key flows need.
  - **How it's used:** Flows show which content and pages the IA must hold.
  - **Reference:** [Information Architecture vs. Sitemaps](https://www.nngroup.com/articles/information-architecture-sitemaps/)
- [ ] **[#18 Card sorting results](18-Card-sorting-results)**
  - **Why it's needed:** IA should match how users group and name content.
  - **How it's used:** Card sorting shapes the IA's groups and labels.
  - **Reference:** [Card Sorting vs. Tree Testing](https://www.nngroup.com/articles/card-sorting-tree-testing-differences/) (NN/g states this)
- [ ] **[#19 Tree testing results](19-Tree-testing-results)**
  - **Why it's needed:** IA needs evidence of where users get lost.
  - **How it's used:** Failed paths lead to IA fixes.
  - **Reference:** [Tree Testing](https://www.nngroup.com/articles/tree-testing/)

## Template

NN/g template: **Partial**

- [Menu-Design Checklist (PDF)](https://media.nngroup.com/media/articles/attachments/PDF_Menu-Design-Checklist.pdf)

## Content

> **Reviewed by iman244 on 2026-10-23.** Built from the screens list in [#16](16-User-flows-and-task-flows#screens-these-flows-need-input-for-17-sitemap) and the conventions in [#7](07-Competitive-analysis#conventions-users-will-expect). It covers Version 1 only ([#20](20-Prioritized-concepts#decision)). Groups and labels are first guesses until card sorting ([#18](18-Card-sorting-results)) and tree testing ([#19](19-Tree-testing-results)) are done with survey volunteers. #6 was skipped (no product yet).

### Sitemap (tree)

**Pages**

```
- Home                                   /
  - My last game (card)                  → opens the dashboard page
  - Open a game (button)                 → Pick a game dialog
  - Gallery highlights                   → opens the dashboard page
  - New dashboard (button)               → opens the dashboard page in edit mode
- Gallery                                /gallery
  - Trending · New · Top (tabs)
  - Dashboard cards                      → opens the dashboard page
- Dashboard page (a dashboard on a game) /d/[dashboard]/[game]
  - View mode
    - Game header (map, mode, result, players and civilizations)
    - Charts + time cursor
    - Share · Open on my game · Open on another game · Make a copy
  - Edit mode (own dashboards only)
    - Stats menu (see below)
    - Add, move and resize charts
    - Name, Save, Publish
- My dashboards                          /me
  - Dashboards I saved or copied
  - Account: username, Steam ID or Steam name
```

**Dialogs (open on top of a page)**

```
- Sign up          username + Steam ID or Steam name (Flow 0)
- Share            copy link
- Publish          description, check on another game, publish to gallery
- Pick a game      my last game, my recent games,
                   search a player → their recent games
```

**Stats menu (the data a chart can show, grouped the way the in-game stats screen groups it)**

```
- Score
  - Total · Military · Economy · Technology · Society     (over time)
- Economy
  - Resources in stock: food, wood, gold, stone, olive oil (over time)
  - Gather rate per minute, per resource                  (over time)
  - Resources gathered, per resource                      (over time, and totals)
  - Resources spent                                       (totals)
  - Villagers                                             (calculated)
  - Unspent resources                                     (calculated)
  - Idle Town Center time                                 (calculated)
- Military
  - Army DPS                                              (calculated)
  - Army HP                                               (calculated)
  - Army value                                            (calculated)
  - Army composition: units alive by type                 (calculated)
  - Units made · Units lost · Units killed                (totals)
- Tech and upgrades
  - Upgrades researched (with times)
  - Upgrade coverage                                      (calculated)
- Ages and landmarks
  - Age-up times · Landmarks chosen
- Build order
  - Units, buildings and upgrades over time · Buildings destroyed
- Player
  - APM · Commands · Idle time
- Not in the data
  - Map control (shown with a short reason)
```

### Labels glossary

| Label | Meaning | Source (card sort / search terms) |
|---|---|---|
| **Dashboard** | A set of charts that can be opened on any game | iman244 ([#1](01-Stakeholder-interview-notes)) |
| **Chart** | One picture of a stat, such as a line over game time | Common term ([#7](07-Competitive-analysis)) |
| **Stat** | One piece of data a chart can show. Used in place of analyst words like "measure" or "field". | Gamer word; [#7](07-Competitive-analysis) warns against analyst jargon |
| **Calculated** | A stat the app works out, such as army DPS, rather than one read straight from the game | [#1](01-Stakeholder-interview-notes) (army DPS) |
| **My last game** | The latest game of the player in your account | [#11](11-Customer-journey-map) |
| **Starter dashboard** | The ready-made "Match overview" every game can open in | [#14](14-Brainstorm-ideas) idea 11 |
| **Question template** | A ready dashboard for one question, such as "Did trade pay off?" | [#14](14-Brainstorm-ideas) idea 18 |
| **Time cursor** | The line that moves across every chart at once | [#14](14-Brainstorm-ideas) idea 21 |
| **Share** | Copy a link that opens this dashboard on this game | [#7](07-Competitive-analysis) (universal) |
| **Publish** | Put a dashboard in the gallery | [#7](07-Competitive-analysis) |
| **Make a copy** | Get your own editable version of someone's dashboard, with credit to them | [#7](07-Competitive-analysis) (Tableau Public) |
| **Gallery** | All published dashboards | [#7](07-Competitive-analysis) |
| Score, Military, Economy, Technology, Society, APM, Villagers, Feudal / Castle / Imperial | The game's own words | In-game stats screen; AoE4World ([#7](07-Competitive-analysis)) |

### Rationale

- **Only three pages in the main navigation: Home, Gallery, My dashboards.** Everything else happens on one page, the dashboard page, because every flow in [#16](16-User-flows-and-task-flows) ends there.
- **The dashboard page address holds both the dashboard and the game** (`/d/[dashboard]/[game]`), so a shared link always opens the same view (idea 23). The exact address format is decided in the build.
- **View and edit are two modes of the same page**, not two pages. You can only edit your own dashboards; others' show "Make a copy" (idea 27).
- **Finding any player's game lives in the Pick a game dialog** (search a player → their recent games), so it is reachable from Home and from any dashboard without adding a page.
- **Dialogs instead of pages** for sign-up, share, publish and picking a game. They are short steps inside a flow, and opening them shouldn't lose your place.
- **The stats menu follows the in-game stats screen's groups** (Score, Economy, Military, Technology), which every player already knows. Calculated stats sit next to raw ones in the same group (idea 14), marked "calculated".
- **"Not in the data" is a visible group**, so players looking for map control get an answer instead of searching (Flow 1 error path).

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#19 Tree testing results](19-Tree-testing-results)**
  - **Why it needs this result:** Without an IA, there is no tree to test.
  - **How it's used:** Tree testing evaluates the proposed IA.
- **[#22 Wireframes](22-Wireframes)**
  - **Why it needs this result:** Without IA, navigation is improvised screen by screen.
  - **How it's used:** IA informs the navigation in the UI.

## Definition of done

- [ ] All inputs above are done and linked
- [x] Every section under Content is filled in, with evidence links
- [x] Reviewed by at least one other team member (iman244, 2026-10-23)
- [x] Status set to `Done` here and in the [tracker](Tracker)
- [ ] Owners of the outputs under "Feeds into" are told

## References

- [Information Architecture vs. Sitemaps](https://www.nngroup.com/articles/information-architecture-sitemaps/)
- [The Difference Between IA and Navigation](https://www.nngroup.com/articles/ia-vs-navigation/)

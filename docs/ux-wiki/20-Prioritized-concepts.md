**Step:** [3. Ideate](Step-3-Ideate) · **Status:** `Done` · **Owner:** iman244 · **Last updated:** 2026-10-23

> **Goal:** Choose which ideas to build now by impact, effort and constraints.

## Inputs

Check each input is done and linked before you start.

- [x] **[#1 Stakeholder interview notes](01-Stakeholder-interview-notes)**
  - **Why it's needed:** Prioritizing needs to know budget, time and tech limits to judge effort and feasibility.
  - **How it's used:** Stated constraints rule out concepts that can't be built.
  - **Reference:** [Using Prioritization Matrices](https://www.nngroup.com/articles/prioritization-matrices/)
- [x] **[#2 Business goals and constraints](02-Business-goals-and-constraints)**
  - **Why it's needed:** The matrix needs criteria such as business value and feasibility, which come from goals and constraints.
  - **How it's used:** Constraints become criteria in the prioritization matrix.
  - **Reference:** [Using Prioritization Matrices](https://www.nngroup.com/articles/prioritization-matrices/) (NN/g states this)
- [x] **[#7 Competitive analysis](07-Competitive-analysis)**
  - **Why it's needed:** Prioritizing needs evidence of what works and what doesn't in the market.
  - **How it's used:** Shows which features are useless and where to invest.
  - **Reference:** [Competitive Usability Evaluations](https://www.nngroup.com/articles/competitive-usability-evaluations/) (NN/g states this)
- [x] **[#9 Personas](09-Personas)**
  - **Why it's needed:** Priorities should favor the key persona's most important needs.
  - **How it's used:** Personas are used to prioritize features.
  - **Reference:** [Personas: Study Guide](https://www.nngroup.com/articles/personas-study-guide/) (NN/g states this)
- [x] **[#11 Customer journey map](11-Customer-journey-map)**
  - **Why it's needed:** Prioritizing needs to know which moments hurt users most.
  - **How it's used:** Pain-point severity guides what to fix first.
  - **Reference:** [Using Prioritization Matrices](https://www.nngroup.com/articles/prioritization-matrices/)
- [x] **[#12 Problem statement / How Might We](12-Problem-statement-How-Might-We)**
  - **Why it's needed:** The problem statement is the main yardstick for choosing concepts.
  - **How it's used:** Concepts are judged by how well they solve the stated problem.
  - **Reference:** [Using Prioritization Matrices](https://www.nngroup.com/articles/prioritization-matrices/)
- [x] **[#14 Brainstorm ideas](14-Brainstorm-ideas)**
  - **Why it's needed:** Prioritization needs a pool of options to choose from.
  - **How it's used:** Ideas are narrowed down by dot voting.
  - **Reference:** [Dot Voting](https://www.nngroup.com/articles/dot-voting/) (NN/g states this)
- [x] **[#15 Crazy 8s sketches](15-Crazy-8s-sketches)**
  - **Why it's needed:** Visual sketches make ideas easier to compare and vote on.
  - **How it's used:** Sketches are voted on and ranked.
  - **Reference:** [Dot Voting](https://www.nngroup.com/articles/dot-voting/) (NN/g states this)

## Template

NN/g template: **None**

- NN/g has no free template for this output. Use the sections below.

## Content

_Scored by Claude and accepted by iman244 on 2026-10-23. [#15 Crazy 8s](15-Crazy-8s-sketches) was skipped: sketching happens in [#21 Paper sketches](21-Paper-sketches) and [#22 Wireframes](22-Wireframes)._

### Criteria

| Criterion | Source | Weight |
|---|---|---|
| **User value** (1–5): how much it helps the personas at the low points of the journey | [#9](09-Personas), [#11](11-Customer-journey-map), [#12](12-Problem-statement-How-Might-We) | ×2 |
| **Business value** (1–5): how much it serves the ranked goals (1. easy to build, 2. full data and calculated measures, 3. share and reuse, 4. people use it) | [#2](02-Business-goals-and-constraints) | ×2 |
| **Effort** (1–5): how much work it is for a team of one plus Claude | Claude's estimate; constraints in [#2](02-Business-goals-and-constraints) | −1 |

**Score = 2 × user value + 2 × business value − effort.** Bands: **15 or more = Version 1**, 12–14 = Next, 8–11 = Later, below 8 = Parked.

### Prioritization matrix

Ideas are from [#14](14-Brainstorm-ideas), with the same numbers.

| Concept | User value | Business value | Effort | Score | Band |
|---|---|---|---|---|---|
| 1. "My last game" on the home page | 5 | 5 | 2 | 18 | **Version 1** |
| 6. Data menu in game words | 5 | 5 | 2 | 18 | **Version 1** |
| 11. Starter dashboard | 5 | 5 | 2 | 18 | **Version 1** |
| 23. One link, full view | 5 | 5 | 2 | 18 | **Version 1** |
| 10. Drop to chart | 5 | 5 | 3 | 17 | **Version 1** |
| 14. Calculated measures in the same menu | 4 | 5 | 1 | 17 | **Version 1** |
| 40. Search a player | 5 | 4 | 2 | 16 | **Version 1** (added 2026-10-23) |
| 15. Ready-made calculated measures | 5 | 5 | 4 | 16 | **Version 1** |
| 18. Question templates | 5 | 4 | 2 | 16 | **Version 1** |
| 21. Shared time cursor | 5 | 4 | 2 | 16 | **Version 1** |
| 27. View first, copy to edit | 4 | 5 | 2 | 16 | **Version 1** |
| 9. One-line explanations | 4 | 4 | 1 | 15 | **Version 1** |
| 29. Gallery | 4 | 5 | 3 | 15 | **Version 1** |
| 2. Paste anything | 4 | 4 | 2 | 14 | Next (1.1) |
| 7. Search the data | 4 | 4 | 2 | 14 | Next (1.1) |
| 30. Try it on your game | 4 | 4 | 2 | 14 | Next (1.1) |
| 34. Default dashboard | 4 | 4 | 2 | 14 | Next (1.1) |
| 13. Chart suggestions | 4 | 4 | 3 | 13 | Next (1.1) |
| 39. No account to start | 4 | 4 | 3 | 13 | Next (1.1) |
| 22. Team view | 4 | 3 | 2 | 12 | Next (1.1) |
| 31. Quality signals | 3 | 4 | 2 | 12 | Next (1.1) |
| 20. Fight finder | 4 | 3 | 3 | 11 | Later |
| 24. Preview card | 3 | 4 | 3 | 11 | Later |
| 25. Share a moment | 3 | 3 | 1 | 11 | Later |
| 37. Honest gaps | 3 | 3 | 1 | 11 | Later |
| 3. Squad space | 4 | 3 | 4 | 10 | Later |
| 12. Click a number to chart it | 3 | 3 | 2 | 10 | Later |
| 8. Hover preview | 3 | 3 | 3 | 9 | Later |
| 26. Notes on charts | 3 | 3 | 3 | 9 | Later |
| 32. Creator profiles | 3 | 3 | 3 | 9 | Later |
| 33. Dashboard of the week | 2 | 3 | 1 | 9 | Later |
| 38. Request a measure | 2 | 3 | 1 | 9 | Later |
| 5. Discord bot | 3 | 3 | 4 | 8 | Later |
| 35. New-game alert | 3 | 3 | 4 | 8 | Later |
| 16. Simple formulas | 2 | 3 | 4 | 6 | Parked |
| 19. Ask in plain words (AI) | 3 | 2 | 5 | 5 | Parked |
| 4. Browser extension button | 2 | 2 | 4 | 4 | Parked |
| 17. Community-made measures | 2 | 2 | 5 | 3 | Parked |
| 28. Author updates | 2 | 2 | 5 | 3 | Parked |
| 36. Compare with my last game | — | — | — | — | Parked (out of scope: needs many games) |

### Decision

**Version 1 (13 ideas):** 1. "My last game" on the home page, 6. Data menu in game words, 11. Starter dashboard, 23. One link, full view, 10. Drop to chart, 14. Calculated measures in the same menu, 15. Ready-made calculated measures, 18. Question templates, 21. Shared time cursor, 27. View first, copy to edit, 9. One-line explanations, 29. Gallery, 40. Search a player.

Together they cover the core of the Squad Reviewer's journey ([#11](11-Customer-journey-map)): **open my last game (or search for any player's game) → see it through a starter dashboard → add charts from a data menu in game words, including calculated measures → look at one moment across every chart → share one link → others open it, copy it to edit, or find dashboards in the gallery.**

**Next (1.1):** 2. Paste anything, 7. Search the data, 30. Try it on your game, 34. Default dashboard, 13. Chart suggestions, 39. No account to start, 22. Team view, 31. Quality signals.

**Identity (decided by iman244, 2026-10-23):** Version 1 has a **simple sign-up**: a username of the person's choice, plus a field for a **Steam ID or Steam name**. The app trusts what they type and does not check it. **Sign in with Steam** comes later, when we publish. Anyone can view dashboards without an account.

### Parked ideas

**Later:** 20. Fight finder, 24. Preview card, 25. Share a moment, 37. Honest gaps, 3. Squad space, 12. Click a number to chart it, 8. Hover preview, 26. Notes on charts, 32. Creator profiles, 33. Dashboard of the week, 38. Request a measure, 5. Discord bot, 35. New-game alert.

**Parked:** 16. Simple formulas, 19. Ask in plain words (AI), 4. Browser extension button, 17. Community-made measures, 28. Author updates, 36. Compare with my last game.

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#21 Paper sketches](21-Paper-sketches)**
  - **Why it needs this result:** Without priorities, time is wasted prototyping weak ideas.
  - **How it's used:** Only the top ideas get prototyped.
- **[#22 Wireframes](22-Wireframes)**
  - **Why it needs this result:** Without priorities, wireframes try to include every idea.
  - **How it's used:** Only the top ideas get prototyped.
- **[#23 Clickable prototype](23-Clickable-prototype)**
  - **Why it needs this result:** Without priorities, effort is spread too thin to build testable prototypes.
  - **How it's used:** Only the top ideas get prototyped.

## Definition of done

- [x] All inputs above are done and linked
- [x] Every section under Content is filled in, with evidence links
- [x] Reviewed by at least one other team member (iman244, 2026-10-23)
- [x] Status set to `Done` here and in the [tracker](Tracker)
- [ ] Owners of the outputs under "Feeds into" are told

## References

- [Using Prioritization Matrices](https://www.nngroup.com/articles/prioritization-matrices/)
- [Dot Voting](https://www.nngroup.com/articles/dot-voting/)

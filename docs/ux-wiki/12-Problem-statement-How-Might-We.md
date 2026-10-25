**Step:** [2. Define](Step-2-Define) · **Status:** `Done` (from assumptions; review again after the survey) · **Owner:** iman244 · **Last updated:** 2026-10-23

> **Goal:** Frame the exact problem to solve, for whom, and why.

## Inputs

Check each input is done and linked before you start.

- [x] **[#2 Business goals and constraints](02-Business-goals-and-constraints)**
  - **Why it's needed:** A problem statement must sit inside the business goals and limits to be worth solving.
  - **How it's used:** Goals and constraints set the scope of the problem statement.
  - **Reference:** [Problem Statements in UX Discovery](https://www.nngroup.com/articles/problem-statements/)
- [ ] **[#3 User interview recordings and notes](03-User-interview-recordings-and-notes)**
  - **Why it's needed:** A need statement must state a real, observed user need.
  - **How it's used:** Interview data is used to write user-need statements.
  - **Reference:** [User Interviews 101](https://www.nngroup.com/articles/user-interviews/) (NN/g states this)
- [ ] **[#8 Affinity diagram (themes)](08-Affinity-diagram-themes)**
  - **Why it's needed:** The problem statement should come from the most important pattern.
  - **How it's used:** The strongest themes point to the core problem.
  - **Reference:** [User Need Statements](https://www.nngroup.com/articles/user-need-statements/)
- [ ] **[#9 Personas](09-Personas)**
  - **Why it's needed:** A need statement must say who has the need.
  - **How it's used:** The 'user' in a need statement is the persona.
  - **Reference:** [User Need Statements](https://www.nngroup.com/articles/user-need-statements/)
- [ ] **[#10 Empathy maps](10-Empathy-maps)**
  - **Why it's needed:** Need statements require insights, which empathy maps help surface.
  - **How it's used:** Unmet needs become need statements.
  - **Reference:** [User Need Statements](https://www.nngroup.com/articles/user-need-statements/)
- [ ] **[#11 Customer journey map](11-Customer-journey-map)**
  - **Why it's needed:** HMW questions are written directly from pain points.
  - **How it's used:** Pain points become How Might We questions.
  - **Reference:** [Using “How Might We” Questions](https://www.nngroup.com/articles/how-might-we-questions/)

## Template

NN/g template: **None**

- NN/g has no free template for this output. Use the sections below.

## Content

> **Reviewed by iman244 on 2026-10-23.** Based on [#1](01-Stakeholder-interview-notes), [#2](02-Business-goals-and-constraints), the proto-personas in [#9](09-Personas) and the journey map in [#11](11-Customer-journey-map). Review it again when the survey answers arrive.

### User need statements

```
The Squad Reviewer needs to look into specific questions about the game they just played, together with their squad, in the few minutes before the next game,
because the review is a shared analysis, and today's tools show one fixed chart at a time.
```

```
The Analyst Creator needs to apply their own way of analysing to many games and present it clearly,
because their value is their point of view, and existing sites only offer fixed layouts.
```

```
The Lens Borrower needs to see their own game through a dashboard they trust, in one step,
because they won't set anything up themselves.
```

### Problem statement

AoE4 players who analyse games, whether alone, with their squad or for an audience, can only see the charts a game-stats site decides to show, one at a time. They can't build, save or share their own view of a game. So analysis is slow, hard to share and lost after every game, and the people who see a game in a useful way have no way to pass that view on.

### How Might We questions

**Getting to the game**

1. HMW get a squad from "game ended" to a shared view of that game in under a minute?
2. HMW make "my last game" the obvious way in, while still accepting any game link?

**Building (goal 1: easy without instructions)**

3. HMW let someone who has never used a dashboard tool find the data they need, described in game words?
4. HMW show a useful chart before asking the builder to make any choices?
5. HMW make calculated measures such as army DPS as easy to pick as raw numbers?
6. HMW help a squad look into a specific question (army composition, trade timing, upgrades before a fight) without building from scratch?

**Sharing and reuse (goal 3)**

7. HMW make one link carry both the game and the dashboard, so everyone sees the same view?
8. HMW let people change someone else's dashboard without breaking the original, and credit its author?
9. HMW help people find dashboards worth opening?

**Lasting value (goal 4: people use it)**

10. HMW make a dashboard pay off again on the next game?

**Limits of the data**

11. HMW be clear about what the data can't show (such as map control) without people feeling let down?

### Scope (in / out)

- **In:**
  - Building dashboards for a **single game**.
  - Saving, sharing and browsing dashboards.
  - Opening any game through any dashboard.
  - Calculated measures from game data plus [aoe4world/data](https://github.com/aoe4world/data).
- **Out:**
  - Dashboards for players, civilizations, maps and groups of games (a later phase).
  - Map control and anything that needs positions (not in the data).
  - Telling players what they did wrong (the product is a tool, not a coach).
  - Languages other than English.

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#14 Brainstorm ideas](14-Brainstorm-ideas)**
  - **Why it needs this result:** Without it, ideas solve different problems and can't be compared.
  - **How it's used:** How Might We questions focus ideation on the right problem.
- **[#20 Prioritized concepts](20-Prioritized-concepts)**
  - **Why it needs this result:** Without it, concepts are chosen by taste.
  - **How it's used:** Concepts are judged by how well they solve the stated problem.
- **[#25 Usability test tasks](25-Usability-test-tasks)**
  - **Why it needs this result:** Without it, tests may check things unrelated to the core problem.
  - **How it's used:** Defines what the test must prove.

## Definition of done

- [ ] All inputs above are done and linked
- [ ] Every section under Content is filled in, with evidence links
- [x] Reviewed by at least one other team member (iman244, 2026-10-23)
- [ ] Status set to `Done` here and in the [tracker](Tracker)
- [ ] Owners of the outputs under "Feeds into" are told

## References

- [Problem Statements in UX Discovery](https://www.nngroup.com/articles/problem-statements/)
- [User Need Statements](https://www.nngroup.com/articles/user-need-statements/)
- [Using “How Might We” Questions](https://www.nngroup.com/articles/how-might-we-questions/)

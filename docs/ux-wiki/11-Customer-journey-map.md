**Step:** [2. Define](Step-2-Define) · **Status:** `In progress` (draft from assumptions) · **Owner:** iman244 · **Last updated:** 2026-10-23

> **Goal:** Show the full experience: stages, actions, thoughts, emotions, pain points, opportunities.

## Inputs

Check each input is done and linked before you start.

- [ ] **[#3 User interview recordings and notes](03-User-interview-recordings-and-notes)**
  - **Why it's needed:** A journey map needs real steps and feelings from users.
  - **How it's used:** Interview data supplies journey stages, actions and emotions.
  - **Reference:** [User Interviews 101](https://www.nngroup.com/articles/user-interviews/) (NN/g states this)
- [ ] **[#4 Field study observations](04-Field-study-observations)**
  - **Why it's needed:** Journey stages must match how the task really happens.
  - **How it's used:** Real steps and context go into journey stages.
  - **Reference:** [Journey Mapping 101](https://www.nngroup.com/articles/journey-mapping-101/)
- [ ] **[#5 Diary study entries](05-Diary-study-entries)**
  - **Why it's needed:** Journeys that span days or weeks need data collected across that time.
  - **How it's used:** Behavior over time supplies the time dimension and emotional highs and lows.
  - **Reference:** [Diary Studies](https://www.nngroup.com/articles/diary-studies/)
- [ ] **[#8 Affinity diagram (themes)](08-Affinity-diagram-themes)**
  - **Why it's needed:** The journey map needs confirmed pain points at each stage.
  - **How it's used:** Themes become journey pain points and opportunities.
  - **Reference:** [Journey Mapping 101](https://www.nngroup.com/articles/journey-mapping-101/)
- [ ] **[#9 Personas](09-Personas)**
  - **Why it's needed:** A journey map follows one actor through one scenario.
  - **How it's used:** Each journey map is for one persona.
  - **Reference:** [Journey Mapping 101](https://www.nngroup.com/articles/journey-mapping-101/) (NN/g states this)
- [ ] **[#10 Empathy maps](10-Empathy-maps)**
  - **Why it's needed:** The journey map's emotion layer needs the attitudes captured in the empathy map.
  - **How it's used:** Thoughts and feelings fill the journey map's emotion rows.
  - **Reference:** [Journey Mapping 101](https://www.nngroup.com/articles/journey-mapping-101/)

## Template

NN/g template: **Yes**

- [Journey Mapping Template (PDF)](https://media.nngroup.com/media/articles/attachments/JMTemplate.pdf)
- [Collaborative Journey Map (Excel)](https://media.nngroup.com/media/articles/attachments/NNg_Customer_Journey_Mapping_Template.xlsx)
- [Collaborative Journey Map (Numbers)](https://media.nngroup.com/media/articles/attachments/NNg_Customer_Journey_Mapping_Template.numbers)
- [Service Blueprint Template (Excel)](https://media.nngroup.com/media/articles/attachments/NNg_Service_Blueprint_Template.xlsx)

## Content

> **Draft from assumptions.** Built from [#1](01-Stakeholder-interview-notes), [#7](07-Competitive-analysis) and the proto-personas in [#9](09-Personas), because the survey (#3), field study (#4), diary study (#5), themes (#8) and empathy maps (#10) aren't ready. Tags work as in #9: **(heard)** from iman244, **(seen)** from research, **(assumption)**. Check it against the survey answers and a field study of a real review session.

### Persona

**The Squad Reviewer** ([#9](09-Personas)): plays team games with the same friends and talks each game over with them afterwards. Has never used a dashboard tool.

### Scenario and expectations

**Scenario:** The squad just lost a 3v3. Together they analyse the game: was the army composition right, did going for trade early help or hurt, what happened when they got caught 2v1, were their timings and upgrades on time? **(heard)** They have a few minutes before queueing again. **(assumption)**

**Expectations:**
- Understand what happened and what they missed, using data rather than memory. **(heard)**
- Show the others, so everyone is looking at the same thing. **(heard)**
- Be back in the queue soon. **(assumption)**

### Journey

**Today (current state)**

| Stage | Actions | Thoughts | Emotions | Pain points | Opportunities |
|---|---|---|---|---|---|
| 1. Game ends | Sees the result screen; the team starts talking on voice | "What went wrong there?" | Frustrated, curious **(assumption)** | Everyone remembers the game differently | Start from a question, not from a stats page |
| 2. First look | Opens the in-game stats screen **(heard)** | "Our score dropped here, but why?" | Unsure | The stats are limited **(heard)** and vanish when you leave the screen **(assumption)** | Get to the full data in one step from "my last game" |
| 3. Dig deeper | The one who knows aoe4world searches for the game and opens the summary **(heard)** | "Where's the chart for army composition at 12 minutes?" | Hopeful, then limited | One chart at a time, with a dropdown **(seen, [#7](07-Competitive-analysis))**; no custom charts such as army DPS **(heard)**; no map control **(heard)** | Let them make the exact chart they need; offer calculated measures |
| 4. Analyse together | Describes what they see to the others, or shares their screen **(assumption)** | "Look, our army fell apart here, and we hadn't got the upgrades yet" | Engaged, focused | Hard to point at the exact moment; others can't explore it themselves **(assumption)** | One shared link that opens the same view for everyone |
| 5. Move on | Queues again, often without settling it **(assumption)** | "Whatever, next game." | Unresolved | The lesson is lost; the next review starts from zero **(assumption)** | Save the dashboard so next game's review starts already set up |

**With the app (future state, a hypothesis to design and test)**

| Stage | Actions | Thoughts | Emotions | Pain points to avoid | What the app must do |
|---|---|---|---|---|---|
| 1. Game ends | Opens the app (or a link a friend posted) | "Let's check it properly." | Curious | Searching for the game | Offer "my last game" right away; accept a pasted aoe4world link |
| 2. Open the game through a dashboard | Picks their squad's usual dashboard, or a popular one | "Our usual view is fine." | Confident | Starting from an empty page | Start from a ready dashboard or the last one they used |
| 3. Analyse | Adds or changes a chart: picks "army DPS", and it appears for every player with age-ups marked | "There, that's where we lost the fight, and why." | In control | Analyst jargon, typing field names, choosing a chart before seeing the data **(seen, [#7](07-Competitive-analysis))** | Data menu in game words; chart appears first; suggestions with previews |
| 4. Share | Copies the link into the squad's Discord | "Open this." | Satisfied | Others seeing a different view | One link opens the same game in the same dashboard |
| 5. Discuss | Everyone opens it, explores, maybe tweaks a copy | "Okay, so the upgrades came too late." | Resolved | Edits by one person breaking another's view | Copy to edit (remix); the original stays as it was |
| 6. Next game | Opens the saved dashboard on the new game | "Same view, new game." | Quick | Rebuilding everything | Saved dashboards open any game |

### Insights

1. **The review is social and happens in a short gap between games.** Speed and sharing matter more than depth of features. **(heard + assumption)**
2. **It is a shared analysis of the game: what happened and what they missed.** It is not a debate about who was right. The builder should help the squad look into specific questions together (army composition, trade timing, fights, timings, upgrades). **(heard, corrected by iman244 on 2026-10-23)**
3. **"My last game" is the main way in.** Searching for a game is a step to remove. **(assumption, partly seen: AoE4World's /games/last endpoint exists for this)**
4. **Everyone needs to see the same thing.** The link must carry both the game and the dashboard. **(heard + seen, [#7](07-Competitive-analysis))**
5. **A dashboard pays off the second time.** Saving the squad's view turns every later review into "open, look, talk". **(assumption)**
6. **Map control will come up, and we can't show it.** The app should say plainly that it isn't in the data, rather than leave people searching for it. **(heard)**

### Internal ownership

| Stage | Owner |
|---|---|
| All stages (design and build) | iman244 |
| Getting the game data (stages 1–2) | iman244, with permission needed from the aoe4world developers ([#2](02-Business-goals-and-constraints)) |

## Feeds into

When this output is done, tell the owners of these outputs.

- **[#12 Problem statement / How Might We](12-Problem-statement-How-Might-We)**
  - **Why it needs this result:** Without the journey map, HMW questions lack a specific moment to improve.
  - **How it's used:** Pain points become How Might We questions.
- **[#14 Brainstorm ideas](14-Brainstorm-ideas)**
  - **Why it needs this result:** Without it, ideation is too broad and produces unfocused ideas.
  - **How it's used:** Opportunities seed ideation.
- **[#16 User flows and task flows](16-User-flows-and-task-flows)**
  - **Why it needs this result:** Without it, flows may optimize one step while breaking the overall journey.
  - **How it's used:** Journey stages are broken into detailed user flows.
- **[#20 Prioritized concepts](20-Prioritized-concepts)**
  - **Why it needs this result:** Without it, priorities ignore where users struggle most.
  - **How it's used:** Pain-point severity guides what to fix first.
- **[#41 Benchmark report](41-Benchmark-report)**
  - **Why it needs this result:** Without it, benchmarks may measure the wrong parts of the experience.
  - **How it's used:** The future-state map defines what to measure later.

## Definition of done

- [ ] All inputs above are done and linked
- [ ] Every section under Content is filled in, with evidence links
- [ ] Reviewed by at least one other team member
- [ ] Status set to `Done` here and in the [tracker](Tracker)
- [ ] Owners of the outputs under "Feeds into" are told

## References

- [Journey Mapping 101](https://www.nngroup.com/articles/journey-mapping-101/)

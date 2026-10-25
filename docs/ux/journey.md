# Journey: The 1v1 Climber after a ranked loss

_Draft from assumptions, 2026-10-25. Waiting for iman244's review._

**Persona:** [The 1v1 Climber](persona.md): plays ranked 1v1 and looks back at lost games alone.

**Scenario:** They just lost a 23-minute ranked 1v1 on Gorge, Abbasid against Rus. The army fell apart in a fight around minute 16 and they don't know why. They want to know before they queue again. **(assumption, built on the sample game in the repo)**

**Expectations:**
- See both sides next to each other at the moment that mattered. **(heard: what the board was asked to show)**
- Know what to do differently next game. **(assumption)**
- Be quick about it. **(assumption)**

## Today (current state)

| Stage | Actions | Thoughts | Emotions | Pain points | Opportunities |
|---|---|---|---|---|---|
| 1. Game ends | Sees the defeat screen | "How did that fight go so badly?" | Annoyed **(assumption)** | Only a guess about what went wrong | Start from the moment that hurt |
| 2. First look | Checks the in-game stats, or opens the game on aoe4world **(assumption)** | "Their military score jumped, but from what?" | Unsure | Totals and lists, not both sides at one moment **(assumption)** | Put both players side by side at any moment |
| 3. Dig deeper | Watches the replay in game and skips around **(assumption)** | "Where was I at 15 minutes? Where were they?" | Impatient | Slow to search; one view at a time; easy to give up **(assumption)** | A timeline you can drag, and a summary of who's ahead |
| 4. Find the cause | Pieces it together from memory | "Maybe I aged up late? Or was it upgrades?" | Unsure | No numbers to back the guess **(assumption)** | Show the gap in plain numbers: age, upgrades, buildings, units, bank |
| 5. Next game | Queues again | "Whatever." | Unresolved | The same mistake next game **(assumption)** | One clear thing to fix |

## With the board (future state, a hypothesis to design and test)

| Stage | Actions | Thoughts | Emotions | Pain points to avoid | What the app must do |
|---|---|---|---|---|---|
| 1. Game ends | Opens the app; their last game is there | "Let's see it." | Curious | Searching for the game | Open the last game straight on the board |
| 2. Find the moment | Drags the timeline to about 16:00, or plays it at 5× with Space | "Here's the fight." | Focused | A slow or jumpy timeline | A smooth timeline; everything on the board follows it |
| 3. See who's ahead | Reads the Advantage strip: behind on military upgrades and units, ahead on economy | "So they had more army and better upgrades." | Getting it | Too many numbers at once | One strip with the lead only for whoever has more; details on hover |
| 4. Find why | Opens Army; hovers the Barracks and Archery Range cards; checks the bank | "They kept two buildings producing. I had food sitting in the bank." | Clear | Not knowing which number matters | Compare the same building on both sides; show unspent resources against what's built |
| 5. Take it to the next game | Queues again with one thing to fix | "Spend the food, keep the barracks going." | Confident | Leaving without a takeaway | _(later)_ a one-line "where you fell behind" summary |

## Insights

1. **The board answers "what did they have that I didn't, and when?"**, which the in-game stats and aoe4world don't show side by side. **(heard + assumption)**
2. **The timeline is the main control.** Everything else is read at the moment it points to. **(seen: how the board works)**
3. **Details belong on hover.** The board is dense, so the first look shows only who leads, and the details wait for a hover. **(heard: iman244 asked for this)**
4. **The replay file matters.** Without it, the board can't show idle or busy production, one of the biggest "why" answers. **(seen: production comes only from the replay)**

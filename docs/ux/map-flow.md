# Flow: See the game on the map

_Draft, 2026-10-25, moved here from the GitHub wiki. Waiting for iman244's review._

- **Persona:** A ranked 1v1 player looking back at a game; a creator explaining a game. **(assumption)**
- **Entry point:** The 2D map page for a game (now `/replay-2d`).
- **Steps:**
  1. The map shows where each player placed buildings over time, drawn from the replay commands. The terrain isn't drawn (decided by iman244, 2026-10-24).
  2. A timeline with play / pause moves through the game _(Claude's call: the same Space key and speed as the 1v1 board)_.
  3. They hover a building to see what it is.
- **Success end state:** They see where expansions, walls and towers went, and when.
- **Error paths:** No replay file: the page says the map needs it.

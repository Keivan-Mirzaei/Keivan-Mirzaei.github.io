# Hex widget design sheet

**Status:** Reviewed, approved, and published on 4 October 2026. [Live puzzle](https://keivan-mirzaei.com/puzzles/hex/).

Follow the [widget roadmap](../widget-requirements.md). This migration covers the playable Hex game on `/puzzles/hex/` and in the Hex article. The article's separate coastline proof activity is outside this puzzle migration.

- **Name and stable ID:** Hex; `hex`.
- **Subject and activity type:** Connection game; graph theory and topology.
- **Purpose / primary interaction:** Place a stone in an empty hexagon to connect the two sides of your colour. Play against the computer or take turns locally.
- **Title:** The puzzle page already supplies “Hex.” The embedded game retains “Find your way across.” Use the same interface font throughout the game.
- **Visible controls:** Undo, Redo, Reset, Settings, Info. Every action has a short visible label. Omit Shuffle, hints, scores, and stone-count statistics because they do not help this game's main interaction.
- **Settings:** Board size uses a 3–11 slider with an exact size label. Play computer, Play second, and Save progress use toggle switches. Hide Play second during local play while retaining its preference. Changing size or players starts a new game and clears history; explain this in Settings.
- **Supporting panels:** Settings and Info start closed, toggle with the same button, close with Escape, and are mutually exclusive. Keep them open during outside taps, clicks, and scrolling so they can be read on a phone. Expand below the controls, keeping the board and essential feedback visible. Never save panel visibility.
- **Necessary feedback:** Show the current turn, the two players and colours, and the connection goal. Indicate the active player. Retain the latest-stone outline and meaningful keyboard focus; do not number cells visibly.
- **Completion:** Stop accepting moves when a player has a real connection. Highlight the winning chain, tint the board area and result with the winning colour, and announce the winner in text. Undo or Reset removes the completed-state treatment when there is no longer a winner.
- **History:** Against the computer, Undo reverses a human move and its reply together. In local play, Undo reverses one move. Redo restores completed replies exactly or safely resumes an interrupted reply. A new action clears Redo. Retain at most 200 history entries.
- **Reset:** Clear the current board without changing size, players, or the saving preference. Reset is undoable and redoable. If playing second, the computer starts the new board. Undoing Reset restores the prior board and resumes any interrupted computer turn; stale replies must be ignored.
- **Presentation:** Use one shared game template and controller for the article and standalone puzzle. Keep the board dominant and controls compact. Supporting panels occupy space only while open.
- **Narrow screens:** Wrap controls. Keep dense boards scrollable inside their own area when necessary instead of shrinking cells indefinitely or scrolling the whole page. Keep at least 24-pixel cell widths, increasing that minimum for touch.
- **Saving:** Use the shared puzzle-storage service with a separate Hex preference on this device, enabled by default. Restore settings, board, turn, Undo, and Redo. Turning saving off clears only Hex's retained progress and stops future saves; the current game remains playable. Other puzzles retain their preferences and progress. Reset progress in Settings confirms before clearing only the current Hex board and its history; retain size, player preferences, and saving.
- **Formula typesetting:** No structured formulas are needed in this game's interface. Display board dimensions with × and exact integers in the interface font.
- **Mathematical assumptions:** Red starts; stones never move or change colour; connections require a shared cell edge; the swap rule is off. Both colour goals and boundary cells use the existing Hex model.
- **Checks:** Local and computer turns; first/second-player modes; keyboard navigation; winning and removal of the win effect; Reset/Undo/Redo, including pending computer work; saved state and older saves; panel dismissal and instance-specific labels; desktop and narrow layouts in both presentations.
- **Next step:** Publish the reviewed puzzle-specific saving preference. The compact redesign, panel behavior, and current-game progress reset are already published.

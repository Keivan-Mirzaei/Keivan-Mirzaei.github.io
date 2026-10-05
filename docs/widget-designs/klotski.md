# Klotski widget design sheet

**Status:** Reviewed and published on 4 October 2026. The reviewed puzzle-specific saving update is approved for publication.

Follow the [widget roadmap](../widget-requirements.md) and the reviewed Hex arrangement. This migration covers `/puzzles/klotski/`.

- **Name and stable ID:** Klotski; `klotski`.
- **Subject and activity type:** Sliding-block puzzle; spatial reasoning.
- **Purpose / primary interaction:** Drag blocks through empty space until the marked square reaches the bottom-centre exit. Selecting a block and using arrow keys provides the keyboard alternative.
- **Title:** The puzzle page supplies “Klotski.” Use the shared interface font; omit the repeated sidebar title and board statistics.
- **Visible controls:** Undo, Redo, Reset, Settings, Info, in the same order as Hex. Show every action's short label. No Shuffle, difficulty selector, hints, or decorative block numbers are needed for this one classic arrangement.
- **Settings:** Save progress is a toggle switch. There are no bounded parameters requiring sliders.
- **Supporting panels:** Reuse Hex's panel controller. Settings and Info start closed, toggle with the same button, close with Escape, and are mutually exclusive. Keep them open during outside taps, clicks, and scrolling so they can be read on a phone. Expand below the controls without covering the board. Never save panel visibility.
- **Necessary feedback:** Keep the short interaction instruction, move count, goal, and exit marker visible. Show a concise message for blocked keyboard moves. Block positions and dimensions have accessible names rather than visible numbering.
- **Completion:** The 2 × 2 target must reach column 2, row 4 on the 4 × 5 board. Tint the tray and status green, outline the target, and announce “You found the way out!” with the exact move count. Stop further moves after completion. Undo or Reset clears the effect; Redo or undoing Reset restores it when appropriate.
- **History:** One completed drag is one move, including a multi-square slide. Each arrow-key move is one move. Cancelled or blocked actions do not enter history. A successful new move clears Redo. Keep at most 1,000 actions.
- **Reset:** Restore the classic starting arrangement and zero moves. Keep the saving preference, and retain Reset as one undoable action. Undo restores the preceding layout, move count, and completion state; Redo restores the reset. Reset is disabled when already at the start with zero moves. Cancel an active drag safely before history actions.
- **Saving:** Use the shared puzzle-storage service with a separate Klotski preference on this device, enabled by default. Restore the board, move count, Undo, and Redo, including Reset history. Read older position-only saves with their original counters. Turning saving off clears only Klotski's retained progress and stops future saves; the current game remains playable. Reset progress confirms before clearing only this game's board and move history; retain saving and leave other puzzles' preferences and progress alone.
- **Presentation:** The board leads, the controls follow it, and support panels use the same spacing, labels, switches, and focus conventions as Hex. A reusable frame stylesheet supports subsequent puzzle migrations.
- **Narrow screens:** Keep all blocks large enough to drag, wrap controls, and fit the board within the page. Scale the board for shorter viewports. Respect reduced motion.
- **Formula typesetting:** This puzzle needs only exact counts and simple board dimensions such as 4 × 5 in the interface font. No formula renderer is needed.
- **Mathematical assumptions:** Blocks translate without rotation, overlap, or leaving the board. A long drag checks intermediate positions, so it cannot jump over another block. Only the marked square is the goal.
- **Checks:** Legal and blocked moves; drag capture and cancellation; keyboard play; a complete classic solution; completion effects and reversal; Reset/Undo/Redo counters; old and new saves; panel dismissal; desktop and narrow layouts.
- **Next step:** Publish the reviewed puzzle-specific saving preference. The redesign and current-game progress reset are already published.

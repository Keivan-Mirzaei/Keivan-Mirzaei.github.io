# Cube cuts

- **Stable ID:** `cube-cuts`; embedded proof walkthrough.
- **Purpose:** See why the middle cube needs six separate cuts, then verify that the same six planes separate the whole cube into 27 unit cubes.
- **Primary controls:** A shared text View dropdown, Previous, and Next cut. Both views share the current step. Sequence navigation supplies reversal; a separate Reset or Undo/Redo would duplicate it.
- **Feedback:** Exact cut count, remaining attached neighbours in the middle-cube view, and piece count in the whole-cube view. The last cut turns the stage green; going back removes this effect.
- **Supporting panel:** Shared Info disclosure, initially closed, with the usual Escape behavior.
- **Presentation:** SVG diagrams, no external graph libraries or ongoing animation. The yellow middle cube and six green neighbours appear in an explicitly labelled exploded view. Whole-cube gaps appear only along completed cuts. The dashed plane denotes the latest cut.
- **Fallback:** Prepared whole-cube and middle-cube figures. Controls appear after initialization. The statement, hint, and solution remain readable without JavaScript.
- **Saving:** None needed for a seven-step reading aid.
- **Mathematics:** Unit cubes remain intact; all six planes are distinct face planes. Two cuts in each of three directions produce 27 cubes. Rearrangement or stacking cannot put two faces of the intact middle cube in the same plane.
- **Review status:** Reviewed and approved for publication by Keivan on 5 October 2026, with medium problem difficulty.

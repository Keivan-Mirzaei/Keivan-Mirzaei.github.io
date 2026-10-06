# Site-wide widget polish

**Status:** Implemented and checked. Keivan authorized publication of the complete pending site update on 5 October 2026.

Keivan’s scope is all website widgets, including articles, lessons, diagrams, and puzzles. The [roadmap](../widget-requirements.md) governs each family. Optional controls remain optional; informative diagrams do not acquire game controls or saving merely to fill the frame.

## Shared behavior

- One interface font, restrained borders, consistent titles, large touch targets, and responsive spacing.
- Buttons beside labeled dropdowns align with the dropdown box and share its height. On phones, the Cevian action and dropdown stack at the same width, with aligned left and right edges.
- Named alternatives use labeled native dropdowns with the selected option visible. Native menus support keyboard selection and familiar phone interaction while keeping the interface compact. Numeric quantities retain sliders, and on/off preferences retain switches. Each changed selection remains one reversible action where history is useful.
- Info, Settings, tables, and solution disclosures start closed. Their own trigger and Escape close them; tapping outside, scrolling, and playing leave them open. Opening another support panel closes the current one. Info occupies normal layout space.
- Relevant activities have Undo and Redo. Slider gestures commit once, Reset and Shuffle are reversible, and a new committed action clears Redo.
- Fixed and changing structured formulas use native MathML: complete radicals, fractions, subscripts, and powers, without a formula dependency at startup. Existing article prose retains the site’s renderer. Plain numbers and short symbol labels need no extra formula library.
- Approximate outputs usually use three significant digits. Small nonzero results use scientific notation with a true superscript. Exact counts and domain decisions remain exact.
- Completion uses a restrained green field plus readable feedback and clears when Undo or another change leaves the goal.

## Dropdown design follow-up

All eight dropdown controls now use the shared component from the [element standards](../element-standards.md#dropdowns), with text choices by default and reusable woven marks for the two difficulty menus. Grouped board choices, long labels, keyboard navigation, Undo/Redo, saved difficulty, and 320px layouts were checked locally. The native select remains the fallback and source of values. Keivan authorized publication of this follow-up on 5 October 2026; the verification below describes the earlier site-wide update.

## Coverage and activity decisions

| Family | Placement and changes | Relevant exceptions |
| --- | --- | --- |
| Function machine | Functions lesson; real log formula, exact domain checks, readable **Undefined**, concise input errors, neutral empty input, meaningful tiny results. | Direct evaluation needs no history, saving, or settings. |
| Derivative | Rates lesson; shared frame, grouped slider history, Redo, accurate undefined quotient at zero, shorter numeric feedback. | The limiting tangent stays visible when the secant is undefined. |
| Differentiability | Definition and local-linearity lessons; function dropdown, properly typeset live formulas and scaled coordinates, scientific zoom radius, reversible exploration. | Finite sampling does not prove differentiability, so there is no artificial completion colour. |
| Quadratic | Reusable template; shared frame, real powers in live equations, parameter history and a hideable value table. | No current published placement. |
| Bayes | Reusable template; shared frame and reversible fault-rate exploration. | Expected counts remain exact for the chosen whole-percent slider; no current published placement. |
| Card trick | Reusable template; Redo and a clear completed reveal. | Card numbers are essential to this activity. No current published placement. |
| Three cups | Reusable template; consistent controls, Undo/Redo and undoable Reset. | The requested three-up state is impossible; never show a false success. No current published placement. |
| Random walk | Reusable template; shared frame, shorter feedback, reversible new paths, Reset preserves the current path, reduced-motion stepping and offscreen pause. | No current published placement. |
| Scientific plot | Reusable template; consistent controls, reversible pan/zoom/rotation and Reset; static preview and explicit renderer loading retained. | Closing the heavy interactive view releases its renderer and starts fresh when reopened. No current published placement. |
| Sphere slice | Reusable template; typeset sphere equation, shared controls, slice/view history and undoable Reset. | Same explicit renderer lifecycle and static fallback as scientific plots. No current published placement. |
| Magician | Audience, probability microscope, and routes; see the separate design sheet. | The microscope retains extra precision because its tiny ripple is the phenomenon being explained. |
| Cevian triangles | All six linked diagrams; shape dropdown, labeled position/rotation outputs, shared frame, Redo, mathematical radical, centroid completion colours. | The proof diagrams deliberately share the explorer’s state within this article. Shape is preserved by Reset; simplex Reset restores its initial weights and angle. |
| Article Lights Out | Both widgets share the puzzle’s amber board renderer, graph definitions, arrow navigation, controls, and Settings/Info panels. Board/Goal choices, editable starts, reversible actions, solution alternatives, and induction remain available. | Numbers are optional during play and appear while editing or following a plan; proof numbers remain necessary. Demonstration history is separate from saved numbered-puzzle progress. |
| Three utilities | Plane routing, mug transformation, and glued-square construction; shared frame, history/Redo, pipe-tracing dropdown, offscreen playback pause, nine-pipe completion on the glued square. | Nine crossing-free pipes on the plane are impossible, so that panel cannot claim success. |
| Hex | Reviewed standalone and embedded game retained; coastline proof gets shared frame/Redo and one Reset for the walk. | Resetting the walkthrough keeps its current colouring; Shuffle changes colouring. |
| Klotski | Reviewed standalone puzzle retained and checked with the shared layer. | Its own saving preference and selected-size progress reset remain unchanged. |
| Graph Lights Out | Reviewed standalone puzzle retained; named difficulty levels now use dropdowns. | Its graph-specific progress remains separate from the article demonstration. |
| Floor tiling | Reviewed standalone puzzle retained; named difficulty levels now use dropdowns. | Both tray layouts, fixed boundaries, and per-difficulty saving remain. |
| Four equal regions | Reviewed standalone puzzle retained and checked with the shared layer. | No numbered lines; success requires every count to equal n and no boundary point. Saving/reset remains scoped to n. |
| Tilted square | Legacy registry entry with no active template or published widget. Shared frame stylesheet is available if reinstated. | No unused controls or new public placement added. |

## Review before publishing

Review the local articles, lesson widgets, and puzzles at desktop and phone widths, with supporting panels open and closed. Confirm mathematical state, reversible resets and shuffles, completion appearance/removal, and the original puzzle saving rules. There is no public widget catalogue or new page added by this migration.

## Verification

- All 260 JavaScript tests, six Python checks, and the site’s build, link, search, feed, and sitemap checks pass.
- Dropdown history checks cover native committed selections, immediate Undo/Redo, and unchanged choices that preserve Redo.
- Browser checks cover Cevian and simplex completion/history, lesson function choices and formulas, exact domain rejection, tiny nonzero output, article Lights Out solution/board history, utilities tracing/routing/transformation, and Hex coastline history.
- The reusable quadratic, Bayes, card, cups, random-walk, plot, and sphere templates were exercised on a temporary local test page. That page was removed before the final build.
- Scientific plot zoom and Reset reverse correctly; sphere slice history restores both valid and empty intersections. Both renderers loaded without console errors.
- All five published puzzles were checked with Settings open at a 320-pixel viewport. They fit without horizontal page overflow. Hex’s panel stayed open after an outside tap.
- Named choices were rechecked at 320 pixels: Cevian shapes, function examples, article board types, dynamic pipe routes, and the two puzzle difficulty dropdowns fit without horizontal overflow. Shape, board, and difficulty changes reverse correctly with Undo.
- Cevian button/dropdown alignment was measured in the browser: both boxes are 44 pixels high with identical top and bottom edges on desktop. At 320 pixels they stack with identical left and right edges and no horizontal overflow.

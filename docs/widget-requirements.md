# Website widget design roadmap

**Status:** Working design standard based on Keivan's reviewed requirements.

This is the reference for interactive widgets in articles, lessons, and standalone activities. Use it to design and review prototypes and to update existing website widgets. Website migration proceeds locally, one puzzle at a time, with Keivan reviewing each before publication.

## 1. Design principles

- Keep widgets unified and structured as their number grows.
- Prefer minimalist designs. Give the activity itself the most attention.
- Include an element **only when that particular activity needs it**. A shared frame is a set of available places, not a requirement to fill every place.
- Possible elements include Undo, Redo, Reset, Shuffle, Settings, Info, inputs, sliders, feedback, a title, and a subtitle. None is universally required.
- Make the interface neat, tidy, aligned, purposeful, and visually considered. Appearance is an important part of the design.
- Use one consistent interface font for headings, controls, labels, numeric outputs, and diagrams.
- Typeset mathematical expressions properly, with complete radical bars, fractions, and powers rather than rough text substitutes. Use the typesetting system's matching mathematical fonts so symbol shapes and spacing are correct; do not force the interface font onto formulas. Follow the choices in Section 7.
- Prefer 2–3 significant digits for approximate numeric outputs when additional precision is unnecessary. Keep counts exact and retain the internal precision needed for correct mathematics.
- Avoid duplicated explanations, decorative badges, unnecessary statistics, empty layout slots, and controls that do not serve the activity.
- Use brief visible text for controls where helpful, with consistent labels and icons for common actions.
- Prefer sliders over dropdowns. Use a slider for a bounded value or ordered choice and show its current value. Any necessary exception should be explained in the design sheet.
- Use toggle switches for on/off options instead of visible checkboxes.
- Keep the activity unobstructed. Omit unnecessary numbering, labels, and oversized handles, particularly when they cover points, lines, or other important content.
- When an activity has a meaningful goal, make achievement visibly clear with a restrained colour effect and a concise confirmation. Remove the success effect if the current state no longer meets the goal.

## 2. Supporting panels

These rules apply to Settings, Info, Help, tips, hints, and similar supporting content:

- All supporting panels start closed.
- Use the same trigger to open and close a panel; do not add a separate Close or Done button by default.
- Clicking outside a temporary panel closes it.
- Opening one supporting panel closes the other open panel.
- Users can hide supporting content after reading or using it and reopen it when needed.
- Closing a panel preserves the activity and the user's work.
- Closed panels release their layout space. Open panels do not obscure the main interaction or essential controls.
- Do not remember panel visibility across visits, even when activity progress is saved.
- Keep primary interactions usable without repeatedly opening instructions.
- Retain the necessary feedback that helps users learn or interact. Do not hide an essential result, current turn, or relevant input error with optional information.

## 3. Optional controls and behavior

Render only relevant controls. A relevant action can be temporarily disabled; an unsupported action should be omitted.

| Element | Use when | Design rule |
| --- | --- | --- |
| Title | The activity needs its own identity | Use a short title; omit a redundant heading. |
| Subtitle | A short purpose or question helps users begin | Keep it brief and useful. |
| Undo | Reversing an action is helpful | Restore the previous meaningful state. One slider adjustment or drag is one action; games may undo a move or a full turn. |
| Redo | Reapplying an undone action is helpful | Restore that action; a new edit clears the redo path. |
| Reset | Returning to the start is helpful | Define exactly what returns to its starting state. Preserve settings and make Reset undoable. |
| Shuffle / New example | Different examples serve the activity | Create a new configuration. Preserve settings and make Shuffle undoable. Keep its meaning distinct from Reset. |
| Settings | Occasional options would clutter the main interface | Put them in a toggleable panel that starts closed. Explain changes that restart an activity. |
| Info / Help | Rules or context are needed | Use a short, hideable explanation. Avoid duplicate panels with the same purpose. |
| Tip / Hint | Guidance supports learning or progress | Reveal it only when useful or requested; allow it to be hidden. |
| Input | Entering an exact value or expression is useful | Provide a clear label and concise validation. |
| Slider | Exploring a bounded parameter or ordered choice is useful | Prefer it over a dropdown; show a concise current value and units where relevant. Do not pair it with an exact-value input unless both are needed. |
| Toggle switch | An option has an on/off state | Use a clearly labelled switch rather than a visible checkbox. |
| Feedback | A result or change supports learning or interaction | Show only necessary feedback and keep it visible while relevant. For an applicable goal, use a clear colour effect together with a brief success message. |
| Play / Pause | An activity runs over time | Let the user start and stop it deliberately. |
| Previous / Next | An explanation has a meaningful sequence | Make the current step clear and support useful navigation. |

Use familiar action ordering as a starting point: **Undo, Redo, Reset, Shuffle**, followed by **Settings and Info**. Omit unused actions without leaving gaps. Give activity-specific primary actions a clear place of their own.

## 4. Saving progress

- Saving is optional and enabled by default for activities where saving progress makes sense.
- Put the saving preference in Settings rather than adding it to the primary interface.
- Save the activity state and relevant settings, not the visibility of supporting panels.
- Turning saving off stops retaining progress for later visits. The current activity remains usable.
- A prototype may use the conversation's state storage; a future website version should use the site's shared storage service.
- Reset and Shuffle preserve the saving preference and other settings.

## 5. Shared design and activity types

- Use a shared frame with optional places for context, interactive content, controls, necessary feedback, and supporting panels.
- Keep spacing, alignment, controls, icon treatment, focus behavior, and responsive behavior consistent.
- Start with four activity types: **parameter explorers, simulations, proof walkthroughs, and games**.
- Let each type use a layout suited to its interaction while following the common design rules.
- Support embedded presentation for articles and lessons. Focused presentation is mainly useful for puzzles, games, and simulations.
- Reuse the same activity logic between presentations and preserve state when switching.
- On narrow screens, keep the activity usable, wrap or stack controls, and avoid horizontal page scrolling.

## 6. Organization for future implementation

- Maintain one internal widget registry with stable IDs, assets, activity types, subjects, supported controls, and useful example metadata.
- **Do not add a public activity catalog or an author preview gallery.** Neither is part of the desired website structure.
- Keep each widget's markup, browser behavior, mathematical model, styles, example, and relevant tests easy to find under a consistent name.
- Separate mathematical rules from interface handling where useful.
- Provide a starter template and a short authoring guide based on reviewed prototypes.
- Share loading, resizing, supporting-panel behavior, storage, and common history services when appropriate. Keep game-specific turn rules in the game.
- Give each instance independent state. Connect related diagrams explicitly when they are intended to share state.
- Define a consistent way to initialize and clean up event listeners, animations, workers, and heavy renderers.
- Load only what is needed. Delay expensive views until needed and avoid ongoing work when the activity is inactive.
- Offer a useful static preview or explanation when interaction is unavailable, with a recovery action when appropriate.

## 7. Formulas and scientific notation

The one-font rule applies to the interface. A mathematical font is appropriate when the notation needs mathematical letterforms, spacing, or structure. Choose by the expression's needs, and keep the result visually consistent with the surrounding interface.

### Choose the simplest suitable treatment

| Content | Treatment | Examples / rule |
| --- | --- | --- |
| Ordinary labels, counts, and standalone numeric values | Use the shared interface font. | Input, Output, 12 points, 0.866. Use aligned numerals for changing values where helpful. |
| Short symbols or simple powers | Use semantic inline notation if it renders clearly; use the shared math renderer if spacing or structure becomes awkward. | x, x², cm². Distinguish mathematical variables from unit symbols. |
| Structured formulas | Use proper mathematical typesetting with its matching math font. | Square roots, fractions, subscripts and superscripts together, sums, integrals, matrices, and equations. Radical bars must cover the complete expression; exponents must be placed correctly. |
| Very small or large numeric results | Use scientific notation when ordinary decimal notation becomes unwieldy or hides useful precision. | Display 1.23 × 10⁻⁶, with a true superscript exponent and multiplication sign. Numeric outputs can retain the interface font when this notation is clear. |
| Scientific notation inside an equation | Typeset the entire expression consistently with the math renderer. | Keep the coefficient, multiplication sign, power of ten, variables, and units properly spaced and aligned. |

### Notation and precision

- Write mathematical variables in the appropriate italic style; write units and named functions in upright style. Use the renderer's notation conventions rather than styling each symbol by hand.
- Separate a numerical value from its unit with a nonbreaking space where appropriate. Keep a value, its exponent, and its unit together when wrapping.
- Prefer ordinary decimal notation for readable everyday values. Use a leading zero for values such as 0.5.
- Use × 10 with a superscript exponent for visible scientific notation. Input fields may accept forms such as `1.23e-6` when relevant; distinguish editable input syntax from the typeset output.
- In scientific notation, use a coefficient with magnitude from 1 up to, but excluding, 10 for nonzero values. Use engineering notation or SI prefixes only when they help the activity, and document that choice.
- Keep the agreed 2–3 significant digits for approximate outputs. Choose decimal/scientific thresholds consistently for the activity, handle rounding across those thresholds, and retain meaningful trailing zeros when they communicate precision.
- Round for display only. Keep counts and exact results exact, and show an approximation mark when a displayed mathematical result has been rounded. Do not turn a small nonzero result into a displayed zero merely to shorten it.
- Keep **Undefined** as a readable output when the function is not defined. Typesetting must not hide or replace the relevant domain error.

### Rendering and layout

- Use one shared mathematical typesetting approach for future website widgets. Reuse the site's renderer where suitable instead of introducing a separate formula library for every widget.
- For fixed formulas, prefer a prepared, self-contained rendering when it avoids extra startup work. Preserve the editable source expression and an accessible text alternative. A vector rendering can keep the correct symbol shapes without requiring a formula script to run in the preview.
- For formulas that change with user input, use a renderer suited to live updates. Keep mathematical evaluation separate from display formatting, and update only the expressions that changed.
- Never approximate a structured formula by combining a Unicode radical with a manually drawn bar, or force the interface font onto typeset math. Use a rendering with correct geometry from the start.
- Match the surrounding text's scale, colour, and baseline while preserving the renderer's symbol proportions. Avoid oversized formulas and arbitrary font changes between widgets.
- Give displayed formulas useful accessible names or semantic math. Hide duplicate visual representations from assistive technology, and keep text alternatives available if rendering is unavailable.
- Fit formulas and scientific notation at narrow widths without clipping or overlapping controls. Split long expressions at meaningful mathematical boundaries or use a separate formula row when necessary.
- Check rendering in the actual target environment, including the conversation preview for prototypes. A formula dependency must not prevent the widget from starting; fixed formulas should be visible immediately, and live formulas need a readable fallback.
- Do not add a notation or typesetting setting unless choosing it serves the learning activity.

## 8. Accessibility and correctness

- Support keyboard and touch interaction with readable text, visible focus, adequate contrast, and useful control labels.
- Do not rely only on color or hover to communicate results or actions.
- Pair completion colours with a readable confirmation and an accessible announcement. Trigger success only when the actual goal is met, including any boundary conditions, and keep the result legible.
- For function evaluators, show **Undefined** when an entered value has no defined output, together with the relevant error. Leave an empty input in a neutral state.
- Respect reduced-motion preferences and avoid unnecessary animation.
- Check desktop and mobile layouts with supporting panels both open and closed.
- Verify the mathematical behavior and nontrivial history, saving, linked-state, and loading behavior affected by a change.

## 9. Roadmap

| Stage | Work | Ready to move on when |
| --- | --- | --- |
| Establish the design standard | Maintain this document as the reference for reviewed preferences. | The rules reflect Keivan's expectations and any exceptions are explicit. |
| Build the first prototype | Explore dividing 4n points into four regions of n points with two movable, rotatable lines. Keep the prototype outside the website. | The mathematics, direct manipulation, counts, supporting panels, history, and saving work together in a clear interface. |
| Review and refine | Review appearance, discoverability, control placement, feedback, and mobile behavior in conversation. Update the prototype and this roadmap from feedback. | Keivan is satisfied with a common design direction. |
| Define the reusable starter | Extract the frame, optional controls, panel behavior, history conventions, formula rendering, and numeric formatting. Document one small example for each needed activity type. | New widgets can follow the standard without copying activity-specific logic. Fixed and changing formulas, scientific notation, and accessible alternatives work in the target environment. |
| Apply to future website work | Integrate approved widgets and shared services when website changes are requested. | A new widget meets the review checklist and fits its page. |
| Migrate existing widgets gradually | Update existing widgets when relevant work is requested, using representative explorers, simulations, walkthroughs, and games. | Shared behavior improves consistency while preserving each activity's mathematical rules. |

The first website migration is **Hex**, covering its standalone puzzle and the same game embedded in the Hex article. See [its design sheet](widget-designs/hex.md). Keivan reviewed and approved this implementation on 4 October 2026 and authorized publication. Continue with Klotski, Lights Out, and Floor tiling, one at a time; prepare and check each implementation for Keivan's review before publishing it. The earlier conversation prototypes remain useful references.

## 10. First prototype: four equal regions

- **Stable ID:** `four-equal-regions`.
- **Type:** Parameter explorer with a puzzle-like goal.
- **Purpose:** Place and rotate two crossing lines so that each of their four regions contains exactly n of the 4n points.
- **Primary interaction:** Drag lines to place them and use rotation sliders below the point field. The crossing can move both lines together without a visible overlay. Provide keyboard alternatives.
- **Necessary feedback:** Show each region's exact count and the target n. When all four counts equal n and no point is on a line, turn the field green and show an “Equal split” confirmation. Clear that effect if the partition changes. Treat points on a dividing line explicitly rather than silently assigning them to a region.
- **Controls:** Undo, Redo, Reset, Shuffle, Settings, and Info are useful for this activity. Do not add playback or step controls.
- **Settings:** Choose n from 1 to 12 with a slider. Use toggle switches for perpendicular lines and saving progress. Keep these occasional options outside the main interaction.
- **Panels:** Settings and Info start closed, toggle closed, close on outside interaction, and are mutually exclusive.
- **History:** A drag is one action. Reset restores the starting line arrangement for the current point set; Shuffle creates another point set. Both preserve settings and can be undone.
- **Appearance:** One font, concise numeric labels, a dominant point field, aligned controls, and restrained styling. Do not number the lines or place opaque handles over the points; distinguish independently controlled lines by their solid and dashed styles.
- **Geometry for this prototype:** Start with perpendicular lines that rotate together; allow independent rotation in Settings. In independent mode, keep the lines at least 12° apart. The preferred default remains a design-review decision. Two parallel vertical lines cannot form four regions.
- **Review scope:** Show and refine the prototype in conversation before deciding on website integration.

The first prototype is ready for design review. Mathematical checks cover 72 generated point sets across n = 1–12, exact equal partitions, boundary handling, and rotation invariance. Interaction checks cover dragging to a completed partition, slider and keyboard rotation, independent rotation, Undo/Redo, the completion colour appearing and clearing correctly, undoable Shuffle, panel dismissal, settings preservation, optional saving, and narrow-screen layouts.

## 11. Review checklist for each widget

- [ ] The purpose and primary interaction are clear.
- [ ] Every visible element serves this activity.
- [ ] Sliders replace dropdowns where the choice can be expressed meaningfully; on/off options use toggle switches.
- [ ] The main content dominates; spacing, alignment, and typography are consistent.
- [ ] Formulas use suitable typesetting with correct radicals, fractions, exponents, spacing, and accessible alternatives.
- [ ] Decimal/scientific notation, significant digits, approximation marks, and units follow a consistent policy; small nonzero results remain meaningful.
- [ ] Formula rendering works in the target environment and fits narrow screens without blocking startup or clipping content.
- [ ] Labels, numbering, and handles do not obstruct the activity.
- [ ] Necessary feedback stays visible and numeric precision is appropriate.
- [ ] Applicable goals have a visible colour effect and accessible confirmation, including correct removal when the goal is no longer met.
- [ ] Supporting panels follow the agreed open/close rules.
- [ ] Reset and Shuffle preserve settings and are undoable where present.
- [ ] History follows meaningful user actions, not every animation frame or pointer movement.
- [ ] Saving is optional and enabled by default where applicable.
- [ ] Keyboard, touch, and narrow-screen use are supported.
- [ ] Mathematical behavior and important state transitions have been checked.
- [ ] Any exception to this roadmap is documented and reviewed.

## 12. Per-widget design sheet

Copy this section for a future widget and remove fields that are not useful.

- **Name and stable ID:**
- **Subject and activity type:**
- **Purpose / primary interaction:**
- **Needed title or subtitle:**
- **Visible controls and their order:**
- **Slider ranges and toggle-switch options, if applicable:**
- **Supporting panels:**
- **Necessary feedback:**
- **Formula typesetting and editable source expressions, if applicable:**
- **Numeric precision, units, and decimal/scientific notation policy, if applicable:**
- **Goal / completion condition and visible success effect, if applicable:**
- **History / Reset / Shuffle behavior, if applicable:**
- **Embedded / focused presentation, if applicable:**
- **Saving behavior, if applicable:**
- **Mathematical assumptions and boundary cases:**
- **Exceptions to the standard:**
- **Example and checks needed:**
- **Review notes / next decision:**

# The magician’s problem widget design sheet

**Status:** Article-widget polish implemented and checked. Keivan authorized publication with the complete pending site update on 5 October 2026.

Follow the [widget roadmap](../widget-requirements.md). This covers the audience simulation, probability microscope, and route comparison in `/notes/magicians-problem/`.

- **Purpose:** Try one audience run, magnify a persistent probability ripple, and compare two growing audience sequences. Keep these distinct mathematical roles clear.
- **Frame:** Reuse the compact shared frame, interface font, labelled icon controls, and inline Info panels. The diagrams dominate. Remove decorative badges and duplicate explanatory captions.
- **Audience:** Retain 64 people and independent fair guesses. Filled dots stand; outlined dots sit. Flip a round is the primary action. Undo, Redo, Reset, Shuffle, Info follow. Exactly one standing person tints the field and feedback green with readable success text; zero ends the run with a neutral explanation. Undo, Reset and Shuffle clear the success effect when applicable.
- **History:** Restore exact seeds and rounds. Reset returns to the start of the same run; Shuffle creates another run. Both are undoable. Keep at most 60 entries. New meaningful edits clear Redo; no-op edits leave it intact.
- **Probability view:** Magnify the ripple is a toggle switch. Show one main graph at a time. Switching views preserves position and the audience window, stops playback, and does not create a history action. Reset preserves the chosen view. Info stays open until its own trigger or Escape closes it.
- **Microscope controls:** A slider over six doublings with a current value; Follow / Pause the ripple and Jump 20 more doublings when magnified. Undo/Redo records a complete slider gesture or playback interval, not frames. Reduced motion uses a quarter-cycle step. Stop animation when hidden, offscreen, switching views, or disposing the widget.
- **Precision:** The overview uses about 72.13%. The microscope intentionally keeps seven decimal places in the percentage, and two decimals in the difference in ppm; ordinary 2–3 significant digits would erase the phenomenon. Preserve smaller nonzero differences with three significant digits and superscript scientific notation below 0.001 ppm. Display approximation marks for rounded results. Exact rounds, people, and powers of two remain exact.
- **Typesetting:** Exact powers use proper superscript characters. The route legend’s fixed square root uses semantic native MathML with a complete radical, an accessible name, and a matching math font. Do not load a formula library for this small fixed expression.
- **Panels:** Info starts closed and occupies space below the controls. Outside taps, scrolling, and activity changes leave it open. Escape returns focus. Each instance has its own panel and chart IDs.
- **Saving:** Omit saving and Reset progress: these short illustrative simulations and graph views intentionally restart on a new visit. There is no completion catalogue to retain. Do not add Settings without a useful option.
- **Routes:** Keep the comparison readable and static. Native SVG scales to the container, with fewer axis labels on phones. No action controls are useful here.
- **Checks:** Exact replay; success, empty run and reversal; Undo/Redo, Reset/Shuffle; view changes without state loss; slider grouping/cancellation; playback grouping, reduced motion and inactivity; independent instances; correct chart clipping; readable formulas, Info panels, and phone layout.
- **Following work:** Cevian triangles and Three utilities now use the same conventions, as documented in the site-wide review sheet.

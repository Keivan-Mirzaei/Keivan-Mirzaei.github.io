# Writing, artwork, and interface standards

These are the conventions for maintained content and reusable components. [Writing](writing.md) explains the file formats; [the directory map](site-map.md) locates the implementation.

## Writing

Use **bold** when first introducing or defining a term or concept, *italics* for emphasis, and marker highlights sparingly for especially useful takeaways. Avoid using bold as general emphasis. In learning topics, keep highlights out of warnings.

State straightforward questions and assumptions directly. Explain the key insight and every non-obvious inference; remove repetition and routine detail that does not help the reader. Briefly introduce unusual prerequisites where needed. Let the topic determine length and structure.

An exploration develops significant observations, attempts, obstacles, and arguments. Each example, experiment, and return to an earlier example should add something. Include a failed attempt when it motivates the next approach. Distinguish conjectures, numerical evidence, informal explanations, and proofs. Keep the essential argument readable without operating a widget.

Use hints, alternative solutions, extensions, data, and code only when they add a distinct insight. Problems keep their statement visible and supporting material in independent disclosure rows: Hint, Solution, Another solution, Extension. Omit absent rows. They start closed, open inline, stay open during outside interaction, and close with their own trigger or Escape.

Optional lesson proofs and derivations use the soft inset style when expanded: a contrasting paper surface with modest padding, rounded corners, and a fine divider beneath the summary. The whole optional passage must have a clear visual end before the lesson continues.

Give cited figures and equations stable anchors and concise names. Number equations only when referred to later. Use one reference convention within each article; separate article reference labels from labels inside a diagram. Captions explain how to read the visual; the surrounding argument interprets it.

## Visual consistency

Catalogue and section pages use the shared `page-wrap`, `page-heading`, and `page-description` styles. Page titles share `--page-title-size`, including its smaller phone size. Keep the home hero and compact activity headings suited to their roles.

Learning control defaults use zero-specificity scoping so button, answer-choice, and widget classes retain their intended colours and typography. Quiz and Problems cards share `--practice-surface`. Figures preserve their natural aspect ratio when resized. Longer lesson explanations retain the established serif reading style; interface text uses the shared sans-serif family.

Numbered and bulleted lists in lesson prose match the surrounding paragraphs in typeface, size, and line spacing. Show a figure with a worked example when it helps explain the geometry, compare behaviours, or identify candidate points.

All tables use **Book style**, defined once in `assets/css/site.css`: thin green top and bottom rules, a light divider beneath the header, open body rows, and no vertical gridlines or coloured fills. Use the shared sans-serif labels and MathJax mathematics, with text aligned left, comparison columns centred, and numerical totals aligned right. Wrap tables in a labelled, keyboard-focusable `.table-scroll` region so wider tables scroll within the page on phones. Lesson and activity styles should not override the shared table appearance.

Quizzes show feedback as soon as an answer is chosen; choosing the same answer again clears it. Do not add a separate check or clear button. Save quiz answers and the current question in this browser, matching saved answers to unchanged question content. Save Problems study labels and the current problem, while leaving hints and solutions closed on a new visit.

## Graph axes

Put each graph's live feedback directly below that graph in a soft strip with centered, wrapping values. When a widget contains several graphs, keep each feedback bar with its corresponding graph. Keep point-local feedback near its point when that placement is useful.

Use barely-there axes (style A), giving each numbered axis value a fine tick and omitting unnecessary additional ticks. Axis labels identify coordinates or measured quantities, with units where appropriate. Identify functions through curve legends or direct labels; for a standard function graph, use horizontal `x` and vertical `y`, with the curve named separately.

Use the lesson’s MathJax typography for mathematical expressions everywhere, including graph labels, live readouts, units, captions and static figures. Render roots, powers, fractions and derivative primes structurally; do not substitute plain text or Unicode approximations for typeset mathematics.

Place legends in reserved space above each graph, outside the plotting area where they cannot cover a curve, point, axis or numbered tick. Keep live feedback bars below the graphs. Tangents use solid lines; use opacity and colour to distinguish overlapping lines, and match the legend samples to the plot.

Use the shared soft sage legend strip with muted labels, MathJax expressions, and matching line or point samples. Put derivative facts and classifications in the figure caption.

Draw dashed legend samples with SVG using the plot's dash lengths, stroke width, and line caps. Keep these strokes from scaling so the samples continue to match on smaller screens.

When a point already controls a numerical quantity, use dragging and keyboard input on that point. Do not add a duplicate range slider for the same quantity.

## Content artwork

Use one identifying mark per exploration or puzzle. Depict its distinctive mathematical object, formula, or playable configuration; omit decorative labels and unnecessary detail. Use the site's paper, ink, and green palette, matching typography and fine lines. SVGs should be self-contained and legible at their displayed size. Exploration and puzzle thumbnails use a `440 × 410` canvas.

Problems reuse the four difficulty levels in `_data/problem_logos.json`:

| Internal `difficulty` | Large artwork | Small artwork |
| --- | --- | --- |
| 1 | Circle | Triangle |
| 2 | Three-lobed woven knot | Square |
| 3 | Five-lobed woven knot | Pentagon |
| 4 | Seven-lobed woven knot | Hexagon |

Choose for the expected reader's reasoning difficulty, not just length. Use `image` for large artwork and `small_image` for small controls. Course Problems cards show an 18-pixel polygon outline beside the problem number, with an accessible Easy, Medium, Hard, or Expert label. Order a set by the reasoning required, reserving Expert for substantially deeper investigations. Standalone problem posts show neutral shape descriptions, without ratings, difficulty attributes, or decoding tooltips. The About page explains the progression. Do not give each problem a separate image.

Explorations put `image` and `image_alt` in front matter; puzzles put them in `_data/puzzles.yml`. `_includes/content-logo.html` renders marks consistently in headings and lists. Repeated marks beside a title are decorative (`alt="" aria-hidden="true"`); an informative image needs a useful description. Preserve existing image paths when changing the artwork.

## Header and search

Keep the header compact: Home, the current page, navigation, search, and active gadgets. Use 44-pixel control targets, visible focus, truncated long titles, and a search icon on phones. Learning uses a parent-only breadcrumb path with module and submodule numbers, horizontal scrolling, fading edges, and no visible scrollbar. Modules are anchored sections of course contents, with old module URLs redirecting to those anchors. The top bar slides away when scrolling down and returns when scrolling up; keep it available near the top, during keyboard focus, and while mobile navigation is open. Omit decorative labels above headings. Course contents use joined vertical module and horizontal submodule paths in Gentle Slate. Put module numbers to the left of the spine and submodule numbers below their stops. Show the last-visited topic with a double diamond and a smooth amber spotlight along continuous, aligned rails. Keep rows horizontally scrollable, with fading edges and no scrollbar.

Search opens in a native modal with `/`, `⌘K`, or `Ctrl+K`. Support arrows, Enter, Escape, and returning focus. Preserve reading position and active gadgets. Keep the dedicated search page as a fallback.

Group active gadget state and its reveal chevron in one bordered control. Keep Pause/Resume and Stop distinct; expose sound playback and volume separately. The panel starts closed, stays open during outside interaction, and closes through its trigger, close button, or Escape without shifting the page.

## Activity layout and inputs

Range sliders share the O3 style: an inset rectangular track and a light raised handle, defined in `assets/css/sliders.css` and loaded by the main and learning layouts. Keep native keyboard behavior and a visible focus indicator. Show numeric values only when they help the task; omit incidental values such as a zoom multiplier.

Give the mathematical activity the most attention. Include only controls, labels, feedback, and explanation that it needs. Avoid duplicated help, decorative badges, empty slots, unnecessary statistics, and handles that obscure important content. Use one interface font; mathematical expressions use appropriate math typography.

Use sliders for numerical quantities, dropdowns for named choices, and switches for on/off settings. Align adjacent control boxes at the same height and bottom edge. On phones, stack them at matching widths and avoid page overflow.

Dropdowns share the warm paper surface, green text, fine border, rounded corners, and selected sage row with a checkmark. Use text choices by default. Reusable difficulty choices use the small polygon marks; reserve the woven marks for larger artwork. Show a clear label and current selection; retain a native select fallback. Selection closes the menu; Escape dismisses without changing the choice. Keep the value synchronized with history and saved state.

Scope text-selection and native-image-drag protection to draggable boards and plots, including Safari. Capture the pointer, handle cancellation, and preserve selection in article text and editable inputs. Respect reduced motion. Meaningful completion gets restrained colour plus readable confirmation; clear it when the goal is no longer met.

## Supporting panels and history

Settings, Info, and Help start closed. Their trigger toggles them; Escape closes and returns focus. Outside clicks, scrolling, and playing leave them open. Opening another support panel closes the first. Panels occupy normal layout space, preserve activity state when closed, and do not save their visibility across visits. Keep essential results, turn indicators, and input errors visible.

Undo records a meaningful action: one drag, one slider edit, one move, or a full computer turn as appropriate. A new edit clears Redo. Reset and Shuffle preserve settings and are undoable where offered. Short illustrations need no saved progress simply to fill a shared frame.

Saving starts enabled separately for each puzzle and can be switched off without affecting other puzzles. A **Reset progress** control belongs in Settings with an inline confirmation naming the selected difficulty or current game. Clear only that scope's boards, history, and completion records; preserve preferences and other difficulties. Undo must not restore cleared progress. Keep this separate from undoable board Reset.

## Mathematics, loading, and verification

Keep exact counts and mathematical decisions exact. Approximate outputs usually use 2–3 significant digits; round only for display. Keep additional digits where they reveal the phenomenon, such as the magician's probability ripple. Use scientific notation for tiny nonzero values rather than displaying zero. Distinguish calculated values, simulations, and approximations.

Structured formulas need complete radicals, fractions, exponents, and suitable spacing. Widgets use native MathML where suitable; article prose uses the shared MathJax renderer. Keep readable accessible alternatives, and fit formulas at phone widths without blocking the activity's startup.

Register activities once in `_data/widgets.yml`; reuse controls, panels, history, and storage. Each instance has its own state unless linked deliberately. Load heavy views on request and dispose their renderers when closed. Stop inactive animation and release listeners, timers, workers, and observers when leaving a page. Provide a useful static preview or explanation when interaction is unavailable.

Check the mathematical behavior and state transitions affected by a change. Review desktop, phone, keyboard, touch, panel dismissal, dragging, undo, saving, and static reading where relevant. Follow the build and test commands in [README](../README.md#check-and-publish).

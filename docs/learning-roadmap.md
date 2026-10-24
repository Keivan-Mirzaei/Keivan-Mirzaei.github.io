# Learning topics

The chosen template uses guided practice, borderless Soft paper, and a dark green course-contents control at the end of the lesson.

## Author a topic

Use [the starter](templates/learning-topic.md) to fill an existing empty topic in `learning/calculus/<module>/`. Keep its permalink, course key, module key, and position. The shared layout is `_layouts/learning-topic.html`; the hierarchy lives in `_data/learning_courses.json`.

- `title`, `description`, `position`: reader-facing identity.
- `course_key`, `module_key`: connect the topic to the shared hierarchy. Course contents and previous/next navigation are generated from that hierarchy.
- `exercises`: question text, string options, a zero-based integer `correct`, and an explanation in `why`. Omit this list to omit practice entirely.
- `math: true`: enables the existing MathJax renderer for Markdown mathematics.
- `topic_script`: optional URL for a topic-specific widget. Load only a widget actually used by the topic.

Question data supports plain text and LaTeX delimited by `\(` and `\)`. The Quiz shows one question at a time, with numbered choices for question navigation. Selecting an answer immediately shows its result and explanation; selecting it again clears it. Correct and incorrect answers use green and red feedback, while unanswered choices stay neutral. Save answers and the current question in this browser, matching saved answers to unchanged question content. An accessible status announces progress. The no-JavaScript fallback lists questions and explanations.

## Text styling

- Use **bold** for a term or concept when first introducing or defining it, not for ordinary emphasis or repeated mentions.
- Use *italics* for emphasis.
- Use yellow marker highlights sparingly for especially useful takeaways or reusable insights. Do not highlight routine details or entire paragraphs, and keep highlights out of warnings.
- Keep block titles and type labels styled by the shared components; they do not change the meaning of bold in body text.

## Visual vocabulary

- Block-type labels use compact soft-background tags (chosen style I): top right alongside a title, top left when the block has no title. Optional block titles use semibold interface type and a short underline (chosen style J), distinct from serif body text; large serif headings remain reserved for sections.
- Definition: pale sage (`definition`).
- Theorem: pale blue (`theorem`) with a closed `disclosure` labelled “Proof (optional)” when a proof is useful.
- Prerequisite reminders: soft peach (class prerequisite), with an explicit label; place recalled definitions and identities here.
- Keep proofs and derivations collapsed by default, marked optional when appropriate.
- Note: neutral grey (`note`) for supporting interpretation.
- Attention and Warning: shared pale amber (`attention`, `warning`; `caution` remains an alias), distinguished by explicit labels.
- Practice: pale lavender; generated from the topic's exercises.
- Worked examples: always visible in light grey blocks.
- Figures and interactive figures: transparent, with only necessary labels. Graph captions and widget subtitles share one small, centered muted style. Keep a widget’s short interaction instruction inside its container. Widgets disable text selection and native image dragging; draggable points also support keyboard input.
- Do not put highlights inside warnings.
- Proofs may use only facts already established in the course or justified in the proof. Omit a proof rather than silently assume an unintroduced result.
- Use parentheses around a function’s argument and explicit multiplication when an adjacent factor could be mistaken for part of the argument, for example `\cos(y)\cdot y^{\prime}`.
- Use explicit limit notation when evaluating a limit or deriving a derivative. Write primes as superscripts, for example `f^{\prime}(a)`.
- Use familiar contexts and explain scientific terms only when they help the mathematical idea. Quiz questions should test distinct reasoning rather than repeat worked examples.
- Sliders use the shared O3 inset track and light rectangular handle. Show values only when useful to the learner; a zoom control does not need a multiplier.
- Use snapping only where a special point is useful to select, such as an isolated function value. Keep the snap zone small and consistent in screen pixels, with a slightly wider release zone to prevent jitter. Preserve precise keyboard control and Shift-drag to inspect nearby values.
- When interactive information belongs below a widget, put it in a centered soft strip using `widget-readouts`; wrap values neatly on smaller screens.
- Use compact labels beside moving points when they clarify the graph without covering curves, axes or other labels. Keep them non-interactive so they cannot intercept dragging. Put values in the shared readout strip when point labels would obstruct the plot.
- Use the shared soft sage legend strip in reserved space above or below a plot. Match its line and point samples to the graph, including dash patterns, and typeset mathematical labels with MathJax. Use underlined album choices for a small set of graph cases.
- Axes use barely-there lines (style A), with a fine tick for each numbered axis value; omit unnecessary additional ticks. Label axes with the coordinate or measured quantity (and units when relevant); function names identify curves in legends or direct labels, not axes.
- Graphs use green curves, light axes, muted numeric labels without opaque halos, and transparent backgrounds so they blend with their containing block.
- Marker highlights: one yellow ink. Use `<mark>text</mark>`; use `class="math-marker"` around an entire inline mathematical expression. Tall fractions receive a full-height marker. The starter includes math-highlighting examples.
- Optional hints, solutions, derivations, references: inline disclosures; Escape closes the focused disclosure.

Use the optional patterns only when the lesson needs them. Keep new topic content empty until authored and reviewed.

## Navigation

The course control sits in document flow after the lesson and practice. It opens a bottom sheet with a minimal ×. Clicking the dimmed backdrop or pressing Escape dismisses it and returns focus; clicking or dragging inside does not dismiss it. Previous/next links span module boundaries and are omitted at the course boundaries. `/learning/` is the course catalogue, with a thumbnail, course name, and initially collapsed module list.

The template uses a compact learning header matching the site's identity. Main-site navigation has not been expanded. Empty topics remain excluded from the sitemap until real content replaces them.

## Check

Run the repository build and site checks from README. Preview `/learning/` and a calculus topic; check course navigation and sheet dismissal at desktop and phone widths. When lesson content is added, also check keyboard input, proof disclosures, widget dragging and keyboard input, wrong/correct/retry feedback, and practice navigation.

## Module problems

End a module with a Problems submodule after its teaching topics. Use open-response problems to develop methods and applications, including graph interpretation and one or two challenges. Keep hints and complete solutions in separate, closed disclosures. Use only established tools, or introduce a new method explicitly before relying on it. Add the page to the module hierarchy so previous/next navigation and course contents include it. Limits and Continuity, Derivative Foundations, Elementary Functions and Differentiation Techniques, and Applications of Derivatives have authored problem sets; the remaining modules await supervised authoring.

## Applications of derivatives

The fourth live module has eight teaching topics and a fifteen-problem set. Each teaching topic records prerequisites and newly established results in an authoring comment. Quizzes test distinct inferences, domain decisions and misconceptions. The sequence establishes extrema before Rolle and mean value theorems, then uses the mean value theorem to justify derivative sign tests. L’Hôpital’s rule is stated with sufficient hypotheses, with a restricted-case explanation kept separate from the unproved general theorem.

Five visual investigations connect the reading to tangent error, constrained ladder motion, parallel secants and tangents, linked derivative graphs and optimal fencing. All provide keyboard and pointer controls on the moving points and a static SVG fallback. They use the lesson’s MathJax notation throughout; legends occupy reserved space above or below the plot, and tangents are solid with reduced opacity. Duplicate range sliders are omitted. The linked derivative graphs use album choices for the named functions. The curve-sketching lesson aligns the function and both derivatives. Problems combine graphical reading, modelling, bounds, design and proof; hints and full solutions remain separate and closed. Authored learning pages retain the course’s existing sitemap exclusion.

# Learning topics

The chosen template uses guided practice, borderless Soft paper, and a dark green course-contents control at the end of the lesson.

## Author a topic

Use [the starter](templates/learning-topic.md) to fill an existing empty topic in `learning/calculus/<module>/`. Keep its permalink, course key, module key, and position. The shared layout is `_layouts/learning-topic.html`; the hierarchy lives in `_data/learning_courses.json`.

- `title`, `description`, `position`: reader-facing identity.
- `course_key`, `module_key`: connect the topic to the shared hierarchy. Course contents and previous/next navigation are generated from that hierarchy.
- `exercises`: question text, string options, a zero-based integer `correct`, and an explanation in `why`. Omit this list to omit practice entirely.
- `math: true`: enables the existing MathJax renderer for Markdown mathematics.
- `topic_script`: optional URL for a topic-specific widget. Load only a widget actually used by the topic.
- `topic_controls: true`: load the shared control styles and dropdown templates when a lesson needs them. Its controller initializes and disposes the shared dropdowns.
- `epigraph`: give every authored teaching lesson a verified quotation related to its topic, with `text` and `author`. It replaces the visible introductory subtitle; show only the quotation and author's name. Keep `source`, `source_url`, and any translation or attribution notes in the front matter for editing, without displaying references. Use ellipses for excerpts. Retain `description` for page metadata; leave unfinished placeholders and problem sets without a quotation.

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
- Use the soft inset style for all optional proofs and derivations: a contrasting paper surface, modest inset padding, rounded corners, and a fine divider below the summary. Leave space before the lesson resumes. Keep the closed state compact and reduce inset padding on phones.
- Note: neutral grey (`note`) for supporting interpretation.
- Attention and Warning: shared pale amber (`attention`, `warning`; `caution` remains an alias), distinguished by explicit labels.
- Practice: pale lavender; generated from the topic's exercises.
- Worked examples: always visible in light grey blocks.
- Figures and interactive figures: transparent, with only necessary labels. Graph captions and widget subtitles share one small, centered muted style. Keep a widget’s short interaction instruction inside its container. Widgets disable text selection and native image dragging; draggable points also support keyboard input.
- Consolidate widget guidance into one short prompt; avoid stacking separate introductory, explanatory and control-help subtitles around the graph.
- Put interactive figures that build intuition before the corresponding formal definitions and worked calculations. Start with a short exploration prompt, then use the observations to motivate the explanation.
- Do not put highlights inside warnings.
- Proofs may use only facts already established in the course or justified in the proof. Omit a proof rather than silently assume an unintroduced result.
- Use parentheses around a function’s argument and explicit multiplication when an adjacent factor could be mistaken for part of the argument, for example `\cos(y)\cdot y^{\prime}`.
- Use explicit limit notation when evaluating a limit or deriving a derivative. Write primes as superscripts, for example `f^{\prime}(a)`.
- Use familiar contexts and explain scientific terms only when they help the mathematical idea. Quiz questions should test distinct reasoning rather than repeat worked examples.
- Sliders use the shared O3 inset track and light rectangular handle. Show values only when useful to the learner; a zoom control does not need a multiplier.
- Use snapping only where a special point is useful to select, such as an isolated function value. Keep the snap zone small and consistent in screen pixels, with a slightly wider release zone to prevent jitter. Preserve precise keyboard control and Shift-drag to inspect nearby values.
- Put live feedback directly below its corresponding graph in a centered soft strip using `widget-readouts`; wrap values neatly on smaller screens. For several graphs, give each graph its own feedback bar.
- Use compact labels beside moving points when they clarify the graph without covering curves, axes or other labels. Keep them non-interactive so they cannot intercept dragging. Put values in the shared readout strip when point labels would obstruct the plot.
- Use the shared soft sage legend strip in reserved space above each plot, outside the plotting area. Keep feedback bars below. Match its line and point samples to the graph, including dash patterns, and typeset mathematical labels with MathJax. Use underlined album choices for a small set of graph cases.
- Axes use barely-there lines (style A), with a fine tick for each numbered axis value; omit unnecessary additional ticks. Label axes with the coordinate or measured quantity (and units when relevant); function names identify curves in legends or direct labels, not axes.
- Graphs use green curves, light axes, muted numeric labels without opaque halos, and transparent backgrounds so they blend with their containing block.
- Marker highlights: one yellow ink. Use `<mark>text</mark>`; use `class="math-marker"` around an entire inline mathematical expression. Tall fractions receive a full-height marker. The starter includes math-highlighting examples.
- Optional hints, solutions, derivations, references: inline disclosures; Escape closes the focused disclosure.

Use the optional patterns only when the lesson needs them. Keep new topic content empty until authored and reviewed.

## Navigation

The course control sits in document flow after the lesson and practice. It opens a bottom sheet with a minimal ×. Clicking the dimmed backdrop or pressing Escape dismisses it and returns focus; clicking or dragging inside does not dismiss it. Previous/next links span module boundaries and are omitted at the course boundaries. `/learning/` is the course catalogue, with a thumbnail, course name, and initially collapsed module list.

Keep links to other lessons in the course navigation after the quiz. Lesson prose may refer to them in plain text; do not insert forward links or other lesson exits before practice. Links to a figure or section on the same page are appropriate when useful.

The template uses a compact learning header matching the site's identity. Main-site navigation has not been expanded. Empty topics remain excluded from the sitemap until real content replaces them.

## Check

Run the repository build and site checks from README. Preview `/learning/` and a calculus topic; check course navigation and sheet dismissal at desktop and phone widths. When lesson content is added, also check keyboard input, proof disclosures, widget dragging and keyboard input, wrong/correct/retry feedback, and practice navigation.

## Module problems

End a module with a Problems submodule after its teaching topics. Use open-response problems to develop methods and applications, including graph interpretation and one or two challenges. Keep hints and complete solutions in separate, closed disclosures. Use only established tools, or introduce a new method explicitly before relying on it. Add the page to the module hierarchy so previous/next navigation and course contents include it. Limits and Continuity, Derivative Foundations, Elementary Functions and Differentiation Techniques, and Applications of Derivatives have authored problem sets; the remaining modules await supervised authoring.

## Applications of derivatives

The fourth live module has eight teaching topics and a sixteen-problem set. The final expert challenge combines Rolle’s theorem, derivative bounds and a proof of the unique optimal profile. Each teaching topic records prerequisites and newly established results in an authoring comment. Quizzes test distinct inferences, domain decisions and misconceptions. The sequence establishes extrema before Rolle and mean value theorems, then uses the mean value theorem to justify derivative sign tests. L’Hôpital’s rule is stated with sufficient hypotheses, with a restricted-case explanation kept separate from the unproved general theorem.

Five visual investigations connect the reading to tangent error, constrained ladder motion, parallel secants and tangents, linked derivative graphs and optimal fencing. All provide keyboard and pointer controls on the moving points and a static SVG fallback. They use the lesson’s MathJax notation throughout; legends occupy reserved space above or below the plot, and tangents are solid with reduced opacity. Duplicate range sliders are omitted. The linked derivative graphs use album choices for the named functions. The curve-sketching lesson uses derivative sign charts to annotate the function’s graph. Problems combine graphical reading, modelling, bounds, design and proof; hints and full solutions remain separate and closed. Authored learning pages retain the course’s existing sitemap exclusion.

## Integral foundations

Lesson 5.1, Antiderivatives and indefinite integrals, establishes the family of antiderivatives on an interval using the mean value theorem, introduces indefinite integral notation and reverse derivative rules, and develops initial conditions through four worked examples and eight quiz questions. A pair of graphs links vertical shifts to an unchanged derivative, with direct pointer and keyboard controls, reserved legend space, a solid translucent tangent, and a complete static view. Graph labels use the same MathJax renderer as the text.

Lesson 5.2, Riemann sums and area bounds, uses three worked examples and six quiz questions to introduce partitions, arbitrary sample points, lower and upper Darboux sums, and unequal strip widths. Separate left, right and midpoint rules are omitted. Its opening rectangle investigation comes before the definitions and calculations, with a short exploration prompt, three graph shapes, integer counts, exact arithmetic before display, a legend above the graph and live feedback directly below. A static figure shows unequal-width upper rectangles. An optional extension explains infima and suprema for bounded functions.

Lesson 5.3, Area as a limit, continues with refinement, mesh, and the common area limit, independent of sample choices. Two worked examples and six quiz questions develop exact area, units and signed accumulation. Speed readings for a cyclist with increasing speed give distance bounds without requiring a formula for the speed. The continuous-function area theorem is stated without proof; the sum-of-squares identity is derived in an optional disclosure. A static figure distinguishes signed totals from geometric area. Neither lesson uses the fundamental theorem of calculus. The course places Definite integrals and their properties next, at 5.4. Later topics and the module problem set await authoring.

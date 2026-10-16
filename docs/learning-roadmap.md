# Learning topics

The chosen template uses guided practice, borderless Soft paper, and a dark green course-contents control at the end of the lesson.

## Author a topic

Use [the starter](templates/learning-topic.md) to fill an existing empty topic in `learning/calculus/<module>/`. Keep its permalink, course key, module key, and position. The shared layout is `_layouts/learning-topic.html`; the hierarchy lives in `_data/learning_courses.json`.

- `title`, `description`, `position`: reader-facing identity.
- `course_key`, `module_key`: connect the topic to the shared hierarchy. Course contents and previous/next navigation are generated from that hierarchy.
- `exercises`: question text, string options, a zero-based integer `correct`, and an explanation in `why`. Omit this list to omit practice entirely.
- `math: true`: enables the existing MathJax renderer for Markdown mathematics.
- `topic_script`: optional URL for a topic-specific widget. Load only a widget actually used by the topic.

Question data supports plain text and LaTeX delimited by `\(` and `\)`. The Quiz shows one question at a time. Bottom dots switch questions. The primary Check all action checks every selected answer together; a quieter Check this question action checks only the active question, revealing sage correct or rose incorrect states and explanations. Unanswered questions stay grey. Changing the choice clears feedback. Answers persist while browsing the current page. There are no visible counters; an accessible status announces the result after checking. Correct and incorrect answers use green/red feedback; unchecked choices remain neutral. Editing a checked answer clears its result until it is checked again. There is no persistent tracking. The no-JavaScript fallback lists questions and explanations.

## Visual vocabulary

- Block labels identify the type. Optional example, definition, and theorem names use small interface type, leaving large serif headings for sections.
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

End a module with a Problems submodule after its teaching topics. Use open-response problems to develop methods and applications, including graph interpretation and one or two challenges. Keep hints and complete solutions in separate, closed disclosures. Use only established tools, or introduce a new method explicitly before relying on it. Add the page to the module hierarchy so previous/next navigation and course contents include it. Limits and Continuity has the first authored set; every other module has an empty Problems page awaiting supervised authoring.

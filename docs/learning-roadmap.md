# Learning topics

The chosen template uses guided practice, borderless Soft paper, and a dark green course-contents control at the end of the lesson.

## Author a topic

Use [the starter](templates/learning-topic.md) to fill an existing empty topic in `learning/calculus/<module>/`. Keep its permalink, course key, module key, and position. The shared layout is `_layouts/learning-topic.html`; the hierarchy lives in `_data/learning_courses.json`.

- `title`, `description`, `position`: reader-facing identity.
- `course_key`, `module_key`: connect the topic to the shared hierarchy. Course contents and previous/next navigation are generated from that hierarchy.
- `exercises`: question text, string options, a zero-based integer `correct`, and an explanation in `why`. Omit this list to omit practice entirely.
- `math: true`: enables the existing MathJax renderer for Markdown mathematics.
- `topic_script`: optional URL for a topic-specific widget. Load only a widget actually used by the topic.

Question data is plain text. Practice shows one question at a time; Check reveals sage correct or rose incorrect states with symbols, labels, and explanation. Changing the choice clears feedback. Answers persist while browsing the current page, with no tracking or completion badges. The no-JavaScript fallback lists questions and explanations.

## Visual vocabulary

- Definition: pale sage (`definition`).
- Theorem: pale blue (`theorem`) with a closed `disclosure` proof.
- Attention and Warning: shared pale amber (`attention`, `caution`), distinguished by explicit labels.
- Practice: pale lavender; generated from the topic's exercises.
- Worked examples: always visible, no box or background.
- Figures and interactive figures: transparent, captions when helpful.
- Marker highlights: one yellow ink. Use `<mark>text</mark>`; use `class="math-marker"` around an entire inline mathematical expression. Tall fractions receive a full-height marker. The starter includes math-highlighting examples.
- Optional hints, solutions, derivations, references: inline disclosures; Escape closes the focused disclosure.

Use the optional patterns only when the lesson needs them. Keep new topic content empty until authored and reviewed.

## Navigation

The course control sits in document flow after the lesson and practice. It opens a bottom sheet with a minimal ×. Clicking the dimmed backdrop or pressing Escape dismisses it and returns focus; clicking or dragging inside does not dismiss it. Previous/next links span module boundaries and are omitted at the course boundaries. `/learning/` is the course catalogue, with a thumbnail, course name, and initially collapsed module list.

The template uses a compact learning header matching the site's identity. Main-site navigation has not been expanded. Empty topics remain excluded from the sitemap until real content replaces them.

## Check

Run the repository build and site checks from README. Preview `/learning/` and a calculus topic; check course navigation and sheet dismissal at desktop and phone widths. When lesson content is added, also check keyboard input, proof disclosures, widget reset, wrong/correct/retry feedback, and practice navigation.

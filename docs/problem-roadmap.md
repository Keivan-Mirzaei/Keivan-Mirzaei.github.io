# Problem authoring roadmap

**Status:** Authoring choices and the disclosure-row interface agreed with Keivan on 5 October 2026. Applied to all nine current problem posts; publication of the complete update authorized the same day.

This standard guides new problem posts and revisions of existing ones.

Follow the [content logo roadmap](logo-roadmap.md#problems-circle-and-woven-loops) for the shared circle/woven-loop family. Each problem selects an internal `difficulty` value from 1 to 4; the site reuses the corresponding mark at the same size as exploration logos and leaves the code unlabelled.

## Core requirements

- Seek a creative, direct solution. Explain the key insight and every non-obvious inference. Remove unnecessary detail while retaining the reasoning needed for a correct, complete argument; routine algebra and familiar results may remain implicit when appropriate to the problem’s level.
- Let the assumed background vary by problem. Briefly identify unusual prerequisites where needed, without adding a standard prerequisites section to every post.
- Include hints, alternative solutions, and extensions only when they add a distinct insight. Hints start collapsed.
- Use an interactive or static widget only when it makes a mathematical idea easier to see, inspect, or understand. Every visual must have a purpose.
- Keep widgets minimal. Include only the controls, labels, feedback, and explanation the particular activity needs. Follow the existing [widget roadmap](widget-requirements.md).
- Number equations and figures when a later reference needs them, and use those references consistently. Avoid numbering items that do not need to be cited.
- Treat organization, conciseness, alignment, minimality, consistency, and appearance as core requirements for both the article and its visuals.

## Agreed authoring choices

| Decision | Agreement |
| --- | --- |
| Audience | Vary by problem; briefly identify unusual prerequisites. |
| Explanation depth | Explain the key insight and every non-obvious inference. |
| Optional content | Include only material that adds a distinct insight; keep hints collapsed initially. |
| Scope | Guide new problems and revisions of existing ones. |
| Interface | Separate disclosure rows for hints, the solution, and useful optional material. |

The problem format shows the statement and keeps supporting content collapsed. Use the section markers in [the authoring guide](writing.md#problems-write-normally-add-a-solution-if-you-want) to create independent disclosure rows.

## Disclosure-row interface

Use separate, full-width disclosure rows in this order when the corresponding content is present: **Hint, Solution, Another solution, Extension**. Omit absent items entirely; none is required merely to complete the pattern.

- The problem statement remains visible. Every disclosure starts closed.
- Each row opens and closes independently with its own label. Several rows may stay open so readers can compare arguments or consult a hint alongside a solution.
- Keep rows at the same level rather than nesting optional material inside the main solution.
- Expand content inline, without covering the article. Closing a row releases its content’s layout space.
- Outside clicks, scrolling, and interaction with the content leave the row open. Support Escape to close the relevant row and return focus to its label.
- Use short labels that name the content without revealing its answer. Keep labels, chevrons, spacing, separators, and content alignment consistent.
- Make the whole label row usable by keyboard and touch, with visible focus and an accessible expanded state. Provide basic disclosure behavior without JavaScript.

These rules govern article content disclosures. Interactive widgets continue to follow the supporting-panel behavior in the widget roadmap.

## Development sequence

1. **Agreed:** Establish the authoring standard and select disclosure rows.
2. **Applied:** Keivan requested all existing problems on 5 October 2026. Revise all nine posts, complete the missing inequality proof, and use a shared disclosure-row layout. Keep static figures where they support the argument, with numbered references for the spaceship proof’s two figures. Replace the trigonometry raster with a matching vector proof, retaining the original at its published address.
3. Use the standard for future problems. Check the mathematics, remove redundant material, and inspect the rendered text, formulas, disclosure rows, and any purposeful visual together when making revisions.

Let each problem determine its length and structure; the roadmap should not create sections or widgets merely to fill a template.

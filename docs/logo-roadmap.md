# Content logo roadmap

**Status:** The exploration standard and woven-loop problem family were agreed with Keivan on 5 October 2026. This roadmap brings problems, explorations, and puzzles under one visual standard. The problem family starts with a circle, retains the green accent, and matches exploration logo sizes. At Keivan's request, the About page explains how the marks suggest relative difficulty; individual problems keep their marks unlabelled.

## Purpose of each family

| Content | What the logo communicates | Design approach |
| --- | --- | --- |
| Problem | Relative difficulty | One reusable loop family, growing more entangled. |
| Exploration | The particular mathematical idea | A distinctive diagram, formula, or simple combination. |
| Puzzle | The activity to play | A recognizable board, configuration, or game object. |

The shared palette and canvas make the collection coherent. The different purposes keep problems, explorations, and puzzles recognizable. A problem never needs bespoke artwork merely because it is a new question.

## Shared visual standard

- **Canvas:** Self-contained static SVG, `width="440" height="410" viewBox="0 0 440 410"`. Leave roughly 10% clear space; balance optically within that common canvas.
- **Palette:** Paper `#fcfcf9`, ink `#282e29`, muted ink `#686e66`, and green accent `#285b46`. Use the established pale surfaces for supporting structure. Additional established colours may distinguish meaningful objects, such as the Red and Blue players in Hex.
- **Composition:** One dominant motif. Include an element because it contributes meaning. Keep comparable marks similarly prominent, without forcing every natural shape into an identical bounding box.
- **Lines and type:** Keep comparable line weights consistent, supporting structure quiet, and mathematical typography correct. Remove detail that disappears at small sizes.
- **Presentation:** No decorative frame, badge, animation, or hover effect. Keep article titles, captions, explanations, controls, and reference numbers outside the artwork. Point labels are permitted only when essential to recognition.
- **Mathematical fidelity:** Simplification and magnification must preserve the important relationships. Reuse the existing mathematical models and board geometry instead of inventing a visually convenient substitute.
- **Independence:** No external fonts, scripts, raster images, or page-style dependencies in a logo. Give each SVG a neutral descriptive title and description, with stable distinctive IDs.

### Placement

Problems and explorations use the same placement and sizes:

| Location | Desktop | Phones | Narrow phones, at most 360 px |
| --- | --- | --- | --- |
| Post lists | 112 px wide | 96 px wide | 96 px wide |
| Article title | 140 px wide | 96 px wide | 80 px wide |

Show the same asset wherever that post appears: its format page, subject lists, homepage, notebook archive, and article heading. Preserve the existing text rows. On phones, descriptions and topics span the full row below the logo and title.

Puzzle logos retain the catalogue's existing card placement: artwork up to 300 px wide in a 190 px high area. The standalone game remains focused on playing; it does not need another logo beside its board.

## Problems: circle and woven loops

**Approved family:** A circle, followed by loops with three, five, and seven crossings. The green strokes, over-and-under gaps, proportions, and orientation come from the approved prototypes. Use these four marks for every problem; the subject does not change the mark.

| Internal value | Shared asset | Editorial interpretation |
| --- | --- | --- |
| `1` | [Circle](../assets/images/problem-logos/circle.svg) | A direct observation or short chain of familiar reasoning. |
| `2` | [Three-crossing loop](../assets/images/problem-logos/woven-3.svg) | One less immediate connection, followed by manageable reasoning. |
| `3` | [Five-crossing loop](../assets/images/problem-logos/woven-5.svg) | A less obvious representation, identity, or additional layer of argument. |
| `4` | [Seven-crossing loop](../assets/images/problem-logos/woven-7.svg) | Several substantial insights, often combining a construction with a sharp bound. |

These are broad editorial judgments relative to this collection and the problem's assumed background. Judge the work needed to find a solution, not just how short the finished proof is. Prerequisites and length alone do not determine the value. Reassess when a problem or its expected audience changes.

**Keep individual problem marks unlabelled.** Do not add difficulty words, numbers, rating stars, decoding tooltips, or difficulty attributes to problem lists and headings. The About page explains the circle-to-woven-loop progression with a row of the four shared marks and notes that difficulty depends on the reader's background. Image alternatives on individual problems describe the shape without naming its grade. This table is authoring material; `docs/` is excluded from publication.

### Reuse and authoring

A problem stores only its internal choice:

```yaml
format: problem
difficulty: 2
```

The shared registry, [_data/problem_logos.json](../_data/problem_logos.json), supplies the image path, neutral alternative text, and crossing count. All problems with the same value reference the same SVG; do not create a copy or add per-problem `image` fields.

Create a problem with a chosen value using:

```sh
python3 scripts/new_post.py "An interesting problem" --type problem --math --difficulty 2
```

Without that option the helper writes `difficulty: null`. Choose a value before publishing. Missing or invalid values render the ordinary text heading and row while the entry is being prepared; they do not silently assign a grade or produce a broken image.

### Initial assignments

These assignments are editable editorial judgments, made on 5 October 2026.

| Problem | Value | Reason |
| --- | --- | --- |
| Simple but fun | `1` | One parity observation about a preserved sum. |
| Conservative polynomials | `2` | Square the assumed identity and use the polynomial product property. |
| The average distance across a circle | `2` | Use rotational symmetry, then average a chord length. |
| Trigonometry without a word | `2` | Connect the angles through geometry or the tangent addition formula. |
| Two expressions that cannot both be cubes | `2` | Relate the expressions, then compare consecutive cubes. |
| Hilbert matrices | `3` | Recognize the integral/Gram representation and establish strict positivity. |
| A three-variable inequality | `3` | Find the sum-of-squares decomposition behind the inequality. |
| Stirling’s approximation, but weaker | `3` | Retain an arbitrary finite series tail and turn it into an unboundedness argument. |
| Finding an invisible spaceship | `4` | Combine a lower bound with a construction that distinguishes every position. |

## Explorations: identify the mathematical idea

Represent one distinctive object, question, phenomenon, or expression. A formula alone is a complete mark when it identifies the article more clearly than a picture.

| Form | When to use it | Rule |
| --- | --- | --- |
| Diagram | Geometry, a graph, or a pattern identifies the subject. | Preserve important relationships and remove incidental detail. |
| Formula | A short expression is the natural identifier. | Use proper mathematical glyphs and spacing. |
| Diagram and formula | An expression substantially clarifies the picture. | Keep one element dominant. |

Prefer a shorter expression or simpler representation when a formula would require substantial shrinking or several lines. Avoid collecting unrelated symbols to cover every topic. A meaningful result may appear when it clarifies the mark and agrees with the article's assumptions.

### Approved references and decisions

- **The magician’s problem:** The magnifying glass reveals the persistent ripple in an apparently settling probability curve. Approved on 5 October 2026. Its curves come from the exploration's shared mathematical model.
- **Cevian triangles:** Keep the outer triangle, cevians, and shaded medial triangle. Keivan requested removal of the fraction ¼ on 5 October 2026. Other explorations may still use a meaningful result.
- **Companion puzzles:** Use related variations built from the same geometry where appropriate. Emphasize the mathematical idea in the exploration and the playable object in the puzzle.
- **Placement:** Reuse each article's mark in lists and beside its title; retain the existing list layout.

Store `image` and `image_alt` in exploration front matter:

```yaml
image: /assets/images/exploration-thumbnails/magicians-problem.svg
image_alt: A magnifying glass reveals a repeating ripple in an apparently settling probability curve.
```

All six published explorations have marks: the magician’s problem, Hex, Lights Out, three utilities, cevian triangles, and four equal regions. The conditional probability draft has the formula `P(A|B)`; its expression may evolve with the unfinished article. Follow the [exploration authoring roadmap](exploration-roadmap.md) for the article itself.

## Puzzles: identify what the reader will play

Use the actual board geometry, pieces, graph, or configuration. Simplify incidental labels and controls, while retaining the features that distinguish the game. A representative initial state or demonstration of the rules can carry the mark; avoid revealing a winning strategy or unique solution merely to decorate the catalogue.

Keep one asset per puzzle and store its `image` and `image_alt` in [_data/puzzles.yml](../_data/puzzles.yml). The catalogue reuses that asset through the same logo include as posts. A companion exploration may share geometry, but its different purpose warrants a distinct variation.

The current catalogue has five marks: Hex, Klotski, Lights Out, floor tiling, and four equal regions. Keep their published paths stable. Thumbnail artwork and script-free board fallbacks have different proportions and purposes; they need not be the same file.

## Shared sources and regeneration

| Source | Responsibility |
| --- | --- |
| [_includes/content-logo.html](../_includes/content-logo.html) | Resolve a problem's shared mark or an exploration/puzzle's image metadata; render one consistent image element. |
| [_includes/note.html](../_includes/note.html), [_layouts/post.html](../_layouts/post.html) | Reuse that include in post lists and headings. |
| [puzzles/index.html](../puzzles/index.html) | Reuse that include in catalogue cards. |
| [_data/problem_logos.json](../_data/problem_logos.json) | The four problem variants and their shared metadata. |
| [scripts/lib/problem-logo.mjs](../scripts/lib/problem-logo.mjs) | Reusable circle and knot geometry, including valid over-and-under crossings. |
| [scripts/lib/logo-svg.mjs](../scripts/lib/logo-svg.mjs) | Common canvas, palette, escaped descriptions, and self-contained SVG document helper. |
| [scripts/problem_logos.mjs](../scripts/problem_logos.mjs) | Generate the four problem assets from the registry. |
| [scripts/exploration_thumbnails.mjs](../scripts/exploration_thumbnails.mjs) | Generate exploration artwork from the shared mathematical models and saved formula outlines. |
| [scripts/puzzle_thumbnails.mjs](../scripts/puzzle_thumbnails.mjs) | Generate Hex, Klotski, Lights Out, and tiling catalogue artwork. |
| [scripts/four_regions_preview.mjs](../scripts/four_regions_preview.mjs) | Generate the four-regions puzzle thumbnail and its separate board previews. |

Regenerate the relevant family only when its artwork or mathematical source changes:

```sh
node scripts/problem_logos.mjs
node scripts/exploration_thumbnails.mjs
node scripts/puzzle_thumbnails.mjs
node scripts/four_regions_preview.mjs
```

Exploration formula sources and outlines live in `scripts/exploration-formulas.json`; the conditional probability outlines were exported from the native STIX math font with `scripts/exploration_formula_paths.swift`. Normal regeneration needs Node, and displaying the SVG needs no font or formula renderer.

Reuse stable paths in metadata and templates. Do not copy SVG markup into each post or draw a second version for its list entry. The production asset optimizer supplies content-based cache versions automatically.

Lists render these repeated marks with an empty alternative and `aria-hidden="true"`, avoiding duplicate announcements beside a linked title. Headings and puzzle cards use neutral visual descriptions. The site checker permits empty alternatives only when explicitly decorative.

## Roadmap and review

1. **Agreed:** Preserve the exploration standard and select the circle/woven-loop family for problems. Keep the green accent, equal post-logo sizes, and unlabelled marks on individual problems; explain their meaning on About.
2. **Implemented locally:** Add the common include, four reusable problem assets, registry, generator, and internal choices for all nine existing problems. Keep puzzle and exploration artwork faithful to their existing approved designs.
3. **Verified locally:** Regenerate reproducibly, parse every new SVG, inspect the crossings and smallest display sizes, build the site, check links and alternatives, and inspect representative list and title layouts on desktop and phones. Repeat relevant checks when the sources change.
4. **Maintain:** Choose an existing problem grade when publishing a new question. Create bespoke exploration or puzzle art only when its subject requires it. Revisit the concept or assignment when the content changes.
5. **Extend deliberately:** Discuss a new family, additional difficulty level, or change to the visual code as a design decision. Routine authoring and regeneration follow this roadmap without a new approval step.

A review should establish that the logo communicates its family's intended purpose; the mathematics or game geometry is correct; the artwork remains legible and balanced at its actual sizes; metadata points to one reusable asset; the SVG loads independently; and individual problem lists and headings keep their marks unlabelled. Run the authoring workflow and image-description checks after shared template changes. Run game or mathematical tests only when their underlying code changes.

**Verification, 5 October 2026:** The strict build, production asset optimization, and 53-page site check passed for both the normal URL and a `/logo-review` base URL. The authoring workflow covers all four choices, unset choices, invalid options, reused assets, and decorative list alternatives; it and the image-description checks passed. All four generated assets parsed, matched the approved prototype geometry exactly, and regenerated byte-for-byte. All nine problem headings and list entries, six exploration entries, and five puzzle cards resolved correctly. The desktop and phone lists rendered at 112 and 96 px without overflow; a long article heading fitted at 320 px with an 80 px mark and closed disclosures.

# Exploration logo roadmap

**Status:** Standard finalized with Keivan on 5 October 2026. Logos appear in exploration lists and beside article titles. Companion puzzles receive related variations, and meaningful results may appear in the artwork. All six published explorations and the conditional probability draft now have SVGs and shared template support. The local website previews have been checked on desktop and phones.

Give every published exploration a recognizable SVG mark. Its subject may be a diagram, a formula, or a simple combination. Follow the site's existing visual language and the [exploration authoring roadmap](exploration-roadmap.md).

## Core requirements

- Represent one distinctive mathematical idea from the exploration. Choose the object, question, phenomenon, or expression that best identifies this particular article.
- Use one dominant motif and an uncluttered composition. Include each element because it contributes meaning.
- Let the topic determine whether the logo is pictorial or mathematical. A formula alone is a complete logo when it is the clearest representation.
- Keep composition, colours, mathematical typography, line treatment, and visual prominence consistent across the collection.
- Make geometry, formulas, and mathematical relationships correct. A logo may simplify a drawing or magnify a feature, but must not suggest a false result.
- Keep article titles, captions, explanations, controls, and reference numbers outside the artwork. Use point labels only when essential to recognition.
- Ask Keivan about choices that materially affect meaning or presentation. Present concrete alternatives and record the answer here. Resolve routine drawing and implementation choices using this standard.

## Choosing a representation

| Form | Use when | Design rule |
| --- | --- | --- |
| Diagram | A shape, configuration, graph, or pattern identifies the subject. | Preserve the important relationships and remove incidental detail. |
| Formula | A short expression identifies the subject more naturally than a picture. | Use one properly typeset expression with correct spacing, fractions, powers, and radicals. |
| Diagram and formula | A compact expression makes the drawing substantially clearer. | Keep one element dominant; use the other as a small supporting element. |

Prefer a shorter expression or a simpler representation when a formula needs substantial shrinking or several lines. Avoid assembling several unrelated symbols merely to cover all of the article's topics. A meaningful result may appear when it makes the mark clearer; keep the result consistent with the article's assumptions.

## Shared visual standard

- **Canvas:** `width="440" height="410" viewBox="0 0 440 410"`, matching the puzzle thumbnails. Leave roughly 10% clear space around the composition; adjust for optical balance rather than forcing every shape into the same bounding box.
- **Colours:** Use the paper background `#fcfcf9`, ink `#282e29`, muted ink `#686e66`, and green accent `#285b46`. Use the existing pale surfaces and line colours for supporting structure. Other established colours may distinguish objects, as Red and Blue do in Hex.
- **Lines:** Use consistent weights for comparable elements. Keep secondary structure quieter than the main motif. Check that important lines survive reduction.
- **Typography:** Use the site's mathematical typesetting conventions for expressions. Use the shared interface font for any necessary ordinary labels. Preserve mathematical symbol shapes and spacing.
- **Composition:** Center visually and give the marks comparable prominence. Diagrams and formulas may have different natural proportions within the common canvas.
- **Readability:** Inspect at the puzzle artwork's usual display size and at about 100 pixels wide. Also inspect at the actual sizes selected for lists and article headings. Simplify details that disappear or crowd the mark.
- **Website placement:** Lists use a 112-pixel image on desktop and 96 pixels on phones. Article titles use 140 pixels on desktop, 96 pixels on phones, and 80 pixels on screens at most 360 pixels wide so long words retain room. On phones, list descriptions span the full row below the logo and title.
- **Presentation:** Use a static SVG. Let the artwork carry the idea without adding hover effects, animation, badges, or a decorative frame.

## Approved reference

[The Magician’s problem logo](../assets/images/exploration-thumbnails/magicians-problem.svg) uses a magnifying glass over an apparently settling probability curve. The lens reveals a repeating ripple. Keivan approved this design on 5 October 2026.

The curves come from the exploration's shared mathematical model. The lens clearly signals enlargement of the tiny oscillation. This establishes a useful example of a conceptual logo whose mathematical content remains faithful to the article.

## Agreed decisions

Keivan selected all three on 5 October 2026.

| Decision | Agreement |
| --- | --- |
| Display placement | Show logos in exploration entries wherever they are listed, and beside article titles. Lists include the Explorations page, homepage, and notebook archive. |
| Companion puzzles | Create related variations that emphasize the exploration's mathematical idea, using the same underlying geometry where appropriate. |
| Showing results | Allow a result when it makes the logo clearer. It is optional, and a meaningful diagram can carry the idea alone. |

**Cevian design decision, 5 October 2026:** Keivan prefers the Cevian logo without the fraction ¼. Keep the outer triangle, cevians, and shaded medial triangle; omit the numerical result from this mark. Other logos may still use a meaningful formula or result.

Retain the existing text-row layout when adding logos to lists. Check alignment and readability with the approved placement; a catalogue redesign would be a separate design choice.

## Initial collection

The collection applies the agreed standard. Review new concepts together in the website preview; the unfinished draft's expression can evolve with its article.

| Exploration | Logo | Progress |
| --- | --- | --- |
| The magician’s problem | [A magnifying glass revealing the persistent probability ripple](../assets/images/exploration-thumbnails/magicians-problem.svg). | Created and integrated; artwork approved. |
| Hex: a game with no middle ground | [A coloured diamond board with the proof's coastline traced through it](../assets/images/exploration-thumbnails/hex.svg). | Created and integrated. |
| Lights Out: every light can be flipped | [Two copies of the path of four, showing every light complemented](../assets/images/exploration-thumbnails/lights-out.svg). Green rings mark the endpoint presses. | Created and integrated. |
| Three utilities: from the plane to a mug | [Nine valid pipes on a square with paired opposite sides representing a torus](../assets/images/exploration-thumbnails/three-utilities.svg). | Created and integrated. |
| How big can a cevian triangle be? | [An outer triangle, its cevians, and a shaded medial triangle](../assets/images/exploration-thumbnails/cevian-triangles.svg), with no numerical annotation. | Created and integrated; fraction removed at Keivan's request. |
| Four equal regions: two bisections and a turn | [Two perpendicular cuts with three points in each region](../assets/images/exploration-thumbnails/four-equal-regions.svg). | Created and integrated. |
| Conditional Probabilities and Expectations | [The formula `P(A\mid B)`](../assets/images/exploration-thumbnails/conditional-probabilities-and-expectations.svg), representing conditional probability. | Created and integrated in the draft; visible in a separate draft preview. |

## Assets and authoring

- Store exploration SVGs in `assets/images/exploration-thumbnails/<slug>.svg`. Keep stable filenames so the same asset can be reused wherever the article appears.
- Use `scripts/exploration_thumbnails.mjs` for generated mathematical artwork. Reuse the existing geometry and mathematical models rather than duplicating their calculations.
- Formula outlines and their editable expressions are stored in `scripts/exploration-formulas.json`. `scripts/exploration_formula_paths.swift` exports the fixed conditional probability expression from the native STIX math font on macOS. Normal SVG regeneration reads those saved outlines and needs only Node; displaying logos needs no formula renderer or external font.
- Keep each SVG self-contained, with a descriptive `<title>` and `<desc>` and distinctive IDs. Use vector paths for mathematical glyphs; retain the editable formula source alongside its generator or source artwork. Avoid external fonts, embedded raster images, scripts, and page-style dependencies.
- Store the asset path and a concise text description with the exploration. Reuse the existing `image` and `image_alt` field names used by puzzle and course entries. Shared templates render the asset in lists and article headings.

```yaml
image: /assets/images/exploration-thumbnails/magicians-problem.svg
image_alt: A magnifying glass reveals a repeating ripple in an apparently settling probability curve.
```

When an image adds useful meaning, provide its text description. When it serves only as a redundant visual mark beside equivalent text, use an empty image alternative to avoid duplicate announcements. Do not make a repeated article title the image's only useful description.

The shared `exploration-logo.html` include renders informative descriptions in article headings and explicitly decorative images in lists. The site checker permits empty alternatives only on images explicitly marked `aria-hidden="true"`; informative images still require descriptions.

## Development sequence

1. **Agreed:** Record the approved Magician logo, link this roadmap from the writing guide, and settle the three design decisions.
2. **Completed:** Prepare geometry, formula-only, and combined marks beside the approved prototype. Inspect their weight, spacing, and readability together.
3. **Completed:** Add image metadata and a shared SVG include to the existing list and post templates. Display the same asset in the Explorations page, homepage, notebook archive, and article heading. Inspect desktop and phone layouts.
4. **Completed locally:** Create all six published exploration marks and the draft's conditional probability mark. Check SVG structure, mathematical sources, site links, accessible descriptions, and representative views down to 320 pixels wide. Keep the unfinished article in the draft collection.
5. **Maintain the collection.** Add a logo as part of preparing each new exploration for publication. Revisit the concept when an article's focus changes; regenerate model-based artwork when its shared source changes.

## Review criteria

- The mark identifies a meaningful idea from the specific exploration.
- Its mathematics and geometry agree with the article, including any displayed result.
- It remains recognizable at the intended small display sizes.
- Its palette, line treatment, typesetting, spacing, and prominence fit the collection.
- The SVG loads independently and has a useful accessible description.
- The approved placements use one shared asset, align cleanly, and preserve readable titles on phones.
- Formula source and generated artwork remain editable and reproducible.

For artwork changes, parse the SVG, inspect the rendered image, and check its mathematical source. When shared templates are integrated, also build the site, check links and image descriptions, and review representative desktop and phone pages. Run broader checks when the actual change affects their scope.

The initial implementation passed the strict Jekyll build, asset optimization, the 53-page site check, the authoring workflow test, and the image-description check. All six published headings and the draft formula heading were inspected at phone widths, and all seven vector assets parsed successfully.

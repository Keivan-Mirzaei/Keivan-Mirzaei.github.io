# Lagrange multipliers exploration — release review

Approved release on 13 October 2026 at `/notes/lagrange-multipliers/`.

The widget keeps linked 3D surfaces and top-down contours for `f=(x−2)²+4y²` on `x²+2y²=1`. The direction slider, Follow gradient buttons, chosen-direction graphics, lifted gradient arrows, and Settings panel have been removed. Every gradient arrow is two-dimensional and lies at z=0, with actual magnitudes on a common scale. The two-item legend identifies the objective and constraint together with their gradients. Info contains only operating gestures, arrow interpretation, and Reset behavior.

Dragging either surface rotates both maps. The focused maps also accept arrow keys; a held key forms one history action. The position slider and extrema buttons remain, and dragging the top view moves P along the constraint. Undo/Redo includes point, map, and camera changes. Reset restores P while keeping the view. Canceled gestures restore the previous state without discarding Redo.

Plots prevent text selection and native image dragging, including Safari, and capture accepted pointer gestures. Touch scrolling is disabled inside the interactive maps. Article text, Info, and inputs remain outside those protections. The shared widget roadmap now requires this protection and drag verification for future and revised widgets.

The identifying mark is a green lambda exported as STIX mathematical outlines. The article's interaction invitation, image alternative, static previews, and widget design sheet match the revised interface. The mathematical argument and worked solutions are preserved.

## Verification

- All 371 JavaScript tests in the isolated release pass, including three controller checks for linked rotation, default-action suppression, cancellation, Redo retention, held-key history, point dragging, and camera-preserving Reset. All six Python tests also pass.
- Projected-arrow checks compare every arrow endpoint with z=0 projections across four points, four camera rotations, and three elevations. Only the relevant gradient arrows remain.
- The strict production build and asset optimizer pass. Site checks validate all local links, image alternatives, anchors, search, feed, and sitemap across 63 HTML pages. All four generated SVGs parse.
- Browser checks confirm exact minima and maxima, linked camera rotation without moving P, selection-free surface and point dragging, concise Info, and no Settings panel. At 320 pixels, the top view and legend fit with no horizontal page overflow.

Keivan authorized publication on 13 October 2026. Release checks exclude unrelated unfinished changes in the working copy.

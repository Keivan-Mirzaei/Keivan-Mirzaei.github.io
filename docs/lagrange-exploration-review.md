# Lagrange multipliers exploration — release review

Updated on 12 October 2026 at `/notes/lagrange-multipliers/`.

The revised example is `f=(x−2)²+4y²` on the ellipse `x²+2y²=1`. Its multiplier equations have exactly two candidates: (1,0), with value 1 and multiplier −1, and (−1,0), with value 9 and multiplier 3. Compactness and comparison certify the unique global minimum and maximum. No numerical root-finding or Hessian classification is needed.

The widget retains the linked 3D maps, top-down contours, point and direction controls, gradients, and shared camera/history. The cross-section plots and curve profile have been removed, along with their assets and rendering code. Routine captions and repeated status comments are gone; extrema use brief confirmations and operating instructions remain in Info. Both contour families are noncircular ellipses.

The article keeps the steepest-ascent argument, tangent-space explanation, theorem and proof, exact worked solution, and final cross-entropy minimization exercise. The title, identifying mark, static previews, widget model, and text agree. The existing roadmaps guide the framing, controls, references, numeric formatting, disclosures, and static reading path.

## Verification

The seven mathematical checks cover feasibility and tangent geometry, the steepest-ascent bound and equality cases, independent finite-difference derivatives, contour equations, exact multiplier solutions and the constrained range, lifted arrows and linked projection, and entropy.

- The isolated production build and asset optimizer passed, followed by all local link, image, anchor, search, feed, and sitemap checks for 63 HTML pages.
- All 368 JavaScript tests and six Python tests passed. All four generated SVGs parse.
- Browser checks confirmed the exact point, value, gradients, and classification at both extrema. Follow ∇f and Follow ∇g give the maximum slopes. Camera changes affect both maps without moving the point; Undo restores the camera and the previous extremum.
- Settings sliders work with the keyboard; Info and Settings remain mutually exclusive and close with Escape. The top-down view works, and no cross-section controls or plots remain.
- At 320 pixels the maps stack, the page has no horizontal overflow, and the open entropy solution has no wide formulas or rendering errors. The desktop view and camera were restored, and a complete widget screenshot is retained with the chat.

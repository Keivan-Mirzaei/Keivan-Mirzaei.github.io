# Lagrange multipliers exploration — release review

Updated on 12 October 2026 at `/notes/lagrange-multipliers/`. Publication requested after local review.

## Investigation

The problem now uses a tilted quadratic objective and a quartic oval constraint. Linked 3D maps show actual sampled height fields, analytic noncircular contours, the feasible curve lifted onto each surface, normalized input-plane gradient directions, and their lifted tangent vectors. Shared rotation and a top-down view let readers examine the geometry from different directions.

The article develops steepest ascent from directional cross sections and proves the maximum slope is the gradient magnitude by Cauchy–Schwarz. It distinguishes an input gradient from a three-dimensional graph normal, then uses contour normals and allowed tangent directions to motivate and state the Lagrange multiplier theorem. Numerical solutions of the updated multiplier equations are accompanied by global convexity/concavity certificates, separating calculation from proof. The final cross-entropy minimization exercise, Hint, and Solution remain in place.

The title, descriptive reference anchor, identifying mark, model, widget, static previews, and worked solution agree. Ordinary reading remains useful without interaction. Numerical precision beyond three significant digits is reserved for reproducing the stationary-point calculation.

## Verification

- The strict build, production asset optimizer, and site checker passed for 67 pages, including links, anchors, images, search, feed, and sitemap.
- All 390 JavaScript tests and 13 Python tests passed. Seven focused tests cover the new model, steepest-ascent bound and equality cases, finite-difference derivatives, noncircular contours, multiplier residuals and certificates, 3D arrow geometry and projection, and entropy.
- All six generated SVGs parse. The five static views and the identifying mark are regenerated from the shared model.
- Browser checks confirmed Follow ∇f gives slope ≈5.80 at the starting point, matching its maximum, and Follow ∇g gives ≈3.09, also matching its maximum.
- Selecting the calculated minimum gives objective ≈3.07 and opposite gradients. Maximum selection gives ≈18.2 and clears the minimum effect. Both candidates have zero tangent slopes.
- Dragging one map rotates both without moving the selected point; one Undo restores the camera. Camera sliders work with the keyboard. Settings and Info are mutually exclusive and close with Escape.
- At 320 pixels the maps stack, the page has no horizontal overflow, and the displayed formulas have no rendering errors. The top-down map, curve profile, history, and reset behavior follow the same shared state.

## Publication verification

The isolated release passed the strict production build, asset optimizer, all local link checks for 63 HTML pages, all 368 JavaScript tests, and all six Python tests. A link to the separate, unpublished entropy exploration was replaced by a self-contained interpretation of the KL identity.

The final screenshot is retained with this chat. The release includes this exploration, its widget, figures, identifying mark, mathematical tests, and documentation, using the existing GitHub Pages workflow.

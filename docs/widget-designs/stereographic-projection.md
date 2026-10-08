# Stereographic projection

- **Stable ID:** `stereographic-projection`.
- **Purpose:** Show the correspondence between a plane graph and its spherical image, including the outside face containing infinity.
- **Model:** Unit sphere centred at (0, 0, 1), plane z = 0, pole N = (0, 0, 2). A Schlegel drawing of the cube has eight vertices, twelve edges, and six faces. Interpolate edges and tessellate faces in the plane before stereographic projection. The outside face closes at N; N is not an extra graph vertex or face.
- **Primary interaction:** Drag Q freely on the tangent plane. Its image P follows and N, P, Q remain collinear. Drag elsewhere to orbit. No point sliders or graph snapping. Q has a generous invisible pointer target and a focus outline; its arrow keys move in the plane's x/y coordinates.
- **Settings:** Shared switches show/hide the planar and spherical graphs independently. A shared dropdown chooses None, Vertices, Edges, or Faces. Amber highlights the face containing Q, or the closest planar vertex/edge, and the corresponding spherical element. Faces is the starting choice. Reference surfaces, Q, P, and the projection line remain visible when a graph is hidden.
- **Finite view:** The plane's radius-three disk is a viewing window, not its boundary. Q can move beyond it; all finite points map to a point other than N. The spherical outside-face mesh uses radial rings ending at N, so no artificial cap face is counted.
- **Controls:** Side view and Above support frequent geometric comparison; Zoom in/out keep camera access available without requiring wheel gestures. Shared Undo, Redo, Reset, Settings, Info follow the site order. The focused scene supports arrows to rotate and +/− to zoom.
- **History:** A point drag, orbit gesture, or held keyboard action is one action. Reset restores Q and the camera, preserves presentation settings, and is undoable. Canceled point gestures restore the previous state. Settings are independent of point/camera history.
- **Panels:** Settings and Info start closed and use the shared supporting-panel service: the same trigger closes, opening one closes the other, Escape restores trigger focus, and outside interaction preserves the panel.
- **Saving:** None; this short explorer starts afresh on opening.
- **Loading:** Reuse the pinned Three.js import map and deliberate-open lifecycle. Ordinary reading uses a generated SVG. Render only after point, settings, camera, or size changes. Dispose listeners, panels, observer, renderer, geometry, materials, and label textures on close or navigation.
- **Fallback:** Generated SVG uses the same pure stereographic model. The mathematical argument is complete without interaction.
- **Review status:** Reviewed and approved for publication on 7 October 2026.

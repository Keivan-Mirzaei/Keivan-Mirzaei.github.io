# Advanced and 3D graphs

Keep ordinary posts in Markdown. Use a reusable component when the reader needs an interactive plot. Both components below start with a static SVG preview and an explanation; clicking **Open interactive view** loads the renderer. Closing it disposes the graph, and reopening reuses the downloaded library.

## Scientific plots from data

Add `scientific-plot` to the post's `widgets` field:

```yaml
widgets: [scientific-plot]
```

First generate or supply the JSON data and SVG preview, then include the plot in the Markdown body. The wave example below uses the optional generator described later in this guide:

```liquid
{% include widgets/scientific-plot.html
   id='my-surface'
   title='A wave surface'
   description='Rotate the surface and inspect its coordinates.'
   figure='/assets/plots/wave-surface.json'
   dimensions=3
   preview='/assets/figures/wave-surface.svg'
   alt='Alternating peaks and valleys of sin(x) cos(y), with heights from minus one to one.' %}
```

The `id`, title, description, figure, preview, and alternative text describe this instance. Give every instance on a page a distinct `id`. Set `dimensions=3` for a 3D figure; omit it for a 2D plot. The dimensions setting chooses the camera controls, so it must agree with the data.

The JSON file contains a Plotly `data` array and an optional `layout` object. For example:

```json
{
  "data": [{"type": "scatter", "mode": "lines", "x": [0, 1, 2], "y": [0, 1, 4]}],
  "layout": {
    "xaxis": {"title": {"text": "x"}, "range": [0, 2]},
    "yaxis": {"title": {"text": "y"}, "range": [0, 4]}
  }
}
```

The current component uses Plotly's **gl3d partial bundle**, which includes `scatter`, `scatter3d`, `surface`, `mesh3d`, `cone`, `streamtube`, `volume`, and `isosurface`. The 2D controls are designed for numeric, linear axes. Contours, heatmaps, date axes, and other specialized plot types would need a corresponding adapter or bundle change; do not silently feed unsupported traces into this component.

The wrapper handles the site's colors, responsive sizing, native view buttons, reset, and cleanup. Mouse or touch dragging pans 2D plots and rotates 3D ones. Scrolling the page does not zoom the graph; use the zoom buttons. Include a prose explanation and, where useful, a small values table so the plot is not the only way to understand the data.

### Generate data in Python

Run the included example with only Python's standard library:

```sh
python3 scripts/graph_data.py --output assets/plots
```

It generates the wave surface and the damped oscillator's phase portrait. The browser receives the numeric results, not a Python runtime. This pattern also works for expensive computations performed ahead of time. Parameter changes that require new results must either be calculated in JavaScript or have their data prepared in advance.

If you already use Python's Plotly package, a figure's JSON export can be used as the starting file, provided its trace types and axes fit the adapter. Export ordinary numeric arrays; the included generator is a simple example of the expected shape.

Generate the example data and static previews when you want to use them in a new article:

```sh
python3 scripts/advanced_previews.py
```

These generated wave and oscillator files are not included in the repository until you create an article that uses them. The sphere component's required static preview is already included.

## Custom 3D teaching scenes

The sphere activity is a reusable Three.js scene:

```yaml
widgets: [sphere-slice]
```

```liquid
{% include widgets/sphere-slice.html id='my-sphere' %}
```

The scene lets readers move a plane through a unit sphere, rotate the camera, zoom, and reset. The native slider and buttons are keyboard-operable, with text feedback for circles, tangent points, and empty intersections. It draws only after a control, camera, or size change; there is no perpetual animation loop.

For a different custom scene, use `assets/js/widgets/sphere-slice.mjs` as the example:

1. Create the geometry and materials inside the callback passed to `prepareInteractive`.
2. Keep mathematical calculations in a small, testable module when practical.
3. Connect native controls to both the scene and a text explanation.
4. Observe the display size and redraw on changes.
5. Return a cleanup function that releases controls, observers, geometry, materials, and the renderer.

Register the new widget in `_data/widgets.yml`. If it imports `three` or `three/addons/`, extend the import-map condition in `_layouts/default.html` to include that widget name. The import map itself does not download the library. Imports belong inside the activation callback.

## Files and dependencies

- `_data/graph_libraries.yml` pins the Plotly and Three.js URLs. Keep Three.js and its add-ons at the same release.
- `assets/js/lib/interactive-view.mjs` handles activation, loading feedback, fallback, and closing.
- `assets/js/lib/plotly-loader.mjs` shares one Plotly download among multiple plots on a page.
- `assets/js/widgets/scientific-plot.mjs` adapts numeric figures to the site.
- `assets/js/widgets/sphere-slice.mjs` implements the custom geometry lesson.
- `assets/js/lib/graph-math.mjs` contains the sphere calculation and camera movement.

The pinned libraries currently come from Plotly's CDN and jsDelivr. If those requests fail, the preview remains available and the user can retry. A failed ES-module import may require reloading the page after connectivity returns. For completely offline activities, host the pinned library files locally and update their paths; preserve their licenses and Three.js's relative module dependencies.

Useful upstream references: [Plotly partial bundles](https://github.com/plotly/plotly.js/blob/main/dist/README.md), [Plotly function reference](https://plotly.com/javascript/plotlyjs-function-reference/), and [Three.js rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html).

## Verify changes

```sh
bundle exec jekyll build --strict_front_matter
python3 scripts/check_site.py
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
```

The data checks cover known surface values, initial conditions, and decreasing oscillator energy. The JavaScript checks cover the sphere's boundary cases and bounded camera movement. In a browser, also open and close each view, drag the camera, try the native controls, resize the page, and check the narrow-screen layout. Ordinary reading should show the preview without loading a 3D renderer.

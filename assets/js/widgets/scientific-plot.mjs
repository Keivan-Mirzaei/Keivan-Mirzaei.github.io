import { prepareInteractive, observeSize } from '../lib/interactive-view.mjs';
import { loadPlotly } from '../lib/plotly-loader.mjs';
import { moveCamera } from '../lib/graph-math.mjs';

// The smaller gl3d bundle includes ordinary scatter/line plots as well as 3D.
const supported = new Set(['scatter', 'scatter3d', 'surface', 'mesh3d', 'cone', 'streamtube', 'volume', 'isosurface']);

for (const widget of document.querySelectorAll('[data-widget="scientific-plot"]')) {
  prepareInteractive(widget, async ({ view, controls }) => {
    const [Plotly, figure] = await Promise.all([
      loadPlotly(widget.dataset.library),
      fetch(widget.dataset.figure).then((response) => {
        if (!response.ok) throw new Error('Plot data unavailable');
        return response.json();
      })
    ]);
    if (!Array.isArray(figure.data) || !figure.data.length || figure.data.some((trace) => !supported.has(trace.type || 'scatter'))) {
      throw new Error('This plot requires an unsupported trace type');
    }
    const threeD = widget.dataset.dimensions === '3';
    const layout = {
      // Plotly mutates its layout; keep the original ranges intact for Reset.
      ...structuredClone(figure.layout || {}), autosize: true, width: undefined, height: undefined,
      paper_bgcolor: '#f7f8f3', plot_bgcolor: '#f7f8f3',
      font: { family: 'system-ui, sans-serif', color: '#285b46', size: 12 },
      margin: { l: threeD ? 0 : 48, r: 15, b: threeD ? 0 : 45, t: 25 },
      dragmode: threeD ? 'orbit' : 'pan'
    };
    const initialCamera = structuredClone(layout.scene?.camera || { eye: { x: 1.5, y: 1.5, z: 1.2 }, up: { x: 0, y: 0, z: 1 } });
    let camera = structuredClone(initialCamera);
    const listeners = new AbortController();
    let stopResize = () => {};
    try {
      await Plotly.newPlot(view, figure.data, layout, { displayModeBar: false, scrollZoom: false, responsive: false });
      stopResize = observeSize(view, () => Plotly.Plots.resize(view));
      view.on('plotly_relayout', (event) => { if (event['scene.camera']) camera = event['scene.camera']; });
      for (const button of controls.querySelectorAll('[data-camera]')) {
        button.addEventListener('click', () => {
          const action = button.dataset.camera;
          if (threeD) {
            camera = { ...camera, eye: moveCamera(camera.eye, action) };
            Plotly.relayout(view, { 'scene.camera': camera });
          } else {
            const factor = action === 'in' ? 0.8 : 1.25;
            const update = {};
            for (const axis of ['xaxis', 'yaxis']) {
              const [low, high] = view.layout[axis].range;
              const center = (low + high) / 2;
              const half = (high - low) * factor / 2;
              update[`${axis}.range`] = [center - half, center + half];
            }
            Plotly.relayout(view, update);
          }
        }, { signal: listeners.signal });
      }
      controls.querySelector('[data-reset]').addEventListener('click', () => {
        if (threeD) {
          camera = structuredClone(initialCamera);
          Plotly.relayout(view, { 'scene.camera': camera });
        } else {
          Plotly.relayout(view, {
            ...(figure.layout?.xaxis?.range ? { 'xaxis.range': figure.layout.xaxis.range } : { 'xaxis.autorange': true }),
            ...(figure.layout?.yaxis?.range ? { 'yaxis.range': figure.layout.yaxis.range } : { 'yaxis.autorange': true })
          });
        }
      }, { signal: listeners.signal });
    } catch (error) {
      stopResize();
      listeners.abort();
      Plotly.purge(view);
      throw error;
    }
    return () => { stopResize(); listeners.abort(); Plotly.purge(view); };
  });
}

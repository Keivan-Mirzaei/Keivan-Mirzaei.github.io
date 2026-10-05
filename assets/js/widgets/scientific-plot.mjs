import { createWidgetHistory } from '../lib/widget-history.mjs';
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
      const ranges = () => Object.fromEntries(['xaxis','yaxis'].map(axis => [axis, [...view.layout[axis].range]]));
      let state = threeD ? { camera: structuredClone(camera) } : ranges();
      const initial = structuredClone(state);
      let applying = false, dragBefore = null;
      const undo = controls.querySelector('[data-panel-undo]'), redo = controls.querySelector('[data-panel-redo]');
      function apply(next) {
        state = structuredClone(next); applying = true;
        const changes = threeD ? { 'scene.camera': state.camera } : { 'xaxis.range': state.xaxis, 'yaxis.range': state.yaxis };
        Plotly.relayout(view, changes).finally(() => { applying = false; });
      }
      undo.disabled = redo.disabled = true;
      const history = createWidgetHistory(() => state, apply, (canUndo, canRedo) => { undo.disabled = !canUndo; redo.disabled = !canRedo; });
      undo.addEventListener('click', () => history.undo(), { signal: listeners.signal });
      redo.addEventListener('click', () => history.redo(), { signal: listeners.signal });
      view.addEventListener('pointerdown', () => { dragBefore = history.capture(); }, { signal: listeners.signal });
      view.on('plotly_relayout', event => {
        if (applying) return;
        const before = dragBefore || history.capture();
        state = threeD ? { camera: structuredClone(event['scene.camera'] || state.camera) } : ranges();
        history.commit(before); dragBefore = null;
      });
      for (const button of controls.querySelectorAll('[data-camera]')) {
        button.addEventListener('click', () => {
          const before = history.capture(), next = structuredClone(state);
          if (threeD) next.camera.eye = moveCamera(next.camera.eye, button.dataset.camera);
          else {
            const factor = button.dataset.camera === 'in' ? .8 : 1.25;
            for (const axis of ['xaxis','yaxis']) {
              const [low, high] = next[axis], center = (low + high) / 2, half = (high - low) * factor / 2;
              next[axis] = [center - half, center + half];
            }
          }
          apply(next); history.commit(before);
        }, { signal: listeners.signal });
      }
      controls.querySelector('[data-reset]').addEventListener('click', () => {
        const before = history.capture(); apply(initial); history.commit(before);
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

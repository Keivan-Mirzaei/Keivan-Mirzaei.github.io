import { cubeDiagram, cutState, describeCut } from '../lib/cube-cuts.mjs';
import { createPageEnvironment } from '../lib/page-environment.mjs';

export function mount(root = globalThis.document) {
  const environment = createPageEnvironment(root);
  const { document, window, ResizeObserver, IntersectionObserver, MutationObserver, setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame, cancelAnimationFrame } = environment;


for (const widget of document.querySelectorAll('[data-cube-cuts]')) {
  if (widget.dataset.cubeReady) continue;
  widget.dataset.cubeReady = 'true';
  const stage = widget.querySelector('[data-cube-stage]');
  const previous = widget.querySelector('[data-cube-previous]');
  const next = widget.querySelector('[data-cube-next]');
  const viewControl = widget.querySelector('[data-cube-view]');
  const feedback = widget.querySelector('[data-cube-status]');
  const counter = widget.querySelector('[data-cube-count]');
  const caption = widget.querySelector('[data-cube-caption]');
  const legend = widget.querySelector('[data-cube-legend]');
  let step = 0;

  function render() {
    const view = viewControl.value;
    const state = cutState(step);
    stage.innerHTML = cubeDiagram(view, step);
    counter.textContent = `${step} / 6 cuts`;
    feedback.textContent = describeCut(view, step);
    caption.textContent = view === 'centre'
      ? 'Exploded view · gaps added for clarity.'
      : 'Pieces move apart only where a cut has been made.';
    legend.hidden = view !== 'centre';
    previous.disabled = step === 0;
    next.disabled = state.complete;
    widget.dataset.complete = String(state.complete);
  }

  previous.addEventListener('click', () => { if (step > 0) { step--; render(); } });
  next.addEventListener('click', () => { if (step < 6) { step++; render(); } });
  viewControl.addEventListener('change', render);
  widget.querySelector('[data-cube-controls]').hidden = false;
  render();
}

  return environment.dispose;
}

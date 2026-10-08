import { bindInputHistory } from '../lib/panel-history.mjs';
import { createPageEnvironment } from '../lib/page-environment.mjs';

export function mount(root = globalThis.document) {
  const environment = createPageEnvironment(root);
  const { document, window, ResizeObserver, IntersectionObserver, MutationObserver, setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame, cancelAnimationFrame } = environment;

/* Expected counts keep the denominator of a conditional probability visible. */
(() => {
  document.querySelectorAll('[data-widget="bayes"]').forEach((widget) => {
    const slider = widget.querySelector('input');
    const reset = widget.querySelector('[data-reset]');
    function update() {
      const rate = Number(slider.value);
      const faulty = rate * 10;
      const tp = faulty * 0.9;
      const fp = (1000 - faulty) * 0.1;
      const percent = 100 * tp / (tp + fp);
      const cells = { tp, fp, fn: faulty - tp, tn: 1000 - faulty - fp };
      Object.entries(cells).forEach(([name, value]) => { widget.querySelector(`[data-${name}]`).textContent = Math.round(value); });
      widget.querySelector('[data-rate]').textContent = rate;
      widget.querySelector('[data-faulty]').style.width = `${percent}%`;
      widget.querySelector('[data-bar]').setAttribute('aria-label', `${percent.toFixed(1)} percent faulty, ${(100 - percent).toFixed(1)} percent good`);
      widget.querySelector('[data-feedback]').textContent = `${Math.round(tp)} of the ${Math.round(tp + fp)} flagged items are faulty: ${percent.toFixed(1)}%.`;
    }
    slider.disabled = reset.disabled = false;
    slider.addEventListener('input', update);
    bindInputHistory(widget, [slider], update, () => { slider.value = 10; update(); });
    update();
  });
})();

  return environment.dispose;
}

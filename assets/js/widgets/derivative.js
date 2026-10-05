import { formatNumber } from '../lib/widget-math.mjs';
import { bindInputHistory } from '../lib/panel-history.mjs';
/* For f(x) = x² at x = 1, the nonzero-step secant slope simplifies to 2 + h. */
(() => {
  document.querySelectorAll('[data-widget="derivative"]').forEach((widget) => {
    const slider = widget.querySelector('input');
    const reset = widget.querySelector('[data-reset]');
    const point = widget.querySelector('[data-point]');
    const line = widget.querySelector('[data-secant]');
    const screenY = (y) => 296 - (y + 1) * 34.5;
    function update() {
      const h = Number(slider.value);
      widget.querySelector('[data-h]').textContent = h;
      // At zero the secant is Undefined. Show only the limiting tangent.
      line.style.display = h === 0 ? 'none' : '';
      point.style.display = h === 0 ? 'none' : '';
      line.setAttribute('d', `M44 ${screenY(1 - 2 * (2 + h))} L580 ${screenY(1 + 2 * (2 + h))}`);
      point.setAttribute('cx', 312 + h * 134);
      point.setAttribute('cy', screenY((1 + h) ** 2));
      const message = h === 0
        ? 'At h = 0, the difference quotient is 0/0 and is Undefined. The limiting tangent slope is 2.'
        : `At h = ${h}, the second point is (${formatNumber(1 + h)}, ${formatNumber((1 + h) ** 2)}). The secant slope is ${formatNumber(2 + h)}; the tangent slope is 2.`;
      widget.querySelector('[data-feedback]').textContent = message;
      widget.querySelector('[data-description]').textContent = message;
    }
    slider.disabled = reset.disabled = false;
    slider.addEventListener('input', update);
    bindInputHistory(widget, [slider], update, () => { slider.value = 1; update(); });
    update();
  });
})();

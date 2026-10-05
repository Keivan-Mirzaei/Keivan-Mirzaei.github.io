import { formatNumber, numberMarkup, differentiabilityFormula } from '../lib/widget-math.mjs';
import { bindInputHistory } from '../lib/panel-history.mjs';
import { MODELS, magnifiedValue, errorBound } from '../lib/differentiability-math.mjs';

const screenX = (u) => 319 + 251 * u;
const screenY = (v) => 165 - (290 / 7) * v;
const coordinate = (u, v) => `${screenX(u).toFixed(2)} ${screenY(v).toFixed(2)}`;
const path = (fn, steps = 500) => Array.from({ length: steps + 1 }, (_, i) => {
  const u = -1 + 2 * i / steps;
  return `${i ? 'L' : 'M'}${coordinate(u, fn(u))}`;
}).join(' ');
const fmt = formatNumber;

document.querySelectorAll('[data-widget="differentiability"]').forEach((widget) => {
  const initial = widget.dataset.model;
  const select = widget.querySelector('[data-function]');
  const zoom = widget.querySelector('[data-zoom]');
  const slopeControl = widget.querySelector('[data-slope-control]');
  const reset = widget.querySelector('[data-reset]');
  const curve = widget.querySelector('[data-curve]');
  const guides = widget.querySelector('[data-guides]');
  const samples = widget.querySelector('[data-samples]');

  function update() {
    const model = select.value;
    const radius = 10 ** -Number(zoom.value);
    const slope = Number(slopeControl.value);
    const dense = model.startsWith('rational-');
    const oscillating = model === 'oscillation';
    widget.querySelector('[data-equation]').innerHTML = differentiabilityFormula(model);
    widget.querySelector('[data-radius]').innerHTML = numberMarkup(radius);
    widget.querySelector('[data-slope]').textContent = fmt(slope);
    widget.querySelector('[data-tangent]').setAttribute('d', path((u) => slope * u, 1));

    // At high zoom, unresolved oscillations are shown only by rigorous envelopes.
    curve.style.display = dense || (oscillating && radius < 0.05) ? 'none' : '';
    curve.setAttribute('d', path((u) => magnifiedValue(model, u, radius), 1000));
    if (dense) {
      guides.innerHTML = `<path class="differentiability-guide" d="${path((u) => magnifiedValue(model, u, radius))}"/><path class="differentiability-other-guide" d="${path(() => 0, 1)}"/>`;
      const rationalDots = Array.from({ length: 37 }, (_, i) => {
        const u = (i - 18) / 18;
        return `<circle class="differentiability-rational" cx="${screenX(u)}" cy="${screenY(magnifiedValue(model, u, radius))}" r="3"/>`;
      });
      const irrationalDots = Array.from({ length: 36 }, (_, i) => {
        // For the power-of-ten radius, x = ρu has the indicated arithmetic type.
        const u = (i - 17.5) / 18 + Math.SQRT2 / 100;
        return `<circle class="differentiability-irrational" cx="${screenX(u)}" cy="${screenY(0)}" r="2.5"/>`;
      });
      samples.innerHTML = [...rationalDots, ...irrationalDots].join('');
    } else {
      samples.innerHTML = '';
      guides.innerHTML = oscillating
        ? `<path class="differentiability-envelope" d="${path((u) => radius * u * u)}"/><path class="differentiability-envelope" d="${path((u) => -radius * u * u)}"/>`
        : '';
    }

    widget.querySelector('[data-legend]').textContent = dense
      ? 'Green dots: selected rational points · Orange dots: selected irrational points · Thin dashed: branch guides · Dark dashed: candidate line'
      : oscillating
        ? 'Green: sampled oscillations when resolvable · Thin dashed: rigorous envelopes ±ρu² · Dark dashed: candidate line'
        : 'Green: magnified function · Dark dashed: candidate line';
    const bound = errorBound(model, radius, slope);
    let conclusion;
    if (model === 'square') {
      conclusion = slope === 2
        ? 'With slope 2, the error equals ρ and tends to zero.'
        : 'Use slope 2 to make the error tend to zero.';
    } else if (model === 'absolute') {
      conclusion = 'The error equals 1 + |L| at every radius. No slope removes the corner.';
    } else if (model === 'rational-linear') {
      conclusion = 'The best possible bound is 0.5, at L = 0.5. No slope gives a vanishing error.';
    } else {
      conclusion = slope === 0
        ? 'With slope 0, the bound is ρ and tends to zero.'
        : 'Use slope 0 to make the bound tend to zero.';
    }
    const message = `${oscillating ? 'Normalized error bound' : 'Maximum normalized error'}: ${fmt(bound)}. ${conclusion}`;
    widget.querySelector('[data-feedback]').textContent = message;
    const explanation = dense
      ? 'The branch guides show where rational and irrational values lie; neither whole guide is the graph. Samples are schematic and cannot decide a limit. The displayed bound controls both dense branches.'
      : oscillating
        ? 'Finite sampling cannot resolve all oscillations near zero. At high magnification only the envelope is shown. The bound |x² sin(1/x)| ≤ x² controls every point, including those between samples.'
        : 'Normalized error = sup |(f(a + ρu) − f(a))/ρ − Lu| for −1 ≤ u ≤ 1. Shrinking the radius tests whether the first-order error vanishes.';
    widget.querySelector('[data-explanation]').textContent = explanation;
    widget.querySelector('[data-description]').textContent = `${MODELS[model].equation}. Radius ${fmt(radius)}; candidate slope ${fmt(slope)}. ${message} ${explanation}`;
  }

  select.disabled = zoom.disabled = slopeControl.disabled = reset.disabled = false;
  select.addEventListener('change', () => {
    zoom.value = 0;
    slopeControl.value = MODELS[select.value].slope;
    update();
  });
  zoom.addEventListener('input', update);
  slopeControl.addEventListener('input', update);
  bindInputHistory(widget, [select, zoom, slopeControl], update, () => {
    select.value = initial;
    zoom.value = 0;
    slopeControl.value = MODELS[initial].slope;
    update();
  });
  update();
});

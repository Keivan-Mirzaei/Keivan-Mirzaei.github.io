import { initializeDropdowns, disposeDropdowns } from './dropdown.mjs';

const riemannProfiles = {
  increasing: { name: 'Increasing', tex: 'f(x)=x^2', height: k => k * k },
  decreasing: { name: 'Decreasing', tex: 'f(x)=(2-x)^2', height: (k, n) => (2 * n - k) ** 2 },
  turning: { name: 'Rise and fall', tex: 'f(x)=4x(2-x)', height: (k, n) => 4 * k * (2 * n - k), critical: [1] },
};
const riemannRules = {
  lower: { name: 'Lower sum (minima)', extremum: 'min', symbol: '\\underline{S}' },
  upper: { name: 'Upper sum (maxima)', extremum: 'max', symbol: '\\overline{S}' },
};
const gcd = (a, b) => b ? gcd(b, a % b) : a;
export function riemannModel({ n = 4, profile = 'increasing', rule = 'upper' } = {}) {
  n = Math.max(1, Math.min(64, Math.round(Number(n) || 4)));
  if (!Object.hasOwn(riemannProfiles, profile)) profile = 'increasing';
  if (!Object.hasOwn(riemannRules, rule)) rule = 'upper';
  const selected = riemannProfiles[profile], method = riemannRules[rule];
  let numerator = 0;
  const rectangles = Array.from({ length: n }, (_, i) => {
    // Extrema occur at a strip's endpoints or at an interior critical point.
    // All candidates are k/n for these curves, keeping the sum exact before display.
    const candidates = [2 * i, 2 * (i + 1), ...(selected.critical || []).map(x => x * n)
      .filter(point => point > 2 * i && point < 2 * (i + 1))];
    const k = candidates.reduce((best, point) => {
      const difference = selected.height(point, n) - selected.height(best, n);
      return (method.extremum === 'min' ? difference < 0 : difference > 0) ? point : best;
    });
    const heightNumerator = selected.height(k, n);
    numerator += 2 * heightNumerator;
    return { left: 2 * i / n, right: 2 * (i + 1) / n, sample: k / n, height: heightNumerator / (n * n) };
  });
  const denominator = n ** 3, divisor = gcd(numerator, denominator);
  return { n, profile, rule, rectangles, dx: 2 / n, sum: numerator / denominator,
    numerator: numerator / divisor, denominator: denominator / divisor };
}
const riemannPoint = (x, y) => [80 + 245 * x, 304 - 64 * y];
function riemannCurve(profile) {
  const model = riemannProfiles[profile] || riemannProfiles.increasing;
  return Array.from({ length: 161 }, (_, i) => {
    const x = i / 80, y = model.height(x, 1);
    return `${i ? 'L' : 'M'}${riemannPoint(x, y).map(v => v.toFixed(3)).join(' ')}`;
  }).join(' ');
}
export function riemannReadouts(model) {
  const divisor = gcd(2, model.n), top = 2 / divisor, bottom = model.n / divisor;
  const width = bottom === 1 ? String(top) : String.raw`\frac{${top}}{${bottom}}`;
  const exact = (model.numerator * 10000) % model.denominator === 0;
  const value = String(Number(model.sum.toFixed(4)));
  return {
    n: `n=${model.n}`,
    width: String.raw`\Delta x=${width}`,
    sum: `${riemannRules[model.rule].symbol}_{${model.n}}${exact ? '=' : '\\approx'}${value}`,
  };
}

export function initializeRiemann(root, MathJax) {
  if (!root || root.dataset.ready || !MathJax?.tex2chtml) return;
  const document = root.ownerDocument, browser = document.defaultView;
  const controller = new AbortController(), signal = controller.signal;
  const svg = root.querySelector('[data-riemann-plot]');
  const rectangleGroup = root.querySelector('[data-riemann-rectangles]');
  const samples = root.querySelector('[data-riemann-samples]');
  const curve = root.querySelector('[data-riemann-curve]');
  const legend = root.querySelector('[data-riemann-function]');
  const slider = root.querySelector('[data-riemann-count]');
  const select = root.querySelector('[data-riemann-rule]');
  let model = riemannModel(), frame = 0;
  const cache = new Map();
  function math(tex) {
    if (!cache.has(tex)) {
      if (cache.size >= 256) cache.delete(cache.keys().next().value);
      cache.set(tex, MathJax.tex2chtml(tex, { display: false }));
    }
    return cache.get(tex).cloneNode(true);
  }
  function setMath(element, tex) {
    if (element.dataset.tex === tex) return;
    element.replaceChildren(math(tex)); element.dataset.tex = tex;
  }
  function element(tag, attributes) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
    return node;
  }
  function render() {
    frame = 0;
    const rects = [], dots = [];
    for (const r of model.rectangles) {
      const [x, y] = riemannPoint(r.left, r.height);
      rects.push(element('rect', { x, y, width: 245 * model.dx, height: 64 * r.height }));
      const [cx, cy] = riemannPoint(r.sample, r.height);
      dots.push(element('circle', { cx, cy, r: 3.2 }));
    }
    rectangleGroup.replaceChildren(...rects); samples.replaceChildren(...dots);
    curve.setAttribute('d', riemannCurve(model.profile));
    setMath(legend, riemannProfiles[model.profile].tex);
    const readouts = riemannReadouts(model);
    for (const [key, tex] of Object.entries(readouts)) {
      const output = root.querySelector(`[data-riemann-output="${key}"]`);
      setMath(output, tex);
      output.dataset.value = String(key === 'width' ? model.dx : model[key]);
    }
    slider.setAttribute('aria-valuetext', `${model.n} rectangles`);
    const description = `${riemannProfiles[model.profile].name} curve with ${model.n} equal-width rectangles using ${riemannRules[model.rule].name.toLowerCase()}. The rectangle sum is ${Number(model.sum.toFixed(4))}, rounded to four decimal places when needed.`;
    root.querySelector('#riemann-plot-desc').textContent = description;
    root.dataset.profile = model.profile; root.dataset.rule = model.rule;
    const sheet = MathJax.chtmlStylesheet?.(), current = document.getElementById('MJX-CHTML-styles');
    if (sheet && current?.textContent !== sheet.textContent) {
      if (current) current.replaceWith(sheet); else document.head.appendChild(sheet);
    }
  }
  function update() {
    const profile = root.querySelector('[name="riemann-profile"]:checked').value;
    model = riemannModel({ n: slider.value, profile, rule: select.value });
    if (!frame) frame = browser.requestAnimationFrame(render);
  }
  slider.addEventListener('input', update, { signal });
  select.addEventListener('change', update, { signal });
  root.querySelectorAll('[name="riemann-profile"]').forEach(input => input.addEventListener('change', update, { signal }));
  svg.addEventListener('dragstart', event => event.preventDefault(), { signal });
  function dispose() {
    if (frame) browser.cancelAnimationFrame(frame);
    disposeDropdowns(root);
    controller.abort();
  }
  document.addEventListener('site:page', () => { if (!root.isConnected) dispose(); }, { signal });
  browser.addEventListener('pagehide', event => { if (!event.persisted) dispose(); }, { signal });
  render();
  root.querySelectorAll('[data-riemann-controls]').forEach(control => { control.hidden = false; });
  initializeDropdowns(root);
  root.dataset.ready = 'true';
  return dispose;
}

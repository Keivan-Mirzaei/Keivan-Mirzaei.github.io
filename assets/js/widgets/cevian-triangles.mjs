import { TRIANGLE_SHAPES, normalizeWeights, triangleData, positionWeights, barycentricPoint, simplexRatio } from '../lib/cevian-math.mjs';
import { triangleDiagram, factorsDiagram, landscapeDiagram, landscapeMarker, tetrahedronDiagram } from '../lib/cevian-diagrams.mjs?v=20261001-2';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const percentage = value => `${(value * 100).toFixed(2)}%`;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function mount(container, markup) {
  let width = 0;
  function draw(force = false) {
    const next = Math.round(container.getBoundingClientRect().width);
    if (!next || (!force && width === next)) return;
    const focusedPoint = container.contains(document.activeElement) && document.activeElement.hasAttribute('data-cv-point');
    width = next;
    container.innerHTML = markup(width);
    if (focusedPoint) container.querySelector('[data-cv-point]')?.focus({ preventScroll: true });
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(container);
  else window.addEventListener('resize', () => draw());
  draw();
  return () => draw(true);
}

const explorer = document.querySelector('[data-cevian-explorer]');
if (explorer) {
  let weights = [.5, .1875, .3125];
  let shape = 'scalene';
  let animation = null;
  let pendingDraw = null;
  let dragging = false;
  let landscapeShape;
  const main = explorer.querySelector('[data-cv-main]');
  const map = document.querySelector('[data-cv-landscape]');
  const height = explorer.querySelector('[data-cv-height]');
  const across = explorer.querySelector('[data-cv-across]');
  const status = explorer.querySelector('[data-cv-status]');
  const shapeControl = explorer.querySelector('[data-cv-shape]');
  const centerButtons = [...document.querySelectorAll('[data-cv-center]')];

  const redrawMain = mount(main, width => triangleDiagram(width, weights, shape, 'inner', true));
  const redrawCeva = mount(document.querySelector('[data-cv-ceva]'), width => triangleDiagram(width, weights, shape, 'ceva', false, false));
  const redrawCorners = mount(document.querySelector('[data-cv-corners]'), width => triangleDiagram(width, weights, shape, 'corners', false, false));
  const redrawFactors = mount(document.querySelector('[data-cv-factors]'), width => factorsDiagram(width, weights));
  const redrawMap = mount(map, width => {
    landscapeShape = shape;
    return landscapeDiagram(width, weights, shape);
  });

  function cancelMotion() {
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
  }

  function draw(announce = true) {
    const data = triangleData(TRIANGLE_SHAPES[shape], weights);
    weights = data.weights;
    height.value = weights[0] * 100;
    across.value = weights[2] / (1 - weights[0]) * 100;
    document.querySelectorAll('[data-cv-area]').forEach(label => { label.textContent = `${percentage(data.ratio)} of ABC`; });
    data.corners.forEach((area, i) => { document.querySelector(`[data-cv-corner="${i}"]`).textContent = percentage(area); });
    document.querySelector('[data-cv-balance]').textContent = `${data.sideRatios.map(value => value.toFixed(3)).join(' × ')} = 1 (before rounding)`;
    const denominator = data.sideRatios.reduce((product, value) => product * (1 + value), 1);
    document.querySelector('[data-cv-product]').textContent = `Denominator: ${denominator.toFixed(4)} ≥ 8. Area ratio: 2 / ${denominator.toFixed(4)} = ${percentage(data.ratio)}.`;
    status.setAttribute('aria-live', announce ? 'polite' : 'off');
    const atCenter = weights.every(value => Math.abs(value - 1 / 3) < 1e-8);
    status.textContent = atCenter ? 'At the centroid: all three contacts are midpoints. The four triangles each occupy 25%.' : `Green area: ${percentage(data.ratio)}. The maximum is 25%, reached only at the centroid.`;
    redrawMain(); redrawCeva(); redrawCorners(); redrawFactors();
    if (landscapeShape !== shape) redrawMap();
    const svg = map.querySelector('svg');
    if (svg) {
      const width = svg.viewBox.baseVal.width;
      const placement = landscapeMarker(width, weights, shape);
      const marker = svg.querySelector('[data-cv-map-point]');
      marker.setAttribute('cx', placement.point[0]); marker.setAttribute('cy', placement.point[1]);
      const label = svg.querySelector('[data-cv-map-label]');
      label.setAttribute('x', placement.label.x); label.setAttribute('y', placement.label.y);
    }
  }

  function scheduleDraw() {
    if (pendingDraw !== null) return;
    pendingDraw = requestAnimationFrame(() => { pendingDraw = null; draw(false); });
  }

  function setPosition(t, q) {
    weights = positionWeights(clamp(t, .04, .94), clamp(q, .04, .96));
  }

  function pointerWeights(event, holder) {
    const svg = holder.querySelector('svg');
    const rect = svg.getBoundingClientRect();
    const width = svg.viewBox.baseVal.width;
    const diagramHeight = svg.viewBox.baseVal.height;
    const x = (event.clientX - rect.left) * width / rect.width;
    const y = (event.clientY - rect.top) * diagramHeight / rect.height;
    return barycentricPoint([(x - 24) / (width - 48), (y - 24) / (diagramHeight - 54)], TRIANGLE_SHAPES[shape]);
  }

  for (const holder of [main, map]) {
    holder.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      if (holder === map && event.target.closest('[data-cv-map-maximum]')) {
        cancelMotion(); weights = [1/3,1/3,1/3]; draw(); return;
      }
      const w = pointerWeights(event, holder);
      if (w.some(value => value < -.005)) return;
      cancelMotion();
      dragging = true;
      holder.setPointerCapture(event.pointerId);
      setPosition(w[0], w[0] < .999 ? w[2] / (1 - w[0]) : .5);
      draw(false);
    });
    holder.addEventListener('pointermove', event => {
      if (!dragging || !holder.hasPointerCapture(event.pointerId)) return;
      const w = pointerWeights(event, holder);
      setPosition(w[0], w[0] < .999 ? w[2] / (1 - w[0]) : .5);
      scheduleDraw();
    });
    function finish(event) {
      if (!holder.hasPointerCapture(event.pointerId)) return;
      dragging = false;
      holder.releasePointerCapture(event.pointerId);
      if (pendingDraw !== null) cancelAnimationFrame(pendingDraw);
      pendingDraw = null;
      draw();
    }
    holder.addEventListener('pointerup', finish);
    holder.addEventListener('pointercancel', finish);
  }

  map.addEventListener('keydown', event => {
    if (!event.target.closest('[data-cv-map-maximum]') || !['Enter',' '].includes(event.key)) return;
    event.preventDefault(); cancelMotion(); weights = [1/3,1/3,1/3]; draw();
  });

  main.addEventListener('keydown', event => {
    if (!event.target.hasAttribute('data-cv-point') || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
    event.preventDefault(); cancelMotion();
    const step = event.shiftKey ? .05 : .01;
    const t = weights[0], q = weights[2] / (1 - t);
    setPosition(t + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0), q + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0));
    draw();
  });

  for (const control of [height, across]) control.addEventListener('input', () => {
    cancelMotion(); setPosition(Number(height.value) / 100, Number(across.value) / 100); draw();
  });
  shapeControl.addEventListener('change', () => { cancelMotion(); shape = shapeControl.value; draw(); });

  centerButtons.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      cancelMotion();
      if (reducedMotion.matches) { weights = [1/3, 1/3, 1/3]; draw(); return; }
      const start = weights.slice();
      let startTime;
      function tick(time) {
        startTime ??= time;
        const progress = Math.min(1, (time - startTime) / 650);
        const eased = 1 - (1 - progress) ** 3;
        weights = start.map(value => value + (1/3 - value) * eased);
        draw(progress === 1);
        if (progress < 1) animation = requestAnimationFrame(tick);
        else animation = null;
      }
      animation = requestAnimationFrame(tick);
    });
  });
  height.disabled = across.disabled = shapeControl.disabled = false;
  reducedMotion.addEventListener('change', () => { cancelMotion(); draw(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelMotion(); });
  draw();
}

const simplex = document.querySelector('[data-cevian-simplex]');
if (simplex) {
  let weights = [42, 27, 19, 12];
  let angle = 32;
  let animation = null;
  let drag;
  const holder = simplex.querySelector('[data-cv-tetra]');
  const rotation = simplex.querySelector('[data-cv-rotation]');
  const controls = [...simplex.querySelectorAll('[data-cv-weight]')];
  const center = simplex.querySelector('[data-cv-tetra-center]');
  const status = simplex.querySelector('[data-cv-volume-status]');
  const redraw = mount(holder, width => tetrahedronDiagram(width, weights, angle));
  function cancelMotion() {
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
  }
  function draw(announce = true) {
    const normalized = normalizeWeights(weights);
    const ratio = simplexRatio(weights);
    controls.forEach((control, i) => {
      control.value = weights[i];
      simplex.querySelector(`[data-cv-weight-output="${i}"]`).value = `${(normalized[i] * 100).toFixed(1)}%`;
    });
    rotation.value = angle;
    simplex.querySelector('[data-cv-volume]').textContent = `${percentage(ratio)} of the volume`;
    status.setAttribute('aria-live', announce ? 'polite' : 'off');
    status.textContent = normalized.every(value => Math.abs(value - .25) < 1e-8) ? 'Equal weights: O is the centroid, the contacts are face centers, and the volume ratio is exactly 1/27 (3.7037%).' : `Volume ratio: ${percentage(ratio)}. The maximum is 1/27, about 3.704%, at equal weights.`;
    redraw();
  }
  controls.forEach((control, i) => {
    control.disabled = false;
    control.addEventListener('input', () => { cancelMotion(); weights[i] = Number(control.value); draw(); });
  });
  rotation.disabled = center.disabled = false;
  rotation.addEventListener('input', () => { angle = Number(rotation.value); redraw(); });
  holder.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = { x: event.clientX, angle };
    holder.setPointerCapture(event.pointerId);
  });
  holder.addEventListener('pointermove', event => {
    if (!drag || !holder.hasPointerCapture(event.pointerId)) return;
    angle = ((drag.angle + (event.clientX - drag.x) * .6) % 360 + 360) % 360;
    rotation.value = angle; redraw();
  });
  function finish(event) {
    drag = null;
    if (holder.hasPointerCapture(event.pointerId)) holder.releasePointerCapture(event.pointerId);
  }
  holder.addEventListener('pointerup', finish);
  holder.addEventListener('pointercancel', finish);
  center.addEventListener('click', () => {
    cancelMotion();
    if (reducedMotion.matches) { weights = [25,25,25,25]; draw(); return; }
    const start = weights.slice();
    let startTime;
    function tick(time) {
      startTime ??= time;
      const progress = Math.min(1, (time - startTime) / 650);
      const eased = 1 - (1 - progress) ** 3;
      weights = start.map(value => value + (25 - value) * eased);
      draw(progress === 1);
      if (progress < 1) animation = requestAnimationFrame(tick);
      else animation = null;
    }
    animation = requestAnimationFrame(tick);
  });
  reducedMotion.addEventListener('change', () => { cancelMotion(); draw(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelMotion(); });
  draw();
}

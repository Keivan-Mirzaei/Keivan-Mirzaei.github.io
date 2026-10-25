const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const familyPlots = {
  family: { left: 58, right: 592, top: 24, bottom: 290, xmin: -2.2, xmax: 2.2, ymin: -3, ymax: 7 },
  derivative: { left: 58, right: 592, top: 24, bottom: 230, xmin: -2.2, xmax: 2.2, ymin: -4.8, ymax: 4.8 },
};
export function familyPoint(plot, x, y) {
  return [plot.left + (x - plot.xmin) / (plot.xmax - plot.xmin) * (plot.right - plot.left),
    plot.bottom - (y - plot.ymin) / (plot.ymax - plot.ymin) * (plot.bottom - plot.top)];
}
export function familyState(x = 1, c = 1) {
  x = Math.round(clamp(Number.isFinite(x) ? x : 1, -1.8, 1.8) * 100) / 100;
  c = Math.round(clamp(Number.isFinite(c) ? c : 1, -2, 2) * 100) / 100;
  return { x, c, value: x * x + c, slope: 2 * x };
}
function familyCurve(c) {
  const p = familyPlots.family;
  return Array.from({ length: 161 }, (_, i) => {
    const x = p.xmin + i / 160 * (p.xmax - p.xmin);
    return `${i ? 'L' : 'M'}${familyPoint(p, x, x * x + c).map(v => v.toFixed(3)).join(' ')}`;
  }).join(' ');
}
export function familyDrag(state, name, point, offset = 0) {
  const p = familyPlots[name === 'c' ? 'family' : 'derivative'];
  if (name === 'c') {
    const y = p.ymin + (p.bottom - (point.y - offset)) / (p.bottom - p.top) * (p.ymax - p.ymin);
    return familyState(state.x, y - state.x * state.x);
  }
  const x = p.xmin + (point.x - offset - p.left) / (p.right - p.left) * (p.xmax - p.xmin);
  return familyState(x, state.c);
}
export function familyKey(state, name, key, fine = false) {
  const max = name === 'c' ? 2 : 1.8;
  const increment = fine ? .01 : .1;
  const value = key === 'Home' ? -max : key === 'End' ? max
    : ['ArrowUp', 'ArrowRight'].includes(key) ? state[name] + increment
      : ['ArrowDown', 'ArrowLeft'].includes(key) ? state[name] - increment : null;
  if (value === null) return state;
  return familyState(name === 'x' ? value : state.x, name === 'c' ? value : state.c);
}

export function initializeAntiderivatives(root, MathJax) {
  if (!root || root.dataset.ready || !MathJax?.tex2chtml) return;
  const document = root.ownerDocument;
  const browser = document.defaultView;
  const cleanup = new AbortController();
  const signal = cleanup.signal;
  const handles = [...root.querySelectorAll('[data-family-handle]')];
  const outputs = [...root.querySelectorAll('[data-family-output]')];
  const curve = root.querySelector('[data-family-curve]');
  const tangent = root.querySelector('[data-family-tangent]');
  const stem = root.querySelector('[data-family-stem]');
  let state = familyState(), drag = null, frame = 0;
  const number = value => {
    if (value === 0) return '0';
    if (Math.abs(value) < .01) {
      const [mantissa, exponent] = value.toExponential(2).split('e');
      return `${Number(mantissa)}\\times10^{${Number(exponent)}}`;
    }
    return String(Number(value.toFixed(2)));
  };
  const cache = new Map();
  function math(tex) {
    if (!cache.has(tex)) {
      if (cache.size >= 128) cache.delete(cache.keys().next().value);
      cache.set(tex, MathJax.tex2chtml(tex, { display: false }));
    }
    return cache.get(tex).cloneNode(true);
  }
  function render() {
    frame = 0;
    root.querySelector('#family-desc').textContent = `The selected parabola has constant ${state.c}. At input ${state.x}, its value is ${Number(state.value.toFixed(4))} and its tangent slope is ${state.slope}. The three reference curves have constants minus two, zero and two.`;
    root.querySelector('#derivative-desc').textContent = `The common derivative is two x. At the selected input ${state.x}, its value is ${state.slope}.`;
    curve.setAttribute('d', familyCurve(state.c));
    const center = familyPoint(familyPlots.family, state.x, state.value);
    const derivative = familyPoint(familyPlots.derivative, state.x, state.slope);
    handles.forEach(handle => {
      const name = handle.dataset.familyHandle, point = name === 'c' ? center : derivative;
      handle.setAttribute('transform', `translate(${point.join(' ')})`);
      handle.setAttribute('aria-valuenow', state[name]);
      handle.setAttribute('aria-valuetext', name === 'c' ? `Constant ${state.c}; slope ${state.slope}` : `Input ${state.x}; derivative ${state.slope}`);
    });
    const left = familyPoint(familyPlots.family, state.x - .55, state.value - .55 * state.slope);
    const right = familyPoint(familyPlots.family, state.x + .55, state.value + .55 * state.slope);
    for (const [key, value] of Object.entries({ x1: left[0], y1: left[1], x2: right[0], y2: right[1] })) tangent.setAttribute(key, value);
    const axis = familyPoint(familyPlots.derivative, state.x, 0);
    for (const [key, value] of Object.entries({ x1: axis[0], y1: axis[1], x2: derivative[0], y2: derivative[1] })) stem.setAttribute(key, value);
    const formulas = {
      c: `C=${number(state.c)}`, x: `x=${number(state.x)}`,
      value: `F(${number(state.x)})=${number(state.value)}`,
      slope: String.raw`F^{\prime}(x)=f(x)=${number(state.slope)}`,
    };
    outputs.forEach(output => {
      const name = output.dataset.familyOutput;
      if (output.dataset.tex === formulas[name]) return;
      output.dataset.tex = formulas[name]; output.dataset.value = String(state[name]);
      output.replaceChildren(math(formulas[name]));
    });
    const sheet = MathJax.chtmlStylesheet?.();
    if (sheet) {
      const current = document.getElementById('MJX-CHTML-styles');
      if (current?.textContent !== sheet.textContent) {
        if (current) current.replaceWith(sheet); else document.head.appendChild(sheet);
      }
    }
  }
  function update(next) {
    state = next;
    if (!frame) frame = browser.requestAnimationFrame(render);
  }
  function point(event, svg) {
    const p = svg.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  function release(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const { svg, handle, id } = drag; drag = null;
    handle.removeAttribute('data-dragging');
    if (svg.hasPointerCapture(id)) svg.releasePointerCapture(id);
  }
  for (const handle of handles) {
    const name = handle.dataset.familyHandle;
    const svg = handle.ownerSVGElement;
    handle.addEventListener('keydown', event => {
      const next = familyKey(state, name, event.key, event.shiftKey);
      if (next === state) return;
      event.preventDefault(); update(next);
    }, { signal });
    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0 || drag) return;
      event.preventDefault(); handle.focus({ preventScroll: true });
      const p = point(event, svg);
      const center = name === 'c' ? familyPoint(familyPlots.family, state.x, state.value)
        : familyPoint(familyPlots.derivative, state.x, state.slope);
      drag = { name, svg, handle, id: event.pointerId, offset: name === 'c' ? p.y - center[1] : p.x - center[0] };
      handle.setAttribute('data-dragging', ''); svg.setPointerCapture(event.pointerId);
    }, { signal });
    svg.addEventListener('pointermove', event => {
      if (!drag || drag.svg !== svg || event.pointerId !== drag.id) return;
      update(familyDrag(state, drag.name, point(event, svg), drag.offset));
    }, { signal });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) svg.addEventListener(type, release, { signal });
    svg.addEventListener('dragstart', event => event.preventDefault(), { signal });
  }
  function dispose() {
    if (frame) browser.cancelAnimationFrame(frame);
    if (drag) release({ pointerId: drag.id });
    cleanup.abort();
  }
  // Navigation can replace the article while the site shell stays alive.
  document.addEventListener('site:page', () => { if (!root.isConnected) dispose(); }, { signal });
  browser.addEventListener('pagehide', event => { if (!event.persisted) dispose(); }, { signal });
  render();
  handles.forEach(handle => {
    handle.setAttribute('tabindex', '0'); handle.setAttribute('role', 'slider');
    const name = handle.dataset.familyHandle, max = name === 'c' ? 2 : 1.8;
    handle.setAttribute('aria-valuemin', -max); handle.setAttribute('aria-valuemax', max);
    handle.setAttribute('aria-orientation', name === 'c' ? 'vertical' : 'horizontal');
  });
  root.querySelectorAll('[data-family-readouts]').forEach(readouts => { readouts.hidden = false; });
  root.querySelector('[data-family-instruction]').hidden = false;
  root.dataset.ready = 'true';
  return dispose;
}

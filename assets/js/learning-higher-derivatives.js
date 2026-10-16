(() => {
  const root = document.getElementById('higher-explorer');
  if (!root) return;
  const ns = 'http://www.w3.org/2000/svg';
  const models = [
    { id: 'position', symbol: 's', unit: 'm', color: '#285b46', min: -1, max: 5, ticks: [0, 2, 4], value: t => t ** 3 - 6 * t * t + 9 * t, slope: t => 3 * t * t - 12 * t + 9 },
    { id: 'velocity', symbol: 'v', unit: 'm/s', color: '#537ca4', min: -4, max: 10, ticks: [-3, 0, 9], value: t => 3 * t * t - 12 * t + 9, slope: t => 6 * t - 12 },
    { id: 'acceleration', symbol: 'a', unit: 'm/s²', color: '#89709e', min: -13, max: 13, ticks: [-12, 0, 12], value: t => 6 * t - 12 },
  ];
  const path = points => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
  const x = t => 60 + 107.5 * t;
  const label = value => (Math.abs(value) < .00001 ? 0 : value).toFixed(2).replace('-', '−');
  function node(tag, attrs, parent, text) {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    if (text !== undefined) el.textContent = text;
    parent.appendChild(el); return el;
  }
  let time = 1.5;
  const play = document.getElementById('higher-play');
  let frame = null, lastFrame = null;
  function pause() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; lastFrame = null;
    play.textContent = time >= 4 ? 'Replay' : 'Play';
    play.setAttribute('aria-label', time >= 4 ? 'Replay motion' : 'Play motion');
  }
  function animate(now) {
    const elapsed = lastFrame === null ? 0 : Math.min((now - lastFrame) / 1000, .1);
    lastFrame = now;
    update(time + elapsed, false);
    if (time >= 4) { pause(); return; }
    frame = requestAnimationFrame(animate);
  }
  play.addEventListener('click', () => {
    if (frame !== null) { pause(); return; }
    if (time >= 4) update(0);
    play.textContent = 'Pause'; play.setAttribute('aria-label', 'Pause motion');
    frame = requestAnimationFrame(animate);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  const plots = models.map(model => {
    const svg = document.getElementById(`higher-${model.id}`);
    const y = value => 145 - (value - model.min) * 125 / (model.max - model.min);
    const text = (tx, ty, value, anchor = 'middle') => node('text', { x: tx, y: ty, 'text-anchor': anchor, fill: '#686e66', 'font-size': 12, 'font-family': '-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif', stroke: '#fcfcf9', 'stroke-width': 4, 'paint-order': 'stroke' }, svg, value);
    const defs = node('defs', {}, svg), clip = node('clipPath', { id: `higher-${model.id}-clip` }, defs);
    node('rect', { x: 59, y: 18, width: 433, height: 130 }, clip);
    const axisY = y(0);
    node('path', { d: `M60 18V145M60 ${axisY}H490`, fill: 'none', stroke: '#c9d1c6' }, svg);
    for (const tick of [1, 2, 3, 4]) {
      node('path', { d: `M${x(tick)} ${axisY - 3}v6`, stroke: '#9eac96' }, svg);
      text(x(tick), axisY + 19, tick);
    }
    for (const tick of model.ticks) {
      node('path', { d: `M57 ${y(tick)}h6`, stroke: '#9eac96' }, svg);
      text(48, y(tick) + 4, String(tick).replace('-', '−'), 'end');
    }
    text(505, axisY + 5, 't');
    const curves = node('g', { 'clip-path': `url(#higher-${model.id}-clip)` }, svg);
    node('path', { d: path(Array.from({ length: 241 }, (_, i) => [x(i / 60), y(model.value(i / 60))])), fill: 'none', stroke: model.color, 'stroke-width': 2.5 }, curves);
    const guide = node('path', { fill: 'none', stroke: '#9eac96', 'stroke-dasharray': '4 5' }, curves);
    const tangent = model.slope ? node('path', { fill: 'none', stroke: '#a67936', 'stroke-width': 2 }, curves) : null;
    node('rect', { x: 528, y: 114, width: 105, height: 41, rx: 4, fill: '#edf1e9' }, svg);
    node('path', { d: 'M537 126h16', stroke: model.color, 'stroke-width': 2.5 }, svg);
    text(561, 130, `${model.symbol} (${model.unit})`, 'start');
    if (tangent) {
      node('path', { d: 'M537 144h16', stroke: '#a67936', 'stroke-width': 2 }, svg);
      text(561, 148, 'Tangent', 'start');
    }
    const handle = node('g', { class: 'graph-handle', role: 'slider', tabindex: 0, 'aria-label': `Time on ${model.id} graph`, 'aria-valuemin': 0, 'aria-valuemax': 4 }, svg);
    const hit = node('circle', { r: 23, fill: 'transparent' }, handle);
    const dot = node('circle', { r: 5.5, fill: model.color, stroke: '#fcfcf9', 'stroke-width': 2 }, handle);
    let drag = null;
    function localX(event) {
      const p = svg.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse()).x;
    }
    handle.addEventListener('pointerdown', event => {
      if (drag || event.button !== 0) return;
      event.preventDefault(); pause();
      drag = { id: event.pointerId, offset: localX(event) - x(time) };
      handle.setPointerCapture(event.pointerId); handle.setAttribute('data-dragging', ''); handle.focus({ preventScroll: true });
    });
    handle.addEventListener('pointermove', event => {
      if (drag?.id === event.pointerId) update((localX(event) - drag.offset - 60) / 107.5);
    });
    function release(event) {
      if (drag?.id !== event.pointerId) return;
      const id = drag.id; drag = null;
      if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
      handle.removeAttribute('data-dragging');
    }
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(event, release);
    handle.addEventListener('keydown', event => {
      const values = { ArrowLeft: time - .05, ArrowDown: time - .05, ArrowRight: time + .05, ArrowUp: time + .05, Home: 0, End: 4 };
      if (!(event.key in values)) return;
      event.preventDefault(); pause(); update(values[event.key]);
    });
    return { model, y, guide, tangent, handle, hit, dot };
  });
  function update(next, round = true) {
    time = Math.max(0, Math.min(4, next));
    if (round) time = Math.round(time * 100) / 100;
    document.getElementById('higher-time').value = label(time);
    const position = models[0].value(time);
    document.getElementById('higher-cart').setAttribute('transform', `translate(${60 + 107.5 * position} 0)`);
    for (const { model, y, guide, tangent, handle, hit, dot } of plots) {
      const px = x(time), py = y(model.value(time));
      guide.setAttribute('d', `M${px} 18V145`);
      for (const el of [hit, dot]) { el.setAttribute('cx', px); el.setAttribute('cy', py); }
      if (tangent) {
        const dx = 107.5, dy = -125 * model.slope(time) / (model.max - model.min), scale = 48 / Math.hypot(dx, dy);
        tangent.setAttribute('d', path([[px - dx * scale, py - dy * scale], [px + dx * scale, py + dy * scale]]));
      }
      handle.setAttribute('aria-valuenow', time);
      handle.setAttribute('aria-valuetext', `${label(time)} seconds; ${model.id} ${label(model.value(time))} ${model.unit}`);
      document.getElementById(`higher-${model.symbol}`).value = label(model.value(time));
    }
  }
  update(time);
})();

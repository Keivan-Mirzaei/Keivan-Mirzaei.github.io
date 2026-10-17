(() => {
  const get = id => document.getElementById(`hyperbolic-${id}`);
  const svg = document.querySelector('#hyperbolic-explorer svg');
  const handle = get('handle');
  const screen = t => [100 + 70 * Math.cosh(t), 200 - 70 * Math.sinh(t)];
  const path = points => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(3)} ${y.toFixed(3)}`).join('');
  get('curve').setAttribute('d', path(Array.from({ length: 321 }, (_, i) => screen(-1.6 + i / 100))));
  let t = .75, drag = null;
  const display = value => (Math.abs(value) < 1e-10 ? 0 : value).toFixed(2).replace('-', '−');
  function update(next) {
    t = Math.round(Math.max(-1.6, Math.min(1.6, next)) * 100) / 100;
    if (Math.abs(t) < .025) t = 0;
    const X = Math.cosh(t), Y = Math.sinh(t), [px, py] = screen(t);
    for (const part of ['dot', 'hit', 'focus']) { get(part).setAttribute('cx', px); get(part).setAttribute('cy', py); }
    get('guide').setAttribute('d', `M100 ${py}H${px}V200`);
    for (const [id, value] of [['t', t], ['x', X], ['y', Y]]) get(id).value = display(value);
    handle.setAttribute('aria-valuenow', t);
    handle.setAttribute('aria-valuetext', `Parameter ${display(t)}; x ${display(X)}, y ${display(Y)}`);
  }
  function graphY(event) {
    const p = svg.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse()).y;
  }
  handle.addEventListener('pointerdown', event => {
    if (drag || event.button !== 0) return;
    event.preventDefault(); drag = { id: event.pointerId, offset: graphY(event) - screen(t)[1] };
    handle.setPointerCapture(event.pointerId); handle.setAttribute('data-dragging', ''); handle.focus({ preventScroll: true });
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) update(Math.asinh((200 - graphY(event) + drag.offset) / 70));
  });
  function release(event) {
    if (drag?.id !== event.pointerId) return;
    const id = drag.id; drag = null;
    if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
    handle.removeAttribute('data-dragging');
  }
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(event, release);
  handle.addEventListener('keydown', event => {
    const next = { ArrowLeft: t - .05, ArrowDown: t - .05, ArrowRight: t + .05, ArrowUp: t + .05, Home: -1.6, End: 1.6 };
    if (!(event.key in next)) return;
    event.preventDefault(); update(next[event.key]);
  });
  update(t);
})();

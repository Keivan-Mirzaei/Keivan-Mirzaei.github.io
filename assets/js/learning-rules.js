(() => {
  const svg = document.querySelector('#rules-explorer svg');
  const handle = document.getElementById('rules-handle');
  let h = 0.7;
  let drag = null;
  function attrs(id, values) {
    const element = document.getElementById(id);
    for (const [key, value] of Object.entries(values)) element.setAttribute(key, value);
  }
  function update(next) {
    h = Math.round(Math.max(0, Math.min(1, next)) * 100) / 100;
    const width = 100 * h, y = 130 - 100 * h;
    attrs('rules-top', { y, height: 100 * h });
    attrs('rules-right', { width });
    attrs('rules-corner', { y, width, height: 100 * h });
    attrs('rules-outline', { d: `M80 130V${y}H${280 + width}V280H280` });
    for (const part of ['dot', 'hit', 'focus']) attrs(`rules-${part}`, { cx: 280 + width, cy: y });
    for (const [part, x, labelY] of [['top', 180, 130 - 50 * h], ['right', 280 + 50 * h, 205], ['corner', 280 + 50 * h, 130 - 50 * h]]) {
      const label = document.getElementById(`rules-${part}-label`);
      label.hidden = h < 0.2;
      label.style.left = `${(x + 90) / 640 * 100}%`;
      label.style.top = `${labelY / 350 * 100}%`;
    }
    document.getElementById('rules-h').value = h.toFixed(2);
    document.getElementById('rules-rate').value = h === 0 ? '—' : (7 + 2 * h).toFixed(2);
    handle.setAttribute('aria-valuenow', h);
    handle.setAttribute('aria-valuetext', `Increment ${h.toFixed(2)}; ${h === 0 ? 'quotient undefined; derivative 7' : 'average area rate ' + (7 + 2 * h).toFixed(2)}`);
  }
  function graphX(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse()).x;
  }
  handle.addEventListener('pointerdown', event => {
    if (drag || event.button !== 0) return;
    event.preventDefault();
    drag = { id: event.pointerId, offset: graphX(event) - (370 + 100 * h) };
    handle.setPointerCapture(event.pointerId);
    handle.setAttribute('data-dragging', '');
    handle.focus({ preventScroll: true });
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) update((graphX(event) - drag.offset - 370) / 100);
  });
  function release(event) {
    if (drag?.id !== event.pointerId) return;
    const id = drag.id;
    drag = null;
    if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
    handle.removeAttribute('data-dragging');
  }
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(name, release);
  handle.addEventListener('keydown', event => {
    const next = { ArrowLeft: h - 0.01, ArrowDown: h - 0.01, ArrowRight: h + 0.01, ArrowUp: h + 0.01, Home: 0, End: 1 };
    if (!(event.key in next)) return;
    event.preventDefault();
    update(next[event.key]);
  });
  svg.addEventListener('dragstart', event => event.preventDefault());
  update(h);
})();

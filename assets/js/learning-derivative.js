(() => {
  const svg = document.querySelector('#derivative-explorer svg');
  const handle = document.getElementById('derivative-handle');
  const screenX = x => 80 + 180 * x;
  const screenY = y => 320 - 40 * y;
  const curve = Array.from({ length: 151 }, (_, i) => {
    const x = i / 60;
    return `${i ? 'L' : 'M'}${screenX(x)} ${screenY(x * x)}`;
  });
  document.getElementById('derivative-curve').setAttribute('d', curve.join(''));
  let x = 2.2;
  let drag = null;
  function update(next) {
    x = Math.round(Math.max(0, Math.min(2.5, next)) * 100) / 100;
    const h = Math.round((x - 1) * 100) / 100;
    const px = screenX(x), py = screenY(x * x);
    for (const part of ['dot', 'hit', 'focus']) {
      const circle = document.getElementById(`derivative-${part}`);
      circle.setAttribute('cx', px);
      circle.setAttribute('cy', py);
    }
    const run = document.getElementById('derivative-run-label');
    const rise = document.getElementById('derivative-rise-label');
    run.hidden = rise.hidden = h === 0;
    run.style.left = `${(260 + px) / 2 / 640 * 100}%`;
    run.style.top = `${294 / 370 * 100}%`;
    rise.style.left = `${(Math.max(260, px) + 16) / 640 * 100}%`;
    rise.style.top = `${(280 + py) / 2 / 370 * 100}%`;
    const secant = document.getElementById('derivative-secant');
    secant.setAttribute('d', `M80 ${screenY(1 - (x + 1))}L530 ${screenY(1 + (x + 1) * 1.5)}`);
    secant.setAttribute('visibility', h === 0 ? 'hidden' : 'visible');
    document.getElementById('derivative-dot').setAttribute('visibility', h === 0 ? 'hidden' : 'visible');
    document.getElementById('derivative-triangle').setAttribute('d', `M260 280H${px}V${py}`);
    document.getElementById('derivative-h').value = h.toFixed(2);
    document.getElementById('derivative-slope').value = h === 0 ? '—' : (x + 1).toFixed(2);
    handle.setAttribute('aria-valuenow', x);
    handle.setAttribute('aria-valuetext', `Input ${x.toFixed(2)}; increment ${h.toFixed(2)}; ${h === 0 ? 'secant undefined; tangent slope 2' : 'secant slope ' + (x + 1).toFixed(2)}`);
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
    drag = { id: event.pointerId, offset: graphX(event) - screenX(x) };
    handle.setPointerCapture(event.pointerId);
    handle.setAttribute('data-dragging', '');
    handle.focus({ preventScroll: true });
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) update((graphX(event) - drag.offset - 80) / 180);
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
    const step = event.shiftKey ? 0.01 : 0.05;
    const next = { ArrowLeft: x - step, ArrowDown: x - step, ArrowRight: x + step, ArrowUp: x + step, Home: 0, End: 2.5 };
    if (!(event.key in next)) return;
    event.preventDefault();
    update(next[event.key]);
  });
  svg.addEventListener('dragstart', event => event.preventDefault());
  update(x);
})();

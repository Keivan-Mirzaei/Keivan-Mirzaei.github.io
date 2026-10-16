(() => {
  const svg = document.querySelector('#implicit-explorer svg');
  const handle = document.getElementById('implicit-handle');
  let angle = Math.PI / 4;
  let drag = null;
  const display = value => (Math.abs(value) < 1e-10 ? 0 : value).toFixed(2);
  function update(next) {
    angle = Math.max(0, Math.min(2 * Math.PI, next));
    for (const landmark of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI]) {
      if (Math.abs(angle - landmark) < 0.025) angle = landmark;
    }
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    const x = 2 * cosine, y = 2 * sine;
    const px = 320 + 150 * cosine, py = 210 - 150 * sine;
    for (const part of ['dot', 'hit', 'focus']) {
      const circle = document.getElementById(`implicit-${part}`);
      circle.setAttribute('cx', px);
      circle.setAttribute('cy', py);
    }
    const dx = -90 * sine, dy = -90 * cosine;
    document.getElementById('implicit-tangent').setAttribute('d', `M${px - dx} ${py - dy}L${px + dx} ${py + dy}`);
    document.getElementById('implicit-guide').setAttribute('d', `M${px} 210V${py}H320`);
    const slope = Math.abs(y) < 1e-10 ? 'undefined' : display(-x / y);
    document.getElementById('implicit-x').value = display(x);
    document.getElementById('implicit-y').value = display(y);
    document.getElementById('implicit-slope').value = slope;
    handle.setAttribute('aria-valuenow', angle);
    handle.setAttribute('aria-valuetext', `x ${display(x)}, y ${display(y)}; ${slope === 'undefined' ? 'vertical tangent, derivative undefined' : 'slope ' + slope}`);
  }
  function graphPoint(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse());
  }
  function pointerAngle(event) {
    const point = graphPoint(event);
    return Math.atan2(210 - point.y, point.x - 320);
  }
  handle.addEventListener('pointerdown', event => {
    if (drag || event.button !== 0) return;
    event.preventDefault();
    drag = { id: event.pointerId, offset: pointerAngle(event) - angle };
    handle.setPointerCapture(event.pointerId);
    handle.setAttribute('data-dragging', '');
    handle.focus({ preventScroll: true });
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    const next = pointerAngle(event) - drag.offset;
    update(((next % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
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
    const step = Math.PI / 24;
    const next = { ArrowLeft: angle - step, ArrowDown: angle - step, ArrowRight: angle + step, ArrowUp: angle + step, Home: 0, End: 2 * Math.PI };
    if (!(event.key in next)) return;
    event.preventDefault();
    update(next[event.key]);
  });
  svg.addEventListener('dragstart', event => event.preventDefault());
  update(angle);
})();

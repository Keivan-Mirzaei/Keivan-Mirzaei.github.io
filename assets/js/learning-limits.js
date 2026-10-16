(() => {
  const svg = document.querySelector('#limits-explorer svg');
  const handle = document.getElementById('limit-handle');
  const point = document.getElementById('limit-moving-point');
  const hitTarget = document.getElementById('limit-hit-target');
  const focusRing = document.getElementById('limit-focus-ring');
  const guides = document.getElementById('limit-guides');
  let x = 1;
  let pointerId = null;
  let dragOffset = 0;

  function update(value) {
    x = Math.round(Math.max(0, Math.min(4, value)) * 1000) / 1000;
    const y = x === 2 ? 1 : x + 2;
    const px = 50 + 120 * x;
    const py = 340 - 50 * y;
    for (const circle of [point, hitTarget, focusRing]) {
      circle.setAttribute('cx', px);
      circle.setAttribute('cy', py);
    }
    guides.setAttribute('d', `M${px} 340V${py}H50`);
    document.getElementById('limit-x').value = x.toFixed(3);
    document.getElementById('limit-y').value = y.toFixed(3);
    handle.setAttribute('aria-valuenow', x);
    handle.setAttribute('aria-valuetext', `x ${x.toFixed(3)}; function value ${y.toFixed(3)}; limit 4`);
  }

  function graphX(event) {
    const position = svg.createSVGPoint();
    position.x = event.clientX;
    position.y = event.clientY;
    return position.matrixTransform(svg.getScreenCTM().inverse()).x;
  }
  handle.addEventListener('pointerdown', event => {
    if (pointerId !== null || event.button !== 0) return;
    event.preventDefault();
    pointerId = event.pointerId;
    dragOffset = graphX(event) - (50 + 120 * x);
    handle.setPointerCapture(pointerId);
    handle.setAttribute('data-dragging', '');
    handle.focus({ preventScroll: true });
  });
  handle.addEventListener('pointermove', event => {
    if (event.pointerId === pointerId) update((graphX(event) - dragOffset - 50) / 120);
  });
  function endDrag(event) {
    if (event.pointerId !== pointerId) return;
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
    pointerId = null;
    handle.removeAttribute('data-dragging');
  }
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(event, endDrag);
  handle.addEventListener('keydown', event => {
    const step = event.shiftKey ? 0.001 : 0.01;
    const values = { ArrowLeft: x - step, ArrowDown: x - step, ArrowRight: x + step, ArrowUp: x + step, Home: 0, End: 4 };
    if (!(event.key in values)) return;
    event.preventDefault();
    update(values[event.key]);
  });
  svg.addEventListener('dragstart', event => event.preventDefault());
  update(x);
})();

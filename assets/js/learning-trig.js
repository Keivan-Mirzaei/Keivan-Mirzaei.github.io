(() => {
  const svg = document.querySelector('#trig-explorer svg');
  const handle = document.getElementById('trig-handle');
  const screenX = x => 70 + 500 * x / (2 * Math.PI);
  const screenY = (value, base) => base - 55 * value;
  for (const [name, fn, base] of [['sine', Math.sin, 125], ['cosine', Math.cos, 330]]) {
    const path = Array.from({ length: 241 }, (_, i) => {
      const x = i * 2 * Math.PI / 240;
      return `${i ? 'L' : 'M'}${screenX(x)} ${screenY(fn(x), base)}`;
    });
    document.getElementById(`trig-${name}`).setAttribute('d', path.join(''));
  }
  let x = Math.PI / 4;
  let drag = null;
  const display = value => (Math.abs(value) < 1e-10 ? 0 : value).toFixed(2);
  function update(next) {
    x = Math.max(0, Math.min(2 * Math.PI, next));
    for (const landmark of [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2, 2 * Math.PI]) {
      if (Math.abs(x - landmark) < 0.025) x = landmark;
    }
    const px = screenX(x), value = Math.sin(x), slope = Math.cos(x);
    for (const [name, y] of [['sine', screenY(value, 125)], ['cosine', screenY(slope, 330)]]) {
      for (const part of ['dot', 'hit', 'focus']) {
        const circle = document.getElementById(`trig-${name}-${part}`);
        circle.setAttribute('cx', px);
        circle.setAttribute('cy', y);
      }
    }
    document.getElementById('trig-guide').setAttribute('d', `M${px} 45V405`);
    document.getElementById('trig-tangent').setAttribute('d', `M${screenX(x - 0.65)} ${screenY(value - slope * 0.65, 125)}L${screenX(x + 0.65)} ${screenY(value + slope * 0.65, 125)}`);
    document.getElementById('trig-x').value = display(x);
    document.getElementById('trig-value').value = display(value);
    document.getElementById('trig-slope').value = display(slope);
    handle.setAttribute('aria-valuenow', x);
    handle.setAttribute('aria-valuetext', `${display(x)} radians; sine ${display(value)}; tangent slope ${display(slope)}`);
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
    if (drag?.id === event.pointerId) update((graphX(event) - drag.offset - 70) * 2 * Math.PI / 500);
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
    const next = { ArrowLeft: x - step, ArrowDown: x - step, ArrowRight: x + step, ArrowUp: x + step, Home: 0, End: 2 * Math.PI };
    if (!(event.key in next)) return;
    event.preventDefault();
    update(next[event.key]);
  });
  svg.addEventListener('dragstart', event => event.preventDefault());
  update(x);
})();

(() => {
  const svg = document.querySelector('#hyperbolic-explorer svg');
  const handle = document.getElementById('hyperbolic-handle');
  const functions = {
    sinh: { value: Math.sinh, slope: Math.cosh },
    cosh: { value: Math.cosh, slope: Math.sinh },
    tanh: { value: Math.tanh, slope: x => 1 / Math.cosh(x) ** 2 },
  };
  const screenX = x => 320 + 120 * x;
  const screenY = y => 200 - 40 * y;
  let selected = 'cosh';
  let x = 0.75;
  let drag = null;
  const display = value => (Math.abs(value) < 1e-10 ? 0 : value).toFixed(2);
  function drawCurve() {
    const path = Array.from({ length: 241 }, (_, i) => {
      const input = -2 + i / 60;
      return `${i ? 'L' : 'M'}${screenX(input)} ${screenY(functions[selected].value(input))}`;
    });
    document.getElementById('hyperbolic-curve').setAttribute('d', path.join(''));
  }
  function update(next) {
    x = Math.round(Math.max(-2, Math.min(2, next)) * 100) / 100;
    const value = functions[selected].value(x), slope = functions[selected].slope(x);
    const px = screenX(x), py = screenY(value);
    for (const part of ['dot', 'hit', 'focus']) {
      const circle = document.getElementById(`hyperbolic-${part}`);
      circle.setAttribute('cx', px);
      circle.setAttribute('cy', py);
    }
    const halfRun = 0.55;
    document.getElementById('hyperbolic-tangent').setAttribute('d', `M${screenX(x - halfRun)} ${screenY(value - slope * halfRun)}L${screenX(x + halfRun)} ${screenY(value + slope * halfRun)}`);
    document.getElementById('hyperbolic-guide').setAttribute('d', `M${px} 200V${py}`);
    document.getElementById('hyperbolic-x').value = display(x);
    document.getElementById('hyperbolic-value').value = display(value);
    document.getElementById('hyperbolic-slope').value = display(slope);
    handle.setAttribute('aria-valuenow', x);
    handle.setAttribute('aria-valuetext', `${selected} at ${display(x)}; value ${display(value)}; slope ${display(slope)}`);
  }
  for (const radio of document.querySelectorAll('[name="hyperbolic-function"]')) {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      selected = radio.value;
      drawCurve();
      update(x);
    });
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
    if (drag?.id === event.pointerId) update((graphX(event) - drag.offset - 320) / 120);
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
    const next = { ArrowLeft: x - 0.05, ArrowDown: x - 0.05, ArrowRight: x + 0.05, ArrowUp: x + 0.05, Home: -2, End: 2 };
    if (!(event.key in next)) return;
    event.preventDefault();
    update(next[event.key]);
  });
  svg.addEventListener('dragstart', event => event.preventDefault());
  drawCurve();
  update(x);
})();

(() => {
  const get = id => document.getElementById(`chain-${id}`);
  const svg = document.querySelector('#chain-explorer svg');
  const handle = get('handle');
  let time = 1, drag = null;
  const display = value => value.toFixed(2);
  function update(next) {
    time = Math.round(Math.max(0, Math.min(3, next)) * 100) / 100;
    const h = 1 + time / 2, y = 345 - 100 * h;
    const rx = 50 * h, ry = rx * 29 / 150;
    const surface = `M${320 - rx} ${y}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
    get('water').setAttribute('d', `M${320 - rx} ${y}A${rx} ${ry} 0 0 1 ${320 + rx} ${y}L320 345Z`);
    for (const id of ['surface', 'surface-hit']) get(id).setAttribute('d', surface);
    get('height-guide').setAttribute('d', `M320 345H510V${y}H${320 + 50 * h}`);
    get('height-label').setAttribute('y', (345 + y) / 2 + 5);
    for (const [id, value] of [['time', time], ['height', h], ['volume', Math.PI * h ** 3 / 12], ['volume-rate', Math.PI * h * h / 4], ['total-rate', Math.PI * h * h / 8]]) get(id).value = display(value);
    handle.setAttribute('aria-valuenow', time);
    handle.setAttribute('aria-valuetext', `${display(time)} seconds; height ${display(h)} metres; inflow ${display(Math.PI * h * h / 8)} cubic metres per second`);
  }
  function graphY(event) {
    const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse()).y;
  }
  handle.addEventListener('pointerdown', event => {
    if (drag || event.button !== 0) return;
    event.preventDefault();
    drag = { id: event.pointerId, offset: graphY(event) - (245 - 50 * time) };
    handle.setPointerCapture(event.pointerId); handle.setAttribute('data-dragging', ''); handle.focus({ preventScroll: true });
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) update((245 - graphY(event) + drag.offset) / 50);
  });
  function release(event) {
    if (drag?.id !== event.pointerId) return;
    const id = drag.id; drag = null;
    if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
    handle.removeAttribute('data-dragging');
  }
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(name, release);
  handle.addEventListener('keydown', event => {
    const next = { ArrowLeft: time - .05, ArrowDown: time - .05, ArrowRight: time + .05, ArrowUp: time + .05, Home: 0, End: 3 };
    if (!(event.key in next)) return;
    event.preventDefault(); update(next[event.key]);
  });
  svg.addEventListener('dragstart', event => event.preventDefault());
  update(time);
})();

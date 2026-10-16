(() => {
  const svg = document.querySelector('#continuity-explorer svg');
  const values = { left: 3, point: 1, right: 4 };
  const controls = Object.fromEntries(Object.keys(values).map(key => [key, {
    handle: document.getElementById(`continuity-${key}-handle`),
    circles: key === 'point' ? ['dot', 'hit', 'focus'].map(part => document.getElementById(`continuity-point-${part}`)) : [],
    output: document.getElementById(`continuity-${key}-value`),
  }]));
  let drag = null;

  function update(key, next) {
    values[key] = Math.round(Math.max(0, Math.min(5.5, next)) * 10) / 10;
    const y = 340 - 50 * values[key];
    const control = controls[key];
    for (const circle of control.circles) circle.setAttribute('cy', y);
    control.output.value = values[key].toFixed(1);
    control.handle.setAttribute('aria-valuenow', values[key]);
    control.handle.setAttribute('aria-valuetext', `${key === 'point' ? 'Function value' : key + '-hand limit'} ${values[key].toFixed(1)}`);
    if (key !== 'point') {
      const path = key === 'left' ? `M70 ${y + 45}C145 ${y + 55} 205 ${y - 50} 290 ${y}` : `M290 ${y}C365 ${y + 60} 450 ${y - 65} 550 ${y - 30}`;
      for (const part of ['branch', 'hit']) document.getElementById(`continuity-${key}-${part}`).setAttribute('d', path);
      document.getElementById(`continuity-${key}-end`).setAttribute('cy', y);
    }
    const continuous = values.left === values.right && values.left === values.point;
    const state = document.getElementById('continuity-state');
    state.textContent = continuous ? 'Continuous' : 'Not continuous';
    state.dataset.continuous = String(continuous);
    svg.dataset.continuous = String(continuous);
    const glow = document.getElementById('continuity-join-glow');
    glow.setAttribute('cy', 340 - 50 * values.point);
    glow.setAttribute('opacity', continuous ? '0.12' : '0');
  }
  function graphY(event) {
    const position = svg.createSVGPoint();
    position.x = event.clientX;
    position.y = event.clientY;
    return position.matrixTransform(svg.getScreenCTM().inverse()).y;
  }
  for (const [key, { handle }] of Object.entries(controls)) {
    handle.addEventListener('pointerdown', event => {
      if (drag || event.button !== 0) return;
      event.preventDefault();
      drag = { key, pointerId: event.pointerId, offset: graphY(event) - (340 - 50 * values[key]) };
      handle.setPointerCapture(event.pointerId);
      handle.setAttribute('data-dragging', '');
      handle.focus({ preventScroll: true });
    });
    handle.addEventListener('pointermove', event => {
      if (drag?.key === key && drag.pointerId === event.pointerId) update(key, (340 - graphY(event) + drag.offset) / 50);
    });
    function endDrag(event) {
      if (drag?.key !== key || drag.pointerId !== event.pointerId) return;
      const released = drag.pointerId;
      drag = null;
      if (handle.hasPointerCapture(released)) handle.releasePointerCapture(released);
      handle.removeAttribute('data-dragging');
    }
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(name, endDrag);
    handle.addEventListener('keydown', event => {
      const next = { ArrowUp: values[key] + 0.1, ArrowRight: values[key] + 0.1, ArrowDown: values[key] - 0.1, ArrowLeft: values[key] - 0.1, Home: 0, End: 5.5 };
      if (!(event.key in next)) return;
      event.preventDefault();
      update(key, next[event.key]);
    });
    update(key, values[key]);
  }
  svg.addEventListener('dragstart', event => event.preventDefault());
})();

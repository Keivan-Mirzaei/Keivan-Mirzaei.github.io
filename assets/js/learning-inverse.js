(() => {
  const svg = document.querySelector('#inverse-explorer svg');
  const keys = ['original', 'inverse'];
  const screenX = x => 130 + 90 * x;
  const screenY = y => 390 - 90 * y;
  for (const key of keys) {
    const path = Array.from({ length: 201 }, (_, i) => {
      const x = i * (key === 'original' ? 2 : 4) / 200;
      const y = key === 'original' ? x * x : Math.sqrt(x);
      return `${i ? 'L' : 'M'}${screenX(x)} ${screenY(y)}`;
    });
    document.getElementById(`inverse-${key}-curve`).setAttribute('d', path.join(''));
  }
  let a = 1.3;
  let drag = null;
  function update(next) {
    a = Math.round(Math.max(0.5, Math.min(2, next)) * 100) / 100;
    for (const key of keys) {
      const x = key === 'original' ? a : a * a;
      const y = key === 'original' ? a * a : a;
      const slope = key === 'original' ? 2 * a : 1 / (2 * a);
      for (const part of ['dot', 'hit', 'focus']) {
        const circle = document.getElementById(`inverse-${key}-${part}`);
        circle.setAttribute('cx', screenX(x));
        circle.setAttribute('cy', screenY(y));
      }
      const halfRun = 0.65 / Math.hypot(1, slope);
      document.getElementById(`inverse-${key}-tangent`).setAttribute('d', `M${screenX(x - halfRun)} ${screenY(y - slope * halfRun)}L${screenX(x + halfRun)} ${screenY(y + slope * halfRun)}`);
      const handle = document.getElementById(`inverse-${key}-handle`);
      handle.setAttribute('aria-valuenow', x);
      handle.setAttribute('aria-valuetext', `Input ${x.toFixed(2)}; output ${y.toFixed(2)}; slope ${slope.toFixed(2)}`);
    }
    document.getElementById('inverse-pair-guide').setAttribute('d', `M${screenX(a)} ${screenY(a * a)}L${screenX(a * a)} ${screenY(a)}`);
    document.getElementById('inverse-a').value = a.toFixed(2);
    document.getElementById('inverse-slope').value = (2 * a).toFixed(2);
    document.getElementById('inverse-reciprocal').value = (1 / (2 * a)).toFixed(2);
  }
  function graphX(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse()).x;
  }
  for (const key of keys) {
    const handle = document.getElementById(`inverse-${key}-handle`);
    handle.addEventListener('pointerdown', event => {
      if (drag || event.button !== 0) return;
      event.preventDefault();
      drag = { key, id: event.pointerId, offset: graphX(event) - screenX(key === 'original' ? a : a * a) };
      handle.setPointerCapture(event.pointerId);
      handle.setAttribute('data-dragging', '');
      handle.focus({ preventScroll: true });
    });
    handle.addEventListener('pointermove', event => {
      if (drag?.key !== key || drag.id !== event.pointerId) return;
      const input = (graphX(event) - drag.offset - 130) / 90;
      update(key === 'original' ? input : Math.sqrt(Math.max(0, input)));
    });
    function release(event) {
      if (drag?.key !== key || drag.id !== event.pointerId) return;
      const id = drag.id;
      drag = null;
      if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
      handle.removeAttribute('data-dragging');
    }
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(name, release);
    handle.addEventListener('keydown', event => {
      const current = key === 'original' ? a : a * a;
      const next = { ArrowLeft: current - 0.05, ArrowDown: current - 0.05, ArrowRight: current + 0.05, ArrowUp: current + 0.05, Home: key === 'original' ? 0.5 : 0.25, End: key === 'original' ? 2 : 4 };
      if (!(event.key in next)) return;
      event.preventDefault();
      update(key === 'original' ? next[event.key] : Math.sqrt(Math.max(0, next[event.key])));
    });
  }
  svg.addEventListener('dragstart', event => event.preventDefault());
  update(a);
})();

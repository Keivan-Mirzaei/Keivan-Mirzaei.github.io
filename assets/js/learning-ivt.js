(() => {
  const svg = document.querySelector('#ivt-explorer svg');
  const handle = document.getElementById('ivt-target');
  const curve = x => x ** 3 - 3 * x;
  const screenX = x => 85 + (x + 2.25) * 465 / 4.5;
  const screenY = y => 180 - 25 * y;
  const samples = Array.from({ length: 241 }, (_, i) => {
    const x = -2.25 + i * 4.5 / 240;
    return `${i ? 'L' : 'M'}${screenX(x)} ${screenY(curve(x))}`;
  });
  document.getElementById('ivt-curve').setAttribute('d', samples.join(''));
  let height = 0;
  let drag = null;

  function intersections(target) {
    const roots = [];
    for (const [start, end] of [[-2.25, -1], [-1, 1], [1, 2.25]]) {
      if (target < Math.min(curve(start), curve(end)) || target > Math.max(curve(start), curve(end))) continue;
      let low = start, high = end;
      const increasing = curve(end) > curve(start);
      for (let i = 0; i < 45; i++) {
        const mid = (low + high) / 2;
        if ((curve(mid) < target) === increasing) low = mid;
        else high = mid;
      }
      const root = (low + high) / 2;
      if (!roots.some(value => Math.abs(value - root) < 1e-6)) roots.push(root);
    }
    return roots;
  }
  function update(next) {
    height = Math.round(Math.max(-5.5, Math.min(5.5, next)) * 10) / 10;
    const y = screenY(height);
    document.getElementById('ivt-k').style.top = `${y / 360 * 100}%`;
    for (const part of ['line', 'hit']) document.getElementById(`ivt-target-${part}`).setAttribute('d', `M75 ${y}H560`);
    handle.setAttribute('aria-valuenow', height);
    document.getElementById('ivt-height').value = height.toFixed(1);
    const roots = intersections(height);
    svg.dataset.intersections = String(roots.length);
    document.getElementById('ivt-projections').replaceChildren(...roots.map(x => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', `M${screenX(x)} ${y}V320`);
      return line;
    }));
    for (let i = 0; i < 3; i++) {
      const label = document.getElementById(`ivt-c-${i}`);
      label.hidden = i >= roots.length;
      if (!label.hidden) label.style.left = `${screenX(roots[i]) / 640 * 100}%`;
    }
    const dots = document.getElementById('ivt-intersections');
    dots.replaceChildren(...roots.map(x => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      for (const [key, value] of Object.entries({ cx: screenX(x), cy: y, r: 6 })) dot.setAttribute(key, value);
      return dot;
    }));
    document.getElementById('ivt-guarantee').value = height > curve(-2.25) && height < curve(2.25) ? 'IVT guarantees an intersection' : 'Outside the endpoint heights: no IVT guarantee';
    document.getElementById('ivt-count').value = `${roots.length} intersection${roots.length === 1 ? '' : 's'}`;
  }
  function graphY(event) {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(svg.getScreenCTM().inverse()).y;
  }
  handle.addEventListener('pointerdown', event => {
    if (drag || event.button !== 0) return;
    event.preventDefault();
    drag = { id: event.pointerId, offset: graphY(event) - screenY(height) };
    handle.setPointerCapture(event.pointerId);
    handle.setAttribute('data-dragging', '');
    handle.focus({ preventScroll: true });
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) update((180 - graphY(event) + drag.offset) / 25);
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
    const next = { ArrowUp: height + 0.1, ArrowRight: height + 0.1, ArrowDown: height - 0.1, ArrowLeft: height - 0.1, Home: -5.5, End: 5.5 };
    if (!(event.key in next)) return;
    event.preventDefault();
    update(next[event.key]);
  });
  svg.addEventListener('dragstart', event => event.preventDefault());
  update(0);
})();

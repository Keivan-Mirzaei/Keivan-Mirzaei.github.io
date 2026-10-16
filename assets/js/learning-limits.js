(() => {
  const svg = document.querySelector('#limits-explorer svg');
  const handle = document.getElementById('limit-handle');
  const point = document.getElementById('limit-moving-point');
  const hitTarget = document.getElementById('limit-hit-target');
  const focusRing = document.getElementById('limit-focus-ring');
  const guides = document.getElementById('limit-guides');
  const feedback = document.getElementById('limit-feedback');
  const legend = document.getElementById('limit-legend');
  let x = 1;
  let pointerId = null;
  let dragOffset = 0;
  let placement = null;
  let snapped = false;

  function positionFeedback(px, py) {
    const box = svg.getBoundingClientRect();
    const width = feedback.offsetWidth;
    const height = feedback.offsetHeight;
    if (!box.width || !width || !height) return;
    const sx = value => value * box.width / 640;
    const sy = value => value * box.height / 370;
    const cx = sx(px), cy = sy(py);
    const key = legend.getBoundingClientRect();
    const keyRect = { left: key.left - box.left, top: key.top - box.top, width: key.width, height: key.height };
    const near = (rect, x, y, gap = 7) => x >= rect.left - gap && x <= rect.left + rect.width + gap && y >= rect.top - gap && y <= rect.top + rect.height + gap;
    const overlaps = (a, b) => a.left < b.left + b.width + 6 && a.left + a.width > b.left - 6 && a.top < b.top + b.height + 6 && a.top + a.height > b.top - 6;
    function candidate(left, top) {
      const rect = { left: Math.max(5, Math.min(box.width - width - 5, left)), top: Math.max(5, Math.min(box.height - height - 5, top)), width, height };
      let risk = overlaps(rect, keyRect) ? 200 : 0;
      for (const [gx, gy] of [[290, 140], [290, 290], [px, py], [290, 361], [27, 145], [27, 295]]) {
        if (near(rect, sx(gx), sy(gy), 10)) risk += 200;
      }
      // Test the full curve, not only the currently dragged point.
      for (let gx = 50; gx <= 530; gx += 4) {
        if (near(rect, sx(gx), sy(240 - (gx - 50) * 5 / 12), 5)) risk += 10;
      }
      if (rect.left < sx(50) + 4 && rect.left + width > sx(50) - 4) risk += 100;
      if (rect.top < sy(340) + 4 && rect.top + height > sy(340) - 4) risk += 100;
      return { ...rect, risk, score: risk * 1000 + Math.hypot(rect.left + width / 2 - cx, rect.top + height / 2 - cy) };
    }
    const choices = [
      candidate(cx + 14, cy + 14), candidate(cx - width - 14, cy + 14),
      candidate(cx + 14, cy - height - 14), candidate(cx - width - 14, cy - height - 14),
    ];
    const previous = placement && candidate(cx + placement.dx, cy + placement.dy);
    let best = previous && previous.risk === 0
      ? previous
      : choices.reduce((a, b) => a.score <= b.score ? a : b);
    if (best.risk) {
      for (let left = 5; left <= box.width - width - 5; left += 12) {
        for (let top = 5; top <= box.height - height - 5; top += 12) {
          const next = candidate(left, top);
          if (next.score < best.score) best = next;
        }
      }
    }
    placement = { dx: best.left - cx, dy: best.top - cy };
    const left = `${best.left.toFixed(2)}px`;
    const top = `${best.top.toFixed(2)}px`;
    if (feedback.style.left !== left) feedback.style.left = left;
    if (feedback.style.top !== top) feedback.style.top = top;
  }

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
    positionFeedback(px, py);
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
    snapped = x === 2;
    dragOffset = graphX(event) - (50 + 120 * x);
    handle.setPointerCapture(pointerId);
    handle.setAttribute('data-dragging', '');
    handle.focus({ preventScroll: true });
  });
  handle.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId) return;
    const input = (graphX(event) - dragOffset - 50) / 120;
    const distance = Math.abs(input - 2) * 120 * svg.getBoundingClientRect().width / 640;
    // A wider release zone keeps the value steady around the snap threshold.
    snapped = !event.shiftKey && distance <= (snapped ? 12 : 7);
    update(snapped ? 2 : input);
  });
  function endDrag(event) {
    if (event.pointerId !== pointerId) return;
    const released = pointerId;
    pointerId = null;
    snapped = false;
    if (handle.hasPointerCapture(released)) handle.releasePointerCapture(released);
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
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(() => positionFeedback(50 + 120 * x, 340 - 50 * (x === 2 ? 1 : x + 2)));
    observer.observe(svg);
  }
})();

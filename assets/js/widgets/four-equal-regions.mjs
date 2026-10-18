import { createPageEnvironment } from '../lib/page-environment.mjs';
import { createFourRegionsWorkspace } from '../lib/four-regions-workspace.mjs';
import { initialPose, normal, direction, dot, mod, clipHalfPlane, boundedMotion } from '../lib/four-equal-regions.mjs';
import { createPuzzleStorage } from '../lib/puzzle-storage.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';
import { initializeProgressReset } from '../lib/widget-progress.mjs';

let nextInstance = 0;
const letters = ['A', 'B', 'C', 'D'];
const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };

export function initializeFourEqualRegions(root, storage = createPuzzleStorage('four-equal-regions', root)) {
  const get = name => root.querySelector(`[data-fr-${name}]`);
  const play = createFourRegionsWorkspace(storage.read()), events = new AbortController();
  const listen = (element, name, callback) => element.addEventListener(name, callback, { signal: events.signal });
  const disposePanels = initializeWidgetPanels(root, root.ownerDocument || document);
  const stage = get('stage'), board = get('board'), crossing = get('crossing');
  const counts = [...root.querySelectorAll('[data-fr-count]')];
  const lineControls = [...root.querySelectorAll('[data-fr-line]')];
  let dimensions = { width: 0, height: 0, scale: 1 }, drag = null, keyBefore = null, interacted = false;
  const editors = [];
  const prefix = `four-regions-${++nextInstance}`;
  get('n').id = `${prefix}-n`; get('n-name').setAttribute('for', get('n').id);
  storage.setSnapshotProvider(() => play.exportState());
  const sx = x => dimensions.width / 2 + x * dimensions.scale;
  const sy = y => dimensions.height / 2 - y * dimensions.scale;
  const worldPoint = event => {
    const rect = board.getBoundingClientRect();
    return { x: (event.clientX - rect.left - dimensions.width / 2) / dimensions.scale,
      y: (dimensions.height / 2 - (event.clientY - rect.top)) / dimensions.scale };
  };
  function rotate(name, angle) {
    const pose = play.pose, delta = angle - pose[name];
    pose.a = mod(pose.a + delta, Math.PI * 2); pose.b = mod(pose.b + delta, Math.PI * 2);
    play.previewPose(pose);
  }
  function regionLabel(polygon, points) {
    if (polygon.length < 3) return null;
    let area = 0, x = 0, y = 0;
    for (let i = 0; i < polygon.length; i++) {
      const p = polygon[i], q = polygon[(i + 1) % polygon.length], cross = p.x * q.y - q.x * p.y;
      area += cross; x += (p.x + q.x) * cross; y += (p.y + q.y) * cross;
    }
    if (Math.abs(area) * dimensions.scale ** 2 < 1400) return null;
    const center = { x: x / (3 * area), y: y / (3 * area) }, candidates = [center];
    for (const fraction of [.35, .6, .8]) polygon.forEach(vertex => candidates.push({
      x: center.x + (vertex.x - center.x) * fraction, y: center.y + (vertex.y - center.y) * fraction,
    }));
    return candidates.find(candidate => sx(candidate.x) > 18 && sx(candidate.x) < dimensions.width - 18
      && sy(candidate.y) > 18 && sy(candidate.y) < dimensions.height - 18
      && !points.some(point => Math.hypot(point.x - candidate.x, point.y - candidate.y) * dimensions.scale < 18)) || null;
  }
  function render(message = '') {
    dimensions.width = board.clientWidth; dimensions.height = board.clientHeight;
    dimensions.scale = Math.min((dimensions.width - 40) / 2, (dimensions.height - 40) / 1.3);
    const points = play.points, pose = play.pose, result = play.result;
    root.classList.toggle('is-solved', play.solved);
    if (dimensions.width >= 100 && dimensions.height >= 100) {
      board.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
      const xBound = dimensions.width / 2 / dimensions.scale, yBound = dimensions.height / 2 / dimensions.scale;
      const rectangle = [{ x: -xBound, y: -yBound }, { x: xBound, y: -yBound }, { x: xBound, y: yBound }, { x: -xBound, y: yBound }];
      const u = normal(pose.a), v = normal(pose.b);
      let areas = '', labels = '', lines = '', controls = '';
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach((sign, index) => {
        const polygon = clipHalfPlane(clipHalfPlane(rectangle, u, dot(u, pose), sign[0]), v, dot(v, pose), sign[1]);
        if (!polygon.length) return;
        areas += `<polygon class="fr-area" style="--region-color:var(--fr-${index})" points="${polygon.map(point => `${sx(point.x)},${sy(point.y)}`).join(' ')}"/>`;
        const label = regionLabel(polygon, points);
        if (label) labels += `<text class="fr-region-label" x="${sx(label.x)}" y="${sy(label.y)}">${letters[index]}</text>`;
      });
      [pose.a, pose.b].forEach((angle, index) => {
        const t = direction(angle), path = `M${sx(pose.x - t.x * 5)} ${sy(pose.y - t.y * 5)}L${sx(pose.x + t.x * 5)} ${sy(pose.y + t.y * 5)}`;
        lines += `<path class="fr-dividing-line" data-fr-visual-line="${index}" d="${path}"/>`;
        lineControls[index].setAttribute('d', path);
        const x = sx(pose.x), y = sy(pose.y), dx = t.x, dy = -t.y;
        const toEdge = Math.min(Math.abs(dx) < 1e-9 ? Infinity : ((dx > 0 ? dimensions.width - 24 : 24) - x) / dx,
          Math.abs(dy) < 1e-9 ? Infinity : ((dy > 0 ? dimensions.height - 24 : 24) - y) / dy);
        controls += `<g class="fr-rotate-cue" data-fr-rotation="${index}" transform="translate(${x + dx * toEdge - 12} ${y + dy * toEdge - 12})"><path d="M4 15a8 8 0 0 1 15-4M19 5v6h-6"/></g>`;
      });
      const marks = points.map((point, index) => `<circle class="${result.membership[index] < 0 ? 'fr-point-boundary' : 'fr-point'}" style="--region-color:var(--fr-${result.membership[index]})" cx="${sx(point.x)}" cy="${sy(point.y)}" r="4.5"/>`).join('');
      get('art').innerHTML = `${areas}${lines}${controls}${marks}${labels}`;
      crossing.style.left = `${sx(pose.x)}px`; crossing.style.top = `${sy(pose.y)}px`;
    }
    board.setAttribute('aria-label', `${points.length} points. ${letters.map((label, i) => `${label}: ${result.counts[i]}`).join(', ')}. Target ${play.n} per region. ${result.boundary} points on a line.`);
    counts.forEach((element, index) => { element.textContent = String(result.counts[index]); element.classList.toggle('is-equal', result.counts[index] === play.n); });
    const feedback = play.solved ? `Equal split — ${play.n} points in every region.`
      : result.boundary ? `${result.boundary} ${result.boundary === 1 ? 'point is' : 'points are'} on a line. Move the line clear.`
      : message || (interacted ? `Keep adjusting until each region has ${play.n}.` : 'Drag the crossing to move it; drag a line to rotate.');
    if (get('feedback').textContent !== feedback) get('feedback').textContent = feedback;
    get('undo').disabled = !play.canUndo; get('redo').disabled = !play.canRedo;
    get('reset').disabled = JSON.stringify(pose) === JSON.stringify(initialPose());
    get('n').value = String(play.n); get('n-label').textContent = String(play.n);
    lineControls.forEach((line, index) => {
      const angle = mod(pose[index ? 'b' : 'a'], Math.PI) * 180 / Math.PI;
      line.setAttribute('aria-valuenow', angle.toFixed(1));
      line.setAttribute('aria-valuetext', `${angle.toFixed(1)} degrees; lines rotate together`);
    });
    const resetScope = root.querySelector('[data-widget-progress-scope]');
    if (resetScope) resetScope.textContent = `n = ${play.n}`;
  }
  function finish(before, message) { play.commit(before); interacted = true; render(message); storage.save(play.exportState()); }
  function cancelDrag() {
    if (!drag) return;
    const previous = drag; drag = null; play.cancel(previous.before); stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture?.(previous.pointerId)) stage.releasePointerCapture(previous.pointerId);
    render();
  }
  function finishKeys() { if (keyBefore) { const before = keyBefore; keyBefore = null; finish(before); } }
  function stopEditing() { cancelDrag(); editors.forEach(editor => editor.cancel()); finishKeys(); }
  function action(callback, message) { stopEditing(); callback(); interacted = true; render(message); storage.save(play.exportState()); }

  listen(stage, 'pointerdown', event => {
    if (event.button !== 0 || event.isPrimary === false || drag) return;
    const handle = event.target.closest('[data-fr-crossing]'), line = event.target.closest('[data-fr-line]');
    if (!handle && !line) return;
    editors.forEach(editor => editor.finish()); finishKeys(); event.preventDefault();
    if (handle) crossing.focus({ preventScroll: true });
    if (line) line.focus({ preventScroll: true });
    const start = worldPoint(event), before = play.capture();
    drag = { pointerId: event.pointerId, before, start, kind: handle ? 'move' : 'rotate',
      name: line?.dataset.frLine === '1' ? 'b' : 'a', bearing: Math.atan2(start.y - before.pose.y, start.x - before.pose.x), turn: 0 };
    stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging');
  });
  listen(stage, 'pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault(); const p = worldPoint(event), base = drag.before.pose;
    if (drag.kind === 'rotate') {
      if (Math.hypot(p.x - base.x, p.y - base.y) * dimensions.scale < 12) return;
      const bearing = Math.atan2(p.y - base.y, p.x - base.x);
      // Unwrap the pointer bearing so a gesture can pass through a full turn.
      drag.turn += Math.atan2(Math.sin(bearing - drag.bearing), Math.cos(bearing - drag.bearing));
      drag.bearing = bearing; rotate(drag.name, base[drag.name] + drag.turn);
      interacted = true; render(); return;
    }
    const dx = p.x - drag.start.x, dy = p.y - drag.start.y;
    play.previewPose(boundedMotion(base, dx, dy)); interacted = true; render();
  });
  listen(stage, 'pointerup', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const previous = drag; drag = null; stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    finish(previous.before);
  });
  listen(stage, 'pointercancel', cancelDrag); listen(stage, 'lostpointercapture', cancelDrag);
  listen(stage, 'keydown', event => {
    if (event.key !== 'Escape') return;
    if (drag) { event.preventDefault(); cancelDrag(); }
    if (keyBefore) { event.preventDefault(); const before = keyBefore; keyBefore = null; play.cancel(before); render(); }
  });
  listen(crossing, 'keydown', event => {
    if (!arrows[event.key] || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault(); keyBefore ||= play.capture();
    const [dx, dy] = arrows[event.key], step = event.shiftKey ? .04 : .008;
    play.previewPose(boundedMotion(play.pose, dx * step, dy * step)); interacted = true; render();
  });
  listen(crossing, 'keyup', finishKeys); listen(crossing, 'blur', finishKeys);
  lineControls.forEach((line, index) => {
    listen(line, 'keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || (!arrows[event.key] && !['Home', 'End', 'PageUp', 'PageDown'].includes(event.key))) return;
      event.preventDefault(); cancelDrag(); keyBefore ||= play.capture();
      const name = index ? 'b' : 'a', step = (event.shiftKey || event.key.startsWith('Page') ? 5 : .5) * Math.PI / 180;
      const angle = event.key === 'Home' ? 0 : event.key === 'End' ? 179.9 * Math.PI / 180
        : play.pose[name] + (['ArrowRight', 'ArrowUp', 'PageUp'].includes(event.key) ? step : -step);
      rotate(name, angle); interacted = true; render();
    });
    listen(line, 'keyup', finishKeys); listen(line, 'blur', finishKeys);
  });

  function bindSlider(slider, preview, apply) {
    let before = null, pointer = false, keyboard = false;
    const finishEdit = () => {
      if (!before) return;
      const snapshot = before, value = Number(slider.value); before = null;
      apply(snapshot, value); interacted = true; render(); storage.save(play.exportState());
    };
    const cancel = () => { if (before) { play.cancel(before); before = null; pointer = keyboard = false; render(); } };
    editors.push({ finish: finishEdit, cancel });
    listen(slider, 'pointerdown', () => { pointer = true; before ||= play.capture(); });
    listen(slider, 'keydown', event => { if (arrows[event.key] || ['Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) { keyboard = true; before ||= play.capture(); } });
    listen(slider, 'input', () => { before ||= play.capture(); preview(Number(slider.value)); });
    listen(slider, 'change', () => { if (!pointer && !keyboard) finishEdit(); });
    listen(slider, 'pointerup', () => { pointer = false; finishEdit(); });
    listen(slider, 'pointercancel', cancel);
    listen(slider, 'keyup', () => { keyboard = false; finishEdit(); });
    listen(slider, 'blur', () => { pointer = keyboard = false; finishEdit(); });
  }
  bindSlider(get('n'), value => { get('n-label').textContent = String(value); }, (_, value) => play.changeN(value));
  listen(get('undo'), 'click', () => action(() => play.undo(), 'Action undone.'));
  listen(get('redo'), 'click', () => action(() => play.redo(), 'Action restored.'));
  listen(get('reset'), 'click', () => action(() => play.reset(), 'Lines returned to their starting positions.'));
  listen(get('shuffle'), 'click', () => action(() => play.shuffle(), 'New points. Find an equal split.'));
  const disposeProgress = initializeProgressReset(root, () => action(() => play.resetProgress(), `Progress reset for n = ${play.n}.`));
  for (const name of ['crossing', 'n', 'shuffle']) get(name).disabled = false;
  lineControls.forEach(line => { line.setAttribute('aria-disabled', 'false'); line.setAttribute('tabindex', '0'); });
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => render());
  resize?.observe(stage); render(); storage.save(play.exportState());
  return { read: () => ({ n: play.n, pose: play.pose, points: play.points, ...play.result, solved: play.solved }),
    destroy() { stopEditing(); resize?.disconnect(); disposeProgress(); disposePanels(); events.abort(); } };
}

export function mount(root) {
  const environment = createPageEnvironment(root);
  const cleanups = [];
  for (const widget of root.querySelectorAll('[data-four-equal-regions]')) { const controller = initializeFourEqualRegions(widget, createPuzzleStorage('four-equal-regions', widget, environment.window)); cleanups.push(() => controller.destroy()); }
  return () => { cleanups.forEach(cleanup => cleanup()); environment.dispose(); };
}

import { createFourRegionsWorkspace } from '../lib/four-regions-workspace.mjs';
import { initialPose, normal, direction, dot, mod, lineDelta, clipHalfPlane, keepCrossing, boundedMotion } from '../lib/four-equal-regions.mjs';
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
  let dimensions = { width: 0, height: 0, scale: 1 }, drag = null, keyBefore = null, interacted = false;
  const editors = [];
  const prefix = `four-regions-${++nextInstance}`;
  for (const name of ['rotation-a', 'rotation-b', 'n']) {
    get(name).id = `${prefix}-${name}`; get(`${name}-name`).setAttribute('for', get(name).id);
  }
  storage.setSnapshotProvider(() => play.exportState());
  const sx = x => dimensions.width / 2 + x * dimensions.scale;
  const sy = y => dimensions.height / 2 - y * dimensions.scale;
  const worldPoint = event => {
    const rect = board.getBoundingClientRect();
    return { x: (event.clientX - rect.left - dimensions.width / 2) / dimensions.scale,
      y: (dimensions.height / 2 - (event.clientY - rect.top)) / dimensions.scale };
  };
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
      let areas = '', labels = '', lines = '', hits = '';
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach((sign, index) => {
        const polygon = clipHalfPlane(clipHalfPlane(rectangle, u, dot(u, pose), sign[0]), v, dot(v, pose), sign[1]);
        if (!polygon.length) return;
        areas += `<polygon class="fr-area" style="--region-color:var(--fr-${index})" points="${polygon.map(point => `${sx(point.x)},${sy(point.y)}`).join(' ')}"/>`;
        const label = regionLabel(polygon, points);
        if (label) labels += `<text class="fr-region-label" x="${sx(label.x)}" y="${sy(label.y)}">${letters[index]}</text>`;
      });
      [pose.a, pose.b].forEach((angle, index) => {
        const t = direction(angle), path = `M${sx(pose.x - t.x * 5)} ${sy(pose.y - t.y * 5)}L${sx(pose.x + t.x * 5)} ${sy(pose.y + t.y * 5)}`;
        lines += `<path class="fr-dividing-line" d="${path}"${index ? ' stroke-dasharray="7 5"' : ''}/>`;
        hits += `<path class="fr-line-hit" data-fr-line="${index}" d="${path}" aria-hidden="true"/>`;
      });
      const marks = points.map((point, index) => `<circle class="${result.membership[index] < 0 ? 'fr-point-boundary' : 'fr-point'}" style="--region-color:var(--fr-${result.membership[index]})" cx="${sx(point.x)}" cy="${sy(point.y)}" r="4.5"/>`).join('');
      board.innerHTML = `<title>Four equal regions</title><desc>${points.length} points. Counts: ${result.counts.join(', ')}. Target ${play.n} each. ${result.boundary} points on a line.</desc>${areas}${lines}${marks}${labels}${hits}`;
      crossing.style.left = `${sx(pose.x)}px`; crossing.style.top = `${sy(pose.y)}px`;
    }
    board.setAttribute('aria-label', `${points.length} points. ${letters.map((label, i) => `${label}: ${result.counts[i]}`).join(', ')}. Target ${play.n} per region. ${result.boundary} points on a line.`);
    counts.forEach((element, index) => { element.textContent = String(result.counts[index]); element.classList.toggle('is-equal', result.counts[index] === play.n); });
    get('goal').textContent = `${points.length} points · ${play.n} per region`;
    const feedback = play.solved ? `Equal split — ${play.n} points in every region.`
      : result.boundary ? `${result.boundary} ${result.boundary === 1 ? 'point is' : 'points are'} on a line. Move the line clear.`
      : message || (interacted ? `Keep adjusting until each region has ${play.n}.` : 'Drag the lines to place them; use the slider to rotate.');
    if (get('feedback').textContent !== feedback) get('feedback').textContent = feedback;
    get('undo').disabled = !play.canUndo; get('redo').disabled = !play.canRedo;
    get('reset').disabled = JSON.stringify(pose) === JSON.stringify(initialPose());
    get('n').value = String(play.n); get('n-label').textContent = String(play.n);
    get('perpendicular').checked = play.perpendicular;
    get('rotation-a-name').textContent = play.perpendicular ? 'Rotation' : 'Solid line';
    get('independent').hidden = play.perpendicular;
    for (const name of ['a', 'b']) {
      const angle = mod(pose[name], Math.PI) * 180 / Math.PI;
      get(`rotation-${name}`).value = angle.toFixed(1);
      get(`rotation-${name}`).setAttribute('aria-valuetext', `${angle.toFixed(1)} degrees`);
      get(`angle-${name}`).textContent = `${Number(angle.toFixed(1))}°`;
    }
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
    drag = { pointerId: event.pointerId, before: play.capture(), start: worldPoint(event), kind: handle ? 'move' : 'line', index: line ? Number(line.dataset.frLine) : 0 };
    stage.setPointerCapture(event.pointerId); stage.classList.add('is-dragging');
  });
  listen(stage, 'pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault(); const p = worldPoint(event), base = drag.before.pose;
    let dx = p.x - drag.start.x, dy = p.y - drag.start.y;
    if (drag.kind === 'line') {
      const own = normal(drag.index ? base.b : base.a), other = direction(drag.index ? base.a : base.b);
      const distance = dot(own, { x: dx, y: dy }) / dot(own, other);
      dx = other.x * distance; dy = other.y * distance;
    }
    play.previewPose(boundedMotion(base, dx, dy)); interacted = true; render();
  });
  listen(stage, 'pointerup', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const previous = drag; drag = null; stage.classList.remove('is-dragging');
    if (stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    finish(previous.before);
  });
  listen(stage, 'pointercancel', cancelDrag); listen(stage, 'lostpointercapture', cancelDrag);
  listen(crossing, 'keydown', event => {
    if (!arrows[event.key] || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault(); keyBefore ||= play.capture();
    const [dx, dy] = arrows[event.key], step = event.shiftKey ? .04 : .008;
    play.previewPose(boundedMotion(play.pose, dx * step, dy * step)); interacted = true; render();
  });
  listen(crossing, 'keyup', finishKeys); listen(crossing, 'blur', finishKeys);

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
  for (const name of ['a', 'b']) bindSlider(get(`rotation-${name}`), degrees => {
    const pose = play.pose, other = name === 'a' ? 'b' : 'a';
    const angle = pose[name] + lineDelta(degrees * Math.PI / 180 - pose[name]);
    if (play.perpendicular) { const delta = angle - pose[name]; pose.a = mod(pose.a + delta, Math.PI * 2); pose.b = mod(pose.b + delta, Math.PI * 2); }
    else pose[name] = mod(keepCrossing(angle, pose[other], pose[name]), Math.PI * 2);
    play.previewPose(pose); interacted = true; render();
  }, before => play.commit(before));
  bindSlider(get('n'), value => { get('n-label').textContent = String(value); }, (_, value) => play.changeN(value));
  listen(get('perpendicular'), 'change', () => { const value = get('perpendicular').checked; action(() => play.setPerpendicular(value)); });
  listen(get('undo'), 'click', () => action(() => play.undo(), 'Action undone.'));
  listen(get('redo'), 'click', () => action(() => play.redo(), 'Action restored.'));
  listen(get('reset'), 'click', () => action(() => play.reset(), 'Lines returned to their starting positions.'));
  listen(get('shuffle'), 'click', () => action(() => play.shuffle(), 'New points. Find an equal split.'));
  const disposeProgress = initializeProgressReset(root, () => action(() => play.resetProgress(), `Progress reset for n = ${play.n}.`));
  for (const name of ['crossing', 'rotation-a', 'rotation-b', 'n', 'perpendicular', 'shuffle']) get(name).disabled = false;
  const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => render());
  resize?.observe(stage); render(); storage.save(play.exportState());
  return { read: () => ({ n: play.n, perpendicular: play.perpendicular, pose: play.pose, points: play.points, ...play.result, solved: play.solved }),
    destroy() { stopEditing(); resize?.disconnect(); disposeProgress(); disposePanels(); events.abort(); } };
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-four-equal-regions]').forEach(root => initializeFourEqualRegions(root));

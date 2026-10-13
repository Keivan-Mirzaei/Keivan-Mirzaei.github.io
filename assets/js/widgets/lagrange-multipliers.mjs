import { DEFAULT_STATE, MINIMUM_ANGLE, MAXIMUM_ANGLE, sectionState, normalizeAngle } from '../lib/lagrange-math.mjs';
import { planDiagram, planGeometry } from '../lib/lagrange-diagrams.mjs';
import { surfaceDiagram } from '../lib/lagrange-surfaces.mjs';
import { formatNumber } from '../lib/widget-math.mjs';
import { bindPanelHistory, trackControlEdits } from '../lib/panel-history.mjs';
import { createPageEnvironment } from '../lib/page-environment.mjs';

export function mount(root = globalThis.document) {
  const environment = createPageEnvironment(root);
  const abort = new environment.window.AbortController();
  environment.add(() => abort.abort());
  const { signal } = abort;
  for (const widget of root.querySelectorAll('[data-widget="lagrange-multipliers"]')) {
    const field = name => widget.querySelector(`[data-lm-${name}]`);
    const put = (name, value) => { field(name).textContent = value; };
    const controls = [field('theta'), field('map')];
    const plan = field('plan'), surfaces = field('surfaces');
    let current = { theta: Number(field('theta').value), map: field('map').value,
      azimuth: DEFAULT_STATE.azimuth, elevation: DEFAULT_STATE.elevation };
    let drag = null, rotation = null, keyboardRotation = null;
    const display = value => Number.isInteger(value) ? String(value) : `≈ ${formatNumber(value)}`;
    const vector = values => `(${values.map(value => formatNumber(value)).join(', ')})`;
    const vectorLabel = values => `${values.every(Number.isInteger) ? '' : '≈ '}${vector(values)}`;

    function render() {
      current = { ...current, theta: Number(field('theta').value), map: field('map').value };
      const state = sectionState(current.theta);
      const surface = current.map === 'surface';
      plan.hidden = surface; surfaces.hidden = !surface;
      const width = Math.max(220, widget.clientWidth - 40);
      if (!surface) plan.innerHTML = planDiagram(state, width, widget.id);
      plan.setAttribute('aria-label', `P approximately ${vector(state.point)} on the ellipse g=1. Objective gradient ${vector(state.gradF)}, constraint gradient ${vector(state.gradG)}. Gradient arrows use a common scale.`);
      if (surface) for (const kind of ['f', 'g']) {
        const map = field(`surface-${kind}`);
        map.innerHTML = surfaceDiagram(state, kind, Math.max(220, map.clientWidth || 300), current.azimuth, current.elevation, widget.id);
        map.setAttribute('aria-label', `3D graph of ${kind}, with elliptical contours and the feasible point P. The gradient arrow lies in the xy plane; its length uses the same scale as the other map.`);
      }
      put('point', vectorLabel(state.point)); put('value', display(state.value));
      put('grad-f', vectorLabel(state.gradF)); put('grad-g', vectorLabel(state.gradG));
      put('theta-value', `${formatNumber(state.theta)}°`);
      field('theta').setAttribute('aria-valuetext', `${formatNumber(state.theta)} degrees`);
      widget.dataset.complete = String(state.stationary === 'minimum');
      const feedback = state.stationary === 'minimum' ? 'Minimum: f = 1 at (1, 0).'
        : state.stationary === 'maximum' ? 'Maximum: f = 9 at (−1, 0).' : '';
      put('feedback', feedback);
      field('feedback').hidden = !feedback;
    }

    const restore = values => {
      current = { ...values };
      field('theta').value = String(current.theta); field('map').value = current.map;
      render();
    };
    const history = bindPanelHistory(widget, { read: () => current, restore,
      reset: () => restore({ ...current, theta: DEFAULT_STATE.theta }), signal });
    const finishEdit = trackControlEdits(controls, history, signal);
    environment.add(finishEdit);
    const finishRotationKeys = () => {
      if (keyboardRotation) history.commit(keyboardRotation);
      keyboardRotation = null;
    };
    controls.forEach(control => {
      control.disabled = false;
      control.addEventListener('input', render, { signal });
      control.addEventListener('change', render, { signal });
    });
    for (const [name, angle] of [['minimum', MINIMUM_ANGLE], ['maximum', MAXIMUM_ANGLE]]) {
      field(name).disabled = false;
      field(name).addEventListener('click', () => {
        finishEdit(); finishRotationKeys();
        history.change(() => { field('theta').value = String(angle); render(); });
      }, { signal });
    }

    // Suppress native selection and image dragging only on the interactive maps.
    for (const map of [plan, surfaces]) {
      for (const type of ['selectstart', 'dragstart']) map.addEventListener(type, event => event.preventDefault(), { signal });
    }
    function movePoint(event) {
      const svg = plan.querySelector('svg'), box = svg.getBoundingClientRect();
      const geometry = planGeometry(Math.max(220, widget.clientWidth - 40));
      const x = (event.clientX - box.left) * geometry.width / box.width - geometry.origin[0];
      const y = geometry.origin[1] - (event.clientY - box.top) * geometry.height / box.height;
      if (Math.hypot(x, y) < 2) return;
      field('theta').value = String(normalizeAngle(Math.atan2(y, x) * 180 / Math.PI));
      render();
    }
    plan.addEventListener('pointerdown', event => {
      if (event.button !== 0 || drag || rotation) return;
      event.preventDefault(); finishEdit(); finishRotationKeys();
      drag = { id: event.pointerId, before: history.capture() };
      plan.setPointerCapture(event.pointerId); movePoint(event);
    }, { signal });
    plan.addEventListener('pointermove', event => {
      if (drag?.id === event.pointerId) { event.preventDefault(); movePoint(event); }
    }, { signal });
    plan.addEventListener('pointerup', event => {
      if (drag?.id !== event.pointerId) return;
      history.commit(drag.before); drag = null;
      if (plan.hasPointerCapture(event.pointerId)) plan.releasePointerCapture(event.pointerId);
    }, { signal });
    function cancelDrag(event) {
      if (drag?.id !== event.pointerId) return;
      const before = drag.before; drag = null; history.cancel(before);
    }
    plan.addEventListener('pointercancel', cancelDrag, { signal });
    plan.addEventListener('lostpointercapture', cancelDrag, { signal });

    function rotate(azimuth, elevation) {
      current.azimuth = normalizeAngle(azimuth + 180) - 180;
      current.elevation = Math.max(15, Math.min(75, elevation));
      render();
    }
    surfaces.addEventListener('pointerdown', event => {
      if (event.button !== 0 || rotation || drag) return;
      event.preventDefault(); finishEdit(); finishRotationKeys();
      surfaces.focus({ preventScroll: true });
      rotation = { id: event.pointerId, before: history.capture(), x: event.clientX, y: event.clientY,
        azimuth: current.azimuth, elevation: current.elevation };
      surfaces.setPointerCapture(event.pointerId);
    }, { signal });
    surfaces.addEventListener('pointermove', event => {
      if (rotation?.id !== event.pointerId) return;
      event.preventDefault();
      rotate(rotation.azimuth + (event.clientX - rotation.x) * .6,
        rotation.elevation - (event.clientY - rotation.y) * .25);
    }, { signal });
    surfaces.addEventListener('pointerup', event => {
      if (rotation?.id !== event.pointerId) return;
      history.commit(rotation.before); rotation = null;
      if (surfaces.hasPointerCapture(event.pointerId)) surfaces.releasePointerCapture(event.pointerId);
    }, { signal });
    const cancelRotation = event => {
      if (rotation?.id !== event.pointerId) return;
      const before = rotation.before; rotation = null; history.cancel(before);
    };
    surfaces.addEventListener('pointercancel', cancelRotation, { signal });
    surfaces.addEventListener('lostpointercapture', cancelRotation, { signal });
    const cameraKeys = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, 5], ArrowDown: [0, -5] };
    surfaces.addEventListener('keydown', event => {
      const delta = cameraKeys[event.key];
      if (!delta || rotation || drag) return;
      event.preventDefault(); finishEdit(); keyboardRotation ??= history.capture();
      rotate(current.azimuth + delta[0], current.elevation + delta[1]);
    }, { signal });
    surfaces.addEventListener('keyup', event => { if (cameraKeys[event.key]) finishRotationKeys(); }, { signal });
    surfaces.addEventListener('blur', finishRotationKeys, { signal });
    if (environment.ResizeObserver) new environment.ResizeObserver(render).observe(widget);
    render();
  }
  return environment.dispose;
}

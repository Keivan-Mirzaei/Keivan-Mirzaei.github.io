import { DEFAULT_STATE, MINIMUM_ANGLE, MAXIMUM_ANGLE, sectionState, normalizeAngle, ascentAngle } from '../lib/lagrange-math.mjs';
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
    const controls = [field('theta'), field('phi'), field('map'),field('azimuth'),field('elevation')];
    const plan = field('plan');
    let current = controls.map(control=>control.value);
    let drag = null;
    const display = value => Number.isInteger(value) ? String(value) : `≈ ${formatNumber(value)}`;
    const vector = values => `(${values.map(value => formatNumber(value)).join(', ')})`;
    const vectorLabel = values => `${values.every(Number.isInteger) ? '' : '≈ '}${vector(values)}`;

    function render() {
      current = controls.map(control => control.value);
      const state = sectionState(Number(current[0]), Number(current[1]));
      const surface=current[2]==='surface';
      plan.hidden=surface;field('surfaces').hidden=!surface;
      const width = Math.max(220, widget.clientWidth-40);
      plan.innerHTML = planDiagram(state, width, widget.id);
      plan.setAttribute('aria-label', `P approximately ${vector(state.point)} on the ellipse g=1. Objective gradient ${vector(state.gradF)}, constraint gradient ${vector(state.gradG)}. Chosen direction ${state.phi} degrees from tangent. Gradient arrows use a common scale.`);
      if(surface)for(const kind of ['f','g']) {
        const map=field(`surface-${kind}`);
        map.innerHTML=surfaceDiagram(state,kind,Math.max(220,map.clientWidth||300),Number(current[3]),Number(current[4]),widget.id);
        map.setAttribute('aria-label', `3D graph of ${kind}, with elliptical contours and the same feasible point P. Coloured arrows show steepest ascent; the black arrow shows the selected direction. Selected slope ${formatNumber(kind==='f'?state.slopeF:state.slopeG)}, maximum ${formatNumber(kind==='f'?state.normF:state.normG)}.`);
      }
      put('point', vectorLabel(state.point)); put('value', display(state.value));
      put('grad-f', vectorLabel(state.gradF)); put('grad-g', vectorLabel(state.gradG));
      put('theta-value', `${formatNumber(state.theta)}°`);
      field('theta').setAttribute('aria-valuetext', `${formatNumber(state.theta)} degrees`);
      put('phi-value', `${formatNumber(state.phi)}°${state.phi%180 === 0 ? ' · tangent' : Math.abs(state.phi) === 90 ? ' · normal' : ''}`);
      field('phi').setAttribute('aria-valuetext', `${state.phi} degrees from tangent`);
      put('azimuth-value',`${formatNumber(Number(current[3]))}°`);put('elevation-value',`${formatNumber(Number(current[4]))}°`);
      widget.dataset.complete = String(state.stationary === 'minimum');
      const feedback = state.stationary === 'minimum' ? 'Minimum: f = 1 at (1, 0).'
        : state.stationary === 'maximum' ? 'Maximum: f = 9 at (−1, 0).' : '';
      put('feedback', feedback);
      field('feedback').hidden = !feedback;
    }

    const restore = values => { controls.forEach((control, i) => { control.value = values[i]; }); render(); };
    const history = bindPanelHistory(widget, { read: () => current, restore,
      reset: () => restore([String(DEFAULT_STATE.theta), String(DEFAULT_STATE.phi),...current.slice(2)]), signal });
    const finishEdit = trackControlEdits(controls, history, signal);
    environment.add(finishEdit);
    controls.forEach(control => {
      control.disabled = false;
      control.addEventListener('input', render, { signal });
      control.addEventListener('change', render, { signal });
    });
    for (const [name, angle] of [['minimum', MINIMUM_ANGLE], ['maximum', MAXIMUM_ANGLE]]) {
      field(name).disabled = false;
      field(name).addEventListener('click', () => { finishEdit(); history.change(() => { field('theta').value = String(angle); render(); }); }, { signal });
    }
    for(const kind of ['f','g']) {
      field(`ascent-${kind}`).disabled=false;
      field(`ascent-${kind}`).addEventListener('click',()=>{finishEdit();history.change(()=>{
        field('phi').value=String(ascentAngle(sectionState(Number(field('theta').value)),kind));render();
      });},{signal});
    }
    field('reset-view').disabled=false;
    field('reset-view').addEventListener('click',()=>{finishEdit();history.change(()=>{
      field('azimuth').value=String(DEFAULT_STATE.azimuth);field('elevation').value=String(DEFAULT_STATE.elevation);render();
    });},{signal});

    function movePoint(event) {
      const svg = plan.querySelector('svg'), box = svg.getBoundingClientRect();
      const geometry = planGeometry(Math.max(220, widget.clientWidth-40));
      const x = (event.clientX - box.left) * geometry.width / box.width - geometry.origin[0];
      const y = geometry.origin[1] - (event.clientY - box.top) * geometry.height / box.height;
      if (Math.hypot(x, y) < 2) return;
      field('theta').value = String(normalizeAngle(Math.atan2(y, x) * 180 / Math.PI));
      render();
    }
    plan.addEventListener('pointerdown', event => {
      if (event.button !== 0 || drag) return;
      finishEdit(); drag = { id: event.pointerId, before: history.capture() };
      plan.setPointerCapture(event.pointerId); movePoint(event);
    }, { signal });
    plan.addEventListener('pointermove', event => { if (drag?.id === event.pointerId) movePoint(event); }, { signal });
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
    const surfaces=field('surfaces');
    let rotation=null;
    surfaces.addEventListener('pointerdown',event=>{if(event.button!==0||rotation)return;
      finishEdit();rotation={id:event.pointerId,before:history.capture(),x:event.clientX,y:event.clientY,azimuth:Number(field('azimuth').value),elevation:Number(field('elevation').value)};
      surfaces.setPointerCapture(event.pointerId);
    },{signal});
    surfaces.addEventListener('pointermove',event=>{if(rotation?.id!==event.pointerId)return;
      const a=rotation.azimuth+(event.clientX-rotation.x)*.6;
      field('azimuth').value=String(normalizeAngle(a+180)-180);
      field('elevation').value=String(Math.max(15,Math.min(75,rotation.elevation-(event.clientY-rotation.y)*.25)));
      render();
    },{signal});
    surfaces.addEventListener('pointerup',event=>{if(rotation?.id!==event.pointerId)return;
      history.commit(rotation.before);rotation=null;
      if(surfaces.hasPointerCapture(event.pointerId))surfaces.releasePointerCapture(event.pointerId);
    },{signal});
    const cancelRotation=event=>{if(rotation?.id!==event.pointerId)return;const before=rotation.before;rotation=null;history.cancel(before);};
    surfaces.addEventListener('pointercancel',cancelRotation,{signal});surfaces.addEventListener('lostpointercapture',cancelRotation,{signal});
    if (environment.ResizeObserver) new environment.ResizeObserver(render).observe(widget);
    render();
  }
  return environment.dispose;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { mount } from '../assets/js/widgets/lagrange-multipliers.mjs';
import { planGeometry } from '../assets/js/lib/lagrange-diagrams.mjs';
import { constraintPoint } from '../assets/js/lib/lagrange-math.mjs';

class Element extends EventTarget {
  constructor(value = '') {
    super(); Object.assign(this, { value, textContent: '', disabled: true, hidden: false,
      clientWidth: 260, dataset: {}, attributes: new Map(), captures: new Set() });
  }
  setAttribute(key, value) { this.attributes.set(key, value); }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) { this.captures.delete(id); }
  focus() { this.focused = true; }
  emit(type, values = {}) {
    const event = new Event(type, { cancelable: true }); Object.assign(event, values);
    this.dispatchEvent(event); return event;
  }
}
function fixture() {
  const names = ['theta', 'map', 'plan', 'surfaces', 'surface-f', 'surface-g', 'point', 'value',
    'grad-f', 'grad-g', 'theta-value', 'feedback', 'minimum', 'maximum'];
  const fields = Object.fromEntries(names.map(name => [name, new Element()]));
  fields.theta.value = '90'; fields.theta.tagName = 'INPUT';
  fields.map.value = 'surface'; fields.map.tagName = 'SELECT';
  const actions = Object.fromEntries(['undo', 'redo', 'reset'].map(name => [name, new Element()]));
  const widget = { id: 'test', clientWidth: 580, dataset: {}, querySelector(selector) {
    return fields[selector.match(/data-lm-([^\]]+)/)?.[1]] || actions[selector.match(/data-panel-([^\]]+)/)?.[1]] || null;
  } };
  const geometry = planGeometry(540);
  fields.plan.querySelector = () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, width: geometry.width, height: geometry.height }) });
  const root = { ownerDocument: { defaultView: { AbortController } }, querySelectorAll: () => [widget] };
  const dispose = mount(root);
  const maps = () => ['surface-f', 'surface-g'].map(name => fields[name].innerHTML);
  const action = name => (actions[name] || fields[name]).emit('click');
  return { fields, actions, widget, dispose, maps, action, screen(theta) {
    const [clientX, clientY] = geometry.map(constraintPoint(theta)); return { clientX, clientY };
  } };
}

test('rotation prevents selection, links both maps, and creates one undoable action', () => {
  const f = fixture(), start = f.maps(), point = f.fields.point.textContent;
  assert.ok(f.fields.surfaces.emit('pointerdown', { button: 0, pointerId: 1, clientX: 100, clientY: 100 }).defaultPrevented);
  for (let i = 1; i <= 10; i++) assert.ok(f.fields.surfaces.emit('pointermove', { pointerId: 1, clientX: 100 + i * 5, clientY: 100 - i }).defaultPrevented);
  const turned = f.maps(); assert.ok(turned.every((svg, i) => svg !== start[i]));
  assert.equal(f.fields.point.textContent, point);
  f.fields.surfaces.emit('pointerup', { pointerId: 1 }); assert.equal(f.fields.surfaces.captures.size, 0);
  f.action('undo'); assert.deepEqual(f.maps(), start); assert.equal(f.actions.undo.disabled, true);
  f.action('redo'); assert.deepEqual(f.maps(), turned);
  for (const area of [f.fields.plan, f.fields.surfaces]) for (const type of ['selectstart', 'dragstart']) assert.ok(area.emit(type).defaultPrevented);
  assert.equal(f.fields.surfaces.emit('pointerdown', { button: 2, pointerId: 9 }).defaultPrevented, false);
  f.dispose(); assert.equal(f.fields.surfaces.emit('selectstart').defaultPrevented, false);
});

test('canceled camera and point drags restore the exact state and retain Redo', async () => {
  const f = fixture(); f.action('minimum'); f.action('undo'); const start = f.maps();
  f.fields.surfaces.emit('pointerdown', { button: 0, pointerId: 2, pointerType: 'touch', clientX: 100, clientY: 100 });
  f.fields.surfaces.emit('pointermove', { pointerId: 2, clientX: 175, clientY: 90 });
  f.fields.surfaces.emit('pointercancel', { pointerId: 2 });
  assert.deepEqual(f.maps(), start); assert.equal(f.actions.redo.disabled, false);
  f.action('redo'); assert.equal(f.widget.dataset.complete, 'true');
  f.fields.map.value = 'plan'; f.fields.map.emit('change'); await Promise.resolve();
  assert.equal(f.fields.plan.hidden, false); assert.equal(f.fields.surfaces.hidden, true);
  const before = f.fields.plan.innerHTML;
  assert.ok(f.fields.plan.emit('pointerdown', { button: 0, pointerId: 3, ...f.screen(90) }).defaultPrevented);
  f.fields.plan.emit('pointermove', { pointerId: 3, ...f.screen(230) });
  assert.equal(f.widget.dataset.complete, 'false');
  f.fields.plan.emit('lostpointercapture', { pointerId: 3 });
  assert.equal(f.fields.plan.innerHTML, before); assert.equal(f.widget.dataset.complete, 'true');
  f.dispose();
});

test('point drags and held camera keys each undo together; Reset preserves the camera', async () => {
  const f = fixture();
  for (let i = 0; i < 5; i++) assert.ok(f.fields.surfaces.emit('keydown', { key: 'ArrowRight' }).defaultPrevented);
  f.fields.surfaces.emit('keyup', { key: 'ArrowRight' }); const turned = f.maps();
  f.action('undo'); assert.equal(f.actions.undo.disabled, true); f.action('redo'); assert.deepEqual(f.maps(), turned);
  f.action('maximum'); assert.equal(f.fields.value.textContent, '9');
  f.action('reset'); assert.deepEqual(f.maps(), turned); assert.equal(f.fields.value.textContent, '6');
  f.fields.map.value = 'plan'; f.fields.map.emit('change'); await Promise.resolve();
  const before = f.fields.plan.innerHTML;
  f.fields.plan.emit('pointerdown', { button: 0, pointerId: 4, pointerType: 'touch', ...f.screen(40) });
  for (let theta = 50; theta <= 160; theta += 10) f.fields.plan.emit('pointermove', { pointerId: 4, ...f.screen(theta) });
  const after = f.fields.plan.innerHTML;
  f.fields.plan.emit('pointerup', { pointerId: 4 });
  f.action('undo'); assert.equal(f.fields.plan.innerHTML, before);
  f.action('redo'); assert.equal(f.fields.plan.innerHTML, after);
  f.dispose();
});

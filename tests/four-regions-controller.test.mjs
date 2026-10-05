import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeFourEqualRegions } from '../assets/js/widgets/four-equal-regions.mjs';
import { makePointSet, lineDelta, normal, dot } from '../assets/js/lib/four-equal-regions.mjs';

class Element {
  constructor(dataset = {}) {
    Object.assign(this, { dataset, value: '', textContent: '', disabled: true, hidden: false, checked: false, listeners: new Map(), attributes: new Map(), clientWidth: 560, clientHeight: 350, classes: new Set(), style: {} });
    this.classList = { toggle: (name, force) => { if (force) this.classes.add(name); else this.classes.delete(name); }, add: name => this.classes.add(name), remove: name => this.classes.delete(name) };
  }
  addEventListener(name, callback, { signal }) { const entry = { callback, signal }; if (!this.listeners.has(name)) this.listeners.set(name, []); this.listeners.get(name).push(entry); }
  emit(name, details = {}) { for (const { callback, signal } of this.listeners.get(name) || []) if (!signal.aborted) callback({ target: this, preventDefault() {}, ...details }); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getBoundingClientRect() { return { left: 0, top: 0, width: 560, height: 350 }; }
  focus() { document.activeElement = this; }
  closest(selector) { return selector === '[data-fr-crossing]' && this.dataset.frCrossing !== undefined ? this : selector === '[data-fr-line]' && this.dataset.frLine !== undefined ? this : null; }
}
function fixture(saved = null) {
  globalThis.document = { activeElement: null };
  const root = new Element(), counts = Array.from({ length: 4 }, () => new Element());
  const fields = Object.fromEntries(['stage', 'board', 'crossing', 'goal', 'feedback', 'rotation-a', 'rotation-b', 'rotation-a-name', 'rotation-b-name', 'angle-a', 'angle-b', 'independent', 'n', 'n-name', 'n-label', 'perpendicular', 'undo', 'redo', 'reset', 'shuffle'].map(name => [name, new Element()]));
  const progress = Object.fromEntries(['reset', 'confirm', 'apply', 'cancel', 'message', 'scope'].map(name => [name, new Element()]));
  fields.crossing.dataset.frCrossing = '';
  const captures = new Set(); fields.stage.setPointerCapture = id => captures.add(id); fields.stage.hasPointerCapture = id => captures.has(id); fields.stage.releasePointerCapture = id => captures.delete(id);
  root.querySelector = selector => fields[selector.match(/data-fr-([^\]]+)/)?.[1]] || progress[selector.match(/data-widget-progress-([^\]]+)/)?.[1]];
  root.querySelectorAll = selector => selector === '[data-fr-count]' ? counts : [];
  let state = saved;
  const storage = { read: () => state, save: value => { state = value; }, setSnapshotProvider() {}, clear() { throw new Error('A scoped reset must preserve the other point counts.'); } };
  const controller = initializeFourEqualRegions(root, storage);
  const slider = (name, value) => { fields[name].value = String(value); fields[name].emit('input'); fields[name].emit('change'); };
  const action = name => fields[name].emit('click');
  return { root, fields, counts, progress, captures, controller, slider, action, saved: () => state };
}
const screen = pose => ({ clientX: 280 + pose.x * (310 / 1.3), clientY: 175 - pose.y * (310 / 1.3) });

test('a complete line drag creates one history action and sets and clears the success colour', () => {
  const f = fixture(), solution = makePointSet(f.saved().sessions[6].seed, 6).solution.pose;
  f.slider('rotation-a', solution.a * 180 / Math.PI);
  const before = f.controller.read(), size = f.saved().actions.past.length;
  f.fields.stage.emit('pointerdown', { target: f.fields.crossing, button: 0, pointerId: 1, ...screen(before.pose) });
  for (let step = 1; step <= 20; step++) f.fields.stage.emit('pointermove', { pointerId: 1, ...screen({ x: before.pose.x + (solution.x - before.pose.x) * step / 20, y: before.pose.y + (solution.y - before.pose.y) * step / 20 }) });
  f.fields.stage.emit('pointerup', { pointerId: 1 });
  assert.equal(f.controller.read().solved, true); assert.equal(f.root.classes.has('is-solved'), true);
  assert.equal(f.saved().actions.past.length, size + 1); assert.equal(f.captures.size, 0);
  f.action('undo'); assert.equal(f.controller.read().solved, false); assert.equal(f.root.classes.has('is-solved'), false);
  f.action('redo'); assert.equal(f.controller.read().solved, true);
});

test('a cancelled drag restores exact geometry and preserves Redo', () => {
  const f = fixture(); f.action('shuffle'); f.action('undo'); const before = f.controller.read();
  f.fields.stage.emit('pointerdown', { target: f.fields.crossing, button: 0, pointerId: 2, ...screen(before.pose) });
  f.fields.stage.emit('pointermove', { pointerId: 2, ...screen({ x: .4, y: .3 }) });
  f.fields.stage.emit('pointercancel', { pointerId: 2 });
  assert.deepEqual(f.controller.read(), before); assert.equal(f.fields.redo.disabled, false); assert.equal(f.captures.size, 0);
});

test('sliding one line leaves the other fixed and a centre on the crossing prevents success', () => {
  const f = fixture(), before = f.controller.read().pose, line = new Element({ frLine: '0' });
  f.fields.stage.emit('pointerdown', { target: line, button: 0, pointerId: 3, ...screen(before) });
  f.fields.stage.emit('pointermove', { pointerId: 3, ...screen({ x: before.x + .2, y: before.y + .1 }) });
  f.fields.stage.emit('pointerup', { pointerId: 3 });
  const moved = f.controller.read().pose;
  assert.ok(Math.abs(dot(normal(before.b), moved) - dot(normal(before.b), before)) < 1e-12);
  assert.ok(Math.abs(dot(normal(before.a), moved) - dot(normal(before.a), before)) > .01);
  const point = f.controller.read().points.find(point => Math.abs(point.x) <= .78 && Math.abs(point.y) <= .45);
  f.fields.stage.emit('pointerdown', { target: f.fields.crossing, button: 0, pointerId: 4, ...screen(moved) });
  f.fields.stage.emit('pointermove', { pointerId: 4, ...screen(point) });
  assert.ok(f.controller.read().boundary > 0); assert.equal(f.controller.read().solved, false);
  assert.match(f.fields.feedback.textContent, /on a line/);
  f.fields.stage.emit('pointercancel', { pointerId: 4 });
});

test('rotation keyboard repeats form one action and independent controls cannot make parallel lines', () => {
  const f = fixture(), initial = f.controller.read();
  f.fields['rotation-a'].emit('keydown', { key: 'ArrowRight' });
  for (let angle = 80; angle <= 90; angle++) { f.fields['rotation-a'].value = String(angle); f.fields['rotation-a'].emit('input'); f.fields['rotation-a'].emit('change'); }
  f.fields['rotation-a'].emit('keyup', { key: 'ArrowRight' });
  assert.equal(f.saved().actions.past.length, 1); f.action('undo'); assert.deepEqual(f.controller.read(), initial);
  f.fields.perpendicular.checked = false; f.fields.perpendicular.emit('change');
  assert.equal(f.fields.independent.hidden, false); assert.equal(f.controller.read().perpendicular, false);
  f.slider('rotation-b', 78.5);
  const pose = f.controller.read().pose; assert.ok(Math.abs(lineDelta(pose.a - pose.b)) >= Math.PI / 15 - 1e-9);
  f.action('reset'); assert.equal(f.controller.read().perpendicular, false);
});

test('keyboard movement groups held arrows and number changes preserve each point set', () => {
  const f = fixture(), before = f.controller.read();
  for (let i = 0; i < 5; i++) f.fields.crossing.emit('keydown', { key: 'ArrowRight' });
  f.fields.crossing.emit('keyup', { key: 'ArrowRight' }); assert.equal(f.saved().actions.past.length, 1);
  const moved = f.controller.read(); assert.ok(moved.pose.x > before.pose.x);
  f.slider('n', 2); assert.equal(f.controller.read().points.length, 8);
  f.slider('n', 6); assert.deepEqual(f.controller.read(), moved);
  assert.equal(f.progress.scope.textContent, 'n = 6');
  const reopened = fixture(f.saved()); assert.deepEqual(reopened.controller.read(), moved);
});

test('the actual Reset progress control preserves other n sessions and does not clear the puzzle storage', () => {
  const f = fixture(); f.action('shuffle'); f.slider('n', 2); f.action('shuffle');
  const two = f.saved().sessions[2]; f.slider('n', 6);
  f.progress.reset.emit('click'); f.progress.cancel.emit('click'); assert.deepEqual(f.saved().sessions[2], two);
  f.progress.reset.emit('click'); f.progress.apply.emit('click');
  assert.equal(f.controller.read().n, 6); assert.deepEqual(f.saved().sessions[2], two);
  assert.ok(f.saved().actions.past.every(entry => entry.n !== 6));
  assert.equal(f.progress.confirm.hidden, true);
  f.controller.destroy(); const after = f.controller.read(); f.action('shuffle'); assert.deepEqual(f.controller.read(), after);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeFourEqualRegions } from '../assets/js/widgets/four-equal-regions.mjs';
import { makePointSet, lineDelta } from '../assets/js/lib/four-equal-regions.mjs';

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
  const fields = Object.fromEntries(['stage', 'board', 'art', 'crossing', 'feedback', 'line-a', 'line-b', 'n', 'n-name', 'n-label', 'undo', 'redo', 'reset', 'shuffle'].map(name => [name, new Element()]));
  const progress = Object.fromEntries(['reset', 'confirm', 'apply', 'cancel', 'message', 'scope'].map(name => [name, new Element()]));
  fields.crossing.dataset.frCrossing = '';
  const lines = ['a', 'b'].map((name, index) => { const line = fields[`line-${name}`]; line.dataset.frLine = String(index); return line; });
  const captures = new Set(); fields.stage.setPointerCapture = id => captures.add(id); fields.stage.hasPointerCapture = id => captures.has(id); fields.stage.releasePointerCapture = id => captures.delete(id);
  root.querySelector = selector => fields[selector.match(/data-fr-([^\]]+)/)?.[1]] || progress[selector.match(/data-widget-progress-([^\]]+)/)?.[1]];
  root.querySelectorAll = selector => selector === '[data-fr-count]' ? counts : selector === '[data-fr-line]' ? lines : [];
  let state = saved;
  const storage = { read: () => state, save: value => { state = value; }, setSnapshotProvider() {}, clear() { throw new Error('A scoped reset must preserve the other point counts.'); } };
  const controller = initializeFourEqualRegions(root, storage);
  const slider = (name, value) => { fields[name].value = String(value); fields[name].emit('input'); fields[name].emit('change'); };
  const action = name => fields[name].emit('click');
  const rotate = (name, angle) => {
    const pose = controller.read().pose;
    fields.stage.emit('pointerdown', { target: fields[`line-${name}`], button: 0, pointerId: 9, ...around(pose, pose[name]) });
    fields.stage.emit('pointermove', { pointerId: 9, ...around(pose, angle) });
    fields.stage.emit('pointerup', { pointerId: 9 });
  };
  return { root, fields, counts, progress, captures, controller, slider, rotate, action, saved: () => state };
}
const screen = pose => ({ clientX: 280 + pose.x * (310 / 1.3), clientY: 175 - pose.y * (310 / 1.3) });
const around = (pose, angle) => screen({ x: pose.x + .5 * Math.cos(angle), y: pose.y + .5 * Math.sin(angle) });

test('a complete line drag creates one history action and sets and clears the success colour', () => {
  const f = fixture(), solution = makePointSet(f.saved().sessions[6].seed, 6).solution.pose;
  f.rotate('a', solution.a);
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

test('dragging the crossing moves both lines without rotating and a point on the crossing prevents success', () => {
  const f = fixture(), before = f.controller.read().pose;
  f.fields.stage.emit('pointerdown', { target: f.fields.crossing, button: 0, pointerId: 3, ...screen(before) });
  f.fields.stage.emit('pointermove', { pointerId: 3, ...screen({ x: before.x + .2, y: before.y + .1 }) });
  f.fields.stage.emit('pointerup', { pointerId: 3 });
  const moved = f.controller.read().pose;
  assert.ok(Math.abs(moved.x - before.x - .2) < 1e-12);
  assert.ok(Math.abs(moved.y - before.y - .1) < 1e-12);
  assert.equal(moved.a, before.a); assert.equal(moved.b, before.b);
  const point = f.controller.read().points.find(point => Math.abs(point.x) <= .78 && Math.abs(point.y) <= .45);
  f.fields.stage.emit('pointerdown', { target: f.fields.crossing, button: 0, pointerId: 4, ...screen(moved) });
  f.fields.stage.emit('pointermove', { pointerId: 4, ...screen(point) });
  assert.ok(f.controller.read().boundary > 0); assert.equal(f.controller.read().solved, false);
  assert.match(f.fields.feedback.textContent, /on a line/);
  f.fields.stage.emit('pointercancel', { pointerId: 4 });
});

test('rotation keyboard repeats form one action and either line keeps the crossing fixed and lines perpendicular', () => {
  const f = fixture(), initial = f.controller.read();
  for (let i = 0; i < 10; i++) f.fields['line-a'].emit('keydown', { key: 'ArrowRight' });
  assert.ok(Math.abs(f.controller.read().pose.a - initial.pose.a - 5 * Math.PI / 180) < 1e-9);
  f.fields['line-a'].emit('keyup', { key: 'ArrowRight' });
  assert.equal(f.saved().actions.past.length, 1); f.action('undo'); assert.deepEqual(f.controller.read(), initial);
  f.rotate('b', initial.pose.a);
  const pose = f.controller.read().pose;
  assert.ok(Math.abs(Math.abs(lineDelta(pose.a - pose.b)) - Math.PI / 2) < 1e-9);
  assert.equal(pose.x, initial.pose.x); assert.equal(pose.y, initial.pose.y);
  assert.notEqual(pose.a, initial.pose.a);
  f.action('reset'); assert.deepEqual(f.controller.read().pose, initial.pose);
});

test('canvas rotation fixes the crossing, turns both lines, and commits once per gesture', () => {
  const f = fixture(), before = f.controller.read().pose;
  f.fields.stage.emit('pointerdown', { target: f.fields['line-b'], button: 0, pointerId: 5, ...around(before, before.b) });
  for (let i = 1; i <= 12; i++) f.fields.stage.emit('pointermove', { pointerId: 5, ...around(before, before.b + i * .03) });
  const pose = f.controller.read().pose;
  assert.equal(pose.x, before.x); assert.equal(pose.y, before.y);
  assert.ok(Math.abs(lineDelta(pose.b - before.b) - .36) < 1e-9);
  assert.ok(Math.abs(Math.abs(lineDelta(pose.a - pose.b)) - Math.PI / 2) < 1e-9);
  assert.equal(f.saved().actions.past.length, 0); assert.equal(f.captures.size, 1);
  f.fields.stage.emit('pointerup', { pointerId: 5 });
  assert.equal(f.saved().actions.past.length, 1); assert.equal(f.captures.size, 0);
  assert.match(f.fields['line-b'].attributes.get('aria-valuetext'), /lines rotate together/);
  const reopened = fixture(f.saved()); assert.deepEqual(reopened.controller.read().pose, pose);
  f.action('undo'); assert.deepEqual(f.controller.read().pose, before);
  f.action('redo'); assert.deepEqual(f.controller.read().pose, pose);
});

test('cancelled rotation restores the pose and Redo after pointer loss or Escape', () => {
  for (const cancel of ['pointercancel', 'lostpointercapture', 'Escape']) {
    const f = fixture(); f.action('shuffle'); f.action('undo'); const before = f.controller.read();
    f.fields.stage.emit('pointerdown', { target: f.fields['line-a'], button: 0, pointerId: 6, ...around(before.pose, before.pose.a) });
    f.fields.stage.emit('pointermove', { pointerId: 6, ...around(before.pose, before.pose.a + .4) });
    assert.notDeepEqual(f.controller.read().pose, before.pose);
    f.fields.stage.emit(cancel === 'Escape' ? 'keydown' : cancel, { key: 'Escape', pointerId: 6 });
    assert.deepEqual(f.controller.read(), before); assert.equal(f.fields.redo.disabled, false);
    assert.equal(f.captures.size, 0); assert.equal(f.fields.stage.classes.has('is-dragging'), false);
  }
});

test('rotation crosses the angle seam smoothly and ignores another pointer or the crossing dead zone', () => {
  const f = fixture(), before = f.controller.read().pose;
  f.fields.stage.emit('pointerdown', { target: f.fields['line-a'], button: 0, pointerId: 7, ...around(before, before.a) });
  f.fields.stage.emit('pointermove', { pointerId: 8, ...around(before, before.a + .5) });
  f.fields.stage.emit('pointermove', { pointerId: 7, ...screen(before) });
  assert.deepEqual(f.controller.read().pose, before);
  for (let i = 1; i <= 14; i++) {
    f.fields.stage.emit('pointermove', { pointerId: 7, ...around(before, before.a + i * .5) });
    assert.ok(Math.abs(lineDelta(f.controller.read().pose.a - before.a - i * .5)) < 1e-9);
  }
  f.fields.stage.emit('pointerup', { pointerId: 7 });
  assert.equal(f.saved().actions.past.length, 1);
});

test('the lines support fine and coarse keyboard rotation and cancelling a held key', () => {
  const f = fixture(), before = f.controller.read();
  f.fields['line-b'].emit('keydown', { key: 'ArrowUp', shiftKey: true });
  assert.ok(Math.abs(lineDelta(f.controller.read().pose.b - before.pose.b) - 5 * Math.PI / 180) < 1e-9);
  f.fields.stage.emit('keydown', { key: 'Escape' });
  f.fields['line-b'].emit('keyup', { key: 'Escape' });
  assert.deepEqual(f.controller.read(), before); assert.equal(f.saved().actions.past.length, 0);
  f.fields['line-a'].emit('keydown', { key: 'Home' }); f.fields['line-a'].emit('keyup', { key: 'Home' });
  assert.ok(Math.abs(lineDelta(f.controller.read().pose.a)) < 1e-9);
  f.fields['line-a'].emit('keydown', { key: 'End' }); f.fields['line-a'].emit('blur');
  assert.ok(Math.abs(lineDelta(f.controller.read().pose.a - 179.9 * Math.PI / 180)) < 1e-9);
  assert.equal(f.saved().actions.past.length, 2);
});

test('empty canvas, secondary buttons and extra pointers cannot start a rotation', () => {
  const f = fixture(), before = f.controller.read();
  for (const details of [{ target: f.fields.board }, { target: f.fields['line-a'], button: 1 }, { target: f.fields['line-b'], isPrimary: false }]) {
    f.fields.stage.emit('pointerdown', { button: 0, pointerId: 1, ...around(before.pose, before.pose.a), ...details });
    f.fields.stage.emit('pointermove', { pointerId: 1, ...around(before.pose, before.pose.a + .4) });
    f.fields.stage.emit('pointerup', { pointerId: 1 });
    assert.deepEqual(f.controller.read(), before); assert.equal(f.captures.size, 0);
  }
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

import test from 'node:test';
import assert from 'node:assert/strict';
import { createWidgetHistory, bindWidgetHistorySlider } from '../assets/js/lib/widget-history.mjs';

test('action history reverses exact snapshots, preserves Redo on no-ops, and bounds both stacks', () => {
  let state = { values: [0] };
  const history = createWidgetHistory(() => state, snapshot => { state = snapshot; }, undefined, 2);
  for (let value = 1; value <= 3; value++) history.change(() => { state.values[0] = value; });
  history.undo(); assert.deepEqual(state, { values: [2] });
  history.undo(); assert.deepEqual(state, { values: [1] });
  assert.equal(history.undo(), false);
  history.change(() => {}); assert.equal(history.canRedo, true);
  history.redo(); assert.deepEqual(state, { values: [2] });
  history.redo(); assert.deepEqual(state, { values: [3] });
  assert.equal(history.redo(), false);
  history.undo(); history.change(() => { state.values[0] = 10; });
  assert.equal(history.canRedo, false); history.undo(); assert.equal(state.values[0], 2);
  history.clear(); assert.equal(history.canUndo, false); assert.equal(history.canRedo, false);
});

test('pointer and keyboard slider gestures group inputs; cancellation retains Redo', () => {
  let value = 0;
  const history = createWidgetHistory(() => value, before => { value = before; });
  const listeners = new Map();
  const control = { value: 0, addEventListener: (type, handler) => listeners.set(type, handler) };
  const emit = (type, event = {}) => listeners.get(type)?.(event);
  bindWidgetHistorySlider(control, history, () => { value = Number(control.value); });
  emit('pointerdown');
  for (let i = 1; i <= 20; i++) { control.value = i; emit('input'); }
  emit('change'); assert.equal(history.canUndo, false);
  emit('pointerup'); history.undo(); assert.equal(value, 0);
  emit('pointerdown'); control.value = 30; emit('input'); emit('pointercancel');
  assert.equal(value, 0); assert.equal(history.canRedo, true);
  history.redo(); assert.equal(value, 20);
  emit('keydown', { key: 'ArrowRight' });
  for (let i = 21; i <= 25; i++) { control.value = i; emit('input'); emit('change'); }
  emit('keyup', { key: 'ArrowRight' }); history.undo(); assert.equal(value, 20);
  history.redo(); assert.equal(value, 25);
});

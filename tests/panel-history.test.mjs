import test from 'node:test';
import assert from 'node:assert/strict';
import { createHistory, trackControlEdits, bindInputHistory } from '../assets/js/lib/panel-history.mjs';

test('undo captures independent snapshots, ignores duplicate snapshots and bounds long sessions', () => {
  let state = { values: [1] };
  const availability = [];
  const history = createHistory(() => state, value => { state = value; }, value => availability.push(value), 2);
  history.remember(); history.remember();
  assert.equal(history.size, 1);
  state.values[0] = 2; history.remember();
  state.values[0] = 3; history.remember();
  state.values[0] = 4;
  history.undo(); assert.deepEqual(state.values, [3]);
  history.undo(); assert.deepEqual(state.values, [2]);
  assert.equal(availability.at(-1), false);
  assert.equal(history.size, 0);
  history.undo(); assert.deepEqual(state.values, [2]);
});

test('restoration cannot create a new undo entry and reset can be undone', () => {
  let value = 8;
  let history;
  history = createHistory(() => value, previous => { history.remember(); value = previous; });
  history.remember(); value = 0;
  history.undo();
  assert.equal(value, 8);
  assert.equal(history.size, 0);
});

test('redo restores a reset and a new committed edit invalidates the future', () => {
  let value = 8;
  const history = createHistory(() => value, previous => { value = previous; });
  history.change(() => { value = 0; }); history.undo();
  assert.equal(value, 8); assert.equal(history.canRedo, true);
  history.change(() => {}); assert.equal(history.canRedo, true);
  history.redo(); assert.equal(value, 0);
  history.undo(); history.change(() => { value = 4; });
  assert.equal(history.canRedo, false); history.undo(); assert.equal(value, 8);
});

test('a native dropdown selection commits without a popup pointerup or blur', async () => {
  const select = new EventTarget(); select.tagName = 'SELECT'; select.value = 'scalene';
  let shape = select.value;
  const history = createHistory(() => shape, value => { shape = select.value = value; });
  trackControlEdits([select], history);
  select.addEventListener('change', () => { shape = select.value; });
  select.dispatchEvent(new Event('pointerdown'));
  select.value = 'tall'; select.dispatchEvent(new Event('input')); select.dispatchEvent(new Event('change'));
  await Promise.resolve();
  assert.equal(history.size, 1); history.undo(); assert.equal(shape, 'scalene');
  select.dispatchEvent(new Event('change')); await Promise.resolve();
  assert.equal(history.canRedo, true); history.redo(); assert.equal(shape, 'tall');
});

test('native function selection records the old input values and resulting parameter changes together', async () => {
  const select = new EventTarget(); select.tagName = 'SELECT'; select.value = 'absolute';
  const slope = new EventTarget(); slope.value = '0';
  const buttons = Object.fromEntries(['undo', 'redo'].map(name => [name, new EventTarget()]));
  const widget = { querySelector: selector => buttons[selector.match(/data-panel-(\w+)/)?.[1]] };
  const history = bindInputHistory(widget, [select, slope], () => {});
  select.addEventListener('change', () => { slope.value = select.value === 'square' ? '2' : '0'; });
  select.dispatchEvent(new Event('pointerdown')); select.value = 'square';
  select.dispatchEvent(new Event('input')); select.dispatchEvent(new Event('pointerup')); select.dispatchEvent(new Event('change'));
  await Promise.resolve();
  assert.equal(history.size, 1); history.undo(); assert.deepEqual([select.value, slope.value], ['absolute', '0']);
  history.redo(); assert.deepEqual([select.value, slope.value], ['square', '2']);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHistory } from '../assets/js/lib/panel-history.mjs';

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

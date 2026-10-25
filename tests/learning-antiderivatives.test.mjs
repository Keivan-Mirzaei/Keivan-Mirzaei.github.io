import test from 'node:test';
import assert from 'node:assert/strict';
import { familyState, familyPlots, familyPoint, familyDrag, familyKey } from '../assets/js/lib/learning-antiderivatives.mjs';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);

test('vertical translation changes height but preserves the derivative at every selected input', () => {
  for (const x of [-1.8, -.37, 0, .01, 1.8]) {
    const lower = familyState(x, -2), upper = familyState(x, 2);
    near(upper.value - lower.value, 4);
    assert.equal(lower.slope, upper.slope);
    const h = 1e-5;
    near(((x + h) ** 2 + 2 - ((x - h) ** 2 + 2)) / (2 * h), upper.slope);
    assert.equal(Math.sign(upper.slope), Math.sign(x));
  }
});

test('dragging either point changes only its intended parameter and preserves the grab offset', () => {
  const initial = familyState(1, 1);
  const [px, py] = familyPoint(familyPlots.family, 1, -.5);
  const shifted = familyDrag(initial, 'c', { x: px + 100, y: py + 7 }, 7);
  assert.equal(shifted.x, 1); assert.equal(shifted.c, -1.5);
  const [dx, dy] = familyPoint(familyPlots.derivative, -.75, -1.5);
  const moved = familyDrag(shifted, 'x', { x: dx - 9, y: dy + 100 }, -9);
  assert.equal(moved.x, -.75); assert.equal(moved.c, -1.5);
});

test('the stationary point and both parameter boundaries remain reachable by keyboard', () => {
  let state = familyState();
  for (let i = 0; i < 10; i++) state = familyKey(state, 'x', 'ArrowLeft');
  assert.equal(state.x, 0); assert.equal(state.slope, 0); assert.equal(state.value, state.c);
  state = familyKey(state, 'c', 'Home'); assert.equal(state.c, -2);
  state = familyKey(state, 'c', 'ArrowDown'); assert.equal(state.c, -2);
  state = familyKey(state, 'c', 'End'); assert.equal(state.c, 2);
  state = familyKey(state, 'x', 'End'); assert.equal(state.x, 1.8);
  state = familyKey(state, 'x', 'ArrowLeft', true); assert.equal(state.x, 1.79);
  assert.equal(familyKey(state, 'x', 'Tab'), state);
});

test('out-of-range pointer coordinates cannot move a point outside the advertised range', () => {
  const state = familyState();
  assert.equal(familyDrag(state, 'c', { x: 0, y: -10000 }).c, 2);
  assert.equal(familyDrag(state, 'c', { x: 0, y: 10000 }).c, -2);
  assert.equal(familyDrag(state, 'x', { x: -10000, y: 0 }).x, -1.8);
  assert.equal(familyDrag(state, 'x', { x: 10000, y: 0 }).x, 1.8);
});

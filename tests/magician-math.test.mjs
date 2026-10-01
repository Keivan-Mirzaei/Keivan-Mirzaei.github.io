import test from 'node:test';
import assert from 'node:assert/strict';
import { successProbability, limitingProbability, PHASE_AVERAGE } from '../assets/js/lib/magician-math.mjs';

test('the exact probabilities agree with the small-audience rational answers', () => {
  assert.equal(successProbability(0), 0);
  assert.equal(successProbability(1), 1);
  for (const [n, answer] of [[2, 2 / 3], [3, 5 / 7], [4, 76 / 105]]) {
    assert.ok(Math.abs(successProbability(n) - answer) < 2e-15);
  }
  assert.throws(() => successProbability(-1), RangeError);
  assert.throws(() => successProbability(1.5), RangeError);
});

test('the limiting profile is periodic and agrees with the write-up at two phases', () => {
  for (const phase of [0, .17, .5, .999, -.25]) {
    assert.ok(Math.abs(limitingProbability(phase) - limitingProbability(phase + 1)) < 2e-15);
  }
  assert.ok(Math.abs(limitingProbability(0) - .721352103336862) < 2e-15);
  assert.ok(Math.abs(limitingProbability(.5) - .721342937541388) < 2e-15);
  assert.ok(limitingProbability(0) - limitingProbability(.5) > 9e-6);
});

test('two large integer audience sequences approach different values', () => {
  const n = 2 ** 32;
  const a = successProbability(n);
  const b = successProbability(Math.floor(n * Math.SQRT2));
  assert.ok(Math.abs(a - limitingProbability(0)) < 1e-10);
  assert.ok(Math.abs(b - limitingProbability(.5)) < 1e-10);
  assert.ok(a - b > 9e-6);
});

test('the residual ripple has the stated nonzero height and average', () => {
  const samples = Array.from({ length: 4000 }, (_, index) => limitingProbability(index / 4000));
  const height = Math.max(...samples) - Math.min(...samples);
  assert.ok(Math.abs(height - 1.426023452e-5) < 1e-11);
  assert.ok(Math.abs(samples.reduce((sum, value) => sum + value, 0) / samples.length - PHASE_AVERAGE) < 2e-14);
});

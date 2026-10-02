import test from 'node:test';
import assert from 'node:assert/strict';
import { magnifiedValue, errorBound } from '../assets/js/lib/differentiability-math.mjs';

test('magnification matches the original function, not a rescaled slope', () => {
  for (const radius of [1, 0.1, 0.001]) {
    for (const u of [-1, -0.4, 0, 0.3, 1]) {
      const original = ((1 + radius * u) ** 2 - 1) / radius;
      assert.ok(Math.abs(magnifiedValue('square', u, radius) - original) < 1e-10);
      const x = radius * u;
      const w = x === 0 ? 0 : x * x * Math.sin(1 / x);
      assert.ok(Math.abs(magnifiedValue('oscillation', u, radius) - w / radius) < 1e-12);
    }
  }
});

test('bounds control every sampled displacement and both dense branches', () => {
  for (const model of ['square', 'absolute', 'oscillation', 'rational-square', 'rational-linear']) {
    for (const radius of [1, 0.1, 0.001, 0.00001]) {
      for (const slope of [-2, 0, 0.5, 2, 3]) {
        for (let j = -80; j <= 80; j += 1) {
          const u = j / 80;
          for (const branch of ['rational', 'irrational']) {
            const error = Math.abs(magnifiedValue(model, u, radius, branch) - slope * u);
            assert.ok(error <= errorBound(model, radius, slope) + 1e-12, `${model}, ${branch}, ${radius}, ${slope}, ${u}`);
          }
        }
      }
    }
  }
});

test('a quadratic dense branch vanishes while the linear dense branch persists', () => {
  const radius = 0.00001;
  for (const branch of ['rational', 'irrational']) {
    assert.ok(Math.abs(magnifiedValue('rational-square', 1, radius, branch)) <= radius);
  }
  // At each radius, the two branches at u = 1 are still separated by one.
  const separation = magnifiedValue('rational-linear', 1, radius, 'rational')
    - magnifiedValue('rational-linear', 1, radius, 'irrational');
  assert.equal(separation, 1);
  for (let slope = -2; slope <= 3; slope += 0.1) {
    assert.ok(errorBound('rational-linear', radius, slope) >= 0.5);
    assert.ok(errorBound('absolute', radius, slope) >= 1);
  }
});

test('the displayed exact maxima are attained by points on the branches', () => {
  for (const model of ['square', 'absolute', 'rational-square', 'rational-linear']) {
    for (const slope of [-2, 0, 0.5, 2, 3]) {
      const errors = [-1, 1].flatMap((u) => ['rational', 'irrational'].map((branch) =>
        Math.abs(magnifiedValue(model, u, 0.1, branch) - slope * u)));
      assert.ok(Math.abs(Math.max(...errors) - errorBound(model, 0.1, slope)) < 1e-12);
    }
  }
});

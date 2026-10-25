import test from 'node:test';
import assert from 'node:assert/strict';
import { riemannModel, riemannReadouts } from '../assets/js/lib/learning-riemann.mjs';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} differs from ${expected}`);

test('both bounds agree with independent finite-sum formulas throughout the control range', () => {
  for (let n = 1; n <= 64; n++) {
    for (const rule of ['lower', 'upper']) {
      const increasing = 8 / 3 + (rule === 'upper' ? 4 : -4) / n + 4 / (3 * n * n);
      near(riemannModel({ n, rule }).sum, increasing);
      near(riemannModel({ n, rule, profile: 'decreasing' }).sum, increasing);
      const turning = 16 / 3 - 16 / (3 * n * n)
        + (rule === 'upper' ? 8 / n : -8 / n + (n % 2 ? 8 / n ** 3 : 0));
      near(riemannModel({ n, rule, profile: 'turning' }).sum, turning);
    }
  }
});

test('rectangles cover the interval once and sample within their own strips', () => {
  for (const n of [1, 3, 8, 64]) {
    for (const rule of ['lower', 'upper']) {
      const model = riemannModel({ n, rule });
      assert.equal(model.rectangles.length, n);
      assert.equal(model.rectangles[0].left, 0); assert.equal(model.rectangles.at(-1).right, 2);
      model.rectangles.forEach((rectangle, i) => {
        if (i) assert.equal(rectangle.left, model.rectangles[i - 1].right);
        near(rectangle.right - rectangle.left, model.dx);
        assert.ok(rectangle.sample >= rectangle.left && rectangle.sample <= rectangle.right);
        near(rectangle.height, rectangle.sample ** 2);
      });
      near(model.rectangles.reduce((sum, r) => sum + r.height * (r.right - r.left), 0), model.sum);
    }
  }
});

test('feedback distinguishes exact decimals from rounded sums and uses the selected rule and count', () => {
  assert.equal(riemannReadouts(riemannModel()).sum, String.raw`\overline{S}_{4}=3.75`);
  assert.equal(riemannReadouts(riemannModel({ n: 3 })).sum, String.raw`\overline{S}_{3}\approx4.1481`);
  assert.equal(riemannReadouts(riemannModel({ n: 3 })).width, String.raw`\Delta x=\frac{2}{3}`);
  assert.equal(riemannReadouts(riemannModel({ n: 2 })).width, String.raw`\Delta x=1`);
  assert.equal(riemannReadouts(riemannModel({ n: 1, profile: 'turning', rule: 'lower' })).sum, String.raw`\underline{S}_{1}=0`);
  assert.equal(riemannReadouts(riemannModel({ rule: 'lower' })).sum, String.raw`\underline{S}_{4}=1.75`);
  assert.equal(riemannReadouts(riemannModel({ rule: 'upper' })).sum, String.raw`\overline{S}_{4}=3.75`);
  assert.equal(riemannReadouts(riemannModel({ n: 3, profile: 'turning', rule: 'upper' })).sum, String.raw`\overline{S}_{3}\approx7.4074`);
});

test('extremum locations reverse when the curve decreases', () => {
  for (let n = 1; n <= 64; n++) {
    for (const profile of ['increasing', 'decreasing']) {
      for (const rule of ['lower', 'upper']) {
        const endpoint = (profile === 'increasing') === (rule === 'lower') ? 'left' : 'right';
        for (const rectangle of riemannModel({ n, profile, rule }).rectangles) {
          assert.equal(rectangle.sample, rectangle[endpoint]);
        }
      }
    }
  }
});

test('upper sums include an interior maximum even when both endpoint heights are lower', () => {
  const one = riemannModel({ n: 1, profile: 'turning', rule: 'upper' });
  assert.equal(one.sum, 8);
  assert.equal(one.rectangles[0].sample, 1);
  assert.equal(one.rectangles[0].height, 4);
  assert.equal(riemannModel({ n: 1, profile: 'turning', rule: 'lower' }).sum, 0);
  const three = riemannModel({ n: 3, profile: 'turning', rule: 'upper' });
  near(three.sum, 200 / 27);
  near(riemannModel({ n: 3, profile: 'turning', rule: 'lower' }).sum, 64 / 27);
  assert.equal(three.rectangles[1].sample, 1);
  assert.equal(three.rectangles[1].height, 4);
});

test('extremal rectangles bound every strip and their sums enclose the exact area', () => {
  const functions = {
    increasing: x => x * x,
    decreasing: x => (2 - x) ** 2,
    turning: x => 4 - 4 * (x - 1) ** 2,
  };
  for (const [profile, f] of Object.entries(functions)) {
    const area = profile === 'turning' ? 16 / 3 : 8 / 3;
    for (let n = 1; n <= 64; n++) {
      const lower = riemannModel({ n, profile, rule: 'lower' });
      const upper = riemannModel({ n, profile, rule: 'upper' });
      assert.ok(lower.sum <= area && upper.sum >= area);
      for (let i = 0; i < n; i++) {
        const low = lower.rectangles[i], high = upper.rectangles[i];
        for (const rectangle of [low, high]) {
          assert.ok(rectangle.sample >= rectangle.left && rectangle.sample <= rectangle.right);
          near(rectangle.height, f(rectangle.sample));
        }
        for (let j = 0; j <= 20; j++) {
          const height = f(low.left + (low.right - low.left) * j / 20);
          assert.ok(low.height <= height + 1e-12 && high.height >= height - 1e-12);
        }
      }
    }
  }
});

test('refinement never loosens lower and upper bounds, but can leave them unchanged', () => {
  for (const profile of ['increasing', 'decreasing', 'turning']) {
    for (let n = 1; n <= 32; n++) {
      const lower = riemannModel({ n, profile, rule: 'lower' });
      const upper = riemannModel({ n, profile, rule: 'upper' });
      const finerLower = riemannModel({ n: 2 * n, profile, rule: 'lower' });
      const finerUpper = riemannModel({ n: 2 * n, profile, rule: 'upper' });
      assert.ok(finerLower.sum >= lower.sum);
      assert.ok(finerUpper.sum <= upper.sum);
    }
  }
  for (const rule of ['lower', 'upper']) {
    assert.equal(riemannModel({ n: 1, profile: 'turning', rule }).sum,
      riemannModel({ n: 2, profile: 'turning', rule }).sum);
  }
});

test('the bound gap closes with subdivision without identifying a finite sum as the limit', () => {
  for (const n of [1, 2, 4, 8, 16, 32, 64]) {
    const lower = riemannModel({ n, rule: 'lower' }), upper = riemannModel({ n, rule: 'upper' });
    near(upper.sum - lower.sum, 8 / n);
    assert.ok(lower.sum < 8 / 3 && upper.sum > 8 / 3);
    assert.ok(Number.isInteger(upper.numerator) && Number.isInteger(upper.denominator));
    near(upper.numerator / upper.denominator, upper.sum);
  }
});

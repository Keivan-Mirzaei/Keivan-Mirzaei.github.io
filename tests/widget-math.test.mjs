import test from 'node:test';
import assert from 'node:assert/strict';
import { numberParts, numberMarkup, formatNumber, differentiabilityFormula } from '../assets/js/lib/widget-math.mjs';

test('rounding and notation preserve tiny nonzero values and normalize boundary carries', () => {
  assert.equal(formatNumber(-1e-202), '−1.00 × 10⁻²⁰²');
  assert.equal(formatNumber(.0009999), '0.001');
  assert.equal(formatNumber(9999.9), '1.00 × 10⁴');
  assert.equal(formatNumber(-0), '0');
  assert.equal(formatNumber(Infinity), 'Undefined');
  assert.equal(formatNumber(Number.MAX_VALUE), '1.80 × 10³⁰⁸');
  for (const value of [1e-202, -3.4e-10, .0003, .9999, 250, 2e10]) {
    const parts = numberParts(value);
    const coefficient = Number(parts.coefficient.replace('−', '-'));
    const display = coefficient * 10 ** (parts.exponent ?? 0);
    assert.ok(display !== 0 && Math.abs(display / value - 1) <= .005);
    if (parts.exponent !== null) assert.ok(Math.abs(coefficient) >= 1 && Math.abs(coefficient) < 10);
  }
});
test('math markup uses real fractions, subscripts and powers, with readable undefined output', () => {
  assert.match(numberMarkup(1e-10, true), /<mo>≈<\/mo>.*<msup>/);
  assert.equal(numberMarkup(NaN), 'Undefined');
  assert.match(differentiabilityFormula('oscillation'), /<mfrac>/);
  assert.match(differentiabilityFormula('rational-square'), /<msub>/);
});

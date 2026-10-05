import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMachine } from '../assets/js/lib/function-machine-math.mjs';

test('both endpoints and all sampled exterior inputs are excluded', () => {
  for (const input of ['1', '-1', '1.0', '+1', '3/3', '-3/3', '2', '-2']) {
    assert.deepEqual(evaluateMachine(input), { state: 'undefined', output: 'Undefined' });
  }
});

test('decimals on either side of an endpoint retain exact domain membership', () => {
  const expected = Math.log(2e-19);
  for (const input of ['0.9999999999999999999', '-0.9999999999999999999']) {
    const result = evaluateMachine(input);
    assert.equal(result.state, 'defined');
    assert.ok(Math.abs(result.value - expected) < 1e-12);
  }
  for (const input of ['1.0000000000000000001', '-1.0000000000000000001']) {
    assert.equal(evaluateMachine(input).state, 'undefined');
  }
});

test('natural-logarithm values agree with direct evaluation at interior inputs', () => {
  assert.deepEqual(evaluateMachine('0'), { state: 'defined', output: '0', value: 0 });
  assert.equal(evaluateMachine('0.5').output, '≈ −0.288');
  assert.equal(evaluateMachine('0.9').output, '≈ −1.66');
  for (let d = 2; d <= 21; d++) {
    for (let n = -d + 1; n < d; n++) {
      const result = evaluateMachine(`${n}/${d}`);
      const expected = Math.log((d * d - n * n) / (d * d));
      assert.equal(result.state, 'defined');
      assert.ok(Math.abs(result.value - expected) < 1e-13);
      assert.equal(result.output, evaluateMachine(`${-n}/${d}`).output);
    }
  }
  const tiny = evaluateMachine('0.' + '0'.repeat(100) + '1');
  assert.ok(tiny.value < 0);
  assert.ok(Math.abs(tiny.value / -1e-202 - 1) < 1e-14);
  assert.equal(tiny.output, '≈ −1.00 × 10⁻²⁰²');
});

test('empty input is neutral', () => {
  assert.deepEqual(evaluateMachine('  '), { state: 'empty', output: '—' });
});

test('invalid entry remains distinct from an excluded real input', () => {
  for (const input of ['NaN', 'Infinity', '1/0', '0/0', '1/2/3', 'hello', '1..2']) {
    assert.equal(evaluateMachine(input).state, 'invalid');
  }
});

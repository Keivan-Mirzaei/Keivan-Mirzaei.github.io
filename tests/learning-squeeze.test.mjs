import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-squeeze.js', import.meta.url), 'utf8');
function explorer() {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      value: id === 'squeeze-zoom' ? '0' : '', textContent: '', attrs: {}, handlers: {},
      setAttribute(name, value) { this.attrs[name] = value; },
      addEventListener(name, handler) { this.handlers[name] = handler; },
    });
    return elements.get(id);
  };
  vm.runInNewContext(source, { document: { getElementById: get } });
  return name => get(`squeeze-${name}`);
}

test('zoom shrinks the input range and its quadratic output bound', () => {
  const get = explorer();
  assert.equal(get('radius').value, '1');
  assert.equal(get('bound').value, '1');
  get('zoom').value = '100';
  get('zoom').handlers.input();
  assert.equal(get('radius').value, '0.02');
  assert.equal(get('bound').value, '0.0004');
  assert.equal(get('right').textContent, '0.02');
  assert.match(get('zoom').attrs['aria-valuetext'], /0.0004/);
  const upper = get('upper').attrs.d;
  assert.match(upper, /^M70.00 55.00/);
  assert.equal(get('top').textContent, '0.0004');
  assert.ok(!/NaN|Infinity/.test(get('middle').attrs.d));
  assert.equal((get('middle').attrs.d.match(/M/g) || []).length, 2);
  get('zoom').value = '0';
  get('zoom').handlers.input();
  assert.match(get('upper').attrs.d, /^M70.00 55.00/);
});

test('the plotted oscillation stays between the rendered bounds at an intermediate zoom', () => {
  const get = explorer();
  get('zoom').value = '37';
  get('zoom').handlers.input();
  const points = name => [...get(name).attrs.d.matchAll(/[ML]([\d.-]+) ([\d.-]+)/g)].map(m => [Number(m[1]), Number(m[2])]);
  const upper = new Map(points('upper'));
  const lower = new Map(points('lower'));
  for (const [x, y] of points('middle')) {
    assert.ok(y >= upper.get(x) - 0.01 && y <= lower.get(x) + 0.01);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../assets/js/learning-infinite-limits.js', import.meta.url), 'utf8');
function explorer() {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      value: id.endsWith('zoom') ? '0' : '', attrs: {}, handlers: {},
      setAttribute(name, value) { this.attrs[name] = value; },
      addEventListener(name, handler) { this.handlers[name] = handler; },
    });
    return elements.get(id);
  };
  const square = get('square'); square.value = 'square'; square.checked = true;
  vm.runInNewContext(source, { document: { getElementById: get, querySelectorAll: () => [square] } });
  return get;
}
test('vertical zoom expands the view without joining the two branches', () => {
  const get = explorer();
  get('pole-zoom').value = '100'; get('pole-zoom').handlers.input();
  assert.equal(get('pole-top').textContent, '60');
  assert.equal(get('pole-original-view').attrs.height, 12.5);
  assert.equal(get('pole-unit-positive').attrs.visibility, 'hidden');
  get('square').handlers.change();
  assert.equal((get('pole-curve').attrs.d.match(/M/g) || []).length, 2);
  assert.ok(!/NaN|Infinity/.test(get('pole-curve').attrs.d));
});
test('horizontal zoom expands the input view and shrinks the initial region', () => {
  const get = explorer();
  get('tails-zoom').value = '100'; get('tails-zoom').handlers.input();
  assert.equal(get('tails-original-view').attrs.width, 24);
  assert.equal(get('tails-original-view').attrs.x, 308);
  assert.equal(get('tails-left').textContent, '−80');
  assert.equal(get('tails-right').textContent, '80');
  assert.ok(!/NaN|Infinity/.test(get('tails-curve').attrs.d));
});

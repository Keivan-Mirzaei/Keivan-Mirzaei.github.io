import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../assets/js/learning-chain-rule.js', import.meta.url), 'utf8');
function explorer() {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, { attrs: {}, style: {}, handlers: {}, value: '', captured: null,
      setAttribute(name, value) { this.attrs[name] = value; }, removeAttribute(name) { delete this.attrs[name]; },
      addEventListener(name, fn) { this.handlers[name] = fn; }, setPointerCapture(id) { this.captured = id; },
      hasPointerCapture(id) { return this.captured === id; }, releasePointerCapture() { this.captured = null; }, focus() {},
    });
    return elements.get(id);
  };
  const svg = get('svg'); svg.getScreenCTM = () => ({ inverse: () => ({}) });
  svg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { y: (this.y - 10) * 2 }; } });
  vm.runInNewContext(source, { document: { getElementById: get, querySelector: () => svg } });
  return { get: name => get(`chain-${name}`), event: (clientY, pointerId = 1) => ({ clientX: 100, clientY, pointerId, button: 0, preventDefault() {} }) };
}
test('water height, volume and inflow follow the two connected rates', () => {
  const { get } = explorer();
  assert.equal(get('height').value, '1.50');
  assert.equal(get('volume-rate').value, '1.77');
  assert.equal(get('total-rate').value, '0.88');
  const key = key => get('handle').handlers.keydown({ key, preventDefault() {} });
  key('Home'); assert.equal(get('height').value, '1.00');
  assert.equal(get('total-rate').value, '0.39');
  key('End'); assert.equal(get('height').value, '2.50');
  assert.equal(get('volume').value, '4.09');
  assert.equal(get('total-rate').value, '2.45');
  assert.match(get('surface').attrs.d, /^M195 95a125 /);
  assert.match(get('water').attrs.d, /L320 345Z$/);
});
test('direct dragging respects display scaling and cancellation', () => {
  const { get, event } = explorer(); const handle = get('handle');
  handle.handlers.pointerdown(event(107.5));
  handle.handlers.pointermove(event(82.5, 2)); assert.equal(get('time').value, '1.00');
  handle.handlers.pointermove(event(82.5)); assert.equal(get('time').value, '2.00');
  handle.handlers.pointercancel(event(82.5)); handle.handlers.pointermove(event(57.5)); assert.equal(get('time').value, '2.00');
});

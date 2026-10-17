import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../assets/js/learning-hyperbolic.js', import.meta.url), 'utf8');
function explorer() {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, { value: '', attrs: {}, handlers: {}, captured: null,
      setAttribute(k, v) { this.attrs[k] = v; }, removeAttribute(k) { delete this.attrs[k]; },
      addEventListener(k, fn) { this.handlers[k] = fn; }, focus() {},
      setPointerCapture(id) { this.captured = id; }, hasPointerCapture(id) { return this.captured === id; }, releasePointerCapture() { this.captured = null; },
    });
    return elements.get(id);
  };
  const svg = get('svg'); svg.getScreenCTM = () => ({ inverse: () => ({}) });
  svg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { y: (this.y - 10) * 2 }; } });
  vm.runInNewContext(source, { document: { getElementById: get, querySelector: () => svg } });
  return { get: id => get(`hyperbolic-${id}`), event: (clientY, pointerId = 1) => ({ clientX: 100, clientY, pointerId, button: 0, preventDefault() {} }) };
}
test('the coordinates trace the right branch of the unit hyperbola', () => {
  const { get } = explorer(), key = key => get('handle').handlers.keydown({ key, preventDefault() {} });
  assert.equal(get('x').value, '1.29'); assert.equal(get('y').value, '0.82');
  key('Home'); const X = get('dot').attrs.cx, lower = get('dot').attrs.cy;
  key('End'); assert.equal(get('dot').attrs.cx, X); assert.ok(Math.abs(lower + get('dot').attrs.cy - 400) < 1e-9);
  for (let i = 0; i < 32; i++) key('ArrowLeft');
  assert.equal(get('t').value, '0.00'); assert.equal(get('x').value, '1.00'); assert.equal(get('y').value, '0.00');
  const curve = get('curve').attrs.d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  for (let i = 0; i < curve.length; i += 2) {
    const x = (curve[i] - 100) / 70, y = (200 - curve[i + 1]) / 70;
    assert.ok(x >= 1); assert.ok(Math.abs(x * x - y * y - 1) < .0001);
  }
});
test('vertical dragging converts the branch height back to its parameter', () => {
  const { get, event } = explorer(), handle = get('handle');
  const initialY = (200 - 70 * Math.sinh(.75)) / 2 + 10;
  handle.handlers.pointerdown(event(initialY));
  handle.handlers.pointermove(event(110, 2)); assert.equal(get('t').value, '0.75');
  handle.handlers.pointermove(event(110)); assert.equal(get('t').value, '0.00');
  handle.handlers.pointercancel(event(110)); handle.handlers.pointermove(event(90)); assert.equal(get('t').value, '0.00');
});

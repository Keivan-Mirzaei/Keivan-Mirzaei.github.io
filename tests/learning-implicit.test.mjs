import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-implicit.js', import.meta.url), 'utf8');
function explorer() {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', dataset: {}, style: {}, attrs: {}, handlers: {}, captured: null,
      setAttribute(name, value) { this.attrs[name] = value; },
      removeAttribute(name) { delete this.attrs[name]; },
      addEventListener(name, handler) { this.handlers[name] = handler; },
      setPointerCapture(id) { this.captured = id; },
      hasPointerCapture(id) { return this.captured === id; },
      releasePointerCapture() { this.captured = null; }, focus() {},
    });
    return elements.get(id);
  };
  const svg = get('svg');
  svg.getScreenCTM = () => ({ inverse: () => ({}) });
  svg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { x: (this.x - 10) * 2, y: (this.y - 10) * 2 }; } });
  vm.runInNewContext(source, { document: { getElementById: get, querySelector: () => svg } });
  return { get, event: (clientX, clientY, pointerId = 1) => ({ clientY, clientX, pointerId, button: 0, preventDefault() {} }) };
}

test('the circle distinguishes finite, horizontal, and vertical tangents', () => {
  const { get } = explorer();
  assert.equal(get('implicit-slope').value, '-1.00');
  const handle = get('implicit-handle');
  const key = key => handle.handlers.keydown({ key, preventDefault() {} });
  for (let i = 0; i < 6; i++) key('ArrowRight');
  assert.equal(get('implicit-x').value, '0.00');
  assert.equal(get('implicit-y').value, '2.00');
  assert.equal(get('implicit-slope').value, '0.00');
  key('Home');
  assert.equal(get('implicit-x').value, '2.00');
  assert.equal(get('implicit-slope').value, 'undefined');
  const endpoints = get('implicit-tangent').attrs.d.slice(1).split(/[ L]/).map(Number);
  assert.equal(endpoints[0], endpoints[2]);
  assert.ok(Math.abs(Math.hypot(endpoints[2] - endpoints[0], endpoints[3] - endpoints[1]) - 180) < 1e-9);
});

test('direct dragging follows both coordinates around the circle and cancels cleanly', () => {
  const { get, event } = explorer();
  const handle = get('implicit-handle');
  const px = 320 + 150 / Math.sqrt(2), py = 210 - 150 / Math.sqrt(2);
  handle.handlers.pointerdown(event(10 + px / 2, 10 + py / 2));
  handle.handlers.pointermove(event(95, 115, 2));
  assert.equal(get('implicit-x').value, '1.41');
  handle.handlers.pointermove(event(95, 115));
  assert.equal(get('implicit-x').value, '-2.00');
  assert.equal(get('implicit-slope').value, 'undefined');
  handle.handlers.pointermove(event(170, 190));
  assert.equal(get('implicit-y').value, '-2.00');
  assert.equal(get('implicit-slope').value, '0.00');
  handle.handlers.pointercancel(event(170, 190));
  handle.handlers.pointermove(event(245, 115));
  assert.equal(get('implicit-y').value, '-2.00');
});

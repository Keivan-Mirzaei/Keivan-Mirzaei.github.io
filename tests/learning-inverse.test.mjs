import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-inverse.js', import.meta.url), 'utf8');
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
  svg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { x: (this.x - 10) * 2 }; } });
  vm.runInNewContext(source, { document: { getElementById: get, querySelector: () => svg } });
  return { get, event: (clientX, pointerId = 1) => ({ clientY: 100, clientX, pointerId, button: 0, preventDefault() {} }) };
}

test('corresponding points swap coordinates and respect the inverse input bounds', () => {
  const { get } = explorer();
  assert.equal(get('inverse-original-handle').attrs['aria-valuenow'], 1.3);
  assert.equal(get('inverse-original-dot').attrs.cx, 247);
  assert.ok(Math.abs(get('inverse-inverse-dot').attrs.cy - 273) < 1e-10);
  const key = (part, key) => get(`inverse-${part}-handle`).handlers.keydown({ key, preventDefault() {} });
  key('original', 'End');
  assert.equal(get('inverse-inverse-handle').attrs['aria-valuenow'], 4);
  key('inverse', 'Home');
  assert.equal(get('inverse-original-handle').attrs['aria-valuenow'], .25);
});

test('the inverse point converts its horizontal position back to the original input', () => {
  const { get, event } = explorer();
  const handle = get('inverse-inverse-handle');
  handle.handlers.pointerdown(event(151.05));
  handle.handlers.pointermove(event(255, 2));
  assert.equal(get('inverse-original-handle').attrs['aria-valuenow'], 1.3);
  handle.handlers.pointermove(event(255));
  assert.equal(get('inverse-original-handle').attrs['aria-valuenow'], 2);
  handle.handlers.pointercancel(event(255));
  handle.handlers.pointermove(event(100));
  assert.equal(get('inverse-original-handle').attrs['aria-valuenow'], 2);
});

test('tangent segments have equal lengths and are exact reflections', () => {
  const { get } = explorer();
  const endpoints = key => get(`inverse-${key}-tangent`).attrs.d.slice(1).split(/[ L]/).map(Number);
  const original = endpoints('original');
  const inverse = endpoints('inverse');
  const length = points => Math.hypot(points[2] - points[0], points[3] - points[1]);
  assert.ok(Math.abs(length(original) - length(inverse)) < 1e-9);
  for (let i = 0; i < 4; i += 2) {
    assert.ok(Math.abs(inverse[i] - (520 - original[i + 1])) < 1e-9);
    assert.ok(Math.abs(inverse[i + 1] - (520 - original[i])) < 1e-9);
  }
});

test('the secant triangles swap increments and approximate the true derivatives', () => {
  const { get } = explorer();
  const numbers = id => get(id).attrs.d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const original = numbers('inverse-original-triangle'), inverse = numbers('inverse-inverse-triangle');
  const originalRun = original[2] - original[0], originalRise = original[1] - original[3];
  const inverseRun = inverse[3] - inverse[0], inverseRise = inverse[1] - inverse[2];
  assert.ok(Math.abs(originalRun - inverseRise) < 1e-9);
  assert.ok(Math.abs(originalRise - inverseRun) < 1e-9);
  assert.equal(get('inverse-original-secant').value, '2.30');
  assert.equal(get('inverse-inverse-secant').value, '0.43');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-derivative.js', import.meta.url), 'utf8');
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

test('secants approach the same tangent slope from both sides without defining a zero quotient', () => {
  const { get } = explorer();
  const handle = get('derivative-handle');
  const key = key => handle.handlers.keydown({ key, preventDefault() {} });
  for (let i = 0; i < 23; i++) key('ArrowLeft');
  assert.equal(get('derivative-h').value, '0.05');
  assert.equal(get('derivative-slope').value, '2.05');
  key('ArrowLeft');
  assert.equal(get('derivative-slope').value, '—');
  assert.equal(get('derivative-secant').attrs.visibility, 'hidden');
  assert.equal(get('derivative-run-label').hidden, true);
  assert.equal(get('derivative-rise-label').hidden, true);
  key('ArrowLeft');
  assert.equal(get('derivative-h').value, '-0.05');
  assert.equal(get('derivative-slope').value, '1.95');
  assert.equal(get('derivative-secant').attrs.visibility, 'visible');
  assert.equal(get('derivative-run-label').hidden, false);
  assert.equal(get('derivative-rise-label').hidden, false);
  key('Home'); key('ArrowLeft');
  assert.equal(get('derivative-h').value, '-1.00');
  key('End'); key('ArrowRight');
  assert.equal(get('derivative-h').value, '1.50');
});

test('direct dragging respects display scaling, pointer identity, and cancellation', () => {
  const { get, event } = explorer();
  const handle = get('derivative-handle');
  handle.handlers.pointerdown(event(248));
  handle.handlers.pointermove(event(140, 2));
  assert.equal(get('derivative-h').value, '1.20');
  handle.handlers.pointermove(event(140));
  assert.equal(get('derivative-h').value, '0.00');
  handle.handlers.pointercancel(event(140));
  handle.handlers.pointermove(event(100));
  assert.equal(get('derivative-h').value, '0.00');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-hyperbolic.js', import.meta.url), 'utf8');
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
  const radios = ['sinh', 'cosh', 'tanh'].map(name => { const radio = get(name); radio.value = name; return radio; });
  vm.runInNewContext(source, { document: { getElementById: get, querySelector: () => svg, querySelectorAll: () => radios } });
  return { get, event: (clientX, pointerId = 1) => ({ clientY: 100, clientX, pointerId, button: 0, preventDefault() {} }) };
}

test('switching functions keeps the input but changes the value and derivative together', () => {
  const { get } = explorer();
  const handle = get('hyperbolic-handle');
  for (let i = 0; i < 15; i++) handle.handlers.keydown({ key: 'ArrowLeft', preventDefault() {} });
  assert.equal(get('hyperbolic-x').value, '0.00');
  assert.equal(get('hyperbolic-value').value, '1.00');
  assert.equal(get('hyperbolic-slope').value, '0.00');
  const select = name => { const radio = get(name); radio.checked = true; radio.handlers.change(); };
  select('sinh');
  assert.equal(get('hyperbolic-value').value, '0.00');
  assert.equal(get('hyperbolic-slope').value, '1.00');
  select('tanh');
  handle.handlers.keydown({ key: 'End', preventDefault() {} });
  assert.equal(get('hyperbolic-value').value, '0.96');
  assert.equal(get('hyperbolic-slope').value, '0.07');
  handle.handlers.keydown({ key: 'ArrowRight', preventDefault() {} });
  assert.equal(get('hyperbolic-x').value, '2.00');
  handle.handlers.keydown({ key: 'Home', preventDefault() {} });
  assert.equal(get('hyperbolic-value').value, '-0.96');
  assert.equal(get('hyperbolic-slope').value, '0.07');
});

test('direct dragging respects scale, pointer identity, and cancellation', () => {
  const { get, event } = explorer();
  const handle = get('hyperbolic-handle');
  handle.handlers.pointerdown(event(215));
  handle.handlers.pointermove(event(170, 2));
  assert.equal(get('hyperbolic-x').value, '0.75');
  handle.handlers.pointermove(event(170));
  assert.equal(get('hyperbolic-x').value, '0.00');
  handle.handlers.pointercancel(event(170));
  handle.handlers.pointermove(event(200));
  assert.equal(get('hyperbolic-x').value, '0.00');
});

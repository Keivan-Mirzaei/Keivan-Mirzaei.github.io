import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-rules.js', import.meta.url), 'utf8');
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

test('the area strips and corner give the exact finite quotient and shrink to the product-rule rate', () => {
  const { get } = explorer();
  const h = Number(get('rules-h').value);
  const top = get('rules-top').attrs.height * 200;
  const right = get('rules-right').attrs.width * 150;
  const corner = get('rules-corner').attrs.width * get('rules-corner').attrs.height;
  assert.ok(Math.abs((top + right + corner) / 5000 / h - Number(get('rules-rate').value)) < 1e-10);
  const handle = get('rules-handle');
  const key = key => handle.handlers.keydown({ key, preventDefault() {} });
  key('Home');
  assert.equal(get('rules-h').value, '0.00');
  assert.equal(get('rules-rate').value, '—');
  assert.equal(get('rules-corner').attrs.width, 0);
  assert.equal(get('rules-corner-label').hidden, true);
  key('ArrowRight');
  assert.equal(get('rules-rate').value, '7.02');
  key('End'); key('ArrowUp');
  assert.equal(get('rules-h').value, '1.00');
});

test('dragging the corner follows display scaling and stops on cancellation', () => {
  const { get, event } = explorer();
  const handle = get('rules-handle');
  handle.handlers.pointerdown(event(230));
  handle.handlers.pointermove(event(195, 2));
  assert.equal(get('rules-h').value, '0.70');
  handle.handlers.pointermove(event(195));
  assert.equal(get('rules-h').value, '0.00');
  handle.handlers.pointercancel(event(195));
  handle.handlers.pointermove(event(230));
  assert.equal(get('rules-h').value, '0.00');
});

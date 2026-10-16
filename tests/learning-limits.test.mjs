import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-limits.js', import.meta.url), 'utf8');
function explorer() {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', attrs: {}, handlers: {}, captured: null,
      setAttribute(name, value) { this.attrs[name] = value; },
      removeAttribute(name) { delete this.attrs[name]; },
      addEventListener(name, handler) { this.handlers[name] = handler; },
      setPointerCapture(id) { this.captured = id; },
      hasPointerCapture(id) { return this.captured === id; },
      releasePointerCapture() { this.captured = null; },
      focus() {},
    });
    return elements.get(id);
  };
  const svg = get('svg');
  svg.getScreenCTM = () => ({ inverse: () => ({}) });
  svg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { x: (this.x - 10) * 2 }; } });
  vm.runInNewContext(source, { document: { getElementById: get, querySelector: () => svg } });
  const event = (clientX, pointerId = 1) => ({ clientX, clientY: 0, pointerId, button: 0, preventDefault() {} });
  return { get, handle: get('limit-handle'), event };
}

test('dragging follows graph coordinates at a scaled display and can visit the isolated value', () => {
  const { get, handle, event } = explorer();
  handle.handlers.pointerdown(event(95));
  assert.equal(handle.captured, 1);
  for (const [clientX, expectedX, expectedY] of [[154.94, '1.999', '3.999'], [155, '2.000', '1.000'], [155.06, '2.001', '4.001']]) {
    handle.handlers.pointermove(event(clientX));
    assert.equal(get('limit-x').value, expectedX);
    assert.equal(get('limit-y').value, expectedY);
  }
  handle.handlers.pointermove(event(1000));
  assert.equal(get('limit-x').value, '4.000');
  handle.handlers.pointermove(event(-1000));
  assert.equal(get('limit-x').value, '0.000');
});

test('other pointers and cancelled drags cannot move the point; offset does not jump on grab', () => {
  const { get, handle, event } = explorer();
  handle.handlers.pointerdown(event(100));
  handle.handlers.pointermove(event(100));
  assert.equal(get('limit-x').value, '1.000');
  handle.handlers.pointermove(event(150, 2));
  assert.equal(get('limit-x').value, '1.000');
  handle.handlers.pointercancel(event(100));
  assert.equal(handle.captured, null);
  handle.handlers.pointermove(event(155));
  assert.equal(get('limit-x').value, '1.000');
});

test('keyboard navigation reaches the point exactly and supports fine steps and boundaries', () => {
  const { get, handle } = explorer();
  const key = (key, shiftKey = false) => handle.handlers.keydown({ key, shiftKey, preventDefault() {} });
  for (let i = 0; i < 100; i++) key('ArrowRight');
  assert.equal(get('limit-x').value, '2.000');
  assert.equal(get('limit-y').value, '1.000');
  key('ArrowLeft', true);
  assert.equal(get('limit-y').value, '3.999');
  key('End'); key('ArrowRight');
  assert.equal(get('limit-x').value, '4.000');
  key('Home'); key('ArrowLeft');
  assert.equal(get('limit-x').value, '0.000');
});

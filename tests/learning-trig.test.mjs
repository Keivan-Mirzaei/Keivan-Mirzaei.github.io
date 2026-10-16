import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-trig.js', import.meta.url), 'utf8');
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

test('the tangent slope and derivative height agree at the crest and zero crossing', () => {
  const { get } = explorer();
  const handle = get('trig-handle');
  const key = key => handle.handlers.keydown({ key, preventDefault() {} });
  for (let i = 0; i < 6; i++) key('ArrowRight');
  assert.equal(get('trig-value').value, '1.00');
  assert.equal(get('trig-slope').value, '0.00');
  assert.equal(get('trig-sine-dot').attrs.cx, get('trig-cosine-dot').attrs.cx);
  assert.equal(get('trig-cosine-dot').attrs.cy, 330);
  for (let i = 0; i < 12; i++) key('ArrowRight');
  assert.equal(get('trig-value').value, '0.00');
  assert.equal(get('trig-slope').value, '-1.00');
  key('Home'); key('ArrowLeft');
  assert.equal(get('trig-x').value, '0.00');
  key('End'); key('ArrowRight');
  assert.equal(get('trig-x').value, '6.28');
  assert.equal(get('trig-slope').value, '1.00');
});

test('dragging either synchronized point uses graph coordinates and ignores other pointers', () => {
  const { get, event } = explorer();
  const handle = get('trig-handle');
  handle.handlers.pointerdown(event(76.25));
  handle.handlers.pointermove(event(107.5, 2));
  assert.equal(get('trig-x').value, '0.79');
  handle.handlers.pointermove(event(107.5));
  assert.equal(get('trig-x').value, '1.57');
  assert.equal(get('trig-slope').value, '0.00');
  handle.handlers.pointercancel(event(107.5));
  handle.handlers.pointermove(event(150));
  assert.equal(get('trig-x').value, '1.57');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-continuity.js', import.meta.url), 'utf8');
function explorer() {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', dataset: {}, attrs: {}, handlers: {}, captured: null,
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
  svg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { y: (this.y - 10) * 2 }; } });
  vm.runInNewContext(source, { document: { getElementById: get, querySelector: () => svg } });
  return { get, event: (clientY, pointerId = 1) => ({ clientX: 100, clientY, pointerId, button: 0, preventDefault() {} }) };
}

test('continuity requires all three independently controlled heights to agree', () => {
  const { get } = explorer();
  const key = (part, key) => get(`continuity-${part}-handle`).handlers.keydown({ key, preventDefault() {} });
  for (let i = 0; i < 30; i++) key('point', 'ArrowUp');
  assert.equal(get('continuity-point-value').value, '4.0');
  assert.equal(get('continuity-state').textContent, 'Not continuous');
  for (let i = 0; i < 10; i++) key('left', 'ArrowUp');
  assert.equal(get('continuity-state').dataset.continuous, 'true');
  assert.equal(get('svg').dataset.continuous, 'true');
  assert.equal(get('continuity-join-glow').attrs.opacity, '0.12');
  assert.equal(get('continuity-left-branch').attrs.d, 'M70 185C145 195 205 90 290 140');
  key('right', 'ArrowUp');
  assert.equal(get('continuity-state').textContent, 'Not continuous');
  assert.equal(get('continuity-left-value').value, '4.0');
  assert.equal(get('continuity-point-value').value, '4.0');
  key('right', 'End'); key('right', 'ArrowUp');
  assert.equal(get('continuity-right-value').value, '5.5');
  key('right', 'Home'); key('right', 'ArrowDown');
  assert.equal(get('continuity-right-value').value, '0.0');
});

test('scaled pointer dragging updates branches and cancellation stops movement', () => {
  const { get, event } = explorer();
  const left = get('continuity-left-handle');
  left.handlers.pointerdown(event(105));
  left.handlers.pointermove(event(80, 2));
  assert.equal(get('continuity-left-value').value, '3.0');
  left.handlers.pointermove(event(80));
  assert.equal(get('continuity-left-value').value, '4.0');
  assert.equal(get('continuity-left-end').attrs.cy, 140);
  left.handlers.pointercancel(event(80));
  left.handlers.pointermove(event(100));
  assert.equal(get('continuity-left-value').value, '4.0');
  const point = get('continuity-point-handle');
  point.handlers.pointerdown(event(155));
  point.handlers.pointermove(event(80));
  assert.equal(get('continuity-state').textContent, 'Continuous');
  assert.equal(get('continuity-point-dot').attrs.cy, 140);
});

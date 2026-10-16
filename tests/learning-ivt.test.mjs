import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-ivt.js', import.meta.url), 'utf8');
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
      replaceChildren(...children) { this.children = children; },
    });
    return elements.get(id);
  };
  const svg = get('svg');
  svg.getScreenCTM = () => ({ inverse: () => ({}) });
  svg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { y: (this.y - 10) * 2 }; } });
  vm.runInNewContext(source, { document: { getElementById: get, querySelector: () => svg, createElementNS: () => ({ attrs: {}, setAttribute(key, value) { this.attrs[key] = value; } }) } });
  return { get, event: (clientY, pointerId = 1) => ({ clientX: 100, clientY, pointerId, button: 0, preventDefault() {} }) };
}

test('the moving target finds one, two tangent, or three intersections on the curve', () => {
  const { get } = explorer();
  const handle = get('ivt-target');
  const key = key => handle.handlers.keydown({ key, preventDefault() {} });
  const dots = () => get('ivt-intersections').children;
  assert.equal(dots().length, 3);
  assert.equal(get('ivt-projections').children.length, 3);
  assert.equal(get('ivt-c-2').hidden, false);
  for (let i = 0; i < 20; i++) key('ArrowUp');
  assert.equal(dots().length, 2);
  key('ArrowUp');
  assert.equal(dots().length, 1);
  assert.equal(get('ivt-c-1').hidden, true);
  const x = (dots()[0].attrs.cx - 85) * 4.5 / 465 - 2.25;
  assert.ok(Math.abs(x ** 3 - 3 * x - 2.1) < 1e-9);
  key('End'); key('ArrowUp');
  assert.equal(get('ivt-height').value, '4.5');
  assert.equal(dots().length, 1);
  assert.equal(get('ivt-c-1').hidden, true);
  key('Home'); key('ArrowDown');
  assert.equal(get('ivt-height').value, '-4.5');
  assert.equal(dots().length, 1);
  assert.equal(get('ivt-c-1').hidden, true);
});

test('dragging the target respects scale, pointer identity, and cancellation', () => {
  const { get, event } = explorer();
  const handle = get('ivt-target');
  handle.handlers.pointerdown(event(100));
  handle.handlers.pointermove(event(75, 2));
  assert.equal(get('ivt-height').value, '0.0');
  handle.handlers.pointermove(event(75));
  assert.equal(get('ivt-height').value, '2.0');
  assert.equal(get('ivt-intersections').children.length, 2);
  handle.handlers.pointercancel(event(75));
  handle.handlers.pointermove(event(50));
  assert.equal(get('ivt-height').value, '2.0');
});

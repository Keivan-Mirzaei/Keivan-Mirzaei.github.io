import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../assets/js/learning-higher-derivatives.js', import.meta.url), 'utf8');
function explorer() {
  const elements = new Map();
  const make = () => ({ attrs: {}, children: [], handlers: {}, value: '', captured: null,
    setAttribute(k, v) { this.attrs[k] = v; }, removeAttribute(k) { delete this.attrs[k]; },
    appendChild(child) { this.children.push(child); }, addEventListener(k, fn) { this.handlers[k] = fn; },
    focus() {}, setPointerCapture(id) { this.captured = id; }, hasPointerCapture(id) { return this.captured === id; }, releasePointerCapture() { this.captured = null; },
    getScreenCTM() { return { inverse: () => ({}) }; },
    createSVGPoint() { return { x: 0, y: 0, matrixTransform() { return { x: (this.x - 10) * 2 }; } }; },
  });
  const get = id => { if (!elements.has(id)) elements.set(id, make()); return elements.get(id); };
  let frame = null;
  const document = { getElementById: get, createElementNS: () => make(), addEventListener() {} };
  vm.runInNewContext(source, { document, requestAnimationFrame: fn => { frame = fn; return 1; }, cancelAnimationFrame: () => { frame = null; } });
  const handle = model => get(`higher-${model}`).children.find(child => child.attrs.role === 'slider');
  return { get: id => get(`higher-${id}`), handle, tick: now => { const fn = frame; frame = null; fn?.(now); } };
}
test('linked graphs distinguish zero velocity from zero acceleration', () => {
  const { get, handle } = explorer();
  assert.equal(get('s').value, '3.38'); assert.equal(get('v').value, '−2.25'); assert.equal(get('a').value, '−3.00');
  const press = key => handle('position').handlers.keydown({ key, preventDefault() {} });
  for (let i = 0; i < 10; i++) press('ArrowRight');
  assert.equal(get('time').value, '2.00');
  assert.equal(get('cart').attrs.transform, 'translate(275 0)');
  assert.equal(get('v').value, '−3.00'); assert.equal(get('a').value, '0.00');
  for (let i = 0; i < 20; i++) press('ArrowRight');
  assert.equal(get('cart').attrs.transform, 'translate(60 0)');
  assert.equal(get('s').value, '0.00'); assert.equal(get('v').value, '0.00'); assert.equal(get('a').value, '6.00');
  assert.equal(handle('velocity').attrs['aria-valuenow'], 3);
  press('End'); press('ArrowRight'); assert.equal(get('time').value, '4.00');
  press('Home'); press('ArrowLeft'); assert.equal(get('time').value, '0.00');
});
test('dragging any graph updates all three and respects pointer cancellation', () => {
  const { get, handle } = explorer(), control = handle('acceleration');
  const event = (clientX, pointerId = 1) => ({ clientX, clientY: 50, pointerId, button: 0, preventDefault() {} });
  control.handlers.pointerdown(event(120.625));
  control.handlers.pointermove(event(147.5, 2)); assert.equal(get('time').value, '1.50');
  control.handlers.pointermove(event(147.5)); assert.equal(get('time').value, '2.00');
  assert.equal(handle('position').attrs['aria-valuenow'], 2);
  control.handlers.pointercancel(event(147.5));
  control.handlers.pointermove(event(174.375)); assert.equal(get('time').value, '2.00');
});

test('playback advances smoothly, pauses, stops at the end and replays', () => {
  const { get, handle, tick } = explorer();
  get('play').handlers.click(); assert.equal(get('play').textContent, 'Pause');
  tick(0); tick(16); tick(32);
  assert.equal(get('time').value, '1.53');
  get('play').handlers.click(); assert.equal(get('play').textContent, 'Play');
  tick(48); assert.equal(get('time').value, '1.53');
  handle('position').handlers.keydown({ key: 'End', preventDefault() {} });
  get('play').handlers.click(); assert.equal(get('time').value, '0.00');
  tick(100);
  for (let i = 1; i <= 41; i++) tick(100 + i * 100);
  assert.equal(get('time').value, '4.00'); assert.equal(get('play').textContent, 'Replay');
  get('play').handlers.click(); tick(5000); tick(5100);
  handle('position').handlers.keydown({ key: 'ArrowRight', preventDefault() {} });
  assert.equal(get('play').textContent, 'Play');
});

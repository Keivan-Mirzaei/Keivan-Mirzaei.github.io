import test from 'node:test';
import assert from 'node:assert/strict';
import { enableProblemNumberStrip } from '../assets/js/lib/problem-number-strip.mjs';
function fixture() {
  const handlers = {}, styles = {};
  let resize;
  globalThis.ResizeObserver = class { constructor(fn) { resize = fn; } observe() {} };
  const strip = { setPointerCapture() {}, scrollLeft: 0, scrollWidth: 700, clientWidth: 300, style: { setProperty: (name, value) => styles[name] = value }, addEventListener: (name, fn) => { handlers[name] = fn; } };
  const button = { offsetLeft: 0, offsetWidth: 40 };
  const reveal = enableProblemNumberStrip(strip, () => button);
  return { strip, button, reveal, styles, handlers, resize: () => resize() };
}
test('fades only the edges with more numbers offscreen', () => {
  const f = fixture(); f.reveal();
  assert.equal(f.styles['--fade-left'], '#000'); assert.equal(f.styles['--fade-right'], 'transparent');
  f.strip.scrollLeft = 400; f.handlers.scroll();
  assert.equal(f.styles['--fade-left'], 'transparent'); assert.equal(f.styles['--fade-right'], '#000');
});
test('navigation and resize reveal the active number clear of faded edges', () => {
  const f = fixture(); f.button.offsetLeft = 440; f.reveal(); assert.equal(f.strip.scrollLeft, 208);
  f.strip.clientWidth = 200; f.resize(); assert.equal(f.strip.scrollLeft, 308);
  f.button.offsetLeft = 0; f.reveal(); assert.equal(f.strip.scrollLeft, 0);
});
test('short rows have no fading at either edge', () => {
  const f = fixture(); f.strip.scrollWidth = 150; f.reveal();
  assert.equal(f.styles['--fade-left'], '#000'); assert.equal(f.styles['--fade-right'], '#000');
});

test('dragging the number strip scrolls without accidentally opening a problem', () => {
  const f = fixture();
  const pointer = (x, y) => ({ pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y, preventDefault() {} });
  f.handlers.pointerdown(pointer(200, 100)); f.handlers.pointermove(pointer(100, 105)); f.handlers.pointerup(pointer(100, 105));
  assert.equal(f.strip.scrollLeft, 100);
  let stopped = false;
  f.handlers.click({ preventDefault() {}, stopPropagation() { stopped = true; } });
  assert.equal(stopped, true);
  f.handlers.pointerdown(pointer(200, 100)); f.handlers.pointermove(pointer(195, 200)); f.handlers.pointerup(pointer(195, 200));
  assert.equal(f.strip.scrollLeft, 100);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { enableCardSwipe } from '../assets/js/lib/card-swipe.mjs';
function fixture() {
  const handlers = {};
  const card = { style: {}, classList: { add() {}, remove() {} }, setPointerCapture() {} };
  const target = { parentElement: card, scrollWidth: 100, clientWidth: 100, closest: selector => selector === '.card' ? card : null };
  const steps = [];
  enableCardSwipe({ addEventListener: (name, fn) => { handlers[name] = fn; } }, { selector: '.card', canStep: step => step === 1, onStep: step => steps.push(step) });
  const send = (name, x, y, extra = {}) => handlers[name]({ target, button: 0, isPrimary: true, pointerId: 1, clientX: x, clientY: y, preventDefault() {}, ...extra });
  return { send, steps, target, card };
}
test('horizontal swipe changes one problem and resets its drag feedback', () => {
  const f = fixture();
  f.send('pointerdown', 200, 100); f.send('pointermove', 100, 105); f.send('pointerup', 100, 105);
  assert.deepEqual(f.steps, [1]); assert.equal(f.card.style.transform, '');
});
test('scrolls, short drags, boundary swipes and cancelled gestures do not navigate', () => {
  for (const [x, y, cancel] of [[190, 200, false], [180, 100, false], [300, 100, false], [100, 100, true]]) {
    const f = fixture(); f.send('pointerdown', 200, 100); f.send('pointermove', x, y);
    if (cancel) f.send('pointercancel', x, y);
    f.send('pointerup', x, y); assert.deepEqual(f.steps, []);
  }
});
test('scrollable equations and unrelated pointers keep their own gestures', () => {
  const f = fixture(); f.target.scrollWidth = 300;
  f.send('pointerdown', 200, 100); f.send('pointermove', 100, 100); f.send('pointerup', 100, 100);
  assert.deepEqual(f.steps, []);
  f.target.scrollWidth = 100; f.send('pointerdown', 200, 100);
  f.send('pointermove', 100, 100, { pointerId: 2 }); f.send('pointerup', 100, 100, { pointerId: 2 });
  assert.deepEqual(f.steps, []);
});

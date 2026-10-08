import assert from 'node:assert/strict';
import test from 'node:test';
import { createDial } from '../assets/js/gadgets/dial.mjs';
import { createTimer, pauseTimer, remaining, reconcile, nextPhase, defaults } from '../assets/js/gadgets/model.mjs';

function fixture() {
  const display = { dataset: {} }, attributes = new Map();
  const ring = { style: {}, setAttribute: (name, value) => attributes.set(name, value) };
  return { display, ring, dial: createDial(display, ring), fraction: () => Number.parseFloat(attributes.get('stroke-dasharray')) };
}

test('a one-minute dial progresses smoothly, freezes on pause, and catches up after suspension', () => {
  const { display, dial, fraction } = fixture();
  const timer = createTimer('pomodoro', { ...defaults, focusMinutes: 1 }, 1000);
  dial.render(timer, remaining(timer, 1000)); assert.equal(fraction(), 1); assert.equal(display.dataset.dialMotion, 'still');
  dial.render(timer, remaining(timer, 2000)); assert.equal(fraction(), 59 / 60); assert.equal(display.dataset.dialMotion, 'smooth');
  const paused = pauseTimer(timer, 2500);
  dial.render(paused, remaining(paused, 2500)); assert.equal(display.dataset.dialMotion, 'still');
  dial.render(paused, remaining(paused, 900000)); assert.equal(fraction(), 58.5 / 60);
  dial.render(timer, remaining(timer, 30000)); assert.equal(fraction(), 31 / 60); assert.equal(display.dataset.dialMotion, 'still');
  dial.render(timer, remaining(timer, 31000)); assert.equal(display.dataset.dialMotion, 'smooth');
});

test('completed focus, a new break, and a stopped session have distinct correct dial states', () => {
  const { display, ring, dial, fraction } = fixture();
  const timer = createTimer('pomodoro', { ...defaults, focusMinutes: 1, breakMinutes: 5 }, 1000);
  dial.render(timer, remaining(timer, 1000));
  const completed = reconcile(timer, 61000);
  dial.render(completed, 0); assert.equal(fraction(), 0); assert.equal(ring.style.opacity, '0');
  const rest = nextPhase(completed, 62000);
  dial.render(rest, remaining(rest, 62000));
  assert.equal(display.dataset.phase, 'break'); assert.equal(fraction(), 1); assert.equal(ring.style.opacity, '1'); assert.equal(display.dataset.dialMotion, 'still');
  dial.render(null, 1500000);
  assert.equal(display.dataset.phase, 'focus'); assert.equal(fraction(), 1); assert.equal(display.dataset.dialMotion, 'still');
  dial.render(rest, -100); assert.equal(fraction(), 0);
  dial.render(rest, rest.duration + 100); assert.equal(fraction(), 1);
});

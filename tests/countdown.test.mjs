import test from 'node:test';
import assert from 'node:assert/strict';
import { createCountdown } from '../assets/js/gadgets/countdown.mjs';

function fixture(reduced = false) {
  const animations = [], motion = new EventTarget(); motion.matches = reduced;
  class Element {
    constructor() { this.ownerDocument = document; this.children = []; this.attributes = new Map(); this.textContent = ''; }
    get firstElementChild() { return this.children[0]; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    append(child) { child.parent = this; this.children.push(child); }
    replaceChildren(...children) { this.children = children; children.forEach(child => { child.parent = this; }); }
    remove() { this.parent.children = this.parent.children.filter(child => child !== this); }
    animate() {
      let resolve, reject;
      const animation = { cancelled: false, finished: new Promise((done, fail) => { resolve = done; reject = fail; }), complete() { resolve(); }, cancel() { this.cancelled = true; reject(new Error('cancelled')); } };
      animations.push(animation); return animation;
    }
  }
  const document = { defaultView: { matchMedia: () => motion }, createElement: () => new Element() };
  const element = new Element(), countdown = createCountdown(element);
  return { element, countdown, motion, animations };
}

test('changing only seconds leaves every digit slot stable, with no repeated animations or live announcements', async () => {
  const f = fixture(); f.countdown.render('01:00:02'); const slots = [...f.element.children];
  assert.equal(f.animations.length, 0); f.countdown.render('01:00:01', true);
  assert.deepEqual(f.element.children, slots); assert.equal(f.animations.length, 2);
  assert.equal(f.element.attributes.get('aria-label'), '01:00:01');
  assert.ok(f.element.children.every(slot => slot.attributes.get('aria-hidden') === 'true'));
  f.countdown.render('01:00:01', true); assert.equal(f.animations.length, 2);
  f.animations.forEach(animation => animation.complete()); await Promise.resolve(); await Promise.resolve();
  assert.ok(f.element.children.every(slot => slot.children.length === 1)); f.countdown.dispose();
});

test('reset, reduced motion, preference changes, and leaving the page release animated digits', async () => {
  const f = fixture(); f.countdown.render('00:59:59'); f.countdown.render('00:59:58', true);
  f.countdown.render('01:00:58'); assert.ok(f.animations.every(animation => animation.cancelled));
  f.motion.matches = true; f.countdown.render('00:59:59', true); assert.equal(f.animations.length, 2);
  f.motion.matches = false; f.countdown.render('00:59:58', true); assert.equal(f.animations.length, 4);
  f.motion.dispatchEvent(new Event('change')); assert.ok(f.animations.every(animation => animation.cancelled));
  f.countdown.render('00:59:57', true); f.countdown.dispose();
  assert.ok(f.animations.every(animation => animation.cancelled));
  assert.ok(f.element.children.every(slot => slot.children.length === 1)); await Promise.resolve();
});

test('dropping and restoring hours replaces the digit slots and cancels any previous transition', async () => {
  const f = fixture(); f.countdown.render('01:00:00');
  f.countdown.render('59:59', true); assert.equal(f.element.children.length, 5);
  assert.equal(f.animations.length, 0);
  f.countdown.render('59:58', true); assert.equal(f.animations.length, 2);
  f.countdown.render('01:00:00'); assert.equal(f.element.children.length, 8);
  assert.ok(f.animations.every(animation => animation.cancelled)); f.countdown.dispose(); await Promise.resolve();
});

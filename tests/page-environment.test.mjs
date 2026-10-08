import assert from 'node:assert/strict';
import test from 'node:test';
import { createPageEnvironment } from '../assets/js/lib/page-environment.mjs';

function setup() {
  const browser = new EventTarget(), owner = new EventTarget(), root = {};
  const timeouts = new Map(), intervals = new Map(), frames = new Map(), observers = [], media = new EventTarget();
  let next = 0;
  class Observer { constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); } disconnect() { this.disconnected = true; } }
  Object.assign(browser, { setTimeout(callback) { const id = ++next; timeouts.set(id, callback); return id; }, clearTimeout: id => timeouts.delete(id), setInterval(callback) { const id = ++next; intervals.set(id, callback); return id; }, clearInterval: id => intervals.delete(id), requestAnimationFrame(callback) { const id = ++next; frames.set(id, callback); return id; }, cancelAnimationFrame: id => frames.delete(id), ResizeObserver: Observer, IntersectionObserver: Observer, MutationObserver: Observer, matchMedia: () => media, CSS: { escape: id => id } });
  Object.assign(owner, { defaultView: browser, querySelector: () => 'whole-document', createElement() { assert.equal(this, owner); return 'created'; } });
  Object.assign(root, { ownerDocument: owner, querySelector: selector => selector, querySelectorAll: () => ['page-only'] });
  return { browser, owner, root, timeouts, intervals, frames, observers, media };
}

test('leaving a page releases listeners, observers and pending browser work once', () => {
  const fixture = setup(), page = createPageEnvironment(fixture.root); let calls = 0, cleanup = 0;
  page.window.addEventListener('resize', () => calls++);
  page.document.addEventListener('visibilitychange', () => calls++);
  page.window.matchMedia('reduce').addEventListener('change', () => calls++);
  const observer = new page.ResizeObserver(() => calls++);
  page.setTimeout(() => calls++, 10); page.setInterval(() => calls++, 10); page.requestAnimationFrame(() => calls++);
  page.add(() => cleanup++);
  fixture.browser.dispatchEvent(new Event('resize')); assert.equal(calls, 1);
  const late = [...fixture.timeouts.values()][0];
  page.dispose(); page.dispose();
  fixture.browser.dispatchEvent(new Event('resize')); fixture.owner.dispatchEvent(new Event('visibilitychange')); fixture.media.dispatchEvent(new Event('change')); observer.callback(); late();
  assert.equal(calls, 1); assert.equal(cleanup, 1); assert.equal(observer.disconnected, true);
  assert.equal(fixture.timeouts.size + fixture.intervals.size + fixture.frames.size, 0);
  page.add(() => cleanup++); assert.equal(cleanup, 2);
});

test('scoped queries find only incoming content and do not change global browser APIs', () => {
  const fixture = setup(), original = fixture.browser.setTimeout, page = createPageEnvironment(fixture.root);
  assert.equal(page.document.querySelector('#diagram'), '#diagram'); assert.deepEqual(page.document.querySelectorAll('anything'), ['page-only']);
  assert.equal(page.document.getElementById('diagram'), '#diagram'); assert.equal(page.document.createElement('div'), 'created');
  assert.equal(fixture.owner.querySelector(), 'whole-document'); assert.equal(fixture.browser.setTimeout, original);
  page.dispose();
});

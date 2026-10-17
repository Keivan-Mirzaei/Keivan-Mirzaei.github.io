import assert from 'node:assert/strict';
import test from 'node:test';
import { mountScrollHeader } from '../assets/js/lib/scroll-header.mjs';

function setup() {
  const environment = new EventTarget(), document = new EventTarget(), header = new EventTarget();
  const classes = new Set(), rootClasses = new Set();
  header.offsetHeight = 64;
  header.contains = node => node === header;
  header.classList = { remove: key => classes.delete(key), toggle: (key, active) => active ? classes.add(key) : classes.delete(key) };
  document.querySelector = () => header;
  document.documentElement = { scrollHeight: 2000, classList: { contains: key => rootClasses.has(key) } };
  document.activeElement = null;
  Object.assign(environment, { document, scrollY: 0, innerHeight: 700,
    requestAnimationFrame(callback) { this.frame = callback; return 1; }, cancelAnimationFrame() { this.frame = null; } });
  const dispose = mountScrollHeader(environment);
  const scroll = y => { environment.scrollY = y; environment.dispatchEvent(new Event('scroll')); const frame = environment.frame; environment.frame = null; frame?.(); };
  return { environment, document, header, rootClasses, scroll, dispose, hidden: () => classes.has('topbar-hidden') };
}

test('the header hides downward and returns upward without reacting to tiny reversals', () => {
  const app = setup();
  app.scroll(60); assert.equal(app.hidden(), false);
  app.scroll(200); assert.equal(app.hidden(), true);
  app.scroll(197); assert.equal(app.hidden(), true);
  app.scroll(191); assert.equal(app.hidden(), false);
  app.scroll(195); assert.equal(app.hidden(), false);
  app.scroll(205); assert.equal(app.hidden(), true);
  app.scroll(0); assert.equal(app.hidden(), false);
});

test('keyboard focus and the mobile sidebar keep the header available', () => {
  const app = setup(); app.scroll(200);
  app.document.activeElement = app.header; app.header.dispatchEvent(new Event('focusin'));
  assert.equal(app.hidden(), false);
  app.scroll(300); assert.equal(app.hidden(), false);
  app.document.activeElement = null; app.rootClasses.add('sidebar-open');
  app.scroll(400); assert.equal(app.hidden(), false);
});

test('overscroll at the bottom does not count as an upward gesture', () => {
  const app = setup();
  app.scroll(1300); app.scroll(1360); app.scroll(1300);
  assert.equal(app.hidden(), true);
  app.scroll(1290); assert.equal(app.hidden(), false);
});

test('page changes reveal the header and disposal releases its listeners', () => {
  const app = setup(); app.scroll(200);
  app.document.dispatchEvent(new Event('site:page')); assert.equal(app.hidden(), false);
  app.scroll(300); assert.equal(app.hidden(), true);
  app.dispose(); assert.equal(app.hidden(), false);
  app.scroll(500); assert.equal(app.hidden(), false);
});

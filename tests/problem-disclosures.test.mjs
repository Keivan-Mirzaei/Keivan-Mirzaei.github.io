import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/problem-disclosures.js', import.meta.url), 'utf8');

function setup() {
  const groups = Array.from({ length: 2 }, () => ({
    handlers: {},
    addEventListener(name, listener) { this.handlers[name] = listener; },
  }));
  vm.runInNewContext(source, { document: { querySelectorAll: () => groups } });
  const row = parentElement => ({
    parentElement,
    open: true,
    summary: { focused: false, focus() { this.focused = true; } },
    querySelector(selector) {
      assert.equal(selector, 'summary');
      return this.summary;
    },
  });
  const event = (targetRow, changes = {}) => ({
    key: 'Escape',
    defaultPrevented: false,
    target: { closest: () => targetRow?.open ? targetRow : null },
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this.stopped = true; },
    ...changes,
  });
  return { groups, row, event };
}

test('Escape closes only the focused article row and returns focus to its label', () => {
  const { groups, row, event } = setup();
  const focused = row(groups[0]);
  const neighbour = row(groups[0]);
  const otherArticle = row(groups[1]);
  const key = event(focused);
  groups[0].handlers.keydown(key);
  assert.equal(focused.open, false);
  assert.equal(focused.summary.focused, true);
  assert.equal(neighbour.open, true);
  assert.equal(otherArticle.open, true);
  assert.equal(key.defaultPrevented, true);
  assert.equal(key.stopped, true);
});

test('other keys, handled events, closed rows, and nested widget panels are untouched', () => {
  const { groups, row, event } = setup();
  const target = row(groups[0]);
  groups[0].handlers.keydown(event(target, { key: 'Enter' }));
  groups[0].handlers.keydown(event(target, { defaultPrevented: true }));
  assert.equal(target.open, true);
  const nested = row({});
  groups[0].handlers.keydown(event(nested));
  assert.equal(nested.open, true);
  target.open = false;
  groups[0].handlers.keydown(event(target));
  assert.equal(target.summary.focused, false);
});

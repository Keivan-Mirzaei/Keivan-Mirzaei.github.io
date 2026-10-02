import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeThreeCups } from '../assets/js/widgets/three-cups.mjs';

class Control {
  constructor() {
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.disabled = true;
    this.textContent = '';
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  click() { if (!this.disabled) this.listeners.get('click')?.(); }
  focus() { this.focused = true; }
}

function fixture() {
  const cups = Array.from({ length: 3 }, () => {
    const cup = new Control();
    cup.orientation = new Control();
    cup.selection = new Control();
    cup.querySelector = selector => selector === '[data-cup-orientation]' ? cup.orientation : cup.selection;
    return cup;
  });
  const fields = Object.fromEntries(['count', 'status', 'flip', 'reset'].map(name => [name, new Control()]));
  const widget = {
    querySelectorAll: () => cups,
    querySelector: selector => fields[selector.match(/data-cups-([^\]]+)/)[1]],
  };
  initializeThreeCups(widget);
  const state = () => cups.map(cup => cup.dataset.facing === 'up');
  const selected = () => cups.flatMap((cup, index) => cup.attributes.get('aria-pressed') === 'true' ? [index] : []);
  const move = pair => { pair.forEach(index => cups[index].click()); fields.flip.click(); };
  return { cups, fields, state, selected, move };
}

test('the puzzle starts down, allows deselection, and requires two distinct cups', () => {
  const f = fixture();
  assert.deepEqual(f.state(), [false, false, false]);
  assert.equal(f.fields.flip.disabled, true);
  assert.equal(f.fields.count.textContent, '0 moves · 0 of 3 up');
  f.cups[0].click();
  assert.deepEqual(f.selected(), [0]);
  assert.equal(f.fields.flip.disabled, true);
  f.cups[0].click();
  assert.deepEqual(f.selected(), []);
  f.cups[0].click(); f.cups[1].click(); f.cups[2].click();
  assert.deepEqual(f.selected(), [0, 1]);
  assert.deepEqual(f.state(), [false, false, false]);
  assert.equal(f.fields.flip.disabled, false);
  assert.match(f.fields.status.textContent, /Deselect a cup/);
  f.cups[0].click(); f.cups[2].click();
  assert.deepEqual(f.selected(), [1, 2]);
});

test('a move flips only the selected pair, clears selection, and updates accessible labels', () => {
  const f = fixture();
  f.move([2, 0]);
  assert.deepEqual(f.state(), [true, false, true]);
  assert.deepEqual(f.selected(), []);
  assert.equal(f.fields.count.textContent, '1 move · 2 of 3 up');
  assert.equal(f.fields.flip.disabled, true);
  assert.equal(f.cups[0].attributes.get('aria-label'), 'Cup 1, facing up, not selected');
  assert.equal(f.cups[1].attributes.get('aria-label'), 'Cup 2, facing down, not selected');
  assert.equal(f.cups[2].orientation.textContent, 'Facing up');
  assert.match(f.fields.status.textContent, /Cups 1 and 3 flipped/);
  assert.equal(f.cups[0].focused, true);
  f.fields.flip.click();
  assert.equal(f.fields.count.textContent, '1 move · 2 of 3 up');
});

test('all legal transitions among reachable states preserve even parity', () => {
  const routes = [[], [[0, 1]], [[0, 2]], [[1, 2]]];
  const pairs = [[0, 1], [0, 2], [1, 2]];
  const seen = new Set();
  for (const route of routes) {
    for (const pair of pairs) {
      const f = fixture();
      route.forEach(f.move);
      const before = f.state();
      f.move(pair);
      const after = f.state();
      assert.equal(after.filter(Boolean).length % 2, 0);
      assert.deepEqual(after, before.map((value, index) => pair.includes(index) ? !value : value));
      assert.deepEqual(f.selected(), []);
      seen.add(after.map(Number).join(''));
    }
  }
  assert.deepEqual([...seen].sort(), ['000', '011', '101', '110']);
});

test('reset clears orientation, an unfinished selection, and the move count', () => {
  const f = fixture();
  f.move([0, 1]); f.move([1, 2]); f.cups[2].click();
  f.fields.reset.click();
  assert.deepEqual(f.state(), [false, false, false]);
  assert.deepEqual(f.selected(), []);
  assert.equal(f.fields.count.textContent, '0 moves · 0 of 3 up');
  assert.equal(f.fields.flip.disabled, true);
  assert.equal(f.cups[0].focused, true);
});

test('multiple instances keep separate cup states and selections', () => {
  const first = fixture();
  const second = fixture();
  first.move([0, 2]); second.cups[1].click();
  assert.deepEqual(first.state(), [true, false, true]);
  assert.deepEqual(first.selected(), []);
  assert.deepEqual(second.state(), [false, false, false]);
  assert.deepEqual(second.selected(), [1]);
  assert.equal(second.fields.count.textContent, '0 moves · 0 of 3 up');
});

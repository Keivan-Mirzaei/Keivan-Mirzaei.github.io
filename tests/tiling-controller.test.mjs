import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeTilingGame } from '../assets/js/widgets/tiling.mjs';

// Native-button fixture: verify state, anchor coordinates and focus without a browser dependency.
class Element {
  constructor(properties = {}) {
    Object.assign(this, { tagName: 'DIV', disabled: false, hidden: false, textContent: '', dataset: {}, listeners: new Map(), attributes: new Map(), parent: null }, properties);
    this.classes = new Set((this.className || '').split(' ').filter(Boolean));
    this.classList = {
      add: (...names) => names.forEach(name => this.classes.add(name)),
      remove: (...names) => names.forEach(name => this.classes.delete(name)),
      toggle: (name, force) => { if (force ?? !this.classes.has(name)) this.classes.add(name); else this.classes.delete(name); },
    };
    this.style = { setProperty() {}, removeProperty() {} };
  }
  addEventListener(name, callback) { if (!this.listeners.has(name)) this.listeners.set(name, []); this.listeners.get(name).push(callback); }
  emit(name, detail = {}) { this.listeners.get(name)?.forEach(callback => callback({ target: this, preventDefault() {}, ...detail })); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  focus() { document.activeElement = this; }
  append(child) { this.children ||= []; this.children.push(child); child.parent = this; }
  remove() { if (this.parent?.children) this.parent.children = this.parent.children.filter(child => child !== this); }
  contains(element) { while (element) { if (element === this) return true; element = element.parent; } return false; }
  closest(selector) {
    const button = selector.startsWith('button');
    if (button && this.tagName !== 'BUTTON') return null;
    const property = selector.match(/data-tiling-(cell|occupant|piece)/)?.[1];
    return property && this.dataset[`tiling${property[0].toUpperCase()}${property.slice(1)}`] !== undefined ? this : null;
  }
}
class Holder extends Element {
  set innerHTML(markup) {
    if (this.contains(document.activeElement)) document.activeElement = document.body;
    this.children = [...markup.matchAll(/<(button|span)\b([^>]*)>/g)].flatMap(([, tag, attributes]) => {
      const key = attributes.match(/data-tiling-(cell|piece)="([^"]*)"/);
      if (!key) return [];
      const property = `tiling${key[1][0].toUpperCase()}${key[1].slice(1)}`;
      const dataset = { [property]: key[2] }, occupant = attributes.match(/data-tiling-occupant="([^"]*)"/);
      if (occupant) dataset.tilingOccupant = occupant[1];
      return new Element({ tagName: tag.toUpperCase(), className: attributes.match(/class="([^"]*)"/)?.[1], dataset, parent: this, tabIndex: Number(attributes.match(/tabindex="(-?\d+)"/)?.[1] ?? 0) });
    });
  }
  querySelectorAll(selector) {
    if (selector === 'button') return this.children.filter(child => child.tagName === 'BUTTON');
    if (selector.startsWith('.')) return this.children.filter(child => selector.split(', ').some(name => child.classes.has(name.slice(1))));
    return this.children;
  }
  querySelector(selector) {
    if (selector === 'button') return this.querySelectorAll('button')[0];
    const key = selector.match(/data-tiling-(cell|piece)="([^"]*)"/);
    const property = `tiling${key[1][0].toUpperCase()}${key[1].slice(1)}`;
    return this.children.find(child => child.dataset[property] === key[2] && (!selector.startsWith('button') || child.tagName === 'BUTTON'));
  }
}
function fixture() {
  globalThis.document = { activeElement: null, body: new Element() };
  const root = new Element();
  const fields = Object.fromEntries(['challenge', 'challenge-label', 'name', 'progress', 'instruction', 'tray-count', 'selected', 'selected-label', 'selected-shape', 'rotate', 'flip', 'remove', 'undo', 'hint', 'next', 'reset', 'status'].map(name => [name, new Element({ parent: root })]));
  fields.challenge.value = '1'; fields.challenge.tagName = 'INPUT';
  fields.board = new Holder({ parent: root }); fields.tray = new Holder({ parent: root });
  root.querySelector = selector => fields[selector.match(/data-tiling-([^\]]+)/)[1]];
  root.setPointerCapture = () => {}; root.hasPointerCapture = () => false; root.releasePointerCapture = () => {};
  const controller = initializeTilingGame(root);
  const click = (holder, selector) => {
    const element = holder.querySelector(selector); element.focus(); holder.emit('click', { target: element });
  };
  return {
    fields, root, controller,
    tile: id => click(fields.tray, `[data-tiling-piece="${id}"]`),
    cell: (x, y) => click(fields.board, `[data-tiling-cell="${x},${y}"]`),
    action: name => { fields[name].focus(); fields[name].emit('click'); },
  };
}

test('a rotated tile uses its marked occupied square as anchor even when its bounding-box corner is empty', () => {
  const f = fixture();
  f.tile('A'); f.action('rotate'); f.action('rotate');
  f.cell(1, 0);
  assert.equal(f.controller.game.filled, 3);
  assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0, rotation: 2, flipped: false });
  assert.equal(document.activeElement.dataset.tilingCell, '1,0');
  f.action('undo');
  assert.equal(f.controller.game.filled, 0);
  assert.equal(document.activeElement.tagName, 'BUTTON');
  assert.equal(document.activeElement.dataset.tilingCell, '0,0');
});

test('invalid taps keep the selected tile and announce the rule without altering the floor', () => {
  const f = fixture();
  f.tile('A'); f.cell(2, 0);
  assert.equal(f.controller.game.filled, 0);
  assert.equal(f.controller.selected, 'A');
  assert.match(f.fields.status.textContent, /missing square/);
  f.cell(0, 0); f.tile('B'); f.cell(0, 0);
  assert.equal(f.controller.game.filled, 3);
  assert.equal(f.controller.selected, 'B');
  assert.match(f.fields.status.textContent, /cannot overlap/);
});

test('hint outlines a valid move, places only on the second click, then completes a whole floor', () => {
  const f = fixture();
  f.action('hint');
  assert.equal(f.fields.hint.textContent, 'Place hint');
  assert.equal(f.controller.game.filled, 0);
  assert.match(f.fields.status.textContent, /outlined squares/);
  f.action('hint');
  assert.equal(f.fields.hint.textContent, 'Hint');
  assert.ok(f.controller.game.filled > 0);
  for (let count = 0; count < 3; count++) { f.action('hint'); f.action('hint'); }
  assert.equal(f.controller.game.solved, true);
  assert.equal(f.fields.progress.textContent, '13 / 13 squares');
  assert.match(f.fields.status.textContent, /Floor complete/);
  assert.equal(f.fields.next.hidden, false);
  assert.equal(document.activeElement, f.fields.next);
  f.action('next');
  assert.equal(f.controller.game.level.id, 2);
  assert.equal(f.controller.game.filled, 0);
  assert.equal(document.activeElement.dataset.tilingCell, '0,0');
});

test('returning a tile moves focus to its tray button and undo recovers completion', () => {
  const f = fixture();
  for (let count = 0; count < 4; count++) { f.action('hint'); f.action('hint'); }
  f.tile('A'); f.action('remove');
  assert.equal(f.controller.game.solved, false);
  assert.equal(f.fields.remove.disabled, true);
  assert.equal(document.activeElement.dataset.tilingPiece, 'A');
  f.action('undo');
  assert.equal(f.controller.game.solved, true);
});

test('slider input previews the challenge before change resets the active floor', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0);
  f.fields.challenge.value = '6'; f.fields.challenge.emit('input');
  assert.equal(f.fields['challenge-label'].textContent, '6 of 6');
  assert.equal(f.controller.game.level.id, 1);
  assert.equal(f.controller.game.filled, 3);
  f.fields.challenge.emit('change');
  assert.equal(f.controller.game.level.id, 6);
  assert.equal(f.controller.game.filled, 0);
  assert.equal(f.fields.tray.children.length, 8);
});

test('arrow keys skip missing squares and rotation shortcuts keep a board square focused', () => {
  const f = fixture();
  f.tile('C');
  const cell = f.fields.board.querySelector('[data-tiling-cell="1,3"]'); cell.focus();
  f.root.emit('keydown', { target: cell, key: 'ArrowLeft' });
  assert.equal(document.activeElement, cell);
  f.root.emit('keydown', { target: cell, key: 'ArrowRight' });
  assert.equal(document.activeElement.dataset.tilingCell, '2,3');
  f.root.emit('keydown', { target: document.activeElement, key: 'r' });
  assert.match(f.fields.status.textContent, /rotated/);
  assert.equal(document.activeElement.dataset.tilingCell, '2,3');
  f.root.emit('keydown', { target: document.activeElement, key: 'Escape' });
  assert.equal(f.controller.selected, null);
});


test('dragging a selected rotated tray tile preserves its previewed orientation and clears the ghost', () => {
  const f = fixture();
  f.tile('A'); f.action('rotate'); f.action('rotate');
  document.createElement = () => new Element();
  document.elementFromPoint = () => f.fields.board.querySelector('[data-tiling-cell="1,0"]');
  const tile = f.fields.tray.querySelector('[data-tiling-piece="A"]');
  f.root.emit('pointerdown', { target: tile, button: 0, isPrimary: true, pointerId: 1, clientX: 0, clientY: 0 });
  f.root.emit('pointermove', { pointerId: 1, clientX: 20, clientY: 20 });
  f.root.emit('pointerup', { pointerId: 1 });
  assert.equal(f.controller.game.filled, 3);
  assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0, rotation: 2, flipped: false });
  assert.equal(document.body.children.length, 0);
  assert.equal(f.root.classes.has('is-dragging'), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeTilingGame } from '../assets/js/widgets/tiling.mjs';
import { CATALOGUE } from '../assets/js/lib/tiling-catalogue.mjs';

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
    this.markup = markup;
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
function fixture(storage, catalogue) {
  globalThis.document = { activeElement: null, body: new Element() };
  const root = new Element();
  const fields = Object.fromEntries(['challenge', 'challenge-label', 'name', 'progress', 'instruction', 'tray-count', 'selected', 'selected-label', 'selected-shape', 'remove', 'undo', 'redo', 'hint', 'refresh', 'reset', 'status', 'picker', 'jump', 'number', 'number-slider', 'number-label', 'open', 'completed', 'level-detail', 'moves', 'hint-label', 'use-hint', 'next', 'scroll-tiles', 'outline'].map(name => [name, new Element({ parent: root })]));
  fields.challenge.value = '1'; fields.challenge.tagName = 'INPUT';
  fields.board = new Holder({ parent: root }); fields.tray = new Holder({ parent: root });
  root.querySelector = selector => fields[selector.match(/data-tiling-([^\]]+)/)?.[1]];
  root.querySelectorAll = () => [];
  root.setPointerCapture = () => {}; root.hasPointerCapture = () => false; root.releasePointerCapture = () => {};
  const controller = initializeTilingGame(root, storage, catalogue);
  const click = (holder, selector) => {
    const element = holder.querySelector(selector); element.focus(); holder.emit('click', { target: element });
  };
  return {
    fields, root, controller,
    tile: id => click(fields.tray, `[data-tiling-piece="${id}"]`),
    cell: (x, y) => click(fields.board, `[data-tiling-cell="${x},${y}"]`),
    open: number => { fields.number.value = String(number); fields.jump.emit('submit'); },
    action: name => { fields[name].focus(); fields[name].emit('click'); },
  };
}

test('placing a copy uses the anchor and undo restores its quantity and board focus', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0);
  assert.equal(f.controller.game.filled, 3);
  assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0 });
  assert.equal(document.activeElement.dataset.tilingCell, '0,0');
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
  f.cell(0, 0); f.tile('B'); f.cell(2, 0); f.tile('A'); f.cell(1, 1);
  assert.equal(f.controller.game.filled, 6);
  assert.equal(f.controller.selected, 'D');
  assert.match(f.fields.status.textContent, /cannot overlap/);
});

test('Hint can be hidden without a placement and Return tile only appears for a placed selection', () => {
  const f = fixture();
  assert.equal(f.fields.remove.hidden, true);
  f.action('hint'); assert.equal(f.fields['use-hint'].hidden, false);
  f.action('hint'); assert.equal(f.fields['use-hint'].hidden, true);
  assert.equal(f.controller.game.filled, 0);
  assert.equal(f.fields.board.children.some(cell => cell.classes.has('is-preview')), false);
  f.tile('A'); f.cell(0, 0); f.cell(0, 0);
  assert.equal(f.fields.remove.hidden, false);
  f.action('remove'); assert.equal(f.fields.remove.hidden, true);
});

test('Reset and Shuffle undo from their buttons to the prior placements and puzzle', () => {
  const f = fixture(); f.tile('A'); f.cell(0, 0);
  f.action('reset'); assert.equal(f.controller.game.filled, 0);
  f.action('undo'); assert.deepEqual(f.controller.game.placements, { A: { x: 0, y: 0 } });
  f.action('refresh'); assert.notEqual(f.controller.game.level.id, 1);
  f.action('undo'); assert.equal(f.controller.game.level.id, 1);
  assert.deepEqual(f.controller.game.placements, { A: { x: 0, y: 0 } });
});

test('hint outlines a valid move and Place hint applies it before completing a whole floor', () => {
  const f = fixture();
  f.action('hint');
  assert.equal(f.fields['hint-label'].textContent, 'Hide hint');
  assert.equal(f.controller.game.filled, 0);
  assert.match(f.fields.status.textContent, /outlined placement/);
  f.action('use-hint');
  assert.equal(f.fields['hint-label'].textContent, 'Hint');
  assert.ok(f.controller.game.filled > 0);
  for (let count = 0; count < 3; count++) { f.action('hint'); f.action('use-hint'); }
  assert.equal(f.controller.game.solved, true);
  assert.equal(f.fields.progress.textContent, '13 / 13 filled');
  assert.match(f.fields.status.textContent, /perfect fit/);
  assert.equal(f.fields.refresh.disabled, false);
  assert.equal(document.activeElement, f.fields.refresh);
  f.action('refresh');
  assert.equal(f.controller.game.level.difficulty, 0);
  assert.match(f.fields.name.textContent, /^Puzzle \d+ \/ 1000$/);
  assert.equal(f.controller.game.filled, 0);
  assert.equal(document.activeElement, f.fields.refresh);
});

test('returning a tile moves focus to its tray button and undo recovers completion', () => {
  const f = fixture();
  for (let count = 0; count < 4; count++) { f.action('hint'); f.action('use-hint'); }
  f.tile('A'); f.action('remove');
  assert.equal(f.controller.game.solved, false);
  assert.equal(f.fields.remove.disabled, true);
  assert.equal(document.activeElement.dataset.tilingPiece, 'A');
  f.action('undo');
  assert.equal(f.controller.game.solved, true);
});

test('slider input previews difficulty before committing and returning restores the earlier floor', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0);
  f.fields.challenge.value = '4'; f.fields.challenge.emit('input');
  assert.equal(f.fields['challenge-label'].textContent, 'Expert');
  assert.equal(f.controller.game.level.id, 1);
  assert.equal(f.controller.game.filled, 3);
  f.fields.challenge.emit('change');
  assert.equal(f.controller.game.level.difficulty, 3);
  assert.equal(f.controller.game.filled, 0);
  assert.equal(f.fields.tray.children.length, f.controller.game.level.types.length);
  f.fields.challenge.value = '1'; f.fields.challenge.emit('change');
  assert.equal(f.controller.game.filled, 3);
  assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0 });
});

test('arrow keys skip missing squares and unsupported rotation keys leave the selection unchanged', () => {
  const f = fixture();
  f.tile('C');
  const cell = f.fields.board.querySelector('[data-tiling-cell="1,3"]'); cell.focus();
  f.root.emit('keydown', { target: cell, key: 'ArrowLeft' });
  assert.equal(document.activeElement, cell);
  f.root.emit('keydown', { target: cell, key: 'ArrowRight' });
  assert.equal(document.activeElement.dataset.tilingCell, '2,3');
  f.root.emit('keydown', { target: document.activeElement, key: 'r' });
  f.root.emit('keydown', { target: document.activeElement, key: 'f' });
  assert.equal(f.controller.selected, 'C');
  assert.doesNotMatch(f.fields.status.textContent, /rotated|flipped/);
  assert.equal(document.activeElement.dataset.tilingCell, '2,3');
  f.root.emit('keydown', { target: document.activeElement, key: 'Escape' });
  assert.equal(f.controller.selected, null);
});


test('dragging a tray copy preserves its fixed orientation and clears the ghost', () => {
  const f = fixture();
  f.tile('A');
  document.createElement = () => new Element();
  document.elementFromPoint = () => f.fields.board.querySelector('[data-tiling-cell="0,0"]');
  const tile = f.fields.tray.querySelector('[data-tiling-piece="A"]');
  f.root.emit('pointerdown', { target: tile, button: 0, isPrimary: true, pointerId: 1, clientX: 0, clientY: 0 });
  f.root.emit('pointermove', { pointerId: 1, clientX: 20, clientY: 20 });
  f.root.emit('pointerup', { pointerId: 1 });
  assert.equal(f.controller.game.filled, 3);
  assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0 });
  assert.equal(document.body.children.length, 0);
  assert.equal(f.root.classes.has('is-dragging'), false);
});

test('repeated shapes share a tray card and placing or undoing updates the remaining copies', () => {
  const f = fixture();
  assert.equal(f.fields.tray.children.length, 3);
  assert.match(f.fields.tray.markup, /2 needed, 2 left/);
  f.tile('A'); f.cell(0, 0);
  assert.equal(f.controller.selected, 'D');
  assert.match(f.fields.tray.markup, /2 needed, 1 left/);
  f.cell(2, 2);
  assert.match(f.fields.tray.markup, /2 needed, 0 left/);
  f.action('undo');
  assert.deepEqual(f.controller.game.placements, { A: { x: 0, y: 0 } });
  assert.match(f.fields.tray.markup, /2 needed, 1 left/);
});

test('two quick taps return a placed copy and undo restores it', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0);
  f.cell(0, 0);
  assert.equal(f.controller.game.filled, 3);
  f.cell(1, 0);
  assert.equal(f.controller.game.filled, 0);
  assert.match(f.fields.tray.markup, /2 needed, 2 left/);
  assert.match(f.fields.status.textContent, /returned/);
  f.action('undo');
  assert.equal(f.controller.game.filled, 3);
});

function dragCopy(f, x, y, target) {
  document.createElement = () => new Element();
  document.elementFromPoint = () => target();
  const cell = f.fields.board.querySelector(`[data-tiling-cell="${x},${y}"]`);
  f.root.emit('pointerdown', { target: cell, button: 0, isPrimary: true, pointerId: 7, clientX: 0, clientY: 0 });
  f.root.emit('pointermove', { pointerId: 7, clientX: 30, clientY: 30 });
}

test('dragging a placed copy off the floor returns it as one undoable move', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0);
  dragCopy(f, 0, 0, () => null);
  f.root.emit('pointerup', { pointerId: 7 });
  assert.equal(f.controller.game.filled, 0);
  assert.equal(f.controller.game.moves, 2);
  assert.equal(document.body.children.length, 0);
  f.action('undo');
  assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0 });
  assert.equal(f.controller.game.moves, 1);
});

test('dragging from a non-anchor square keeps that grabbed square under the pointer', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0);
  dragCopy(f, 1, 0, () => f.fields.board.querySelector('[data-tiling-cell="2,2"]'));
  f.root.emit('pointerup', { pointerId: 7 });
  assert.deepEqual(f.controller.game.placements.A, { x: 1, y: 2 });
  assert.equal(f.controller.game.filled, 3);
});

test('a cancelled drag leaves the copy and inventory unchanged', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0);
  dragCopy(f, 0, 0, () => null);
  f.root.emit('pointercancel');
  assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0 });
  assert.equal(f.controller.game.moves, 1);
  assert.equal(document.body.children.length, 0);
  assert.match(f.fields.tray.markup, /2 needed, 1 left/);
});

test('redo restores repeated copies and removal, while a new placement clears it', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0); f.cell(2, 2);
  const before = f.controller.game.placements;
  f.action('undo');
  assert.equal(f.fields.redo.disabled, false);
  f.action('redo');
  assert.deepEqual(f.controller.game.placements, before);
  assert.match(f.fields.tray.markup, /2 needed, 0 left/);
  assert.equal(f.fields.redo.disabled, true);
  f.cell(0, 0); f.action('remove'); f.action('undo'); f.action('redo');
  assert.equal(f.controller.game.placements.A, undefined);
  assert.match(f.fields.tray.markup, /2 needed, 1 left/);
  f.action('undo'); f.tile('B'); f.cell(2, 0);
  assert.equal(f.fields.redo.disabled, true);
});

function memoryStorage() {
  let value = null;
  return { read: () => structuredClone(value), save: next => { value = structuredClone(next); }, setSnapshotProvider() {} };
}

test('switching tray layouts preserves selection and progress, and the preference survives Reset, Shuffle and reopening', () => {
  const storage = memoryStorage(); let f = fixture(storage);
  assert.equal(f.root.dataset.trayLayout, 'scroll');
  f.tile('A'); f.cell(0, 0);
  const selected = f.controller.selected, placed = f.controller.game.placements;
  f.fields['scroll-tiles'].checked = false; f.fields['scroll-tiles'].emit('change');
  assert.equal(f.root.dataset.trayLayout, 'grid');
  assert.equal(f.controller.selected, selected); assert.deepEqual(f.controller.game.placements, placed);
  f.action('undo'); assert.equal(f.controller.game.filled, 0);
  f.action('redo'); f.action('reset'); f.action('undo'); assert.deepEqual(f.controller.game.placements, placed);
  f.action('refresh'); f.action('undo');
  f = fixture(storage); assert.equal(f.root.dataset.trayLayout, 'grid');
  assert.deepEqual(f.controller.game.placements, placed);
});

test('a horizontal touch swipe in the scrolling tray does not start a tile drag', () => {
  const f = fixture(); let captures = 0;
  f.root.setPointerCapture = () => captures++;
  const tile = f.fields.tray.querySelector('[data-tiling-piece="A"]');
  f.root.emit('pointerdown', { target: tile, button: 0, isPrimary: true, pointerType: 'touch', pointerId: 2, clientX: 0, clientY: 0 });
  f.root.emit('pointermove', { pointerType: 'touch', pointerId: 2, clientX: 24, clientY: 2 });
  f.root.emit('pointerup', { pointerType: 'touch', pointerId: 2 });
  assert.equal(captures, 0); assert.equal(f.controller.game.filled, 0);
  assert.equal(f.root.classes.has('is-dragging'), false);
});

test('refresh keeps difficulty and tile budget, changes the arrangement, and restart keeps that arrangement', () => {
  const f = fixture();
  for (let index = 0; index < 4; index++) {
    f.fields.challenge.value = String(index + 1); f.fields.challenge.emit('change');
    for (let count = 0; count < 12; count++) {
      const previous = JSON.stringify(f.controller.game.level);
      const before = f.controller.game.level;
      f.action('refresh');
      const after = f.controller.game.level;
      assert.equal(after.difficulty, index);
      assert.equal(after.width, before.width); assert.equal(after.height, before.height);
      assert.equal(after.holes.length, before.holes.length);
      assert.deepEqual(after.pieces.map(p => p.cells.length).sort(), before.pieces.map(p => p.cells.length).sort());
      assert.notEqual(JSON.stringify(after), previous);
      const seed = after.seed;
      f.action('hint'); f.action('use-hint'); f.action('reset');
      assert.equal(f.controller.game.level.seed, seed); assert.equal(f.controller.game.filled, 0);
    }
  }
});

test('reopening restores the generated floor, selected difficulty, placements and undo/redo', () => {
  const storage = memoryStorage(); let f = fixture(storage);
  f.fields.challenge.value = '3'; f.fields.challenge.emit('change'); f.action('refresh');
  const level = f.controller.game.level;
  f.action('hint'); f.action('use-hint'); f.action('hint'); f.action('use-hint'); f.action('undo');
  const placed = f.controller.game.placements;
  f = fixture(storage);
  assert.equal(f.fields.challenge.value, '3'); assert.equal(f.fields['challenge-label'].textContent, 'Hard');
  assert.deepEqual(f.controller.game.level, level); assert.deepEqual(f.controller.game.placements, placed);
  assert.equal(f.fields.redo.disabled, false); f.action('redo'); assert.equal(Object.keys(f.controller.game.placements).length, 2);
  f.action('undo'); f.action('undo'); assert.equal(f.controller.game.filled, 0);
});

test('solving then shuffling skips completion records, while a puzzle number explicitly allows replay', () => {
  const storage = memoryStorage(); let f = fixture(storage);
  const original = f.controller.game.level;
  for (let count = 0; count < 4; count++) { f.action('hint'); f.action('use-hint'); }
  assert.equal(f.fields.name.textContent, 'Puzzle 1 / 1000 ✓');
  assert.equal(f.fields.completed.textContent, '1 / 1000 Easy puzzles solved');
  f.action('undo'); f.action('refresh');
  assert.notEqual(f.controller.game.level.id, 1);
  f = fixture(storage); assert.notEqual(f.controller.game.level.id, 1);
  f.open(1); assert.deepEqual(f.controller.game.level, original);
  assert.equal(f.controller.game.filled, 0);
  assert.equal(f.fields.completed.textContent, '1 / 1000 Easy puzzles solved');
  assert.equal(document.activeElement, f.fields.name);
});

test('the final puzzle displays completion, disables shuffle and keeps numbered replays available', () => {
  const catalogue = CATALOGUE.map(rows => rows.slice(0, 3)), f = fixture(memoryStorage(), catalogue);
  for (let number = 1; number <= 3; number++) {
    f.open(number);
    for (let count = 0; count < f.controller.game.level.pieces.length; count++) { f.action('hint'); f.action('use-hint'); }
  }
  assert.equal(f.fields.completed.textContent, '3 / 3 Easy puzzles solved');
  assert.equal(f.fields.refresh.disabled, true);
  assert.match(f.fields.status.textContent, /All 3 Easy puzzles complete/);
  assert.equal(document.activeElement, f.fields.name);
  f.open(1); assert.equal(f.controller.game.filled, 0); assert.equal(f.fields.name.textContent, 'Puzzle 1 / 3 ✓');
});

test('the number slider and typed number preview a destination until Open is pressed', () => {
  const f = fixture(); f.fields['number-slider'].value = '60'; f.fields['number-slider'].emit('input');
  assert.equal(f.fields.number.value, '60'); assert.equal(f.controller.game.level.id, 1);
  f.open(60); const expected = f.controller.game.level;
  f.open(2); f.open(60); assert.deepEqual(f.controller.game.level, expected);
  f.fields.number.value = '120'; f.fields.number.emit('input'); assert.equal(f.fields['number-slider'].value, '120');
  f.open(1001); assert.deepEqual(f.controller.game.level, expected); assert.match(f.fields.status.textContent, /1 to 1000/);
});

test('a fresh visit skips a solved floor, while a deliberate replay retains its progress', () => {
  const storage = memoryStorage(); let f = fixture(storage);
  for (let count = 0; count < 4; count++) { f.action('hint'); f.action('use-hint'); }
  f = fixture(storage); assert.notEqual(f.controller.game.level.id, 1);
  f.open(1); f.tile('A'); f.cell(0, 0);
  f = fixture(storage); assert.equal(f.controller.game.level.id, 1); assert.equal(f.controller.game.filled, 3);
});

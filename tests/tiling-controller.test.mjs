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
    const propertiesByName = new Map();
    this.style = { setProperty: (name, value) => propertiesByName.set(name, String(value)), removeProperty: name => propertiesByName.delete(name), getPropertyValue: name => propertiesByName.get(name) || '' };
  }
  addEventListener(name, callback) { if (!this.listeners.has(name)) this.listeners.set(name, []); this.listeners.get(name).push(callback); }
  emit(name, detail = {}) { this.listeners.get(name)?.forEach(callback => callback({ target: this, preventDefault() {}, ...detail })); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  focus() { document.activeElement = this; }
  replaceChildren(...children) { this.children = children; children.forEach(child => { child.parent = this; }); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  append(child) { this.children ||= []; this.children.push(child); child.parent = this; }
  remove() { if (this.parent?.children) this.parent.children = this.parent.children.filter(child => child !== this); }
  contains(element) { while (element) { if (element === this) return true; element = element.parent; } return false; }
  closest(selector) {
    const button = selector.startsWith('button');
    if (button && this.tagName !== 'BUTTON') return null;
    const property = selector.match(/data-tiling-(cell|occupant|piece|puzzle)/)?.[1];
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
  globalThis.document = { activeElement: null, body: new Element(), createElement: () => new Element({ tagName: 'BUTTON' }) };
  const root = new Element();
  const fields = Object.fromEntries(['challenge', 'challenge-name', 'challenge-label', 'remove', 'undo', 'redo', 'hint', 'reset', 'status', 'puzzles', 'page-prev', 'page-next', 'page-range', 'completed', 'level-detail', 'hint-label', 'use-hint', 'next', 'outline'].map(name => [name, new Element({ parent: root })]));
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
    open: number => {
      if (number < 1 || number > controller.book.total) return;
      while (!fields.puzzles.children.some(button => Number(button.dataset.tilingPuzzle) === number)) {
        const first = Number(fields.puzzles.children[0].dataset.tilingPuzzle);
        fields[number < first ? 'page-prev' : 'page-next'].emit('click');
      }
      const button = fields.puzzles.children.find(button => Number(button.dataset.tilingPuzzle) === number);
      button.focus(); fields.puzzles.emit('click', { target: button });
    },
    action: name => { fields[name].focus(); fields[name].emit('click'); },
  };
}

test('placing a copy uses the anchor and undo restores its quantity and board focus', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0);
  assert.match(f.fields.status.textContent, /Tile placed/);
  assert.doesNotMatch(f.fields.status.textContent, /\d+ moves?/);
  assert.equal(f.controller.game.filled, 3);
  assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0 });
  assert.equal(document.activeElement.dataset.tilingCell, '0,0');
  f.action('undo');
  assert.equal(f.fields.status.textContent, 'Last move undone.');
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
  assert.doesNotMatch(f.fields.outline.innerHTML, /tiling-footprint/);
  f.tile('A'); f.cell(0, 0); f.cell(0, 0);
  assert.equal(f.fields.remove.hidden, false);
  f.action('remove'); assert.equal(f.fields.remove.hidden, true);
});

test('Reset and Next unsolved undo from their buttons to the prior placements and puzzle', () => {
  const f = fixture(); f.tile('A'); f.cell(0, 0);
  f.action('reset'); assert.equal(f.controller.game.filled, 0);
  f.action('undo'); assert.deepEqual(f.controller.game.placements, { A: { x: 0, y: 0 } });
  f.action('next'); assert.notEqual(f.controller.game.level.id, 1);
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
  assert.equal(f.fields.status.textContent, 'A perfect fit! Every floor square is filled.');
  assert.equal(f.fields.next.disabled, false);
  assert.equal(document.activeElement, f.fields.next);
  f.action('next');
  assert.equal(f.controller.game.level.difficulty, 0);
  assert.equal(f.controller.book.number, 2);
  assert.equal(f.controller.game.filled, 0);
  assert.equal(document.activeElement, f.fields.next);
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
  assert.equal(f.controller.selected, 'D');
  assert.equal(document.body.children.length, 0);
  assert.equal(f.root.classes.has('is-dragging'), false);
});

function dragTray(f, id, target) {
  document.createElement = () => new Element();
  document.elementFromPoint = () => target();
  const tile = f.fields.tray.querySelector(`[data-tiling-piece="${id}"]`);
  f.root.emit('pointerdown', { target: tile, button: 0, isPrimary: true, pointerId: 4, clientX: 0, clientY: 0 });
  f.root.emit('pointermove', { pointerId: 4, clientX: 30, clientY: 30 });
}

test('dropping a tray tile outside the floor or on an invalid spot clears its selection and preview', () => {
  for (const target of [null, '2,0']) {
    const f = fixture();
    dragTray(f, 'A', () => target && f.fields.board.querySelector(`[data-tiling-cell="${target}"]`));
    assert.equal(f.controller.selected, 'A');
    f.root.emit('pointerup', { pointerId: 4 });
    assert.equal(f.controller.selected, null); assert.equal(f.controller.game.filled, 0);
    assert.deepEqual(f.controller.game.placements, {});
    assert.equal(document.body.children.length, 0); assert.equal(f.root.classes.has('is-dragging'), false);
    assert.equal(f.fields.remove.hidden, true); assert.equal(f.fields['use-hint'].hidden, true);
    assert.doesNotMatch(f.fields.tray.markup, /aria-pressed="true"/);
    assert.doesNotMatch(f.fields.outline.innerHTML, /tiling-footprint|tiling-boundary-selected/);
    // The click browsers emit after a drag must not select the tile again.
    f.fields.tray.emit('click', { target: f.fields.tray.querySelector('[data-tiling-piece="A"]') });
    assert.equal(f.controller.selected, null);
  }
});

test('repeated shapes share a tray card and placing or undoing updates the remaining copies', () => {
  const f = fixture();
  assert.equal(f.fields.tray.children.length, 3);
  assert.match(f.fields.tray.markup, /2 needed, 2 left/);
  assert.match(f.fields.tray.markup, /class="tiling-piece-state">×2</);
  f.tile('A'); f.cell(0, 0);
  assert.equal(f.controller.selected, 'D');
  assert.match(f.fields.tray.markup, /2 needed, 1 left/);
  assert.doesNotMatch(f.fields.tray.markup, /class="tiling-piece-state">×2</);
  assert.match(f.fields.tray.markup, /class="tiling-piece-state">×1</);
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
  assert.equal(f.fields.undo.disabled, false);
  assert.equal(f.controller.selected, null);
  assert.equal(f.fields.remove.hidden, true);
  assert.equal(document.body.children.length, 0);
  f.action('undo');
  assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0 });
  assert.equal(f.controller.game.filled, 3);
});

test('dragging from a non-anchor square keeps that grabbed square under the pointer', () => {
  const f = fixture();
  f.tile('A'); f.cell(0, 0);
  dragCopy(f, 1, 0, () => f.fields.board.querySelector('[data-tiling-cell="2,2"]'));
  f.root.emit('pointerup', { pointerId: 7 });
  assert.deepEqual(f.controller.game.placements.A, { x: 1, y: 2 });
  assert.equal(f.controller.game.filled, 3);
});

test('a cancelled drag deselects the tile while leaving the copy and inventory unchanged', () => {
  for (const cancel of ['pointercancel', 'lostpointercapture', 'Escape']) {
    const f = fixture();
    f.tile('A'); f.cell(0, 0);
    dragCopy(f, 0, 0, () => null);
    const cell = f.fields.board.querySelector('[data-tiling-cell="0,0"]');
    f.root.emit(cancel === 'Escape' ? 'keydown' : cancel, { target: cell, key: 'Escape', pointerId: 7 });
    f.root.emit('pointermove', { pointerId: 7, clientX: 50, clientY: 50 });
    f.root.emit('pointerup', { pointerId: 7 });
    assert.deepEqual(f.controller.game.placements.A, { x: 0, y: 0 });
    assert.equal(f.controller.game.filled, 3); assert.equal(f.controller.selected, null);
    assert.equal(document.body.children.length, 0); assert.equal(f.root.classes.has('is-dragging'), false);
    assert.match(f.fields.tray.markup, /2 needed, 1 left/);
    assert.doesNotMatch(f.fields.outline.innerHTML, /tiling-footprint|tiling-boundary-selected/);
  }
});

test('an invalid move or a drag back to the original spot deselects without changing placements', () => {
  for (const target of ['0,0', '1,1']) {
    const f = fixture();
    f.tile('A'); f.cell(0, 0); f.tile('B'); f.cell(2, 0);
    const placed = f.controller.game.placements;
    dragCopy(f, 0, 0, () => f.fields.board.querySelector(`[data-tiling-cell="${target}"]`));
    f.root.emit('pointerup', { pointerId: 7 });
    assert.deepEqual(f.controller.game.placements, placed); assert.equal(f.controller.game.filled, 6);
    assert.equal(f.controller.selected, null); assert.equal(f.fields.remove.hidden, true);
    assert.doesNotMatch(f.fields.outline.innerHTML, /tiling-footprint|tiling-boundary-selected/);
    f.action('undo'); assert.equal(f.controller.game.filled, 3);
  }
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

test('retiring the grid preference preserves progress and history without saving the old layout choice', () => {
  const storage = memoryStorage(); let f = fixture(storage);
  f.tile('A'); f.cell(0, 0);
  const placed = f.controller.game.placements, old = storage.read(); old.trayLayout = 'grid'; storage.save(old);
  f = fixture(storage);
  assert.deepEqual(f.controller.game.placements, placed); assert.equal('trayLayout' in storage.read(), false);
  f.action('undo'); assert.equal(f.controller.game.filled, 0);
  f.action('redo'); f.action('reset'); f.action('undo'); assert.deepEqual(f.controller.game.placements, placed);
  f.action('next'); f.action('undo');
  f = fixture(storage); assert.equal('trayLayout' in storage.read(), false);
  assert.deepEqual(f.controller.game.placements, placed);
});

test('tray edges fade only toward hidden tiles and clear when all tiles fit', () => {
  const f = fixture(), tray = f.fields.tray;
  const fades = () => [tray.style.getPropertyValue('--fade-left'), tray.style.getPropertyValue('--fade-right')];
  tray.clientWidth = 200; tray.scrollWidth = 500; tray.scrollLeft = 0; tray.emit('scroll');
  assert.deepEqual(fades(), ['#000', 'transparent']);
  tray.scrollLeft = 100; tray.emit('scroll'); assert.deepEqual(fades(), ['transparent', 'transparent']);
  tray.scrollLeft = 300; tray.emit('scroll'); assert.deepEqual(fades(), ['transparent', '#000']);
  tray.scrollWidth = 200; tray.scrollLeft = 0; tray.emit('scroll'); assert.deepEqual(fades(), ['#000', '#000']);
});

test('a horizontal touch swipe in the scrolling tray does not start a tile drag', () => {
  const f = fixture(); let captures = 0;
  f.tile('A');
  f.root.setPointerCapture = () => captures++;
  const tile = f.fields.tray.querySelector('[data-tiling-piece="A"]');
  f.root.emit('pointerdown', { target: tile, button: 0, isPrimary: true, pointerType: 'touch', pointerId: 2, clientX: 0, clientY: 0 });
  f.root.emit('pointermove', { pointerType: 'touch', pointerId: 2, clientX: 24, clientY: 2 });
  f.root.emit('pointerup', { pointerType: 'touch', pointerId: 2 });
  assert.equal(captures, 0); assert.equal(f.controller.game.filled, 0);
  assert.equal(f.controller.selected, 'A');
  assert.equal(f.root.classes.has('is-dragging'), false);
});

test('Next unsolved keeps difficulty and tile budget, changes the arrangement, and restart keeps that arrangement', () => {
  const f = fixture();
  for (let index = 0; index < 4; index++) {
    f.fields.challenge.value = String(index + 1); f.fields.challenge.emit('change');
    for (let count = 0; count < 12; count++) {
      const previous = JSON.stringify(f.controller.game.level);
      const before = f.controller.game.level;
      f.action('next');
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
  f.fields.challenge.value = '3'; f.fields.challenge.emit('change'); f.action('next');
  const level = f.controller.game.level;
  f.action('hint'); f.action('use-hint'); f.action('hint'); f.action('use-hint'); f.action('undo');
  const placed = f.controller.game.placements;
  f = fixture(storage);
  assert.equal(f.fields.challenge.value, '3'); assert.equal(f.fields['challenge-label'].textContent, 'Hard');
  assert.deepEqual(f.controller.game.level, level); assert.deepEqual(f.controller.game.placements, placed);
  assert.equal(f.fields.redo.disabled, false); f.action('redo'); assert.equal(Object.keys(f.controller.game.placements).length, 2);
  f.action('undo'); f.action('undo'); assert.equal(f.controller.game.filled, 0);
});

test('solving then advancing skips completion records, while a puzzle number explicitly allows replay', () => {
  const storage = memoryStorage(); let f = fixture(storage);
  const original = f.controller.game.level;
  for (let count = 0; count < 4; count++) { f.action('hint'); f.action('use-hint'); }
  assert.equal(f.controller.book.number, 1); assert.equal(f.controller.book.currentCompleted, true);
  assert.equal(f.fields.puzzles.children[0].dataset.completion, 'solved');
  assert.equal(f.fields.puzzles.children[0].attributes.get('aria-label'), 'Puzzle 1, solved.');
  assert.equal(f.fields.completed.textContent, '1 / 1000 Easy puzzles solved');
  f.action('undo'); f.action('next');
  assert.notEqual(f.controller.game.level.id, 1);
  f = fixture(storage); assert.notEqual(f.controller.game.level.id, 1);
  f.open(1); assert.deepEqual(f.controller.game.level, original);
  assert.equal(f.controller.game.filled, 0);
  assert.equal(f.fields.completed.textContent, '1 / 1000 Easy puzzles solved');
  assert.equal(document.activeElement.dataset.tilingPuzzle, '1');
});

test('the final puzzle displays completion, disables Next unsolved and keeps numbered replays available', () => {
  const catalogue = CATALOGUE.map(rows => rows.slice(0, 3)), f = fixture(memoryStorage(), catalogue);
  for (let number = 1; number <= 3; number++) {
    f.open(number);
    for (let count = 0; count < f.controller.game.level.pieces.length; count++) { f.action('hint'); f.action('use-hint'); }
  }
  assert.equal(f.fields.completed.textContent, '3 / 3 Easy puzzles solved');
  assert.equal(f.fields.next.disabled, true);
  assert.match(f.fields.status.textContent, /All 3 Easy puzzles complete/);
  assert.equal(document.activeElement, f.fields.undo);
  f.open(1); assert.equal(f.controller.game.filled, 0); assert.equal(f.controller.book.currentCompleted, true);
});

test('the puzzle list pages in groups of 50 and numbered selections reproduce the same floor', () => {
  const f = fixture(); assert.equal(f.fields.puzzles.children.length, 50);
  f.action('page-next'); assert.equal(f.fields['page-range'].textContent, '51–100 / 1000');
  assert.equal(f.controller.game.level.id, 1);
  f.open(60); const expected = f.controller.game.level;
  assert.equal(document.activeElement.dataset.tilingPuzzle, '60');
  f.open(2); f.open(60); assert.deepEqual(f.controller.game.level, expected);
  f.open(1001); assert.deepEqual(f.controller.game.level, expected);
});

test('a fresh visit skips a solved floor, while a deliberate replay retains its progress', () => {
  const storage = memoryStorage(); let f = fixture(storage);
  for (let count = 0; count < 4; count++) { f.action('hint'); f.action('use-hint'); }
  f = fixture(storage); assert.notEqual(f.controller.game.level.id, 1);
  f.open(1); f.tile('A'); f.cell(0, 0);
  f = fixture(storage); assert.equal(f.controller.game.level.id, 1); assert.equal(f.controller.game.filled, 3);
});

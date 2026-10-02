import test from 'node:test';
import assert from 'node:assert/strict';
import { BOARD_WIDTH, BOARD_HEIGHT, CLASSIC_LAYOUT, createKlotski, validPieces, isSolved, maxSlide, canSlide, slideKlotski, undoKlotski } from '../assets/js/lib/klotski.mjs';

const target = (x = 1, y = 0) => ({ id: 'target', label: 'Exit block', x, y, width: 2, height: 2 });
const square = (id, x, y) => ({ id, label: `Block ${id}`, x, y, width: 1, height: 1 });

test('the classic board starts with ten blocks and exactly two empty squares', () => {
  const state = createKlotski();
  assert.equal(state.pieces.length, 10);
  assert.equal(state.pieces.reduce((area, piece) => area + piece.width * piece.height, 0), BOARD_WIDTH * BOARD_HEIGHT - 2);
  assert.ok(validPieces(state.pieces));
  assert.equal(state.won, false);
  assert.equal(state.moves, 0);
  assert.deepEqual(state.history, []);
  assert.notEqual(state.pieces, CLASSIC_LAYOUT);
  assert.notEqual(state.pieces[0], CLASSIC_LAYOUT[0]);
});

test('a legal slide preserves shape and all other blocks without mutating the previous state', () => {
  const before = createKlotski();
  const next = slideKlotski(before, '8', 'right');
  assert.ok(next);
  assert.deepEqual(next.pieces.find(piece => piece.id === '8'), { ...before.pieces.find(piece => piece.id === '8'), x: 1 });
  assert.deepEqual(next.pieces.filter(piece => piece.id !== '8'), before.pieces.filter(piece => piece.id !== '8'));
  assert.deepEqual(before.pieces, CLASSIC_LAYOUT);
  assert.equal(next.moves, 1);
  assert.ok(validPieces(next.pieces));
});

test('blocked and boundary moves are rejected in every direction', () => {
  const state = createKlotski();
  for (const direction of ['up', 'right', 'down', 'left']) assert.equal(slideKlotski(state, 'target', direction), null);
  assert.equal(slideKlotski(state, '8', 'left'), null);
  assert.equal(slideKlotski(state, '8', 'down'), null);
  assert.equal(slideKlotski(state, '8', 'up'), null);
  assert.equal(slideKlotski(state, '8', 'diagonal'), null);
  assert.equal(slideKlotski(state, 'missing', 'right'), null);
  assert.equal(state.moves, 0);
  assert.equal(state.history.length, 0);
});

test('a long slide cannot jump across a block even when its destination is empty', () => {
  const state = createKlotski([target(), square('moving', 0, 4), square('obstacle', 1, 4)]);
  assert.equal(slideKlotski(state, 'moving', 'right', 3), null);
  assert.equal(maxSlide(state, 'moving', 'right'), 0);
  assert.ok(validPieces(state.pieces));
});

test('long drags count as one move and exact available distance is bounded', () => {
  const state = createKlotski([target(), square('moving', 0, 4)]);
  assert.equal(maxSlide(state, 'moving', 'right'), 3);
  assert.equal(canSlide(state, 'moving', 'right'), true);
  const next = slideKlotski(state, 'moving', 'right', 3);
  assert.equal(next.moves, 1);
  assert.equal(next.history.length, 1);
  assert.equal(next.pieces[1].x, 3);
  assert.equal(slideKlotski(state, 'moving', 'right', 4), null);
  for (const distance of [-1, 0, 1.5, NaN]) assert.equal(slideKlotski(state, 'moving', 'right', distance), null);
});

test('undo restores every block and move count after a longer slide', () => {
  const state = createKlotski([target(), square('moving', 0, 4)]);
  const next = slideKlotski(state, 'moving', 'right', 3);
  const restored = undoKlotski(next);
  assert.deepEqual(restored, state);
  assert.equal(undoKlotski(restored), null);
});

test('the marked square wins only at the bottom-centre opening', () => {
  assert.equal(isSolved([target(0, 3)]), false);
  assert.equal(isSolved([target(2, 3)]), false);
  assert.equal(isSolved([target(1, 2)]), false);
  assert.equal(isSolved([target(1, 3)]), true);
  const state = createKlotski([target(1, 2)]);
  const win = slideKlotski(state, 'target', 'down');
  assert.equal(win.won, true);
  assert.equal(slideKlotski(win, 'target', 'up'), null);
  assert.equal(maxSlide(win, 'target', 'up'), 0);
  const restored = undoKlotski(win);
  assert.equal(restored.won, false);
  assert.deepEqual(restored, state);
});

test('the exit stops a long drag as soon as the square reaches the opening', () => {
  const state = createKlotski([target(0, 3)]);
  assert.equal(maxSlide(state, 'target', 'right'), 1);
  const win = slideKlotski(state, 'target', 'right', 2);
  assert.equal(win.won, true);
  assert.equal(win.pieces[0].x, 1);
});

test('invalid layouts reject overlap, off-board cells, malformed blocks and a missing target', () => {
  for (const pieces of [
    [], [target(), square('overlap', 1, 0)], [target(-1, 0)], [target(1, 4)],
    [target(), square('a', 0, 3), square('a', 3, 3)], [target(), square('a', .5, 3)],
    [{ ...target(), width: 1 }], [{ ...target(), height: 0 }], [square('a', 0, 0)]
  ]) {
    assert.equal(validPieces(pieces), false);
    assert.throws(() => createKlotski(pieces), RangeError);
  }
});

// A complete route found by breadth-first search, merging interchangeable shapes.
// Every step is checked against the production collision rules, not just its endpoint.
const classicSolution = [
  ['8','right'],['3','down'],['4','left'],['7','up'],['9','left'],['5','down'],['7','right'],['4','right'],['3','up'],['8','left'],
  ['9','left'],['5','left'],['7','down'],['4','right'],['6','up'],['7','down'],['9','up'],['8','right'],['3','down'],['6','left'],
  ['4','left'],['2','down'],['2','down'],['target','right'],['1','right'],['6','up'],['3','up'],['6','up'],['3','up'],['8','left'],
  ['9','left'],['5','left'],['7','left'],['2','down'],['4','right'],['5','up'],['7','up'],['8','right'],['8','right'],['5','down'],
  ['1','down'],['6','right'],['3','up'],['9','up'],['5','left'],['1','down'],['1','down'],['9','right'],['9','up'],['4','left'],
  ['2','up'],['4','left'],['8','right'],['7','down'],['2','left'],['8','up'],['7','right'],['2','down'],['4','right'],['3','down'],
  ['4','right'],['1','up'],['6','left'],['9','up'],['1','up'],['2','left'],['7','left'],['8','down'],['4','down'],['target','down'],
  ['9','right'],['6','right'],['3','up'],['5','up'],['9','right'],['6','right'],['1','up'],['2','up'],['7','left'],['7','left'],
  ['8','left'],['8','left'],['4','down'],['target','down'],['6','down'],['6','right'],['1','right'],['2','up'],['2','up'],['target','left'],
  ['6','down'],['6','down'],['9','down'],['9','down'],['1','right'],['2','right'],['3','right'],['5','up'],['5','up'],['target','left'],
  ['6','left'],['6','up'],['4','up'],['8','right'],['7','right'],['8','right'],['7','right'],['target','down'],['6','left'],['6','left'],
  ['9','left'],['9','left'],['4','up'],['7','up'],['7','right'],['target','right']
];

test('the complete classic starting puzzle has a collision-free solution and can be fully undone', () => {
  let state = createKlotski();
  for (const [id, direction] of classicSolution) {
    assert.equal(state.won, false, 'The solution should keep playing until the last step.');
    const next = slideKlotski(state, id, direction);
    assert.ok(next, `${id} must be able to move ${direction} at step ${state.moves + 1}.`);
    assert.ok(validPieces(next.pieces));
    state = next;
  }
  assert.equal(state.won, true);
  assert.equal(state.moves, classicSolution.length);
  while (state.history.length) state = undoKlotski(state);
  assert.deepEqual(state, createKlotski());
});

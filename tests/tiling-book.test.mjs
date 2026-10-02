import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOGUE } from '../assets/js/lib/tiling-catalogue.mjs';
import { createPuzzleBook } from '../assets/js/lib/tiling-book.mjs';
import { DIFFICULTIES, createArrangement, arrangementFingerprint } from '../assets/js/lib/tiling-arrangements.mjs';
import { buildLevel, createGame, isSolved, key, placementCells } from '../assets/js/lib/tiling.mjs';

const smallCatalogue = CATALOGUE.map(rows => rows.slice(0, 3));
function solve(book) {
  const game = createGame(book.level);
  for (const piece of game.level.pieces) game.place(piece.id, game.level.solution[piece.id]);
  book.record(game.exportState(), game.solved);
  return game;
}
DIFFICULTIES.forEach((config, difficulty) => {
  test(`${config.name} has exactly 1,000 distinct numbered puzzles with complete fixed-orientation solutions`, () => {
    const fingerprints = new Set();
    assert.equal(CATALOGUE[difficulty].length, 1000);
    for (const rows of CATALOGUE[difficulty]) {
      const level = buildLevel({ name: 'Puzzle', rows: rows.split('/') });
      assert.equal(level.width, config.width); assert.equal(level.height, config.height); assert.equal(level.holes.length, config.holes);
      assert.deepEqual(level.pieces.map(piece => piece.cells.length).sort(), [...config.sizes].sort());
      const cells = level.pieces.flatMap(piece => placementCells(piece, level.solution[piece.id]).map(cell => key(...cell)));
      assert.equal(new Set(cells).size, cells.length);
      assert.deepEqual(new Set(cells), new Set(level.floor.map(cell => key(...cell))));
      assert.equal(isSolved(level, level.solution), true);
      fingerprints.add(arrangementFingerprint(level));
    }
    assert.equal(fingerprints.size, 1000);
  });
});

test('puzzle numbers reproduce the same arrangement across visits and difficulty changes', () => {
  const book = createPuzzleBook(); book.changeDifficulty(3); book.open(60);
  const expected = book.level;
  const restored = createPuzzleBook(book.exportState());
  assert.equal(restored.number, 60); assert.equal(restored.difficulty, 3); assert.deepEqual(restored.level, expected);
  restored.changeDifficulty(0); restored.open(60); assert.notDeepEqual(restored.level, expected);
  restored.changeDifficulty(3); assert.equal(restored.number, 60); assert.deepEqual(restored.level, expected);
  for (const number of [0, -1, 1001, 1.5, NaN]) assert.equal(restored.open(number), false);
  assert.deepEqual(restored.level, expected);
});

test('solved puzzles are skipped until deliberately opened, including after undo and reload', () => {
  let book = createPuzzleBook(null, smallCatalogue); const completed = book.level;
  const game = solve(book); game.undo(); book.record(game.exportState(), game.solved);
  assert.equal(book.completedCount, 1); assert.equal(book.currentCompleted, true);
  book = createPuzzleBook(book.exportState(), smallCatalogue);
  for (let count = 0; count < 10; count++) {
    assert.equal(book.next(() => 0), true); assert.notEqual(book.number, 1);
    assert.notEqual(arrangementFingerprint(book.level), arrangementFingerprint(completed));
  }
  assert.equal(book.open(1), true); assert.deepEqual(book.level, completed); assert.equal(book.state, null);
  assert.equal(book.currentCompleted, true); solve(book); assert.equal(book.completedCount, 1);
});

test('finishing a difficulty stops shuffle and still permits numbered replays and other difficulties', () => {
  const book = createPuzzleBook(null, smallCatalogue);
  for (let number = 1; number <= 3; number++) { book.open(number); solve(book); }
  assert.equal(book.allCompleted, true); assert.equal(book.canRefresh, false); assert.equal(book.next(), false);
  book.open(1); assert.equal(book.currentCompleted, true); assert.equal(book.next(), false);
  book.changeDifficulty(3); assert.equal(book.completedCount, 0); assert.equal(book.canRefresh, true);
  book.changeDifficulty(0); assert.equal(book.allCompleted, true);
});

test('returning to a difficulty or a new visit skips solved puzzles while deliberate replays resume', () => {
  let book = createPuzzleBook(null, smallCatalogue); solve(book);
  book.changeDifficulty(3); book.changeDifficulty(0); assert.notEqual(book.number, 1);
  book.open(1); const game = createGame(book.level); game.place('A', game.level.solution.A);
  book.record(game.exportState(), game.solved);
  book = createPuzzleBook(book.exportState(), smallCatalogue); book.resume();
  assert.equal(book.number, 1); assert.equal(createGame(book.level, book.state).filled, 3);
  book.changeDifficulty(3); book.changeDifficulty(0); assert.equal(book.number, 1);
  book.open(2); solve(book);
  book = createPuzzleBook(book.exportState(), smallCatalogue); book.resume(); assert.equal(book.number, 3);
});

test('legacy progress preserves the current floor and swaps duplicate slots without repeating arrangements', () => {
  const original = createArrangement(0, 1), game = createGame(original); game.place('A', original.solution.A);
  const saved = { difficulty: 0, sessions: { 0: { seed: 1, round: 60, state: game.exportState() } } };
  const book = createPuzzleBook(saved);
  assert.equal(book.number, 60); assert.equal(arrangementFingerprint(book.level), arrangementFingerprint(original));
  assert.deepEqual(createGame(book.level, book.state).placements, game.placements);
  const restored = createPuzzleBook(book.exportState());
  assert.deepEqual(restored.level, book.level);
  const fingerprints = new Set();
  for (let number = 1; number <= 1000; number++) { restored.open(number); fingerprints.add(arrangementFingerprint(restored.level)); }
  assert.equal(fingerprints.size, 1000);
});

test('a completed legacy floor is remembered even when its last move was undone', () => {
  const game = createGame(createArrangement(0, 1));
  for (const piece of game.level.pieces) game.place(piece.id, game.level.solution[piece.id]);
  game.undo();
  const book = createPuzzleBook({ difficulty: 0, sessions: { 0: { seed: 1, round: 1, state: game.exportState() } } });
  assert.equal(book.currentCompleted, true); assert.equal(book.completedCount, 1);
  assert.equal(createGame(book.level, book.state).solved, false);
});

test('malformed completion records and custom arrangements are ignored safely', () => {
  const book = createPuzzleBook({ version: 2, difficulty: 5, sessions: { 0: { number: 2000, completed: [1, 1, 2, 0, 1001, '3', null], overrides: { 1: 'AAA', 2: '................/....', 3: 42 }, state: {} } } });
  assert.equal(book.difficulty, 0); assert.equal(book.number, 1); assert.equal(book.completedCount, 2);
  assert.equal(createGame(book.level, book.state).filled, 0);
  assert.deepEqual(book.exportState().sessions[0].overrides, {});
});

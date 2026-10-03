import test from 'node:test';
import assert from 'node:assert/strict';
import { LIGHTS_OUT_CATALOGUE } from '../assets/js/lib/lights-out-catalogue.mjs';
import { BOOK_GRAPHS, LIGHTS_OUT_LEVELS } from '../assets/js/lib/lights-out-book-graphs.mjs';
import { createLightsOutBook, createLightsOutGame } from '../assets/js/lib/lights-out-book.mjs';
import { solvePresses, countBits, pressEffect, vertices } from '../assets/js/lib/lights-out-math.mjs';

LIGHTS_OUT_LEVELS.forEach((level, difficulty) => {
  test(`${level.name}: 1,000 distinct, connected, solvable puzzles at the promised difficulty`, () => {
    const puzzles = LIGHTS_OUT_CATALOGUE[difficulty], seen = new Set();
    assert.equal(puzzles.length, 1000);
    let previousMinimum = 0;
    for (const [key, start, minimum] of puzzles) {
      const graph = BOOK_GRAPHS[key];
      assert.ok(graph && !graph.side);
      assert.ok(level.sizes.includes(graph.size));
      assert.ok(start > 0 && start <= graph.all);
      const solutions = solvePresses(graph, start).solutions;
      assert.ok(solutions.length > 0);
      assert.equal(countBits(solutions[0]), minimum);
      assert.equal(start ^ pressEffect(graph, solutions[0]), 0);
      assert.ok(minimum >= level.presses[0] && minimum <= level.presses[1]);
      assert.ok(minimum >= previousMinimum); previousMinimum = minimum;
      seen.add(`${key}/${start}`);
      let reached = 1, old = 0;
      while (old !== reached) { old = reached; for (const i of vertices(reached, graph.size)) reached |= graph.neighbors[i]; }
      assert.equal(reached, graph.all);
    }
    assert.equal(seen.size, 1000);
    assert.ok(new Set(puzzles.map(puzzle => puzzle[0])).size >= 30, 'Varied graph structures, not just new light patterns.');
    assert.ok(new Set(puzzles.map(puzzle => BOOK_GRAPHS[puzzle[0]].family)).size >= 3);
  });
});

test('graph drawings leave room for touch targets and never run through unrelated lights', () => {
  for (const graph of Object.values(BOOK_GRAPHS)) {
    for (let a = 0; a < graph.size; a++) for (let b = a + 1; b < graph.size; b++) {
      const pa = graph.positions[a], pb = graph.positions[b];
      assert.ok(Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) * 288 >= 44, `${graph.key} lights ${a}, ${b}`);
    }
    for (const [a, b] of graph.edges) {
      const [x, y] = graph.positions[a], dx = graph.positions[b][0] - x, dy = graph.positions[b][1] - y;
      graph.positions.forEach(([px, py], i) => {
        if (i === a || i === b) return;
        const t = Math.max(0, Math.min(1, ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy)));
        assert.ok(Math.hypot(px - x - t * dx, py - y - t * dy) >= .065, `${graph.key} edge ${a}, ${b} near light ${i}`);
      });
    }
  }
});

const smallCatalogue = LIGHTS_OUT_CATALOGUE.map(puzzles => puzzles.slice(0, 3));
function solve(book) {
  const game = createLightsOutGame(book.puzzle, book.state);
  while (!game.solved) assert.equal(game.press(game.hint()), true);
  book.record(game.exportState(), game.solved); return game;
}

test('puzzle numbers are stable; moves and redo survive level changes and reload', () => {
  let book = createLightsOutBook(); book.open(70);
  const original = book.puzzle;
  const game = createLightsOutGame(original); game.press(0); game.press(1); game.undo();
  book.record(game.exportState(), false);
  book.changeDifficulty(3); book.open(70); assert.notEqual(book.puzzle.key, original.key);
  book.changeDifficulty(0); assert.equal(book.number, 70); assert.deepEqual(book.puzzle, original);
  book = createLightsOutBook(book.exportState());
  const restored = createLightsOutGame(book.puzzle, book.state);
  assert.equal(restored.lights, game.lights); assert.equal(restored.moves, game.moves); assert.equal(restored.canRedo, true);
  restored.redo(); assert.equal(restored.moves, 2); restored.undo(); restored.undo(); assert.equal(restored.lights, original.start);
});

test('completion survives undo, revisits and reload; automatic navigation skips solved puzzles', () => {
  let book = createLightsOutBook(null, smallCatalogue);
  const game = solve(book); game.undo(); book.record(game.exportState(), false);
  assert.equal(book.completedCount, 1);
  book = createLightsOutBook(book.exportState(), smallCatalogue); book.resume(); assert.equal(book.number, 2);
  solve(book); book.open(1); assert.equal(book.currentCompleted, true); solve(book);
  assert.equal(book.completedCount, 2); book.advance(); assert.equal(book.number, 3);
  book.open(1); assert.equal(book.shuffle(() => 0), true); assert.equal(book.number, 3);
  solve(book); assert.equal(book.allCompleted, true); assert.equal(book.advance(), false); assert.equal(book.shuffle(), false);
  book.open(1); assert.equal(book.currentCompleted, true);
  book.changeDifficulty(3); assert.equal(book.completedCount, 0); assert.equal(book.canAdvance, true);
  book.changeDifficulty(0); assert.equal(book.allCompleted, true);
});

test('deliberate replays stay open while ordinary completed puzzles advance on resume', () => {
  let book = createLightsOutBook(null, smallCatalogue); solve(book); book.open(1);
  const game = createLightsOutGame(book.puzzle); game.press(0); book.record(game.exportState(), game.solved);
  book = createLightsOutBook(book.exportState(), smallCatalogue); book.resume(); assert.equal(book.number, 1);
  assert.equal(createLightsOutGame(book.puzzle, book.state).moves, 1);
  book.changeDifficulty(1); book.changeDifficulty(0); assert.equal(book.number, 1);
  book.open(2); solve(book); book.resume(); assert.equal(book.number, 3);
});

test('invalid saves and puzzle numbers cannot corrupt the book or board', () => {
  const book = createLightsOutBook({ version: 1, difficulty: 99, sessions: [{ number: 1001, completed: [1, 1, 0, 1001, '2'], state: { moves: [999], future: [0] } }] });
  assert.equal(book.difficulty, 0); assert.equal(book.number, 1); assert.equal(book.completedCount, 1);
  const game = createLightsOutGame(book.puzzle, book.state);
  assert.equal(game.moves, 0); assert.equal(game.lights, book.puzzle.start); assert.equal(game.canRedo, false);
  for (const value of [0, 1001, '2', NaN, null]) assert.equal(book.open(value), false);
  assert.equal(game.press(-1), false); assert.equal(game.press(99), false);
  const legal = solvePresses(book.puzzle.graph, book.puzzle.start).solutions[0];
  const invalidHistory = createLightsOutGame(book.puzzle, { moves: [...vertices(legal, book.puzzle.graph.size), 0], future: [] });
  assert.equal(invalidHistory.moves, 0); assert.equal(invalidHistory.lights, book.puzzle.start);
});

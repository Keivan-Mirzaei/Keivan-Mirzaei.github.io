import test from 'node:test';
import assert from 'node:assert/strict';
import { GRAPH_BOARDS, puzzleCatalogue, newGraphPuzzle } from '../assets/js/lib/lights-out-graphs.mjs';
import { countBits, pressEffect, solvePresses } from '../assets/js/lib/lights-out-math.mjs';

test('every graph catalogue contains exactly its nonzero reachable positions with correct minimum distances', () => {
  for (const [key, graph] of Object.entries(GRAPH_BOARDS)) {
    const catalogue = puzzleCatalogue(key);
    const actual = new Set(catalogue.map(puzzle => puzzle.lights));
    const expected = new Set(Array.from({ length: graph.all + 1 }, (_, mask) => pressEffect(graph, mask)));
    expected.delete(0);
    assert.deepEqual(actual, expected);
    assert.equal(actual.size, catalogue.length);
    for (const { lights, minimum } of catalogue) {
      assert.equal(minimum, countBits(solvePresses(graph, lights).solutions[0]));
    }
    assert.equal(graph.positions.length, graph.size);
    assert.ok(!graph.side, 'Play boards are graphs, not rectangular grids.');
  }
});

test('difficulty bands are ordered and new puzzles never repeat the previous board', () => {
  for (const key of Object.keys(GRAPH_BOARDS)) {
    const bands = [];
    for (const difficulty of ['easy', 'medium', 'hard']) {
      const minima = [];
      let previous = -1;
      for (let i = 0; i < 150; i++) {
        const puzzle = newGraphPuzzle(key, difficulty, previous, () => i / 150);
        assert.ok(puzzle && puzzle.lights > 0);
        assert.notEqual(puzzle.lights, previous);
        minima.push(puzzle.minimum);
        previous = puzzle.lights;
      }
      bands.push([Math.min(...minima), Math.max(...minima)]);
    }
    assert.ok(bands[0][1] < bands[1][0], `${key}: easy is easier than medium`);
    assert.ok(bands[1][1] < bands[2][0], `${key}: medium is easier than hard`);
  }
});

test('a hint remains a valid shortest-route press after any legal move', () => {
  for (const [key, graph] of Object.entries(GRAPH_BOARDS)) {
    for (const { lights } of puzzleCatalogue(key)) {
      for (let vertex = 0; vertex < graph.size; vertex++) {
        const current = lights ^ pressEffect(graph, 1 << vertex);
        if (!current) continue;
        const shortest = solvePresses(graph, current).solutions[0];
        const hint = shortest & -shortest;
        const next = current ^ pressEffect(graph, hint);
        assert.equal(countBits(solvePresses(graph, next).solutions[0]), countBits(shortest) - 1);
      }
    }
  }
});

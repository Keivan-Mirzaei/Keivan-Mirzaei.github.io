import test from 'node:test';
import assert from 'node:assert/strict';
import { createSearch, immediateWins } from '../assets/js/lib/hex-math.mjs';
import { HEX_DIFFICULTIES, hexDifficulty, searchBudget } from '../assets/js/lib/hex-search-settings.mjs';

function seeded(seed) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}

test('search effort increases at every level and Hard keeps the previous budget', () => {
  assert.equal(hexDifficulty(undefined), 'hard');
  assert.equal(hexDifficulty('unknown'), 'hard');
  for (const size of [3, 5, 7, 11]) {
    const budgets = HEX_DIFFICULTIES.map(level => searchBudget(size, level));
    for (let i = 1; i < budgets.length; i++) {
      assert.ok(budgets[i].timeMs > budgets[i - 1].timeMs);
      assert.ok(budgets[i].maxIterations > budgets[i - 1].maxIterations);
    }
    assert.equal(searchBudget(size).timeMs, size <= 5 ? 1500 : 2000);
    assert.equal(searchBudget(size).maxIterations, 60000);
  }
});

test('even Easy takes immediate wins and blocks immediate losses for either colour', () => {
  const fixtures = [
    { cells: [1, 0, 2, 1, 0, 2, 0, 0, 0], color: 1, move: 6 },
    { cells: [2, 2, 0, 0, 0, 0, 1, 1, 0], color: 2, move: 2 },
    { cells: [1, 0, 0, 1, 0, 0, 0, 2, 0], color: 2, move: 6 },
    { cells: [2, 2, 0, 0, 0, 1, 0, 0, 0], color: 1, move: 2 },
  ];
  for (const level of HEX_DIFFICULTIES) for (const { cells, color, move } of fixtures) {
    const before = cells.slice();
    assert.equal(createSearch(cells, 3, color, seeded(17), searchBudget(3, level)).best(), move);
    assert.deepEqual(cells, before);
  }
});

test('Easy builds useful opening connections instead of choosing a random empty cell', () => {
  for (const size of [5, 7, 11]) {
    const cells = Array(size * size).fill(0);
    const search = createSearch(cells, size, 1, seeded(1), searchBudget(size, 'easy'));
    assert.equal(search.best(), Math.floor(size / 2) * size + Math.floor((size - 1) / 2));
  }
});

test('Medium finds a multi-turn winning continuation without an immediate threat', () => {
  const cells = [0, 0, 1, 0, 0, 2, 0, 1, 2, 1, 1, 2, 0, 0, 0, 0, 2, 0, 1, 0, 1, 0, 0, 0, 2];
  assert.equal(immediateWins(cells, 5, 1).length, 0);
  assert.equal(immediateWins(cells, 5, 2).length, 0);
  for (const seed of [1, 2, 3]) {
    const search = createSearch(cells, 5, 2, seeded(seed), searchBudget(5, 'medium'));
    search.run(searchBudget(5, 'medium').maxIterations);
    assert.equal(search.best(), 13);
  }
});

test('Expert proves the unique win with fourteen empty cells in both orientations', () => {
  // The independent oracle in hex-ai.test.mjs verifies this position's sole win.
  const cells = [0, 0, 1, 0, 0, 2, 0, 1, 2, 1, 1, 2, 0, 0, 0, 0, 2, 0, 1, 0, 1, 0, 0, 0, 2];
  const swapped = cells.map((_, i) => {
    const color = cells[(i % 5) * 5 + Math.floor(i / 5)];
    return color ? 3 - color : 0;
  });
  for (const [position, color, move] of [[cells, 2, 13], [swapped, 1, 17]]) {
    const original = position.slice();
    for (const seed of [1, 2, 3]) {
      const search = createSearch(position, 5, color, seeded(seed), searchBudget(5, 'expert'));
      search.run(2000);
      assert.equal(search.solved, true);
      assert.equal(search.best(), move);
      assert.deepEqual(position, original);
    }
  }
});

test('an unfinished Expert proof keeps the sampled move and owns a copy of its board', () => {
  const cells = [0, 0, 1, 0, 0, 2, 0, 1, 2, 1, 1, 2, 0, 0, 0, 0, 2, 0, 1, 0, 1, 0, 0, 0, 2];
  const mutable = cells.slice();
  const expert = createSearch(mutable, 5, 2, seeded(3), searchBudget(5, 'expert'));
  const sampling = createSearch(cells, 5, 2, seeded(3));
  sampling.run(1); expert.run(2);
  assert.equal(expert.solved, false);
  assert.equal(expert.best(), sampling.best());
  mutable.fill(1);
  expert.run(2000);
  assert.equal(expert.solved, true);
  assert.equal(expert.best(), 13);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createSearch } from '../assets/js/lib/hex-math.mjs';

function seeded(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

// Keep the test oracle independent of the game's connectivity and search code.
function connected(cells, size, color) {
  const pending = [], seen = new Set();
  for (let k = 0; k < size; k++) {
    const i = color === 1 ? k : k * size;
    if (cells[i] === color) { pending.push(i); seen.add(i); }
  }
  while (pending.length) {
    const i = pending.pop(), row = Math.floor(i / size), col = i % size;
    if ((color === 1 ? row : col) === size - 1) return true;
    for (const [dr, dc] of [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]]) {
      const r = row + dr, c = col + dc, j = r * size + c;
      if (r >= 0 && r < size && c >= 0 && c < size && !seen.has(j) && cells[j] === color) {
        seen.add(j); pending.push(j);
      }
    }
  }
  return false;
}

const emptyCells = cells => cells.flatMap((color, move) => color === 0 ? [move] : []);

function oracle(size) {
  const memo = new Map();
  function canWin(cells, color) {
    if (connected(cells, size, 3 - color)) return false;
    if (connected(cells, size, color)) return true;
    const key = cells.join('') + color;
    if (memo.has(key)) return memo.get(key);
    if (immediateWinningMoves(cells, size, color).length) { memo.set(key, true); return true; }
    const threats = immediateWinningMoves(cells, size, 3 - color);
    if (threats.length > 1) { memo.set(key, false); return false; }
    // A single immediate threat forces its reply; no other move can survive.
    for (const move of threats.length ? threats : emptyCells(cells)) {
      cells[move] = color;
      const wins = !canWin(cells, 3 - color);
      cells[move] = 0;
      if (wins) { memo.set(key, true); return true; }
    }
    memo.set(key, false);
    return false;
  }
  return {
    canWin,
    winningMoves: (cells, color) => emptyCells(cells).filter(move => {
      cells[move] = color;
      const wins = !canWin(cells, 3 - color);
      cells[move] = 0;
      return wins;
    }),
  };
}

function transposeAndSwap(cells, size) {
  return Array.from({ length: cells.length }, (_, i) => {
    const color = cells[(i % size) * size + Math.floor(i / size)];
    return color ? 3 - color : 0;
  });
}

function reachablePositions(size) {
  const cells = Array(size * size).fill(0), seen = new Set(), positions = [];
  function visit(color) {
    if (connected(cells, size, 1) || connected(cells, size, 2)) return;
    const key = cells.join('');
    if (seen.has(key)) return;
    seen.add(key);
    positions.push({ cells: cells.slice(), color });
    for (const move of emptyCells(cells)) {
      cells[move] = color; visit(3 - color); cells[move] = 0;
    }
  }
  visit(1);
  return positions;
}

function immediateWinningMoves(cells, size, color) {
  return emptyCells(cells).filter(move => {
    cells[move] = color;
    const wins = connected(cells, size, color);
    cells[move] = 0;
    return wins;
  });
}

const hasImmediateWin = (cells, size, color) => immediateWinningMoves(cells, size, color).length > 0;

function assertWinningChoice(cells, size, color, seed, iterations = 2000) {
  const original = cells.slice(), winning = oracle(size).winningMoves(cells, color);
  assert.ok(winning.length, 'Fixture must admit a forced win.');
  const search = createSearch(cells, size, color, seeded(seed));
  // Batches exercise the same interface used by the browser's fallback search.
  for (let i = 0; i < iterations; i += 100) search.run(Math.min(100, iterations - i));
  assert.ok(winning.includes(search.best()),
    `${size}×${size}, color ${color}, seed ${seed}, cells ${cells.join('')}: expected one of ${winning}, got ${search.best()}`);
  assert.deepEqual(cells, original);
}

test('search finds oracle-winning moves across reachable 3 × 3 positions and both goal orientations', () => {
  const exact = oracle(3), positions = reachablePositions(3);
  assert.equal(positions.length, 4520);
  const buckets = new Map();
  for (const position of positions) {
    const { cells, color } = position, empty = emptyCells(cells).length;
    if (empty < 4 || hasImmediateWin(cells, 3, color) || !exact.canWin(cells, color)) continue;
    if (!buckets.has(empty)) buckets.set(empty, []);
    buckets.get(empty).push(position);
  }
  let samples = 0;
  for (const bucket of buckets.values()) {
    // Sample every stage of play instead of many nearly identical late boards.
    const count = Math.min(6, bucket.length);
    for (let i = 0; i < count; i++) {
      const { cells, color } = bucket[Math.floor(i * bucket.length / count)];
      for (const seed of [19 + samples, 829 + samples]) {
        assertWinningChoice(cells, 3, color, seed);
        assertWinningChoice(transposeAndSwap(cells, 3), 3, 3 - color, seed);
      }
      samples++;
    }
  }
  assert.ok(samples >= 25);
});

test('search plans a forced 5 × 5 endgame win beyond immediate threats', () => {
  const cells = [
    2, 1, 1, 1, 0,
    1, 2, 0, 0, 1,
    1, 2, 0, 2, 0,
    0, 0, 1, 1, 2,
    2, 2, 1, 2, 0,
  ];
  assert.equal(hasImmediateWin(cells, 5, 1), false);
  assert.equal(hasImmediateWin(cells, 5, 2), false);
  assert.deepEqual(oracle(5).winningMoves(cells, 2), [8]);
  // The old random-rollout search chooses the losing center (12) at seed 2317.
  for (const seed of [2317, 57, 810]) {
    assertWinningChoice(cells, 5, 2, seed, 3000);
    assertWinningChoice(transposeAndSwap(cells, 5), 5, 1, seed, 3000);
  }
});

test('search finds unique multi-reply wins before a 5 × 5 board is nearly full', () => {
  const fixtures = [
    {
      cells: [2, 2, 1, 2, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 1, 2, 1, 1, 2, 2, 0, 1, 1, 0, 0],
      color: 1, move: 8,
    },
    {
      cells: [1, 0, 1, 0, 0, 2, 0, 1, 2, 1, 1, 2, 0, 0, 0, 0, 2, 0, 1, 2, 1, 0, 0, 0, 2],
      color: 2, move: 13,
    },
    {
      cells: [0, 0, 2, 0, 0, 1, 2, 1, 2, 0, 0, 0, 0, 1, 1, 0, 1, 2, 2, 0, 0, 1, 0, 1, 2],
      color: 2, move: 11,
    },
  ];
  for (const { cells, color, move } of fixtures) {
    assert.ok(emptyCells(cells).length >= 11);
    assert.equal(hasImmediateWin(cells, 5, 1), false);
    assert.equal(hasImmediateWin(cells, 5, 2), false);
    assert.deepEqual(oracle(5).winningMoves(cells, color), [move]);
    for (const seed of [1, 2, 3]) {
      assertWinningChoice(cells, 5, color, seed, 3000);
      assertWinningChoice(transposeAndSwap(cells, 5), 5, 3 - color, seed, 3000);
    }
  }
});

test('sampling search identifies Red’s only winning continuation with 13 empty cells', () => {
  const cells = [
    0, 2, 1, 2, 0,
    0, 0, 0, 0, 0,
    0, 2, 0, 0, 1,
    2, 1, 1, 2, 2,
    0, 1, 1, 0, 0,
  ];
  // Clear one stone of each color from an endgame fixture, preserving the turn.
  // Thirteen empties puts this beyond the twelve-cell exact-search cutoff.
  assert.equal(emptyCells(cells).length, 13);
  assert.equal(hasImmediateWin(cells, 5, 1), false);
  assert.equal(hasImmediateWin(cells, 5, 2), false);
  assert.deepEqual(oracle(5).winningMoves(cells, 1), [8]);
  for (const seed of [1, 2, 3]) {
    assertWinningChoice(cells, 5, 1, seed, 4000);
    assertWinningChoice(transposeAndSwap(cells, 5), 5, 2, seed, 4000);
  }
});

test('sampling search finds Blue’s unique strategic win with 14 empty cells', () => {
  const cells = [
    0, 0, 1, 0, 0,
    2, 0, 1, 2, 1,
    1, 2, 0, 0, 0,
    0, 2, 0, 1, 0,
    1, 0, 0, 0, 2,
  ];
  assert.equal(emptyCells(cells).length, 14);
  assert.equal(hasImmediateWin(cells, 5, 1), false);
  assert.equal(hasImmediateWin(cells, 5, 2), false);
  assert.deepEqual(oracle(5).winningMoves(cells, 2), [13]);
  // The old random rollouts prefer losing moves 6 and 15 at seeds 1 and 3.
  for (const seed of [1, 2, 3]) {
    assertWinningChoice(cells, 5, 2, seed, 4000);
    assertWinningChoice(transposeAndSwap(cells, 5), 5, 1, seed, 4000);
  }
});

test('larger-board endgame search preserves forced wins under a goal-axis swap', () => {
  const cells = [
    2, 2, 2, 1, 1, 2, 2,
    1, 1, 1, 2, 1, 2, 1,
    1, 1, 2, 1, 0, 0, 2,
    1, 1, 2, 1, 2, 1, 1,
    1, 2, 2, 2, 2, 2, 1,
    0, 0, 1, 0, 2, 1, 2,
    0, 1, 2, 1, 0, 0, 2,
  ];
  assert.equal(hasImmediateWin(cells, 7, 1), false);
  assert.equal(hasImmediateWin(cells, 7, 2), false);
  assert.deepEqual(oracle(7).winningMoves(cells, 2), [35, 36, 42]);
  for (const seed of [190, 812]) {
    assertWinningChoice(cells, 7, 2, seed, 3000);
    assertWinningChoice(transposeAndSwap(cells, 7), 7, 1, seed, 3000);
  }
});

test('batched search captures its input position when callers later change their board', () => {
  const original = Array(25).fill(0);
  original[1] = 1; original[17] = 2;
  for (const seed of [31, 812]) {
    const mutable = original.slice(), fixed = original.slice();
    const randomA = seeded(seed), randomB = seeded(seed);
    let callsA = 0, callsB = 0;
    const searchA = createSearch(mutable, 5, 1, () => { callsA++; return randomA(); });
    const searchB = createSearch(fixed, 5, 1, () => { callsB++; return randomB(); });
    searchA.run(100); searchB.run(100);
    mutable.fill(2);
    searchA.run(400); searchB.run(400);
    assert.equal(callsA, callsB, 'An external edit must not change the simulated position or random sequence.');
    assert.equal(searchA.best(), searchB.best());
    assert.equal(searchA.visits(), searchB.visits());
    assert.deepEqual(fixed, original);
    assert.ok(mutable.every(color => color === 2));
    assert.equal(original[searchA.best()], 0);
  }
});

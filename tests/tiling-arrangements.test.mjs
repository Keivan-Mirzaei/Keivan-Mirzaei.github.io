import test from 'node:test';
import assert from 'node:assert/strict';
import { DIFFICULTIES, createArrangement, arrangementFingerprint } from '../assets/js/lib/tiling-arrangements.mjs';
import { placementCells, key, createGame, isSolved, solveTiling } from '../assets/js/lib/tiling.mjs';

function connected(cells) {
  const remaining = new Set(cells.map(c => key(...c))), queue = [cells[0]];
  remaining.delete(key(...cells[0]));
  while (queue.length) {
    const [x, y] = queue.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (remaining.delete(key(x + dx, y + dy))) queue.push([x + dx, y + dy]);
  }
  return !remaining.size;
}
DIFFICULTIES.forEach((config, difficulty) => {
  test(`${config.name}: 100 seeds keep the same difficulty budget and yield many complete fixed-orientation floors`, () => {
    const unique = new Set();
    for (let seed = 1; seed <= 100; seed++) {
      const level = createArrangement(difficulty, seed);
      assert.equal(level.difficulty, difficulty); assert.equal(level.width, config.width); assert.equal(level.height, config.height);
      assert.equal(level.holes.length, config.holes); assert.ok(connected(level.floor));
      assert.deepEqual(level.pieces.map(p => p.cells.length).sort(), [...config.sizes].sort());
      assert.ok(level.pieces.every(p => connected(p.cells)));
      const covered = level.pieces.flatMap(p => placementCells(p, level.solution[p.id]).map(c => key(...c)));
      assert.equal(new Set(covered).size, covered.length);
      assert.deepEqual(new Set(covered), new Set(level.floor.map(c => key(...c))));
      assert.ok(level.types.length <= 8); assert.equal(level.types.reduce((n, t) => n + t.count, 0), config.sizes.length);
      const game = createGame(level);
      for (const p of level.pieces) assert.equal(game.place(p.id, level.solution[p.id]).valid, true);
      assert.equal(game.solved, true); assert.equal(game.filled, level.floor.length);
      unique.add(arrangementFingerprint(level));
    }
    assert.ok(unique.size >= 80, `${unique.size} distinct arrangements`);
  });
});

test('an arrangement is reproducible after cache eviction and rejects invalid seeds', () => {
  const original = structuredClone(createArrangement(3, 42));
  for (let seed = 100; seed < 140; seed++) createArrangement(2, seed);
  assert.deepEqual(createArrangement(3, 42), original);
  for (const [difficulty, seed] of [[-1, 1], [4, 1], [0, 0], [0, 0x100000000], [1, NaN]]) assert.throws(() => createArrangement(difficulty, seed), RangeError);
});

test('hints handle interchangeable copies placed at each other’s solution anchors', () => {
  const level = createArrangement(0, 1), copies = level.types.find(t => t.count > 1).ids;
  const placed = { [copies[0]]: level.solution[copies[1]] };
  const answer = solveTiling(level, placed);
  assert.ok(isSolved(level, answer)); assert.deepEqual(answer[copies[0]], placed[copies[0]]);
});

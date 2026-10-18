import test from 'node:test';
import assert from 'node:assert/strict';
import { HEX_DIFFICULTIES, searchBudget } from '../assets/js/lib/hex-search-settings.mjs';
import { RED, BLUE, hexBoard, hexGeometry, winningPath, winner, legalMoves, createSearch, coastline, PROOF_EXAMPLE } from '../assets/js/lib/hex-math.mjs';

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}

test('hexagonal neighbors are reciprocal, with six interior neighbors and real bridges', () => {
  const board = hexBoard(5);
  assert.deepEqual(board.neighbors[12].slice().sort((a, b) => a - b), [7, 8, 11, 13, 16, 17]);
  for (let i = 0; i < board.count; i++) for (const j of board.neighbors[i]) assert.ok(board.neighbors[j].includes(i));
  assert.equal(board.neighbors[7].includes(13), false);
  assert.deepEqual(board.neighbors[7].filter(i => board.neighbors[13].includes(i)).sort((a, b) => a - b), [8, 12]);
});

test('goals, corner membership, bent connections, and gaps use the correct adjacency', () => {
  const red = [1, 0, 0, 0, 1, 0, 0, 0, 1]; // These corner-touching cells do not share sides.
  assert.equal(winner(red, 3), 0);
  const bent = [0, 1, 0, 1, 0, 0, 1, 0, 0];
  assert.deepEqual(winningPath(bent, 3, RED), [1, 3, 6]);
  const blue = [2, 2, 2, 0, 0, 0, 0, 0, 0];
  assert.equal(winner(blue, 3), BLUE);
  assert.equal(winningPath(blue, 3, RED).length, 0);
});

test('every complete coloring through 3 × 3 has exactly one winner and a nonbranching coast to it', () => {
  for (let n = 1; n <= 3; n++) for (let mask = 0; mask < 2 ** (n * n); mask++) {
    const cells = Array.from({ length: n * n }, (_, i) => 1 + ((mask >> i) & 1));
    const red = winningPath(cells, n, RED), blue = winningPath(cells, n, BLUE);
    assert.equal(Boolean(red.length) !== Boolean(blue.length), true, `Coloring ${mask} on ${n} × ${n}`);
    const coast = coastline(cells, n);
    assert.equal(coast.winner, red.length ? RED : BLUE);
    assert.ok(['NE', 'SW'].includes(coast.end));
    assert.equal(new Set(coast.vertices).size, coast.vertices.length);
    for (const [vertex, edges] of coast.graph) assert.equal(edges.length, vertex.startsWith('port-') ? 1 : 2);
    assert.ok(coast.path.every(i => cells[i] === coast.winner));
  }
});

test('larger arbitrary boards also produce a winning chain beside the traced coast', () => {
  const random = seeded(410);
  for (const n of [5, 7, 11]) for (let k = 0; k < 100; k++) {
    const cells = Array.from({ length: n * n }, () => random() < .5 ? RED : BLUE), coast = coastline(cells, n);
    assert.equal(coast.winner, winner(cells, n));
    assert.ok(coast.path.length >= n);
  }
  assert.equal(coastline(PROOF_EXAMPLE, 5).end, 'SW');
  assert.equal(hexGeometry(5).ports.length, 4);
  assert.throws(() => coastline(Array(25).fill(0), 5));
});

test('search opponents play legal moves without mutating their input', () => {
  const random = seeded(911), cells = Array(25).fill(0), original = cells.slice();
  const search = createSearch(cells, 5, BLUE, random);
  search.run(700);
  assert.equal(search.visits(), 700);
  assert.ok(legalMoves(cells).includes(search.best()));
  assert.deepEqual(cells, original);
  for (const level of HEX_DIFFICULTIES) {
    const position = Array(9).fill(0);
    for (let color = RED; !winner(position, 3); color = 3 - color) {
      const opponent = createSearch(position, 3, color, random, searchBudget(3, level));
      opponent.run(250);
      const move = opponent.best();
      assert.ok(legalMoves(position).includes(move)); position[move] = color;
    }
    assert.equal(createSearch(position, 3, RED, random, searchBudget(3, level)).best(), -1);
  }
});

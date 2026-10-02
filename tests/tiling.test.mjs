import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, normalizeShape, transformShape, orientations, placementCells, checkPlacement, occupiedCells, isSolved, solveTiling, createGame, key } from '../assets/js/lib/tiling.mjs';

function connected(cells) {
  const remaining = new Set(cells.map(([x, y]) => key(x, y))), pending = [cells[0]];
  remaining.delete(key(...cells[0]));
  while (pending.length) {
    const [x, y] = pending.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = key(x + dx, y + dy);
      if (remaining.delete(next)) pending.push([x + dx, y + dy]);
    }
  }
  return remaining.size === 0;
}

for (const level of LEVELS) {
  test(`challenge ${level.id} has connected tiles, a connected cut-out floor and an exact known solution`, () => {
    assert.ok(level.holes.length > 0 && level.holes.length < level.width * level.height);
    assert.equal(level.floor.length + level.holes.length, level.width * level.height);
    assert.ok(connected(level.floor));
    assert.ok(level.pieces.length >= 4 && level.pieces.length <= 8);
    assert.ok(level.pieces.every(piece => connected(piece.cells)));
    assert.equal(level.pieces.reduce((sum, piece) => sum + piece.cells.length, 0), level.floor.length);
    const all = level.pieces.flatMap(piece => placementCells(piece, level.solution[piece.id]).map(([x, y]) => key(x, y)));
    assert.equal(new Set(all).size, all.length);
    assert.deepEqual(new Set(all), new Set(level.floor.map(([x, y]) => key(x, y))));
    assert.ok(isSolved(level, level.solution));
    for (const piece of level.pieces) assert.equal(checkPlacement(level, level.solution, piece.id, level.solution[piece.id]).valid, true);
  });
  test(`solver fills challenge ${level.id} while respecting a placed tile`, () => {
    const first = level.pieces[0].id, fixed = { [first]: { ...level.solution[first] } };
    const answer = solveTiling(level, fixed);
    assert.ok(answer);
    assert.deepEqual(answer[first], fixed[first]);
    assert.ok(isSolved(level, answer));
    assert.deepEqual(fixed, { [first]: level.solution[first] });
  });
}

test('rotation and flipping keep geometry connected and preserve every square', () => {
  const shape = [[4, 3], [4, 4], [4, 5], [5, 5]];
  assert.deepEqual(normalizeShape(shape), [[0, 0], [0, 1], [0, 2], [1, 2]]);
  const all = orientations(shape);
  assert.equal(all.length, 8);
  for (const orientation of all) {
    assert.equal(orientation.cells.length, shape.length);
    assert.equal(new Set(orientation.cells.map(([x, y]) => key(x, y))).size, shape.length);
    assert.ok(connected(orientation.cells));
    assert.equal(Math.min(...orientation.cells.map(cell => cell[0])), 0);
    assert.equal(Math.min(...orientation.cells.map(cell => cell[1])), 0);
  }
  assert.deepEqual(transformShape(shape, { rotation: 4 }), normalizeShape(shape));
  assert.deepEqual(transformShape(shape, { rotation: -1 }), transformShape(shape, { rotation: 3 }));
  assert.equal(orientations([[0, 0], [1, 0], [0, 1], [1, 1]]).length, 1);
  assert.equal(orientations([[0, 0], [1, 0], [2, 0]]).length, 2);
});

test('placements reject outside squares, holes, overlapping pieces and malformed coordinates', () => {
  const level = LEVELS[0];
  assert.equal(checkPlacement(level, {}, 'A', { x: -1, y: 0 }).reason, 'outside');
  assert.equal(checkPlacement(level, {}, 'A', { x: 3, y: 3 }).reason, 'outside');
  assert.equal(checkPlacement(level, {}, 'A', { x: 2, y: 0 }).reason, 'hole');
  assert.equal(checkPlacement(level, { A: level.solution.A }, 'B', { x: 0, y: 0 }).reason, 'overlap');
  assert.equal(checkPlacement(level, {}, 'A', { x: 0.5, y: 0 }).reason, 'position');
  assert.equal(checkPlacement(level, {}, 'A', { x: 0, y: 0, rotation: NaN }).reason, 'position');
  assert.equal(checkPlacement(level, {}, 'X', { x: 0, y: 0 }).reason, 'unknown');
  assert.equal(checkPlacement(level, { A: level.solution.A }, 'A', level.solution.A).valid, true);
});

test('returning, moving, undoing and reset preserve a legal complete game', () => {
  const level = LEVELS[0], game = createGame(level);
  assert.equal(game.filled, 0); assert.equal(game.canUndo, false); assert.equal(game.solved, false);
  for (const piece of level.pieces) assert.equal(game.place(piece.id, level.solution[piece.id]).valid, true);
  assert.equal(game.moves, 4); assert.equal(game.filled, level.floor.length); assert.equal(game.solved, true);
  const before = game.placements;
  assert.equal(game.place('A', { x: 2, y: 0 }).valid, false);
  assert.deepEqual(game.placements, before); assert.equal(game.moves, 4);
  assert.equal(game.place('A', level.solution.A).changed, false);
  assert.equal(game.moves, 4);
  assert.equal(game.remove('D'), true); assert.equal(game.solved, false);
  assert.equal(game.remove('D'), false); assert.equal(game.moves, 5);
  assert.equal(game.undo(), true); assert.equal(game.solved, true); assert.equal(game.moves, 4);
  assert.equal(game.undo(), true); assert.equal(game.solved, false); assert.equal(game.moves, 3);
  assert.equal(game.place('D', level.solution.D).valid, true); assert.equal(game.solved, true);
  const exposed = game.placements; exposed.A.x = 99;
  assert.deepEqual(game.placements.A, level.solution.A);
  game.reset(); assert.equal(game.moves, 0); assert.equal(game.canUndo, false); assert.equal(game.filled, 0);
  assert.equal(game.undo(), false);
});

test('solver finds alternative solutions and does not move already placed pieces', () => {
  const level = LEVELS[0];
  let alternate = null;
  for (const piece of level.pieces) for (const orientation of orientations(piece.cells)) {
    for (let y = 0; y < level.height && !alternate; y++) for (let x = 0; x < level.width && !alternate; x++) {
      const position = { x, y, rotation: orientation.rotation, flipped: orientation.flipped };
      if (JSON.stringify(position) === JSON.stringify(level.solution[piece.id])) continue;
      if (!checkPlacement(level, {}, piece.id, position).valid) continue;
      const answer = solveTiling(level, { [piece.id]: position });
      if (answer) alternate = { id: piece.id, position, answer };
    }
  }
  assert.ok(alternate);
  assert.deepEqual(alternate.answer[alternate.id], alternate.position);
  assert.ok(isSolved(level, alternate.answer));
});

test('solver reports legal placements that block all remaining tiles', () => {
  const level = LEVELS[0];
  let blocked = null;
  for (const piece of level.pieces) for (const orientation of orientations(piece.cells)) {
    for (let y = 0; y < level.height && !blocked; y++) for (let x = 0; x < level.width && !blocked; x++) {
      const position = { x, y, rotation: orientation.rotation, flipped: orientation.flipped };
      if (checkPlacement(level, {}, piece.id, position).valid && !solveTiling(level, { [piece.id]: position })) blocked = { [piece.id]: position };
    }
  }
  assert.ok(blocked);
  assert.equal(solveTiling(level, blocked), null);
  assert.equal(solveTiling(level, { A: { x: 99, y: 0 } }), null);
  assert.equal(solveTiling(level, { Unknown: { x: 0, y: 0 } }), null);
});

test('winning requires the whole floor and all tiles, without overlap or holes', () => {
  const level = LEVELS[0];
  assert.equal(isSolved(level, {}), false);
  const incomplete = { ...level.solution }; delete incomplete.C;
  assert.equal(isSolved(level, incomplete), false);
  const overlap = { ...level.solution, B: level.solution.A };
  assert.equal(isSolved(level, overlap), false);
  assert.equal(occupiedCells(level, level.solution).size, level.floor.length);
  assert.equal(isSolved(level, { ...level.solution, Unknown: level.solution.A }), false);
});

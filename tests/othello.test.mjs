import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, flips, legalMoves, play, chooseMove, validState } from '../assets/js/lib/othello-math.mjs';
test('standard opening and capture', () => {
  const start = initialState();
  assert.deepEqual(legalMoves(start.cells, 1), [19, 26, 37, 44]);
  const next = play(start, 19);
  assert.equal(next.cells[27], 1); assert.equal(next.turn, 2);
  assert.equal(start.cells[27], 2); assert.equal(play(start, 0), null);
});
test('captures every direction without wrapping edges', () => {
  const cells = Array(64).fill(0);
  for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    cells[(3+dr)*8+3+dc] = 2; cells[(3+2*dr)*8+3+2*dc] = 1;
  }
  assert.equal(flips(cells, 27, 1).length, 8);
  const edge = Array(64).fill(0); edge[8] = 2; edge[9] = 1;
  assert.deepEqual(flips(edge, 7, 1), []);
});
test('forced pass and end before a full board', () => {
  const cells = Array(64).fill(1); cells[0]=0; cells[1]=2; cells[3]=0; cells[4]=2;
  const next = play({cells, turn:1, last:-1}, 0);
  assert.equal(next.turn, 1);
  assert.equal(play(next, 3).turn, 0);
  const end = Array(64).fill(1); end[0]=0; end[1]=2; end[63]=0;
  const result = play({cells:end, turn:1, last:-1}, 0);
  assert.equal(result.turn,0); assert.equal(result.cells[63],0);
});
test('computer completes a legal game and stored state is validated', () => {
  let state = initialState(), count=0;
  while (state.turn && count++ < 64) {
    const move = chooseMove(state, 1);
    assert.ok(legalMoves(state.cells, state.turn).includes(move));
    state = play(state, move); assert.ok(validState(state));
  }
  assert.equal(state.turn,0); assert.ok(count<=60);
  assert.ok(!validState({...state, cells: [1]}));
  assert.ok(!validState({...initialState(), turn:0}));
});

test('Easy chooses immediate captures while every level returns legal moves', async () => {
  const { chooseComputerMove, DIFFICULTIES } = await import('../assets/js/lib/othello-math.mjs');
  let state = initialState();
  for (let i = 0; i < 18; i++) {
    const moves = legalMoves(state.cells, state.turn);
    state = play(state, moves[(i * 7 + 3) % moves.length]);
  }
  const moves = legalMoves(state.cells, state.turn);
  const easy = chooseComputerMove(state, 'easy');
  assert.equal(flips(state.cells, easy, state.turn).length, Math.max(...moves.map(move => flips(state.cells, move, state.turn).length)));
  for (const level of Object.keys(DIFFICULTIES)) assert.ok(moves.includes(chooseComputerMove(state, level)));
});

test('Expert finds an optimal ending, including forced passes', async () => {
  const { chooseComputerMove } = await import('../assets/js/lib/othello-math.mjs');
  let state = initialState();
  while (state.turn && state.cells.filter(c => !c).length > 6) {
    const moves = legalMoves(state.cells, state.turn);
    state = play(state, moves[(state.cells.filter(Boolean).length * 7) % moves.length]);
  }
  assert.ok(state.turn);
  const player = state.turn;
  function exact(position) {
    if (!position.turn) return position.cells.reduce((sum, c) => sum + (c === player ? 1 : c ? -1 : 0), 0);
    const scores = legalMoves(position.cells, position.turn).map(move => exact(play(position, move)));
    return position.turn === player ? Math.max(...scores) : Math.min(...scores);
  }
  const scores = legalMoves(state.cells, state.turn).map(move => exact(play(state, move)));
  const choice = chooseComputerMove(state, 'expert');
  assert.equal(exact(play(state, choice)), Math.max(...scores));
  assert.equal(chooseComputerMove({ cells: Array(64).fill(1), turn: 0, last: 0 }, 'expert'), null);
});

test('Medium takes a safe corner instead of Easy’s larger immediate capture', async () => {
  const { chooseComputerMove } = await import('../assets/js/lib/othello-math.mjs');
  const cells = Array(64).fill(0);
  cells[1] = 2; cells[2] = 1;
  cells[28] = cells[29] = cells[30] = 2; cells[31] = 1;
  const state = { cells, turn: 1, last: -1 };
  assert.equal(chooseComputerMove(state, 'easy'), 27);
  assert.equal(chooseComputerMove(state, 'medium'), 0);
});

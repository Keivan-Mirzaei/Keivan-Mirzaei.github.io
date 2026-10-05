import test from 'node:test';
import assert from 'node:assert/strict';
import { createTilingWorkspace, TILING_HISTORY_LIMIT } from '../assets/js/lib/tiling-workspace.mjs';
import { createPuzzleBook } from '../assets/js/lib/tiling-book.mjs';
import { createGame } from '../assets/js/lib/tiling.mjs';

const solve = play => {
  for (const piece of play.game.level.pieces) assert.equal(play.place(piece.id, play.game.level.solution[piece.id]).valid, true);
};
const state = play => ({ difficulty: play.book.difficulty, number: play.book.number, placements: play.game.placements, moves: play.game.moves, solved: play.game.solved });

test('Reset is one reversible action, including completion, placements and counts', () => {
  const play = createTilingWorkspace(); solve(play);
  const completed = state(play);
  assert.equal(play.book.completedCount, 1);
  assert.equal(play.reset(), true); assert.equal(play.game.filled, 0); assert.equal(play.game.moves, 0);
  assert.equal(play.undo(), true); assert.deepEqual(state(play), completed);
  assert.equal(play.redo(), true); assert.equal(play.game.filled, 0);
  assert.equal(play.book.completedCount, 1);
  play.undo(); play.undo(); assert.equal(play.game.solved, false); assert.equal(play.book.completedCount, 1);
});

test('Shuffle, number changes and difficulty changes restore exact boards across saving', () => {
  let play = createTilingWorkspace();
  play.place('A', play.game.level.solution.A);
  const first = state(play);
  play.shuffle(() => .4); const second = state(play);
  assert.notEqual(second.number, first.number);
  play.undo(); assert.deepEqual(state(play), first);
  play = createTilingWorkspace(play.exportState());
  play.redo(); assert.deepEqual(state(play), second);
  play.changeDifficulty(3); const expert = state(play);
  play.open(1000); const last = state(play);
  play.undo(); assert.deepEqual(state(play), expert);
  play.undo(); assert.deepEqual(state(play), second);
  play.redo(); play.redo(); assert.deepEqual(state(play), last);
});

test('invalid and unchanged placements do not create history or discard Redo', () => {
  const play = createTilingWorkspace();
  play.place('A', play.game.level.solution.A);
  assert.equal(play.place('A', play.game.level.solution.A).changed, false);
  play.undo(); assert.equal(play.canUndo, false); assert.equal(play.canRedo, true);
  assert.equal(play.place('A', { x: -1, y: 0 }).valid, false);
  assert.equal(play.canRedo, true); assert.equal(play.open(1001), false);
  play.place('B', play.game.level.solution.B); assert.equal(play.canRedo, false);
});

test('progress reset clears only this difficulty and preserves other boards, completions and histories across reload', () => {
  const play = createTilingWorkspace(); solve(play);
  play.open(2); play.place('A', play.game.level.solution.A); const easy = state(play);
  play.changeDifficulty(2); play.open(80); solve(play); play.undo();
  const before = play.exportState();
  play.resetProgress();
  assert.equal(play.book.difficulty, 2); assert.equal(play.book.number, 1);
  assert.equal(play.game.filled, 0);
  const saved = play.exportState();
  assert.equal(saved.sessions[2].number, 1); assert.deepEqual(saved.sessions[2].completed, []);
  assert.deepEqual(saved.sessions[2].overrides, {});
  for (const index of [0, 1, 3]) assert.deepEqual(saved.sessions[index], before.sessions[index]);
  for (const name of ['past', 'future']) assert.deepEqual(saved.actions[name], before.actions[name].filter(entry => entry.difficulty !== 2));
  const restored = createTilingWorkspace(saved); assert.deepEqual(restored.exportState(), saved);
  restored.changeDifficulty(0); assert.deepEqual(state(restored), easy); assert.equal(restored.book.completedCount, 1);
  restored.undo(); assert.equal(restored.book.difficulty, 2); assert.equal(restored.game.filled, 0);
  assert.equal(restored.book.completedCount, 0);
  restored.undo(); assert.deepEqual(state(restored), easy);
  restored.undo(); assert.equal(restored.book.difficulty, 0); assert.equal(restored.game.filled, 0);
  restored.redo(); assert.deepEqual(state(restored), easy);
});

test('progress reset removes both histories when only this difficulty has been played', () => {
  const play = createTilingWorkspace(); play.place('A', play.game.level.solution.A); play.undo();
  play.resetProgress(); assert.equal(play.canUndo, false); assert.equal(play.canRedo, false);
  assert.equal(play.game.filled, 0); assert.equal(play.book.number, 1);
});

test('legacy per-floor histories migrate while generated catalogue overrides remain playable', () => {
  const book = createPuzzleBook({ difficulty: 0, sessions: { 0: { seed: 97, round: 23 } } });
  const game = createGame(book.level);
  game.place('A', game.level.solution.A); game.place('B', game.level.solution.B); game.undo();
  book.record(game.exportState(), false);
  const play = createTilingWorkspace(book.exportState());
  assert.deepEqual(play.game.level, game.level);
  assert.deepEqual(play.game.placements, game.placements); assert.equal(play.canUndo, true); assert.equal(play.canRedo, true);
  play.redo(); assert.equal(Object.keys(play.game.placements).length, 2);
  play.undo(); play.undo(); assert.equal(play.game.filled, 0);
  play.redo(); assert.deepEqual(play.game.placements, game.placements);
});

test('corrupt history is rejected and storage stays bounded without nested move histories', () => {
  let play = createTilingWorkspace();
  for (let i = 0; i < 140; i++) { play.place('A', play.game.level.solution.A); play.remove('A'); }
  const saved = play.exportState();
  assert.equal(saved.actions.past.length, TILING_HISTORY_LIMIT);
  assert.equal(saved.actions.past.every(entry => !entry.state.history && !entry.state.future), true);
  const current = state(play);
  saved.actions.past.push({ difficulty: 0, number: 1, state: { placements: { A: { x: -1, y: 0 } }, moves: 1 } });
  play = createTilingWorkspace(saved); assert.deepEqual(state(play), current); assert.equal(play.canUndo, false);
});

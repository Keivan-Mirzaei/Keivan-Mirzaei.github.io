import test from 'node:test';
import assert from 'node:assert/strict';
import { createLightsOutWorkspace, LIGHTS_OUT_HISTORY_LIMIT } from '../assets/js/lib/lights-out-workspace.mjs';
import { createLightsOutBook, createLightsOutGame } from '../assets/js/lib/lights-out-book.mjs';
import { LIGHTS_OUT_CATALOGUE } from '../assets/js/lib/lights-out-catalogue.mjs';

const catalogue = LIGHTS_OUT_CATALOGUE.map(puzzles => puzzles.slice(0, 3));
const solve = play => { while (!play.game.solved) assert.equal(play.press(play.game.hint()), true); };
const position = play => ({ number: play.book.number, difficulty: play.book.difficulty, lights: play.game.lights, moves: play.game.moves });

test('board Reset restores the start and Undo/Redo preserve the exact completed position', () => {
  const play = createLightsOutWorkspace(null, catalogue); solve(play);
  const won = position(play); assert.equal(play.book.completedCount, 1);
  assert.equal(play.reset(), true); assert.equal(play.game.moves, 0); assert.equal(play.game.solved, false);
  assert.equal(play.undo(), true); assert.deepEqual(position(play), won);
  assert.equal(play.book.completedCount, 1); assert.equal(play.game.solved, true);
  assert.equal(play.redo(), true); assert.equal(play.game.moves, 0);
});

test('Shuffle and puzzle navigation preserve settings, progress, and an undoable board', () => {
  const play = createLightsOutWorkspace(null, catalogue); play.press(0); const before = position(play);
  play.shuffle(() => .99); assert.equal(play.book.number, 3);
  play.undo(); assert.deepEqual(position(play), before);
  play.redo(); assert.equal(play.book.number, 3);
  play.changeDifficulty(2); assert.equal(play.book.difficulty, 2);
  play.open(2); const chosen = position(play);
  const saved = play.exportState(), reloaded = createLightsOutWorkspace(saved, catalogue);
  assert.deepEqual(position(reloaded), chosen);
  reloaded.undo(); assert.equal(reloaded.book.number, 1); assert.equal(reloaded.book.difficulty, 2);
  reloaded.undo(); assert.equal(reloaded.book.number, 3); assert.equal(reloaded.book.difficulty, 0);
});

test('new presses discard a navigation Redo branch and solved records survive Undo', () => {
  const play = createLightsOutWorkspace(null, catalogue); solve(play);
  play.undo(); assert.equal(play.game.solved, false); assert.equal(play.book.completedCount, 1);
  play.shuffle(() => 0); play.undo(); play.press(play.game.hint());
  assert.equal(play.canRedo, false); assert.equal(play.book.completedCount, 1);
});

test('Reset progress clears only the selected difficulty and preserves other boards, completions and history across reload', () => {
  const play = createLightsOutWorkspace(null, catalogue); solve(play);
  play.open(2); play.press(0); const easy = position(play);
  play.changeDifficulty(2); solve(play); play.open(2); play.press(0); play.undo();
  const before = play.exportState();
  play.resetProgress();
  assert.equal(play.book.difficulty, 2); assert.equal(play.book.number, 1); assert.equal(play.game.moves, 0);
  const saved = play.exportState();
  assert.deepEqual(saved.sessions[2].completed, []); assert.equal(saved.sessions[2].number, 1);
  for (const index of [0, 1, 3]) assert.deepEqual(saved.sessions[index], before.sessions[index]);
  for (const name of ['past', 'future']) assert.deepEqual(saved.actions[name], before.actions[name].filter(entry => entry.difficulty !== 2));
  const restored = createLightsOutWorkspace(saved, catalogue);
  assert.deepEqual(restored.exportState(), saved);
  restored.changeDifficulty(0); assert.deepEqual(position(restored), easy); assert.equal(restored.book.completedCount, 1);
  restored.undo(); assert.equal(restored.book.difficulty, 2); assert.equal(restored.game.moves, 0);
  assert.equal(restored.book.completedCount, 0);
  restored.undo(); assert.deepEqual(position(restored), easy);
  restored.undo(); assert.equal(restored.book.difficulty, 0); assert.equal(restored.game.moves, 0);
  restored.redo(); assert.deepEqual(position(restored), easy);
});

test('Reset progress removes both histories when only this difficulty has been played', () => {
  const play = createLightsOutWorkspace(null, catalogue); play.press(0); play.undo();
  play.resetProgress(); assert.equal(play.canUndo, false); assert.equal(play.canRedo, false);
  assert.equal(play.game.moves, 0); assert.equal(play.book.number, 1);
});

test('older board histories still undo and redo, while corrupt action histories are ignored', () => {
  const book = createLightsOutBook(null, catalogue), game = createLightsOutGame(book.puzzle);
  game.press(0); const moved = game.lights; game.undo(); book.record(game.exportState(), false);
  const play = createLightsOutWorkspace(book.exportState(), catalogue);
  assert.equal(play.canRedo, true); play.redo(); assert.equal(play.game.lights, moved);
  play.undo(); assert.equal(play.game.moves, 0);
  const bad = createLightsOutWorkspace({ ...book.exportState(), actions: { past: [{ difficulty: 99, number: 1, state: { moves: [], future: [] } }] } }, catalogue);
  assert.equal(bad.exportState().actions.past.length, 0);
});

test('blocked actions do not enter history, and saved action history stays bounded', () => {
  const play = createLightsOutWorkspace(null, catalogue);
  assert.equal(play.reset(), false); assert.equal(play.open(99), false); assert.equal(play.press(999), false);
  assert.equal(play.canUndo, false);
  for (let i = 0; i < LIGHTS_OUT_HISTORY_LIMIT + 10; i++) play.open(i % 2 + 2);
  assert.equal(play.exportState().actions.past.length, LIGHTS_OUT_HISTORY_LIMIT);
});

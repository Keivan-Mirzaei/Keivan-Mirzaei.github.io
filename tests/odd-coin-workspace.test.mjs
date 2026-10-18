import test from 'node:test';
import assert from 'node:assert/strict';
import { createOddCoinWorkspace } from '../assets/js/lib/odd-coin-book.mjs';
import { suggestWeighing, remainingStates, minimumWeighings } from '../assets/js/lib/odd-coin-math.mjs';

function solve(workspace) {
  while (workspace.states.length > 1) {
    const hint = suggestWeighing(workspace.puzzle.coins, workspace.states, minimumWeighings(workspace.puzzle.coins, workspace.states));
    assert.ok(hint); workspace.clearPans(); workspace.arrange(hint.left, hint.right);
    assert.equal(workspace.weigh(), true); assert.ok(workspace.states.length > 0);
  }
  assert.equal(workspace.solved, false, 'deducing an answer never submits it for the player');
  assert.equal(workspace.submitAnswer(workspace.states[0]).ok, true);
  assert.equal(workspace.solved, true); assert.ok(workspace.answer);
}

test('only a correct, forced answer completes a puzzle; a single remaining state is not revealed automatically', () => {
  const w = createOddCoinWorkspace();
  assert.equal('secret' in w.puzzle, false); assert.equal(w.answer, null); assert.equal(w.weigh(), false);
  assert.deepEqual(w.submitAnswer([1, 1]), { ok: false, reason: 'uncertain' });
  assert.equal(w.used, 0); assert.equal(w.completedCount, 0);
  w.moveCoins([1], 1); w.moveCoins([2], -1); w.weigh();
  assert.equal(w.solved, false); assert.equal(w.answer, null); assert.equal(w.completedCount, 0);
  assert.deepEqual(w.submitAnswer([1, 1]), { ok: false, reason: 'contradicted' });
  assert.deepEqual(w.submitAnswer([3, -1]), { ok: false, reason: 'contradicted' });
  assert.deepEqual(w.submitAnswer([3, 1]), { ok: true, used: 1, minimum: 1 });
  assert.deepEqual(w.answer, [3, 1]); assert.deepEqual(w.placements, [1, -1, 0]);
  assert.equal(w.completedCount, 1); assert.equal(w.weigh(), false); assert.equal(w.moveCoins([3], 1), false);
  w.undo(); assert.equal(w.solved, false); assert.equal(w.used, 1); assert.ok(w.result); assert.equal(w.completedCount, 1);
  w.redo(); assert.deepEqual(w.answer, [3, 1]);
  const r = createOddCoinWorkspace(w.exportState()); assert.deepEqual(r.answer, w.answer); assert.deepEqual(r.placements, w.placements);
});

test('play continues beyond the optimal threshold, and the score compares actual weighings with the original minimum', () => {
  const w = createOddCoinWorkspace(); w.changeDifficulty(1); w.open(8);
  for (const other of [2, 3, 4, 5]) {
    w.arrange([1], [other]); assert.equal(w.weigh(), true); assert.equal(w.result.outcome, 0);
  }
  assert.equal(w.used, 4); assert.equal(w.minimum, 3); assert.equal(w.solved, false);
  assert.deepEqual(w.states, remainingStates(w.puzzle, w.log));
  const restored = createOddCoinWorkspace(w.exportState()); assert.equal(restored.used, 4); assert.equal(restored.solved, false);
  solve(restored); assert.ok(restored.used > restored.minimum); assert.equal(restored.minimum, 3);
  restored.reset(); assert.equal(restored.used, 0); assert.equal(restored.minimum, 3); assert.equal(restored.states.length, 24);
});

test('extra weighings remain possible even after an answer is logically forced', () => {
  const w = createOddCoinWorkspace(); w.arrange([1], [2]); w.weigh();
  w.clearPans(); w.arrange([1], [3]); assert.equal(w.weigh(), true);
  assert.equal(w.used, 2); assert.equal(w.answer, null); assert.equal(w.completedCount, 0);
  assert.deepEqual(w.submitAnswer([3, 1]), { ok: true, used: 2, minimum: 1 });
  assert.deepEqual(w.puzzleResult(1), { minimum: 1, best: 2, status: 'solved' });
});

test('minimum badges preserve the best weighing count through replay, Undo, saving and scoped reset', () => {
  let w = createOddCoinWorkspace(); solve(w);
  assert.deepEqual(w.puzzleResult(1), { minimum: 1, best: 1, status: 'minimum' });
  w.undo(); assert.equal(w.puzzleResult(1).status, 'minimum'); w.redo();
  w.reset(); w.arrange([1], [2]); w.weigh(); w.arrange([1], [3]); w.weigh(); w.submitAnswer([3, 1]);
  assert.equal(w.puzzleResult(1).best, 1);
  w = createOddCoinWorkspace(w.exportState()); assert.equal(w.puzzleResult(1).status, 'minimum');
  w.changeDifficulty(1); solve(w); w.resetProgress(); assert.equal(w.puzzleResult(1).status, 'unsolved');
  w.changeDifficulty(0); assert.equal(w.puzzleResult(1).status, 'minimum');
});

test('Next unsolved follows coin puzzle order, wraps and skips completed cases', () => {
  const w = createOddCoinWorkspace(); w.open(2); solve(w);
  w.next(); assert.equal(w.number, 3);
  w.open(250); w.next(); assert.equal(w.number, 1);
  w.moveCoins([1], 1); const before = w.exportState().sessions[0].game;
  w.next(); assert.equal(w.number, 3);
  w.undo(); assert.equal(w.number, 1); assert.deepEqual(w.exportState().sessions[0].game, before);
  w.redo(); assert.equal(w.number, 3);
});

test('reweighing the same coins replays the result without consuming moves or undo history', () => {
  const w = createOddCoinWorkspace(); w.arrange([1], [2]); w.weigh();
  const saved = w.exportState(), result = w.result;
  assert.equal(w.weigh(), true); assert.deepEqual(w.result, result);
  assert.deepEqual(w.exportState(), saved, 'an unchanged replay is not a new action');
  w.labelCoins([3], { mark: 1 }); w.undo();
  assert.equal(w.canRedo, true); assert.equal(w.weigh(), true); assert.equal(w.canRedo, true);
  assert.equal(w.used, 1); w.redo(); assert.equal(w.labels[3].mark, 1);
  assert.equal(w.weigh(), true); assert.equal(w.used, 1);
});

test('earlier comparisons and reversed pans replay consistently after further evidence and reload', () => {
  const w = createOddCoinWorkspace(); w.changeDifficulty(1); w.open(8);
  w.arrange([1, 2], [3, 4]); w.weigh(); const first = w.result;
  w.arrange([1], [5]); w.weigh(); assert.equal(w.used, 2);
  w.arrange([2, 1], [4, 3]); assert.equal(w.result, null);
  assert.equal(w.weigh(), true); assert.deepEqual(w.result, first); assert.equal(w.used, 2);
  let r = createOddCoinWorkspace(w.exportState());
  assert.deepEqual(r.placements, w.placements); assert.deepEqual(r.result, first);
  r.arrange([3, 4], [1, 2]); r.weigh(); assert.equal(r.used, 2);
  assert.equal(r.result.outcome, -first.outcome || 0);
  r = createOddCoinWorkspace(r.exportState());
  assert.deepEqual(r.result.left, [3, 4]); assert.deepEqual(r.result.right, [1, 2]);
  assert.equal(r.result.outcome, -first.outcome || 0); assert.equal(r.used, 2);
  const tilted = createOddCoinWorkspace(); tilted.arrange([1], [2]); tilted.weigh(); tilted.arrange([1], [3]); tilted.weigh();
  assert.notEqual(tilted.result.outcome, 0);
  const outcome = tilted.result.outcome; tilted.arrange([3], [1]); tilted.weigh();
  assert.equal(tilted.used, 2); assert.equal(tilted.result.outcome, -outcome);
});

test('all 1,000 cases can be explicitly identified against the opponent at the advertised minimum', () => {
  const w = createOddCoinWorkspace();
  for (let difficulty = 0; difficulty < 4; difficulty++) {
    w.changeDifficulty(difficulty);
    for (let number = 1; number <= 250; number++) { w.open(number); solve(w); assert.equal(w.used, w.minimum); }
    assert.equal(w.completedCount, 250);
  }
});

test('moving a selected group is one action; invalid and unchanged moves preserve redo', () => {
  const w = createOddCoinWorkspace();
  w.moveCoins([1, 2], 1); assert.deepEqual(w.placements, [1, 1, 0]);
  w.undo(); assert.deepEqual(w.placements, [0, 0, 0]); assert.equal(w.canRedo, true);
  assert.equal(w.moveCoins([1], 0), false); assert.equal(w.moveCoins([1, 4], 1), false);
  assert.equal(w.moveCoins([], 1), false); assert.equal(w.moveCoins([1], 5), false); assert.equal(w.canRedo, true);
  w.redo(); assert.deepEqual(w.placements, [1, 1, 0]);
});

test('labels and custom notes survive moves, saving, undo, and redo without consuming weighings', () => {
  const w = createOddCoinWorkspace();
  w.labelCoins([1, 2], { mark: -1 }); w.labelCoins([1], { text: '<suspect>' });
  assert.deepEqual(w.labels, { 1: { mark: -1, text: '<suspect>' }, 2: { mark: -1, text: '' } });
  w.moveCoins([1, 2], 1); assert.equal(w.used, 0); assert.equal(w.labels[1].text, '<suspect>');
  const r = createOddCoinWorkspace(w.exportState()); assert.deepEqual(r.labels, w.labels);
  r.labelCoins([1], { mark: 0 }); r.undo(); assert.equal(r.labels[1].mark, -1); r.redo(); assert.equal(r.labels[1].mark, 0);
  r.labelCoins([1], { mark: null, text: '' }); assert.equal(r.labels[1], undefined);
  r.labelCoins([2], { text: '01234567890123456789' }); assert.equal(r.labels[2].text.length, 16);
  assert.equal(r.labelCoins([99], { mark: 1 }), false); assert.equal(r.labelCoins([1], { mark: 2 }), false);
  r.reset(); assert.deepEqual(r.labels, {});
});

test('known genuine coin labels cannot contradict the given clue', () => {
  const w = createOddCoinWorkspace(); w.changeDifficulty(1); w.open(2);
  const coin = w.puzzle.genuine[0]; w.labelCoins([coin], { mark: 1, text: 'reference' });
  assert.equal(w.labels[coin].mark, 0); assert.equal(w.labels[coin].text, 'reference');
  assert.equal(w.submitAnswer([coin, 1]).reason, 'invalid');
});

test('reload preserves comparisons and submitted answers without accepting forged conclusions', () => {
  const w = createOddCoinWorkspace(); w.changeDifficulty(1); w.open(8);
  w.arrange([1, 2, 3, 4], [5, 6, 7, 8]); w.weigh();
  const saved = createOddCoinWorkspace(w.exportState());
  assert.deepEqual(saved.log, w.log); assert.deepEqual(saved.states, w.states); assert.deepEqual(saved.result, w.result);
  saved.clearPans(); saved.moveCoins([2, 3], -1);
  const draft = createOddCoinWorkspace(saved.exportState());
  assert.deepEqual(draft.placements, saved.placements); assert.equal(draft.result, null);
  draft.undo(); assert.deepEqual(draft.placements, Array(12).fill(0)); draft.redo(); assert.deepEqual(draft.placements, saved.placements);
  const forged = saved.exportState(); forged.sessions[1].game.submitted = [1, 1];
  assert.equal(createOddCoinWorkspace(forged).solved, false);
});

test('reset and navigation are undoable, and progress reset cannot resurrect labels or solved records', () => {
  const w = createOddCoinWorkspace(); solve(w); w.next(); const number = w.number;
  w.undo(); assert.equal(w.number, 1); assert.equal(w.solved, true); w.redo(); assert.equal(w.number, number);
  w.moveCoins([1], 1); w.labelCoins([1], { mark: 1 }); w.reset(); w.undo(); assert.equal(w.placements[0], 1); assert.equal(w.labels[1].mark, 1);
  w.changeDifficulty(1); solve(w); w.changeDifficulty(0); w.resetProgress();
  assert.equal(w.number, 1); assert.equal(w.completedCount, 0); assert.deepEqual(w.labels, {});
  const saved = w.exportState();
  assert.equal(saved.actions.past.some(entry => entry.difficulty === 0), false);
  assert.equal(saved.actions.future.some(entry => entry.difficulty === 0), false);
  w.changeDifficulty(1); assert.equal(w.completedCount, 1);
});

test('old saves retain valid observations and case numbers but require a player answer', () => {
  const w = createOddCoinWorkspace(); w.arrange([1], [2]); w.weigh();
  const old = w.exportState(); old.version = 2; delete old.sessions[0].game.submitted; old.sessions[0].completed = [1];
  const r = createOddCoinWorkspace(old); assert.equal(r.used, 1); assert.equal(r.states.length, 1); assert.equal(r.solved, false); assert.equal(r.completedCount, 1);
  assert.equal(r.submitAnswer([3, 1]).ok, true);
  const builder = createOddCoinWorkspace({ version: 1, difficulty: 1, sessions: [null, { number: 8 }] });
  assert.equal(builder.number, 8); assert.equal(builder.used, 0); assert.equal(builder.exportState().version, 3);
});

test('saved observations are checked against the actual opponent', () => {
  const w = createOddCoinWorkspace(); w.changeDifficulty(1); w.open(8);
  const saved = w.exportState();
  saved.sessions[1].game = { log: [{ left: [1], right: [2], outcome: 1 }], placements: [5], presenting: true, submitted: [1, 1] };
  const r = createOddCoinWorkspace(saved); assert.equal(r.used, 0); assert.equal(r.answer, null); assert.equal(r.solved, false); assert.equal(r.result, null);
  assert.deepEqual(r.placements, Array(12).fill(0));
});

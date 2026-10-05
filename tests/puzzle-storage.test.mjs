import test from 'node:test';
import assert from 'node:assert/strict';
import { createPuzzleStorage, storageKey } from '../assets/js/lib/puzzle-storage.mjs';
import { createGame, LEVELS } from '../assets/js/lib/tiling.mjs';
import { createKlotski, slideKlotski, undoKlotski, redoKlotski } from '../assets/js/lib/klotski.mjs';
import { serializeKlotski, restoreKlotski } from '../assets/js/lib/klotski-storage.mjs';
import { restoreHex } from '../assets/js/lib/hex-storage.mjs';

function environment(protocol = 'https:') {
  let lastWrite = '', writes = 0;
  const cookies = new Map(), values = new Map(), document = {};
  Object.defineProperty(document, 'cookie', {
    get: () => [...cookies].map(([key, value]) => `${key}=${value}`).join('; '),
    set: value => { lastWrite = value; const [key, content] = value.split(';')[0].split('='); cookies.set(key, content); },
  });
  return { document, location: { protocol }, values, get lastWrite() { return lastWrite; }, get writes() { return writes; },
    localStorage: { getItem: key => values.get(key) || null, setItem: (key, value) => { values.set(key, value); writes++; }, removeItem: key => values.delete(key) } };
}
function control() {
  let listener;
  const checkbox = { checked: true, disabled: true, addEventListener: (_, fn) => { listener = fn; }, change(value) { this.checked = value; listener(); } };
  return { checkbox, querySelector: () => checkbox };
}

test('the first-party cookie remembers the preference and boards survive a new page load', () => {
  const env = environment(), root = control(), store = createPuzzleStorage('tiling', root, env);
  assert.equal(root.checkbox.disabled, false); assert.match(env.lastWrite, /ao_puzzles_tiling=1; Max-Age=31536000; Path=\/; SameSite=Lax; Secure/);
  store.save({ seed: 123, state: { placements: {} } }); store.save({ seed: 123, state: { placements: {} } });
  assert.equal(env.writes, 1);
  assert.deepEqual(createPuzzleStorage('tiling', control(), env).read(), { seed: 123, state: { placements: {} } });
});

test('turning saving off clears only this puzzle, survives reload, and turning it on saves the current game', () => {
  const env = environment(), root = control(), store = createPuzzleStorage('hex', root, env);
  for (const id of ['hex', 'klotski', 'tiling', 'lights-out']) env.localStorage.setItem(storageKey(id), '{"moves":1}');
  store.setSnapshotProvider(() => ({ moves: 7 })); root.checkbox.change(false);
  assert.equal(env.document.cookie, 'ao_puzzles_hex=0'); assert.equal(env.values.size, 3);
  store.save({ moves: 5 }); assert.equal(env.values.size, 3);
  for (const id of ['klotski', 'tiling', 'lights-out']) assert.equal(env.localStorage.getItem(storageKey(id)), '{"moves":1}');
  const reloaded = control(); assert.equal(createPuzzleStorage('hex', reloaded, env).read(), null);
  assert.equal(reloaded.checkbox.checked, false);
  root.checkbox.change(true); assert.deepEqual(store.read(), { moves: 7 });
});

test('each puzzle starts enabled and changing another puzzle does not affect its saving', () => {
  const env = environment(), first = control(), second = control();
  const a = createPuzzleStorage('hex', first, env); createPuzzleStorage('tiling', second, env);
  a.save({ moves: 1 }); second.checkbox.change(false); a.save({ moves: 2 });
  assert.deepEqual(a.read(), { moves: 2 }); assert.equal(first.checkbox.checked, true);
  assert.equal(second.checkbox.checked, false);
  assert.equal(createPuzzleStorage('tiling', control(), env).read(), null);
  for (const id of ['klotski', 'lights-out']) {
    const root = control(), store = createPuzzleStorage(id, root, env);
    assert.equal(root.checkbox.checked, true); store.save({ moves: 3 }); assert.deepEqual(store.read(), { moves: 3 });
  }
});

test('another tab of the same puzzle observes its saving preference', () => {
  const env = environment(), first = control(), second = control();
  const a = createPuzzleStorage('hex', first, env); createPuzzleStorage('hex', second, env);
  a.save({ moves: 1 }); second.checkbox.change(false); a.save({ moves: 2 });
  assert.equal(a.read(), null); assert.equal(first.checkbox.checked, false);
  assert.equal(env.localStorage.getItem(storageKey('hex')), null);
});

test('the retired global preference does not disable new puzzle-specific defaults or delete old boards', () => {
  const env = environment(); env.document.cookie = 'ao_puzzles=0';
  for (const id of ['hex', 'klotski', 'tiling', 'lights-out']) {
    env.localStorage.setItem(storageKey(id), '{"moves":3}');
    const root = control(), store = createPuzzleStorage(id, root, env);
    assert.equal(root.checkbox.checked, true); assert.deepEqual(store.read(), { moves: 3 });
  }
});

test('clearing progress affects only this puzzle, preserves saving, and saves a fresh board', () => {
  const env = environment(), root = control(), store = createPuzzleStorage('lights-out', root, env);
  store.save({ moves: 7 }); env.localStorage.setItem(storageKey('hex'), '{"moves":3}');
  store.clear();
  assert.equal(store.read(), null); assert.equal(root.checkbox.checked, true);
  assert.equal(env.document.cookie, 'ao_puzzles_lights-out=1');
  assert.equal(env.localStorage.getItem(storageKey('hex')), '{"moves":3}');
  store.save({ moves: 0 }); assert.deepEqual(store.read(), { moves: 0 });
  root.checkbox.change(false); store.clear(); store.save({ moves: 0 });
  assert.equal(store.read(), null); assert.equal(root.checkbox.checked, false);
});

test('missing, malformed and unavailable storage never interrupt play; local preview omits Secure', () => {
  const env = environment('http:'), store = createPuzzleStorage('hex', control(), env);
  assert.doesNotMatch(env.lastWrite, /Secure/); assert.equal(store.read(), null);
  env.localStorage.setItem(storageKey('hex'), 'invalid json'); assert.equal(store.read(), null);
  Object.defineProperty(env, 'localStorage', { get() { throw new Error('Storage disabled'); } });
  assert.doesNotThrow(() => store.save({ moves: 1 })); assert.equal(store.read(), null);
  const noControl = createPuzzleStorage('hex', { querySelector: () => null }, env);
  assert.equal(noControl.read(), null); assert.doesNotThrow(() => noControl.save({}));
});

test('Tiling restores placements and history defensively and rejects corrupt or rotated boards', () => {
  const game = createGame(); game.place('A', LEVELS[0].solution.A); game.place('B', LEVELS[0].solution.B); game.undo();
  const saved = game.exportState(), restored = createGame(LEVELS[0], saved);
  assert.deepEqual(restored.placements, game.placements); assert.equal(restored.canRedo, true);
  restored.redo(); assert.equal(restored.filled, 6); restored.undo(); restored.undo(); assert.equal(restored.filled, 0);
  for (const placements of [{ A: null }, { A: { x: 99, y: 0 } }, { A: { x: 0, y: 0, rotation: 1 } }, { Unknown: { x: 0, y: 0 } }]) {
    assert.equal(createGame(LEVELS[0], { ...saved, placements }).filled, 0);
  }
  saved.placements.A.x = 99; assert.equal(game.placements.A.x, 0);
});

test('Klotski compact saves preserve moves and history and reject overlaps or bad coordinates', () => {
  let state = slideKlotski(createKlotski(), '8', 'right'); state = slideKlotski(state, '9', 'left'); state = undoKlotski(state);
  const saved = serializeKlotski(state), restored = restoreKlotski(saved);
  assert.deepEqual(restored, state); assert.equal(redoKlotski(restored).moves, 2);
  for (const positions of [[], saved.positions.map(() => 0), saved.positions.map(() => 99)]) assert.equal(restoreKlotski({ ...saved, positions }).moves, 0);
  assert.equal(restoreKlotski({ ...saved, history: [null] }).moves, 0);
});

test('older Klotski saves retain their original move counters through Undo and Redo', () => {
  let state = slideKlotski(createKlotski(), '8', 'right'); state = slideKlotski(state, '9', 'left'); state = undoKlotski(state);
  const current = serializeKlotski(state);
  const legacy = { positions: current.positions, moves: current.moves,
    history: current.history.map(entry => entry.positions), future: current.future.map(entry => entry.positions) };
  const restored = restoreKlotski(legacy);
  assert.deepEqual(restored, state);
  assert.equal(undoKlotski(restored).moves, 0);
  assert.equal(redoKlotski(restored).moves, 2);
  for (const invalid of [{ history: [null] }, { moves: 0 }, { version: 99 }]) {
    assert.deepEqual(restoreKlotski({ ...legacy, ...invalid }), createKlotski());
  }
});

test('Klotski rejects invalid counters in saved Reset history', () => {
  const saved = serializeKlotski(slideKlotski(createKlotski(), '8', 'right'));
  for (const moves of [-1, NaN, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.deepEqual(restoreKlotski({ ...saved, history: [{ ...saved.history[0], moves }] }), createKlotski());
  }
});

test('Hex save validation rejects corrupt boards, invalid turns and impossible colour counts', () => {
  const saved = { size: 3, human: 1, local: true, cells: [1, 2, 0, 0, 0, 0, 0, 0, 0], last: 1, toMove: 1, history: [], future: [] };
  assert.deepEqual(restoreHex(saved), saved);
  for (const invalid of [{ size: 12 }, { cells: [] }, { toMove: 2 }, { last: 8 }, { cells: [2, 2, 0, 0, 0, 0, 0, 0, 0] }, { history: [null] }]) assert.equal(restoreHex({ ...saved, ...invalid }), null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeOthello } from '../assets/js/widgets/othello.mjs';
import { initialState, legalMoves, play } from '../assets/js/lib/othello-math.mjs';

class Element {
  constructor() { this.listeners = {}; this.dataset = {}; this.classList = { toggle() {} }; this.textContent = ''; }
  addEventListener(name, callback) { this.listeners[name] = callback; }
  setAttribute() {}
  contains() { return false; }
}
const markup = readFileSync(new URL('../_includes/puzzles/othello.html', import.meta.url), 'utf8');
function fixture(saved = null) {
  const elements = Object.fromEntries([...markup.matchAll(/\bdata-othello-([\w-]+)/g)].map(([, key]) => [key, new Element()]));
  for (const [, action] of markup.matchAll(/game='othello' action='([^']+)'/g)) elements[action] = new Element();
  const root = new Element();
  root.ownerDocument = { activeElement: null };
  root.querySelector = selector => elements[selector.match(/^\[data-othello-(.+)\]$/)?.[1]] || null;
  root.querySelectorAll = () => [];
  const timers = new Map(); let nextTimer = 0, value = saved;
  const env = { window: { matchMedia: () => ({ matches: true }) }, setTimeout: callback => { timers.set(++nextTimer, callback); return nextTimer; }, clearTimeout: id => timers.delete(id) };
  const storage = { read: () => saved, save: state => { value = structuredClone(state); }, setSnapshotProvider() {}, clear() {} };
  const dispose = initializeOthello(root, env, storage);
  return { elements, timers, dispose, saved: () => value,
    click: index => elements.board.listeners.click({ target: { closest: () => ({ dataset: { cell: String(index) } }) } }),
    change: (key, value) => { elements[key][key === 'difficulty' ? 'value' : 'checked'] = value; elements[key].listeners.change(); }
  };
}

test('Othello initializes against current markup without counters and replaces loading feedback', () => {
  assert.ok(!markup.includes('data-othello-black>'));
  assert.ok(!markup.includes('data-othello-white>'));
  assert.ok(!markup.includes('Enable JavaScript to play Othello.'));
  const game = fixture();
  assert.match(game.elements.status.textContent, /^Black to play/);
  assert.equal((game.elements.board.innerHTML.match(/data-cell=/g) || []).length, 64);
  game.click(19);
  assert.match(game.elements.status.textContent, /Computer is thinking/);
  assert.equal(game.timers.size, 1);
  game.elements.undo.listeners.click();
  assert.match(game.elements.status.textContent, /^Black to play/);
  assert.equal(game.timers.size, 0);
  game.dispose();
});

test('difficulty games and histories survive switching, reload, and player changes elsewhere', () => {
  const game = fixture();
  game.click(19);
  const hard = game.saved().state;
  game.change('difficulty', 'medium');
  assert.deepEqual(game.saved().state, initialState());
  game.click(26);
  game.change('difficulty', 'hard');
  assert.deepEqual(game.saved().state, hard);
  assert.equal(game.saved().history.length, 1);
  const reloaded = fixture(game.saved());
  assert.deepEqual(reloaded.saved().state, hard);
  reloaded.change('difficulty', 'easy');
  reloaded.change('computer', false);
  reloaded.change('difficulty', 'hard');
  assert.deepEqual(reloaded.saved().state, hard);
  reloaded.dispose(); game.dispose();
});

test('late worker responses after undo cannot change the board; disposal terminates work', () => {
  const previousWorker = globalThis.Worker;
  const workers = [];
  globalThis.Worker = class {
    constructor() { workers.push(this); }
    postMessage(data) { this.request = data; }
    terminate() { this.terminated = true; }
  };
  try {
    const game = fixture(); game.click(19);
    [...game.timers.values()][0]();
    const worker = workers[0];
    assert.equal(worker.request.difficulty, 'hard');
    game.elements.undo.listeners.click();
    worker.onmessage({ data: { move: 18 } });
    assert.deepEqual(game.saved().state, initialState());
    assert.equal(worker.terminated, true);
    game.dispose();
  } finally { globalThis.Worker = previousWorker; }
});

test('completed games report scores only in the feedback bar and retain normal board styling', () => {
  let state = initialState();
  while (state.turn) state = play(state, legalMoves(state.cells, state.turn)[0]);
  const game = fixture({ state, computer: false });
  assert.match(game.elements.status.textContent, /wins,|Draw\./);
  assert.ok(!game.elements.board.innerHTML.includes('is-solved'));
  assert.equal(game.timers.size, 0);
  game.dispose();
});

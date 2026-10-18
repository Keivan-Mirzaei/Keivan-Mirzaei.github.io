import { initialState, legalMoves, play, chooseComputerMove, validState, DIFFICULTIES } from '../lib/othello-math.mjs';
import { createPageEnvironment } from '../lib/page-environment.mjs';
import { createPuzzleStorage } from '../lib/puzzle-storage.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';
import { initializeProgressReset } from '../lib/widget-progress.mjs';

let nextInstance = 0;

export function initializeOthello(root, env, storage = createPuzzleStorage('othello', root, env.window)) {
  const get = key => root.querySelector(`[data-othello-${key}]`);
  get('difficulty').id = `othello-${++nextInstance}-difficulty`;
  get('difficulty-name')?.setAttribute('for', get('difficulty').id);
  const events = new AbortController();
  const listen = (element, type, handler) => element.addEventListener(type, handler, { signal: events.signal });
  const panels = initializeWidgetPanels(root);
  let state = initialState(), history = [], future = [], computer = true, second = false, hints = true, timer = null, cursor = 19, worker = null, difficulty = 'hard', games = {}, generation = 0;
  const human = () => second ? 2 : 1;
  const busy = () => computer && state.turn && state.turn !== human();
  const snapshot = () => ({ state, history, future, computer, second, hints, difficulty, games: { ...games, [difficulty]: { state, history, future } } });
  storage.setSnapshotProvider(snapshot);
  const saved = storage.read();
  if (validState(saved?.state)) {
    difficulty = Object.hasOwn(DIFFICULTIES, saved.difficulty) ? saved.difficulty : 'hard';
    if (saved.games && typeof saved.games === 'object') games = saved.games;
    state = saved.state;
    history = Array.isArray(saved.history) ? saved.history.filter(validState).slice(-128) : [];
    future = Array.isArray(saved.future) ? saved.future.filter(validState).slice(-128) : [];
    computer = saved.computer !== false; second = saved.second === true; hints = saved.hints !== false;
  }
  const animations = new Set();
  const reducedMotion = () => env.window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clearAnimations() { animations.forEach(animation => animation.cancel()); animations.clear(); }
  function animateMove(previous) {
    if (!previous || reducedMotion()) return;
    const palette = env.window.getComputedStyle(root);
    const color = value => palette.getPropertyValue(value === 1 ? '--ink' : '--paper').trim();
    state.cells.forEach((cell, index) => {
      if (!cell || cell === previous.cells[index]) return;
      const disc = get('board').querySelector(`[data-cell="${index}"] .othello-disc`);
      if (!disc?.animate) return;
      const placed = !previous.cells[index];
      const distance = Math.max(Math.abs(Math.floor(index / 8) - Math.floor(state.last / 8)), Math.abs(index % 8 - state.last % 8));
      const oldFace = { backgroundColor: color(previous.cells[index]), borderWidth: previous.cells[index] === 2 ? '2px' : '1px' };
      const newFace = { backgroundColor: color(cell), borderWidth: cell === 2 ? '2px' : '1px' };
      const frames = placed ? [
        { transform: 'scale(.65)', opacity: .3 },
        { transform: 'scale(1.04)', opacity: 1, offset: .7 },
        { transform: 'scale(1)', opacity: 1 }
      ] : [
        { ...oldFace, transform: 'perspective(180px) rotateY(0deg)', offset: 0 },
        { ...oldFace, transform: 'perspective(180px) rotateY(89deg)', offset: .49 },
        { ...newFace, transform: 'perspective(180px) rotateY(-89deg)', offset: .5 },
        { ...newFace, transform: 'perspective(180px) rotateY(0deg)', offset: 1 }
      ];
      const animation = disc.animate(frames, { duration: placed ? 220 : 340, delay: placed ? 0 : 80 + Math.min(distance, 5) * 35, easing: 'ease-in-out', fill: 'backwards' });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    });
  }
  function cancel() { generation++; if (timer !== null) env.clearTimeout(timer); timer = null; worker?.terminate(); worker = null; }
  function remember() { history.push(state); history = history.slice(-128); future = []; }
  function render(message = '', previous = null) {
    clearAnimations();
    const board = get('board'), focused = board.contains(root.ownerDocument.activeElement);
    const moves = legalMoves(state.cells, state.turn);
    const black = state.cells.filter(c => c === 1).length, white = state.cells.filter(c => c === 2).length;
    for (const [color, number] of [['black', 1], ['white', 2]]) {
      get(`${color}-name`).textContent = `${number === 1 ? 'Black' : 'White'} · ${computer ? number === human() ? 'You' : 'Computer' : number === 1 ? 'Player 1' : 'Player 2'}`;
    }
    get('status').textContent = message || (!state.turn
      ? black === white ? `Draw. ${black} discs each.` : `${black > white ? 'Black' : 'White'} wins, ${Math.max(black, white)}–${Math.min(black, white)}.`
      : `${state.turn === 1 ? 'Black' : 'White'} to play${busy() ? ' · Computer is thinking…' : ` · ${moves.length} legal ${moves.length === 1 ? 'move' : 'moves'}`}.`);
    board.setAttribute('aria-busy', String(Boolean(busy())));
    board.innerHTML = state.cells.map((cell, i) => {
      const legal = moves.includes(i) && !busy();
      return `<button type="button" class="othello-cell${i === state.last ? ' is-last' : ''}" data-cell="${i}" data-legal="${legal}" aria-disabled="${!legal}" tabindex="${i === cursor ? 0 : -1}" aria-label="${String.fromCharCode(65 + i % 8)}${Math.floor(i / 8) + 1}: ${cell === 1 ? 'Black' : cell === 2 ? 'White' : legal ? 'empty, legal move' : 'empty'}${i === state.last ? ', last move' : ''}">${cell ? `<span class="othello-disc is-${cell === 1 ? 'black' : 'white'}" aria-hidden="true"></span>` : legal && hints ? '<span class="othello-hint" aria-hidden="true"></span>' : ''}</button>`;
    }).join('');
    animateMove(previous);
    if (focused) board.querySelector(`[data-cell="${cursor}"]`).focus({ preventScroll: true });
    get('undo').disabled = !history.length; get('redo').disabled = !future.length; get('reset').disabled = false;
    get('computer').checked = computer; get('second').checked = second; get('second').disabled = !computer; get('hints').checked = hints;
    get('difficulty').value = difficulty;
    get('difficulty-setting').hidden = !computer;
    get('difficulty-description').textContent = DIFFICULTIES[difficulty].description;
    const confirmation = root.querySelector('[data-widget-progress-confirm] p');
    if (confirmation) confirmation.textContent = `Clear the ${difficulty[0].toUpperCase() + difficulty.slice(1)} game and its saved move history? Other difficulty levels and your settings are kept.`;
    storage.save(snapshot());
  }
  function schedule() {
    cancel();
    if (!busy()) return;
    const request = generation;
    timer = env.setTimeout(() => {
      timer = null;
      const previous = state;
      function finish(move) {
        if (request !== generation) return;
        worker?.terminate(); worker = null;
        if (move === null) return;
        state = play(state, move);
        render(state.turn === previous.turn ? 'Your turn passes: no legal move. Computer plays again.' : '', previous);
        schedule();
      }
      try {
        worker = new Worker(new URL('../lib/othello-worker.mjs', import.meta.url), { type: 'module' });
        worker.onmessage = ({ data }) => finish(data.move);
        worker.onerror = () => {
          if (request !== generation) return;
          worker?.terminate(); worker = null;
          get('status').textContent = 'Computer could not start. Try Reset, or switch to two players in Settings.';
        };
        worker.postMessage({ state, difficulty });
      } catch {
        // Preserve the selected playing strength in browsers without module workers.
        finish(chooseComputerMove(state, difficulty));
      }
    }, reducedMotion() ? 250 : 650);
  }
  listen(get('board'), 'click', event => {
    const button = event.target.closest('[data-cell]');
    if (!button || busy()) return;
    const next = play(state, Number(button.dataset.cell));
    if (!next) return;
    cursor = Number(button.dataset.cell); remember();
    const previous = state, passed = next.turn === state.turn;
    state = next;
    render(passed ? `${state.turn === 1 ? 'White' : 'Black'} has no legal move. ${state.turn === 1 ? 'Black' : 'White'} plays again.` : '', previous); schedule();
  });
  listen(get('board'), 'keydown', event => {
    const button = event.target.closest('[data-cell]');
    if (!button) return;
    const index = Number(button.dataset.cell), row = Math.floor(index / 8), col = index % 8;
    const destinations = { ArrowLeft: row * 8 + Math.max(0, col - 1), ArrowRight: row * 8 + Math.min(7, col + 1), ArrowUp: Math.max(0, row - 1) * 8 + col, ArrowDown: Math.min(7, row + 1) * 8 + col, Home: row * 8, End: row * 8 + 7 };
    if (!(event.key in destinations)) return;
    event.preventDefault(); cursor = destinations[event.key]; button.tabIndex = -1;
    const target = get('board').querySelector(`[data-cell="${cursor}"]`); target.tabIndex = 0; target.focus();
  });
  listen(get('undo'), 'click', () => {
    if (!history.length) return;
    cancel(); future.push(state); state = history.pop(); render(); schedule();
  });
  listen(get('redo'), 'click', () => {
    if (!future.length) return;
    cancel(); history.push(state); state = future.pop(); render(); schedule();
  });
  listen(get('reset'), 'click', () => { cancel(); remember(); state = initialState(); render(); schedule(); });
  for (const setting of ['computer', 'second', 'hints']) {
    get(setting).disabled = false;
    listen(get(setting), 'change', () => {
      if (setting === 'hints') hints = get(setting).checked;
      else { cancel(); computer = get('computer').checked; second = get('second').checked; state = initialState(); history = []; future = []; }
      render(); schedule();
    });
  }
  get('difficulty').disabled = false;
  listen(get('difficulty'), 'change', () => {
    cancel();
    games[difficulty] = { state, history, future };
    difficulty = get('difficulty').value;
    if (!Object.hasOwn(DIFFICULTIES, difficulty)) difficulty = 'hard';
    const stored = games[difficulty];
    state = validState(stored?.state) ? stored.state : initialState();
    history = Array.isArray(stored?.history) ? stored.history.filter(validState).slice(-128) : [];
    future = Array.isArray(stored?.future) ? stored.future.filter(validState).slice(-128) : [];
    render(); schedule();
  });
  const progress = initializeProgressReset(root, () => { cancel(); storage.clear(); state = initialState(); history = []; future = []; render(); schedule(); });
  render(); schedule();
  return () => { cancel(); clearAnimations(); events.abort(); panels(); progress(); };
}
export function mount(root) {
  const env = createPageEnvironment(root);
  const cleanups = [...root.querySelectorAll('[data-othello-game]')].map(game => initializeOthello(game, env));
  return () => { cleanups.forEach(cleanup => cleanup()); env.dispose(); };
}

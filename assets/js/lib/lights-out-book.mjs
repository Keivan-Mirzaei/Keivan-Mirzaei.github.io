import { BOOK_GRAPHS, LIGHTS_OUT_LEVELS } from './lights-out-book-graphs.mjs';
import { LIGHTS_OUT_CATALOGUE } from './lights-out-catalogue.mjs';
import { pressEffect, solvePresses, vertices } from './lights-out-math.mjs';

export function createLightsOutGame(puzzle, saved = null) {
  const graph = puzzle.graph;
  const validMoves = moves => Array.isArray(moves) && moves.length <= 10000 && moves.every(vertex => Number.isInteger(vertex) && vertex >= 0 && vertex < graph.size);
  let moves = validMoves(saved?.moves) ? [...saved.moves] : [];
  let future = validMoves(saved?.moves) && validMoves(saved?.future) ? [...saved.future] : [];
  let lights = puzzle.start ^ moves.reduce((effect, vertex) => effect ^ pressEffect(graph, 1 << vertex), 0);
  // A history cannot legally continue after solving the puzzle.
  let replay = puzzle.start;
  for (const vertex of moves) {
    if (replay === 0) { moves = []; future = []; lights = puzzle.start; break; }
    replay ^= pressEffect(graph, 1 << vertex);
  }
  let redoLights = lights;
  for (const vertex of [...future].reverse()) {
    if (!redoLights) { future = []; break; }
    redoLights ^= pressEffect(graph, 1 << vertex);
  }
  return {
    get lights() { return lights; },
    get moves() { return moves.length; },
    get solved() { return lights === 0; },
    get canUndo() { return moves.length > 0; },
    get canRedo() { return future.length > 0 && lights !== 0; },
    press(vertex) {
      if (!lights || !Number.isInteger(vertex) || vertex < 0 || vertex >= graph.size) return false;
      lights ^= pressEffect(graph, 1 << vertex); moves.push(vertex); future = []; return true;
    },
    undo() {
      if (!moves.length) return false;
      const vertex = moves.pop(); lights ^= pressEffect(graph, 1 << vertex); future.push(vertex); return true;
    },
    redo() {
      if (!future.length || !lights) return false;
      const vertex = future.pop(); lights ^= pressEffect(graph, 1 << vertex); moves.push(vertex); return true;
    },
    reset() { lights = puzzle.start; moves = []; future = []; },
    hint() { return lights ? vertices(solvePresses(graph, lights).solutions[0], graph.size)[0] : null; },
    exportState() { return { moves: [...moves], future: [...future] }; },
  };
}

export function createLightsOutBook(saved = null, catalogue = LIGHTS_OUT_CATALOGUE) {
  let difficulty = Number.isInteger(saved?.difficulty) && LIGHTS_OUT_LEVELS[saved.difficulty] ? saved.difficulty : 0;
  const sessions = LIGHTS_OUT_LEVELS.map((_, index) => {
    const total = catalogue[index].length, old = saved?.version === 1 ? saved.sessions?.[index] : null;
    const valid = number => Number.isInteger(number) && number >= 1 && number <= total;
    const best = Object.fromEntries(Object.entries(old?.best || {}).filter(([number, presses]) => valid(Number(number))
      && Number.isInteger(presses) && presses >= catalogue[index][Number(number) - 1][2] && presses <= 10000));
    return {
      number: valid(old?.number) ? old.number : 1,
      completed: new Set([...(Array.isArray(old?.completed) ? old.completed.filter(valid) : []), ...Object.keys(best).map(Number)]),
      best,
      state: old?.state || null,
      replaying: old?.replaying === true,
    };
  });
  function recoverResult(index, number, state) {
    const entry = catalogue[index]?.[number - 1];
    if (!Number.isInteger(number) || !entry || !state) return;
    const [key, start] = entry, game = createLightsOutGame({ graph: BOOK_GRAPHS[key], start }, state);
    if (!game.solved) return;
    const session = sessions[index];
    session.completed.add(number);
    session.best[number] = Math.min(session.best[number] ?? Infinity, game.moves);
  }
  // Older saves know completions but only retain press counts in board/history snapshots.
  sessions.forEach((session, index) => recoverResult(index, session.number, session.state));
  if (saved?.version === 1) for (const name of ['past', 'future']) {
    const entries = saved.actions?.[name];
    if (Array.isArray(entries)) for (const entry of entries.slice(-100)) {
      if (Number.isInteger(entry?.difficulty) && sessions[entry.difficulty]) recoverResult(entry.difficulty, entry.number, entry.state);
    }
  }
  const current = () => sessions[difficulty];
  const available = () => Array.from({ length: catalogue[difficulty].length }, (_, i) => i + 1).filter(number => number !== current().number && !current().completed.has(number));
  return {
    get difficulty() { return difficulty; },
    get number() { return current().number; },
    get total() { return catalogue[difficulty].length; },
    get completedCount() { return current().completed.size; },
    get currentCompleted() { return current().completed.has(current().number); },
    get allCompleted() { return current().completed.size === this.total; },
    get canAdvance() { return available().length > 0; },
    get state() { return current().state; },
    get puzzle() {
      const [key, start, minimum] = catalogue[difficulty][current().number - 1];
      return { key, graph: BOOK_GRAPHS[key], start, minimum, number: current().number, difficulty };
    },
    result(number) {
      if (!Number.isInteger(number) || number < 1 || number > this.total) return null;
      const minimum = catalogue[difficulty][number - 1][2], best = current().best[number] ?? null;
      return { minimum, best, status: best === minimum ? 'minimum' : current().completed.has(number) ? 'solved' : 'unsolved' };
    },
    record(state, solved) {
      current().state = state;
      if (solved) {
        current().completed.add(current().number);
        current().best[current().number] = Math.min(current().best[current().number] ?? Infinity, state.moves.length);
      }
    },
    changeDifficulty(index) {
      if (!Number.isInteger(index) || !LIGHTS_OUT_LEVELS[index]) return false;
      difficulty = index; this.resume(); return true;
    },
    open(number, explicit = true) {
      if (!Number.isInteger(number) || number < 1 || number > this.total) return false;
      current().number = number; current().state = null;
      current().replaying = explicit && current().completed.has(number); return true;
    },
    advance() {
      for (let step = 1; step < this.total; step++) {
        const number = (current().number - 1 + step) % this.total + 1;
        if (!current().completed.has(number)) return this.open(number, false);
      }
      return false;
    },
    resume() { if (this.currentCompleted && !current().replaying) this.advance(); },
    replay() { current().replaying = this.currentCompleted; },
    exportState() {
      return { version: 1, difficulty, sessions: sessions.map(session => ({
        number: session.number, completed: [...session.completed].sort((a, b) => a - b), best: { ...session.best }, state: session.state, replaying: session.replaying,
      })) };
    },
  };
}

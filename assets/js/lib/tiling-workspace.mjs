import { createPuzzleBook } from './tiling-book.mjs';
import { createGame } from './tiling.mjs';
import { DIFFICULTIES } from './tiling-arrangements.mjs';

export const TILING_HISTORY_LIMIT = 100;
const clone = value => JSON.parse(JSON.stringify(value));
const compact = game => {
  const { placements, moves } = game.exportState();
  return { placements, moves };
};
const restoreGame = (level, state) => createGame(level, { ...state, history: [], future: [] });

// One bounded action history also reverses Reset and puzzle navigation.
// Completion records and legacy catalogue overrides remain in the puzzle book.
export function createTilingWorkspace(saved = null, catalogue) {
  let book = createPuzzleBook(saved, catalogue), game = createGame(book.level, book.state);
  const capture = () => ({ difficulty: book.difficulty, number: book.number, state: compact(game) });
  const remember = (entries, entry) => [...entries, entry].slice(-TILING_HISTORY_LIMIT);
  function valid(entry) {
    if (!entry || !Number.isInteger(entry.difficulty) || !DIFFICULTIES[entry.difficulty]
      || !Number.isSafeInteger(entry.state?.moves) || entry.state.moves < 0) return false;
    const probe = createPuzzleBook(book.exportState(), catalogue);
    probe.changeDifficulty(entry.difficulty);
    if (!probe.open(entry.number)) return false;
    return JSON.stringify(compact(restoreGame(probe.level, entry.state))) === JSON.stringify(entry.state);
  }
  const legacy = game.exportState();
  const history = (name, fallback) => Array.isArray(saved?.actions?.[name])
    ? saved.actions[name].length <= TILING_HISTORY_LIMIT && saved.actions[name].every(valid) ? clone(saved.actions[name]) : []
    : fallback.slice(-TILING_HISTORY_LIMIT).map(state => ({ difficulty: book.difficulty, number: book.number, state }));
  let past = history('past', legacy.history), future = history('future', legacy.future);
  game = restoreGame(book.level, compact(game));
  const record = () => book.record(game.exportState(), game.solved);
  function load() { game = restoreGame(book.level, compact(createGame(book.level, book.state))); }
  function restore(entry) {
    record(); book.changeDifficulty(entry.difficulty); book.open(entry.number);
    game = restoreGame(book.level, entry.state); record();
  }
  function commit(action) {
    record(); const before = capture();
    if (!action()) return false;
    past = remember(past, before); future = [];
    game = restoreGame(game.level, compact(game)); record(); return true;
  }
  const beforeResume = capture();
  book.resume();
  if (book.number !== beforeResume.number) { past = remember(past, beforeResume); future = []; load(); }
  return {
    get book() { return book; }, get game() { return game; },
    get canUndo() { return past.length > 0; }, get canRedo() { return future.length > 0; },
    place(id, position) {
      let result;
      commit(() => { result = game.place(id, position); return result.valid && result.changed; });
      return result;
    },
    remove(id) { return commit(() => game.remove(id)); },
    reset() { return commit(() => { if (!game.moves) return false; book.replay(); game.reset(); return true; }); },
    shuffle(random) { return commit(() => { if (!book.next(random)) return false; load(); return true; }); },
    open(number) { return commit(() => { if (number === book.number || !book.open(number)) return false; load(); return true; }); },
    changeDifficulty(index) { return commit(() => { if (index === book.difficulty || !book.changeDifficulty(index)) return false; load(); return true; }); },
    undo() {
      if (!past.length) return false;
      future = remember(future, capture()); restore(past.pop()); return true;
    },
    redo() {
      if (!future.length) return false;
      past = remember(past, capture()); restore(future.pop()); return true;
    },
    resetProgress() {
      const difficulty = book.difficulty;
      record(); const savedBook = book.exportState();
      delete savedBook.sessions[difficulty];
      book = createPuzzleBook(savedBook, catalogue); game = createGame(book.level);
      past = past.filter(entry => entry.difficulty !== difficulty);
      future = future.filter(entry => entry.difficulty !== difficulty); record();
    },
    exportState() { record(); return { ...book.exportState(), actions: clone({ past, future }) }; },
  };
}

import { createLightsOutBook, createLightsOutGame } from './lights-out-book.mjs';
import { LIGHTS_OUT_LEVELS } from './lights-out-book-graphs.mjs';

export const LIGHTS_OUT_HISTORY_LIMIT = 100;
const clone = value => JSON.parse(JSON.stringify(value));

// Completion records survive Undo; history reverses play and navigation.
export function createLightsOutWorkspace(saved = null, catalogue) {
  let book = createLightsOutBook(saved, catalogue);
  let game = createLightsOutGame(book.puzzle, book.state);
  function valid(entry) {
    if (!entry || !Number.isInteger(entry.difficulty) || !LIGHTS_OUT_LEVELS[entry.difficulty]
      || !Array.isArray(entry.state?.moves) || !Array.isArray(entry.state?.future)) return false;
    const probe = createLightsOutBook({ difficulty: entry.difficulty }, catalogue);
    if (!probe.open(entry.number)) return false;
    const state = createLightsOutGame(probe.puzzle, entry.state).exportState();
    return JSON.stringify(state) === JSON.stringify({ moves: entry.state.moves, future: entry.state.future });
  }
  const history = name => Array.isArray(saved?.actions?.[name]) && saved.actions[name].length <= LIGHTS_OUT_HISTORY_LIMIT
    && saved.actions[name].every(valid) ? clone(saved.actions[name]) : [];
  let past = history('past'), future = history('future');
  const record = () => book.record(game.exportState(), game.solved);
  const capture = () => ({ difficulty: book.difficulty, number: book.number, state: game.exportState() });
  const remember = (values, entry) => [...values, entry].slice(-LIGHTS_OUT_HISTORY_LIMIT);
  function restore(entry) {
    record(); book.changeDifficulty(entry.difficulty); book.open(entry.number);
    game = createLightsOutGame(book.puzzle, entry.state); record();
  }
  function commit(action) {
    record(); const before = capture();
    if (!action()) return false;
    past = remember(past, before); future = []; record(); return true;
  }
  const beforeResume = capture();
  book.resume();
  if (book.number !== beforeResume.number) {
    past = remember(past, beforeResume); future = []; game = createLightsOutGame(book.puzzle, book.state);
  }
  return {
    get book() { return book; }, get game() { return game; },
    get canUndo() { return past.length > 0 || game.canUndo; },
    get canRedo() { return future.length > 0 || game.canRedo; },
    press(vertex) { return commit(() => game.press(vertex)); },
    reset() { return commit(() => { if (!game.moves) return false; book.replay(); game.reset(); return true; }); },
    shuffle(random) { return commit(() => { if (!book.shuffle(random)) return false; game = createLightsOutGame(book.puzzle, book.state); return true; }); },
    advance() { return commit(() => { if (!book.advance()) return false; game = createLightsOutGame(book.puzzle, book.state); return true; }); },
    open(number) { return commit(() => { if (number === book.number || !book.open(number)) return false; game = createLightsOutGame(book.puzzle, book.state); return true; }); },
    changeDifficulty(index) { return commit(() => { if (index === book.difficulty || !book.changeDifficulty(index)) return false; game = createLightsOutGame(book.puzzle, book.state); return true; }); },
    undo() {
      const current = capture();
      if (past.length) restore(past.pop());
      else if (!game.undo()) return false;
      future = remember(future, current); record(); return true;
    },
    redo() {
      const current = capture();
      if (future.length) restore(future.pop());
      else if (!game.redo()) return false;
      past = remember(past, current); record(); return true;
    },
    resetProgress() {
      const difficulty = book.difficulty;
      book = createLightsOutBook({ difficulty }, catalogue); game = createLightsOutGame(book.puzzle);
      past = []; future = []; record();
    },
    exportState() { record(); return { ...book.exportState(), actions: clone({ past, future }) }; },
  };
}

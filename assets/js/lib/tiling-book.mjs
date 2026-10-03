import { CATALOGUE } from './tiling-catalogue.mjs';
import { DIFFICULTIES, createArrangement, arrangementFingerprint } from './tiling-arrangements.mjs';
import { buildLevel, occupiedCells, key, createGame, isSolved } from './tiling.mjs';

const rowsFor = level => {
  const cells = occupiedCells(level, level.solution);
  return Array.from({ length: level.height }, (_, y) => Array.from({ length: level.width }, (_, x) => cells.get(key(x, y)) || '.').join('')).join('/');
};
function connected(cells) {
  const remaining = new Set(cells.map(cell => key(...cell))), queue = [cells[0]];
  remaining.delete(key(...cells[0]));
  while (queue.length) {
    const [x, y] = queue.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (remaining.delete(key(x + dx, y + dy))) queue.push([x + dx, y + dy]);
  }
  return !remaining.size;
}
function validRows(rows, difficulty) {
  const config = DIFFICULTIES[difficulty];
  if (typeof rows !== 'string' || !/^[A-J./]+$/.test(rows)) return false;
  const parts = rows.split('/');
  if (parts.length !== config.height || parts.some(row => row.length !== config.width)) return false;
  const level = buildLevel({ name: 'Puzzle', rows: parts });
  return level.holes.length === config.holes && connected(level.floor)
    && level.pieces.every(piece => connected(piece.cells))
    && JSON.stringify(level.pieces.map(piece => piece.cells.length).sort()) === JSON.stringify([...config.sizes].sort());
}

export function createPuzzleBook(saved = null, catalogue = CATALOGUE) {
  const sessions = {};
  let difficulty = Number.isInteger(saved?.difficulty) && DIFFICULTIES[saved.difficulty] ? saved.difficulty : 0;
  DIFFICULTIES.forEach((_, index) => {
    const total = catalogue[index].length, old = saved?.sessions?.[index];
    const session = { number: 1, completed: new Set(), overrides: {}, state: null, replaying: false };
    if (saved?.version === 2 && old) {
      if (Number.isInteger(old.number) && old.number >= 1 && old.number <= total) session.number = old.number;
      if (Array.isArray(old.completed)) old.completed.forEach(number => {
        if (Number.isInteger(number) && number >= 1 && number <= total) session.completed.add(number);
      });
      for (const [number, rows] of Object.entries(old.overrides || {})) {
        if (Number.isInteger(Number(number)) && Number(number) >= 1 && Number(number) <= total && validRows(rows, index)) session.overrides[number] = rows;
      }
      session.state = old.state || null;
      session.replaying = old.replaying === true;
    } else if (old && Number.isInteger(old.seed) && old.seed >= 1 && old.seed <= 0xffffffff) {
      // Preserve the current floor from the earlier random generator. If it is
      // already in the catalogue, swap the two slots to retain distinct puzzles.
      session.number = Number.isSafeInteger(old.round) && old.round >= 1 ? Math.min(old.round, total) : 1;
      const level = createArrangement(index, old.seed), rows = rowsFor(level);
      if (rows !== catalogue[index][session.number - 1]) {
        const fingerprint = arrangementFingerprint(level);
        const duplicate = catalogue[index].findIndex(value => arrangementFingerprint(buildLevel({ name: 'Puzzle', rows: value.split('/') })) === fingerprint);
        session.overrides[session.number] = rows;
        if (duplicate >= 0 && duplicate + 1 !== session.number) session.overrides[duplicate + 1] = catalogue[index][session.number - 1];
      }
      const restored = createGame(level, old.state);
      session.state = restored.exportState();
      if ([session.state, ...session.state.history, ...session.state.future].some(value => isSolved(level, value.placements))) session.completed.add(session.number);
    }
    sessions[index] = session;
  });
  const current = () => sessions[difficulty];
  const level = () => ({ ...buildLevel({ name: 'Puzzle', rows: (current().overrides[current().number] || catalogue[difficulty][current().number - 1]).split('/') }, current().number - 1), difficulty, seed: current().number });
  const available = () => Array.from({ length: catalogue[difficulty].length }, (_, index) => index + 1)
    .filter(number => number !== current().number && !current().completed.has(number));
  return {
    get difficulty() { return difficulty; },
    get number() { return current().number; },
    get total() { return catalogue[difficulty].length; },
    get completedCount() { return current().completed.size; },
    get currentCompleted() { return current().completed.has(current().number); },
    get allCompleted() { return current().completed.size === catalogue[difficulty].length; },
    get canRefresh() { return available().length > 0; },
    get state() { return current().state; },
    get level() { return level(); },
    record(state, solved) {
      current().state = state;
      if (solved) current().completed.add(current().number);
    },
    changeDifficulty(index) {
      if (!Number.isInteger(index) || !DIFFICULTIES[index]) return false;
      difficulty = index; this.resume(); return true;
    },
    resume() {
      if (current().completed.has(current().number) && !current().replaying) this.next();
    },
    replay() { current().replaying = current().completed.has(current().number); },
    open(number, explicit = true) {
      if (!Number.isInteger(number) || number < 1 || number > catalogue[difficulty].length) return false;
      current().number = number; current().state = null;
      current().replaying = explicit && current().completed.has(number); return true;
    },
    next(random = Math.random) {
      const numbers = available();
      if (!numbers.length) return false;
      const index = Math.max(0, Math.min(numbers.length - 1, Math.floor(random() * numbers.length)));
      return this.open(numbers[index], false);
    },
    exportState() {
      return { version: 2, difficulty, sessions: Object.fromEntries(Object.entries(sessions).map(([index, session]) => [index,
        { number: session.number, completed: [...session.completed].sort((a, b) => a - b), overrides: { ...session.overrides }, state: session.state, replaying: session.replaying }])) };
    },
  };
}

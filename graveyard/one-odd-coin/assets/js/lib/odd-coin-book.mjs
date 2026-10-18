import { ODD_COIN_CATALOGUE } from './odd-coin-catalogue.mjs';
import { validWeighing, remainingStates, opponentReply, stateKey } from './odd-coin-math.mjs';

export const ODD_COIN_LEVELS = [
  { name: 'Easy', detail: 'Small groups with a known weight direction' },
  { name: 'Medium', detail: 'Find the coin and its weight' },
  { name: 'Hard', detail: 'Larger groups and earlier evidence' },
  { name: 'Expert', detail: 'Up to 39 coins' },
];
export const ODD_COIN_HISTORY_LIMIT = 40;
const clone = value => structuredClone(value);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const blankGame = () => ({ log: [], placements: [], presenting: false, labels: {}, submitted: null });

export function oddCoinPuzzle(difficulty, number, catalogue = ODD_COIN_CATALOGUE) {
  const record = catalogue[difficulty]?.[number - 1];
  if (!record) return null;
  const [coins, kind, genuine, evidence, limit] = record;
  return { coins, kind: kind === 1 ? 'heavy' : kind === -1 ? 'light' : 'unknown', genuine: [...genuine],
    evidence: evidence.map(([left, right, outcome]) => ({ left: [...left], right: [...right], outcome })),
    limit, difficulty, number };
}
export function pansFor(placements) {
  const left = [], right = [];
  placements.forEach((value, i) => { if (value === 1) left.push(i + 1); else if (value === -1) right.push(i + 1); });
  return { left, right };
}
function placementsFor(coins, { left, right }) {
  return Array.from({ length: coins }, (_, i) => left.includes(i + 1) ? 1 : right.includes(i + 1) ? -1 : 0);
}
function recordedResult(game) {
  const { left, right } = pansFor(game.placements);
  const equal = (a, b) => a.length === b.length && a.every(coin => b.includes(coin));
  for (const entry of game.log) {
    if (equal(left, entry.left) && equal(right, entry.right)) return { left, right, outcome: entry.outcome };
    if (equal(left, entry.right) && equal(right, entry.left)) return { left, right, outcome: -entry.outcome || 0 };
  }
  return null;
}
function normalizeAnswer(answer, puzzle) {
  if (!Array.isArray(answer) || answer.length !== 2 || !Number.isInteger(answer[0]) || answer[0] < 1
    || answer[0] > puzzle.coins || ![-1, 1].includes(answer[1]) || puzzle.genuine.includes(answer[0])) return null;
  return [...answer];
}

export function createOddCoinWorkspace(saved = null, catalogue = ODD_COIN_CATALOGUE) {
  const validNumber = (d, n) => Number.isInteger(d) && !!catalogue[d] && Number.isInteger(n) && n >= 1 && n <= catalogue[d].length;
  const compatible = [2, 3].includes(saved?.version);
  function cleanGame(old, difficulty, number) {
    const puzzle = oddCoinPuzzle(difficulty, number, catalogue), game = blankGame();
    let states = remainingStates(puzzle);
    if (Array.isArray(old?.log)) for (const entry of old.log) {
      if (!entry || !validWeighing(puzzle.coins, entry.left, entry.right)) break;
      const reply = opponentReply(puzzle.coins, states, entry.left, entry.right);
      if (entry.outcome !== reply.outcome) break;
      game.log.push({ left: [...entry.left], right: [...entry.right], outcome: entry.outcome }); states = reply.states;
    }
    if (Array.isArray(old?.placements) && old.placements.length <= puzzle.coins && old.placements.every(value => [-1, 0, 1].includes(value))) game.placements = [...old.placements];
    game.presenting = old?.presenting === true && !!recordedResult(game);
    if (old?.labels && typeof old.labels === 'object') for (let coin = 1; coin <= puzzle.coins; coin++) {
      const label = old.labels[coin];
      if (label && typeof label === 'object') game.labels[coin] = { mark: [-1, 0, 1].includes(label.mark) ? label.mark : null, text: typeof label.text === 'string' ? label.text.slice(0, 16) : '' };
    }
    const submitted = normalizeAnswer(old?.submitted, puzzle);
    if (states.length === 1 && submitted && stateKey(submitted) === stateKey(states[0])) game.submitted = submitted;
    return game;
  }
  const sessions = catalogue.map((records, difficulty) => {
    const old = saved?.sessions?.[difficulty], number = validNumber(difficulty, old?.number) ? old.number : 1;
    const game = cleanGame(compatible ? old?.game : null, difficulty, number);
    const completed = new Set(compatible && Array.isArray(old?.completed) ? old.completed.filter(n => validNumber(difficulty, n)) : []);
    const best = Object.fromEntries(Object.entries(compatible && old?.best || {}).filter(([n, used]) => validNumber(difficulty, Number(n))
      && Number.isSafeInteger(used) && used >= catalogue[difficulty][Number(n) - 1][4]));
    Object.keys(best).forEach(n => completed.add(Number(n)));
    if (game.submitted !== null) completed.add(number);
    return { number, game, completed, best };
  });
  let difficulty = validNumber(saved?.difficulty, 1) ? saved.difficulty : 0;
  const current = () => sessions[difficulty];
  const puzzle = () => oddCoinPuzzle(difficulty, current().number, catalogue);
  const states = () => remainingStates(puzzle(), current().game.log);
  const terminal = () => current().game.submitted !== null;
  const placements = () => Array.from({ length: puzzle().coins }, (_, i) => current().game.placements[i] || 0);
  const capture = () => ({ difficulty, number: current().number, game: clone(current().game) });
  function cleanHistory(entries) {
    if (!compatible || !Array.isArray(entries) || entries.length > ODD_COIN_HISTORY_LIMIT) return [];
    return entries.filter(entry => validNumber(entry?.difficulty, entry?.number) && entry?.game)
      .map(entry => ({ difficulty: entry.difficulty, number: entry.number, game: cleanGame(entry.game, entry.difficulty, entry.number) }));
  }
  let past = cleanHistory(saved?.actions?.past), future = cleanHistory(saved?.actions?.future);
  function rememberResult(index, number, game) {
    if (game.submitted === null) return;
    sessions[index].completed.add(number);
    sessions[index].best[number] = Math.min(sessions[index].best[number] ?? Infinity, game.log.length);
  }
  sessions.forEach((session, index) => rememberResult(index, session.number, session.game));
  for (const entry of [...past, ...future]) rememberResult(entry.difficulty, entry.number, entry.game);
  function commit(action) {
    const before = capture();
    if (action() === false || same(before, capture())) return false;
    past.push(before); past = past.slice(-ODD_COIN_HISTORY_LIMIT); future = []; return true;
  }
  function restore(entry) { difficulty = entry.difficulty; Object.assign(current(), { number: entry.number, game: clone(entry.game) }); }
  return {
    get puzzle() { return puzzle(); }, get difficulty() { return difficulty; }, get number() { return current().number; },
    get total() { return catalogue[difficulty].length; }, get log() { return clone(current().game.log); },
    get placements() { return placements(); }, get states() { return states(); }, get labels() { return clone(current().game.labels); },
    get used() { return current().game.log.length; }, get minimum() { return puzzle().limit; },
    get result() { return current().game.presenting ? recordedResult(current().game) : null; },
    get answer() { return clone(current().game.submitted); }, get solved() { return terminal(); },
    get completedCount() { return current().completed.size; }, get currentCompleted() { return current().completed.has(current().number); },
    get canUndo() { return past.length > 0; }, get canRedo() { return future.length > 0; },
    get canAdvance() { return current().completed.size < this.total - (this.currentCompleted ? 0 : 1); },
    puzzleResult(number) {
      if (!validNumber(difficulty, number)) return null;
      const minimum = catalogue[difficulty][number - 1][4], best = current().best[number] ?? null;
      return { minimum, best, status: best === minimum ? 'minimum' : current().completed.has(number) ? 'solved' : 'unsolved' };
    },
    moveCoins(coins, destination) {
      if (terminal() || !Array.isArray(coins) || !coins.length || !coins.every(coin => Number.isInteger(coin) && coin >= 1 && coin <= puzzle().coins) || ![-1, 0, 1].includes(destination)) return false;
      if (coins.every(coin => placements()[coin - 1] === destination)) return false;
      return commit(() => {
        const values = placements(); coins.forEach(coin => { values[coin - 1] = destination; });
        current().game.placements = values; current().game.presenting = false;
      });
    },
    arrange(left, right) {
      if (terminal() || !validWeighing(puzzle().coins, left, right)) return false;
      const values = placementsFor(puzzle().coins, { left, right });
      if (same(placements(), values)) return false;
      return commit(() => { current().game.placements = values; current().game.presenting = false; });
    },
    clearPans() {
      if (terminal() || !placements().some(Boolean)) return false;
      return commit(() => { current().game.placements = []; current().game.presenting = false; });
    },
    weigh() {
      const { left, right } = pansFor(placements());
      if (terminal() || !validWeighing(puzzle().coins, left, right)) return false;
      // Replaying a known comparison changes only its presentation, never the evidence or undo history.
      if (recordedResult(current().game)) { current().game.presenting = true; return true; }
      const reply = opponentReply(puzzle().coins, states(), left, right);
      return commit(() => {
        current().game.log.push({ left, right, outcome: reply.outcome }); current().game.presenting = true;
      });
    },
    labelCoins(coins, patch) {
      if (terminal() || !Array.isArray(coins) || !coins.length || !coins.every(coin => Number.isInteger(coin) && coin >= 1 && coin <= puzzle().coins)) return false;
      if (!patch || typeof patch !== 'object') return false;
      if ('mark' in patch && ![-1, 0, 1, null].includes(patch.mark)) return false;
      return commit(() => {
        for (const coin of coins) {
          const previous = current().game.labels[coin] || { mark: null, text: '' };
          const next = { mark: 'mark' in patch ? patch.mark : previous.mark, text: typeof patch.text === 'string' ? patch.text.slice(0, 16).trim() : previous.text };
          if (puzzle().genuine.includes(coin)) next.mark = 0;
          if (next.mark === null && !next.text) delete current().game.labels[coin]; else current().game.labels[coin] = next;
        }
      });
    },
    submitAnswer(answer) {
      if (terminal()) return { ok: false, reason: 'already-solved' };
      const candidate = normalizeAnswer(answer, puzzle()), possible = states();
      if (!candidate) return { ok: false, reason: 'invalid' };
      if (!possible.some(state => stateKey(state) === stateKey(candidate))) return { ok: false, reason: 'contradicted' };
      if (possible.length > 1) return { ok: false, reason: 'uncertain' };
      commit(() => { current().game.submitted = candidate; rememberResult(difficulty, current().number, current().game); });
      return { ok: true, used: this.used, minimum: this.minimum };
    },
    open(number) {
      if (!validNumber(difficulty, number) || number === current().number) return false;
      return commit(() => { Object.assign(current(), { number, game: blankGame() }); });
    },
    changeDifficulty(value) {
      if (!validNumber(value, 1) || value === difficulty) return false;
      return commit(() => { difficulty = value; });
    },
    next() {
      const candidates = Array.from({ length: this.total }, (_, i) => i + 1).filter(number => number !== current().number && !current().completed.has(number));
      if (!candidates.length) return false;
      const number = candidates.find(number => number > current().number) || candidates[0];
      return this.open(number);
    },
    reset() { return commit(() => { current().game = blankGame(); }); },
    undo() { if (!past.length) return false; future.push(capture()); restore(past.pop()); return true; },
    redo() { if (!future.length) return false; past.push(capture()); restore(future.pop()); return true; },
    resetProgress() {
      Object.assign(current(), { number: 1, game: blankGame(), completed: new Set(), best: {} });
      past = past.filter(entry => entry.difficulty !== difficulty); future = future.filter(entry => entry.difficulty !== difficulty);
    },
    exportState() {
      return { version: 3, difficulty, sessions: sessions.map(session => ({ number: session.number, game: clone(session.game),
        completed: [...session.completed].sort((a, b) => a - b), best: { ...session.best } })), actions: clone({ past, future }) };
    },
  };
}

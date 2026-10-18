import { initialPose, classify, makePointSet, lineDelta, mod } from './four-equal-regions.mjs';

export const REGIONS_HISTORY_LIMIT = 60;
const clone = value => JSON.parse(JSON.stringify(value));
const validN = n => Number.isInteger(n) && n >= 1 && n <= 12;
const validLegacyBoard = value => value && Number.isInteger(value.seed) && value.seed >= 0 && value.seed <= 0xffffffff
  && value.pose && ['x', 'y', 'a', 'b'].every(key => Number.isFinite(value.pose[key]))
  && Math.abs(value.pose.x) <= .78 && Math.abs(value.pose.y) <= .45
  && Math.abs(value.pose.a) < 100 && Math.abs(value.pose.b) < 100
  && Math.abs(lineDelta(value.pose.a - value.pose.b)) >= Math.PI / 15 - 1e-9;
const isPerpendicular = pose => Math.abs(Math.abs(lineDelta(pose.a - pose.b)) - Math.PI / 2) < 1e-6;
const validBoard = value => validLegacyBoard(value) && isPerpendicular(value.pose);
const validEntry = entry => validN(entry?.n) && validBoard(entry);
const seedFor = n => (71084239 + Math.imul(n - 6, 0x9e3779b9)) >>> 0;
const fresh = n => ({ seed: seedFor(n), pose: initialPose() });
const migrateBoard = value => {
  const board = { seed: value.seed, pose: clone(value.pose) };
  if (!isPerpendicular(board.pose)) board.pose.b = mod(board.pose.a - Math.PI / 2, Math.PI * 2);
  return board;
};

// Navigation and geometry share bounded history; each n retains its own point set.
export function createFourRegionsWorkspace(saved = null) {
  const source = [1, 2].includes(saved?.version) ? saved : null, legacy = source?.version === 1;
  const acceptsBoard = legacy ? validLegacyBoard : validBoard;
  let n = validN(source?.n) ? source.n : 6;
  // Preserve old point sets and positions while retiring independent rotation.
  const sessions = Object.fromEntries(Object.entries(source?.sessions || {}).filter(([key, value]) => validN(Number(key)) && acceptsBoard(value)).map(([key, value]) => [key, migrateBoard(value)]));
  let current = clone(sessions[n] || fresh(n));
  const cache = new Map();
  const acceptsEntry = legacy ? entry => validN(entry?.n) && typeof entry.perpendicular === 'boolean' && validLegacyBoard(entry)
    && (!entry.perpendicular || isPerpendicular(entry.pose)) : validEntry;
  const history = name => {
    const entries = source?.actions?.[name];
    if (!Array.isArray(entries) || entries.length > REGIONS_HISTORY_LIMIT || !entries.every(acceptsEntry)) return [];
    const migrated = entries.map(entry => ({ n: entry.n, ...migrateBoard(entry) }))
      .filter((entry, index, all) => !index || JSON.stringify(entry) !== JSON.stringify(all[index - 1]));
    // A retired mode toggle may now be identical to the current position.
    while (migrated.length && JSON.stringify(migrated.at(-1)) === JSON.stringify({ n, ...current })) migrated.pop();
    return migrated;
  };
  let past = history('past'), future = history('future');
  const record = () => { sessions[n] = clone(current); };
  const capture = () => ({ n, ...clone(current) });
  const remember = (entries, entry) => [...entries, clone(entry)].slice(-REGIONS_HISTORY_LIMIT);
  function restore(entry) {
    record(); n = entry.n;
    current = { seed: entry.seed, pose: clone(entry.pose) }; record();
  }
  function commit(before) {
    if (!validEntry(before) || JSON.stringify(before) === JSON.stringify(capture())) return false;
    past = remember(past, before); future = []; record(); return true;
  }
  function points() {
    const key = `${n}:${current.seed}`;
    if (!cache.has(key)) {
      cache.set(key, makePointSet(current.seed, n));
      if (cache.size > REGIONS_HISTORY_LIMIT + 12) cache.delete(cache.keys().next().value);
    }
    return cache.get(key);
  }
  return {
    get n() { return n; },
    get pose() { return clone(current.pose); }, get points() { return points().points; },
    get solution() { return clone(points().solution.pose); },
    get result() { return classify(points().points, current.pose); },
    get solved() { const result = this.result; return !result.boundary && result.counts.every(count => count === n); },
    get canUndo() { return past.length > 0; }, get canRedo() { return future.length > 0; },
    capture, commit,
    previewPose(pose) {
      if (!validBoard({ seed: current.seed, pose })) return false;
      current.pose = clone(pose); return true;
    },
    cancel(before) { if (validEntry(before)) restore(before); },
    changeN(next) {
      if (!validN(next) || next === n) return false;
      const before = capture(); record(); n = next; current = clone(sessions[n] || fresh(n));
      return commit(before);
    },
    reset() { const before = capture(); current.pose = initialPose(); return commit(before); },
    shuffle() { const before = capture(); current = { seed: (current.seed + 0x9e3779b9) >>> 0, pose: initialPose() }; return commit(before); },
    undo() { if (!past.length) return false; future = remember(future, capture()); restore(past.pop()); return true; },
    redo() { if (!future.length) return false; past = remember(past, capture()); restore(future.pop()); return true; },
    resetProgress() {
      current = fresh(n); record();
      past = past.filter(entry => entry.n !== n); future = future.filter(entry => entry.n !== n);
    },
    exportState() { record(); return { version: 2, n, sessions: clone(sessions), actions: clone({ past, future }) }; },
  };
}

import { initialPose, classify, makePointSet, lineDelta } from './four-equal-regions.mjs';

export const REGIONS_HISTORY_LIMIT = 60;
const clone = value => JSON.parse(JSON.stringify(value));
const validN = n => Number.isInteger(n) && n >= 1 && n <= 12;
const validBoard = value => value && Number.isInteger(value.seed) && value.seed >= 0 && value.seed <= 0xffffffff
  && value.pose && ['x', 'y', 'a', 'b'].every(key => Number.isFinite(value.pose[key]))
  && Math.abs(value.pose.x) <= .78 && Math.abs(value.pose.y) <= .45
  && Math.abs(value.pose.a) < 100 && Math.abs(value.pose.b) < 100
  && Math.abs(lineDelta(value.pose.a - value.pose.b)) >= Math.PI / 15 - 1e-9;
const validEntry = entry => validN(entry?.n) && typeof entry.perpendicular === 'boolean' && validBoard(entry)
  && (!entry.perpendicular || Math.abs(Math.abs(lineDelta(entry.pose.a - entry.pose.b)) - Math.PI / 2) < 1e-6);
const seedFor = n => (71084239 + Math.imul(n - 6, 0x9e3779b9)) >>> 0;
const fresh = n => ({ seed: seedFor(n), pose: initialPose() });
const makePerpendicular = pose => {
  if (Math.abs(Math.abs(lineDelta(pose.a - pose.b)) - Math.PI / 2) > 1e-9) pose.b = pose.a - Math.PI / 2;
};

// Navigation and geometry share bounded history; each n retains its own point set.
export function createFourRegionsWorkspace(saved = null) {
  const source = saved?.version === 1 ? saved : null;
  let n = validN(source?.n) ? source.n : 6, perpendicular = source?.perpendicular !== false;
  const sessions = Object.fromEntries(Object.entries(source?.sessions || {}).filter(([key, value]) => validN(Number(key)) && validBoard(value)).map(([key, value]) => [key, clone(value)]));
  let current = clone(sessions[n] || fresh(n));
  if (perpendicular) makePerpendicular(current.pose);
  const cache = new Map();
  const history = name => Array.isArray(source?.actions?.[name]) && source.actions[name].length <= REGIONS_HISTORY_LIMIT
    && source.actions[name].every(validEntry) ? clone(source.actions[name]) : [];
  let past = history('past'), future = history('future');
  const record = () => { sessions[n] = clone(current); };
  const capture = () => ({ n, perpendicular, ...clone(current) });
  const remember = (entries, entry) => [...entries, clone(entry)].slice(-REGIONS_HISTORY_LIMIT);
  function restore(entry) {
    record(); n = entry.n; perpendicular = entry.perpendicular;
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
    get n() { return n; }, get perpendicular() { return perpendicular; },
    get pose() { return clone(current.pose); }, get points() { return points().points; },
    get solution() { return clone(points().solution.pose); },
    get result() { return classify(points().points, current.pose); },
    get solved() { const result = this.result; return !result.boundary && result.counts.every(count => count === n); },
    get canUndo() { return past.length > 0; }, get canRedo() { return future.length > 0; },
    capture, commit,
    previewPose(pose) {
      if (!validBoard({ seed: current.seed, pose }) || (perpendicular && Math.abs(Math.abs(lineDelta(pose.a - pose.b)) - Math.PI / 2) > 1e-6)) return false;
      current.pose = clone(pose); return true;
    },
    cancel(before) { if (validEntry(before)) restore(before); },
    changeN(next) {
      if (!validN(next) || next === n) return false;
      const before = capture(); record(); n = next; current = clone(sessions[n] || fresh(n));
      if (perpendicular) makePerpendicular(current.pose);
      return commit(before);
    },
    setPerpendicular(value) {
      if (typeof value !== 'boolean' || value === perpendicular) return false;
      const before = capture(); perpendicular = value;
      if (perpendicular) makePerpendicular(current.pose);
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
    exportState() { record(); return { version: 1, n, perpendicular, sessions: clone(sessions), actions: clone({ past, future }) }; },
  };
}

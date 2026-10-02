import { LEVELS, buildLevel, normalizeShape, key } from './tiling.mjs?v=20261002-5';

export const DIFFICULTIES = Object.freeze([
  { name: 'Easy', width: 4, height: 4, holes: 3, sizes: [3, 3, 3, 4] },
  { name: 'Medium', width: 5, height: 5, holes: 3, sizes: [3, 3, 4, 4, 4, 4] },
  { name: 'Hard', width: 6, height: 6, holes: 3, sizes: [4, 4, 4, 4, 4, 4, 4, 5] },
  { name: 'Expert', width: 7, height: 7, holes: 4, sizes: [4, 4, 4, 4, 4, 5, 5, 5, 5, 5] },
].map(value => Object.freeze({ ...value, sizes: Object.freeze(value.sizes) })));
const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const shapeKey = cells => JSON.stringify(normalizeShape(cells));
const cache = new Map();
// Verified constructions provide a bounded fallback with the same tile budget.
const fallbackRows = [
  ['AAB.', 'ACBB', 'CCDD', '.CD.'],
  ['FEE.A', 'FFEEA', 'DFC.A', 'DCCC.', 'DBBBB'],
  ['AAAAAB', '.FFG.B', 'DFFGGB', 'DDHHGB', 'D.HHEE', 'CCCCEE'],
  ['CCCJIII', 'BBCJJJI', 'BHHHJGG', 'B.HHFG.', '.FFFFGG', 'EEEDAAA', 'EDDDD.A'],
];

function randomFor(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let n = Math.imul(value ^ value >>> 15, 1 | value);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
function shuffled(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function connected(cells) {
  const remaining = new Set(cells.map(cell => key(...cell))), queue = [cells[0]];
  remaining.delete(key(...cells[0]));
  while (queue.length) {
    const [x, y] = queue.pop();
    for (const [dx, dy] of neighbors) if (remaining.delete(key(x + dx, y + dy))) queue.push([x + dx, y + dy]);
  }
  return !remaining.size;
}

// Grow all distinct fixed orientations of the small connected tile shapes.
// Players receive exactly the orientation used to construct their floor.
const shapes = new Map([[1, [[[0, 0]]]]]);
for (let size = 2; size <= 5; size++) {
  const next = new Map();
  for (const previous of shapes.get(size - 1)) {
    const occupied = new Set(previous.map(cell => key(...cell)));
    for (const [x, y] of previous) for (const [dx, dy] of neighbors) {
      if (occupied.has(key(x + dx, y + dy))) continue;
      const cells = normalizeShape([...previous, [x + dx, y + dy]]);
      next.set(JSON.stringify(cells), cells);
    }
  }
  shapes.set(size, [...next.values()]);
}

function partition(config, floor, random) {
  const bits = new Map(floor.map((cell, index) => [key(...cell), 1n << BigInt(index)]));
  const byCell = floor.map(() => []), indices = new Map(floor.map((cell, index) => [key(...cell), index]));
  const remaining = new Map();
  config.sizes.forEach(size => remaining.set(size, (remaining.get(size) || 0) + 1));
  for (const size of remaining.keys()) for (const shape of shapes.get(size)) {
    const width = Math.max(...shape.map(cell => cell[0])) + 1, height = Math.max(...shape.map(cell => cell[1])) + 1;
    for (let y = 0; y <= config.height - height; y++) for (let x = 0; x <= config.width - width; x++) {
      const cells = shape.map(([dx, dy]) => [x + dx, y + dy]);
      if (cells.some(cell => !bits.has(key(...cell)))) continue;
      const candidate = { size, shape: shapeKey(shape), cells, mask: cells.reduce((mask, cell) => mask | bits.get(key(...cell)), 0n), score: random() };
      cells.forEach(cell => byCell[indices.get(key(...cell))].push(candidate));
    }
  }
  let occupied = 0n, steps = 0;
  const selected = [], usedShapes = new Map(), complete = (1n << BigInt(floor.length)) - 1n;
  function search() {
    if (occupied === complete) return true;
    if (++steps > 12000) return false;
    let choices = null;
    for (let index = 0; index < floor.length; index++) {
      if (occupied & (1n << BigInt(index))) continue;
      const options = byCell[index].filter(candidate => remaining.get(candidate.size) && !(candidate.mask & occupied) && (usedShapes.size < 8 || usedShapes.has(candidate.shape)));
      if (!options.length) return false;
      if (!choices || options.length < choices.length) choices = options;
      if (choices.length === 1) break;
    }
    choices.sort((a, b) => (a.score - (usedShapes.has(a.shape) ? .65 : 0)) - (b.score - (usedShapes.has(b.shape) ? .65 : 0)));
    for (const candidate of choices) {
      occupied |= candidate.mask; remaining.set(candidate.size, remaining.get(candidate.size) - 1);
      selected.push(candidate); usedShapes.set(candidate.shape, (usedShapes.get(candidate.shape) || 0) + 1);
      if (search()) return true;
      selected.pop(); occupied ^= candidate.mask; remaining.set(candidate.size, remaining.get(candidate.size) + 1);
      const count = usedShapes.get(candidate.shape) - 1;
      if (count) usedShapes.set(candidate.shape, count); else usedShapes.delete(candidate.shape);
    }
    return false;
  }
  return search() ? selected : null;
}

export function arrangementFingerprint(level) {
  return JSON.stringify([level.width, level.height, level.holes, level.types.map(type => [type.cells, type.count]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))]);
}

export function createArrangement(difficulty = 0, seed = 1) {
  if (!Number.isInteger(difficulty) || !DIFFICULTIES[difficulty]) throw new RangeError('Unknown difficulty.');
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) throw new RangeError('Invalid arrangement seed.');
  const cacheKey = `${difficulty}/${seed}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  // Keep the original introductory floor as the first Easy arrangement.
  if (difficulty === 0 && seed === 1) return { ...LEVELS[0], difficulty, seed };
  const config = DIFFICULTIES[difficulty], random = randomFor(seed);
  const rectangle = Array.from({ length: config.width * config.height }, (_, index) => [index % config.width, Math.floor(index / config.width)]);
  for (let attempt = 0; attempt < 64; attempt++) {
    const missing = new Set(shuffled(rectangle.map(cell => key(...cell)), random).slice(0, config.holes));
    const floor = rectangle.filter(cell => !missing.has(key(...cell)));
    if (!connected(floor)) continue;
    const tiles = partition(config, floor, random);
    if (!tiles) continue;
    const rows = Array.from({ length: config.height }, () => Array(config.width).fill('.'));
    tiles.forEach((tile, index) => tile.cells.forEach(([x, y]) => { rows[y][x] = String.fromCharCode(65 + index); }));
    const level = { ...buildLevel({ name: 'Floor', rows: rows.map(row => row.join('')) }), difficulty, seed };
    if (cache.size >= 32) cache.delete(cache.keys().next().value);
    cache.set(cacheKey, level);
    return level;
  }
  // This retains the requested difficulty even if an unusually unlucky seed exhausts the search.
  return { ...buildLevel({ name: 'Floor', rows: fallbackRows[difficulty] }), difficulty, seed };
}

export function randomSeed() {
  if (globalThis.crypto?.getRandomValues) return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] || 1;
  return Math.floor(Math.random() * 0xffffffff) + 1;
}

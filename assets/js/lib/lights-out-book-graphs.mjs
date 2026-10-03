import { makeGraph } from './lights-out-math.mjs';

export const LIGHTS_OUT_LEVELS = Object.freeze([
  { name: 'Easy', sizes: [6, 7, 8], presses: [2, 3] },
  { name: 'Medium', sizes: [9, 10, 11], presses: [4, 5] },
  { name: 'Hard', sizes: [12, 13, 14], presses: [6, 7] },
  { name: 'Expert', sizes: [15, 16, 17, 18], presses: [8, 10] },
]);

export function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let n = Math.imul(value ^ value >>> 15, 1 | value);
    n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
    return ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}

const polar = (angle, radius) => [.5 + radius * Math.cos(angle), .5 + radius * Math.sin(angle)];
const ring = (size, radius = .4, phase = -Math.PI / 2) => Array.from({ length: size }, (_, i) => polar(phase + 2 * Math.PI * i / size, radius));
const cycle = size => Array.from({ length: size }, (_, i) => [i, (i + 1) % size]);
function orbits(size) {
  if (size <= 12) return ring(size);
  const outer = Math.ceil(size * 2 / 3);
  return [...ring(outer), ...ring(size - outer, .205, -Math.PI / 2 + Math.PI / outer)];
}

function branches(size, variant) {
  const arms = Math.max(2, Math.floor(size / 3));
  const positions = [[.5, .5], ...ring(arms, .205)], edges = [];
  let remaining = size - arms - 1;
  for (let arm = 0; arm < arms; arm++) {
    edges.push([0, arm + 1]);
    const children = Math.ceil(remaining / (arms - arm));
    remaining -= children;
    for (let j = 0; j < children; j++) {
      const angle = -Math.PI / 2 + arm * 2 * Math.PI / arms + (j - (children - 1) / 2) * .48;
      const i = positions.length;
      positions.push(polar(angle, .415));
      edges.push([arm + 1, i]);
    }
  }
  if (variant) {
    // Reattach an outer leaf to the next branch while retaining a tree.
    const leaf = arms + 1, edge = edges.find(edge => edge[1] === leaf);
    edge[0] = 2;
  }
  return { positions, edges };
}

const orientation = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
const intersects = (a, b, c, d) => orientation(a, b, c) * orientation(a, b, d) < 0 && orientation(c, d, a) * orientation(c, d, b) < 0;
function network(size, seed) {
  const random = seededRandom(seed * 7919 + size);
  const points = Array.from({ length: 5 }, (_, row) => {
    const columns = row % 2 ? 3 : 4;
    return Array.from({ length: columns }, (_, col) => [
      (row % 2 ? .24 : .12) + col * .25 + (random() - .5) * .035,
      .1 + row * .2 + (random() - .5) * .025,
    ]);
  }).flat();
  const positions = Array.from({ length: size }, (_, i) => points[Math.floor(i * points.length / size)]);
  const pairs = [];
  for (let a = 0; a < size; a++) for (let b = a + 1; b < size; b++) pairs.push({ a, b, distance: Math.hypot(positions[a][0] - positions[b][0], positions[a][1] - positions[b][1]) });
  pairs.sort((a, b) => a.distance - b.distance);
  const groups = Array.from({ length: size }, (_, i) => i), edges = [];
  for (const { a, b } of pairs) if (groups[a] !== groups[b]) {
    const from = groups[b], to = groups[a];
    groups.forEach((value, i) => { if (value === from) groups[i] = to; });
    edges.push([a, b]);
  }
  const extra = Math.floor(size / 3) + seed % 3;
  for (const { a, b, distance } of pairs) {
    if (edges.length >= size - 1 + extra) break;
    if (distance > .5 || edges.some(([c, d]) => c === a && d === b)) continue;
    if (edges.some(([c, d]) => c !== a && c !== b && d !== a && d !== b && intersects(positions[a], positions[b], positions[c], positions[d]))) continue;
    if (edges.filter(([c, d]) => c === a || d === a).length >= 4 || edges.filter(([c, d]) => c === b || d === b).length >= 4) continue;
    edges.push([a, b]);
  }
  return { positions, edges };
}

// These definitions and catalogue keys are stable: a puzzle number identifies
// the same graph and starting lights on every visit.
export const BOOK_GRAPHS = {};
const fingerprints = new Set();
const segmentDistance = (point, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy);
};
function add(key, name, family, size, edges, positions) {
  const normalized = [...new Map(edges.filter(([a, b]) => a !== b).map(([a, b]) => {
    const pair = [Math.min(a, b), Math.max(a, b)];
    return [pair.join(','), pair];
  })).values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  // An edge must never look as though it connects an unrelated light.
  if (normalized.some(([a, b]) => positions.some((point, i) => i !== a && i !== b && segmentDistance(point, positions[a], positions[b]) < .065))) return;
  const fingerprint = JSON.stringify([size, normalized]);
  if (fingerprints.has(fingerprint)) return;
  fingerprints.add(fingerprint);
  BOOK_GRAPHS[key] = { ...makeGraph(size, normalized, positions), key, name, family };
}
for (let size = 6; size <= 18; size++) {
  const positions = orbits(size);
  add(`path-${size}`, 'Open loop', 'paths', size, cycle(size).slice(0, -1), positions);
  add(`loop-${size}`, 'Loop', 'loops', size, cycle(size), positions);
  for (let variant = 0; variant < 2; variant++) {
    const tree = branches(size, variant);
    add(`branches-${size}-${variant}`, 'Branches', 'trees', size, tree.edges, tree.positions);
  }
  for (let variant = 1; variant <= 3; variant++) {
    const edges = cycle(size);
    for (let i = 0; i < variant; i++) edges.push([i, size - 2 - i]);
    add(`chords-${size}-${variant}`, 'Loop with chords', 'chords', size, edges, positions);
  }
  if (size <= 13) {
    const edges = cycle(size - 1).map(([a, b]) => [a + 1, b + 1]);
    edges.push(...Array.from({ length: size - 1 }, (_, i) => [0, i + 1]));
    add(`wheel-${size}`, 'Wheel', 'wheels', size, edges, [[.5, .5], ...ring(size - 1)]);
  }
  for (let seed = 1; seed <= 16; seed++) {
    const graph = network(size, seed);
    add(`network-${size}-${seed}`, 'Network', 'networks', size, graph.edges, graph.positions);
  }
}

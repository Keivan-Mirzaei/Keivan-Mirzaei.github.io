// Lights and press sets are bit masks. Addition is XOR: two toggles cancel.
// The built-in boards have at most 25 vertices, below the 31-bit mask limit.
export function makeGraph(size, edges, positions = []) {
  if (!Number.isInteger(size) || size < 1 || size > 25) throw new RangeError('Use 1–25 vertices.');
  const neighbors = Array(size).fill(0);
  for (const [a, b] of edges) {
    if (a === b || a < 0 || b < 0 || a >= size || b >= size) throw new RangeError('Edges join two distinct vertices.');
    neighbors[a] |= 1 << b;
    neighbors[b] |= 1 << a;
  }
  return { size, edges, positions, neighbors, all: (1 << size) - 1 };
}

function grid(side) {
  const edges = [], positions = [];
  for (let row = 0; row < side; row++) for (let col = 0; col < side; col++) {
    const i = row * side + col;
    positions.push([(col + .5) / side, (row + .5) / side]);
    if (col + 1 < side) edges.push([i, i + 1]);
    if (row + 1 < side) edges.push([i, i + side]);
  }
  return { ...makeGraph(side * side, edges, positions), side };
}

function ring(size) {
  return makeGraph(size, Array.from({ length: size }, (_, i) => [i, (i + 1) % size]),
    Array.from({ length: size }, (_, i) => [.5 + .35 * Math.cos(2 * Math.PI * i / size - Math.PI / 2), .5 + .35 * Math.sin(2 * Math.PI * i / size - Math.PI / 2)]));
}

export const BOARDS = {
  'grid-3': { ...grid(3), name: '3 × 3 grid' },
  'grid-4': { ...grid(4), name: '4 × 4 grid' },
  'grid-5': { ...grid(5), name: '5 × 5 grid' },
  'path-4': { ...makeGraph(4, [[0, 1], [1, 2], [2, 3]], [[.14, .5], [.38, .5], [.62, .5], [.86, .5]]), name: 'Path of four' },
  'cycle-5': { ...ring(5), name: 'Five-light cycle' },
  'triangle': { ...ring(3), name: 'Triangle' },
  'star-5': { ...makeGraph(5, [[0, 1], [0, 2], [0, 3], [0, 4]], [[.5, .5], [.5, .15], [.85, .5], [.5, .85], [.15, .5]]), name: 'Four-leaf star' },
  'pair': { ...makeGraph(2, [[0, 1]], [[.3, .5], [.7, .5]]), name: 'Two joined lights' },
};

export function vertices(mask, size) {
  return Array.from({ length: size }, (_, i) => i).filter(i => mask & (1 << i));
}

export function countBits(mask) {
  let count = 0;
  while (mask) { mask &= mask - 1; count++; }
  return count;
}

export const parity = mask => countBits(mask) % 2;

export function pressEffect(graph, presses) {
  let effect = 0;
  for (const vertex of vertices(presses, graph.size)) effect ^= graph.neighbors[vertex] | (1 << vertex);
  return effect;
}

// Row reduction over F_2 finds every reduced press set and, if inconsistent,
// an invariant witnessing impossibility. This is the game engine; the article
// and complementProof below give the paper's separate combinatorial argument.
export function solvePresses(graph, difference) {
  const rows = graph.neighbors.map((adjacent, i) => ({ mask: adjacent | (1 << i), rhs: (difference >> i) & 1, witness: 1 << i }));
  const pivots = [];
  for (let col = 0; col < graph.size; col++) {
    const found = rows.findIndex((row, i) => i >= pivots.length && (row.mask & (1 << col)));
    if (found < 0) continue;
    const pivot = pivots.length;
    [rows[pivot], rows[found]] = [rows[found], rows[pivot]];
    for (let i = 0; i < rows.length; i++) if (i !== pivot && (rows[i].mask & (1 << col))) {
      rows[i].mask ^= rows[pivot].mask;
      rows[i].rhs ^= rows[pivot].rhs;
      rows[i].witness ^= rows[pivot].witness;
    }
    pivots.push(col);
  }
  const inconsistent = rows.find(row => row.mask === 0 && row.rhs === 1);
  if (inconsistent) return { solutions: [], basis: [], rank: pivots.length, witness: inconsistent.witness };
  let particular = 0;
  pivots.forEach((col, i) => { if (rows[i].rhs) particular |= 1 << col; });
  const free = Array.from({ length: graph.size }, (_, i) => i).filter(i => !pivots.includes(i));
  const basis = free.map(col => {
    let mask = 1 << col;
    pivots.forEach((pivot, i) => { if (rows[i].mask & (1 << col)) mask |= 1 << pivot; });
    return mask;
  });
  // All built-in boards have nullity at most four. Bound enumeration for callers
  // constructing other graphs, rather than freezing on millions of solutions.
  if (basis.length > 16) throw new RangeError('Too many solutions to enumerate.');
  const solutions = [particular];
  for (const neutral of basis) solutions.push(...solutions.map(solution => solution ^ neutral));
  solutions.sort((a, b) => countBits(a) - countBits(b) || a - b);
  return { particular, basis, solutions, rank: pivots.length, witness: 0 };
}

export function samplePuzzle(graph, random = Math.random) {
  let presses = 0;
  for (let i = 0; i < graph.size; i++) if (random() < .5) presses |= 1 << i;
  const lights = pressEffect(graph, presses);
  return lights || pressEffect(graph, 1);
}

// Construct a complementation sequence exactly by the paper's induction.
// Each recursive subproblem is an induced subgraph of the original graph.
export function complementProof(graph) {
  const memo = new Map([[0, { presses: 0 }]]);
  function visit(active) {
    if (memo.has(active)) return memo.get(active);
    const candidates = [];
    // Prefer omitting vertices of lower degree in the original graph. This
    // chooses interior buttons on two-vertex subpaths and makes both proof
    // branches visible among the demonstration presets.
    const omissionOrder = vertices(active, graph.size).sort((a, b) => countBits(graph.neighbors[a]) - countBits(graph.neighbors[b]) || a - b);
    for (const omitted of omissionOrder) {
      const presses = visit(active ^ (1 << omitted)).presses;
      const effect = pressEffect(graph, presses) & active;
      candidates.push({ omitted, presses, effect });
      if (effect === active) {
        const result = { presses, branch: 'lift', candidates, active };
        memo.set(active, result);
        return result;
      }
    }
    const oddVertices = vertices(active, graph.size).filter(i => parity(graph.neighbors[i] & active));
    let correction = 0;
    for (const i of oddVertices) correction ^= candidates.find(candidate => candidate.omitted === i).presses;
    const result = { presses: active ^ correction, correction, oddVertices, candidates, branch: 'pairs', active };
    memo.set(active, result);
    return result;
  }
  return visit(graph.all);
}

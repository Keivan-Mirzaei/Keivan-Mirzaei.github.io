// Red joins rows 0 and n-1; Blue joins columns 0 and n-1.
export const RED = 1, BLUE = 2;
export const PROOF_EXAMPLE = [2, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1];
const DIRECTIONS = [[-1, 1], [0, 1], [1, 0], [1, -1], [0, -1], [-1, 0]];
const boards = new Map();

export function hexBoard(size) {
  if (!Number.isInteger(size) || size < 1 || size > 11) throw new RangeError('Board size must be between 1 and 11.');
  if (boards.has(size)) return boards.get(size);
  const neighbors = Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size), col = i % size;
    return DIRECTIONS.map(([dr, dc]) => [row + dr, col + dc])
      .filter(([r, c]) => r >= 0 && r < size && c >= 0 && c < size)
      .map(([r, c]) => r * size + c);
  });
  const board = { size, count: size * size, neighbors };
  boards.set(size, board);
  return board;
}

export function winningPath(cells, size, color) {
  const board = hexBoard(size), previous = new Int16Array(board.count).fill(-2), queue = [];
  for (let k = 0; k < size; k++) {
    const i = color === RED ? k : k * size;
    if (cells[i] === color) { previous[i] = -1; queue.push(i); }
  }
  for (let p = 0; p < queue.length; p++) {
    const i = queue[p];
    if ((color === RED ? Math.floor(i / size) : i % size) === size - 1) {
      const path = [];
      for (let j = i; j !== -1; j = previous[j]) path.push(j);
      return path.reverse();
    }
    for (const next of board.neighbors[i]) {
      if (cells[next] === color && previous[next] === -2) {
        previous[next] = i; queue.push(next);
      }
    }
  }
  return [];
}

export function winner(cells, size) {
  return winningPath(cells, size, RED).length ? RED : winningPath(cells, size, BLUE).length ? BLUE : 0;
}

export function legalMoves(cells) {
  return Array.from(cells.keys()).filter(i => cells[i] === 0);
}

// Number of empty cells needed along a cheapest chain; enemy cells are impassable.
export function connectionCost(cells, size, color) {
  const board = hexBoard(size), distances = new Float64Array(board.count).fill(Infinity);
  const visited = new Uint8Array(board.count);
  for (let k = 0; k < size; k++) {
    const i = color === RED ? k : k * size;
    if (cells[i] !== 3 - color) distances[i] = cells[i] === color ? 0 : 1;
  }
  for (let p = 0; p < board.count; p++) {
    let best = -1;
    for (let i = 0; i < board.count; i++) if (!visited[i] && (best < 0 || distances[i] < distances[best])) best = i;
    if (best < 0 || !Number.isFinite(distances[best])) return Infinity;
    if ((color === RED ? Math.floor(best / size) : best % size) === size - 1) return distances[best];
    visited[best] = 1;
    for (const next of board.neighbors[best]) {
      if (cells[next] === 3 - color) continue;
      distances[next] = Math.min(distances[next], distances[best] + (cells[next] === color ? 0 : 1));
    }
  }
  return Infinity;
}

export function immediateWins(cells, size, color) {
  const trial = Array.from(cells), wins = [];
  for (const i of legalMoves(cells)) {
    trial[i] = color;
    if (winningPath(trial, size, color).length) wins.push(i);
    trial[i] = 0;
  }
  return wins;
}

export function rankedMoves(cells, size, color, random = Math.random) {
  const board = hexBoard(size), trial = Array.from(cells), center = (size - 1) / 2;
  return legalMoves(cells).map(move => {
    trial[move] = color;
    const own = connectionCost(trial, size, color), other = connectionCost(trial, size, 3 - color);
    trial[move] = 0;
    const friends = board.neighbors[move].filter(i => cells[i] === color).length;
    const centrality = size - Math.abs(Math.floor(move / size) - center) - Math.abs(move % size - center);
    const score = (Number.isFinite(other) ? other : size * size) * 1.15
      - (Number.isFinite(own) ? own : size * size) * 1.5 + friends * .12 + centrality * .06 + random() * .035;
    return { move, score };
  }).sort((a, b) => b.score - a.score);
}

export function chooseMove(cells, size, color, level = 'medium', random = Math.random) {
  if (winner(cells, size)) return -1;
  const legal = legalMoves(cells);
  if (!legal.length) return -1;
  if (level === 'easy') return legal[Math.min(legal.length - 1, Math.floor(random() * legal.length))];
  const wins = immediateWins(cells, size, color);
  if (wins.length) return wins[0];
  const threats = immediateWins(cells, size, 3 - color);
  if (threats.length) return threats[0];
  return rankedMoves(cells, size, color, random)[0].move;
}

// A rollout uses incremental connectivity instead of scanning the entire board after every move.
function connectivity(cells, size) {
  const board = hexBoard(size), a = board.count, b = a + 1;
  const parents = [null, Int16Array.from({ length: a + 2 }, (_, i) => i), Int16Array.from({ length: a + 2 }, (_, i) => i)];
  function root(parent, i) {
    while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
    return i;
  }
  function place(i, color) {
    cells[i] = color;
    const parent = parents[color], join = j => { parent[root(parent, i)] = root(parent, j); };
    const axis = color === RED ? Math.floor(i / size) : i % size;
    if (axis === 0) join(a);
    if (axis === size - 1) join(b);
    for (const j of board.neighbors[i]) if (cells[j] === color) join(j);
    return root(parent, a) === root(parent, b);
  }
  for (let i = 0; i < board.count; i++) if (cells[i]) place(i, cells[i]);
  return place;
}

function treeNode(move, player, moves, prior = 0) {
  return { move, player, untried: moves, prior, children: [], visits: 0, wins: 0 };
}

// UCT with alternating-player values and a small connection-cost prior.
// Exposed in batches so the UI can yield when module workers are unavailable.
export function createSearch(cells, size, color, random = Math.random) {
  const tactical = chooseMove(cells, size, color, 'medium', random);
  if (tactical < 0 || immediateWins(cells, size, color).length || immediateWins(cells, size, 3 - color).length) {
    return { run() {}, best: () => tactical, visits: () => 0, solved: true };
  }
  const ranked = rankedMoves(cells, size, color, random);
  const root = treeNode(-1, 3 - color, ranked.map(({ move }) => move));
  const priors = new Map(ranked.map(({ move, score }) => [move, score - ranked[ranked.length - 1].score]));
  function iteration() {
    const trial = Array.from(cells), place = connectivity(trial, size), trail = [root];
    let node = root, next = color, won = 0;
    while (!won) {
      if (node.untried.length) {
        const move = node.untried.shift();
        won = place(move, next) ? next : 0;
        const child = treeNode(move, next, legalMoves(trial), node === root ? priors.get(move) : 0);
        node.children.push(child); node = child; trail.push(node); next = 3 - next;
        break;
      }
      if (!node.children.length) break;
      const log = Math.log(node.visits + 1);
      node = node.children.reduce((best, child) => {
        const value = n => n.wins / n.visits + Math.sqrt(1.5 * log / n.visits) + .16 * n.prior / (n.visits + 1);
        return value(child) > value(best) ? child : best;
      });
      won = place(node.move, next) ? next : 0; trail.push(node); next = 3 - next;
    }
    const remaining = legalMoves(trial);
    for (let k = remaining.length - 1; k > 0; k--) {
      const j = Math.floor(random() * (k + 1));
      [remaining[k], remaining[j]] = [remaining[j], remaining[k]];
    }
    for (const move of remaining) {
      if (won) break;
      if (place(move, next)) won = next;
      next = 3 - next;
    }
    for (const n of trail) { n.visits++; if (won === n.player) n.wins++; }
  }
  return {
    run(count = 100) { for (let i = 0; i < count; i++) iteration(); },
    best: () => root.children.length ? root.children.reduce((a, b) => b.visits > a.visits ? b : a).move : tactical,
    visits: () => root.visits,
    solved: false
  };
}

// Integer lattice coordinates identify shared vertices exactly.
const CORNERS = [[0, -2], [1, -1], [1, 1], [0, 2], [-1, 1], [-1, -1]];
const exteriorColor = face => face === -1 || face === -2 ? RED : BLUE;
export function hexGeometry(size) {
  const points = new Map(), edges = new Map(), cells = [];
  const key = ([x, y]) => `${x},${y}`;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    const i = r * size + c, center = [2 * c + r, 3 * r];
    const vertices = CORNERS.map(([dx, dy]) => [center[0] + dx, center[1] + dy]);
    vertices.forEach(p => points.set(key(p), p));
    cells.push({ center, vertices });
    for (let s = 0; s < 6; s++) {
      const from = key(vertices[s]), to = key(vertices[(s + 1) % 6]);
      const id = [from, to].sort().join('|');
      if (edges.has(id)) { edges.get(id).faces.push(i); continue; }
      const [dr, dc] = DIRECTIONS[s], nr = r + dr, nc = c + dc;
      const outside = nr < 0 ? -1 : nr >= size ? -2 : nc < 0 ? -3 : nc >= size ? -4 : 0;
      edges.set(id, { from, to, faces: outside ? [i, outside] : [i] });
    }
  }
  const boundary = new Map();
  for (const e of edges.values()) if (e.faces[1] < 0) {
    for (const v of [e.from, e.to]) {
      if (!boundary.has(v)) boundary.set(v, []);
      boundary.get(v).push(e);
    }
  }
  const ports = [];
  for (const [v, adjacent] of boundary) {
    const faces = [...new Set(adjacent.map(e => e.faces[1]))];
    if (faces.length !== 2 || exteriorColor(faces[0]) === exteriorColor(faces[1])) continue;
    const red = faces.find(f => exteriorColor(f) === RED), blue = faces.find(f => exteriorColor(f) === BLUE);
    const name = red === -1 ? (blue === -3 ? 'NW' : 'NE') : (blue === -3 ? 'SW' : 'SE');
    const p = points.get(v), incident = adjacent.map(e => cells[e.faces[0]].center);
    const dx = p[0] - (incident[0][0] + incident[1][0]) / 2;
    const dy = p[1] - (incident[0][1] + incident[1][1]) / 2;
    const length = Math.hypot(dx * Math.sqrt(3), dy);
    const end = [p[0] + dx * 1.8 / length, p[1] + dy * 1.8 / length];
    const port = `port-${name}`;
    points.set(port, end);
    ports.push({ name, vertex: port, corner: v, faces });
    edges.set(port, { from: v, to: port, faces });
  }
  return { size, cells, points, edges: [...edges.values()], ports };
}

export function coastline(cells, size) {
  if (cells.length !== size * size || cells.some(c => c !== RED && c !== BLUE)) throw new Error('The coastline proof needs a fully coloured board.');
  const geometry = hexGeometry(size), graph = new Map();
  const color = face => face < 0 ? exteriorColor(face) : cells[face];
  const shore = geometry.edges.filter(e => color(e.faces[0]) !== color(e.faces[1]));
  shore.forEach((edge, i) => {
    for (const v of [edge.from, edge.to]) {
      if (!graph.has(v)) graph.set(v, []);
      graph.get(v).push(i);
    }
  });
  const start = geometry.ports.find(p => p.name === 'NW').vertex;
  const vertices = [start], tour = [], seen = new Set();
  let current = start, previous = -1;
  while (true) {
    const options = (graph.get(current) || []).filter(i => i !== previous);
    if (!options.length) break;
    if (options.length !== 1) throw new Error('A coastline cannot branch.');
    const index = options[0];
    if (seen.has(index)) throw new Error('An endpoint coastline cannot loop.');
    seen.add(index);
    const edge = shore[index]; tour.push(edge);
    current = edge.from === current ? edge.to : edge.from;
    vertices.push(current); previous = index;
  }
  const end = geometry.ports.find(p => p.vertex === current)?.name;
  const along = new Set(tour.flatMap(e => e.faces).filter(i => i >= 0));
  const bordering = Array.from(cells, (c, i) => along.has(i) ? c : 0);
  const redPath = winningPath(bordering, size, RED), bluePath = winningPath(bordering, size, BLUE);
  const win = redPath.length ? RED : bluePath.length ? BLUE : 0;
  return { geometry, shore, graph, tour, vertices, end, winner: win, path: win === RED ? redPath : bluePath };
}

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
  const count = size * size;
  // Goal edges act like stones when recognizing the two empty carriers of a bridge.
  const graphs = [null, RED, BLUE].map(color => {
    if (!color) return null;
    const graph = neighbors.map(adjacent => adjacent.slice());
    graph.push([], []);
    for (let i = 0; i < count; i++) {
      const axis = color === RED ? Math.floor(i / size) : i % size;
      if (axis === 0) { graph[i].push(count); graph[count].push(i); }
      if (axis === size - 1) { graph[i].push(count + 1); graph[count + 1].push(i); }
    }
    return graph;
  });
  const bridges = [null, [], []], carriers = [null, [], []], endpoints = [null, [], []];
  for (const color of [RED, BLUE]) {
    carriers[color] = Array.from({ length: count }, () => []);
    endpoints[color] = Array.from({ length: count }, () => []);
    const graph = graphs[color];
    for (let a = 0; a < count; a++) for (let b = a + 1; b < count + 2; b++) {
      if (graph[a].includes(b)) continue;
      const common = graph[a].filter(i => i < count && graph[b].includes(i));
      if (common.length !== 2) continue;
      const bridge = { a, b, carriers: common };
      bridges[color].push(bridge);
      endpoints[color][a].push(bridge);
      if (b < count) endpoints[color][b].push(bridge);
      common.forEach(i => carriers[color][i].push(bridge));
    }
  }
  const board = { size, count, neighbors, graphs, bridges, carriers, endpoints };
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
    const own = virtualCost(trial, size, color), other = virtualCost(trial, size, 3 - color);
    trial[move] = 0;
    const centrality = size - Math.abs(Math.floor(move / size) - center) - Math.abs(move % size - center);
    const score = (Number.isFinite(other) ? other : size * size) * 1.15
      - (Number.isFinite(own) ? own : size * size) * 1.5
      + localScore(cells, board, move, color) * .15 + centrality * .06 + random() * .035;
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

const owns = (cells, count, i, color) => i >= count || cells[i] === color;

// A bridge is already a connection if its owner can answer on the other carrier.
// These virtual links guide move ordering; only actual stones can prove a win.
function virtualCost(cells, size, color) {
  const board = hexBoard(size), count = board.count, graph = board.graphs[color];
  const links = Array.from({ length: count + 2 }, () => []);
  for (const { a, b, carriers: [x, y] } of board.bridges[color]) {
    if (owns(cells, count, a, color) && owns(cells, count, b, color) && !cells[x] && !cells[y]) {
      links[a].push(b); links[b].push(a);
    }
  }
  const distances = new Float64Array(count + 2).fill(Infinity), visited = new Uint8Array(count + 2);
  distances[count] = 0;
  for (let p = 0; p < count + 2; p++) {
    let best = -1;
    for (let i = 0; i < count + 2; i++) if (!visited[i] && (best < 0 || distances[i] < distances[best])) best = i;
    if (best < 0 || !Number.isFinite(distances[best])) return Infinity;
    if (best === count + 1) return distances[best];
    visited[best] = 1;
    for (const next of graph[best]) {
      if (next < count && cells[next] === 3 - color) continue;
      const cost = owns(cells, count, next, color) ? 0 : 1;
      distances[next] = Math.min(distances[next], distances[best] + cost);
    }
    for (const next of links[best]) distances[next] = Math.min(distances[next], distances[best]);
  }
  return Infinity;
}

function localScore(cells, board, move, color) {
  const { count, size, neighbors } = board, enemy = 3 - color, center = (size - 1) / 2;
  const friends = neighbors[move].filter(i => cells[i] === color);
  let score = friends.length * .35 + neighbors[move].filter(i => cells[i] === enemy).length * .2;
  // Connecting two stones through a bridge is more useful than filling a triangle.
  for (let a = 0; a < friends.length; a++) for (let b = a + 1; b < friends.length; b++) {
    score += neighbors[friends[a]].includes(friends[b]) ? -.4 : .7;
  }
  for (const bridge of board.endpoints[color][move]) {
    const other = bridge.a === move ? bridge.b : bridge.a;
    if (owns(cells, count, other, color) && bridge.carriers.every(i => !cells[i])) score += .65;
  }
  for (const { a, b, carriers: [x, y] } of board.carriers[color][move]) {
    if (!owns(cells, count, a, color) || !owns(cells, count, b, color)) continue;
    const other = x === move ? y : x;
    score += cells[other] === enemy ? 4 : !cells[other] ? -.8 : 0;
  }
  return score + (size - Math.abs(Math.floor(move / size) - center) - Math.abs(move % size - center)) * .08;
}

// Incremental union-find supports wins and threats without rescanning every path.
function connectivity(cells, size, source = null) {
  const board = hexBoard(size), a = board.count, b = a + 1;
  const parents = source ? source.parents.map(parent => parent?.slice())
    : [null, Int16Array.from({ length: a + 2 }, (_, i) => i), Int16Array.from({ length: a + 2 }, (_, i) => i)];
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
  if (!source) for (let i = 0; i < board.count; i++) if (cells[i]) place(i, cells[i]);
  function winningMoves(color, moves) {
    const parent = parents[color], start = root(parent, a), end = root(parent, b), wins = [];
    for (const i of moves) {
      let top = false, bottom = false;
      for (const j of board.graphs[color][i]) {
        if (!owns(cells, a, j, color)) continue;
        const r = root(parent, j);
        if (r === start) top = true;
        if (r === end) bottom = true;
      }
      if (top && bottom) wins.push(i);
    }
    return wins;
  }
  function touchesGoal(i, color) {
    const parent = parents[color], component = root(parent, i);
    return component === root(parent, a) || component === root(parent, b);
  }
  return { place, winningMoves, touchesGoal, parents };
}

function treeNode(move, player, prior = 0) {
  return { move, player, prior, untried: null, children: [], visits: 0, wins: 0, result: 0, raveVisits: null, raveWins: null };
}

function orderedMoves(cells, board, color, moves, random) {
  return moves.map(move => ({ move, score: localScore(cells, board, move, color) + random() * .25 }))
    .sort((a, b) => b.score - a.score);
}

// Exact negamax is incremental too: each yielded state consumes one unit of work.
// Memoization and forcing moves make small boards and late games practical.
function* solvePosition(cells, size, color, moves, cache, random, answer = null) {
  yield;
  const key = `${color}:${cells.join('')}`;
  if (cache.has(key)) return cache.get(key);
  const connected = connectivity(cells, size), wins = connected.winningMoves(color, moves);
  if (wins.length) { if (answer) answer.move = wins[0]; cache.set(key, true); return true; }
  const threats = connected.winningMoves(3 - color, moves);
  if (threats.length > 1) { cache.set(key, false); return false; }
  const choices = threats.length ? threats : orderedMoves(cells, hexBoard(size), color, moves, random).map(({ move }) => move);
  for (const move of choices) {
    // If the budget expires, prefer the candidate still being investigated over
    // an earlier move whose entire continuation has already been proven losing.
    if (answer) answer.move = move;
    cells[move] = color;
    const replies = moves.filter(i => i !== move);
    const lost = yield* solvePosition(cells, size, 3 - color, replies, cache, random);
    cells[move] = 0;
    if (!lost) { if (answer) answer.move = move; cache.set(key, true); return true; }
  }
  cache.set(key, false);
  return false;
}

// RAVE shares evidence from later moves with earlier positions, so a large board
// does not need thousands of independent visits to learn about each candidate.
// Rollouts answer bridge attacks and avoid filling intact friendly bridges.
export function createSearch(cells, size, color, random = Math.random) {
  cells = Array.from(cells); // Batched searches own their position, even if a caller edits the board.
  const board = hexBoard(size), moves = legalMoves(cells);
  const finished = move => ({ run() {}, best: () => move, visits: () => 0, solved: true });
  if (!moves.length || winner(cells, size)) return finished(-1);
  const base = connectivity(cells, size);
  const wins = base.winningMoves(color, moves), threats = base.winningMoves(3 - color, moves);
  if (wins.length || threats.length) return finished(wins[0] ?? threats[0]);
  if (color === RED && moves.length === board.count && moves.length > 12) {
    return finished(Math.floor(size / 2) * size + Math.floor((size - 1) / 2));
  }
  const ranked = rankedMoves(cells, size, color, random), tactical = ranked[0].move;
  if (moves.length <= 12) {
    let count = 0, solved = false;
    const answer = { move: tactical }, solver = solvePosition(cells.slice(), size, color, moves, new Map(), random, answer);
    return {
      run(limit = 100) { for (let i = 0; i < limit && !solved; i++) { solved = solver.next().done; count++; } },
      best: () => answer.move, visits: () => count, get solved() { return solved; }
    };
  }
  const root = treeNode(-1, 3 - color);
  root.untried = ranked.slice();
  const low = ranked[ranked.length - 1].score, range = ranked[0].score - low || 1;
  root.untried.forEach(candidate => { candidate.prior = (candidate.score - low) / range; });

  function prepare(node, trial, next, connected, remaining) {
    if (node.untried) return;
    const wins = connected.winningMoves(next, remaining), threats = connected.winningMoves(3 - next, remaining);
    if (wins.length) node.untried = [{ move: wins[0], prior: 1 }];
    else if (threats.length > 1) { node.result = 3 - next; node.untried = []; }
    else {
      const choices = orderedMoves(trial, board, next, threats.length ? threats : remaining, random);
      const min = choices[choices.length - 1]?.score || 0, span = (choices[0]?.score || 0) - min || 1;
      node.untried = choices.map(({ move, score }) => ({ move, prior: (score - min) / span }));
    }
  }

  function bridgeReply(trial, next, attacked) {
    const templates = attacked < 0 ? board.bridges[next] : board.carriers[next][attacked];
    for (const { a, b, carriers: [x, y] } of templates) {
      if (!owns(trial, board.count, a, next) || !owns(trial, board.count, b, next)) continue;
      if (trial[x] === 3 - next && !trial[y]) return y;
      if (trial[y] === 3 - next && !trial[x]) return x;
    }
    return -1;
  }

  function fillsBridge(trial, move, next) {
    for (const { a, b, carriers: [x, y] } of board.carriers[next][move]) {
      if (owns(trial, board.count, a, next) && owns(trial, board.count, b, next) && !trial[x] && !trial[y]) return true;
    }
    return false;
  }

  function prove(node) {
    const next = 3 - node.player;
    if (node.children.some(child => child.result === next)) node.result = next;
    else if (node.untried?.length === 0 && node.children.length && node.children.every(child => child.result === node.player)) node.result = node.player;
  }

  function iteration() {
    const trial = cells.slice(), connected = connectivity(trial, size, base), trail = [root], played = [];
    let node = root, next = color, won = 0;
    while (!won) {
      const remaining = legalMoves(trial);
      prepare(node, trial, next, connected, remaining);
      if (node.result) { won = node.result; break; }
      if (node.untried.length) {
        const { move, prior } = node.untried.shift();
        won = connected.place(move, next) ? next : 0; played.push(move);
        const child = treeNode(move, next, prior);
        child.result = won;
        node.children.push(child); node = child; trail.push(node); next = 3 - next;
        break;
      }
      const log = Math.log(node.visits + 1);
      node = node.children.reduce((best, child) => {
        const value = n => {
          if (n.result) return n.result === next ? Infinity : -Infinity;
          const amaf = trail[trail.length - 1].raveVisits?.[n.move] || 0;
          const beta = amaf / (amaf + n.visits + amaf * n.visits / 500);
          const rave = amaf ? trail[trail.length - 1].raveWins[n.move] / amaf : 0;
          return (1 - beta) * n.wins / n.visits + beta * rave
            + .45 * Math.sqrt(log / n.visits) + .3 * n.prior / Math.sqrt(n.visits + 1);
        };
        return value(child) > value(best) ? child : best;
      });
      won = connected.place(node.move, next) ? next : node.result;
      played.push(node.move); trail.push(node); next = 3 - next;
    }
    const remaining = legalMoves(trial);
    for (let k = remaining.length - 1; k > 0; k--) {
      const j = Math.floor(random() * (k + 1));
      [remaining[k], remaining[j]] = [remaining[j], remaining[k]];
    }
    let first = true;
    const winning = [null, connected.winningMoves(RED, remaining), connected.winningMoves(BLUE, remaining)];
    while (!won && remaining.length) {
      const wins = winning[next].filter(i => !trial[i]);
      const threats = wins.length ? [] : winning[3 - next].filter(i => !trial[i]);
      if (threats.length > 1) { won = 3 - next; break; }
      let move = wins[0] ?? threats[0] ?? bridgeReply(trial, next, first ? -1 : played[played.length - 1]);
      first = false;
      if (move < 0 || move === undefined) {
        // Rejection sampling keeps useful empty bridge carriers for a later reply.
        let index = remaining.length - 1;
        for (let k = index; k >= Math.max(0, index - 3); k--) if (!fillsBridge(trial, remaining[k], next)) { index = k; break; }
        move = remaining[index];
      }
      const index = remaining.indexOf(move);
      remaining[index] = remaining[remaining.length - 1]; remaining.pop();
      if (connected.place(move, next)) won = next;
      played.push(move);
      // A move only creates new threats for its own colour, and only when its
      // component reaches a goal. Enemy threats can only lose an occupied cell.
      if (!won && connected.touchesGoal(move, next)) winning[next] = connected.winningMoves(next, remaining);
      next = 3 - next;
    }
    for (let k = trail.length - 1; k >= 0; k--) {
      const n = trail[k]; n.visits++; if (won === n.player) n.wins++;
      if (!n.raveVisits) { n.raveVisits = new Uint32Array(board.count); n.raveWins = new Uint32Array(board.count); }
      const success = won === (k % 2 ? 3 - color : color);
      for (let j = k; j < played.length; j += 2) { n.raveVisits[played[j]]++; if (success) n.raveWins[played[j]]++; }
      prove(n);
    }
  }
  return {
    run(count = 100) { for (let i = 0; i < count && !root.result; i++) iteration(); },
    best: () => {
      const win = root.children.find(child => child.result === color);
      if (win) return win.move;
      const viable = root.children.filter(child => child.result !== 3 - color);
      const choices = viable.length ? viable : root.children;
      return choices.length ? choices.reduce((a, b) => b.visits > a.visits ? b : a).move : tactical;
    },
    visits: () => root.visits,
    get solved() { return Boolean(root.result); }
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

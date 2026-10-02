// Every floor is cut from an explicit tiling, so every challenge has a solution.
const definitions = [
  { name: 'Little nook', rows: ['AAB.', 'ACBB', 'CCDD', '.CD.'] },
  { name: 'Side doors', rows: ['AABBB', 'A.CB.', 'DDCCE', '.DEEE'] },
  { name: 'Two windows', rows: ['AABBB', 'AC.BD', 'ACCDD', 'EE.FD', 'EEFFF'] },
  { name: 'Long hall', rows: ['AABB.C', 'ADBBCC', 'ADD.EC', 'FDDGEE', 'FFGGGE'] },
  { name: 'Corner room', rows: ['.AABBC', 'AA.BCC', 'DDDB.C', 'D.EECC', 'F.EGGG', 'FFGGHH'] },
  { name: 'Last room', rows: ['.AABBC', 'AA.BCC', 'DD.BEC', 'DFEEE.', 'FFGGHH', '.FGGHH'] },
];

export const key = (x, y) => `${x},${y}`;
const clonePlacements = placements => Object.fromEntries(Object.entries(placements).map(([id, position]) => [id, { ...position }]));

export function normalizeShape(cells) {
  const minX = Math.min(...cells.map(cell => cell[0]));
  const minY = Math.min(...cells.map(cell => cell[1]));
  return cells.map(([x, y]) => [x - minX, y - minY]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

export function transformShape(cells, { rotation = 0, flipped = false } = {}) {
  let transformed = cells.map(([x, y]) => [flipped ? -x : x, y]);
  for (let turn = 0; turn < ((rotation % 4) + 4) % 4; turn++) transformed = transformed.map(([x, y]) => [-y, x]);
  return normalizeShape(transformed);
}

export function orientations(cells) {
  const seen = new Set(), result = [];
  for (const flipped of [false, true]) for (let rotation = 0; rotation < 4; rotation++) {
    const shape = transformShape(cells, { rotation, flipped }), signature = shape.map(cell => cell.join(',')).join(';');
    if (seen.has(signature)) continue;
    seen.add(signature); result.push({ rotation, flipped, cells: shape });
  }
  return result;
}

function buildLevel({ name, rows }, index) {
  const width = rows[0].length, height = rows.length, floor = [], holes = [], byId = {};
  rows.forEach((row, y) => [...row].forEach((id, x) => {
    if (id === '.') { holes.push([x, y]); return; }
    floor.push([x, y]); (byId[id] ||= []).push([x, y]);
  }));
  const solution = {}, pieces = Object.entries(byId).sort(([a], [b]) => a.localeCompare(b)).map(([id, cells]) => {
    solution[id] = { x: Math.min(...cells.map(cell => cell[0])), y: Math.min(...cells.map(cell => cell[1])), rotation: 0, flipped: false };
    return { id, cells: normalizeShape(cells) };
  });
  return { id: index + 1, name, width, height, floor, holes, pieces, solution };
}
function freeze(value) {
  Object.values(value).forEach(child => { if (child && typeof child === 'object') freeze(child); });
  return Object.freeze(value);
}
export const LEVELS = freeze(definitions.map(buildLevel));

export function placementCells(piece, position) {
  return transformShape(piece.cells, position).map(([x, y]) => [x + position.x, y + position.y]);
}

export function checkPlacement(level, placements, pieceId, position) {
  const piece = level.pieces.find(candidate => candidate.id === pieceId);
  if (!piece) return { valid: false, reason: 'unknown', cells: [] };
  if (!position || !Number.isInteger(position.x) || !Number.isInteger(position.y)
    || (position.rotation !== undefined && !Number.isInteger(position.rotation))) return { valid: false, reason: 'position', cells: [] };
  const cells = placementCells(piece, position), floor = new Set(level.floor.map(([x, y]) => key(x, y)));
  const occupied = new Set();
  Object.entries(placements).forEach(([id, placed]) => {
    if (id === pieceId) return;
    const other = level.pieces.find(candidate => candidate.id === id);
    if (other) placementCells(other, placed).forEach(([x, y]) => occupied.add(key(x, y)));
  });
  if (cells.some(([x, y]) => x < 0 || y < 0 || x >= level.width || y >= level.height)) return { valid: false, reason: 'outside', cells };
  if (cells.some(([x, y]) => !floor.has(key(x, y)))) return { valid: false, reason: 'hole', cells };
  if (cells.some(([x, y]) => occupied.has(key(x, y)))) return { valid: false, reason: 'overlap', cells };
  return { valid: true, reason: '', cells };
}

export function occupiedCells(level, placements) {
  const occupied = new Map();
  for (const [id, position] of Object.entries(placements)) {
    const piece = level.pieces.find(candidate => candidate.id === id);
    if (piece) placementCells(piece, position).forEach(([x, y]) => occupied.set(key(x, y), id));
  }
  return occupied;
}

export function isSolved(level, placements) {
  return level.pieces.every(piece => placements[piece.id] && checkPlacement(level, placements, piece.id, placements[piece.id]).valid)
    && Object.keys(placements).length === level.pieces.length
    && occupiedCells(level, placements).size === level.floor.length;
}

// Exact cover, choosing the empty floor cell with the fewest legal covers first.
// Fixed placements stay fixed, including placements from alternative solutions.
export function solveTiling(level, placements = {}) {
  if (Object.keys(placements).some(id => !checkPlacement(level, placements, id, placements[id]).valid)) return null;
  const occupied = new Set(occupiedCells(level, placements).keys());
  const unused = new Set(level.pieces.filter(piece => !placements[piece.id]).map(piece => piece.id));
  const floor = new Set(level.floor.map(([x, y]) => key(x, y)));
  const byCell = new Map([...floor].map(cell => [cell, []]));
  for (const piece of level.pieces) {
    if (!unused.has(piece.id)) continue;
    for (const orientation of orientations(piece.cells)) {
      const width = Math.max(...orientation.cells.map(cell => cell[0])) + 1;
      const height = Math.max(...orientation.cells.map(cell => cell[1])) + 1;
      for (let y = 0; y <= level.height - height; y++) for (let x = 0; x <= level.width - width; x++) {
        const cells = orientation.cells.map(([dx, dy]) => key(x + dx, y + dy));
        if (cells.some(cell => !floor.has(cell) || occupied.has(cell))) continue;
        const candidate = { id: piece.id, position: { x, y, rotation: orientation.rotation, flipped: orientation.flipped }, cells };
        cells.forEach(cell => byCell.get(cell).push(candidate));
      }
    }
  }
  const answer = clonePlacements(placements);
  function search() {
    if (!unused.size) return occupied.size === floor.size;
    let choices = null;
    for (const cell of floor) {
      if (occupied.has(cell)) continue;
      const options = byCell.get(cell).filter(candidate => unused.has(candidate.id) && candidate.cells.every(part => !occupied.has(part)));
      if (!options.length) return false;
      if (!choices || options.length < choices.length) choices = options;
      if (choices.length === 1) break;
    }
    if (!choices) return false;
    for (const candidate of choices) {
      unused.delete(candidate.id); answer[candidate.id] = candidate.position;
      candidate.cells.forEach(cell => occupied.add(cell));
      if (search()) return true;
      candidate.cells.forEach(cell => occupied.delete(cell));
      unused.add(candidate.id); delete answer[candidate.id];
    }
    return false;
  }
  return search() ? answer : null;
}

export function createGame(level = LEVELS[0]) {
  let placements = {}, history = [], moves = 0;
  const save = () => history.push({ placements: clonePlacements(placements), moves });
  return {
    level,
    get placements() { return clonePlacements(placements); },
    get filled() { return occupiedCells(level, placements).size; },
    get solved() { return isSolved(level, placements); },
    get canUndo() { return history.length > 0; },
    get moves() { return moves; },
    place(id, position) {
      const result = checkPlacement(level, placements, id, position);
      if (!result.valid) return result;
      const next = { x: position.x, y: position.y, rotation: ((position.rotation || 0) % 4 + 4) % 4, flipped: Boolean(position.flipped) };
      if (placements[id] && Object.keys(next).every(property => next[property] === placements[id][property])) return { ...result, changed: false };
      save(); placements[id] = next; moves++;
      return { ...result, changed: true };
    },
    remove(id) {
      if (!placements[id]) return false;
      save(); delete placements[id]; moves++; return true;
    },
    undo() {
      if (!history.length) return false;
      const previous = history.pop(); placements = previous.placements; moves = previous.moves; return true;
    },
    reset() { placements = {}; history = []; moves = 0; },
    hint() { return solveTiling(level, placements); },
  };
}

export const BOARD_WIDTH = 4;
export const BOARD_HEIGHT = 5;
export const DIRECTIONS = Object.freeze({
  up: Object.freeze([0, -1]), right: Object.freeze([1, 0]),
  down: Object.freeze([0, 1]), left: Object.freeze([-1, 0])
});

// The classic ten-block arrangement. Only the marked square is the goal.
export const CLASSIC_LAYOUT = Object.freeze([
  { id: 'target', label: 'Exit block', x: 1, y: 0, width: 2, height: 2 },
  { id: '1', label: 'Block 1', x: 0, y: 0, width: 1, height: 2 },
  { id: '2', label: 'Block 2', x: 3, y: 0, width: 1, height: 2 },
  { id: '3', label: 'Block 3', x: 0, y: 2, width: 1, height: 2 },
  { id: '4', label: 'Block 4', x: 1, y: 2, width: 2, height: 1 },
  { id: '5', label: 'Block 5', x: 3, y: 2, width: 1, height: 2 },
  { id: '6', label: 'Block 6', x: 1, y: 3, width: 1, height: 1 },
  { id: '7', label: 'Block 7', x: 2, y: 3, width: 1, height: 1 },
  { id: '8', label: 'Block 8', x: 0, y: 4, width: 1, height: 1 },
  { id: '9', label: 'Block 9', x: 3, y: 4, width: 1, height: 1 }
].map(Object.freeze));

const copy = pieces => pieces.map(piece => ({ ...piece }));

export function validPieces(pieces) {
  if (!Array.isArray(pieces) || !pieces.length) return false;
  const ids = new Set(), occupied = new Set();
  for (const piece of pieces) {
    if (!piece || typeof piece.id !== 'string' || ids.has(piece.id)) return false;
    ids.add(piece.id);
    if (![piece.x, piece.y, piece.width, piece.height].every(Number.isInteger)
      || piece.width < 1 || piece.height < 1 || piece.x < 0 || piece.y < 0
      || piece.x + piece.width > BOARD_WIDTH || piece.y + piece.height > BOARD_HEIGHT) return false;
    for (let y = piece.y; y < piece.y + piece.height; y++) {
      for (let x = piece.x; x < piece.x + piece.width; x++) {
        const cell = y * BOARD_WIDTH + x;
        if (occupied.has(cell)) return false;
        occupied.add(cell);
      }
    }
  }
  const target = pieces.find(piece => piece.id === 'target');
  return Boolean(target && target.width === 2 && target.height === 2);
}

export function isSolved(pieces) {
  return pieces.some(piece => piece.id === 'target' && piece.x === 1 && piece.y === 3);
}

export function createKlotski(pieces = CLASSIC_LAYOUT) {
  if (!validPieces(pieces)) throw new RangeError('The blocks must fit inside the board without overlapping.');
  return { pieces: copy(pieces), history: [], moves: 0, won: isSolved(pieces) };
}

function stepPieces(pieces, id, direction) {
  const delta = DIRECTIONS[direction], piece = pieces.find(item => item.id === id);
  if (!delta || !piece) return null;
  const next = pieces.map(item => item.id === id ? { ...item, x: item.x + delta[0], y: item.y + delta[1] } : item);
  return validPieces(next) ? next : null;
}

export function maxSlide(state, id, direction) {
  if (state.won) return 0;
  let pieces = state.pieces, distance = 0, next;
  while ((next = stepPieces(pieces, id, direction))) {
    pieces = next; distance++;
    if (isSolved(pieces)) break;
  }
  return distance;
}

export const canSlide = (state, id, direction) => maxSlide(state, id, direction) > 0;

// Check every intermediate square, including on longer drags: blocks cannot jump.
export function slideKlotski(state, id, direction, distance = 1) {
  if (state.won || !Number.isInteger(distance) || distance < 1) return null;
  let pieces = state.pieces;
  for (let step = 0; step < distance; step++) {
    pieces = stepPieces(pieces, id, direction);
    if (!pieces) return null;
    if (isSolved(pieces)) break;
  }
  return {
    pieces,
    history: [...state.history, state.pieces],
    moves: state.moves + 1,
    won: isSolved(pieces)
  };
}

export function undoKlotski(state) {
  if (!state.history.length) return null;
  const pieces = state.history.at(-1);
  return { pieces, history: state.history.slice(0, -1), moves: state.moves - 1, won: isSolved(pieces) };
}

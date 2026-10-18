export function initialState() {
  const cells = Array(64).fill(0);
  cells[27] = cells[36] = 2; cells[28] = cells[35] = 1;
  return { cells, turn: 1, last: -1 };
}
export function flips(cells, index, player) {
  if (!Number.isInteger(index) || index < 0 || index >= 64 || cells[index]) return [];
  const result = [], row = Math.floor(index / 8), col = index % 8;
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const line = []; let r = row + dr, c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && cells[r * 8 + c] === 3 - player) {
      line.push(r * 8 + c); r += dr; c += dc;
    }
    if (line.length && r >= 0 && r < 8 && c >= 0 && c < 8 && cells[r * 8 + c] === player) result.push(...line);
  }
  return result;
}
export const legalMoves = (cells, player) => cells.flatMap((_, i) => flips(cells, i, player).length ? [i] : []);
export function play(state, index) {
  const captured = flips(state.cells, index, state.turn);
  if (!captured.length) return null;
  const cells = state.cells.slice(); cells[index] = state.turn;
  captured.forEach(i => { cells[i] = state.turn; });
  const opponent = 3 - state.turn;
  const turn = legalMoves(cells, opponent).length ? opponent : legalMoves(cells, state.turn).length ? state.turn : 0;
  return { cells, turn, last: index };
}
const corners = [0, 7, 56, 63];
export const DIFFICULTIES = {
  easy: { depth: 1, description: 'Takes the most discs now; leaves opportunities for you.' },
  medium: { depth: 2, description: 'Looks one reply ahead and values corners and legal moves.' },
  hard: { depth: 4, description: 'Plans further ahead and avoids vulnerable frontier discs.' },
  expert: { depth: 6, description: 'Searches deepest and solves the ending with eight empty squares or fewer.' }
};
function evaluate(state, player) {
  const difference = state.cells.reduce((n, cell) => n + (cell === player ? 1 : cell ? -1 : 0), 0);
  if (!state.turn) return Math.sign(difference) * 10000 + difference;
  let frontier = 0, danger = 0;
  state.cells.forEach((cell, i) => {
    if (!cell) return;
    const row = Math.floor(i / 8), col = i % 8;
    let exposed = false;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr, c = col + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8 && !state.cells[r * 8 + c]) exposed = true;
    }
    if (exposed) frontier += cell === player ? -1 : 1;
  });
  for (const corner of corners) {
    if (state.cells[corner]) continue;
    const r = Math.floor(corner / 8), c = corner % 8;
    for (const [dr, dc] of [[0, c ? -1 : 1], [r ? -1 : 1, 0], [r ? -1 : 1, c ? -1 : 1]]) {
      const cell = state.cells[(r + dr) * 8 + c + dc];
      if (cell) danger += (cell === player ? -1 : 1) * (dr && dc ? 45 : 20);
    }
  }
  return corners.reduce((n, i) => n + (state.cells[i] === player ? 120 : state.cells[i] ? -120 : 0), 0)
    + 8 * (legalMoves(state.cells, player).length - legalMoves(state.cells, 3 - player).length)
    + frontier * 3 + danger + difference * (state.cells.filter(Boolean).length > 50 ? 3 : .2);
}
function orderedMoves(state) {
  return legalMoves(state.cells, state.turn).sort((a, b) => Number(corners.includes(b)) - Number(corners.includes(a)));
}
const SEARCH_LIMIT = Symbol('search limit');
export function chooseMove(state, depth = 3, { nodeLimit = Infinity } = {}) {
  const player = state.turn;
  let nodes = 0;
  function search(position, remaining, alpha, beta) {
    if (++nodes > nodeLimit) throw SEARCH_LIMIT;
    if (!remaining || !position.turn) return evaluate(position, player);
    const maximizing = position.turn === player;
    let best = maximizing ? -Infinity : Infinity;
    for (const move of orderedMoves(position)) {
      const score = search(play(position, move), remaining - 1, alpha, beta);
      best = maximizing ? Math.max(best, score) : Math.min(best, score);
      if (maximizing) alpha = Math.max(alpha, best); else beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = -Infinity, selected = null;
  for (const move of orderedMoves(state)) {
    const score = search(play(state, move), Math.max(0, depth - 1), best, Infinity);
    if (score > best) { best = score; selected = move; }
  }
  return selected;
}
export function chooseComputerMove(state, difficulty = 'hard') {
  const moves = legalMoves(state.cells, state.turn);
  if (!moves.length) return null;
  if (difficulty === 'easy') return moves.reduce((best, move) => flips(state.cells, move, state.turn).length > flips(state.cells, best, state.turn).length ? move : best);
  const empty = state.cells.filter(cell => !cell).length;
  if (difficulty === 'expert' && empty <= 8) return chooseMove(state, empty);
  const settings = DIFFICULTIES[difficulty] || DIFFICULTIES.hard;
  let selected = moves[0];
  // Only completed searches replace the previous answer.
  for (let depth = 1; depth <= settings.depth; depth++) {
    try { selected = chooseMove(state, depth, { nodeLimit: difficulty === 'expert' ? 45000 : 12000 }); }
    catch (error) { if (error !== SEARCH_LIMIT) throw error; break; }
  }
  return selected;
}
export function validState(state) {
  return state && Array.isArray(state.cells) && state.cells.length === 64 && state.cells.every(c => [0, 1, 2].includes(c))
    && [0, 1, 2].includes(state.turn) && Number.isInteger(state.last) && state.last >= -1 && state.last < 64
    && (state.turn ? legalMoves(state.cells, state.turn).length > 0 : !legalMoves(state.cells, 1).length && !legalMoves(state.cells, 2).length);
}

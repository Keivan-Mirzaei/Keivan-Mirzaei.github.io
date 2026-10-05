import { CLASSIC_LAYOUT, createKlotski, validPieces, KLOTSKI_HISTORY_LIMIT } from './klotski.mjs';

const positions = pieces => CLASSIC_LAYOUT.flatMap(({ id }) => {
  const piece = pieces.find(value => value.id === id);
  return [piece.x, piece.y];
});
export function serializeKlotski(state) {
  const pack = entry => ({ positions: positions(entry.pieces), moves: entry.moves });
  return { version: 2, positions: positions(state.pieces), moves: state.moves,
    history: state.history.slice(-KLOTSKI_HISTORY_LIMIT).map(pack), future: state.future.slice(-KLOTSKI_HISTORY_LIMIT).map(pack) };
}
export function restoreKlotski(saved) {
  function unpack(value) {
    if (!Array.isArray(value) || value.length !== CLASSIC_LAYOUT.length * 2 || !value.every(Number.isInteger)) return null;
    const pieces = CLASSIC_LAYOUT.map((piece, i) => ({ ...piece, x: value[i * 2], y: value[i * 2 + 1] }));
    return validPieces(pieces) ? pieces : null;
  }
  const validMoves = value => Number.isSafeInteger(value) && value >= 0;
  if (!saved || !validMoves(saved.moves) || (saved.version !== undefined && saved.version !== 2)) return createKlotski();
  const pieces = unpack(saved.positions);
  if (!pieces || !['history', 'future'].every(name => Array.isArray(saved[name]) && saved[name].length <= KLOTSKI_HISTORY_LIMIT)) return createKlotski();
  // Older saves stored only positions: their counters followed one move per entry.
  if (saved.version === undefined && saved.moves < saved.history.length) return createKlotski();
  const restoreEntries = name => saved[name].map((entry, index) => {
    const entryPieces = unpack(saved.version === 2 ? entry?.positions : entry);
    const moves = saved.version === 2 ? entry?.moves : name === 'history'
      ? saved.moves - saved.history.length + index : saved.moves + saved.future.length - index;
    return entryPieces && validMoves(moves) ? { pieces: entryPieces, moves } : null;
  });
  const history = restoreEntries('history'), future = restoreEntries('future');
  if ([...history, ...future].some(entry => !entry)) return createKlotski();
  return { ...createKlotski(pieces), moves: saved.moves, history, future };
}

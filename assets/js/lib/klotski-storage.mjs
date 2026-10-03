import { CLASSIC_LAYOUT, createKlotski, validPieces } from './klotski.mjs';

const positions = pieces => CLASSIC_LAYOUT.flatMap(({ id }) => {
  const piece = pieces.find(value => value.id === id);
  return [piece.x, piece.y];
});
export function serializeKlotski(state) {
  return { positions: positions(state.pieces), moves: state.moves,
    history: state.history.slice(-1000).map(positions), future: state.future.slice(-1000).map(positions) };
}
export function restoreKlotski(saved) {
  function unpack(value) {
    if (!Array.isArray(value) || value.length !== CLASSIC_LAYOUT.length * 2 || !value.every(Number.isInteger)) return null;
    const pieces = CLASSIC_LAYOUT.map((piece, i) => ({ ...piece, x: value[i * 2], y: value[i * 2 + 1] }));
    return validPieces(pieces) ? pieces : null;
  }
  if (!saved || !Number.isSafeInteger(saved.moves) || saved.moves < 0) return createKlotski();
  const pieces = unpack(saved.positions);
  if (!pieces || !['history', 'future'].every(name => Array.isArray(saved[name]) && saved[name].length <= 1000 && saved[name].every(unpack)) || saved.moves < saved.history.length) return createKlotski();
  return { ...createKlotski(pieces), moves: saved.moves, history: saved.history.map(unpack), future: saved.future.map(unpack) };
}

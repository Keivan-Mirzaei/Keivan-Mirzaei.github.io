// Validate stored boards before letting them resume play or a computer turn.
export function restoreHex(saved) {
  if (!saved || !Number.isInteger(saved.size) || saved.size < 3 || saved.size > 11
    || ![1, 2].includes(saved.human) || typeof saved.local !== 'boolean') return null;
  function valid(value) {
    if (!value || !Array.isArray(value.cells) || value.cells.length !== saved.size ** 2
      || !value.cells.every(color => color === 0 || color === 1 || color === 2)
      || !Number.isInteger(value.last) || value.last < -1 || value.last >= value.cells.length) return false;
    const red = value.cells.filter(color => color === 1).length, blue = value.cells.filter(color => color === 2).length;
    return (red === blue || red === blue + 1) && value.toMove === (red === blue ? 1 : 2)
      && (red + blue === 0 ? value.last === -1 : value.last >= 0 && value.cells[value.last] === 3 - value.toMove);
  }
  if (!valid(saved) || !['history', 'future'].every(name => Array.isArray(saved[name]) && saved[name].length <= saved.size ** 2 && saved[name].every(valid))) return null;
  const copy = value => ({ cells: value.cells.slice(), last: value.last, toMove: value.toMove });
  return { size: saved.size, human: saved.human, local: saved.local, ...copy(saved), history: saved.history.map(copy), future: saved.future.map(copy) };
}

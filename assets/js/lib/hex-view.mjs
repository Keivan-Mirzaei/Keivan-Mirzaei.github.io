// Shared by the live boards and their script-free illustrations.
// The long diagonal is vertical, and each cell remains a regular hexagon.
export const hexPoint = ([x, y]) => [Math.sqrt(3) * (x - y) / 4, (3 * x + y) / 4];

export const hexCorner = port => ({ NW: 'top', NE: 'right', SW: 'left', SE: 'bottom' })[port];
export const hexGoal = color => color === 1 ? 'upper-right to lower-left' : 'upper-left to lower-right';

export function hexLayout(geometry, includePorts = false) {
  const vertices = includePorts ? [...geometry.points.values()] : geometry.cells.flatMap(cell => cell.vertices);
  const all = vertices.map(hexPoint);
  const padX = includePorts ? 1.4 : .9, padY = includePorts ? 1.05 : .9;
  const minX = Math.min(...all.map(p => p[0])) - padX, minY = Math.min(...all.map(p => p[1])) - padY;
  const width = Math.max(...all.map(p => p[0])) - minX + padX;
  const height = Math.max(...all.map(p => p[1])) - minY + padY;
  return { minX, minY, width, height };
}

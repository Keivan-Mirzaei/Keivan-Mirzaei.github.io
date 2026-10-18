// Shared by the live boards and their script-free illustrations.
// The long diagonal is vertical, and each cell remains a regular hexagon.
export const hexPoint = ([x, y]) => [Math.sqrt(3) * (x - y) / 4, (3 * x + y) / 4];

export const hexCorner = port => ({ NW: 'top', NE: 'right', SW: 'left', SE: 'bottom' })[port];
export const hexGoal = color => color === 1 ? 'upper-right to lower-left' : 'upper-left to lower-right';

export function hexLayout(geometry, includePorts = false, padding = .9) {
  const vertices = includePorts ? [...geometry.points.values()] : geometry.cells.flatMap(cell => cell.vertices);
  const all = vertices.map(hexPoint);
  const padX = includePorts ? 1.4 : padding, padY = includePorts ? 1.05 : padding;
  const minX = Math.min(...all.map(p => p[0])) - padX, minY = Math.min(...all.map(p => p[1])) - padY;
  const width = Math.max(...all.map(p => p[0])) - minX + padX;
  const height = Math.max(...all.map(p => p[1])) - minY + padY;
  return { minX, minY, width, height };
}

// Trace each goal as one continuous line so its corners join cleanly.
export function hexBoundaryPaths(geometry) {
  return [-1, -2, -3, -4].map(face => {
    const edges = geometry.edges.filter(edge => edge.faces[0] >= 0 && edge.faces[1] === face);
    const adjacent = new Map();
    for (const edge of edges) for (const vertex of [edge.from, edge.to]) {
      if (!adjacent.has(vertex)) adjacent.set(vertex, []);
      adjacent.get(vertex).push(edge);
    }
    const start = [...adjacent].find(([, touching]) => touching.length === 1)?.[0];
    const vertices = [], visited = new Set();
    let vertex = start;
    while (vertex !== undefined) {
      vertices.push(vertex);
      const edge = adjacent.get(vertex).find(candidate => !visited.has(candidate));
      if (!edge) break;
      visited.add(edge);
      vertex = edge.from === vertex ? edge.to : edge.from;
    }
    return { color: face === -1 || face === -2 ? 'red' : 'blue', vertices };
  });
}

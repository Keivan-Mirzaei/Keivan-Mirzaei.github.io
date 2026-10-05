import { occupiedCells, key } from './tiling.mjs';

// Each edge is visited once, so neighbouring tiles never double their border.
export function tilingBoardEdges(level, placements, selected = null) {
  const occupied = occupiedCells(level, placements);
  const floor = new Set(level.floor.map(cell => key(...cell)));
  const edges = [];
  function edge(from, to, a, b) {
    const first = occupied.get(key(...a)), second = occupied.get(key(...b));
    if (first && first === second) return;
    const kind = selected && (first === selected || second === selected) ? 'selected'
      : first || second ? 'tile' : floor.has(key(...a)) !== floor.has(key(...b)) ? 'cutout' : 'grid';
    edges.push({ from, to, kind });
  }
  for (let y = 0; y <= level.height; y++) for (let x = 0; x < level.width; x++) {
    edge([x, y], [x + 1, y], [x, y - 1], [x, y]);
  }
  for (let x = 0; x <= level.width; x++) for (let y = 0; y < level.height; y++) {
    edge([x, y], [x, y + 1], [x - 1, y], [x, y]);
  }
  return edges;
}

// Walk the exposed edges into complete contours, including concave corners.
export function tilingContours(cells) {
  const unique = [...new Map(cells.map(cell => [key(...cell), cell])).values()];
  const occupied = new Set(unique.map(cell => key(...cell))), edges = [];
  for (const [x, y] of unique) {
    if (!occupied.has(key(x, y - 1))) edges.push([[x, y], [x + 1, y]]);
    if (!occupied.has(key(x + 1, y))) edges.push([[x + 1, y], [x + 1, y + 1]]);
    if (!occupied.has(key(x, y + 1))) edges.push([[x + 1, y + 1], [x, y + 1]]);
    if (!occupied.has(key(x - 1, y))) edges.push([[x, y + 1], [x, y]]);
  }
  const loops = [];
  while (edges.length) {
    const [start, next] = edges.shift(), points = [start, next];
    while (key(...points.at(-1)) !== key(...start)) {
      const index = edges.findIndex(([from]) => key(...from) === key(...points.at(-1)));
      if (index < 0) throw new Error('A tile outline must be closed.');
      points.push(edges.splice(index, 1)[0][1]);
    }
    loops.push(points.slice(0, -1));
  }
  return loops;
}

export const tilingContourPath = (cells, unit = 24) => tilingContours(cells)
  .map(points => `M${points.map(([x, y]) => `${x * unit},${y * unit}`).join('L')}Z`).join('');

export function tilingShapeMarkup(cells, color, markAnchor = false) {
  const width = Math.max(...cells.map(([x]) => x)) + 1, height = Math.max(...cells.map(([, y]) => y)) + 1;
  const anchor = markAnchor ? `<circle class="tiling-piece-anchor" cx="${cells[0][0] * 24 + 12}" cy="${cells[0][1] * 24 + 12}" r="2.5"/>` : '';
  return `<svg class="tiling-shape" viewBox="0 0 ${width * 24} ${height * 24}" width="${width * 24}" height="${height * 24}" style="--tile-columns:${width};--tile-rows:${height}" aria-hidden="true"><path class="tiling-tile-face tiling-tile-edge" d="${tilingContourPath(cells)}" fill="${color}" stroke="color-mix(in srgb, ${color} 70%, #285b46)" fill-rule="evenodd" vector-effect="non-scaling-stroke"/>${anchor}</svg>`;
}

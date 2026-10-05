import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLevel, key } from '../assets/js/lib/tiling.mjs';
import { CATALOGUE } from '../assets/js/lib/tiling-catalogue.mjs';
import { tilingBoardEdges, tilingContours, tilingShapeMarkup } from '../assets/js/lib/tiling-view.mjs';

const signature = edge => [key(...edge.from), key(...edge.to)].sort().join('/');
const area = points => points.reduce((sum, [x, y], i) => {
  const [nx, ny] = points[(i + 1) % points.length]; return sum + x * ny - nx * y;
}, 0) / 2;

test('two neighbouring pieces share one border, including the selected piece outline', () => {
  const level = buildLevel({ name: 'Neighbours', rows: ['AB'] });
  const edges = tilingBoardEdges(level, level.solution, 'A');
  assert.equal(new Set(edges.map(signature)).size, edges.length);
  const shared = edges.filter(edge => signature(edge) === '1,0/1,1');
  assert.equal(shared.length, 1); assert.equal(shared[0].kind, 'selected');
});

test('a multi-square piece has no internal grid border', () => {
  const level = buildLevel({ name: 'One piece', rows: ['AA'] });
  const edges = tilingBoardEdges(level, level.solution);
  assert.equal(edges.some(edge => signature(edge) === '1,0/1,1'), false);
  assert.equal(edges.length, 6);
});

test('contours cover concave shapes and cut-outs exactly, with a fixed-width SVG stroke', () => {
  const ring = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]];
  const contours = tilingContours(ring);
  assert.equal(contours.length, 2); assert.equal(contours.reduce((sum, loop) => sum + area(loop), 0), 8);
  const markup = tilingShapeMarkup([[1, 0], [0, 1], [1, 1], [1, 2]], '#839bbc', true);
  assert.equal((markup.match(/<path /g) || []).length, 1);
  assert.match(markup, /vector-effect="non-scaling-stroke"/);
  assert.match(markup, /cx="36" cy="12"/);
});

test('all catalogue tile silhouettes retain their exact area and perimeter', () => {
  const shapes = new Map();
  for (const puzzles of CATALOGUE) for (const rows of puzzles) {
    const level = buildLevel({ name: 'Catalogue', rows: rows.split('/') });
    for (const piece of level.pieces) shapes.set(JSON.stringify(piece.cells), piece.cells);
  }
  for (const cells of shapes.values()) {
    const occupied = new Set(cells.map(cell => key(...cell)));
    const perimeter = cells.reduce((sum, [x, y]) => sum + [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => !occupied.has(key(x + dx, y + dy))).length, 0);
    const contours = tilingContours(cells);
    assert.equal(contours.reduce((sum, loop) => sum + area(loop), 0), cells.length);
    assert.equal(contours.reduce((sum, loop) => sum + loop.length, 0), perimeter);
  }
});

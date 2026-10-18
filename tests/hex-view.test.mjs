import test from 'node:test';
import assert from 'node:assert/strict';
import { hexGeometry } from '../assets/js/lib/hex-math.mjs';
import { hexBoundaryPaths, hexLayout, hexPoint } from '../assets/js/lib/hex-view.mjs';

test('continuous goal paths cover every outer edge exactly once at every board size', () => {
  for (let size = 3; size <= 11; size++) {
    const geometry = hexGeometry(size), paths = hexBoundaryPaths(geometry);
    const key = (a, b) => [a, b].sort().join('|');
    const edges = new Map(geometry.edges.map(edge => [key(edge.from, edge.to), edge]));
    const seen = new Set();
    assert.deepEqual(paths.map(path => path.color), ['red', 'red', 'blue', 'blue']);
    for (const { color, vertices } of paths) {
      assert.ok(vertices.length > size);
      assert.ok(vertices.every(vertex => !vertex.startsWith('port-')), 'Proof-only ports must not extend the playing board.');
      for (let i = 1; i < vertices.length; i++) {
        const id = key(vertices[i - 1], vertices[i]), edge = edges.get(id);
        assert.ok(edge, 'Consecutive points must share a real board edge.');
        assert.ok(edge.faces[1] < 0, 'A coloured path must stay on the perimeter.');
        assert.equal(color, edge.faces[1] >= -2 ? 'red' : 'blue');
        assert.equal(seen.has(id), false, 'Never draw a coloured edge twice.');
        seen.add(id);
      }
    }
    assert.equal(seen.size, geometry.edges.filter(edge => edge.faces[0] >= 0 && edge.faces[1] < 0).length);
  }
});

test('tight game framing leaves padding around every vertex without changing proof framing', () => {
  for (const size of [3, 5, 11]) {
    const geometry = hexGeometry(size), box = hexLayout(geometry, false, .2);
    for (const cell of geometry.cells) for (const vertex of cell.vertices) {
      const [x, y] = hexPoint(vertex);
      assert.ok(x > box.minX && x < box.minX + box.width);
      assert.ok(y > box.minY && y < box.minY + box.height);
    }
    assert.deepEqual(hexLayout(geometry, true, .2), hexLayout(geometry, true));
  }
});

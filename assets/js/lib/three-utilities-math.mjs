export const NODES = [
  { id: 'h1', label: 'House 1', short: '1', kind: 'house', point: [.24, .25] },
  { id: 'h2', label: 'House 2', short: '2', kind: 'house', point: [.50, .25] },
  { id: 'h3', label: 'House 3', short: '3', kind: 'house', point: [.76, .25] },
  { id: 'gas', label: 'Gas', short: 'G', kind: 'utility', point: [.24, .76], color: '#95631f' },
  { id: 'water', label: 'Water', short: 'W', kind: 'utility', point: [.50, .76], color: '#386f98' },
  { id: 'power', label: 'Electricity', short: 'E', kind: 'utility', point: [.76, .76], color: '#a34f60' },
];
export const nodeById = id => NODES.find(node => node.id === id);
export const edgeId = (a, b) => [a, b].sort().join('-');
const route = (house, utility, parts, seam = null) => ({ id: edgeId(house, utility), house, utility, parts, seam });

// Coordinates live in [0,1]². The two split routes have exactly matching seam coordinates.
export const TORUS_ROUTES = [
  route('h1', 'gas', [[[.24, .25], [.24, .76]]]),
  route('h2', 'water', [[[.50, .25], [.50, .76]]]),
  route('h3', 'power', [[[.76, .25], [.76, .76]]]),
  route('h2', 'gas', [[[.50, .25], [.24, .76]]]),
  route('h2', 'power', [[[.50, .25], [.76, .76]]]),
  route('h1', 'power', [[[.24, .25], [.37, .10], [.50, .10], [.64, .32], [.70, .55], [.76, .76]]]),
  route('h3', 'water', [[[.76, .25], [.88, .50], [.90, .83], [.78, .90], [.60, .85], [.50, .76]]]),
  route('h1', 'water', [[[.24, .25], [.24, 0]], [[.24, 1], [.24, .92], [.43, .86], [.50, .76]]], 'a'),
  route('h3', 'gas', [[[.76, .25], [.90, .24], [1, .18]], [[0, .18], [.12, .25], [.18, .50], [.24, .76]]], 'b'),
];

export const PLANE_EIGHT = [
  ...TORUS_ROUTES.slice(0, 7),
  route('h1', 'water', [[[.24, .25], [.10, .25], [.07, .50], [.10, .85], [.34, .95], [.50, .76]]]),
];

const EPS = 1e-8;
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export function segmentIntersection(a, b, c, d) {
  const r = sub(b, a), s = sub(d, c), ca = sub(c, a), denominator = cross(r, s);
  if (Math.abs(denominator) < EPS) {
    if (Math.abs(cross(ca, r)) > EPS) return null;
    const length2 = r[0] ** 2 + r[1] ** 2;
    if (length2 < EPS ** 2) return null;
    const t0 = (ca[0] * r[0] + ca[1] * r[1]) / length2;
    const dc = sub(d, a), t1 = (dc[0] * r[0] + dc[1] * r[1]) / length2;
    const low = Math.max(0, Math.min(t0, t1)), high = Math.min(1, Math.max(t0, t1));
    if (high < low - EPS) return null;
    return { point: [a[0] + r[0] * low, a[1] + r[1] * low], overlap: high - low > EPS };
  }
  const t = cross(ca, s) / denominator, u = cross(ca, r) / denominator;
  if (t < -EPS || t > 1 + EPS || u < -EPS || u > 1 + EPS) return null;
  return { point: [a[0] + t * r[0], a[1] + t * r[1]], overlap: false };
}

export function pointSegmentDistance(p, a, b) {
  const v = sub(b, a), length2 = v[0] ** 2 + v[1] ** 2;
  const t = length2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / length2)) : 0;
  return distance(p, [a[0] + v[0] * t, a[1] + v[1] * t]);
}

export function segments(route) {
  return route.parts.flatMap((part, partIndex) => part.slice(1).map((p, i) => ({ a: part[i], b: p, part: partIndex, index: i })));
}

export function crossings(routes) {
  const results = [];
  for (let i = 0; i < routes.length; i++) {
    const first = routes[i];
    for (let j = i; j < routes.length; j++) {
      const second = routes[j];
      const shared = [first.house, first.utility].filter(id => id === second.house || id === second.utility).map(id => nodeById(id).point);
      const aSegments = segments(first), bSegments = segments(second);
      for (let a = 0; a < aSegments.length; a++) {
        for (let b = i === j ? a + 1 : 0; b < bSegments.length; b++) {
          const s = aSegments[a], t = bSegments[b];
          const hit = segmentIntersection(s.a, s.b, t.a, t.b);
          if (!hit) continue;
          if (!hit.overlap && i === j && s.part === t.part && Math.abs(s.index - t.index) === 1) continue;
          if (!hit.overlap && shared.some(p => distance(p, hit.point) < EPS * 10)) continue;
          if (!results.some(result => distance(result.point, hit.point) < .008)) results.push({ ...hit, edges: [first.id, second.id] });
        }
      }
    }
  }
  return results;
}

export function obstruction(routes) {
  const intersections = crossings(routes);
  const throughNodes = [];
  for (const edge of routes) {
    for (const node of NODES) {
      if (node.id === edge.house || node.id === edge.utility) continue;
      if (segments(edge).some(s => pointSegmentDistance(node.point, s.a, s.b) < .022)) throughNodes.push({ edge: edge.id, node: node.id, point: node.point });
    }
  }
  return { intersections, throughNodes };
}

// A torus opens into a curved tube, then a straight tube, then a flat square.
// The cuts separate u=0 from u=1, then v=0 from v=1. No twisting occurs.
export function surfacePoint(u, v, phase) {
  const R = 1.25, r = .48;
  const p = Math.max(1, Math.min(3, phase));
  if (p <= 2) {
    const beta = 2 * Math.PI * (2 - p), theta = beta * (u - .5), phi = 2 * Math.PI * (v - .5);
    const cx = beta < 1e-5 ? 2 * Math.PI * R * (u - .5) : 2 * Math.PI * R / beta * Math.sin(theta);
    const cz = beta < 1e-5 ? 0 : 2 * Math.PI * R / beta * (1 - Math.cos(theta) - (1 - Math.cos(beta / 2)) / 2);
    return [cx + r * Math.cos(phi) * Math.sin(theta), r * Math.sin(phi), cz - r * Math.cos(phi) * Math.cos(theta)];
  }
  const t = p - 2, gamma = 2 * Math.PI * (1 - t), psi = gamma * (v - .5);
  const x = 2 * Math.PI * (R * (1 - t) + r * t) * (u - .5);
  const y = gamma < 1e-5 ? 2 * Math.PI * r * (v - .5) : 2 * Math.PI * r / gamma * Math.sin(psi);
  const z = gamma < 1e-5 ? 0 : 2 * Math.PI * r / gamma * (1 - Math.cos(psi) - (1 - Math.cos(gamma / 2)) / 2);
  return [x, y, z];
}

export function sampleRoute(edge, subdivisions = 12) {
  return edge.parts.map(part => part.flatMap((p, i) => {
    if (i === part.length - 1) return [p];
    const next = part[i + 1];
    const count = Math.max(2, Math.ceil(distance(p, next) * subdivisions));
    return Array.from({ length: count }, (_, j) => [p[0] + (next[0] - p[0]) * j / count, p[1] + (next[1] - p[1]) * j / count]);
  }));
}

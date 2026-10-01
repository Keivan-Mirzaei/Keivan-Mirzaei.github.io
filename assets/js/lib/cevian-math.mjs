export const TRIANGLE_SHAPES = {
  scalene: [[.30, .08], [.08, .86], [.92, .86]],
  tall: [[.50, .04], [.25, .90], [.75, .90]],
  slanted: [[.76, .12], [.08, .84], [.92, .84]]
};

export const TETRAHEDRON = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];

export function normalizeWeights(weights) {
  if (weights.length < 2 || weights.some(w => !Number.isFinite(w) || w <= 0)) {
    throw new RangeError('An interior point needs finite, positive vertex weights.');
  }
  const total = weights.reduce((sum, w) => sum + w, 0);
  return weights.map(w => w / total);
}

export function weightedPoint(vertices, weights) {
  const w = normalizeWeights(weights);
  if (vertices.length !== w.length) throw new RangeError('Each vertex needs one weight.');
  return vertices[0].map((_, dimension) => vertices.reduce((sum, point, i) => sum + w[i] * point[dimension], 0));
}

export function contactPoints(vertices, weights) {
  const w = normalizeWeights(weights);
  return vertices.map((_, i) => weightedPoint(vertices.filter((__, j) => j !== i), w.filter((__, j) => j !== i)));
}

export function simplexRatio(weights) {
  const w = normalizeWeights(weights);
  const n = w.length - 1;
  return n * w.reduce((product, value) => product * value / (1 - value), 1);
}

export function triangleArea([a, b, c]) {
  return Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2;
}

export function triangleData(vertices, weights) {
  const w = normalizeWeights(weights);
  const [a, b, c] = vertices;
  const [x, y, z] = contactPoints(vertices, w);
  const alpha = w[2] / (w[1] + w[2]);
  const beta = w[0] / (w[2] + w[0]);
  const gamma = w[1] / (w[0] + w[1]);
  return {
    weights: w, vertices, contacts: [x, y, z], point: weightedPoint(vertices, w),
    fractions: [alpha, beta, gamma],
    sideRatios: [w[2] / w[1], w[0] / w[2], w[1] / w[0]],
    corners: [triangleArea([a, y, z]), triangleArea([b, z, x]), triangleArea([c, x, y])].map(area => area / triangleArea(vertices)),
    ratio: triangleArea([x, y, z]) / triangleArea(vertices)
  };
}

export function positionWeights(height, across) {
  return [height, (1 - height) * (1 - across), (1 - height) * across];
}

export function barycentricPoint(point, [a, b, c]) {
  const denominator = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
  const first = ((b[1] - c[1]) * (point[0] - c[0]) + (c[0] - b[0]) * (point[1] - c[1])) / denominator;
  const second = ((c[1] - a[1]) * (point[0] - c[0]) + (a[0] - c[0]) * (point[1] - c[1])) / denominator;
  return [first, second, 1 - first - second];
}

export function pairBound(value) {
  return { sum: 1 + value, geometric: 2 * Math.sqrt(value), gap: (Math.sqrt(value) - 1) ** 2 };
}

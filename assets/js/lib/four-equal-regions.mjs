// Geometry adapted from the reviewed four-region prototype.
const EPSILON = 1e-7;
export const initialPose = () => ({ x: -.08, y: .04, a: Math.PI / 2 - .2, b: -.2 });
export const normal = angle => ({ x: -Math.sin(angle), y: Math.cos(angle) });
export const direction = angle => ({ x: Math.cos(angle), y: Math.sin(angle) });
export const dot = (a, b) => a.x * b.x + a.y * b.y;
export const mod = (a, b) => (a % b + b) % b;
export const lineDelta = angle => mod(angle + Math.PI / 2, Math.PI) - Math.PI / 2;
const regionIndex = (s, t) => s ? (t ? 2 : 1) : (t ? 3 : 0);
export function classify(points, pose, epsilon = EPSILON) {
  const u = normal(pose.a), v = normal(pose.b);
  const counts = [0, 0, 0, 0], membership = [];
  let boundary = 0;
  for (const point of points) {
    const offset = { x: point.x - pose.x, y: point.y - pose.y };
    const s = dot(u, offset), t = dot(v, offset);
    if (Math.abs(s) <= epsilon || Math.abs(t) <= epsilon) {
      boundary++; membership.push(-1);
    } else {
      const region = regionIndex(s > 0, t > 0);
      counts[region]++; membership.push(region);
    }
  }
  return { counts, membership, boundary };
}
function randomSource(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = Math.imul(value ^ value >>> 15, value | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export function solvePerpendicular(points, n) {
  const events = [0, Math.PI / 2];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      events.push(mod(Math.atan2(points[j].y - points[i].y, points[j].x - points[i].x), Math.PI / 2));
    }
  }
  events.sort((a, b) => a - b);
  const unique = events.filter((value, index) => index === 0 || value - events[index - 1] > 1e-10);
  let best = null;
  for (let i = 0; i < unique.length - 1; i++) {
    const angle = (unique[i] + unique[i + 1]) / 2;
    const u = { x: Math.cos(angle), y: Math.sin(angle) }, v = { x: -u.y, y: u.x };
    const us = points.map(point => dot(point, u)).sort((a, b) => a - b);
    const vs = points.map(point => dot(point, v)).sort((a, b) => a - b);
    const a = (us[2 * n - 1] + us[2 * n]) / 2;
    const b = (vs[2 * n - 1] + vs[2 * n]) / 2;
    const pose = { x: a * u.x + b * v.x, y: a * u.y + b * v.y, a: angle + Math.PI / 2, b: angle };
    if (Math.abs(pose.x) > .7 || Math.abs(pose.y) > .4) continue;
    const result = classify(points, pose);
    if (result.boundary || !result.counts.every(count => count === n)) continue;
    const margin = Math.min(us[2 * n] - us[2 * n - 1], vs[2 * n] - vs[2 * n - 1]) / 2;
    if (!best || margin > best.margin) best = { pose, margin };
  }
  return best;
}
export function makePointSet(seed, n) {
  if (!Number.isInteger(n) || n < 1 || n > 12 || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('Invalid point set.');
  const random = randomSource(seed);
  for (let attempt = 0; attempt < 24; attempt++) {
    const points = [];
    for (let trial = 0; trial < 4000 && points.length < n * 4; trial++) {
      const candidate = { x: (random() * 2 - 1) * .86, y: (random() * 2 - 1) * .53 };
      if (points.every(point => Math.hypot(point.x - candidate.x, point.y - candidate.y) > .075)) points.push(candidate);
    }
    if (points.length !== n * 4) continue;
    const solution = solvePerpendicular(points, n);
    if (solution && solution.margin > .001 && !classify(points, initialPose()).counts.every(count => count === n)) return { points, solution };
  }
  throw new Error('A playable point set could not be prepared.');
}
export function clipHalfPlane(polygon, vector, threshold, sign) {
  const output = [];
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i], q = polygon[(i + 1) % polygon.length];
    const dp = sign * (dot(vector, p) - threshold), dq = sign * (dot(vector, q) - threshold);
    const insideP = dp >= 0, insideQ = dq >= 0;
    if (insideP) output.push(p);
    if (insideP !== insideQ) {
      const ratio = dp / (dp - dq);
      output.push({ x: p.x + ratio * (q.x - p.x), y: p.y + ratio * (q.y - p.y) });
    }
  }
  return output;
}
export function keepCrossing(angle, other, previous) {
  const delta = lineDelta(angle - other), minimum = Math.PI / 15;
  if (Math.abs(delta) >= minimum) return angle;
  const sign = Math.sign(lineDelta(previous - other)) || 1;
  return angle + sign * minimum - delta;
}
export function boundedMotion(pose, dx, dy) {
  let scale = 1;
  if (pose.x + dx > .78) scale = Math.min(scale, (.78 - pose.x) / dx);
  if (pose.x + dx < -.78) scale = Math.min(scale, (-.78 - pose.x) / dx);
  if (pose.y + dy > .45) scale = Math.min(scale, (.45 - pose.y) / dy);
  if (pose.y + dy < -.45) scale = Math.min(scale, (-.45 - pose.y) / dy);
  return { ...pose, x: pose.x + dx * scale, y: pose.y + dy * scale };
}

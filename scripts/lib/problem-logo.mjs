// The approved circle and woven-loop family; no problem-specific artwork.
import { LOGO_STYLE } from './logo-svg.mjs';

const point = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`;
const path = (points, closed = false) => points.map((value, index) => `${index ? 'L' : 'M'}${point(value)}`).join('') + (closed ? 'Z' : '');
const stroke = (points, width, color, closed = false, cap = 'round') => `<path d="${path(points, closed)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="${cap}"/>`;

export function problemLogoArtwork(crossings) {
  const { green, paper } = LOGO_STYLE;
  if (crossings === 0) return `<circle cx="220" cy="205" r="148" fill="none" stroke="${green}" stroke-width="12"/>`;
  if (![3, 5, 7].includes(crossings)) throw new Error('The problem logo family supports a circle and three, five, or seven crossings.');

  // Project a (2, q) torus knot. Its third coordinate determines the weave.
  const raw = t => {
    const radius = 108 + 45 * Math.cos(crossings * t);
    return [radius * Math.cos(2 * t - Math.PI / 2), radius * Math.sin(2 * t - Math.PI / 2)];
  };
  const extent = Array.from({ length: 1500 }, (_, index) => raw(index * 2 * Math.PI / 1500));
  const xs = extent.map(p => p[0]), ys = extent.map(p => p[1]);
  const bounds = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min(310 / (bounds[1] - bounds[0]), 300 / (bounds[3] - bounds[2]));
  const project = t => {
    const p = raw(t);
    return [220 + scale * (p[0] - (bounds[0] + bounds[1]) / 2), 205 + scale * (p[1] - (bounds[2] + bounds[3]) / 2)];
  };
  const points = Array.from({ length: 420 }, (_, index) => project(index * 2 * Math.PI / 420));
  let artwork = stroke(points, 12, green, true);
  for (let index = 0; index < crossings; index++) {
    // cos(qt) = 0 gives a crossing; sin(qt) > 0 is the upper strand.
    const t = (Math.PI / 2 + 2 * Math.PI * index) / crossings;
    const a = project(t - 0.0001), b = project(t + 0.0001);
    const speed = Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.0002;
    const window = 24 / speed;
    const segment = Array.from({ length: 21 }, (_, j) => project(t - window + 2 * window * j / 20));
    artwork += stroke(segment, 24, paper, false, 'butt');
    artwork += stroke(segment, 12, green, false, 'butt');
  }
  return artwork;
}

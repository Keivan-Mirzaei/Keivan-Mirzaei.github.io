import { constraintPoint, objectiveContour } from './lagrange-math.mjs';

const fixed = value => Number(value.toFixed(3));
const path = (points, map) => points.map((point, i) => `${i ? 'L' : 'M'}${map(point).map(fixed).join(' ')}`).join(' ');
const samples = (a, b, count, fn) => Array.from({ length: count + 1 }, (_, i) => fn(a + (b - a) * i / count));

export function planGeometry(width = 580) {
  const height = Math.max(285, Math.min(410, width * .7));
  const scale = Math.min((width - 48) / 5.7, (height - 54) / 5.1);
  const origin = [width / 2 - .55 * scale, height / 2 + .25 * scale];
  const map = ([x, y]) => [origin[0] + scale * x, origin[1] - scale * y];
  return { width, height, scale, origin, map };
}

export function planDiagram(state, width = 580, prefix = 'lagrange') {
  const { height, scale, origin, map } = planGeometry(width);
  const [px, py] = map(state.point), [ax, ay] = map([2, 0]);
  const clip = `${prefix}-plan-clip`, markerF = `${prefix}-arrow-f`, markerG = `${prefix}-arrow-g`;
  const contour = (kind, level, klass) => `<path class="${klass}" d="${path(samples(0,360,240, angle=>kind==='f'?objectiveContour(angle,level):constraintPoint(angle,level)),map)}Z"/>`;
  const line = (a, b, klass, extra = '') => {
    const points = [map(a), map(b)].flat().map(fixed);
    return `<line class="${klass}" x1="${points[0]}" y1="${points[1]}" x2="${points[2]}" y2="${points[3]}" ${extra}/>`;
  };
  const arrow = (gradient, klass, marker) => line(state.point, state.point.map((x, i) => x + .12 * gradient[i]), klass, `marker-end="url(#${marker})"`);
  const guide = line(state.point.map((x, i) => x - 1.05 * state.direction[i]), state.point.map((x, i) => x + 1.05 * state.direction[i]), 'lm-direction');
  const labelRight = state.point[0] < 0;
  return `<svg class="lm-svg lm-plan-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">
    <defs><clipPath id="${clip}"><rect x="12" y="12" width="${width - 24}" height="${height - 24}"/></clipPath>
      <marker id="${markerF}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="lm-f-fill" d="M0 0L10 5L0 10Z"/></marker>
      <marker id="${markerG}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="lm-g-fill" d="M0 0L10 5L0 10Z"/></marker>
    </defs>
    <g clip-path="url(#${clip})">
      <path class="lm-axis" d="M12 ${fixed(origin[1])}H${width - 12}M${fixed(origin[0])} 12V${height - 12}"/>
      ${[1,4,9].map(level => contour('f',level,'lm-contour')).join('')}
      ${[.25,2,4].map(level => contour('g',level,'lm-g-contour')).join('')}
      ${contour('f',state.value,'lm-level')}${contour('g',1,'lm-constraint')}
      ${guide}${arrow(state.gradF, 'lm-gradient-f', markerF)}${arrow(state.gradG, 'lm-gradient-g', markerG)}
      <circle class="lm-point" cx="${fixed(px)}" cy="${fixed(py)}" r="4.5"/>
      <circle class="lm-centre" cx="${fixed(ax)}" cy="${fixed(ay)}" r="3"/>
    </g>
    <g class="lm-labels"><text x="${width - 17}" y="${fixed(origin[1] - 9)}">x</text><text x="${fixed(origin[0] + 9)}" y="23">y</text>
      <text x="${fixed(ax)}" y="${fixed(ay - 12)}" text-anchor="middle">A</text>
      <text x="${fixed(px + (labelRight ? 10 : -10))}" y="${fixed(py - 10)}" text-anchor="${labelRight ? 'start' : 'end'}">P</text>
      <text x="${fixed(origin[0] - 10)}" y="${fixed(origin[1] + 17)}" text-anchor="end">0</text>
      <text x="${fixed(origin[0] + scale)}" y="${fixed(origin[1] + 17)}" text-anchor="middle">1</text>
    </g></svg>`;
}

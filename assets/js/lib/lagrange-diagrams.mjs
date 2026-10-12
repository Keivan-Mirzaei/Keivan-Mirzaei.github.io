import { sectionValue, feasibleValue, constraintPoint, objectiveContour } from './lagrange-math.mjs';
import { formatNumber } from './widget-math.mjs';

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
  const [px, py] = map(state.point), [ax, ay] = map([2, 1]);
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

function chart({ width, height = 185, xRange, yRange, xTicks, yTicks, curve, reference, point, kind, xLabel, yLabel, vertical = 0, horizontal }) {
  const left = 35, right = width - 14, top = 15, bottom = height - 35;
  const map = ([x,y]) => [left + (right - left) * (x - xRange[0]) / (xRange[1] - xRange[0]), bottom - (bottom - top) * (y - yRange[0]) / (yRange[1] - yRange[0])];
  const [px,py] = map(point), [zx] = map([vertical, 0]);
  const ticks = xTicks.map(x => { const [sx] = map([x, 0]); return `<path class="lm-axis" d="M${fixed(sx)} ${bottom}v4"/><text x="${fixed(sx)}" y="${bottom + 18}" text-anchor="middle">${formatNumber(x)}</text>`; }).join('');
  const yticks = yTicks.map(y => { const [,sy] = map([0, y]); return `<path class="lm-grid" d="M${left} ${fixed(sy)}H${right}"/><text x="${left - 7}" y="${fixed(sy + 4)}" text-anchor="end">${formatNumber(y)}</text>`; }).join('');
  const ref = reference ? `<path class="lm-slope-line" d="${path(reference, map)}"/>` : '';
  const level = horizontal === undefined ? '' : `<path class="lm-reference" d="M${left} ${fixed(map([0,horizontal])[1])}H${right}"/>`;
  return `<svg class="lm-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">
    <g class="lm-labels">${yticks}${ticks}<text x="${left}" y="11">${yLabel}</text><text x="${right}" y="${height - 3}" text-anchor="end">${xLabel}</text></g>
    <path class="lm-axis" d="M${left} ${top}V${bottom}H${right}"/>
    <path class="lm-zero" d="M${fixed(zx)} ${top}V${bottom}"/>${level}${ref}
    <path class="lm-curve-${kind}" d="${path(curve, map)}"/>
    <circle class="lm-chart-point lm-${kind}-fill" cx="${fixed(px)}" cy="${fixed(py)}" r="4"/>
    </svg>`;
}

export function sectionDiagram(state, kind, width = 280) {
  const base = kind === 'f' ? state.value : 1, slope = kind === 'f' ? state.slopeF : state.slopeG;
  const yRange = kind === 'f' ? [-.5, 34] : [0, 12];
  // Short tangents stay inside the fixed axes even near the extrema.
  return chart({ width, xRange: [-.65,.65], yRange, xTicks: [-.65,0,.65], yTicks: kind === 'f' ? [0,10,20,30] : [0,4,8,12],
    curve: samples(-.65,.65,96, t => [t, sectionValue(state, kind, t)]),
    reference: [[-.22,base - .22 * slope],[.22,base + .22 * slope]], horizontal: kind === 'g' ? 1 : undefined,
    point: [0,base], kind, xLabel: 't', yLabel: kind });
}

export function feasibleDiagram(state, width = 580) {
  return chart({ width, height: 205, xRange: [0,360], yRange: [0,20], xTicks: [0,90,180,270,360], yTicks: [0,5,10,15,20],
    curve: samples(0,360,240, theta => [theta,feasibleValue(theta)]), point: [state.theta,state.value], kind: 'f',
    xLabel: 'θ (degrees)', yLabel: 'f on the constraint', vertical: state.theta });
}

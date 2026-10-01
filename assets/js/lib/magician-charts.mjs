import { PHASE_AVERAGE, successProbability, limitingProbability, differencePerMillion } from './magician-math.mjs';

export function powerLabel(exponent) {
  const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return `2${String(exponent).split('').map(digit => superscripts[Number(digit)]).join('')}`;
}

export function chartFrame(width) {
  return { width, height: 256, left: 52, right: width - 12, top: 34, bottom: 206 };
}

function plot({ width, id, description, xDomain, yDomain, xTicks, yTicks, xTitle, yTitle, curves, reference, marker = false }) {
  const frame = chartFrame(width);
  const { left, right, top, bottom, height } = frame;
  const x = value => left + (right - left) * (value - xDomain[0]) / (xDomain[1] - xDomain[0]);
  const y = value => bottom - (bottom - top) * (value - yDomain[0]) / (yDomain[1] - yDomain[0]);
  const coordinate = value => value.toFixed(3);
  const lines = yTicks.map(tick => `<line class="mp-grid" x1="${left}" x2="${right}" y1="${y(tick.value)}" y2="${y(tick.value)}"/><text class="mp-label" x="${left - 8}" y="${y(tick.value) + 4}" text-anchor="end">${tick.label}</text>`).join('');
  const labels = xTicks.map((tick, index) => `<line class="mp-axis" x1="${x(tick.value)}" x2="${x(tick.value)}" y1="${bottom}" y2="${bottom + 5}"/><text class="mp-label" x="${x(tick.value)}" y="${bottom + 22}" text-anchor="${index === 0 ? 'start' : index === xTicks.length - 1 ? 'end' : 'middle'}">${tick.label}</text>`).join('');
  const paths = curves.map(curve => {
    const path = curve.points.map(([a, b], index) => `${index ? 'L' : 'M'}${coordinate(x(a))},${coordinate(y(b))}`).join(' ');
    return `<path class="mp-curve ${curve.className || ''}" d="${path}"/>`;
  }).join('');
  const baseline = reference === undefined ? '' : `<line class="mp-reference" x1="${left}" x2="${right}" y1="${y(reference)}" y2="${y(reference)}"/>`;
  const cursor = marker ? `<line data-guide class="mp-guide" x1="${left}" x2="${left}" y1="${top}" y2="${bottom}"/><circle data-marker class="mp-marker" cx="${left}" cy="${y(differencePerMillion(limitingProbability(0)))}" r="4"/>` : '';
  return `<svg class="mp-plot" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${description}"><title>${description}</title><defs><clipPath id="${id}"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}"/></clipPath></defs>${lines}<path class="mp-axis" d="M${left},${top}V${bottom}H${right}"/>${labels}<text class="mp-label mp-axis-title" x="${left}" y="16">${yTitle}</text><text class="mp-label mp-axis-title" x="${(left + right) / 2}" y="250" text-anchor="middle">${xTitle}</text><g clip-path="url(#${id})">${baseline}${paths}${cursor}</g></svg>`;
}

const overviewPoints = [];
for (let n = 2; n <= 64; n += 1) overviewPoints.push([Math.log2(n), successProbability(n)]);
for (let exponent = 6.05; exponent <= 22.001; exponent += .05) overviewPoints.push([exponent, successProbability(Math.round(2 ** exponent))]);
const ripplePoints = Array.from({ length: 721 }, (_, index) => [index / 120, differencePerMillion(limitingProbability(index / 120))]);
const routeA = Array.from({ length: 33 }, (_, index) => [index + 8, differencePerMillion(successProbability(2 ** (index + 8)))]);
const routeB = Array.from({ length: 33 }, (_, index) => [index + 8, differencePerMillion(successProbability(Math.floor(2 ** (index + 8) * Math.SQRT2)))]);

export function overviewChart(width) {
  const ticks = width < 440 ? [1, 8, 15, 22] : [1, 4, 7, 10, 13, 16, 19, 22];
  const labels = value => {
    const n = 2 ** value;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}m`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
    return String(n);
  };
  return plot({ width, id: 'mp-overview-clip', description: 'Exact chance of ever reaching one survivor, from 2 to about 4.2 million people. It appears to flatten near 72.13 percent.', xDomain: [1, 22], yDomain: [.65, .735], xTicks: ticks.map(value => ({ value, label: labels(value) })), yTicks: [.66, .68, .70, .72].map(value => ({ value, label: `${Math.round(value * 100)}%` })), xTitle: 'Audience size (log scale)', yTitle: 'Chance of one survivor', curves: [{ points: overviewPoints }], reference: PHASE_AVERAGE });
}

export function rippleChart(width, start = 14) {
  const ticks = width < 440 ? [0, 3, 6] : [0, 2, 4, 6];
  return plot({ width, id: 'mp-ripple-clip', description: 'Magnified limiting pattern over six doublings. Its difference from the average repeats between about minus 7.13 and plus 7.13 per million.', xDomain: [0, 6], yDomain: [-8, 8], xTicks: ticks.map(value => ({ value, label: powerLabel(start + value) })), yTicks: [-8, -4, 0, 4, 8].map(value => ({ value, label: String(value) })), xTitle: 'Audience size', yTitle: 'Difference per million', curves: [{ points: ripplePoints }], reference: 0, marker: true });
}

export function routesChart(width) {
  const ticks = width < 440 ? [8, 24, 40] : [8, 16, 24, 32, 40];
  return plot({ width, id: 'mp-routes-clip', description: 'Two sequences of growing audiences approach different probabilities. Powers of two approach 72.1352103 percent; powers of two times the square root of two, rounded down, approach 72.1342938 percent.', xDomain: [8, 40], yDomain: [-8, 8], xTicks: ticks.map(value => ({ value, label: String(value) })), yTicks: [-8, -4, 0, 4, 8].map(value => ({ value, label: String(value) })), xTitle: 'Number of doublings', yTitle: 'Difference per million', curves: [{ points: routeA }, { points: routeB, className: 'mp-other-route' }], reference: 0 });
}

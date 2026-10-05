// Coordinates are centred on the original middle unit cube. No unit cube is cut.
export const CUTS = Object.freeze([
  { axis: 0, sign: 1, label: 'right' },
  { axis: 0, sign: -1, label: 'left' },
  { axis: 1, sign: 1, label: 'front' },
  { axis: 1, sign: -1, label: 'back' },
  { axis: 2, sign: 1, label: 'top' },
  { axis: 2, sign: -1, label: 'bottom' }
].map(Object.freeze));

function validateStep(step) {
  if (!Number.isInteger(step) || step < 0 || step > 6) throw new RangeError('Cut step must be an integer from 0 to 6.');
}

export function cutState(step) {
  validateStep(step);
  const cuts = CUTS.slice(0, step);
  const pieces = [0, 1, 2].reduce((total, axis) => total * (1 + cuts.filter(cut => cut.axis === axis).length), 1);
  return { cuts, pieces, neighboursAttached: 6 - step, complete: step === 6 };
}

export function unitCubes(view = 'whole', step = 0) {
  const { cuts } = cutState(step);
  if (view !== 'centre' && view !== 'whole') throw new RangeError('Unknown cube view.');
  const cubes = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const cell = [x, y, z];
    const distance = cell.reduce((sum, coordinate) => sum + Math.abs(coordinate), 0);
    if (view === 'centre' && distance > 1) continue;
    const centre = distance === 0;
    const disconnected = distance === 1 && cuts.some(cut => cell[cut.axis] === cut.sign);
    const position = cell.map((coordinate, axis) => {
      const separated = cuts.some(cut => cut.axis === axis && cut.sign === coordinate);
      return coordinate * ((view === 'centre' ? 1.85 : 1) + (separated ? 0.3 : 0));
    });
    cubes.push({ cell, position, centre, disconnected });
  }
  return cubes;
}

export function describeCut(view, step) {
  const state = cutState(step);
  if (!step) return view === 'centre'
    ? 'All six neighbours still share a face with the middle cube.'
    : 'One solid cube. Follow two cuts in each of the three directions.';
  if (state.complete) return view === 'centre'
    ? 'Six cuts: all six faces are free. The middle cube is detached.'
    : 'Six cuts: 27 separate unit cubes. The lower bound is achieved.';
  const latest = CUTS[step - 1];
  return view === 'centre'
    ? `Cut ${step} frees the ${latest.label} face. ${state.neighboursAttached} ${state.neighboursAttached === 1 ? 'neighbour remains' : 'neighbours remain'} attached.`
    : `Cut ${step}: ${state.pieces} pieces. ${state.neighboursAttached} ${state.neighboursAttached === 1 ? 'face of the middle cube still needs' : 'faces of the middle cube still need'} a cut.`;
}

const palette = {
  centre: ['#dbad4e', '#c59438', '#f0d58c'],
  neighbour: ['#b7ccb5', '#8eaf97', '#dbe5cf'],
  freed: ['#dce6d8', '#c4d6c4', '#eaf0e3']
};

const faceOffsets = [
  [[.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5], [.5, -.5, .5]],
  [[-.5, .5, -.5], [.5, .5, -.5], [.5, .5, .5], [-.5, .5, .5]],
  [[-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]]
];

const project = ([x, y, z]) => [320 + (x - y) * 53.7, 230 + (x + y) * 31 - z * 62];
const depth = point => point.reduce((sum, coordinate) => sum + coordinate, 0);
const pointsAttribute = points => points.map(point => project(point).map(coordinate => coordinate.toFixed(2)).join(',')).join(' ');

function faceMarkup(cube, axis, view) {
  const points = faceOffsets[axis].map(offset => offset.map((coordinate, i) => coordinate + cube.position[i]));
  const kind = view === 'whole' ? 'neighbour' : cube.centre ? 'centre' : cube.disconnected ? 'freed' : 'neighbour';
  const stroke = kind === 'centre' ? '#9c7430' : cube.disconnected ? '#94b299' : '#628270';
  return {
    depth: points.reduce((sum, point) => sum + depth(point), 0) / 4,
    markup: `<polygon points="${pointsAttribute(points)}" fill="${palette[kind][axis]}" stroke="${stroke}" stroke-width="1.3" stroke-linejoin="round"/>`
  };
}

function planeMarkup(view, step) {
  if (!step) return '';
  const { axis, sign } = CUTS[step - 1];
  // In the exploded view the plane marks the middle cube's actual face;
  // in the whole-cube view it lies midway across the newly opened gap.
  const coordinate = sign * (view === 'whole' ? .65 : .5);
  const extent = view === 'whole' ? 1.72 : 1.36;
  const others = [0, 1, 2].filter(i => i !== axis);
  const points = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(pair => {
    const point = [0, 0, 0];
    point[axis] = coordinate;
    others.forEach((i, j) => { point[i] = pair[j] * extent; });
    return point;
  });
  return `<polygon points="${pointsAttribute(points)}" fill="#af6749" fill-opacity=".10" stroke="#9c543a" stroke-width="1.8" stroke-dasharray="7 5" stroke-linejoin="round"/>`;
}

export function cubeDiagram(view = 'centre', step = 0, { statement = false } = {}) {
  const cubes = unitCubes(view, step);
  const faces = cubes.flatMap(cube => [0, 1, 2].map(axis => faceMarkup(cube, axis, view)));
  faces.sort((a, b) => a.depth - b.depth);
  const description = statement
    ? 'A three-by-three-by-three cube made of 27 joined unit cubes.'
    : view === 'centre'
      ? `Exploded view of the golden middle cube and its six neighbours. ${describeCut(view, step)}`
      : `The 27 original unit cubes after ${step} cuts. ${describeCut(view, step)}`;
  const height = 460;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 ${height}" width="640" height="${height}" role="img" aria-label="${description}"><title>${description}</title>${faces.map(face => face.markup).join('')}${planeMarkup(view, step)}</svg>`;
}

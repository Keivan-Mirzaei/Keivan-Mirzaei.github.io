import { makeGraph, pressEffect, countBits } from './lights-out-math.mjs';

const ring = (size, radius) => Array.from({ length: size }, (_, i) => [
  .5 + radius * Math.cos(2 * Math.PI * i / size - Math.PI / 2),
  .5 + radius * Math.sin(2 * Math.PI * i / size - Math.PI / 2),
]);
const cycle = (size, offset = 0, step = 1) => Array.from({ length: size }, (_, i) => [offset + i, offset + (i + step) % size]);

export const GRAPH_BOARDS = {
  constellation: {
    ...makeGraph(9, [[0, 1], [1, 2], [0, 3], [1, 3], [1, 4], [2, 4], [3, 4], [3, 5], [3, 6], [4, 6], [4, 7], [5, 6], [6, 7], [6, 8], [7, 8]],
      [[.19, .18], [.50, .12], [.81, .22], [.33, .38], [.67, .42], [.16, .66], [.46, .64], [.82, .73], [.50, .88]]),
    name: 'Constellation',
  },
  wheel: {
    ...makeGraph(9, [...cycle(8, 1), ...Array.from({ length: 8 }, (_, i) => [0, i + 1])], [[.5, .5], ...ring(8, .37)]),
    name: 'Wheel',
  },
  tree: {
    ...makeGraph(10, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [4, 8], [6, 9]],
      [[.5, .12], [.28, .32], [.73, .34], [.14, .56], [.40, .56], [.61, .59], [.85, .59], [.16, .84], [.40, .85], [.81, .85]]),
    name: 'Branches',
  },
  petersen: {
    ...makeGraph(10, [...cycle(5), ...cycle(5, 5, 2), ...Array.from({ length: 5 }, (_, i) => [i, i + 5])], [...ring(5, .39), ...ring(5, .19)]),
    name: 'Petersen graph',
  },
};

// Enumerate reachable configurations once. This gives an exact minimum press
// count for each puzzle without repeatedly solving randomly rejected patterns.
const catalogues = new Map();
export function puzzleCatalogue(key) {
  if (catalogues.has(key)) return catalogues.get(key);
  const graph = GRAPH_BOARDS[key];
  if (!graph) throw new RangeError('Unknown graph.');
  const best = new Map();
  for (let mask = 1; mask <= graph.all; mask++) {
    const lights = pressEffect(graph, mask);
    if (!lights) continue;
    const minimum = countBits(mask);
    if (!best.has(lights) || best.get(lights) > minimum) best.set(lights, minimum);
  }
  const catalogue = [...best].map(([lights, minimum]) => ({ lights, minimum }));
  catalogues.set(key, catalogue);
  return catalogue;
}

export function newGraphPuzzle(key, difficulty = 'medium', previous = -1, random = Math.random) {
  const catalogue = puzzleCatalogue(key);
  const hardest = Math.max(...catalogue.map(puzzle => puzzle.minimum));
  const easyHigh = Math.max(1, Math.min(3, Math.floor(hardest / 3)));
  const mediumHigh = Math.max(easyHigh + 1, Math.min(5, Math.ceil(hardest * 2 / 3)));
  const ranges = {
    easy: [Math.min(2, easyHigh), easyHigh],
    medium: [easyHigh + 1, mediumHigh],
    hard: [mediumHigh + 1, hardest],
  };
  const [low, high] = ranges[difficulty] || ranges.medium;
  const candidates = catalogue.filter(puzzle => puzzle.minimum >= low && puzzle.minimum <= high && puzzle.lights !== previous);
  return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
}

import { createSearch } from './hex-math.mjs';

self.onmessage = ({ data: { cells, size, color } }) => {
  const search = createSearch(cells, size, color);
  const deadline = performance.now() + 1100;
  const limit = size === 5 ? 6000 : 8000;
  while (!search.solved && search.visits() < limit && performance.now() < deadline) search.run(100);
  self.postMessage({ move: search.best() });
};

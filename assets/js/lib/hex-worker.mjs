import { createSearch } from './hex-math.mjs?v=20261002-5';
import { searchBudget } from './hex-search-settings.mjs?v=20261002-5';

self.onmessage = ({ data: { cells, size, color } }) => {
  const budget = searchBudget(size), deadline = performance.now() + budget.timeMs;
  const search = createSearch(cells, size, color);
  while (!search.solved && search.visits() < budget.maxIterations && performance.now() < deadline) {
    search.run(Math.min(budget.workerBatch, budget.maxIterations - search.visits()));
  }
  self.postMessage({ move: search.best() });
};

import { createSearch } from './hex-math.mjs';
import { searchBudget } from './hex-search-settings.mjs';

self.onmessage = ({ data: { cells, size, color, difficulty } }) => {
  const budget = searchBudget(size, difficulty), deadline = performance.now() + budget.timeMs;
  const search = createSearch(cells, size, color, Math.random, budget);
  while (!search.solved && search.visits() < budget.maxIterations && performance.now() < deadline) {
    search.run(Math.min(budget.workerBatch, budget.maxIterations - search.visits()));
  }
  self.postMessage({ move: search.best() });
};

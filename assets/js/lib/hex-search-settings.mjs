// Workers and the cooperative main-thread search use the same playing strength.
export function searchBudget(size) {
  return {
    timeMs: size <= 5 ? 1500 : 2000,
    maxIterations: 60000,
    workerBatch: 32,
    mainThreadSliceMs: 12,
  };
}

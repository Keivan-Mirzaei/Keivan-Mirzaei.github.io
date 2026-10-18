// Keep the existing opponent as Hard. Even Easy searches and answers threats.
export const HEX_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];
export function hexDifficulty(value) {
  return HEX_DIFFICULTIES.includes(value) ? value : 'hard';
}

// The worker and cooperative fallback share both search effort and proof limits.
export function searchBudget(size, difficulty = 'hard') {
  const levels = {
    easy: { timeMs: 180, maxIterations: 1800, exactLimit: 4 },
    medium: { timeMs: 650, maxIterations: 10000, exactLimit: 8 },
    hard: { timeMs: size <= 5 ? 1500 : 2000, maxIterations: 60000, exactLimit: 12 },
    expert: { timeMs: size <= 5 ? 6000 : 8000, maxIterations: 260000, exactLimit: 12, proofLimit: 16 },
  };
  return {
    ...levels[hexDifficulty(difficulty)],
    workerBatch: 32,
    mainThreadSliceMs: 12,
  };
}

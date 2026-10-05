export const PHASE_AVERAGE = 1 / (2 * Math.log(2));

// Exact occupation formula, evaluated without the cancellation in the rational form.
export function successProbability(n) {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError('Audience size must be a nonnegative safe integer.');
  if (n <= 1) return n;
  let sum = 0;
  const lastRound = Math.ceil(Math.log2(n)) + 56;
  for (let round = 1; round <= lastRound; round += 1) {
    const survival = 2 ** -round;
    sum += n * survival * Math.exp((n - 1) * Math.log1p(-survival));
  }
  return sum / 2;
}

// The two-sided Poisson sum is the limiting pattern, not a finite-n estimate.
export function limitingProbability(phase) {
  if (!Number.isFinite(phase)) throw new RangeError('Phase must be finite.');
  const position = ((phase % 1) + 1) % 1;
  let sum = 0;
  for (let round = -12; round <= 56; round += 1) {
    const expected = 2 ** (position - round);
    sum += expected * Math.exp(-expected);
  }
  return sum / 2;
}

export function differencePerMillion(probability) {
  return (probability - PHASE_AVERAGE) * 1e6;
}

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

// Replay the same coin tosses and guesses so Undo, Redo and Reset are exact.
export function simulateAudience(seed = 42, rounds = 0) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff || !Number.isInteger(rounds) || rounds < 0 || rounds > 128) throw new RangeError('Invalid audience run.');
  const random = seededRandom(seed);
  let alive = Array(64).fill(true), heads = null, round = 0;
  while (round < rounds && alive.filter(Boolean).length > 1) {
    heads = random() >= .5;
    alive = alive.map(standing => standing && (random() >= .5) === heads);
    round += 1;
  }
  return { alive, heads, round, standing: alive.filter(Boolean).length };
}

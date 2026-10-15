// Exact balance-scale reasoning. A state is [coin number, -1 (light) or 1 (heavy)].
export const OUTCOMES = [-1, 0, 1];
export const outcomeName = outcome => outcome === 1 ? 'Left heavier' : outcome === -1 ? 'Right heavier' : 'Balanced';
export const stateName = ([coin, weight]) => `Coin ${coin} is ${weight === 1 ? 'heavy' : 'light'}`;
export const stateKey = state => state.join(':');

export function initialStates(puzzle) {
  const genuine = new Set(puzzle.genuine);
  return Array.from({ length: puzzle.coins }, (_, i) => i + 1).filter(coin => !genuine.has(coin))
    .flatMap(coin => (puzzle.kind === 'heavy' ? [1] : puzzle.kind === 'light' ? [-1] : [-1, 1]).map(weight => [coin, weight]));
}

export function validWeighing(coins, left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length > 0 && left.length === right.length
    && new Set([...left, ...right]).size === left.length + right.length
    && [...left, ...right].every(coin => Number.isInteger(coin) && coin >= 1 && coin <= coins);
}

export function weigh(state, left, right) {
  return (left.includes(state[0]) ? 1 : right.includes(state[0]) ? -1 : 0) * state[1] || 0;
}

export function splitStates(states, left, right) {
  const branches = { '-1': [], 0: [], 1: [] };
  for (const state of states) branches[weigh(state, left, right)].push(state);
  return branches;
}

export function remainingStates(puzzle, log = []) {
  let states = initialStates(puzzle);
  for (const entry of [...puzzle.evidence, ...log]) {
    if (!validWeighing(puzzle.coins, entry.left, entry.right) || !OUTCOMES.includes(entry.outcome)) return [];
    states = states.filter(state => weigh(state, entry.left, entry.right) === entry.outcome);
  }
  return states;
}

function groupsFor(coins, states) {
  const signs = new Map();
  for (const [coin, weight] of states) signs.set(coin, (signs.get(coin) || 0) | (weight === 1 ? 1 : 2));
  const groups = [[], [], [], []]; // Both directions, heavy only, light only, genuine.
  for (let coin = 1; coin <= coins; coin++) groups[signs.get(coin) === 3 ? 0 : signs.get(coin) === 1 ? 1 : signs.get(coin) === 2 ? 2 : 3].push(coin);
  return groups;
}

const solutions = new Map();
function distributions(size) {
  const values = [];
  for (let left = 0; left <= size; left++) for (let right = 0; right <= size - left; right++) values.push([left, right, size - left - right]);
  return values;
}

// Coins with the same remaining possibilities are interchangeable. Searching
// counts rather than labelled subsets makes even 39 coins small and exact.
function solveCounts(counts, budget) {
  const [both, heavy, light, genuine] = counts, total = both + heavy + light + genuine;
  const size = 2 * both + heavy + light;
  if (size <= 1) return size === 1 ? true : null;
  if (budget <= 0 || size > 3 ** budget) return null;
  const key = [...counts, budget].join(',');
  if (solutions.has(key)) return solutions.get(key);
  const capacity = 3 ** (budget - 1), candidates = [];
  for (const b of distributions(both)) {
    if (2 * b[2] > capacity || b[0] + b[1] > capacity) continue;
    for (const h of distributions(heavy)) {
      if (2 * b[2] + h[2] > capacity || b[0] + b[1] + Math.max(h[0], h[1]) > capacity) continue;
      for (const l of distributions(light)) {
        const sizes = [b[0] + b[1] + h[1] + l[0], 2 * b[2] + h[2] + l[2], b[0] + b[1] + h[0] + l[1]];
        const largest = Math.max(...sizes);
        if (largest > capacity || largest === size) continue;
        const left = b[0] + h[0] + l[0], right = b[1] + h[1] + l[1];
        if (Math.abs(left - right) > genuine || Math.max(left, right) === 0) continue;
        candidates.push({ b, h, l, sizes, score: largest * 10000 + sizes.reduce((sum, n) => sum + n * n, 0) * 10 + Math.max(left, right) });
      }
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  for (const candidate of candidates) {
    const { b, h, l } = candidate;
    const next = [
      [0, b[1] + h[1], b[0] + l[0]],
      [b[2], h[2], l[2]],
      [0, b[0] + h[0], b[1] + l[1]],
    ];
    if (next.every((child, i) => !candidate.sizes[i] || solveCounts([...child, total - child.reduce((sum, n) => sum + n, 0)], budget - 1))) {
      solutions.set(key, candidate); return candidate;
    }
  }
  solutions.set(key, null); return null;
}

export function suggestWeighing(coins, states, budget) {
  const groups = groupsFor(coins, states), solution = solveCounts(groups.map(group => group.length), budget);
  if (!solution || solution === true) return null;
  const left = [], right = [];
  [solution.b, solution.h, solution.l].forEach((counts, i) => {
    left.push(...groups[i].slice(0, counts[0]));
    right.push(...groups[i].slice(counts[0], counts[0] + counts[1]));
  });
  if (left.length < right.length) left.push(...groups[3].slice(0, right.length - left.length));
  else right.push(...groups[3].slice(0, left.length - right.length));
  return { left: left.sort((a, b) => a - b), right: right.sort((a, b) => a - b) };
}

export function canSolve(coins, states, budget) {
  return states.length > 0 && !!solveCounts(groupsFor(coins, states).map(group => group.length), budget);
}

export function minimumWeighings(coins, states) {
  if (!states.length) return Infinity;
  if (states.length === 1) return 0;
  const ceilLog3 = value => { let power = 1, exponent = 0; while (power < value) { power *= 3; exponent++; } return exponent; };
  const bound = ceilLog3(2 * coins) + 1;
  for (let budget = ceilLog3(states.length); budget <= bound; budget++) {
    if (canSolve(coins, states, budget)) return budget;
  }
  return Infinity;
}

// The computer commits only to observations. A minimax reply maximizes the
// number of further weighings needed; ties retain the most possible answers.
// Every retained state agrees with the complete history. No hidden coin is picked.
export function opponentReply(coins, states, left, right) {
  if (!states.length || !validWeighing(coins, left, right)) return null;
  const branches = splitStates(states, left, right);
  let best = null;
  for (const outcome of [0, 1, -1]) {
    const possible = branches[outcome];
    if (!possible.length) continue;
    const required = minimumWeighings(coins, possible), suspects = new Set(possible.map(state => state[0])).size;
    if (!best || required > best.required || (required === best.required && (possible.length > best.states.length
      || (possible.length === best.states.length && suspects > best.suspects)))) best = { outcome, states: possible, required, suspects };
  }
  return best;
}

export function buildStrategy(coins, states, budget) {
  if (states.length === 1) return { answer: [...states[0]] };
  const weighing = suggestWeighing(coins, states, budget);
  if (!weighing) return null;
  const partitions = splitStates(states, weighing.left, weighing.right), branches = {};
  for (const outcome of OUTCOMES) {
    if (!partitions[outcome].length) continue;
    const child = buildStrategy(coins, partitions[outcome], budget - 1);
    if (!child) return null;
    branches[outcome] = child;
  }
  return { ...weighing, branches };
}

// Validate an internal catalogue witness against every possible counterfeit.
export function checkStrategy(puzzle, tree) {
  const states = remainingStates(puzzle), failures = [], leaves = [];
  let covered = 0, visited = 0;
  function visit(node, possibilities, budget, path) {
    if (!possibilities.length) return;
    visited++;
    if (visited > 200 || !node || typeof node !== 'object') {
      failures.push({ path, reason: 'Add a weighing or a conclusion here.', states: possibilities }); return;
    }
    if (Array.isArray(node.answer)) {
      if (possibilities.length === 1 && stateKey(possibilities[0]) === stateKey(node.answer)) {
        covered++; leaves.push({ path, answer: possibilities[0] });
      } else failures.push({ path, reason: possibilities.length > 1 ? 'This conclusion still has several possible answers.' : 'This conclusion names the wrong coin or weight.', states: possibilities });
      return;
    }
    if (budget <= 0) { failures.push({ path, reason: 'No weighings remain on this branch.', states: possibilities }); return; }
    if (!validWeighing(puzzle.coins, node.left, node.right)) {
      failures.push({ path, reason: 'Put equal, nonzero numbers of different coins on the pans.', states: possibilities }); return;
    }
    const branches = splitStates(possibilities, node.left, node.right);
    for (const outcome of OUTCOMES) if (branches[outcome].length) visit(node.branches?.[outcome], branches[outcome], budget - 1, [...path, outcome]);
  }
  visit(tree, states, puzzle.limit, []);
  return { ok: states.length > 0 && !failures.length, covered, total: states.length, failures, leaves };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { initialStates, validWeighing, weigh, splitStates, remainingStates, canSolve, suggestWeighing, buildStrategy, checkStrategy, minimumWeighings, opponentReply } from '../assets/js/lib/odd-coin-math.mjs';
import { oddCoinPuzzle } from '../assets/js/lib/odd-coin-book.mjs';
import { ODD_COIN_CATALOGUE } from '../assets/js/lib/odd-coin-catalogue.mjs';

const plain = (coins, limit, kind = 'unknown', genuine = []) => ({ coins, limit, kind, genuine, evidence: [] });

test('weighings model all three outcomes and reject invalid pans', () => {
  assert.equal(weigh([1, 1], [1], [2]), 1);
  assert.equal(weigh([1, -1], [1], [2]), -1);
  assert.equal(weigh([3, -1], [1], [2]), 0);
  for (const [left, right] of [[[], []], [[1], []], [[1], [1]], [[0], [1]], [[1.5], [2]], [[4], [1]]]) assert.equal(validWeighing(3, left, right), false);
  assert.equal(validWeighing(3, [1], [2]), true);
});

test('classic limits respect both information and physically balanced pans', () => {
  for (const [coins, limit, kind, expected, genuine] of [
    [3, 1, 'heavy', true], [9, 2, 'light', true], [10, 2, 'heavy', false], [27, 3, 'heavy', true],
    [3, 1, 'unknown', false], [3, 2, 'unknown', true], [12, 3, 'unknown', true],
    [13, 3, 'unknown', false], [14, 3, 'unknown', true, [14]], [39, 4, 'unknown', true], [40, 4, 'unknown', false],
  ]) {
    const puzzle = plain(coins, limit, kind, genuine);
    assert.equal(canSolve(coins, initialStates(puzzle), limit), expected, `${coins} coins in ${limit}`);
  }
});

test('count-based solver agrees with an independent labelled search for every small state set', () => {
  // Enumerate physical placements directly, without using the production grouping rules.
  for (let coins = 2; coins <= 5; coins++) {
    const placements = [], all = initialStates(plain(coins, 2));
    for (let assignment = 0; assignment < 3 ** coins; assignment++) {
      let code = assignment; const left = [], right = [];
      for (let coin = 1; coin <= coins; coin++) { const digit = code % 3; code = Math.floor(code / 3); if (digit === 1) left.push(coin); if (digit === 2) right.push(coin); }
      if (left.length && left.length === right.length) placements.push({ left, right });
    }
    const cache = new Map();
    function brute(states, budget) {
      if (states.length === 1) return true;
      if (!budget || states.length > 3 ** budget) return false;
      const key = `${states.map(state => state.join(':')).join(',')}/${budget}`;
      if (cache.has(key)) return cache.get(key);
      const answer = placements.some(({ left, right }) => Object.values(splitStates(states, left, right)).every(branch => !branch.length || brute(branch, budget - 1)));
      cache.set(key, answer); return answer;
    }
    for (let mask = 1; mask < 2 ** all.length; mask++) {
      const states = all.filter((_, i) => mask & (1 << i));
      for (const budget of [1, 2]) assert.equal(canSolve(coins, states, budget), brute(states, budget), `coins=${coins}, states=${mask}, budget=${budget}`);
    }
  }
});

test('all 1,000 stable cases have truthful evidence and an exhaustively valid strategy', () => {
  assert.deepEqual(ODD_COIN_CATALOGUE.map(level => level.length), [250, 250, 250, 250]);
  const kinds = new Set(), sizes = new Set(); let continuations = 0, references = 0, worlds = 0;
  for (let difficulty = 0; difficulty < 4; difficulty++) {
    const signatures = new Set();
    for (let number = 1; number <= 250; number++) {
      const puzzle = oddCoinPuzzle(difficulty, number), states = remainingStates(puzzle);
      kinds.add(puzzle.kind); sizes.add(puzzle.coins); continuations += !!puzzle.evidence.length; references += !!puzzle.genuine.length;
      assert.ok(states.length >= 2);
      assert.equal('secret' in puzzle, false);
      for (const entry of puzzle.evidence) {
        assert.ok(validWeighing(puzzle.coins, entry.left, entry.right));
        assert.ok(states.every(state => weigh(state, entry.left, entry.right) === entry.outcome));
      }
      const result = checkStrategy(puzzle, buildStrategy(puzzle.coins, states, puzzle.limit));
      assert.equal(result.ok, true, `${difficulty}:${number}`);
      assert.equal(canSolve(puzzle.coins, states, puzzle.limit - 1), false, 'allowances are the minimum needed to guarantee success');
      assert.equal(result.covered, states.length); worlds += result.covered;
      const signature = JSON.stringify([puzzle.coins, puzzle.kind, puzzle.genuine, puzzle.evidence]);
      assert.equal(signatures.has(signature), false); signatures.add(signature);
      if (difficulty === 0) assert.ok(puzzle.limit <= 2);
      else if (difficulty < 3) assert.ok(puzzle.limit <= 3);
    }
  }
  assert.equal(kinds.size, 3); assert.ok(sizes.size >= 30); assert.ok(continuations > 400); assert.ok(references > 400); assert.ok(worlds > 10000);
});

test('strategy checker reports missing, wrong, ambiguous, invalid, and over-budget branches', () => {
  const puzzle = plain(3, 1, 'heavy');
  const tree = buildStrategy(3, initialStates(puzzle), 1);
  assert.equal(checkStrategy(puzzle, tree).ok, true);
  const missing = structuredClone(tree); delete missing.branches[0];
  assert.deepEqual(checkStrategy(puzzle, missing).failures[0].path, [0]);
  const wrong = structuredClone(tree); wrong.branches[0].answer[1] = -1;
  assert.match(checkStrategy(puzzle, wrong).failures[0].reason, /wrong/);
  assert.match(checkStrategy(puzzle, { answer: [1, 1] }).failures[0].reason, /several/);
  assert.match(checkStrategy(puzzle, { left: [1], right: [1] }).failures[0].reason, /different/);
  const tooLong = structuredClone(tree); tooLong.branches[0] = { left: [1], right: [2], branches: {} };
  assert.match(checkStrategy(puzzle, tooLong).failures[0].reason, /No weighings/);
  assert.equal(suggestWeighing(3, [[1, 1]], 1), null);
});

test('the computer matches independent minimax play for every small state set and legal comparison', () => {
  for (let coins = 2; coins <= 4; coins++) {
    const placements = [], all = initialStates(plain(coins, 3));
    for (let assignment = 0; assignment < 3 ** coins; assignment++) {
      let code = assignment; const left = [], right = [];
      for (let coin = 1; coin <= coins; coin++) { const digit = code % 3; code = Math.floor(code / 3); if (digit === 1) left.push(coin); if (digit === 2) right.push(coin); }
      if (left.length && left.length === right.length) placements.push({ left, right });
    }
    const cache = new Map();
    function cost(states) {
      if (states.length === 1) return 0;
      const key = JSON.stringify(states);
      if (cache.has(key)) return cache.get(key);
      let best = Infinity;
      for (const { left, right } of placements) {
        const branches = Object.values(splitStates(states, left, right)).filter(branch => branch.length);
        if (branches.some(branch => branch.length === states.length)) continue;
        best = Math.min(best, 1 + Math.max(...branches.map(cost)));
      }
      cache.set(key, best); return best;
    }
    for (let mask = 1; mask < 2 ** all.length; mask++) {
      const states = all.filter((_, i) => mask & (1 << i));
      assert.equal(minimumWeighings(coins, states), cost(states));
      for (const { left, right } of placements) {
        const branches = Object.values(splitStates(states, left, right)).filter(branch => branch.length);
        const reply = opponentReply(coins, states, left, right), hardest = Math.max(...branches.map(cost));
        assert.equal(cost(reply.states), hardest);
        assert.equal(reply.states.length, Math.max(...branches.filter(branch => cost(branch) === hardest).map(branch => branch.length)));
        if (branches.some(branch => branch.length > 1)) assert.ok(reply.states.length > 1, 'never concede if an ambiguous outcome remains');
      }
    }
  }
  const twentySeven = plain(27, 3, 'heavy');
  assert.equal(minimumWeighings(27, initialStates(twentySeven)), 3, 'integer powers do not suffer logarithm rounding');
});

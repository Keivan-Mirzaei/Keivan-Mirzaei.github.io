// Regenerate only for an intentional catalogue change: numbers identify saved games.
import { writeFileSync } from 'node:fs';
import { initialStates, remainingStates, canSolve, suggestWeighing, splitStates, buildStrategy, checkStrategy, weigh } from '../assets/js/lib/odd-coin-math.mjs';

let seed = 20261015;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const integer = (low, high) => low + Math.floor(random() * (high - low + 1));
const choose = values => values[integer(0, values.length - 1)];
function shuffled(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) { const j = integer(0, i); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
const plain = (suspects, kind, references = 0) => ({ coins: suspects + references, kind, genuine: Array.from({ length: references }, (_, i) => suspects + i + 1), evidence: [], limit: 1 });
function minimum(puzzle) {
  const states = initialStates(puzzle);
  for (let budget = 1; budget <= 4; budget++) if (canSolve(puzzle.coins, states, budget)) return budget;
  throw new Error('Unsolvable seed');
}
function addEvidence(puzzle) {
  const states = remainingStates(puzzle), budget = puzzle.limit - 1;
  let weighing, options;
  for (let attempt = 0; attempt < 100; attempt++) {
    const order = shuffled(Array.from({ length: puzzle.coins }, (_, i) => i + 1));
    const count = integer(1, Math.floor(puzzle.coins / 2));
    weighing = { left: order.slice(0, count).sort((a, b) => a - b), right: order.slice(count, 2 * count).sort((a, b) => a - b) };
    const branches = splitStates(states, weighing.left, weighing.right);
    options = [-1, 0, 1].filter(outcome => branches[outcome].length >= 2 && branches[outcome].length < states.length && canSolve(puzzle.coins, branches[outcome], budget));
    if (options.length) break;
  }
  if (!options?.length) {
    weighing = suggestWeighing(puzzle.coins, states, puzzle.limit);
    if (!weighing) return false;
    const branches = splitStates(states, weighing.left, weighing.right);
    options = [-1, 0, 1].filter(outcome => branches[outcome].length >= 2 && canSolve(puzzle.coins, branches[outcome], budget));
  }
  if (!options.length) return false;
  puzzle.evidence.push({ ...weighing, outcome: choose(options) }); puzzle.limit--; return true;
}
function label(puzzle, permute = true) {
  const order = permute ? shuffled(Array.from({ length: puzzle.coins }, (_, i) => i + 1)) : Array.from({ length: puzzle.coins }, (_, i) => i + 1);
  const map = values => values.map(coin => order[coin - 1]).sort((a, b) => a - b);
  puzzle.genuine = map(puzzle.genuine);
  puzzle.evidence = puzzle.evidence.map(entry => ({ left: map(entry.left), right: map(entry.right), outcome: entry.outcome }));
  // A generation-time witness checks the evidence; it is never saved or used
  // as a hidden coin. Keep this draw to preserve the existing puzzle numbers.
  puzzle.witness = choose(remainingStates(puzzle));
  return puzzle;
}
const introductions = [
  [[3, 'heavy'], [3, 'light'], [4, 'heavy'], [5, 'light'], [6, 'heavy'], [7, 'light'], [8, 'heavy'], [9, 'heavy']],
  [[3, 'unknown'], [4, 'unknown', 1], [5, 'unknown'], [6, 'unknown'], [9, 'unknown'], [10, 'unknown'], [11, 'unknown'], [12, 'unknown']],
  [[10, 'heavy'], [12, 'light'], [15, 'heavy'], [18, 'light'], [21, 'heavy'], [24, 'light'], [27, 'heavy']],
  [[13, 'unknown'], [18, 'unknown'], [24, 'unknown'], [27, 'unknown'], [30, 'unknown'], [36, 'unknown'], [39, 'unknown']],
];
const catalogue = introductions.map((entries, difficulty) => {
  const records = [], seen = new Set();
  function append(puzzle) {
    const states = remainingStates(puzzle), plan = buildStrategy(puzzle.coins, states, puzzle.limit);
    if (!checkStrategy(puzzle, plan).ok) throw new Error('Catalogue case failed exhaustive verification');
    if (puzzle.evidence.some(entry => weigh(puzzle.witness, entry.left, entry.right) !== entry.outcome)) throw new Error('Contradictory evidence');
    const signature = JSON.stringify([puzzle.coins, puzzle.kind, puzzle.genuine, puzzle.evidence]);
    if (seen.has(signature)) return;
    seen.add(signature);
    records.push([puzzle.coins, puzzle.kind === 'heavy' ? 1 : puzzle.kind === 'light' ? -1 : 0, puzzle.genuine,
      puzzle.evidence.map(entry => [entry.left, entry.right, entry.outcome]), puzzle.limit]);
  }
  for (const entry of entries) { const puzzle = plain(...entry); puzzle.limit = minimum(puzzle); append(label(puzzle, false)); }
  let attempts = 0;
  while (records.length < 250) {
    if (++attempts > 10000) throw new Error('Not enough distinct practice cases');
    let puzzle, evidence = 0;
    if (difficulty === 0) {
      puzzle = plain(integer(3, 12), choose(['heavy', 'light']), integer(0, 2));
      puzzle.limit = minimum(puzzle);
      evidence = puzzle.limit > 2 ? 1 : random() < .3 && puzzle.coins > 5 ? 1 : 0;
    } else if (difficulty === 1) {
      puzzle = plain(integer(3, 15), 'unknown', integer(0, 2)); puzzle.limit = minimum(puzzle);
      evidence = puzzle.limit > 3 ? 1 : random() < .55 ? 1 : 0;
    } else if (difficulty === 2) {
      puzzle = plain(integer(10, 27), choose(['heavy', 'light', 'unknown']), integer(0, 2)); puzzle.limit = minimum(puzzle);
      evidence = puzzle.kind === 'unknown' ? 1 : random() < .45 ? 1 : 0;
    } else {
      const count = integer(13, 39);
      puzzle = plain(count, 'unknown', integer(0, Math.min(2, 39 - count))); puzzle.limit = minimum(puzzle);
      evidence = random() < .55 ? integer(1, 2) : 0;
    }
    for (let i = 0; i < evidence; i++) if (!addEvidence(puzzle)) break;
    const states = remainingStates(puzzle);
    while (puzzle.limit > 1 && canSolve(puzzle.coins, states, puzzle.limit - 1)) puzzle.limit--;
    const floor = difficulty === 0 ? 2 : difficulty === 1 ? 4 : difficulty === 2 ? 8 : puzzle.limit === 2 ? 7 : 18;
    if (states.length < floor || (difficulty > 0 && puzzle.limit < 2) || (difficulty < 3 && puzzle.limit > (difficulty === 0 ? 2 : 3))) continue;
    append(label(puzzle));
  }
  return records;
});
const output = '// Generated by scripts/odd_coin_catalogue.mjs. Stable puzzle numbers; version 1.\n'
  + '// [coins, weight clue (0 unknown), genuine coins, prior weighings, budget] — no hidden coin\n'
  + 'export const ODD_COIN_CATALOGUE = [\n' + catalogue.map(records => '  [\n' + records.map(record => `    ${JSON.stringify(record)}`).join(',\n') + '\n  ]').join(',\n') + '\n];\n';
writeFileSync(new URL('../assets/js/lib/odd-coin-catalogue.mjs', import.meta.url), output);
console.log(`Verified and saved ${catalogue.reduce((sum, records) => sum + records.length, 0)} cases, including every heavy/light possibility.`);

import test from 'node:test';
import assert from 'node:assert/strict';
import { BOARDS, makeGraph, vertices, countBits, parity, pressEffect, solvePresses, samplePuzzle, complementProof } from '../assets/js/lib/lights-out-math.mjs';

test('every simple graph through five vertices agrees with exhaustive press enumeration', () => {
  for (let size = 1; size <= 5; size++) {
    const possibleEdges = [];
    for (let a = 0; a < size; a++) for (let b = a + 1; b < size; b++) possibleEdges.push([a, b]);
    for (let edgeMask = 0; edgeMask < 2 ** possibleEdges.length; edgeMask++) {
      const graph = makeGraph(size, possibleEdges.filter((_, i) => edgeMask & (1 << i)));
      const expected = Array.from({ length: 2 ** size }, () => []);
      for (let presses = 0; presses <= graph.all; presses++) expected[pressEffect(graph, presses)].push(presses);
      // This separately verifies the paper's construction, not only the solver.
      assert.equal(pressEffect(graph, complementProof(graph).presses), graph.all);
      for (let difference = 0; difference <= graph.all; difference++) {
        const result = solvePresses(graph, difference);
        const ordered = expected[difference].sort((a, b) => countBits(a) - countBits(b) || a - b);
        assert.deepEqual(result.solutions, ordered);
        if (ordered.length) {
          assert.ok(result.solutions.every(mask => parity(mask) === parity(ordered[0])));
          assert.ok(result.basis.every(mask => pressEffect(graph, mask) === 0 && parity(mask) === 0));
          assert.equal(result.solutions.length, 2 ** (size - result.rank));
        } else {
          // A witness is orthogonal to every press but not to this target.
          assert.equal(parity(result.witness & difference), 1);
          for (let i = 0; i < size; i++) assert.equal(parity(result.witness & pressEffect(graph, 1 << i)), 0);
        }
      }
    }
  }
});

test('built-in boards: random playable patterns, complement targets, and minimum plans', () => {
  let seed = 105;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };
  for (const graph of Object.values(BOARDS)) {
    assert.equal(graph.positions.length, graph.size);
    const complement = solvePresses(graph, graph.all);
    assert.ok(complement.solutions.length);
    for (let trial = 0; trial < 30; trial++) {
      const start = samplePuzzle(graph, random);
      assert.notEqual(start, 0);
      const result = solvePresses(graph, start);
      assert.ok(result.solutions.length);
      for (const mask of result.solutions) assert.equal(start ^ pressEffect(graph, mask), 0);
      for (const mask of complement.solutions) assert.equal(start ^ pressEffect(graph, mask), start ^ graph.all);
      assert.ok(result.solutions.every(mask => countBits(mask) >= countBits(result.solutions[0])));
    }
  }
  assert.equal(solvePresses(BOARDS['grid-4'], 0).solutions.length, 16);
  assert.equal(solvePresses(BOARDS['grid-5'], 0).solutions.length, 4);
});

test('impossible board becomes reachable by changing the goal to complement', () => {
  const graph = BOARDS.pair;
  assert.equal(solvePresses(graph, 1).solutions.length, 0);
  assert.deepEqual(solvePresses(graph, graph.all).solutions, [1, 2]);
  assert.equal(pressEffect(graph, 3), 0);
});

test('induction demonstration includes both branches and the exact correction', () => {
  const path = complementProof(BOARDS['path-4']);
  assert.equal(path.branch, 'pairs');
  assert.deepEqual(path.oddVertices, [0, 3]);
  assert.equal(pressEffect(BOARDS['path-4'], path.correction), 9);
  assert.equal(path.presses, 9);
  assert.equal(complementProof(BOARDS.triangle).branch, 'lift');
  for (const name of ['path-4', 'triangle', 'star-5', 'pair']) {
    const graph = BOARDS[name], proof = complementProof(graph);
    for (const trial of proof.candidates) {
      const remaining = graph.all ^ (1 << trial.omitted);
      assert.equal(trial.presses & (1 << trial.omitted), 0);
      assert.equal(trial.effect & remaining, remaining);
    }
    assert.equal(pressEffect(graph, proof.presses), graph.all);
  }
});

test('static starting board and keyboard cell order match the actual moves', () => {
  const graph = BOARDS['grid-3'];
  assert.deepEqual(vertices(pressEffect(graph, 21), graph.size), [0, 1, 2, 4, 7]);
  assert.equal(countBits(solvePresses(graph, pressEffect(graph, 21)).solutions[0]), 3);
});

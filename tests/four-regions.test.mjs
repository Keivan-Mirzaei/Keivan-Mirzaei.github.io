import test from 'node:test';
import assert from 'node:assert/strict';
import { initialPose, makePointSet, classify, keepCrossing, lineDelta, boundedMotion, clipHalfPlane } from '../assets/js/lib/four-equal-regions.mjs';
import { createFourRegionsWorkspace, REGIONS_HISTORY_LIMIT } from '../assets/js/lib/four-regions-workspace.mjs';

test('every supported point count produces deterministic, spaced, unsolved sets with an exact equal partition', () => {
  for (let n = 1; n <= 12; n++) for (const seed of [0, 1, 71084239, 0xffffffff]) {
    const set = makePointSet(seed, n), result = classify(set.points, set.solution.pose);
    assert.equal(set.points.length, 4 * n); assert.equal(result.boundary, 0);
    assert.deepEqual(result.counts, [n, n, n, n]); assert.ok(set.solution.margin > .001);
    assert.deepEqual(makePointSet(seed, n), set);
    assert.equal(classify(set.points, initialPose()).counts.every(count => count === n), false);
    for (let i = 0; i < set.points.length; i++) {
      const p = set.points[i]; assert.ok(Math.abs(p.x) <= .86 && Math.abs(p.y) <= .53);
      for (const q of set.points.slice(i + 1)) assert.ok(Math.hypot(p.x - q.x, p.y - q.y) > .075);
    }
  }
});

test('classification counts line points separately and is invariant under rotating the whole geometry', () => {
  const points = [{ x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: 1, y: 1 }];
  const pose = { x: 0, y: 0, a: 0, b: Math.PI / 2 };
  assert.deepEqual(classify(points, pose).counts, [1, 1, 1, 1]);
  const boundary = classify([{ x: 0, y: 0 }, ...points.slice(1)], pose);
  assert.equal(boundary.boundary, 1); assert.equal(boundary.counts.reduce((a, b) => a + b), 3);
  const angle = .738, rotate = p => ({ x: p.x * Math.cos(angle) - p.y * Math.sin(angle), y: p.x * Math.sin(angle) + p.y * Math.cos(angle) });
  const set = makePointSet(731, 12), solved = set.solution.pose;
  assert.deepEqual(classify(set.points.map(rotate), { ...rotate(solved), a: solved.a + angle, b: solved.b + angle }), classify(set.points, solved));
});

test('independent lines remain separated, movement stays bounded, and clipped regions cover the field', () => {
  for (const angle of [-9, -.01, 0, .01, 9]) assert.ok(Math.abs(lineDelta(keepCrossing(angle, 0, .8))) >= Math.PI / 15 - 1e-9);
  const moved = boundedMotion(initialPose(), 900, -900); assert.ok(Math.abs(moved.x) <= .78 && Math.abs(moved.y) <= .45);
  const square = [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }];
  const area = polygon => Math.abs(polygon.reduce((sum, p, i) => { const q = polygon[(i + 1) % polygon.length]; return sum + p.x * q.y - q.x * p.y; }, 0)) / 2;
  const left = clipHalfPlane(square, { x: 1, y: 0 }, .3, -1), right = clipHalfPlane(square, { x: 1, y: 0 }, .3, 1);
  assert.ok(Math.abs(area(left) + area(right) - 4) < 1e-12);
});

test('many preview frames form one action and completion is removed and restored by Undo/Redo', () => {
  const play = createFourRegionsWorkspace(), before = play.capture();
  for (let i = 1; i <= 40; i++) play.previewPose({ ...before.pose, x: before.pose.x + i * .001 });
  play.previewPose(play.solution); play.commit(before); assert.equal(play.solved, true);
  assert.equal(play.exportState().actions.past.length, 1);
  play.undo(); assert.deepEqual(play.capture(), before); assert.equal(play.solved, false);
  play.redo(); assert.equal(play.solved, true);
  const cancelling = play.capture(); play.previewPose(initialPose()); play.cancel(cancelling); assert.equal(play.solved, true);
});

test('Shuffle, Reset and mode changes preserve settings, reverse exactly, and survive saving', () => {
  let play = createFourRegionsWorkspace(); play.setPerpendicular(false);
  const before = play.capture(), points = play.points; play.shuffle(); const shuffled = play.capture();
  assert.equal(play.perpendicular, false); assert.notDeepEqual(play.points, points);
  play = createFourRegionsWorkspace(play.exportState()); play.undo(); assert.deepEqual(play.capture(), before);
  play.redo(); assert.deepEqual(play.capture(), shuffled);
  const edit = play.capture(); play.previewPose({ ...play.pose, x: .3 }); play.commit(edit);
  const moved = play.capture(); play.reset(); assert.equal(play.perpendicular, false);
  play.undo(); assert.deepEqual(play.capture(), moved); play.redo(); assert.deepEqual(play.pose, initialPose());
  play.setPerpendicular(true); play.undo(); assert.equal(play.perpendicular, false);
});

test('each n resumes its point set and Reset progress clears only that n, including its old histories', () => {
  const play = createFourRegionsWorkspace(), before = play.capture(); play.previewPose(play.solution); play.commit(before);
  const six = play.capture(); play.changeN(3); play.shuffle(); const three = play.capture();
  play.changeN(6); assert.deepEqual(play.capture(), six); assert.equal(play.solved, true);
  const saved = play.exportState(); play.resetProgress(); assert.equal(play.n, 6); assert.equal(play.solved, false);
  const cleared = play.exportState(); assert.deepEqual(cleared.sessions[3], saved.sessions[3]);
  for (const name of ['past', 'future']) assert.ok(cleared.actions[name].every(entry => entry.n !== 6));
  const restored = createFourRegionsWorkspace(cleared); restored.changeN(3); assert.deepEqual(restored.capture(), three);
  restored.changeN(6); assert.equal(restored.solved, false);
});

test('corrupt saves are ignored, no-op edits preserve Redo, and history is bounded', () => {
  const play = createFourRegionsWorkspace(); play.shuffle(); play.undo();
  assert.equal(play.commit(play.capture()), false); assert.equal(play.canRedo, true);
  assert.equal(play.previewPose({ ...play.pose, x: 100 }), false);
  assert.equal(play.changeN(13), false);
  for (let i = 0; i < REGIONS_HISTORY_LIMIT + 10; i++) play.shuffle();
  const saved = play.exportState(); assert.equal(saved.actions.past.length, REGIONS_HISTORY_LIMIT);
  saved.actions.past.push({ n: 999 }); saved.sessions[6].pose.x = Infinity;
  const restored = createFourRegionsWorkspace(saved); assert.equal(restored.canUndo, false); assert.deepEqual(restored.pose, initialPose());
});

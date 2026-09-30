import test from 'node:test';
import assert from 'node:assert/strict';
import { sphereSlice, moveCamera } from '../assets/js/lib/graph-math.mjs';

test('sphere cross-sections distinguish circles, tangency, and no intersection', () => {
  assert.deepEqual(sphereSlice(0), { kind: 'circle', radius: 1 });
  assert.equal(sphereSlice(0.6).radius, 0.8);
  assert.deepEqual(sphereSlice(-0.6), sphereSlice(0.6));
  for (const height of [-1, 1]) assert.deepEqual(sphereSlice(height), { kind: 'point', radius: 0 });
  for (const height of [-1.2, 1.2]) assert.deepEqual(sphereSlice(height), { kind: 'empty', radius: 0 });
});

test('rotating a camera preserves its distance and is reversible', () => {
  const eye = { x: 3, y: 4, z: 2 };
  const turned = moveCamera(eye, 'left');
  assert.ok(Math.abs(Math.hypot(turned.x, turned.y, turned.z) - Math.sqrt(29)) < 1e-12);
  const restored = moveCamera(turned, 'right');
  for (const axis of ['x', 'y', 'z']) assert.ok(Math.abs(restored[axis] - eye[axis]) < 1e-12);
});

test('repeated zoom and tilt stay finite and within the permitted camera range', () => {
  let eye = { x: 3, y: 4, z: 2 };
  for (let i = 0; i < 100; i++) eye = moveCamera(moveCamera(eye, 'up', 2.3, 10), 'in', 2.3, 10);
  assert.ok(Math.hypot(eye.x, eye.y, eye.z) >= 2.3 - 1e-12);
  assert.ok(Object.values(eye).every(Number.isFinite));
  for (let i = 0; i < 100; i++) eye = moveCamera(eye, 'out', 2.3, 10);
  assert.ok(Math.hypot(eye.x, eye.y, eye.z) <= 10 + 1e-12);
});

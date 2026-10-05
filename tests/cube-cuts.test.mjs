import test from 'node:test';
import assert from 'node:assert/strict';
import { CUTS, cutState, unitCubes } from '../assets/js/lib/cube-cuts.mjs';

test('the construction creates 27 pieces in six cuts, each freeing one middle-cube face', () => {
  assert.deepEqual(Array.from({ length: 7 }, (_, step) => cutState(step).pieces), [1, 2, 3, 6, 9, 18, 27]);
  for (let step = 0; step <= 6; step++) {
    const cubes = unitCubes('centre', step);
    assert.equal(cubes.length, 7);
    assert.equal(cubes.filter(cube => cube.centre).length, 1);
    assert.equal(cubes.filter(cube => cube.disconnected).length, step);
    assert.equal(cutState(step).neighboursAttached, 6 - step);
    assert.equal(cutState(step).complete, step === 6);
  }
});

test('the six cut planes are distinct and no plane crosses any unit cube interior', () => {
  assert.equal(new Set(CUTS.map(cut => `${cut.axis}:${cut.sign}`)).size, 6);
  for (const cut of CUTS) for (const cube of unitCubes('whole')) {
    const coordinate = cube.cell[cut.axis];
    const plane = cut.sign / 2;
    assert.ok(plane <= coordinate - .5 || plane >= coordinate + .5);
  }
});

test('whole-cube gaps occur only along completed cuts and the view retains all 27 cubes', () => {
  for (let step = 0; step <= 6; step++) {
    const cubes = unitCubes('whole', step);
    assert.equal(cubes.length, 27);
    assert.equal(new Set(cubes.map(cube => cube.cell.join(','))).size, 27);
    for (const cube of cubes) for (let axis = 0; axis < 3; axis++) {
      const separated = CUTS.slice(0, step).some(cut => cut.axis === axis && cut.sign === cube.cell[axis]);
      assert.equal(cube.position[axis], cube.cell[axis] * (separated ? 1.3 : 1));
    }
  }
});

test('invalid steps and views cannot be rendered as plausible geometry', () => {
  for (const step of [-1, 7, .5, NaN]) assert.throws(() => cutState(step), RangeError);
  assert.throws(() => unitCubes('unknown'), RangeError);
});

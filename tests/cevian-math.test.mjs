import test from 'node:test';
import assert from 'node:assert/strict';
import { TRIANGLE_SHAPES, normalizeWeights, triangleArea, triangleData, weightedPoint, contactPoints, simplexRatio, barycentricPoint, pairBound } from '../assets/js/lib/cevian-math.mjs';

const close = (actual, expected, tolerance = 2e-12) => assert.ok(Math.abs(actual - expected) < tolerance, actual + ' ≠ ' + expected);

// Independently compute simplex volume from edge vectors, rather than the
// barycentric product used by the visualization.
function determinant(matrix) {
  const a = matrix.map(row => row.slice());
  let answer = 1;
  for (let i = 0; i < a.length; i += 1) {
    let pivot = i;
    for (let row = i + 1; row < a.length; row += 1) if (Math.abs(a[row][i]) > Math.abs(a[pivot][i])) pivot = row;
    if (Math.abs(a[pivot][i]) < 1e-16) return 0;
    if (pivot !== i) { [a[pivot], a[i]] = [a[i], a[pivot]]; answer *= -1; }
    answer *= a[i][i];
    for (let row = i + 1; row < a.length; row += 1) {
      const factor = a[row][i] / a[i][i];
      for (let column = i + 1; column < a.length; column += 1) a[row][column] -= factor * a[i][column];
    }
  }
  return answer;
}

function edgeDeterminant(vertices) {
  return Math.abs(determinant(vertices.slice(1).map(point => point.map((value, i) => value - vertices[0][i]))));
}

test('concurrent triangle contacts partition the area and satisfy Ceva', () => {
  const cases = [[1,1,1], [.5,.1875,.3125], [97,1,2], [2,91,7], [19,23,58]];
  for (const vertices of Object.values(TRIANGLE_SHAPES)) for (const weights of cases) {
    const data = triangleData(vertices, weights);
    const [alpha,beta,gamma] = data.fractions;
    close(data.sideRatios.reduce((product,value) => product * value, 1), 1);
    close(alpha*beta*gamma, (1-alpha)*(1-beta)*(1-gamma));
    close(data.ratio, 2*alpha*beta*gamma);
    close(data.ratio + data.corners.reduce((sum,area) => sum + area, 0), 1);
    close(data.ratio, simplexRatio(weights));
    const expectedCorners = [gamma*(1-beta),alpha*(1-gamma),beta*(1-alpha)];
    data.corners.forEach((area,i) => close(area, expectedCorners[i]));
  }
});

test('affine deformations preserve the area ratio and the centroid is the unique tested maximum', () => {
  const original = [[0,0],[1,0],[0,1]];
  const sheared = original.map(([x,y]) => [7*x + 3*y + 12, -2*x + 4*y - 8]);
  for (const weights of [[1,1,1],[1,2,3],[.001,.4,.599]]) {
    close(triangleData(original,weights).ratio, triangleData(sheared,weights).ratio);
  }
  close(triangleData(sheared,[1,1,1]).ratio,.25);
  for (let a=1; a<=12; a+=1) for (let b=1; b<=12; b+=1) {
    const value = simplexRatio([a,b,7]);
    assert.ok(value <= .25 + 1e-14);
    if (a !== 7 || b !== 7) assert.ok(value < .25);
  }
});

test('the volume product agrees with geometric determinants from dimensions two through seven', () => {
  for (let n=2; n<=7; n+=1) {
    const vertices = [Array(n).fill(0), ...Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(i===j)))];
    for (let sample=1; sample<=16; sample+=1) {
      const weights = Array.from({length:n+1},(_,i)=>1 + ((sample*19+i*13+i*i*7)%97));
      const inner = contactPoints(vertices,weights);
      close(edgeDeterminant(inner)/edgeDeterminant(vertices), simplexRatio(weights));
      assert.ok(simplexRatio(weights) <= 1/n**n + 1e-14);
      const o = weightedPoint(vertices,weights);
      const w = normalizeWeights(weights);
      inner.forEach((point,i) => point.forEach((coordinate,k) => close(w[i]*vertices[i][k]+(1-w[i])*coordinate,o[k])));
    }
    close(simplexRatio(Array(n+1).fill(1)),1/n**n);
  }
});

test('the position and inequality tools recover the intended geometry', () => {
  const vertices = TRIANGLE_SHAPES.slanted;
  const weights = [.2,.5,.3];
  barycentricPoint(weightedPoint(vertices,weights),vertices).forEach((value,i)=>close(value,weights[i]));
  for (const t of [.0001,.1,1,4,100]) {
    const bound = pairBound(t);
    close(bound.sum-bound.geometric,bound.gap);
    assert.ok(bound.sum >= bound.geometric);
  }
  assert.throws(()=>normalizeWeights([1,0,2]),RangeError);
  assert.throws(()=>normalizeWeights([1,Infinity,2]),RangeError);
  close(triangleArea([[0,0],[2,0],[0,3]]),3);
});

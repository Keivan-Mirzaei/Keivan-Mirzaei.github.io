import test from 'node:test';
import assert from 'node:assert/strict';
import { NODES, TORUS_ROUTES, PLANE_EIGHT, edgeId, nodeById, obstruction, segmentIntersection, surfacePoint, distance } from '../assets/js/lib/three-utilities-math.mjs';

test('the square contains every house–utility connection exactly once, without crossings or other junctions', () => {
  const expected = NODES.filter(n=>n.kind==='house').flatMap(h=>NODES.filter(n=>n.kind==='utility').map(u=>edgeId(h.id,u.id)));
  assert.deepEqual(TORUS_ROUTES.map(r=>r.id).sort(), expected.sort());
  assert.deepEqual(obstruction(TORUS_ROUTES), {intersections:[],throughNodes:[]});
  for (const route of TORUS_ROUTES) {
    assert.deepEqual(route.parts[0][0],nodeById(route.house).point);
    assert.deepEqual(route.parts.at(-1).at(-1),nodeById(route.utility).point);
    for (const part of route.parts) for (const point of part) assert.ok(point.every(c=>c>=0&&c<=1));
  }
});

test('the two split pipes join at exactly matching, distinct boundary points', () => {
  const wraps=TORUS_ROUTES.filter(r=>r.seam);
  assert.equal(wraps.length,2);
  const contacts=[];
  for (const route of wraps) {
    const a=route.parts[0].at(-1), b=route.parts[1][0];
    if (route.seam==='a') {assert.equal(a[0],b[0]);assert.deepEqual([a[1],b[1]],[0,1]);}
    else {assert.equal(a[1],b[1]);assert.deepEqual([a[0],b[0]],[1,0]);}
    const mappedA=surfacePoint(...a,1), mappedB=surfacePoint(...b,1);
    assert.ok(Math.hypot(...mappedA.map((v,i)=>v-mappedB[i]))<1e-12);
    contacts.push(a,b);
  }
  for (let i=0;i<contacts.length;i++) for (let j=i+1;j<contacts.length;j++) assert.ok(distance(contacts[i],contacts[j])>.05);
  // No other pipe touches a seam, so gluing cannot create another intersection.
  for (const route of TORUS_ROUTES.filter(r=>!r.seam)) for(const part of route.parts) for(const p of part) assert.ok(p.every(c=>c>0&&c<1));
});

test('the eight-pipe planar start is valid, but adding the missing straight pipe creates a crossing', () => {
  assert.equal(PLANE_EIGHT.length,8);
  assert.deepEqual(obstruction(PLANE_EIGHT),{intersections:[],throughNodes:[]});
  assert.ok(!PLANE_EIGHT.some(r=>r.id===edgeId('h3','gas')));
  const ninth={id:edgeId('h3','gas'),house:'h3',utility:'gas',parts:[[nodeById('h3').point,nodeById('gas').point]]};
  assert.ok(obstruction([...PLANE_EIGHT,ninth]).intersections.length>0);
});

test('route validation catches crossings, overlaps, self intersections, and unrelated vertices', () => {
  assert.deepEqual(segmentIntersection([0,0],[1,1],[0,1],[1,0]),{point:[.5,.5],overlap:false});
  assert.equal(segmentIntersection([0,0],[1,0],[.3,0],[.6,0]).overlap,true);
  assert.equal(segmentIntersection([0,0],[1,0],[0,.1],[1,.1]),null);
  const malformed={id:edgeId('h1','gas'),house:'h1',utility:'gas',parts:[[[.24,.25],[.8,.7],[.8,.2],[.2,.7],[.24,.76]]]};
  assert.ok(obstruction([malformed]).intersections.length>0);
  const through={id:edgeId('h1','power'),house:'h1',utility:'power',parts:[[[.24,.25],[.5,.25],[.76,.76]]]};
  assert.ok(obstruction([through]).throughNodes.some(hit=>hit.node==='h2'));
  assert.deepEqual(obstruction(TORUS_ROUTES.slice(0,5)),{intersections:[],throughNodes:[]});
});

test('surface deformation is finite and continuous at both cuts and finishes as a square', () => {
  for (let i=0;i<=10;i++) for(let j=0;j<=10;j++) {
    const u=i/10,v=j/10;
    for(let phase=1;phase<=3.001;phase+=.025) assert.ok(surfacePoint(u,v,phase).every(Number.isFinite));
    for(const boundary of [1,2,3]) {
      const a=surfacePoint(u,v,boundary-1e-7),b=surfacePoint(u,v,boundary+1e-7);
      assert.ok(Math.hypot(...a.map((x,k)=>x-b[k]))<1e-5);
    }
    const flat=surfacePoint(u,v,3),side=2*Math.PI*.48;
    assert.ok(Math.abs(flat[0]-side*(u-.5))<1e-12);
    assert.ok(Math.abs(flat[1]-side*(v-.5))<1e-12);
    assert.equal(flat[2],0);
  }
});

test('both torus seams close, and the first cut opens only the left/right seam', () => {
  const close=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]))<1e-12;
  for(let t=0;t<=1;t+=.05) {
    assert.ok(close(surfacePoint(0,t,1),surfacePoint(1,t,1)));
    assert.ok(close(surfacePoint(t,0,1),surfacePoint(t,1,1)));
    assert.ok(close(surfacePoint(t,0,2),surfacePoint(t,1,2)));
    assert.ok(!close(surfacePoint(0,t,2),surfacePoint(1,t,2)));
    assert.ok(!close(surfacePoint(t,0,3),surfacePoint(t,1,3)));
  }
});

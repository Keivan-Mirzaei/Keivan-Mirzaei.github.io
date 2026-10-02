import test from 'node:test';
import { mugDistance, mugMesh } from '../assets/js/lib/three-utilities-mug.mjs';
import assert from 'node:assert/strict';
import { NODES, TORUS_ROUTES, PLANE_EIGHT, edgeId, nodeById, obstruction, segmentIntersection, surfacePoint, distance, bezierPoint, smoothWaypoints, curveRoute, updateConnection, simplifyPath } from '../assets/js/lib/three-utilities-math.mjs';

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

test('the torus unfolding is finite and continuous at both cuts and finishes as a square', () => {
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

test('solution curves have matching tangents within each pipe and across the glued edges', () => {
  const tangent=(a,b)=>b.map((x,i)=>x-a[i]);
  const parallel=(a,b)=>Math.abs(a[0]*b[1]-a[1]*b[0])<1e-12&&a[0]*b[0]+a[1]*b[1]>0;
  for(const edge of [...TORUS_ROUTES,...PLANE_EIGHT])for(const part of edge.curves)for(let i=1;i<part.length;i++){
    const a=part[i-1],b=part[i];
    assert.deepEqual(a[3],b[0]);
    assert.ok(parallel(tangent(a[2],a[3]),tangent(b[0],b[1])));
  }
  for(const edge of TORUS_ROUTES.filter(r=>r.seam)){
    const a=edge.curves[0].at(-1),b=edge.curves[1][0];
    assert.ok(parallel(tangent(a[2],a[3]),tangent(b[0],b[1])));
  }
  // Check the actual cubic shapes at a denser sampling than the drawing validator.
  const dense=TORUS_ROUTES.map(edge=>({...edge,parts:edge.curves.map(part=>part.flatMap((c,i)=>Array.from({length:161},(_,j)=>bezierPoint(c,j/160)).slice(i?1:0)))}));
  assert.deepEqual(obstruction(dense),{intersections:[],throughNodes:[]});
});

test('chosen path points are interpolated by bounded, continuously tangent cubic curves', () => {
  const points=[[.24,.25],[.08,.42],[.12,.65],[.24,.76]],curves=smoothWaypoints(points);
  assert.equal(curves.length,3);
  curves.forEach((curve,i)=>{assert.deepEqual(bezierPoint(curve,0),points[i]);assert.deepEqual(bezierPoint(curve,1),points[i+1]);assert.ok(curve.flat().every(x=>x>=0&&x<=1));});
  for(let i=1;i<curves.length;i++)for(let k=0;k<2;k++)assert.ok(Math.abs((curves[i-1][3][k]-curves[i-1][2][k])-(curves[i][1][k]-curves[i][0][k]))<1e-12);
  assert.ok(simplifyPath([[0,0],[.01,.01],[.02,.02],[.5,.5],[1,1]]).length===2);
});

test('choosing an existing pair toggles deletion, while a new path replaces only that pair', () => {
  const first=TORUS_ROUTES[0],other=TORUS_ROUTES[1];
  const added=updateConnection([],first);
  assert.equal(added.action,'added');assert.deepEqual(added.routes,[first]);
  const removed=updateConnection([first,other],first);
  assert.equal(removed.action,'removed');assert.deepEqual(removed.routes,[other]);
  const changed=curveRoute('h1','gas',[smoothWaypoints([[.24,.25],[.08,.5],[.24,.76]])]);
  const replaced=updateConnection([first,other],changed,true);
  assert.equal(replaced.action,'replaced');assert.deepEqual(replaced.routes,[changed,other]);
  assert.deepEqual([first,other],[TORUS_ROUTES[0],TORUS_ROUTES[1]]);
});

test('the starting mug has a level rim, an open bowl, a solid bottom, and an open handle', () => {
  assert.ok(mugDistance(-.7,-.8,0)>0, 'the bowl contains air');
  assert.ok(mugDistance(-.7,.8,0)<0, 'ceramic closes the bottom');
  assert.ok(mugDistance(-.7,1.1,0)>0, 'air lies below the base');
  assert.ok(mugDistance(-1.35,0,0)<0, 'the upright wall contains ceramic');
  assert.ok(mugDistance(.6,0,0)<0, 'the handle contains ceramic');
  assert.ok(mugDistance(.25,0,0)>0, 'the handle hole is open');
  for(let i=0;i<32;i++){
    const angle=2*Math.PI*i/32;
    assert.ok(Math.abs(mugDistance(-.7+.65*Math.cos(angle),-.975,.65*Math.sin(angle)))<1e-10, 'the rim lies in a horizontal plane');
  }
});

test('the mug deformation has one closed, connected, genus-one boundary throughout', () => {
  for(let step=0;step<=20;step++){
    const phase=step/20,mesh=mugMesh(phase,52,false),edges=new Map(),parent=mesh.vertices.map((_,i)=>i);
    const root=i=>parent[i]===i?i:(parent[i]=root(parent[i]));
    for(const triangle of mesh.triangles)for(let k=0;k<3;k++){
      let a=triangle[k],b=triangle[(k+1)%3];parent[root(b)]=root(a);
      if(a>b)[a,b]=[b,a];const key=a*mesh.vertices.length+b;
      edges.set(key,(edges.get(key)||0)+1);
    }
    assert.equal(new Set(mesh.vertices.map((_,i)=>root(i))).size,1, `connected at phase ${phase}`);
    assert.ok([...edges.values()].every(n=>n===2), `closed at phase ${phase}`);
    assert.equal(mesh.vertices.length-edges.size+mesh.triangles.length,0, `one handle at phase ${phase}`);
  }
});

test('the mug field varies continuously and finishes on exactly the torus boundary', () => {
  for(let i=0;i<=16;i++)for(let j=0;j<=16;j++){
    const [x,y,z]=surfacePoint(i/16,j/16,1);
    assert.ok(Math.abs(mugDistance(x,-z,y,1))<1e-10);
  }
  for(const x of [-1.4,-.7,0,.7])for(const y of [-1,0,1])for(const z of [-.5,0,.5]){
    let previous=mugDistance(x,y,z,0);
    for(let step=1;step<=100;step++){
      const next=mugDistance(x,y,z,step/100);
      assert.ok(Number.isFinite(next));assert.ok(Math.abs(next-previous)<.09);previous=next;
    }
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

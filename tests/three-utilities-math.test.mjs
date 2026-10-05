import test from 'node:test';
import { mugPoint, surfaceMaterialMesh, surfaceNormal } from '../assets/js/lib/three-utilities-mug.mjs';
import assert from 'node:assert/strict';
import { NODES, TORUS_ROUTES, PLANE_EIGHT, edgeId, nodeById, obstruction, segmentIntersection, surfacePoint, distance, bezierPoint, smoothWaypoints, curveRoute, updateConnection, simplifyPath } from '../assets/js/lib/three-utilities-math.mjs';

// Use the renderer's actual adaptive triangles, welding only the duplicated UV
// seam vertices that it keeps separate for the later cuts.
const material=surfaceMaterialMesh(),coordinates=[],welded=new Map();
const materialIds=material.uvs.map(uv=>{
  const canonical=uv.map(x=>x===1?0:x),key=canonical.join(',');
  if(!welded.has(key)){welded.set(key,coordinates.length);coordinates.push(canonical);}
  return welded.get(key);
});
const materialTriangles=material.triangles.map(ids=>ids.map(i=>materialIds[i]));
const renderedMugMesh=phase=>({vertices:coordinates.map(([u,v])=>mugPoint(u,v,phase)),triangles:materialTriangles});

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

test('the starting mug has an open bowl with a solid bottom and an open handle', () => {
  const mesh=renderedMugMesh(0);
  const hits=(origin,direction)=>{
    const result=mesh.triangles.map(ids=>rayTriangle(origin,direction,ids.map(i=>mesh.vertices[i])))
      .filter(t=>t!==null&&t>=0).sort((a,b)=>a-b);
    return result.filter((t,i)=>!i||t-result[i-1]>1e-5).map(t=>origin.map((x,k)=>x+t*direction[k]));
  };
  const bowl=hits([-.7,-3,0],[0,1,0]),rim=hits([-.7,-3,.65],[0,1,0]);
  assert.equal(bowl.length,2,'the bowl floor and underside enclose ceramic');
  assert.ok(Math.abs(bowl[0][1]-.68)<.002,'the deep bowl has a flat floor');
  assert.ok(bowl[1][1]-bowl[0][1]>.2,'the bottom has positive thickness');
  assert.ok(Math.abs(rim[0][1]+.975)<.003,'the rim stands above the bowl');
  for(const angle of [.4,.8,1.2,1.6,2,2.4,2.8,3.2,3.6,4,4.4,4.8,5.2,5.6]){
    const c=Math.cos(angle),s=Math.sin(angle);
    const lip=hits([-.7+.65*c,-3,.65*s],[0,1,0]);
    assert.ok(Math.abs(lip[0][1]+.975)<.003,'the rolled rim is level all around');
    const wall=hits([-.7+2*c,0,2*s],[-c,0,-s]);
    assert.ok(Math.abs(Math.hypot(wall[0][0]+.7,wall[0][2])-.72)<.002,'the body is a round cylinder');
  }
  assert.equal(hits([.45,0,-2],[0,0,1]).length,0,'the handle hole passes all the way through');
});

test('the mug deformation has one closed, connected, genus-one boundary throughout', () => {
  assert.ok(material.uvs.length<65536,'the adaptive surface fits the renderer’s 16-bit indices');
  const topology=materialTriangles;
  for(let step=0;step<=20;step++){
    const phase=step/20,mesh=renderedMugMesh(phase),edges=new Map(),parent=mesh.vertices.map((_,i)=>i);
    assert.equal(mesh.triangles,topology,`the same material triangles move at phase ${phase}`);
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

test('the starting handle keeps a uniform round section through both attachments', () => {
  for(let step=0;step<=100;step++){
    const u=.5+step/200,points=[0,.25,.5,.75].map(v=>mugPoint(u,v,0));
    const radial=subtract(points[2],points[0]),depth=subtract(points[3],points[1]);
    const diameter=Math.hypot(...radial),thickness=Math.hypot(...depth);
    assert.ok(Math.abs(diameter-.26)<1e-10,'the loop does not swell or taper');
    assert.ok(Math.abs(thickness-.26)<1e-10,'the grip is equally thick through its depth');
    const centre=points[0].map((x,k)=>(x+points[2][k])/2);
    for(let i=0;i<32;i++){
      const offset=subtract(mugPoint(u,i/32,0),centre);
      const radius=Math.hypot(dot3(offset,radial)/diameter,dot3(offset,depth)/thickness);
      assert.ok(Math.abs(radius-.13)<.0002,'the round section stays uniform at the wall');
    }
  }
});

test('the same bowl points lift before rounding, and the mug finishes on exactly the torus', () => {
  const floorU=(Math.PI/3-.18)/(2*(Math.PI-.36));
  let previous=mugPoint(floorU,.5,0);
  for(let step=1;step<=36;step++){
    const next=mugPoint(floorU,.5,step/100);
    assert.ok(Math.abs(next[0]-previous[0])<1e-12);assert.ok(Math.abs(next[2]-previous[2])<1e-12);
    assert.ok(next[1]<previous[1],'the marked bowl floor rises, rather than disappearing');previous=next;
  }
  for(let i=0;i<=24;i++)for(let j=0;j<=24;j++){
    const u=i/24,v=j/24;
    const expected=surfacePoint(u,v,1),actual=mugPoint(u,v,1);
    assert.ok(Math.hypot(...actual.map((x,k)=>x-expected[k]))<1e-12,'there is no renderer handoff jump');
    for(let step=0;step<=100;step++){
      const phase=step/100,p=mugPoint(u,v,phase),next=mugPoint(u,v,phase+.00001);
      assert.ok(p.every(Number.isFinite));assert.ok(Math.hypot(...p.map((x,k)=>x-next[k]))<.0002);
      const n=surfaceNormal(mugPoint,u,v,phase);
      assert.ok(n.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...n)-1)<1e-10);
      for(const [a,b] of [[mugPoint(0,v,phase),mugPoint(1,v,phase)],[mugPoint(u,0,phase),mugPoint(u,1,phase)]])
        assert.ok(Math.hypot(...a.map((x,k)=>x-b[k]))<1e-12,'both seams stay joined before any cut');
    }
  }
});

// Independent triangle/ray geometry checks the rendered boundary rather than
// repeating the surface formula. Broad-phase cells bound the pair search.
const subtract=(a,b)=>a.map((x,k)=>x-b[k]);
const cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot3=(a,b)=>a.reduce((sum,x,k)=>sum+x*b[k],0);
function rayTriangle(origin,direction,[a,b,c]) {
  const e1=subtract(b,a),e2=subtract(c,a),h=cross3(direction,e2),det=dot3(e1,h);
  if(Math.abs(det)<1e-10)return null;
  const s=subtract(origin,a),u=dot3(s,h)/det;
  if(u< -1e-8||u>1+1e-8)return null;
  const q=cross3(s,e1),v=dot3(direction,q)/det;
  if(v< -1e-8||u+v>1+1e-8)return null;
  return dot3(e2,q)/det;
}
function selfIntersection(mesh){
  const cells=new Map(),ps=mesh.triangles.map(triangle=>triangle.map(i=>mesh.vertices[i])),bounds=[];
  for(let index=0;index<ps.length;index++){
    const min=[0,1,2].map(k=>Math.min(...ps[index].map(p=>p[k]))),max=[0,1,2].map(k=>Math.max(...ps[index].map(p=>p[k])));
    bounds.push({min,max});
    for(let x=Math.floor(min[0]/.06);x<=Math.floor(max[0]/.06);x++)for(let y=Math.floor(min[1]/.06);y<=Math.floor(max[1]/.06);y++)for(let z=Math.floor(min[2]/.06);z<=Math.floor(max[2]/.06);z++){
      const key=`${x},${y},${z}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(index);
    }
  }
  const checked=new Set();
  for(const ids of cells.values())for(let a=0;a<ids.length;a++)for(let b=a+1;b<ids.length;b++){
    const first=ids[a],second=ids[b],key=first*ps.length+second;if(checked.has(key))continue;checked.add(key);
    if(mesh.triangles[first].some(i=>mesh.triangles[second].includes(i)))continue;
    const A=bounds[first],B=bounds[second];
    if(A.min.some((x,k)=>x>B.max[k]+1e-9)||B.min.some((x,k)=>x>A.max[k]+1e-9))continue;
    for(const [s,t] of [[ps[first],ps[second]],[ps[second],ps[first]]])for(let i=0;i<3;i++){
      const hit=rayTriangle(s[i],subtract(s[(i+1)%3],s[i]),t);
      if(hit!==null&&hit>=-1e-8&&hit<=1+1e-8)return [first,second];
    }
  }
  return null;
}

test('the deformed surface does not intersect itself or collapse its triangles', () => {
  for(let step=0;step<=10;step++){
    const phase=step/10,mesh=renderedMugMesh(phase);
    assert.equal(selfIntersection(mesh),null,`no nonadjacent triangles intersect at phase ${phase}`);
    for(const ids of mesh.triangles){
      const [a,b,c]=ids.map(i=>mesh.vertices[i]);
      assert.ok(Math.hypot(...cross3(subtract(b,a),subtract(c,a)))>1e-9,`no pinching at phase ${phase}`);
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

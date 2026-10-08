import test from 'node:test';
import assert from 'node:assert/strict';
import { NORTH, GRAPH_VERTICES, GRAPH_EDGES, GRAPH_FACES, toSphere, toPlane, edgePoint, nearestGraphPoint, sampleEdge, faceAt, faceTriangles } from '../assets/js/lib/stereographic-math.mjs';
const close=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance, `${a} differs from ${b}`);

test('the origin maps to the south pole; radius two maps to the equator; N has no finite image',()=>{
  assert.deepEqual(toSphere([0,0]),[0,0,0]);
  assert.deepEqual(toSphere([2,0]),[1,0,1]);
  assert.deepEqual(toSphere([0,-2]),[0,-1,1]);
  assert.equal(toPlane(NORTH),null);
});
test('projection lies on the sphere and on NQ and has the correct inverse',()=>{
  for(let x=-9;x<=9;x+=.43) for(let y=-9;y<=9;y+=.79) {
    const p=toSphere([x,y]); close(p[0]**2+p[1]**2+(p[2]-1)**2,1);
    const t=(2-p[2])/2; close(p[0],t*x); close(p[1],t*y);
    const q=toPlane(p); close(q[0],x); close(q[1],y); assert.ok(p[2]<2);
  }
});
test('every direction of escape approaches the same pole without overflow',()=>{
  for(const direction of [[1,0],[0,-1],[.6,.8],[-.8,.6]]) {
    let gap=Infinity;
    for(const r of [1,3,10,100,1e6]) {
      const p=toSphere(direction.map(x=>x*r));
      const d=Math.hypot(p[0],p[1],p[2]-2); assert.ok(d<gap); gap=d;
    }
    assert.ok(gap<.00001);
  }
  assert.ok(toSphere([1e308,-1e308]).every(Number.isFinite));
});
test('the cube drawing has degree three, two faces per edge, and Euler characteristic two on the sphere',()=>{
  const key=(a,b)=>[a,b].sort((x,y)=>x-y).join(',');
  const edges=new Map(GRAPH_EDGES.map(([a,b])=>[key(a,b),0]));
  GRAPH_FACES.forEach(face=>face.forEach((a,i)=> {
    const k=key(a,face[(i+1)%face.length]); assert.ok(edges.has(k)); edges.set(k,edges.get(k)+1);
  }));
  assert.ok([...edges.values()].every(count=>count===2));
  GRAPH_VERTICES.forEach((_,i)=>assert.equal(GRAPH_EDGES.filter(edge=>edge.includes(i)).length,3));
  assert.equal(GRAPH_VERTICES.length-GRAPH_EDGES.length+GRAPH_FACES.length,2);
});
test('curved edge samples reverse to their original planar segments',()=>{
  GRAPH_EDGES.forEach((_,edge)=>sampleEdge(edge,40).forEach((p,i)=> {
    const q=toPlane(p), expected=edgePoint(edge,i/40);
    close(q[0],expected[0]); close(q[1],expected[1]); close(nearestGraphPoint(q).distance,0);
  }));
});
test('face classification includes the outside face in every direction',()=>{
  [[0,0],[0,-1],[1,0],[0,1],[-1,0],[4,4]].forEach((p,i)=>assert.equal(faceAt(p),i));
  for(const p of [[-100,0],[0,100],[0,-100],[100,0]]) assert.equal(faceAt(p),5);
});
test('face meshes stay on the sphere, invert into their own faces, and the outside face closes at N',()=>{
  for(let face=0;face<6;face++) {
    const mesh=faceTriangles(face,true,12);
    let northCount=0;
    for(let i=0;i<mesh.length;i+=3) {
      const p=mesh.slice(i,i+3); close(p[0]**2+p[1]**2+(p[2]-1)**2,1);
      const q=toPlane(p); if(q===null) northCount++;
    }
    for(let i=0;i<mesh.length;i+=9) {
      // A centroid of the inverse-projected vertices avoids shared boundaries.
      const q=[mesh.slice(i,i+3),mesh.slice(i+3,i+6),mesh.slice(i+6,i+9)].map(toPlane).filter(Boolean);
      const centre=[0,1].map(k=>q.reduce((sum,p)=>sum+p[k],0)/q.length);
      assert.equal(faceAt(centre),face);
    }
    assert.equal(northCount>0,face===5);
  }
});

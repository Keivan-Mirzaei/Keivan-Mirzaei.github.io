import test from 'node:test';
import assert from 'node:assert/strict';
import {sectionState,objective,constraint,objectiveGradient,constraintGradient,constraintPoint,objectiveContour,dot,MINIMUM_ANGLE,MAXIMUM_ANGLE,ascentAngle,crossEntropy} from '../assets/js/lib/lagrange-math.mjs';
import {surfaceProjection,liftedDirection,surfaceDiagram} from '../assets/js/lib/lagrange-surfaces.mjs';
const close=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);

test('elliptical constraint is feasible; normals and tangents are orthonormal throughout',()=>{
  for(let theta=0;theta<=360;theta+=3)for(const phi of [-180,-90,-35,0,28,90,180]) {
    const s=sectionState(theta,phi);close(constraint(...s.point),1);close(dot(s.direction,s.direction),1);
    close(dot(s.tangent,s.normal),0);close(dot(s.tangent,s.gradG),0);
    close(dot(s.gradF,s.direction),s.slopeF);close(dot(s.gradG,s.direction),s.slopeG);
  }
});

test('each gradient gives the largest upward directional derivative, including opposite descent',()=>{
  for(const theta of [0,35,90,180,221,270])for(const kind of ['f','g']) {
    const s=sectionState(theta),g=kind==='f'?s.gradF:s.gradG,norm=Math.hypot(...g);
    const angle=ascentAngle(s,kind),up=sectionState(theta,angle),down=sectionState(theta,angle>0?angle-180:angle+180);
    close(kind==='f'?up.slopeF:up.slopeG,norm);close(kind==='f'?down.slopeF:down.slopeG,-norm);
    for(let phi=-180;phi<=180;phi+=5)assert.ok(dot(g,sectionState(theta,phi).direction)<=norm+1e-12);
  }
});

test('analytic gradients and sections agree with independently computed difference quotients',()=>{
  const e=1e-5;
  for(const theta of [0,26,90,185,270])for(const phi of [-180,-90,-30,0,47,90,180]) {
    const s=sectionState(theta,phi);
    for(const [kind,fn,grad] of [['f',objective,objectiveGradient],['g',constraint,constraintGradient]]) {
      const value=t=>fn(...s.point.map((x,i)=>x+t*s.direction[i]));
      close((value(e)-value(-e))/(2*e),kind==='f'?s.slopeF:s.slopeG,3e-8);
      const [x,y]=s.point;close((fn(x+e,y)-fn(x-e,y))/(2*e),grad(x,y)[0],3e-8);
      close((fn(x,y+e)-fn(x,y-e))/(2*e),grad(x,y)[1],3e-8);
    }
    if(phi%180===0){assert.equal(s.slopeG,0);assert.ok(constraint(...s.point.map((x,i)=>x+.3*s.direction[i]))>1);}
  }
});

test('contours satisfy their actual levels and neither family is circular',()=>{
  for(const level of [.25,1,3,10])for(let angle=0;angle<360;angle+=3) {
    close(constraint(...constraintPoint(angle,level)),level);
    close(objective(...objectiveContour(angle,level)),level);
  }
  assert.notEqual(Math.hypot(...constraintPoint(0)),Math.hypot(...constraintPoint(90)));
  const a=objectiveContour(0,4),b=objectiveContour(90,4);
  assert.notEqual(Math.hypot(a[0]-2,a[1]),Math.hypot(b[0]-2,b[1]));
  close(Math.hypot(...constraintPoint(135,4))/Math.hypot(...constraintPoint(135,1)),2);
});

test('exact extrema solve the multiplier equations and give the full constrained range',()=>{
  for(const [angle,classification,point,multiplier,value] of [[MINIMUM_ANGLE,'minimum',[1,0],-1,1],[MAXIMUM_ANGLE,'maximum',[-1,0],3,9]]) {
    const s=sectionState(angle);assert.equal(s.stationary,classification);assert.deepEqual(s.point,point);
    assert.equal(s.value,value);assert.equal(s.multiplier,multiplier);assert.equal(s.tangentSlope,0);
    s.gradF.forEach((component,i)=>close(component,s.multiplier*s.gradG[i]));
    assert.equal(sectionState(angle+360).stationary,classification);
    assert.equal(sectionState(angle+1e-8).stationary,null);
    assert.notEqual(sectionState(angle+1e-8).slopeF,0);
  }
  for(let theta=0;theta<360;theta+=.5) {
    const s=sectionState(theta),[x,y]=s.point;
    close(s.value,6-4*x-x*x);
    close(s.value-1,(1-x)*(x+5));
    close(9-s.value,(x+1)*(x+3));
    assert.ok(s.value>=1&&s.value<=9);
  }
});

test('lifted 3D arrows encode actual directional derivatives with shared projection scales',()=>{
  const s=sectionState(90),point=[...s.point,s.value];
  const end=liftedDirection(point,s.gradF,s.direction,.4);close((end[2]-point[2])/.4,s.slopeF);
  const u=s.gradF.map(x=>x/s.normF);close((liftedDirection(point,s.gradF,u,.4)[2]-point[2])/.4,s.normF);
  const p=surfaceProjection(300,135,35),q=surfaceProjection(300,135,35);assert.deepEqual(p.map(point),q.map(point));
  assert.notDeepEqual(p.map(point),surfaceProjection(300,75,35).map(point));
  for(const kind of ['f','g'])for(const a of [-180,0,135,180])for(const e of [15,35,75]) {
    const svg=surfaceDiagram(s,kind,240,a,e,'test');assert.ok(!/NaN|Infinity|undefined/.test(svg));
    assert.ok(svg.includes(`test-surface-${kind}-gradient`));assert.ok(svg.includes('lm-height-contour'));
  }
});

test('cross entropy retains its minimum at the fixed law and diverges at the boundary',()=>{
  for(const q of [[.2,.8],[.6,.3,.1]]) {
    const h=crossEntropy(q,q);
    for(const weight of [.01,.2,.6,1]){const p=q.map(value=>(1-weight)*value+weight/q.length);assert.ok(crossEntropy(q,p)>h);}
    close(q.reduce((sum,value)=>sum-value*Math.log(value),0),h);
  }
  assert.equal(crossEntropy([.2,.8],[0,1]),Infinity);
});

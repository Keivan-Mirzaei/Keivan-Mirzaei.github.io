// Actual sampled height fields, orthographic 3D projection, and exact level curves.
// SVG keeps these small, rotatable teaching maps available without a GPU/library.
import { objective, constraint, objectiveGradient, constraintGradient, constraintPoint, objectiveContour, dot } from './lagrange-math.mjs';

export const SURFACE_RANGE=1.25;
export const HEIGHT_SCALE=.08;
const n=value=>Number(value.toFixed(3));
const sequence=(count,fn)=>Array.from({length:count+1},(_,i)=>fn(i/count));
const models={f:objective,g:constraint};
const cached=new Map();

export function surfaceProjection(width=300,azimuth=45,elevation=35) {
  const height=Math.max(280,Math.min(350,width*.95));
  const a=azimuth*Math.PI/180,e=elevation*Math.PI/180;
  const raw=([x,y,z])=>{const depth=-Math.sin(a)*x+Math.cos(a)*y;
    return [Math.cos(a)*x+Math.sin(a)*y,Math.sin(e)*depth-Math.cos(e)*HEIGHT_SCALE*z,-Math.cos(e)*depth+Math.sin(e)*HEIGHT_SCALE*z];};
  // Fit the same actual geometry in both maps rather than an oversized cuboid.
  const corners=[...mesh('f').flatMap(face=>face.points),...mesh('g').flatMap(face=>face.points),[-SURFACE_RANGE,-SURFACE_RANGE,32]].map(raw);
  const low=corners.reduce((p,c)=>[Math.min(p[0],c[0]),Math.min(p[1],c[1])],[Infinity,Infinity]);
  const high=corners.reduce((p,c)=>[Math.max(p[0],c[0]),Math.max(p[1],c[1])],[-Infinity,-Infinity]);
  const scale=Math.min((width-48)/(high[0]-low[0]),(height-56)/(high[1]-low[1]));
  const map=point=>{const p=raw(point);return [width/2+scale*(p[0]-(low[0]+high[0])/2),height/2+scale*(p[1]-(low[1]+high[1])/2),p[2]];};
  return {map,width,height,scale};
}

function mesh(kind) {
  if(cached.has(kind))return cached.get(kind);
  const count=22,step=2*SURFACE_RANGE/count,fn=models[kind],faces=[];
  for(let i=0;i<count;i++)for(let j=0;j<count;j++) {
    const x=-SURFACE_RANGE+i*step,y=-SURFACE_RANGE+j*step;
    const points=[[x,y],[x+step,y],[x+step,y+step],[x,y+step]].map(([u,v])=>[u,v,fn(u,v)]);
    const cx=x+step/2,cy=y+step/2,g=(kind==='f'?objectiveGradient:constraintGradient)(cx,cy);
    const light=[-.35,-.4,.846],norm=Math.hypot(g[0],g[1],1);
    const diffuse=Math.max(0,dot([-g[0],-g[1]],light.slice(0,2))/norm+light[2]/norm);
    faces.push({points,shade:.35+.4*diffuse});
  }
  cached.set(kind,faces);return faces;
}

function contourPoints(kind,level) {
  const key=`${kind}:${level}`;
  if(cached.has(key))return cached.get(key);
  const points=sequence(360,t=>{const xy=kind==='f'?objectiveContour(t*360,level):constraintPoint(t*360,level);return [...xy,level];});
  // Fixed contours are retained; a selected level changes on every point edit.
  if([.25,.5,1,2,3,4,6,8,10,15,20,25,30].includes(level))cached.set(key,points);
  return points;
}

export function liftedDirection(point,gradient,direction,length=.4) {
  return [point[0]+length*direction[0],point[1]+length*direction[1],point[2]+length*dot(gradient,direction)];
}

export function surfaceDiagram(state,kind,width=300,azimuth=45,elevation=35,prefix='lagrange') {
  const {map,height}=surfaceProjection(width,azimuth,elevation),fn=models[kind],g=kind==='f'?state.gradF:state.gradG;
  const magnitude=Math.hypot(...g),unit=g.map(value=>value/magnitude),level=kind==='f'?state.value:1;
  const id=`${prefix}-surface-${kind}`,point=[...state.point,fn(...state.point)],base=[...state.point,0];
  const screen=p=>map(p).slice(0,2).map(n).join(' ');
  const line=(a,b,klass,extra='')=>`<path class="${klass}" d="M${screen(a)}L${screen(b)}" ${extra}/>`;
  const curve=(points,klass)=>{let started=false;const commands=[];
    for(const p of points){if(Math.abs(p[0])>SURFACE_RANGE||Math.abs(p[1])>SURFACE_RANGE){started=false;continue;}
      commands.push(`${started?'L':'M'}${screen(p)}`);started=true;}
    return `<path class="${klass}" d="${commands.join(' ')}"/>`;};
  const sorted=mesh(kind).map(face=>({...face,depth:face.points.reduce((sum,p)=>sum+map(p)[2],0)/4})).sort((a,b)=>a.depth-b.depth);
  const faces=sorted.map(face=>`<path class="lm-surface-face lm-face-${kind}" opacity="${n(face.shade)}" d="M${face.points.map(screen).join('L')}Z"/>`).join('');
  const floor=[[-SURFACE_RANGE,-SURFACE_RANGE,0],[SURFACE_RANGE,-SURFACE_RANGE,0],[SURFACE_RANGE,SURFACE_RANGE,0],[-SURFACE_RANGE,SURFACE_RANGE,0]];
  const plane=floor.map(([x,y])=>[x,y,level]);
  const levels=kind==='f'?[3,6,10,15,20,25,30]:[.25,.5,1,2,4,8];
  const gradientBase=liftedDirection(base,[0,0],unit,.5),lifted=liftedDirection(point,g,unit);
  const chosen=liftedDirection(point,g,state.direction,.4);
  const feasible=sequence(240,t=>{const xy=constraintPoint(t*360);return [...xy,kind==='f'?objective(...xy):1];});
  const [px,py]=map(point),[bx,by]=map(base);
  const axesOrigin=[-SURFACE_RANGE,-SURFACE_RANGE,0],xEnd=[SURFACE_RANGE,-SURFACE_RANGE,0],yEnd=[-SURFACE_RANGE,SURFACE_RANGE,0],zEnd=[-SURFACE_RANGE,-SURFACE_RANGE,32];
  const label=(p,text,dx=0,dy=0)=>{const [x,y]=map(p);return `<text x="${n(x+dx)}" y="${n(y+dy)}" text-anchor="middle">${text}</text>`;};
  return `<svg class="lm-svg lm-surface-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">
    <defs><marker id="${id}-gradient" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="lm-${kind}-fill" d="M0 0L10 5L0 10Z"/></marker>
      <marker id="${id}-direction" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path class="lm-ink-fill" d="M0 0L10 5L0 10Z"/></marker></defs>
    <path class="lm-floor" d="M${floor.map(screen).join('L')}Z"/>
    ${curve(feasible.map(([x,y])=>[x,y,0]),'lm-floor-constraint')}
    ${line(base,gradientBase,`lm-ground-gradient lm-line-${kind}`,`marker-end="url(#${id}-gradient)"`)}
    <circle class="lm-point" cx="${n(bx)}" cy="${n(by)}" r="3"/>
    <path class="lm-height-plane lm-plane-${kind}" d="M${plane.map(screen).join('L')}Z"/>
    ${faces}${levels.map(value=>curve(contourPoints(kind,value),`lm-height-contour lm-line-${kind}`)).join('')}
    ${curve(contourPoints(kind,level),`lm-selected-contour lm-line-${kind}`)}
    ${curve(feasible,'lm-feasible-path')}
    ${line(base,point,'lm-vertical-guide')}
    ${line(point,lifted,`lm-lifted-gradient lm-line-${kind}`,`marker-end="url(#${id}-gradient)"`)}
    ${line(point,chosen,'lm-chosen-direction',`marker-end="url(#${id}-direction)"`)}
    <circle class="lm-point" cx="${n(px)}" cy="${n(py)}" r="4"/>
    ${line(axesOrigin,xEnd,'lm-axis')}${line(axesOrigin,yEnd,'lm-axis')}${line(axesOrigin,zEnd,'lm-axis')}
    <g class="lm-labels">${label(xEnd,'x',-8,18)}${label(yEnd,'y',8,18)}${label(zEnd,kind,0,-8)}
      ${[0,16,32].map(z=>label([-SURFACE_RANGE,-SURFACE_RANGE,z],String(z),-13,4)).join('')}
      ${label(point,'P',-10,-9)}</g></svg>`;
}

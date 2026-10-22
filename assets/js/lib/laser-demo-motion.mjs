// One clock drives pointer travel, ink, camera movement, and chapter controls.
export const DEMO = {
  duration: 30000,
  popup: [1000, 3400],
  enabled: [[3400,27000]],
  clicks: [800,27000],
  space: [14000,19900],
  drag: [15750,17550],
  preview: { settings: 8800, interact: 17700, resume: 24700, stop: 28000 },
  chapters: [0,3400,12000,18300,26000]
};
export const enabledAt = time => DEMO.enabled.some(([start,end])=>time>=start && time<end);
export const stateAt = time => !enabledAt(time) ? 'off' : time>=DEMO.space[0] && time<DEMO.space[1] ? 'paused' : 'on';

export function cueAt(time) {
  if(time<12000 || time>=23900) return {kind:'plain'};
  return {kind:'key',key:'Space',pressed:DEMO.space.some(at=>time>=at && time<at+1100)};
}

// One stable keycap spans both presses; only the key's pressed state changes.
// Its fade shares replay time, so pausing also freezes the hint.
export function cueEnvelope(time) {
  const visible=cueAt(time).kind==='key';
  const opacity=visible ? Math.min(settle((time-12000)/450),settle((23900-time)/450)) : 0;
  return {visible,opacity,offset:4*(1-opacity)};
}

// The same quiet brand frame closes and opens the dark loop. The opening
// dissolves in less than a second.
export function signatureEnvelope(time) {
  const opacity=time<650 ? 1-settle(time/650) : settle((time-28550)/500);
  return {visible:opacity>.001,opacity};
}

export const clamp = value => Math.max(0, Math.min(1, value));
// Minimum-jerk easing starts and finishes at rest without a sudden acceleration.
export function settle(value) {
  const t = clamp(value);
  return t*t*t*(10+t*(-15+6*t));
}
export function mix(a,b,t) { return a+(b-a)*t; }

export function travel(from, to, fraction, bend = .12) {
  const t = settle(fraction), v = 1-t;
  const dx = to[0]-from[0], dy = to[1]-from[1], distance = Math.hypot(dx,dy);
  const arc = Math.max(-38,Math.min(38,distance*bend));
  const px = distance ? -dy/distance*arc : 0, py = distance ? dx/distance*arc : 0;
  return [0,1].map(i => {
    const offset = i ? py : px;
    const first = from[i]+(to[i]-from[i])*.28+offset;
    const second = from[i]+(to[i]-from[i])*.76+offset*.45;
    return v*v*v*from[i]+3*v*v*t*first+3*v*t*t*second+t*t*t*to[i];
  });
}

// Hand-placed anchors make an open, asymmetric gesture. Resampling by distance
// separates its shape from its speed, so sparse corners do not cause a lurch.
export function sketch(anchors, count = 100) {
  const raw = [];
  for (let i=0;i<anchors.length-1;i++) {
    const b=anchors[i], c=anchors[i+1];
    const a=anchors[i-1] || b.map((n,k)=>2*n-c[k]);
    const d=anchors[i+2] || c.map((n,k)=>2*n-b[k]);
    const gap=(p,q)=>Math.max(.001,Math.sqrt(Math.hypot(q[0]-p[0],q[1]-p[1])));
    const t0=0, t1=gap(a,b), t2=t1+gap(b,c), t3=t2+gap(c,d);
    const blend=(p,q,u)=>p.map((n,k)=>mix(n,q[k],u));
    for(let j=0;j<20;j++) {
      const t=mix(t1,t2,j/20);
      const a1=blend(a,b,(t-t0)/(t1-t0)), a2=blend(b,c,(t-t1)/(t2-t1)), a3=blend(c,d,(t-t2)/(t3-t2));
      const b1=blend(a1,a2,(t-t0)/(t2-t0)), b2=blend(a2,a3,(t-t1)/(t3-t1));
      raw.push(blend(b1,b2,(t-t1)/(t2-t1)));
    }
  }
  raw.push(anchors.at(-1));
  const lengths=[0];
  for(let i=1;i<raw.length;i++) lengths.push(lengths[i-1]+Math.hypot(raw[i][0]-raw[i-1][0],raw[i][1]-raw[i-1][1]));
  let cursor=1;
  return Array.from({length:count},(_,i)=>{
    const distance=lengths.at(-1)*i/(count-1);
    while(cursor<raw.length-1 && lengths[cursor]<distance) cursor++;
    const u=(distance-lengths[cursor-1])/(lengths[cursor]-lengths[cursor-1] || 1);
    return [0,1].map(k=>mix(raw[cursor-1][k],raw[cursor][k],u));
  });
}
export function along(points, fraction) {
  const index=clamp(fraction)*(points.length-1), left=Math.floor(index), right=Math.min(points.length-1,left+1);
  return [0,1].map(i=>mix(points[left][i],points[right][i],index-left));
}

// Repeated destinations are deliberate reading pauses. Camera changes happen
// during cursor travel, rather than cutting as a control is being clicked.
const cameraStops = [
  [0,'page'],[5350,'page'],[6400,'settings'],[8950,'settings'],[10000,'page'],
  [12300,'page'],[15100,'interact'],[22700,'interact'],[24400,'page'],[30000,'page']
];
export function cameraPose(time, width) {
  const base=width/1000, height=Math.max(260,520*base);
  const poses={
    page:{scale:base,x:0,y:0,height},
    settings:{scale:Math.min(1,width/365),x:635,y:0,height:Math.max(340,520*base)},
    interact:{scale:Math.min(1,width/450),x:285,y:125,height:Math.max(320,520*base)}
  };
  if(width>=650) return {...poses.page,height:520*base};
  const index=cameraStops.findIndex(stop=>stop[0]>time);
  if(index<0) return poses.page;
  const a=cameraStops[Math.max(0,index-1)], b=cameraStops[index];
  const u=settle((time-a[0])/(b[0]-a[0] || 1));
  return Object.fromEntries(Object.keys(poses.page).map(key=>[key,mix(poses[a[1]][key],poses[b[1]][key],u)]));
}

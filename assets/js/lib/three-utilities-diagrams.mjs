import { NODES, nodeById, surfacePoint, smoothWaypoints } from './three-utilities-math.mjs?v=20261002-4';
import { mugMesh } from './three-utilities-mug.mjs?v=20261002-4';
import { draw3DSurface } from './three-utilities-renderer.mjs?v=20261002-4';

export function boardGeometry(width) {
  const w = Math.max(220, width);
  return { width: w, height: w + 12, left: 32, top: 28, size: w - 64 };
}
export const boardPoint = (point, g) => [g.left + point[0] * g.size, g.top + point[1] * g.size];
const number = x => Number(x.toFixed(2));
export function pathData(points, g) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${boardPoint(p, g).map(number).join(' ')}`).join(' ');
}
export function curvePathData(curves, g) {
  if(!curves.length)return '';
  return `M${boardPoint(curves[0][0],g).map(number).join(' ')} `+curves.map(curve=>`C${curve.slice(1).map(p=>boardPoint(p,g).map(number).join(' ')).join(' ')}`).join(' ');
}

function nodeMarkup(node, g, interactive, selected) {
  const [x, y] = boardPoint(node.point, g);
  const button = interactive ? `role="button" tabindex="0" data-node="${node.id}" aria-label="${node.label}" aria-pressed="${selected === node.id}"` : '';
  const house = `<path d="M-14 -2 L0 -15 L14 -2 H11 V12 H-11 V-2 Z" fill="#fcfcf9" stroke="#285b46" stroke-width="2"/><text y="7" text-anchor="middle" fill="#285b46" font-size="13">${node.short}</text>`;
  const utility = `<circle r="16" fill="#fcfcf9" stroke="${node.color}" stroke-width="2"/><text y="5" text-anchor="middle" fill="${node.color}" font-size="14">${node.short}</text>`;
  return `<g transform="translate(${number(x)} ${number(y)})" class="tu-node ${selected === node.id ? 'is-selected' : ''}" ${button}><circle class="tu-hit" r="22" fill="transparent"/>${node.kind === 'house' ? house : utility}</g>`;
}

export function boardSVG(routes, { width = 620, square = false, selected = null, hits = [], draft = null, focus = null, interactive = false, cursor = null } = {}) {
  const g = boardGeometry(width);
  const right = g.left + g.size, bottom = g.top + g.size;
  const routeMarkup = routes.map(edge => edge.parts.map((part,i) => `<path data-pipe="${edge.id}" d="${edge.curves?curvePathData(edge.curves[i],g):pathData(part, g)}" fill="none" stroke="${nodeById(edge.utility).color}" stroke-width="${focus === edge.id ? 4 : 2.5}" opacity="${focus && focus !== edge.id ? .22 : 1}" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>`).join('')).join('');
  const plane = `<rect class="tu-paper" ${interactive?'data-tu-paper role="button" tabindex="0" aria-label="Place a path point. Arrow keys move the cursor; Enter adds a point."':''} x="${g.left}" y="${g.top}" width="${g.size}" height="${g.size}" rx="2" fill="url(#tu-dots)" stroke="#dfe3dc"/>`;
  const boundary = square ? `<rect x="${g.left}" y="${g.top}" width="${g.size}" height="${g.size}" fill="#fcfcf9"/>
    <path d="M${g.left} ${g.top}H${right} M${g.left} ${bottom}H${right}" stroke="#285b46" stroke-width="2.5"/>
    <path d="M${g.left} ${g.top}V${bottom} M${right} ${g.top}V${bottom}" stroke="#8769a2" stroke-width="2.5"/>
    ${[g.top, bottom].map(y => `<path d="M${g.width / 2 - 14} ${y}h28m-7 -5l7 5 -7 5" fill="none" stroke="#285b46" stroke-width="2.5"/><text x="${g.width / 2}" y="${y === g.top ? y - 12 : y + 23}" text-anchor="middle" fill="#285b46" font-size="14">a</text>`).join('')}
    ${[g.left, right].map(x => `<path d="M${x} ${g.top + g.size / 2 + 14}v-28m-5 7l5 -7 5 7" fill="none" stroke="#8769a2" stroke-width="2.5"/><text x="${x === g.left ? x - 19 : x + 19}" y="${g.top + g.size / 2 + 5}" text-anchor="middle" fill="#8769a2" font-size="14">b</text>`).join('')}` : plane;
  const exits = square ? routes.filter(edge => edge.seam).map(edge => edge.parts.flatMap((part, index) => [index === 0 ? part.at(-1) : part[0]]).map(p => {
    const [x, y] = boardPoint(p, g);
    return `<circle cx="${number(x)}" cy="${number(y)}" r="4" fill="#fcfcf9" stroke="${nodeById(edge.utility).color}" stroke-width="2"/>`;
  }).join('')).join('') : '';
  const hitMarkup = hits.map(hit => {
    const [x, y] = boardPoint(hit.point, g);
    return `<circle cx="${number(x)}" cy="${number(y)}" r="8" fill="#fff0ee" stroke="#c83c38" stroke-width="2"/><path d="M${number(x - 3)} ${number(y - 3)}l6 6m0 -6l-6 6" stroke="#c83c38" stroke-width="1.5"/>`;
  }).join('');
  const draftMarkup=draft?`<path d="${curvePathData(smoothWaypoints(draft),g)}" fill="none" stroke="#285b46" stroke-width="2.5" stroke-dasharray="5 4" pointer-events="none"/>`+draft.slice(1).map(p=>{const [x,y]=boardPoint(p,g);return `<circle cx="${number(x)}" cy="${number(y)}" r="4" fill="#fcfcf9" stroke="#285b46" stroke-width="1.5" pointer-events="none"/>`;}).join(''):'';
  const cursorMarkup=cursor?(()=>{const[x,y]=boardPoint(cursor,g);return `<path d="M${x-7} ${y}h14M${x} ${y-7}v14" stroke="#285b46" stroke-width="1.5" pointer-events="none"/>`;})():'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${g.height}" ${interactive ? 'role="group"' : 'role="img"'} aria-label="${square ? 'Three houses connected to gas, water and electricity on a square with paired opposite sides.' : 'Choose a house, place points for its path, then choose a utility. The pipe is a smooth curve.'}">
    <style>text { font-family: system-ui, sans-serif; }</style><defs><pattern id="tu-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r=".65" fill="#dfe3dc"/></pattern></defs>
    ${boundary}${routeMarkup}${draftMarkup}${cursorMarkup}${exits}${NODES.map(node => nodeMarkup(node, g, interactive, selected)).join('')}<g pointer-events="none">${hitMarkup}</g>
  </svg>`;
}

const mix = (a, b, t) => a + (b - a) * t;
function projection(phase, rotation) {
  const flatten = Math.max(0, phase - 2), round = Math.min(1,phase);
  const ease = round * round * (3 - 2 * round);
  const yaw = .22 * (1 - flatten) + rotation.yaw;
  const pitch = (phase < 1 ? -.50 + 1.40 * ease : .90 * (1 - flatten)) + rotation.pitch;
  return p => {
    const x = Math.cos(yaw) * p[0] + Math.sin(yaw) * p[2];
    const z = -Math.sin(yaw) * p[0] + Math.cos(yaw) * p[2];
    return [x, Math.cos(pitch) * p[1] - Math.sin(pitch) * z, Math.sin(pitch) * p[1] + Math.cos(pitch) * z];
  };
}

let cachedMug=null;
function drawSurface(ctx, width, height, phase, rotation) {
  const project = projection(phase, rotation), cols = 84, rows = 56, faces = [], lines = [], all = [];
  const addFace=(points,inward=false)=>{
    all.push(...points);
    const a = points[1].map((x,k) => x-points[0][k]), b = points.at(-1).map((x,k) => x-points[0][k]);
    const normal = [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    const length = Math.hypot(...normal) || 1;
    const light = .32 + .68 * Math.max(0, (normal[0]*-.35 + normal[1]*-.55 + normal[2]*.76)*(inward?-1:1)/length);
    faces.push({ points, depth: points.reduce((sum,p)=>sum+p[2],0)/points.length, fill: `rgb(${Math.round(115+70*light)},${Math.round(139+63*light)},${Math.round(102+63*light)})` });
  };
  if(phase<1){
    if(cachedMug?.phase!==phase)cachedMug={phase,mesh:mugMesh(phase,44)};
    const projected=cachedMug.mesh.vertices.map(project);
    for(const triangle of cachedMug.mesh.triangles)addFace(triangle.map(i=>projected[i]));
  }else{
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      addFace([[i/cols,j/rows],[(i+1)/cols,j/rows],[(i+1)/cols,(j+1)/rows],[i/cols,(j+1)/rows]].map(([u,v]) => project(surfacePoint(u,v,phase))),true);
    }
  }
  // Stable framing lets the object open without shrinking the tube out of view.
  const extentX = Math.max(...all.map(p=>Math.abs(p[0]))), extentY = Math.max(...all.map(p=>Math.abs(p[1])));
  const scale = Math.min((width-44)/(extentX*2), (height-48)/(extentY*2));
  const screen = p => [width/2+p[0]*scale, height/2+p[1]*scale];
  const addLine = (uvs, color, lineWidth) => {
    const ps = uvs.map(([u,v])=>project(surfacePoint(u,v,phase)));
    for (let i=1;i<ps.length;i++) lines.push({ points:[ps[i-1],ps[i]], color, lineWidth });
  };
  const samples = Array.from({length:101},(_,i)=>i/100);
  // a = top/bottom, b = left/right, with equal directions on each paired side.
  if(phase>=1){
    addLine(samples.map(v=>[0,v]), '#8769a2', 2.5); addLine(samples.map(v=>[1,v]), '#8769a2', 2.5);
    addLine(samples.map(u=>[u,0]), '#285b46', 2.5); addLine(samples.map(u=>[u,1]), '#285b46', 2.5);
  }
  // A small depth buffer hides rear pipes without gaps from patch-average sorting.
  const cell=3, bw=Math.ceil(width/cell), bh=Math.ceil(height/cell), depths=new Float32Array(bw*bh).fill(-Infinity);
  const rasterize=(a,b,c)=>{
    const denominator=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
    if(Math.abs(denominator)<1e-8)return;
    const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxX=Math.min(bw-1,Math.ceil(Math.max(a[0],b[0],c[0])));
    const minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxY=Math.min(bh-1,Math.ceil(Math.max(a[1],b[1],c[1])));
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
      const px=x+.5,py=y+.5;
      const wa=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/denominator;
      const wb=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/denominator,wc=1-wa-wb;
      if(wa>=-1e-6&&wb>=-1e-6&&wc>=-1e-6){const depth=wa*a[2]+wb*b[2]+wc*c[2],key=y*bw+x;if(depth>depths[key])depths[key]=depth;}
    }
  };
  for(const face of faces){
    const ps=face.points.map(p=>[...screen(p).map(x=>x/cell),p[2]]);
    rasterize(ps[0],ps[1],ps[2]);if(ps.length===4)rasterize(ps[0],ps[2],ps[3]);
  }
  const visible=p=>{
    const [x,y]=screen(p),key=Math.floor(y/cell)*bw+Math.floor(x/cell);
    return p[2]+.045>=depths[key];
  };
  faces.sort((a,b)=>a.depth-b.depth);
  ctx.save(); ctx.lineJoin='round'; ctx.lineCap='round';
  for (const face of faces) {
    ctx.beginPath(); face.points.map(screen).forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));
    ctx.closePath();ctx.fillStyle=face.fill;ctx.fill();ctx.strokeStyle=face.fill;ctx.lineWidth=.5;ctx.stroke();
  }
  for(const line of lines){
    const [a,b]=line.points, sa=screen(a),sb=screen(b);
    const count=Math.max(1,Math.ceil(Math.hypot(sa[0]-sb[0],sa[1]-sb[1])/cell));
    ctx.strokeStyle=line.color;ctx.lineWidth=line.lineWidth;
    for(let i=0;i<count;i++){
      const mid=a.map((x,k)=>mix(x,b[k],(i+.5)/count));
      if(!visible(mid))continue;
      ctx.beginPath();ctx.moveTo(...screen(a.map((x,k)=>mix(x,b[k],i/count))));ctx.lineTo(...screen(a.map((x,k)=>mix(x,b[k],(i+1)/count))));ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawTransformation(canvas, phase, rotation = {yaw:0,pitch:0}) {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  if (!width || !height) return;
  if(draw3DSurface(canvas,phase,projection(phase,rotation)))return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio); ctx.clearRect(0,0,width,height);
  drawSurface(ctx,width,height,phase,rotation);
}

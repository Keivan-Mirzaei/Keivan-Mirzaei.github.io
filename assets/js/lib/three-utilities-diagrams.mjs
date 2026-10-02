import { NODES, nodeById, surfacePoint, sampleRoute } from './three-utilities-math.mjs';

export function boardGeometry(width) {
  const w = Math.max(220, width);
  return { width: w, height: w + 12, left: 32, top: 28, size: w - 64 };
}
export const boardPoint = (point, g) => [g.left + point[0] * g.size, g.top + point[1] * g.size];
const number = x => Number(x.toFixed(2));
export function pathData(points, g) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${boardPoint(p, g).map(number).join(' ')}`).join(' ');
}

function nodeMarkup(node, g, interactive, selected) {
  const [x, y] = boardPoint(node.point, g);
  const button = interactive ? `role="button" tabindex="0" data-node="${node.id}" aria-label="${node.label}" aria-pressed="${selected === node.id}"` : '';
  const house = `<path d="M-14 -2 L0 -15 L14 -2 M-11 -5 V12 H11 V-5" fill="#fcfcf9" stroke="#285b46" stroke-width="2"/><text y="7" text-anchor="middle" fill="#285b46" font-size="13">${node.short}</text>`;
  const utility = `<circle r="16" fill="#fcfcf9" stroke="${node.color}" stroke-width="2"/><text y="5" text-anchor="middle" fill="${node.color}" font-size="14">${node.short}</text>`;
  const label = g.width >= 350 ? `<text y="${node.kind === 'house' ? -27 : 34}" text-anchor="middle" fill="#686e66" font-size="12">${node.kind === 'house' ? node.label : node.id === 'power' ? 'Power' : node.label}</text>` : '';
  return `<g transform="translate(${number(x)} ${number(y)})" class="tu-node ${selected === node.id ? 'is-selected' : ''}" ${button}><circle class="tu-hit" r="22" fill="transparent"/>${node.kind === 'house' ? house : utility}${label}</g>`;
}

export function boardSVG(routes, { width = 620, square = false, selected = null, hits = [], draft = null, focus = null, interactive = false } = {}) {
  const g = boardGeometry(width);
  const right = g.left + g.size, bottom = g.top + g.size;
  const routeMarkup = routes.map(edge => edge.parts.map(part => `<path d="${pathData(part, g)}" fill="none" stroke="${nodeById(edge.utility).color}" stroke-width="${focus === edge.id ? 4 : 2.5}" opacity="${focus && focus !== edge.id ? .22 : 1}" stroke-linejoin="round" stroke-linecap="round"/>`).join('')).join('');
  const plane = `<rect x="${g.left}" y="${g.top}" width="${g.size}" height="${g.size}" rx="2" fill="url(#tu-dots)" stroke="#dfe3dc"/>`;
  const boundary = square ? `<rect x="${g.left}" y="${g.top}" width="${g.size}" height="${g.size}" fill="url(#tu-dots)"/>
    <path d="M${g.left} ${g.top}H${right} M${g.left} ${bottom}H${right}" stroke="#285b46" stroke-width="2.5"/>
    <path d="M${g.left} ${g.top}V${bottom} M${right} ${g.top}V${bottom}" stroke="#8769a2" stroke-width="2.5"/>
    ${[g.top, bottom].map(y => `<path d="M${g.width / 2 - 14} ${y}h28m-7 -5l7 5 -7 5" fill="none" stroke="#285b46" stroke-width="2.5"/><text x="${g.width / 2}" y="${y === g.top ? y - 12 : y + 23}" text-anchor="middle" fill="#285b46" font-size="14">a</text>`).join('')}
    ${[g.left, right].map(x => `<path d="M${x} ${g.top + g.size / 2 + 14}v-28m-5 7l5 -7 5 7" fill="none" stroke="#8769a2" stroke-width="2.5"/><text x="${x === g.left ? x - 19 : x + 19}" y="${g.top + g.size / 2 + 5}" text-anchor="middle" fill="#8769a2" font-size="14">b</text>`).join('')}` : plane;
  const exits = square ? routes.filter(edge => edge.seam).map(edge => edge.parts.flatMap((part, index) => [index === 0 ? part.at(-1) : part[0]]).map(p => {
    const [x, y] = boardPoint(p, g);
    return `<circle cx="${number(x)}" cy="${number(y)}" r="5" fill="#fcfcf9" stroke="${nodeById(edge.utility).color}" stroke-width="2.5"/><text x="${number(x + (edge.seam === 'a' ? 10 : p[0] === 0 ? 12 : -12))}" y="${number(y + (edge.seam === 'a' ? p[1] === 0 ? 16 : -10 : -9))}" text-anchor="middle" font-size="12" fill="${nodeById(edge.utility).color}">${edge.seam}</text>`;
  }).join('')).join('') : '';
  const hitMarkup = hits.map(hit => {
    const [x, y] = boardPoint(hit.point, g);
    return `<circle cx="${number(x)}" cy="${number(y)}" r="8" fill="#fff0ee" stroke="#c83c38" stroke-width="2"/><path d="M${number(x - 3)} ${number(y - 3)}l6 6m0 -6l-6 6" stroke="#c83c38" stroke-width="1.5"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.width} ${g.height}" ${interactive ? 'role="group"' : 'role="img"'} aria-label="${square ? 'Three houses connected to gas, water and electricity on a square with paired opposite sides.' : 'Connect every house to each utility. Drag between nodes or select two endpoints.'}">
    <style>text { font-family: system-ui, sans-serif; }</style><defs><pattern id="tu-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r=".65" fill="#dfe3dc"/></pattern></defs>
    ${boundary}${routeMarkup}${draft ? `<path d="${pathData(draft, g)}" fill="none" stroke="#285b46" stroke-width="2.5" stroke-dasharray="5 4"/>` : ''}${exits}${NODES.map(node => nodeMarkup(node, g, interactive, selected)).join('')}${hitMarkup}
  </svg>`;
}

// A continuous silhouette deformation highlights the mug's handle opening.
// The bowl is an indentation (drawn with an opaque bottom), not another through-hole.
const mugPoints = [[180,155],[395,155],[400,180],[548,218],[534,287],[400,287],[395,330],[180,330]];
const mugControls = [[[180,122],[395,122]],[[395,162],[400,170]],[[455,146],[537,159]],[[563,251],[556,275]],[[499,318],[438,313]],[[400,300],[395,318]],[[395,369],[180,369]],[[176,280],[176,190]]];
const mix = (a, b, t) => a + (b - a) * t;
const mixPoint = (a, b, t) => a.map((value, i) => mix(value, b[i], t));
const ellipsePoint = angle => [350 + 210 * Math.cos(angle), 240 + 130 * Math.sin(angle)];
const ellipseTangent = angle => [-210 * Math.sin(angle), 130 * Math.cos(angle)];

function drawMug(ctx, width, height, progress, alpha = 1) {
  const t = progress * progress * (3 - 2 * progress), scale = Math.min(width / 480, height / 430);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(width / 2 - 350 * scale, height / 2 - 240 * scale);
  ctx.scale(scale, scale);
  ctx.beginPath();
  const start = mixPoint(mugPoints[0], ellipsePoint(5 * Math.PI / 4), t);
  ctx.moveTo(...start);
  const k = 4 / 3 * Math.tan(Math.PI / 16);
  for (let i = 0; i < 8; i++) {
    const angle = 5 * Math.PI / 4 + i * Math.PI / 4, next = angle + Math.PI / 4;
    const a = ellipsePoint(angle), b = ellipsePoint(next), da = ellipseTangent(angle), db = ellipseTangent(next);
    const c1 = mixPoint(mugControls[i][0], a.map((value, j) => value + k * da[j]), t);
    const c2 = mixPoint(mugControls[i][1], b.map((value, j) => value - k * db[j]), t);
    const end = mixPoint(mugPoints[(i + 1) % 8], b, t);
    ctx.bezierCurveTo(...c1, ...c2, ...end);
  }
  ctx.closePath();
  const hx = mix(480, 350, t), hy = mix(235, 240, t), rx = mix(36, 103, t), ry = mix(43, 53, t);
  ctx.moveTo(hx + rx, hy);
  ctx.ellipse(hx, hy, rx, ry, 0, 0, Math.PI * 2);
  const gradient = ctx.createLinearGradient(200, 110, 420, 365);
  gradient.addColorStop(0, '#e1eade'); gradient.addColorStop(.5, '#b8ccac'); gradient.addColorStop(1, '#819c78');
  ctx.fillStyle = gradient; ctx.fill('evenodd');
  ctx.lineWidth = 2.5; ctx.strokeStyle = '#42664b'; ctx.stroke();
  ctx.strokeStyle = '#8769a2'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(hx, hy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  if (t < .9) {
    ctx.globalAlpha = alpha * Math.max(0, 1 - t / .9);
    const bowlX = mix(287.5, 320, t), bowlY = mix(155, 205, t);
    ctx.fillStyle = '#e9eee5'; ctx.strokeStyle = '#42664b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(bowlX, bowlY, 105 * (1 - .65 * t), 25 * (1 - .7 * t), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#75936d';
    ctx.beginPath(); ctx.ellipse(bowlX, bowlY, 86 * (1 - .65 * t), 16 * (1 - .7 * t), 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function projection(phase) {
  const flatten = Math.max(0, phase - 2);
  const yaw = .22 * (1 - flatten), pitch = .90 * (1 - flatten);
  return p => {
    const x = Math.cos(yaw) * p[0] + Math.sin(yaw) * p[2];
    const z = -Math.sin(yaw) * p[0] + Math.cos(yaw) * p[2];
    return [x, Math.cos(pitch) * p[1] - Math.sin(pitch) * z, Math.sin(pitch) * p[1] + Math.cos(pitch) * z];
  };
}

function drawSurface(ctx, width, height, phase, routes, alpha = 1) {
  const project = projection(phase), cols = 40, rows = 24, faces = [], lines = [], all = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const points = [[i/cols,j/rows],[(i+1)/cols,j/rows],[(i+1)/cols,(j+1)/rows],[i/cols,(j+1)/rows]].map(([u,v]) => project(surfacePoint(u,v,phase)));
    all.push(...points);
    const a = points[1].map((x,k) => x-points[0][k]), b = points[3].map((x,k) => x-points[0][k]);
    const normal = [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    const length = Math.hypot(...normal) || 1;
    const light = .55 + .45 * Math.abs((normal[0]*-.3 + normal[1]*-.4 + normal[2]*.86)/length);
    faces.push({ points, depth: points.reduce((sum,p)=>sum+p[2],0)/4, fill: `rgb(${Math.round(115+70*light)},${Math.round(139+63*light)},${Math.round(102+63*light)})` });
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
  addLine(samples.map(v=>[0,v]), '#8769a2', 2.5); addLine(samples.map(v=>[1,v]), '#8769a2', 2.5);
  addLine(samples.map(u=>[u,0]), '#285b46', 2.5); addLine(samples.map(u=>[u,1]), '#285b46', 2.5);
  for (const edge of routes) for (const part of sampleRoute(edge, 65)) addLine(part, nodeById(edge.utility).color, 3);
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
    rasterize(ps[0],ps[1],ps[2]);rasterize(ps[0],ps[2],ps[3]);
  }
  const visible=p=>{
    const [x,y]=screen(p),key=Math.floor(y/cell)*bw+Math.floor(x/cell);
    return p[2]+.045>=depths[key];
  };
  faces.sort((a,b)=>a.depth-b.depth);
  ctx.save(); ctx.globalAlpha=alpha; ctx.lineJoin='round'; ctx.lineCap='round';
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
  if (routes.length) {
    for (const node of NODES) {
      const p=project(surfacePoint(...node.point,phase));
      // Nodes on the rear are deliberately hidden, like the rear parts of pipes.
      if (!visible(p)) continue;
      const [x,y]=screen(p);ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fillStyle='#fcfcf9';ctx.fill();ctx.strokeStyle=node.color||'#285b46';ctx.lineWidth=1.5;ctx.stroke();
      ctx.fillStyle=node.color||'#285b46';ctx.font='11px system-ui, sans-serif';ctx.textAlign='center';ctx.fillText(node.short,x,y+4);
    }
  }
  ctx.restore();
}

export function drawTransformation(canvas, phase, routes = []) {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  if (!width || !height) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio); ctx.clearRect(0,0,width,height);
  if (phase < .82) drawMug(ctx,width,height,phase);
  else if (phase < 1) {
    const alpha = (phase-.82)/.18;
    drawMug(ctx,width,height,phase,1-alpha); drawSurface(ctx,width,height,1,[],alpha);
  } else drawSurface(ctx,width,height,phase,routes);
}

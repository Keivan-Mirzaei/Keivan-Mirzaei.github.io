import { TRIANGLE_SHAPES, TETRAHEDRON, triangleData, weightedPoint, contactPoints, simplexRatio, pairBound } from './cevian-math.mjs';

const number = x => Number(x.toFixed(3));
const points = vertices => vertices.map(p => p.slice(0, 2).map(number).join(',')).join(' ');
const line = (a, b, className = 'cv-line') => `<line class="${className}" x1="${number(a[0])}" y1="${number(a[1])}" x2="${number(b[0])}" y2="${number(b[1])}"/>`;
const polygon = (vertices, className) => `<polygon class="${className}" points="${points(vertices)}"/>`;
const percent = value => `${(100 * value).toFixed(2)}%`;

function frame(width) {
  const height = width < 440 ? 300 : 370;
  return { width, height, project: ([x, y]) => [24 + x * (width - 48), 24 + y * (height - 54)] };
}

function labelPlacements(items, width, height) {
  const boxes = [];
  return items.map(({ point, text, preferred = [12, -10] }) => {
    const candidates = [preferred, [14, 16], [-16, -12], [-16, 18], [24, 0], [-24, 0], [0, -26], [0, 28], [28, -20], [-28, 24]];
    let chosen;
    for (const [dx, dy] of candidates) {
      const x = point[0] + dx, y = point[1] + dy;
      const box = { x: x - text.length * 4, y: y - 13, right: x + text.length * 4, bottom: y + 3 };
      if (box.x < 1 || box.right > width - 1 || box.y < 1 || box.bottom > height - 1) continue;
      if (!boxes.some(other => box.x < other.right + 4 && box.right > other.x - 4 && box.y < other.bottom + 3 && box.bottom > other.y - 3)) {
        chosen = { x, y, box }; break;
      }
    }
    if (!chosen) chosen = { x: point[0] + preferred[0], y: point[1] + preferred[1], box: { x: 0, right: 0, y: 0, bottom: 0 } };
    boxes.push(chosen.box);
    return { x: chosen.x, y: chosen.y, text };
  });
}

function labels(items, width, height) {
  return labelPlacements(items, width, height).map(({x,y,text}) => `<text class="cv-label" x="${number(x)}" y="${number(y)}" text-anchor="middle">${text}</text>`).join('');
}

export function landscapeMarker(width, weights, shape = 'scalene') {
  const f = frame(width);
  const vertices = TRIANGLE_SHAPES[shape];
  const o = f.project(weightedPoint(vertices, weights));
  const g = f.project(weightedPoint(vertices, [1,1,1]));
  const label = labelPlacements([{point:g,text:'G: 25%',preferred:[0,-18]},{point:o,text:'O',preferred:[14,16]}],width,f.height)[1];
  return {point:o, label};
}

export function triangleDiagram(width, weights = [.5, .1875, .3125], shape = 'scalene', mode = 'inner', interactive = false, reference = true) {
  const f = frame(width);
  const data = triangleData(TRIANGLE_SHAPES[shape], weights);
  const [a, b, c] = data.vertices.map(f.project);
  const [x, y, z] = data.contacts.map(f.project);
  const o = f.project(data.point);
  const medial = contactPoints(data.vertices, [1, 1, 1]).map(f.project);
  let shading = polygon([x, y, z], 'cv-inner');
  if (mode === 'corners') shading = polygon([a, y, z], 'cv-corner cv-corner-a') + polygon([b, z, x], 'cv-corner cv-corner-b') + polygon([c, x, y], 'cv-corner cv-corner-c') + shading;
  if (mode === 'ceva') shading = polygon([o, b, c], 'cv-corner cv-corner-a') + polygon([o, c, a], 'cv-corner cv-corner-b') + polygon([o, a, b], 'cv-corner cv-corner-c') + polygon([x, y, z], 'cv-inner cv-outline-only');
  const wedgeLabels = mode === 'ceva' ? [[o, b, c], [o, c, a], [o, a, b]].map((triangle, i) => ({ point: triangle[0].map((_, k) => triangle.reduce((sum, vertex) => sum + vertex[k], 0) / 3), text: ['p', 'q', 'r'][i], preferred: [0, 4] })) : [];
  const name = mode === 'corners' ? 'Three colored corner triangles and the inner cevian triangle partition ABC.' : mode === 'ceva' ? 'The meeting point O divides ABC into three triangles of areas p, q, and r.' : `Concurrent cevians through O form XYZ, with ${percent(data.ratio)} of the area of ABC.`;
  const labelItems = [
    { point: a, text: 'A', preferred: [0, -13] }, { point: b, text: 'B', preferred: [-12, 19] }, { point: c, text: 'C', preferred: [12, 19] },
    { point: x, text: 'X', preferred: [0, 20] }, { point: y, text: 'Y', preferred: [15, 0] }, { point: z, text: 'Z', preferred: [-15, 0] },
    { point: o, text: 'O', preferred: [13, -12] }, ...wedgeLabels
  ];
  return `<svg class="cv-diagram${interactive ? ' cv-movable' : ''}" viewBox="0 0 ${width} ${f.height}" width="${width}" height="${f.height}" role="${interactive ? 'group' : 'img'}" aria-label="${name}" data-cv-svg><title>${name}</title>${shading}${reference && mode === 'inner' ? polygon(medial, 'cv-reference') : ''}${line(a, x, 'cv-cevian')}${line(b, y, 'cv-cevian')}${line(c, z, 'cv-cevian')}${polygon([a, b, c], 'cv-boundary')}${[x,y,z].map(p => `<circle class="cv-contact" cx="${number(p[0])}" cy="${number(p[1])}" r="3.5"/>`).join('')}${labels(labelItems, width, f.height)}<circle class="cv-point" cx="${number(o[0])}" cy="${number(o[1])}" r="${interactive ? 7 : 4.5}"${interactive ? ' tabindex="0" role="button" aria-label="Meeting point O. Use arrow keys to move it, or use the position sliders below." data-cv-point' : ''}/></svg>`;
}

export function factorsDiagram(width, weights = [.5, .1875, .3125]) {
  const ratios = triangleData(TRIANGLE_SHAPES.scalene, weights).sideRatios;
  const bounds = ratios.map(pairBound);
  const left = 60, right = width - 65;
  const maximum = Math.max(...bounds.map(bound => bound.sum));
  const barWidth = value => (right - left) * value / maximum;
  const rows = bounds.map((bound, i) => {
    const y = 24 + i * 82;
    const variable = ['a', 'b', 'c'][i];
    return `<text class="cv-label cv-small" x="4" y="${y - 7}">${variable} = ${ratios[i].toFixed(3)}</text><text class="cv-label cv-small" x="4" y="${y + 18}">1 + ${variable}</text><rect class="cv-sum-bar" x="${left}" y="${y + 7}" width="${barWidth(bound.sum)}" height="14" rx="2"/><text class="cv-label cv-small" x="${width - 4}" y="${y + 18}" text-anchor="end">${bound.sum.toFixed(3)}</text><text class="cv-label cv-small" x="4" y="${y + 41}">2√${variable}</text><rect class="cv-root-bar" x="${left}" y="${y + 30}" width="${barWidth(bound.geometric)}" height="14" rx="2"/><text class="cv-label cv-small" x="${width - 4}" y="${y + 41}" text-anchor="end">${bound.geometric.toFixed(3)}</text>`;
  }).join('');
  return `<svg class="cv-diagram" viewBox="0 0 ${width} 250" width="${width}" height="250" role="img" aria-label="For each of a, b, and c, the bar for one plus the ratio is at least as long as the bar for twice its square root. All bars share one scale."><title>Three pairwise arithmetic–geometric mean inequalities</title>${rows}</svg>`;
}

export function landscapeDiagram(width, weights = [.5, .1875, .3125], shape = 'scalene') {
  const f = frame(width);
  const vertices = TRIANGLE_SHAPES[shape];
  const subdivisions = 30;
  const cells = [];
  const sample = (i, j) => [i / subdivisions, j / subdivisions, 1 - (i + j) / subdivisions];
  function add(triple) {
    const center = triple[0].map((_, k) => triple.reduce((sum, w) => sum + w[k], 0) / 3);
    const ratio = simplexRatio(center);
    const fill = `hsl(149 27% ${95 - 62 * ratio / .25}%)`;
    cells.push(`<polygon points="${points(triple.map(w => f.project(w.reduce((p, weight, i) => p.map((v, k) => v + weight * vertices[i][k]), [0, 0]))))}" fill="${fill}" stroke="${fill}" stroke-width=".6"/>`);
  }
  for (let i = 0; i < subdivisions; i += 1) for (let j = 0; j < subdivisions - i; j += 1) {
    add([sample(i, j), sample(i + 1, j), sample(i, j + 1)]);
    if (i + j + 2 <= subdivisions) add([sample(i + 1, j), sample(i + 1, j + 1), sample(i, j + 1)]);
  }
  const o = f.project(weightedPoint(vertices, weights));
  const g = f.project(weightedPoint(vertices, [1, 1, 1]));
  const marker = landscapeMarker(width, weights, shape);
  return `<svg class="cv-diagram cv-movable" viewBox="0 0 ${width} ${f.height}" width="${width}" height="${f.height}" role="group" aria-label="Area landscape: every possible meeting point is colored by its inner triangle's area. The unique peak is the centroid, at 25 percent." data-cv-map><title>The area landscape has its unique maximum at the centroid</title>${cells.join('')}${polygon(vertices.map(f.project), 'cv-boundary')}<g data-cv-map-maximum tabindex="0" role="button" aria-label="Choose the centroid: the area is exactly one quarter"><circle cx="${g[0]}" cy="${g[1]}" r="18" fill="transparent"/><path class="cv-peak" d="M${g[0]-5},${g[1]}h10 M${g[0]},${g[1]-5}v10"/>${labels([{point:g,text:'G: 25%',preferred:[0,-18]}],width,f.height)}</g><circle class="cv-point" data-cv-map-point cx="${o[0]}" cy="${o[1]}" r="6" pointer-events="none"/><text class="cv-label" data-cv-map-label x="${marker.label.x}" y="${marker.label.y}" text-anchor="middle">O</text></svg>`;
}

export function tetrahedronDiagram(width, weights = [42, 27, 19, 12], angle = 32) {
  const height = width < 440 ? 300 : 380;
  const yaw = angle * Math.PI / 180;
  const tilt = .34;
  function rawProject([x, y, z]) {
    const horizontal = x * Math.cos(yaw) - z * Math.sin(yaw);
    const depth = x * Math.sin(yaw) + z * Math.cos(yaw);
    return [horizontal, -(y * Math.cos(tilt) - depth * Math.sin(tilt)), y * Math.sin(tilt) + depth * Math.cos(tilt)];
  }
  const raw = TETRAHEDRON.map(rawProject);
  const minX = Math.min(...raw.map(p => p[0])), maxX = Math.max(...raw.map(p => p[0]));
  const minY = Math.min(...raw.map(p => p[1])), maxY = Math.max(...raw.map(p => p[1]));
  const scale = Math.min((width - 66) / (maxX - minX), (height - 64) / (maxY - minY));
  const project = point => {
    const [x,y,z] = rawProject(point);
    return [width / 2 + scale * (x - (minX + maxX) / 2), height / 2 + scale * (y - (minY + maxY) / 2), z];
  };
  const outer = TETRAHEDRON.map(project);
  const contacts = contactPoints(TETRAHEDRON, weights).map(project);
  const o = project(weightedPoint(TETRAHEDRON, weights));
  const faces = [[0,1,2],[0,1,3],[0,2,3],[1,2,3]].map(face => ({ face, depth: face.reduce((sum,i) => sum + contacts[i][2],0) / 3 })).sort((a,b) => b.depth-a.depth);
  const edges = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
  const visibleFaces = faces.map(({face}) => {
    const [a,b,c] = face.map(i => outer[i]);
    const u = b.map((v,k) => v-a[k]), v = c.map((value,k) => value-a[k]);
    const normal = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
    const other = outer.find((_,i) => !face.includes(i));
    const direction = normal.reduce((sum,value,k) => sum+value*(other[k]-a[k]),0) > 0 ? -1 : 1;
    return {face, visible:normal[2]*direction < 0};
  });
  const outerEdge = (i,j) => visibleFaces.some(({face,visible}) => visible && face.includes(i) && face.includes(j)) ? 'cv-outer-edge' : 'cv-outer-edge cv-outer-back';
  const name = `Four concurrent cevians in a tetrahedron form an inner tetrahedron with ${percent(simplexRatio(weights))} of the outer volume.`;
  return `<svg class="cv-diagram cv-orbit" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${name}" data-cv-tetra-svg><title>${name}</title>${edges.map(([i,j])=>line(outer[i],outer[j],outerEdge(i,j))).join('')}${outer.map((p,i)=>line(p,contacts[i],'cv-cevian')).join('')}${faces.map(({face})=>polygon(face.map(i=>contacts[i]),'cv-tetra-face')).join('')}${edges.map(([i,j])=>line(contacts[i],contacts[j],'cv-inner-edge')).join('')}${contacts.map(p=>`<circle class="cv-contact" cx="${p[0]}" cy="${p[1]}" r="3.5"/>`).join('')}${labels([...outer.map((point,i)=>({point,text:['A₁','A₂','A₃','A₄'][i],preferred:[0,point[1]<height/2?-14:20]})),...contacts.map((point,i)=>({point,text:['X₁','X₂','X₃','X₄'][i],preferred:[12,-8]})),{point:o,text:'O',preferred:[-14,16]}],width,height)}<circle class="cv-point" cx="${o[0]}" cy="${o[1]}" r="5"/></svg>`;
}

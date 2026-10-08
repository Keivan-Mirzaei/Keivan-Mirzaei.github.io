import { writeFile } from 'node:fs/promises';
import { GRAPH_VERTICES, GRAPH_EDGES, sampleEdge, toSphere, INITIAL_POINT, faceAt, faceTriangles, NORTH } from '../assets/js/lib/stereographic-math.mjs';

const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const unit = a => a.map(x => x / Math.hypot(...a));
const eye = unit([4, -6, 3.5]), right = unit(cross([0, 0, 1], eye)), up = cross(eye, right);
const project = p => [360 + 97 * dot(p, right), 335 - 97 * dot([p[0], p[1], p[2] - .7], up)];
const path = points => points.map((p, i) => `${i ? 'L' : 'M'}${project(p).map(x => x.toFixed(2)).join(' ')}`).join(' ');
const label = (p, value, dx = 0, dy = 0, color = '#282e29') => {
  const [x, y] = project(p);
  return `<text x="${x + dx}" y="${y + dy}" fill="${color}" font-family="system-ui, sans-serif" font-size="26">${value}</text>`;
};
const circle = (p, color, radius = 6) => {
  const [x, y] = project(p);
  return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="#f7f8f3" stroke-width="2"/>`;
};
const output = [];
const plane = Array.from({ length: 129 }, (_, i) => [3*Math.cos(i*Math.PI/64), 3*Math.sin(i*Math.PI/64), 0]);
output.push(`<path d="${path(plane)}Z" fill="#e9ede2"/>`);
for (let i=-2; i<=2; i++) {
  const e=Math.sqrt(9-i*i);
  output.push(`<path d="${path([[-e,i,0],[e,i,0]])} ${path([[i,-e,0],[i,e,0]])}" fill="none" stroke="#bfc8b5" stroke-width="1" opacity=".5"/>`);
}
const match = { plane: INITIAL_POINT, sphere: toSphere(INITIAL_POINT), face: faceAt(INITIAL_POINT) };
const triangles = faceTriangles(match.face, false, 12);
for(let i=0;i<triangles.length;i+=9) output.push(`<path d="${path([triangles.slice(i,i+3),triangles.slice(i+3,i+6),triangles.slice(i+6,i+9)])}Z" fill="#a85928" fill-opacity=".38"/>`);
GRAPH_EDGES.forEach(([i,j], edge) => output.push(`<path d="${path([[...GRAPH_VERTICES[i],0],[...GRAPH_VERTICES[j],0]])}" fill="none" stroke="${'#285b46'}" stroke-width="3.2"/>`));
GRAPH_VERTICES.forEach(p => output.push(circle([...p,0], '#285b46', 4)));
const [cx,cy]=project([0,0,1]);
output.push(`<circle cx="${cx}" cy="${cy}" r="97" fill="#91b6a0" fill-opacity=".2" stroke="#809b89" stroke-width="1.3"/>`);
for(let a=0;a<3;a++) {
  const angle=a*Math.PI/3;
  const points=Array.from({length:129},(_,i)=>{const t=i*Math.PI/64;return [Math.sin(t)*Math.cos(angle),Math.sin(t)*Math.sin(angle),1+Math.cos(t)];});
  output.push(`<path d="${path(points)}" fill="none" stroke="#809b89" stroke-width="1" opacity=".3"/>`);
}
const sphericalFace = faceTriangles(match.face, true, 20);
for(let i=0;i<sphericalFace.length;i+=9) output.push(`<path d="${path([sphericalFace.slice(i,i+3),sphericalFace.slice(i+3,i+6),sphericalFace.slice(i+6,i+9)])}Z" fill="#a85928" fill-opacity=".38"/>`);
GRAPH_EDGES.forEach((_,edge)=> {
  const points=sampleEdge(edge);
  output.push(`<path d="${path(points)}" fill="none" stroke="${'#285b46'}" stroke-width="3.4"/>`);
});
output.push(`<path d="${path([NORTH,[...match.plane,0]])}" fill="none" stroke="#a85928" stroke-width="2.1"/>`);
output.push(circle(NORTH,'#282e29'),circle(match.sphere,'#a85928'),circle([...match.plane,0],'#a85928'));
output.push(label(NORTH,'N = ∞',-18,-15),label(match.sphere,'P',13,-7,'#a85928'),label([...match.plane,0],'Q',14,18,'#a85928'),label([1.85,-1.8,0],'Plane',0,25,'#686e66'));
await writeFile(new URL('../assets/figures/stereographic-graph-preview.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="520" viewBox="0 0 720 520" role="img" aria-labelledby="sp-preview-title sp-preview-description"><title id="sp-preview-title">A planar graph and its image on a sphere</title><desc id="sp-preview-description">The cube graph with eight vertices, twelve edges, and six faces is drawn on a tangent plane and mapped onto a sphere. An orange line connects the north pole N, sphere point P, and plane point Q.</desc><rect width="720" height="520" fill="#f7f8f3"/>${output.join('')}</svg>\n`);
console.log('Generated the static preview from the shared stereographic model.');

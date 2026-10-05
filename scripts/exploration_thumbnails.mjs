// Self-contained exploration artwork, using the site's shared mathematical models.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { PHASE_AVERAGE, successProbability, limitingProbability } from '../assets/js/lib/magician-math.mjs';
import { PROOF_EXAMPLE, coastline } from '../assets/js/lib/hex-math.mjs';
import { hexPoint } from '../assets/js/lib/hex-view.mjs';
import { TRIANGLE_SHAPES, triangleData } from '../assets/js/lib/cevian-math.mjs';
import { BOARDS, pressEffect } from '../assets/js/lib/lights-out-math.mjs';
import { NODES, TORUS_ROUTES, nodeById } from '../assets/js/lib/three-utilities-math.mjs';
import { makePointSet, classify } from '../assets/js/lib/four-equal-regions.mjs';

const directory = new URL('../assets/images/exploration-thumbnails/', import.meta.url);
mkdirSync(directory, { recursive: true });
const coordinate = value => value.toFixed(2);
const path = points => points.map(([x, y], index) => `${index ? 'L' : 'M'}${coordinate(x)},${coordinate(y)}`).join(' ');
const polygon = points => points.map(point => point.map(coordinate).join(',')).join(' ');
const formulas = JSON.parse(readFileSync(new URL('exploration-formulas.json', import.meta.url), 'utf8'));
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

function save(slug, title, description, artwork) {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="410" viewBox="0 0 440 410" role="img" aria-labelledby="${slug}-title ${slug}-description">
  <title id="${slug}-title">${escape(title)}</title>
  <desc id="${slug}-description">${escape(description)}</desc>
  <rect width="440" height="410" fill="#fcfcf9"/>
  ${artwork}
</svg>\n`;
  writeFileSync(new URL(`${slug}.svg`, directory), markup);
}

function formula(name, x, y, width, height) {
  const { path: outline, bounds: [left, bottom, w, h] } = formulas[name];
  const scale = Math.min(width / w, height / h);
  return `<g fill="#285b46" transform="translate(${coordinate(x)} ${coordinate(y)}) scale(${coordinate(scale)} ${coordinate(-scale)}) translate(${coordinate(-left - w / 2)} ${coordinate(-bottom - h / 2)})"><path d="${outline}"/></g>`;
}

// The overview follows the exact probabilities on a logarithmic audience scale.
const overview = Array.from({ length: 127 }, (_, index) => {
  const n = index + 2;
  return [52 + 56 * (Math.log2(n) - 1), 187 - 1900 * (successProbability(n) - PHASE_AVERAGE)];
});

// Magnify three complete periods of the actual limiting ripple. Start at a
// baseline crossing, so the enlarged curve joins the quiet reference cleanly.
let lower = .1, upper = .3;
for (let step = 0; step < 48; step += 1) {
  const middle = (lower + upper) / 2;
  if (limitingProbability(middle) > PHASE_AVERAGE) lower = middle;
  else upper = middle;
}
const phase = (lower + upper) / 2;
const ripple = Array.from({ length: 181 }, (_, index) => [
  174 + 180 * index / 180,
  187 - 4.8e6 * (limitingProbability(phase + 3 * index / 180) - PHASE_AVERAGE)
]);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="410" viewBox="0 0 440 410" role="img" aria-labelledby="magician-logo-title magician-logo-description">
  <title id="magician-logo-title">The magician’s problem</title>
  <desc id="magician-logo-description">A probability curve appears to settle. A magnifying glass reveals its persistent repeating ripple. The wave inside the lens is enlarged from the exploration’s mathematical model.</desc>
  <rect width="440" height="410" fill="#fcfcf9"/>
  <path d="${path(overview)}" fill="none" stroke="#686e66" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M335 260L384 309" fill="none" stroke="#285b46" stroke-width="14" stroke-linecap="round"/>
  <circle cx="264" cy="187" r="104" fill="#f3f4ef" stroke="#285b46" stroke-width="5"/>
  <path d="M174 187H354" fill="none" stroke="#cdd4cb" stroke-width="2"/>
  <path d="${path(ripple)}" fill="none" stroke="#285b46" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

writeFileSync(new URL('magicians-problem.svg', directory), svg);

// Hex: the same game geometry, with the article's actual proof coastline.
const coast = coastline(PROOF_EXAMPLE, 5);
const geometry = coast.geometry;
const vertices = [...geometry.points.values()].map(hexPoint);
const xs = vertices.map(point => point[0]), ys = vertices.map(point => point[1]);
const middle = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
const scale = 332 / (Math.max(...ys) - Math.min(...ys));
const project = point => hexPoint(point).map((value, axis) => [220, 205][axis] + scale * (value - middle[axis]));
const cells = geometry.cells.map((cell, index) => `<polygon points="${polygon(cell.vertices.map(project))}" fill="${PROOF_EXAMPLE[index] === 1 ? '#ead6d2' : '#d8e5ed'}"/>`).join('');
const borders = geometry.edges.filter(edge => edge.faces[0] >= 0 && edge.faces[1] < 0).map(edge => `<path d="${path([project(geometry.points.get(edge.from)), project(geometry.points.get(edge.to))])}" stroke="${[-1, -2].includes(edge.faces[1]) ? '#a74740' : '#306a97'}"/>`).join('');
const coastlinePath = path(coast.vertices.map(key => project(geometry.points.get(key))));
save('hex', 'Hex: a game with no middle ground', 'A red and blue diamond Hex board with the proof’s coastline traced from the top to the left corner.', `<g stroke="#fcfcf9" stroke-width="2">${cells}</g><g fill="none" stroke-width="6" stroke-linecap="round">${borders}<path d="${coastlinePath}" stroke="#fcfcf9" stroke-width="10"/><path d="${coastlinePath}" stroke="#285b46" stroke-width="5" stroke-linejoin="round"/></g>`);

// Cevian triangles: equal weights produce the exact maximum-area medial triangle.
const triangle = triangleData(TRIANGLE_SHAPES.tall, [1, 1, 1]);
const triangleProject = ([x, y]) => [220 + (x - .5) * 640, 55 + (y - .04) * 316];
const outer = triangle.vertices.map(triangleProject), inner = triangle.contacts.map(triangleProject);
const cevians = outer.map((vertex, index) => `<path d="${path([vertex, inner[index]])}"/>`).join('');
save('cevian-triangles', 'How big can a cevian triangle be?', 'An outer triangle with three cevians and a shaded green medial triangle.', `<g fill="none" stroke="#c4cbbf" stroke-width="3">${cevians}</g><polygon points="${polygon(outer)}" fill="none" stroke="#686e66" stroke-width="4" stroke-linejoin="round"/><polygon points="${polygon(inner)}" fill="#e5ece2" stroke="#285b46" stroke-width="5" stroke-linejoin="round"/>`);

// Lights Out: pressing the two endpoints of the article's path flips every light.
const lights = BOARDS['path-4'];
const effect = pressEffect(lights, (1 << 0) | (1 << 3));
if (effect !== lights.all) throw new Error('The logo must show a valid complete complement.');
const lightDiagram = (x, state, pressed = false) => {
  const positions = lights.positions.map(([u]) => [x, 40 + 325 * u]);
  const edges = lights.edges.map(([a, b]) => `<path d="${path([positions[a], positions[b]])}"/>`).join('');
  const nodes = positions.map(([px, py], index) => `${pressed && [0, 3].includes(index) ? `<circle cx="${px}" cy="${coordinate(py)}" r="27" fill="none" stroke="#285b46" stroke-width="3"/>` : ''}<circle cx="${px}" cy="${coordinate(py)}" r="18" fill="${state & (1 << index) ? '#e8c478' : '#fcfcf9'}" stroke="${state & (1 << index) ? '#b18b42' : '#a7afa3'}" stroke-width="3"/>`).join('');
  return `<g fill="none" stroke="#c4cbbf" stroke-width="4">${edges}</g>${nodes}`;
};
save('lights-out', 'Lights Out: every light can be flipped', 'Four connected amber lights become four unlit lights. Green rings mark the two endpoint presses that flip every light.', `${lightDiagram(112, lights.all, true)}<path d="M173 205H267M253 191L267 205L253 219" fill="none" stroke="#285b46" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>${lightDiagram(328, lights.all ^ effect)}`);

// Three utilities: the nine valid pipes on the torus's square representation.
const utilityProject = ([x, y]) => [66 + x * 308, 51 + y * 308];
const pipes = TORUS_ROUTES.map(edge => edge.parts.map(part => `<path d="${path(part.map(utilityProject))}" stroke="${nodeById(edge.utility).color}"/>`).join('')).join('');
const utilityNodes = NODES.map(node => {
  const [x, y] = utilityProject(node.point);
  return node.kind === 'house'
    ? `<path d="M${coordinate(x - 13)} ${coordinate(y - 1)}L${coordinate(x)} ${coordinate(y - 13)}L${coordinate(x + 13)} ${coordinate(y - 1)}H${coordinate(x + 10)}V${coordinate(y + 11)}H${coordinate(x - 10)}V${coordinate(y - 1)}Z" fill="#fcfcf9" stroke="#285b46" stroke-width="3" stroke-linejoin="round"/>`
    : `<circle cx="${coordinate(x)}" cy="${coordinate(y)}" r="12" fill="#fcfcf9" stroke="${node.color}" stroke-width="4"/>`;
}).join('');
const seams = TORUS_ROUTES.filter(edge => edge.seam).flatMap(edge => [edge.parts[0].at(-1), edge.parts[1][0]]).map(point => {
  const [x, y] = utilityProject(point);
  return `<circle cx="${coordinate(x)}" cy="${coordinate(y)}" r="5" fill="#fcfcf9" stroke="#285b46" stroke-width="2.5"/>`;
}).join('');
save('three-utilities', 'Three utilities: from the plane to a mug', 'Three houses connect to three utilities through nine pipes on a square whose matching opposite sides represent a torus. Paired boundary dots show where two pipes continue across the seams.', `<path d="M66 51H374M66 359H374" fill="none" stroke="#285b46" stroke-width="4" stroke-dasharray="10 8"/><path d="M66 51V359M374 51V359" fill="none" stroke="#846b9c" stroke-width="4" stroke-dasharray="10 8"/><g fill="none" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${pipes}</g>${utilityNodes}${seams}`);

// Four regions: use a solved, general-position set, with three points per region.
const partition = makePointSet(71084239, 3);
const pose = partition.solution.pose, regions = classify(partition.points, pose);
if (regions.boundary || !regions.counts.every(count => count === 3)) throw new Error('The logo must show four equal point groups.');
const pointProject = point => [220 + 175 * (point.x - pose.x), 205 - 175 * (point.y - pose.y)];
const cuts = [pose.a, pose.b].map((angle, index) => `<path d="${path([pointProject({ x: pose.x - Math.cos(angle), y: pose.y - Math.sin(angle) }), pointProject({ x: pose.x + Math.cos(angle), y: pose.y + Math.sin(angle) })])}"${index ? ' stroke-dasharray="10 8"' : ''}/>`).join('');
const regionColors = ['#347457', '#b1643e', '#4c7d99', '#846b9c'];
const dots = partition.points.map((point, index) => {
  const [x, y] = pointProject(point);
  return `<circle cx="${coordinate(x)}" cy="${coordinate(y)}" r="9" fill="${regionColors[regions.membership[index]]}"/>`;
}).join('');
save('four-equal-regions', 'Four equal regions: two bisections and a turn', 'Two perpendicular lines, one solid and one dashed, divide twelve points into four coloured groups of three.', `<g fill="none" stroke="#285b46" stroke-width="4" stroke-linecap="round">${cuts}</g>${dots}`);

save('conditional-probabilities-and-expectations', 'Conditional Probabilities and Expectations', 'The properly typeset expression P of A given B represents conditional probability.', formula('conditional', 220, 205, 316, 112));

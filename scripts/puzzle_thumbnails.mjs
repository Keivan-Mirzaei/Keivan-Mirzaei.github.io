// Regenerate the catalogue illustrations using the actual puzzle geometry.
// Keep separate artwork for script-free fallbacks, which have different proportions.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { hexGeometry } from '../assets/js/lib/hex-math.mjs';
import { hexPoint } from '../assets/js/lib/hex-view.mjs';
import { createLightsOutBook } from '../assets/js/lib/lights-out-book.mjs';

const directory = new URL('../assets/images/puzzle-thumbnails/', import.meta.url);
mkdirSync(directory, { recursive: true });
const number = value => value.toFixed(2);
function save(name, title, description, artwork) {
  writeFileSync(new URL(`${name}.svg`, directory), `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="410" viewBox="0 0 440 410" role="img" aria-labelledby="title description"><title id="title">${title}</title><desc id="description">${description}</desc><rect width="440" height="410" fill="#fcfcf9"/>${artwork}</svg>\n`);
}

const geometry = hexGeometry(5);
const points = geometry.cells.flatMap(cell => cell.vertices.map(hexPoint));
const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
const center = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
const scale = 342 / (Math.max(...ys) - Math.min(...ys));
const project = point => hexPoint(point).map((value, axis) => number([220, 205][axis] + (value - center[axis]) * scale)).join(',');
const cells = geometry.cells.map(cell => `<polygon points="${cell.vertices.map(project).join(' ')}"/>`).join('');
const borders = geometry.edges.filter(edge => edge.faces[0] >= 0 && edge.faces[1] < 0).map(edge => `<path d="M${project(geometry.points.get(edge.from))}L${project(geometry.points.get(edge.to))}" stroke="${edge.faces[1] === -1 || edge.faces[1] === -2 ? '#a74740' : '#306a97'}"/>`).join('');
save('hex', 'Hex', 'An upright diamond of twenty-five hexagons. Red connects the upper-right and lower-left sides; Blue connects the upper-left and lower-right sides.', `<g fill="#fcfcf9" stroke="#cdd4cb" stroke-width="1.8">${cells}</g><g fill="none" stroke-width="6" stroke-linecap="round">${borders}</g>`);

function existingArtwork(name) {
  return readFileSync(new URL(`../assets/images/${name}-board.svg`, import.meta.url), 'utf8')
    .replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '')
    .replace(/<(title|desc)\b[^>]*>[\s\S]*?<\/\1>/g, '');
}
const klotski = existingArtwork('klotski').replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, '');
save('klotski', 'Klotski', 'Ivory sliding blocks surround a green goal square above the bottom exit.', `<g transform="translate(84 36) scale(.68)">${klotski}</g>`);

const { graph, start } = createLightsOutBook().puzzle;
const position = index => graph.positions[index].map(value => number(35 + 340 * value));
const edges = graph.edges.map(([a, b]) => `<path d="M${position(a).join(',')}L${position(b).join(',')}"/>`).join('');
const lights = graph.positions.map((_, index) => {
  const [x, y] = position(index), on = Boolean(start & (1 << index));
  return `<circle cx="${x}" cy="${y}" r="20" fill="${on ? '#e8c478' : '#fcfcf9'}" stroke="${on ? '#b18b42' : '#a7afa3'}" stroke-width="2"/>${on ? `<circle cx="${x}" cy="${y}" r="26" fill="none" stroke="#e8c478" stroke-opacity=".3" stroke-width="4"/>` : ''}`;
}).join('');
save('lights-out', 'Lights Out', 'The first Easy puzzle: six unnumbered lights connected in an open loop, with one amber light on.', `<g transform="translate(15 0)"><rect x="35" y="35" width="340" height="340" rx="16" fill="#f3f4ed" stroke="#dce1d5"/><g fill="none" stroke="#c4cbbf" stroke-width="2.5" stroke-linecap="round">${edges}</g>${lights}</g>`);

save('tiling', 'Floor tiling', 'A floor grid with three missing squares beside four coloured tiles.', `<g transform="translate(11 34) scale(.95)">${existingArtwork('tiling')}</g>`);

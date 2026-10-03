// Regenerate the readable, script-free board and coastline illustrations.
import { writeFileSync } from 'node:fs';
import { hexGeometry, coastline, PROOF_EXAMPLE } from '../assets/js/lib/hex-math.mjs';
import { hexPoint, hexLayout, hexCorner } from '../assets/js/lib/hex-view.mjs';

function fitDiamond(geometry, proof) {
  const points = [...geometry.points.values()].map(hexPoint);
  const minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1])), maxY = Math.max(...points.map(p => p[1]));
  const box = hexLayout(geometry, true);
  const scale = proof ? Math.min(410 / box.width, 600 / box.height) : Math.min(300 / (maxX - minX), 464 / (maxY - minY));
  return p => {
    const [x, y] = hexPoint(p);
    return [205 + (x - (minX + maxX) / 2) * scale, 300 + (y - (minY + maxY) / 2) * scale];
  };
}
function illustration(cells, proof = false) {
  const coast = proof ? coastline(cells, 5) : null, geometry = coast?.geometry || hexGeometry(5);
  const point = fitDiamond(geometry, proof);
  const pair = p => point(p).map(v => v.toFixed(2)).join(',');
  const polygons = geometry.cells.map((cell, i) => `<polygon points="${cell.vertices.map(pair).join(' ')}" fill="${coast?.path.includes(i) ? cells[i] === 1 ? '#f0d9d1' : '#d6e5ef' : '#fcfcf9'}" stroke="#cdd4cb"/>`).join('');
  const radius = Math.abs(point([1, -1])[0] - point([0, 0])[0]) * .76;
  const stones = geometry.cells.map((cell, i) => {
    if (!cells[i]) return '';
    const [x, y] = point(cell.center);
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius.toFixed(2)}" fill="${cells[i] === 1 ? '#a74740' : '#306a97'}"/>`;
  }).join('');
  const borders = geometry.edges.filter(e => e.faces[0] >= 0 && e.faces[1] < 0).map(e => `<path d="M${pair(geometry.points.get(e.from))}L${pair(geometry.points.get(e.to))}" stroke="${e.faces[1] === -1 || e.faces[1] === -2 ? '#a74740' : '#306a97'}"/>`).join('');
  const lines = proof ? `<g fill="none" stroke="#686e66" stroke-width="2">${geometry.ports.map(p => `<path d="M${pair(geometry.points.get(p.vertex))}L${pair(geometry.points.get(p.corner))}"/>`).join('')}</g><polyline points="${coast.vertices.map(v => pair(geometry.points.get(v))).join(' ')}" fill="none" stroke="#282e29" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${geometry.ports.map(p => {
    const [x, y] = point(geometry.points.get(p.vertex)), corner = hexCorner(p.name);
    const dx = corner === 'left' ? -8 : corner === 'right' ? 8 : 0;
    const dy = corner === 'top' ? -10 : corner === 'bottom' ? 22 : 5;
    const anchor = corner === 'left' ? 'end' : corner === 'right' ? 'start' : 'middle';
    return `<text x="${(x + dx).toFixed(2)}" y="${(y + dy).toFixed(2)}" text-anchor="${anchor}">${p.name === 'NW' ? 'Start' : corner[0].toUpperCase() + corner.slice(1)}</text>`;
  }).join('')}` : '<g font-size="13"><text x="80" y="150" fill="#306a97">Blue<tspan x="80" dy="18">upper-left</tspan></text><text x="330" y="150" fill="#a74740">Red<tspan x="330" dy="18">upper-right</tspan></text><text x="80" y="450" fill="#a74740">Red<tspan x="80" dy="18">lower-left</tspan></text><text x="330" y="450" fill="#306a97">Blue<tspan x="330" dy="18">lower-right</tspan></text></g>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 410 600" role="img" aria-labelledby="title desc"><title id="title">${proof ? 'A coastline finds a winner' : 'The upright diamond Hex board'}</title><desc id="desc">${proof ? 'An upright diamond Hex board with solid red and blue stones. A coastline runs from the top corner to the left corner. Tinted cell backgrounds show the winning Red chain from upper-right to lower-left.' : 'Twenty-five hexagonal cells form a diamond with its long diagonal vertical. Red joins the upper-right and lower-left sides; Blue joins the upper-left and lower-right sides.'}</desc><g>${polygons}${stones}</g><g fill="none" stroke-width="5" stroke-linecap="round">${borders}</g><g font-family="system-ui, sans-serif" font-size="15" text-anchor="middle" fill="#282e29">${lines}</g></svg>\n`;
}
writeFileSync(new URL('../assets/images/hex-board.svg', import.meta.url), illustration(Array(25).fill(0)));
writeFileSync(new URL('../assets/images/hex-coastline.svg', import.meta.url), illustration(PROOF_EXAMPLE, true));

// Static card and script-free board use the same points and geometry as the game.
import { writeFileSync } from 'node:fs';
import { initialPose, makePointSet, classify, normal, direction, dot, clipHalfPlane } from '../assets/js/lib/four-equal-regions.mjs';

const { points } = makePointSet(71084239, 6), pose = initialPose(), result = classify(points, pose);
const colors = ['#347457', '#b1643e', '#4c7d99', '#846b9c'];
const round = value => Number(value.toFixed(2));
function artwork(width, height) {
  const scale = Math.min((width - 40) / 2, (height - 40) / 1.3);
  const sx = x => round(width / 2 + x * scale), sy = y => round(height / 2 - y * scale);
  const rectangle = [{ x: -width / scale / 2, y: -height / scale / 2 }, { x: width / scale / 2, y: -height / scale / 2 }, { x: width / scale / 2, y: height / scale / 2 }, { x: -width / scale / 2, y: height / scale / 2 }];
  const u = normal(pose.a), v = normal(pose.b);
  const regions = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map((sign, index) => {
    const polygon = clipHalfPlane(clipHalfPlane(rectangle, u, dot(u, pose), sign[0]), v, dot(v, pose), sign[1]);
    return `<polygon points="${polygon.map(point => `${sx(point.x)},${sy(point.y)}`).join(' ')}" fill="${colors[index]}" opacity=".045"/>`;
  }).join('');
  const lines = [pose.a, pose.b].map((angle, index) => {
    const t = direction(angle);
    return `<path d="M${sx(pose.x - 5 * t.x)} ${sy(pose.y - 5 * t.y)}L${sx(pose.x + 5 * t.x)} ${sy(pose.y + 5 * t.y)}" stroke="#285b46" stroke-width="1.6"${index ? ' stroke-dasharray="7 5"' : ''}/>`;
  }).join('');
  const marks = points.map((point, index) => `<circle cx="${sx(point.x)}" cy="${sy(point.y)}" r="4.5" fill="${colors[result.membership[index]]}" stroke="#fcfcf9" stroke-width="1.7"/>`).join('');
  return `<defs><clipPath id="field"><rect width="${width}" height="${height}" rx="12"/></clipPath></defs><rect width="${width}" height="${height}" rx="12" fill="#f7f8f3" stroke="#e0e4dc"/><g clip-path="url(#field)">${regions}${lines}${marks}</g>`;
}
const svg = (width, height, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description"><title id="title">Four equal regions</title><desc id="description">Twenty-four coloured points divided by a solid and a dashed line. Move the lines until every region has six points.</desc>${content}</svg>\n`;
writeFileSync(new URL('../assets/images/four-equal-regions-board.svg', import.meta.url), svg(560, 350, artwork(560, 350)));
const counts = result.counts.map((count, i) => `<g transform="translate(${50 + i * 100} 349)"><circle r="3.5" fill="${colors[i]}"/><text x="12" y="4" fill="#686e66" font-size="13" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif">${'ABCD'[i]} ${count}</text></g>`).join('');
writeFileSync(new URL('../assets/images/puzzle-thumbnails/four-equal-regions.svg', import.meta.url), svg(440, 410, `<rect width="440" height="410" fill="#fcfcf9"/><g transform="translate(20 50)">${artwork(400, 270)}</g>${counts}`));

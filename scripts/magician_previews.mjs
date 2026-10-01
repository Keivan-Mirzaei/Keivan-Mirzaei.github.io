// Static, readable fallbacks use the same numerical curves as the interactive page.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { overviewChart, rippleChart, routesChart } from '../assets/js/lib/magician-charts.mjs';

const folder = fileURLToPath(new URL('../_includes/widgets/', import.meta.url));
for (const [name, markup] of [['overview', overviewChart(640)], ['ripple', rippleChart(640)], ['routes', routesChart(640)]]) {
  fs.writeFileSync(`${folder}magician-${name}.svg`, `${markup}\n`);
}
const people = Array.from({ length: 64 }, (_, index) => `<circle class="mp-person" data-player="${index}" cx="${(12 + 616 * (index % 16) / 15).toFixed(2)}" cy="${14 + Math.floor(index / 16) * 22}" r="4.5"/>`).join('');
fs.writeFileSync(`${folder}magician-audience.svg`, `<svg role="img" aria-label="An audience of 64 people, all still standing" viewBox="0 0 640 100" height="100"><title>An audience of 64</title>${people}</svg>\n`);
console.log('Generated four magician exploration diagrams.');

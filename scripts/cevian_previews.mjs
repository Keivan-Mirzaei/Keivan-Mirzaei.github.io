import { readFile, writeFile } from 'node:fs/promises';
import { triangleDiagram, factorsDiagram, landscapeDiagram, tetrahedronDiagram } from '../assets/js/lib/cevian-diagrams.mjs';

// Static diagrams keep both proofs readable if JavaScript is unavailable.
const previews = {
  'cevian-main': triangleDiagram(720),
  'cevian-ceva': triangleDiagram(720, [.5, .1875, .3125], 'scalene', 'ceva', false, false),
  'cevian-corners': triangleDiagram(720, [.5, .1875, .3125], 'scalene', 'corners', false, false),
  'cevian-factors': factorsDiagram(720),
  'cevian-landscape': landscapeDiagram(720),
  'cevian-tetra': tetrahedronDiagram(720)
};
const drawingStyles = ':root { --ink:#282e29; --muted:#686e66; --green:#285b46; --paper:#fcfcf9; --sans:system-ui,sans-serif; --cv-gold:#bc8e46; --cv-blue:#879da7; --cv-rose:#bd8e82; }' + (await readFile(new URL('../assets/css/cevian.css', import.meta.url), 'utf8')).split('\n').filter(line => line.startsWith('.cv-')).join('\n');
for (const [name, svg] of Object.entries(previews)) {
  const landscape = name === 'cevian-landscape';
  const output = landscape ? '../assets/images/cevian-landscape.svg' : '../_includes/widgets/' + name + '.svg';
  const drawing = landscape ? svg.replace('><', '><style>' + drawingStyles + '</style><') : svg;
  await writeFile(new URL(output, import.meta.url), drawing + '\n');
}

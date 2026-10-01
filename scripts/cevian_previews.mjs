import { writeFile } from 'node:fs/promises';
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
for (const [name, svg] of Object.entries(previews)) {
  await writeFile(new URL('../_includes/widgets/' + name + '.svg', import.meta.url), svg + '\n');
}

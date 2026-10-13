import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sectionState } from '../assets/js/lib/lagrange-math.mjs';
import { planDiagram } from '../assets/js/lib/lagrange-diagrams.mjs';
import { surfaceDiagram } from '../assets/js/lib/lagrange-surfaces.mjs';
import { logoSvg } from './lib/logo-svg.mjs';
const path=name=>fileURLToPath(new URL(`../${name}`,import.meta.url));
const save=(name,content)=>writeFileSync(path(name),content);
const css=readFileSync(path('assets/css/lagrange-multipliers.css'),'utf8').split('\n').filter(line=>line.startsWith('.lm-svg')).join('\n');
const styles=`<style>svg{--paper:#fcfcf9;--sidebar:#f3f4ef;--ink:#282e29;--muted:#686e66;--line:#e0e4dc;--green:#285b46;--lm-objective:#a8592b;--sans:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}${css}</style>`;
function figure(name,svg,title,description) {
  const [,width,height]=svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const output=svg.replace('aria-hidden="true"',`xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-labelledby="${name}-title ${name}-desc"`)
    .replace(/(<svg[^>]*>)/,`$1<title id="${name}-title">${title}</title><desc id="${name}-desc">${description}</desc>${styles}`);
  save(`assets/figures/${name}.svg`,output+'\n');
}
const state=sectionState();
figure('lagrange-sections',planDiagram(state,580,'lagrange-preview'),'Contours and gradients','Two families of elliptical contours, with both gradients at the initial feasible point.');
for(const kind of ['f','g']) {
  figure(`lagrange-surface-${kind}`,surfaceDiagram(state,kind,300,45,35,'lagrange-preview'),`${kind} height field with contours`,`A quadratic surface with elliptical contours, the lifted feasible curve, and a gradient arrow in the xy plane.`);
}
const formula=JSON.parse(readFileSync(path('scripts/exploration-formulas.json'),'utf8')).lagrange;
const [x,y,width,height]=formula.bounds,scale=250/height;
const artwork=`<g transform="translate(${220-scale*(x+width/2)} ${205+scale*(y+height/2)}) scale(${scale} ${-scale})"><path d="${formula.path}" fill="#285b46"/></g>`;
save('assets/images/exploration-thumbnails/lagrange-multipliers.svg',logoSvg('lagrange-logo','Lagrange multiplier','The Greek letter lambda in green.',artwork));

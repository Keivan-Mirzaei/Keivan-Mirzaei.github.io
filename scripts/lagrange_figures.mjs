import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sectionState, MINIMUM_ANGLE, constraintPoint, objectiveContour } from '../assets/js/lib/lagrange-math.mjs';
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
  figure(`lagrange-surface-${kind}`,surfaceDiagram(state,kind,300,45,35,'lagrange-preview'),`${kind} height field with contours`,`A quadratic surface with noncircular horizontal level curves, the lifted feasible curve, and ascent directions.`);
}
const minimum=sectionState(MINIMUM_ANGLE),scale=90,origin=[130,205];
const map=([x,y])=>[origin[0]+scale*x,origin[1]-scale*y];
const curve=(kind,level)=>Array.from({length:241},(_,i)=>{const point=kind==='f'?objectiveContour(i*1.5,level):constraintPoint(i*1.5,level);return `${i?'L':'M'}${map(point).join(' ')}`;}).join(' ')+'Z';
const [px,py]=map(minimum.point);
const arrow=(gradient,color,marker,dash='')=>{const end=map(minimum.point.map((x,i)=>x+.2*gradient[i]));return `<path d="M${px} ${py}L${end.join(' ')}" fill="none" stroke="${color}" stroke-width="4" ${dash} marker-end="url(#${marker})"/>`;};
const artwork=`<defs><marker id="lagrange-logo-f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#a8592b"/></marker><marker id="lagrange-logo-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#285b46"/></marker></defs>
<path d="${curve('f',minimum.value)}" fill="none" stroke="#a8592b" stroke-width="4"/>
<path d="${curve('g',1)}" fill="none" stroke="#285b46" stroke-width="4"/>
${arrow(minimum.gradF,'#a8592b','lagrange-logo-f')}${arrow(minimum.gradG,'#285b46','lagrange-logo-g','stroke-dasharray="7 4"')}
<circle cx="${px}" cy="${py}" r="5" fill="#282e29" stroke="#fcfcf9" stroke-width="2"/>`;
save('assets/images/exploration-thumbnails/lagrange-multipliers.svg',logoSvg('lagrange-logo','Tangency on an ellipse','An elliptical objective contour touches an elliptical constraint. Their gradients at the contact point point in opposite directions.',artwork));

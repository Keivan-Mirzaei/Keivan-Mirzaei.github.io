export function initializeApplications(document, MathJax) {
  'use strict';
  const green = '#285b46', amber = '#a67936', blue = '#617a9a', ink = '#686e66';
  const NS = 'http://www.w3.org/2000/svg';
  const dashedStroke = { 'stroke-width': 2.4, 'stroke-dasharray': '6 5', 'stroke-linecap': 'butt', 'vector-effect': 'non-scaling-stroke' };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const fmt = (x, digits = 2) => Math.abs(x) < 0.5 * 10 ** -digits ? (0).toFixed(digits) : x.toFixed(digits).replace('-', '−');
  const profiles = {
    turns: { name: 'Turning points', tex: 'x^3-3x', f: x => x ** 3 - 3 * x, d: x => 3 * x ** 2 - 3, dd: x => 6 * x, ranges: [[-3, 3], [-4, 10], [-13, 13]] },
    crossing: { name: 'Stationary crossing', tex: 'x^3', f: x => x ** 3, d: x => 3 * x ** 2, dd: x => 6 * x, ranges: [[-9, 9], [-1, 13], [-13, 13]] },
    minimum: { name: 'Flat minimum', tex: 'x^4', f: x => x ** 4, d: x => 4 * x ** 3, dd: x => 12 * x ** 2, ranges: [[-1, 17], [-34, 34], [-3, 51]] },
  };
  function element(tag, attrs = {}, parent, text) {
    const el = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    if (text != null) el.textContent = text;
    if (parent) parent.appendChild(el);
    return el;
  }
  const mathCache = new Map();
  function math(tex) {
    if (!mathCache.has(tex)) {
      if (mathCache.size >= 256) mathCache.delete(mathCache.keys().next().value);
      mathCache.set(tex, MathJax.tex2chtml(tex, { display: false, em: 16, ex: 8, containerWidth: 640 }));
    }
    return mathCache.get(tex).cloneNode(true);
  }
  function refreshMathStyles() {
    if (!MathJax.chtmlStylesheet) return;
    const sheet = MathJax.chtmlStylesheet(), current = document.getElementById('MJX-CHTML-styles');
    if (current?.textContent !== sheet.textContent) {
      if (current) current.replaceWith(sheet); else document.head.appendChild(sheet);
    }
  }
  const texNumber = value => String(value).replaceAll('−', '-');
  function line(parent, x1, y1, x2, y2, attrs = {}) { return element('line', { x1, y1, x2, y2, stroke: '#c9d1c6', ...attrs }, parent); }
  let serial = 0;
  for (const root of document.querySelectorAll('[data-applications]')) {
    const mode = root.dataset.applications, svg = root.querySelector('svg');
    const controls = root.querySelector('.applications-controls'), values = root.querySelector('.applications-values');
    const config = {
      linear: { min: 1, max: 7, value: 5.6, label: 'Input x', unit: '', step: .01 },
      ladder: { min: .5, max: 4.8, value: 3, label: 'Foot distance x', unit: 'm', step: .01 },
      mvt: { min: .6, max: 2.8, value: 2, label: 'Right endpoint b', unit: '', step: .01 },
      signs: { min: -2, max: 2, value: -.6, label: 'Input x', unit: '', step: .01 },
      pen: { min: .5, max: 19.5, value: 6, label: 'Depth x', unit: 'm', step: .05 },
    }[mode];
    if (!config || !svg) continue;
    svg.querySelector('[data-applications-fallback]')?.remove();
    const uid = `applications-${++serial}`;
    let current = config.value, profile = 'turns', drag = null;
    controls.hidden = mode !== 'signs'; values.hidden = false;
    if (mode === 'signs') {
      const choices = document.createElement('fieldset'); choices.setAttribute('class', 'scenario-choices');
      const caption = document.createElement('legend'); caption.textContent = 'Choose a function'; choices.appendChild(caption);
      for (const [key, value] of Object.entries(profiles)) {
        const label = document.createElement('label'), input = document.createElement('input'), name = document.createElement('span');
        input.type = 'radio'; input.name = `${uid}-function`; input.value = key; input.checked = key === profile;
        name.textContent = value.name; label.append(input, name); choices.appendChild(label);
        input.addEventListener('change', () => { if (input.checked) { profile = key; render(); } });
      }
      controls.appendChild(choices);
    }
    const defs = element('defs', {}, svg);
    const drawing = element('g', { 'font-family': '-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif' }, svg);
    const handles = [], mathLabels = [];
    function text(parent, x, y, value, attrs = {}) {
      // Ordinary words retain interface typography; every mathematical label uses MathJax.
      const { 'text-anchor': anchor = 'start', fill = ink } = attrs;
      const foreign = element('foreignObject', { x, y: y - 30, width: 300, height: 60, class: 'applications-math-label', 'pointer-events': 'none', 'data-tex': String(value) }, parent);
      const box = document.createElement('div'); box.setAttribute('class', 'applications-math'); box.style.color = fill;
      const content = math(String(value)); box.appendChild(content); foreign.appendChild(box);
      mathLabels.push({ foreign, content, x, y, anchor });
      return foreign;
    }
    function positionMathLabels() {
      const scale = svg.getBoundingClientRect?.().width / 640;
      if (!scale) return;
      const metrics = mathLabels.map(label => ({ ...label, bounds: label.content.getBoundingClientRect() }));
      for (const { foreign, x, y, anchor, bounds } of metrics) {
        const width = Math.ceil(bounds.width / scale) + 2, height = Math.ceil(bounds.height / scale) + 2;
        const left = x - (anchor === 'end' ? width : anchor === 'middle' ? width / 2 : 0);
        foreign.setAttribute('width', width); foreign.setAttribute('height', height);
        foreign.setAttribute('x', clamp(left, 3, 637 - width));
        const plotHeight = Number(svg.getAttribute('viewBox').split(' ')[3]);
        foreign.setAttribute('y', clamp(y - height / 2 - 4, 3, plotHeight - height - 3));
      }
    }
    const legend = document.createElement('div'); legend.setAttribute('class', 'applications-legend'); legend.hidden = true;
    const plot = root.querySelector('.applications-plot');
    if (mode === 'linear' || mode === 'mvt' || mode === 'signs') plot.prepend(legend); else plot.appendChild(legend);
    function setLegend(entries) {
      legend.hidden = !entries.length; legend.replaceChildren();
      for (const { color, tex, label, tangent = false, dashed = false } of entries) {
        const entry = document.createElement('span');
        let key;
        if (dashed) {
          key = element('svg', { class: 'applications-legend-line', width: 20, height: 6, viewBox: '0 0 20 6', 'aria-hidden': 'true', focusable: 'false' });
          line(key, 0, 3, 20, 3, { stroke: color, ...dashedStroke });
        } else {
          key = document.createElement('i');
          key.setAttribute('aria-hidden', 'true'); key.setAttribute('class', 'applications-legend-key');
          key.style.borderColor = color; key.style.opacity = tangent ? '.72' : '1';
        }
        entry.appendChild(key);
        if (tex) entry.appendChild(math(tex)); else { const name = document.createElement('span'); name.textContent = label; entry.appendChild(name); }
        legend.appendChild(entry);
      }
    }
    function panel(xmin, xmax, ymin, ymax, top = 25, bottom = 300, name = '') {
      const left = 62, right = 586;
      const sx = x => left + (x - xmin) / (xmax - xmin) * (right - left);
      const sy = y => bottom - (y - ymin) / (ymax - ymin) * (bottom - top);
      const clipId = `${uid}-clip-${defs.childNodes.length}`;
      const clip = element('clipPath', { id: clipId }, defs);
      element('rect', { x: left, y: top, width: right - left, height: bottom - top }, clip);
      const graph = element('g', { 'clip-path': `url(#${clipId})` }, drawing);
      const axisY = sy(clamp(0, ymin, ymax)), axisX = sx(clamp(0, xmin, xmax));
      line(drawing, left, axisY, right + 8, axisY); line(drawing, axisX, top, axisX, bottom);
      const xticks = xmax - xmin > 10 ? [0, 5, 10, 15, 20] : Array.from({ length: Math.floor(xmax) - Math.ceil(xmin) + 1 }, (_, i) => Math.ceil(xmin) + i);
      for (const x of xticks.filter(x => x >= xmin && x <= xmax)) {
        line(drawing, sx(x), axisY - 3, sx(x), axisY + 3);
        text(drawing, sx(x), axisY + 19, String(x), { 'text-anchor': 'middle' });
      }
      const ystep = ymax - ymin > 100 ? 50 : ymax - ymin > 40 ? 20 : ymax - ymin > 15 ? 5 : ymax - ymin > 7 ? 3 : 1;
      for (let y = Math.ceil(ymin / ystep) * ystep; y <= ymax; y += ystep) {
        if (y === 0) continue;
        line(drawing, axisX - 3, sy(y), axisX + 3, sy(y));
        text(drawing, axisX - 9, sy(y) + 4, String(y), { 'text-anchor': 'end' });
      }
      text(drawing, right + 14, axisY + 42, mode === 'pen' ? String.raw`x\;(\mathrm{m})` : 'x', { 'text-anchor': 'end' });
      text(drawing, axisX + 10, top - 9, mode === 'pen' ? String.raw`A\;(\mathrm{m}^2)` : 'y');
      if (name) text(drawing, right, top - 9, name, { 'text-anchor': 'end', fill: green, 'font-size': 14 });
      function curve(fn, color = green, dashed = false, isTangent = false) {
        const path = Array.from({ length: 401 }, (_, i) => { const x = xmin + (xmax - xmin) * i / 400; return `${i ? 'L' : 'M'}${sx(x)} ${sy(fn(x))}`; }).join('');
        return element('path', { d: path, fill: 'none', stroke: color, 'stroke-width': isTangent ? 3 : 2.4, 'stroke-opacity': isTangent ? .72 : 1, ...(dashed ? dashedStroke : {}) }, graph);
      }
      return { sx, sy, graph, curve, left, right, xmin, xmax, top, bottom };
    }
    function dot(p, x, y, color = green, r = 5) { return element('circle', { cx: p.sx(x), cy: p.sy(y), r, fill: color, stroke: '#fcfcf9', 'stroke-width': 1.7 }, p.graph); }
    function tangent(p, x, y, slope, half = .35, color = amber) { line(p.graph, p.sx(x - half), p.sy(y - slope * half), p.sx(x + half), p.sy(y + slope * half), { stroke: color, 'stroke-width': 3, 'stroke-opacity': .72, 'data-tangent': '' }); }
    function readouts(entries) {
      values.replaceChildren();
      for (const [name, value, tex] of entries) {
        const output = document.createElement('output'); output.dataset.name = name; output.dataset.value = value;
        output.setAttribute('aria-label', `${name} = ${value}`); output.appendChild(math(tex)); values.appendChild(output);
      }
    }
    function handle(p, x, y, ariaLabel, map = z => z) {
      const group = element('g', { class: 'graph-handle', role: 'slider', tabindex: 0, 'aria-label': ariaLabel, 'aria-valuemin': config.min, 'aria-valuemax': config.max, 'aria-valuenow': current, 'aria-valuetext': `${config.label} ${fmt(current)} ${config.unit}` }, drawing);
      element('circle', { cx: p.sx(x), cy: p.sy(y), r: 13, class: 'graph-focus-ring', fill: 'none', stroke: green }, group);
      element('circle', { cx: p.sx(x), cy: p.sy(y), r: 24, fill: 'transparent' }, group);
      element('circle', { cx: p.sx(x), cy: p.sy(y), r: 6, fill: green, stroke: '#fcfcf9', 'stroke-width': 2 }, group);
      handles.push({ group, p, map, x });
      group.addEventListener('keydown', e => {
        const amount = (e.shiftKey ? 1 : 5) * config.step;
        const next = { ArrowLeft: current - amount, ArrowDown: current - amount, ArrowRight: current + amount, ArrowUp: current + amount, Home: config.min, End: config.max };
        if (!(e.key in next)) return; e.preventDefault(); update(next[e.key], true);
      });
      group.addEventListener('pointerdown', e => {
        if (e.button !== 0 || drag) return;
        e.preventDefault(); group.focus({ preventScroll: true });
        drag = { id: e.pointerId, p, map, offset: graphX(e) - p.sx(x), handleIndex: handles.findIndex(h => h.group === group) };
        svg.setPointerCapture(e.pointerId); svg.setAttribute('data-dragging', '');
      });
      return group;
    }
    function pointLabel(p, x, y, label, color = green, dy = -19) {
      const px = p.sx(x), py = p.sy(y), anchor = px > 455 ? 'end' : 'start';
      text(drawing, clamp(px + (anchor === 'end' ? -14 : 14), 85, 570), clamp(py + dy, p.top + 17, p.bottom - 13), label, { fill: color, 'text-anchor': anchor, 'pointer-events': 'none', 'font-size': 14 });
    }
    function render() {
      drawing.replaceChildren(); defs.replaceChildren(); handles.length = 0; mathLabels.length = 0;
      const x = current;
      svg.setAttribute('viewBox', mode === 'signs' ? '0 0 640 730' : mode === 'pen' ? '0 0 640 500' : '0 0 640 360');
      if (mode === 'linear') {
        const p = panel(0, 8, 0, 3.4, 28, 304);
        p.curve(Math.sqrt); p.curve(z => 2 + (z - 4) / 4, amber, false, true);
        dot(p, 4, 2); const predicted = 2 + (x - 4) / 4;
        line(p.graph, p.sx(x), p.sy(Math.sqrt(x)), p.sx(x), p.sy(predicted), { stroke: blue, 'stroke-width': 2 });
        dot(p, x, predicted, amber, 4); handle(p, x, Math.sqrt(x), 'Input on square-root curve');
        pointLabel(p, x, predicted, `L(x) = ${texNumber(fmt(predicted, 3))}`, amber, -24);
        pointLabel(p, x, Math.sqrt(x), `f(x) = ${texNumber(fmt(Math.sqrt(x), 3))}`, green, 27);
        setLegend([{ color: green, tex: String.raw`f(x)=\sqrt{x}` }, { color: amber, tex: 'L(x)', tangent: true }]);
        readouts([
          ['x', fmt(x), `x=${texNumber(fmt(x))}`],
          ['Δx', fmt(x - 4), String.raw`\Delta x=${texNumber(fmt(x - 4))}`],
          ['f(x) − L(x)', fmt(Math.sqrt(x) - predicted, 4), `f(x)-L(x)=${texNumber(fmt(Math.sqrt(x) - predicted, 4))}`],
        ]);
      } else if (mode === 'ladder') {
        const y = Math.sqrt(25 - x * x), p = { sx: z => 150 + 48 * z, sy: z => 304 - 48 * z, graph: drawing, xmin: 0, xmax: 5, left: 150, right: 390, top: 40, bottom: 304 };
        line(drawing, 150, 38, 150, 304, { stroke: '#b4c1b7', 'stroke-width': 2 }); line(drawing, 150, 304, 525, 304);
        for (let n = 1; n <= 5; n++) {
          line(drawing, p.sx(n), 301, p.sx(n), 307); text(drawing, p.sx(n), 326, String(n), { 'text-anchor': 'middle' });
          line(drawing, 147, p.sy(n), 153, p.sy(n)); text(drawing, 138, p.sy(n) + 4, String(n), { 'text-anchor': 'end' });
        }
        text(drawing, 530, 325, String.raw`x\;(\mathrm{m})`); text(drawing, 162, 30, String.raw`y\;(\mathrm{m})`);
        line(drawing, 150, p.sy(y), p.sx(x), 304, { stroke: green, 'stroke-width': 5 });
        dot(p, 0, y); handle(p, x, 0, 'Foot distance from wall');
        pointLabel(p, 0, y, String.raw`y = ${fmt(y)}\,\mathrm{m}`, green, -17);
        text(drawing, 390, 100, String.raw`\text{Ladder: }5\,\mathrm{m}`, { fill: green });
        text(drawing, p.sx(x) + 25, 285, String.raw`\rightarrow\;0.4\,\mathrm{m/s}`, { fill: blue });
        readouts([
          ['x', `${fmt(x)} m`, String.raw`x=${fmt(x)}\,\mathrm{m}`],
          ['y', `${fmt(y)} m`, String.raw`y=${fmt(y)}\,\mathrm{m}`],
          ['dy/dt', `${fmt(-.4 * x / y)} m/s`, String.raw`\frac{dy}{dt}=${texNumber(fmt(-.4 * x / y))}\,\mathrm{m/s}`],
        ]);
      } else if (mode === 'mvt') {
        const p = panel(0, 3, 0, 9, 28, 304); p.curve(z => z * z);
        const c = x / 2; p.curve(z => x * z, blue, true); tangent(p, c, c * c, x, .65);
        dot(p, 0, 0); dot(p, c, c * c, amber);
        handle(p, x, x * x, 'Right endpoint of interval');
        setLegend([{ color: green, tex: 'f(x)=x^2' }, { color: blue, label: 'Secant', dashed: true }, { color: amber, label: 'Tangent', tangent: true }]);
        readouts([
          ['b', fmt(x), `b=${fmt(x)}`], ['c', fmt(c), `c=${fmt(c)}`],
          ['secant slope', fmt(x), String.raw`\text{Secant slope}=${fmt(x)}`],
          ['f′(c)', fmt(2 * c), String.raw`f^{\prime}(c)=${fmt(2 * c)}`],
        ]);
      } else if (mode === 'signs') {
        const model = profiles[profile], fns = [model.f, model.d, model.dd];
        fns.forEach((fn, i) => {
          const top = 28 + i * 239, bottom = 215 + i * 239;
          const p = panel(-2.1, 2.1, ...model.ranges[i], top, bottom, [String.raw`f(x)=${model.tex}`, String.raw`f^{\prime}(x)`, String.raw`f^{\prime\prime}(x)`][i]);
          p.curve(fn); const y = fn(x), slope = i === 0 ? model.d(x) : i === 1 ? model.dd(x) : null;
          line(p.graph, p.sx(x), top, p.sx(x), bottom, { stroke: '#bcc8bf', 'stroke-dasharray': '3 5' });
          if (slope != null) tangent(p, x, y, slope, .3);
          handle(p, x, y, 'Shared input on ' + ['function', 'first derivative', 'second derivative'][i]);
        });
        setLegend([{ color: green, label: 'Graph' }, { color: amber, label: 'Tangent', tangent: true }]);
        readouts([
          ['x', fmt(x), `x=${texNumber(fmt(x))}`],
          ['f(x)', fmt(model.f(x)), `f(x)=${texNumber(fmt(model.f(x)))}`],
          ['f′(x)', fmt(model.d(x)), String.raw`f^{\prime}(x)=${texNumber(fmt(model.d(x)))}`],
          ['f″(x)', fmt(model.dd(x)), String.raw`f^{\prime\prime}(x)=${texNumber(fmt(model.dd(x)))}`],
        ]);
      } else if (mode === 'pen') {
        const length = 40 - 2 * x;
        const scale = Math.min(12, 430 / length, 118 / x), left = 320 - length * scale / 2, top = 38;
        line(drawing, 75, top, 565, top, { stroke: '#b4c1b7', 'stroke-width': 3 });
        element('path', { d: `M${left} ${top}V${top + x * scale}H${left + length * scale}V${top}`, fill: '#dce8df', 'fill-opacity': .5, stroke: green, 'stroke-width': 2 }, drawing);
        text(drawing, 320, 24, String.raw`\text{Wall · no fence needed}`, { 'text-anchor': 'middle' });
        text(drawing, left - 12, top + x * scale / 2 + 4, String.raw`x = ${fmt(x, 1)}\,\mathrm{m}`, { 'text-anchor': 'end', fill: green });
        text(drawing, 320, top + x * scale + 28, String.raw`y = ${fmt(length, 1)}\,\mathrm{m}`, { 'text-anchor': 'middle', fill: green });
        const p = panel(0, 20, 0, 220, 240, 450); p.curve(z => z * (40 - 2 * z));
        for (const endpoint of [0, 20]) element('circle', { cx: p.sx(endpoint), cy: p.sy(0), r: 4, fill: '#fcfcf9', stroke: green, 'stroke-width': 1.7 }, drawing);
        dot(p, 10, 200, amber, 4); handle(p, x, x * length, 'Pen depth on area graph');
        text(drawing, p.sx(10), p.sy(200) - 22, '(10,200)', { fill: amber, 'text-anchor': 'middle' });
        readouts([
          ['2x + y', '40 m', String.raw`2x+y=40\,\mathrm{m}`],
          ['area', `${fmt(x * length, 1)} m²`, String.raw`A=${fmt(x * length, 1)}\,\mathrm{m}^2`],
          ['A′(x)', `${fmt(40 - 4 * x, 1)} m`, String.raw`A^{\prime}(x)=${texNumber(fmt(40 - 4 * x, 1))}\,\mathrm{m}`],
        ]);
      }
      refreshMathStyles(); positionMathLabels();
    }
    function graphX(event) { const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY; return point.matrixTransform(svg.getScreenCTM().inverse()).x; }
    function update(next, focus = false) {
      const focusIndex = handles.findIndex(h => h.group === document.activeElement);
      current = Math.round(clamp(next, config.min, config.max) / config.step) * config.step;
      render();
      if (focus && focusIndex >= 0) handles[focusIndex]?.group.focus({ preventScroll: true });
    }
    svg.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = drag.p, px = graphX(e) - drag.offset;
      const x = p.xmin + (px - p.left) / (p.right - p.left) * (p.xmax - p.xmin);
      update(drag.map(x));
    });
    function release(e) {
      if (!drag || drag.id !== e.pointerId) return;
      const { id, handleIndex } = drag; drag = null; svg.removeAttribute('data-dragging');
      if (svg.hasPointerCapture(id)) svg.releasePointerCapture(id);
      handles[handleIndex]?.group.focus({ preventScroll: true });
    }
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) svg.addEventListener(name, release);
    svg.addEventListener('dragstart', e => e.preventDefault());
    render();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(positionMathLabels).observe(svg);
    document.fonts?.ready.then(positionMathLabels);
  }
}

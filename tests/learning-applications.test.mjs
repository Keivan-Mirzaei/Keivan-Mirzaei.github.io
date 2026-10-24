import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeApplications } from '../assets/js/lib/learning-applications.mjs';

function explorer(mode) {
  let document;
  class El {
    constructor(tag) { this.tag = tag; this.attrs = {}; this.childNodes = []; this.handlers = {}; this.dataset = {}; this.style = {}; this.textContent = ''; }
    cloneNode(deep) { const copy = new El(this.tag); copy.attrs = { ...this.attrs }; copy.textContent = this.textContent; if (deep) this.childNodes.forEach(el => copy.appendChild(el.cloneNode(true))); return copy; }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return this.attrs[k]; }
    removeAttribute(k) { delete this.attrs[k]; }
    appendChild(el) { el.parent = this; this.childNodes.push(el); return el; }
    append(...els) { els.forEach(el => this.appendChild(el)); }
    prepend(...els) { els.forEach(el => { el.parent = this; }); this.childNodes.unshift(...els); }
    replaceChildren(...els) { this.childNodes = []; this.append(...els); }
    addEventListener(k, fn) { this.handlers[k] = fn; }
    focus() { document.activeElement = this; }
    setPointerCapture(id) { this.capture = id; }
    hasPointerCapture(id) { return this.capture === id; }
    releasePointerCapture() { this.capture = null; }
    remove() { this.parent.childNodes = this.parent.childNodes.filter(el => el !== this); }
    all() { return this.childNodes.flatMap(el => [el, ...el.all()]); }
    querySelector(sel) {
      if (sel === '[data-applications-fallback]') return null;
      return this.all().find(el => sel.startsWith('.') ? el.attrs.class === sel.slice(1) : el.tag === sel);
    }
  }
  const root = new El('div'); root.dataset.applications = mode;
  const plot = new El('figure'); plot.setAttribute('class', 'applications-plot'); root.appendChild(plot);
  const svg = new El('svg'); plot.appendChild(svg);
  const controls = new El('div'); controls.setAttribute('class', 'applications-controls'); root.appendChild(controls);
  const values = new El('div'); values.setAttribute('class', 'applications-values'); root.appendChild(values);
  svg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } });
  svg.getScreenCTM = () => ({ inverse: () => ({}) });
  document = { activeElement: null, createElement: tag => new El(tag), createElementNS: (_, tag) => new El(tag), querySelectorAll: () => [root] };
  initializeApplications(document, { tex2chtml(tex) { assert.equal(typeof tex, 'string'); const node = new El('mjx-container'); node.textContent = tex; return node; } });
  const output = name => values.childNodes.find(el => el.dataset.name === name)?.dataset.value;
  const pixel = x => ({ linear: 62 + x / 8 * 524, ladder: 150 + x * 48, mvt: 62 + x / 3 * 524, signs: 62 + (x + 2.1) / 4.2 * 524, pen: 62 + x / 20 * 524 })[mode];
  function set(x) { const handle = handles()[0], dot = handle.childNodes.at(-1); handle.handlers.pointerdown(event(Number(dot.attrs.cx))); svg.handlers.pointermove(event(pixel(x))); svg.handlers.pointerup(event(pixel(x))); }
  const handles = () => root.all().filter(el => el.attrs.role === 'slider');
  const key = (name, shift = false, index = 0) => { const el = handles()[index]; el.focus(); el.handlers.keydown({ key: name, shiftKey: shift, preventDefault() {} }); };
  const event = (x, id = 1) => ({ clientX: x, clientY: 0, pointerId: id, button: 0, preventDefault() {} });
  return { root, svg, controls, document, output, set, handles, key, event };
}

test('linearization matches at its base and retains the signed nonlinear error away from it', () => {
  const e = explorer('linear');
  e.set(4); assert.equal(e.output('Δx'), '0.00'); assert.equal(e.output('f(x) − L(x)'), '0.0000');
  e.set(1); assert.equal(e.output('f(x) − L(x)'), '−0.2500');
  e.set(7); assert.ok(Number(e.output('f(x) − L(x)').replace('−', '-')) < 0);
});

test('ladder geometry remains five metres and its downward speed increases near the floor', () => {
  const e = explorer('ladder');
  e.set(3); assert.equal(e.output('y'), '4.00 m'); assert.equal(e.output('dy/dt'), '−0.30 m/s');
  e.set(4); assert.equal(e.output('y'), '3.00 m'); assert.equal(e.output('dy/dt'), '−0.53 m/s');
  const ladder = e.svg.all().find(el => el.tag === 'line' && el.attrs['stroke-width'] === '5');
  assert.ok(Math.abs(Math.hypot(ladder.attrs.x2 - ladder.attrs.x1, ladder.attrs.y2 - ladder.attrs.y1) - 240) < 1e-9);
  e.key('End'); assert.equal(e.output('x'), '4.80 m'); assert.ok(!e.output('y').includes('NaN'));
});

test('moving the secant endpoint keeps the interior tangent parallel without conflating b and c', () => {
  const e = explorer('mvt');
  for (const b of [.6, 1, 2.8]) {
    e.set(b); assert.equal(e.output('secant slope'), e.output('f′(c)'));
    assert.equal(Number(e.output('c')), b / 2);
  }
});

test('the secant legend and plotted line share an explicit dash pattern at every screen size', () => {
  const e = explorer('mvt');
  const key = e.root.querySelector('.applications-legend-line').querySelector('line');
  const secant = e.svg.all().find(el => el.tag === 'path' && el.attrs.stroke === '#617a9a');
  for (const attr of ['stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'vector-effect']) {
    assert.equal(key.attrs[attr], secant.attrs[attr], attr);
  }
  assert.equal(key.attrs['vector-effect'], 'non-scaling-stroke');
  assert.ok(key.attrs['stroke-dasharray']);
});

test('linked derivative graphs distinguish a stationary crossing from a flat minimum', () => {
  const e = explorer('signs');
  const choices = e.controls.all().filter(el => el.tag === 'input' && el.type === 'radio');
  const choose = value => { choices.forEach(input => { input.checked = input.value === value; }); choices.find(input => input.checked).handlers.change(); };
  e.set(-1); assert.equal(e.output('f(x)'), '2.00'); assert.equal(e.output('f′(x)'), '0.00'); assert.equal(e.output('f″(x)'), '−6.00');
  choose('crossing'); e.set(-.5); assert.equal(e.output('f′(x)'), '0.75');
  e.set(.5); assert.equal(e.output('f(x)'), '0.13'); assert.equal(e.output('f′(x)'), '0.75');
  choose('minimum'); e.set(-.5); assert.equal(e.output('f′(x)'), '−0.50');
  e.set(.5); assert.equal(e.output('f(x)'), '0.06'); assert.equal(e.output('f′(x)'), '0.50');
  e.key('Home', false, 2); assert.equal(e.output('x'), '−2.00');
  assert.equal(e.document.activeElement, e.handles()[2]);
});

test('the pen preserves its fence constraint, peaks at the correct dimensions, and clamps to feasible inputs', () => {
  const e = explorer('pen');
  e.set(10); assert.equal(e.output('2x + y'), '40 m'); assert.equal(e.output('area'), '200.0 m²'); assert.equal(e.output('A′(x)'), '0.0 m');
  e.set(6); assert.equal(e.output('area'), '168.0 m²');
  e.set(14); assert.equal(e.output('area'), '168.0 m²');
  e.set(30); assert.equal(e.output('area'), '19.5 m²');
});

test('scaled point dragging, foreign pointers, cancellation and keyboard focus stay consistent', () => {
  const e = explorer('linear'), handle = e.handles()[0];
  handle.handlers.pointerdown(e.event(62 + 5.6 / 8 * 524));
  e.svg.handlers.pointermove(e.event(62 + 4 / 8 * 524, 2)); assert.equal(e.output('x'), '5.60');
  e.svg.handlers.pointermove(e.event(62 + 4 / 8 * 524)); assert.equal(e.output('x'), '4.00');
  e.svg.handlers.pointercancel(e.event(324));
  assert.equal(e.svg.capture, null);
  e.svg.handlers.pointermove(e.event(500)); assert.equal(e.output('x'), '4.00');
  e.key('ArrowRight', true); assert.equal(e.output('x'), '4.01');
  assert.equal(e.document.activeElement, e.handles()[0]);
});


test('dragging a lower derivative graph returns keyboard focus to that same graph', () => {
  const e = explorer('signs');
  e.handles()[2].handlers.pointerdown(e.event(62 + 1.5 / 4.2 * 524));
  e.svg.handlers.pointermove(e.event(324));
  e.svg.handlers.pointerup(e.event(324));
  assert.equal(e.document.activeElement, e.handles()[2]);
});


test('each illustration uses the movable points without a second range input', () => {
  for (const mode of ['linear', 'ladder', 'mvt', 'signs', 'pen']) {
    const e = explorer(mode);
    assert.ok(!e.controls.all().some(el => el.tag === 'input' && el.type === 'range'));
    assert.ok(e.handles().length > 0);
    assert.equal(e.controls.hidden, mode !== 'signs');
  }
});

test('linearization uses rendered mathematics and a solid translucent tangent with an external legend', () => {
  const e = explorer('linear');
  const tangent = e.svg.all().find(el => el.tag === 'path' && el.attrs.stroke === '#a67936');
  assert.equal(tangent.attrs['stroke-dasharray'], undefined);
  assert.equal(tangent.attrs['stroke-opacity'], '0.72');
  const labels = e.svg.all().filter(el => el.tag === 'foreignObject');
  assert.ok(labels.some(el => el.attrs['data-tex'].startsWith('f(x) = ')));
  assert.ok(labels.every(el => el.childNodes[0].childNodes[0].tag === 'mjx-container'));
  assert.equal(e.svg.all().filter(el => el.tag === 'rect' && el.attrs.fill === '#edf1e9').length, 0);
  const legend = e.root.querySelector('.applications-legend');
  assert.equal(legend.parent, e.root.querySelector('.applications-plot'));
  assert.ok(!e.svg.all().includes(legend));
});

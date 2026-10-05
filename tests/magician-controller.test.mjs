import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeMagicianGame, initializeMagicianProbability } from '../assets/js/widgets/magicians-problem.mjs';
import { simulateAudience } from '../assets/js/lib/magician-math.mjs';
import { overviewChart, rippleChart, routesChart, deviationLabel } from '../assets/js/lib/magician-charts.mjs';

class Element {
  constructor(dataset = {}) { this.dataset = dataset; this.attributes = new Map(); this.listeners = new Map(); this.disabled = true; this.value = '0'; this.checked = false; this.hidden = false; this.textContent = ''; }
  addEventListener(type, handler, { signal } = {}) { this.listeners.set(type, handler); signal?.addEventListener('abort', () => this.listeners.delete(type), { once: true }); }
  emit(type, event = {}) { this.listeners.get(type)?.(event); }
  click() { if (!this.disabled) this.emit('click'); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getBoundingClientRect() { return { width: this.hidden ? 0 : 500 }; }
  focus() { this.focused = true; }
  querySelector() { return null; }
}

function fixture(kind, reducedMotion = false) {
  const names = kind === 'game' ? ['audience','flip','new-audience','round','game-status','widget-undo','widget-redo','widget-reset']
    : ['magnify','magnified','overview','ripple','position','position-label','play-ripple','farther','widget-undo','widget-redo','widget-reset','ripple-status','chance','deviation','window','plot-title','overview-caption'];
  const fields = Object.fromEntries(names.map(name => [name, new Element()]));
  const document = new Element(), trigger = new Element({ widgetPanelTrigger: 'info' }), panel = new Element({ widgetPanel: 'info' });
  const svg = new Element(), people = Array.from({ length: 64 }, () => new Element());
  svg.querySelectorAll = () => people;
  const widget = new Element();
  widget.ownerDocument = document;
  widget.querySelector = selector => selector === 'svg' ? svg : fields[selector.slice(6, -1)];
  widget.querySelectorAll = selector => selector === '[data-widget-panel-trigger]' ? [trigger] : [panel];
  const motion = new Element(); motion.matches = reducedMotion;
  let nextFrame = 0;
  const frames = new Map();
  const environment = {
    matchMedia: () => motion,
    requestAnimationFrame: callback => { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
  };
  const controller = kind === 'game' ? initializeMagicianGame(widget, environment) : initializeMagicianProbability(widget, environment);
  const tick = time => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time)); };
  return { fields, widget, people, document, trigger, panel, controller, tick, frames, motion };
}

test('audience rounds replay exactly; success clears and returns with Undo/Redo; Reset preserves the current run', () => {
  const f = fixture('game');
  f.fields['new-audience'].click();
  for (let i = 0; i < 5; i++) f.fields.flip.click();
  assert.equal(f.controller.read().standing, 1);
  assert.equal(f.widget.dataset.result, 'success'); assert.equal(f.fields.flip.disabled, true);
  const completed = f.controller.read();
  f.fields['widget-undo'].click(); assert.equal(f.widget.dataset.result, 'playing');
  f.fields['widget-redo'].click(); assert.deepEqual(f.controller.read(), completed);
  f.fields['new-audience'].click(); const seed = f.controller.read().seed;
  f.fields.flip.click(); const round = f.controller.read();
  f.fields['widget-reset'].click(); assert.equal(f.controller.read().seed, seed); assert.equal(f.controller.read().round, 0);
  f.fields['widget-undo'].click(); assert.deepEqual(f.controller.read(), round);
  f.controller.dispose(); assert.equal(f.fields.flip.listeners.size, 0);
});

test('audience terminal states stop, instances remain independent, and replay validates its inputs', () => {
  const a = fixture('game'), b = fixture('game');
  for (let i = 0; i < 128; i++) a.fields.flip.click();
  assert.equal(a.controller.read().standing, 0); assert.equal(a.widget.dataset.result, 'empty');
  assert.equal(b.controller.read().standing, 64);
  assert.deepEqual(simulateAudience(42, 128), simulateAudience(42, 128));
  for (const args of [[-1,0],[0,-1],[42,129],[42,1.5],[NaN,0]]) assert.throws(() => simulateAudience(...args), RangeError);
  a.controller.dispose(); b.controller.dispose();
});

test('magnification and Info preserve work; a slider gesture and window jump reverse independently', () => {
  const f = fixture('probability'), c = f.fields;
  c.magnify.checked = true; c.magnify.emit('change');
  assert.equal(c.overview.hidden, true); assert.equal(c.magnified.hidden, false);
  f.trigger.click();
  c.position.emit('pointerdown'); c.position.value = '1.25'; c.position.emit('input'); c.position.emit('pointerup');
  assert.equal(f.controller.read().position, 1.25); assert.equal(f.panel.hidden, false);
  c.farther.click(); assert.equal(f.controller.read().startExponent, 34);
  c['widget-undo'].click(); assert.deepEqual(f.controller.read(), { startExponent:14, position:1.25 });
  c['widget-undo'].click(); assert.equal(f.controller.read().position, 0);
  c['widget-redo'].click(); assert.equal(f.controller.read().position, 1.25);
  c.magnify.checked = false; c.magnify.emit('change');
  c.magnify.checked = true; c.magnify.emit('change');
  assert.equal(f.controller.read().position, 1.25); assert.equal(c['widget-redo'].disabled, false);
  c['widget-reset'].click(); assert.equal(c.magnified.hidden, false); assert.equal(f.controller.read().position, 0);
  c['widget-undo'].click(); assert.equal(f.controller.read().position, 1.25);
  f.controller.dispose();
});

test('one playback interval is one action and hiding the page stops it; reduced motion steps without animation', () => {
  const f = fixture('probability'), c = f.fields;
  c.magnify.checked = true; c.magnify.emit('change');
  c['play-ripple'].click(); f.tick(0); f.tick(100); f.tick(200);
  assert.ok(f.controller.read().position > 0); assert.equal(c['widget-undo'].disabled, true);
  f.document.hidden = true; f.document.emit('visibilitychange'); assert.equal(f.frames.size, 0);
  const after = f.controller.read();
  c['widget-undo'].click(); assert.equal(f.controller.read().position, 0);
  c['widget-redo'].click(); assert.deepEqual(f.controller.read(), after);
  f.controller.dispose();
  const reduced = fixture('probability', true);
  reduced.fields['play-ripple'].click(); assert.equal(reduced.frames.size, 0); assert.equal(reduced.controller.read().position, .25);
  reduced.fields['widget-undo'].click(); assert.equal(reduced.controller.read().position, 0); reduced.controller.dispose();
});

test('charts can use separate clipping IDs for multiple instances', () => {
  for (const chart of [overviewChart(320, 'instance-a'), rippleChart(320, 34, 'instance-b'), routesChart(320, 'instance-c')]) {
    assert.match(chart, /clip-path="url\(#instance-[abc]\)"/);
  }
});

test('microscope formatting preserves small nonzero values and typesets scientific powers', () => {
  assert.equal(deviationLabel(4.5784), '≈ +4.58 ppm');
  assert.equal(deviationLabel(-.002123), '≈ −0.00212 ppm');
  assert.equal(deviationLabel(.000001234), '≈ +1.23 × 10<sup>−6</sup> ppm');
  assert.equal(deviationLabel(0), '0 ppm');
  assert.equal(deviationLabel(NaN), 'Undefined');
});

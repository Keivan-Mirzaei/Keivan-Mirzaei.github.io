import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeWidgetPanels } from '../assets/js/lib/widget-panels.mjs';

class Element {
  constructor(dataset = {}) { this.dataset = dataset; this.listeners = new Map(); this.attributes = new Map(); this.children = []; this.hidden = false; }
  addEventListener(type, listener, { signal } = {}) {
    this.listeners.set(type, listener);
    signal?.addEventListener('abort', () => this.listeners.delete(type), { once: true });
  }
  emit(type, event = {}) { this.listeners.get(type)?.(event); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  contains(target) { return target === this || this.children.includes(target); }
  focus() { this.focused = true; }
}

function fixture(document = new Element()) {
  const triggers = ['settings', 'info'].map(widgetPanelTrigger => new Element({ widgetPanelTrigger }));
  const panels = ['settings', 'info'].map(widgetPanel => new Element({ widgetPanel }));
  const root = { querySelectorAll: selector => selector === '[data-widget-panel-trigger]' ? triggers : panels, ownerDocument: document };
  const dispose = initializeWidgetPanels(root);
  return { triggers, panels, document, dispose };
}

test('panels start closed, toggle with the same trigger, and only one stays open', () => {
  const f = fixture();
  assert.ok(f.panels.every(panel => panel.hidden));
  f.triggers[0].emit('click');
  assert.equal(f.panels[0].hidden, false);
  assert.equal(f.triggers[0].attributes.get('aria-expanded'), 'true');
  f.triggers[1].emit('click');
  assert.equal(f.panels[0].hidden, true);
  assert.equal(f.panels[1].hidden, false);
  f.triggers[1].emit('click');
  assert.ok(f.panels.every(panel => panel.hidden));
});

test('tapping or scrolling outside leaves the panel open; Escape closes it and restores focus', () => {
  const f = fixture();
  f.triggers[0].emit('click');
  f.document.emit('pointerdown', { target: f.panels[0] });
  assert.equal(f.panels[0].hidden, false);
  f.document.emit('pointerdown', { target: new Element(), pointerType: 'touch' });
  f.document.emit('click', { target: new Element() });
  f.document.emit('scroll', { target: new Element() });
  assert.equal(f.panels[0].hidden, false);
  assert.equal(f.triggers[0].attributes.get('aria-expanded'), 'true');
  let prevented = false;
  f.document.emit('keydown', { key: 'Escape', preventDefault() { prevented = true; } });
  assert.equal(f.panels[0].hidden, true);
  assert.equal(f.triggers[0].focused, true);
  assert.equal(prevented, true);
  f.triggers[1].emit('click');
  f.document.emit('pointerdown', { target: new Element() });
  assert.equal(f.panels[1].hidden, false);
  f.triggers[1].emit('click');
  assert.equal(f.panels[1].hidden, true);
});

test('instances have distinct accessible panel IDs and disposal removes handlers', () => {
  const a = fixture(), b = fixture();
  assert.notEqual(a.panels[0].id, b.panels[0].id);
  assert.equal(a.triggers[0].attributes.get('aria-controls'), a.panels[0].id);
  a.triggers[0].emit('click'); a.dispose(); a.triggers[0].emit('click');
  assert.equal(a.panels[0].hidden, true);
  assert.equal(a.document.listeners.size, 0);
  b.triggers[0].emit('click');
  assert.equal(b.panels[0].hidden, false);
  b.dispose();
});

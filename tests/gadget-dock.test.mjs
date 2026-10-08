import test from 'node:test';
import assert from 'node:assert/strict';
import { mountDock } from '../assets/js/gadgets/ui.mjs';
import { createTimer, defaults } from '../assets/js/gadgets/model.mjs';

test('hiding either timer removes its header controls while preserving an independent sound player', t => {
  const elements = new Map(), handlers = new Map();
  function element(name) {
    if (!elements.has(name)) elements.set(name, {
      dataset: {}, hidden: true, textContent: '', attributes: new Map(), content: { cloneNode: () => ({}) },
      setAttribute(key, value) { this.attributes.set(key, value); }, replaceChildren() {},
      addEventListener() {}, getBoundingClientRect: () => ({ height: 80 }), focus() {},
      querySelector: selector => element(selector)
    });
    return elements.get(name);
  }
  const previousDocument = globalThis.document, previousObserver = globalThis.ResizeObserver;
  globalThis.document = {
    querySelector: element, addEventListener: (name, callback) => handlers.set(name, callback),
    documentElement: { style: { setProperty() {} } }
  };
  globalThis.ResizeObserver = class { observe() {} };
  t.after(() => { globalThis.document = previousDocument; globalThis.ResizeObserver = previousObserver; });
  element('[data-gadget-dock]').dataset.gadgetsUrl = '/gadgets/';
  const timer = createTimer('exam', defaults), state = { timer, sound: null, wakeStatus: 'off', message: '' };
  let update; mountDock({ subscribe(listener) { update = listener; }, getState: () => state });
  update(state);
  assert.equal(element('[data-gadget-dock]').hidden, true);
  assert.equal(element('[data-dock-timer]').hidden, true);
  timer.config.examInBar = true; update(state);
  assert.equal(element('[data-gadget-dock]').hidden, false);
  assert.equal(element('[data-dock-timer]').hidden, false);
  handlers.get('click')({ target: { closest: () => ({ dataset: { gadgetAction: 'controls' } }) } });
  assert.equal(element('[data-gadget-controls]').hidden, false);
  timer.config.examInBar = false; update(state);
  assert.equal(element('[data-gadget-controls]').hidden, true);
  state.sound = { source: 'brown', playing: false, volume: 25 }; update(state);
  assert.equal(element('[data-gadget-dock]').hidden, false);
  assert.equal(element('[data-control-timer]').hidden, true);
  assert.equal(element('[data-dock-sound]').hidden, false);
  assert.equal(element('[data-control-sound]').hidden, false);
  assert.equal(element('[data-control-awake]').textContent, '');
  state.sound = null; state.timer = createTimer('pomodoro', defaults); update(state);
  assert.equal(element('[data-dock-timer]').hidden, false);
  state.timer.config.pomodoroInBar = false; state.sound = { source: 'brown', playing: true, volume: 25 }; update(state);
  assert.equal(element('[data-dock-timer]').hidden, true);
  assert.equal(element('[data-control-timer]').hidden, true);
  assert.equal(element('[data-dock-sound]').hidden, false);
  assert.equal(element('[data-gadget-dock]').hidden, false);
  state.sound = null; update(state);
  assert.equal(element('[data-gadget-dock]').hidden, true);
});

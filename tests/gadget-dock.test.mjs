import test from 'node:test';
import assert from 'node:assert/strict';
import { mountDock } from '../assets/js/gadgets/ui.mjs';
import { createTimer, defaults } from '../assets/js/gadgets/model.mjs';

function fixture(t, state) {
  const elements = new Map(), handlers = new Map();
  function element(name) {
    if (!elements.has(name)) elements.set(name, {
      dataset: {}, hidden: true, textContent: '', attributes: new Map(), content: { cloneNode: () => ({}) },
      setAttribute(key, value) { this.attributes.set(key, value); }, replaceChildren() {},
      addEventListener() {}, contains(node) { return node?.parent === this; },
      focus() { globalThis.document.activeElement = this; },
      querySelector: selector => element(selector)
    });
    return elements.get(name);
  }
  const previousDocument = globalThis.document;
  globalThis.document = {
    querySelector: element, addEventListener: (name, callback) => handlers.set(name, callback)
  };
  t.after(() => { globalThis.document = previousDocument; });
  element('[data-gadget-dock]').dataset.gadgetsUrl = '/gadgets/';
  let update; mountDock({ subscribe(listener) { update = listener; }, getState: () => state });
  update(state);
  return { element, handlers, update };
}

test('hiding either timer removes its header controls while preserving an independent sound player', t => {
  const timer = createTimer('exam', defaults), state = { timer, sound: null, wakeStatus: 'off', message: '' };
  const { element, handlers, update } = fixture(t, state);
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
  state.preferences = { soundInBar: false }; update(state);
  assert.equal(element('[data-dock-sound]').hidden, true);
  assert.equal(element('[data-control-sound]').hidden, true);
  assert.equal(element('[data-gadget-dock]').hidden, true);
  assert.equal(state.sound.playing, true);
  state.timer.config.pomodoroInBar = true; update(state);
  assert.equal(element('[data-gadget-dock]').hidden, false);
  assert.equal(element('[data-dock-timer]').hidden, false);
  assert.equal(element('[data-control-sound]').hidden, true);
  state.preferences.soundInBar = true; state.sound.source = 'jungle'; update(state);
  assert.equal(element('[data-dock-sound]').hidden, false);
  assert.equal(element('[data-dock-sound-label]').textContent, 'Jungle');
  assert.equal(element('[data-control-sound-state]').textContent, 'Playing');
  assert.equal(element('[data-dock-sound-link]').attributes.get('aria-label'), 'Jungle, playing');
  state.timer.config.pomodoroInBar = false;
  state.sound = null; update(state);
  assert.equal(element('[data-gadget-dock]').hidden, true);
});

test('the controls panel exposes its state, stays open outside, and Escape restores the trigger without changing the timer', t => {
  const timer = createTimer('pomodoro', defaults), state = { timer, sound: null, wakeStatus: 'off', message: '' };
  const { element, handlers } = fixture(t, state);
  const panel = element('[data-gadget-controls]'), trigger = element('[data-gadget-action="controls"]');
  const click = action => handlers.get('click')({ target: { closest: () => action ? { dataset: { gadgetAction: action } } : null } });
  click('controls');
  assert.equal(panel.hidden, false);
  assert.equal(trigger.attributes.get('aria-expanded'), 'true');
  assert.equal(trigger.attributes.get('aria-label'), 'Close active gadget controls');
  click(null); assert.equal(panel.hidden, false);
  let prevented = false;
  handlers.get('keydown')({ key: 'Escape', defaultPrevented: false, preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(panel.hidden, true);
  assert.equal(trigger.attributes.get('aria-label'), 'Open active gadget controls');
  assert.equal(globalThis.document.activeElement, trigger); assert.equal(state.timer, timer);
});

test('removing the last active gadget moves focus out of the disappearing panel', t => {
  const state = { timer: createTimer('pomodoro', defaults), sound: null, wakeStatus: 'off', message: '' };
  const { element, handlers, update } = fixture(t, state);
  handlers.get('click')({ target: { closest: () => ({ dataset: { gadgetAction: 'controls' } }) } });
  const stop = element('[data-gadget-action="timer-stop"]');
  stop.parent = element('[data-gadget-controls]'); stop.focus();
  state.timer = null; update(state);
  assert.equal(element('[data-gadget-controls]').hidden, true);
  assert.equal(globalThis.document.activeElement, element('.search-link'));
});

test('removing one of two gadgets keeps the panel open and moves focus to the remaining controls', t => {
  const sound = { source: 'brown', playing: true, volume: 0 };
  const state = { timer: createTimer('pomodoro', defaults), sound, wakeStatus: 'off', message: '' };
  const { element, handlers, update } = fixture(t, state);
  handlers.get('click')({ target: { closest: () => ({ dataset: { gadgetAction: 'controls' } }) } });
  const stop = element('[data-gadget-action="timer-stop"]');
  stop.parent = element('[data-control-timer]'); stop.focus();
  state.timer = null; update(state);
  assert.equal(element('[data-gadget-controls]').hidden, false);
  assert.equal(globalThis.document.activeElement, element('[data-control-sound-toggle]'));
  assert.equal(state.sound, sound); assert.equal(sound.playing, true);
});

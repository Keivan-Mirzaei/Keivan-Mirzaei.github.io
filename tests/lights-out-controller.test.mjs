import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeLightsOutExploration, initializeLightsOutProof, EXPLORATION_BOARDS } from '../assets/js/widgets/lights-out.mjs';
import { BOARDS, pressEffect, complementProof } from '../assets/js/lib/lights-out-math.mjs';
import { initializeGraphLightsOut } from '../assets/js/widgets/graph-lights-out.mjs';
import { LIGHTS_OUT_CATALOGUE } from '../assets/js/lib/lights-out-catalogue.mjs';
import { BOOK_GRAPHS } from '../assets/js/lib/lights-out-book-graphs.mjs';
import { lightsOutNeighbor } from '../assets/js/lib/lights-out-view.mjs';

// The fixture models capture/bubble ordering and redraws, including lost focus.
class Element {
  constructor(ownerDocument, dataset = {}) {
    Object.assign(this, { ownerDocument, dataset, disabled: true, hidden: false, checked: false, value: '', textContent: '', listeners: new Map(), attributes: new Map(), style: { setProperty() {} }, classes: new Set() });
    this.classList = { toggle: (name, on) => on ? this.classes.add(name) : this.classes.delete(name) };
  }
  addEventListener(type, callback, options = {}) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    const listener = { callback, capture: options.capture === true };
    this.listeners.get(type).push(listener);
    options.signal?.addEventListener('abort', () => this.listeners.set(type, this.listeners.get(type).filter(item => item !== listener)), { once: true });
  }
  emit(type, detail = {}) {
    const event = { target: this, preventDefault() { this.defaultPrevented = true; }, ...detail };
    const listeners = this.listeners.get(type) || [];
    for (const listener of [...listeners.filter(item => item.capture), ...listeners.filter(item => !item.capture)]) listener.callback(event);
  }
  click() { if (!this.disabled) this.emit('click'); }
  focus() { if (!this.disabled) this.ownerDocument.activeElement = this; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  closest(selector) { return selector === '[data-light]' && this.dataset.light !== undefined ? this : null; }
  querySelector(selector) { return selector === '.glo-step' ? this.marker : null; }
}
class Board extends Element {
  set innerHTML(markup) {
    if (this.contains(this.ownerDocument.activeElement)) this.ownerDocument.activeElement = this.ownerDocument.body;
    this.lights = [...markup.matchAll(/<(button|span) class="glo-light" data-light="(\d+)"/g)].map(([, tag, light]) => {
      const button = new Element(this.ownerDocument, { light }); button.disabled = false; button.tag = tag;
      button.marker = new Element(this.ownerDocument); return button;
    });
    this.edges = [...markup.matchAll(/data-edge="([\d,]+)"/g)].map(([, edge]) => new Element(this.ownerDocument, { edge }));
  }
  contains(element) { return element === this || this.lights?.includes(element) || false; }
  querySelectorAll(selector) {
    if (selector === '[data-edge]') return this.edges || [];
    if (selector === 'button[data-light]') return (this.lights || []).filter(light => light.tag === 'button');
    return this.lights || [];
  }
  querySelector(selector) { return this.lights?.find(light => light.dataset.light === selector.match(/"(\d+)"/)?.[1]) || null; }
}
function fixture(proof = false) {
  const owner = new Element(); owner.body = new Element(owner); owner.activeElement = owner.body;
  const names = proof ? ['graph', 'board', 'count', 'detail', 'back', 'next'] : ['board', 'goal', 'play', 'target', 'target-region', 'count', 'instruction', 'show', 'show-label', 'edit', 'numbers', 'undo', 'redo', 'restart', 'solution', 'plan-key', 'plan-label', 'next', 'finish', 'alternative', 'parity', 'status', 'new', 'impossible'];
  const elements = Object.fromEntries(names.map(name => [name, ['play', 'target'].includes(name) || proof && name === 'board' ? new Board(owner) : new Element(owner)]));
  const title = new Element(owner);
  const panels = ['settings', 'info', ...proof ? [] : ['solution']].map(widgetPanel => {
    const element = widgetPanel === 'solution' ? elements.solution : new Element(owner);
    element.dataset.widgetPanel = widgetPanel; return element;
  });
  const triggers = panels.map(panel => {
    const trigger = panel.dataset.widgetPanel === 'solution' ? elements.show : new Element(owner);
    trigger.dataset.widgetPanelTrigger = panel.dataset.widgetPanel; return trigger;
  });
  const root = new Element(owner);
  root.querySelector = selector => selector === '#lo-game-title' ? title : elements[selector.match(/data-lo-(?:proof-)?([^\]]+)/)?.[1]] || null;
  root.querySelectorAll = selector => selector === '[data-widget-panel-trigger]' ? triggers : selector === '[data-widget-panel]' ? panels : Object.values(elements);
  const controller = proof ? initializeLightsOutProof(root) : initializeLightsOutExploration(root, { random: () => .3 });
  const change = (name, value) => { elements[name].value = value; elements[name].emit('change'); };
  const click = vertex => {
    const button = elements.play.lights[vertex]; button.focus();
    if (!button.disabled) elements.play.emit('click', { target: button });
  };
  return { root, owner, elements, triggers, panels, controller, change, click, state: controller.read };
}

test('the exploration uses the puzzle networks, renderer, press effects and one tab stop', () => {
  const f = fixture(), graph = BOOK_GRAPHS['path-6'];
  assert.equal(EXPLORATION_BOARDS['path-6'], graph);
  assert.equal(f.state().key, 'path-6');
  assert.equal(f.elements.play.dataset.numbers, 'false');
  assert.equal(f.elements.play.lights.filter(light => light.tabIndex === 0).length, 1);
  const before = f.state().lights;
  f.click(0);
  assert.equal(f.state().lights, before ^ pressEffect(graph, 1));
  assert.equal(f.elements.play.lights[0].attributes.get('aria-pressed'), String(Boolean(f.state().lights & 1)));
  assert.equal(f.owner.activeElement.dataset.light, '0');
  f.elements.undo.click(); assert.equal(f.state().lights, before);
  f.elements.redo.click(); assert.equal(f.state().lights, before ^ pressEffect(graph, 1));
});

test('solution completion locks play and Undo/Redo restores exact steps and completion', () => {
  const f = fixture(); f.elements.show.click();
  assert.equal(f.elements.play.dataset.numbers, 'true');
  const original = f.state();
  f.elements.next.click(); const partial = f.state();
  f.elements.finish.click();
  assert.equal(f.state().lights, 0); assert.equal(f.root.dataset.complete, 'true');
  assert.ok(f.elements.play.lights.every(light => light.disabled));
  assert.equal(f.owner.activeElement, f.elements.undo);
  f.elements.undo.click(); assert.deepEqual(f.state(), partial); assert.equal(f.root.dataset.complete, 'false');
  f.elements.undo.click(); assert.deepEqual(f.state(), original);
  f.elements.redo.click(); f.elements.redo.click(); assert.equal(f.state().lights, 0);
});

test('reopening a hidden solution after manual play recomputes it for the current lights', () => {
  const f = fixture(); f.elements.show.click(); f.elements.show.click(); f.click(2);
  f.elements.show.click(); const state = f.state(), graph = EXPLORATION_BOARDS[state.key];
  assert.equal(pressEffect(graph, state.plan.solutions[state.plan.choice]), state.lights);
  f.elements.finish.click(); assert.equal(f.state().lights, 0);
});

test('supporting panels coordinate and Escape clears the visible solution and numbering', () => {
  const f = fixture(); f.elements.show.click();
  f.triggers.find(trigger => trigger.dataset.widgetPanelTrigger === 'settings').click();
  assert.equal(f.state().showing, false); assert.equal(f.elements.play.dataset.numbers, 'false');
  const settings = f.panels.find(panel => panel.dataset.widgetPanel === 'settings');
  f.click(2); assert.equal(settings.hidden, false);
  f.elements.show.click(); assert.equal(settings.hidden, true);
  f.owner.emit('keydown', { key: 'Escape' });
  assert.equal(f.elements.solution.hidden, true); assert.equal(f.state().showing, false);
  assert.equal(f.elements.play.dataset.numbers, 'false');
});

test('editing changes one light, remains undoable, and hides a solution restored into editing', () => {
  const f = fixture(); const initial = f.state().start;
  f.elements.edit.checked = true; f.elements.edit.emit('change'); f.click(2);
  assert.equal(f.state().start, initial ^ 4); assert.equal(f.state().moves.length, 0);
  f.elements.edit.checked = false; f.elements.edit.emit('change'); f.elements.show.click();
  f.elements.undo.click();
  assert.equal(f.state().editing, true); assert.equal(f.state().showing, false);
  assert.equal(f.elements.solution.hidden, true); assert.equal(f.elements.show.disabled, true);
  f.elements.undo.click(); assert.equal(f.state().start, initial);
});

test('an impossible all-off board still complements, with equal-parity alternatives', () => {
  const f = fixture(); f.elements.impossible.click();
  assert.equal(f.state().lights, 1); assert.equal(f.elements.show.disabled, true);
  assert.match(f.elements.status.textContent, /All-off is impossible/);
  f.change('goal', 'complement'); assert.equal(f.elements['target-region'].hidden, false);
  f.elements.show.click(); const first = f.state().plan.solutions[f.state().plan.choice];
  f.elements.alternative.click(); const second = f.state().plan.solutions[f.state().plan.choice];
  assert.notEqual(first, second); assert.match(f.elements.parity.textContent, /odd parity/);
  f.elements.finish.click(); assert.equal(f.state().lights, 2); assert.equal(f.root.dataset.complete, 'true');
});

test('board changes and Reset reverse exactly while keeping the light-number preference', () => {
  const f = fixture(); f.elements.numbers.checked = true; f.elements.numbers.emit('change'); f.click(1);
  const previous = f.state();
  f.change('board', 'grid-5'); assert.equal(f.elements.play.lights.length, 25);
  f.elements.undo.click(); assert.deepEqual(f.state(), previous); assert.equal(f.elements.play.dataset.numbers, 'true');
  f.elements.restart.click(); assert.equal(f.state().lights, previous.start);
  f.elements.undo.click(); assert.deepEqual(f.state(), previous);
  f.elements.redo.click(); assert.equal(f.state().lights, previous.start);
});

test('both induction branches finish with the actual reduced press set and reversible success', () => {
  for (const key of ['path-4', 'triangle', 'star-5', 'pair']) {
    const f = fixture(true); f.change('graph', key);
    while (!f.elements.next.disabled) f.elements.next.click();
    const { slide } = f.state(), graph = BOARDS[key];
    assert.equal(slide.pressed, complementProof(graph).presses);
    assert.equal(pressEffect(graph, slide.pressed), graph.all);
    assert.equal(f.root.dataset.complete, 'true');
    const marked = f.elements.board.lights.filter(light => light.classes.has('is-plan')).reduce((mask, light) => mask | (1 << Number(light.dataset.light)), 0);
    assert.equal(marked, slide.pressed);
    f.elements.back.click(); assert.equal(f.root.dataset.complete, 'false');
  }
});

test('directional navigation is shared across puzzle networks and regular grids', () => {
  assert.equal(lightsOutNeighbor(BOARDS['grid-3'], 0, 'ArrowRight'), 1);
  assert.equal(lightsOutNeighbor(BOARDS['grid-3'], 0, 'ArrowDown'), 3);
  assert.equal(lightsOutNeighbor(BOARDS['grid-3'], 0, 'ArrowLeft'), -1);
  const f = fixture(); f.change('board', 'grid-3');
  const button = f.elements.play.lights[0]; button.focus();
  f.elements.play.emit('keydown', { target: button, key: 'ArrowRight' });
  assert.equal(f.owner.activeElement.dataset.light, '1');
});

function numberedFixture(storage) {
  const owner = new Element(); owner.body = new Element(owner); owner.activeElement = owner.body;
  globalThis.document = owner;
  const names = ['board', 'difficulty', 'difficulty-name', 'difficulty-label', 'level-detail', 'number', 'number-name', 'number-label', 'number-slider', 'numbers', 'board-name', 'moves', 'name', 'completed', 'remaining', 'undo', 'redo', 'restart', 'hint', 'hint-label', 'new', 'shuffle', 'status', 'preview', 'jump', 'open'];
  const elements = Object.fromEntries(names.map(name => [name, name === 'board' ? new Board(owner) : new Element(owner)]));
  const root = new Element(owner);
  root.querySelector = selector => elements[selector.match(/data-glo-([^\]]+)/)?.[1]] || null;
  root.querySelectorAll = () => [];
  const controller = initializeGraphLightsOut(root, { storage, catalogue: LIGHTS_OUT_CATALOGUE.map(level => level.slice(0, 3)) });
  return { root, elements, controller };
}

test('the numbered puzzle keeps saved display preferences and exact Undo/Redo after sharing the renderer', () => {
  let saved = null;
  const storage = { read: () => structuredClone(saved), save: state => { saved = structuredClone(state); }, setSnapshotProvider() {} };
  let f = numberedFixture(storage);
  f.elements.numbers.checked = true; f.elements.numbers.emit('change');
  f.controller.press(0); const moved = f.controller.read(); f.elements.undo.click();
  f.controller.destroy(); f = numberedFixture(storage);
  assert.equal(f.root.dataset.numbers, 'true'); assert.equal(f.elements.board.dataset.numbers, 'true');
  assert.equal(f.elements.redo.disabled, false); f.elements.redo.click();
  assert.deepEqual(f.controller.read(), moved);
  f.elements.restart.click();
  while (f.root.dataset.solved !== 'true') {
    f.elements.hint.click();
    const hint = f.controller.read().hint;
    assert.ok(f.elements.board.lights[hint].classes.has('is-hint'));
    f.controller.press(hint);
  }
  assert.ok(f.elements.board.lights.every(light => light.disabled));
  assert.match(f.elements.status.textContent, /Solved in/);
  f.elements.undo.click(); assert.equal(f.root.dataset.solved, 'false');
  f.elements.redo.click(); assert.equal(f.root.dataset.solved, 'true');
  f.controller.destroy(); delete globalThis.document;
});

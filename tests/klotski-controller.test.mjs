import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeKlotski } from '../assets/js/widgets/klotski.mjs';
import { CLASSIC_LAYOUT, createKlotski } from '../assets/js/lib/klotski.mjs';
import { serializeKlotski } from '../assets/js/lib/klotski-storage.mjs';

// Exercise pointer capture, board coordinates and history without a browser package.
class Element {
  constructor(properties = {}) {
    Object.assign(this, { dataset: {}, attributes: new Map(), listeners: new Map(), children: [], classes: new Set(), disabled: false, innerHTML: '' }, properties);
    const styles = {};
    this.style = new Proxy(styles, { set: (target, name, value) => { target[name] = value; if (name === 'transform') this.visualPosition = null; return true; } });
    this.classList = {
      add: name => this.classes.add(name),
      remove: name => this.classes.delete(name),
      toggle: (name, enabled) => enabled ? this.classes.add(name) : this.classes.delete(name),
    };
  }
  addEventListener(name, handler, options = {}) {
    this.listeners.set(name, handler);
    options.signal?.addEventListener('abort', () => { if (this.listeners.get(name) === handler) this.listeners.delete(name); }, { once: true });
  }
  emit(name, detail = {}) { this.listeners.get(name)?.({ target: this, preventDefault() {}, ...detail }); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  append(child) { child.parent = this; this.children.push(child); }
  replaceChildren() { this.children = []; }
  focus() { document.activeElement = this; }
  closest(selector) { return selector === '[data-klotski-block]' && this.dataset.klotskiBlock ? this : null; }
  setPointerCapture(pointerId) { this.capture = pointerId; }
  hasPointerCapture(pointerId) { return this.capture === pointerId; }
  releasePointerCapture(pointerId) { this.capture = null; this.parent?.emit('lostpointercapture', { pointerId, target: this }); }
  getBoundingClientRect() {
    if (!this.parent) return { left: 0, top: 0 };
    const width = Number.parseFloat(this.style.width) / 100 * this.parent.clientWidth;
    const height = Number.parseFloat(this.style.height) / 100 * this.parent.clientHeight;
    const [, x, y] = this.style.transform.match(/translate3d\(([^,]+), ([^,]+), 0\)/);
    const pixels = (value, size) => Number.parseFloat(value) * (value.endsWith('%') ? size / 100 : 1);
    const [left, top] = this.visualPosition || [pixels(x, width), pixels(y, height)];
    return { left, top, width, height };
  }
}

function fixture(storage) {
  globalThis.document = { activeElement: null, createElement: () => new Element() };
  const root = new Element();
  root.querySelectorAll = () => [];
  const fields = Object.fromEntries(['count', 'undo', 'redo', 'restart', 'status'].map(name => [name, new Element()]));
  fields.board = new Element({ clientWidth: 400, clientHeight: 500, clientLeft: 0, clientTop: 0 });
  root.querySelector = selector => fields[selector.match(/data-klotski-([^\]]+)/)?.[1]];
  const controller = initializeKlotski(root, storage);
  const block = id => fields.board.children.find(button => button.dataset.klotskiBlock === id);
  const pointer = (name, id, x, y, extras = {}) => fields.board.emit(name, { target: block(id), pointerId: 1, clientX: x, clientY: y, button: 0, isPrimary: true, ...extras });
  const drag = (id, x, y) => { pointer('pointerdown', id, 0, 0); pointer('pointermove', id, x, y); pointer('pointerup', id, x, y); };
  return { root, fields, block, pointer, drag, controller, position: id => block(id).getBoundingClientRect(),
    action: name => { fields[name].focus(); fields[name].emit('click'); } };
}

test('a drag follows the pointer and settles to the nearest legal cell as one undoable move', () => {
  const f = fixture();
  f.pointer('pointerdown', '8', 0, 0);
  f.pointer('pointermove', '8', 70, 0);
  assert.deepEqual(f.position('8'), { left: 70, top: 400, width: 100, height: 100 });
  f.pointer('pointerup', '8', 70, 0);
  assert.equal(f.fields.count.textContent, '1 move');
  assert.equal(f.position('8').left, 100);
  assert.equal(f.block('8').classes.has('is-dragging'), false);
  assert.equal(f.block('8').capture, null);
  f.action('undo'); assert.equal(f.position('8').left, 0);
  f.action('redo'); assert.equal(f.position('8').left, 100);
});

test('a short drag returns to its starting cell without changing history', () => {
  const f = fixture(); f.drag('8', 35, 0);
  assert.equal(f.position('8').left, 0);
  assert.equal(f.fields.count.textContent, '0 moves');
  assert.equal(f.fields.undo.disabled, true);
});

test('long drags stop at occupied cells and blocked blocks stay in place', () => {
  const f = fixture();
  f.drag('8', 500, 0);
  assert.equal(f.position('8').left, 200);
  assert.equal(f.position('9').left, 300);
  assert.equal(f.fields.count.textContent, '1 move');
  const target = f.position('target');
  f.drag('target', 0, 500);
  assert.deepEqual(f.position('target'), target);
  assert.equal(f.fields.count.textContent, '1 move');
});

test('the gesture keeps its chosen axis even when the pointer changes direction', () => {
  const f = fixture();
  f.pointer('pointerdown', '8', 0, 0);
  f.pointer('pointermove', '8', 70, 0);
  f.pointer('pointermove', '8', 80, -180);
  assert.equal(f.position('8').left, 80);
  assert.equal(f.position('8').top, 400);
  f.pointer('pointerup', '8', 80, -180);
  assert.equal(f.position('8').left, 100);
  assert.equal(f.position('8').top, 400);
});

test('a blocked dominant direction still allows the available axis', () => {
  const f = fixture();
  f.drag('8', 60, -180);
  assert.equal(f.position('8').left, 100);
  assert.equal(f.position('8').top, 400);
});

test('cancellation and lost capture restore the tile without committing a move', () => {
  for (const event of ['pointercancel', 'lostpointercapture']) {
    const f = fixture();
    f.pointer('pointerdown', '8', 0, 0);
    f.pointer('pointermove', '8', 170, 0);
    f.pointer(event, '8', 170, 0);
    assert.equal(f.position('8').left, 0);
    assert.equal(f.fields.count.textContent, '0 moves');
    assert.equal(f.block('8').classes.has('is-dragging'), false);
    assert.equal(f.block('8').capture, null);
  }
});

test('picking up a settling block preserves its visible position and continues that movement', () => {
  const f = fixture(); f.drag('8', 70, 0);
  f.block('8').visualPosition = [50, 400];
  f.pointer('pointerdown', '8', 0, 0);
  assert.equal(f.position('8').left, 50);
  f.pointer('pointermove', '8', 110, 0);
  assert.equal(f.position('8').left, 160);
  f.pointer('pointerup', '8', 110, 0);
  assert.equal(f.position('8').left, 200);
  assert.equal(f.fields.count.textContent, '2 moves');
});

test('secondary pointers cannot replace an active drag and Reset cancels an uncommitted gesture', () => {
  const f = fixture();
  f.pointer('pointerdown', '8', 0, 0);
  f.pointer('pointermove', '8', 70, 0);
  f.pointer('pointerdown', '9', 0, 0, { pointerId: 2 });
  f.pointer('pointermove', '9', -100, 0, { pointerId: 2 });
  assert.equal(f.position('8').left, 70);
  assert.equal(f.position('9').left, 300);
  f.action('restart');
  assert.equal(f.position('8').left, 0);
  assert.equal(f.fields.undo.disabled, true);
  assert.equal(f.fields.redo.disabled, true);
  assert.equal(f.block('8').classes.has('is-dragging'), false);
  assert.equal(f.block('8').capture, null);
});

test('Reset retains history and exact counters through Undo, Redo, and a new page load', () => {
  let saved = null;
  const storage = { read: () => saved, save: value => { saved = structuredClone(value); }, setSnapshotProvider() {} };
  let f = fixture(storage);
  assert.equal(f.fields.restart.disabled, true);
  f.drag('8', 100, 0); f.drag('9', -100, 0);
  f.action('restart');
  assert.equal(f.fields.count.textContent, '0 moves');
  assert.equal(f.fields.undo.disabled, false);
  assert.equal(f.fields.restart.disabled, true);
  assert.equal(f.position('8').left, 0);
  f = fixture(storage); f.action('undo');
  assert.equal(f.fields.count.textContent, '2 moves');
  assert.equal(f.position('8').left, 100);
  assert.equal(f.position('9').left, 200);
  f.action('undo'); assert.equal(f.fields.count.textContent, '1 move');
  f.action('redo'); assert.equal(f.fields.count.textContent, '2 moves');
  f.action('redo'); assert.equal(f.fields.count.textContent, '0 moves');
  f.drag('8', 200, 0);
  assert.equal(f.fields.count.textContent, '1 move');
  assert.equal(f.fields.redo.disabled, true);
});

test('Reset cancels a drag and preserves the committed board for Undo', () => {
  const f = fixture(); f.drag('8', 100, 0);
  f.pointer('pointerdown', '8', 0, 0); f.pointer('pointermove', '8', 70, 0);
  f.action('restart'); f.action('undo');
  assert.equal(f.position('8').left, 100);
  assert.equal(f.fields.count.textContent, '1 move');
  assert.equal(f.block('8').capture, null);
  assert.equal(f.block('8').classes.has('is-dragging'), false);
});

test('destroy cancels a gesture and removes controller actions', () => {
  const f = fixture(); f.pointer('pointerdown', '8', 0, 0); f.pointer('pointermove', '8', 70, 0);
  f.controller.destroy();
  assert.equal(f.position('8').left, 0);
  f.drag('8', 100, 0);
  assert.equal(f.position('8').left, 0);
  assert.equal(f.fields.count.textContent, '0 moves');
});

test('the visible solved state and disabled blocks follow winning, Undo, Redo, and Reset', () => {
  const positions = { target: [1, 2], '4': [1, 0], '6': [1, 1], '7': [2, 1] };
  const almostWon = createKlotski(CLASSIC_LAYOUT.map(piece => positions[piece.id]
    ? { ...piece, x: positions[piece.id][0], y: positions[piece.id][1] } : piece));
  let saved = serializeKlotski(almostWon);
  const f = fixture({ read: () => saved, save: value => { saved = structuredClone(value); }, setSnapshotProvider() {} });
  f.root.emit('keydown', { target: f.block('target'), key: 'ArrowDown' });
  assert.equal(f.root.attributes.get('data-klotski-solved'), 'true');
  assert.equal(f.fields.board.classes.has('is-solved'), true);
  assert.match(f.fields.status.textContent, /Solved in 1 move/);
  assert.ok(f.fields.board.children.every(block => block.disabled));
  f.action('undo');
  assert.equal(f.root.attributes.get('data-klotski-solved'), 'false');
  assert.ok(f.fields.board.children.every(block => !block.disabled));
  f.action('redo'); assert.equal(f.root.attributes.get('data-klotski-solved'), 'true');
  f.action('restart'); assert.equal(f.root.attributes.get('data-klotski-solved'), 'false');
  f.action('undo'); assert.equal(f.root.attributes.get('data-klotski-solved'), 'true');
});


test('reopening Klotski resumes the board and retains undo and redo', () => {
  let saved = null;
  const storage = { read: () => saved, save: value => { saved = structuredClone(value); }, setSnapshotProvider() {} };
  let f = fixture(storage); f.drag('8', 100, 0); f.drag('9', -100, 0); f.action('undo');
  f = fixture(storage);
  assert.equal(f.fields.count.textContent, '1 move'); assert.equal(f.position('8').left, 100);
  assert.equal(f.position('9').left, 300); assert.equal(f.fields.redo.disabled, false);
  f.action('redo'); assert.equal(f.position('9').left, 200);
  f.action('undo'); f.action('undo'); assert.equal(f.position('8').left, 0);
  f.action('restart'); f = fixture(storage); assert.equal(f.fields.count.textContent, '0 moves');
});

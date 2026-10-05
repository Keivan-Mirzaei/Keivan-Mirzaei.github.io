import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeHexGame } from '../assets/js/widgets/hex.mjs';

// A small DOM fixture keeps controller checks independent of a browser package.
class Element {
  constructor(properties = {}) {
    Object.assign(this, { disabled: true, textContent: '', style: { setProperty() {} }, dataset: {}, listeners: new Map(), attributes: new Map() }, properties);
  }
  addEventListener(event, callback) { this.listeners.set(event, callback); }
  emit(event, detail = {}) { this.listeners.get(event)?.(detail); }
  setAttribute(key, value) { this.attributes.set(key, value); }
  focus() { document.activeElement = this; }
  closest(selector) { return selector === '[data-hex-cell]' ? this : null; }
}

class Board extends Element {
  set innerHTML(markup) {
    if (this.contains(document.activeElement)) document.activeElement = document.body;
    this.buttons = [...markup.matchAll(/<button\b([^>]*)>/g)].map(([, attributes]) => new Element({
      dataset: { hexCell: attributes.match(/data-hex-cell="(\d+)"/)[1] },
      className: attributes.match(/class="([^"]*)"/)[1],
      disabled: /\bdisabled\b/.test(attributes),
    }));
  }
  contains(element) { return element === this || this.buttons?.includes(element) || false; }
  querySelectorAll() { return this.buttons || []; }
  querySelector(selector) { return this.buttons?.find(button => button.dataset.hexCell === selector.match(/"(\d+)"/)[1]); }
}

class Computer {
  static instances = [];
  constructor() { Computer.instances.push(this); this.terminated = false; }
  postMessage(position) { this.position = structuredClone(position); }
  terminate() { this.terminated = true; }
  reply(move) { this.onmessage({ data: { move } }); }
}

function game({ order = 'local', size = 3, legacy = false, switches = false, storage } = {}) {
  globalThis.document = { activeElement: null, body: new Element() };
  globalThis.Worker = Computer;
  Computer.instances = [];
  const elements = Object.fromEntries(['count', 'instruction', 'status', 'new', 'undo', 'redo', 'size-label'].map(key => [key, new Element()]));
  elements.size = new Element({ type: legacy ? 'select-one' : 'range', value: String(size) });
  elements.board = new Board();
  if (switches) {
    elements.computer = new Element({ type: 'checkbox', checked: order !== 'local' });
    elements.second = new Element({ type: 'checkbox', checked: order === '2' });
    elements['second-setting'] = new Element();
    elements.reset = elements.new;
  }
  const orders = legacy
    ? [new Element({ type: 'select-one', value: order })]
    : ['1', '2', 'local'].map(value => new Element({ type: 'radio', value, checked: value === order }));
  const root = new Element();
  const fixture = Object.assign(root, {
    addEventListener: (name, handler) => root.addEventListener(name, handler),
    querySelector: selector => elements[selector.match(/^\[data-hex-(.+)\]$/)?.[1]] || null,
    querySelectorAll: selector => selector.startsWith('[data-widget-') ? [] : selector === '[data-hex-order]' ? orders : [elements.size, ...orders, ...(switches ? [elements.computer, elements.second] : [])],
  });
  initializeHexGame(fixture, storage);
  return {
    elements,
    root,
    orders,
    key: (key, modifiers = {}) => root.emit('keydown', {key, target: document.activeElement, preventDefault() {}, ...modifiers}),
    click: move => {
      const button = elements.board.buttons[move];
      if (!button.disabled) elements.board.emit('click', { target: button });
    },
    undo: () => elements.undo.emit('click'),
    redo: () => elements.redo.emit('click'),
    colors: () => elements.board.buttons.map(button => button.className.includes('hex-red') ? 1 : button.className.includes('hex-blue') ? 2 : 0),
    changeOrder: value => {
      if (switches) {
        elements.computer.checked = value !== 'local';
        if (value !== 'local') elements.second.checked = value === '2';
        elements.computer.emit('change');
      } else if (legacy) { orders[0].value = value; orders[0].emit('change'); }
      else {
        orders.forEach(control => { control.checked = control.value === value; });
        orders.find(control => control.checked).emit('change');
      }
    },
  };
}

test('local play starts Red, alternates both colours, and undoes one move', () => {
  const fixture = game();
  assert.match(fixture.elements.status.textContent, /^Red’s turn/);
  assert.equal(fixture.elements.size.disabled, false);
  assert.ok(fixture.orders.every(control => !control.disabled));
  assert.equal(fixture.elements.undo.disabled, true);
  fixture.click(0); fixture.click(1);
  assert.deepEqual(fixture.colors().slice(0, 3), [1, 2, 0]);
  assert.equal(Computer.instances.length, 0);
  fixture.undo();
  assert.deepEqual(fixture.colors().slice(0, 3), [1, 0, 0]);
  assert.match(fixture.elements.status.textContent, /Blue’s turn/);
  fixture.click(2);
  assert.deepEqual(fixture.colors().slice(0, 3), [1, 0, 2]);
  fixture.elements.new.emit('click');
  assert.ok(fixture.colors().every(color => color === 0));
  assert.match(fixture.elements.status.textContent, /^Red’s turn/);
});

test('winning locks a local board, and undo restores the winning player’s turn', () => {
  const fixture = game();
  [0, 1, 3, 2, 6].forEach(fixture.click);
  assert.match(fixture.elements.status.textContent, /^Red wins!/);
  assert.ok(fixture.elements.board.buttons.every(button => button.disabled));
  fixture.undo();
  assert.equal(fixture.colors()[6], 0);
  assert.equal(fixture.elements.board.buttons[6].disabled, false);
  assert.match(fixture.elements.status.textContent, /Red’s turn/);
  fixture.click(6);
  assert.match(fixture.elements.status.textContent, /^Red wins!/);
});

test('computer games undo the human move and its reply together', () => {
  const fixture = game({ order: '1' });
  fixture.click(0);
  const computer = Computer.instances[0];
  assert.equal(computer.position.color, 2);
  assert.ok(fixture.elements.board.buttons.every(button => button.disabled));
  computer.reply(4);
  assert.equal(fixture.elements.count.textContent, '2 stones');
  assert.match(fixture.elements.status.textContent, /^Your turn · Red/);
  fixture.undo();
  assert.equal(fixture.elements.count.textContent, '0 stones');
  assert.equal(fixture.elements.undo.disabled, true);
  assert.ok(fixture.elements.board.buttons.every(button => !button.disabled));
  computer.reply(2);
  assert.equal(fixture.elements.count.textContent, '0 stones');
});

test('undo cancels pending computer work and stale replies cannot affect a later turn', () => {
  const fixture = game({ order: '1' });
  fixture.click(0);
  const oldComputer = Computer.instances[0];
  fixture.undo();
  assert.equal(oldComputer.terminated, true);
  fixture.click(2);
  const newComputer = Computer.instances[1];
  oldComputer.reply(1);
  assert.equal(newComputer.terminated, false);
  assert.equal(fixture.elements.count.textContent, '1 stone');
  assert.deepEqual(fixture.colors().slice(0, 3), [0, 0, 1]);
  newComputer.reply(4);
  assert.equal(fixture.elements.count.textContent, '2 stones');
});

test('a failed worker falls back to a legal reply while yielding between search slices', async t => {
  const timers = [];
  let elapsed = 0;
  t.mock.method(globalThis, 'setTimeout', callback => { timers.push(callback); return timers.length; });
  t.mock.method(performance, 'now', () => elapsed += 5);
  const fixture = game({ order: '1', size: 5 });
  fixture.click(0);
  const computer = Computer.instances[0];
  computer.onerror({ preventDefault() {} });
  assert.equal(computer.terminated, true);
  assert.equal(timers.length, 1);
  assert.equal(fixture.elements.count.textContent, '1 stone');

  // The first timer starts search; subsequent timers allow rendering and input.
  timers.shift()();
  await Promise.resolve();
  assert.equal(fixture.elements.count.textContent, '1 stone');
  assert.equal(timers.length, 1);
  let slices = 0;
  while (timers.length && slices++ < 500) {
    timers.shift()();
    await Promise.resolve();
  }
  assert.equal(timers.length, 0);
  assert.ok(slices > 1);
  assert.equal(fixture.colors()[0], 1);
  assert.equal(fixture.colors().filter(color => color === 2).length, 1);
  assert.match(fixture.elements.status.textContent, /^Your turn · Red/);
});

test('undo cancels cooperative search and a stale worker error cannot restart it', async t => {
  const timers = [];
  let elapsed = 0;
  t.mock.method(globalThis, 'setTimeout', callback => { timers.push(callback); return timers.length; });
  t.mock.method(performance, 'now', () => elapsed += 5);
  const fixture = game({ order: '1', size: 5 });
  fixture.click(0);
  const computer = Computer.instances[0];
  computer.onerror({ preventDefault() {} });
  timers.shift()();
  await Promise.resolve();
  assert.equal(timers.length, 1);
  fixture.undo();
  timers.shift()();
  await Promise.resolve();
  assert.equal(timers.length, 0);
  assert.equal(fixture.elements.count.textContent, '0 stones');
  computer.onerror({ preventDefault() {} });
  assert.equal(timers.length, 0);
  fixture.click(2);
  Computer.instances[1].reply(4);
  assert.equal(fixture.colors()[2], 1);
  assert.equal(fixture.colors()[4], 2);
});

test('reset cancels the fallback before its deferred initialization', async t => {
  const timers = [];
  t.mock.method(globalThis, 'setTimeout', callback => { timers.push(callback); return timers.length; });
  const fixture = game({ order: '1', size: 5 });
  fixture.click(0);
  Computer.instances[0].onerror({ preventDefault() {} });
  fixture.changeOrder('local');
  timers.shift()();
  await Promise.resolve();
  assert.equal(timers.length, 0);
  assert.equal(fixture.elements.count.textContent, '0 stones');
  assert.match(fixture.elements.status.textContent, /^Red’s turn/);
});

test('playing second gives the computer a Red opening that undo cannot remove', () => {
  const fixture = game({ order: '2' });
  const opening = Computer.instances[0];
  assert.equal(opening.position.color, 1);
  assert.ok(opening.position.cells.every(color => color === 0));
  assert.equal(fixture.elements.undo.disabled, true);
  opening.reply(4);
  assert.equal(fixture.colors()[4], 1);
  assert.equal(fixture.elements.board.buttons.filter(button => !button.disabled && button.tabIndex === 0).length, 1);
  assert.match(fixture.elements.status.textContent, /^Your turn · Blue/);
  fixture.click(0);
  Computer.instances[1].reply(8);
  fixture.undo();
  assert.equal(fixture.elements.count.textContent, '1 stone');
  assert.equal(fixture.colors()[4], 1);
  assert.equal(fixture.elements.undo.disabled, true);
  assert.match(fixture.elements.status.textContent, /Your turn · Blue/);
});

test('changing mode cancels a pending reply and starts local play with Red', () => {
  const fixture = game({ order: '2' });
  const opening = Computer.instances[0];
  fixture.changeOrder('local');
  assert.equal(opening.terminated, true);
  assert.match(fixture.elements.status.textContent, /^Red’s turn/);
  opening.reply(4);
  assert.equal(fixture.elements.count.textContent, '0 stones');
  fixture.click(0); fixture.click(1);
  assert.deepEqual(fixture.colors().slice(0, 2), [1, 2]);
  assert.equal(Computer.instances.length, 1);
});

test('keyboard focus resumes on an empty cell after local and computer moves', () => {
  const local = game();
  local.elements.board.buttons[0].focus();
  local.click(0);
  assert.equal(document.activeElement, local.elements.board.buttons[1]);

  const versus = game({ order: '1' });
  versus.elements.board.buttons[0].focus();
  versus.click(0);
  assert.equal(document.activeElement, versus.elements.board);
  Computer.instances[0].reply(1);
  assert.equal(document.activeElement, versus.elements.board.buttons[2]);
  assert.equal(document.activeElement.disabled, false);
});

test('a computer reply leaves focus on a setting the user has selected', () => {
  const fixture = game({ order: '1' });
  fixture.elements.board.buttons[0].focus(); fixture.click(0);
  fixture.elements.size.focus();
  Computer.instances[0].reply(1);
  assert.equal(document.activeElement, fixture.elements.size);
});

test('the slider previews its size until change commits a new board', () => {
  const fixture = game();
  fixture.click(0);
  fixture.elements.size.value = '11';
  fixture.elements.size.emit('input');
  assert.equal(fixture.elements['size-label'].textContent, '11 × 11');
  assert.equal(fixture.elements.size.attributes.get('aria-valuetext'), '11 by 11');
  assert.equal(fixture.elements.board.buttons.length, 9);
  assert.equal(fixture.elements.count.textContent, '1 stone');
  fixture.elements.size.emit('change');
  assert.equal(fixture.elements.board.buttons.length, 121);
  assert.equal(fixture.elements.count.textContent, '0 stones');
  assert.match(fixture.elements.status.textContent, /^Red’s turn/);
});

test('the existing exploration select controls retain computer play and reset behavior', () => {
  const fixture = game({ order: '1', size: 5, legacy: true });
  assert.equal(fixture.elements.board.buttons.length, 25);
  fixture.click(0); Computer.instances[0].reply(12);
  assert.equal(fixture.elements.count.textContent, '2 stones');
  fixture.changeOrder('2');
  assert.equal(Computer.instances[1].position.color, 1);
  assert.equal(fixture.elements.count.textContent, '0 stones');
  fixture.elements.size.value = '7'; fixture.elements.size.emit('change');
  assert.equal(Computer.instances[1].terminated, true);
  assert.equal(fixture.elements.board.buttons.length, 49);
  Computer.instances[1].reply(3);
  assert.equal(fixture.elements.count.textContent, '0 stones');
  Computer.instances[2].reply(24);
  assert.equal(fixture.colors()[24], 1);
  assert.match(fixture.elements.status.textContent, /^Your turn · Blue/);
});

test('redo restores a computer reply exactly without asking for a new move', () => {
  const f = game({ order: '1' });
  f.click(0); Computer.instances[0].reply(4);
  const before = f.colors();
  f.undo();
  assert.equal(f.elements.redo.disabled, false);
  f.redo();
  assert.deepEqual(f.colors(), before);
  assert.equal(Computer.instances.length, 1);
  assert.equal(f.elements.redo.disabled, true);
  assert.equal(f.elements.undo.disabled, false);
});

test('redo restarts an interrupted reply and ignores the stale worker', () => {
  const f = game({ order: '1' });
  f.click(0); const original = Computer.instances[0];
  f.undo(); f.redo();
  assert.equal(f.elements.count.textContent, '1 stone');
  assert.equal(Computer.instances.length, 2);
  original.reply(1);
  assert.equal(f.elements.count.textContent, '1 stone');
  Computer.instances[1].reply(4);
  assert.deepEqual(f.colors().slice(0, 5), [1, 0, 0, 0, 2]);
  f.undo(); f.redo();
  assert.equal(Computer.instances.length, 2);
  assert.equal(f.elements.count.textContent, '2 stones');
});

test('local redo restores a win and a new move or reset clears redo', () => {
  const f = game();
  [0, 1, 3, 2, 6].forEach(f.click);
  f.undo(); f.redo();
  assert.match(f.elements.status.textContent, /^Red wins!/);
  assert.ok(f.elements.board.buttons.every(button => button.disabled));
  f.undo(); f.click(7);
  assert.equal(f.elements.redo.disabled, true);
  f.undo(); f.elements.new.emit('click');
  assert.equal(f.elements.redo.disabled, true);
  assert.equal(f.elements.undo.disabled, false);
  assert.equal(f.elements.count.textContent, '0 stones');
});

test('arrow navigation follows diamond horizontal lines and skips occupied cells', () => {
  const f = game();
  f.click(4);
  const button = f.elements.board.buttons[6]; button.focus();
  f.elements.board.emit('keydown', { target: button, key: 'ArrowRight', preventDefault() {} });
  assert.equal(document.activeElement.dataset.hexCell, '2');
  f.elements.board.emit('keydown', { target: document.activeElement, key: 'ArrowRight', preventDefault() {} });
  assert.equal(document.activeElement.dataset.hexCell, '2');
});


function memoryStorage() {
  let value = null;
  return { read: () => structuredClone(value), save: next => { value = structuredClone(next); }, setSnapshotProvider() {} };
}

test('reopening local Hex restores settings, colours, turn and redo', () => {
  const storage = memoryStorage(); let f = game({ size: 5, storage });
  f.click(0); f.click(1); f.undo();
  f = game({ size: 3, order: '1', storage });
  assert.equal(f.elements.size.value, '5'); assert.equal(f.orders.find(o => o.checked).value, 'local');
  assert.deepEqual(f.colors().slice(0, 3), [1, 0, 0]); assert.match(f.elements.status.textContent, /Blue’s turn/);
  f.redo(); assert.deepEqual(f.colors().slice(0, 3), [1, 2, 0]);
  f.undo(); f.undo(); assert.ok(f.colors().every(c => c === 0));
});

test('reopening a pending computer turn resumes its reply and still undoes the whole turn', () => {
  const storage = memoryStorage(); let f = game({ order: '1', storage }); f.click(0);
  f = game({ storage });
  assert.equal(f.orders.find(o => o.checked).value, '1'); assert.equal(Computer.instances.length, 1);
  assert.equal(f.elements.board.attributes.get('aria-busy'), 'true');
  Computer.instances[0].reply(1); assert.deepEqual(f.colors().slice(0, 3), [1, 2, 0]);
  f.undo(); assert.ok(f.colors().every(c => c === 0));
});

test('a saved second-player opening resumes with Red and cannot undo the opening', () => {
  const storage = memoryStorage(); let f = game({ order: '2', storage });
  f = game({ storage }); assert.equal(Computer.instances[0].position.color, 1);
  Computer.instances[0].reply(0); assert.equal(f.elements.undo.disabled, true);
  f = game({ storage }); assert.equal(Computer.instances.length, 0);
  assert.equal(f.colors()[0], 1); assert.equal(f.orders.find(o => o.checked).value, '2');
});

test('reset preserves settings and can undo and redo a completed local game', () => {
  const f = game({ switches: true });
  [0, 1, 3, 2, 6].forEach(f.click);
  const won = f.colors();
  assert.equal(f.root.attributes.get('data-hex-winner'), '1');
  f.elements.reset.emit('click');
  assert.ok(f.colors().every(c => c === 0));
  assert.equal(f.root.attributes.get('data-hex-winner'), '0');
  assert.equal(f.elements.computer.checked, false);
  assert.equal(f.elements.size.value, '3');
  assert.equal(f.elements.reset.disabled, true);
  f.undo();
  assert.deepEqual(f.colors(), won);
  assert.equal(f.root.attributes.get('data-hex-winner'), '1');
  f.redo();
  assert.equal(f.root.attributes.get('data-hex-winner'), '0');
  assert.ok(f.colors().every(c => c === 0));
});

test('undoing a reset resumes an interrupted reply and ignores its stale worker', () => {
  const f = game({ order: '1', switches: true });
  f.click(0); const interrupted = Computer.instances[0];
  f.elements.reset.emit('click');
  assert.equal(interrupted.terminated, true);
  f.undo();
  assert.equal(Computer.instances.length, 2);
  assert.equal(f.elements.board.attributes.get('aria-busy'), 'true');
  interrupted.reply(1);
  assert.equal(f.elements.count.textContent, '1 stone');
  Computer.instances[1].reply(4);
  assert.deepEqual(f.colors().slice(0, 5), [1, 0, 0, 0, 2]);
  f.undo();
  assert.ok(f.colors().every(c => c === 0));
});

test('resetting when playing second keeps Blue and undo restores the original opening', () => {
  const f = game({ order: '2', switches: true });
  Computer.instances[0].reply(4);
  f.elements.reset.emit('click');
  assert.equal(f.elements.second.checked, true);
  assert.equal(Computer.instances[1].position.color, 1);
  f.undo();
  assert.equal(Computer.instances[1].terminated, true);
  assert.equal(f.colors()[4], 1);
  assert.match(f.elements.status.textContent, /Your turn · Blue/);
  Computer.instances[1].reply(0);
  assert.equal(f.elements.count.textContent, '1 stone');
});

test('switches choose local or computer play and preserve the hidden second-player preference', () => {
  const storage = memoryStorage();
  let f = game({ order: '2', switches: true, storage });
  f.changeOrder('local');
  assert.equal(f.elements['second-setting'].hidden, true);
  assert.equal(f.elements.second.checked, true);
  f.click(0); f.click(1);
  f = game({ order: '1', switches: true, storage });
  assert.equal(f.elements.computer.checked, false);
  assert.equal(f.elements['second-setting'].hidden, true);
  assert.equal(f.elements.second.checked, true);
  f.elements.computer.checked = true; f.elements.computer.emit('change');
  assert.equal(f.elements['second-setting'].hidden, false);
  assert.equal(Computer.instances[0].position.color, 1);
});

test('saved histories retain repeated resets beyond a board’s move count', () => {
  const storage = memoryStorage();
  let f = game({ switches: true, storage });
  for (let i = 0; i < 12; i++) { f.click(0); f.elements.reset.emit('click'); }
  assert.ok(storage.read().history.length > 9);
  f = game({ order: '1', switches: true, storage });
  assert.equal(f.elements.computer.checked, false);
  f.undo(); assert.equal(f.colors()[0], 1);
  f.redo(); assert.ok(f.colors().every(c => c === 0));
});

test('a failed computer opening can be retried with Reset on an empty board', () => {
  const f = game({ order: '2', switches: true });
  Computer.instances[0].reply(-1);
  assert.equal(f.elements.reset.disabled, false);
  assert.match(f.elements.status.textContent, /Reset to try again/);
  f.elements.reset.emit('click');
  Computer.instances[1].reply(4);
  assert.equal(f.colors()[4], 1);
  assert.match(f.elements.status.textContent, /Your turn · Blue/);
});

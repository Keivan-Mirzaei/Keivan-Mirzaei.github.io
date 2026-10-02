import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeHexGame } from '../assets/js/widgets/hex.mjs';

// A small DOM fixture keeps controller checks independent of a browser package.
class Element {
  constructor(properties = {}) {
    Object.assign(this, { disabled: true, textContent: '', style: {}, dataset: {}, listeners: new Map(), attributes: new Map() }, properties);
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
  contains(element) { return this.buttons?.includes(element) || false; }
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

function game({ order = 'local', size = 3, legacy = false } = {}) {
  globalThis.document = { activeElement: null, body: new Element() };
  globalThis.Worker = Computer;
  Computer.instances = [];
  const elements = Object.fromEntries(['count', 'instruction', 'status', 'new', 'undo', 'size-label'].map(key => [key, new Element()]));
  elements.size = new Element({ type: legacy ? 'select-one' : 'range', value: String(size) });
  elements.board = new Board();
  const orders = legacy
    ? [new Element({ type: 'select-one', value: order })]
    : ['1', '2', 'local'].map(value => new Element({ type: 'radio', value, checked: value === order }));
  const fixture = {
    querySelector: selector => elements[selector.match(/^\[data-hex-(.+)\]$/)[1]],
    querySelectorAll: selector => selector === '[data-hex-order]' ? orders : [elements.size, elements.new, ...orders],
  };
  initializeHexGame(fixture);
  return {
    elements,
    orders,
    click: move => {
      const button = elements.board.buttons[move];
      if (!button.disabled) elements.board.emit('click', { target: button });
    },
    undo: () => elements.undo.emit('click'),
    colors: () => elements.board.buttons.map(button => button.className.includes('hex-red') ? 1 : button.className.includes('hex-blue') ? 2 : 0),
    changeOrder: value => {
      if (legacy) { orders[0].value = value; orders[0].emit('change'); }
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
  assert.match(fixture.elements.status.textContent, /Blue to play/);
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
  assert.match(fixture.elements.status.textContent, /Red to play/);
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

test('playing second gives the computer a Red opening that undo cannot remove', () => {
  const fixture = game({ order: '2' });
  const opening = Computer.instances[0];
  assert.equal(opening.position.color, 1);
  assert.ok(opening.position.cells.every(color => color === 0));
  assert.equal(fixture.elements.undo.disabled, true);
  opening.reply(4);
  assert.equal(fixture.colors()[4], 1);
  assert.match(fixture.elements.status.textContent, /^Your turn · Blue/);
  fixture.click(0);
  Computer.instances[1].reply(8);
  fixture.undo();
  assert.equal(fixture.elements.count.textContent, '1 stone');
  assert.equal(fixture.colors()[4], 1);
  assert.equal(fixture.elements.undo.disabled, true);
  assert.match(fixture.elements.status.textContent, /Your last turn has been undone/);
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
  assert.equal(document.activeElement, document.body);
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

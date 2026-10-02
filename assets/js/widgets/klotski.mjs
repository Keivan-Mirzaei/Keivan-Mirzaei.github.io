import { createKlotski, slideKlotski, undoKlotski, redoKlotski, canSlide, maxSlide } from '../lib/klotski.mjs?v=20261002-4';

const keyboardDirections = { ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left' };

export function initializeKlotski(game) {
  const get = name => game.querySelector(`[data-klotski-${name}]`);
  const board = get('board'), directions = [...game.querySelectorAll('[data-klotski-direction]')];
  let state = createKlotski(), selected = null, drag = null;
  const blocks = new Map();
  board.replaceChildren();
  board.setAttribute('role', 'group');
  board.setAttribute('aria-label', 'Klotski board. Slide the marked square to the opening at the bottom centre.');
  for (const piece of state.pieces) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `klotski-block${piece.id === 'target' ? ' klotski-target' : ''}`;
    button.dataset.klotskiBlock = piece.id;
    button.innerHTML = piece.id === 'target'
      ? '<span><span class="klotski-target-arrow" aria-hidden="true">↓</span><span>Exit</span></span>'
      : `<span aria-hidden="true">${piece.id}</span>`;
    board.append(button); blocks.set(piece.id, button);
  }

  function render(message = '') {
    for (const piece of state.pieces) {
      const button = blocks.get(piece.id);
      button.style.left = `${piece.x * 25}%`; button.style.top = `${piece.y * 20}%`;
      button.style.width = `${piece.width * 25}%`; button.style.height = `${piece.height * 20}%`;
      button.classList.toggle('is-selected', selected === piece.id);
      button.setAttribute('aria-pressed', String(selected === piece.id));
      button.setAttribute('aria-label', `${piece.label}, ${piece.width} ${piece.width === 1 ? 'column' : 'columns'} wide and ${piece.height} ${piece.height === 1 ? 'row' : 'rows'} tall, at row ${piece.y + 1}, column ${piece.x + 1}. ${piece.id === 'target' ? 'Slide this square to the exit.' : 'Select to move.'}`);
      button.disabled = state.won;
    }
    board.classList.toggle('is-solved', state.won);
    get('count').textContent = `${state.moves} ${state.moves === 1 ? 'move' : 'moves'}`;
    const piece = state.pieces.find(item => item.id === selected);
    get('selection').textContent = piece ? piece.label : 'Select a block';
    for (const button of directions) {
      const direction = button.dataset.klotskiDirection;
      button.disabled = !selected || !canSlide(state, selected, direction);
      button.setAttribute('aria-label', `Move ${piece ? piece.label.toLowerCase() : 'selected block'} ${direction}`);
    }
    get('undo').disabled = !state.history.length;
    get('redo').disabled = !state.future.length;
    get('restart').disabled = false;
    get('status').textContent = state.won
      ? `You found the way out! Solved in ${state.moves} ${state.moves === 1 ? 'move' : 'moves'}.`
      : message;
  }

  function select(id) {
    if (state.won || !blocks.has(id)) return;
    selected = id; render();
  }

  function move(direction, distance = 1) {
    if (!selected || state.won) return false;
    const next = slideKlotski(state, selected, direction, distance);
    if (!next) { render('That way is blocked. Slide into an empty space.'); return false; }
    const active = document.activeElement;
    state = next; render();
    if (state.won) get('undo').focus({ preventScroll: true });
    else if (directions.includes(active) && active.disabled) blocks.get(selected).focus({ preventScroll: true });
    return true;
  }

  function clearDrag() {
    if (!drag) return;
    const current = drag;
    drag = null;
    const button = blocks.get(current.id);
    button.style.transform = ''; button.classList.remove('is-dragging');
    if (button.hasPointerCapture?.(current.pointerId)) button.releasePointerCapture(current.pointerId);
  }

  function dragOffset(event) {
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const direction = horizontal ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'up' : 'down';
    const offset = horizontal ? dx : dy;
    const cell = horizontal ? drag.cellX : drag.cellY;
    const limit = maxSlide(state, drag.id, direction) * cell;
    return { direction, offset: Math.sign(offset) * Math.min(Math.abs(offset), limit), horizontal, cell };
  }

  board.addEventListener('click', event => {
    const button = event.target.closest('[data-klotski-block]');
    if (button) select(button.dataset.klotskiBlock);
  });
  board.addEventListener('focusin', event => {
    const button = event.target.closest('[data-klotski-block]');
    if (button) select(button.dataset.klotskiBlock);
  });
  board.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-klotski-block]');
    if (!button || state.won || event.isPrimary === false || event.button !== 0) return;
    clearDrag(); select(button.dataset.klotskiBlock);
    drag = { id: selected, pointerId: event.pointerId, x: event.clientX, y: event.clientY, cellX: board.clientWidth / 4, cellY: board.clientHeight / 5 };
    button.setPointerCapture?.(event.pointerId);
  });
  board.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    const offset = dragOffset(event), button = blocks.get(drag.id);
    button.classList.add('is-dragging');
    button.style.transform = `translate(${offset.horizontal ? offset.offset : 0}px, ${offset.horizontal ? 0 : offset.offset}px)`;
  });
  board.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const { direction, offset, cell } = dragOffset(event);
    const distance = Math.min(maxSlide(state, drag.id, direction), Math.floor(Math.abs(offset) / cell + .65));
    clearDrag();
    if (distance) move(direction, distance);
  });
  board.addEventListener('pointercancel', clearDrag);
  board.addEventListener('lostpointercapture', clearDrag);
  directions.forEach(button => button.addEventListener('click', () => { clearDrag(); move(button.dataset.klotskiDirection); }));
  game.addEventListener('keydown', event => {
    const direction = keyboardDirections[event.key];
    if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
    const block = event.target.closest('[data-klotski-block]');
    if (!block && !event.target.closest('[data-klotski-direction]')) return;
    event.preventDefault(); clearDrag();
    if (block) selected = block.dataset.klotskiBlock;
    move(direction);
  });
  function undo() {
    clearDrag();
    const previous = undoKlotski(state);
    if (previous) {
      const focused = document.activeElement === get('undo');
      state = previous; render();
      if (focused && get('undo').disabled && selected) blocks.get(selected).focus({ preventScroll: true });
    }
  }
  function redo() {
    clearDrag();
    const next = redoKlotski(state);
    if (!next) return;
    const focused = document.activeElement === get('redo');
    state = next; render();
    if (focused && get('redo').disabled) (state.won || !selected ? get('undo') : blocks.get(selected)).focus({ preventScroll: true });
  }
  get('undo').addEventListener('click', undo);
  get('redo').addEventListener('click', redo);
  get('restart').addEventListener('click', () => {
    clearDrag(); state = createKlotski(); selected = null; render();
  });
  render();
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-klotski-game]').forEach(initializeKlotski);
}

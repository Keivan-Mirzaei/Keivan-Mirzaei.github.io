import { BOARD_WIDTH, BOARD_HEIGHT, isKlotskiStart, resetKlotski, slideKlotski, undoKlotski, redoKlotski, maxSlide } from '../lib/klotski.mjs';
import { createPuzzleStorage } from '../lib/puzzle-storage.mjs';
import { serializeKlotski, restoreKlotski } from '../lib/klotski-storage.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';

const keyboardDirections = { ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left' };

export function initializeKlotski(game, storage = createPuzzleStorage('klotski', game)) {
  const get = name => game.querySelector(`[data-klotski-${name}]`);
  const board = get('board');
  const events = new AbortController();
  const listen = (element, name, handler) => element.addEventListener(name, handler, { signal: events.signal });
  const disposePanels = initializeWidgetPanels(game);
  let state = restoreKlotski(storage.read()), selected = null, drag = null;
  storage.setSnapshotProvider(() => serializeKlotski(state));
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
      : '';
    board.append(button); blocks.set(piece.id, button);
  }

  function render(message = '') {
    for (const piece of state.pieces) {
      const button = blocks.get(piece.id);
      button.style.width = `${piece.width / BOARD_WIDTH * 100}%`;
      button.style.height = `${piece.height / BOARD_HEIGHT * 100}%`;
      // Percentages are relative to the block, so positions also follow board resizing.
      button.style.transform = `translate3d(${piece.x / piece.width * 100}%, ${piece.y / piece.height * 100}%, 0)`;
      button.classList.toggle('is-selected', selected === piece.id);
      button.setAttribute('aria-pressed', String(selected === piece.id));
      button.setAttribute('aria-label', `${piece.id === 'target' ? 'Exit block' : piece.width === piece.height ? 'Small square' : piece.width > piece.height ? 'Horizontal block' : 'Vertical block'}, ${piece.width} ${piece.width === 1 ? 'column' : 'columns'} wide and ${piece.height} ${piece.height === 1 ? 'row' : 'rows'} tall, at row ${piece.y + 1}, column ${piece.x + 1}. ${piece.id === 'target' ? 'Slide this square to the exit.' : 'Select to move.'}`);
      button.disabled = state.won;
    }
    board.classList.toggle('is-solved', state.won);
    game.setAttribute('data-klotski-solved', String(state.won));
    get('count').textContent = `${state.moves} ${state.moves === 1 ? 'move' : 'moves'}`;
    get('undo').disabled = !state.history.length;
    get('redo').disabled = !state.future.length;
    get('restart').disabled = isKlotskiStart(state);
    get('status').textContent = state.won
      ? `You found the way out! Solved in ${state.moves} ${state.moves === 1 ? 'move' : 'moves'}.`
      : message || 'Slide blocks into empty space.';
    storage.save(serializeKlotski(state));
  }

  function select(id) {
    if (state.won || !blocks.has(id)) return;
    selected = id; render();
  }

  function move(direction, distance = 1) {
    if (!selected || state.won) return false;
    const next = slideKlotski(state, selected, direction, distance);
    if (!next) { render('That way is blocked. Slide into an empty space.'); return false; }
    state = next; render();
    if (state.won) get('undo').focus({ preventScroll: true });
    return true;
  }

  function releaseDrag() {
    if (!drag) return null;
    const current = drag;
    drag = null;
    const button = blocks.get(current.id);
    // Commit the pointer's current position before enabling the settling transition.
    // Keep its transform here: resetting it would make the block jump on release.
    button.getBoundingClientRect();
    button.classList.remove('is-dragging');
    if (button.hasPointerCapture?.(current.pointerId)) button.releasePointerCapture(current.pointerId);
    return current;
  }

  function cancelDrag() {
    if (releaseDrag()) render();
  }

  function dragOffset(event) {
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.axis) {
      if (Math.hypot(dx, dy) < 6) return null;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      const xDirection = dx < 0 ? 'left' : 'right', yDirection = dy < 0 ? 'up' : 'down';
      // Choose an available direction, then keep that axis steady through the gesture.
      if (horizontal && drag.limits[xDirection]) drag.axis = 'horizontal';
      else if (!horizontal && drag.limits[yDirection]) drag.axis = 'vertical';
      else if (Math.abs(dy) >= 6 && drag.limits[yDirection]) drag.axis = 'vertical';
      else if (Math.abs(dx) >= 6 && drag.limits[xDirection]) drag.axis = 'horizontal';
      else return null;
    }
    const horizontal = drag.axis === 'horizontal', cell = horizontal ? drag.cellX : drag.cellY;
    const raw = horizontal ? drag.startX - drag.baseX + dx : drag.startY - drag.baseY + dy;
    const offset = Math.max(-drag.limits[horizontal ? 'left' : 'up'] * cell,
      Math.min(raw, drag.limits[horizontal ? 'right' : 'down'] * cell));
    return { direction: horizontal ? offset < 0 ? 'left' : 'right' : offset < 0 ? 'up' : 'down',
      offset, cell, x: drag.baseX + (horizontal ? offset : 0), y: drag.baseY + (horizontal ? 0 : offset) };
  }

  listen(board, 'click', event => {
    const button = event.target.closest('[data-klotski-block]');
    if (button) select(button.dataset.klotskiBlock);
  });
  listen(board, 'focusin', event => {
    const button = event.target.closest('[data-klotski-block]');
    if (button) select(button.dataset.klotskiBlock);
  });
  listen(board, 'pointerdown', event => {
    const button = event.target.closest('[data-klotski-block]');
    if (!button || state.won || drag || event.isPrimary === false || event.button !== 0) return;
    const piece = state.pieces.find(item => item.id === button.dataset.klotskiBlock);
    const bounds = button.getBoundingClientRect(), boardBounds = board.getBoundingClientRect();
    const cellX = board.clientWidth / BOARD_WIDTH, cellY = board.clientHeight / BOARD_HEIGHT;
    const baseX = piece.x * cellX, baseY = piece.y * cellY;
    const startX = bounds.left - boardBounds.left - board.clientLeft;
    const startY = bounds.top - boardBounds.top - board.clientTop;
    select(piece.id);
    drag = { id: piece.id, pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      cellX, cellY, baseX, baseY, startX, startY,
      // Picking up a settling block preserves its visible position and movement axis.
      axis: Math.abs(startX - baseX) > .5 ? 'horizontal' : Math.abs(startY - baseY) > .5 ? 'vertical' : null,
      limits: Object.fromEntries(['left', 'right', 'up', 'down'].map(direction => [direction, maxSlide(state, piece.id, direction)])) };
    button.classList.add('is-dragging');
    button.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
    button.setPointerCapture?.(event.pointerId);
  });
  listen(board, 'pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    const offset = dragOffset(event);
    if (offset) blocks.get(drag.id).style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`;
  });
  listen(board, 'pointerup', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const offset = dragOffset(event);
    const distance = offset ? Math.round(Math.abs(offset.offset) / offset.cell) : 0;
    releaseDrag();
    if (!distance || !move(offset.direction, distance)) render();
  });
  listen(board, 'pointercancel', cancelDrag);
  listen(board, 'lostpointercapture', cancelDrag);
  listen(game, 'keydown', event => {
    const direction = keyboardDirections[event.key];
    if (!direction || event.altKey || event.ctrlKey || event.metaKey) return;
    const block = event.target.closest('[data-klotski-block]');
    if (!block) return;
    event.preventDefault(); cancelDrag();
    if (block) selected = block.dataset.klotskiBlock;
    move(direction);
  });
  function undo() {
    releaseDrag();
    const previous = undoKlotski(state);
    if (previous) {
      const focused = document.activeElement === get('undo');
      state = previous; render();
      if (focused && get('undo').disabled && selected) blocks.get(selected).focus({ preventScroll: true });
    }
  }
  function redo() {
    releaseDrag();
    const next = redoKlotski(state);
    if (!next) return;
    const focused = document.activeElement === get('redo');
    state = next; render();
    if (focused && get('redo').disabled) (state.won || !selected ? get('undo') : blocks.get(selected)).focus({ preventScroll: true });
  }
  listen(get('undo'), 'click', undo);
  listen(get('redo'), 'click', redo);
  listen(get('restart'), 'click', () => {
    releaseDrag(); board.classList.add('is-resetting');
    const next = resetKlotski(state);
    if (next) { state = next; selected = null; }
    render();
    board.getBoundingClientRect(); board.classList.remove('is-resetting');
    if (document.activeElement === get('restart')) blocks.get('target').focus({ preventScroll: true });
  });
  render();
  return { destroy() { cancelDrag(); disposePanels(); events.abort(); } };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-klotski-game]').forEach(root => initializeKlotski(root));
}

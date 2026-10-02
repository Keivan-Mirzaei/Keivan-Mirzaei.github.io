import { LEVELS, createGame, transformShape, placementCells, occupiedCells, checkPlacement, key } from '../lib/tiling.mjs';

const colors = ['#c67b67', '#70968c', '#839bbc', '#c4a168', '#a68cad', '#8eaa72', '#b68d9e', '#769fac'];
const reasonText = {
  outside: 'That tile reaches beyond the floor. Try a different square or rotate it.',
  hole: 'That tile covers a missing square. Try a different square or rotate it.',
  overlap: 'Tiles cannot overlap. Choose a clear space or move the other tile first.',
};

function describeShape(cells) {
  const rows = new Map();
  cells.forEach(([x, y]) => { if (!rows.has(y)) rows.set(y, []); rows.get(y).push(x + 1); });
  return `Squares at ${[...rows].map(([y, columns]) => `row ${y + 1}, ${columns.length === 1 ? 'column' : 'columns'} ${columns.join(' and ')}`).join('; ')}. The anchor is row ${cells[0][1] + 1}, column ${cells[0][0] + 1}.`;
}

function shapeMarkup(cells, color, { anchor = true, label = '' } = {}) {
  const width = Math.max(...cells.map(cell => cell[0])) + 1, height = Math.max(...cells.map(cell => cell[1])) + 1;
  const squares = cells.map(([x, y]) => `<rect x="${x * 24 + 1}" y="${y * 24 + 1}" width="22" height="22" rx="2" fill="${color}"/>`).join('');
  const [x, y] = cells[0];
  const dot = anchor ? `<circle cx="${x * 24 + 12}" cy="${y * 24 + 12}" r="3" fill="#282e29" stroke="#fcfcf9" stroke-width="1.5"/>` : '';
  return `<svg viewBox="0 0 ${width * 24} ${height * 24}" aria-hidden="true"${label ? ` data-tile-shape="${label}"` : ''}>${squares}${dot}</svg>`;
}

export function initializeTilingGame(root) {
  const get = name => root.querySelector(`[data-tiling-${name}]`);
  let game = createGame(), selected = null, rotation = 0, flipped = false;
  let anchor = null, boardCursor = game.level.floor[0], hintPreview = null;
  let drag = null, dragGhost = null, suppressClickUntil = 0;
  const colorFor = id => colors[game.level.pieces.findIndex(piece => piece.id === id) % colors.length];
  const selectedPiece = () => game.level.pieces.find(piece => piece.id === selected);
  const currentShape = () => selected ? transformShape(selectedPiece().cells, { rotation, flipped }) : [];
  const currentPosition = () => {
    if (!selected || !anchor) return null;
    const [dx, dy] = currentShape()[0];
    return { x: anchor[0] - dx, y: anchor[1] - dy, rotation, flipped };
  };
  const select = (id, message = '') => {
    selected = id;
    const saved = game.placements[id];
    rotation = saved?.rotation || 0; flipped = saved?.flipped || false;
    anchor = null; hintPreview = null;
    render(message || `Tile ${id} selected. Tap a floor square for its marked anchor; rotate or flip to find a fit.`);
  };

  function showChallenge() {
    const value = Number(get('challenge').value);
    get('challenge-label').textContent = `${value} of ${LEVELS.length}`;
    get('challenge').setAttribute('aria-valuetext', `Challenge ${value} of ${LEVELS.length}`);
  }

  function preview() {
    const board = get('board');
    board.querySelectorAll('.is-preview, .is-preview-invalid, .is-preview-anchor').forEach(cell => {
      cell.classList.remove('is-preview', 'is-preview-invalid', 'is-preview-anchor');
      cell.style.removeProperty('--preview-color');
    });
    const position = currentPosition();
    if (!position) return;
    const result = checkPlacement(game.level, game.placements, selected, position);
    for (const [x, y] of result.cells) {
      const cell = board.querySelector(`[data-tiling-cell="${key(x, y)}"]`);
      if (!cell) continue;
      cell.classList.add(result.valid ? 'is-preview' : 'is-preview-invalid');
      cell.style.setProperty('--preview-color', colorFor(selected));
      if (anchor && x === anchor[0] && y === anchor[1]) cell.classList.add('is-preview-anchor');
    }
  }

  function render(message = '') {
    const active = document.activeElement;
    const hadFocus = root.contains(active);
    const focusCell = hadFocus ? active.dataset?.tilingCell : null;
    const focusPiece = root.contains(active) ? active.dataset?.tilingPiece : null;
    const level = game.level, placed = game.placements, occupied = occupiedCells(level, placed);
    const floor = new Set(level.floor.map(([x, y]) => key(x, y)));
    const pieceAnchors = new Map(Object.entries(placed).map(([id, position]) => {
      const cells = placementCells(level.pieces.find(piece => piece.id === id), position);
      return [key(...cells[0]), id];
    }));
    const board = get('board');
    board.style.setProperty('--tiling-columns', level.width);
    board.style.setProperty('--tiling-rows', level.height);
    board.setAttribute('role', 'group');
    board.setAttribute('aria-label', `${level.width} by ${level.height} floor. ${level.floor.length} squares to fill. Arrow keys move between floor squares.`);
    let markup = '';
    for (let y = 0; y < level.height; y++) for (let x = 0; x < level.width; x++) {
      const cellKey = key(x, y);
      if (!floor.has(cellKey)) {
        markup += `<span class="tiling-cell tiling-hole" data-tiling-cell="${cellKey}" aria-label="Missing square, row ${y + 1}, column ${x + 1}"></span>`;
        continue;
      }
      const id = occupied.get(cellKey), isAnchor = pieceAnchors.has(cellKey);
      const style = id ? ` style="--tile-color:${colorFor(id)}"` : '';
      markup += `<button type="button" class="tiling-cell${id ? ' is-filled' : ''}${id === selected ? ' is-selected' : ''}" data-tiling-cell="${cellKey}"${id ? ` data-tiling-occupant="${id}"` : ''}${style} tabindex="${boardCursor[0] === x && boardCursor[1] === y ? '0' : '-1'}" aria-label="Row ${y + 1}, column ${x + 1}: ${id ? `tile ${id}${isAnchor ? ', anchor square' : ''}. Select or move tile ${id}.` : 'empty floor. Place the selected tile here.'}">${id ? `<span>${id}</span>${isAnchor ? '<i class="tiling-anchor-dot" aria-hidden="true"></i>' : ''}` : ''}</button>`;
    }
    board.innerHTML = markup;
    get('tray').innerHTML = level.pieces.map(piece => {
      const saved = placed[piece.id], orientation = selected === piece.id ? { rotation, flipped } : saved || {};
      const shape = transformShape(piece.cells, orientation);
      return `<button class="tiling-piece${selected === piece.id ? ' is-selected' : ''}${saved ? ' is-placed' : ''}" type="button" data-tiling-piece="${piece.id}" aria-pressed="${selected === piece.id}" aria-label="Tile ${piece.id}, ${saved ? 'placed. Select to move or return it' : 'ready to place'}. ${describeShape(shape)}"><span class="tiling-piece-name">${piece.id}${saved ? '<span aria-hidden="true">✓</span>' : ''}</span>${shapeMarkup(shape, colorFor(piece.id))}<span class="tiling-piece-state">${saved ? 'Placed' : 'Ready'}</span></button>`;
    }).join('');
    get('name').textContent = level.name;
    get('progress').textContent = `${game.filled} / ${level.floor.length} squares`;
    const remaining = level.pieces.length - Object.keys(placed).length;
    get('tray-count').textContent = `${remaining} to place`;
    get('selected-label').textContent = selected ? `Tile ${selected}${placed[selected] ? ' · on the floor' : ' · ready to place'}` : 'Pick a tile to begin.';
    get('selected-shape').innerHTML = selected ? shapeMarkup(currentShape(), colorFor(selected)) : '';
    get('selected').classList.toggle('has-selection', Boolean(selected));
    get('rotate').disabled = !selected;
    get('flip').disabled = !selected;
    get('remove').disabled = !selected || !placed[selected];
    get('undo').disabled = !game.canUndo;
    get('hint').disabled = game.solved;
    get('hint').textContent = hintPreview ? 'Place hint' : 'Hint';
    get('next').hidden = !game.solved || level.id === LEVELS.length;
    get('next').disabled = !game.solved;
    get('instruction').textContent = 'Fill the floor. Pick a tile, then tap where its marked square should go. Rotate or flip it to find a fit.';
    get('status').textContent = message || (game.solved
      ? 'Floor complete! Every square is covered and every tile fits.'
      : selected ? `Tile ${selected} selected. Tap a floor square for its marked anchor.`
      : 'Choose a tile to start filling the floor.');
    root.classList.toggle('is-solved', game.solved);
    preview();
    if (focusCell) board.querySelector(`button[data-tiling-cell="${focusCell}"]`)?.focus({ preventScroll: true });
    else if (focusPiece) get('tray').querySelector(`[data-tiling-piece="${focusPiece}"]`)?.focus({ preventScroll: true });
    else if (hadFocus && (active.disabled || active.hidden)) {
      const destination = game.solved && !get('next').hidden ? get('next')
        : selected ? get('tray').querySelector(`[data-tiling-piece="${selected}"]`)
        : board.querySelector('button');
      destination?.focus({ preventScroll: true });
    }
  }

  function place(position = currentPosition()) {
    if (!selected || !position) return false;
    const id = selected, result = game.place(id, position);
    hintPreview = null;
    if (!result.valid) {
      render(reasonText[result.reason] || 'That tile does not fit there. Try another square.');
      return false;
    }
    selected = null; anchor = null;
    render(game.solved ? '' : `Tile ${id} placed. Choose another tile, or select a placed tile to move it.`);
    return true;
  }

  function turn(kind) {
    if (!selected) return;
    if (kind === 'rotate') rotation = (rotation + 1) % 4;
    else flipped = !flipped;
    hintPreview = null;
    render(`Tile ${selected} ${kind === 'rotate' ? 'rotated' : 'flipped'}. Tap a square for its marked anchor.`);
  }

  function remove() {
    if (!selected || !game.remove(selected)) return;
    anchor = null; hintPreview = null;
    render(`Tile ${selected} returned to the tray. Place it in a new spot.`);
  }

  function newFloor(index = Number(get('challenge').value) - 1) {
    endDrag();
    const value = Math.max(0, Math.min(LEVELS.length - 1, index));
    get('challenge').value = String(value + 1); showChallenge();
    game = createGame(LEVELS[value]); selected = null; anchor = null; hintPreview = null;
    boardCursor = game.level.floor[0];
    render();
  }

  function hint() {
    if (game.solved) return;
    if (hintPreview && hintPreview.id === selected) { place(hintPreview.position); return; }
    const solution = game.hint();
    if (!solution) {
      anchor = null; hintPreview = null;
      render('The remaining tiles cannot fill this arrangement. Undo a move or return a placed tile, then try Hint again.');
      return;
    }
    const id = selected && !game.placements[selected] ? selected : game.level.pieces.find(piece => !game.placements[piece.id]).id;
    selected = id;
    const position = solution[id]; rotation = position.rotation; flipped = position.flipped;
    const [dx, dy] = currentShape()[0]; anchor = [position.x + dx, position.y + dy];
    hintPreview = { id, position };
    render(`Place tile ${id} on the outlined squares. Tap its marked square, or choose Place hint.`);
  }

  get('tray').addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) return;
    const button = event.target.closest('[data-tiling-piece]');
    if (button) select(button.dataset.tilingPiece);
  });
  get('board').addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) return;
    const cell = event.target.closest('[data-tiling-cell]');
    if (!cell) return;
    const coordinates = cell.dataset.tilingCell.split(',').map(Number), occupant = cell.dataset.tilingOccupant;
    if (cell.tagName === 'BUTTON') boardCursor = coordinates;
    if (occupant && (!selected || (game.placements[selected] && selected !== occupant))) { select(occupant); return; }
    if (!selected) { get('status').textContent = 'Pick a tile from the tray first.'; return; }
    anchor = coordinates; place();
  });
  get('board').addEventListener('pointerover', event => {
    if (!selected || drag?.active || hintPreview) return;
    const cell = event.target.closest('[data-tiling-cell]');
    if (cell) { anchor = cell.dataset.tilingCell.split(',').map(Number); preview(); }
  });
  get('board').addEventListener('pointerleave', () => {
    if (!drag?.active && !hintPreview) { anchor = null; preview(); }
  });
  get('board').addEventListener('focusin', event => {
    const cell = event.target.closest('button[data-tiling-cell]');
    if (!cell) return;
    boardCursor = cell.dataset.tilingCell.split(',').map(Number);
    get('board').querySelectorAll('button').forEach(button => { button.tabIndex = button === cell ? 0 : -1; });
    if (selected && !hintPreview) { anchor = boardCursor; preview(); }
  });
  root.addEventListener('keydown', event => {
    if (event.target.tagName === 'INPUT' || event.ctrlKey || event.altKey || event.metaKey) return;
    const cell = event.target.closest('button[data-tiling-cell]');
    const deltas = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (cell && deltas[event.key]) {
      event.preventDefault();
      const [dx, dy] = deltas[event.key]; let [x, y] = cell.dataset.tilingCell.split(',').map(Number);
      while (true) {
        x += dx; y += dy;
        if (x < 0 || y < 0 || x >= game.level.width || y >= game.level.height) break;
        const next = get('board').querySelector(`button[data-tiling-cell="${key(x, y)}"]`);
        if (next) { next.focus(); break; }
      }
      return;
    }
    if (event.key.toLowerCase() === 'r' && selected) { event.preventDefault(); turn('rotate'); }
    else if (event.key.toLowerCase() === 'f' && selected) { event.preventDefault(); turn('flip'); }
    else if ((event.key === 'Delete' || event.key === 'Backspace') && selected) { event.preventDefault(); remove(); }
    else if (event.key === 'Escape' && selected) { event.preventDefault(); selected = null; anchor = null; hintPreview = null; render('Selection cleared. Choose a tile to continue.'); }
  });

  // Pointer drag is an extra convenience; every action is also available by tap and keyboard.
  root.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.isPrimary === false) return;
    const tile = event.target.closest('[data-tiling-piece]'), cell = event.target.closest('[data-tiling-occupant]');
    const id = tile?.dataset.tilingPiece || cell?.dataset.tilingOccupant;
    if (!id) return;
    endDrag();
    drag = { id, pointer: event.pointerId, startX: event.clientX, startY: event.clientY, active: false, grabbed: cell ? cell.dataset.tilingCell.split(',').map(Number) : null };
  });
  root.addEventListener('pointermove', event => {
    if (!drag || drag.pointer !== event.pointerId) return;
    if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 8) return;
    if (!drag.active) {
      const pending = drag;
      if (selected !== pending.id) select(pending.id);
      else { hintPreview = null; anchor = null; render(`Tile ${selected} selected. Drag it onto the floor.`); }
      drag = pending; drag.active = true;
      const saved = game.placements[selected];
      const sameOrientation = saved && saved.rotation === rotation && saved.flipped === flipped;
      drag.offset = drag.grabbed && sameOrientation ? [drag.grabbed[0] - saved.x, drag.grabbed[1] - saved.y] : currentShape()[0];
      root.setPointerCapture(event.pointerId);
      dragGhost = document.createElement('div'); dragGhost.className = 'tiling-drag-ghost';
      const shape = currentShape();
      dragGhost.innerHTML = shapeMarkup(shape, colorFor(selected));
      dragGhost.style.width = `${(Math.max(...shape.map(part => part[0])) + 1) * 30}px`;
      document.body.append(dragGhost);
      root.classList.add('is-dragging');
    }
    event.preventDefault();
    dragGhost.style.left = `${event.clientX - drag.offset[0] * 30 - 15}px`;
    dragGhost.style.top = `${event.clientY - drag.offset[1] * 30 - 15}px`;
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-tiling-cell]');
    if (cell && get('board').contains(cell)) {
      const target = cell.dataset.tilingCell.split(',').map(Number), first = currentShape()[0];
      anchor = [target[0] - drag.offset[0] + first[0], target[1] - drag.offset[1] + first[1]];
    } else anchor = null;
    preview();
  });
  root.addEventListener('pointerup', event => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const active = drag.active;
    if (active) {
      suppressClickUntil = performance.now() + 350;
      if (anchor) place();
      else { anchor = null; render('Drop the tile onto the floor, or tap a square for its marked anchor.'); }
    }
    endDrag();
  });
  root.addEventListener('pointercancel', () => endDrag(true));
  root.addEventListener('lostpointercapture', () => endDrag(true));
  function endDrag(cancelled = false) {
    const previous = drag;
    drag = null; dragGhost?.remove(); dragGhost = null; root.classList.remove('is-dragging');
    if (previous?.active && root.hasPointerCapture?.(previous.pointer)) root.releasePointerCapture(previous.pointer);
    if (cancelled && previous?.active) { anchor = null; preview(); }
  }

  get('rotate').addEventListener('click', () => turn('rotate'));
  get('flip').addEventListener('click', () => turn('flip'));
  get('remove').addEventListener('click', remove);
  get('undo').addEventListener('click', () => {
    if (!game.undo()) return;
    selected = null; anchor = null; hintPreview = null;
    render('Last move undone. Choose a tile to continue.');
  });
  get('reset').addEventListener('click', () => newFloor(game.level.id - 1));
  get('hint').addEventListener('click', hint);
  get('next').addEventListener('click', () => newFloor(game.level.id));
  get('challenge').addEventListener('input', showChallenge);
  get('challenge').addEventListener('change', () => newFloor());
  get('challenge').disabled = false; get('reset').disabled = false;
  newFloor();
  return { get game() { return game; }, get selected() { return selected; } };
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-tiling-game]').forEach(initializeTilingGame);

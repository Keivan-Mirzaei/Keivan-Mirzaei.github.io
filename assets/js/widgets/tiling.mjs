import { createGame, placementCells, occupiedCells, checkPlacement, key } from '../lib/tiling.mjs';

import { DIFFICULTIES } from '../lib/tiling-arrangements.mjs';
import { createPuzzleBook } from '../lib/tiling-book.mjs';
import { createPuzzleStorage } from '../lib/puzzle-storage.mjs';

import { setActionLabel } from '../lib/puzzle-controls.mjs';

const colors = ['#c67b67', '#70968c', '#839bbc', '#c4a168', '#a68cad', '#8eaa72', '#b68d9e', '#769fac'];
const reasonText = {
  outside: 'That tile reaches beyond the floor. Choose another square.',
  hole: 'That tile covers a missing square. Choose another square.',
  overlap: 'Tiles cannot overlap. Choose a clear space or move the other tile first.',
};

function describeShape(cells) {
  const rows = new Map();
  cells.forEach(([x, y]) => { if (!rows.has(y)) rows.set(y, []); rows.get(y).push(x + 1); });
  return `Squares at ${[...rows].map(([y, columns]) => `row ${y + 1}, ${columns.length === 1 ? 'column' : 'columns'} ${columns.join(' and ')}`).join('; ')}. The anchor is row ${cells[0][1] + 1}, column ${cells[0][0] + 1}.`;
}

const tileEdges = [['top', 0, -1], ['right', 1, 0], ['bottom', 0, 1], ['left', -1, 0]];

// Board squares, tray shapes and drag ghosts share the same full-square artwork.
function shapeMarkup(cells, color, singleSquareEdges = null) {
  const width = Math.max(...cells.map(cell => cell[0])) + 1, height = Math.max(...cells.map(cell => cell[1])) + 1;
  const occupied = new Set(cells.map(cell => key(...cell)));
  const squares = cells.map(([x, y]) => {
    const edges = singleSquareEdges || tileEdges.filter(([, dx, dy]) => !occupied.has(key(x + dx, y + dy))).map(([edge]) => edge);
    const outline = { top: 'M.5 .5H23.5', right: 'M23.5 .5V23.5', bottom: 'M23.5 23.5H.5', left: 'M.5 23.5V.5' };
    return `<g transform="translate(${x * 24} ${y * 24})"><rect class="tiling-tile-face" width="24" height="24" fill="${color}"/><path class="tiling-tile-light" d="M.5 23.5V.5H23.5"/><path class="tiling-tile-shade" d="M23.5 .5V23.5H.5"/><path class="tiling-tile-edge" d="${edges.map(edge => outline[edge]).join(' ')}" stroke="color-mix(in srgb, ${color} 70%, #285b46)"/></g>`;
  }).join('');
  return `<svg class="tiling-shape" viewBox="0 0 ${width * 24} ${height * 24}" width="${width * 24}" height="${height * 24}" style="--tile-columns:${width};--tile-rows:${height}" aria-hidden="true">${squares}</svg>`;
}

export function initializeTilingGame(root, storage = createPuzzleStorage('tiling', root), catalogue) {
  const get = name => root.querySelector(`[data-tiling-${name}]`);
  const book = createPuzzleBook(storage.read(), catalogue);
  book.resume();
  let game = createGame(book.level, book.state), selected = null;
  function storedState() {
    book.record(game.exportState(), game.solved);
    return book.exportState();
  }
  storage.setSnapshotProvider(storedState);
  let anchor = null, boardCursor = game.level.floor[0], hintPreview = null;
  let drag = null, dragGhost = null, suppressClickUntil = 0, lastTap = null;
  const pieceFor = id => game.level.pieces.find(piece => piece.id === id);
  const typeFor = id => game.level.types.find(type => type.id === pieceFor(id)?.typeId);
  const labelFor = id => pieceFor(id)?.typeId || id;
  const colorFor = id => colors[game.level.types.indexOf(typeFor(id)) % colors.length];
  const selectedPiece = () => game.level.pieces.find(piece => piece.id === selected);
  const currentShape = () => selected ? selectedPiece().cells : [];
  const currentPosition = () => {
    if (!selected || !anchor) return null;
    const [dx, dy] = currentShape()[0];
    return { x: anchor[0] - dx, y: anchor[1] - dy };
  };
  const select = (id, message = '') => {
    selected = id;
    anchor = null; hintPreview = null;
    render(message || `Tile ${labelFor(id)} selected.`);
  };

  function showChallenge() {
    const value = Number(get('challenge').value);
    const name = DIFFICULTIES[value - 1].name;
    get('challenge-label').textContent = name;
    get('challenge').setAttribute('aria-valuetext', name);
  }

  function preview() {
    const board = get('board');
    board.querySelectorAll('.is-preview, .is-preview-invalid').forEach(cell => {
      cell.classList.remove('is-preview', 'is-preview-invalid');
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
    }
  }

  function render(message = '', notice = false) {
    book.record(game.exportState(), game.solved);
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
      const exposed = id ? tileEdges.filter(([, dx, dy]) => occupied.get(key(x + dx, y + dy)) !== id).map(([edge]) => edge) : [];
      const edges = exposed.map(edge => ` edge-${edge}`).join('');
      const style = id ? ` style="--tile-color:${colorFor(id)}"` : '';
      markup += `<button type="button" class="tiling-cell${id ? ` is-filled${edges}` : ''}${id === selected ? ' is-selected' : ''}" data-tiling-cell="${cellKey}"${id ? ` data-tiling-occupant="${id}"` : ''}${style} tabindex="${boardCursor[0] === x && boardCursor[1] === y ? '0' : '-1'}" aria-label="Row ${y + 1}, column ${x + 1}: ${id ? `tile ${labelFor(id)}${isAnchor ? ', anchor square' : ''}. Select tile ${labelFor(id)}; double tap to return it.` : 'empty floor. Place the selected tile here.'}">${id ? shapeMarkup([[0, 0]], colorFor(id), exposed) : ''}</button>`;
    }
    board.innerHTML = markup;
    get('tray').classList.toggle('has-few-types', level.types.length <= 3);
    get('tray').innerHTML = level.types.map(type => {
      const remaining = type.ids.filter(id => !placed[id]).length;
      const chosen = selected && labelFor(selected) === type.id;
      return `<button class="tiling-piece${chosen ? ' is-selected' : ''}${remaining === 0 ? ' is-placed' : ''}" type="button" data-tiling-piece="${type.id}" aria-pressed="${Boolean(chosen)}" aria-label="Tile ${type.id}, ${type.count} needed, ${remaining} left. ${remaining ? 'Select a copy to place.' : 'All copies placed. Select a copy to move or return.'} ${describeShape(type.cells)}">${shapeMarkup(type.cells, colorFor(type.ids[0]))}<span class="tiling-piece-state">${remaining ? `${remaining} left` : '<span aria-hidden="true">✓</span> All placed'}</span></button>`;
    }).join('');
    get('name').textContent = `Puzzle ${book.number} / ${book.total}${book.currentCompleted ? ' ✓' : ''}`;
    get('name').title = book.currentCompleted ? 'Solved puzzle. Choose a puzzle.' : 'Choose a puzzle';
    get('completed').textContent = `${book.completedCount} / ${book.total} solved`;
    for (const name of ['number', 'number-slider']) {
      get(name).value = String(book.number); get(name).max = String(book.total);
    }
    get('number-slider').setAttribute('aria-valuetext', `Puzzle ${book.number} of ${book.total}`);
    get('progress').textContent = `${game.filled} / ${level.floor.length} squares`;
    const remaining = level.pieces.length - Object.keys(placed).length;
    get('tray-count').textContent = `${remaining} to place`;
    get('remove').disabled = !selected || !placed[selected];
    get('undo').disabled = !game.canUndo;
    get('redo').disabled = !game.canRedo;
    get('hint').disabled = game.solved;
    setActionLabel(get('hint'), hintPreview ? 'Place hint' : 'Hint');
    get('hint').classList.toggle('is-confirming', Boolean(hintPreview));
    get('refresh').disabled = !book.canRefresh;
    get('status').textContent = message || (game.solved
      ? book.allCompleted ? `All ${book.total} ${DIFFICULTIES[book.difficulty].name} puzzles complete! Choose a puzzle number to replay.` : 'Puzzle complete!'
      : selected ? `Tile ${labelFor(selected)} selected.` : '');
    get('status').classList.toggle('puzzle-sr-only', !game.solved && !notice);
    root.classList.toggle('is-solved', game.solved);
    preview();
    if (focusCell) board.querySelector(`button[data-tiling-cell="${focusCell}"]`)?.focus({ preventScroll: true });
    else if (focusPiece) get('tray').querySelector(`[data-tiling-piece="${focusPiece}"]`)?.focus({ preventScroll: true });
    else if (hadFocus && (active.disabled || active.hidden)) {
      const destination = game.solved ? get('refresh').disabled ? get('name') : get('refresh')
        : selected ? get('tray').querySelector(`[data-tiling-piece="${labelFor(selected)}"]`)
        : board.querySelector('button');
      destination?.focus({ preventScroll: true });
    }
    storage.save(book.exportState());
  }

  function place(position = currentPosition()) {
    if (!selected || !position) return false;
    const id = selected, result = game.place(id, position);
    hintPreview = null;
    if (!result.valid) {
      render(reasonText[result.reason] || 'That tile does not fit there. Try another square.', true);
      return false;
    }
    const type = typeFor(id);
    selected = type.ids.find(copy => !game.placements[copy]) || null; anchor = null; lastTap = null;
    render(game.solved ? '' : `Tile ${type.id} placed. ${selected ? 'Another copy is selected.' : 'Choose a tile to continue.'}`);
    return true;
  }

  function remove(id = selected) {
    if (!id || !game.remove(id)) return;
    selected = id; anchor = null; hintPreview = null; lastTap = null;
    render(`Tile ${labelFor(id)} returned. Its copy is available in the tray again.`);
  }

  function undo() {
    endDrag();
    if (!game.undo()) return;
    selected = null; anchor = null; hintPreview = null; lastTap = null;
    render('Last move undone.');
  }

  function redo() {
    endDrag();
    if (!game.redo()) return;
    selected = null; anchor = null; hintPreview = null; lastTap = null;
    render('Last move restored.');
  }

  function clearSelection() {
    endDrag(); selected = null; anchor = null; hintPreview = null; lastTap = null;
    boardCursor = game.level.floor[0];
  }

  function changeDifficulty() {
    storedState();
    book.changeDifficulty(Number(get('challenge').value) - 1);
    game = createGame(book.level, book.state);
    get('picker').open = false;
    clearSelection(); showChallenge(); render();
  }

  function refresh() {
    if (!book.next()) return;
    game = createGame(book.level);
    get('picker').open = false;
    clearSelection(); render();
  }

  function openPuzzle(event) {
    event.preventDefault();
    if (!book.open(Number(get('number').value))) {
      render(`Choose a puzzle from 1 to ${book.total}.`, true); get('number').focus(); return;
    }
    game = createGame(book.level);
    get('picker').open = false;
    clearSelection(); render(); get('name').focus({ preventScroll: true });
  }

  function restart() {
    book.replay(); game.reset(); clearSelection(); render();
  }

  function hint() {
    if (game.solved) return;
    lastTap = null;
    if (hintPreview && hintPreview.id === selected) { place(hintPreview.position); return; }
    const solution = game.hint();
    if (!solution) {
      anchor = null; hintPreview = null;
      render('These tiles cannot fill the remaining space. Undo or return a tile, then try again.', true);
      return;
    }
    const id = selected && !game.placements[selected] ? selected : game.level.pieces.find(piece => !game.placements[piece.id]).id;
    selected = id;
    const position = solution[id];
    const [dx, dy] = currentShape()[0]; anchor = [position.x + dx, position.y + dy];
    hintPreview = { id, position };
    render(`Place tile ${labelFor(id)} on the outlined squares. Tap the check mark to place it.`);
  }

  get('tray').addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) return;
    const button = event.target.closest('[data-tiling-piece]');
    if (!button) return;
    const type = game.level.types.find(type => type.id === button.dataset.tilingPiece);
    lastTap = null;
    select(type.ids.find(id => !game.placements[id]) || type.ids[0]);
    if (event.detail === 0) get('board').querySelector(`button[data-tiling-cell="${key(...boardCursor)}"]`)?.focus({ preventScroll: true });
    const bounds = get('board').getBoundingClientRect?.();
    if (typeof window !== 'undefined' && window.innerWidth <= 620 && bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
      get('board').scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  });
  get('board').addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) return;
    const cell = event.target.closest('[data-tiling-cell]');
    if (!cell) return;
    const coordinates = cell.dataset.tilingCell.split(',').map(Number), occupant = cell.dataset.tilingOccupant;
    if (cell.tagName === 'BUTTON') boardCursor = coordinates;
    if (occupant) {
      const time = performance.now();
      if (event.detail !== 0 && (event.detail === 2 || (lastTap?.id === occupant && time - lastTap.time < 360))) { remove(occupant); return; }
      lastTap = event.detail === 0 ? null : { id: occupant, time };
      select(occupant); return;
    }
    lastTap = null;
    if (!selected) { render('Pick a tile from the tray first.', true); return; }
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
    if ((event.key === 'Delete' || event.key === 'Backspace') && selected) { event.preventDefault(); remove(); }
    else if (event.key === 'Escape' && selected) { event.preventDefault(); selected = null; anchor = null; hintPreview = null; lastTap = null; render('Selection cleared. Choose a tile to continue.'); }
  });

  // Pointer drag is an extra convenience; every action is also available by tap and keyboard.
  root.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.isPrimary === false) return;
    const tile = event.target.closest('[data-tiling-piece]'), cell = event.target.closest('[data-tiling-occupant]');
    const type = tile && game.level.types.find(type => type.id === tile.dataset.tilingPiece);
    const id = type ? type.ids.find(id => !game.placements[id]) || type.ids[0] : cell?.dataset.tilingOccupant;
    if (!id) return;
    endDrag();
    drag = { id, pointer: event.pointerId, startX: event.clientX, startY: event.clientY, active: false, grabbed: cell ? cell.dataset.tilingCell.split(',').map(Number) : null };
  });
  root.addEventListener('pointermove', event => {
    if (!drag || drag.pointer !== event.pointerId) return;
    if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 8) return;
    if (!drag.active) {
      const pending = drag; lastTap = null;
      if (selected !== pending.id) select(pending.id);
      else { hintPreview = null; anchor = null; render(`Tile ${labelFor(selected)} selected. Drag onto the floor, or off it to return the tile.`); }
      drag = pending; drag.active = true;
      const saved = game.placements[selected];
      drag.wasPlaced = Boolean(saved);
      drag.offset = drag.grabbed && saved ? [drag.grabbed[0] - saved.x, drag.grabbed[1] - saved.y] : currentShape()[0];
      root.setPointerCapture(event.pointerId);
      dragGhost = document.createElement('div'); dragGhost.className = 'tiling-drag-ghost';
      const shape = currentShape();
      dragGhost.innerHTML = shapeMarkup(shape, colorFor(selected));
      drag.cellSize = get('board').querySelector('button')?.getBoundingClientRect?.().width || 30;
      dragGhost.style.width = `${(Math.max(...shape.map(part => part[0])) + 1) * drag.cellSize}px`;
      get('board').querySelectorAll(`[data-tiling-occupant="${selected}"]`).forEach(cell => cell.classList.add('is-drag-origin'));
      document.body.append(dragGhost);
      root.classList.add('is-dragging');
    }
    event.preventDefault();
    dragGhost.style.left = `${event.clientX - drag.offset[0] * drag.cellSize - drag.cellSize / 2}px`;
    dragGhost.style.top = `${event.clientY - drag.offset[1] * drag.cellSize - drag.cellSize / 2}px`;
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-tiling-cell]');
    if (cell && get('board').contains(cell)) {
      const target = cell.dataset.tilingCell.split(',').map(Number), first = currentShape()[0];
      anchor = [target[0] - drag.offset[0] + first[0], target[1] - drag.offset[1] + first[1]];
    } else anchor = null;
    const bounds = get('board').getBoundingClientRect?.();
    drag.outside = !bounds || event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    get('status').textContent = drag.outside && drag.wasPlaced ? 'Release to return this tile to the tray.' : 'Release on the highlighted squares to place the tile.';
    preview();
  });
  root.addEventListener('pointerup', event => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const current = drag;
    endDrag();
    if (!current.active) return;
    suppressClickUntil = performance.now() + 350;
    if (anchor) place();
    else if (current.wasPlaced && current.outside) remove(current.id);
    else { anchor = null; render('Drop onto a floor square to place the tile.'); }
  });
  root.addEventListener('pointercancel', () => endDrag(true));
  root.addEventListener('lostpointercapture', () => endDrag(true));
  function endDrag(cancelled = false) {
    if (!drag) return;
    const previous = drag;
    get('board').querySelectorAll('.is-drag-origin').forEach(cell => cell.classList.remove('is-drag-origin'));
    drag = null; dragGhost?.remove(); dragGhost = null; root.classList.remove('is-dragging');
    if (previous?.active && root.hasPointerCapture?.(previous.pointer)) root.releasePointerCapture(previous.pointer);
    if (cancelled && previous?.active) { anchor = null; preview(); }
  }

  get('remove').addEventListener('click', () => remove());
  get('undo').addEventListener('click', undo);
  get('redo').addEventListener('click', redo);
  get('reset').addEventListener('click', restart);
  get('hint').addEventListener('click', hint);
  get('refresh').addEventListener('click', refresh);
  get('jump').addEventListener('submit', openPuzzle);
  get('number-slider').addEventListener('input', () => { get('number').value = get('number-slider').value; });
  get('number').addEventListener('input', () => {
    const value = Number(get('number').value);
    if (Number.isInteger(value) && value >= 1 && value <= book.total) get('number-slider').value = String(value);
  });
  const help = root.querySelector('.puzzle-help');
  get('picker').addEventListener('toggle', () => { if (get('picker').open && help) help.open = false; });
  help?.addEventListener('toggle', () => { if (help.open) get('picker').open = false; });
  for (const name of ['number', 'number-slider', 'open']) get(name).disabled = false;
  get('challenge').addEventListener('input', showChallenge);
  get('challenge').addEventListener('change', changeDifficulty);
  get('challenge').disabled = false; get('reset').disabled = false;
  get('challenge').value = String(book.difficulty + 1); showChallenge(); render();
  return { get game() { return game; }, get selected() { return selected; }, book };
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-tiling-game]').forEach(root => initializeTilingGame(root));

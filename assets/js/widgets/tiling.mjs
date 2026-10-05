import { placementCells, occupiedCells, checkPlacement, key } from '../lib/tiling.mjs';

import { DIFFICULTIES } from '../lib/tiling-arrangements.mjs';
import { createTilingWorkspace } from '../lib/tiling-workspace.mjs';
import { createPuzzleStorage } from '../lib/puzzle-storage.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';
import { initializeProgressReset } from '../lib/widget-progress.mjs';

import { tilingBoardEdges, tilingContourPath, tilingShapeMarkup as shapeMarkup } from '../lib/tiling-view.mjs';

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

let nextInstance = 0;
export function initializeTilingGame(root, storage = createPuzzleStorage('tiling', root), catalogue) {
  const get = name => root.querySelector(`[data-tiling-${name}]`);
  const saved = storage.read(), play = createTilingWorkspace(saved, catalogue), events = new AbortController();
  const listen = (element, name, callback) => element.addEventListener(name, callback, { signal: events.signal });
  const disposePanels = initializeWidgetPanels(root, root.ownerDocument || document);
  const prefix = `tiling-${++nextInstance}`;
  for (const name of ['challenge', 'number']) {
    get(name).id = `${prefix}-${name}`;
    get(`${name}-name`)?.setAttribute('for', get(name).id);
    get(`${name}-label`)?.setAttribute('for', get(name).id);
  }
  let book = play.book, game = play.game, selected = null;
  let trayLayout = saved?.trayLayout === 'grid' ? 'grid' : 'scroll';
  const snapshot = () => ({ ...play.exportState(), trayLayout });
  storage.setSnapshotProvider(snapshot);
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
    render(message || 'Choose a spot for this tile. The dot marks its anchor.');
  };

  function showChallenge() {
    const value = Number(get('challenge').value);
    const name = DIFFICULTIES[value - 1].name;
    get('challenge-label').textContent = name;
    get('challenge').setAttribute('aria-valuetext', name);
    const level = DIFFICULTIES[value - 1];
    get('level-detail').textContent = `${level.width} × ${level.height} floor · ${level.sizes.length} tiles`;
  }

  function preview() {
    const board = get('board');
    board.querySelectorAll('.is-preview, .is-preview-invalid, .is-preview-anchor').forEach(cell => {
      cell.classList.remove('is-preview', 'is-preview-invalid', 'is-preview-anchor');
      cell.style.removeProperty('--preview-color');
    });
    const position = currentPosition();
    if (!position) { drawOutline(); return; }
    const result = checkPlacement(game.level, game.placements, selected, position);
    for (const [x, y] of result.cells) {
      const cell = board.querySelector(`[data-tiling-cell="${key(x, y)}"]`);
      if (!cell) continue;
      cell.classList.add(result.valid ? 'is-preview' : 'is-preview-invalid');
      cell.style.setProperty('--preview-color', colorFor(selected));
    }
    drawOutline(result);
    if (result.valid) board.querySelector(`[data-tiling-cell="${key(...anchor)}"]`)?.classList.add('is-preview-anchor');
  }

  function drawOutline(preview = null) {
    const edges = tilingBoardEdges(game.level, game.placements, selected);
    const path = edge => `M${edge.from.map(v => v * 24).join(',')}L${edge.to.map(v => v * 24).join(',')}`;
    const faces = Object.entries(game.placements).map(([id, position]) =>
      `<path class="tiling-board-face${id === selected ? ' is-selected' : ''}" d="${tilingContourPath(placementCells(pieceFor(id), position))}" fill="${colorFor(id)}" fill-rule="evenodd"/>`).join('');
    get('outline').innerHTML = faces + ['grid', 'cutout', 'tile', 'selected'].map(kind => {
      const d = edges.filter(edge => edge.kind === kind).map(path).join('');
      return d ? `<path class="tiling-boundary tiling-boundary-${kind}" d="${d}" vector-effect="non-scaling-stroke"/>` : '';
    }).join('') + (preview ? `<path class="tiling-footprint${preview.valid ? '' : ' is-invalid'}" d="${tilingContourPath(preview.cells)}" style="--preview-color:${colorFor(selected)}" fill-rule="evenodd" vector-effect="non-scaling-stroke"/>${preview.valid ? `<circle class="tiling-floor-anchor" cx="${anchor[0] * 24 + 12}" cy="${anchor[1] * 24 + 12}" r="2.5" vector-effect="non-scaling-stroke"/>` : ''}` : '');
  }

  function render(message = '') {
    const resetScope = root.querySelector('[data-widget-progress-scope]');
    if (resetScope) resetScope.textContent = DIFFICULTIES[book.difficulty].name;
    book.record(game.exportState(), game.solved);
    const active = document.activeElement;
    const hadFocus = root.contains(active);
    const focusCell = hadFocus ? active.dataset?.tilingCell : null;
    const focusPiece = root.contains(active) ? active.dataset?.tilingPiece : null;
    const trayScroll = get('tray').scrollLeft || 0;
    root.dataset.trayLayout = trayLayout; get('scroll-tiles').checked = trayLayout === 'scroll';
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
      markup += `<button type="button" class="tiling-cell${id ? ' is-filled' : ''}${id === selected ? ' is-selected' : ''}" data-tiling-cell="${cellKey}"${id ? ` data-tiling-occupant="${id}"` : ''}${style} tabindex="${boardCursor[0] === x && boardCursor[1] === y ? '0' : '-1'}" aria-label="Row ${y + 1}, column ${x + 1}: ${id ? `tile ${labelFor(id)}${isAnchor ? ', anchor square' : ''}. Select tile ${labelFor(id)}; double tap to return it.` : 'empty floor. Place the selected tile here.'}"></button>`;
    }
    board.innerHTML = markup + `<svg class="tiling-board-outline" data-tiling-outline viewBox="0 0 ${level.width * 24} ${level.height * 24}" preserveAspectRatio="none" aria-hidden="true"></svg>`;
    get('tray').style.setProperty('--tiling-tray-columns', Math.min(4, level.types.length));
    get('tray').classList.toggle('has-few-types', level.types.length <= 3);
    get('tray').innerHTML = level.types.map(type => {
      const remaining = type.ids.filter(id => !placed[id]).length;
      const chosen = selected && labelFor(selected) === type.id;
      return `<button class="tiling-piece${chosen ? ' is-selected' : ''}${remaining === 0 ? ' is-placed' : ''}" type="button" data-tiling-piece="${type.id}" style="--tile-color:${colorFor(type.ids[0])}" aria-pressed="${Boolean(chosen)}" aria-label="Tile ${type.id}, ${type.count} needed, ${remaining} left. ${remaining ? 'Select a copy to place.' : 'All copies placed. Select a copy to move or return.'} ${describeShape(type.cells)}"><span class="tiling-piece-art">${shapeMarkup(type.cells, colorFor(type.ids[0]), true)}</span><span class="tiling-piece-state">${remaining ? `${remaining} left` : '<span aria-hidden="true">✓</span> Placed'}</span></button>`;
    }).join('');
    get('tray').scrollLeft = trayScroll;
    get('name').textContent = `Puzzle ${book.number} / ${book.total}${book.currentCompleted ? ' ✓' : ''}`;
    get('name').title = book.currentCompleted ? 'Solved puzzle. Choose a puzzle.' : 'Choose a puzzle';
    get('name').setAttribute('aria-label', `Puzzle ${book.number} of ${book.total}${book.currentCompleted ? ', solved' : ''}. Choose a puzzle.`);
    get('completed').textContent = `${book.completedCount} / ${book.total} ${DIFFICULTIES[book.difficulty].name} puzzles solved`;
    for (const name of ['number', 'number-slider']) {
      get(name).value = String(book.number); get(name).max = String(book.total);
    }
    previewNumber(book.number);
    get('number-label').textContent = `${book.number} / ${book.total}`;
    get('progress').textContent = `${game.filled} / ${level.floor.length} filled`;
    get('moves').textContent = `${game.moves} ${game.moves === 1 ? 'move' : 'moves'}`;
    const remaining = level.pieces.length - Object.keys(placed).length;
    get('tray-count').textContent = `${remaining} left`;
    get('remove').disabled = !selected || !placed[selected];
    get('remove').hidden = get('remove').disabled;
    get('undo').disabled = !play.canUndo;
    get('redo').disabled = !play.canRedo;
    get('reset').disabled = !game.moves;
    get('hint').disabled = game.solved;
    setActionLabel(get('hint'), hintPreview ? 'Hide hint' : 'Hint');
    get('hint-label').textContent = hintPreview ? 'Hide hint' : 'Hint';
    get('hint').setAttribute('aria-pressed', String(Boolean(hintPreview)));
    get('use-hint').hidden = !hintPreview; get('use-hint').disabled = !hintPreview;
    get('refresh').disabled = !book.canRefresh;
    get('next').hidden = !game.solved || !book.canRefresh; get('next').disabled = !book.canRefresh;
    get('status').textContent = game.solved
      ? book.allCompleted ? `All ${book.total} ${DIFFICULTIES[book.difficulty].name} puzzles complete!` : 'A perfect fit! Every floor square is filled.'
      : message || (selected ? 'Choose a spot for this tile.' : 'Choose a tile. Drag it, or tap its place on the floor.');
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
    storage.save(snapshot());
  }

  function place(position = currentPosition()) {
    if (!selected || !position) return false;
    const id = selected, result = play.place(id, position); game = play.game;
    hintPreview = null;
    if (!result.valid) {
      render(reasonText[result.reason] || 'That tile does not fit there. Try another square.', true);
      return false;
    }
    const type = typeFor(id);
    selected = type.ids.find(copy => !game.placements[copy]) || null; anchor = null; lastTap = null;
    render(game.solved ? '' : selected ? 'Tile placed. Another copy is selected.' : 'Tile placed. Choose another tile.');
    return true;
  }

  function remove(id = selected) {
    if (!id || !play.remove(id)) return;
    game = play.game;
    selected = id; anchor = null; hintPreview = null; lastTap = null;
    render(`Tile ${labelFor(id)} returned. Its copy is available in the tray again.`);
  }

  function undo() {
    endDrag();
    if (!play.undo()) return;
    book = play.book; game = play.game;
    selected = null; anchor = null; hintPreview = null; lastTap = null;
    boardCursor = game.level.floor[0]; get('challenge').value = String(book.difficulty + 1); showChallenge();
    render('Last move undone.');
  }

  function redo() {
    endDrag();
    if (!play.redo()) return;
    book = play.book; game = play.game;
    selected = null; anchor = null; hintPreview = null; lastTap = null;
    boardCursor = game.level.floor[0]; get('challenge').value = String(book.difficulty + 1); showChallenge();
    render('Last move restored.');
  }

  function clearSelection() {
    endDrag(); selected = null; anchor = null; hintPreview = null; lastTap = null;
    boardCursor = game.level.floor[0];
  }

  function changeDifficulty() {
    endDrag();
    if (!play.changeDifficulty(Number(get('challenge').value) - 1)) return;
    book = play.book; game = play.game;
    clearSelection(); showChallenge(); render();
  }

  function refresh() {
    endDrag();
    if (!play.shuffle()) return;
    book = play.book; game = play.game;
    clearSelection(); render();
  }

  function openPuzzle(event) {
    event.preventDefault();
    endDrag();
    if (Number(get('number').value) === book.number) { render('This puzzle is already open.'); return; }
    if (!play.open(Number(get('number').value))) {
      render(`Choose a puzzle from 1 to ${book.total}.`, true); get('number').focus(); return;
    }
    book = play.book; game = play.game;
    clearSelection(); render(); get('name').focus({ preventScroll: true });
  }

  function restart() {
    endDrag(); if (!play.reset()) return;
    game = play.game; clearSelection(); render('Back to the start.');
  }

  function hint() {
    if (game.solved) return;
    lastTap = null;
    if (hintPreview) { hintPreview = null; anchor = null; render('Hint hidden. Choose a spot for this tile.'); return; }
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
    render('Try the outlined placement. Tap its dot, or use Place hint.');
  }

  listen(get('tray'), 'click', event => {
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
  listen(get('tray'), 'keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const tile = event.target.closest('[data-tiling-piece]');
    if (!tile) return;
    const buttons = [...get('tray').querySelectorAll('button')], index = buttons.indexOf(tile);
    const next = buttons[index + (event.key === 'ArrowRight' ? 1 : -1)];
    if (next) { event.preventDefault(); next.focus(); next.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); }
  });
  listen(get('scroll-tiles'), 'change', () => {
    endDrag(true); trayLayout = get('scroll-tiles').checked ? 'scroll' : 'grid'; render();
  });
  get('scroll-tiles').disabled = false;
  listen(get('board'), 'click', event => {
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
  listen(get('board'), 'pointerover', event => {
    if (!selected || drag?.active || hintPreview) return;
    const cell = event.target.closest('[data-tiling-cell]');
    if (cell) { anchor = cell.dataset.tilingCell.split(',').map(Number); preview(); }
  });
  listen(get('board'), 'pointerleave', () => {
    if (!drag?.active && !hintPreview) { anchor = null; preview(); }
  });
  listen(get('board'), 'focusin', event => {
    const cell = event.target.closest('button[data-tiling-cell]');
    if (!cell) return;
    boardCursor = cell.dataset.tilingCell.split(',').map(Number);
    get('board').querySelectorAll('button').forEach(button => { button.tabIndex = button === cell ? 0 : -1; });
    if (selected && !hintPreview) { anchor = boardCursor; preview(); }
  });
  listen(root, 'keydown', event => {
    if (event.target.tagName === 'INPUT' || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key === 'Escape' && root.querySelector('[data-widget-panel-trigger][aria-expanded="true"]')) return;
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
  listen(root, 'pointerdown', event => {
    if (event.button !== 0 || event.isPrimary === false) return;
    const tile = event.target.closest('[data-tiling-piece]'), cell = event.target.closest('[data-tiling-occupant]');
    const type = tile && game.level.types.find(type => type.id === tile.dataset.tilingPiece);
    const id = type ? type.ids.find(id => !game.placements[id]) || type.ids[0] : cell?.dataset.tilingOccupant;
    if (!id) return;
    endDrag();
    drag = { id, fromTray: Boolean(tile), pointer: event.pointerId, startX: event.clientX, startY: event.clientY, active: false, grabbed: cell ? cell.dataset.tilingCell.split(',').map(Number) : null };
  });
  listen(root, 'pointermove', event => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    if (!drag.active && Math.hypot(dx, dy) < 8) return;
    if (!drag.active && drag.fromTray && trayLayout === 'scroll' && event.pointerType === 'touch' && Math.abs(dx) > Math.abs(dy)) {
      drag = null; return;
    }
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
      dragGhost.innerHTML = shapeMarkup(shape, colorFor(selected), true);
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
  listen(root, 'pointerup', event => {
    if (!drag || drag.pointer !== event.pointerId) return;
    const current = drag;
    endDrag();
    if (!current.active) return;
    suppressClickUntil = performance.now() + 350;
    if (anchor) place();
    else if (current.wasPlaced && current.outside) remove(current.id);
    else { anchor = null; render('Drop onto a floor square to place the tile.'); }
  });
  listen(root, 'pointercancel', () => endDrag(true));
  listen(root, 'lostpointercapture', () => endDrag(true));
  function endDrag(cancelled = false) {
    if (!drag) return;
    const previous = drag;
    get('board').querySelectorAll('.is-drag-origin').forEach(cell => cell.classList.remove('is-drag-origin'));
    drag = null; dragGhost?.remove(); dragGhost = null; root.classList.remove('is-dragging');
    if (previous?.active && root.hasPointerCapture?.(previous.pointer)) root.releasePointerCapture(previous.pointer);
    if (cancelled && previous?.active) { anchor = null; preview(); }
  }

  function previewNumber(value) {
    get('number-label').textContent = `${value} / ${book.total}`;
    get('number-slider').setAttribute('aria-valuetext', `Puzzle ${value} of ${book.total}`);
  }
  const disposeProgress = initializeProgressReset(root, () => {
    endDrag(true); play.resetProgress(); book = play.book; game = play.game;
    clearSelection(); get('challenge').value = String(book.difficulty + 1); showChallenge(); render(`${DIFFICULTIES[book.difficulty].name} progress reset. Start with puzzle 1.`);
  });
  listen(get('use-hint'), 'click', () => { if (hintPreview) place(hintPreview.position); });
  listen(get('next'), 'click', refresh);
  listen(get('remove'), 'click', () => { endDrag(); remove(); });
  listen(get('undo'), 'click', undo);
  listen(get('redo'), 'click', redo);
  listen(get('reset'), 'click', restart);
  listen(get('hint'), 'click', hint);
  listen(get('refresh'), 'click', refresh);
  listen(get('jump'), 'submit', openPuzzle);
  listen(get('number-slider'), 'input', () => { get('number').value = get('number-slider').value; previewNumber(get('number').value); });
  listen(get('number'), 'input', () => {
    const value = Number(get('number').value);
    if (Number.isInteger(value) && value >= 1 && value <= book.total) { get('number-slider').value = String(value); previewNumber(value); }
  });
  for (const name of ['number', 'number-slider', 'open']) get(name).disabled = false;
  listen(get('challenge'), 'input', showChallenge);
  listen(get('challenge'), 'change', changeDifficulty);
  get('challenge').disabled = false;
  get('challenge').value = String(book.difficulty + 1); showChallenge(); render();
  return { get game() { return game; }, get selected() { return selected; }, get book() { return book; },
    destroy() { endDrag(true); disposeProgress(); disposePanels(); events.abort(); },
  };
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-tiling-game]').forEach(root => initializeTilingGame(root));

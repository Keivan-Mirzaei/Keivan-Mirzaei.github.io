import { bindPanelHistory } from '../lib/panel-history.mjs';
import { RED, BLUE, PROOF_EXAMPLE, hexGeometry, winningPath, winner, createSearch, coastline } from '../lib/hex-math.mjs';
import { searchBudget } from '../lib/hex-search-settings.mjs';
import { createPuzzleStorage } from '../lib/puzzle-storage.mjs';
import { restoreHex } from '../lib/hex-storage.mjs';
import { setActionLabel } from '../lib/puzzle-controls.mjs';
import { hexPoint as point, hexLayout as layout, hexCorner, hexGoal } from '../lib/hex-view.mjs';

const name = color => color === RED ? 'Red' : 'Blue';
const gameGoal = color => `the two ${color === RED ? 'red' : 'blue'} sides`;

function drawBoard(holder, cells, size, { playable = false, editing = false, path = [], last = -1, coast = null, step = 0, restoreFocus = true } = {}) {
  const focused = holder.contains(document.activeElement) ? document.activeElement.dataset.hexCell : undefined;
  const pair = p => point(p).map(v => v.toFixed(4)).join(',');
  const geometry = coast?.geometry || hexGeometry(size), box = layout(geometry, Boolean(coast));
  holder.style.aspectRatio = `${box.width} / ${box.height}`;
  holder.style.setProperty('--hex-size', size);
  holder.style.setProperty('--hex-cell-shape', 'polygon(50% 2%, 98% 26%, 98% 74%, 50% 98%, 2% 74%, 2% 26%)');
  const borders = geometry.edges.filter(e => e.faces[1] < 0 && e.faces[0] >= 0).map(e =>
    `<path class="hex-border hex-${e.faces[1] === -1 || e.faces[1] === -2 ? 'red' : 'blue'}" d="M${pair(geometry.points.get(e.from))}L${pair(geometry.points.get(e.to))}"/>`).join('');
  const backdrop = geometry.cells.map(cell => `<polygon class="hex-outline" points="${cell.vertices.map(pair).join(' ')}"/>`).join('');
  const lastCell = playable && cells[last] ? geometry.cells[last] : null;
  const lastOutline = lastCell ? `<polygon class="hex-last-outline" points="${lastCell.vertices.map(([x, y]) => pair([lastCell.center[0] + (x - lastCell.center[0]) * .94, lastCell.center[1] + (y - lastCell.center[1]) * .94])).join(' ')}"/>` : '';
  const trace = coast ? `<g class="hex-coast-stubs">${geometry.ports.map(p => `<path d="M${pair(geometry.points.get(p.vertex))}L${pair(geometry.points.get(p.corner))}"/>`).join('')}</g>
    <polyline class="hex-coast" points="${coast.vertices.slice(0, step + 1).map(v => pair(geometry.points.get(v))).join(' ')}"/>
    <circle class="hex-walker" cx="${point(geometry.points.get(coast.vertices[step]))[0]}" cy="${point(geometry.points.get(coast.vertices[step]))[1]}" r=".14"/>` : '';
  const labels = coast ? geometry.ports.map(p => {
    const [x, y] = point(geometry.points.get(p.vertex)), corner = hexCorner(p.name);
    return `<span aria-hidden="true" class="hex-port-label hex-port-${corner}" style="left:${(x - box.minX) / box.width * 100}%;top:${(y - box.minY) / box.height * 100}%">${p.name === 'NW' ? 'Start' : corner[0].toUpperCase() + corner.slice(1)}</span>`;
  }).join('') : '';
  const svg = `<svg class="hex-diagram" viewBox="${box.minX} ${box.minY} ${box.width} ${box.height}" aria-hidden="true">${backdrop}${borders}</svg>`;
  const buttons = geometry.cells.map((cell, i) => {
    const [x, y] = point(cell.center), color = cells[i], tag = playable || editing ? 'button' : 'span';
    const halfWidth = Math.sqrt(3) / 2, halfHeight = 1;
    const row = Math.floor(i / size) + 1, col = i % size + 1;
    const label = `Row ${row}, column ${col}: ${color ? name(color) : 'empty'}.${editing ? ` Change to ${name(3 - color)}.` : color ? '' : ' Place your stone here.'}`;
    return `<${tag} class="hex-cell${color ? ` hex-${color === RED ? 'red' : 'blue'}` : ''}${i === last ? ' is-last' : ''}${path.includes(i) ? ' is-winner' : ''}" ${tag === 'button' ? `type="button" data-hex-cell="${i}" aria-label="${label}"${!editing && (!playable || color) ? ' disabled' : ''}` : 'aria-hidden="true"'} style="left:${(x - halfWidth - box.minX) / box.width * 100}%;top:${(y - halfHeight - box.minY) / box.height * 100}%;width:${2 * halfWidth / box.width * 100}%;height:${2 * halfHeight / box.height * 100}%"><span aria-hidden="true"></span></${tag}>`;
  }).join('');
  const overlay = `<svg class="hex-overlay" viewBox="${box.minX} ${box.minY} ${box.width} ${box.height}" aria-hidden="true">${trace}${lastOutline}</svg>`;
  holder.innerHTML = svg + buttons + overlay + labels;
  holder.setAttribute('role', 'group');
  holder.setAttribute('aria-label', `${size} by ${size} upright diamond Hex board. Red joins upper-right and lower-left; Blue joins upper-left and lower-right.${coast ? ` Coastline: ${step} of ${coast.tour.length} edges traced.` : ''}`);
  if (restoreFocus && focused !== undefined) holder.querySelector(`[data-hex-cell="${focused}"]`)?.focus({ preventScroll: true });
}

export function initializeHexGame(game, storage = createPuzzleStorage('hex', game)) {
  const get = key => game.querySelector(`[data-hex-${key}]`);
  const orderControls = [...game.querySelectorAll('[data-hex-order]')];
  let size = 5, human = RED, local = false, cells = Array(25).fill(0), toMove = RED;
  let history = [], future = [], last = -1, busy = false, worker = null, generation = 0, boardFocus = -1, boardCursor = 0;
  const snapshot = () => ({ cells: cells.slice(), last, toMove });
  const storedState = () => ({ size, human, local, ...snapshot(), history, future });
  storage.setSnapshotProvider(storedState);
  function cancel() { generation++; worker?.terminate(); worker = null; busy = false; }
  function showSize() {
    const label = get('size-label'), value = Number(get('size').value);
    if (label) label.textContent = `${value} × ${value}`;
    if (get('size').type === 'range') get('size').setAttribute('aria-valuetext', `${value} by ${value}`);
  }
  function render(message = '') {
    const win = winner(cells, size), count = cells.filter(Boolean).length;
    const board = get('board'), active = document.activeElement, focused = board.contains(active);
    if (focused && active.dataset.hexCell !== undefined) boardFocus = Number(active.dataset.hexCell);
    const returnToBoard = focused || (boardFocus >= 0 && (!active || active === document.body));
    if (!returnToBoard) boardFocus = -1;
    // Keep cells as native buttons even while locked, for a consistent board.
    drawBoard(board, cells, size, { playable: true, path: win ? winningPath(cells, size, win) : [], last, restoreFocus: false });
    const buttons = [...board.querySelectorAll('button')];
    buttons.forEach(button => {
      button.disabled = busy || Boolean(win) || (!local && toMove !== human) || Boolean(cells[Number(button.dataset.hexCell)]);
    });
    if (boardCursor < 0 || !buttons[boardCursor] || buttons[boardCursor].disabled) boardCursor = buttons.findIndex(button => !button.disabled);
    buttons.forEach((button, index) => { button.tabIndex = index === boardCursor ? 0 : -1; });
    board.tabIndex = busy ? 0 : -1;
    get('count').textContent = `${count} ${count === 1 ? 'stone' : 'stones'}`;
    if (get('board-meta')) get('board-meta').textContent = `${size} × ${size}`;
    if (get('goal')) get('goal').textContent = local ? 'Connect the two sides of your colour' : `Connect your two ${name(human).toLowerCase()} sides`;
    for (const role of ['human', 'opponent']) {
      const color = role === 'human' ? human : 3 - human;
      game.querySelector(`[data-hex-player="${role}"]`)?.setAttribute('data-active', String(!win && toMove === color));
      game.querySelector(`[data-hex-player="${role}"] [data-hex-player-color]`)?.setAttribute('data-hex-player-color', String(color));
      const playerName = game.querySelector(`[data-hex-player-name="${role}"]`);
      if (playerName) playerName.textContent = local ? role === 'human' ? 'Player 1' : 'Player 2' : role === 'human' ? 'You' : 'Computer';
      const playerLabel = game.querySelector(`[data-hex-player-label="${role}"]`);
      if (playerLabel) playerLabel.textContent = name(color);
    }
    get('instruction').textContent = local
      ? 'Take turns choosing an empty cell. Connect the two sides of your colour.'
      : `You play ${human === RED ? 'first' : 'second'} as ${name(human)}: connect ${gameGoal(human)}. Choose an empty cell; stones stay put.`;
    get('undo').disabled = !history.length;
    if (get('redo')) get('redo').disabled = !future.length;
    setActionLabel(get('undo'), local ? 'Undo move' : 'Undo your turn');
    setActionLabel(get('redo'), local ? 'Redo move' : 'Redo your turn');
    get('status').textContent = message || (win
      ? `${local ? `${name(win)} wins!` : win === human ? 'You win!' : 'The computer wins.'}`
      : busy ? `${name(3 - human)} is thinking…`
      : local ? `${name(toMove)}’s turn.`
      : `Your turn · ${name(human)}.`);
    board.setAttribute('aria-busy', String(busy));
    storage.save(storedState());
    if (returnToBoard && busy) board.focus({ preventScroll: true });
    if (returnToBoard && !busy) {
      // Resume keyboard play after a replaced or temporarily locked cell.
      const next = buttons.find(button => !button.disabled && Number(button.dataset.hexCell) >= boardFocus)
        || buttons.find(button => !button.disabled);
      (next || get('undo')).focus({ preventScroll: true });
      next?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      boardFocus = -1;
    }
  }
  function finish(move, token) {
    if (token !== generation) return;
    worker?.terminate(); worker = null; busy = false;
    if (!Number.isInteger(move) || move < 0 || move >= cells.length || cells[move]) { render('The computer could not choose a move. Start a new game.'); return; }
    cells[move] = 3 - human; last = move; toMove = human; render();
  }
  async function fallback(token) {
    if (token !== generation) return;
    // Paint the thinking state and let a reset cancel work before initialization.
    await new Promise(resolve => setTimeout(resolve, 0));
    if (token !== generation) return;
    const budget = searchBudget(size), deadline = performance.now() + budget.timeMs;
    const search = createSearch(cells, size, 3 - human);
    while (!search.solved && search.visits() < budget.maxIterations && performance.now() < deadline) {
      if (token !== generation) return;
      const sliceDeadline = Math.min(deadline, performance.now() + budget.mainThreadSliceMs);
      do { search.run(1); }
      while (!search.solved && search.visits() < budget.maxIterations && performance.now() < sliceDeadline);
      if (!search.solved && search.visits() < budget.maxIterations && performance.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    if (token !== generation) return;
    finish(search.best(), token);
  }
  function computerTurn() {
    if (local || toMove === human || winner(cells, size)) { render(); return; }
    busy = true; render();
    const token = generation;
    try {
      worker = new Worker(new URL('../lib/hex-worker.mjs', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }) => finish(data.move, token);
      worker.onerror = event => { event.preventDefault(); if (token !== generation) return; worker?.terminate(); worker = null; fallback(token); };
      worker.postMessage({ cells, size, color: 3 - human });
    } catch { worker?.terminate(); worker = null; fallback(token); }
  }
  function newGame() {
    cancel(); size = Number(get('size').value);
    const order = orderControls.find(control => control.type !== 'radio' || control.checked)?.value || String(RED);
    local = order === 'local'; human = local ? RED : Number(order);
    showSize();
    cells = Array(size * size).fill(0); history = []; future = []; last = -1; toMove = RED; computerTurn();
  }
  function play(move) {
    if (busy || (!local && toMove !== human) || winner(cells, size)) return;
    if (!Number.isInteger(move) || move < 0 || move >= cells.length) return;
    if (cells[move]) { render('That cell is occupied. Choose an empty cell.'); return; }
    history.push(snapshot()); future = [];
    cells[move] = toMove; last = move; toMove = 3 - toMove; computerTurn();
  }
  get('board').addEventListener('click', event => {
    const button = event.target.closest('[data-hex-cell]');
    if (button) play(Number(button.dataset.hexCell));
  });
  get('board').addEventListener('focusin', event => {
    const button = event.target.closest('[data-hex-cell]');
    if (!button) return;
    boardCursor = Number(button.dataset.hexCell);
    get('board').querySelectorAll('button').forEach(cell => { cell.tabIndex = cell === button ? 0 : -1; });
  });
  get('board').addEventListener('keydown', event => {
    const button = event.target.closest('[data-hex-cell]');
    const delta = { ArrowLeft: [1, -1], ArrowRight: [-1, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[event.key];
    if (!button || !delta || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    let row = Math.floor(Number(button.dataset.hexCell) / size), column = Number(button.dataset.hexCell) % size;
    while (true) {
      row += delta[0]; column += delta[1];
      if (row < 0 || row >= size || column < 0 || column >= size) break;
      const next = get('board').querySelector(`[data-hex-cell="${row * size + column}"]`);
      if (!next.disabled) { next.focus({ preventScroll: true }); next.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); break; }
    }
  });
  get('new').addEventListener('click', newGame);
  function closeSettings() {
    const settings = get('settings');
    if (!settings) return;
    settings.open = false;
    settings.querySelector('summary')?.focus();
  }
  get('settings-close')?.addEventListener('click', closeSettings);
  get('settings')?.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeSettings(); }
  });
  get('size').addEventListener('input', showSize);
  get('size').addEventListener('change', newGame);
  orderControls.forEach(control => control.addEventListener('change', newGame));
  function undo() {
    if (!history.length) return;
    const fromUndo = document.activeElement === get('undo');
    future.push(snapshot()); cancel();
    const previous = history.pop(); cells = previous.cells; last = previous.last; toMove = previous.toMove;
    render();
    if (fromUndo && get('undo').disabled) [...get('board').querySelectorAll('button')].find(button => !button.disabled)?.focus({ preventScroll: true });
  }
  function redo() {
    if (!future.length) return;
    const fromRedo = document.activeElement === get('redo');
    history.push(snapshot()); cancel();
    const next = future.pop(); cells = next.cells; last = next.last; toMove = next.toMove;
    computerTurn();
    if (fromRedo && get('redo').disabled) (busy ? get('board') : [...get('board').querySelectorAll('button')].find(button => !button.disabled) || get('undo')).focus({ preventScroll: true });
  }
  get('undo').addEventListener('click', undo);
  get('redo')?.addEventListener('click', redo);
  game.querySelectorAll('select, input, [data-hex-new]').forEach(control => { control.disabled = false; });
  const saved = restoreHex(storage.read());
  if (saved) {
    ({ size, human, local, cells, last, toMove, history, future } = saved);
    get('size').value = String(size);
    const order = local ? 'local' : String(human);
    orderControls.forEach(control => {
      if (control.type === 'radio') control.checked = control.value === order;
      else control.value = order;
    });
    showSize(); computerTurn();
  } else newGame();
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-hex-game]').forEach(game => initializeHexGame(game));

if (typeof document !== 'undefined') document.querySelectorAll('[data-hex-proof]').forEach(widget => {
  const get = key => widget.querySelector(`[data-hex-proof-${key}]`);
  let cells = PROOF_EXAMPLE.slice(), coast = coastline(cells, 5), step = 0;
  function render() {
    const done = step === coast.tour.length;
    drawBoard(get('board'), cells, 5, { editing: true, coast, step, path: done ? coast.path : [] });
    get('count').textContent = `${step} / ${coast.tour.length} edges`;
    get('step').disabled = done; get('finish').disabled = done; get('reset').disabled = step === 0;
    get('status').textContent = done
      ? `The coast ends at the ${hexCorner(coast.end)} corner. ${name(coast.winner)} cells alongside it connect ${hexGoal(coast.winner)}. Their coloured backgrounds highlight the winning chain.`
      : step === 0 ? 'Start at the top corner, with the red upper-right shore on one side and the blue upper-left shore on the other.'
      : 'Keep walking between Red and Blue. At this vertex, exactly one onward edge separates the colours.';
  }
  const history = bindPanelHistory(widget, {
    read: () => ({ cells, step }),
    restore: state => { ({ cells, step } = state); coast = coastline(cells, 5); render(); },
    reset: () => { cells = PROOF_EXAMPLE.slice(); coast = coastline(cells, 5); step = 0; render(); }
  });
  get('board').addEventListener('click', event => {
    const button = event.target.closest('[data-hex-cell]');
    if (!button) return;
    history.remember();
    const i = Number(button.dataset.hexCell); cells[i] = 3 - cells[i]; coast = coastline(cells, 5); step = 0; render();
  });
  get('step').addEventListener('click', () => { history.remember(); step = Math.min(step + 1, coast.tour.length); render(); });
  get('finish').addEventListener('click', () => { history.remember(); step = coast.tour.length; render(); });
  get('reset').addEventListener('click', () => { history.remember(); step = 0; render(); });
  get('new').addEventListener('click', () => { history.remember(); cells = cells.map(() => Math.random() < .5 ? RED : BLUE); coast = coastline(cells, 5); step = 0; render(); });
  widget.querySelectorAll('button').forEach(button => { button.disabled = button.hasAttribute('data-panel-undo'); });
  render();
});

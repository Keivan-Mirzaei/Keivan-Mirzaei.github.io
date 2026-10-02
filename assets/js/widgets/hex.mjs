import { RED, BLUE, PROOF_EXAMPLE, hexGeometry, winningPath, winner, chooseMove, createSearch, coastline } from '../lib/hex-math.mjs';

const name = color => color === RED ? 'Red' : 'Blue';
const goal = color => color === RED ? 'top to bottom' : 'left to right';
const point = ([x, y]) => [x * Math.sqrt(3) / 2, y / 2];
const pair = p => point(p).map(v => v.toFixed(4)).join(',');

function layout(geometry) {
  const all = [...geometry.points.values()].map(point);
  const minX = Math.min(...all.map(p => p[0])) - 1.15, minY = Math.min(...all.map(p => p[1])) - .95;
  const width = Math.max(...all.map(p => p[0])) - minX + 1.15;
  const height = Math.max(...all.map(p => p[1])) - minY + .95;
  return { minX, minY, width, height };
}

function drawBoard(holder, cells, size, { playable = false, editing = false, path = [], last = -1, coast = null, step = 0 } = {}) {
  const focused = holder.contains(document.activeElement) ? document.activeElement.dataset.hexCell : undefined;
  const geometry = coast?.geometry || hexGeometry(size), box = layout(geometry);
  holder.style.aspectRatio = `${box.width} / ${box.height}`;
  const borders = geometry.edges.filter(e => e.faces[1] < 0 && e.faces[0] >= 0).map(e =>
    `<path class="hex-border hex-${e.faces[1] === -1 || e.faces[1] === -2 ? 'red' : 'blue'}" d="M${pair(geometry.points.get(e.from))}L${pair(geometry.points.get(e.to))}"/>`).join('');
  const backdrop = geometry.cells.map(cell => `<polygon class="hex-outline" points="${cell.vertices.map(pair).join(' ')}"/>`).join('');
  const chain = path.length ? `<polyline class="hex-chain" points="${path.map(i => pair(geometry.cells[i].center)).join(' ')}"/>` : '';
  const trace = coast ? `<g class="hex-coast-stubs">${geometry.ports.map(p => `<path d="M${pair(geometry.points.get(p.vertex))}L${pair(geometry.points.get(p.corner))}"/>`).join('')}</g>
    <polyline class="hex-coast" points="${coast.vertices.slice(0, step + 1).map(v => pair(geometry.points.get(v))).join(' ')}"/>
    <circle class="hex-walker" cx="${point(geometry.points.get(coast.vertices[step]))[0]}" cy="${point(geometry.points.get(coast.vertices[step]))[1]}" r=".14"/>` : '';
  const labels = coast ? geometry.ports.map(p => {
    const [x, y] = point(geometry.points.get(p.vertex));
    return `<span aria-hidden="true" class="hex-port-label${p.name.startsWith('N') ? ' hex-port-north' : ''}" style="left:${(x - box.minX) / box.width * 100}%;top:${(y - box.minY) / box.height * 100}%">${p.name === 'NW' ? 'Start' : p.name}</span>`;
  }).join('') : '';
  const svg = `<svg class="hex-diagram" viewBox="${box.minX} ${box.minY} ${box.width} ${box.height}" aria-hidden="true">${backdrop}${borders}</svg>`;
  const buttons = geometry.cells.map((cell, i) => {
    const [x, y] = point(cell.center), color = cells[i], tag = playable || editing ? 'button' : 'span';
    const row = Math.floor(i / size) + 1, col = i % size + 1;
    const label = `Row ${row}, column ${col}: ${color ? name(color) : 'empty'}.${editing ? ` Change to ${name(3 - color)}.` : color ? '' : ' Place your stone here.'}`;
    return `<${tag} class="hex-cell${color ? ` hex-${color === RED ? 'red' : 'blue'}` : ''}${i === last ? ' is-last' : ''}${path.includes(i) ? ' is-winner' : ''}" ${tag === 'button' ? `type="button" data-hex-cell="${i}" aria-label="${label}"${!editing && (!playable || color) ? ' disabled' : ''}` : 'aria-hidden="true"'} style="left:${(x - Math.sqrt(3) / 2 - box.minX) / box.width * 100}%;top:${(y - 1 - box.minY) / box.height * 100}%;width:${Math.sqrt(3) / box.width * 100}%;height:${2 / box.height * 100}%"><span>${color ? color === RED ? 'R' : 'B' : ''}</span></${tag}>`;
  }).join('');
  const overlay = `<svg class="hex-overlay" viewBox="${box.minX} ${box.minY} ${box.width} ${box.height}" aria-hidden="true">${chain}${trace}</svg>`;
  holder.innerHTML = svg + buttons + overlay + labels;
  holder.setAttribute('role', 'group');
  holder.setAttribute('aria-label', `${size} by ${size} Hex board. Red joins top to bottom; Blue joins left to right.${coast ? ` Coastline: ${step} of ${coast.tour.length} edges traced.` : ''}`);
  if (focused !== undefined) holder.querySelector(`[data-hex-cell="${focused}"]`)?.focus({ preventScroll: true });
}

const details = {
  easy: 'Easy chooses randomly. Try building a connected chain before it does.',
  medium: 'Medium builds short connections and takes or blocks an immediate win.',
  hard: 'Hard also searches thousands of simulated games. It is a challenging practice opponent, but does not play perfectly.'
};

document.querySelectorAll('[data-hex-game]').forEach(game => {
  const get = key => game.querySelector(`[data-hex-${key}]`);
  let size = 5, human = RED, level = 'medium', cells = Array(25).fill(0), toMove = RED;
  let history = [], last = -1, busy = false, worker = null, generation = 0;
  function cancel() { generation++; worker?.terminate(); worker = null; busy = false; }
  function render(message = '') {
    const win = winner(cells, size), count = cells.filter(Boolean).length;
    // Keep cells as native buttons even while locked, for a consistent board.
    drawBoard(get('board'), cells, size, { playable: true, path: win ? winningPath(cells, size, win) : [], last });
    get('board').querySelectorAll('button').forEach(button => {
      button.disabled = busy || Boolean(win) || toMove !== human || Boolean(cells[Number(button.dataset.hexCell)]);
    });
    get('count').textContent = `${count} ${count === 1 ? 'stone' : 'stones'}`;
    get('instruction').textContent = `You are ${name(human)}: connect ${goal(human)}. Red moves first. Choose an empty cell; stones stay put.`;
    get('level-detail').textContent = details[level];
    get('undo').disabled = !history.length;
    for (const key of ['row', 'column']) {
      const control = get(key), selected = Math.min(size, Number(control.value) || 1);
      if (control.options.length !== size) control.innerHTML = Array.from({ length: size }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
      control.value = String(selected);
    }
    get('place').disabled = busy || Boolean(win) || toMove !== human;
    get('status').textContent = message || (win ? `${win === human ? 'You win!' : 'The computer wins.'} ${name(win)} has connected ${goal(win)}. The dashed line marks a winning chain.` : busy ? `${name(3 - human)} is thinking…` : `Your turn · ${name(human)} connects ${goal(human)}.`);
    get('board').setAttribute('aria-busy', String(busy));
  }
  function finish(move, token) {
    if (token !== generation) return;
    worker?.terminate(); worker = null; busy = false;
    if (move < 0 || move >= cells.length || cells[move]) { render('The computer could not choose a move. Start a new game.'); return; }
    cells[move] = 3 - human; last = move; toMove = human; render();
  }
  async function fallback(token) {
    if (level !== 'hard') { finish(chooseMove(cells, size, 3 - human, level), token); return; }
    const search = createSearch(cells, size, 3 - human), deadline = performance.now() + 1100;
    while (!search.solved && search.visits() < (size === 5 ? 6000 : 8000) && performance.now() < deadline) {
      if (token !== generation) return;
      search.run(100); await new Promise(resolve => setTimeout(resolve, 0));
    }
    finish(search.best(), token);
  }
  function computerTurn() {
    if (toMove === human || winner(cells, size)) { render(); return; }
    busy = true; render();
    const token = generation;
    try {
      worker = new Worker(new URL('../lib/hex-worker.mjs', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }) => finish(data.move, token);
      worker.onerror = event => { event.preventDefault(); if (token !== generation) return; worker?.terminate(); worker = null; fallback(token); };
      worker.postMessage({ cells, size, color: 3 - human, level });
    } catch { fallback(token); }
  }
  function newGame() {
    cancel(); size = Number(get('size').value); human = Number(get('side').value);
    cells = Array(size * size).fill(0); history = []; last = -1; toMove = RED; computerTurn();
  }
  function play(move) {
    if (busy || toMove !== human || winner(cells, size)) return;
    if (cells[move]) { render('That cell is occupied. Choose an empty cell.'); return; }
    history.push({ cells: cells.slice(), last });
    cells[move] = human; last = move; toMove = 3 - human; computerTurn();
  }
  get('board').addEventListener('click', event => {
    const button = event.target.closest('[data-hex-cell]');
    if (button) play(Number(button.dataset.hexCell));
  });
  get('place').addEventListener('click', () => play((Number(get('row').value) - 1) * size + Number(get('column').value) - 1));
  get('new').addEventListener('click', newGame);
  get('size').addEventListener('change', newGame);
  get('side').addEventListener('change', newGame);
  get('level').addEventListener('change', () => { level = get('level').value; cancel(); computerTurn(); });
  get('undo').addEventListener('click', () => {
    if (!history.length) return;
    cancel(); const previous = history.pop(); cells = previous.cells; last = previous.last; toMove = human; render('Your last turn has been undone, including the computer’s reply.');
  });
  game.querySelectorAll('select, [data-hex-new]').forEach(control => { control.disabled = false; });
  render();
});

document.querySelectorAll('[data-hex-proof]').forEach(widget => {
  const get = key => widget.querySelector(`[data-hex-proof-${key}]`);
  let cells = PROOF_EXAMPLE.slice(), coast = coastline(cells, 5), step = 0;
  function render() {
    const done = step === coast.tour.length;
    drawBoard(get('board'), cells, 5, { editing: true, coast, step, path: done ? coast.path : [] });
    get('count').textContent = `${step} / ${coast.tour.length} edges`;
    get('step').disabled = done; get('finish').disabled = done; get('reset').disabled = step === 0;
    get('status').textContent = done
      ? `The coast ends at ${coast.end}. ${name(coast.winner)} cells alongside it connect ${goal(coast.winner)}. The dashed line highlights their winning chain.`
      : step === 0 ? 'Start at the top-left corner, with the red top shore on one side and the blue left shore on the other.'
      : 'Keep walking between Red and Blue. At this vertex, exactly one onward edge separates the colours.';
  }
  get('board').addEventListener('click', event => {
    const button = event.target.closest('[data-hex-cell]');
    if (!button) return;
    const i = Number(button.dataset.hexCell); cells[i] = 3 - cells[i]; coast = coastline(cells, 5); step = 0; render();
  });
  get('step').addEventListener('click', () => { step = Math.min(step + 1, coast.tour.length); render(); });
  get('finish').addEventListener('click', () => { step = coast.tour.length; render(); });
  get('reset').addEventListener('click', () => { step = 0; render(); });
  get('new').addEventListener('click', () => { cells = cells.map(() => Math.random() < .5 ? RED : BLUE); coast = coastline(cells, 5); step = 0; render(); });
  widget.querySelectorAll('button').forEach(button => { button.disabled = false; });
  render();
});

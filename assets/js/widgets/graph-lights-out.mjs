import { LIGHTS_OUT_LEVELS } from '../lib/lights-out-book-graphs.mjs';
import { createLightsOutBook, createLightsOutGame } from '../lib/lights-out-book.mjs';
import { createPuzzleStorage } from '../lib/puzzle-storage.mjs';
import { setActionLabel } from '../lib/puzzle-controls.mjs';
import { countBits, pressEffect, vertices } from '../lib/lights-out-math.mjs';

export function initializeGraphLightsOut(root, { storage = createPuzzleStorage('lights-out', root), random = Math.random, catalogue } = {}) {
  const get = name => root.querySelector(`[data-glo-${name}]`);
  const saved = storage.read(), book = createLightsOutBook(saved, catalogue);
  book.resume();
  let puzzle = book.puzzle, graph = puzzle.graph, game = createLightsOutGame(puzzle, book.state);
  let hint = null, preview = -1, buttons = [], edges = [], numbers = saved?.numbers !== false;
  function snapshot() { book.record(game.exportState(), game.solved); return { ...book.exportState(), numbers }; }
  storage.setSnapshotProvider(snapshot);

  function drawGraph() {
    get('board').innerHTML = `<svg class="glo-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${graph.edges.map(([a, b]) => {
      const [ax, ay] = graph.positions[a], [bx, by] = graph.positions[b];
      return `<path data-edge="${a},${b}" d="M${ax * 100},${ay * 100}L${bx * 100},${by * 100}"/>`;
    }).join('')}</svg>${graph.positions.map(([x, y], i) => `<button class="glo-light" type="button" data-light="${i}" style="left:${x * 100}%;top:${y * 100}%"><span class="glo-light-core"><span class="glo-light-number">${i + 1}</span></span><span class="glo-hint-label" aria-hidden="true">hint</span></button>`).join('')}`;
    buttons = [...get('board').querySelectorAll('[data-light]')];
    edges = [...get('board').querySelectorAll('[data-edge]')];
    buttons.forEach((button, i) => {
      button.addEventListener('click', () => press(i));
      button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') showPreview(i); });
      button.addEventListener('pointerleave', () => showPreview(button === document.activeElement ? i : -1));
      button.addEventListener('focus', () => showPreview(i));
      button.addEventListener('blur', () => showPreview(-1));
      button.addEventListener('keydown', event => {
        const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (!directions[event.key]) return;
        event.preventDefault();
        const [dx, dy] = directions[event.key], [x, y] = graph.positions[i];
        const candidates = graph.positions.map(([px, py], index) => {
          const vx = px - x, vy = py - y;
          return { index, forward: vx * dx + vy * dy, score: Math.hypot(vx, vy) + 2 * Math.abs(vx * dy - vy * dx) };
        }).filter(candidate => candidate.forward > .01).sort((a, b) => a.score - b.score);
        if (candidates.length) buttons[candidates[0].index].focus();
      });
    });
  }

  function showPreview(vertex) {
    preview = game.solved ? -1 : vertex;
    const affected = preview < 0 ? 0 : pressEffect(graph, 1 << preview);
    buttons.forEach((button, i) => button.classList.toggle('is-preview', !!(affected & (1 << i))));
    edges.forEach(edge => edge.classList.toggle('is-preview', edge.dataset.edge.split(',').map(Number).includes(preview)));
    get('preview').textContent = preview < 0 ? '' : `Press ${preview + 1} → flips ${vertices(affected, graph.size).map(i => i + 1).join(', ')}`;
  }

  function showDifficulty(value = book.difficulty) {
    const level = LIGHTS_OUT_LEVELS[value];
    get('difficulty-label').textContent = level.name;
    get('difficulty').setAttribute('aria-valuetext', level.name);
    get('level-detail').textContent = `${level.sizes[0]}–${level.sizes.at(-1)} lights · ${level.presses.join('–')} presses at best`;
  }

  function render(message = '') {
    book.record(game.exportState(), game.solved);
    root.dataset.solved = String(game.solved); root.dataset.numbers = String(numbers);
    get('numbers').checked = numbers;
    get('board-name').textContent = `${graph.name} · ${graph.size} lights`;
    get('moves').textContent = `${game.moves} ${game.moves === 1 ? 'press' : 'presses'}`;
    get('target').textContent = `${puzzle.minimum} presses`;
    get('name').textContent = `Puzzle ${book.number} / ${book.total}${book.currentCompleted ? ' ✓' : ''}`;
    get('name').setAttribute('aria-label', `Puzzle ${book.number} of ${book.total}${book.currentCompleted ? ', solved' : ''}. Choose a puzzle.`);
    get('completed').textContent = `${book.completedCount} / ${book.total} ${LIGHTS_OUT_LEVELS[book.difficulty].name} puzzles solved`;
    get('book-progress').textContent = `${book.completedCount} / ${book.total} solved`;
    for (const name of ['number', 'number-slider']) { get(name).value = String(book.number); get(name).max = String(book.total); }
    get('number-slider').setAttribute('aria-valuetext', `Puzzle ${book.number} of ${book.total}`);
    get('previous').disabled = book.number === 1;
    get('following').disabled = book.number === book.total;
    get('remaining').textContent = game.solved ? 'All lights off' : `${countBits(game.lights)} ${countBits(game.lights) === 1 ? 'light' : 'lights'} on`;
    get('undo').disabled = !game.canUndo; get('redo').disabled = !game.canRedo;
    get('restart').disabled = !game.moves;
    get('hint').disabled = game.solved;
    get('hint').classList.toggle('is-confirming', hint !== null);
    setActionLabel(get('hint'), hint === null ? 'Hint' : `Use hint: press light ${hint + 1}`);
    get('new').disabled = !book.canAdvance; get('shuffle').disabled = !book.canAdvance;
    buttons.forEach((button, i) => {
      const on = !!(game.lights & (1 << i));
      const affected = vertices(pressEffect(graph, 1 << i), graph.size).map(vertex => vertex + 1).join(', ');
      button.classList.toggle('is-on', on); button.classList.toggle('is-hint', i === hint);
      button.setAttribute('aria-pressed', String(on));
      button.setAttribute('aria-label', `Light ${i + 1}, ${on ? 'on' : 'off'}. Press to flip lights ${affected}.${i === hint ? ' Suggested by the hint.' : ''}`);
      button.disabled = game.solved;
    });
    get('board').setAttribute('aria-label', `${graph.name}. ${countBits(game.lights)} of ${graph.size} lights on.`);
    get('status').textContent = game.solved
      ? book.allCompleted ? `All ${book.total.toLocaleString('en')} ${LIGHTS_OUT_LEVELS[book.difficulty].name} puzzles complete! Choose a number to replay.`
        : `Solved in ${game.moves} ${game.moves === 1 ? 'press' : 'presses'}.${game.moves === puzzle.minimum ? ' A shortest route!' : ` Can you find the ${puzzle.minimum}-press route?`}`
      : message || `Aim for ${puzzle.minimum} presses. Take your time.`;
    showPreview(preview); storage.save(snapshot());
  }

  function press(vertex) { if (game.press(vertex)) { hint = null; render(); } }
  function loadPuzzle() {
    puzzle = book.puzzle; graph = puzzle.graph; game = createLightsOutGame(puzzle, book.state);
    hint = null; preview = -1; get('picker').open = false;
    drawGraph(); render();
  }
  function openNumber(number) {
    if (!book.open(number)) { render(`Choose a puzzle number from 1 to ${book.total}.`); get('number').focus(); return; }
    loadPuzzle(); get('name').focus();
  }
  get('new').addEventListener('click', () => { if (book.advance()) loadPuzzle(); });
  get('shuffle').addEventListener('click', () => { if (book.shuffle(random)) loadPuzzle(); });
  get('previous').addEventListener('click', () => { if (book.open(book.number - 1)) loadPuzzle(); });
  get('following').addEventListener('click', () => { if (book.open(book.number + 1)) loadPuzzle(); });
  get('jump').addEventListener('submit', event => { event.preventDefault(); openNumber(Number(get('number').value)); });
  get('number-slider').addEventListener('input', () => { get('number').value = get('number-slider').value; });
  get('number-slider').addEventListener('change', () => openNumber(Number(get('number-slider').value)));
  get('number').addEventListener('input', () => {
    const value = Number(get('number').value);
    if (Number.isInteger(value) && value >= 1 && value <= book.total) get('number-slider').value = String(value);
  });
  get('undo').addEventListener('click', () => { if (game.undo()) { hint = null; render('Last press undone.'); } });
  get('redo').addEventListener('click', () => { if (game.redo()) { hint = null; render('Press restored.'); } });
  get('restart').addEventListener('click', () => { book.replay(); game.reset(); hint = null; render('Back to the start.'); });
  get('hint').addEventListener('click', () => {
    if (game.solved) return;
    if (hint !== null) { press(hint); return; }
    hint = game.hint(); render(`Try light ${hint + 1}. Press it, or tap the check mark.`);
  });
  get('difficulty').addEventListener('input', () => showDifficulty(Number(get('difficulty').value) - 1));
  get('difficulty').addEventListener('change', () => {
    const value = Number(get('difficulty').value) - 1;
    if (value === book.difficulty) return;
    book.record(game.exportState(), game.solved);
    if (book.changeDifficulty(value)) { showDifficulty(); loadPuzzle(); }
  });
  get('numbers').addEventListener('change', () => { numbers = get('numbers').checked; render(); });
  for (const name of ['difficulty', 'number', 'number-slider', 'open', 'numbers']) get(name).disabled = false;
  get('difficulty').value = String(book.difficulty + 1); showDifficulty(); drawGraph(); render();
  return { book, press, read: () => ({ number: book.number, difficulty: book.difficulty, key: puzzle.key, lights: game.lights, start: puzzle.start, minimum: puzzle.minimum, moves: game.moves, hint }) };
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-graph-lights-out]').forEach(root => initializeGraphLightsOut(root));

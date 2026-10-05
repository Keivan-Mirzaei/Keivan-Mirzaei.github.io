import { LIGHTS_OUT_LEVELS } from '../lib/lights-out-book-graphs.mjs';
import { createLightsOutWorkspace } from '../lib/lights-out-workspace.mjs';
import { createPuzzleStorage } from '../lib/puzzle-storage.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';
import { initializeProgressReset } from '../lib/widget-progress.mjs';
import { setActionLabel } from '../lib/puzzle-controls.mjs';
import { countBits, pressEffect, vertices } from '../lib/lights-out-math.mjs';

let nextInstance = 0;
export function initializeGraphLightsOut(root, { storage = createPuzzleStorage('lights-out', root), random = Math.random, catalogue } = {}) {
  const get = name => root.querySelector(`[data-glo-${name}]`);
  const saved = storage.read(), play = createLightsOutWorkspace(saved, catalogue);
  let book = play.book, game = play.game, puzzle = book.puzzle, graph = puzzle.graph;
  let hint = null, preview = -1, buttons = [], edges = [], numbers = saved?.numbers === true;
  const events = new AbortController();
  let boardEvents = new AbortController();
  const listen = (element, name, callback) => element.addEventListener(name, callback, { signal: events.signal });
  const disposePanels = initializeWidgetPanels(root);
  const prefix = `lights-out-${++nextInstance}`;
  for (const name of ['difficulty', 'number']) {
    get(name).id = `${prefix}-${name}`;
    get(`${name}-name`).setAttribute('for', get(name).id);
    get(`${name}-label`).setAttribute('for', get(name).id);
  }
  const snapshot = () => ({ ...play.exportState(), numbers });
  storage.setSnapshotProvider(snapshot);

  function drawGraph() {
    boardEvents.abort(); boardEvents = new AbortController();
    get('board').innerHTML = `<svg class="glo-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${graph.edges.map(([a, b]) => {
      const [ax, ay] = graph.positions[a], [bx, by] = graph.positions[b];
      return `<path data-edge="${a},${b}" d="M${ax * 100},${ay * 100}L${bx * 100},${by * 100}"/>`;
    }).join('')}</svg>${graph.positions.map(([x, y], i) => `<button class="glo-light" type="button" data-light="${i}" style="left:${x * 100}%;top:${y * 100}%" tabindex="${i === 0 ? 0 : -1}"><span class="glo-light-core"><span class="glo-light-number">${i + 1}</span></span><span class="glo-hint-label" aria-hidden="true">hint</span></button>`).join('')}`;
    buttons = [...get('board').querySelectorAll('[data-light]')];
    edges = [...get('board').querySelectorAll('[data-edge]')];
    const on = (button, name, callback) => button.addEventListener(name, callback, { signal: boardEvents.signal });
    buttons.forEach((button, i) => {
      on(button, 'click', () => press(i));
      on(button, 'pointerenter', event => { if (event.pointerType !== 'touch') showPreview(i); });
      on(button, 'pointerleave', () => showPreview(button === document.activeElement ? i : -1));
      on(button, 'focus', () => { buttons.forEach((other, j) => { other.tabIndex = j === i ? 0 : -1; }); showPreview(i); });
      on(button, 'blur', () => showPreview(-1));
      on(button, 'keydown', event => {
        const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (!directions[event.key] || event.altKey || event.ctrlKey || event.metaKey) return;
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
    get('preview').textContent = preview < 0 ? '' : numbers
      ? `Press ${preview + 1} → flips ${vertices(affected, graph.size).map(i => i + 1).join(', ')}`
      : `${countBits(affected)} lights will flip`;
  }

  function showDifficulty(value = book.difficulty) {
    const level = LIGHTS_OUT_LEVELS[value];
    get('difficulty-label').textContent = level.name;
    get('difficulty').setAttribute('aria-valuetext', level.name);
    get('level-detail').textContent = `${level.sizes[0]}–${level.sizes.at(-1)} lights · ${level.presses.join('–')} presses at best`;
  }
  function previewNumber(value) {
    get('number-label').textContent = `${value} / ${book.total}`;
    get('number-slider').setAttribute('aria-valuetext', `Puzzle ${value} of ${book.total}`);
  }

  function render(message = '') {
    root.dataset.solved = String(game.solved); root.dataset.numbers = String(numbers);
    get('numbers').checked = numbers;
    get('board-name').textContent = `${graph.name} · ${graph.size} lights`;
    get('moves').textContent = `${game.moves} ${game.moves === 1 ? 'press' : 'presses'}`;
    get('name').textContent = `Puzzle ${book.number} / ${book.total}${book.currentCompleted ? ' ✓' : ''}`;
    get('name').setAttribute('aria-label', `Puzzle ${book.number} of ${book.total}${book.currentCompleted ? ', solved' : ''}. Choose a puzzle.`);
    get('completed').textContent = `${book.completedCount} / ${book.total} ${LIGHTS_OUT_LEVELS[book.difficulty].name} puzzles solved`;
    for (const name of ['number', 'number-slider']) { get(name).value = String(book.number); get(name).max = String(book.total); }
    previewNumber(book.number);
    get('remaining').textContent = game.solved ? 'All lights off' : `${countBits(game.lights)} ${countBits(game.lights) === 1 ? 'light' : 'lights'} on`;
    get('undo').disabled = !play.canUndo; get('redo').disabled = !play.canRedo;
    get('restart').disabled = !game.moves;
    get('hint').disabled = game.solved;
    get('hint').setAttribute('aria-pressed', String(hint !== null));
    get('hint-label').textContent = hint === null ? 'Hint' : 'Hide hint';
    setActionLabel(get('hint'), hint === null ? 'Hint' : 'Hide hint');
    get('new').disabled = !book.canAdvance; get('new').hidden = !game.solved || !book.canAdvance;
    get('shuffle').disabled = !book.canAdvance;
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
      : message || (hint !== null ? numbers ? `Try light ${hint + 1}.` : 'Try the marked light.' : `Aim for ${puzzle.minimum} presses. Take your time.`);
    showPreview(preview); storage.save(snapshot());
  }

  function press(vertex) {
    if (!play.press(vertex)) return;
    hint = null; render();
    if (game.solved) get('undo').focus({ preventScroll: true });
  }
  function loadPuzzle(message = '') {
    const oldGraph = graph;
    book = play.book; game = play.game; puzzle = book.puzzle; graph = puzzle.graph;
    hint = null; preview = -1;
    get('difficulty').value = String(book.difficulty + 1); showDifficulty();
    if (oldGraph !== graph || !buttons.length) drawGraph();
    render(message);
  }
  function action(callback, message = '') {
    if (!callback()) return;
    loadPuzzle(message);
    if (document.activeElement?.disabled) (game.solved ? get('undo') : buttons.find(button => !button.disabled)).focus({ preventScroll: true });
  }
  function openNumber(number) {
    if (number === book.number) { render('This puzzle is already open.'); return; }
    if (!play.open(number)) { render(`Choose a puzzle number from 1 to ${book.total}.`); get('number').focus(); return; }
    loadPuzzle();
  }
  listen(get('new'), 'click', () => action(() => play.advance()));
  listen(get('shuffle'), 'click', () => action(() => play.shuffle(random)));
  listen(get('jump'), 'submit', event => { event.preventDefault(); openNumber(Number(get('number').value)); });
  listen(get('number-slider'), 'input', () => { get('number').value = get('number-slider').value; previewNumber(get('number').value); });
  listen(get('number'), 'input', () => {
    const value = Number(get('number').value);
    if (Number.isInteger(value) && value >= 1 && value <= book.total) { get('number-slider').value = String(value); previewNumber(value); }
  });
  listen(get('undo'), 'click', () => action(() => play.undo(), 'Action undone.'));
  listen(get('redo'), 'click', () => action(() => play.redo(), 'Action restored.'));
  listen(get('restart'), 'click', () => action(() => play.reset(), 'Back to the start.'));
  listen(get('hint'), 'click', () => { if (game.solved) return; hint = hint === null ? game.hint() : null; render(); });
  listen(get('difficulty'), 'input', () => showDifficulty(Number(get('difficulty').value) - 1));
  listen(get('difficulty'), 'change', () => action(() => play.changeDifficulty(Number(get('difficulty').value) - 1)));
  listen(get('numbers'), 'change', () => { numbers = get('numbers').checked; render(); });
  const disposeProgress = initializeProgressReset(root, () => {
    storage.clear?.(); play.resetProgress(); loadPuzzle('Progress reset. Start with puzzle 1.');
  });
  for (const name of ['difficulty', 'number', 'number-slider', 'open', 'numbers']) get(name).disabled = false;
  loadPuzzle();
  return { get book() { return book; }, press,
    read: () => ({ number: book.number, difficulty: book.difficulty, key: puzzle.key, lights: game.lights, start: puzzle.start, minimum: puzzle.minimum, moves: game.moves, hint }),
    destroy() { disposeProgress(); disposePanels(); events.abort(); boardEvents.abort(); },
  };
}

if (typeof document !== 'undefined') document.querySelectorAll('[data-graph-lights-out]').forEach(root => initializeGraphLightsOut(root));

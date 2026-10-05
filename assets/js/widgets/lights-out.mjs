import { createWidgetHistory } from '../lib/widget-history.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';
import { BOOK_GRAPHS } from '../lib/lights-out-book-graphs.mjs';
import { drawLightsOutBoard, lightsOutNeighbor } from '../lib/lights-out-view.mjs';
import { BOARDS, vertices, countBits, parity, pressEffect, solvePresses, samplePuzzle, complementProof } from '../lib/lights-out-math.mjs';

const parityWord = value => value % 2 ? 'odd' : 'even';
const labels = (mask, graph) => vertices(mask, graph.size).map(i => i + 1).join(', ') || 'none';
const pressLabel = mask => `${countBits(mask)} ${countBits(mask) === 1 ? 'press' : 'presses'}`;

export const EXPLORATION_BOARDS = {
  'path-6': BOOK_GRAPHS['path-6'],
  'loop-7': BOOK_GRAPHS['loop-7'],
  'branches-7-0': BOOK_GRAPHS['branches-7-0'],
  'network-8-1': BOOK_GRAPHS['network-8-1'],
  ...BOARDS,
};

export function initializeLightsOutExploration(game, { random = Math.random } = {}) {
  const get = name => game.querySelector(`[data-lo-${name}]`);
  const events = new AbortController();
  const listen = (element, type, handler, options = {}) => element.addEventListener(type, handler, { ...options, signal: events.signal });
  const disposePanels = initializeWidgetPanels(game);
  let key = 'path-6', graph = EXPLORATION_BOARDS[key];
  let start = pressEffect(graph, (1 << 0) | (1 << 3));
  let lights = start, goal = 'off', moves = [], editing = false, showing = false, plan = null;
  let baseline = solvePresses(graph, start);
  const target = () => goal === 'off' ? 0 : start ^ graph.all;

  const history = createWidgetHistory(
    () => ({ key, start, lights, goal, moves, editing, plan }),
    state => {
      ({ key, start, lights, goal, moves, editing, plan } = state); graph = EXPLORATION_BOARDS[key];
      baseline = solvePresses(graph, start ^ target());
      if (editing || !baseline.solutions.length) hideSolution();
      if (showing && !plan) makePlan(); render();
    },
    (canUndo, canRedo) => { get('undo').disabled = !canUndo; get('redo').disabled = !canRedo; }
  );
  // Capture before the existing mathematical handler; commit after it finishes.
  function record(element, type) {
    let before;
    listen(element, type, () => { before = history.capture(); }, { capture: true });
    listen(element, type, () => {
      history.commit(before);
      if (lights === target() && !editing && history.canUndo) get('undo').focus({ preventScroll: true });
    });
  }

  function makePlan(index = 0) {
    const analysis = solvePresses(graph, lights ^ target());
    plan = analysis.solutions.length ? { ...analysis, choice: index % analysis.solutions.length, index: 0 } : null;
    if (plan) plan.order = vertices(plan.solutions[plan.choice], graph.size);
  }

  function highlight(vertex = -1) {
    if (lights === target() && !editing) vertex = -1;
    const affected = vertex < 0 ? 0 : editing ? 1 << vertex : graph.neighbors[vertex] | (1 << vertex);
    get('play').querySelectorAll('[data-light]').forEach(button => {
      button.classList.toggle('is-preview', Boolean(affected & (1 << Number(button.dataset.light))));
    });
    get('play').querySelectorAll('[data-edge]').forEach(edge => edge.classList.toggle('is-preview', !editing && edge.dataset.edge.split(',').map(Number).includes(vertex)));
  }

  function render() {
    const analysis = solvePresses(graph, lights ^ target());
    const solved = lights === target();
    const totalParity = baseline.solutions.length ? parityWord(parity(baseline.solutions[0])) : null;
    get('board').value = key;
    get('goal').value = goal;
    get('count').textContent = `${moves.length} ${moves.length === 1 ? 'press' : 'presses'} · ${parityWord(moves.length)}`;
    get('instruction').textContent = editing ? 'Editing: clicking changes just one starting light. Turn off Edit starting lights to play.' : graph.side ? 'Press a light to flip it and its neighbors above, below, left, and right. Hover or focus to preview a move.' : 'Press a light to flip it and every light joined to it by an edge. Hover or focus to preview a move.';
    get('target-region').hidden = goal !== 'complement';
    if (goal === 'complement') drawLightsOutBoard(get('target'), graph, target(), { interactive: false, numbered: false });
    const remaining = showing && plan ? plan.order.slice(plan.index) : [];
    drawLightsOutBoard(get('play'), graph, lights, { interactive: true, order: remaining, next: remaining[0], editing, numbered: showing || editing || get('numbers').checked, solved: solved && !editing });
    game.querySelector('#lo-game-title').textContent = goal === 'off' ? 'Can you turn them all off?' : 'Can you flip every starting light?';
    get('show-label').textContent = showing ? 'Hide solution' : 'Show solution';
    get('show').disabled = editing || !analysis.solutions.length;
    get('edit').checked = editing;
    game.dataset.complete = String(solved && !editing);
    get('undo').disabled = !history.canUndo;
    get('redo').disabled = !history.canRedo;
    get('restart').disabled = editing;
    get('plan-key').hidden = !showing || !plan || !remaining.length;
    if (showing && plan) {
      const mask = plan.solutions[plan.choice];
      const route = plan.order.map(i => i + 1).join(' → ') || 'No presses needed';
      get('plan-label').textContent = `Plan ${plan.choice + 1} of ${plan.solutions.length}: ${pressLabel(mask)} · ${parityWord(parity(mask))}. ${route}. Completed ${plan.index} of ${plan.order.length}.`;
      get('next').disabled = !remaining.length;
      get('finish').disabled = !remaining.length;
      // Alternatives share exactly the same starting board. After stepping,
      // reveal a fresh plan before comparing alternatives for the new board.
      get('alternative').disabled = plan.solutions.length < 2 || plan.index > 0;
      const solutionCount = plan.solutions.length === 1 ? 'The unique reduced solution has' : `All ${plan.solutions.length} reduced solutions have`;
      get('parity').textContent = `${solutionCount} ${parityWord(parity(mask))} parity from this plan’s starting board. ${plan.choice === 0 ? 'This plan uses the fewest presses.' : 'This is another valid press set.'} Any completed route from the puzzle’s original start must use an ${totalParity} number of presses.`;
    }
    if (editing) get('status').textContent = `${countBits(start)} of ${graph.size} starting lights on. ${analysis.solutions.length ? 'This target is reachable.' : 'The all-off target is unreachable.'}`;
    else if (!analysis.solutions.length) {
      get('status').textContent = `All-off is impossible: among lights ${labels(analysis.witness, graph)}, an odd number are on. Every legal press flips an even number of lights in this set, so that parity cannot change. Try “Complement the start”.`;
    } else if (solved) {
      get('status').textContent = `${goal === 'off' ? 'All lights are off!' : 'Every starting light has flipped!'} ${moves.length} ${moves.length === 1 ? 'press' : 'presses'} · ${parityWord(moves.length)}. ${moves.length ? `Every successful route from this same start has ${totalParity} parity.` : 'The target already matches the start.'}`;
    } else {
      const next = remaining[0];
      get('status').textContent = `${countBits(lights ^ target())} ${countBits(lights ^ target()) === 1 ? 'light differs' : 'lights differ'} from the target. ${next !== undefined ? `Next: press light ${next + 1}.` : 'Try a move or reveal a solution.'} A complete route from the original start must have ${totalParity} parity.`;
    }
  }

  function reset(nextStart = start) {
    start = nextStart; lights = start; moves = []; plan = null; editing = false;
    hideSolution();
    baseline = solvePresses(graph, start ^ target());
    render();
  }

  function press(vertex, partOfPlan = false) {
    if (editing) {
      start ^= 1 << vertex; lights = start;
      baseline = solvePresses(graph, start ^ target());
    } else {
      lights ^= pressEffect(graph, 1 << vertex); moves.push(vertex);
      if (!partOfPlan) { plan = null; if (showing) makePlan(); }
    }
  }

  listen(get('play'), 'click', event => {
    const button = event.target.closest('[data-light]');
    if (!button || button.disabled) return;
    press(Number(button.dataset.light)); render();
  });
  for (const eventName of ['pointerover', 'focusin']) listen(get('play'), eventName, event => {
    const button = event.target.closest('[data-light]');
    if (button) {
      if (eventName === 'focusin') get('play').querySelectorAll('[data-light]').forEach(light => { light.tabIndex = light === button ? 0 : -1; });
      highlight(Number(button.dataset.light));
    }
  });
  listen(get('play'), 'pointerleave', () => highlight());
  listen(get('play'), 'focusout', event => { if (!get('play').contains(event.relatedTarget)) highlight(); });
  listen(get('play'), 'keydown', event => {
    const button = event.target.closest('[data-light]');
    if (!button || !event.key.startsWith('Arrow') || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const next = lightsOutNeighbor(graph, Number(button.dataset.light), event.key);
    if (next >= 0) get('play').querySelector(`[data-light="${next}"]`)?.focus();
  });
  function syncPanels() {
    const wasShowing = showing;
    showing = !get('solution').hidden;
    if (showing && !wasShowing) makePlan();
    render();
  }
  function hideSolution() {
    if (!get('solution').hidden) { get('show').disabled = false; get('show').click(); }
    showing = false;
  }
  game.querySelectorAll('[data-widget-panel-trigger]').forEach(trigger => listen(trigger, 'click', syncPanels));
  listen(game.ownerDocument, 'keydown', event => { if (event.key === 'Escape') syncPanels(); });
  listen(get('board'), 'change', event => { key = event.target.value; graph = EXPLORATION_BOARDS[key]; reset(samplePuzzle(graph, random)); });
  listen(get('goal'), 'change', event => { goal = event.target.value; reset(); });
  listen(get('new'), 'click', () => reset(samplePuzzle(graph, random)));
  listen(get('restart'), 'click', () => reset());
  listen(get('undo'), 'click', () => history.undo());
  listen(get('redo'), 'click', () => history.redo());
  listen(get('next'), 'click', () => { if (!plan || plan.index >= plan.order.length) return; press(plan.order[plan.index++], true); render(); });
  listen(get('finish'), 'click', () => { if (!plan) return; while (plan.index < plan.order.length) press(plan.order[plan.index++], true); render(); });
  listen(get('alternative'), 'click', () => { if (!plan || plan.index) return; makePlan(plan.choice + 1); render(); });
  listen(get('numbers'), 'change', render);
  listen(get('edit'), 'change', () => {
    editing = get('edit').checked; plan = null; moves = []; start = lights;
    hideSolution();
    baseline = solvePresses(graph, start ^ target()); render();
  });
  listen(get('impossible'), 'click', () => { key = 'pair'; graph = EXPLORATION_BOARDS[key]; goal = 'off'; reset(1); });
  game.querySelectorAll('button, select, input').forEach(control => { control.disabled = false; });
  record(get('play'), 'click');
  for (const name of ['new','restart','next','finish','impossible']) record(get(name), 'click');
  for (const name of ['board','goal','edit']) record(get(name), 'change');
  render();
  return { read: () => ({ key, start, lights, goal, moves: moves.slice(), editing, showing, plan: structuredClone(plan) }), destroy() { disposePanels(); events.abort(); } };
}

export function initializeLightsOutProof(proofWidget) {
  const get = name => proofWidget.querySelector(`[data-lo-proof-${name}]`);
  const events = new AbortController();
  const listen = (element, type, handler) => element.addEventListener(type, handler, { signal: events.signal });
  const disposePanels = initializeWidgetPanels(proofWidget);
  let step = 0, graph = BOARDS['path-4'], slides = [];

  function build() {
    const initial = vertices(graph.all, graph.size).filter(i => i % 2 === 0).reduce((mask, i) => mask | (1 << i), 0);
    const proof = complementProof(graph);
    slides = [{ lights: initial, text: `Start with lights ${labels(initial, graph)} on. We want to flip all ${graph.size} lights. Each following trial starts from this same pattern.` }];
    for (const trial of proof.candidates) {
      const togglesOmitted = Boolean(trial.effect & (1 << trial.omitted));
      slides.push({ lights: initial ^ trial.effect, omitted: trial.omitted, pressed: trial.presses,
        text: `Remove light ${trial.omitted + 1}. The induction gives presses ${labels(trial.presses, graph)} to flip every remaining light. Restore the omitted light and use the same presses: it ${togglesOmitted ? 'also flips. Every light has flipped; we are done!' : 'stays unchanged. This trial flips everything except that light.'}` });
    }
    if (proof.branch === 'pairs') {
      const odd = proof.oddVertices.reduce((mask, i) => mask | (1 << i), 0);
      slides.push({ lights: initial ^ odd, pressed: proof.correction,
        text: `None of the trials flipped its omitted light. The odd-degree vertices are ${labels(odd, graph)}. Pair them and combine the corresponding trials: repeated toggles cancel. Presses ${labels(proof.correction, graph)} flip exactly these odd-degree vertices.` });
      slides.push({ lights: initial ^ graph.all, pressed: proof.presses,
        text: `Now press every vertex once. A vertex of degree d is toggled d + 1 times. The earlier correction makes the total odd at every vertex, so every starting light flips. Cancel duplicate presses: the final press set is ${labels(proof.presses, graph)} (${pressLabel(proof.presses)}).` });
    }
    step = 0;
    render();
  }

  function render() {
    const slide = slides[step];
    drawLightsOutBoard(get('board'), graph, slide.lights, { ...slide, interactive: false });
    proofWidget.dataset.complete = String(step === slides.length - 1);
    get('count').textContent = `${step + 1} / ${slides.length}`;
    get('detail').textContent = slide.text;
    get('back').disabled = step === 0;
    get('next').disabled = step === slides.length - 1;
  }
  get('graph').disabled = false;
  listen(get('graph'), 'change', event => { graph = BOARDS[event.target.value]; build(); });
  listen(get('back'), 'click', () => { if (step > 0) step--; render(); });
  listen(get('next'), 'click', () => { if (step < slides.length - 1) step++; render(); });
  build();
  return { read: () => ({ step, size: graph.size, slide: structuredClone(slides[step]), total: slides.length }), destroy() { disposePanels(); events.abort(); } };
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-lights-out]').forEach(game => initializeLightsOutExploration(game));
  document.querySelectorAll('[data-lights-out-proof]').forEach(widget => initializeLightsOutProof(widget));
}

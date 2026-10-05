import { createWidgetHistory } from '../lib/widget-history.mjs';
import { BOARDS, vertices, countBits, parity, pressEffect, solvePresses, samplePuzzle, complementProof } from '../lib/lights-out-math.mjs';

const parityWord = value => value % 2 ? 'odd' : 'even';
const labels = (mask, graph) => vertices(mask, graph.size).map(i => i + 1).join(', ') || 'none';
const pressLabel = mask => `${countBits(mask)} ${countBits(mask) === 1 ? 'press' : 'presses'}`;

function drawBoard(holder, graph, lights, { interactive = false, order = [], next = -1, omitted = -1, pressed = 0, editing = false, numbered = true } = {}) {
  const focused = holder.contains(document.activeElement) ? document.activeElement.dataset.loLight : undefined;
  holder.classList.toggle('lo-grid', Boolean(graph.side));
  holder.classList.toggle('lo-graph', !graph.side);
  holder.dataset.loSide = graph.side || '';
  holder.style.aspectRatio = !graph.side && graph.positions.every(([, y]) => Math.abs(y - .5) < .001) ? '3.5' : '';
  holder.setAttribute('role', interactive ? 'group' : 'img');
  holder.setAttribute('aria-label', `${graph.name}. Lights on: ${labels(lights, graph)}.${interactive ? '' : ` Lights pressed: ${labels(pressed, graph)}.`}`);
  const edges = graph.side ? '' : `<svg class="lo-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${graph.edges.map(([a, b]) => {
    const [ax, ay] = graph.positions[a], [bx, by] = graph.positions[b];
    return `<line class="lo-edge${a === omitted || b === omitted ? ' lo-removed-edge' : ''}" x1="${ax * 100}" y1="${ay * 100}" x2="${bx * 100}" y2="${by * 100}"/>`;
  }).join('')}</svg>`;
  const cells = graph.positions.map(([x, y], i) => {
    const on = Boolean(lights & (1 << i));
    const step = order.indexOf(i);
    const planned = step >= 0;
    const tag = interactive ? 'button' : 'span';
    const attributes = interactive ? `type="button" data-lo-light="${i}" aria-pressed="${on}" aria-label="Light ${i + 1}, ${on ? 'on' : 'off'}. ${editing ? 'Change this starting light.' : `Press to flip lights ${labels(graph.neighbors[i] | (1 << i), graph)}.`}${planned ? ` Solution step ${step + 1}.` : ''}"` : 'aria-hidden="true"';
    return `<${tag} ${attributes} class="lo-light${on ? ' is-on' : ''}${planned || (pressed & (1 << i)) ? ' is-plan' : ''}${i === next ? ' is-next' : ''}${i === omitted ? ' is-omitted' : ''}" style="left:${x * 100}%;top:${y * 100}%;${graph.side ? `--lo-cell:${100 / graph.side}%` : ''}">${numbered ? `<span class="lo-number">${i + 1}</span>` : ''}<i class="lo-pip" aria-hidden="true"></i>${planned ? `<span class="lo-step" aria-hidden="true">${step + 1}</span>` : ''}</${tag}>`;
  }).join('');
  holder.innerHTML = edges + cells;
  if (focused !== undefined) holder.querySelector(`[data-lo-light="${focused}"]`)?.focus({ preventScroll: true });
}

for (const game of document.querySelectorAll('[data-lights-out]')) {
  const get = name => game.querySelector(`[data-lo-${name}]`);
  let key = 'grid-3', graph = BOARDS[key];
  let start = pressEffect(graph, (1 << 0) | (1 << 2) | (1 << 4));
  let lights = start, goal = 'off', moves = [], editing = false, showing = false, plan = null;
  let baseline = solvePresses(graph, start);
  const target = () => goal === 'off' ? 0 : start ^ graph.all;

  const history = createWidgetHistory(
    () => ({ key, start, lights, goal, moves, editing, plan }),
    state => {
      ({ key, start, lights, goal, moves, editing, plan } = state); graph = BOARDS[key];
      baseline = solvePresses(graph, start ^ target());
      if (showing && !plan) makePlan(); render();
    },
    (canUndo, canRedo) => { get('undo').disabled = !canUndo; get('redo').disabled = !canRedo; }
  );
  // Capture before the existing mathematical handler; commit after it finishes.
  function record(element, type) {
    let before;
    element.addEventListener(type, () => { before = history.capture(); }, { capture: true });
    element.addEventListener(type, () => { history.commit(before); });
  }

  function makePlan(index = 0) {
    const analysis = solvePresses(graph, lights ^ target());
    plan = analysis.solutions.length ? { ...analysis, choice: index % analysis.solutions.length, index: 0 } : null;
    if (plan) plan.order = vertices(plan.solutions[plan.choice], graph.size);
  }

  function highlight(vertex = -1) {
    const affected = vertex < 0 ? 0 : editing ? 1 << vertex : graph.neighbors[vertex] | (1 << vertex);
    get('play').querySelectorAll('[data-lo-light]').forEach(button => {
      button.classList.toggle('is-affected', Boolean(affected & (1 << Number(button.dataset.loLight))));
    });
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
    if (goal === 'complement') drawBoard(get('target'), graph, target());
    const remaining = showing && plan ? plan.order.slice(plan.index) : [];
    drawBoard(get('play'), graph, lights, { interactive: true, order: remaining, next: remaining[0], editing, numbered: showing || editing });
    game.querySelector('#lo-game-title').textContent = goal === 'off' ? 'Can you turn them all off?' : 'Can you flip every starting light?';
    get('show').textContent = showing ? 'Hide solution' : 'Show solution';
    get('show').disabled = editing || !analysis.solutions.length;
    get('edit').setAttribute('aria-checked', String(editing));
    get('show').setAttribute('aria-expanded', String(showing));
    game.dataset.complete = String(solved && !editing);
    get('undo').disabled = !history.canUndo;
    get('redo').disabled = !history.canRedo;
    get('restart').disabled = editing;
    get('solution').hidden = !showing || !plan;
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
    start = nextStart; lights = start; moves = []; plan = null; showing = false; editing = false;
    baseline = solvePresses(graph, start ^ target());
    render();
  }

  function press(vertex, partOfPlan = false) {
    if (editing) {
      start ^= 1 << vertex; lights = start;
      baseline = solvePresses(graph, start ^ target());
    } else {
      lights ^= pressEffect(graph, 1 << vertex); moves.push(vertex);
      if (!partOfPlan && showing) makePlan();
    }
  }

  get('play').addEventListener('click', event => {
    const button = event.target.closest('[data-lo-light]');
    if (!button) return;
    press(Number(button.dataset.loLight)); render();
  });
  for (const eventName of ['pointerover', 'focusin']) get('play').addEventListener(eventName, event => {
    const button = event.target.closest('[data-lo-light]');
    if (button) highlight(Number(button.dataset.loLight));
  });
  get('play').addEventListener('pointerleave', () => highlight());
  get('play').addEventListener('focusout', event => { if (!get('play').contains(event.relatedTarget)) highlight(); });
  get('play').addEventListener('keydown', event => {
    const button = event.target.closest('[data-lo-light]');
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!button || !directions[event.key]) return;
    event.preventDefault();
    const current = Number(button.dataset.loLight), [x, y] = graph.positions[current], [dx, dy] = directions[event.key];
    const options = graph.positions.map(([px, py], i) => ({ i, along: (px - x) * dx + (py - y) * dy, across: Math.abs((px - x) * dy - (py - y) * dx) })).filter(point => point.along > .01).sort((a, b) => (a.along + 4 * a.across) - (b.along + 4 * b.across));
    if (options.length) get('play').querySelector(`[data-lo-light="${options[0].i}"]`)?.focus();
  });
  get('board').addEventListener('change', event => { key = event.target.value; graph = BOARDS[key]; reset(samplePuzzle(graph)); });
  get('goal').addEventListener('change', event => { goal = event.target.value; reset(); });
  get('new').addEventListener('click', () => reset(samplePuzzle(graph)));
  get('restart').addEventListener('click', () => reset());
  get('undo').addEventListener('click', () => history.undo());
  get('redo').addEventListener('click', () => history.redo());
  get('show').addEventListener('click', () => { showing = !showing; if (showing) makePlan(); render(); });
  get('next').addEventListener('click', () => { if (!plan || plan.index >= plan.order.length) return; press(plan.order[plan.index++], true); render(); });
  get('finish').addEventListener('click', () => { if (!plan) return; while (plan.index < plan.order.length) press(plan.order[plan.index++], true); render(); });
  get('alternative').addEventListener('click', () => { if (!plan || plan.index) return; makePlan(plan.choice + 1); render(); });
  get('edit').addEventListener('click', () => {
    editing = !editing; showing = false; plan = null; moves = []; start = lights;
    baseline = solvePresses(graph, start ^ target()); render();
  });
  get('impossible').addEventListener('click', () => { key = 'pair'; graph = BOARDS[key]; goal = 'off'; reset(1); });
  game.querySelectorAll('button, select').forEach(control => { control.disabled = false; });
  record(get('play'), 'click');
  for (const name of ['new','restart','next','finish','edit','impossible']) record(get(name), 'click');
  for (const name of ['board','goal']) record(get(name), 'change');
  render();
}

for (const proofWidget of document.querySelectorAll('[data-lights-out-proof]')) {
  const get = name => proofWidget.querySelector(`[data-lo-proof-${name}]`);
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
      slides.push({ lights: initial ^ graph.all, pressed: graph.all,
        text: `Now press every vertex once. A vertex of degree d is toggled d + 1 times. The earlier correction makes the total odd at every vertex, so every starting light flips. Cancel duplicate presses: the final press set is ${labels(proof.presses, graph)} (${pressLabel(proof.presses)}).` });
    }
    step = 0;
    render();
  }

  function render() {
    const slide = slides[step];
    drawBoard(get('board'), graph, slide.lights, slide);
    get('count').textContent = `${step + 1} / ${slides.length}`;
    get('detail').textContent = slide.text;
    get('back').disabled = step === 0;
    get('next').disabled = step === slides.length - 1;
  }
  get('graph').disabled = false;
  get('graph').addEventListener('change', event => { graph = BOARDS[event.target.value]; build(); });
  get('back').addEventListener('click', () => { if (step > 0) step--; render(); });
  get('next').addEventListener('click', () => { if (step < slides.length - 1) step++; render(); });
  build();
}

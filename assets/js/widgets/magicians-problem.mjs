import { createWidgetHistory, bindWidgetHistorySlider } from '../lib/widget-history.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';
import { limitingProbability, differencePerMillion, simulateAudience } from '../lib/magician-math.mjs';
import { overviewChart, rippleChart, routesChart, chartFrame, powerLabel, deviationLabel } from '../lib/magician-charts.mjs';

let nextInstance = 0;
function mountChart(container, markup, afterDraw = () => {}, environment = globalThis) {
  const events = new AbortController();
  let previousWidth = 0;
  function draw(force = false) {
    const width = Math.round(container.getBoundingClientRect().width);
    if (!width || (!force && width === previousWidth)) return;
    previousWidth = width; container.innerHTML = markup(width); afterDraw(width);
  }
  const observer = environment.ResizeObserver ? new environment.ResizeObserver(() => draw()) : null;
  if (observer) observer.observe(container);
  else environment.addEventListener?.('resize', () => draw(), { signal: events.signal });
  draw();
  return { draw: () => draw(true), dispose() { observer?.disconnect(); events.abort(); } };
}

export function initializeMagicianGame(widget, environment = globalThis) {
  const events = new AbortController(), signal = events.signal;
  const svg = widget.querySelector('svg'), holder = widget.querySelector('[data-audience]');
  const people = [...svg.querySelectorAll('[data-player]')];
  const flip = widget.querySelector('[data-flip]'), shuffle = widget.querySelector('[data-new-audience]');
  const undo = widget.querySelector('[data-widget-undo]'), redo = widget.querySelector('[data-widget-redo]');
  const reset = widget.querySelector('[data-widget-reset]');
  const roundLabel = widget.querySelector('[data-round]'), status = widget.querySelector('[data-game-status]');
  let seed = 42, round = 0, run = simulateAudience(seed, round);

  function render() {
    run = simulateAudience(seed, round); round = run.round;
    const width = holder.getBoundingClientRect().width;
    if (width > 0) {
      const columns = width < 400 ? 8 : 16, height = Math.ceil(64 / columns) * 24 + 28;
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.setAttribute('height', height);
      people.forEach((person, index) => {
        person.setAttribute('cx', 16 + (width - 32) * (index % columns) / (columns - 1));
        person.setAttribute('cy', 22 + Math.floor(index / columns) * 24);
        person.setAttribute('class', `mp-person${run.alive[index] ? '' : ' is-out'}`);
      });
    }
    svg.setAttribute('aria-label', `${run.standing} of 64 people remain standing after ${round} rounds. Filled dots stand; outlined dots have sat down.`);
    roundLabel.textContent = `Round ${round} · ${run.standing} standing`;
    flip.disabled = run.standing <= 1; shuffle.disabled = false; reset.disabled = round === 0;
    widget.dataset.result = run.standing === 1 ? 'success' : run.standing === 0 ? 'empty' : 'playing';
    const coin = run.heads ? 'Heads.' : 'Tails.';
    status.textContent = round === 0 ? 'Flip a round. Can chance leave exactly one person standing?'
      : run.standing === 1 ? `${coin} One person remains. This run succeeds!`
      : run.standing === 0 ? `${coin} Everyone sat down. This run skipped over one survivor.`
      : `${coin} ${run.standing} remain. Flip again for their next guesses.`;
  }
  const history = createWidgetHistory(() => ({ seed, round }), state => { ({ seed, round } = state); render(); }, (canUndo, canRedo) => { undo.disabled = !canUndo; redo.disabled = !canRedo; });
  flip.addEventListener('click', () => { if (run.standing > 1) history.change(() => { round += 1; render(); }); }, { signal });
  shuffle.addEventListener('click', () => history.change(() => { seed = (seed + 1) >>> 0; round = 0; render(); }), { signal });
  reset.addEventListener('click', () => history.change(() => { round = 0; render(); }), { signal });
  undo.addEventListener('click', () => history.undo(), { signal });
  redo.addEventListener('click', () => history.redo(), { signal });
  const disposePanels = initializeWidgetPanels(widget);
  const observer = environment.ResizeObserver ? new environment.ResizeObserver(render) : null;
  if (observer) observer.observe(holder);
  else environment.addEventListener?.('resize', render, { signal });
  render();
  return { read: () => ({ seed, round, ...run, alive: [...run.alive] }), dispose() { observer?.disconnect(); disposePanels(); events.abort(); } };
}

export function initializeMagicianProbability(widget, environment = globalThis) {
  const events = new AbortController(), signal = events.signal, prefix = `mp-${++nextInstance}`;
  const document = widget.ownerDocument;
  const magnify = widget.querySelector('[data-magnify]'), detail = widget.querySelector('[data-magnified]');
  const overview = widget.querySelector('[data-overview]'), plot = widget.querySelector('[data-ripple]');
  const slider = widget.querySelector('[data-position]'), positionLabel = widget.querySelector('[data-position-label]');
  const play = widget.querySelector('[data-play-ripple]'), farther = widget.querySelector('[data-farther]');
  const undo = widget.querySelector('[data-widget-undo]'), redo = widget.querySelector('[data-widget-redo]'), reset = widget.querySelector('[data-widget-reset]');
  const status = widget.querySelector('[data-ripple-status]'), chanceOutput = widget.querySelector('[data-chance]'), deviationOutput = widget.querySelector('[data-deviation]');
  const windowLabel = widget.querySelector('[data-window]'), title = widget.querySelector('[data-plot-title]'), caption = widget.querySelector('[data-overview-caption]');
  const motionPreference = environment.matchMedia('(prefers-reduced-motion: reduce)');
  let startExponent = 14, currentPosition = 0, animation = null, lastFrame = null, beforePlayback = null, frame;
  const read = () => ({ startExponent, position: currentPosition });

  function updateCursor(announce = true) {
    slider.value = currentPosition;
    const chance = limitingProbability(currentPosition), deviation = differencePerMillion(chance);
    if (frame) {
      const x = frame.left + (frame.right - frame.left) * currentPosition / 6;
      const y = frame.bottom - (frame.bottom - frame.top) * (deviation + 8) / 16;
      const marker = plot.querySelector('[data-marker]'), guide = plot.querySelector('[data-guide]');
      marker?.setAttribute('cx', x); marker?.setAttribute('cy', y); guide?.setAttribute('x1', x); guide?.setAttribute('x2', x);
    }
    status.setAttribute('aria-live', announce ? 'polite' : 'off');
    chanceOutput.textContent = `≈ ${(chance * 100).toFixed(7)}%`;
    deviationOutput.innerHTML = deviationLabel(deviation);
    positionLabel.textContent = `${Number(currentPosition.toFixed(2))} ${currentPosition === 1 ? 'doubling' : 'doublings'}`;
    reset.disabled = startExponent === 14 && currentPosition === 0;
  }
  const playLabel = () => motionPreference.matches ? 'Next quarter cycle' : currentPosition >= 6 ? 'Replay ripple' : 'Follow the ripple';
  function setWindow() { windowLabel.textContent = `From ${powerLabel(startExponent)} to ${powerLabel(startExponent + 6)} people`; }
  const overviewChartMount = mountChart(overview, width => overviewChart(width, `${prefix}-overview-clip`), undefined, environment);
  const rippleChartMount = mountChart(plot, width => rippleChart(width, startExponent, `${prefix}-ripple-clip`), width => { frame = chartFrame(width); updateCursor(false); }, environment);
  const history = createWidgetHistory(read, state => {
    startExponent = state.startExponent; currentPosition = state.position;
    setWindow(); rippleChartMount.draw(); updateCursor(); play.textContent = playLabel();
  }, (canUndo, canRedo) => { undo.disabled = !canUndo; redo.disabled = !canRedo; });
  function stop() {
    if (animation !== null) environment.cancelAnimationFrame(animation);
    animation = null; lastFrame = null;
    if (beforePlayback !== null) history.commit(beforePlayback);
    beforePlayback = null; play.textContent = playLabel(); updateCursor();
  }
  const finishSlider = bindWidgetHistorySlider(slider, history, () => {
    const value = Number(slider.value); stop(); currentPosition = value; updateCursor(); play.textContent = playLabel();
  }, signal);
  function view() {
    stop(); finishSlider();
    detail.hidden = !magnify.checked; overview.hidden = caption.hidden = magnify.checked;
    title.textContent = magnify.checked ? 'A ripple that remains' : 'It looks settled';
    if (magnify.checked) { setWindow(); rippleChartMount.draw(); updateCursor(); }
    else overviewChartMount.draw();
  }
  magnify.addEventListener('change', view, { signal });
  for (const [button, action] of [[undo, () => history.undo()], [redo, () => history.redo()], [reset, () => history.change(() => { startExponent = 14; currentPosition = 0; setWindow(); rippleChartMount.draw(); updateCursor(); play.textContent = playLabel(); })]]) {
    button.addEventListener('click', () => { stop(); finishSlider(); action(); }, { signal });
  }
  farther.addEventListener('click', () => {
    stop(); finishSlider(); history.change(() => { startExponent += 20; setWindow(); rippleChartMount.draw(); updateCursor(); });
  }, { signal });
  play.addEventListener('click', () => {
    finishSlider();
    if (animation !== null) { stop(); return; }
    if (motionPreference.matches) {
      history.change(() => { if (currentPosition >= 6) { startExponent += 6; currentPosition = 0; setWindow(); rippleChartMount.draw(); } currentPosition = Math.min(6, currentPosition + .25); updateCursor(); });
      return;
    }
    beforePlayback = history.capture();
    if (currentPosition >= 6) currentPosition = 0;
    play.textContent = 'Pause ripple'; lastFrame = null;
    function tick(time) {
      if (lastFrame === null) lastFrame = time;
      currentPosition += Math.min(time - lastFrame, 100) / 1400;
      if (currentPosition >= 6) { currentPosition -= 6; startExponent += 6; setWindow(); rippleChartMount.draw(); }
      lastFrame = time; updateCursor(false); animation = environment.requestAnimationFrame(tick);
    }
    animation = environment.requestAnimationFrame(tick);
  }, { signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); }, { signal });
  motionPreference.addEventListener('change', stop, { signal });
  const visibility = environment.IntersectionObserver ? new environment.IntersectionObserver(entries => { if (!entries[0].isIntersecting) stop(); }) : null;
  visibility?.observe(widget);
  const disposePanels = initializeWidgetPanels(widget);
  magnify.disabled = slider.disabled = play.disabled = farther.disabled = false;
  play.textContent = playLabel(); view();
  return { read, dispose() { stop(); events.abort(); visibility?.disconnect(); disposePanels(); overviewChartMount.dispose(); rippleChartMount.dispose(); } };
}

export function initializeMagicianRoutes(widget, environment = globalThis) {
  const prefix = `mp-${++nextInstance}`;
  return mountChart(widget.querySelector('[data-routes]'), width => routesChart(width, `${prefix}-routes-clip`), undefined, environment);
}

export function mount(root) {
  const cleanups = [];
  for (const widget of root.querySelectorAll('[data-magician-game]')) { const controller = initializeMagicianGame(widget); cleanups.push(() => controller.dispose()); }
  for (const widget of root.querySelectorAll('[data-magician-probability]')) { const controller = initializeMagicianProbability(widget); cleanups.push(() => controller.dispose()); }
  for (const widget of root.querySelectorAll('[data-magician-routes]')) { const controller = initializeMagicianRoutes(widget); cleanups.push(() => controller.dispose()); }
  return () => cleanups.forEach(cleanup => cleanup());
}

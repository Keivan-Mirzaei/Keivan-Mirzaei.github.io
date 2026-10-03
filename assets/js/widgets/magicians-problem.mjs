import { bindPanelHistory, trackControlEdits } from '../lib/panel-history.mjs';
import { limitingProbability, differencePerMillion, seededRandom } from '../lib/magician-math.mjs';
import { overviewChart, rippleChart, routesChart, chartFrame, powerLabel } from '../lib/magician-charts.mjs';

function mountChart(container, markup, afterDraw = () => {}) {
  let previousWidth = 0;
  function draw(force = false) {
    const width = Math.round(container.getBoundingClientRect().width);
    if (!width || (!force && width === previousWidth)) return;
    previousWidth = width;
    container.innerHTML = markup(width);
    afterDraw(width);
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(container);
  else window.addEventListener('resize', () => draw());
  draw();
  return () => draw(true);
}

document.querySelectorAll('[data-magician-game]').forEach(widget => {
  const svg = widget.querySelector('svg');
  const holder = widget.querySelector('[data-audience]');
  const people = [...svg.querySelectorAll('[data-player]')];
  const flip = widget.querySelector('[data-flip]');
  const reset = widget.querySelector('[data-new-audience]');
  const roundLabel = widget.querySelector('[data-round]');
  const status = widget.querySelector('[data-game-status]');
  let seed = 42;
  let random;
  let alive;
  let round = 0;
  let previousWidth = 0;

  function count() { return alive.filter(Boolean).length; }

  function draw() {
    const width = holder.getBoundingClientRect().width;
    if (!width) return;
    const columns = width < 400 ? 8 : 16;
    const height = Math.ceil(64 / columns) * 22 + 12;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('height', height);
    people.forEach((person, index) => {
      person.setAttribute('cx', 12 + (width - 24) * (index % columns) / (columns - 1));
      person.setAttribute('cy', 14 + Math.floor(index / columns) * 22);
      person.setAttribute('class', `mp-person${alive[index] ? '' : ' is-out'}`);
    });
    const standing = count();
    svg.setAttribute('aria-label', `${standing} of 64 people remain standing after ${round} rounds. Filled dots stand; outlined dots have sat down.`);
    roundLabel.textContent = `Round ${round} · ${standing} standing`;
    flip.disabled = standing <= 1;
  }

  function start() {
    random = seededRandom(seed);
    alive = Array(64).fill(true);
    round = 0;
    status.textContent = 'Everyone is standing. Will this game reach exactly one?';
    draw();
  }

  function advance() {
    const heads = random() >= .5;
    alive = alive.map(standing => standing && (random() >= .5) === heads);
    round += 1;
    draw();
    const standing = count();
    const coin = heads ? 'Heads' : 'Tails';
    status.textContent = standing === 1 ? `${coin}. One person remains. This run succeeds!` : standing === 0 ? `${coin}. Everyone sat down. This run skipped over one survivor.` : `${coin}. ${standing} people remain. Each will make a fresh guess next round.`;
    }
  const history = bindPanelHistory(widget, {
    read: () => ({ seed, round }),
    restore: state => { seed = state.seed; start(); for (let i = 0; i < state.round; i++) advance(); },
    reset: () => { seed = 42; start(); }
  });
  flip.addEventListener('click', () => { history.remember(); advance(); });
  reset.addEventListener('click', () => { history.remember(); seed += 1; start(); });
  reset.disabled = false;
  start();
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      const width = holder.getBoundingClientRect().width;
      if (Math.abs(width - previousWidth) > .5) { previousWidth = width; draw(); }
    }).observe(holder);
  } else window.addEventListener('resize', draw);
});

document.querySelectorAll('[data-magician-probability]').forEach(widget => {
  const magnify = widget.querySelector('[data-magnify]');
  const detail = widget.querySelector('[data-magnified]');
  const plot = widget.querySelector('[data-ripple]');
  const slider = widget.querySelector('[data-position]');
  const play = widget.querySelector('[data-play-ripple]');
  const farther = widget.querySelector('[data-farther]');
  const status = widget.querySelector('[data-ripple-status]');
  const windowLabel = widget.querySelector('[data-window]');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let startExponent = 14;
  let currentPosition = 0;
  let animation = null;
  let lastFrame = 0;
  let frame;
  detail.hidden = true;

  function updateCursor(announce = true) {
    const position = Number(slider.value);
    currentPosition = position;
    const chance = limitingProbability(position);
    const deviation = differencePerMillion(chance);
    if (frame) {
      const x = frame.left + (frame.right - frame.left) * position / 6;
      const y = frame.bottom - (frame.bottom - frame.top) * (deviation + 8) / 16;
      const marker = plot.querySelector('[data-marker]');
      const guide = plot.querySelector('[data-guide]');
      marker.setAttribute('cx', x);
      marker.setAttribute('cy', y);
      guide.setAttribute('x1', x);
      guide.setAttribute('x2', x);
    }
    status.setAttribute('aria-live', announce ? 'polite' : 'off');
    status.textContent = `Chance: ${(chance * 100).toFixed(7)}%. Difference from the average: ${deviation >= 0 ? '+' : '−'}${Math.abs(deviation).toFixed(2)} in a million.`;
  }

  function playLabel() {
    return motionPreference.matches ? 'Next quarter of a cycle' : Number(slider.value) >= 6 ? 'Replay ripple' : 'Follow the ripple';
  }

  function stop(announce = true) {
    if (animation !== null) cancelAnimationFrame(animation);
    animation = null;
    play.textContent = playLabel();
    if (announce) updateCursor();
  }

  function setWindow() {
    windowLabel.textContent = `From ${powerLabel(startExponent)} to ${powerLabel(startExponent + 6)} people`;
  }

  mountChart(widget.querySelector('[data-overview]'), overviewChart);
  const redrawRipple = mountChart(plot, width => rippleChart(width, startExponent), width => {
    frame = chartFrame(width);
    updateCursor(false);
  });

  const history = bindPanelHistory(widget, {
    read: () => ({ startExponent, position: currentPosition, hidden: detail.hidden }),
    restore: state => {
      stop(false); startExponent = state.startExponent; slider.value = state.position;
      detail.hidden = state.hidden; magnify.setAttribute('aria-expanded', String(!detail.hidden));
      magnify.textContent = detail.hidden ? 'Magnify the ripple' : 'Hide the magnification';
      setWindow(); redrawRipple(); updateCursor(); play.textContent = playLabel();
    },
    reset: () => { stop(false); startExponent = 14; slider.value = 0; setWindow(); redrawRipple(); updateCursor(); }
  });
  trackControlEdits([slider], history);
  magnify.addEventListener('click', () => {
    history.remember();
    stop(false);
    detail.hidden = !detail.hidden;
    magnify.setAttribute('aria-expanded', String(!detail.hidden));
    magnify.textContent = detail.hidden ? 'Magnify the ripple' : 'Hide the magnification';
    if (!detail.hidden) { redrawRipple(); updateCursor(); }
  });

  slider.addEventListener('input', () => { stop(false); updateCursor(); });
  farther.addEventListener('click', () => {
    history.remember();
    stop(false);
    startExponent += 20;
    setWindow();
    redrawRipple();
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'Twenty more doublings: the audience is over a million times larger, and the limiting ripple has the same height.';
  });

  play.addEventListener('click', () => {
    if (animation === null) history.remember();
    if (motionPreference.matches) {
      if (Number(slider.value) >= 6) {
        startExponent += 6;
        setWindow();
        redrawRipple();
        slider.value = .25;
      } else slider.value = Math.min(6, Number(slider.value) + .25);
      updateCursor();
      return;
    }
    if (animation !== null) { stop(); return; }
    if (Number(slider.value) >= 6) slider.value = 0;
    let playbackPosition = Number(slider.value);
    play.textContent = 'Pause ripple';
    lastFrame = 0;
    function tick(time) {
      if (!lastFrame) lastFrame = time;
      playbackPosition += Math.min(time - lastFrame, 100) / 1400;
      if (playbackPosition >= 6) {
        playbackPosition -= 6;
        startExponent += 6;
        setWindow();
        redrawRipple();
      }
      slider.value = playbackPosition;
      lastFrame = time;
      updateCursor(false);
      animation = requestAnimationFrame(tick);
    }
    animation = requestAnimationFrame(tick);
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(false); });
  motionPreference.addEventListener('change', () => stop());
  magnify.disabled = slider.disabled = play.disabled = farther.disabled = false;
  play.textContent = playLabel();
});

document.querySelectorAll('[data-magician-routes]').forEach(widget => {
  mountChart(widget.querySelector('[data-routes]'), routesChart);
});

import { createPageEnvironment } from '../lib/page-environment.mjs';
import { initializePuzzleList } from '../lib/puzzle-list.mjs';
import { createPuzzleStorage } from '../lib/puzzle-storage.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';
import { initializeProgressReset } from '../lib/widget-progress.mjs';
import { createOddCoinWorkspace, ODD_COIN_LEVELS, pansFor } from '../lib/odd-coin-book.mjs';
import { outcomeName, stateName, validWeighing, suggestWeighing, minimumWeighings } from '../lib/odd-coin-math.mjs';

let instance = 0;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const coinList = coins => coins.join(', ');
const entryMarkup = entry => `<li>${coinList(entry.left)} <span aria-label="against">vs</span> ${coinList(entry.right)} — <strong>${outcomeName(entry.outcome)}</strong></li>`;

export function initializeOddCoin(root, { storage = createPuzzleStorage('one-odd-coin', root), catalogue } = {}) {
  const owner = root.ownerDocument, view = owner.defaultView, get = name => root.querySelector(`[data-oc-${name}]`);
  const play = createOddCoinWorkspace(storage.read(), catalogue), events = new AbortController();
  const puzzleList = initializePuzzleList(root, { prefix: 'oc', read: () => ({ difficulty: play.difficulty, number: play.number, total: play.total, result: number => play.puzzleResult(number) }), select: number => change(() => play.open(number)), unit: 'weighing' });
  const listen = (element, type, callback) => element.addEventListener(type, callback, { signal: events.signal });
  const disposePanels = initializeWidgetPanels(root);
  let selection = new Set(), drag = null, suppressClickUntil = 0, scrollFrame = 0, dragFrame = 0, labelFrame = 0, noteOpen = false;
  const animations = new Set(), weighingAnimations = new Set();
  const prefix = `odd-coin-${++instance}`;
  get('label-panel').id = `${prefix}-labels`;
  get('note-entry').id = `${prefix}-note`;
  get('note-toggle').setAttribute('aria-controls', get('note-entry').id);
  get('difficulty').id = `${prefix}-difficulty`;
  get('difficulty-name').setAttribute('for', get('difficulty').id);
  get('difficulty-label').setAttribute('for', get('difficulty').id);
  storage.setSnapshotProvider(() => play.exportState());
  const setText = (name, value) => { if (get(name).textContent !== value) get(name).textContent = value; };
  const reducedMotion = () => view.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(element, frames, options) {
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  }

  function positionLabels() {
    labelFrame = 0;
    const panel = get('label-panel');
    if (panel.hidden || !selection.size || drag?.active) return;
    const coins = [...selection].map(coin => root.querySelector(`[data-oc-coin="${coin}"]`)?.getBoundingClientRect()).filter(Boolean);
    if (!coins.length) return;
    const bounds = get('workbench').getBoundingClientRect(), box = panel.getBoundingClientRect();
    const anchor = { top: Math.min(...coins.map(coin => coin.top)), bottom: Math.max(...coins.map(coin => coin.bottom)),
      x: (Math.min(...coins.map(coin => coin.left)) + Math.max(...coins.map(coin => coin.right))) / 2 };
    const viewport = view.visualViewport, visibleTop = viewport?.offsetTop || 0;
    const ceiling = Math.max(visibleTop + 8, (owner.querySelector('.topbar')?.getBoundingClientRect().bottom || 0) + 8);
    const floor = visibleTop + (viewport?.height || view.innerHeight) - 8;
    const left = Math.max(bounds.left + 6, Math.min(bounds.right - box.width - 6, anchor.x - box.width / 2));
    let top = anchor.top - box.height - 12;
    const below = top < ceiling && anchor.bottom + 12 + box.height <= floor;
    if (below) top = anchor.bottom + 12;
    panel.dataset.placement = below ? 'below' : 'above';
    panel.style.left = `${left - bounds.left}px`; panel.style.top = `${top - bounds.top}px`;
    panel.style.setProperty('--oc-label-arrow', `${Math.max(16, Math.min(box.width - 16, anchor.x - left))}px`);
    if (animations.size) queueLabels();
  }
  function queueLabels() {
    if (!labelFrame) labelFrame = view.requestAnimationFrame(positionLabels);
  }
  listen(view, 'scroll', queueLabels); listen(view, 'resize', queueLabels);
  if (view.visualViewport) { listen(view.visualViewport, 'resize', queueLabels); listen(view.visualViewport, 'scroll', queueLabels); }
  const labelObserver = new view.ResizeObserver(queueLabels);
  labelObserver.observe(get('label-panel')); labelObserver.observe(root);

  function render(message = '') {
    const puzzle = play.puzzle, level = ODD_COIN_LEVELS[play.difficulty], terminal = play.solved;
    const values = play.placements, { left, right } = pansFor(values), labels = play.labels;
    const valid = validWeighing(puzzle.coins, left, right), result = play.result, log = play.log;
    const focused = owner.activeElement?.dataset.ocCoin;
    selection = new Set([...selection].filter(coin => coin <= puzzle.coins));
    if (terminal) selection.clear();
    root.dataset.solved = String(terminal); root.dataset.selection = String(!!selection.size);
    const capacity = get('tray-space');
    if (capacity.childElementCount !== puzzle.coins) capacity.replaceChildren(...Array.from({ length: puzzle.coins }, () => {
      const slot = owner.createElement('span'); slot.className = 'oc-coin-slot'; return slot;
    }));
    setText('rule', `${puzzle.coins} coins · one ${puzzle.kind === 'unknown' ? 'heavier or lighter' : puzzle.kind === 'heavy' ? 'heavier' : 'lighter'}`);
    get('clues').hidden = !puzzle.genuine.length && !puzzle.evidence.length;
    get('genuine').hidden = !puzzle.genuine.length;
    setText('genuine', `Genuine: ${coinList(puzzle.genuine)}`);
    get('evidence-details').hidden = !puzzle.evidence.length;
    get('evidence').innerHTML = puzzle.evidence.map(entryMarkup).join('');
    const reply = terminal ? `Correct. ${stateName(play.answer)}.`
        : result ? `${outcomeName(result.outcome)}.`
          : valid ? 'Ready to weigh.' : left.length || right.length ? 'Put the same number of coins on each pan.'
            : !log.length && puzzle.evidence.length ? 'See the given weighings below.'
              : `Find the ${puzzle.kind === 'unknown' ? 'heavier or lighter' : puzzle.kind === 'heavy' ? 'heavier' : 'lighter'} coin.`;
    setText('status', `${plural(play.used, 'weighing')} · Minimum ${play.minimum} · ${message || reply}`);
    get('scale').dataset.outcome = String(result?.outcome || 0);
    const wrappers = new Map([...root.querySelectorAll('[data-oc-wrap]')].map(node => [Number(node.dataset.ocWrap), node]));
    for (let coin = 1; coin <= puzzle.coins; coin++) {
      let wrap = wrappers.get(coin);
      if (!wrap) {
        wrap = owner.createElement('span'); wrap.className = 'oc-coin-wrap'; wrap.dataset.ocWrap = String(coin);
        wrap.innerHTML = '<button type="button" class="oc-coin"><span class="oc-coin-number"></span><span class="oc-coin-mark" aria-hidden="true"></span></button><span class="oc-coin-note"></span>';
        wrappers.set(coin, wrap);
      }
      const button = wrap.querySelector('button'), genuine = puzzle.genuine.includes(coin), answer = terminal && play.answer[0] === coin;
      const label = labels[coin] || {}, mark = genuine ? 0 : label.mark;
      button.className = `oc-coin${genuine ? ' is-genuine' : ''}${answer ? ' is-answer' : ''}`;
      button.dataset.ocCoin = String(coin); button.dataset.mark = mark == null ? '' : String(mark);
      button.title = values[coin - 1] === 0 ? 'Click to label or validate · Shift-click to select a group' : 'Click to label · Double-click to return to the shelf';
      button.tabIndex = String(coin) === (focused || '1') ? 0 : -1; button.disabled = terminal;
      button.setAttribute('aria-pressed', String(selection.has(coin)));
      button.setAttribute('aria-controls', get('label-panel').id);
      button.setAttribute('aria-expanded', String(selection.has(coin)));
      const location = values[coin - 1] === 0 ? 'on shelf' : values[coin - 1] === 1 ? 'on left pan' : 'on right pan';
      const thought = mark === 1 ? 'marked heavy' : mark === -1 ? 'marked light' : mark === 0 && !genuine ? 'marked genuine' : '';
      button.setAttribute('aria-label', [`Coin ${coin}`, genuine ? 'known genuine' : '', answer ? 'the odd coin' : '', thought, label.text || '', location].filter(Boolean).join(', '));
      wrap.querySelector('.oc-coin-number').textContent = String(coin);
      const badge = wrap.querySelector('.oc-coin-mark'); badge.textContent = mark === 1 ? '↑' : mark === -1 ? '↓' : mark === 0 ? '✓' : ''; badge.hidden = mark == null;
      const note = wrap.querySelector('.oc-coin-note'); note.textContent = label.text || ''; note.title = label.text || ''; note.hidden = !label.text;
    }
    for (const [name, zone] of [['left', 1], ['right', -1], ['tray', 0]]) {
      const coins = values.flatMap((value, i) => value === zone ? [i + 1] : []), container = get(name);
      setText(`${name}-count`, `${zone === 0 ? '· ' : ''}${plural(coins.length, 'coin')}`);
      if (zone !== 0) get(`${name}-count`).hidden = !coins.length;
      const wanted = coins.map(coin => wrappers.get(coin));
      wanted.forEach((node, i) => { if (container.children[i] !== node) container.insertBefore(node, container.children[i] || null); });
      for (const child of [...container.children]) if (!wanted.includes(child)) child.remove();
    }
    if (focused && !terminal && owner.activeElement?.dataset.ocCoin !== focused) root.querySelector(`[data-oc-coin="${focused}"]`)?.focus({ preventScroll: true });
    root.querySelectorAll('[data-oc-place]').forEach(button => {
      button.disabled = terminal;
      if (button.dataset.ocPlace === '0') button.hidden = ![...selection].some(coin => values[coin - 1] !== 0);
    });
    get('label-panel').hidden = !selection.size || terminal;
    const selected = [...selection], only = selected.length === 1 ? selected[0] : null;
    const selectedWeight = only && (puzzle.kind === 'heavy' ? 1 : puzzle.kind === 'light' ? -1 : labels[only]?.mark);
    setText('selection-count', only ? `Coin ${only}${[-1, 1].includes(selectedWeight) ? ` · ${selectedWeight === 1 ? 'heavier' : 'lighter'}` : ''}`
      : selected.length ? `${plural(selected.length, 'coin')} selected` : 'Select a coin');
    get('dismiss-selection').hidden = !selected.length;
    root.querySelectorAll('[data-oc-mark]').forEach(button => {
      const mark = Number(button.dataset.ocMark);
      button.disabled = !selected.length || terminal || selected.every(coin => puzzle.genuine.includes(coin));
      button.setAttribute('aria-pressed', String(!!selected.length && selected.every(coin => (puzzle.genuine.includes(coin) ? 0 : labels[coin]?.mark ?? null) === mark)));
    });
    const texts = [...new Set([...selection].map(coin => labels[coin]?.text || ''))];
    if (owner.activeElement !== get('note-text')) get('note-text').value = texts.length === 1 ? texts[0] : '';
    if (!selection.size) noteOpen = false;
    get('note-toggle').disabled = !selection.size || terminal;
    get('note-toggle').setAttribute('aria-expanded', String(noteOpen)); get('note-entry').hidden = !noteOpen;
    get('weigh').hidden = get('clear').hidden = get('validate').hidden = terminal;
    get('weigh').disabled = !valid || terminal;
    get('clear').disabled = !values.some(Boolean) || terminal;
    get('validate').disabled = terminal;
    get('validate').title = only ? `Validate coin ${only}${[-1, 1].includes(selectedWeight) ? ` as ${selectedWeight === 1 ? 'heavier' : 'lighter'}` : ''}` : 'Select the odd coin, then validate';
    get('replay').hidden = !terminal;
    get('next').disabled = !play.canAdvance; get('replay').disabled = !terminal;
    setText('replay', play.used > play.minimum ? `Try in ${play.minimum}` : 'Replay');
    get('history').hidden = !log.length && !puzzle.evidence.length && !puzzle.genuine.length;
    get('log').innerHTML = log.map(entryMarkup).join('');
    setText('log-count', log.length + puzzle.evidence.length ? `(${log.length + puzzle.evidence.length})` : '');
    get('undo').disabled = !play.canUndo; get('redo').disabled = !play.canRedo;
    get('reset').disabled = !log.length && !values.some(Boolean) && !Object.keys(labels).length;
    get('hint').disabled = terminal;
    get('difficulty').value = String(play.difficulty + 1); setText('difficulty-label', level.name); setText('level-detail', level.detail);
    root.querySelector('[data-widget-progress-scope]').textContent = level.name;
    puzzleList.render();
    setText('completed', `${play.completedCount} / ${play.total} ${level.name} puzzles solved`);
    queueLabels();
    storage.save(play.exportState());
  }

  function motionElements() {
    return [...root.querySelectorAll('[data-oc-wrap], .oc-column, .oc-pedestal, .oc-scale-weigh, .oc-pan-bowl, .oc-suspension, .oc-tray-art, .oc-tray-heading, .oc-weigh-actions, .oc-history')];
  }
  function change(action, message = '', motion = false, origin = null, keepSelection = false) {
    // Capture the visible position before cancelling an interrupted animation.
    const before = motion && !reducedMotion() ? new Map(motionElements().map(element => [element, element.getBoundingClientRect()])) : null;
    const previousPuzzle = `${play.difficulty}:${play.number}`;
    if (!action()) return false;
    if (motion || previousPuzzle !== `${play.difficulty}:${play.number}`) {
      animations.forEach(animation => animation.cancel()); animations.clear();
    }
    if (!keepSelection) { selection.clear(); noteOpen = false; } render(message);
    if (before) for (const element of motionElements()) {
      const old = before.get(element), number = Number(element.dataset.ocWrap);
      const from = origin?.coins.includes(number) ? origin : old, to = element.getBoundingClientRect();
      if (!from || !to.width || !to.height || (old && (!old.width || !old.height))) continue;
      const x = from.left - to.left, y = from.top - to.top;
      const surface = !number && !element.matches('.oc-pan-bowl, .oc-tray-art');
      const sx = surface ? from.width / to.width : 1, sy = surface ? from.height / to.height : 1;
      if (Math.abs(x) + Math.abs(y) < 1 && Math.abs(sx - 1) + Math.abs(sy - 1) < .01) continue;
      animate(element, [
        { transformOrigin: '0 0', transform: `translate3d(${x}px, ${y}px, 0) scale(${sx}, ${sy})` },
        { transformOrigin: '0 0', transform: 'translate3d(0, 0, 0) scale(1, 1)' }
      ], { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
    return true;
  }
  function animateWeighing() {
    if (reducedMotion()) return;
    const outcome = play.result.outcome, left = root.querySelector('[data-oc-zone="1"]'), right = root.querySelector('[data-oc-zone="-1"]');
    const l = left.getBoundingClientRect(), r = right.getBoundingClientRect();
    const distance = ((r.left + r.width / 2) - (l.left + l.width / 2)) / 2 * Math.sin(4 * Math.PI / 180);
    const spring = t => 1 - Math.exp(-7 * t) * (Math.cos(10 * t) + .7 * Math.sin(10 * t));
    const settled = spring(1);
    function frames(element, target, rotation = false) {
      const transform = view.getComputedStyle(element).transform;
      const matrix = new view.DOMMatrixReadOnly(transform === 'none' ? undefined : transform);
      const start = rotation ? Math.atan2(matrix.b, matrix.a) * 180 / Math.PI : matrix.m42;
      // Ease the previous pose back to level, then replay the full weighing motion.
      return Array.from({ length: 76 }, (_, i) => {
        const offset = i / 75, t = Math.max(0, (offset - .12) / .88), progress = spring(t) / settled;
        const sway = outcome ? 0 : Math.sin(3 * Math.PI * t) * Math.exp(-5 * t) * (rotation ? 1.25 : distance * .3);
        const value = offset < .12 ? start * (1 + Math.cos(Math.PI * offset / .12)) / 2 : target * progress + sway;
        return { offset, transform: rotation ? `rotate(${value}deg)` : `translateY(${value}px)` };
      });
    }
    const motions = [[get('beam'), frames(get('beam'), -4 * outcome, true)], [left, frames(left, distance * outcome)], [right, frames(right, -distance * outcome)]];
    weighingAnimations.forEach(animation => animation.cancel()); weighingAnimations.clear();
    for (const [element, keyframes] of motions) {
      const animation = animate(element, keyframes, { duration: 1500, easing: 'linear' });
      weighingAnimations.add(animation); animation.finished.then(() => weighingAnimations.delete(animation), () => weighingAnimations.delete(animation));
    }
  }
  function focusCoin(coin) {
    root.querySelectorAll('[data-oc-coin]').forEach(button => { button.tabIndex = Number(button.dataset.ocCoin) === coin ? 0 : -1; });
    root.querySelector(`[data-oc-coin="${coin}"]`)?.focus({ preventScroll: true });
  }
  function moveSelected(destination) {
    if (!selection.size) { render('Select coins first, or drag them onto the scale.'); return; }
    const coins = [...selection];
    if (change(() => play.moveCoins(coins, destination), '', true)) focusCoin(coins[0]);
    else render('Those coins are already there. Choose the other pan or return them to the shelf.');
  }
  listen(root, 'click', event => {
    if (event.detail && Date.now() < suppressClickUntil) return;
    const coin = event.target.closest('[data-oc-coin]') || event.target.closest('[data-oc-wrap]')?.querySelector('[data-oc-coin]');
    if (coin && !coin.disabled) {
      const number = Number(coin.dataset.ocCoin);
      if (event.detail > 1 && play.placements[number - 1] !== 0) return;
      noteOpen = false;
      if (event.shiftKey || event.metaKey || event.ctrlKey) {
        if (selection.has(number)) selection.delete(number); else selection.add(number);
      } else selection = selection.size === 1 && selection.has(number) ? new Set() : new Set([number]);
      render(); focusCoin(number); return;
    }
    const target = event.target.closest('[data-oc-place]');
    if (target && !target.disabled) { moveSelected(Number(target.dataset.ocPlace)); return; }
    const zone = event.target.closest('[data-oc-zone]');
    if (zone && selection.size) moveSelected(Number(zone.dataset.ocZone));
  });
  listen(root, 'dblclick', event => {
    const coin = event.target.closest('[data-oc-coin]');
    if (!coin || coin.disabled || Date.now() < suppressClickUntil) return;
    const number = Number(coin.dataset.ocCoin);
    if (play.placements[number - 1] === 0) return;
    event.preventDefault();
    if (change(() => play.moveCoins([number], 0), '', true)) focusCoin(number);
  });
  listen(root, 'keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && root.querySelector('[data-widget-panel-trigger][aria-expanded="true"]')) return;
    if (event.key === 'Escape' && drag) { event.preventDefault(); suppressClickUntil = Date.now() + 250; finishDrag(); return; }
    if (event.key === 'Escape' && selection.size) {
      event.preventDefault(); const coin = [...selection].at(-1); selection.clear(); render(); focusCoin(coin); return;
    }
    const coin = event.target.closest('[data-oc-coin]');
    if (!coin || coin.disabled) return;
    root.dataset.input = 'keyboard';
    const number = Number(coin.dataset.ocCoin), key = event.key.toLowerCase();
    if (event.key === 'Tab' && !event.shiftKey && selection.has(number)) {
      const control = get('label-panel').querySelector('[data-oc-mark]:not(:disabled)') || get('note-toggle');
      if (control) { event.preventDefault(); control.focus({ preventScroll: true }); }
    } else if (['l', 'r', 't'].includes(key)) {
      event.preventDefault();
      const coins = selection.has(number) ? [...selection] : [number];
      change(() => play.moveCoins(coins, { l: 1, r: -1, t: 0 }[key]), '', true); focusCoin(number);
    } else if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      focusCoin(event.key === 'Home' ? 1 : event.key === 'End' ? play.puzzle.coins : (number - 1 + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + play.puzzle.coins) % play.puzzle.coins + 1);
    }
  });
  listen(get('weigh'), 'click', () => {
    if (!change(() => play.weigh())) return;
    animateWeighing();
  });
  listen(get('clear'), 'click', () => { if (change(() => play.clearPans(), '', true)) focusCoin(1); });
  listen(get('hint'), 'click', () => {
    const hint = suggestWeighing(play.puzzle.coins, play.states, minimumWeighings(play.puzzle.coins, play.states));
    if (!hint) { render('You have enough evidence. Select the odd coin and Validate.'); return; }
    const message = 'Suggested comparison arranged.';
    if (!change(() => play.arrange(hint.left, hint.right), message, true)) render(message);
  });
  listen(get('validate'), 'click', () => {
    if (selection.size !== 1) { render('Select the one coin you think is odd, then Validate.'); return; }
    const coin = [...selection][0], weight = play.puzzle.kind === 'heavy' ? 1 : play.puzzle.kind === 'light' ? -1 : play.labels[coin]?.mark;
    if (play.puzzle.genuine.includes(coin)) { render(`Coin ${coin} is given as genuine. Select another coin.`); return; }
    if (![-1, 1].includes(weight)) { render(`Is coin ${coin} heavier or lighter? Choose its weight label, then Validate.`); return; }
    const result = play.submitAnswer([coin, weight]);
    if (!result.ok) {
      render(result.reason === 'uncertain' ? 'That answer is possible, but another answer still fits. Keep weighing.'
        : result.reason === 'contradicted' ? 'That does not fit the evidence. Try again.' : 'Choose a possible odd coin and its weight.');
      return;
    }
    selection.clear(); noteOpen = false; render();
    if (!reducedMotion()) { const coin = root.querySelector('.is-answer'); if (coin) animate(coin, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 650, easing: 'ease-in-out' }); }
    (get('next').disabled ? get('undo') : get('next')).focus({ preventScroll: true });
  });
  root.querySelectorAll('[data-oc-mark]').forEach(button => listen(button, 'click', () => {
    const mark = button.getAttribute('aria-pressed') === 'true' ? null : Number(button.dataset.ocMark);
    change(() => play.labelCoins([...selection], { mark }), '', false, null, true);
  }));
  listen(get('note-toggle'), 'click', () => {
    noteOpen = !noteOpen; render(); if (noteOpen) get('note-text').focus({ preventScroll: true });
  });
  listen(get('label-panel'), 'submit', event => {
    event.preventDefault();
    play.labelCoins([...selection], { text: get('note-text').value }); noteOpen = false; render(); get('note-toggle').focus({ preventScroll: true });
  });
  listen(get('dismiss-selection'), 'click', () => { const coin = [...selection][0]; selection.clear(); render(); if (coin) focusCoin(coin); });
  listen(get('undo'), 'click', () => change(() => play.undo(), 'Action undone.', true));
  listen(get('redo'), 'click', () => change(() => play.redo(), 'Action restored.', true));
  function restart() {
    change(() => play.reset(), '', true);
  }
  listen(get('reset'), 'click', restart);
  listen(get('replay'), 'click', restart);
  listen(get('next'), 'click', () => change(() => play.next()));
  listen(get('difficulty'), 'change', () => change(() => play.changeDifficulty(Number(get('difficulty').value) - 1)));
  const disposeProgress = initializeProgressReset(root, () => { play.resetProgress(); selection.clear(); render(`${ODD_COIN_LEVELS[play.difficulty].name} progress reset.`); });

  function finishDrag() {
    if (!drag) return;
    const finished = drag; drag = null;
    if (scrollFrame) view.cancelAnimationFrame(scrollFrame);
    if (dragFrame) view.cancelAnimationFrame(dragFrame);
    scrollFrame = dragFrame = 0; root.dataset.dragging = 'false';
    finished.ghost?.remove();
    root.querySelectorAll('.is-dragging').forEach(coin => coin.classList.remove('is-dragging'));
    if (root.hasPointerCapture?.(finished.id)) root.releasePointerCapture(finished.id);
    root.querySelectorAll('[data-oc-zone]').forEach(zone => zone.classList.remove('is-drop'));
    queueLabels();
  }
  function highlightDrop() {
    if (!drag?.active) return;
    const target = owner.elementFromPoint(drag.clientX, drag.clientY)?.closest('[data-oc-zone]');
    root.querySelectorAll('[data-oc-zone]').forEach(zone => zone.classList.toggle('is-drop', target === zone));
  }
  function scrollWhileDragging() {
    scrollFrame = 0;
    if (!drag?.active) return;
    const edge = 56, y = drag.clientY, height = view.innerHeight;
    const speed = y < edge ? -Math.ceil(13 * Math.min(1, (edge - y) / edge))
      : y > height - edge ? Math.ceil(13 * Math.min(1, (y - height + edge) / edge)) : 0;
    const limit = Math.max(0, owner.documentElement.scrollHeight - height);
    const next = Math.max(0, Math.min(limit, view.scrollY + speed));
    if (next === view.scrollY || !speed) return;
    view.scrollTo({ top: next, behavior: 'instant' }); highlightDrop();
    scrollFrame = view.requestAnimationFrame(scrollWhileDragging);
  }
  listen(root, 'pointerdown', event => {
    root.dataset.input = 'pointer';
    const button = event.target.closest('[data-oc-coin]');
    if (!button || button.disabled || event.button !== 0 || !event.isPrimary) return;
    const coin = Number(button.dataset.ocCoin);
    const rect = button.getBoundingClientRect();
    drag = { id: event.pointerId, coins: selection.has(coin) ? [...selection] : [coin], x: event.clientX, y: event.clientY,
      offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, size: rect.width, active: false };
  });
  function drawDrag() {
    dragFrame = 0;
    if (!drag?.active) return;
    drag.ghost.style.transform = `translate3d(${drag.clientX - drag.offsetX}px, ${drag.clientY - drag.offsetY}px, 0)${reducedMotion() ? '' : ' scale(1.035) rotate(-2deg)'}`;
    highlightDrop();
  }
  listen(owner, 'pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
    event.preventDefault();
    const starting = !drag.active;
    if (starting) {
      drag.active = true; root.dataset.dragging = 'true'; root.setPointerCapture?.(drag.id);
      for (const coin of drag.coins) root.querySelector(`[data-oc-coin="${coin}"]`)?.classList.add('is-dragging');
      drag.ghost = owner.createElement('span'); drag.ghost.className = 'oc-coin oc-drag-coin';
      if (drag.coins.every(coin => play.puzzle.genuine.includes(coin))) drag.ghost.classList.add('is-genuine');
      const labels = play.labels, marks = drag.coins.map(coin => play.puzzle.genuine.includes(coin) ? 0 : labels[coin]?.mark ?? null);
      if (marks[0] !== null && marks.every(mark => mark === marks[0])) drag.ghost.dataset.mark = String(marks[0]);
      drag.ghost.textContent = String(drag.coins[0]);
      if (drag.coins.length > 1) {
        const count = owner.createElement('span'); count.className = 'oc-drag-count'; count.textContent = `×${drag.coins.length}`;
        drag.ghost.append(count);
      }
      drag.ghost.style.width = drag.ghost.style.height = `${drag.size}px`;
      drag.ghost.style.fontSize = `${Math.max(14, drag.size * .45)}px`;
      drag.ghost.style.transformOrigin = `${drag.offsetX}px ${drag.offsetY}px`;
      drag.ghost.setAttribute('aria-hidden', 'true'); owner.body.append(drag.ghost);
    }
    drag.clientX = event.clientX; drag.clientY = event.clientY;
    if (starting) drawDrag();
    else if (!dragFrame) dragFrame = view.requestAnimationFrame(drawDrag);
    if (!scrollFrame) scrollFrame = view.requestAnimationFrame(scrollWhileDragging);
  });
  listen(owner, 'pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const active = drag.active, coins = drag.coins;
    const ghost = drag.ghost?.getBoundingClientRect();
    const origin = { coins, left: ghost?.left ?? event.clientX - drag.offsetX, top: ghost?.top ?? event.clientY - drag.offsetY };
    const target = owner.elementFromPoint(event.clientX, event.clientY)?.closest('[data-oc-zone]');
    finishDrag(); if (!active) return;
    suppressClickUntil = Date.now() + 250;
    if (target && root.contains(target)) change(() => play.moveCoins(coins, Number(target.dataset.ocZone)), '', true, origin);
    focusCoin(coins[0]);
  });
  listen(owner, 'pointercancel', event => { if (drag?.id === event.pointerId) { suppressClickUntil = Date.now() + 250; finishDrag(); } });
  listen(root, 'lostpointercapture', () => finishDrag());
  listen(owner, 'keydown', event => { if (event.key === 'Escape' && drag) { event.preventDefault(); suppressClickUntil = Date.now() + 250; finishDrag(); } });
  get('difficulty').disabled = false;
  render();
  return { workspace: play, render, destroy() { finishDrag(); if (labelFrame) view.cancelAnimationFrame(labelFrame); labelObserver.disconnect(); animations.forEach(animation => animation.cancel()); animations.clear(); puzzleList.destroy(); events.abort(); disposeProgress(); disposePanels(); } };
}

export function mount(root) {
  const environment = createPageEnvironment(root), cleanups = [];
  for (const widget of root.querySelectorAll('[data-odd-coin]')) {
    const controller = initializeOddCoin(widget, { storage: createPuzzleStorage('one-odd-coin', widget, environment.window) });
    cleanups.push(() => controller.destroy());
  }
  return () => { cleanups.forEach(cleanup => cleanup()); environment.dispose(); };
}

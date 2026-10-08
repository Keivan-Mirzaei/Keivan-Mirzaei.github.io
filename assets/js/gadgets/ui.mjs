import { remaining, formatTime, formatExamTime, examTone, timerInBar, timerLabel, rulesMarkup } from './model.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';
import { createCountdown } from './countdown.mjs';

export const soundLabel = source => source === 'soft' ? 'Soft noise' : 'Brown noise';
export function awakeLabel(state) {
  if (!state.timer?.config.awake) return '';
  return ({ active: 'Screen awake is active.', requesting: 'Requesting screen awake…', unavailable: 'Keeping the screen awake is unavailable in this browser.', denied: 'The browser declined screen awake. Your timer still works.', released: 'Screen awake was released by the browser. Turn the option off and on to retry.', hidden: 'Screen awake is paused while this page is hidden.', off: 'Screen awake is off while the timer is paused or finished.' })[state.wakeStatus] || '';
}
function text(element, value) { if (element && element.textContent !== value) element.textContent = value; }
export function mountDock(service) {
  const dock = document.querySelector('[data-gadget-dock]'), controls = document.querySelector('[data-gadget-controls]');
  const get = name => document.querySelector(`[data-${name}]`), base = dock.dataset.gadgetsUrl;
  let previousTransition = '';
  function panel(open, restore = false) {
    controls.hidden = !open;
    document.documentElement.style.setProperty('--gadget-controls-height', `${open ? controls.getBoundingClientRect().height : 0}px`);
    dock.querySelector('[data-gadget-action="controls"]').setAttribute('aria-expanded', String(open));
    if (restore) dock.querySelector('[data-gadget-action="controls"]').focus({ preventScroll: true });
  }
  const size = new ResizeObserver(() => { if (!controls.hidden) document.documentElement.style.setProperty('--gadget-controls-height', `${controls.getBoundingClientRect().height}px`); });
  size.observe(controls);
  function icon(button, paused, label) {
    button.setAttribute('aria-label', label);
    const type = paused ? 'play' : 'pause';
    if (button.dataset.icon !== type) { button.dataset.icon = type; button.replaceChildren(document.querySelector(`[data-gadget-icon-${type}]`).content.cloneNode(true)); }
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-gadget-action]');
    if (!trigger) return;
    const state = service.getState();
    switch (trigger.dataset.gadgetAction) {
      case 'controls': panel(controls.hidden); break;
      case 'controls-close': panel(false, true); break;
      case 'timer-toggle': state.timer?.status === 'running' ? service.pause() : state.timer?.status === 'paused' ? service.resume() : state.timer?.kind === 'pomodoro' ? service.next() : service.restart(); break;
      case 'timer-stop': service.stop(); break;
      case 'sound-toggle': state.sound?.playing ? service.pauseSound() : service.playSound(); break;
      case 'sound-stop': service.stopSound(); break;
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !event.defaultPrevented && !controls.hidden) { event.preventDefault(); panel(false, true); }
  });
  get('gadget-volume').addEventListener('input', event => service.volume(Number(event.target.value)));
  service.subscribe(state => {
    const showTimer = timerInBar(state.timer);
    dock.hidden = !showTimer && !state.sound;
    if (dock.hidden) panel(false);
    get('dock-timer').hidden = get('control-timer').hidden = !showTimer;
    get('dock-sound').hidden = get('control-sound').hidden = !state.sound;
    if (state.timer) {
      const timer = state.timer, label = timerLabel(timer), time = formatTime(remaining(timer)), url = `${base}${timer.kind === 'exam' ? 'exam' : 'pomodoro'}/`;
      const action = timer.status === 'running' ? 'Pause' : timer.status === 'paused' ? 'Resume' : timer.kind === 'exam' ? 'Restart' : timer.phase === 'focus' ? 'Start break' : 'Start focus';
      text(get('dock-label'), label); text(get('control-label'), label); text(get('dock-time'), time); text(get('control-time'), time);
      get('dock-timer-link').href = get('control-timer-link').href = url;
      get('dock-timer-link').setAttribute('aria-label', `${label} ${time}, ${timer.status}`);
      get('dock-timer-link').dataset.paused = String(timer.status !== 'running');
      text(get('dock-state'), ` ${timer.status}`); text(get('control-state'), timer.status === 'complete' ? 'Time is up' : timer.status === 'paused' ? 'Paused' : 'Running');
      text(get('control-toggle'), action); icon(get('dock-pause'), timer.status !== 'running', `${action} ${label.toLowerCase()} timer`);
    }
    if (state.sound) {
      text(get('dock-sound-label'), soundLabel(state.sound.source)); text(get('control-sound-label'), soundLabel(state.sound.source));
      icon(get('dock-sound-pause'), !state.sound.playing, `${state.sound.playing ? 'Pause' : 'Play'} ${soundLabel(state.sound.source).toLowerCase()}`);
      get('dock-sound-link').dataset.paused = String(!state.sound.playing);
      text(get('control-sound-toggle'), state.sound.playing ? 'Pause sound' : 'Play sound');
      if (document.activeElement !== get('gadget-volume')) get('gadget-volume').value = state.sound.volume;
    }
    text(get('control-awake'), showTimer ? awakeLabel(state) : ''); text(get('gadget-message'), state.message);
    const transition = `${state.timer?.kind || ''}:${state.timer?.phase || ''}:${state.timer?.status || ''}`;
    if (transition !== previousTransition) {
      if (state.timer) text(get('gadget-announcement'), `${timerLabel(state.timer)} ${state.timer.status === 'complete' ? 'time is up.' : `timer ${state.timer.status}.`}`);
      else if (previousTransition !== '') text(get('gadget-announcement'), 'Timer stopped.');
      previousTransition = transition;
    }
  });
}

export function mountWorkspace(root, service) {
  const workspace = root.querySelector('[data-gadget-workspace]');
  if (!workspace) return () => {};
  const kind = workspace.dataset.gadgetWorkspace, get = name => workspace.querySelector(`[data-${name}]`), events = new AbortController();
  const disposePanels = initializeWidgetPanels(workspace);
  const countdown = kind === 'exam' ? createCountdown(get('workspace-time')) : null;
  const listen = (element, type, callback) => element?.addEventListener(type, callback, { signal: events.signal });
  let closed = false, clock = null, pendingConfig = null, confirmTrigger = null, leavePresentation = () => {}, displayedTime = null;
  function renderTime(milliseconds, running = false) {
    if (countdown) countdown.render(formatExamTime(milliseconds), running && displayedTime !== null && Math.ceil(displayedTime / 1000) - Math.ceil(milliseconds / 1000) === 1);
    else text(get('workspace-time'), formatTime(milliseconds));
    displayedTime = milliseconds;
  }
  function renderDuration(timer = service.getState().timer?.kind === 'exam' ? service.getState().timer : null) {
    const duration = workspace.querySelector('[data-preference="examMinutes"]');
    duration.disabled = !!timer;
    if (timer) duration.value = timer.config.examMinutes;
    workspace.querySelectorAll('[data-duration-step]').forEach(button => { button.disabled = !!timer || (Number(button.dataset.durationStep) < 0 ? Number(duration.value) <= 1 : Number(duration.value) >= 1440); });
  }
  function cancelReplacement() {
    pendingConfig = null; get('replace-confirm').hidden = true;
    confirmTrigger?.focus({ preventScroll: true });
  }
  function renderSoundChoice() {
    const source = workspace.querySelector('input[name="source"]:checked').value;
    text(get('workspace-source'), soundLabel(source));
    text(get('workspace-source-description'), source === 'soft' ? 'A gentle, even hush.' : 'A low, soft rumble.');
  }
  function preferences() {
    const config = { ...service.getState().preferences };
    workspace.querySelectorAll('[data-preference]').forEach(input => { const key = input.dataset.preference; config[key] = input.type === 'checkbox' ? input.checked : input.type === 'number' ? Number(input.value) : input.value; });
    return config;
  }
  const initial = service.getState();
  workspace.querySelectorAll('[data-preference]').forEach(input => {
    const key = input.dataset.preference;
    const value = initial.timer?.kind === kind && ['awake', 'chime', 'examInBar', 'examMinutes', 'examReminder', 'examWarningMinutes'].includes(key) ? initial.timer.config[key] : initial.preferences[key];
    if (input.type === 'checkbox') input.checked = value; else input.value = value;
    listen(input, 'input', () => {
      const key = input.dataset.preference, value = input.type === 'checkbox' ? input.checked : input.type === 'number' ? Number(input.value) : input.value;
      if (input.type !== 'number' || input.validity.valid) service.preferences({ [key]: value });
      if (key === 'rules') { service.rules(value); if (!service.getState().timer || service.getState().timer.kind !== 'exam') get('exam-rules').innerHTML = rulesMarkup(value); }
      if (key === 'awake' && service.getState().timer?.kind === kind) service.awake(value);
      else if (key === 'awake') text(get('workspace-awake'), value ? 'Requested when the timer starts, if your browser permits it.' : '');
      if (key === 'chime' && service.getState().timer?.kind === kind) service.chime(value);
      if (key === 'examInBar') service.examInBar(value);
      if (['examReminder', 'examWarningMinutes'].includes(key) && input.validity.valid) { const saved = service.getState().preferences; service.examReminder(saved.examReminder, saved.examWarningMinutes); }
      if (input.type === 'number' && input.validity.valid && service.getState().timer?.kind !== kind) renderTime((kind === 'exam' ? preferences().examMinutes : preferences().focusMinutes) * 60000);
      if (key === 'examMinutes') renderDuration();
    });
  });
  const form = get('gadget-form');
  if (form) {
    get('start').disabled = false;
    listen(form, 'submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        leavePresentation();
        const invalid = [...form.elements].find(input => input.willValidate && !input.validity.valid), panel = invalid?.closest('[data-widget-panel]');
        if (panel?.hidden) workspace.querySelector(`[data-widget-panel-trigger="${panel.dataset.widgetPanel}"]`).click();
        form.reportValidity(); return;
      }
      const config = preferences(), active = service.getState().timer;
      if (active && active.status !== 'complete') {
        confirmTrigger = get('start');
        pendingConfig = config; get('replace-confirm').hidden = false;
        text(get('replace-message'), `Replace the ${active.status} ${timerLabel(active).toLowerCase()} timer? Its remaining time will be cleared.`);
        get('replace-accept').focus({ preventScroll: true });
      } else { service.start(kind, config); get('workspace-timer-toggle').focus({ preventScroll: true }); }
    });
    listen(get('replace-accept'), 'click', () => { if (pendingConfig) service.start(kind, pendingConfig); pendingConfig = null; get('replace-confirm').hidden = true; get('workspace-timer-toggle').focus({ preventScroll: true }); });
    listen(get('replace-cancel'), 'click', cancelReplacement);
    listen(get('workspace-timer-toggle'), 'click', () => { const timer = service.getState().timer; if (timer?.status === 'running') service.pause(); else if (timer?.status === 'paused') service.resume(); else service.restart(); });
    listen(get('workspace-restart'), 'click', () => { const config = service.getState().timer.config; confirmTrigger = get('workspace-restart'); pendingConfig = config; get('replace-confirm').hidden = false; text(get('replace-message'), 'Restart this timer from the beginning?'); get('replace-accept').focus({ preventScroll: true }); });
    listen(get('workspace-stop'), 'click', () => { pendingConfig = null; get('replace-confirm').hidden = true; service.stop(); get('start').focus({ preventScroll: true }); });
    listen(get('workspace-next'), 'click', () => service.next());
  }
  if (kind === 'exam') {
    const duration = workspace.querySelector('[data-preference="examMinutes"]');
    workspace.querySelectorAll('[data-duration-step]').forEach(button => {
      listen(button, 'click', () => {
        duration.value = Math.max(1, Math.min(1440, (duration.validity.valid ? Number(duration.value) : service.getState().preferences.examMinutes) + Number(button.dataset.durationStep)));
        duration.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
    function wallClock() { text(get('wall-clock'), new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); clock = setTimeout(wallClock, 1000); }
    wallClock(); get('exam-rules').innerHTML = rulesMarkup(initial.timer?.kind === 'exam' ? initial.timer.config.rules : initial.preferences.rules);
    const display = get('exam-display');
    let outside = [];
    function exitPresentation() {
      display.classList.remove('is-presenting'); get('presentation-exit').hidden = true;
      display.removeAttribute('role'); display.removeAttribute('aria-modal');
      outside.forEach(([element, previous, aria]) => { element.inert = previous; if (aria === null) element.removeAttribute('aria-hidden'); else element.setAttribute('aria-hidden', aria); }); outside = [];
      document.documentElement.classList.remove('exam-presenting');
      if (document.fullscreenElement === display) document.exitFullscreen().catch(() => {});
      if (!closed) get('present').focus({ preventScroll: true });
    }
    leavePresentation = exitPresentation;
    get('present').disabled = false;
    listen(get('present'), 'click', () => {
      pendingConfig = null; get('replace-confirm').hidden = true;
      display.classList.add('is-presenting'); get('presentation-exit').hidden = false; document.documentElement.classList.add('exam-presenting');
      display.setAttribute('role', 'dialog'); display.setAttribute('aria-modal', 'true');
      for (let branch = display; branch.parentElement; branch = branch.parentElement) {
        if (branch === document.body) break;
        for (const sibling of branch.parentElement.children) if (sibling !== branch) { outside.push([sibling, sibling.inert, sibling.getAttribute('aria-hidden')]); sibling.inert = true; sibling.setAttribute('aria-hidden', 'true'); }
      }
      get('presentation-exit').focus({ preventScroll: true });
      display.requestFullscreen?.().catch(() => { /* The spacious browser presentation still works. */ });
    });
    listen(get('presentation-exit'), 'click', exitPresentation);
    listen(document, 'fullscreenchange', () => { if (!document.fullscreenElement && display.classList.contains('is-presenting')) exitPresentation(); });
    listen(workspace, 'keydown', event => {
      if (event.key === 'Escape' && display.classList.contains('is-presenting')) { event.preventDefault(); exitPresentation(); }
      if (event.key === 'Tab' && display.classList.contains('is-presenting')) {
        const items = [...display.querySelectorAll('button:not([disabled]), a[href]')].filter(item => item.getClientRects().length);
        const index = items.indexOf(document.activeElement), next = index + (event.shiftKey ? -1 : 1);
        if (next < 0 || next >= items.length) { event.preventDefault(); items[(next + items.length) % items.length].focus(); }
      }
    });
    events.signal.addEventListener('abort', exitPresentation);
  }
  if (kind === 'sound') {
    const selected = () => workspace.querySelector('input[name="source"]:checked').value;
    workspace.querySelectorAll('input[name="source"]').forEach(input => { input.checked = input.value === (initial.sound?.source || initial.preferences.source); listen(input, 'change', () => { service.changeSource(input.value); renderSoundChoice(); }); });
    get('workspace-volume').value = initial.sound?.volume ?? initial.preferences.volume;
    listen(get('workspace-volume'), 'input', event => { service.volume(Number(event.target.value)); text(get('volume-value'), `${event.target.value}%`); });
    get('workspace-sound-toggle').disabled = false;
    listen(get('workspace-sound-toggle'), 'click', () => { if (service.getState().sound?.playing) service.pauseSound(); else service.playSound(selected(), Number(get('workspace-volume').value)); });
    listen(get('workspace-sound-stop'), 'click', () => service.stopSound());
  }
  let renderedRules = null, statusKey = null;
  const unsubscribe = service.subscribe(state => {
    if (closed) return;
    text(get('workspace-message'), state.message);
    if (kind === 'exam' || kind === 'pomodoro') {
      const timer = state.timer?.kind === kind ? state.timer : null;
      const milliseconds = timer ? remaining(timer) : (kind === 'exam' ? preferences().examMinutes : preferences().focusMinutes) * 60000, tone = kind === 'exam' ? examTone(timer, milliseconds) : 'normal';
      const reminder = tone === 'warning' ? `Final ${timer.config.examWarningMinutes} ${timer.config.examWarningMinutes === 1 ? 'minute' : 'minutes'}` : '';
      renderTime(milliseconds, timer?.status === 'running');
      text(get('workspace-phase'), kind === 'exam' ? timer?.status === 'paused' ? `Paused${reminder ? ` · ${reminder.toLowerCase()}` : ''}` : timer?.status === 'complete' ? 'Time is up' : reminder || 'Time remaining' : timer ? `${timerLabel(timer)} time` : 'Ready to focus');
      text(get('workspace-round'), timer ? `Round ${timer.round}` : '');
      get('workspace-timer-toggle').disabled = !timer;
      get('start').hidden = !!timer;
      text(get('workspace-timer-toggle'), timer?.status === 'paused' ? 'Resume' : timer?.status === 'complete' ? 'Restart' : 'Pause');
      get('workspace-timer-toggle').hidden = !timer || (kind === 'pomodoro' && timer.status === 'complete');
      get('workspace-next').hidden = kind !== 'pomodoro' || timer?.status !== 'complete';
      text(get('workspace-next'), timer?.phase === 'break' ? 'Start focus' : 'Start break');
      get('workspace-restart').disabled = get('workspace-stop').disabled = !timer;
      get('workspace-restart').hidden = !timer || timer.status === 'complete';
      get('workspace-stop').hidden = !timer;
      const key = `${timer?.status || ''}:${timer?.phase || ''}:${state.timer?.kind || ''}:${tone}:${reminder}`;
      if (key !== statusKey) { statusKey = key; text(get('workspace-status'), kind === 'exam' ? timer?.status === 'complete' ? 'Time is up.' : timer?.status === 'paused' ? 'Paused.' : reminder ? `${reminder}.` : '' : timer?.status === 'complete' ? `Time is up. Start your ${timer.phase === 'focus' ? 'break' : 'next focus period'} when you are ready.` : timer?.status === 'paused' ? 'Paused. Resume whenever you are ready.' : timer ? 'Running. You can carry on reading.' : state.timer ? `The ${timerLabel(state.timer).toLowerCase()} timer is active. Starting here will replace it.` : 'Ready when you are.'); }
      text(get('workspace-awake'), timer ? awakeLabel(state) : preferences().awake ? 'Requested when the timer starts, if your browser permits it.' : '');
      if (timer) for (const option of ['awake', 'chime']) workspace.querySelector(`[data-preference="${option}"]`).checked = timer.config[option];
      if (kind === 'exam') { const rules = timer?.config.rules ?? preferences().rules; if (rules !== renderedRules) { get('exam-rules').innerHTML = rulesMarkup(rules); renderedRules = rules; } }
      if (kind === 'exam') {
        renderDuration(timer);
        workspace.querySelector('[data-preference="examInBar"]').checked = timer?.config.examInBar ?? state.preferences.examInBar;
        const config = timer?.config || state.preferences, reminderInput = workspace.querySelector('[data-preference="examWarningMinutes"]');
        workspace.querySelector('[data-preference="examReminder"]').checked = config.examReminder;
        if (document.activeElement !== reminderInput) reminderInput.value = config.examWarningMinutes;
        reminderInput.disabled = !config.examReminder; get('exam-reminder-fields').hidden = !config.examReminder;
        get('exam-display').dataset.examTone = tone;
      }
    }
    if (kind === 'sound') {
      const sound = state.sound;
      get('workspace-sound-stop').disabled = !sound;
      get('workspace-sound-stop').hidden = !sound;
      text(get('workspace-sound-toggle'), sound?.playing ? 'Pause sound' : 'Play sound');
      text(get('workspace-sound-status'), sound?.elsewhere ? 'Playing in another tab. Press Play to move it here.' : sound?.playing ? 'Playing. You can carry on reading.' : sound ? 'Paused. Resume whenever you are ready.' : 'Ready when you are.');
      if (sound) {
        workspace.querySelectorAll('input[name="source"]').forEach(input => { input.checked = input.value === sound.source; });
        if (document.activeElement !== get('workspace-volume')) get('workspace-volume').value = sound.volume;
      }
      text(get('volume-value'), `${get('workspace-volume').value}%`);
      renderSoundChoice();
    }
  });
  listen(workspace, 'keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    if (get('replace-confirm') && !get('replace-confirm').hidden) { cancelReplacement(); event.preventDefault(); }
    else { const details = event.target.closest('details[open]'); if (details) { details.open = false; details.querySelector('summary').focus(); event.preventDefault(); } }
  });
  return () => { closed = true; events.abort(); disposePanels(); countdown?.dispose(); unsubscribe(); clearTimeout(clock); };
}

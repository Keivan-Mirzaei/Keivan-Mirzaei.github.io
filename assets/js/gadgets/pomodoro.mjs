import { pomodoroBreakMinutes, readPreferences, timerLabel } from './model.mjs';
import { dailyFocus, localDay } from './focus-log.mjs';

const presets = { classic: { focusMinutes: 25, breakMinutes: 5 }, deep: { focusMinutes: 50, breakMinutes: 10 } };
function text(element, value) { if (element.textContent !== value) element.textContent = value; }

// The timer stays in the shared service; only the daily label needs a midnight refresh.
export function createPomodoroView(workspace, service, { preferences, applyPreset }) {
  const get = name => workspace.querySelector(`[data-pomodoro-${name}]`), events = new AbortController();
  const listen = (element, type, handler) => element.addEventListener(type, handler, { signal: events.signal });
  const buttons = [...workspace.querySelectorAll('[data-pomodoro-preset]')], dots = [...workspace.querySelectorAll('[data-round-dot]')];
  const restartTrigger = workspace.querySelector('[data-workspace-restart]'), restartPanel = get('restart-panel');
  let day = '', midnight = null, restartPhase = null;
  function closeRestart(restoreFocus = false) {
    restartPanel.hidden = true; restartTrigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) restartTrigger.focus({ preventScroll: true });
  }
  listen(restartTrigger, 'click', () => {
    if (!restartPanel.hidden) { closeRestart(); return; }
    workspace.querySelector('[data-widget-panel-trigger][aria-expanded="true"]')?.click();
    restartPanel.hidden = false; restartTrigger.setAttribute('aria-expanded', 'true');
    get('restart-round').focus({ preventScroll: true });
  });
  for (const trigger of workspace.querySelectorAll('[data-widget-panel-trigger]')) listen(trigger, 'click', () => closeRestart());
  listen(get('restart-cancel'), 'click', () => closeRestart(true));
  listen(workspace.ownerDocument, 'keydown', event => {
    if (event.key === 'Escape' && !event.defaultPrevented && !restartPanel.hidden) { event.preventDefault(); closeRestart(true); }
  });
  for (const scope of ['round', 'cycle']) listen(get(`restart-${scope}`), 'click', () => {
    if (service.getState().timer?.kind !== 'pomodoro') return;
    closeRestart();
    if (scope === 'round') service.restartRound(); else service.restartCycle();
    workspace.querySelector('[data-workspace-timer-toggle]').focus({ preventScroll: true });
  });
  function renderDaily(state) {
    const total = dailyFocus(state.focusLog || []), today = localDay();
    text(get('total'), `Today · ${total.sessions} focus ${total.sessions === 1 ? 'session' : 'sessions'} · ${Math.round(total.milliseconds / 60000)} min`);
    if (today !== day) {
      day = today; clearTimeout(midnight);
      const nextDay = new Date(); nextDay.setHours(24, 0, 0, 0);
      midnight = setTimeout(() => renderDaily(service.getState()), Math.max(1, nextDay.getTime() - Date.now() + 50));
    }
  }
  for (const button of buttons) {
    button.disabled = false;
    listen(button, 'click', () => {
      const preset = presets[button.dataset.pomodoroPreset];
      if (preset) applyPreset(preset);
      else {
        const settings = workspace.querySelector('[data-widget-panel-trigger="settings"]');
        if (settings.getAttribute('aria-expanded') !== 'true') settings.click();
        workspace.querySelector('[data-preference="focusMinutes"]').focus();
      }
    });
  }
  return {
    render(state) {
      const timer = state.timer?.kind === 'pomodoro' ? state.timer : null;
      get('display').dataset.status = timer?.status || 'idle';
      text(get('state-label'), timer ? `${timerLabel(timer)}${timer.status === 'paused' ? ' paused' : timer.status === 'complete' ? ' complete' : ' in progress'}` : 'Ready to focus');
      const choices = readPreferences(preferences()), config = timer?.config || choices, round = timer?.round || 1, cycleRound = (round - 1) % 4 + 1;
      const phaseKey = timer ? `${timer.phaseId}:${timer.status === 'complete'}` : null;
      if (phaseKey !== restartPhase) {
        const restoreFocus = !restartPanel.hidden && restartPanel.contains(workspace.ownerDocument.activeElement);
        closeRestart(); restartPhase = phaseKey;
        if (restoreFocus) workspace.querySelector(timer ? timer.status === 'complete' ? '[data-workspace-next]' : '[data-workspace-timer-toggle]' : '[data-start]').focus({ preventScroll: true });
      }
      text(get('restart-detail'), `Begin round ${cycleRound}'s focus timer again. Keep earlier rounds.`);
      const task = workspace.querySelector('[data-preference="pomodoroTask"]');
      if (workspace.ownerDocument.activeElement !== task && task.value !== config.pomodoroTask) task.value = config.pomodoroTask;
      for (const key of ['autoStartBreaks', 'autoStartFocus']) workspace.querySelector(`[data-preference="${key}"]`).checked = config[key];
      renderDaily(state);
      const selected = Object.entries(presets).find(([, preset]) => choices.focusMinutes === preset.focusMinutes && choices.breakMinutes === preset.breakMinutes)?.[0] || 'custom';
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pomodoroPreset === selected)));
      text(workspace.querySelector('[data-workspace-round]'), `Round ${cycleRound} of 4`);
      dots.forEach((dot, index) => {
        dot.dataset.roundState = index + 1 < cycleRound || timer?.phase === 'break' && index + 1 === cycleRound ? 'done' : index + 1 === cycleRound ? 'current' : 'pending';
      });
      text(get('end'), timer?.status === 'running' ? `Ends at ${new Date(timer.deadline).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : timer?.status === 'paused' ? 'Paused · take your time' : state.autoTransition ? `Starting ${timer.phase === 'focus' ? 'break' : 'focus'}…` : timer?.status === 'complete' ? 'Next phase is ready' : 'Ready when you are');
      const next = timer?.phase === 'break' ? `${config.focusMinutes} min focus` : `${pomodoroBreakMinutes(config, round)} min ${round % 4 === 0 ? 'long break' : 'break'}`;
      const automatic = timer?.phase === 'break' ? config.autoStartFocus : config.autoStartBreaks;
      text(get('next'), `Next · ${next}${automatic ? ' · auto' : ''}`);
    },
    dispose() { closeRestart(); events.abort(); clearTimeout(midnight); }
  };
}

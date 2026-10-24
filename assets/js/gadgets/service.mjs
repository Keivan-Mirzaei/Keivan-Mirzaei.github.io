import { STORAGE_KEY, readState, readPreferences, createTimer, pauseTimer, resumeTimer, reconcile, nextPhase, remaining } from './model.mjs';
import { createAudioPlayer } from './audio.mjs';
import { soundChoice } from './sounds.mjs';
import { mergeFocusLog } from './focus-log.mjs';

export function createGadgetService(environment = globalThis) {
  const { document, navigator } = environment, owner = environment.crypto.randomUUID(), listeners = new Set(), audio = createAudioPlayer(environment);
  let state; try { state = readState(environment.localStorage.getItem(STORAGE_KEY)); } catch { state = readState(null); }
  let clock = null, lock = null, requesting = false, wakeStatus = 'off', message = '', soundPlaying = false, soundLoading = false, remotePlaying = false, previewing = false, alarmKey = null, automaticNextAt = null, automaticPhase = null, phaseSequence = 0;
  const channel = environment.BroadcastChannel ? new environment.BroadcastChannel('almost-obvious:gadgets') : null;
  channel?.addEventListener('message', event => {
    if (event.data?.type === 'hello' && soundPlaying) channel.postMessage({ type: 'playing', owner });
    if (event.data?.type === 'playing' && event.data.owner === state.sound?.owner && event.data.owner !== owner) { remotePlaying = true; notify(); }
    if (event.data?.type === 'leaving' && event.data.owner === state.sound?.owner) { remotePlaying = false; notify(); }
  });
  channel?.postMessage({ type: 'hello' });
  // A new document always needs an explicit Play, even if it last owned sound.
  function snapshot() { return { ...state, sound: state.sound ? { ...state.sound, playing: soundPlaying, loading: soundLoading, elsewhere: remotePlaying && state.sound.playing && state.sound.owner !== owner } : null, autoTransition: automaticNextAt !== null, wakeStatus, message }; }
  function notify() { listeners.forEach(listener => listener(snapshot())); }
  function save() {
    try {
      state.focusLog = mergeFocusLog(readState(environment.localStorage.getItem(STORAGE_KEY)).focusLog, state.focusLog);
      environment.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { message = 'Changes work here, but this browser could not save them for a later visit.'; }
  }
  function settle() {
    const previous = state.timer;
    state.timer = reconcile(previous);
    const timer = state.timer;
    if (timer?.kind === 'pomodoro' && timer.phase === 'focus' && timer.status === 'complete' && !timer.completionRecorded) {
      if (timer.phaseId && timer.completedAt !== null) state.focusLog = mergeFocusLog(state.focusLog, [{ id: timer.phaseId, completedAt: timer.completedAt, duration: timer.duration }]);
      state.timer = { ...timer, completionRecorded: true };
    }
    return previous !== state.timer;
  }
  function automaticEnabled(timer = state.timer) { return timer?.kind === 'pomodoro' && (timer.phase === 'focus' ? timer.config.autoStartBreaks : timer.config.autoStartFocus); }
  audio.onState(value => {
    if (value !== 'running' && alarmKey !== null) { alarmKey = null; audio.cancelCompletion(); }
    if (value === 'running' && canChime()) updateAlarm();
  });
  audio.onSoundState(value => {
    if (soundPlaying && value !== 'running') {
      soundPlaying = soundLoading = false; audio.pause(); if (state.sound?.owner === owner) state.sound.playing = false;
      message = 'Sound was interrupted by the browser. Press Play to resume.'; save(); notify();
    }
  });
  function canChime() { return state.timer?.status === 'running' && state.timer.config.chime && state.timer.alarmOwner === owner && state.timer.deadline > Date.now(); }
  function updateAlarm() {
    if (!canChime()) {
      if (state.timer?.status === 'complete' && state.timer.config.chime && state.timer.alarmOwner === owner) audio.expireCompletion();
      else audio.cancelCompletion();
      alarmKey = null; audio.rest(); return;
    }
    const timer = state.timer, key = `${timer.deadline}:${timer.config.chimeSound}`;
    if (alarmKey === key) return;
    alarmKey = key;
    audio.scheduleChime(timer.deadline, timer.config.chimeSound).catch(error => {
      if (!canChime() || `${state.timer.deadline}:${state.timer.config.chimeSound}` !== key) return;
      message = error.message || 'Time-up sound could not be scheduled.'; notify();
    });
  }
  function wantsWake() { return state.timer?.status === 'running' && state.timer.config.awake; }
  async function updateWake() {
    if (!wantsWake() || document.hidden) {
      const prior = lock; lock = null; wakeStatus = document.hidden && wantsWake() ? 'hidden' : 'off';
      if (prior) await prior.release().catch(() => {}); notify(); return;
    }
    if (!navigator.wakeLock || !environment.isSecureContext) { wakeStatus = 'unavailable'; notify(); return; }
    if (lock || requesting) return;
    requesting = true; wakeStatus = 'requesting'; notify();
    try {
      const result = await navigator.wakeLock.request('screen');
      if (!wantsWake() || document.hidden) { await result.release(); return; }
      lock = result; wakeStatus = 'active';
      result.addEventListener('release', () => { if (lock === result) { lock = null; wakeStatus = 'released'; notify(); } });
    } catch { wakeStatus = 'denied'; }
    finally { requesting = false; notify(); }
  }
  function schedule() {
    if (clock !== null) environment.clearTimeout(clock); clock = null;
    if (state.timer?.status === 'running') clock = environment.setTimeout(tick, Math.max(30, document.hidden ? remaining(state.timer) : remaining(state.timer) % 1000 || 1000));
    else if (automaticNextAt !== null && state.timer?.status === 'complete' && automaticEnabled()) clock = environment.setTimeout(tick, Math.max(30, automaticNextAt - Date.now()));
  }
  function tick() {
    // Another tab may already have advanced this phase before its storage event arrives.
    if (state.timer?.alarmOwner !== owner && (state.timer?.status === 'complete' || state.timer?.status === 'running' && remaining(state.timer) === 0)) {
      try { const saved = environment.localStorage.getItem(STORAGE_KEY); if (saved) { const restored = readState(saved); state.timer = restored.timer; state.focusLog = mergeFocusLog(state.focusLog, restored.focusLog); } } catch { /* The in-memory timer remains usable. */ }
    }
    const changed = settle(), timer = state.timer;
    if (timer?.status === 'complete' && timer.alarmOwner === owner && automaticPhase !== timer.phaseId) {
      automaticPhase = timer.phaseId;
      if (automaticEnabled(timer) && timer.completedAt !== null && Date.now() - timer.completedAt <= 5000) {
        // Let the completion chime finish before arming the next phase's alarm.
        automaticNextAt = Date.now() + (timer.config.chime ? 2500 : 0);
      }
    }
    if (automaticNextAt !== null && (!automaticEnabled(timer) || timer?.status !== 'complete' || timer.alarmOwner !== owner)) automaticNextAt = null;
    if (automaticNextAt !== null && Date.now() - automaticNextAt > 5000) automaticNextAt = null;
    if (automaticNextAt !== null && Date.now() >= automaticNextAt) { commit(nextPhase(timer)); return; }
    if (changed) { save(); updateWake(); }
    updateAlarm();
    notify(); schedule();
  }
  function commit(timer) { settle(); automaticNextAt = null; state.timer = timer ? { ...timer, phaseId: timer.phaseId || `${owner}:${++phaseSequence}`, alarmOwner: owner } : null; if (state.timer?.status === 'complete') automaticPhase = state.timer.phaseId; message = ''; if (timer?.status !== 'running') audio.rest(); save(); updateWake(); tick(); }
  const service = {
    subscribe(listener) { listeners.add(listener); listener(snapshot()); return () => listeners.delete(listener); },
    getState: snapshot,
    preferences(patch) { state.preferences = readPreferences({ ...state.preferences, ...patch }); save(); },
    rules(value) { if (state.timer?.kind === 'exam') { state.timer.config.rules = String(value).slice(0, 20000); save(); notify(); } },
    start(kind, preferences) { service.preferences(preferences); commit(createTimer(kind, preferences)); },
    pause() { commit(pauseTimer(state.timer)); },
    resume() { commit(resumeTimer(state.timer)); },
    stop() { commit(null); },
    restart() { if (state.timer) commit(createTimer(state.timer.kind, state.timer.config, Date.now(), state.timer.phase, state.timer.round)); },
    restartRound() { if (state.timer?.kind === 'pomodoro') commit(createTimer('pomodoro', state.timer.config, Date.now(), 'focus', state.timer.round)); },
    restartCycle() { if (state.timer?.kind === 'pomodoro') commit(createTimer('pomodoro', state.timer.config)); },
    next() { commit(nextPhase(state.timer)); },
    skip() { if (state.timer?.kind === 'pomodoro') commit(nextPhase({ ...state.timer, status: 'complete' })); },
    pomodoroTask(value) {
      service.preferences({ pomodoroTask: value });
      if (state.timer?.kind === 'pomodoro') state.timer.config.pomodoroTask = state.preferences.pomodoroTask;
      save(); notify();
    },
    pomodoroTransitions(patch) {
      const { autoStartBreaks, autoStartFocus } = readPreferences({ ...state.preferences, ...patch });
      service.preferences({ autoStartBreaks, autoStartFocus });
      if (state.timer?.kind === 'pomodoro') Object.assign(state.timer.config, { autoStartBreaks, autoStartFocus });
      if (!automaticEnabled()) automaticNextAt = null;
      save(); notify(); schedule();
    },
    awake(value) { if (state.timer) { state.timer.config.awake = value; save(); updateWake(); notify(); } },
    chime(value) { if (state.timer) { state.timer.config.chime = value; if (value && state.timer.status === 'running') state.timer.alarmOwner = owner; updateAlarm(); save(); notify(); } },
    chimeSound(value) { service.preferences({ chimeSound: value }); if (state.timer) state.timer.config.chimeSound = state.preferences.chimeSound; updateAlarm(); save(); notify(); },
    async previewChime(value = state.preferences.chimeSound) { previewing = true; try { message = ''; await audio.chime(readPreferences({ chimeSound: value }).chimeSound); } catch (error) { message = error.message || 'Sound could not play.'; } notify(); },
    stopChimePreview() { if (previewing) { previewing = false; audio.silenceChime(); audio.rest(); } },
    examInBar(value) { service.preferences({ examInBar: value }); if (state.timer?.kind === 'exam') state.timer.config.examInBar = value === true; save(); notify(); },
    pomodoroInBar(value) { service.preferences({ pomodoroInBar: value }); if (state.timer?.kind === 'pomodoro') state.timer.config.pomodoroInBar = state.preferences.pomodoroInBar; save(); notify(); },
    soundInBar(value) { service.preferences({ soundInBar: value }); notify(); },
    examReminder(enabled, minutes) {
      service.preferences({ examReminder: enabled, examWarningMinutes: minutes });
      if (state.timer?.kind === 'exam') Object.assign(state.timer.config, { examReminder: state.preferences.examReminder, examWarningMinutes: state.preferences.examWarningMinutes });
      save(); notify();
    },
    async playSound(source = state.sound?.source || state.preferences.source, volume = state.sound?.volume ?? state.preferences.volume) {
      source = soundChoice(source);
      message = ''; remotePlaying = false; const selection = { source, volume, playing: true, owner }; state.sound = selection;
      try {
        // Claim the player immediately so the other tab can pause before loading.
        save(); soundPlaying = soundLoading = true; notify();
        const played = await audio.play(source, volume);
        if (played && state.sound === selection) { soundPlaying = true; soundLoading = false; channel?.postMessage({ type: 'playing', owner }); notify(); }
      } catch (error) { if (state.sound !== selection) return; soundPlaying = soundLoading = false; state.sound.playing = false; audio.pause(); message = error.message || 'Sound could not play. Try Play again.'; save(); notify(); }
    },
    pauseSound() { soundPlaying = soundLoading = false; audio.pause(); remotePlaying = false; if (state.sound) { state.sound = { ...state.sound, playing: false, owner }; save(); } notify(); },
    stopSound() { soundPlaying = soundLoading = false; audio.stop(); remotePlaying = false; state.sound = null; save(); notify(); },
    volume(value) { service.preferences({ volume: value }); if (state.sound) state.sound.volume = value; audio.volume(value); save(); notify(); },
    changeSource(value) { service.preferences({ source: value }); value = state.preferences.source; if (state.sound) { if (soundPlaying) service.playSound(value, state.sound.volume); else { state.sound.source = value; save(); notify(); } } },
    refresh: tick
  };
  environment.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    const focusLog = state.focusLog;
    state = readState(event.key === null ? null : event.newValue);
    if (event.key !== null && event.newValue !== null) state.focusLog = mergeFocusLog(focusLog, state.focusLog);
    remotePlaying = !channel && state.sound?.playing && state.sound.owner !== owner;
    channel?.postMessage({ type: 'hello' });
    if (!state.sound?.playing || state.sound.owner !== owner) { soundPlaying = soundLoading = false; audio.pause(); }
    updateWake(); tick();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) alarmKey = null; updateWake(); tick(); });
  environment.addEventListener('pageshow', () => { updateWake(); tick(); });
  environment.addEventListener('pagehide', () => { if (clock !== null) environment.clearTimeout(clock); clock = null; automaticNextAt = null; alarmKey = null; audio.cancelCompletion(); audio.silenceChime(); audio.rest(); lock?.release().catch(() => {}); channel?.postMessage({ type: 'leaving', owner }); });
  updateWake(); tick();
  return service;
}

import { STORAGE_KEY, readState, readPreferences, createTimer, pauseTimer, resumeTimer, reconcile, nextPhase, remaining } from './model.mjs';
import { createAudioPlayer } from './audio.mjs';

export function createGadgetService(environment = globalThis) {
  const { document, navigator } = environment, owner = environment.crypto.randomUUID(), listeners = new Set(), audio = createAudioPlayer(environment);
  let state; try { state = readState(environment.localStorage.getItem(STORAGE_KEY)); } catch { state = readState(null); }
  let clock = null, lock = null, requesting = false, wakeStatus = 'off', message = '', soundPlaying = false, remotePlaying = false;
  const channel = environment.BroadcastChannel ? new environment.BroadcastChannel('almost-obvious:gadgets') : null;
  channel?.addEventListener('message', event => {
    if (event.data?.type === 'hello' && soundPlaying) channel.postMessage({ type: 'playing', owner });
    if (event.data?.type === 'playing' && event.data.owner === state.sound?.owner && event.data.owner !== owner) { remotePlaying = true; notify(); }
    if (event.data?.type === 'leaving' && event.data.owner === state.sound?.owner) { remotePlaying = false; notify(); }
  });
  channel?.postMessage({ type: 'hello' });
  // A new document always needs an explicit Play, even if it last owned sound.
  function snapshot() { return { ...state, sound: state.sound ? { ...state.sound, playing: soundPlaying, elsewhere: remotePlaying && state.sound.playing && state.sound.owner !== owner } : null, wakeStatus, message }; }
  function notify() { listeners.forEach(listener => listener(snapshot())); }
  function save() { try { environment.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { message = 'Changes work here, but this browser could not save them for a later visit.'; } }
  audio.onState(value => {
    if (soundPlaying && value !== 'running') {
      soundPlaying = false; if (state.sound?.owner === owner) state.sound.playing = false;
      message = 'Sound was interrupted by the browser. Press Play to resume.'; save(); notify();
    }
  });
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
    if (state.timer?.status === 'running' && !document.hidden) clock = environment.setTimeout(tick, Math.max(30, remaining(state.timer) % 1000 || 1000));
  }
  function tick() {
    const previous = state.timer;
    state.timer = reconcile(previous);
    if (previous !== state.timer) {
      save(); updateWake();
      if (previous?.config.chime && previous.alarmOwner === owner && !document.hidden) audio.chime();
    }
    notify(); schedule();
  }
  function commit(timer) { state.timer = timer ? { ...timer, alarmOwner: owner } : null; message = ''; if (timer?.status !== 'running') audio.rest(); save(); updateWake(); tick(); }
  const service = {
    subscribe(listener) { listeners.add(listener); listener(snapshot()); return () => listeners.delete(listener); },
    getState: snapshot,
    preferences(patch) { state.preferences = readPreferences({ ...state.preferences, ...patch }); save(); },
    rules(value) { if (state.timer?.kind === 'exam') { state.timer.config.rules = String(value).slice(0, 20000); save(); notify(); } },
    start(kind, preferences) { if (preferences.chime) audio.prime(); service.preferences(preferences); commit(createTimer(kind, preferences)); },
    pause() { commit(pauseTimer(state.timer)); },
    resume() { if (state.timer?.config.chime) audio.prime(); commit(resumeTimer(state.timer)); },
    stop() { commit(null); },
    restart() { if (state.timer) service.start(state.timer.kind, state.timer.config); },
    next() { if (state.timer?.config.chime) audio.prime(); commit(nextPhase(state.timer)); },
    awake(value) { if (state.timer) { state.timer.config.awake = value; save(); updateWake(); notify(); } },
    chime(value) { if (state.timer) { state.timer.config.chime = value; if (value && state.timer.status === 'running') { state.timer.alarmOwner = owner; audio.prime(); } else if (!value) audio.rest(); save(); notify(); } },
    examInBar(value) { service.preferences({ examInBar: value }); if (state.timer?.kind === 'exam') state.timer.config.examInBar = value === true; save(); notify(); },
    examReminder(enabled, minutes) {
      service.preferences({ examReminder: enabled, examWarningMinutes: minutes });
      if (state.timer?.kind === 'exam') Object.assign(state.timer.config, { examReminder: state.preferences.examReminder, examWarningMinutes: state.preferences.examWarningMinutes });
      save(); notify();
    },
    async playSound(source = state.sound?.source || state.preferences.source, volume = state.sound?.volume ?? state.preferences.volume) {
      message = ''; remotePlaying = false; const selection = { source, volume, playing: true, owner }; state.sound = selection;
      try {
        // Claim the player immediately so the other tab can pause before loading.
        save(); soundPlaying = true; notify();
        const played = await audio.play(source, volume);
        if (played && state.sound === selection) { soundPlaying = true; channel?.postMessage({ type: 'playing', owner }); notify(); }
      } catch (error) { if (state.sound !== selection) return; soundPlaying = false; state.sound.playing = false; audio.pause(); message = error.message || 'Sound could not play. Try Play again.'; save(); notify(); }
    },
    pauseSound() { soundPlaying = false; audio.pause(); remotePlaying = false; if (state.sound) { state.sound = { ...state.sound, playing: false, owner }; save(); } notify(); },
    stopSound() { soundPlaying = false; audio.stop(); remotePlaying = false; state.sound = null; save(); notify(); },
    volume(value) { service.preferences({ volume: value }); if (state.sound) state.sound.volume = value; audio.volume(value); save(); notify(); },
    changeSource(value) { service.preferences({ source: value }); if (state.sound) { if (soundPlaying) service.playSound(value, state.sound.volume); else { state.sound.source = value; save(); notify(); } } },
    refresh: tick
  };
  environment.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    state = readState(event.key === null ? null : event.newValue);
    remotePlaying = !channel && state.sound?.playing && state.sound.owner !== owner;
    channel?.postMessage({ type: 'hello' });
    if (!state.sound?.playing || state.sound.owner !== owner) { soundPlaying = false; audio.pause(); }
    updateWake(); tick();
  });
  document.addEventListener('visibilitychange', () => { updateWake(); tick(); });
  environment.addEventListener('pageshow', () => { updateWake(); tick(); });
  environment.addEventListener('pagehide', () => { if (clock !== null) environment.clearTimeout(clock); clock = null; lock?.release().catch(() => {}); channel?.postMessage({ type: 'leaving', owner }); });
  updateWake(); tick();
  return service;
}

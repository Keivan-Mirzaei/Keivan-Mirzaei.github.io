import { chimeNotes } from './chimes.mjs';
import { sounds, soundChoice, noiseBuffer, seamlessLoop } from './sounds.mjs';
// One context and one looping source; fetch recordings only after deliberate Play.
export function createAudioPlayer(environment = globalThis) {
  let context = null, output = null, media = null, source = null, gain = null, filter = null, selected = null, generation = 0, stateListener = null;
  let preparing = null, request = null, cached = null, currentVolume = 25;
  let previewGeneration = 0, previewPreparing = null, completionGeneration = 0, completion = null;
  const previews = new Map(), completionNodes = new Map();
  function ensure() {
    if (!context) {
      const Audio = environment.AudioContext || environment.webkitAudioContext;
      if (!Audio) throw new Error('Sound is unavailable in this browser.');
      context = new Audio();
      context.addEventListener?.('statechange', () => stateListener?.(context.state));
      output = context.destination;
      if (typeof environment.Audio === 'function' && typeof context.createMediaStreamDestination === 'function') {
        // A native media player can keep the real audio stream playing in hidden tabs.
        // Leave the context's default destination disconnected for WebKit background rendering.
        let destination;
        try {
          destination = context.createMediaStreamDestination(); const element = new environment.Audio(); element.srcObject = destination.stream;
          output = destination; media = element;
          const interrupted = () => { if ((media.paused || media.error) && busy()) stateListener?.('interrupted'); };
          media.addEventListener('pause', interrupted); media.addEventListener('error', interrupted);
        } catch { destination?.stream.getTracks?.().forEach(track => track.stop()); }
      }
      gain = context.createGain(); gain.gain.value = 0; gain.connect(output);
    }
    return context;
  }
  function resume(audio) {
    const played = media?.play(); // Obtain native playback permission in the user's action.
    const resumed = audio.resume();
    return media ? Promise.all([played, resumed]) : resumed;
  }
  function disconnect() {
    if (source) { source.stop(); source.disconnect(); source = null; }
    filter?.disconnect(); filter = null; selected = null;
  }
  function volume(value) { currentVolume = value; if (context) gain.gain.setTargetAtTime(value / 100 * .32, context.currentTime, .08); }
  async function recording(audio, kind, signal) {
    const url = new URL(`../../audio/ambient/${sounds[kind].file}`, import.meta.url);
    const response = await environment.fetch(url, { signal });
    if (!response.ok) throw new Error('This sound could not load. Press Play to try again.');
    const decoded = await audio.decodeAudioData(await response.arrayBuffer());
    if (signal.aborted) return null;
    return seamlessLoop(audio, decoded);
  }
  async function play(kind, level) {
    const audio = ensure(), attempt = ++generation;
    kind = soundChoice(kind); currentVolume = level; request?.abort(); preparing = attempt;
    try {
      const resumed = resume(audio); // Call before fetching to retain Safari's user activation.
      if (kind !== selected) {
        disconnect();
        const controller = new AbortController(); request = controller;
        const bufferReady = cached?.kind === kind ? cached.buffer : sounds[kind].file ? recording(audio, kind, controller.signal) : noiseBuffer(audio, kind);
        const [, buffer] = await Promise.all([resumed, bufferReady]);
        if (attempt !== generation || !buffer) return false;
        cached = { kind, buffer }; // Retain only the most recently used sound, including while paused.
        source = audio.createBufferSource(); source.buffer = buffer; source.loop = true;
        gain.gain.setValueAtTime(0, audio.currentTime);
        if (sounds[kind].file) source.connect(gain);
        else {
          filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = kind === 'brown' ? 800 : 1800;
          source.connect(filter); filter.connect(gain);
        }
        source.start(); selected = kind;
      } else await resumed;
      if (attempt !== generation) return false;
      if (audio.state !== 'running' || media?.paused) throw new Error('Sound was interrupted. Press Play to resume.');
      volume(currentVolume); return true;
    } catch (error) {
      if (attempt !== generation) return false;
      disconnect(); throw error;
    } finally {
      if (preparing === attempt) { preparing = null; request?.abort(); request = null; rest(); }
    }
  }
  function clearNotes(notes) {
    for (const [oscillator, envelope] of notes) { oscillator.onended = null; oscillator.stop(); oscillator.disconnect(); envelope.disconnect(); }
    notes.clear();
  }
  function silenceChime() { previewGeneration++; previewPreparing = null; clearNotes(previews); }
  function cancelCompletion() { completionGeneration++; completion = null; clearNotes(completionNodes); }
  function pause() { generation++; preparing = null; request?.abort(); request = null; disconnect(); rest(); }
  function stop() { pause(); cached = null; }
  function busy() { return preparing !== null || !!source || !!previews.size || previewPreparing !== null || !!completionNodes.size || !!completion; }
  function rest() {
    if (!busy()) {
      if (media && !media.paused) media.pause();
      if (context?.state === 'running') context.suspend().catch(() => {});
    }
  }
  function scheduleNotes(audio, choice, when, notes, finished = () => {}) {
    for (const note of chimeNotes(choice)) {
      const oscillator = audio.createOscillator(), envelope = audio.createGain(), time = when + note.delay;
      oscillator.type = note.waveform || 'sine'; oscillator.frequency.value = note.frequency;
      envelope.gain.setValueAtTime(0, time); envelope.gain.linearRampToValueAtTime(note.level, time + .015);
      if (note.hold) envelope.gain.setValueAtTime(note.level, time + .015 + note.hold);
      envelope.gain.exponentialRampToValueAtTime(.0001, time + note.duration);
      oscillator.connect(envelope); envelope.connect(output);
      notes.set(oscillator, envelope);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); notes.delete(oscillator); if (!notes.size) finished(); rest(); };
      oscillator.start(time); oscillator.stop(time + note.duration + .025);
    }
  }
  async function chime(choice = 'soft') {
    silenceChime(); const attempt = previewGeneration; previewPreparing = attempt;
    try {
      const audio = ensure(); await resume(audio);
      if (attempt !== previewGeneration) return false;
      if (audio.state !== 'running' || media?.paused) throw new Error('Sound is unavailable. Try Preview again.');
      previewPreparing = null; scheduleNotes(audio, choice, audio.currentTime, previews); return true;
    } catch (error) { if (attempt !== previewGeneration) return false; silenceChime(); throw error; }
    finally { if (previewPreparing === attempt) previewPreparing = null; rest(); }
  }
  async function scheduleChime(deadline, choice = 'soft') {
    cancelCompletion(); const attempt = completionGeneration, plan = { deadline, time: null }; completion = plan;
    try {
      const audio = ensure(); await resume(audio);
      if (attempt !== completionGeneration || completion !== plan) return false;
      const delay = (deadline - Date.now()) / 1000;
      if (delay <= 0) { cancelCompletion(); return false; }
      if (audio.state !== 'running' || media?.paused) throw new Error('Time-up sound is unavailable. Use Preview to enable sound.');
      plan.time = audio.currentTime + delay;
      // Native audio timing keeps the alarm independent of hidden-tab JS callbacks.
      scheduleNotes(audio, choice, plan.time, completionNodes, () => { if (completion === plan) completion = null; });
      return true;
    } catch (error) { if (completion !== plan) return false; cancelCompletion(); throw error; }
    finally { rest(); }
  }
  function expireCompletion() {
    // A sleeping/suspended audio clock must not play a missed alarm on return.
    if (completion && (completion.time === null || completion.time > context.currentTime + .1)) cancelCompletion();
  }
  return { play, pause, stop, rest, volume, chime, silenceChime, scheduleChime, cancelCompletion, expireCompletion, onState(listener) { stateListener = listener; }, get state() { return context?.state; } };
}

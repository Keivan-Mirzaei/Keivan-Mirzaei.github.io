import { chimeNotes } from './chimes.mjs';
// One context, one looping source. No recording transfers or idle processing.
export function createAudioPlayer(environment = globalThis) {
  let context = null, source = null, gain = null, filter = null, selected = null, generation = 0, stateListener = null;
  let previewGeneration = 0, previewPreparing = null, completionGeneration = 0, completion = null;
  const previews = new Map(), completionNodes = new Map();
  function ensure() {
    if (!context) {
      const Audio = environment.AudioContext || environment.webkitAudioContext;
      if (!Audio) throw new Error('Sound is unavailable in this browser.');
      context = new Audio();
      context.addEventListener?.('statechange', () => stateListener?.(context.state));
      gain = context.createGain(); gain.gain.value = 0; gain.connect(context.destination);
    }
    return context;
  }
  function disconnect() {
    if (source) { source.stop(); source.disconnect(); source = null; }
    filter?.disconnect(); filter = null; selected = null;
  }
  function volume(value) { if (context) gain.gain.setTargetAtTime(value / 100 * .32, context.currentTime, .08); }
  async function play(kind, level) {
    const audio = ensure(), attempt = ++generation;
    const resumed = audio.resume(); // Called immediately from the user's action.
    if (kind !== selected) {
      disconnect();
      const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * 4), audio.sampleRate), data = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        previous = (previous + .02 * white) / 1.02;
        data[i] = kind === 'brown' ? previous * 3.5 : white * .45;
      }
      // Crossfade the seam into the opening samples for a quiet loop.
      const fade = Math.min(2048, data.length / 2);
      for (let i = 0; i < fade; i++) { const mix = i / (fade - 1); data[data.length - fade + i] = data[data.length - fade + i] * (1 - mix) + data[0] * mix; }
      source = audio.createBufferSource(); source.buffer = buffer; source.loop = true;
      filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = kind === 'brown' ? 800 : 1800;
      source.connect(filter); filter.connect(gain); source.start(); selected = kind;
    }
    volume(level);
    await resumed;
    if (attempt !== generation) return false;
    if (audio.state !== 'running') throw new Error('Sound was interrupted. Press Play to resume.');
    return true;
  }
  function clearNotes(notes) {
    for (const [oscillator, envelope] of notes) { oscillator.onended = null; oscillator.stop(); oscillator.disconnect(); envelope.disconnect(); }
    notes.clear();
  }
  function silenceChime() { previewGeneration++; previewPreparing = null; clearNotes(previews); }
  function cancelCompletion() { completionGeneration++; completion = null; clearNotes(completionNodes); }
  function pause() { generation++; disconnect(); rest(); }
  function stop() { pause(); }
  function rest() {
    if (!source && !previews.size && previewPreparing === null && !completionNodes.size && !completion && context?.state === 'running') context.suspend().catch(() => {});
  }
  function scheduleNotes(audio, choice, when, notes, finished = () => {}) {
    for (const note of chimeNotes(choice)) {
      const oscillator = audio.createOscillator(), envelope = audio.createGain(), time = when + note.delay;
      oscillator.type = note.waveform || 'sine'; oscillator.frequency.value = note.frequency;
      envelope.gain.setValueAtTime(0, time); envelope.gain.linearRampToValueAtTime(note.level, time + .015);
      if (note.hold) envelope.gain.setValueAtTime(note.level, time + .015 + note.hold);
      envelope.gain.exponentialRampToValueAtTime(.0001, time + note.duration);
      oscillator.connect(envelope); envelope.connect(audio.destination);
      notes.set(oscillator, envelope);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); notes.delete(oscillator); if (!notes.size) finished(); rest(); };
      oscillator.start(time); oscillator.stop(time + note.duration + .025);
    }
  }
  async function chime(choice = 'soft') {
    silenceChime(); const attempt = previewGeneration; previewPreparing = attempt;
    try {
      const audio = ensure(); await audio.resume();
      if (attempt !== previewGeneration) return false;
      if (audio.state !== 'running') throw new Error('Sound is unavailable. Try Preview again.');
      previewPreparing = null; scheduleNotes(audio, choice, audio.currentTime, previews); return true;
    } catch (error) { if (attempt === previewGeneration) silenceChime(); throw error; }
    finally { if (previewPreparing === attempt) previewPreparing = null; rest(); }
  }
  async function scheduleChime(deadline, choice = 'soft') {
    cancelCompletion(); const attempt = completionGeneration, plan = { deadline, time: null }; completion = plan;
    try {
      const audio = ensure(); await audio.resume();
      if (attempt !== completionGeneration || completion !== plan) return false;
      const delay = (deadline - Date.now()) / 1000;
      if (delay <= 0) { cancelCompletion(); return false; }
      if (audio.state !== 'running') throw new Error('Time-up sound is unavailable. Use Preview to enable sound.');
      plan.time = audio.currentTime + delay;
      // Native audio timing keeps the alarm independent of hidden-tab JS callbacks.
      scheduleNotes(audio, choice, plan.time, completionNodes, () => { if (completion === plan) completion = null; });
      return true;
    } catch (error) { if (completion === plan) cancelCompletion(); throw error; }
    finally { rest(); }
  }
  function expireCompletion() {
    // A sleeping/suspended audio clock must not play a missed alarm on return.
    if (completion && (completion.time === null || completion.time > context.currentTime + .1)) cancelCompletion();
  }
  return { play, pause, stop, rest, volume, chime, silenceChime, scheduleChime, cancelCompletion, expireCompletion, onState(listener) { stateListener = listener; }, get state() { return context?.state; } };
}

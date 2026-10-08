import { chimeNotes } from './chimes.mjs';
// One context, one looping source. No recording transfers or idle processing.
export function createAudioPlayer(environment = globalThis) {
  let context = null, source = null, gain = null, filter = null, selected = null, generation = 0, stateListener = null, alarmGeneration = 0;
  const alarms = new Map();
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
  function silenceChime() { alarmGeneration++; for (const [oscillator, envelope] of alarms) { oscillator.onended = null; oscillator.stop(); oscillator.disconnect(); envelope.disconnect(); } alarms.clear(); }
  function pause() { generation++; disconnect(); silenceChime(); context?.suspend().catch(() => {}); }
  function stop() { pause(); }
  function rest() { if (!source && !alarms.size) pause(); }
  function prime() { try { ensure().resume().catch(() => {}); } catch {} }
  async function chime(choice = 'soft') {
    const audio = ensure(); silenceChime(); const attempt = alarmGeneration;
    await audio.resume();
    if (attempt !== alarmGeneration) return false;
    if (audio.state !== 'running') throw new Error('Sound is unavailable. Try Preview again.');
    const now = audio.currentTime;
    for (const note of chimeNotes(choice)) {
      const oscillator = audio.createOscillator(), envelope = audio.createGain(), time = now + note.delay;
      oscillator.type = 'sine'; oscillator.frequency.value = note.frequency;
      envelope.gain.setValueAtTime(0, time); envelope.gain.linearRampToValueAtTime(note.level, time + .015); envelope.gain.exponentialRampToValueAtTime(.0001, time + note.duration);
      oscillator.connect(envelope); envelope.connect(audio.destination);
      alarms.set(oscillator, envelope);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); alarms.delete(oscillator); if (!source && !alarms.size) audio.suspend().catch(() => {}); };
      oscillator.start(time); oscillator.stop(time + note.duration + .025);
    }
    return true;
  }
  return { play, pause, stop, rest, volume, prime, chime, silenceChime, onState(listener) { stateListener = listener; }, get state() { return context?.state; } };
}

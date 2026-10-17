import { sounds, soundChoice } from './sounds.mjs';

// Let the browser stream and loop files; no AudioContext, sample generation,
// decoded recording copies, or live MediaStream is needed for ambient playback.
export function createAmbientPlayer(environment = globalThis) {
  let media = null, selected = null, generation = 0, active = false, listener = null;
  function volume(value) { if (media) media.volume = Math.max(0, Math.min(1, value / 100)) * .32; }
  async function play(kind, level) {
    const attempt = ++generation;
    kind = soundChoice(kind);
    if (!media) {
      if (typeof environment.Audio !== 'function') throw new Error('Sound is unavailable in this browser.');
      media = new environment.Audio();
      media.preload = 'none'; media.loop = true;
      const interrupted = () => {
        if (active && (media.paused || media.error)) { active = false; selected = null; listener?.('interrupted'); }
      };
      media.addEventListener('pause', interrupted); media.addEventListener('error', interrupted);
    }
    if (selected !== kind) {
      active = false;
      media.pause();
      media.src = new URL(`../../audio/ambient/${sounds[kind].file}`, import.meta.url).href;
      selected = kind;
    }
    volume(level);
    try {
      await media.play();
      if (attempt !== generation) return false;
      if (media.paused || media.error) throw new Error('Sound was interrupted. Press Play to resume.');
      active = true;
      return true;
    } catch (error) {
      if (attempt !== generation) return false;
      active = false; media.pause(); selected = null; media.removeAttribute('src'); media.load(); throw error;
    }
  }
  function pause() { generation++; active = false; media?.pause(); }
  function stop() { pause(); if (media) { media.removeAttribute('src'); media.load(); } selected = null; }
  return { play, pause, stop, volume, onState(callback) { listener = callback; } };
}

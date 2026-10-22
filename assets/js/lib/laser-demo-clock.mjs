// A local replay clock lets the unchanged extension pause and seek with the demo.
export function createReplayClock() {
  let now = 0, nextId = 0;
  const frames = new Map(), timers = new Map();
  return {
    get now() { return now; },
    requestFrame(callback) { const id = ++nextId; frames.set(id, callback); return id; },
    cancelFrame(id) { frames.delete(id); },
    setTimer(callback, delay = 0, ...args) { const id = ++nextId; timers.set(id, { at: now + Math.max(0, Number(delay)), callback, args }); return id; },
    clearTimer(id) { timers.delete(id); },
    step(time) {
      if (time < now) throw new Error('Reset the replay before moving backwards.');
      now = time;
      // Callbacks can schedule another timer; run due timers before the paint.
      for (let count = 0; count < 1000; count++) {
        const due = [...timers].filter(([, timer]) => timer.at <= now).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        timers.delete(due[0]); due[1].callback(...due[1].args);
      }
      const pending = [...frames.values()]; frames.clear();
      pending.forEach(callback => callback(now));
    },
    reset() { frames.clear(); timers.clear(); now = 0; },
    get pending() { return { frames: frames.size, timers: timers.size }; }
  };
}

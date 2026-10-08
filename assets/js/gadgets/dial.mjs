// The shared timer supplies ticks; the dial needs no extra animation loop.
export function createDial(display, ring) {
  let previous = null;
  return {
    render(timer, milliseconds) {
      const duration = timer?.duration || milliseconds, phase = timer?.phase || 'focus', round = timer?.round || 1;
      const fraction = duration > 0 ? Math.max(0, Math.min(1, milliseconds / duration)) : 0;
      const running = timer?.status === 'running', elapsed = previous ? previous.milliseconds - milliseconds : 0;
      const smooth = running && previous?.running && previous.duration === duration && previous.phase === phase && previous.round === round && elapsed > 0 && elapsed <= 1500;
      display.dataset.phase = phase;
      display.dataset.dialMotion = smooth ? 'smooth' : 'still';
      ring.setAttribute('stroke-dasharray', `${fraction} 1`);
      ring.style.opacity = fraction === 0 ? '0' : '1';
      previous = { duration, phase, round, running, milliseconds };
    }
  };
}

export function enableProblemNumberStrip(strip, getActive) {
  function fades() {
    const end = Math.max(0, strip.scrollWidth - strip.clientWidth);
    strip.style.setProperty('--fade-left', strip.scrollLeft > 1 ? 'transparent' : '#000');
    strip.style.setProperty('--fade-right', strip.scrollLeft < end - 1 ? 'transparent' : '#000');
  }
  function revealActive() {
    const button = getActive();
    if (!button) return;
    const margin = strip.scrollWidth > strip.clientWidth ? 28 : 0;
    const left = button.offsetLeft;
    const right = left + button.offsetWidth;
    if (left < strip.scrollLeft + margin) strip.scrollLeft = Math.max(0, left - margin);
    else if (right > strip.scrollLeft + strip.clientWidth - margin) strip.scrollLeft = right - strip.clientWidth + margin;
    fades();
  }
  let drag = null;
  let suppressClick = false;
  strip.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (drag || event.isPrimary === false || event.button !== 0) { drag = null; return; }
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, scroll: strip.scrollLeft, moving: false };
  });
  strip.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moving) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      drag.moving = true; strip.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    strip.scrollLeft = drag.scroll - dx;
    fades();
  });
  strip.addEventListener('pointerup', event => { if (drag?.id === event.pointerId) { suppressClick = drag.moving; drag = null; } });
  strip.addEventListener('pointercancel', () => { drag = null; });
  strip.addEventListener('lostpointercapture', () => { drag = null; });
  strip.addEventListener('click', event => { if (suppressClick) { suppressClick = false; event.preventDefault(); event.stopPropagation(); } }, true);
  strip.addEventListener('scroll', fades, { passive: true });
  new ResizeObserver(revealActive).observe(strip);
  return revealActive;
}

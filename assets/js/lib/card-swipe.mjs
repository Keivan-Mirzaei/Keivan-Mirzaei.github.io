export function enableCardSwipe(container, { selector, canStep, onStep }) {
  let gesture = null;
  let suppressClick = false;
  const reset = () => {
    if (!gesture) return;
    gesture.card.style.transform = '';
    gesture.card.classList.remove('is-swiping');
    gesture = null;
  };
  container.addEventListener('pointerdown', event => {
    if (gesture) { reset(); return; }
    if (event.isPrimary === false || event.button !== 0) return;
    suppressClick = false;
    const card = event.target.closest(selector);
    if (!card || event.target.closest('button, a, input, select, textarea, summary')) return;
    for (let node = event.target; node && node !== card; node = node.parentElement) {
      if (node.scrollWidth > node.clientWidth + 2) return;
    }
    gesture = { card, id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
  });
  container.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.horizontal) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { reset(); return; }
      if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      gesture.horizontal = true;
      gesture.card.classList.add('is-swiping');
      gesture.card.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const step = dx < 0 ? 1 : -1;
    gesture.card.style.transform = `translateX(${Math.max(-45, Math.min(45, dx * (canStep(step) ? .25 : .08)))}px)`;
  });
  container.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    const step = dx < 0 ? 1 : -1;
    const change = gesture.horizontal && Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.5 && canStep(step);
    suppressClick = gesture.horizontal;
    reset();
    if (change) onStep(step);
  });
  container.addEventListener('pointercancel', reset);
  container.addEventListener('lostpointercapture', reset);
  container.addEventListener('click', event => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopPropagation();
  }, true);
}

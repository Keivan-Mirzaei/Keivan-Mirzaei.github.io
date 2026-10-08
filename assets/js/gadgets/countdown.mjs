// Animate only changed digits. No frame loop, layout jumps, or motion on resets.
export function createCountdown(element) {
  const document = element.ownerDocument, motion = document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Map();
  let previous = '', slots = [];
  function cancel() { for (const cleanup of [...active.values()]) cleanup(); }
  function render(value, animate = false) {
    if (value === previous) return;
    if (!animate) cancel();
    element.setAttribute('aria-label', value);
    if (slots.length !== value.length) {
      cancel();
      slots = [...value].map(character => {
        const slot = document.createElement('span'), digit = document.createElement('span');
        slot.className = character === ':' ? 'gadget-time-separator' : 'gadget-time-digit';
        slot.setAttribute('aria-hidden', 'true'); digit.textContent = character; slot.append(digit);
        return slot;
      });
      element.replaceChildren(...slots); previous = value; return;
    }
    [...value].forEach((character, index) => {
      if (character === previous[index]) return;
      const slot = slots[index], digit = slot.firstElementChild;
      active.get(slot)?.();
      const oldValue = digit.textContent;
      digit.textContent = character;
      if (!animate || motion?.matches || typeof digit.animate !== 'function' || character === ':') return;
      const outgoing = document.createElement('span');
      outgoing.className = 'gadget-digit-previous'; outgoing.textContent = oldValue; slot.append(outgoing);
      const timing = { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' };
      const animations = [
        digit.animate([{ opacity: 0, transform: 'translateY(12%)' }, { opacity: 1, transform: 'translateY(0)' }], timing),
        outgoing.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-12%)' }], timing)
      ];
      const cleanup = () => { animations.forEach(animation => animation.cancel()); outgoing.remove(); if (active.get(slot) === cleanup) active.delete(slot); };
      active.set(slot, cleanup);
      Promise.all(animations.map(animation => animation.finished)).then(cleanup, cleanup);
    });
    previous = value;
  }
  motion?.addEventListener('change', cancel);
  return { render, dispose() { cancel(); motion?.removeEventListener('change', cancel); } };
}

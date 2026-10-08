// Preserve the number field's keyboard editing, validation, and normal input event.
export function initializeStepper(wrapper, fallback = () => 1) {
  const input = wrapper.querySelector('input'), buttons = [...wrapper.querySelectorAll('[data-number-step]')], events = new AbortController();
  function update() {
    for (const button of buttons) button.disabled = input.disabled || input.validity.valid && (Number(button.dataset.numberStep) < 0 ? Number(input.value) <= Number(input.min) : Number(input.value) >= Number(input.max));
  }
  for (const button of buttons) button.addEventListener('click', () => {
    if (button.disabled || input.disabled) return;
    const current = input.validity.valid ? Number(input.value) : fallback(), direction = Number(button.dataset.numberStep), step = Math.abs(direction);
    const next = (direction > 0 ? Math.floor(current / step) + 1 : Math.ceil(current / step) - 1) * step;
    input.value = Math.max(Number(input.min), Math.min(Number(input.max), next));
    const EventType = input.ownerDocument?.defaultView?.Event || Event;
    input.dispatchEvent(new EventType('input', { bubbles: true })); update();
  }, { signal: events.signal });
  input.addEventListener('input', update, { signal: events.signal }); update();
  return { update, dispose() { events.abort(); } };
}

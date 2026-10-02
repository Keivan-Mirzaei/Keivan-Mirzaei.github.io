// Updating an action's name must preserve its icon. Article widgets keep text buttons.
export function setActionLabel(button, label) {
  if (!button) return;
  button.setAttribute('aria-label', label);
  button.setAttribute('data-tooltip', label);
  if (button.dataset?.puzzleIcon === undefined) button.textContent = label;
}

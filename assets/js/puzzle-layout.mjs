// Settings, Help and puzzle pickers share dismissal and focus behaviour.
export function initializePuzzlePanels(root, document = root.ownerDocument) {
  const panels = [...root.querySelectorAll('[data-puzzle-panel], [data-puzzle-picker]')];
  function close(panel, restoreFocus = false) {
    panel.open = false;
    if (restoreFocus) panel.querySelector('summary').focus({ preventScroll: true });
  }
  panels.forEach(panel => panel.addEventListener('toggle', () => {
    if (panel.open) panels.filter(other => other !== panel && other.open).forEach(other => close(other));
  }));
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    const panel = panels.find(panel => panel.open);
    if (panel) { event.preventDefault(); close(panel, true); }
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-puzzle-panel-close]');
    if (button) {
      const panel = panels.find(panel => panel.contains(button));
      if (panel) close(panel, true);
    }
  });
  document.addEventListener('click', event => {
    panels.filter(panel => panel.open && !panel.contains(event.target)).forEach(panel => close(panel));
  });
}
if (typeof document !== 'undefined') document.querySelectorAll('[data-puzzle-workspace]').forEach(root => initializePuzzlePanels(root));

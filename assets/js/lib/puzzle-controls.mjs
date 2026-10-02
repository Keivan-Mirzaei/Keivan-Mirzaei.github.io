// Keep the same undo gesture across games, without taking over text editing.
export function bindUndoShortcut(root, button, undo) {
  button.setAttribute('aria-keyshortcuts', 'u Control+z Meta+z');
  button.setAttribute('title', 'Undo (U or Ctrl/⌘ Z)');
  root.addEventListener('keydown', event => {
    const target = event.target;
    if (event.repeat || event.altKey || event.shiftKey || button.disabled
      || target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;
    const key = event.key?.toLowerCase();
    if ((key === 'u' && !event.ctrlKey && !event.metaKey)
      || (key === 'z' && (event.ctrlKey || event.metaKey))) {
      event.preventDefault(); undo();
    }
  });
}

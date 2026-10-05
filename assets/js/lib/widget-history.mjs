// Shared action history for explorers and simulations. View-only panels stay out.
export function createWidgetHistory(read, restore, changed = () => {}, limit = 60) {
  const past = [], future = [];
  const copy = value => structuredClone(value);
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const notify = () => changed(past.length > 0, future.length > 0);
  const push = (stack, state) => { stack.push(copy(state)); if (stack.length > limit) stack.shift(); };
  return {
    capture: () => copy(read()),
    commit(before) {
      if (equal(before, read())) return false;
      push(past, before); future.length = 0; notify(); return true;
    },
    change(action) { const before = copy(read()); action(); return this.commit(before); },
    undo() {
      if (!past.length) return false;
      push(future, read()); restore(past.pop()); notify(); return true;
    },
    redo() {
      if (!future.length) return false;
      push(past, read()); restore(future.pop()); notify(); return true;
    },
    cancel(before) { restore(copy(before)); notify(); },
    clear() { past.length = future.length = 0; notify(); },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
  };
}

// Pointer drags and held arrow keys each commit once. Cancel preserves Redo.
export function bindWidgetHistorySlider(control, history, update, signal) {
  let before = null, held = false;
  const listen = (type, listener) => control.addEventListener(type, listener, { signal });
  const begin = () => { before ??= history.capture(); };
  const finish = () => { if (before !== null) history.commit(before); before = null; held = false; };
  listen('pointerdown', () => { begin(); held = true; });
  listen('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) { begin(); held = true; }
  });
  listen('input', () => { begin(); update(); });
  listen('change', () => { if (!held) finish(); });
  listen('pointerup', finish);
  listen('keyup', event => { if (held && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) finish(); });
  listen('blur', finish);
  listen('pointercancel', () => { if (before !== null) history.cancel(before); before = null; held = false; });
  return finish;
}

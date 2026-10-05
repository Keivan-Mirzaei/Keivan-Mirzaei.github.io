// Backward-compatible snapshots for article controllers, with shared Redo.
export function createHistory(read, restore, onChange = () => {}, limit = 60) {
  const past = [], future = [];
  let applying = false;
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const copy = value => structuredClone(value);
  const push = (stack, value) => { stack.push(copy(value)); if (stack.length > limit) stack.shift(); };
  const notify = () => onChange(past.length > 0, future.length > 0);
  const history = {
    capture: () => copy(read()),
    remember(state = read()) {
      if (applying) return;
      if (!equal(past.at(-1), state)) push(past, state);
      future.length = 0; notify();
    },
    commit(before) { if (equal(before, read())) return false; this.remember(before); return true; },
    change(action) { const before = this.capture(); action(); return this.commit(before); },
    undo() {
      while (past.length && equal(past.at(-1), read())) past.pop();
      if (!past.length) { notify(); return false; }
      push(future, read()); applying = true;
      try { restore(past.pop()); } finally { applying = false; }
      notify(); return true;
    },
    redo() {
      if (!future.length) return false;
      push(past, read()); applying = true;
      try { restore(future.pop()); } finally { applying = false; }
      notify(); return true;
    },
    cancel(before) { applying = true; try { restore(copy(before)); } finally { applying = false; } notify(); },
    clear() { past.length = future.length = 0; notify(); },
    get size() { return past.length; },
    get canRedo() { return future.length > 0; }
  };
  return history;
}

export function bindPanelHistory(widget, { read, restore, reset, signal }) {
  const undo = widget.querySelector('[data-panel-undo]');
  const redo = widget.querySelector('[data-panel-redo]');
  const resetButton = widget.querySelector('[data-panel-reset]');
  if (undo) undo.disabled = true;
  if (redo) redo.disabled = true;
  const history = createHistory(read, restore, (canUndo, canRedo) => {
    if (undo) undo.disabled = !canUndo;
    if (redo) redo.disabled = !canRedo;
  });
  undo?.addEventListener('click', () => history.undo(), { signal });
  redo?.addEventListener('click', () => history.redo(), { signal });
  if (reset && resetButton) {
    resetButton.disabled = false;
    resetButton.addEventListener('click', () => history.change(reset), { signal });
  }
  return history;
}

// Commit after a gesture, so a canceled or unchanged edit preserves Redo.
export function trackControlEdits(controls, history, signal) {
  let editing = null, before = null, held = false;
  const begin = control => {
    if (editing !== control) finish();
    if (before === null) { editing = control; before = history.capture(); }
  };
  const finish = () => { if (before !== null) history.commit(before); editing = null; before = null; held = false; };
  const keys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'];
  for (const control of controls) {
    const listen = (type, fn, capture = false) => control.addEventListener(type, fn, { capture, signal });
    const discrete = control.tagName === 'SELECT';
    listen('pointerdown', () => { if (!discrete) { begin(control); held = true; } }, true);
    listen('keydown', event => { if (!discrete && keys.includes(event.key)) { begin(control); held = true; } }, true);
    listen('input', () => begin(control), true);
    listen('change', () => begin(control), true);
    listen('change', () => { if (discrete || !held) queueMicrotask(finish); });
    listen('pointerup', () => { if (!discrete) finish(); });
    listen('keyup', event => { if (!discrete && keys.includes(event.key)) finish(); });
    listen('blur', finish);
    listen('pointercancel', () => { if (before !== null) history.cancel(before); editing = null; before = null; held = false; });
  }
  return finish;
}

export function bindInputHistory(widget, controls, update, reset) {
  const read = () => controls.map(control => control.value);
  const restore = values => { controls.forEach((control, i) => { control.value = values[i]; }); update(); };
  const history = bindPanelHistory(widget, { read, restore, reset });
  let baseline = read(), before = null, held = false;
  const begin = () => { before ??= structuredClone(baseline); };
  const finish = () => {
    if (before !== null) history.commit(before);
    baseline = read(); before = null; held = false;
  };
  const keys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'];
  for (const control of controls) {
    const discrete = control.tagName === 'SELECT';
    control.addEventListener('pointerdown', () => { if (!discrete) { begin(); held = true; } });
    control.addEventListener('keydown', event => { if (!discrete && keys.includes(event.key)) { begin(); held = true; } });
    control.addEventListener('input', begin, { capture: true });
    control.addEventListener('change', begin, { capture: true });
    control.addEventListener('change', () => { if (discrete || !held) queueMicrotask(finish); });
    control.addEventListener('pointerup', () => { if (!discrete) finish(); });
    control.addEventListener('keyup', event => { if (!discrete && keys.includes(event.key)) finish(); });
    control.addEventListener('blur', finish);
    control.addEventListener('pointercancel', () => { if (before !== null) history.cancel(before); before = null; held = false; baseline = read(); });
  }
  for (const action of ['undo','redo','reset']) widget.querySelector(`[data-panel-${action}]`)?.addEventListener('click', () => { baseline = read(); before = null; held = false; });
  return history;
}

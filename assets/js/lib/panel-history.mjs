// One entry per committed edit, with a bound on memory for long sessions.
export function createHistory(read, restore, onChange = () => {}, limit = 60) {
  const entries = [];
  let applying = false;
  return {
    remember(state = read()) {
      if (applying) return;
      const copy = structuredClone(state);
      if (JSON.stringify(entries.at(-1)) !== JSON.stringify(copy)) entries.push(copy);
      if (entries.length > limit) entries.shift();
      onChange(entries.length > 0);
    },
    undo() {
      if (!entries.length) return;
      applying = true;
      try { restore(entries.pop()); } finally { applying = false; }
      onChange(entries.length > 0);
    },
    clear() { entries.length = 0; onChange(false); },
    get size() { return entries.length; }
  };
}

export function bindPanelHistory(widget, { read, restore, reset }) {
  const undo = widget.querySelector('[data-panel-undo]');
  const resetButton = widget.querySelector('[data-panel-reset]');
  const history = createHistory(read, restore, available => { if (undo) undo.disabled = !available; });
  undo?.addEventListener('click', () => history.undo());
  if (reset && resetButton) {
    resetButton.disabled = false;
    resetButton.addEventListener('click', () => { history.remember(); reset(); });
  }
  return history;
}

// A slider drag is one edit, even if it produces hundreds of input events.
export function bindInputHistory(widget, controls, update, reset) {
  const read = () => controls.map(control => control.value);
  const restore = values => { controls.forEach((control, i) => { control.value = values[i]; }); update(); };
  const history = bindPanelHistory(widget, { read, restore, reset });
  let before = read();
  for (const control of controls) {
    control.addEventListener('change', () => {
      if (JSON.stringify(before) !== JSON.stringify(read())) history.remember(before);
      before = read();
    });
  }
  widget.querySelector('[data-panel-undo]')?.addEventListener('click', () => { before = read(); });
  widget.querySelector('[data-panel-reset]')?.addEventListener('click', () => { before = read(); });
  return history;
}

// For controllers with internal state, capture before their input handler runs.
export function trackControlEdits(controls, history) {
  let editing = null;
  for (const control of controls) {
    control.addEventListener('input', () => {
      if (editing !== control) history.remember();
      editing = control;
    }, { capture: true });
    control.addEventListener('change', () => {
      if (editing !== control) history.remember();
      editing = null;
    }, { capture: true });
  }
}

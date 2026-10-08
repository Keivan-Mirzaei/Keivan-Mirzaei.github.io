export function initializeThreeCups(widget) {
  const cups = [...widget.querySelectorAll('[data-cup]')];
  const count = widget.querySelector('[data-cups-count]');
  const status = widget.querySelector('[data-cups-status]');
  const flip = widget.querySelector('[data-cups-flip]');
  const reset = widget.querySelector('[data-cups-reset]');
  const undo = widget.querySelector('[data-cups-undo]');
  const history = [], future = [];
  const redo = widget.querySelector('[data-cups-redo]');
  let facingUp = [false, false, false];
  const selected = new Set();
  let moves = 0;

  function render(message) {
    cups.forEach((cup, index) => {
      const facing = facingUp[index] ? 'up' : 'down';
      const isSelected = selected.has(index);
      cup.dataset.facing = facing;
      cup.setAttribute('aria-pressed', String(isSelected));
      cup.setAttribute('aria-label', `Cup ${index + 1}, facing ${facing}, ${isSelected ? 'selected' : 'not selected'}`);
      cup.querySelector('[data-cup-orientation]').textContent = `Facing ${facing}`;
      cup.querySelector('[data-cup-selection]').textContent = isSelected ? 'Selected' : 'Select';
    });
    count.textContent = `${moves} ${moves === 1 ? 'move' : 'moves'} · ${facingUp.filter(Boolean).length} of 3 up`;
    flip.disabled = selected.size !== 2;
    if (undo) undo.disabled = history.length === 0;
    if (redo) redo.disabled = future.length === 0;
    status.textContent = message;
  }

  function selectionMessage() {
    if (selected.size === 0) return 'Select two cups to flip together.';
    const numbers = [...selected].sort().map(index => index + 1);
    if (selected.size === 1) return `Cup ${numbers[0]} selected. Select one more cup.`;
    return `Cups ${numbers.join(' and ')} selected. Press Flip selected to turn both over.`;
  }

  cups.forEach((cup, index) => {
    cup.disabled = false;
    cup.addEventListener('click', () => {
      if (selected.has(index)) selected.delete(index);
      else if (selected.size < 2) selected.add(index);
      else {
        render('Two cups are selected. Deselect a cup to choose another pair.');
        return;
      }
      render(selectionMessage());
    });
  });

  flip.addEventListener('click', () => {
    if (selected.size !== 2) return;
    future.length = 0;
    history.push({ facingUp: [...facingUp], moves });
    if (history.length > 60) history.shift();
    const pair = [...selected].sort();
    pair.forEach(index => { facingUp[index] = !facingUp[index]; });
    moves += 1;
    selected.clear();
    const upCount = facingUp.filter(Boolean).length;
    render(`Cups ${pair.map(index => index + 1).join(' and ')} flipped. ${upCount} of 3 cups face up. Select two cups for your next move.`);
    cups[pair[0]].focus({ preventScroll: true });
  });

  reset.disabled = false;
  reset.addEventListener('click', () => {
    if (moves === 0) { selected.clear(); render('All three cups face down. Select two cups to begin.'); return; }
    future.length = 0;
    history.push({ facingUp: [...facingUp], moves });
    if (history.length > 60) history.shift();
    facingUp = [false, false, false];
    moves = 0;
    selected.clear();
    render('Reset: all three cups face down. Select two cups to begin.');
    cups[0].focus({ preventScroll: true });
  });

  undo?.addEventListener('click', () => {
    if (!history.length) return;
    future.push({ facingUp: [...facingUp], moves });
    ({ facingUp, moves } = history.pop());
    selected.clear();
    render('Move undone. Select two cups for your next move.');
  });

  redo?.addEventListener('click', () => {
    if (!future.length) return;
    history.push({ facingUp: [...facingUp], moves });
    ({ facingUp, moves } = future.pop()); selected.clear();
    render('Move restored. Select two cups for your next move.');
  });
  render('Select two cups to begin.');
}

export function mount(root) {
  const cleanups = [];
  root.querySelectorAll('[data-three-cups]').forEach(initializeThreeCups);
  return () => cleanups.forEach(cleanup => cleanup());
}

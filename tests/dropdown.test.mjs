import test from 'node:test';
import assert from 'node:assert/strict';
import { commitDropdownSelection } from '../assets/js/lib/dropdown.mjs';
import { createHistory, trackControlEdits, bindInputHistory } from '../assets/js/lib/panel-history.mjs';

function selectControl(values = ['easy', 'medium', 'hard']) {
  const select = new EventTarget();
  select.tagName = 'SELECT'; select.selectedIndex = 0;
  select.options = values.map(value => ({ value, disabled: false }));
  Object.defineProperty(select, 'value', {
    get() { return this.options[this.selectedIndex]?.value || ''; },
    set(value) { this.selectedIndex = this.options.findIndex(option => option.value === value); }
  });
  return select;
}

test('a menu commit emits one input and change and stays compatible with activity history', async () => {
  const select = selectControl();
  let difficulty = select.value;
  const events = [];
  const history = createHistory(() => difficulty, value => { difficulty = select.value = value; });
  trackControlEdits([select], history);
  select.addEventListener('input', event => events.push([event.type, event.bubbles]));
  select.addEventListener('change', event => { events.push([event.type, event.bubbles]); difficulty = select.value; });
  assert.equal(commitDropdownSelection(select, 1), true);
  await Promise.resolve();
  assert.deepEqual(events, [['input', true], ['change', true]]);
  assert.equal(difficulty, 'medium'); assert.equal(history.size, 1);
  history.undo(); assert.equal(select.value, 'easy');
  history.redo(); assert.equal(select.value, 'medium');
});

test('choosing the current option preserves Redo and emits no activity events', async () => {
  const select = selectControl();
  let value = select.value, changes = 0;
  const history = createHistory(() => value, old => { value = select.value = old; });
  trackControlEdits([select], history);
  select.addEventListener('change', () => { value = select.value; changes++; });
  commitDropdownSelection(select, 1); await Promise.resolve(); history.undo();
  assert.equal(commitDropdownSelection(select, 0), false); await Promise.resolve();
  assert.equal(changes, 1); assert.equal(history.canRedo, true);
  history.redo(); assert.equal(select.value, 'medium');
});

test('disabled controls, options, groups, and invalid indices cannot commit', () => {
  const select = selectControl(); let changes = 0;
  select.addEventListener('change', () => changes++);
  select.disabled = true; assert.equal(commitDropdownSelection(select, 1), false);
  select.disabled = false; select.options[1].disabled = true;
  assert.equal(commitDropdownSelection(select, 1), false);
  select.options[2].parentElement = { disabled: true };
  assert.equal(commitDropdownSelection(select, 2), false);
  assert.equal(commitDropdownSelection(select, -1), false);
  assert.equal(commitDropdownSelection(select, 99), false);
  assert.equal(select.value, 'easy'); assert.equal(changes, 0);
});

test('function selection and its dependent parameters remain one reversible action', async () => {
  const select = selectControl(['absolute', 'square']);
  const slope = new EventTarget(); slope.value = '0';
  const buttons = Object.fromEntries(['undo', 'redo'].map(name => [name, new EventTarget()]));
  const widget = { querySelector: selector => buttons[selector.match(/data-panel-(\w+)/)?.[1]] };
  const history = bindInputHistory(widget, [select, slope], () => {});
  select.addEventListener('change', () => { slope.value = select.value === 'square' ? '2' : '0'; });
  commitDropdownSelection(select, 1); await Promise.resolve();
  assert.equal(history.size, 1); assert.equal(slope.value, '2');
  history.undo(); assert.deepEqual([select.value, slope.value], ['absolute', '0']);
  history.redo(); assert.deepEqual([select.value, slope.value], ['square', '2']);
});

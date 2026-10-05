import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeProgressReset } from '../assets/js/lib/widget-progress.mjs';

function fixture() {
  let resets = 0;
  const fields = Object.fromEntries(['reset', 'confirm', 'apply', 'cancel', 'message'].map(name => {
    const field = { hidden: false, disabled: true, textContent: '', focus() { this.focused = true; } };
    field.addEventListener = (_, callback, { signal }) => { field.click = callback; signal.addEventListener('abort', () => { field.click = () => {}; }); };
    return [name, field];
  }));
  const dispose = initializeProgressReset({ querySelector: selector => fields[selector.match(/data-widget-progress-([^\]]+)/)[1]] }, () => resets++);
  return { fields, dispose, resets: () => resets };
}

test('progress reset requires explicit confirmation and Cancel preserves progress', () => {
  const f = fixture(); assert.equal(f.fields.confirm.hidden, true);
  f.fields.reset.click(); assert.equal(f.resets(), 0); assert.equal(f.fields.confirm.hidden, false);
  assert.equal(f.fields.apply.focused, true);
  f.fields.cancel.click(); assert.equal(f.resets(), 0); assert.equal(f.fields.confirm.hidden, true);
  assert.equal(f.fields.reset.focused, true);
  f.fields.reset.click(); f.fields.apply.click();
  assert.equal(f.resets(), 1); assert.equal(f.fields.confirm.hidden, true);
  assert.match(f.fields.message.textContent, /Progress reset/);
});

test('disposing the progress control removes its reset handlers', () => {
  const f = fixture(); f.fields.reset.click(); f.dispose(); f.fields.apply.click();
  assert.equal(f.resets(), 0); assert.equal(f.fields.confirm.hidden, true);
});

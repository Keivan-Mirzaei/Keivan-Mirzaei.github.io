import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeStepper } from '../assets/js/gadgets/stepper.mjs';

function fixture() {
  const input = Object.assign(new EventTarget(), { value: '5', min: '1', max: '120', disabled: false, ownerDocument: { defaultView: { Event } } });
  Object.defineProperty(input, 'validity', { get: () => ({ valid: input.value !== '' && Number(input.value) >= 1 && Number(input.value) <= 120 }) });
  const buttons = [-1, 1].map(step => Object.assign(new EventTarget(), { dataset: { numberStep: String(step) } }));
  const controller = initializeStepper({ querySelector: () => input, querySelectorAll: () => buttons }, () => 5);
  return { input, buttons, controller };
}

test('reminder buttons emit normal input changes, recover an empty field, and respect both bounds', () => {
  const { input, buttons, controller } = fixture(); let events = 0;
  input.addEventListener('input', () => events++);
  buttons[0].dispatchEvent(new Event('click')); assert.equal(Number(input.value), 4); assert.equal(events, 1);
  input.value = ''; buttons[1].dispatchEvent(new Event('click')); assert.equal(Number(input.value), 6);
  input.value = '1'; input.dispatchEvent(new Event('input')); assert.equal(buttons[0].disabled, true);
  buttons[0].dispatchEvent(new Event('click')); assert.equal(Number(input.value), 1);
  input.value = '120'; input.dispatchEvent(new Event('input')); assert.equal(buttons[1].disabled, true);
  controller.dispose(); input.value = '10'; buttons[0].dispatchEvent(new Event('click')); assert.equal(input.value, '10');
});

test('disabled timer duration cannot be changed by buttons and keyboard input updates their state', () => {
  const { input, buttons, controller } = fixture();
  input.disabled = true; controller.update(); buttons[1].dispatchEvent(new Event('click'));
  assert.equal(input.value, '5'); assert.ok(buttons.every(button => button.disabled));
  input.disabled = false; input.value = '1'; input.dispatchEvent(new Event('input'));
  assert.equal(buttons[0].disabled, true); assert.equal(buttons[1].disabled, false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { setActionLabel } from '../assets/js/lib/puzzle-controls.mjs';

test('changing an icon action name preserves its artwork and updates its accessible name and tooltip', () => {
  const attributes = new Map();
  const button = { dataset: { puzzleIcon: '' }, textContent: '', innerHTML: '<svg></svg>', setAttribute: (key, value) => attributes.set(key, value) };
  setActionLabel(button, 'Place hint');
  assert.equal(attributes.get('aria-label'), 'Place hint');
  assert.equal(attributes.get('data-tooltip'), 'Place hint');
  assert.equal(button.textContent, '');
  assert.equal(button.innerHTML, '<svg></svg>');
});

test('legacy article buttons retain visible text labels', () => {
  const button = { dataset: {}, setAttribute() {} };
  setActionLabel(button, 'Undo your turn');
  assert.equal(button.textContent, 'Undo your turn');
  assert.doesNotThrow(() => setActionLabel(null, 'Redo'));
});

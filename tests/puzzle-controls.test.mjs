import test from 'node:test';
import assert from 'node:assert/strict';
import { bindUndoShortcut } from '../assets/js/lib/puzzle-controls.mjs';

function fixture() {
  let listener, undone = 0, prevented = 0;
  const button = { disabled: false, setAttribute() {} };
  bindUndoShortcut({ addEventListener: (_, callback) => { listener = callback; } }, button, () => undone++);
  return { button, get undone() { return undone; }, get prevented() { return prevented; },
    key: (key, extras = {}) => listener({ key, target: { tagName: 'BUTTON' }, preventDefault: () => prevented++, ...extras }) };
}

test('U, Ctrl Z and Command Z perform the same undo gesture', () => {
  const f = fixture();
  f.key('u'); f.key('z', { ctrlKey: true }); f.key('z', { metaKey: true });
  assert.equal(f.undone, 3); assert.equal(f.prevented, 3);
});

test('undo shortcuts respect editing, sliders, modifiers and key repetition', () => {
  const f = fixture();
  f.key('z', { ctrlKey: true, target: { tagName: 'INPUT' } });
  f.key('z', { metaKey: true, target: { isContentEditable: true } });
  f.key('u', { repeat: true }); f.key('u', { altKey: true });
  f.key('z', { ctrlKey: true, shiftKey: true }); f.key('z');
  assert.equal(f.undone, 0); assert.equal(f.prevented, 0);
});

test('an empty game does not intercept the browser undo gesture', () => {
  const f = fixture(); f.button.disabled = true;
  f.key('z', { ctrlKey: true });
  assert.equal(f.undone, 0); assert.equal(f.prevented, 0);
});

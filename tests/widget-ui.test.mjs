import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeWidgetUI } from '../assets/js/lib/widget-ui.mjs';

class Element {
  constructor(tag = 'span') { this.tagName = tag.toUpperCase(); this.children = []; this.childNodes = []; this.attrs = {}; this.listeners = {}; this.dataset = {}; this.value = ''; this.classList = { add() {} }; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(key, value) { this.attrs[key] = value; }
  getAttribute(key) { return this.attrs[key]; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatchEvent(event) { for (const fn of this.listeners[event.type] || []) fn(event); }
  emit(type, extra = {}) { this.dispatchEvent({ type, ...extra }); }
  focus() { this.focused = true; }
  click() { if (!this.disabled) this.emit('click'); }
}

test('native panels start closed, stay open outside, coordinate, and Escape restores focus', () => {
  const first = new Element('details'), second = new Element('details');
  first.open = second.open = true;
  const summary = new Element('summary');
  first.querySelector = second.querySelector = () => summary;
  const widget = new Element();
  widget.querySelectorAll = selector => selector.startsWith('details.') ? [first, second] : [];
  initializeWidgetUI(widget); assert.equal(first.open, false); assert.equal(second.open, false);
  first.open = true; first.emit('toggle'); widget.emit('click');
  assert.equal(first.open, true);
  second.open = true; second.emit('toggle'); assert.equal(first.open, false);
  widget.emit('keydown', { key: 'Escape' }); assert.equal(second.open, false); assert.equal(summary.focused, true);
});

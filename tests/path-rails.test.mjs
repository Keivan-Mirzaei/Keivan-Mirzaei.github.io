import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../assets/js/lib/path-rails.mjs', import.meta.url), 'utf8').replace('export function', 'function');
function fixture() {
  const frames = [], observers = [];
  const style = () => ({ values: new Map(), setProperty(key, value) { this.values.set(key, value); } });
  const tracks = [0, 1].map(() => {
    const track = { style: style(), scrollLeft: 0, x: 90, y: 200, getBoundingClientRect() { return { left: this.x, top: this.y }; } };
    track.nodes = [100, 280, 460].map((x, index) => ({
      getBoundingClientRect() { return { left: track.x + x - track.scrollLeft - 5.5, top: track.y + 35, width: 11, height: 11 }; },
      closest: () => index === 1 ? {} : null,
    }));
    track.querySelectorAll = () => track.nodes;
    return track;
  });
  const modules = tracks.map((track, index) => ({
    getBoundingClientRect: () => ({ left: 50, top: 100 + index * 250 }),
    hasAttribute: () => index === 1, querySelector: () => track,
  }));
  const root = { style: style(), getBoundingClientRect: () => ({ left: 10, top: 20 }),
    querySelectorAll: selector => selector === '.course-outline-module' ? modules : tracks };
  vm.runInNewContext(source + '\nalignCoursePath(root);', {
    root, document: {}, requestAnimationFrame: callback => { frames.push(callback); return frames.length; },
    ResizeObserver: class { constructor(callback) { observers.push(callback); } observe() {} },
  });
  const flush = () => { while (frames.length) frames.shift()(); };
  return { root, tracks, frames, flush, resize: () => observers.forEach(callback => callback()) };
}

test('continuous rails use node centres and anchor the spotlight to the current module and topic', () => {
  const view = fixture(); view.flush();
  assert.equal(view.root.style.values.get('--spine-x'), '40.5px');
  assert.equal(view.root.style.values.get('--spine-start'), '99.5px');
  assert.equal(view.root.style.values.get('--spine-length'), '250px');
  assert.equal(view.root.style.values.get('--spine-spot'), '250px');
  assert.equal(view.tracks[0].style.values.get('--rail-y'), '40.5px');
  assert.equal(view.tracks[0].style.values.get('--rail-width'), '460px');
  assert.equal(view.tracks[0].style.values.get('--rail-spot'), '280px');
});

test('scrolling and reflow preserve rail alignment; resize work is coalesced and then idles', () => {
  const view = fixture(); view.flush();
  view.tracks[0].scrollLeft = 70;
  view.tracks[0].x = 120;
  view.resize(); view.resize();
  assert.equal(view.frames.length, 1);
  view.flush();
  assert.equal(view.tracks[0].style.values.get('--rail-width'), '460px');
  assert.equal(view.tracks[0].style.values.get('--rail-spot'), '280px');
  assert.equal(view.tracks[0].style.values.get('--rail-y'), '40.5px');
  assert.equal(view.frames.length, 0);
});

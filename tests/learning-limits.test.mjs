import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-limits.js', import.meta.url), 'utf8');
function explorer(plotWidth = 640, labelWidth = 108, labelHeight = 54) {
  const plotHeight = plotWidth * 370 / 640;
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', style: {}, offsetWidth: labelWidth, offsetHeight: labelHeight,
      getBoundingClientRect() { return id === 'limit-legend' ? {left: plotWidth * .9 - 54, top: plotHeight * .85 - 34, width: 54, height: 34} : {left: 0, top: 0, width: plotWidth, height: plotHeight}; },
      attrs: {}, handlers: {}, captured: null,
      setAttribute(name, value) { this.attrs[name] = value; },
      removeAttribute(name) { delete this.attrs[name]; },
      addEventListener(name, handler) { this.handlers[name] = handler; },
      setPointerCapture(id) { this.captured = id; },
      hasPointerCapture(id) { return this.captured === id; },
      releasePointerCapture() { this.captured = null; },
      focus() {},
    });
    return elements.get(id);
  };
  const svg = get('svg');
  svg.getScreenCTM = () => ({ inverse: () => ({}) });
  svg.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { x: (this.x - 10) * 2 }; } });
  vm.runInNewContext(source, { document: { getElementById: get, querySelector: () => svg } });
  const event = (clientX, pointerId = 1) => ({ clientX, clientY: 0, pointerId, button: 0, preventDefault() {} });
  return { get, handle: get('limit-handle'), event };
}

test('dragging follows graph coordinates at a scaled display and can visit the isolated value', () => {
  const { get, handle, event } = explorer();
  handle.handlers.pointerdown(event(95));
  assert.equal(handle.captured, 1);
  for (const [clientX, expectedX, expectedY] of [[150, '1.917', '3.917'], [152, '2.000', '1.000'], [149.5, '2.000', '1.000'], [148, '1.883', '3.883'], [155.06, '2.000', '1.000'], [162, '2.117', '4.117']]) {
    handle.handlers.pointermove(event(clientX));
    assert.equal(get('limit-x').value, expectedX);
    assert.equal(get('limit-y').value, expectedY);
  }
  handle.handlers.pointermove(event(1000));
  assert.equal(get('limit-x').value, '4.000');
  handle.handlers.pointermove(event(-1000));
  assert.equal(get('limit-x').value, '0.000');
});

test('other pointers and cancelled drags cannot move the point; offset does not jump on grab', () => {
  const { get, handle, event } = explorer();
  handle.handlers.pointerdown(event(100));
  handle.handlers.pointermove(event(100));
  assert.equal(get('limit-x').value, '1.000');
  handle.handlers.pointermove(event(150, 2));
  assert.equal(get('limit-x').value, '1.000');
  handle.handlers.pointercancel(event(100));
  assert.equal(handle.captured, null);
  handle.handlers.pointermove(event(155));
  assert.equal(get('limit-x').value, '1.000');
});

test('keyboard navigation reaches the point exactly and supports fine steps and boundaries', () => {
  const { get, handle } = explorer();
  const key = (key, shiftKey = false) => handle.handlers.keydown({ key, shiftKey, preventDefault() {} });
  for (let i = 0; i < 100; i++) key('ArrowRight');
  assert.equal(get('limit-x').value, '2.000');
  assert.equal(get('limit-y').value, '1.000');
  key('ArrowLeft', true);
  assert.equal(get('limit-y').value, '3.999');
  key('End'); key('ArrowRight');
  assert.equal(get('limit-x').value, '4.000');
  key('Home'); key('ArrowLeft');
  assert.equal(get('limit-x').value, '0.000');
});

test('feedback stays inside the plot and avoids important points at desktop and phone widths', () => {
  for (const [width, labelWidth, labelHeight] of [[640, 108, 54], [280, 88, 46]]) {
    const { get, handle } = explorer(width, labelWidth, labelHeight);
    for (let i = 0; i <= 400; i++) {
      if (i) handle.handlers.keydown({key: 'ArrowRight', preventDefault() {}});
      else handle.handlers.keydown({key: 'Home', preventDefault() {}});
      const left = parseFloat(get('limit-feedback').style.left);
      const top = parseFloat(get('limit-feedback').style.top);
      assert.ok(left >= 0 && left + labelWidth <= width);
      assert.ok(top >= 0 && top + labelHeight <= width * 370 / 640);
      const scale = width / 640;
      const lineLeft = Math.max(left, 50 * scale), lineRight = Math.min(left + labelWidth, 530 * scale);
      const high = (240 + 50 * 5 / 12) * scale - lineLeft * 5 / 12;
      const low = (240 + 50 * 5 / 12) * scale - lineRight * 5 / 12;
      assert.ok(lineLeft > lineRight || high < top || low > top + labelHeight, `label blocks the curve at width ${width}`);
      const x = Number(get('limit-x').value), y = Number(get('limit-y').value);
      for (const [px, py] of [[290,140], [290,290], [50+120*x,340-50*y]]) {
        const gx = px * width / 640, gy = py * width / 640;
        assert.ok(!(gx >= left && gx <= left + labelWidth && gy >= top && gy <= top + labelHeight), `label blocks a key point at input ${x}, width ${width}`);
      }
    }
  }
});

test('small movements retain the label side rather than repeatedly choosing a new placement', () => {
  const { get, handle } = explorer();
  const label = get('limit-feedback');
  const dx = parseFloat(label.style.left) - 170;
  const dy = parseFloat(label.style.top) - 190;
  for (let i = 1; i <= 30; i++) {
    handle.handlers.keydown({key: 'ArrowRight', preventDefault() {}});
    const x = Number(get('limit-x').value);
    assert.ok(Math.abs(parseFloat(label.style.left) - (50 + 120*x) - dx) < 0.01);
    assert.ok(Math.abs(parseFloat(label.style.top) - (340 - 50*(x+2)) - dy) < 0.01);
  }
  for (let i = 0; i < 30; i++) handle.handlers.keydown({key: 'ArrowLeft', preventDefault() {}});
  assert.equal(label.style.left, `${(170+dx).toFixed(2)}px`);
  assert.equal(label.style.top, `${(190+dy).toFixed(2)}px`);
});

test('snapping uses screen distance and Shift can inspect nearby values without snapping', () => {
  for (const width of [640, 280]) {
    const { get, handle, event } = explorer(width, width === 280 ? 88 : 108, width === 280 ? 46 : 54);
    handle.handlers.pointerdown(event(95));
    const move = (pixelsFromTarget, shiftKey = false) => {
      const svgPosition = 290 + pixelsFromTarget * 640 / width;
      handle.handlers.pointermove({...event(svgPosition / 2 + 10), shiftKey});
    };
    move(-6);
    assert.equal(get('limit-x').value, '2.000');
    assert.equal(get('limit-y').value, '1.000');
    move(10);
    assert.equal(get('limit-x').value, '2.000');
    move(14);
    assert.notEqual(get('limit-x').value, '2.000');
    move(-0.2, true);
    assert.notEqual(get('limit-x').value, '2.000');
    assert.ok(Number(get('limit-y').value) > 3.9);
    move(0);
    assert.equal(get('limit-y').value, '1.000');
  }
});

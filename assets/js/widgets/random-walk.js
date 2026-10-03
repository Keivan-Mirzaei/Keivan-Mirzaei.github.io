import { bindPanelHistory, trackControlEdits } from '../lib/panel-history.mjs';
/* A small seeded generator makes each numbered path reproducible for discussion. */
(() => {
  document.querySelectorAll('[data-widget="random-walk"]').forEach((widget) => {
    const slider = widget.querySelector('input');
    const play = widget.querySelector('[data-play]');
    const fresh = widget.querySelector('[data-new]');
    const feedback = widget.querySelector('[data-feedback]');
    const curve = widget.querySelector('[data-path]');
    const point = widget.querySelector('[data-point]');
    let seed = 42;
    let currentStep = 256;
    let values = [];
    let extent = 2;
    let timer = null;

    function draw(announce = true) {
      const step = Number(slider.value);
      currentStep = step;
      const points = values.slice(0, step + 1).map((y, index) => [44 + 536 * index / 256, 158 - 138 * y / extent]);
      curve.setAttribute('d', points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' '));
      const [x, y] = points[step];
      point.setAttribute('cx', x);
      point.setAttribute('cy', y);
      widget.querySelector('[data-step]').textContent = step;
      const description = `Path ${seed}. At step ${step}, time ${(step / 256).toFixed(3)}, position ${values[step].toFixed(4)}. The vertical axis runs from −${extent} to ${extent}.`;
      widget.querySelector('[data-description]').textContent = description;
      if (announce) feedback.textContent = description;
    }

    function stop() {
      clearInterval(timer);
      timer = null;
      play.textContent = Number(slider.value) === 256 ? 'Replay path' : 'Play path';
    }

    function generate() {
      stop();
      let state = seed;
      values = [0];
      for (let index = 0; index < 256; index += 1) {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        values.push(values[index] + (state < 2147483648 ? -1 : 1) / 16);
      }
      extent = Math.max(2, Math.ceil(Math.max(...values.map(Math.abs))));
      widget.querySelector('[data-top]').textContent = extent;
      widget.querySelector('[data-bottom]').textContent = `−${extent}`;
      slider.value = 256;
      play.textContent = 'Replay path';
      draw();
    }

    slider.disabled = play.disabled = fresh.disabled = false;
    slider.addEventListener('input', () => { stop(); draw(); });
    fresh.addEventListener('click', () => { history.remember(); seed += 1; generate(); });
    play.addEventListener('click', () => {
      if (timer === null) history.remember();
      if (timer !== null) { stop(); draw(); return; }
      if (Number(slider.value) === 256) slider.value = 0;
      play.textContent = 'Pause';
      // Animation starts only on request. Avoid announcing every frame.
      timer = setInterval(() => {
        slider.value = Math.min(256, Number(slider.value) + 4);
        draw(false);
        if (Number(slider.value) === 256) { stop(); draw(); }
      }, 60);
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); draw(); } });
    const history = bindPanelHistory(widget, {
      read: () => ({ seed, step: currentStep }),
      restore: state => { seed = state.seed; generate(); slider.value = state.step; draw(); },
      reset: () => { seed = 42; generate(); }
    });
    trackControlEdits([slider], history);
    generate();
  });
})();

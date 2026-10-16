(() => {
  const get = id => document.getElementById(id);
  const format = value => Number(value.toPrecision(4)).toString().replace('-', '−');
  const path = points => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
  const poleSlider = get('pole-zoom');
  let squared = false;
  function updatePole() {
    const fn = x => squared ? 1 / (x * x) : 1 / x;
    const range = 3 * (squared ? 1000 : 20) ** (Number(poleSlider.value) / 100);
    const sx = x => 320 + 120 * x;
    const sy = y => 180 - 125 * y / range;
    const branches = [-1, 1].map(sign => path(Array.from({ length: 401 }, (_, i) => {
      const x = sign * (0.001 + 1.999 * i / 400);
      return [sx(x), sy(fn(x))];
    })));
    get('pole-curve').setAttribute('d', branches.join(''));
    get('pole-original-view').setAttribute('y', sy(3));
    get('pole-original-view').setAttribute('height', sy(-3) - sy(3));
    get('pole-reference-ticks').setAttribute('d', [-1, 1].map(y => `M317 ${sy(y)}H323`).join(''));
    for (const [id, y] of [['pole-unit-positive', 1], ['pole-unit-negative', -1]]) {
      get(id).setAttribute('y', sy(y) + 5);
      get(id).setAttribute('visibility', range <= 12 ? 'visible' : 'hidden');
    }
    get('pole-top').textContent = format(range);
    get('pole-bottom').textContent = format(-range);
    poleSlider.setAttribute('aria-valuetext', `Vertical view from ${format(-range)} to ${format(range)}`);
  }
  for (const radio of document.querySelectorAll('[name="pole-function"]')) {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      squared = radio.value === 'square';
      updatePole();
    });
  }
  poleSlider.addEventListener('input', updatePole);
  const tailsSlider = get('tails-zoom');
  function updateTails() {
    const range = 4 * 20 ** (Number(tailsSlider.value) / 100);
    const fn = x => (2 * x * x + x) / (x * x + 1);
    const sx = x => 320 + 240 * x / range;
    const sy = y => 285 - 70 * y;
    get('tails-original-view').setAttribute('x', sx(-4));
    get('tails-original-view').setAttribute('width', sx(4) - sx(-4));
    get('tails-reference-ticks').setAttribute('d', [-4, -2, 2, 4].map(x => `M${sx(x)} 281V289`).join(''));
    get('tails-curve').setAttribute('d', path(Array.from({ length: 1201 }, (_, i) => {
      const x = range * (i / 600 - 1);
      return [sx(x), sy(fn(x))];
    })));
    for (const [side, input] of [['left', -range], ['right', range]]) {
      get(`tails-${side}`).textContent = format(input);
    }
    tailsSlider.setAttribute('aria-valuetext', `Horizontal view from ${format(-range)} to ${format(range)}; horizontal asymptote 2`);
  }
  tailsSlider.addEventListener('input', updateTails);
  updatePole();
  updateTails();
})();

(() => {
  const get = name => document.getElementById(`squeeze-${name}`);
  const slider = get('zoom');
  const format = value => Number(value.toPrecision(3)).toString();
  const upperDisplay = value => {
    const scale = 10 ** (2 - Math.floor(Math.log10(value)));
    return format(Math.ceil(value * scale - 1e-9) / scale);
  };
  function update() {
    const zoom = Math.max(0, Math.min(100, Number(slider.value)));
    const magnification = 50 ** (zoom / 100);
    const radius = 1 / magnification;
    const screenX = x => 320 + 250 * x / radius;
    const screenY = y => 185 - 130 * y / (radius * radius);
    const upper = [];
    const lower = [];
    const middle = [];
    for (let i = 0; i <= 2048; i++) {
      const x = radius * (i / 1024 - 1);
      const prefix = i ? 'L' : 'M';
      upper.push(`${prefix}${screenX(x).toFixed(2)} ${screenY(x * x).toFixed(2)}`);
      lower.push(`${prefix}${screenX(x).toFixed(2)} ${screenY(-x * x).toFixed(2)}`);
      if (x !== 0) {
        middle.push(`${i === 0 || i === 1025 ? 'M' : 'L'}${screenX(x).toFixed(2)} ${screenY(x * x * Math.sin(1 / x)).toFixed(2)}`);
      }
    }
    get('upper').setAttribute('d', upper.join(''));
    get('lower').setAttribute('d', lower.join(''));
    get('middle').setAttribute('d', middle.join(''));
    get('right').textContent = format(radius);
    get('left').textContent = `−${format(radius)}`;
    get('top').textContent = format(radius * radius);
    get('bottom').textContent = `−${format(radius * radius)}`;
    get('radius').value = upperDisplay(radius);
    get('bound').value = upperDisplay(radius * radius);
    slider.setAttribute('aria-valuetext', `Inputs within ${format(radius)} of zero; function magnitude at most ${format(radius * radius)}`);
  }
  slider.addEventListener('input', update);
  update();
})();

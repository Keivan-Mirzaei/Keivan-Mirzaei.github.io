/* A reusable, dependency-free lesson widget. Each instance owns its controls. */
(() => {
  const left = 44;
  const top = 20;
  const width = 536;
  const height = 276;
  const screenX = (x) => left + (x + 4) * width / 8;
  const screenY = (y) => top + (6 - y) * height / 12;
  const display = (value) => Number(value.toFixed(3)).toString();

  for (const widget of document.querySelectorAll('[data-widget="quadratic"]')) {
    const controls = [...widget.querySelectorAll('input[type="range"]')];
    const curve = widget.querySelector('[data-curve]');
    const vertex = widget.querySelector('[data-vertex]');
    const feedback = widget.querySelector('[data-feedback]');
    const reset = widget.querySelector('[data-reset]');

    function update() {
      const { a, h, k } = Object.fromEntries(controls.map((input) => [input.name, Number(input.value)]));
      const valueAt = (x) => a * (x - h) ** 2 + k;
      const path = [];
      for (let step = 0; step <= 200; step++) {
        const x = -4 + step * 8 / 200;
        path.push(`${step === 0 ? 'M' : 'L'}${screenX(x).toFixed(2)} ${screenY(valueAt(x)).toFixed(2)}`);
      }
      curve.setAttribute('d', path.join(' '));
      vertex.setAttribute('cx', screenX(h));
      vertex.setAttribute('cy', screenY(k));
      vertex.style.display = a === 0 ? 'none' : '';

      for (const input of controls) {
        widget.querySelector(`[data-value="${input.name}"]`).textContent = display(Number(input.value));
      }
      const equation = `y = ${display(a)}(x ${h < 0 ? '+' : '−'} ${display(Math.abs(h))})² ${k < 0 ? '−' : '+'} ${display(Math.abs(k))}`;
      widget.querySelector('[data-equation]').textContent = equation;
      const explanation = a === 0
        ? `With a = 0, the graph is the horizontal line y = ${display(k)}. It is no longer a parabola.`
        : `The vertex is (${display(h)}, ${display(k)}). The curve opens ${a > 0 ? 'upward' : 'downward'}.`;
      feedback.textContent = explanation;
      widget.querySelector('[data-plot-description]').textContent = `${equation}. ${explanation} Visible range: x from −4 to 4 and y from −6 to 6.`;
      for (const cell of widget.querySelectorAll('[data-x]')) {
        cell.textContent = display(valueAt(Number(cell.dataset.x)));
      }
    }

    for (const input of controls) {
      input.disabled = false;
      input.addEventListener('input', update);
    }
    reset.disabled = false;
    reset.addEventListener('click', () => {
      for (const input of controls) input.value = input.defaultValue;
      update();
    });
    update();
  }
})();

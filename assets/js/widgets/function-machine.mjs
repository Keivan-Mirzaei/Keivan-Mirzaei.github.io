import { evaluateMachine } from '../lib/function-machine-math.mjs';

for (const widget of document.querySelectorAll('[data-widget="function-machine"]')) {
  const input = widget.querySelector('[data-machine-input]');
  const output = widget.querySelector('[data-machine-result]');
  function update() {
    const result = evaluateMachine(input.value);
    widget.dataset.state = result.state;
    input.setAttribute('aria-invalid', String(result.state === 'invalid'));
    output.textContent = result.output;
  }
  input.disabled = false;
  input.addEventListener('input', update);
  widget.querySelector('form').addEventListener('submit', event => { event.preventDefault(); update(); });
  update();
}

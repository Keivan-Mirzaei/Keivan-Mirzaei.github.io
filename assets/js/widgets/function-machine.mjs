import { numberMarkup } from '../lib/widget-math.mjs';
import { evaluateMachine } from '../lib/function-machine-math.mjs';
import { createPageEnvironment } from '../lib/page-environment.mjs';

export function mount(root = globalThis.document) {
  const environment = createPageEnvironment(root);
  const { document, window, ResizeObserver, IntersectionObserver, MutationObserver, setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame, cancelAnimationFrame } = environment;


for (const widget of document.querySelectorAll('[data-widget="function-machine"]')) {
  const input = widget.querySelector('[data-machine-input]');
  const output = widget.querySelector('[data-machine-result]');
  function update() {
    const result = evaluateMachine(input.value);
    widget.dataset.state = result.state;
    input.setAttribute('aria-invalid', String(['invalid', 'undefined'].includes(result.state)));
    if (result.state === 'defined') output.innerHTML = numberMarkup(result.value, true);
    else output.textContent = result.output;
    const error = widget.querySelector('[data-machine-error]');
    error.textContent = result.state === 'undefined' ? 'The real domain is −1 < x < 1.' : result.state === 'invalid' ? 'Enter a decimal or fraction, such as 0.5 or 1/2.' : '';
    error.hidden = !error.textContent;
  }
  input.disabled = false;
  input.addEventListener('input', update);
  widget.querySelector('form').addEventListener('submit', event => { event.preventDefault(); update(); });
  update();
}

  return environment.dispose;
}

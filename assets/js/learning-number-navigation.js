import { enableProblemNumberStrip } from './lib/problem-number-strip.mjs';
const attached = new WeakSet();
function attach(root) {
  root.querySelectorAll('.number-strip').forEach(strip => {
    if (attached.has(strip)) return;
    attached.add(strip);
    const reveal = enableProblemNumberStrip(strip, () => strip.querySelector('[aria-current]'));
    new MutationObserver(reveal).observe(strip, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current'] });
    reveal();
  });
}
attach(document);
const problems = document.getElementById('module-problems');
if (problems) new MutationObserver(() => attach(problems)).observe(problems, { childList: true, subtree: true });

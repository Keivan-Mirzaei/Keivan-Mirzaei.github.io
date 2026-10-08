import { rulesMarkup, hasRulesMath } from './model.mjs';
import { typesetMath, clearMath } from '../lib/math-typesetting.mjs';

// Coalesce typing and serialize DOM changes with all other MathJax work.
export function createRulesView(element, { typeset = typesetMath, clear = clearMath, environment = globalThis, onError = () => {} } = {}) {
  let previous = null, generation = 0, pending = null, closed = false;
  function render(source) {
    if (closed || source === previous) return;
    const initial = previous === null;
    previous = source; const visit = ++generation;
    environment.clearTimeout(pending); onError('');
    const math = hasRulesMath(source);
    const update = () => {
      pending = null;
      return typeset(element, { math, current: () => !closed && visit === generation, prepare: () => { element.innerHTML = rulesMarkup(source); } }).catch(() => {
        if (!closed && visit === generation) onError('Equations could not load. Check your connection and edit the field to retry.');
      });
    };
    if (initial || !math) return update();
    pending = environment.setTimeout(update, 250);
  }
  return { render, dispose() { closed = true; generation++; environment.clearTimeout(pending); clear(element); } };
}

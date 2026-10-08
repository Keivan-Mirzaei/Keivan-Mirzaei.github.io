import { initializeWidgetUI, disposeWidgetUI } from './lib/widget-ui.mjs';
import { initializeDropdowns, disposeDropdowns } from './lib/dropdown.mjs';

// Modules are cached, controllers belong to each visit. Leaving a page disposes
// animations, workers, observers and global listeners, including late imports.
export function mountWidgets(root, descriptors) {
  root.querySelectorAll('.widget-frame').forEach(initializeWidgetUI);
  initializeDropdowns(root);
  const cleanups = [], pending = new Map();
  let closed = false;
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) pending.get(entry.target)?.();
  }, { rootMargin: '400px' }) : null;
  for (const descriptor of descriptors) {
    const targets = [...root.querySelectorAll(descriptor.dataset.widgetSelector)];
    let loading = false;
    async function load() {
      if (closed || loading) return;
      loading = true;
      targets.forEach(target => { observer?.unobserve(target); pending.delete(target); target.setAttribute('aria-busy', 'true'); });
      try {
        const module = await import(descriptor.dataset.widgetSrc);
        if (closed) return;
        const cleanup = module.mount(root);
        if (typeof cleanup === 'function') cleanups.push(cleanup);
      } catch (error) {
        if (closed) return;
        loading = false;
        console.warn('Activity could not load:', error);
        for (const target of targets) {
          if (target.querySelector('[data-widget-retry]')) continue;
          const retry = document.createElement('button');
          retry.type = 'button'; retry.className = 'panel-button'; retry.dataset.widgetRetry = ''; retry.textContent = 'Retry activity';
          retry.addEventListener('click', () => { retry.remove(); load(); }); target.append(retry);
        }
      } finally { targets.forEach(target => target.removeAttribute('aria-busy')); }
    }
    for (const target of targets) {
      pending.set(target, load);
      if (observer && !document.body.classList.contains('puzzle-page')) observer.observe(target);
      else load();
    }
  }
  return () => {
    closed = true; observer?.disconnect(); pending.clear();
    cleanups.reverse().forEach(cleanup => cleanup());
    disposeWidgetUI(root); disposeDropdowns(root);
  };
}

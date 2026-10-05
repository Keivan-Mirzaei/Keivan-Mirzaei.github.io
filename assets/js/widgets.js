import { initializeWidgetUI } from './lib/widget-ui.mjs';

document.querySelectorAll('.widget-frame').forEach(initializeWidgetUI);

// Keep article activities idle until the reader is near them. Linked diagrams
// share one controller and therefore activate together, exactly once per page.
const pending = new Map();
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    const load = pending.get(entry.target);
    observer.unobserve(entry.target);
    load?.();
  }
}, { rootMargin: '400px' }) : null;

for (const descriptor of document.querySelectorAll('[data-widget-src]')) {
  const targets = [...document.querySelectorAll(descriptor.dataset.widgetSelector)];
  let loading = false;
  function load() {
    if (loading) return;
    loading = true;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = descriptor.dataset.widgetSrc;
    script.addEventListener('load', () => targets.forEach(target => {
      observer?.unobserve(target);
      pending.delete(target);
      target.removeAttribute('aria-busy');
    }));
    script.addEventListener('error', () => {
      loading = false;
      script.remove();
      for (const target of targets) {
        target.removeAttribute('aria-busy');
        if (target.querySelector('[data-widget-retry]')) continue;
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'panel-button';
        retry.dataset.widgetRetry = '';
        retry.textContent = 'Retry activity';
        retry.addEventListener('click', () => { retry.remove(); load(); });
        target.append(retry);
      }
    });
    targets.forEach(target => target.setAttribute('aria-busy', 'true'));
    document.head.append(script);
  }
  for (const target of targets) {
    pending.set(target, load);
    if (observer && !document.body.classList.contains('puzzle-page')) observer.observe(target);
    else load();
  }
}

// Keep the site shell (and audio) alive. Ordinary URLs remain usable directly.
export function initializeSiteNavigation({ leave, enter }, environment = globalThis) {
  const { document, location, history, DOMParser } = environment, window = environment;
  const fetch = (...args) => environment.fetch(...args), setTimeout = (...args) => environment.setTimeout(...args), clearTimeout = id => environment.clearTimeout(id);
  const requestAnimationFrame = callback => environment.requestAnimationFrame(callback), scrollTo = (...args) => environment.scrollTo(...args);
  const main = document.querySelector('#main'), status = document.querySelector('.site-navigation-status');
  let displayed = new URL(location.href), pending = null, sequence = 0, scrollFrame = 0, committing = false;
  history.scrollRestoration = 'manual';
  function saveScroll() {
    if (!committing) history.replaceState({ ...history.state, siteScroll: [environment.scrollX, environment.scrollY] }, '', location.href);
  }
  saveScroll();
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; saveScroll(); }); }, { passive: true });
  window.addEventListener('site:urlchange', () => { displayed = new URL(location.href); });
  function position(url, saved) {
    let target = null;
    try { target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null; } catch {}
    if (saved) scrollTo(...saved);
    else if (target) { target.scrollIntoView(); target.focus?.({ preventScroll: true }); }
    else scrollTo(0, 0);
  }
  async function navigate(href, { pop = false, saved = null } = {}) {
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) { location.assign(url.href); return; }
    if (url.pathname === displayed.pathname && url.search === displayed.search) {
      pending?.abort(); sequence++;
      document.querySelectorAll('[data-navigation-style]').forEach(link => link.remove());
      if (!pop) { saveScroll(); history.pushState({ siteScroll: [0, 0] }, '', url); }
      displayed = url; committing = false; pending = null; main.removeAttribute('aria-busy'); status.textContent = ''; position(url, saved); return;
    }
    if (!pop) saveScroll();
    pending?.abort(); document.querySelectorAll('[data-navigation-style]').forEach(link => link.remove());
    const controller = new AbortController(); pending = controller;
    const visit = ++sequence;
    status.textContent = 'Loading page…'; main.setAttribute('aria-busy', 'true');
    let additions = [];
    try {
      const response = await fetch(url.href, { signal: controller.signal, headers: { Accept: 'text/html' } });
      if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('Page unavailable');
      const html = await response.text();
      if (controller.signal.aborted || visit !== sequence) return;
      const incoming = new DOMParser().parseFromString(html, 'text/html');
      if (!incoming.body.hasAttribute('data-site-shell') || !incoming.querySelector('[data-page-content]')) throw new Error('Different layout');
      const nextStyles = [...incoming.querySelectorAll('link[data-page-style]')];
      const wanted = new Set(nextStyles.map(style => new URL(style.getAttribute('href'), response.url).href));
      const existing = [...document.querySelectorAll('link[rel="stylesheet"]')];
      await Promise.all(nextStyles.map(style => {
        const href = new URL(style.getAttribute('href'), response.url).href;
        if (existing.some(link => link.href === href)) return;
        return new Promise((resolve, reject) => {
          const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; link.dataset.pageStyle = '';
          link.dataset.navigationStyle = String(visit);
          const timeout = setTimeout(() => reject(new Error('Styles unavailable')), 15000);
          link.onload = () => { clearTimeout(timeout); resolve(); };
          link.onerror = () => { clearTimeout(timeout); reject(new Error('Styles unavailable')); };
          controller.signal.addEventListener('abort', () => { clearTimeout(timeout); link.remove(); resolve(); }, { once: true });
          additions.push(link); document.head.append(link);
        });
      }));
      if (controller.signal.aborted || visit !== sequence) { additions.forEach(link => link.remove()); return; }
      committing = true;
      additions.forEach(link => delete link.dataset.navigationStyle);
      const old = main.querySelector('[data-page-content]');
      leave(old);
      window.MathJax?.typesetClear?.([old]);
      const next = document.importNode(incoming.querySelector('[data-page-content]'), true);
      old.replaceWith(next);
      document.querySelectorAll('[data-page-config]').forEach(node => node.remove());
      incoming.querySelectorAll('[data-page-config]').forEach(node => document.head.append(document.importNode(node, true)));
      for (const link of document.querySelectorAll('link[data-page-style]')) if (!wanted.has(link.href)) link.remove();
      document.title = incoming.title;
      for (const selector of ['meta[name="description"]', 'link[rel="canonical"]']) {
        const replacement = incoming.querySelector(selector); if (replacement) document.querySelector(selector)?.replaceWith(document.importNode(replacement, true));
      }
      document.body.className = incoming.body.className;
      for (const key of Object.keys(document.body.dataset)) if (key.startsWith('page')) delete document.body.dataset[key];
      Object.assign(document.body.dataset, incoming.body.dataset);
      for (const selector of ['.topbar-title', '.nav-list']) document.querySelector(selector).innerHTML = incoming.querySelector(selector).innerHTML;
      if (!pop) history.pushState({ siteScroll: [0, 0] }, '', url);
      displayed = url;
      document.dispatchEvent(new Event('site:page'));
      enter(next);
      main.focus({ preventScroll: true }); position(url, saved);
      // Images reserve their size; math has its own completion event for hashes.
      status.textContent = `${incoming.title.split(' · ')[0]} loaded.`;
    } catch (error) {
      additions.forEach(link => link.remove());
      if (controller.signal.aborted || visit !== sequence) return;
      location.assign(url.href);
    } finally {
      if (visit === sequence) { committing = false; main.removeAttribute('aria-busy'); pending = null; }
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download') || link.hasAttribute('data-full-navigation')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !/\/$|\.html$/.test(url.pathname)) return;
    event.preventDefault(); navigate(url.href);
  });
  window.addEventListener('popstate', event => { committing = true; navigate(location.href, { pop: true, saved: event.state?.siteScroll || [0, 0] }); });
  window.addEventListener('pageshow', event => { if (event.persisted) { displayed = new URL(location.href); document.dispatchEvent(new Event('site:page')); } });
  return navigate;
}

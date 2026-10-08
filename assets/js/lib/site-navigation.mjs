// Store source HTML, never live widget DOM. Evict large, old and least-used pages.
export function createPageLoader(environment = globalThis) {
  const pages = new Map(), requests = new Map();
  const now = () => (environment.Date || Date).now();
  let characters = 0;
  const key = href => { const url = new URL(href, environment.location.href); url.hash = ''; return url.href; };
  function forget(href) { characters -= pages.get(href)?.html.length || 0; pages.delete(href); }
  function remember(href, page) {
    href = key(href); forget(href);
    if (page.html.length > 64 * 1024) return;
    pages.set(href, { ...page, expires: now() + 5 * 60 * 1000 }); characters += page.html.length;
    while (pages.size > 8 || characters > 256 * 1024) forget(pages.keys().next().value);
  }
  async function load(href, signal) {
    href = key(href);
    const cached = pages.get(href);
    if (cached && cached.expires > now()) {
      pages.delete(href); pages.set(href, cached); return cached;
    }
    if (cached) forget(href);
    let request = requests.get(href);
    if (request?.controller.signal.aborted) { requests.delete(href); request = null; }
    if (!request) {
      // At most two speculative HTML requests; a click can always proceed.
      if (!signal && requests.size >= 2) return null;
      const controller = new AbortController();
      request = { controller };
      const current = request;
      requests.set(href, request);
      request.promise = (async () => {
        try {
          const response = await environment.fetch(href, { signal: controller.signal, headers: { Accept: 'text/html' } });
          if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('Page unavailable');
          const page = { html: await response.text(), url: response.url || href };
          if (controller.signal.aborted) throw new Error('Navigation cancelled');
          remember(href, page); return page;
        } finally { if (requests.get(href) === current) requests.delete(href); }
      })();
    }
    // A click reuses an in-flight hover request and takes over its cancellation.
    const abort = () => request.controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    try { return await request.promise; }
    finally { signal?.removeEventListener('abort', abort); }
  }
  return { load, remember };
}

function internalLink(event, environment) {
  const link = event.target.closest?.('a[href]');
  if (!link || link.target || link.hasAttribute('download') || link.hasAttribute('data-full-navigation') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const url = new URL(link.href, environment.location.href);
  return url.origin === environment.location.origin && /\/$|\.html$/.test(url.pathname) ? url : null;
}

// Fetch only the page a visitor is considering, including browsers without link-prefetch hints.
export function initializePagePrefetch(load, environment = globalThis) {
  const { document } = environment;
  let timer = null;
  const cancel = () => { environment.clearTimeout(timer); timer = null; };
  const allowed = () => {
    const connection = environment.navigator?.connection;
    return !document.hidden && !connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || '');
  };
  function prepare(event, immediate = false) {
    const link = event.target.closest?.('a[href]');
    if (event.relatedTarget && link?.contains(event.relatedTarget)) return;
    cancel();
    const url = internalLink(event, environment);
    if (!url || event.defaultPrevented || !allowed()) return;
    const current = new URL(environment.location.href);
    if (url.pathname === current.pathname || url.search || url.hash) return;
    const start = () => { timer = null; if (allowed()) load(url.href).catch(() => {}); };
    if (immediate) start();
    else timer = environment.setTimeout(start, 100);
  }
  document.addEventListener('pointerover', event => { if (event.pointerType === 'mouse') prepare(event); });
  document.addEventListener('focusin', event => prepare(event));
  document.addEventListener('pointerdown', event => { if (event.button === 0) prepare(event, true); });
  for (const name of ['pointerout', 'focusout']) document.addEventListener(name, event => {
    if (!event.target.closest?.('a[href]')?.contains(event.relatedTarget)) cancel();
  });
  document.addEventListener('site:page', cancel);
}

// Keep the site shell (and audio) alive. Ordinary URLs remain usable directly.
export function initializeSiteNavigation({ leave, enter }, environment = globalThis) {
  const { document, location, history, DOMParser } = environment, window = environment;
  const setTimeout = (...args) => environment.setTimeout(...args), clearTimeout = id => environment.clearTimeout(id);
  const requestAnimationFrame = callback => environment.requestAnimationFrame(callback), scrollTo = (...args) => environment.scrollTo(...args);
  const main = document.querySelector('#main'), status = document.querySelector('.site-navigation-status');
  const pages = createPageLoader(environment);
  const styles = new Map([...document.querySelectorAll('link[data-page-style]')].map(link => [link.href, link]));
  if (document.documentElement?.outerHTML) pages.remember(location.href, { html: document.documentElement.outerHTML, url: location.href });
  initializePagePrefetch(pages.load, environment);
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
      const page = await pages.load(url.href, controller.signal);
      if (controller.signal.aborted || visit !== sequence) return;
      const incoming = new DOMParser().parseFromString(page.html, 'text/html');
      if (!incoming.body.hasAttribute('data-site-shell') || !incoming.querySelector('[data-page-content]')) throw new Error('Different layout');
      const nextStyles = [...incoming.querySelectorAll('link[data-page-style]')];
      const wanted = new Set(nextStyles.map(style => new URL(style.getAttribute('href'), page.url).href));
      const existing = [...document.querySelectorAll('link[rel="stylesheet"]')];
      await Promise.all(nextStyles.map(style => {
        const href = new URL(style.getAttribute('href'), page.url).href;
        if (existing.some(link => link.href === href)) return;
        return new Promise((resolve, reject) => {
          const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; link.dataset.pageStyle = '';
          link.dataset.navigationStyle = String(visit);
          const abort = () => { link.remove(); finish(); };
          const finish = error => {
            clearTimeout(timeout); link.onload = link.onerror = null;
            controller.signal.removeEventListener('abort', abort);
            if (error) reject(error); else resolve();
          };
          const timeout = setTimeout(() => finish(new Error('Styles unavailable')), 15000);
          link.onload = () => { link.media = 'not all'; finish(); };
          link.onerror = () => finish(new Error('Styles unavailable'));
          controller.signal.addEventListener('abort', abort, { once: true });
          additions.push(link); document.head.append(link);
        });
      }));
      if (controller.signal.aborted || visit !== sequence) { additions.forEach(link => link.remove()); return; }
      committing = true;
      additions.forEach(link => delete link.dataset.navigationStyle);
      for (const style of nextStyles) {
        const href = new URL(style.getAttribute('href'), page.url).href;
        const link = [...existing, ...additions].find(link => link.href === href);
        link.media = style.getAttribute('media') || '';
        if (Object.hasOwn(link.dataset, 'pageStyle')) { styles.delete(href); styles.set(href, link); }
      }
      // Retain up to twelve loaded stylesheets, with only this page's styles active.
      for (const [href, link] of styles) if (!wanted.has(href)) link.media = 'not all';
      for (const [href, link] of styles) {
        if (styles.size <= 12) break;
        if (!wanted.has(href)) { link.remove(); styles.delete(href); }
      }
      const old = main.querySelector('[data-page-content]');
      leave(old);
      window.MathJax?.typesetClear?.([old]);
      const next = document.importNode(incoming.querySelector('[data-page-content]'), true);
      old.replaceWith(next);
      document.querySelectorAll('[data-page-config]').forEach(node => node.remove());
      incoming.querySelectorAll('[data-page-config]').forEach(node => document.head.append(document.importNode(node, true)));
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
    if (event.defaultPrevented || event.button !== 0) return;
    const url = internalLink(event, environment);
    if (!url) return;
    event.preventDefault(); navigate(url.href);
  });
  window.addEventListener('popstate', event => { committing = true; navigate(location.href, { pop: true, saved: event.state?.siteScroll || [0, 0] }); });
  window.addEventListener('pageshow', event => { if (event.persisted) { displayed = new URL(location.href); document.dispatchEvent(new Event('site:page')); } });
  return navigate;
}

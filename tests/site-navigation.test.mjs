import assert from 'node:assert/strict';
import test from 'node:test';
import { createPageLoader, initializePagePrefetch, initializeSiteNavigation } from '../assets/js/lib/site-navigation.mjs';

function setup({ autoStyles = true, initialCSS = [] } = {}) {
  const browser = new EventTarget(), document = new EventTarget(), requests = [], styles = [], entered = [], left = [], source = new Map();
  const location = { href: 'https://example.test/search/?q=math', origin: 'https://example.test', assigned: [], assign(url) { this.assigned.push(url); } };
  const history = { state: { keep: 'query' }, entries: [], replaceState(state, _, href) { this.state = state; location.href = String(href); }, pushState(state, _, href) { this.state = state; location.href = String(href); this.entries.push(String(href)); } };
  const status = { textContent: '' }, title = { innerHTML: 'Search' }, nav = { innerHTML: 'Search nav' };
  const main = { busy: false, focused: 0, setAttribute() { this.busy = true; }, removeAttribute() { this.busy = false; }, focus() { this.focused++; }, querySelector: () => document.content };
  function content(id) { return { id, isConnected: true, replaceWith(next) { this.isConnected = false; document.content = next; } }; }
  document.content = content('search');
  document.title = 'Search'; document.body = { dataset: { siteShell: '', pageSearch: 'true' }, className: '' };
  document.getElementById = id => id === 'anchor' ? { scrollIntoView() { browser.anchored = true; }, focus() {} } : null;
  document.querySelector = selector => ({ '#main': main, '.site-navigation-status': status, '.topbar-title': title, '.nav-list': nav })[selector] || null;
  document.querySelectorAll = selector => selector === 'link[rel="stylesheet"]' || selector === 'link[data-page-style]' ? styles : selector === '[data-navigation-style]' ? styles.filter(style => Object.hasOwn(style.dataset, 'navigationStyle')) : [];
  document.createElement = () => { const link = { dataset: {}, media: '', remove() { const index = styles.indexOf(this); if (index >= 0) styles.splice(index, 1); } }; return link; };
  document.head = { append(link) { styles.push(link); if (autoStyles) queueMicrotask(() => { if (styles.includes(link)) link.onload?.(); }); } };
  document.importNode = node => node.id ? content(node.id) : { ...node };
  function incoming(id, { shell = true, css = [] } = {}) {
    return { title: `${id} · Notebook`, body: { hasAttribute: () => shell, dataset: { siteShell: '', pageMath: 'true' }, className: id === 'puzzle' ? 'puzzle-page' : '' },
      querySelector: selector => ({ '[data-page-content]': content(id), '.topbar-title': { innerHTML: id }, '.nav-list': { innerHTML: `${id} nav` } })[selector] || null,
      querySelectorAll: selector => selector === 'link[data-page-style]' ? css.map(href => ({ getAttribute: name => name === 'href' ? href : null })) : [] };
  }
  function encode(page) { const html = `<!doctype html>page-${source.size}`; source.set(html, page); return html; }
  document.documentElement = { outerHTML: encode(incoming('search', { css: initialCSS })) };
  for (const href of initialCSS) { const link = document.createElement('link'); link.href = new URL(href, location.href).href; link.dataset.pageStyle = ''; styles.push(link); }
  Object.assign(browser, { document, location, history, scrollX: 0, scrollY: 140, scrollTo(x, y) { this.scrollX = x; this.scrollY = y; }, requestAnimationFrame(callback) { callback(); return 1; }, setTimeout, clearTimeout,
    DOMParser: class { parseFromString(value) { return source.get(value); } },
    fetch(url, { signal }) { return new Promise((resolve, reject) => { requests.push({ url, signal, resolve: page => resolve({ ok: true, url, headers: { get: () => 'text/html' }, text: async () => encode(page) }), reject }); signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }); }); }
  });
  const navigate = initializeSiteNavigation({ leave: root => left.push(root.id), enter: root => entered.push(root.id) }, browser);
  return { browser, document, requests, styles, entered, left, history, status, main, nav, title, incoming, navigate };
}

test('internal navigation replaces content, updates page features and reuses styles while retaining the shell', async () => {
  const app = setup(), main = app.main;
  const first = app.navigate('/lesson/'); app.requests[0].resolve(app.incoming('lesson', { css: ['/assets/lesson.css'] })); await first;
  assert.equal(app.main, main); assert.deepEqual(app.left, ['search']); assert.deepEqual(app.entered, ['lesson']);
  assert.equal(app.document.title, 'lesson · Notebook'); assert.equal(app.document.body.dataset.pageSearch, undefined);
  assert.equal(app.document.body.dataset.pageMath, 'true'); assert.equal(app.title.innerHTML, 'lesson'); assert.equal(app.nav.innerHTML, 'lesson nav');
  assert.equal(app.browser.location.href, 'https://example.test/lesson/'); assert.equal(app.main.focused, 1); assert.equal(app.main.busy, false);
  assert.equal(app.styles.length, 1);
  const originalStyle = app.styles[0];
  const second = app.navigate('/another/'); app.requests[1].resolve(app.incoming('another', { css: ['/assets/lesson.css'] })); await second;
  assert.equal(app.styles[0], originalStyle);
  const third = app.navigate('/puzzle/'); app.requests[2].resolve(app.incoming('puzzle', { css: ['/assets/puzzle.css'] })); await third;
  assert.equal(app.styles.length, 2); assert.equal(originalStyle.media, 'not all'); assert.equal(app.styles[1].media, ''); assert.equal(app.document.body.className, 'puzzle-page');
  await app.navigate('/lesson/');
  assert.equal(app.requests.length, 3); assert.equal(app.styles.length, 2); assert.equal(originalStyle.media, ''); assert.equal(app.styles[1].media, 'not all');
});

test('a competing navigation aborts the older request without replacing content or triggering fallback', async () => {
  const app = setup(), slow = app.navigate('/slow/'), next = app.navigate('/fast/');
  assert.equal(app.requests[0].signal.aborted, true);
  app.requests[1].resolve(app.incoming('fast')); await Promise.all([slow, next]);
  assert.deepEqual(app.entered, ['fast']); assert.deepEqual(app.left, ['search']); assert.deepEqual(app.browser.location.assigned, []);
  assert.equal(app.history.entries.length, 1);
});

test('failed requests or unsupported documents fall back without disposing the current page', async () => {
  const app = setup(), failure = app.navigate('/offline/'); app.requests[0].reject(new Error('offline')); await failure;
  assert.deepEqual(app.browser.location.assigned, ['https://example.test/offline/']); assert.deepEqual(app.left, []);
  const unsupported = app.navigate('/legacy/'); app.requests[1].resolve(app.incoming('legacy', { shell: false })); await unsupported;
  assert.equal(app.browser.location.assigned.at(-1), 'https://example.test/legacy/'); assert.deepEqual(app.entered, []);
});

test('same-page anchors and search URL changes do not reload, while Back restores saved scroll', async () => {
  const app = setup();
  app.history.replaceState({ keep: 'query', siteScroll: [0, 180] }, '', 'https://example.test/search/?q=geometry'); app.browser.dispatchEvent(new Event('site:urlchange'));
  await app.navigate('/search/?q=geometry#anchor'); assert.equal(app.requests.length, 0); assert.equal(app.browser.anchored, true);
  const next = app.navigate('/lesson/'); app.requests[0].resolve(app.incoming('lesson')); await next;
  app.browser.location.href = 'https://example.test/search/?q=geometry';
  const back = app.navigate(app.browser.location.href, { pop: true, saved: [0, 180] }); app.requests[1].resolve(app.incoming('search')); await back;
  assert.equal(app.browser.scrollY, 180); assert.equal(app.history.entries.length, 2);
});

test('external, modified, download and new-tab links retain native browser behavior', async () => {
  const app = setup();
  for (const patch of [{ href: 'https://elsewhere.test/' }, { ctrlKey: true }, { metaKey: true }, { target: '_blank' }, { download: true }]) {
    const link = { href: 'https://example.test/lesson/', target: '', hasAttribute: name => name === 'download' && patch.download === true, ...patch };
    const event = new Event('click', { cancelable: true }); Object.assign(event, { button: 0, ctrlKey: patch.ctrlKey, metaKey: patch.metaKey }); Object.defineProperty(event, 'target', { value: { closest: () => link } });
    app.document.dispatchEvent(event); assert.equal(event.defaultPrevented, false);
  }
  assert.equal(app.requests.length, 0);
});

test('the original page is cached before widgets mount, and returning restores fresh content without a request', async () => {
  const app = setup({ initialCSS: ['/assets/search.css'] }), original = app.document.content;
  const next = app.navigate('/research/'); app.requests[0].resolve(app.incoming('research')); await next;
  assert.equal(app.styles[0].media, 'not all');
  await app.navigate('/search/?q=math#anchor');
  assert.equal(app.requests.length, 1); assert.equal(app.document.content.id, 'search'); assert.notEqual(app.document.content, original);
  assert.equal(app.styles[0].media, ''); assert.equal(app.browser.anchored, true);
  assert.deepEqual(app.entered, ['research', 'search']);
});

test('navigation shares the request started by a touch press and cached Back preserves scroll', async () => {
  const app = setup();
  const link = { href: 'https://example.test/research/', target: '', hasAttribute: () => false };
  const event = new Event('pointerdown'); Object.assign(event, { pointerType: 'touch', button: 0 });
  Object.defineProperty(event, 'target', { value: { closest: () => link } }); app.document.dispatchEvent(event);
  assert.equal(app.requests.length, 1);
  const clicked = app.navigate('/research/'); assert.equal(app.requests.length, 1);
  app.requests[0].resolve(app.incoming('research')); await clicked;
  app.browser.location.href = 'https://example.test/search/?q=math';
  await app.navigate(app.browser.location.href, { pop: true, saved: [0, 140] });
  assert.equal(app.requests.length, 1); assert.equal(app.browser.scrollY, 140); assert.equal(app.history.entries.length, 1);
  assert.equal(app.document.content.id, 'search');
});

test('a click reuses a prefetched request, and cancelling it permits an immediate retry', async () => {
  const app = setup(), pages = createPageLoader(app.browser);
  const hover = pages.load('/research/'), controller = new AbortController(), clicked = pages.load('/research/#papers', controller.signal);
  assert.equal(app.requests.length, 1);
  app.requests[0].resolve(app.incoming('research'));
  assert.equal(await hover, await clicked);
  await pages.load('/research/'); assert.equal(app.requests.length, 1);
  const slowHover = pages.load('/slow/'), old = new AbortController(), slowClick = pages.load('/slow/', old.signal);
  const hoverRejected = assert.rejects(slowHover), clickRejected = assert.rejects(slowClick);
  old.abort();
  const retry = pages.load('/slow/', new AbortController().signal);
  assert.equal(app.requests.length, 3); assert.equal(app.requests[1].signal.aborted, true);
  app.requests[2].resolve(app.incoming('slow')); await Promise.all([hoverRejected, clickRejected, retry]);
});

test('speculation allows at most two simultaneous requests and never blocks an actual navigation', async () => {
  const app = setup(), pages = createPageLoader(app.browser);
  const one = pages.load('/one/'), two = pages.load('/two/');
  assert.equal(await pages.load('/three/'), null); assert.equal(app.requests.length, 2);
  const clicked = pages.load('/three/', new AbortController().signal);
  assert.equal(app.requests.length, 3);
  for (const [index, id] of ['one', 'two', 'three'].entries()) app.requests[index].resolve(app.incoming(id));
  await Promise.all([one, two, clicked]);
});

function loaderFixture({ html = 'page' } = {}) {
  const requests = [];
  let time = 0;
  const environment = { location: { href: 'https://example.test/' }, Date: { now: () => time },
    async fetch(url) { requests.push(url); return { ok: true, url, headers: { get: () => 'text/html' }, text: async () => html }; } };
  return { pages: createPageLoader(environment), requests, advance(ms) { time += ms; } };
}

test('HTML cache preserves search parameters, ignores anchors and expires after five minutes', async () => {
  const app = loaderFixture();
  await app.pages.load('/search/?q=math'); await app.pages.load('/search/?q=math#anchor');
  assert.equal(app.requests.length, 1);
  await app.pages.load('/search/?q=geometry'); assert.equal(app.requests.length, 2);
  app.advance(5 * 60 * 1000); await app.pages.load('/search/?q=math'); assert.equal(app.requests.length, 3);
});

test('HTML cache evicts the least recently used page after eight entries', async () => {
  const app = loaderFixture();
  for (let i = 0; i < 8; i++) await app.pages.load(`/page-${i}/`);
  await app.pages.load('/page-0/'); await app.pages.load('/page-8/');
  await app.pages.load('/page-0/'); assert.equal(app.requests.length, 9);
  await app.pages.load('/page-1/'); assert.equal(app.requests.length, 10);
});

test('HTML cache also bounds total characters and does not retain oversized pages', async () => {
  const app = loaderFixture({ html: 'x'.repeat(64 * 1024) });
  for (let i = 0; i < 5; i++) await app.pages.load(`/page-${i}/`);
  await app.pages.load('/page-1/'); assert.equal(app.requests.length, 5);
  await app.pages.load('/page-0/'); assert.equal(app.requests.length, 6);
  const large = loaderFixture({ html: 'x'.repeat(64 * 1024 + 1) });
  await large.pages.load('/large/'); await large.pages.load('/large/'); assert.equal(large.requests.length, 2);
});

test('failed or non-HTML prefetches are retryable without affecting the current page', async () => {
  let attempts = 0;
  const pages = createPageLoader({ location: { href: 'https://example.test/' }, async fetch(url) {
    attempts++;
    if (attempts === 1) throw new Error('offline');
    return { ok: true, url, headers: { get: () => attempts === 2 ? 'application/json' : 'text/html' }, text: async () => 'recovered' };
  } });
  await assert.rejects(pages.load('/research/')); await assert.rejects(pages.load('/research/'));
  assert.equal((await pages.load('/research/')).html, 'recovered'); assert.equal(attempts, 3);
});

test('an aborted style load cannot remove or disable the current page styles', async () => {
  const app = setup({ autoStyles: false, initialCSS: ['/assets/search.css'] }), originalStyle = app.styles[0];
  const slow = app.navigate('/slow/'); app.requests[0].resolve(app.incoming('slow', { css: ['/assets/slow.css'] }));
  await new Promise(setImmediate);
  assert.equal(app.styles.length, 2); assert.equal(originalStyle.media, '');
  const next = app.navigate('/fast/');
  assert.equal(app.styles.length, 1); assert.equal(app.styles[0], originalStyle);
  app.requests[1].resolve(app.incoming('fast')); await Promise.all([slow, next]);
  assert.deepEqual(app.entered, ['fast']); assert.deepEqual(app.browser.location.assigned, []);
});

test('a failed stylesheet keeps the existing page intact and uses normal navigation', async () => {
  const app = setup({ autoStyles: false, initialCSS: ['/assets/search.css'] }), originalStyle = app.styles[0];
  const next = app.navigate('/lesson/'); app.requests[0].resolve(app.incoming('lesson', { css: ['/assets/lesson.css'] }));
  await new Promise(setImmediate); app.styles[1].onerror(); await next;
  assert.equal(app.styles.length, 1); assert.equal(originalStyle.media, ''); assert.deepEqual(app.left, []);
  assert.deepEqual(app.browser.location.assigned, ['https://example.test/lesson/']);
});

test('the stylesheet cache evicts inactive styles after twelve entries', async () => {
  const app = setup();
  for (let i = 0; i < 13; i++) {
    const next = app.navigate(`/page-${i}/`); app.requests[i].resolve(app.incoming(`page-${i}`, { css: [`/assets/page-${i}.css`] })); await next;
  }
  assert.equal(app.styles.length, 12); assert.ok(app.styles.every(link => !link.href.endsWith('/page-0.css')));
  assert.equal(app.styles.filter(link => link.media !== 'not all').length, 1); assert.equal(app.styles.at(-1).media, '');
});

function prefetchFixture({ connection = {}, hidden = false } = {}) {
  const document = new EventTarget(), timers = new Map(), prepared = [];
  document.hidden = hidden;
  const environment = { document, navigator: { connection }, location: { href: 'https://example.test/gadgets/', origin: 'https://example.test' },
    setTimeout(callback) { const id = timers.size + 1; timers.set(id, callback); return id; }, clearTimeout(id) { timers.delete(id); } };
  initializePagePrefetch(async url => prepared.push(url), environment);
  function dispatch(name, href, patch = {}) {
    const link = { href: new URL(href, environment.location.href).href, target: patch.target || '', contains: node => Boolean(node?.child),
      hasAttribute: attribute => (attribute === 'download' && patch.download) || (attribute === 'data-full-navigation' && patch.full) };
    const { target, ...eventProperties } = patch;
    const event = new Event(name); Object.assign(event, { pointerType: 'mouse', button: 0, ...eventProperties });
    Object.defineProperty(event, 'target', { value: { closest: () => link } }); document.dispatchEvent(event);
  }
  return { prepared, document, dispatch, flush() { for (const [id, callback] of timers) { timers.delete(id); callback(); } } };
}

test('hover waits for intent, keyboard focus prepares HTML and touch starts immediately', () => {
  const app = prefetchFixture();
  app.dispatch('pointerover', '/research/'); app.dispatch('pointerout', '/research/'); app.flush(); assert.equal(app.prepared.length, 0);
  app.dispatch('pointerover', '/research/'); app.dispatch('pointerout', '/research/', { relatedTarget: { child: true } }); app.flush();
  assert.deepEqual(app.prepared, ['https://example.test/research/']);
  app.dispatch('focusin', '/about/'); app.flush();
  app.dispatch('pointerdown', '/puzzles/', { pointerType: 'touch' });
  assert.deepEqual(app.prepared, ['https://example.test/research/', 'https://example.test/about/', 'https://example.test/puzzles/']);
});

test('prefetch skips external, current, query, anchor, asset and native-only links', () => {
  const app = prefetchFixture();
  for (const [href, patch] of [['https://elsewhere.test/', {}], ['/gadgets/', {}], ['/research/?q=math', {}], ['/research/#papers', {}], ['/assets/audio.mp3', {}],
    ['/research/', { target: '_blank' }], ['/research/', { download: true }], ['/research/', { full: true }], ['/research/', { ctrlKey: true }]]) {
    app.dispatch('pointerdown', href, patch); app.flush();
  }
  assert.deepEqual(app.prepared, []);
});

test('prefetch respects reduced-data connections and a hidden page, even after scheduling', () => {
  for (const options of [{ connection: { saveData: true } }, { connection: { effectiveType: '2g' } }, { connection: { effectiveType: 'slow-2g' } }, { hidden: true }]) {
    const app = prefetchFixture(options); app.dispatch('pointerdown', '/research/'); app.dispatch('focusin', '/about/'); app.flush(); assert.deepEqual(app.prepared, []);
  }
  const app = prefetchFixture(); app.dispatch('pointerover', '/research/'); app.document.hidden = true; app.flush(); assert.deepEqual(app.prepared, []);
});

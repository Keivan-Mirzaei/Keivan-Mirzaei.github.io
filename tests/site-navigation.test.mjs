import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeSiteNavigation } from '../assets/js/lib/site-navigation.mjs';

function setup() {
  const browser = new EventTarget(), document = new EventTarget(), requests = [], styles = [], entered = [], left = [];
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
  document.createElement = () => { const link = { dataset: {}, remove() { const index = styles.indexOf(this); if (index >= 0) styles.splice(index, 1); } }; return link; };
  document.head = { append(link) { styles.push(link); queueMicrotask(() => link.onload()); } };
  document.importNode = node => node.id ? content(node.id) : { ...node };
  function incoming(id, { shell = true, css = [] } = {}) {
    return { title: `${id} · Notebook`, body: { hasAttribute: () => shell, dataset: { siteShell: '', pageMath: 'true' }, className: id === 'puzzle' ? 'puzzle-page' : '' },
      querySelector: selector => ({ '[data-page-content]': content(id), '.topbar-title': { innerHTML: id }, '.nav-list': { innerHTML: `${id} nav` } })[selector] || null,
      querySelectorAll: selector => selector === 'link[data-page-style]' ? css.map(href => ({ getAttribute: () => href })) : [] };
  }
  Object.assign(browser, { document, location, history, scrollX: 0, scrollY: 140, scrollTo(x, y) { this.scrollX = x; this.scrollY = y; }, requestAnimationFrame(callback) { callback(); return 1; }, setTimeout, clearTimeout,
    DOMParser: class { parseFromString(value) { return value; } },
    fetch(url, { signal }) { return new Promise((resolve, reject) => { requests.push({ url, signal, resolve: page => resolve({ ok: true, url, headers: { get: () => 'text/html' }, text: async () => page }), reject }); signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }); }); }
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
  assert.equal(app.styles.length, 1); assert.notEqual(app.styles[0], originalStyle); assert.equal(app.document.body.className, 'puzzle-page');
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

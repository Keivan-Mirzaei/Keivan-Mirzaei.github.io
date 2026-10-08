import { initializeNavigation } from './navigation.js';
import { initializeSiteNavigation } from './lib/site-navigation.mjs';

let pageDispose = () => {}, gadgetPromise = null, mathPromise = null, mathQueue = Promise.resolve(), page = 0;
function gadgets() {
  if (!gadgetPromise) gadgetPromise = Promise.all([import('./gadgets/service.mjs'), import('./gadgets/ui.mjs')]).then(([model, ui]) => {
    const service = model.createGadgetService(); ui.mountDock(service); return { service, ui };
  }).catch(error => { gadgetPromise = null; throw error; });
  return gadgetPromise;
}
function math(root) {
  if (!mathPromise) {
    window.MathJax = { options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }, tex: { tags: 'ams' }, startup: { typeset: false } };
    mathPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js'; script.id = 'MathJax-script';
      script.onload = () => window.MathJax.startup.promise.then(resolve, reject);
      script.onerror = () => { script.remove(); mathPromise = null; reject(new Error('Mathematics could not load')); };
      document.head.append(script);
    });
  }
  const job = mathQueue.catch(() => {}).then(() => mathPromise).then(async () => {
    if (!root.isConnected) return;
    await window.MathJax.typesetPromise([root]);
    if (!root.isConnected) window.MathJax.typesetClear([root]);
    else if (location.hash) { try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); } catch {} }
  });
  mathQueue = job;
  return job;
}
function enter(root) {
  const cleanups = [], visit = ++page;
  let closed = false;
  pageDispose = () => { closed = true; cleanups.reverse().forEach(cleanup => cleanup()); cleanups.length = 0; };
  const mount = async (module, method = 'mount', args = [root]) => {
    try { const loaded = await module; if (closed || visit !== page) return; const cleanup = loaded[method](...args); if (typeof cleanup === 'function') cleanups.push(cleanup); }
    catch (error) { console.warn('Page feature could not load:', error); }
  };
  const data = document.body.dataset, descriptors = [...document.querySelectorAll('[data-widget-src]')];
  if (descriptors.length) mount(import('./widgets.js'), 'mountWidgets', [root, descriptors]);
  if (data.pageSearch === 'true') mount(import('./search.js'));
  if (data.pageProblem === 'true') mount(import('./problem-disclosures.js'));
  if (document.body.classList.contains('puzzle-page')) mount(import('./puzzle-layout.mjs'));
  if (data.pageMath === 'true') math(root).catch(error => console.warn(error));
  if (root.querySelector('[data-gadget-workspace]') || gadgetPromise) {
    gadgets().then(({ service, ui }) => { if (!closed) cleanups.push(ui.mountWorkspace(root, service)); }).catch(error => console.warn('Gadgets could not load:', error));
  }
}
const navigate = initializeSiteNavigation({ leave: () => pageDispose(), enter });
initializeNavigation(navigate);
// No gadget runtime or clock loop on an ordinary visit without an active session.
try { const saved = JSON.parse(localStorage.getItem('almost-obvious:gadgets:v1')); if (saved?.version === 1 && (saved.timer || saved.sound)) gadgets().catch(error => console.warn(error)); } catch {}
enter(document.querySelector('[data-page-content]'));

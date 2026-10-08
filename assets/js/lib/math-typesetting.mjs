// Share one lazy MathJax load and one typesetting queue across articles and rules.
export function createMathTypesetter(environment = globalThis) {
  const { document } = environment;
  let ready = null, queue = Promise.resolve();
  function load() {
    if (!ready) {
      environment.MathJax = {
        loader: { load: ['ui/safe'] },
        options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'], safeOptions: { allow: { URLs: 'none', classes: 'none', cssIDs: 'none', styles: 'none' } } },
        tex: { tags: 'ams' },
        startup: { typeset: false }
      };
      ready = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-chtml.js'; script.id = 'MathJax-script';
        script.onload = () => environment.MathJax.startup.promise.then(resolve, error => { script.remove(); ready = null; reject(error); });
        script.onerror = () => { script.remove(); ready = null; reject(new Error('Mathematics could not load')); };
        document.head.append(script);
      });
    }
    return ready;
  }
  function typeset(root, { prepare, current = () => true, math = true } = {}) {
    const job = queue.catch(() => {}).then(async () => {
      if (!root.isConnected || !current()) return;
      if (prepare) { environment.MathJax?.typesetClear?.([root]); prepare(); }
      if (!math) return;
      await load();
      if (!root.isConnected || !current()) return;
      environment.MathJax.texReset?.();
      await environment.MathJax.typesetPromise([root]);
      if (!root.isConnected || !current()) environment.MathJax.typesetClear([root]);
    });
    queue = job;
    return job;
  }
  function clear(root) { queue = queue.catch(() => {}).then(() => environment.MathJax?.typesetClear?.([root])); return queue; }
  return { typeset, clear };
}
const shared = createMathTypesetter();
export const typesetMath = (...args) => shared.typeset(...args);
export const clearMath = root => shared.clear(root);

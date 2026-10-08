// A page owns its browser work. Legacy activities receive scoped APIs without
// changing the global browser environment or the mathematical controllers.
export function createPageEnvironment(root) {
  const owner = root.ownerDocument || root, browser = owner.defaultView || globalThis;
  const cleanups = new Set();
  let closed = false;
  function add(cleanup) {
    if (typeof cleanup !== 'function') return cleanup;
    if (closed) cleanup(); else cleanups.add(cleanup);
    return cleanup;
  }
  function listen(target, type, callback, options) {
    if (closed) return;
    target.addEventListener(type, callback, options);
    add(() => target.removeEventListener(type, callback, options));
  }
  const timeoutIds = new Set(), intervalIds = new Set(), frames = new Set();
  const setTimeout = (callback, delay, ...args) => {
    if (closed) return;
    const id = browser.setTimeout(() => { timeoutIds.delete(id); if (!closed) callback(...args); }, delay);
    timeoutIds.add(id); return id;
  };
  const clearTimeout = id => { timeoutIds.delete(id); browser.clearTimeout(id); };
  const setInterval = (callback, delay, ...args) => {
    if (closed) return;
    const id = browser.setInterval(() => { if (!closed) callback(...args); }, delay);
    intervalIds.add(id); return id;
  };
  const clearInterval = id => { intervalIds.delete(id); browser.clearInterval(id); };
  const requestAnimationFrame = callback => {
    if (closed) return;
    const id = browser.requestAnimationFrame(time => { frames.delete(id); if (!closed) callback(time); });
    frames.add(id); return id;
  };
  const cancelAnimationFrame = id => { frames.delete(id); browser.cancelAnimationFrame(id); };
  const overrides = { setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame, cancelAnimationFrame };
  for (const name of ['ResizeObserver', 'IntersectionObserver', 'MutationObserver']) {
    const Observer = browser[name];
    overrides[name] = Observer ? class extends Observer {
      constructor(callback, ...args) { super((...values) => { if (!closed) callback(...values); }, ...args); add(() => this.disconnect()); }
    } : undefined;
  }
  function proxy(target, extra = {}) {
    return new Proxy(target, { get(object, key) {
      if (key in extra) return extra[key];
      if (key === 'addEventListener') return (...args) => listen(object, ...args);
      const value = Reflect.get(object, key, object);
      return typeof value === 'function' ? value.bind(object) : value;
    } });
  }
  const document = proxy(owner, {
    querySelector: selector => root.querySelector(selector),
    querySelectorAll: selector => root.querySelectorAll(selector),
    getElementById: id => root.querySelector(`#${browser.CSS.escape(id)}`)
  });
  const window = proxy(browser, { ...overrides, document, matchMedia: query => proxy(browser.matchMedia(query)) });
  function dispose() {
    if (closed) return;
    closed = true;
    for (const cleanup of [...cleanups].reverse()) { try { cleanup(); } catch (error) { console.warn('Activity cleanup failed:', error); } }
    cleanups.clear();
    timeoutIds.forEach(id => browser.clearTimeout(id)); intervalIds.forEach(id => browser.clearInterval(id)); frames.forEach(id => browser.cancelAnimationFrame(id));
    timeoutIds.clear(); intervalIds.clear(); frames.clear();
  }
  return { document, window, ...overrides, add, dispose };
}

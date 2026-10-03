/* Navigation is an enhancement: every page and link works without this file. */
(() => {
  const root = document.documentElement;
  const sidebar = document.querySelector('#sidebar');
  const toggle = document.querySelector('.menu-toggle');
  const backdrop = document.querySelector('.sidebar-backdrop');
  const main = document.querySelector('main');
  const footer = document.querySelector('.site-footer');
  const search = document.querySelector('.search-link');
  const mobile = window.matchMedia('(max-width: 800px)');
  let desktopCollapsed = false;
  let mobileOpen = false;

  // Browsers may disable storage in private or restricted contexts.
  try { desktopCollapsed = localStorage.getItem('sidebar-collapsed') === 'true'; } catch (_) { /* Use the default. */ }

  function render() {
    const open = mobile.matches ? mobileOpen : !desktopCollapsed;
    root.classList.toggle('sidebar-collapsed', !mobile.matches && desktopCollapsed);
    root.classList.toggle('sidebar-open', mobile.matches && mobileOpen);
    sidebar.inert = !open;
    sidebar.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Hide navigation' : 'Show navigation');
    backdrop.hidden = !(mobile.matches && mobileOpen);
    main.inert = footer.inert = search.inert = mobile.matches && mobileOpen;
  }

  function closeMobile() {
    mobileOpen = false;
    render();
    toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => {
    if (mobile.matches) {
      mobileOpen = !mobileOpen;
      render();
      if (mobileOpen) sidebar.querySelector('a').focus({ preventScroll: true });
      else toggle.focus({ preventScroll: true });
    } else {
      desktopCollapsed = !desktopCollapsed;
      try { localStorage.setItem('sidebar-collapsed', String(desktopCollapsed)); } catch (_) { /* Optional preference. */ }
      render();
    }
  });
  backdrop.addEventListener('click', closeMobile);
  mobile.addEventListener('change', () => {
    const focusWasInSidebar = sidebar.contains(document.activeElement);
    mobileOpen = false;
    render();
    if (focusWasInSidebar && sidebar.inert) toggle.focus({ preventScroll: true });
  });

  document.addEventListener('keydown', (event) => {
    if (mobile.matches && mobileOpen) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobile();
      }
      if (event.key === 'Tab') {
        const controls = [...sidebar.querySelectorAll('a[href]'), toggle]
          .filter(control => control.getClientRects().length > 0);
        const index = controls.indexOf(document.activeElement);
        event.preventDefault();
        controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
      }
      return;
    }
    const target = event.target;
    const editing = target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName);
    if (event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const input = document.querySelector('#search-input');
      if (input) input.focus();
      else window.location.assign(`${search.href}#search-input`);
    }
  });

  root.classList.add('js');
  toggle.hidden = false;
  render();

  // A brief hover or keyboard focus gives the next page a head start.
  // Respect reduced-data connections and keep speculative work bounded.
  const connection = navigator.connection;
  if (!connection?.saveData && !/^(slow-)?2g$/.test(connection?.effectiveType || '')) {
    const prefetched = new Set();
    let prefetchTimer;
    function prepareLink(event) {
      const link = event.target.closest('a[href]');
      clearTimeout(prefetchTimer);
      if (!link || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || url.search || url.hash) return;
      if (!url.pathname.endsWith('/') || prefetched.has(url.href) || prefetched.size >= 10) return;
      prefetchTimer = setTimeout(() => {
        prefetched.add(url.href);
        const hint = document.createElement('link');
        hint.rel = 'prefetch'; hint.href = url.href;
        document.head.append(hint);
      }, 100);
    }
    document.addEventListener('pointerover', event => { if (event.pointerType === 'mouse') prepareLink(event); });
    document.addEventListener('focusin', prepareLink);
    document.addEventListener('pointerout', () => clearTimeout(prefetchTimer));
    document.addEventListener('focusout', () => clearTimeout(prefetchTimer));
  }
})();

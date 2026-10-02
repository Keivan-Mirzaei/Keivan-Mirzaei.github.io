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
        const controls = [...sidebar.querySelectorAll('a[href], summary'), toggle]
          .filter(control => control.getClientRects().length > 0
            && (control.matches('summary') || !control.closest('details:not([open])')));
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
})();

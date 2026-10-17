import { mountScrollHeader } from './lib/scroll-header.mjs';
/* Navigation is an enhancement: every page and link works without this file. */
export function initializeNavigation() {
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
    root.classList.remove('sidebar-start-collapsed');
    sidebar.inert = !open;
    sidebar.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Hide navigation' : 'Show navigation');
    toggle.title = open ? 'Hide navigation' : 'Show navigation';
    // Keep it rendered so its fade can finish before visibility switches off.
    backdrop.hidden = false;
    backdrop.setAttribute('aria-hidden', String(!(mobile.matches && mobileOpen)));
    main.inert = footer.inert = search.inert = mobile.matches && mobileOpen;
    document.querySelector('[data-gadget-dock]').inert = document.querySelector('[data-gadget-controls]').inert = mobile.matches && mobileOpen;
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
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let titleAnimation = null;
  document.addEventListener('site:page', () => {
    mobileOpen = false; render();
    titleAnimation?.cancel();
    if (!reducedMotion.matches) titleAnimation = document.querySelector('.topbar-title').animate?.(
      [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 260, easing: 'cubic-bezier(.22, 1, .36, 1)' }
    );
  });
  root.classList.add('js');
  toggle.hidden = false;
  render();
  // Animate user actions only after the restored layout has painted.
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('navigation-ready')));
  mountScrollHeader();
}

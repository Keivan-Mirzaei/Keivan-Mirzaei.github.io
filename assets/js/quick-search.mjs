import { findSearchResults, loadSearchIndex, searchTerms } from './lib/site-search.mjs';

export function initializeQuickSearch(navigate) {
  const dialog = document.querySelector('#quick-search');
  if (!dialog?.showModal) return;
  const trigger = document.querySelector('.search-link');
  const form = dialog.querySelector('form');
  const input = dialog.querySelector('input');
  const status = dialog.querySelector('.quick-search-status');
  const results = dialog.querySelector('.quick-search-results');
  const shortcuts = dialog.querySelector('.quick-search-shortcuts');
  const all = dialog.querySelector('.quick-search-all');
  let request = 0, timer, previousFocus;

  function fullSearchUrl() {
    const url = new URL(trigger.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim().slice(0, 200));
    return url.href;
  }
  function close(restoreFocus = true) {
    clearTimeout(timer); ++request;
    dialog.close();
    if (restoreFocus && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
  function open() {
    if (dialog.open) { input.focus({ preventScroll: true }); return; }
    previousFocus = document.activeElement;
    dialog.showModal();
    // Keep a previous query available when reopening the search window.
    input.focus({ preventScroll: true }); input.select();
    search();
  }
  async function search() {
    const visit = ++request, query = input.value.trim().slice(0, 200);
    all.href = fullSearchUrl();
    results.replaceChildren();
    shortcuts.hidden = Boolean(searchTerms(query).length);
    if (!shortcuts.hidden) { status.textContent = 'Find a post, puzzle, or idea.'; return; }
    status.textContent = 'Searching…';
    try {
      const entries = await loadSearchIndex(dialog.dataset.index);
      if (visit !== request || !dialog.open) return;
      const matches = findSearchResults(entries, query), visible = matches.slice(0, 6);
      status.textContent = matches.length
        ? `${matches.length > 6 ? 'Showing 6 of' : ''} ${matches.length} ${matches.length === 1 ? 'result' : 'results'}`.trim()
        : 'No matches. Try another word or a broader topic.';
      for (const entry of visible) {
        const link = document.createElement('a'); link.className = 'quick-search-result'; link.href = entry.url;
        const copy = document.createElement('span'); copy.className = 'quick-search-result-copy';
        const title = document.createElement('span'); title.className = 'quick-search-result-title'; title.textContent = entry.title;
        const detail = document.createElement('span'); detail.className = 'quick-search-result-detail'; detail.textContent = entry.description || '';
        const type = document.createElement('span'); type.className = 'quick-search-result-type'; type.textContent = entry.category;
        copy.append(title); if (entry.description) copy.append(detail);
        link.append(copy, type); results.append(link);
      }
    } catch {
      if (visit === request && dialog.open) status.textContent = 'Search is unavailable. Try again, or browse from Home.';
    }
  }

  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); open();
  });
  dialog.querySelector('.quick-search-close').addEventListener('click', () => close());
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  // Both ends of the pointer action must be on the backdrop; text selection stays safe.
  let backdropPress = false;
  const outside = event => {
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropPress = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (backdropPress && event.target === dialog && outside(event)) { close(); return; }
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); close(false); navigate(link.href);
  });
  input.addEventListener('input', () => {
    clearTimeout(timer); ++request;
    // Remove links to the previous query before the next search finishes.
    results.replaceChildren(); all.href = fullSearchUrl();
    timer = setTimeout(search, 120);
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const first = results.querySelector('a');
    const href = first?.href || fullSearchUrl(); close(false); navigate(href);
  });
  dialog.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Escape') {
      // Give the foreground dialog priority over gadget and activity panels.
      event.preventDefault(); event.stopPropagation(); close(); return;
    }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const links = [...(shortcuts.hidden ? results : shortcuts).querySelectorAll('a')];
    if (!links.length) return;
    event.preventDefault();
    const current = links.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? (current + 1) % links.length : (current <= 0 ? -1 : current - 1);
    (next === -1 ? input : links[next]).focus();
  });
  dialog.addEventListener('focusin', event => {
    for (const link of results.querySelectorAll('a')) link.classList.toggle('is-selected', link === event.target);
  });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.repeat || event.isComposing || document.documentElement.classList.contains('sidebar-open')) return;
    // Respect another active modal and ordinary typing, including activity inputs.
    if (document.querySelector('dialog[open]') && !dialog.open) return;
    const target = event.target;
    const editing = target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName);
    const slash = event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey;
    const command = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey;
    if (slash || command) { event.preventDefault(); open(); }
  });
  document.addEventListener('site:page', () => { if (dialog.open) close(false); });
}

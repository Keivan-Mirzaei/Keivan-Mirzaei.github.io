/* Full-text search over a generated JSON file. No service or search library. */
import { createPageEnvironment } from './lib/page-environment.mjs';
export function mount(root) {
  const environment = createPageEnvironment(root);
  const { document, window, setTimeout, clearTimeout } = environment;
  const app = document.querySelector('#search-app');
  if (!app) return;
  const input = document.querySelector('#search-input');
  const form = document.querySelector('.search-form');
  const status = document.querySelector('#search-status');
  const results = document.querySelector('#search-results');
  const more = document.querySelector('#search-more');
  const pageSize = 20;
  let indexPromise;
  let request = 0;
  let timer;
  let matches = [];
  let shown = 0;

  const normalize = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const termsFor = (query) => [...new Set(normalize(query).match(/[\p{L}\p{N}]+/gu) || [])];

  async function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch(app.dataset.index)
        .then((response) => {
          if (!response.ok) throw new Error('Search index unavailable');
          return response.json();
        })
        .then((entries) => entries.map((entry) => ({
          ...entry,
          titleText: normalize(entry.title),
          topicText: normalize(`${entry.category} ${entry.tags}`),
          bodyText: normalize(`${entry.description} ${entry.content}`)
        })))
        .catch((error) => { indexPromise = undefined; throw error; });
    }
    return indexPromise;
  }

  function rank(entry, terms) {
    let score = 0;
    for (const term of terms) {
      if (entry.titleText.includes(term)) score += 10;
      else if (entry.topicText.includes(term)) score += 5;
      else if (entry.bodyText.includes(term)) score += 1;
      else return 0;
    }
    return score;
  }

  function showMore() {
    const batch = document.createDocumentFragment();
    for (const entry of matches.slice(shown, shown + pageSize)) {
      const article = document.createElement('article');
      article.className = 'search-result';
      const category = document.createElement('span');
      category.className = 'eyebrow';
      category.textContent = entry.category;
      const heading = document.createElement('h2');
      const link = document.createElement('a');
      // Only generated, same-site paths can become result links.
      if (!entry.url.startsWith('/') || entry.url.startsWith('//')) continue;
      link.href = entry.url;
      link.textContent = entry.title;
      heading.append(link);
      const excerpt = document.createElement('p');
      // Summaries remain readable even when the matching body contains TeX or code.
      excerpt.textContent = entry.description || entry.content.slice(0, 220);
      article.append(category, heading, excerpt);
      batch.append(article);
    }
    results.append(batch);
    shown = Math.min(shown + pageSize, matches.length);
    more.hidden = shown >= matches.length;
  }

  async function search(updateUrl = true) {
    const thisRequest = ++request;
    const query = input.value.trim().slice(0, 200);
    const terms = termsFor(query);
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
      window.history.replaceState(window.history.state, '', url);
      window.dispatchEvent(new Event('site:urlchange'));
    }
    results.replaceChildren();
    more.hidden = true;
    if (!terms.length) {
      status.textContent = 'Enter a word or phrase to start exploring.';
      return;
    }
    status.textContent = 'Searching…';
    try {
      const entries = await loadIndex();
      if (request !== thisRequest) return; // Ignore an older query's response.
      matches = entries.map((entry) => ({ entry, score: rank(entry, terms) }))
        .filter((result) => result.score > 0)
        .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
        .map((result) => result.entry);
      shown = 0;
      status.textContent = matches.length
        ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'} for “${query}”`
        : `No results for “${query}”. Try fewer words or a broader topic.`;
      showMore();
    } catch (_) {
      if (request === thisRequest) status.textContent = 'Search could not load. Check your connection and press Search to try again, or browse All posts.';
    }
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    ++request; // Invalidate pending work immediately, before the debounce runs.
    timer = setTimeout(search, 150);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearTimeout(timer);
    search();
  });
  more.addEventListener('click', showMore);
  window.addEventListener('popstate', () => {
    clearTimeout(timer);
    input.value = (new URLSearchParams(window.location.search).get('q') || '').slice(0, 200);
    search(false);
  });
  input.value = (new URLSearchParams(window.location.search).get('q') || '').slice(0, 200);
  if (input.value) search(false);
  environment.add(() => { clearTimeout(timer); ++request; });
  // Continue the keyboard shortcut on arrival from another page.
  if (window.location.hash === '#search-input') input.focus();
  return environment.dispose;
}

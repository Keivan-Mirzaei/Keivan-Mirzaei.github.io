/* Shared, lazy full-text search for the header and the dedicated search page. */
const indexes = new Map();
const normalize = text => String(text || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
export const searchTerms = query => [...new Set(normalize(query).match(/[\p{L}\p{N}]+/gu) || [])];

export function prepareSearchIndex(entries) {
  return entries.filter(entry => typeof entry.url === 'string' && entry.url.startsWith('/') && !entry.url.startsWith('//'))
    .map(entry => ({ ...entry, titleText: normalize(entry.title), topicText: normalize(`${entry.category || ''} ${entry.tags || ''}`),
      bodyText: normalize(`${entry.description || ''} ${entry.content || ''}`) }));
}

export function loadSearchIndex(url) {
  if (!indexes.has(url)) {
    const request = fetch(url).then(response => {
      if (!response.ok) throw new Error('Search index unavailable');
      return response.json();
    }).then(prepareSearchIndex).catch(error => { indexes.delete(url); throw error; });
    indexes.set(url, request);
  }
  return indexes.get(url);
}

export function findSearchResults(entries, query) {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  return entries.map(entry => {
    let score = 0;
    for (const term of terms) {
      if (entry.titleText.includes(term)) score += 10;
      else if (entry.topicText.includes(term)) score += 5;
      else if (entry.bodyText.includes(term)) score += 1;
      else return { entry, score: 0 };
    }
    return { entry, score };
  }).filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .map(result => result.entry);
}

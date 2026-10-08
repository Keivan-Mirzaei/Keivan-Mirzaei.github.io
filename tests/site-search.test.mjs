import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareSearchIndex, findSearchResults, loadSearchIndex } from '../assets/js/lib/site-search.mjs';

test('search ranks titles before topics and body text, requiring every query term', () => {
  const entries = prepareSearchIndex([
    { title: 'An experiment', url: '/body/', content: 'Probability with cards' },
    { title: 'Card tricks', url: '/topic/', tags: 'probability cards' },
    { title: 'Probability with cards', url: '/title/' },
    { title: 'Probability with dice', url: '/dice/' }
  ]);
  assert.deepEqual(findSearchResults(entries, 'probability cards').map(entry => entry.url), ['/title/', '/topic/', '/body/']);
  assert.deepEqual(findSearchResults(entries, 'probability impossible'), []);
});

test('search handles accents, repeated terms and empty punctuation without changing the entries', () => {
  const entries = prepareSearchIndex([{ title: 'Café geometry', url: '/cafe/' }]);
  assert.equal(findSearchResults(entries, 'CAFE café')[0].title, 'Café geometry');
  assert.deepEqual(findSearchResults(entries, ' /?! '), []);
});

test('only local site paths can become search links', () => {
  const entries = prepareSearchIndex([
    { title: 'Safe', url: '/notes/safe/' }, { title: 'External', url: '//elsewhere.test/' },
    { title: 'Script', url: 'javascript:alert(1)' }, { title: 'Missing' }
  ]);
  assert.deepEqual(entries.map(entry => entry.url), ['/notes/safe/']);
});

test('both search interfaces share a downloaded index and failed downloads remain retryable', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    if (requests === 1) return { ok: false };
    return { ok: true, json: async () => [{ title: 'Geometry', url: '/geometry/' }] };
  };
  await assert.rejects(loadSearchIndex('/fixture-search.json'));
  const [header, page] = await Promise.all([loadSearchIndex('/fixture-search.json'), loadSearchIndex('/fixture-search.json')]);
  assert.equal(requests, 2); assert.equal(header, page);
  assert.equal(findSearchResults(header, 'geometry')[0].url, '/geometry/');
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { rulesMarkup, hasRulesMath } from '../assets/js/gadgets/model.mjs';
import { createRulesView } from '../assets/js/gadgets/rules.mjs';
import { createMathTypesetter } from '../assets/js/lib/math-typesetting.mjs';

const flush = () => new Promise(resolve => setImmediate(resolve));
function browser() {
  const scripts = [], calls = [];
  const environment = { document: { head: { append: script => scripts.push(script) }, createElement: () => ({ remove() { this.removed = true; } }) } };
  function loaded(typeset = async () => {}) {
    Object.assign(environment.MathJax, { startup: { promise: Promise.resolve() }, typesetPromise: async roots => { calls.push(roots[0]); await typeset(roots[0]); }, typesetClear: roots => calls.push(['clear', roots[0]]) });
    scripts.at(-1).onload();
  }
  return { environment, scripts, calls, loaded, renderer: createMathTypesetter(environment) };
}

test('rules preserve multiline display math and protect TeX from Markdown and pasted HTML', () => {
  const html = rulesMarkup('# Common question\nFind **all** $x < 2$ satisfying\n$$\n\\begin{aligned} x^2 &= 1 \\\\ x &= \\pm1 \\end{aligned}\n$$\n- Use \\(\\text{**a**}\\)\n<img src=x onerror=alert(1)>');
  assert.match(html, /<h2>Common question<\/h2>/);
  assert.match(html, /<strong>all<\/strong> \\\(x &lt; 2\\\)/);
  assert.match(html, /<p>\$\$\n\\begin\{aligned\}[\s\S]*?\n\$\$<\/p>/);
  assert.match(html, /\\text\{\*\*a\*\*\}/);
  assert.ok(!html.includes('<img')); assert.ok(!html.includes('<strong>a</strong>'));
  assert.equal(hasRulesMath('Write your name.'), false);
  assert.equal(hasRulesMath('The cost is \\$5.'), false);
  assert.equal(hasRulesMath('$$incomplete'), false);
  assert.equal(hasRulesMath('\\[x^2=1\\]'), true);
  assert.equal(rulesMarkup('\uE0000\uE000 $x$'), '<p>\uE0000\uE000 \\(x\\)</p>');
});

test('plain rules stay lightweight; concurrent math loads once and DOM updates are serialized', async () => {
  const app = browser(), first = { isConnected: true }, second = { isConnected: true };
  await app.renderer.typeset(first, { math: false, prepare: () => { first.text = 'Plain rules'; } });
  assert.equal(app.scripts.length, 0); assert.equal(first.text, 'Plain rules');
  let finish;
  const job = app.renderer.typeset(first); await flush();
  assert.equal(app.scripts.length, 1);
  assert.deepEqual(app.environment.MathJax.loader.load, ['ui/safe']);
  app.loaded(() => new Promise(resolve => { finish = resolve; })); await flush();
  const next = app.renderer.typeset(second, { math: false, prepare: () => { second.text = 'New rules'; } });
  await flush(); assert.equal(second.text, undefined);
  finish(); await job; await next;
  assert.equal(second.text, 'New rules'); assert.equal(app.scripts.length, 1);
});

test('stale and detached math cannot overwrite an edited or outgoing view, and math is cleared', async () => {
  const app = browser(), root = { isConnected: true }; let current = true, finish;
  const job = app.renderer.typeset(root); await flush();
  app.loaded(() => new Promise(resolve => { finish = resolve; })); await flush();
  const stale = app.renderer.typeset(root, { current: () => current, prepare: () => { root.text = 'Stale'; } });
  current = false; root.isConnected = false; finish(); await job; await stale;
  assert.equal(root.text, undefined); assert.deepEqual(app.calls.at(-1), ['clear', root]);
});

test('a failed math download leaves readable rules and can be retried', async () => {
  const app = browser(), root = { isConnected: true };
  const first = app.renderer.typeset(root, { prepare: () => { root.text = '$x$'; } }); await flush();
  app.scripts[0].onerror(); await assert.rejects(first, /could not load/); assert.equal(root.text, '$x$');
  const retry = app.renderer.typeset(root); await flush(); assert.equal(app.scripts.length, 2);
  app.loaded(); await retry; assert.equal(app.calls.at(-1), root);
});

test('equation numbering starts fresh after editing rules or navigating to another math page', async () => {
  const app = browser(), rules = { isConnected: true }, article = { isConnected: true }; let number = 0;
  const first = app.renderer.typeset(rules); await flush();
  app.loaded(async root => { root.number = ++number; }); app.environment.MathJax.texReset = () => { number = 0; };
  await first; await app.renderer.typeset(rules, { prepare: () => {} });
  assert.equal(rules.number, 1); await app.renderer.typeset(article); assert.equal(article.number, 1);
});

test('rapid rule edits coalesce, plain edits skip math, and leaving cancels pending work', async () => {
  const timers = new Map(), rendered = [], cleared = [], errors = []; let id = 0;
  const root = { innerHTML: '' };
  const view = createRulesView(root, {
    typeset: async (element, options) => { if (options.current()) { options.prepare(); rendered.push([element.innerHTML, options.math]); } },
    clear: element => cleared.push(element), onError: message => errors.push(message),
    environment: { setTimeout: callback => { const key = ++id; timers.set(key, () => { timers.delete(key); return callback(); }); return key; }, clearTimeout: key => timers.delete(key) }
  });
  await view.render('Plain rules'); assert.equal(rendered.at(-1)[1], false);
  view.render('$x$'); view.render('$y$'); assert.equal(timers.size, 1);
  await [...timers.values()][0](); assert.equal(rendered.at(-1)[0], '<p>\\(y\\)</p>');
  view.render('$z$'); view.dispose(); assert.equal(timers.size, 0);
  assert.equal(rendered.length, 2); assert.deepEqual(cleared, [root]);
});

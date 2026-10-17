import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../_includes/navigation-bootstrap.html', import.meta.url), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

test('the saved collapsed sidebar is restored before the application loads', () => {
  for (const value of ['true', 'false', null]) {
    const classes = new Set();
    vm.runInNewContext(source, { localStorage: { getItem: () => value }, document: { documentElement: { classList: { add: name => classes.add(name) } } } });
    assert.equal(classes.has('sidebar-start-collapsed'), value === 'true');
  }
});

test('blocked preference storage does not prevent the page from rendering', () => {
  assert.doesNotThrow(() => vm.runInNewContext(source, { get localStorage() { throw new Error('Blocked'); } }));
});

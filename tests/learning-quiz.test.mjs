import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-topic.js', import.meta.url), 'utf8');
function quiz(storage = new Map()) {
  const elements = new Map();
  const handlers = {};
  const get = id => {
    if (!elements.has(id)) elements.set(id, {
      textContent: '', innerHTML: '', dataset: {},
      removeAttribute() {}, setAttribute() {}, addEventListener() {},
      querySelectorAll: () => [], querySelector: () => ({ focus() {} }),
    });
    return elements.get(id);
  };
  get('exercise-data').textContent = JSON.stringify([
    { text: 'First', options: ['A', 'B'], correct: 0, why: 'First reason.' },
    { text: 'Second', options: ['A', 'B'], correct: 1, why: 'Second reason.' },
    { text: 'Third', options: ['A', 'B'], correct: 0, why: 'Third reason.' },
  ]);
  vm.runInNewContext(source, { location: { pathname: '/lesson/' }, localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }, document: {
    body: { dataset: {} }, getElementById: get, querySelectorAll: () => [],
    addEventListener: (name, handler) => { handlers[name] = handler; },
  } });
  return {
    get,
    select(value) { handlers.change({ target: { matches: () => true, value: String(value) } }); },
    deselect(value) { handlers.click({ target: { matches: () => true, value: String(value) }, preventDefault() {} }); },
    go(index) { handlers.click({ target: { closest: () => ({ dataset: { goQuestion: index } }) } }); },
    state(index) {
      return new RegExp(`data-go-question="${index}" data-result="([^"]+)"`).exec(get('question-dots').innerHTML)[1];
    },
  };
}

test('selecting answers grades them immediately and leaves unanswered questions grey', () => {
  const q = quiz();
  q.select(0); q.go(1); q.select(0);
  assert.deepEqual([q.state(0), q.state(1), q.state(2)], ['correct', 'incorrect', 'pending']);
  assert.equal(q.get('quiz-status').textContent, '1 correct, 1 incorrect, 1 unanswered.');
  q.go(0);
  assert.match(q.get('feedback-0').textContent, /Correct/);
});

test('changing an answer updates only its result', () => {
  const q = quiz();
  q.select(0); q.go(1); q.select(0);
  q.select(1);
  assert.equal(q.state(1), 'correct');
  assert.match(q.get('feedback-1').textContent, /Correct/);
  assert.equal(q.state(0), 'correct');
  assert.equal(q.state(2), 'pending');
});

test('previous and next navigation stop at quiz boundaries', () => {
  const q = quiz();
  assert.equal(q.get('previous-question').disabled, true);
  q.get('next-question').onclick(); q.get('next-question').onclick();
  assert.equal(q.get('next-question').disabled, true);
  q.get('next-question').onclick();
  assert.match(q.get('question-area').innerHTML, /Third/);
  q.get('previous-question').onclick();
  assert.match(q.get('question-area').innerHTML, /Second/);
});

test('quiz selections, results and current question survive a new visit', () => {
  const storage = new Map();
  const first = quiz(storage);
  first.select(0); first.go(1); first.select(0);
  const restored = quiz(storage);
  assert.match(restored.get('question-area').innerHTML, /Second/);
  assert.match(restored.get('question-area').innerHTML, /value="0"[^>]*checked/);
  assert.deepEqual([restored.state(0), restored.state(1), restored.state(2)], ['correct', 'incorrect', 'pending']);
});

test('invalid saved quiz data is ignored', () => {
  const storage = new Map([['learning-quiz:/lesson/:v1', '{broken']]);
  const q = quiz(storage);
  assert.equal(q.state(0), 'pending');
});

test('clicking the selected answer again clears the choice and its saved highlight', () => {
  const storage = new Map();
  const q = quiz(storage);
  q.select(0); q.deselect(0);
  assert.equal(q.state(0), 'pending');
  assert.doesNotMatch(q.get('question-area').innerHTML, /\schecked/);
  assert.equal(q.get('feedback-0').textContent, '');
  assert.doesNotMatch(quiz(storage).get('question-area').innerHTML, /\schecked/);
});

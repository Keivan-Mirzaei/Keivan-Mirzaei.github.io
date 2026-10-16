import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/learning-topic.js', import.meta.url), 'utf8');
function quiz() {
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
  vm.runInNewContext(source, { document: {
    body: { dataset: {} }, getElementById: get, querySelectorAll: () => [],
    addEventListener: (name, handler) => { handlers[name] = handler; },
  } });
  return {
    get,
    select(value) { handlers.change({ target: { matches: () => true, value: String(value) } }); },
    go(index) { handlers.click({ target: { closest: () => ({ dataset: { goQuestion: index } }) } }); },
    state(index) {
      return new RegExp(`data-go-question="${index}" data-result="([^"]+)"`).exec(get('question-dots').innerHTML)[1];
    },
  };
}

test('Check this question leaves saved answers in other questions unchecked', () => {
  const q = quiz();
  q.select(0); q.go(1); q.select(0); q.go(0);
  q.get('check-current').onclick();
  assert.equal(q.state(0), 'correct');
  assert.equal(q.state(1), 'pending');
  assert.equal(q.state(2), 'pending');
});

test('Check all grades saved answers together and leaves unanswered questions grey', () => {
  const q = quiz();
  q.select(0); q.go(1); q.select(0);
  q.get('check-answers').onclick();
  assert.deepEqual([q.state(0), q.state(1), q.state(2)], ['correct', 'incorrect', 'pending']);
  assert.equal(q.get('quiz-status').textContent, '1 correct, 1 incorrect, 1 unanswered.');
  q.go(0);
  assert.match(q.get('feedback-0').textContent, /Correct/);
});

test('editing clears only that result; rechecking grades the new answer', () => {
  const q = quiz();
  q.select(0); q.go(1); q.select(0); q.get('check-answers').onclick();
  q.select(1);
  assert.equal(q.state(1), 'pending');
  assert.equal(q.get('feedback-1').textContent, '');
  assert.equal(q.state(0), 'correct');
  q.get('check-current').onclick();
  assert.equal(q.state(1), 'correct');
  assert.equal(q.state(2), 'pending');
});

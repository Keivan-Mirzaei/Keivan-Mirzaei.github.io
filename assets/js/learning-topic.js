(() => {
  const $ = id => document.getElementById(id);
  const mathReady = document.body.dataset.topicMath === 'true'
    ? import('./lib/math-typesetting.mjs') : null;
  function renderMath(root) {
    if (mathReady) mathReady.then(({ typesetMath }) => typesetMath(root)).catch(() => {});
  }

  const questions = JSON.parse($('exercise-data')?.textContent || '[]');
  const answers = questions.map(() => ({ selected: null, checked: false }));
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]
  ));
  let active = 0;

  function questionMarkup(question, index) {
    const options = question.options.map((option, choice) => `
      <label class="answer">
        <input type="radio" name="question-${index}" value="${choice}"
          aria-label="${escapeHtml(option.replace(/\\[()]/g, ''))}" data-question="${index}"
          ${answers[index].selected === choice ? 'checked' : ''}>
        ${escapeHtml(option)}
      </label>`).join('');
    return `<div class="question-card"><fieldset>
      <legend><span class="element-label question-number">Question ${index + 1}</span>${escapeHtml(question.text)}</legend>
      <div class="answers">${options}</div>
      </fieldset><p class="feedback" id="feedback-${index}" role="status"></p></div>`;
  }

  function updateAnswerVisuals() {
    const answer = answers[active];
    const question = questions[active];
    document.querySelectorAll(`[name="question-${active}"]`).forEach(input => {
      const label = input.closest('label');
      label.removeAttribute('data-result');
      label.querySelector('.answer-verdict')?.remove();
      if (!answer.checked) return;
      const choice = Number(input.value);
      if (choice !== question.correct && choice !== answer.selected) return;
      const correct = choice === question.correct;
      label.dataset.result = correct ? 'correct' : 'incorrect';
      const verdict = document.createElement('span');
      verdict.className = 'answer-verdict';
      verdict.textContent = correct ? 'Correct' : 'Your answer';
      label.append(verdict);
    });
    const feedback = $(`feedback-${active}`);
    feedback.removeAttribute('data-result');
    feedback.textContent = '';
    if (!answer.checked) return;
    const correct = answer.selected === question.correct;
    feedback.dataset.result = correct ? 'correct' : 'incorrect';
    feedback.textContent = (correct ? 'Correct. ' : 'Not quite. ') + question.why + (correct ? '' : ' You can try again.');
    renderMath(feedback);
  }

  function renderProgress() {
    $('question-dots').innerHTML = answers.map((answer, index) => {
      const result = !answer.checked ? 'pending' : answer.selected === questions[index].correct ? 'correct' : 'incorrect';
      const label = result === 'pending' ? (answer.selected === null ? 'not answered' : 'not checked') : result;
      return `<button data-go-question="${index}" data-result="${result}"
        aria-label="Question ${index + 1}: ${label}" ${index === active ? 'aria-current="step"' : ''}>
        <span aria-hidden="true">${index + 1}</span></button>`;
    }).join('');
    $('previous-question').disabled = active === 0;
    $('next-question').disabled = active === questions.length - 1;
  }

  function renderQuestion() {
    $('question-area').innerHTML = questionMarkup(questions[active], active);
    updateAnswerVisuals();
    renderProgress();
    renderMath($('question-area'));
  }

  document.addEventListener('change', event => {
    if (!event.target.matches('[data-question]')) return;
    answers[active].selected = Number(event.target.value);
    answers[active].checked = false;
    $('quiz-status').textContent = '';
    updateAnswerVisuals();
    renderProgress();
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-go-question]');
    if (!button) return;
    active = Number(button.dataset.goQuestion);
    renderQuestion();
    $('question-area').querySelector('input').focus();
  });
  if ($('previous-question')) $('previous-question').onclick = () => {
    if (active === 0) return;
    active -= 1; renderQuestion();
  };
  if ($('next-question')) $('next-question').onclick = () => {
    if (active === questions.length - 1) return;
    active += 1; renderQuestion();
  };
  if ($('check-answers')) $('check-answers').onclick = () => {
    answers.forEach(answer => { answer.checked = answer.selected !== null; });
    updateAnswerVisuals();
    renderProgress();
    const attempted = answers.filter(answer => answer.checked).length;
    const correct = answers.filter((answer, index) => answer.checked && answer.selected === questions[index].correct).length;
    $('quiz-status').textContent = attempted
      ? `${correct} correct, ${attempted - correct} incorrect, ${questions.length - attempted} unanswered.`
      : 'Choose an answer before checking.';
  };

  const contents = $('topic-map');
  $('topic-contents').onclick = () => {
    contents.showModal();
    $('contents-title').focus({ preventScroll: true });
    $('topic-contents').setAttribute('aria-expanded', 'true');
  };
  $('close-course-map').onclick = () => contents.close();
  contents.addEventListener('close', () => $('topic-contents').setAttribute('aria-expanded', 'false'));
  contents.querySelectorAll('a').forEach(link => link.addEventListener('click', () => contents.close()));
  function outside(event) {
    const rect = contents.getBoundingClientRect();
    return event.target === contents && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  }
  let backdropDown = false;
  contents.addEventListener('pointerdown', event => { backdropDown = outside(event); });
  contents.addEventListener('pointercancel', () => { backdropDown = false; });
  contents.addEventListener('click', event => {
    if (backdropDown && outside(event)) contents.close();
    backdropDown = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const disclosure = event.target.closest('details[open]');
    if (disclosure && !disclosure.matches('.problem-card > .disclosure')) {
      disclosure.open = false;
      disclosure.querySelector('summary').focus();
    }
  });
  renderMath($('main'));
  if (questions.length) renderQuestion();
})();

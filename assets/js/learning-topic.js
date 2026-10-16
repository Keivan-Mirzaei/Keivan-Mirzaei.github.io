(() => {
  const $ = id=>document.getElementById(id);
  const questions=JSON.parse($('exercise-data')?.textContent || '[]');
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const answers=questions.map(()=>({selected:null,checked:false}));
  let active=0;
  function questionMarkup(q,i){const state=answers[i];return `<div class="question-card"><fieldset><legend><span class="question-number">Question ${i+1}</span>${escapeHtml(q.text)}</legend><div class="answers">${q.options.map((o,j)=>`<label class="answer"><input type="radio" name="question-${i}" value="${j}" data-question="${i}" ${state.selected===j?'checked':''}>${escapeHtml(o)}</label>`).join('')}</div></fieldset><button class="question-check" data-check="${i}">Check answer</button><p class="feedback" id="feedback-${i}" role="status"></p></div>`;}
  function updateAnswerVisuals(i){
    const state=answers[i],q=questions[i];
    document.querySelectorAll(`[name="question-${i}"]`).forEach(input=>{
      const label=input.closest('label');
      label.removeAttribute('data-result');
      label.querySelector('.answer-verdict')?.remove();
      if(!state.checked)return;
      const choice=Number(input.value);
      if(choice===q.correct || choice===state.selected){
        const correct=choice===q.correct;
        label.dataset.result=correct?'correct':'incorrect';
        const verdict=document.createElement('span');verdict.className='answer-verdict';
        verdict.textContent=correct?'✓ Correct':'× Your answer';label.append(verdict);
      }
    });
    const feedback=$(`feedback-${i}`);
    feedback.removeAttribute('data-result');
    if(state.checked) {
      const correct=state.selected===q.correct;feedback.dataset.result=correct?'correct':'incorrect';
      feedback.textContent=(correct?'✓ Correct. ':'× Not quite. ')+q.why+(correct?'':' You can try again.');
    }
  }
  function renderQuestions(){
    $('question-area').innerHTML=questionMarkup(questions[active],active);
    $('question-position').textContent=`${active+1} of ${questions.length}`;
    questions.forEach((q,i)=>{if($(`feedback-${i}`))updateAnswerVisuals(i);});
    $('question-back').disabled=active===0;$('question-next').disabled=active===questions.length-1;
  }
  document.addEventListener('change',e=>{if(e.target.matches('[data-question]')){const i=+e.target.dataset.question;answers[i].selected=+e.target.value;answers[i].checked=false;$(`feedback-${i}`).textContent='';updateAnswerVisuals(i);}});
  document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.check!==undefined){const i=+b.dataset.check;if(answers[i].selected===null){$(`feedback-${i}`).textContent='Choose an answer first.';return;}answers[i].checked=true;updateAnswerVisuals(i);}});
  for(const [id,delta] of [['question-back',-1],['question-next',1]]) if($(id)) $(id).onclick=()=>{active=Math.max(0,Math.min(questions.length-1,active+delta));renderQuestions();$('question-area').querySelector('input').focus();};
  $('topic-contents').onclick=()=>{$('topic-map').showModal();$('topic-contents').setAttribute('aria-expanded','true');};
  $('close-course-map').onclick=()=>$('topic-map').close();
  $('topic-map').addEventListener('close',()=>$('topic-contents').setAttribute('aria-expanded','false'));
  $('topic-map').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>$('topic-map').close()));
  const outside=e=>{const r=$('topic-map').getBoundingClientRect();return e.target===$('topic-map')&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);};
  let down=false;$('topic-map').addEventListener('pointerdown',e=>down=outside(e));$('topic-map').addEventListener('pointercancel',()=>down=false);$('topic-map').addEventListener('click',e=>{if(down&&outside(e))$('topic-map').close();down=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const detail=e.target.closest('details[open]');if(detail){detail.open=false;detail.querySelector('summary').focus();}}});
  if(document.body.dataset.topicMath==='true') import('./lib/math-typesetting.mjs').then(({typesetMath})=>typesetMath($('main'))).catch(()=>{});
  if(questions.length) renderQuestions();
})();

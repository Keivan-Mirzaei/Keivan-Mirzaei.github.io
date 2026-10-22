import { DEMO, cameraPose, settle, travel, cueAt, cueEnvelope, signatureEnvelope, enabledAt, stateAt } from './lib/laser-demo-motion.mjs';

export function mountSetup(root) {
  const setup = root.querySelector('[data-laser-setup]');
  if (!setup) return () => {};
  const browser = setup.querySelector('[data-laser-browser]');
  const guides = [...setup.querySelectorAll('[data-laser-guide]')];
  const desktop = setup.querySelector('[data-laser-desktop-shortcuts]');
  const ipad = setup.querySelector('[data-laser-ipad-shortcuts]');
  const update = () => {
    guides.forEach(guide => { guide.hidden = guide.dataset.laserGuide !== browser.value; });
    desktop.hidden = browser.value === 'safari-ipad';
    ipad.hidden = !desktop.hidden;
  };
  browser.addEventListener('change', update);
  update();
  return () => browser.removeEventListener('change', update);
}

// The stage embeds the unchanged Laser Pointer runtime in a local demo document.
export function mount(root) {
  const disposeSetup = mountSetup(root);
  const host = root.querySelector('[data-laser-demo]');
  if (!host) return disposeSetup;
  const iframe = host.querySelector('[data-laser-frame]');
  const viewport = host.querySelector('[data-laser-viewport]');
  const toggle = host.querySelector('[data-laser-motion]');
  const pauseIcon = host.querySelector('[data-laser-pause-icon]');
  const playIcon = host.querySelector('[data-laser-play-icon]');
  const navigation = host.querySelector('[data-laser-navigation]');
  const progress = host.querySelector('[data-laser-progress]');
  const step = host.querySelector('[data-laser-step]');
  const stepTitle = host.querySelector('[data-laser-step-title]');
  const stepCount = host.querySelector('[data-laser-step-count]');
  const stepInstruction = host.querySelector('[data-laser-step-instruction]');
  const restart = host.querySelector('[data-laser-restart]');
  const tryButton = host.querySelector('[data-laser-try]');
  const toolbar = host.querySelector('[data-laser-toolbar]');
  const clickPulse = host.querySelector('[data-laser-click-pulse]');
  const popup = host.querySelector('[data-laser-access]');
  const cursor = host.querySelector('[data-laser-cursor]');
  const cue=host.querySelector('[data-laser-cue]');
  const cueKey=host.querySelector('[data-laser-cue-key]');
  const signature=host.querySelector('[data-laser-signature]');
  const chapters = [...host.querySelectorAll('[data-laser-chapter]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = Number(host.dataset.duration) * 1000;
  let api = null, frame = 0, closed = false, inView = true, manual = false, pendingEnabled = null;
  let wantsPlayback = !reduced.matches, time = reduced.matches ? DEMO.preview.resume : 0, origin = 0, lastChapter = null;
  function camera() {
    const pose=cameraPose(time,viewport.clientWidth);
    iframe.style.width=manual ? '100%' : '1000px';
    iframe.style.height='520px';
    iframe.style.transform=manual ? 'none' : `scale(${pose.scale}) translate(${-pose.x}px,${-pose.y}px)`;
    viewport.style.height=manual ? '520px' : `${pose.height}px`;
    const intro=iframe.contentDocument?.querySelector('[data-study-intro]');
    if(intro) intro.style.opacity=!manual && viewport.clientWidth<650 && time>=12300 && time<24400 ? '0':'1';
  }
  function updateCursor() {
    cursor.hidden=true;
    if(manual) return;
    const shell=host.querySelector('.laser-live-browser').getBoundingClientRect();
    let position;
    if(time<DEMO.enabled[0][0]) {
      const center=element=>{
        const box=element.getBoundingClientRect();
        return [box.left-shell.left+box.width/2,box.top-shell.top+box.height/2];
      };
      const ring=center(toolbar);
      position=travel([ring[0]-36,ring[1]+55],ring,(time-150)/500,-.1);
      if(time>=1950) position=travel(ring,center(popup.querySelector('.laser-access-button')),(time-1950)/750,.1);
      if(time>=1950) {
        const box=iframe.getBoundingClientRect(), scale=box.width/1000;
        iframe.dataset.entryPoint=[(shell.left+position[0]-box.left)/scale,(shell.top+position[1]-box.top)/scale].join(',');
      }
      cursor.style.opacity=String(settle((3400-time)/160));
    } else {
      const point=api?.state.cursor;
      if(point && point[1]<4) {
        const box=iframe.getBoundingClientRect(), scale=box.width/1000;
        position=[box.left-shell.left+point[0]*scale,box.top-shell.top+point[1]*scale];
        cursor.style.opacity='1';
      }
    }
    if(position) { cursor.hidden=false; cursor.style.transform=`translate(${position[0]}px,${position[1]}px)`; }
  }
  function render() {
    let index = -1;
    if (!manual) {
      index = 0;
      chapters.forEach((chapter,i) => { if (time >= Number(chapter.dataset.start)*1000) index = i; });
    }
    // Announce user-controlled steps, without interrupting screen readers during autoplay.
    step.setAttribute('aria-live',manual || !wantsPlayback ? 'polite' : 'off');
    if (index !== lastChapter) {
      lastChapter = index;
      const chapter = chapters[index];
      stepTitle.textContent = manual ? 'Your turn' : chapter.dataset.title;
      stepCount.textContent = manual ? 'Hands-on demo' : `Step ${index+1} of ${chapters.length}`;
      stepInstruction.textContent = manual ? 'Draw here; press Space to use the page, then again to resume.' : chapter.dataset.instruction;
      chapters.forEach((chapter,i) => i === index ? chapter.setAttribute('aria-current','step') : chapter.removeAttribute('aria-current'));
    }
    stepInstruction.hidden = !manual;
    navigation.hidden = manual;
    progress.hidden = manual;
    popup.hidden=manual || time<DEMO.popup[0] || time>=DEMO.popup[1];
    const reveal=Math.min(settle((time-DEMO.popup[0])/200),settle((DEMO.popup[1]-time)/200));
    popup.style.opacity=String(reveal);
    popup.style.transform=`translateY(${4*(1-reveal)}px) scale(${.985+.015*reveal})`;
    updateCursor();
    const state=manual ? !api?.state.enabled ? 'off' : api.state.paused ? 'paused' : 'on' : stateAt(time);
    const instruction=manual ? {kind:'key',key:'Space'} : cueAt(time);
    cueKey.textContent=instruction.key || '';
    cueKey.hidden=!instruction.key;
    const envelope=manual ? {visible:state==='on',opacity:1,offset:0} : cueEnvelope(time);
    cue.hidden=!envelope.visible;
    cue.style.opacity=String(envelope.opacity);
    cue.style.transform=`translateY(${envelope.offset}px)`;
    cue.classList.toggle('is-pressed',Boolean(instruction.pressed));
    const brand=manual ? {visible:false,opacity:0} : signatureEnvelope(time);
    signature.hidden=!brand.visible;
    signature.style.opacity=String(brand.opacity);
    signature.setAttribute('aria-hidden',String(!brand.visible));
    if(brand.visible) cursor.hidden=true;
    host.dataset.laserState=state;
    toolbar.classList.toggle('is-cued',!manual && (time<1000 || time>=26000 && time<27000));
    toolbar.classList.toggle('is-clicked',!manual && DEMO.clicks.some(at=>time>=at && time<at+240));
    const clickTime=DEMO.clicks.findLast(at=>time>=at);
    const pulse=manual || clickTime===undefined ? 1 : settle((time-clickTime)/900);
    clickPulse.style.opacity=String(1-pulse);
    clickPulse.style.transform=`scale(${1+pulse*1.25})`;
    popup.querySelector('.laser-access-button').classList.toggle('is-pressed',time>=2850 && time<3020);
    toolbar.classList.toggle('is-on',state!=='off');
    toolbar.classList.toggle('is-paused',state==='paused');
    toolbar.setAttribute('aria-pressed',String(state!=='off'));
    toggle.setAttribute('aria-label',wantsPlayback ? 'Pause demo' : 'Resume demo');
    toggle.setAttribute('title',wantsPlayback ? 'Pause demo' : 'Resume demo');
    pauseIcon.hidden = !wantsPlayback;
    playIcon.hidden = wantsPlayback;
    toggle.hidden = manual;
    restart.hidden = manual;
    tryButton.textContent = manual ? 'Back to demo' : 'Try the ink';
    host.classList.toggle('is-interactive',manual);
    camera();
  }
  const running = () => api && wantsPlayback && inView && !document.hidden && !manual && !closed;
  function tick(now) {
    frame = 0;
    if (!running()) return;
    time = (now-origin) % duration;
    api.seek(time);
    render();
    frame = requestAnimationFrame(tick);
  }
  function updatePlayback() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    origin = performance.now()-time;
    if (api && !manual) {
      const seeking=api.seek(time);
      // A paused chapter jump must also update the cursor after the iframe seeks.
      seeking?.then(()=>{ if(!closed && !manual && !running()) render(); });
    }
    render();
    if (running()) frame = requestAnimationFrame(tick);
  }
  const onToggle = () => { wantsPlayback = !wantsPlayback; updatePlayback(); };
  const onRestart = () => { time = 0; lastChapter = null; updatePlayback(); };
  const seekChapter = index => {
    const chapter = chapters[index];
    if (manual || !chapter) return;
    time = Number(wantsPlayback ? chapter.dataset.start : chapter.dataset.preview)*1000;
    updatePlayback();
  };
  const chapterHandlers = chapters.map(chapter => {
    const onClick = () => seekChapter(chapters.indexOf(chapter));
    chapter.addEventListener('click',onClick);
    return onClick;
  });
  const onTry = () => {
    manual = !manual;
    if(!manual) pendingEnabled=null;
    api = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    iframe.src = iframe.dataset.source + '?mode=' + (manual ? 'try' : 'replay');
    lastChapter = null;
    render();
  };
  const onToolbar = async () => {
    if (!manual) { pendingEnabled=!enabledAt(time); onTry(); return; }
    if (api) { await api.toggle(); render(); iframe.focus(); }
  };
  const onState = event => {
    if (event.source === iframe.contentWindow && event.origin === location.origin && event.data?.type === 'laser-demo-state' && manual) render();
  };
  const onReady = async event => {
    if (event.source !== iframe.contentWindow || event.origin !== location.origin || event.data?.type !== 'laser-demo-ready' || closed) return;
    api = iframe.contentWindow.laserDemo;
    if(manual && pendingEnabled!==null) { await api.setEnabled(pendingEnabled); pendingEnabled=null; }
    if (manual) iframe.focus();
    host.querySelectorAll('[data-laser-controls]').forEach(control => { control.hidden = false; });
    updatePlayback();
  };
  const onMotion = () => { if (reduced.matches) wantsPlayback = false; updatePlayback(); };
  const onVisibility = () => updatePlayback();
  const onHide = () => { inView = false; updatePlayback(); };
  const onShow = () => { inView = true; updatePlayback(); };
  const observer = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; updatePlayback(); },{threshold:.1});
  const resizeObserver = new ResizeObserver(camera);
  observer.observe(viewport); resizeObserver.observe(viewport);
  window.addEventListener('message',onReady);
  window.addEventListener('message',onState);
  window.addEventListener('pagehide',onHide);
  window.addEventListener('pageshow',onShow);
  document.addEventListener('visibilitychange',onVisibility);
  reduced.addEventListener('change',onMotion);
  toggle.addEventListener('click',onToggle);
  restart.addEventListener('click',onRestart);
  tryButton.addEventListener('click',onTry);
  toolbar.addEventListener('click',onToolbar);
  // A cached frame can become ready before the page feature finishes loading.
  if (iframe.contentWindow?.laserDemo?.ready) {
    api = iframe.contentWindow.laserDemo;
    if (manual) iframe.focus();
    host.querySelectorAll('[data-laser-controls]').forEach(control => { control.hidden = false; });
  }
  updatePlayback();
  return () => {
    if (closed) return;
    closed = true;
    disposeSetup();
    if (frame) cancelAnimationFrame(frame);
    observer.disconnect(); resizeObserver.disconnect();
    iframe.src = 'about:blank';
    window.removeEventListener('message',onReady);
    window.removeEventListener('message',onState);
    window.removeEventListener('pagehide',onHide);
    window.removeEventListener('pageshow',onShow);
    document.removeEventListener('visibilitychange',onVisibility);
    reduced.removeEventListener('change',onMotion);
    toggle.removeEventListener('click',onToggle);
    restart.removeEventListener('click',onRestart);
    tryButton.removeEventListener('click',onTry);
    toolbar.removeEventListener('click',onToolbar);
    chapters.forEach((chapter,i)=>chapter.removeEventListener('click',chapterHandlers[i]));
  };
}

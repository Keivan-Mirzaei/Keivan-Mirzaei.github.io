// A deliberately exaggerated equilibrium-tide sketch. Both ocean bulges stay
// aligned with the Moon; the fixed coast moves from high to low water as it turns.
export const STUDY = { x:350, y:105, earth:60, high:88, low:63, orbit:166, start:25, end:115 };
export function tideStudy(angle) {
  const value=Number(angle);
  const position=Math.max(0,Math.min(180,Number.isFinite(value)?value:STUDY.start));
  const radians=position*Math.PI/180, c=Math.cos(radians), s=Math.sin(radians);
  const level=Math.cos(2*radians);
  return {
    angle:position,
    level,
    label:level>.5?'High tide':level<-.5?'Low tide':'Mid tide',
    moon:[STUDY.x+STUDY.orbit*c,STUDY.y-STUDY.orbit*s],
    near:[STUDY.x+STUDY.high*c,STUDY.y-STUDY.high*s],
    far:[STUDY.x-STUDY.high*c,STUDY.y+STUDY.high*s],
    axisStart:[STUDY.x+(STUDY.high+9)*c,STUDY.y-(STUDY.high+9)*s],
    axisEnd:[STUDY.x+(STUDY.orbit-26)*c,STUDY.y-(STUDY.orbit-26)*s]
  };
}
export function tideAngleAt([x,y]) {
  return tideStudy(Math.atan2(Math.max(0,STUDY.y-y),x-STUDY.x)*180/Math.PI).angle;
}

export function mountTideStudy(root) {
  const diagram=root.querySelector('[data-study-diagram]');
  const handle=root.querySelector('[data-study-moon]');
  let angle=STUDY.start, dragId=null;
  const clientPoint=point=>{
    const m=diagram.getScreenCTM();
    return [m.a*point[0]+m.c*point[1]+m.e,m.b*point[0]+m.d*point[1]+m.f];
  };
  function render() {
    const study=tideStudy(angle);
    root.querySelector('[data-study-bulges]').setAttribute('transform',`rotate(${-angle} ${STUDY.x} ${STUDY.y})`);
    root.querySelector('[data-study-axis]').setAttribute('d',`M ${study.axisStart.join(' ')} L ${study.axisEnd.join(' ')}`);
    root.querySelector('[data-study-reading]').textContent=study.label;
    handle.setAttribute('transform',`translate(${study.moon.join(' ')})`);
    handle.setAttribute('aria-valuenow',String(Math.round(angle)));
    handle.setAttribute('aria-valuetext',`${Math.round(angle)} degrees; ${study.label.toLowerCase()} at the marked coast`);
    root.body.dataset.studyAngle=angle.toFixed(2);
    root.body.dataset.studyTide=study.label;
    const [moonX,moonY]=clientPoint(study.moon);
    root.body.style.setProperty('--moon-x',`${moonX}px`);
    root.body.style.setProperty('--moon-y',`${moonY}px`);
  }
  function setAngle(value) { angle=tideStudy(value).angle; render(); }
  function move(event) {
    if(event.pointerId!==dragId) return;
    const m=diagram.getScreenCTM().inverse();
    setAngle(tideAngleAt([m.a*event.clientX+m.c*event.clientY+m.e,m.b*event.clientX+m.d*event.clientY+m.f]));
  }
  handle.addEventListener('pointerdown',event=>{
    if(event.button!==0) return;
    event.preventDefault();
    dragId=event.pointerId;
    handle.classList.toggle('is-dragging',true);
    handle.focus({preventScroll:true});
    try { handle.setPointerCapture(event.pointerId); }
    catch(error) { if(error.name!=='NotFoundError') throw error; }
    move(event);
  });
  handle.addEventListener('pointermove',move);
  const release=event=>{
    if(event.pointerId!==dragId) return;
    dragId=null;
    handle.classList.toggle('is-dragging',false);
    if(handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  };
  for(const name of ['pointerup','pointercancel','lostpointercapture']) handle.addEventListener(name,release);
  handle.addEventListener('keydown',event=>{
    const delta={ArrowUp:3,ArrowRight:3,ArrowDown:-3,ArrowLeft:-3}[event.key];
    if(delta || event.key==='Home' || event.key==='End') {
      event.preventDefault();
      setAngle(event.key==='Home'?0:event.key==='End'?180:angle+delta);
    }
  });
  render();
  return {
    setAngle,
    setAvailable(value) { root.body.classList.toggle('is-page-active',value); },
    present(time) {
      const t=Math.max(0,Math.min(1,time/900));
      root.body.style.setProperty('--entrance',String(t*t*t*(10+t*(-15+6*t))));
    },
    pointAt:value=>clientPoint(tideStudy(value).moon),
    orbitPoint:value=>{
      const radians=value*Math.PI/180;
      return clientPoint([STUDY.x+(STUDY.orbit+31)*Math.cos(radians),STUDY.y-(STUDY.orbit+31)*Math.sin(radians)]);
    },
    tidePoint:()=>clientPoint(tideStudy(angle).near),
    get state() { return {angle,tide:tideStudy(angle).label,dragging:dragId!==null}; }
  };
}

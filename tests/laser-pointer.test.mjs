import test from 'node:test';
import assert from 'node:assert/strict';
import { mount, mountSetup } from '../assets/js/laser-pointer.js';
import { DEMO, settle, travel, sketch, cameraPose, cueAt, cueEnvelope, signatureEnvelope, enabledAt } from '../assets/js/lib/laser-demo-motion.mjs';
import { createReplayClock } from '../assets/js/lib/laser-demo-clock.mjs';
import { tideStudy, tideAngleAt, mountTideStudy, STUDY } from '../assets/js/lib/laser-demo-scene.mjs';

class Events {
  listeners = new Map();
  addEventListener(name, handler) { if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name).add(handler); }
  removeEventListener(name, handler) { this.listeners.get(name)?.delete(handler); }
  emit(name, event) { for (const handler of this.listeners.get(name) || []) handler(event); }
}
class Element extends Events {
  attributes = new Map(); dataset = {}; style = {setProperty(name,value){this[name]=value;}}; hidden = true; textContent = '';
  classes = new Set();
  classList = { toggle: (name, value) => value ? this.classes.add(name) : this.classes.delete(name) };
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  getAttribute(name) { return this.attributes.get(name); }
  focus() { this.focused = true; }
  getBoundingClientRect() { return {left:0,top:0,width:100,height:40}; }
  querySelector() { return new Element(); }
}

test('setup switches the whole guide and its shortcuts between desktop and iPad, then cleans up', () => {
  const browser = new Element(), desktop = new Element(), ipad = new Element();
  browser.value = 'safari-mac';
  const guides = ['safari-mac','safari-ipad','other'].flatMap(laserGuide => Array.from({length:3}, () => {
    const guide = new Element(); guide.dataset.laserGuide = laserGuide; return guide;
  }));
  const setup = {
    querySelector: selector => ({'[data-laser-browser]':browser,'[data-laser-desktop-shortcuts]':desktop,'[data-laser-ipad-shortcuts]':ipad})[selector],
    querySelectorAll: () => guides
  };
  const dispose = mountSetup({querySelector:() => setup});
  const visible = () => guides.filter(guide => !guide.hidden).map(guide => guide.dataset.laserGuide);
  assert.deepEqual(visible(),Array(3).fill('safari-mac'));
  assert.equal(desktop.hidden,false); assert.equal(ipad.hidden,true);
  browser.value = 'safari-ipad'; browser.emit('change');
  assert.deepEqual(visible(),Array(3).fill('safari-ipad'));
  assert.equal(desktop.hidden,true); assert.equal(ipad.hidden,false);
  browser.value = 'other'; browser.emit('change');
  assert.deepEqual(visible(),Array(3).fill('other'));
  assert.equal(desktop.hidden,false); assert.equal(ipad.hidden,true);
  dispose(); browser.value = 'safari-mac'; browser.emit('change');
  assert.deepEqual(visible(),Array(3).fill('other'));
});

function fixture(t, { reduced = false, width = 1000 } = {}) {
  const names = ['window','document','location','performance','requestAnimationFrame','cancelAnimationFrame','IntersectionObserver','ResizeObserver'];
  const saved = new Map(names.map(name => [name, globalThis[name]]));
  let dispose = () => {};
  t.after(() => { dispose(); for (const [name,value] of saved) { if (value === undefined) delete globalThis[name]; else globalThis[name] = value; } });
  const host = new Element(), iframe = new Element(), viewport = new Element(), toggle = new Element(), restart = new Element(), tryButton = new Element(), toolbar = new Element(), popup = new Element(), cursor = new Element();
  const controls = [new Element()];
  const navigation = new Element(), progress = new Element();
  const step = new Element(), stepTitle = new Element(), stepCount = new Element(), stepInstruction = new Element();
  const pauseIcon = new Element(), playIcon = new Element();
  const cue=new Element(), cueKey=new Element(), clickPulse=new Element(), signature=new Element();
  const titles = ['Enable & allow','Draw & customize','Space to interact','Space to resume','Click to turn off'];
  const chapters = [[0,2.4],[3.4,8.8],[12,17.7],[18.3,24.7],[26,28]].map(([start,preview],i) => {
    const element = new Element(); element.dataset = {start,preview,title:titles[i],instruction:`Instruction ${i+1}`}; return element;
  });
  const seeks = [], api = { ready:true, state:{enabled:false}, seek(time) { seeks.push(time); }, async toggle() { this.state.enabled = !this.state.enabled; }, async setEnabled(value) { this.state.enabled=value; } };
  iframe.contentWindow = {laserDemo:api}; iframe.dataset.source = '/laser-pointer/demo/';
  viewport.clientWidth = width; host.dataset.duration = String(DEMO.duration/1000);
  const elements = {frame:iframe,viewport,motion:toggle,restart,try:tryButton,toolbar,access:popup,cursor,cue,'cue-key':cueKey,'click-pulse':clickPulse,signature,navigation,progress,step,'step-title':stepTitle,'step-count':stepCount,'step-instruction':stepInstruction,'pause-icon':pauseIcon,'play-icon':playIcon};
  host.querySelector = selector => elements[selector.match(/data-laser-([^\]]+)/)?.[1]] || new Element();
  host.querySelectorAll = selector => selector === '[data-laser-chapter]' ? chapters : controls;
  const motion = new Events(); motion.matches = reduced;
  const win = new Events(), doc = new Events(); doc.hidden = false; win.matchMedia = () => motion;
  globalThis.window = win; globalThis.document = doc; globalThis.location = {origin:'https://example.test'};
  let now = 0; globalThis.performance = {now:() => now};
  const frames = new Map(); let frameId = 0, observer, resizeObserver;
  globalThis.requestAnimationFrame = callback => { frames.set(++frameId,callback); return frameId; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  globalThis.IntersectionObserver = class {
    constructor(callback) { observer = this; this.callback = callback; }
    observe() {} disconnect() { this.disconnected = true; }
    visible(isIntersecting) { this.callback([{isIntersecting}]); }
  };
  globalThis.ResizeObserver = class { constructor(callback) { resizeObserver=this; this.callback=callback; } observe() {} disconnect() { this.disconnected=true; } };
  dispose = mount({querySelector:selector => selector === '[data-laser-demo]' ? host : null});
  const advance = ms => { now += ms; const pending=[...frames.values()]; frames.clear(); pending.forEach(callback=>callback(now)); };
  const ready = (origin='https://example.test') => win.emit('message',{source:iframe.contentWindow,origin,data:{type:'laser-demo-ready'}});
  return {host,iframe,viewport,toggle,restart,tryButton,toolbar,popup,cursor,controls,chapters,motion,doc,win,seeks,api,frames,observer,resizeObserver,advance,ready,dispose,cue,cueKey,clickPulse,signature,navigation,progress,step,stepTitle,stepCount,stepInstruction,pauseIcon,playIcon};
}

test('the compact player follows autoplay, including the loop back to step one', t => {
  const f = fixture(t);
  assert.equal(f.stepTitle.textContent,'Enable & allow');
  assert.equal(f.stepCount.textContent,'Step 1 of 5');
  assert.equal(f.stepInstruction.hidden,true);
  assert.equal(f.step.getAttribute('aria-live'),'off');
  f.advance(13500);
  assert.equal(f.stepTitle.textContent,'Space to interact');
  assert.equal(f.stepInstruction.textContent,'Instruction 3');
  f.advance(13000);
  assert.equal(f.stepCount.textContent,'Step 5 of 5');
  f.advance(3500);
  assert.equal(f.stepCount.textContent,'Step 1 of 5');
});

test('chapter segments seek every stage and keep the playback choice; restart resets the same clock', t => {
  const f = fixture(t);
  f.chapters[1].emit('click'); assert.equal(f.seeks.at(-1),3400); assert.equal(f.frames.size,1);
  f.toggle.emit('click');
  assert.equal(f.toggle.getAttribute('aria-label'),'Resume demo');
  assert.equal(f.toggle.getAttribute('title'),'Resume demo');
  assert.equal(f.playIcon.hidden,false); assert.equal(f.pauseIcon.hidden,true);
  assert.equal(f.step.getAttribute('aria-live'),'polite');
  for (const [index,time] of [[2,17700],[3,24700],[4,28000]]) { f.chapters[index].emit('click'); assert.equal(f.seeks.at(-1),time); }
  f.chapters[3].emit('click'); assert.equal(f.seeks.at(-1),24700); assert.equal(f.frames.size,0);
  assert.equal(f.stepCount.textContent,'Step 4 of 5');
  f.restart.emit('click');
  assert.equal(f.seeks.at(-1),0);
  assert.equal(f.stepCount.textContent,'Step 1 of 5'); assert.equal(f.frames.size,0);
  f.toggle.emit('click');
  assert.equal(f.toggle.getAttribute('aria-label'),'Pause demo');
  assert.equal(f.playIcon.hidden,true); assert.equal(f.pauseIcon.hidden,false);
});

test('cached frames expose controls; playback, pause and seeking share one time', t => {
  const f = fixture(t);
  assert.ok(f.controls.every(control=>!control.hidden));
  f.advance(13500); assert.equal(f.seeks.at(-1),13500); assert.equal(f.chapters[2].getAttribute('aria-current'),'step');
  f.toggle.emit('click'); assert.equal(f.frames.size,0);
  f.chapters[1].emit('click'); assert.equal(f.seeks.at(-1),8800);
  f.toggle.emit('click'); f.advance(300); assert.equal(f.seeks.at(-1),9100);
  f.chapters[2].emit('click'); assert.equal(f.seeks.at(-1),12000);
  f.restart.emit('click'); assert.equal(f.seeks.at(-1),0);
});

test('reduced motion starts still and offscreen work preserves the playback choice', t => {
  const f=fixture(t,{reduced:true});
  assert.equal(f.seeks.at(-1),DEMO.preview.resume); assert.equal(f.frames.size,0);
  f.chapters[0].emit('click'); assert.equal(f.seeks.at(-1),2400); assert.equal(f.popup.hidden,false);
  f.toggle.emit('click'); assert.equal(f.frames.size,1);
  f.observer.visible(false); assert.equal(f.frames.size,0);
  f.observer.visible(true); assert.equal(f.frames.size,1);
  f.doc.hidden=true; f.doc.emit('visibilitychange'); assert.equal(f.frames.size,0);
  f.toggle.emit('click'); f.doc.hidden=false; f.doc.emit('visibilitychange'); assert.equal(f.frames.size,0);
});

test('paused chapter jumps remove the previous toolbar cursor after the iframe finishes seeking', async t => {
  const f=fixture(t,{reduced:true});
  let finish;
  f.api.state.cursor=[40,-20];
  f.api.seek=()=>new Promise(resolve=>{finish=resolve;});
  f.chapters[2].emit('click');
  assert.equal(f.cursor.hidden,false);
  f.api.state.cursor=[300,200];
  finish(); await Promise.resolve();
  assert.equal(f.cursor.hidden,true);
});

test('hands-on mode loads an isolated document and returns to the saved replay', async t => {
  const f=fixture(t,{reduced:true});
  f.tryButton.emit('click');
  assert.equal(f.iframe.src,'/laser-pointer/demo/?mode=try'); assert.equal(f.frames.size,0);
  assert.equal(f.toggle.hidden,true); assert.equal(f.popup.hidden,true);
  assert.equal(f.navigation.hidden,true); assert.equal(f.progress.hidden,true);
  assert.equal(f.stepTitle.textContent,'Your turn');
  assert.match(f.stepInstruction.textContent,/Space/); assert.equal(f.stepInstruction.hidden,false);
  assert.ok(f.chapters.every(chapter=>!chapter.getAttribute('aria-current')));
  const count = f.seeks.length;
  f.chapters[0].emit('click');
  assert.equal(f.seeks.length,count);
  f.ready('https://unrelated.test'); assert.equal(f.iframe.focused,undefined);
  f.ready(); assert.equal(f.iframe.focused,true);
  f.toolbar.emit('click'); await Promise.resolve();
  assert.equal(f.api.state.enabled,true); assert.equal(f.toolbar.classes.has('is-on'),true);
  f.tryButton.emit('click'); f.ready();
  assert.equal(f.iframe.src,'/laser-pointer/demo/?mode=replay'); assert.equal(f.seeks.at(-1),DEMO.preview.resume);
  assert.equal(f.navigation.hidden,false); assert.equal(f.progress.hidden,false);
  assert.equal(f.stepCount.textContent,'Step 4 of 5');
});

test('phone framing enlarges the real controls and restores the full page on resize', t => {
  const f=fixture(t,{reduced:true,width:350});
  f.chapters[1].emit('click'); assert.match(f.iframe.style.transform,/translate\(-635px,0px\)/);
  assert.equal(f.viewport.style.height,'340px');
  f.chapters[2].emit('click'); assert.match(f.iframe.style.transform,/translate\(-285px,-125px\)/);
  assert.equal(f.viewport.style.height,'320px');
  f.viewport.clientWidth=1100; f.resizeObserver.callback();
  assert.equal(f.iframe.style.transform,'scale(1.1) translate(0px,0px)');
});

test('leaving the page unloads the engine and removes every player callback', t => {
  const f=fixture(t); f.dispose();
  assert.equal(f.iframe.src,'about:blank'); assert.equal(f.frames.size,0);
  assert.ok(f.observer.disconnected && f.resizeObserver.disconnected);
  const count=f.seeks.length; f.toggle.emit('click'); f.chapters[4].emit('click'); f.ready();
  assert.equal(f.seeks.length,count); assert.equal(f.frames.size,0);
});

test('ink timers and paints advance only with the replay clock', () => {
  const clock=createReplayClock(), events=[];
  clock.setTimer(()=>events.push('fade'),2000);
  clock.requestFrame(time=>{ events.push(time); clock.requestFrame(next=>events.push(next)); });
  clock.step(1500); assert.deepEqual(events,[1500]);
  assert.equal(clock.now,1500); assert.deepEqual(clock.pending,{frames:1,timers:1});
  clock.step(2100); assert.deepEqual(events,[1500,'fade',2100]);
  assert.throws(()=>clock.step(0),/Reset/);
});

test('restart discards old paint and timer callbacks before seeking backwards', () => {
  const clock=createReplayClock(); let called=false;
  const id=clock.setTimer(()=>{called=true;},10); clock.clearTimer(id);
  clock.requestFrame(()=>{called=true;}); clock.step(0); called=false;
  clock.setTimer(()=>{called=true;},10); clock.requestFrame(()=>{called=true;});
  clock.reset(); clock.step(100);
  assert.equal(called,false); assert.deepEqual(clock.pending,{frames:0,timers:0});
});


test('cursor travel accelerates and settles continuously at each target', () => {
  const a=[20,40], b=[420,170];
  assert.deepEqual(travel(a,b,0),a); assert.deepEqual(travel(a,b,1),b);
  assert.deepEqual(travel(a,b,-1),a); assert.deepEqual(travel(a,b,2),b);
  const start=travel(a,b,.01), middle=travel(a,b,.5), before=travel(a,b,.49);
  assert.ok(Math.hypot(start[0]-a[0],start[1]-a[1])<.05);
  assert.ok(Math.hypot(middle[0]-before[0],middle[1]-before[1])>5);
  assert.equal(settle(.5),.5);
});

test('hand-placed sketch anchors keep their endpoints without speed jumps at sparse sections', () => {
  const anchors=[[0,0],[10,3],[140,-4],[270,1]], points=sketch(anchors,100);
  assert.deepEqual(points[0],anchors[0]); assert.deepEqual(points.at(-1),anchors.at(-1));
  const steps=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
  assert.ok(Math.max(...steps)/Math.min(...steps)<1.1);
});

test('phone camera glides between scenes instead of cutting when settings open', () => {
  let previous=cameraPose(0,350);
  for(let time=16;time<=DEMO.duration;time+=16) {
    const next=cameraPose(time,350);
    assert.ok(Math.abs(next.x-previous.x)<24);
    assert.ok(Math.abs(next.y-previous.y)<24);
    assert.ok(Math.abs(next.scale-previous.scale)<.03);
    assert.ok(Math.abs(next.height-previous.height)<3);
    previous=next;
  }
  const midway=cameraPose(9450,350);
  assert.ok(midway.x>0 && midway.x<635);
});


test('both Space presses have a readable hold; only the final toolbar click turns the laser off', t => {
  const f=fixture(t);
  f.advance(14050);
  assert.equal(f.cueKey.textContent,'Space'); assert.equal(f.cue.classes.has('is-pressed'),true);
  assert.equal(f.host.dataset.laserState,'paused');
  f.advance(5900);
  assert.equal(f.cueKey.textContent,'Space'); assert.equal(f.cue.classes.has('is-pressed'),true);
  assert.equal(f.host.dataset.laserState,'on');
  f.advance(6100);
  assert.equal(f.cue.hidden,true); assert.equal(f.toolbar.classes.has('is-on'),true);
  f.advance(1000);
  assert.equal(f.host.dataset.laserState,'off');
  assert.equal(f.toolbar.classes.has('is-on'),false);
  assert.equal(f.toolbar.classes.has('is-clicked'),true);
  for(const at of DEMO.space) {
    assert.equal(cueAt(at+1050).pressed,true);
    assert.equal(cueAt(at+1150).pressed,false);
  }
  for(let time=0;time<DEMO.duration;time+=50) assert.ok(!cueAt(time).key || cueAt(time).key==='Space');
  assert.equal(enabledAt(26999),true); assert.equal(enabledAt(27000),false);
});

test('the Space hint stays steady across both presses and its fade freezes with playback', t => {
  const f=fixture(t);
  f.advance(12080);
  assert.equal(f.cue.hidden,false);
  assert.ok(Number(f.cue.style.opacity)>0 && Number(f.cue.style.opacity)<.2);
  f.toggle.emit('click'); const opacity=f.cue.style.opacity;
  f.advance(800); assert.equal(f.cue.style.opacity,opacity);
  f.chapters[1].emit('click'); assert.equal(f.cue.hidden,true);
  for(const time of [12500,13900,15150,18000,19800,21050,23400]) assert.equal(cueEnvelope(time).opacity,1);
  assert.equal(cueEnvelope(23900).visible,false);
});

test('toolbar clicks have a visible pulse that freezes with playback', t => {
  const f=fixture(t);
  f.advance(850);
  assert.ok(Number(f.clickPulse.style.opacity)>.8);
  assert.equal(f.toolbar.classes.has('is-clicked'),true);
  f.toggle.emit('click'); const opacity=f.clickPulse.style.opacity;
  f.advance(1000); assert.equal(f.clickPulse.style.opacity,opacity);
  f.toggle.emit('click'); f.advance(1000);
  assert.equal(f.clickPulse.style.opacity,'0');
});

test('opposite tidal bulges follow the Moon while a fixed coast changes from high to low', () => {
  assert.equal(tideStudy(STUDY.start).label,'High tide');
  assert.equal(tideStudy(STUDY.end).label,'Low tide');
  assert.equal(tideStudy(45).label,'Mid tide');
  assert.equal(tideStudy(0).level,1);
  assert.equal(tideStudy(90).level,-1);
  assert.equal(tideStudy(180).level,1);
  for(const angle of [0,25,45,90,115,180]) {
    const study=tideStudy(angle);
    const moon=[study.moon[0]-STUDY.x,study.moon[1]-STUDY.y];
    const near=[study.near[0]-STUDY.x,study.near[1]-STUDY.y];
    assert.ok(Math.abs(moon[0]*near[1]-moon[1]*near[0])<1e-9);
    assert.ok(Math.abs(study.near[0]+study.far[0]-2*STUDY.x)<1e-10);
    assert.ok(Math.abs(study.near[1]+study.far[1]-2*STUDY.y)<1e-10);
    assert.ok(Math.abs(Math.hypot(...near)-STUDY.high)<1e-10);
    assert.ok(Math.abs(tideAngleAt(study.moon)-angle)<1e-10);
  }
  assert.equal(tideStudy(-10).angle,0);
  assert.equal(tideStudy(200).angle,180);
  assert.equal(tideStudy(NaN).angle,STUDY.start);
  assert.equal(tideAngleAt([STUDY.x-100,STUDY.y+100]),180);
  assert.equal(tideAngleAt([STUDY.x+100,STUDY.y+100]),0);
});

function studyFixture() {
  const nodes=new Map(), body=new Element();
  const get=selector=>{
    if(!nodes.has(selector)) nodes.set(selector,new Element());
    return nodes.get(selector);
  };
  const diagram=get('[data-study-diagram]'), handle=get('[data-study-moon]');
  diagram.getScreenCTM=()=>({a:2,b:0,c:0,d:2,e:20,f:30,inverse:()=>({a:.5,b:0,c:0,d:.5,e:-10,f:-15})});
  const captures=new Set();
  handle.setPointerCapture=id=>captures.add(id);
  handle.hasPointerCapture=id=>captures.has(id);
  handle.releasePointerCapture=id=>captures.delete(id);
  const scene=mountTideStudy({querySelector:get,body});
  const event=(angle,pointerId=7)=>{
    const [clientX,clientY]=scene.pointAt(angle);
    return {clientX,clientY,pointerId,button:0,preventDefault(){}};
  };
  return {get,body,handle,captures,scene,event};
}

test('direct dragging uses page coordinates and ignores other pointers and released moves', () => {
  const f=studyFixture();
  f.handle.emit('pointerdown',f.event(25));
  assert.equal(f.scene.state.dragging,true); assert.ok(f.captures.has(7));
  f.handle.emit('pointermove',f.event(STUDY.end,99));
  assert.ok(Math.abs(f.scene.state.angle-25)<1e-10);
  f.handle.emit('pointermove',f.event(STUDY.end));
  assert.ok(Math.abs(f.scene.state.angle-STUDY.end)<1e-10);
  assert.equal(f.get('[data-study-reading]').textContent,'Low tide');
  f.handle.emit('pointercancel',f.event(STUDY.end));
  f.handle.emit('pointermove',f.event(20));
  assert.equal(f.scene.state.dragging,false); assert.equal(f.captures.size,0);
  assert.ok(Math.abs(f.scene.state.angle-STUDY.end)<1e-10);
});

test('the Moon supports keyboard controls and repeatable backward seeks without theme changes', () => {
  const f=studyFixture();
  f.handle.emit('keydown',{key:'End',preventDefault(){}});
  assert.equal(f.scene.state.angle,180);
  f.handle.emit('keydown',{key:'Home',preventDefault(){}});
  assert.equal(f.scene.state.angle,0);
  f.scene.setAngle(87);
  f.handle.emit('keydown',{key:'ArrowRight',preventDefault(){}});
  assert.equal(f.scene.state.angle,90);
  assert.match(f.handle.getAttribute('aria-valuetext'),/low tide/);
  f.scene.setAngle(STUDY.start);
  assert.equal(f.scene.state.tide,'High tide');
  assert.equal(f.get('[data-study-bulges]').getAttribute('transform'),'rotate(-25 350 105)');
  f.scene.setAvailable(true);
  assert.equal(f.body.classes.has('is-page-active'),true);
  f.scene.setAvailable(false);
  assert.equal(f.body.classes.has('is-page-active'),false);
});

test('the thirty-second loop joins matching brand frames and pauses the closing dissolve', t => {
  assert.equal(DEMO.duration,30000);
  assert.deepEqual(signatureEnvelope(0),signatureEnvelope(29999));
  assert.equal(signatureEnvelope(650).visible,false);
  const f=fixture(t);
  f.advance(28800);
  assert.equal(f.host.dataset.laserState,'off');
  assert.equal(f.signature.hidden,false);
  assert.ok(Number(f.signature.style.opacity)>.4 && Number(f.signature.style.opacity)<.6);
  f.toggle.emit('click'); const opacity=f.signature.style.opacity;
  f.advance(600); assert.equal(f.signature.style.opacity,opacity);
  f.chapters[2].emit('click'); assert.equal(f.signature.hidden,true);
  f.tryButton.emit('click'); assert.equal(f.signature.hidden,true);
});

test('clicking the toolbar during an active replay enters hands-on mode with the laser off', async t => {
  const f=fixture(t,{reduced:true});
  f.toolbar.emit('click'); f.ready(); await Promise.resolve();
  assert.equal(f.iframe.src,'/laser-pointer/demo/?mode=try');
  assert.equal(f.api.state.enabled,false);
  f.toolbar.emit('click'); await Promise.resolve();
  assert.equal(f.api.state.enabled,true);
});

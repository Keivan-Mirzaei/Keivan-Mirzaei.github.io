import { createReplayClock } from './lib/laser-demo-clock.mjs';
import { DEMO, settle, mix, travel, sketch, along } from './lib/laser-demo-motion.mjs';
import { STUDY } from './lib/laser-demo-scene.mjs';

// This bridge exists only inside the isolated demonstration document. Storage
// stays in memory; it never touches an installed extension or user preferences.
const mode = new URLSearchParams(location.search).get('mode');
export function mountLaserDemo(scene) {
  if (mode === 'replay' || mode === 'try') return initialize(scene);
}

async function initialize(scene) {
  const replay = mode === 'replay';
  const clock = replay ? createReplayClock() : null;
  const messageHandlers = [], storageHandlers = [], roots = [];
  const initial = { colour: '#ff304b', thickness: 4, smoothing: 35, hold: 2 };
  let settings = { ...initial }, enabled = false, paused = false;
  // Keep the product's closed roots closed. The replay retains private references
  // solely to operate its existing controls, without recreating their UI.
  const attachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function(options) {
    // Match the fixed dark demonstration page using the product's dark palette.
    this.style.setProperty('color-scheme','dark','important');
    const root = attachShadow.call(this, options); roots.push(root); return root;
  };
  const capture = HTMLCanvasElement.prototype.setPointerCapture;
  HTMLCanvasElement.prototype.setPointerCapture = function(id) {
    try { return capture.call(this, id); } catch (error) { if (error.name !== 'NotFoundError') throw error; }
  };
  window.browser = {
    storage: {
      local: {
        get: async () => ({ laserSettings: { ...settings } }),
        set: async values => {
          if (values.laserSettings) {
            settings = { ...values.laserSettings };
            storageHandlers.forEach(handler => handler({ laserSettings: { newValue: { ...settings } } }, 'local'));
          }
        }
      },
      onChanged: { addListener: handler => storageHandlers.push(handler) }
    },
    runtime: {
      onMessage: { addListener: handler => messageHandlers.push(handler) },
      sendMessage: async message => {
        if (message.type === 'laser:state') { enabled = message.enabled; paused = message.paused; parent.postMessage({type:'laser-demo-state'},location.origin); }
        if (message.type === 'laser:state') scene.setAvailable(replay ? enabled && paused : !enabled || paused);
        return message.type === 'laser:ready' ? { enabled: false } : {};
      }
    }
  };
  const runtimeURL = new URL('./laser-runtime.js', import.meta.url);
  const response = await fetch(runtimeURL);
  if (!response.ok) throw new Error('The drawing engine could not load.');
  const source = await response.text();
  // Scope virtual time to the product engine. The page, browser, and accessibility
  // tools retain their normal clocks, including when this replay is paused.
  const run = new Function('performance', 'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout', source);
  run(clock ? { now: () => clock.now } : performance,
      clock ? callback => clock.requestFrame(callback) : requestAnimationFrame.bind(window),
      clock ? id => clock.cancelFrame(id) : cancelAnimationFrame.bind(window),
      clock ? (callback,delay,...args) => clock.setTimer(callback,delay,...args) : setTimeout.bind(window),
      clock ? id => clock.clearTimer(id) : clearTimeout.bind(window));
  const liveRoots = () => roots.filter(root=>root.host.isConnected);
  const control = selector => liveRoots().map(root=>root.querySelector(selector)).find(Boolean);
  const command = async message => {
    const result = await messageHandlers[0](message);
    enabled = result.enabled; paused = result.paused;
    scene.setAvailable(replay ? enabled && paused : !enabled || paused);
    // The replay's external keyboard cue replaces the duplicate native pause badge.
    // Hands-on mode keeps the product's own badge and all real controls.
    if(replay && control('.status')) control('.status').style.display='none';
    return result;
  };
  function pointer(type, x, y, buttons = 0) {
    const event = new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', buttons, button: 0, bubbles: true, composed: true, cancelable: true });
    if (clock) Object.defineProperty(event, 'timeStamp', { value: clock.now });
    (control('canvas') || document.body).dispatchEvent(event);
  }
  function keySpace() {
    for (const type of ['keydown', 'keyup']) window.dispatchEvent(new KeyboardEvent(type, { key: ' ', code: 'Space', bubbles: true, cancelable: true }));
  }
  function pagePointer(type,x,y,buttons=0) {
    document.querySelector('[data-study-moon]').dispatchEvent(new PointerEvent(type,{
      clientX:x,clientY:y,pointerId:7,pointerType:'mouse',button:0,buttons,
      bubbles:true,composed:true,cancelable:true
    }));
  }
  function inputValue(input,value,commit=true) {
    if(input.value!==String(value)) {
      input.value=String(value);
      input.dispatchEvent(new Event('input',{bubbles:true}));
    }
    if(commit) input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  const point = (selector, fx = .5, fy = .5) => {
    const box = (control(selector) || document.querySelector(selector)).getBoundingClientRect();
    return [box.left + box.width * fx, box.top + box.height * fy];
  };
  function clickControl(selector) {
    const target = control(selector), box = target.getBoundingClientRect();
    target.dispatchEvent(new MouseEvent('click', { bubbles:true, composed:true, cancelable:true,
      clientX:box.left+box.width/2, clientY:box.top+box.height/2, button:0 }));
  }
  const gestures = [];
  const gesture = (start,end,points) => { gestures.push({start,end,points}); return gestures.length-1; };
  const underline = selector => {
    const element=document.querySelector(selector), box=element.getBoundingClientRect();
    const range=document.createRange(); range.selectNodeContents(element);
    const width=Math.min(range.getBoundingClientRect().width+7,280);
    return sketch([[box.left-2,box.bottom+4],[box.left+width*.18,box.bottom+5.1],
      [box.left+width*.48,box.bottom+4.3],[box.left+width*.79,box.bottom+2.8],
      [box.left+width+2,box.bottom+3.6]]);
  };
  gesture(4400,5200,()=>underline('.idea'));
  gesture(11050,11750,()=>underline('[data-study-reading]'));
  gesture(21400,22300,()=>{
    const [x,y]=scene.tidePoint();
    return sketch([[x-111,y+48],[x-90,y+25],[x-63,y+10],[x-33,y+4],[x-8,y+5]]);
  });
  gesture(22380,22700,()=>{
    const [x,y]=scene.tidePoint();
    return sketch([[x-24,y-3],[x-8,y+5],[x-24,y+17]],45);
  });
  // Trace the Moon's upcoming drag outside its orbit, clear of the handle.
  const moonArc=gesture(9650,10350,()=>sketch([25,41,59,77,96,115].map(scene.orbitPoint)));
  const moonArrow=gesture(10400,10600,()=>{
    const [x,y]=scene.orbitPoint(STUDY.end);
    return sketch([[x+13,y-12],[x,y],[x+18,y+2]],45);
  });
  const inkPoints=new Map();
  const inkPoint=(index,end=false)=>()=>{
    if(!inkPoints.has(index)) inkPoints.set(index,gestures[index].points());
    return end ? inkPoints.get(index).at(-1) : inkPoints.get(index)[0];
  };
  const at=(selector,fx=.5,fy=.5)=>()=>point(selector,fx,fy);
  const toolbarPoint=()=>{
    if(!frameElement) return [88,-22];
    const frame=frameElement.getBoundingClientRect();
    const ring=frameElement.closest('.laser-live-browser').querySelector('[data-laser-toolbar]').getBoundingClientRect();
    const scale=frame.width/innerWidth;
    return [(ring.left+ring.width/2-frame.left)/scale,(ring.top+ring.height/2-frame.top)/scale];
  };
  const entryPoint=()=>frameElement?.dataset.entryPoint?.split(',').map(Number) || [820,160];
  const besideMoon=()=>{ const [x,y]=scene.pointAt(STUDY.end); return [x-42,y+12]; };
  const rangePoint=(selector,value)=>()=>{
    const input=control(selector)||document.querySelector(selector), box=input.getBoundingClientRect();
    return [box.left+14+(box.width-28)*(value-input.min)/(input.max-input.min),box.top+box.height/2];
  };
  const drags=[{start:7050,end:7650,selector:'[name=hold]',from:2,to:12}];
  const actions = [
    [3400,()=>command({type:'laser:set',enabled:true})],
    [6550,()=>clickControl('.settings-toggle')],
    [7650,()=>inputValue(control('[name=hold]'),12)],
    [8400,()=>clickControl('[aria-label=Blue]')],
    [DEMO.space[0],keySpace],
    [DEMO.drag[0],()=>pagePointer('pointerdown',...scene.pointAt(STUDY.start),1)],
    [DEMO.drag[1],()=>{
      pagePointer('pointermove',...scene.pointAt(STUDY.end),1);
      pagePointer('pointerup',...scene.pointAt(STUDY.end));
    }],
    [DEMO.space[1],keySpace],
    [DEMO.enabled[0][1],()=>command({type:'laser:toggle'})]
  ];
  // The short story gives every keypress a visible lead-in, then shows its result.
  const route=[
    [3400,entryPoint],[4200,inkPoint(0),-.10],[4400,inkPoint(0)],
    [5200,inkPoint(0,true)],[5550,inkPoint(0,true)],
    [6350,at('.settings-toggle'),-.10],[6650,at('.settings-toggle')],
    [6900,rangePoint('[name=hold]',2),.08],[7050,rangePoint('[name=hold]',2)],
    [7650,rangePoint('[name=hold]',12)],[7900,rangePoint('[name=hold]',12)],
    [8150,at('[aria-label=Blue]'),.12],[8950,at('[aria-label=Blue]')],
    [9450,inkPoint(moonArc),-.12],[9650,inkPoint(moonArc)],
    [10350,inkPoint(moonArc,true)],[10390,inkPoint(moonArrow)],[10600,inkPoint(moonArrow,true)],
    [10950,inkPoint(1),-.08],[11050,inkPoint(1)],
    [11750,inkPoint(1,true)],[DEMO.space[0],inkPoint(1,true)],
    [15450,()=>scene.pointAt(STUDY.start),.10],[DEMO.drag[0],()=>scene.pointAt(STUDY.start)],
    [DEMO.drag[1],()=>scene.pointAt(STUDY.end)],[DEMO.space[1],()=>scene.pointAt(STUDY.end)],
    [20750,inkPoint(2),.08],[21400,inkPoint(2)],[22300,inkPoint(2,true)],
    [22370,inkPoint(3)],[22700,inkPoint(3,true)],
    [24600,besideMoon,-.06],[25750,besideMoon],
    [26600,toolbarPoint,-.10],[30000,toolbarPoint]
  ];
  let actionIndex=0, activeGesture=null, gesturePoints=[], lastTime=0, lastCursor=[230,150];
  const cursor=document.createElement('div');
  cursor.className='demo-cursor'; cursor.setAttribute('aria-hidden','true');
  cursor.style.cssText='position:fixed;top:0;left:0;z-index:2147483647;pointer-events:none;';
  cursor.innerHTML='<svg width="19" height="24" viewBox="0 0 19 24" style="overflow:visible"><circle data-replay-press cx="3" cy="4" r="12" fill="#abc38e50" stroke="#65825080" style="opacity:0"/><path d="M2 1v19l4.5-4 3 7 3-1.3-3-6.7h7z" fill="#202324" stroke="white" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  document.body.append(cursor);
  function showCursor(x,y,visible=true) {
    const root=control('canvas')?.getRootNode() || document.body;
    if(cursor.parentNode!==root) root.append(cursor);
    lastCursor=[x,y];
    const outsideCursor=clock && y<4;
    cursor.style.transform=`translate(${x}px,${y}px)`; cursor.hidden=!visible || outsideCursor;
    document.body.dataset.replayCursor=`${x.toFixed(2)},${y.toFixed(2)}`;
  }
  function positionPointer(time) {
    const drawing=gestures.find(item=>time>=item.start && time<=item.end);
    if(drawing!==activeGesture) {
      if(activeGesture) {
        pointer('pointermove',...gesturePoints.at(-1),1);
        pointer('pointerup',...gesturePoints.at(-1),0);
      }
      activeGesture=drawing||null;
      if(drawing) {
        const index=gestures.indexOf(drawing);
        inkPoint(index)(); gesturePoints=inkPoints.get(index);
        pointer('pointerdown',...gesturePoints[0],1);
      }
    }
    if(drawing) {
      const [x,y]=along(gesturePoints,settle((time-drawing.start)/(drawing.end-drawing.start)));
      pointer('pointermove',x,y,1); showCursor(x,y,false);
      return;
    }
    const next=route.findIndex(stop=>stop[0]>time);
    const before=route[next<0 ? route.length-1 : Math.max(0,next-1)], after=next<0 ? before : route[next];
    let [x,y]=travel(before[1](),after[1](),(time-before[0])/(after[0]-before[0] || 1),after[2]);
    const drag=drags.find(item=>time>=item.start && time<=item.end);
    if(drag) {
      const value=mix(drag.from,drag.to,settle((time-drag.start)/(drag.end-drag.start)));
      inputValue(control(drag.selector)||document.querySelector(drag.selector),drag.step ? Math.round(value/drag.step)*drag.step : value,false);
      [x,y]=rangePoint(drag.selector,value)();
    }
    const moonDragging=time>=DEMO.drag[0] && time<DEMO.drag[1];
    if(moonDragging) {
      [x,y]=scene.pointAt(mix(STUDY.start,STUDY.end,settle((time-DEMO.drag[0])/(DEMO.drag[1]-DEMO.drag[0]))));
      pagePointer('pointermove',x,y,1);
    }
    cursor.querySelector('[data-replay-press]').style.opacity=moonDragging?'1':'0';
    const overControl=['.settings-toggle','.panel'].some(selector=>{
      const element=control(selector); if(!element || element.hidden) return false;
      const box=element.getBoundingClientRect();
      return x>=box.left && x<=box.right && y>=box.top && y<=box.bottom;
    });
    pointer('pointermove',x,y,0);
    showCursor(x,y,!enabled||paused||overControl);
  }
  async function reset() {
    await command({ type:'laser:set', enabled:false });
    roots.length = 0; inkPoints.clear();
    settings = { ...initial }; actionIndex = 0; activeGesture = null; lastTime = 0;
    clock.reset();
    if(scene.state.dragging) pagePointer('pointercancel',...scene.pointAt(scene.state.angle));
    scene.setAngle(STUDY.start);
    scene.present(0);
    lastCursor=[230,150]; cursor.hidden=true;
    document.body.append(cursor);
    storageHandlers.forEach(handler => handler({laserSettings:{newValue:{...initial}}},'local'));
  }
  async function advanceTo(target) {
    if (target < lastTime) await reset();
    while (lastTime < target) {
      const next = Math.min(target, lastTime+1000/60);
      // Event timestamps and paint timestamps use the same replay clock.
      clock.step(next);
      scene.present(next);
      while (actionIndex < actions.length && actions[actionIndex][0] <= next) await actions[actionIndex++][1]();
      if(next>=DEMO.enabled[0][0]) positionPointer(next);
      clock.step(next);
      lastTime = next;
      document.body.dataset.replayTime = String(Math.round(lastTime));
      document.body.dataset.replayPaths = String(liveRoots().reduce((n,root)=>n+root.querySelectorAll('svg > g > path[d]').length,0));
      document.body.dataset.replayEnabled=String(enabled);
      document.body.dataset.replayPaused=String(paused);
    }
  }
  let busy = false, wanted = 0;
  async function seek(time) {
    wanted = time;
    if (busy) return;
    busy = true;
    try { do { const target = wanted; await advanceTo(target); } while (wanted !== lastTime); }
    catch (error) { document.body.dataset.replayError = error.message; console.error('Laser replay:', error.stack); throw error; }
    finally { busy = false; }
  }
  window.laserDemo = {
    ready:true, mode,
    seek: replay ? seek : async () => {},
    async toggle() { return command({type:'laser:toggle'}); },
    async setEnabled(value) { return command({type:'laser:set',enabled:value}); },
    get state() { return { enabled, paused, settings:{...settings}, time:lastTime, cursor:[...lastCursor], paths:liveRoots().flatMap(root=>[...root.querySelectorAll('svg > g > path[d]')]).length }; }
  };
  if (!replay) { cursor.remove(); await command({type:'laser:set',enabled:true}); document.body.focus(); }
  else { clock.step(0); scene.present(0); }
  if (parent === window && replay) await seek(new URLSearchParams(location.search).get('scene') === 'settings' ? DEMO.preview.settings : DEMO.preview.resume);
  // Signal only this page's owning frame. No extension permissions are requested.
  parent.postMessage({type:'laser-demo-ready'},location.origin);
}

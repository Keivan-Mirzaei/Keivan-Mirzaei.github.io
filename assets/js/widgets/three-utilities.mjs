import { bindPanelHistory, trackControlEdits } from '../lib/panel-history.mjs';
import { NODES, nodeById, PLANE_EIGHT, distance, obstruction, curveRoute, smoothWaypoints, simplifyPath, updateConnection } from '../lib/three-utilities-math.mjs';
import { boardSVG, boardGeometry, drawTransformation } from '../lib/three-utilities-diagrams.mjs';
import { observeSize } from '../lib/interactive-view.mjs';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function preparePlane(widget) {
  const board=widget.querySelector('[data-tu-board]'),count=widget.querySelector('[data-tu-count]'),status=widget.querySelector('[data-tu-status]');
  const redo=widget.querySelector('[data-tu-redo]');
  const undo=widget.querySelector('[data-tu-undo]'),cancel=widget.querySelector('[data-tu-cancel]');
  let routes=[],history=[],future=[],selected=null,waypoints=[],drag=null,cursor=[.5,.5],showCursor=false;
  let bad=obstruction(routes);
  const instruction='Choose a house, place points for the path, then choose a utility. Choose the same endpoints again without path points to remove a pipe.';
  function render(focus=null) {
    if(!board.clientWidth)return;
    const draft=drag?.moved?simplifyPath(drag.points):selected?[nodeById(selected).point,...waypoints]:null;
    board.innerHTML=boardSVG(routes,{width:board.clientWidth,selected,interactive:true,hits:[...bad.intersections,...bad.throughNodes],draft,cursor:showCursor?cursor:null});
    const hits=bad.intersections.length+bad.throughNodes.length;
    count.textContent=`${routes.length} / 9 pipes${hits?` · ${hits} obstruction${hits===1?'':'s'}`:''}`;
    undo.disabled=!history.length&&!selected;redo.disabled=!future.length;cancel.disabled=!selected&&!drag;
    if(focus)board.querySelector(focus==='paper'?'[data-tu-paper]':`[data-node="${focus}"]`)?.focus();
  }
  function resetPath(){selected=null;waypoints=[];drag=null;showCursor=false;}
  function commit(a,b,points,customPath=false) {
    const first=nodeById(a),second=nodeById(b);
    if(first.kind===second.kind){status.textContent='Choose a house and a utility as the two endpoints.';render();return;}
    const house=first.kind==='house'?a:b,utility=first.kind==='utility'?a:b;
    const oriented=first.kind==='house'?points:[...points].reverse();
    const edge=curveRoute(house,utility,[smoothWaypoints(oriented)]);
    future=[];history.push(routes);if(history.length>60)history.shift();
    const change=updateConnection(routes,edge,customPath);routes=change.routes;
    resetPath();bad=obstruction(routes);
    const label=`${nodeById(house).label} → ${nodeById(utility).label}`;
    if(change.action==='removed')status.textContent=`${label} removed. Choose endpoints and path points to add it again.`;
    else if(bad.intersections.length||bad.throughNodes.length)status.textContent=`${label} ${change.action==='replaced'?'redrawn':'connected'}. Red marks show a crossing, overlap, or another endpoint in a pipe’s way. Choose a new path to redraw it.`;
    else status.textContent=`${label} ${change.action==='replaced'?'redrawn':'connected'} with a smooth curve. ${9-routes.length} pipes still to connect.`;
    if(routes.length===9)status.textContent='All nine are drawn. A crossing is unavoidable on the plane. Try changing a route, or continue below to see why.';
    render();
  }
  function choose(id,keyboard=false) {
    if(selected===id){resetPath();status.textContent='Path cancelled. Choose another endpoint.';render(keyboard?id:null);return;}
    if(selected){commit(selected,id,[nodeById(selected).point,...waypoints,nodeById(id).point],waypoints.length>0);render(keyboard?id:null);return;}
    future=[];selected=id;waypoints=[];showCursor=false;
    status.textContent=`${nodeById(id).label} selected. Click points for the path, then choose the other endpoint. To remove an existing pipe, choose its other endpoint without adding points.`;
    render(keyboard?id:null);
  }
  function place(point,keyboard=false) {
    if(!selected){status.textContent='Choose a house or utility first, then place points along the path.';return;}
    future=[];waypoints.push(point);
    status.textContent=`${waypoints.length} path point${waypoints.length===1?'':'s'} chosen. Add more points or choose the destination. An existing pipe for this pair will be replaced.`;
    render(keyboard?'paper':null);
  }
  const eventPoint=event=>{
    const rect=board.getBoundingClientRect(),g=boardGeometry(board.clientWidth),scale=g.width/rect.width;
    return [Math.max(.015,Math.min(.985,((event.clientX-rect.left)*scale-g.left)/g.size)),Math.max(.015,Math.min(.985,((event.clientY-rect.top)*scale-g.top)/g.size))];
  };
  board.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    const node=event.target.closest('[data-node]'),paper=event.target.closest('[data-tu-paper]');
    if(!node&&!paper)return;
    event.preventDefault();
    const point=eventPoint(event);
    drag={id:node?.dataset.node,start:point,points:node?[nodeById(node.dataset.node).point]:[],moved:false,pointer:event.pointerId};
    board.setPointerCapture(event.pointerId);
  });
  board.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.pointer||!drag.id)return;
    const p=eventPoint(event);
    if(distance(p,drag.start)>.018)drag.moved=true;
    if(drag.moved&&distance(p,drag.points.at(-1))>.008){drag.points.push(p);render();}
  });
  board.addEventListener('pointerup',event=>{
    if(!drag||event.pointerId!==drag.pointer)return;
    const current=drag;drag=null;
    if(board.hasPointerCapture(event.pointerId))board.releasePointerCapture(event.pointerId);
    if(!current.id){place(eventPoint(event));return;}
    if(!current.moved){choose(current.id);return;}
    const p=eventPoint(event),g=boardGeometry(board.clientWidth),threshold=25/(g.size*board.clientWidth/g.width);
    const target=NODES.find(node=>distance(node.point,p)<threshold);
    if(target&&target.id!==current.id){
      const points=[...current.points];
      while(points.length>1&&distance(points.at(-1),target.point)<.04)points.pop();
      points.push(target.point);commit(current.id,target.id,simplifyPath(points),true);
    }else{status.textContent='Finish the route on another endpoint. You can also choose a start, click path points, and choose a destination.';render();}
  });
  board.addEventListener('pointercancel',()=>{drag=null;render();});
  board.addEventListener('keydown',event=>{
    const node=event.target.closest('[data-node]'),paper=event.target.closest('[data-tu-paper]');
    if(node&&['Enter',' '].includes(event.key)){event.preventDefault();choose(node.dataset.node,true);}
    if(paper){
      const delta={ArrowLeft:[-.04,0],ArrowRight:[.04,0],ArrowUp:[0,-.04],ArrowDown:[0,.04]}[event.key];
      if(delta){event.preventDefault();showCursor=true;cursor=cursor.map((x,i)=>Math.max(.02,Math.min(.98,x+delta[i])));render('paper');}
      if(['Enter',' '].includes(event.key)){event.preventDefault();place([...cursor],true);}
    }
    if(event.key==='Escape'){resetPath();status.textContent=instruction;render(node?node.dataset.node:'paper');}
  });
  undo.addEventListener('click',()=>{
    if(waypoints.length){future.push({routes,selected,waypoints:[...waypoints],message:status.textContent});waypoints.pop();status.textContent='Last path point removed.';}
    else if(selected){future.push({routes,selected,waypoints:[...waypoints],message:status.textContent});resetPath();status.textContent='Path cancelled.';}
    else if(history.length){future.push({routes,selected:null,waypoints:[],message:status.textContent});routes=history.pop();bad=obstruction(routes);status.textContent='Last change undone, including any removed or redrawn pipe.';}
    render();
  });
  redo.addEventListener('click',()=>{if(!future.length)return;const state=future.pop();if(JSON.stringify(routes)!==JSON.stringify(state.routes))history.push(routes);resetPath();routes=state.routes;selected=state.selected;waypoints=state.waypoints;bad=obstruction(routes);status.textContent=state.message;render();});
  cancel.addEventListener('click',()=>{resetPath();status.textContent=instruction;render();});
  widget.querySelector('[data-tu-clear]').addEventListener('click',()=>{if(routes.length){future=[];history.push(routes);}routes=[];resetPath();bad=obstruction(routes);status.textContent=instruction;render();});
  widget.querySelector('[data-tu-eight]').addEventListener('click',()=>{
    future=[];history.push(routes);if(history.length>60)history.shift();routes=structuredClone(PLANE_EIGHT);resetPath();bad=obstruction(routes);
    status.textContent='Eight smooth pipes fit. Only House 3 → Gas is missing. Choose its endpoints and path points to try the last route.';render();
  });
  widget.querySelectorAll('button').forEach(button=>button.disabled=false);
  observeSize(board,()=>render());render();
}

const PHASES = [
  ['A mug', 'Drag to look into the bowl. Its bottom, inner wall, rim, outside and handle form one surface. The handle supplies the one through-hole.'],
  ['A donut', 'The mug’s surface is now a donut. The bowl has lifted and the handle has thickened; the same hole stays open. No cuts or joins so far.'],
  ['An open tube', 'Cut along the purple dashed loop and straighten the ring. The two purple ends will be joined again.'],
  ['A square', 'Slit the tube along the green dashed loop and flatten it. Matching dashed sides belong together: green top and bottom, purple left and right.'],
];

function prepareSurface(widget) {
  const canvas=widget.querySelector('canvas'), slider=widget.querySelector('[data-tu-phase]'), title=widget.querySelector('[data-tu-stage]');
  const caption=widget.querySelector('[data-tu-caption]'), play=widget.querySelector('[data-tu-play]');
  const grid=widget.querySelector('[data-tu-grid]');
  widget.querySelector('[data-tu-surface-preview]').hidden=true;canvas.hidden=false;
  widget.querySelector('[data-tu-grid-note]').hidden=false;
  let phase=0, frame=null, orbit=null, showGrid=false;
  const rotation={yaw:0,pitch:0};
  function render() {
    const index = Math.min(3, Math.floor(phase+.001));
    const inTransition=Math.abs(phase-Math.round(phase))>.02;
    const stage=inTransition?(phase<.36?'Lifting the bowl':['Mug → donut','Cut → tube','Slit → square'][index]):PHASES[Math.round(phase)][0];
    const explanation=inTransition&&phase<1
      ?(phase<.36?'Lift the bowl’s bottom and ease its inner wall outward. The same surface points move, and the handle hole stays open.'
        :'Round the body and thicken the handle into a ring. The same hole stays open; nothing is cut or joined.')
      :inTransition?PHASES[index+1][1]:PHASES[Math.round(phase)][1];
    if(title.textContent!==stage)title.textContent=stage;
    if(caption.textContent!==explanation)caption.textContent=explanation;
    slider.value=phase;
    widget.querySelectorAll('[data-tu-jump]').forEach(button=>button.setAttribute('aria-pressed',Math.abs(Number(button.dataset.tuJump)-phase)<.02));
    drawTransformation(canvas,phase,rotation,showGrid);
    const description=`${stage}. ${explanation} Drag to rotate, or use arrow keys. Home resets to the mug.`;
    if(canvas.getAttribute('aria-label')!==description)canvas.setAttribute('aria-label',description);
  }
  function stop() {cancelAnimationFrame(frame);frame=null;play.textContent='Play from mug';}
  function animate(target,hold=0) {
    stop();
    if (reducedMotion.matches) {phase=target;render();return;}
    const start=phase, begin=performance.now()+hold;
    const direction=Math.sign(target-start),stages=[start];
    if(direction)for(let boundary=direction>0?Math.floor(start)+1:Math.ceil(start)-1;direction>0?boundary<target:boundary>target;boundary+=direction)stages.push(boundary);
    stages.push(target);
    const segments=stages.slice(1).map((end,i)=>({start:stages[i],end,
      duration:Math.abs(end-stages[i])*(Math.min(end,stages[i])<1?6200:3600),
      hold:i<stages.length-2?850:0}));
    const duration=segments.reduce((total,segment)=>total+segment.duration+segment.hold,0);
    play.textContent='Pause';
    const tick=now=>{
      let elapsed=Math.max(0,now-begin);
      for(const segment of segments){
        if(elapsed<=segment.duration+segment.hold){
          const progress=segment.duration?Math.min(1,elapsed/segment.duration):1;
          phase=segment.start+(segment.end-segment.start)*progress*progress*(3-2*progress);break;
        }
        elapsed-=segment.duration+segment.hold;phase=segment.end;
      }
      render();
      if (now-begin<duration) frame=requestAnimationFrame(tick); else stop();
    };
    frame=requestAnimationFrame(tick);
  }
  slider.addEventListener('input',()=>{stop();phase=Number(slider.value);render();});
  widget.querySelectorAll('[data-tu-jump]').forEach(button=>button.addEventListener('click',()=>{const target=Number(button.dataset.tuJump);if(target===0)resetMug();else animate(target);}));
  play.addEventListener('click',()=>{if(frame)stop();else {resetMug();animate(3,700);}});
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;stop();orbit={x:event.clientX,y:event.clientY,pointer:event.pointerId};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{
    if(!orbit||event.pointerId!==orbit.pointer)return;
    rotation.yaw+=(event.clientX-orbit.x)*.008;rotation.pitch=Math.max(-1.3,Math.min(1.3,rotation.pitch+(event.clientY-orbit.y)*.008));
    orbit.x=event.clientX;orbit.y=event.clientY;render();
  });
  canvas.addEventListener('pointerup',event=>{orbit=null;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);});
  canvas.addEventListener('pointercancel',()=>{orbit=null;});
  function resetMug(){stop();phase=0;rotation.yaw=rotation.pitch=0;render();}

  canvas.addEventListener('keydown',event=>{
    const directions={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]};
    const delta=directions[event.key];
    if(delta){event.preventDefault();stop();rotation.yaw+=delta[0];rotation.pitch=Math.max(-1.3,Math.min(1.3,rotation.pitch+delta[1]));render();}
    if(event.key==='Home'){event.preventDefault();resetMug();}
  });
  const panelHistory = bindPanelHistory(widget, {
    read: () => ({ phase, rotation, showGrid }),
    restore: state => { stop(); phase = state.phase; Object.assign(rotation, state.rotation); showGrid=grid.checked=state.showGrid??false; render(); },
    reset: resetMug
  });
  trackControlEdits([slider, canvas], panelHistory);
  grid.addEventListener('change',()=>panelHistory.change(()=>{showGrid=grid.checked;render();}));
  widget.querySelectorAll('[data-tu-jump], [data-tu-play], [data-tu-reset-view]').forEach(button => button.addEventListener('click', () => panelHistory.remember(), { capture: true }));
  widget.querySelectorAll('button,input').forEach(control=>control.disabled=control.hasAttribute('data-panel-undo')||control.hasAttribute('data-panel-redo'));
  observeSize(canvas,render);render();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(widget);
}

document.querySelectorAll('[data-three-utilities-plane]').forEach(preparePlane);
document.querySelectorAll('[data-three-utilities-surface]').forEach(prepareSurface);

import { NODES, nodeById, TORUS_ROUTES, PLANE_EIGHT, distance, obstruction, curveRoute, smoothWaypoints, simplifyPath, updateConnection } from '../lib/three-utilities-math.mjs?v=20261002-5';
import { boardSVG, boardGeometry, drawTransformation } from '../lib/three-utilities-diagrams.mjs?v=20261002-5';
import { observeSize } from '../lib/interactive-view.mjs';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function preparePlane(widget) {
  const board=widget.querySelector('[data-tu-board]'),count=widget.querySelector('[data-tu-count]'),status=widget.querySelector('[data-tu-status]');
  const undo=widget.querySelector('[data-tu-undo]'),cancel=widget.querySelector('[data-tu-cancel]');
  let routes=[],history=[],selected=null,waypoints=[],drag=null,cursor=[.5,.5],showCursor=false;
  let bad=obstruction(routes);
  const instruction='Choose a house, place points for the path, then choose a utility. Choose the same endpoints again without path points to remove a pipe.';
  function render(focus=null) {
    if(!board.clientWidth)return;
    const draft=drag?.moved?simplifyPath(drag.points):selected?[nodeById(selected).point,...waypoints]:null;
    board.innerHTML=boardSVG(routes,{width:board.clientWidth,selected,interactive:true,hits:[...bad.intersections,...bad.throughNodes],draft,cursor:showCursor?cursor:null});
    const hits=bad.intersections.length+bad.throughNodes.length;
    count.textContent=`${routes.length} / 9 pipes${hits?` · ${hits} obstruction${hits===1?'':'s'}`:''}`;
    undo.disabled=!history.length&&!selected;cancel.disabled=!selected&&!drag;
    if(focus)board.querySelector(focus==='paper'?'[data-tu-paper]':`[data-node="${focus}"]`)?.focus();
  }
  function resetPath(){selected=null;waypoints=[];drag=null;showCursor=false;}
  function commit(a,b,points,customPath=false) {
    const first=nodeById(a),second=nodeById(b);
    if(first.kind===second.kind){status.textContent='Choose a house and a utility as the two endpoints.';render();return;}
    const house=first.kind==='house'?a:b,utility=first.kind==='utility'?a:b;
    const oriented=first.kind==='house'?points:[...points].reverse();
    const edge=curveRoute(house,utility,[smoothWaypoints(oriented)]);
    history.push(routes);
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
    selected=id;waypoints=[];showCursor=false;
    status.textContent=`${nodeById(id).label} selected. Click points for the path, then choose the other endpoint. To remove an existing pipe, choose its other endpoint without adding points.`;
    render(keyboard?id:null);
  }
  function place(point,keyboard=false) {
    if(!selected){status.textContent='Choose a house or utility first, then place points along the path.';return;}
    waypoints.push(point);
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
    if(waypoints.length){waypoints.pop();status.textContent='Last path point removed.';}
    else if(selected){resetPath();status.textContent='Path cancelled.';}
    else if(history.length){routes=history.pop();bad=obstruction(routes);status.textContent='Last change undone, including any removed or redrawn pipe.';}
    render();
  });
  cancel.addEventListener('click',()=>{resetPath();status.textContent=instruction;render();});
  widget.querySelector('[data-tu-clear]').addEventListener('click',()=>{if(routes.length)history.push(routes);routes=[];resetPath();bad=obstruction(routes);status.textContent=instruction;render();});
  widget.querySelector('[data-tu-eight]').addEventListener('click',()=>{
    history.push(routes);routes=structuredClone(PLANE_EIGHT);resetPath();bad=obstruction(routes);
    status.textContent='Eight smooth pipes fit. Only House 3 → Gas is missing. Choose its endpoints and path points to try the last route.';render();
  });
  widget.querySelectorAll('button').forEach(button=>button.disabled=false);
  observeSize(board,()=>render());render();
}

const PHASES = [
  ['A mug', 'Drag to rotate the 3D mug and look inside. Its bowl has a bottom; the handle supplies the one through-hole.'],
  ['A donut', 'Round the body and shrink its indentation. The handle opening becomes the donut’s hole; the surface stays connected.'],
  ['An open tube', 'Cut along the purple dashed loop and straighten the ring. The two purple ends will be joined again.'],
  ['A square', 'Slit the tube along the green dashed loop and flatten it. Matching dashed sides belong together: green top and bottom, purple left and right.'],
];

function prepareSurface(widget) {
  const canvas=widget.querySelector('canvas'), slider=widget.querySelector('[data-tu-phase]'), title=widget.querySelector('[data-tu-stage]');
  const caption=widget.querySelector('[data-tu-caption]'), play=widget.querySelector('[data-tu-play]');
  widget.querySelector('[data-tu-surface-preview]').hidden=true;canvas.hidden=false;
  let phase=0, frame=null, orbit=null;
  const rotation={yaw:0,pitch:0};
  function render() {
    const index = Math.min(3, Math.floor(phase+.001));
    const inTransition=Math.abs(phase-Math.round(phase))>.02;
    const stage=inTransition?['Mug → donut','Donut → tube','Tube → square'][index]:PHASES[Math.round(phase)][0];
    const explanation=inTransition?PHASES[index+1][1]:PHASES[Math.round(phase)][1];
    if(title.textContent!==stage)title.textContent=stage;
    if(caption.textContent!==explanation)caption.textContent=explanation;
    slider.value=phase;
    widget.querySelectorAll('[data-tu-jump]').forEach(button=>button.setAttribute('aria-pressed',Math.abs(Number(button.dataset.tuJump)-phase)<.02));
    drawTransformation(canvas,phase,rotation);
    const description=`${stage}. ${explanation} Drag to rotate, or use arrow keys. Home resets to the mug.`;
    if(canvas.getAttribute('aria-label')!==description)canvas.setAttribute('aria-label',description);
  }
  function stop() {cancelAnimationFrame(frame);frame=null;play.textContent='Play from mug';}
  function animate(target,hold=0) {
    stop();
    if (reducedMotion.matches) {phase=target;render();return;}
    const start=phase, begin=performance.now()+hold, duration=Math.abs(target-start)*2400;
    const direction=Math.sign(target-start),stages=[start];
    if(direction)for(let boundary=direction>0?Math.floor(start)+1:Math.ceil(start)-1;direction>0?boundary<target:boundary>target;boundary+=direction)stages.push(boundary);
    stages.push(target);
    play.textContent='Pause';
    const tick=now=>{
      const t=Math.max(0,Math.min(1,(now-begin)/Math.max(1,duration)));
      let elapsed=Math.abs(target-start)*t;
      for(let i=1;i<stages.length;i++){
        const length=Math.abs(stages[i]-stages[i-1]);
        if(elapsed<=length||i===stages.length-1){const progress=length?Math.min(1,elapsed/length):1;phase=stages[i-1]+(stages[i]-stages[i-1])*progress*progress*(3-2*progress);break;}
        elapsed-=length;
      }
      render();
      if (t<1) frame=requestAnimationFrame(tick); else stop();
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
  widget.querySelector('[data-tu-reset-view]').addEventListener('click',resetMug);
  canvas.addEventListener('keydown',event=>{
    const directions={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.12],ArrowDown:[0,.12]};
    const delta=directions[event.key];
    if(delta){event.preventDefault();stop();rotation.yaw+=delta[0];rotation.pitch=Math.max(-1.3,Math.min(1.3,rotation.pitch+delta[1]));render();}
    if(event.key==='Home'){event.preventDefault();resetMug();}
  });
  widget.querySelectorAll('button,input').forEach(control=>control.disabled=false);
  observeSize(canvas,render);render();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
}

function prepareSquare(widget) {
  const board=widget.querySelector('[data-tu-square]'), next=widget.querySelector('[data-tu-next]'), count=widget.querySelector('[data-tu-count]');
  const status=widget.querySelector('[data-tu-status]'), trace=widget.querySelector('[data-tu-trace]');
  let number=7;
  const messages=[
    'Seven pipes fit inside the square. House 1 → Water and House 3 → Gas still need routes. Add the next pipe.',
    'House 1 → Water leaves through the green top side and returns at the matching point on the green bottom side. These two dots are one point on the glued surface.',
    'House 3 → Gas leaves through the purple right side and returns at the matching point on the purple left side. All nine pipes now fit, with no crossings.',
  ];
  status.textContent=messages[0];
  function render() {
    if (!board.clientWidth) return;
    const routes=TORUS_ROUTES.slice(0,number);
    board.innerHTML=boardSVG(routes,{width:board.clientWidth,square:true,focus:trace.value||null});
    count.textContent=`${number} / 9 pipes · no crossings`;next.disabled=number===9;
    next.textContent=number===7?'Add top ↔ bottom pipe':number===8?'Add left ↔ right pipe':'All nine connected';
    const prior=trace.value;
    trace.innerHTML='<option value="">All pipes</option>'+routes.map(edge=>`<option value="${edge.id}">${nodeById(edge.house).label} → ${nodeById(edge.utility).label}${edge.seam?` (${edge.seam==='a'?'top/bottom':'left/right'})`:''}</option>`).join('');
    trace.value=routes.some(edge=>edge.id===prior)?prior:'';
  }
  next.addEventListener('click',()=>{number=Math.min(9,number+1);trace.value='';status.textContent=messages[number-7];render();});
  widget.querySelector('[data-tu-reset]').addEventListener('click',()=>{number=7;trace.value='';status.textContent=messages[0];render();});
  trace.addEventListener('change',()=>{
    const edge=TORUS_ROUTES.find(route=>route.id===trace.value);
    status.textContent=edge?`${nodeById(edge.house).label} → ${nodeById(edge.utility).label}: ${edge.seam==='a'?'follow the matching dots on the green top and bottom sides.':edge.seam==='b'?'follow the matching dots on the purple left and right sides.':'the entire pipe stays inside the square.'}`:messages[number-7];render();
  });
  widget.querySelectorAll('button,select').forEach(control=>control.disabled=false);
  observeSize(board,render);render();
}

document.querySelectorAll('[data-three-utilities-plane]').forEach(preparePlane);
document.querySelectorAll('[data-three-utilities-surface]').forEach(prepareSurface);
document.querySelectorAll('[data-three-utilities-square]').forEach(prepareSquare);

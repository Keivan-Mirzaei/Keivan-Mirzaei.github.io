import { NODES, nodeById, edgeId, TORUS_ROUTES, PLANE_EIGHT, distance, obstruction } from '../lib/three-utilities-math.mjs';
import { boardSVG, boardGeometry, drawTransformation } from '../lib/three-utilities-diagrams.mjs';
import { observeSize } from '../lib/interactive-view.mjs';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function preparePlane(widget) {
  const board = widget.querySelector('[data-tu-board]'), count = widget.querySelector('[data-tu-count]'), status = widget.querySelector('[data-tu-status]');
  const undo = widget.querySelector('[data-tu-undo]');
  let routes = [], selected = null, drag = null;
  const instruction = 'Drag a pipe from a house to a utility. You can also select its two endpoints to draw a straight pipe.';
  function render(keepFocus = null) {
    if (!board.clientWidth) return;
    const bad = obstruction(routes), hits = [...bad.intersections, ...bad.throughNodes];
    board.innerHTML = boardSVG(routes, { width: board.clientWidth, selected, interactive: true, hits, draft: drag?.moved ? drag.points : null });
    count.textContent = `${routes.length} / 9 pipes${hits.length ? ` · ${hits.length} obstruction${hits.length === 1 ? '' : 's'}` : ''}`;
    undo.disabled = !routes.length;
    if (keepFocus) board.querySelector(`[data-node="${keepFocus}"]`)?.focus();
  }
  function add(a, b, points) {
    const first = nodeById(a), second = nodeById(b);
    if (a === b) return;
    if (first.kind === second.kind) { status.textContent = 'A pipe must join a house to a utility.'; return; }
    const id = edgeId(a,b);
    if (routes.some(edge=>edge.id===id)) { status.textContent = 'Those endpoints already have a pipe. Undo it to try a different route.'; return; }
    const house = first.kind === 'house' ? a : b, utility = first.kind === 'utility' ? a : b;
    const part = first.kind === 'house' ? points : [...points].reverse();
    routes.push({ id, house, utility, parts: [part] }); selected = null;
    const bad = obstruction(routes);
    if (bad.intersections.length || bad.throughNodes.length) status.textContent = 'The red marks show crossings, overlaps, or a pipe passing through another endpoint. Undo and try a different route.';
    else status.textContent = `${routes.length} pipe${routes.length === 1 ? '' : 's'} without a detected crossing. ${9-routes.length} still to connect.`;
    if (routes.length === 9) status.textContent = 'All nine are drawn. A crossing or shared route is unavoidable on the plane. Open the solution to see why every possible drawing has this problem.';
    render();
  }
  function choose(id, keyboard = false) {
    if (selected && selected !== id) {
      add(selected,id,[nodeById(selected).point,nodeById(id).point]);
      render(keyboard ? id : null);
    } else {
      selected = selected === id ? null : id;
      status.textContent = selected ? `${nodeById(id).label} selected. Choose an endpoint of the other kind.` : instruction;
      render(keyboard ? id : null);
    }
  }
  const eventPoint = event => {
    const rect = board.getBoundingClientRect(), g = boardGeometry(board.clientWidth);
    const scale = g.width / rect.width;
    return [Math.max(0,Math.min(1,((event.clientX-rect.left)*scale-g.left)/g.size)), Math.max(0,Math.min(1,((event.clientY-rect.top)*scale-g.top)/g.size))];
  };
  board.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const node = event.target.closest('[data-node]');
    if (!node) return;
    event.preventDefault();
    drag = { id:node.dataset.node, points:[nodeById(node.dataset.node).point], start:eventPoint(event), moved:false, pointer:event.pointerId };
    board.setPointerCapture(event.pointerId);
  });
  board.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const p = eventPoint(event);
    if (distance(p,drag.start) > .018) drag.moved=true;
    if (drag.moved && distance(p,drag.points.at(-1)) > .006) {drag.points.push(p);render();}
  });
  board.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const current = drag; drag=null;
    if (board.hasPointerCapture(event.pointerId)) board.releasePointerCapture(event.pointerId);
    if (!current.moved) {choose(current.id);return;}
    const p = eventPoint(event), threshold = 25/boardGeometry(board.clientWidth).size;
    const target = NODES.find(node=>distance(node.point,p)<threshold);
    if (target && target.id !== current.id) {
      const points = [...current.points];
      while (points.length>1 && distance(points.at(-1),target.point)<.04) points.pop();
      points.push(target.point); add(current.id,target.id,points);
    } else {status.textContent='Finish your pipe on a house or utility. This unfinished stroke was removed.';render();}
  });
  board.addEventListener('pointercancel',()=>{drag=null;render();});
  board.addEventListener('keydown',event=>{
    const node=event.target.closest('[data-node]');
    if (node && ['Enter',' '].includes(event.key)) {event.preventDefault();choose(node.dataset.node,true);}
    if (event.key==='Escape') {selected=null;drag=null;status.textContent=instruction;render();}
  });
  undo.addEventListener('click',()=>{routes.pop();selected=null;status.textContent='Last pipe removed. Try another route.';render();});
  widget.querySelector('[data-tu-clear]').addEventListener('click',()=>{routes=[];selected=null;status.textContent=instruction;render();});
  widget.querySelector('[data-tu-eight]').addEventListener('click',()=>{
    routes=structuredClone(PLANE_EIGHT);selected=null;
    status.textContent='Eight pipes fit. Only House 3 → Gas is missing. Try drawing the last one without crossing anything.';render();
  });
  widget.querySelectorAll('button').forEach(button=>button.disabled=false);
  observeSize(board,()=>render());render();
}

const PHASES = [
  ['A mug', 'Follow the purple handle opening. The bowl has a bottom: it is a dent in the surface, not a second through-hole.'],
  ['A donut', 'Round the body and shrink its indentation. The handle opening becomes the donut’s hole; the surface stays connected.'],
  ['An open tube', 'Cut along the purple loop b and straighten the ring. The two purple ends will be joined again.'],
  ['A square', 'Slit the tube along the green loop a and flatten it. Pair left with right, and top with bottom, in the same direction.'],
];

function prepareSurface(widget) {
  const canvas=widget.querySelector('canvas'), slider=widget.querySelector('[data-tu-phase]'), title=widget.querySelector('[data-tu-stage]');
  const caption=widget.querySelector('[data-tu-caption]'), play=widget.querySelector('[data-tu-play]');
  const pipes=widget.querySelector('[data-tu-surface-pipes]');
  widget.querySelector('[data-tu-surface-preview]').hidden=true;canvas.hidden=false;
  let phase=0, frame=null;
  function render() {
    const index = Math.min(3, Math.floor(phase+.001));
    const inTransition=Math.abs(phase-Math.round(phase))>.02;
    const stage=inTransition?['Mug → donut','Donut → tube','Tube → square'][index]:PHASES[Math.round(phase)][0];
    const explanation=inTransition?PHASES[index+1][1]:PHASES[Math.round(phase)][1];
    if(title.textContent!==stage)title.textContent=stage;
    if(caption.textContent!==explanation)caption.textContent=explanation;
    slider.value=phase;
    widget.querySelectorAll('[data-tu-jump]').forEach(button=>button.setAttribute('aria-pressed',Math.abs(Number(button.dataset.tuJump)-phase)<.02));
    pipes.disabled=phase<1;
    drawTransformation(canvas,phase,pipes.checked&&phase>=1?TORUS_ROUTES:[]);
    const description=`${stage}. ${explanation}${pipes.checked&&phase>=1?' The nine pipes are carried with the surface. Rear pipes are hidden.':''}`;
    if(canvas.getAttribute('aria-label')!==description)canvas.setAttribute('aria-label',description);
  }
  function stop() {cancelAnimationFrame(frame);frame=null;play.textContent='Play transformation';}
  function animate(target) {
    stop();
    if (reducedMotion.matches) {phase=target;render();return;}
    const start=phase, begin=performance.now(), duration=Math.abs(target-start)*2400;
    play.textContent='Pause';
    const tick=now=>{
      const t=Math.min(1,(now-begin)/Math.max(1,duration));
      phase=start+(target-start)*t;render();
      if (t<1) frame=requestAnimationFrame(tick); else stop();
    };
    frame=requestAnimationFrame(tick);
  }
  slider.addEventListener('input',()=>{stop();phase=Number(slider.value);render();});
  widget.querySelectorAll('[data-tu-jump]').forEach(button=>button.addEventListener('click',()=>animate(Number(button.dataset.tuJump))));
  play.addEventListener('click',()=>{if(frame)stop();else {if(phase>=2.99)phase=0;animate(3);}});
  pipes.addEventListener('change',render);
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
    'House 1 → Water leaves through the top a and returns at the matching point on the bottom a. These two dots are one point on the glued surface.',
    'House 3 → Gas leaves through the right b and returns at the matching point on the left b. All nine pipes now fit, with no crossings.',
  ];
  status.textContent=messages[0];
  function render() {
    if (!board.clientWidth) return;
    const routes=TORUS_ROUTES.slice(0,number);
    board.innerHTML=boardSVG(routes,{width:board.clientWidth,square:true,focus:trace.value||null});
    count.textContent=`${number} / 9 pipes · no crossings`;next.disabled=number===9;
    next.textContent=number===7?'Add top ↔ bottom pipe':number===8?'Add left ↔ right pipe':'All nine connected';
    const prior=trace.value;
    trace.innerHTML='<option value="">All pipes</option>'+routes.map(edge=>`<option value="${edge.id}">${nodeById(edge.house).label} → ${nodeById(edge.utility).label}${edge.seam?` (through ${edge.seam})`:''}</option>`).join('');
    trace.value=routes.some(edge=>edge.id===prior)?prior:'';
  }
  next.addEventListener('click',()=>{number=Math.min(9,number+1);trace.value='';status.textContent=messages[number-7];render();});
  widget.querySelector('[data-tu-all]').addEventListener('click',()=>{number=9;trace.value='';status.textContent=messages[2];render();});
  widget.querySelector('[data-tu-reset]').addEventListener('click',()=>{number=7;trace.value='';status.textContent=messages[0];render();});
  trace.addEventListener('change',()=>{
    const edge=TORUS_ROUTES.find(route=>route.id===trace.value);
    status.textContent=edge?`${nodeById(edge.house).label} → ${nodeById(edge.utility).label}: ${edge.seam==='a'?'follow the matching top and bottom a dots.':edge.seam==='b'?'follow the matching right and left b dots.':'the entire pipe stays inside the square.'}`:messages[number-7];render();
  });
  widget.querySelectorAll('button,select').forEach(control=>control.disabled=false);
  observeSize(board,render);render();
}

document.querySelectorAll('[data-three-utilities-plane]').forEach(preparePlane);
document.querySelectorAll('[data-three-utilities-surface]').forEach(prepareSurface);
document.querySelectorAll('[data-three-utilities-square]').forEach(prepareSquare);

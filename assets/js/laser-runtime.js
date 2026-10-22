(() => {
  // Toolbar presses can inject this file repeatedly; keep exactly one listener.
  if (globalThis.__safariLaserPointer) return;
  globalThis.__safariLaserPointer = true;

  const COLOURS = ['#ff304b','#007aff','#238636'];
  const COLOUR_NAMES = ['Red','Blue','Green'];
  const WIDTHS = [2,4,8];
  // Bound both individual SVG parsing work and extreme uninterrupted sessions.
  const MAX_HOLD = 20, CHUNK_POINTS = 128, MAX_CHUNKS = 512, TAPER = 18;
  let controlBounds = [], activeEvents = null, persistSettings = () => {}, closeSettings = () => {};
  const paints = new Map(), dirtyStrokes = new Set();
  let lastSmoothing = null, lastOpacity = null;
  // Top-of-viewport fade band, the gradient position last applied, and the vertical
  // extent of all marks (padded beyond the widest outline) in document coordinates.
  const EDGE = 72, MARK_PAD = 6;
  let paintY = 0, marksTop = Infinity, marksBottom = -Infinity;
  let gearPosition = null, gearDragging = false, positionControls = () => {};
  let settings = { thickness: 4, smoothing: 35, colour: '#ff304b', hold: 2 };
  function normalize(value = {}) {
    const number = (key, min, max) => Number.isFinite(Number(value[key]))
      ? Math.max(min, Math.min(max, Number(value[key]))) : settings[key];
    const colour = COLOURS.includes(value.colour) ? value.colour : COLOURS[0];
    return { thickness: WIDTHS.reduce((best, n) => Math.abs(n - number('thickness', 2, 8)) < Math.abs(best - number('thickness', 2, 8)) ? n : best, 4), smoothing: number('smoothing', 0, 100),
      hold: value.hold === 'forever' ? MAX_HOLD : number('hold', 1, MAX_HOLD), colour };

  }
  function refreshSettings() {
    if (!host) return;
    if (lastSmoothing !== settings.smoothing) {
      for (const stroke of strokes) dirtyStrokes.add(stroke);
      lastSmoothing = settings.smoothing;
    }
    requestRender();
    dot.style.boxShadow = `0 0 0 2px ${settings.colour},0 0 12px 5px ${settings.colour}`;
    const root = canvas.getRootNode();
    for (const key of ['hold','smoothing']) {
      const value = settings[key];
      const input = root.querySelector(`[name="${key}"]`);
      input.value = value;
      const fraction = (value - input.min) / (input.max - input.min);
      input.style.setProperty('--fill-end', `calc(${fraction * 100}% + ${14 - fraction * 28}px)`);
      const output = root.querySelector(`[data-value="${key}"]`);
      output.textContent = key === 'hold' ? `${Math.round(value)} s` : `${Math.round(value)}%`;
    }
    root.querySelectorAll('[data-width]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.width) === settings.thickness)));
    host.style.setProperty('--colour', settings.colour);
    const palette = root.querySelector('.palette');
    if (!palette.children.length) {
      COLOURS.forEach((colour, index) => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'swatch'; button.dataset.colour = colour;
        button.style.setProperty('--swatch', colour);
        button.setAttribute('aria-label', COLOUR_NAMES[index]);
        palette.append(button);
      });
    }
    palette.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.colour === settings.colour)));

  }
  const loaded = browser.storage?.local.get(['laserSettings','laserGearPosition']).then(async result => {
    settings = normalize(result.laserSettings);
    if (Number.isFinite(result.laserGearPosition?.x) && Number.isFinite(result.laserGearPosition?.y)) gearPosition = result.laserGearPosition;
    refreshSettings();
    if (result.laserSettings?.hold === 'forever' || result.laserSettings?.hold > MAX_HOLD) await browser.storage.local.set({ laserSettings: settings });
  }).catch(() => {}) || Promise.resolve();
  browser.storage?.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.laserSettings) {
      settings = normalize(changes.laserSettings.newValue); refreshSettings();
    }
  });
  function isControl(event) {
    if (!host || !canvas) return false;
    // Window listeners cannot see nodes inside a closed shadow root in composedPath().
    // Hit-test our own controls instead, before suppressing page interactions.
    if (gearDragging) return true;
    if (typeof event.clientX === 'number') return controlBounds.some(rect =>
      event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom);
    const root = canvas.getRootNode();
    return root.querySelector('.settings-ui').contains(root.activeElement);
  }

  const FADE_MS = 750;
  let enabled = false, host, canvas, dot, status, frame = 0, introTimer = 0;
  let marksHost, svg, paths, gradient, pageWidth = 0, pageHeight = 0, originX = 0;
  const NS = "http://www.w3.org/2000/svg";
  function element(name, attributes = {}) {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  }
  let strokes = [], current = null, pointerId = null, lastPoint = null;
  let bypass = false;
  function setBypass(value, report = true) {
    if (!enabled || bypass === value) return;
    bypass = value;
    if (value) {
      finish();
      dot.style.opacity = '0';
    }
    host.style.setProperty('pointer-events', value ? 'none' : 'auto', 'important');
    status.hidden = !value;
    status.textContent = 'Paused · Space to resume';
    if (report) { commandVersion++; notify(); }
  }
  let idleSince = null, wakeTimer = 0;
  function requestRender() {
    if (enabled && !frame) frame = requestAnimationFrame(now => { frame = 0; render(now); });
  }


  function notify() {
    browser.runtime.sendMessage({ type: "laser:state", enabled, paused: bypass }).catch(() => {});
  }
  function finish() {
    if (current) {
      current.gesture.head.clear(); current.gesture.tail.clear();
      idleSince = performance.now(); requestRender();
    }
    const captured = pointerId;
    current = null;
    pointerId = null;
    if (captured !== null && canvas?.hasPointerCapture(captured)) canvas.releasePointerCapture(captured);
  }
  function resize() {
    if (!marksHost) return;
    // Measure the page without our layer so it can never inflate its own bounds.
    marksHost.style.setProperty('display', 'none', 'important');
    const page = document.documentElement;
    pageWidth = Math.max(page.scrollWidth, innerWidth);
    pageHeight = Math.max(page.scrollHeight, innerHeight);
    // Right-to-left pages scroll sideways into negative coordinates. Start the layer
    // at the page's left edge there, and shift the marks so they stay where drawn.
    const left = getComputedStyle(page).direction === 'rtl' ? Math.min(0, page.clientWidth - page.scrollWidth) : 0;
    if (left !== originX) {
      originX = left;
      if (originX) paths.setAttribute('transform', `translate(${-originX} 0)`);
      else paths.removeAttribute('transform');
    }
    marksHost.style.setProperty('left', `${originX}px`, 'important');
    marksHost.style.setProperty('width', `${pageWidth}px`, 'important');
    marksHost.style.setProperty('height', `${pageHeight}px`, 'important');
    marksHost.style.setProperty('display', 'block', 'important');
    svg.setAttribute('width', pageWidth);
    svg.setAttribute('height', pageHeight);
  }
  function render(now) {
    if (!enabled) return;
    const age = idleSince === null ? 0 : now - idleSince;
    if (age >= settings.hold * 1000 + FADE_MS) clearMarks();
    // Only the paint gradients follow the viewport. Stroke coordinates never change
    // during scrolling: Safari composites this document layer with page content.
    // Moving a gradient repaints every mark that uses it, so move it only when some
    // mark could sit in the fade band at the old or new position. Otherwise every
    // mark is fully opaque (below both bands) or fully clear (above both) either way.
    const y = scrollY;
    if (y !== paintY && marksTop < Math.max(y, paintY) + EDGE && marksBottom > Math.min(y, paintY)) {
      paintY = y;
      for (const paint of paints.values()) {
        paint.setAttribute('y1', y);
        paint.setAttribute('y2', y + EDGE);
      }
    }
    // One group opacity per frame instead of one fill-opacity write per chunk.
    const opacity = age <= settings.hold * 1000 ? 1 : Math.max(0, 1 - (age - settings.hold * 1000) / FADE_MS);
    if (opacity !== lastOpacity) {
      paths.setAttribute('opacity', opacity);
      lastOpacity = opacity;
    }
    for (const stroke of dirtyStrokes) {
      if (!stroke.path) {
        stroke.path = element('path');
        paths.append(stroke.path);
      }
      stroke.path.setAttribute('d', naturalPath(stroke, settings.smoothing !== 0));
      // A stroke paint gradient avoids a document-sized SVG mask/filter surface.
      const id = 'edge-' + stroke.colour.slice(1);
      if (!paints.has(id)) {
        const paint = gradient.cloneNode(true);
        paint.id = id;
        for (const stop of paint.children) stop.setAttribute('stop-color', stroke.colour);
        paint.setAttribute('y1', paintY); paint.setAttribute('y2', paintY + EDGE);
        svg.querySelector('defs').append(paint);
        paints.set(id, paint);
      }
      if (!stroke.path.hasAttribute('fill')) stroke.path.setAttribute('fill', `url(#${id})`);
    }
    dirtyStrokes.clear();
    clearTimeout(wakeTimer);
    if (strokes.length && idleSince !== null) {
      const remaining = settings.hold * 1000 - age;
      if (remaining > 0) wakeTimer = setTimeout(requestRender, remaining + 1);
      else requestRender();
    }
  }
  function naturalPoint(previous, x, y, time) {
    const distance = Math.hypot(x-previous.x,y-previous.y);
    const speed = distance / Math.max(1,time-previous.time);
    const target = Math.max(0.78,Math.min(1.15,1.15-speed*0.2));
    return { x, y, time, distance:previous.distance+distance, width:previous.width*0.8+target*0.2 };
  }
  // One filled outline per bounded chunk; scroll and fade never rebuild geometry.
  function naturalPath(stroke, smooth) {
    const { points, gesture, thickness } = stroke;
    const span = Math.min(TAPER, gesture.length / 4);
    const radius = p => {
      const t = span ? Math.max(0, Math.min(1, Math.min(p.distance, gesture.length - p.distance) / span)) : 1;
      return thickness * p.width * (0.18 + 0.82 * t * t * (3 - 2 * t)) / 2;
    };
    const xy = p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    if (points.length === 1) {
      const p = points[0], r = thickness / 2;
      return `M ${p.x-r} ${p.y} a ${r} ${r} 0 1 0 ${r*2} 0 a ${r} ${r} 0 1 0 ${-r*2} 0 Z`;
    }
    const offset = (p, a, b) => {
      let dx = b.x-a.x, dy = b.y-a.y;
      if (Math.hypot(dx,dy) < 0.0001) { dx = p.x-a.x; dy = p.y-a.y; }
      const length = Math.hypot(dx,dy) || 1, r = radius(p);
      return [{x:p.x-dy/length*r,y:p.y+dx/length*r},{x:p.x+dy/length*r,y:p.y-dx/length*r}];
    };
    const left = [], right = [];
    for (let i=0; i<points.length; i++) {
      const pair = i===0 && stroke.startVector
        ? offset(points[i], {x:points[i].x-stroke.startVector.x,y:points[i].y-stroke.startVector.y}, points[i])
        : offset(points[i], points[Math.max(0,i-1)], points[Math.min(points.length-1,i+1)]);
      left.push(pair[0]); right.push(pair[1]);
    }
    const last = points.length-1, end = stroke.end || points[last];
    const [endLeft,endRight] = offset(end, points[last-1], points[last]);
    const midpoint = (a,b) => ({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
    const edge = (side, tip, reverse) => {
      let d = '';
      if (!smooth) {
        for (let i=reverse ? last-1 : 1; reverse ? i>=0 : i<last; i+=reverse ? -1 : 1) d += ` L ${xy(side[i])}`;
        return reverse ? d : d + ` L ${xy(tip)}`;
      }
      if (reverse) {
        if (last>1) d += ` L ${xy(stroke.end ? tip : midpoint(side[last-1],side[last]))}`;
        for (let i=last-1; i>=1; i--) d += ` Q ${xy(side[i])} ${xy(i===1 ? side[0] : midpoint(side[i-1],side[i]))}`;
        if (last===1) d += ` L ${xy(side[0])}`;
      } else {
        for (let i=1; i<last; i++) d += ` Q ${xy(side[i])} ${xy(i===last-1 && stroke.end ? tip : midpoint(side[i],side[i+1]))}`;
        d += ` L ${xy(tip)}`;
      }
      return d;
    };
    const cap = (p, target, round) => round ? ` A ${radius(p)} ${radius(p)} 0 0 0 ${xy(target)}` : ` L ${xy(target)}`;
    return `M ${xy(left[0])}` + edge(left,endLeft,false) + cap(end,endRight,!stroke.end) +
      edge(right,endRight,true) + cap(points[0],left[0],!stroke.continuation) + ' Z';
  }
  function clearMarks() {
    strokes = [];
    dirtyStrokes.clear();
    paths?.replaceChildren();
    lastOpacity = null;
    marksTop = Infinity; marksBottom = -Infinity;
  }
  function include(point) {
    if (point.y - MARK_PAD < marksTop) marksTop = point.y - MARK_PAD;
    if (point.y + MARK_PAD > marksBottom) marksBottom = point.y + MARK_PAD;
  }
  function addChunk(points, style = settings) {
    const gesture = style.gesture || { length: 0, head: new Set(), tail: new Set() };
    const stroke = { points, colour: style.colour, thickness: style.thickness, gesture, continuation: !!style.gesture };
    points.forEach(include);
    gesture.tail.add(stroke);
    if (points[0].distance < TAPER) gesture.head.add(stroke);
    strokes.push(stroke);
    dirtyStrokes.add(stroke);
    if (strokes.length > MAX_CHUNKS) {
      const oldest = strokes.shift();
      dirtyStrokes.delete(oldest);
      oldest.gesture.head.delete(oldest); oldest.gesture.tail.delete(oldest);
      oldest.path?.remove();
    }
    return stroke;
  }
  function move(event) {
    if (!enabled || bypass || event.pointerType === "touch") return;
    if (event.clientX < 0 || event.clientY < 0 || event.clientX >= innerWidth || event.clientY >= innerHeight) {
      leavePage(event);
      return;
    }
    if (isControl(event)) { dot.style.transition = 'none'; dot.style.opacity = '0'; return; }
    // Restore Safari's cursor before the laser fades into browser chrome.
    const nativeCursor = event.clientY < 4;
    canvas.style.cursor = nativeCursor ? 'auto' : 'none';
    dot.style.transition = 'none';
    dot.style.visibility = nativeCursor ? 'hidden' : 'visible';
    lastPoint = { x: event.clientX, y: event.clientY };
    dot.style.transform = `translate(${lastPoint.x}px, ${lastPoint.y}px)`;
    dot.style.opacity = nativeCursor ? '0' : '1';
    if (current && event.pointerId === pointerId) {
      requestRender();
      if (!(event.buttons & 1)) finish();
      else {
        const raw = { x: lastPoint.x + scrollX, y: lastPoint.y + scrollY };
        const previous = current.points[current.points.length - 1];
        const distance = Math.hypot(raw.x - previous.x, raw.y - previous.y);
        // Light filtering for small tremors; larger movements catch up quickly.
        const weight = settings.smoothing === 0 ? 1 : Math.max(0.08, Math.min(0.85, 0.25 + distance / 24) ** (settings.smoothing / 35));
        if (distance > 0 && distance >= (settings.smoothing ? 0.5 : 0)) {
          const x = previous.x + (raw.x - previous.x) * weight, y = previous.y + (raw.y - previous.y) * weight;
          const point = naturalPoint(previous,x,y,event.timeStamp);
          if (current.points.length >= CHUNK_POINTS) {
            const before = current.points[current.points.length - 2];
            const seam = settings.smoothing ? { x: (before.x + previous.x) / 2, y: (before.y + previous.y) / 2, width: (before.width+previous.width)/2, distance: (before.distance+previous.distance)/2 } : previous;
            current.end = seam;
            dirtyStrokes.add(current);
            current = addChunk(settings.smoothing ? [seam, previous] : [previous], current);
            current.startVector = {x:previous.x-before.x,y:previous.y-before.y};
          }
          current.points.push(point);
          include(point);
          const gesture = current.gesture, oldLength = gesture.length;
          gesture.length = point.distance;
          // Only the short moving tip and initial taper need refreshing across joins.
          for (const chunk of gesture.tail) {
            dirtyStrokes.add(chunk);
            if (chunk.points[chunk.points.length-1].distance < gesture.length-TAPER) gesture.tail.delete(chunk);
          }
          if (oldLength < TAPER*4) {
            for (const chunk of gesture.head) dirtyStrokes.add(chunk);
            if (gesture.length >= TAPER*4) gesture.head.clear();
          }
        }
      }
    }
  }
  function block(event) {
    if (!enabled || bypass || isControl(event)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  function down(event) {
    if (!enabled || bypass || isControl(event) || event.button !== 0 || event.pointerType === "touch") return;
    block(event);
    finish();
    move(event);
    if (!lastPoint) return;
    closeSettings();
    pointerId = event.pointerId;
    // Treat successive strokes as one writing session, including pauses between letters.
    if (idleSince !== null && performance.now() - idleSince >= (settings.hold * 1000) + FADE_MS) clearMarks();
    idleSince = null;
    current = addChunk([{ x: lastPoint.x + scrollX, y: lastPoint.y + scrollY, distance:0, width:1, time:event.timeStamp }]);
    canvas.setPointerCapture(event.pointerId);
    requestRender();
  }
  function up(event) {
    if (!enabled || event.pointerId !== pointerId) return;
    block(event);
    move(event);
    finish();
  }
  function setEnabled(value, report = true, paused = false) {
    enabled = value;
    bypass = false;
    gearDragging = false;
    if (!value) {
      persistSettings();
      activeEvents?.abort();
      activeEvents = null;
      pageObserver.disconnect();
      clearTimeout(introTimer);
      cancelAnimationFrame(frame);
      frame = 0;
      clearTimeout(wakeTimer);
      finish();
      clearMarks();
      idleSince = null;
      marksHost?.remove();
      marksHost = null;
      host?.remove();
      host = canvas = dot = status = svg = paths = gradient = null;
      paints.clear();
      originX = 0;
      controlBounds = [];
      lastPoint = null;
      positionControls = persistSettings = closeSettings = () => {};
      if (report) notify();
      return;
    }
    host = document.createElement("div");
    // `all:initial` keeps direction and unicode-bidi, so pin the English controls to
    // left-to-right; otherwise right-to-left pages mirror them.
    host.style.cssText = "all:initial!important;direction:ltr!important;unicode-bidi:isolate!important;position:fixed!important;inset:0!important;overflow:clip!important;contain:strict!important;z-index:2147483647!important;pointer-events:auto!important;color-scheme:light dark!important;";
    host.setAttribute('popover', 'manual');
    const root = host.attachShadow({ mode: "closed" });
    root.innerHTML = `<style>
      :host { color-scheme:light dark; --ink:light-dark(#1d1d1f,#f5f5f7); --muted:light-dark(#525259,#c5c5cc); --glass:light-dark(#f8f8faed,#242428ed); --solid:light-dark(#f6f6f8,#252529); --line:light-dark(#00000026,#ffffff38); --track:light-dark(#e5e5e9,#44444b); }
      :host::backdrop { background:transparent; pointer-events:none; }
      *,*::before,*::after { box-sizing:border-box; }
      canvas { position:absolute; inset:0; width:100%; height:100%; cursor:none; }
      .dot { opacity:0; transition:opacity 160ms linear; position:fixed; top:-5px; left:-5px; width:10px; height:10px; border-radius:50%; background:#fff4f5; pointer-events:none; will-change:transform; }
      .status { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); padding:9px 15px; border-radius:24px; font:13px -apple-system,sans-serif; pointer-events:none; white-space:nowrap; }
      .panel,.status { background:var(--glass); color:var(--ink); border:1px solid var(--line); -webkit-backdrop-filter:blur(20px) saturate(140%); backdrop-filter:blur(20px) saturate(140%); box-shadow:0 10px 28px #00000016; }
      .settings-ui { position:fixed; top:16px; right:16px; width:38px; height:38px; pointer-events:auto; font:13px -apple-system,sans-serif; color:var(--ink); cursor:auto; }
      button { font:inherit; color:inherit; cursor:pointer; }
      button:focus-visible,input:focus-visible { outline:3px solid Highlight; outline-offset:3px; }
      .compact-actions { position:absolute; top:0; right:0; z-index:2; animation:gear-arrive 340ms cubic-bezier(.2,.7,.2,1) both; transform-origin:top right; }
      .settings-toggle { width:38px; height:38px; display:flex; align-items:center; justify-content:center; gap:0; padding:7px; border:1px solid var(--line); border-radius:10px; background:var(--solid); transition:width 220ms ease,gap 220ms ease; touch-action:none; user-select:none; -webkit-user-select:none; cursor:grab; }
      .settings-toggle[aria-expanded=true] { background:light-dark(#e9edf2,#414b58); }
      .settings-toggle.dragging { cursor:grabbing; transition:none; }
      .gear-icon { flex:0 0 19px; width:19px; height:19px; stroke-width:1.6; }
      .gear-label { max-width:0; opacity:0; overflow:hidden; white-space:nowrap; transition:max-width 220ms ease,opacity 180ms ease; }
      .intro .settings-toggle { width:112px; gap:8px; animation:gear-beacon 1100ms ease-out 2; }
      .intro .gear-label { max-width:66px; opacity:1; }
      .panel { position:fixed; z-index:1; width:278px; padding:20px; border-radius:20px; overflow:auto; }
      [hidden] { display:none!important; }
      .palette { display:flex; justify-content:space-around; gap:12px; margin-bottom:20px; }
      .swatch { padding:0; width:27px; height:27px; border:4px solid var(--solid); background:var(--swatch); border-radius:50%; }
      .swatch[aria-pressed=true] { outline:1.5px solid var(--swatch); outline-offset:2px; }
      .width-options { display:flex; gap:3px; padding:3px; margin-bottom:20px; border-radius:10px; background:light-dark(#efeff2,#353539); }
      .width-options button { flex:1; min-width:0; height:30px; padding:0; border:0; border-radius:7px; background:transparent; display:grid; place-items:center; }
      .width-options button[aria-pressed=true] { background:var(--solid); box-shadow:0 1px 4px #00000012; }
      .width-options span { width:var(--size); height:var(--size); border-radius:50%; background:var(--colour); }
      label { display:block; margin-bottom:20px; font-size:12px; }
      label:last-of-type { margin-bottom:0; }
      output { float:right; color:var(--muted); font-variant-numeric:tabular-nums; }
      input[type=range] { appearance:none; -webkit-appearance:none; width:100%; height:18px; margin:14px 0 7px; display:block; border:0; border-radius:10px; background:linear-gradient(to right,color-mix(in srgb,var(--colour) 30%,var(--solid)) var(--fill-end),var(--track) var(--fill-end)); cursor:pointer; }
      input[type=range]::-webkit-slider-thumb { appearance:none; -webkit-appearance:none; width:28px; height:28px; border-radius:50%; background:light-dark(#fff,#e8e8ed); box-shadow:0 2px 6px #00000022; }
      .save-state { color:var(--muted); font-size:12px; margin:12px 0 0; }
      .save-state:empty { display:none; }
      @keyframes gear-arrive { from { opacity:0; transform:translateY(-7px) scale(.92); } to { opacity:1; transform:translateY(0) scale(1); } }
      @keyframes gear-beacon { from { box-shadow:0 0 0 0 #ff304b38; } to { box-shadow:0 0 0 12px #ff304b00; } }
      @supports not (backdrop-filter:blur(1px)) { .panel,.status { background:var(--solid); } }
      @media(prefers-reduced-transparency:reduce),(prefers-contrast:more) { .panel,.status { background:var(--solid); -webkit-backdrop-filter:none; backdrop-filter:none; } }
      @media(prefers-contrast:more) { .panel,.status,button { border:2px solid currentColor; box-shadow:none; } output { color:var(--ink); } input[type=range] { --track:light-dark(#bbb,#777); } }
      @media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation:none!important; transition:none!important; } }
    </style><canvas></canvas><div class="dot"></div><div class="status" role="status" hidden></div>
    <div class="settings-ui">
      <div class="compact-actions intro"><button type="button" class="settings-toggle" aria-label="Settings" aria-expanded="false" aria-controls="laser-panel"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="settings" aria-hidden="true" class="gear-icon"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"></path><circle cx="12" cy="12" r="3"></circle></svg><span class="gear-label" aria-hidden="true">Settings</span></button></div>
      <section id="laser-panel" class="panel" hidden aria-label="Laser settings">
      
        <div class="palette-row"><div class="palette" role="group" aria-label="Colours"></div></div>
        <div class="width-options" role="group" aria-label="Thickness"><button type="button" data-width="2" aria-label="Thin"><span style="--size:2px" aria-hidden="true"></span></button><button type="button" data-width="4" aria-label="Medium"><span style="--size:4px" aria-hidden="true"></span></button><button type="button" data-width="8" aria-label="Thick"><span style="--size:8px" aria-hidden="true"></span></button></div>
        <label for="laser-smoothing">Smoothing <output data-value="smoothing"></output><input id="laser-smoothing" aria-label="Smoothing" name="smoothing" type="range" min="0" max="100" step="any"></label>
        <label for="laser-hold">Stay visible <output data-value="hold"></output><input aria-label="Stay visible after writing" id="laser-hold" name="hold" type="range" min="1" max="20" step="any"></label>
        <p class="save-state" role="status"></p>
      </section>
    </div>`;
    canvas = root.querySelector("canvas");
    dot = root.querySelector(".dot");
    status = root.querySelector(".status");
    marksHost = document.createElement('div');
    marksHost.style.cssText = 'all:initial!important;position:absolute!important;top:0!important;left:0!important;overflow:clip!important;contain:strict!important;pointer-events:none!important;z-index:2147483646!important;';
    const marksRoot = marksHost.attachShadow({ mode: 'closed' });
    svg = element('svg', { 'aria-hidden': 'true', xmlns: NS });
    svg.style.cssText = 'display:block;overflow:hidden;pointer-events:none;';
    const defs = element('defs');
    gradient = element('linearGradient', { id: 'edge-fade', gradientUnits: 'userSpaceOnUse', x1: 0, x2: 0, y1: 0, y2: 72 });
    gradient.append(element('stop', { offset: 0, 'stop-color': 'white', 'stop-opacity': 0 }), element('stop', { offset: 1, 'stop-color': 'white', 'stop-opacity': 1 }));
    defs.append(gradient);
    paths = element('g');
    svg.append(defs, paths);
    marksRoot.append(svg);
    refreshSettings();
    const panel = root.querySelector('.panel');
    const toggle = root.querySelector('.settings-toggle');
    const controls = root.querySelector('.settings-ui');
    closeSettings = () => {
      if (panel.hidden) return;
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      controlBounds = controlBounds.slice(0, 1);
      if (panel.contains(root.activeElement)) root.activeElement.blur();
      persistSettings();
    };
    // Controls remain hit-testable even when the drawing overlay passes through.
    for (const type of ['pointerdown','pointerup','mousedown','mouseup','click','dblclick','contextmenu']) controls.addEventListener(type, event => event.stopPropagation());
    positionControls = () => {
      if (gearPosition) {
        gearPosition = { x: Math.max(8, Math.min(innerWidth - 46, gearPosition.x)), y: Math.max(8, Math.min(innerHeight - 46, gearPosition.y)) };
        controls.style.left = gearPosition.x + 'px'; controls.style.top = gearPosition.y + 'px'; controls.style.right = 'auto';
      }
      if (!panel.hidden) {
        const anchor = toggle.getBoundingClientRect();
        const margin = 8, gap = 10;
        panel.style.maxWidth = Math.max(0, innerWidth - margin * 2) + 'px';
        panel.style.maxHeight = Math.max(0, innerHeight - margin * 2) + 'px';
        const box = panel.getBoundingClientRect();
        const clamp = (value, size, limit) => Math.max(margin, Math.min(limit - size - margin, value));
        const below = innerHeight - margin - anchor.bottom - gap;
        const above = anchor.top - gap - margin;
        let x = clamp(anchor.right - box.width, box.width, innerWidth), y;
        if (below >= box.height) y = anchor.bottom + gap;
        else if (above >= box.height) y = anchor.top - gap - box.height;
        else if (innerWidth - margin - anchor.right - gap >= box.width) {
          x = anchor.right + gap; y = clamp(anchor.top, box.height, innerHeight);
        } else if (anchor.left - gap - margin >= box.width) {
          x = anchor.left - gap - box.width; y = clamp(anchor.top, box.height, innerHeight);
        } else {
          // Tight windows: use the larger vertical space, with internal scrolling.
          const room = Math.max(0, below, above);
          panel.style.maxHeight = room + 'px';
          y = below >= above ? anchor.bottom + gap : margin;
        }
        panel.style.right = 'auto'; panel.style.left = x + 'px'; panel.style.top = y + 'px';
      }
      controlBounds = [toggle.getBoundingClientRect(), ...(panel.hidden ? [] : [panel.getBoundingClientRect()])];
    };
    toggle.addEventListener('transitionend', positionControls);
    root.querySelector('.compact-actions').addEventListener('animationend', positionControls);
    let drag = null, suppressClick = false;
    toggle.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      clearTimeout(introTimer); root.querySelector('.compact-actions').classList.remove('intro');
      const rect = toggle.getBoundingClientRect();
      drag = { id: event.pointerId, mouseX: event.clientX, mouseY: event.clientY, x: rect.left, y: rect.top, moved: false };
      suppressClick = false; gearDragging = true;
      toggle.setPointerCapture(event.pointerId);
    });
    toggle.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.mouseX, dy = event.clientY - drag.mouseY;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true; toggle.classList.add('dragging');
      gearPosition = { x: drag.x + dx, y: drag.y + dy }; positionControls();
    });
    function endDrag(event) {
      if (!drag || event.pointerId !== drag.id) return;
      suppressClick = drag.moved;
      if (toggle.hasPointerCapture(event.pointerId)) toggle.releasePointerCapture(event.pointerId);
      toggle.classList.remove('dragging'); drag = null; gearDragging = false;
      if (suppressClick) browser.storage.local.set({ laserGearPosition: gearPosition }).catch(() => {});
    }
    toggle.addEventListener('pointerup', endDrag);
    toggle.addEventListener('pointercancel', endDrag);
    introTimer = setTimeout(() => { root.querySelector('.compact-actions').classList.remove('intro'); positionControls(); }, 3500);
    toggle.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      clearTimeout(introTimer);
      root.querySelector('.compact-actions').classList.remove('intro');
      panel.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
      positionControls();
    });
    let settingsDirty = false;
    async function save() {
      if (!settingsDirty) return;
      settingsDirty = false;
      try {
        await browser.storage.local.set({ laserSettings: { ...settings } });
        root.querySelector('.save-state').textContent = '';
      } catch { settingsDirty = true; root.querySelector('.save-state').textContent = 'Could not save settings. Please try again.'; }
    }
    persistSettings = save;
    panel.addEventListener('change', save);
    panel.addEventListener('input', event => {
      const input = event.target;
      if (!input.name) return;
      const value = { ...settings, [input.name]: input.value };
      settings = normalize(value);
      settingsDirty = true;
      refreshSettings();
    });
    root.querySelector('.palette').addEventListener('click', event => {
      const button = event.target.closest('[data-colour]');
      if (button) { settings.colour = button.dataset.colour; settingsDirty = true; refreshSettings(); save(); }
    });
    root.querySelector('.width-options').addEventListener('click', event => {
      const button = event.target.closest('[data-width]');
      if (button) { settings.thickness = Number(button.dataset.width); settingsDirty = true; refreshSettings(); save(); }
    });
    if (document.fullscreenElement) host.style.setProperty('position', 'fixed', 'important');
    (document.fullscreenElement || document.documentElement).append(marksHost, host);
    if (gearPosition) root.querySelector('.compact-actions').classList.remove('intro');
    try { host.showPopover(); } catch {}
    positionControls();
    resize();
    if (document.body) pageObserver.observe(document.body);
    attachActiveEvents();
    // Wait for a fresh in-page mouse movement instead of restoring a stale pointer.
    dot.style.opacity = "0";
    setBypass(paused, false);
    requestRender();
    if (report) notify();
  }
  function leavePage(event) {
    if (!enabled || event.relatedTarget) return;
    dot.style.transition = 'opacity 160ms linear';
    dot.style.opacity = '0';
    canvas.style.cursor = 'auto';
    finish();
    lastPoint = null;
  }
  const pageObserver = new ResizeObserver(() => { if (enabled) resize(); });
  function attachActiveEvents() {
    activeEvents = new AbortController();
    const options = { capture: true, signal: activeEvents.signal };
    window.addEventListener("pointermove", move, options);
    window.addEventListener("pointerdown", down, options);
    window.addEventListener("pointerup", up, options);
    window.addEventListener("pointercancel", finish, options);
    window.addEventListener("blur", () => { spaceOwned = false; finish(); if (enabled) dot.style.opacity = "0"; }, options);
    window.addEventListener('pointerout', leavePage, options);
    document.addEventListener('pointerleave', leavePage, options);
    window.addEventListener('mouseout', leavePage, options);
    for (const type of ["click", "dblclick", "mousedown", "mouseup", "dragstart", "contextmenu"]) window.addEventListener(type, block, options);
    window.addEventListener("scroll", () => {
      if (enabled && strokes.length) requestRender();
    }, { passive: true, signal: activeEvents.signal });
    window.addEventListener("resize", () => { if (enabled) { resize(); positionControls(); requestRender(); } }, options);
    document.addEventListener("fullscreenchange", () => {
      if (enabled) {
        host.style.setProperty('position', 'fixed', 'important');
        (document.fullscreenElement || document.documentElement).append(marksHost, host);
        try { host.showPopover(); } catch {}
        positionControls();
        resize();
        requestRender();
      }
    }, options);
  }
  const options = { capture: true };
  let spaceOwned = false;
  function isSpace(event) {
    return event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar' || event.keyCode === 32;
  }
  function textEntry(event) {
    let target = event.composedPath()[0];
    // A closed shadow root retargets keyboard events to its host.
    if (target === host) target = canvas.getRootNode().activeElement || target;
    if (!(target instanceof Element)) return false;
    return target.isContentEditable || target.tagName === 'TEXTAREA' ||
      (target.tagName === 'INPUT' && ['text', 'search', 'url', 'tel', 'email', 'password'].includes(target.type));
  }
  function consumeSpace(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  window.addEventListener('keydown', event => {
    if (isSpace(event) && (spaceOwned || (enabled && !textEntry(event)))) {
      const firstPress = !spaceOwned && !event.repeat;
      spaceOwned = true;
      consumeSpace(event);
      if (firstPress && enabled) setBypass(!bypass);
    }
    if (enabled && event.key === 'Escape') { commandVersion++; block(event); setEnabled(false); }
  }, options);
  window.addEventListener('keypress', event => {
    if (isSpace(event) && spaceOwned) consumeSpace(event);
  }, options);
  window.addEventListener('keyup', event => {
    if (isSpace(event) && spaceOwned) {
      consumeSpace(event);
      spaceOwned = false;
    }
  }, options);
  window.addEventListener('pagehide', () => {
    commandVersion++;
    if (enabled) setEnabled(false, false);
  }, options);
  let commandVersion = 0;
  async function restoreMode() {
    const version = commandVersion;
    try {
      await loaded;
      const response = await browser.runtime.sendMessage({ type: 'laser:ready' });
      if (version !== commandVersion || !response?.enabled) return;
      if (!enabled) setEnabled(true, false, response.paused === true);
      else setBypass(response.paused === true, false);
    } catch {}
  }
  window.addEventListener('pageshow', restoreMode, options);
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'laser:status') return Promise.resolve({ enabled, paused: bypass });
    if (message.type === 'laser:toggle' || message.type === 'laser:set') {
      commandVersion++;
      return loaded.then(() => {
        const value = message.type === 'laser:toggle' ? !enabled : message.enabled === true;
        if (value !== enabled) setEnabled(value, message.type === 'laser:toggle', message.paused === true);
        else if (value && message.type === 'laser:set') setBypass(message.paused === true, false);
        return { enabled, paused: bypass };
      });
    }
    if (message.type === 'laser:navigated') {
      finish();
      clearMarks();
      idleSince = null;
      requestRender();
    }
  });
  restoreMode();
})();

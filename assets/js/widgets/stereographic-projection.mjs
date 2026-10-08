import { NORTH, GRAPH_VERTICES, GRAPH_EDGES, GRAPH_FACES, INITIAL_POINT, toSphere, nearestGraphPoint, nearestVertex, faceAt, faceTriangles } from '../lib/stereographic-math.mjs';
import { prepareInteractive, observeSize } from '../lib/interactive-view.mjs';
import { createPageEnvironment } from '../lib/page-environment.mjs';
import { bindPanelHistory } from '../lib/panel-history.mjs';
import { initializeWidgetPanels } from '../lib/widget-panels.mjs';

const GREEN = '#285b46', AMBER = '#a85928', INK = '#282e29';
const initial = { point: INITIAL_POINT, eye: [4, -6, 4.2], target: [0, 0, .7] };

export function mount(root = globalThis.document) {
  const environment = createPageEnvironment(root);
  const { document, window, requestAnimationFrame, cancelAnimationFrame } = environment;
  for (const widget of document.querySelectorAll('[data-widget="stereographic-projection"]')) {
    environment.add(prepareInteractive(widget, async ({ view, controls, signal }) => {
      const [THREE, { OrbitControls }] = await Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')]);
      if (signal.aborted) return () => {};
      const events = new AbortController();
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#f7f8f3');
      const camera = new THREE.PerspectiveCamera(36, 1, .05, 1e6);
      camera.up.set(0, 0, 1);
      camera.position.fromArray(initial.eye);
      let renderer, orbit, stopResize = () => {}, frame, disposed = false;
      const textures = new Set();
      const labels = [];
      let pointControl, planePoint, stopPanels = () => {};
      function render() {
        if (disposed) return;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          camera.updateMatrixWorld();
          for (const sprite of labels) {
            const depth = -sprite.position.clone().applyMatrix4(camera.matrixWorldInverse).z;
            const height = sprite.userData.fontPixels * 128 / 74 * 2 * Math.tan(camera.fov * Math.PI / 360) * depth / view.clientHeight;
            sprite.scale.set(height * 3, height, 1);
          }
          renderer.render(scene, camera);
          if (pointControl) {
            const p = planePoint.position.clone().project(camera);
            pointControl.hidden = p.z < -1 || p.z > 1 || Math.abs(p.x) > 1 || Math.abs(p.y) > 1;
            pointControl.style.left = `${(p.x+1)*view.clientWidth/2}px`;
            pointControl.style.top = `${(1-p.y)*view.clientHeight/2}px`;
          }
        });
      }
      function dispose() {
        if (disposed) return;
        disposed = true;
        cancelAnimationFrame(frame); stopResize(); stopPanels(); events.abort(); orbit?.dispose();
        const geometries = new Set(), materials = new Set();
        scene.traverse(object => {
          if (object.geometry) geometries.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).filter(Boolean).forEach(material => materials.add(material));
        });
        geometries.forEach(geometry => geometry.dispose());
        materials.forEach(material => material.dispose());
        textures.forEach(texture => texture.dispose());
        renderer?.dispose(); renderer?.forceContextLoss();
      }
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        const canvas = renderer.domElement;
        canvas.setAttribute('role', 'img'); canvas.tabIndex = 0;
        canvas.setAttribute('aria-label', 'Rotate the projection with arrow keys. Orange Q is on the plane; orange P is its sphere image.');
        view.append(canvas);
        pointControl = document.createElement('button');
        pointControl.type = 'button'; pointControl.className = 'sp-point-control';
        pointControl.setAttribute('aria-label', 'Move point Q with arrow keys');
        pointControl.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown');
        view.append(pointControl);

        function line(points, color, opacity = 1) {
          const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
          const object = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
          scene.add(object); return object;
        }
        function dot(position, color, radius = .042) {
          const object = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 10), new THREE.MeshBasicMaterial({ color }));
          object.position.fromArray(position); scene.add(object); return object;
        }
        function label(value, color = INK, width = .45) {
          const drawing = document.createElement('canvas'); drawing.width = 384; drawing.height = 128;
          const ctx = drawing.getContext('2d');
          ctx.font = '500 74px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.strokeStyle = '#f7f8f3'; ctx.lineWidth = 12; ctx.lineJoin = 'round';
          ctx.strokeText(value, 192, 67); ctx.fillStyle = color; ctx.fillText(value, 192, 67);
          const texture = new THREE.CanvasTexture(drawing); textures.add(texture);
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, depthWrite: false }));
          sprite.scale.set(width * 3, width, 1); sprite.renderOrder = 5;
          sprite.userData.fontPixels = value === 'Plane' ? 12 : 16;
          labels.push(sprite); scene.add(sprite); return sprite;
        }
        const plane = new THREE.Mesh(new THREE.CircleGeometry(3, 96), new THREE.MeshBasicMaterial({ color: '#e9ede2', side: THREE.DoubleSide, transparent: true, opacity: .35, depthWrite: false }));
        plane.renderOrder = -3; scene.add(plane);
        for (let i = -2; i <= 2; i++) {
          const extent = Math.sqrt(9 - i * i);
          line([[-extent, i, 0], [extent, i, 0]], '#bfc8b5', .42);
          line([[i, -extent, 0], [i, extent, 0]], '#bfc8b5', .42);
        }
        const planeLabel = label('Plane', '#686e66', .22); planeLabel.position.set(1.85, -1.8, .02);
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshBasicMaterial({ color: '#91b6a0', transparent: true, opacity: .12, depthWrite: false }));
        sphere.position.z = 1; sphere.renderOrder = -2; scene.add(sphere);
        // Sparse meridians and an equator establish depth without a busy mesh.
        for (let a = 0; a < 3; a++) {
          const angle = a * Math.PI / 3;
          line(Array.from({ length: 129 }, (_, i) => {
            const t = i * Math.PI / 64;
            return [Math.sin(t) * Math.cos(angle), Math.sin(t) * Math.sin(angle), 1 + Math.cos(t)];
          }), '#809b89', .32);
        }
        line(Array.from({ length: 129 }, (_, i) => [Math.cos(i * Math.PI / 64), Math.sin(i * Math.PI / 64), 1]), '#809b89', .4);

        const flatGraph = new THREE.Group(), roundGraph = new THREE.Group();
        scene.add(flatGraph, roundGraph);
        const flatFaces = [], roundFaces = [];
        GRAPH_FACES.forEach((_, face) => {
          for (const [spherical, group, faces] of [[false, flatGraph, flatFaces], [true, roundGraph, roundFaces]]) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(faceTriangles(face, spherical), 3));
            const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: GREEN, side: THREE.DoubleSide, transparent: true, opacity: .09, depthWrite: false }));
            mesh.renderOrder = -1; group.add(mesh); faces.push(mesh);
          }
        });
        const flatEdges = [], roundEdges = [];
        GRAPH_EDGES.forEach(([i, j], edge) => {
          const a = new THREE.Vector3(...GRAPH_VERTICES[i], .005), b = new THREE.Vector3(...GRAPH_VERTICES[j], .005);
          const flat = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, .016, 8, false), new THREE.MeshBasicMaterial({ color: GREEN }));
          flat.userData.edge = edge; flatEdges.push(flat); flatGraph.add(flat);
          class ImageCurve extends THREE.Curve {
            getPoint(t, target = new THREE.Vector3()) {
              // Interpolate in the PLANE before projecting; a spherical chord is wrong.
              const [a, b] = [GRAPH_VERTICES[i], GRAPH_VERTICES[j]];
              const p = toSphere(a.map((x, k) => x + (b[k] - x) * t));
              return target.fromArray(p);
            }
          }
          const round = new THREE.Mesh(new THREE.TubeGeometry(new ImageCurve(), 96, .017, 8, false), new THREE.MeshBasicMaterial({ color: GREEN }));
          round.userData.edge = edge; roundEdges.push(round); roundGraph.add(round);
        });
        const flatVertices = [], roundVertices = [];
        GRAPH_VERTICES.forEach(p => {
          for (const [position, group, vertices] of [[ [...p,0], flatGraph, flatVertices ], [toSphere(p), roundGraph, roundVertices]]) {
            const vertex = dot(position, GREEN, .035);
            group.add(vertex); vertices.push(vertex);
          }
        });
        dot(NORTH, INK, .041);
        const northLabel = label('N = ∞', INK); northLabel.position.set(0, 0, 2.2);
        planePoint = dot([0, 0, 0], AMBER, .058);
        const spherePoint = dot([0, 0, 0], AMBER, .055);
        const qLabel = label('Q', AMBER, .24), pLabel = label('P', AMBER, .24);
        const touchLabel = label('P = Q', AMBER, .24); touchLabel.position.set(.25, 0, -.15);
        const ray = line([NORTH, [0, 0, 0]], AMBER);
        ray.material.depthTest = false; ray.material.transparent = true; ray.material.opacity = .82; ray.renderOrder = 2;
        orbit = new OrbitControls(camera, canvas);
        orbit.target.fromArray(initial.target); orbit.enablePan = false; orbit.enableZoom = false;
        orbit.enableDamping = false; orbit.minDistance = 3.5; orbit.maxDistance = 15;
        orbit.update();
        let point = [...initial.point];
        const highlight = controls.querySelector('[data-highlight]');
        const showPlane = controls.querySelector('[data-show-plane]'), showSphere = controls.querySelector('[data-show-sphere]');
        highlight.value = 'faces'; showPlane.checked = showSphere.checked = true;
        const read = () => ({ point, eye: camera.position.toArray(), target: orbit.target.toArray() });
        function update() {
          const image = toSphere(point), face = faceAt(point), edge = nearestGraphPoint(point).edge, vertex = nearestVertex(point);
          const mode = highlight.value;
          flatGraph.visible = showPlane.checked; roundGraph.visible = showSphere.checked;
          for (const edges of [flatEdges, roundEdges]) edges.forEach((object, i) => object.material.color.set(mode === 'edges' && i === edge ? AMBER : GREEN));
          for (const vertices of [flatVertices, roundVertices]) vertices.forEach((object, i) => {
            object.material.color.set(mode === 'vertices' && i === vertex ? AMBER : GREEN);
            object.scale.setScalar(mode === 'vertices' ? (i === vertex ? 2.3 : 1.7) : 1);
          });
          for (const faces of [flatFaces, roundFaces]) faces.forEach((object, i) => {
            object.visible = mode === 'faces';
            object.material.color.set(i === face ? AMBER : GREEN);
            object.material.opacity = i === face ? .38 : .06;
          });
          planePoint.position.set(...point, 0); spherePoint.position.fromArray(image);
          qLabel.position.copy(planePoint.position).add(new THREE.Vector3(.17, 0, -.12));
          pLabel.position.copy(spherePoint.position).add(image[2] > 1.6 ? new THREE.Vector3(.32, 0, -.2) : new THREE.Vector3(.2, 0, .17));
          touchLabel.visible = Math.hypot(...point) < 1e-8;
          pLabel.visible = qLabel.visible = !touchLabel.visible;
          ray.geometry.setFromPoints([new THREE.Vector3(...NORTH), planePoint.position]);
          const text = mode === 'faces' ? (face === 5 ? 'The outside face maps to the face containing N.' : 'Matching faces are highlighted.')
            : mode === 'vertices' ? 'Matching vertices are highlighted.'
            : mode === 'edges' ? 'Matching edges are highlighted.' : 'N, P, and Q lie on one straight line.';
          controls.querySelector('[data-feedback]').textContent = showPlane.checked || showSphere.checked ? text : 'Both graphs are hidden. P still follows Q.';
          pointControl.setAttribute('aria-label', `Move point Q with arrow keys. Q = (${point.map(x=>Number(x.toPrecision(3))).join(', ')}).`);
          render();
        }
        function restore(state) {
          point = [...state.point]; camera.position.fromArray(state.eye);
          orbit.target.fromArray(state.target); orbit.update(); update();
        }
        const history = bindPanelHistory(controls, { read, restore, reset: () => restore(initial), signal: events.signal });
        for (const setting of [highlight, showPlane, showSphere]) setting.addEventListener('change', update, { signal: events.signal });
        stopPanels = initializeWidgetPanels(controls, document);

        let beforeOrbit;
        orbit.addEventListener('start', () => { beforeOrbit = history.capture(); });
        orbit.addEventListener('end', () => { if (beforeOrbit) history.commit(beforeOrbit); beforeOrbit = null; });
        orbit.addEventListener('change', render);
        function cameraAction(action) {
          const target = orbit.target;
          const offset = camera.position.clone().sub(target);
          if (action === 'side') camera.position.set(0, -7.8, 1.4);
          else if (action === 'above') camera.position.set(.01, -.01, 9);
          else {
            let distance = offset.length();
            let azimuth = Math.atan2(offset.y, offset.x), elevation = Math.asin(offset.z / distance);
            const step = Math.PI / 12;
            if (action === 'left') azimuth += step;
            if (action === 'right') azimuth -= step;
            if (action === 'up') elevation = Math.min(Math.PI / 2 - .001, elevation + step);
            if (action === 'down') elevation = Math.max(-1.4, elevation - step);
            if (action === 'in') distance = Math.max(3.5, distance * .8);
            if (action === 'out') distance = Math.min(15, distance / .8);
            camera.position.set(
              target.x + distance * Math.cos(elevation) * Math.cos(azimuth),
              target.y + distance * Math.cos(elevation) * Math.sin(azimuth),
              target.z + distance * Math.sin(elevation)
            );
          }
          orbit.update(); render();
        }
        controls.querySelectorAll('[data-camera]').forEach(button => button.addEventListener('click', () => history.change(() => cameraAction(button.dataset.camera)), { signal: events.signal }));
        let beforeKey;
        const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'in', '=': 'in', '-': 'out' };
        canvas.addEventListener('keydown', event => {
          if (!keys[event.key]) return;
          event.preventDefault(); beforeKey ??= history.capture(); cameraAction(keys[event.key]);
        }, { signal: events.signal });
        const finishKey = () => { if (beforeKey) history.commit(beforeKey); beforeKey = null; };
        canvas.addEventListener('keyup', finishKey, { signal: events.signal }); canvas.addEventListener('blur', finishKey, { signal: events.signal });

        // Drag Q freely on the tangent plane. No graph snapping or parameter sliders.
        const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
        const ground = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        let drag = null;
        function pick(event) {
          const rect = canvas.getBoundingClientRect();
          pointer.set(2 * (event.clientX - rect.left) / rect.width - 1, 1 - 2 * (event.clientY - rect.top) / rect.height);
          raycaster.setFromCamera(pointer, camera);
        }
        function screenDistance(position, event) {
          const rect = canvas.getBoundingClientRect(), projected = position.clone().project(camera);
          return Math.hypot(rect.left + (projected.x + 1) * rect.width / 2 - event.clientX, rect.top + (1 - projected.y) * rect.height / 2 - event.clientY);
        }
        view.addEventListener('pointerdown', event => {
          if (event.button !== 0) return;
          if (event.target === pointControl || screenDistance(planePoint.position, event) <= (event.pointerType === 'touch' ? 22 : 14)) {
            drag = { pointer: event.pointerId, before: history.capture() };
            orbit.enabled = false; beforeOrbit = null; canvas.setPointerCapture(event.pointerId);
            pointControl.focus({ preventScroll: true });
            event.stopImmediatePropagation(); event.preventDefault();
          }
        }, { capture: true, signal: events.signal });
        view.addEventListener('pointermove', event => {
          if (!drag || drag.pointer !== event.pointerId) return;
          pick(event);
          const hit = raycaster.ray.intersectPlane(ground, new THREE.Vector3());
          if (hit && Math.hypot(hit.x, hit.y) < 1e6) { point = [hit.x, hit.y]; update(); }
          event.stopImmediatePropagation(); event.preventDefault();
        }, { capture: true, signal: events.signal });
        function finishDrag(event) {
          if (!drag || event.pointerId !== drag.pointer) return;
          const before = drag.before;
          drag = null; orbit.enabled = true;
          if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
          if (event.type === 'pointercancel') history.cancel(before); else history.commit(before);
          event.stopImmediatePropagation();
        }
        view.addEventListener('pointerup', finishDrag, { capture: true, signal: events.signal });
        view.addEventListener('pointercancel', finishDrag, { capture: true, signal: events.signal });
        let beforePointKey;
        pointControl.addEventListener('keydown', event => {
          const delta = { ArrowLeft: [-.1,0], ArrowRight: [.1,0], ArrowUp: [0,.1], ArrowDown: [0,-.1] }[event.key];
          if (!delta) return;
          event.preventDefault(); beforePointKey ??= history.capture();
          point = point.map((x,i)=>x+delta[i]); update();
        }, { signal: events.signal });
        const finishPointKey = () => { if (beforePointKey) history.commit(beforePointKey); beforePointKey = null; };
        pointControl.addEventListener('keyup', finishPointKey, { signal: events.signal });
        pointControl.addEventListener('blur', finishPointKey, { signal: events.signal });

        function resize() {
          if (!view.clientWidth || !view.clientHeight) return;
          camera.aspect = view.clientWidth / view.clientHeight;
          // Keep the complete graph framed when a tall phone viewport gets narrower.
          camera.fov = 2 * Math.atan(Math.tan(Math.PI / 10) / Math.min(1, camera.aspect)) * 180 / Math.PI;
          camera.updateProjectionMatrix();
          renderer.setSize(view.clientWidth, view.clientHeight, false); render();
        }
        stopResize = observeSize(view, resize); resize(); update();
      } catch (error) { dispose(); throw error; }
      return dispose;
    }));
  }
  return environment.dispose;
}

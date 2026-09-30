import { prepareInteractive, observeSize } from '../lib/interactive-view.mjs';
import { sphereSlice, moveCamera } from '../lib/graph-math.mjs';

for (const widget of document.querySelectorAll('[data-widget="sphere-slice"]')) {
  prepareInteractive(widget, async ({ view, controls }) => {
    // The import map pins both imports to the same release; no 3D code loads earlier.
    const [THREE, { OrbitControls }] = await Promise.all([
      import('three'), import('three/addons/controls/OrbitControls.js')
    ]);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f7f8f3');
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.up.set(0, 0, 1);
    camera.position.set(3, 4, 2.7);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.setAttribute('aria-label', 'Unit sphere intersected by a horizontal plane. Use the controls below to explore.');
    renderer.domElement.setAttribute('role', 'img');
    view.append(renderer.domElement);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enablePan = false;
    orbit.enableZoom = false; // Let the page scroll normally; provide explicit zoom buttons.
    orbit.enableDamping = false;
    orbit.update();
    orbit.saveState();
    const listeners = new AbortController();
    let stopResize = () => {};
    let frame;
    let disposed = false;
    function render() {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => renderer.render(scene, camera));
    }
    function dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      stopResize();
      listeners.abort();
      orbit.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
    }
    try {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 20),
        new THREE.MeshBasicMaterial({ color: '#8bb59d', transparent: true, opacity: 0.18, depthWrite: false })
      );
      scene.add(sphere);
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(sphere.geometry),
        new THREE.LineBasicMaterial({ color: '#285b46', transparent: true, opacity: 0.24 })
      );
      scene.add(wire);
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 3),
        new THREE.MeshBasicMaterial({ color: '#b5cbd4', transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })
      );
      scene.add(plane);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.018, 8, 96),
        new THREE.MeshBasicMaterial({ color: '#a85928' })
      );
      scene.add(ring);
      const tangentPoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 12, 8),
        new THREE.MeshBasicMaterial({ color: '#a85928' })
      );
      scene.add(tangentPoint);
      scene.add(new THREE.AxesHelper(1.6));
      const slider = controls.querySelector('input');
      const feedback = controls.querySelector('[data-feedback]');
      function updateSlice() {
        const height = Number(slider.value);
        const slice = sphereSlice(height);
        plane.position.z = ring.position.z = tangentPoint.position.z = height;
        ring.visible = slice.kind === 'circle';
        ring.scale.setScalar(slice.radius);
        tangentPoint.visible = slice.kind === 'point';
        controls.querySelector('[data-height]').textContent = height;
        const message = slice.kind === 'empty'
          ? `At height ${height}, the plane does not intersect the sphere.`
          : slice.kind === 'point'
            ? `At height ${height}, the plane touches the sphere at one point. The cross-section has zero radius.`
            : `At height ${height}, the cross-section is a circle of radius ${slice.radius.toFixed(3)} and area ${(Math.PI * slice.radius ** 2).toFixed(3)}.`;
        feedback.textContent = message;
        renderer.domElement.setAttribute('aria-label', message);
        render();
      }
      slider.value = slider.defaultValue;
      slider.addEventListener('input', updateSlice, { signal: listeners.signal });
      controls.querySelector('[data-reset]').addEventListener('click', () => {
        slider.value = slider.defaultValue;
        orbit.reset();
        updateSlice();
      }, { signal: listeners.signal });
      for (const button of controls.querySelectorAll('[data-camera]')) {
        button.addEventListener('click', () => {
          const eye = moveCamera(camera.position, button.dataset.camera, 2.3, 10);
          camera.position.set(eye.x, eye.y, eye.z);
          orbit.update();
          render();
        }, { signal: listeners.signal });
      }
      orbit.addEventListener('change', render);
      function resize() {
        camera.aspect = view.clientWidth / view.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(view.clientWidth, view.clientHeight, false);
        render();
      }
      stopResize = observeSize(view, resize);
      resize();
      updateSlice();
    } catch (error) {
      dispose();
      throw error;
    }
    return dispose;
  });
}

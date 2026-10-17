export function mountScrollHeader(environment = globalThis) {
  const { document } = environment;
  const header = document.querySelector('.topbar');
  if (!header) return () => {};
  let previous = Math.max(0, environment.scrollY), travel = 0, direction = 0, frame = 0;
  function show() { header.classList.remove('topbar-hidden'); }
  function reset() { previous = Math.max(0, environment.scrollY); travel = direction = 0; show(); }
  function update() {
    frame = 0;
    const maximum = Math.max(0, document.documentElement.scrollHeight - environment.innerHeight);
    const y = Math.max(0, Math.min(maximum, environment.scrollY));
    const delta = y - previous;
    previous = y;
    if (y < header.offsetHeight + 24 || header.contains(document.activeElement) || document.documentElement.classList.contains('sidebar-open')) {
      travel = direction = 0; show(); return;
    }
    if (!delta) return;
    const nextDirection = Math.sign(delta);
    travel = nextDirection === direction ? travel + Math.abs(delta) : Math.abs(delta);
    direction = nextDirection;
    if (travel >= (direction > 0 ? 12 : 8)) header.classList.toggle('topbar-hidden', direction > 0);
  }
  function scroll() { if (!frame) frame = environment.requestAnimationFrame(update); }
  environment.addEventListener('scroll', scroll, { passive: true });
  header.addEventListener('focusin', reset);
  document.addEventListener('site:page', reset);
  return () => {
    environment.removeEventListener('scroll', scroll);
    header.removeEventListener('focusin', reset);
    document.removeEventListener('site:page', reset);
    if (frame) environment.cancelAnimationFrame(frame);
    show();
  };
}

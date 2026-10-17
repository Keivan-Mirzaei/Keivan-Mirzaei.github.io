// One continuous rail per track, aligned to the rendered node centres.
// Recompute only when layout changes, including font loading and resizing.
export function alignCoursePath(root) {
  let frame = null;
  function measure() {
    frame = null;
    const modules = [...root.querySelectorAll('.course-outline-module')];
    if (!modules.length) return;
    const bounds = root.getBoundingClientRect();
    const first = modules[0].getBoundingClientRect();
    const last = modules.at(-1).getBoundingClientRect();
    const current = (modules.find(module => module.hasAttribute('data-current')) || modules[0]).getBoundingClientRect();
    root.style.setProperty('--spine-x', `${first.left - bounds.left + .5}px`);
    root.style.setProperty('--spine-start', `${first.top - bounds.top + 19.5}px`);
    root.style.setProperty('--spine-length', `${last.top - first.top}px`);
    root.style.setProperty('--spine-spot', `${current.top - first.top}px`);
    modules.forEach(module => {
      const track = module.querySelector('.topic-chain');
      const nodes = [...track.querySelectorAll('.topic-chain-dot')];
      if (!nodes.length) return;
      const rect = track.getBoundingClientRect();
      const centre = node => {
        const box = node.getBoundingClientRect();
        return { x: box.left + box.width / 2 - rect.left + track.scrollLeft, y: box.top + box.height / 2 - rect.top };
      };
      const selected = nodes.find(node => node.closest('[aria-current]'));
      track.style.setProperty('--rail-width', `${centre(nodes.at(-1)).x}px`);
      track.style.setProperty('--rail-y', `${centre(nodes[0]).y}px`);
      track.style.setProperty('--rail-spot', `${centre(selected || nodes[0]).x}px`);
    });
  }
  function schedule() { if (frame === null) frame = requestAnimationFrame(measure); }
  const observer = new ResizeObserver(schedule);
  observer.observe(root);
  root.querySelectorAll('.topic-chain').forEach(track => observer.observe(track));
  document.fonts?.ready.then(schedule);
  schedule();
}

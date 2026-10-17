// Measure each continuous rail from the rendered node centres, including scroll.
function measureTrack(track, joined) {
  const nodes = [...track.querySelectorAll('.topic-chain-dot')];
  if (!nodes.length) return;
  const rect = track.getBoundingClientRect();
  const centre = node => {
    const box = node.getBoundingClientRect();
    return { x: box.left + box.width / 2 - rect.left + track.scrollLeft, y: box.top + box.height / 2 - rect.top };
  };
  const start = joined ? 0 : centre(nodes[0]).x;
  const selected = nodes.find(node => node.closest('[aria-current]'));
  track.style.setProperty('--rail-start', `${start}px`);
  track.style.setProperty('--rail-width', `${centre(nodes.at(-1)).x - start}px`);
  track.style.setProperty('--rail-y', `${centre(nodes[0]).y}px`);
  track.style.setProperty('--rail-spot', `${centre(selected || nodes[0]).x - start}px`);
  return centre(nodes[0]).y;
}
function watchLayout(elements, measure) {
  let frame = null;
  function schedule() {
    if (frame === null) frame = requestAnimationFrame(() => { frame = null; measure(); });
  }
  const observer = new ResizeObserver(schedule);
  elements.forEach(element => observer.observe(element));
  document.fonts?.ready.then(schedule);
  schedule();
}
export function alignCoursePath(root) {
  const tracks = [...root.querySelectorAll('.topic-chain')];
  tracks.forEach(track => track.classList.add('path-track'));
  watchLayout([root, ...tracks], () => {
    const modules = [...root.querySelectorAll('.course-outline-module')];
    if (!modules.length) return;
    const bounds = root.getBoundingClientRect();
    const first = modules[0].getBoundingClientRect();
    const last = modules.at(-1).getBoundingClientRect();
    const current = (modules.find(module => module.hasAttribute('data-current')) || modules[0]).getBoundingClientRect();
    root.style.setProperty('--spine-x', `${first.left - bounds.left + .5}px`);
    root.style.setProperty('--spine-start', `${first.top - bounds.top + 19.5}px`);
    const railYs = tracks.map(track => measureTrack(track, true));
    const end = tracks.length && railYs.at(-1) !== undefined
      ? tracks.at(-1).getBoundingClientRect().top + railYs.at(-1)
      : last.top + 19.5;
    root.style.setProperty('--spine-length', `${end - first.top - 19.5 + 32}px`);
    root.style.setProperty('--spine-spot', `${current.top - first.top}px`);
  });
}
export function alignTopicTrack(track) {
  track.classList.add('path-track');
  watchLayout([track], () => measureTrack(track, false));
}

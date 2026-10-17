import { alignCoursePath, alignTopicTrack } from './lib/path-rails.mjs';
import { enableProblemNumberStrip } from './lib/problem-number-strip.mjs';

// Remember the reading position so the course path can identify its current stop.
const outline = document.querySelector('.course-outline');
try {
  if (outline) {
    const lastTopic = localStorage.getItem('learning:last-topic');
    const links = [...outline.querySelectorAll('.topic-chain-link')];
    const link = links.find(link => new URL(link.href).pathname === lastTopic) || links[0];
    if (link) {
      link.setAttribute('aria-current', 'true');
      link.closest('.course-outline-module').dataset.current = 'true';
    }
  } else if (document.querySelector('.topic-wrap')) localStorage.setItem('learning:last-topic', location.pathname);
} catch {}

for (const chain of document.querySelectorAll('.topic-chain')) {
  const current = chain.querySelector('[aria-current]');
  if (chain.closest('#reading-dock')) alignTopicTrack(chain);
  const links = [...chain.querySelectorAll('.topic-chain-link')];
  const activeIndex = links.indexOf(current);
  if (activeIndex >= 0) links.forEach((link, index) => {
    const distance = Math.abs(index - activeIndex);
    link.style.setProperty('--topic-focus', .28 + .72 * Math.exp(-.26 * distance * distance));
  });
  const reveal = enableProblemNumberStrip(chain, () => current);
  if (current) chain.scrollLeft = current.offsetLeft - (chain.clientWidth - current.offsetWidth) / 2;
  reveal();
  const dialog = chain.closest('dialog');
  if (dialog) new MutationObserver(() => { if (dialog.open) reveal(); }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  chain.closest('details')?.addEventListener('toggle', () => reveal());
  chain.addEventListener('dragstart', event => event.preventDefault());
  chain.addEventListener('keydown', event => {
    if (event.target !== chain || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    chain.scrollBy({ left: event.key === 'ArrowRight' ? 180 : -180, behavior: 'smooth' });
  });
  chain.addEventListener('focusin', event => {
    if (!event.target.matches('.topic-chain-link')) return;
    const link = event.target, margin = 34;
    if (link.offsetLeft < chain.scrollLeft + margin) chain.scrollLeft = link.offsetLeft - margin;
    else if (link.offsetLeft + link.offsetWidth > chain.scrollLeft + chain.clientWidth - margin) chain.scrollLeft = link.offsetLeft + link.offsetWidth - chain.clientWidth + margin;
  });
}

for (const path of document.querySelectorAll('.learning-breadcrumb')) {
  const current = path.querySelector('[aria-current]');
  const reveal = enableProblemNumberStrip(path, () => current);
  path.scrollLeft = path.scrollWidth;
  reveal();
  path.addEventListener('keydown', event => {
    if (event.target !== path || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    path.scrollBy({ left: event.key === 'ArrowRight' ? 180 : -180, behavior: 'smooth' });
  });
  path.addEventListener('focusin', event => {
    if (event.target === path) return;
    const link = event.target;
    if (link.offsetLeft < path.scrollLeft + 18) path.scrollLeft = link.offsetLeft - 18;
    else if (link.offsetLeft + link.offsetWidth > path.scrollLeft + path.clientWidth - 18) path.scrollLeft = link.offsetLeft + link.offsetWidth - path.clientWidth + 18;
  });
}

if (outline) {
  const modules = [...outline.querySelectorAll('.course-outline-module')];
  const selected = modules.findIndex(module => module.hasAttribute('data-current'));
  modules.forEach((module, index) => {
    const distance = Math.abs(index - selected);
    module.style.setProperty('--chapter-focus', .5 + .5 * Math.exp(-.35 * distance * distance));
  });
  alignCoursePath(outline);
}

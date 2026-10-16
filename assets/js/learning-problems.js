const root = document.getElementById('module-problems');
const cards = [...root.querySelectorAll(':scope > section.worked')];
const statuses = { '': 'To try', revisit: 'Revisit', confident: 'Confident' };
const key = `learning-problems:${location.pathname}:v1`;
let saved = {};
try {
  const value = JSON.parse(localStorage.getItem(key) || '{}');
  if (value && typeof value === 'object' && !Array.isArray(value)) saved = value;
} catch {}
let active = 0;
const arrow = direction => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" ${direction === 'previous' ? 'style="transform:rotate(180deg)"' : ''}><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bookmark = '<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4Z" stroke="currentColor" stroke-width="1.5"/></svg>';
if (cards.length) {
  root.classList.add('problems-enhanced');
  const deck = document.createElement('div');
  deck.className = 'problems-deck';
  root.append(deck);
  const entries = cards.map((card, i) => {
    const title = card.querySelector(':scope > h3');
    const label = card.querySelector(':scope > .element-label');
    const id = title.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    card.id = `problem-${i + 1}`;
    card.classList.add('problem-card');
    const header = document.createElement('div');
    header.className = 'problem-card-header';
    const name = document.createElement('div');
    name.className = 'problem-card-name';
    label.className = 'problem-card-number';
    name.append(label, title);
    const menu = document.createElement('details');
    menu.className = 'problem-status-menu';
    const summary = document.createElement('summary');
    menu.append(summary);
    const options = document.createElement('div');
    options.className = 'problem-status-options';
    for (const [value, text] of Object.entries(statuses)) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = text; button.dataset.status = value;
      button.addEventListener('click', () => {
        entry.status = value; saved[id] = value;
        try { localStorage.setItem(key, JSON.stringify(saved)); } catch {}
        menu.open = false; update(); summary.focus();
      });
      options.append(button);
    }
    menu.append(options); header.append(name, menu); card.prepend(header);
    const disclosures = [...card.querySelectorAll(':scope > details.disclosure')];
    const help = document.createElement('button');
    help.type = 'button'; help.className = 'problem-help'; help.textContent = 'Hint';
    help.addEventListener('click', () => {
      const next = disclosures.find(d => !d.open);
      if (next) { next.open = true; }
      const remaining = disclosures.find(d => !d.open);
      help.textContent = remaining?.querySelector('summary').textContent === 'Solution' ? 'Show solution' : 'Next hint';
      help.hidden = !remaining;
      if (!remaining && next) { next.tabIndex = -1; next.focus({ preventScroll: true }); }
    });
    help.hidden = !disclosures.length;
    card.append(help); deck.append(card);
    const entry = { card, menu, summary, options, disclosures, help, status: Object.hasOwn(statuses, saved[id]) ? saved[id] : '' };
    return entry;
  });
  const nav = document.createElement('nav'); nav.className = 'number-navigation'; nav.setAttribute('aria-label', 'Problem navigation');
  const previous = document.createElement('button'); previous.type = 'button'; previous.innerHTML = arrow('previous'); previous.setAttribute('aria-label', 'Previous problem');
  const next = document.createElement('button'); next.type = 'button'; next.innerHTML = arrow('next'); next.setAttribute('aria-label', 'Next problem');
  const squares = document.createElement('div'); squares.className = 'number-strip';
  const dots = entries.map((entry, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.innerHTML = `<span aria-hidden="true">${i + 1}</span>`;
    button.addEventListener('click', () => { show(i); button.focus({ preventScroll: true }); }); squares.append(button); return button;
  });
  nav.append(previous, squares, next);
  const announce = document.createElement('p'); announce.className = 'sr-only'; announce.setAttribute('role', 'status'); root.append(announce);
  function update() {
    entries.forEach((entry, i) => {
      entry.summary.innerHTML = `${bookmark}<span>${statuses[entry.status]}</span>`;
      entry.summary.dataset.status = entry.status;
      entry.summary.setAttribute('aria-label', `Study status: ${statuses[entry.status]}`);
      entry.options.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.status === entry.status));
      dots[i].dataset.status = entry.status;
      dots[i].setAttribute('aria-label', `Problem ${i + 1}: ${statuses[entry.status]}`);
      dots[i].title = `Problem ${i + 1}: ${statuses[entry.status]}`;
      if (i === active) dots[i].setAttribute('aria-current', 'true'); else dots[i].removeAttribute('aria-current');
      entry.card.hidden = i !== active;
    });
    previous.disabled = active === 0; next.disabled = active === entries.length - 1;
    entries[active].card.append(nav);
  }
  function show(index) {
    const old = entries[active].card.getBoundingClientRect();
    entries[active].menu.open = false;
    if (index !== active) {
      entries[active].disclosures.forEach(d => { d.open = false; });
      entries[active].help.hidden = !entries[active].disclosures.length;
      entries[active].help.textContent = 'Hint';
    }
    active = index; update();
    announce.textContent = `Problem ${active + 1} of ${entries.length}: ${entries[active].card.querySelector('h3').textContent}`;
    if (old.top < 0) entries[active].card.scrollIntoView({ block: 'start' });
  }
  previous.addEventListener('click', () => { show(active - 1); (previous.disabled ? next : previous).focus({ preventScroll: true }); });
  next.addEventListener('click', () => { show(active + 1); (next.disabled ? previous : next).focus({ preventScroll: true }); });
  document.addEventListener('pointerdown', e => entries.forEach(entry => { if (!entry.menu.contains(e.target)) entry.menu.open = false; }));
  update();
} else {
  const empty = document.createElement('p'); empty.className = 'problems-empty'; empty.textContent = 'Problems for this module are being prepared.'; root.append(empty);
}

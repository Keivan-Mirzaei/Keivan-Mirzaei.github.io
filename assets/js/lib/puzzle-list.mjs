// Numbered games share status badges, paging, and focus-preserving selection.
export function initializePuzzleList(root, { prefix, read, select, unit }) {
  const get = name => root.querySelector(`[data-${prefix}-${name}]`);
  const owner = root.ownerDocument || document, events = new AbortController(), pageSize = 50;
  let page = 0, activeNumber = null, activeDifficulty = null, listKey = '', buttons = [];
  const count = value => `${value} ${unit}${value === 1 ? '' : unit === 'press' ? 'es' : 's'}`;
  function render() {
    const book = read();
    if (activeNumber !== book.number || activeDifficulty !== book.difficulty) {
      page = Math.floor((book.number - 1) / pageSize);
      activeNumber = book.number; activeDifficulty = book.difficulty;
    }
    const lastPage = Math.ceil(book.total / pageSize) - 1;
    page = Math.max(0, Math.min(page, lastPage));
    const first = page * pageSize + 1, last = Math.min(book.total, first + pageSize - 1);
    const key = `${book.difficulty}:${first}:${last}`;
    if (key !== listKey) {
      buttons = Array.from({ length: last - first + 1 }, (_, index) => {
        const button = owner.createElement('button');
        button.type = 'button'; button.className = 'puzzle-number'; button.dataset[`${prefix}Puzzle`] = String(first + index);
        return button;
      });
      get('puzzles').replaceChildren(...buttons); listKey = key;
    }
    buttons.forEach((button, index) => {
      const number = first + index, result = book.result(number);
      const mark = result.status === 'minimum' ? '★' : result.status === 'solved' ? '✓' : '';
      const label = !unit ? result.status : result.status === 'minimum' ? `solved in the minimum ${count(result.minimum)}`
        : `${result.status}${result.best === null ? '' : ` in ${count(result.best)}`}. Minimum ${count(result.minimum)}`;
      button.innerHTML = `${number}<span class="puzzle-number-mark" aria-hidden="true">${mark}</span>`;
      button.dataset.completion = result.status;
      button.setAttribute('aria-label', `Puzzle ${number}, ${label}.`);
      button.setAttribute('aria-current', String(number === book.number));
    });
    get('puzzles').setAttribute('aria-label', `Puzzles ${first} to ${last}`);
    get('page-range').textContent = `${first}–${last} / ${book.total}`;
    get('page-prev').disabled = page === 0; get('page-next').disabled = page === lastPage;
  }
  get('puzzles').addEventListener('click', event => {
    const button = event.target.closest(`[data-${prefix}-puzzle]`);
    if (button) select(Number(button.dataset[`${prefix}Puzzle`]));
  }, { signal: events.signal });
  for (const [name, delta] of [['page-prev', -1], ['page-next', 1]]) get(name).addEventListener('click', () => {
    page += delta; render();
    if (owner.activeElement === get(name) && get(name).disabled) get(delta < 0 ? 'page-next' : 'page-prev').focus();
  }, { signal: events.signal });
  return { render, destroy() { events.abort(); } };
}

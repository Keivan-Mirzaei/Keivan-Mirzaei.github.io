import { bindPanelHistory } from '../lib/panel-history.mjs';
import { createPageEnvironment } from '../lib/page-environment.mjs';

export function mount(root = globalThis.document) {
  const environment = createPageEnvironment(root);
  const { document, window, ResizeObserver, IntersectionObserver, MutationObserver, setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame, cancelAnimationFrame } = environment;

/* Deal across three columns; always collect the chosen column in the middle. */
(() => {
  document.querySelectorAll('[data-widget="card-trick"]').forEach((widget) => {
    const columns = widget.querySelector('[data-columns]');
    const feedback = widget.querySelector('[data-feedback]');
    const reset = widget.querySelector('[data-reset]');
    let deck;
    let round;

    function deal() {
      widget.dataset.complete = String(round === 3);
      columns.replaceChildren();
      const piles = [0, 1, 2].map((column) => deck.filter((_, index) => index % 3 === column));
      piles.forEach((pile, column) => {
        const group = document.createElement('div');
        const label = document.createElement('p');
        label.textContent = `Column ${column + 1}`;
        const cards = document.createElement('ol');
        cards.className = 'card-pile';
        pile.forEach((number) => {
          const card = document.createElement('li');
          card.textContent = number;
          cards.append(card);
        });
        const choose = document.createElement('button');
        choose.className = 'secondary-button';
        choose.type = 'button';
        choose.textContent = `Column ${column + 1}`;
        choose.setAttribute('aria-label', `My card is in column ${column + 1}`);
        choose.addEventListener('click', () => {
          history.remember();
          const others = piles.filter((_, index) => index !== column);
          deck = [...others[0], ...pile, ...others[1]];
          round += 1;
          widget.dataset.complete = String(round === 3);
          if (round === 3) {
            columns.querySelectorAll('button').forEach((button) => { button.disabled = true; });
            feedback.textContent = `Your card is ${deck[10]}. Three collections have moved it to position 11. Try a different number!`;
            reset.focus({ preventScroll: true });
          } else {
            deal();
            columns.querySelector('button').focus({ preventScroll: true });
          }
        });
        group.append(label, cards, choose);
        columns.append(group);
      });
      if (round === 3) {
        columns.querySelectorAll('button').forEach(button => { button.disabled = true; });
        feedback.textContent = `Your card is ${deck[10]}. Three collections have moved it to position 11.`;
      } else feedback.textContent = `Round ${round + 1} of 3. Which column contains your number?`;
    }

    function start() {
      deck = Array.from({ length: 21 }, (_, index) => index + 1);
      round = 0;
      deal();
    }
    reset.disabled = false;
    const history = bindPanelHistory(widget, {
      read: () => ({ deck, round }),
      restore: state => { ({ deck, round } = state); deal(); },
      reset: start
    });
    start();
  });
})();

  return environment.dispose;
}

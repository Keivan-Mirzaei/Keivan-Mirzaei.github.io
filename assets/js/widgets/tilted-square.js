import { bindPanelHistory } from '../lib/panel-history.mjs';
/* Translate four congruent triangles to turn the tilted square into a² + b². */
(() => {
  const root = document.getElementById('the-tilted-square');
  if (!root) return;
  const svg = root.querySelector('#ts-diagram');
  const figure = root.querySelector('.ts-figure');
  const button = root.querySelector('#ts-reveal');
  const note = root.querySelector('#ts-note');
  const pieces = Array.from({ length: 4 }, (_, index) => root.querySelector(`#ts-piece-${index}`));
  let solved = false;
  let motionTimer;
  let geometry;
  let renderedWidth = 0;

  function attrs(element, values) {
    Object.entries(values).forEach(([name, value]) => element.setAttribute(name, value));
  }

  function points(vertices) {
    return vertices.map(([x, y]) => `${x},${y}`).join(' ');
  }

  function setButtonWord() {
    button.dataset.word = solved ? 'obvious' : 'serious';
    button.setAttribute('aria-label', solved ? 'Obvious! Show puzzle' : 'Serious? Show solution');
    button.setAttribute('aria-pressed', String(solved));
  }

  function placePieces() {
    const { a, b } = geometry;
    const translations = solved ? [[0, a], [0, 0], [-b, 0], [a, -b]] : [[0, 0], [0, 0], [0, 0], [0, 0]];
    pieces.forEach((piece, index) => {
      const [x, y] = translations[index];
      piece.style.transform = `translate(${x}px, ${y}px)`;
    });
    root.querySelector('#ts-b-dimension').style.transform = `translate(0px, ${solved ? a : 0}px)`;
  }

  function showFinalState() {
    root.dataset.phase = solved ? 'solved' : 'puzzle';
    button.hidden = false;
    button.disabled = false;
    setButtonWord();
    note.textContent = solved ? 'Same four triangles. Same outer square. Shaded area: a² + b².' : 'Four congruent right triangles. Two marked lengths.';
    svg.setAttribute('aria-label', solved ? 'The same four triangles now leave two shaded squares, of areas a squared and b squared' : 'Four congruent right triangles with legs a and b surround a tilted shaded square');
  }

  function draw() {
    const width = figure.getBoundingClientRect().width;
    if (!width || Math.abs(width - renderedWidth) < .5) return;
    renderedWidth = width;
    clearTimeout(motionTimer);
    root.dataset.phase = 'puzzle';
    const side = Math.min(360, Math.max(0, width - 72));
    const a = side * 3 / 7;
    const b = side * 4 / 7;
    const x = (width - side) / 2;
    const y = 34;
    const corner = Math.min(10, side * .035);
    geometry = { a, b };
    attrs(svg, { viewBox: `0 0 ${width} ${side + 60}`, height: side + 60 });
    attrs(root.querySelector('#ts-area'), { x, y, width: side, height: side });
    attrs(root.querySelector('#ts-frame'), { x, y, width: side, height: side });
    const triangles = [
      [[x, y], [x + a, y], [x, y + b]],
      [[x + a, y], [x + side, y], [x + side, y + a]],
      [[x + side, y + a], [x + side, y + side], [x + b, y + side]],
      [[x, y + b], [x, y + side], [x + b, y + side]]
    ];
    const rightAngles = [
      [[x, y + corner], [x + corner, y + corner], [x + corner, y]],
      [[x + side - corner, y], [x + side - corner, y + corner], [x + side, y + corner]],
      [[x + side, y + side - corner], [x + side - corner, y + side - corner], [x + side - corner, y + side]],
      [[x, y + side - corner], [x + corner, y + side - corner], [x + corner, y + side]]
    ];
    pieces.forEach((piece, index) => {
      attrs(piece.querySelector('polygon'), { points: points(triangles[index]) });
      attrs(piece.querySelector('polyline'), { points: points(rightAngles[index]) });
    });
    const aDimension = root.querySelector('#ts-a-dimension');
    const bDimension = root.querySelector('#ts-b-dimension');
    attrs(aDimension.querySelector('path'), { d: `M${x},${y - 11}v-6 M${x + a},${y - 11}v-6 M${x},${y - 14}h${a}` });
    attrs(aDimension.querySelector('text'), { x: x + a / 2, y: y - 20 });
    attrs(bDimension.querySelector('path'), { d: `M${x - 11},${y}h-6 M${x - 11},${y + b}h-6 M${x - 14},${y}v${b}` });
    attrs(bDimension.querySelector('text'), { x: x - 27, y: y + b / 2 + 5 });
    attrs(root.querySelector('#ts-question'), { x: x + side / 2, y: y + side / 2 });
    attrs(root.querySelector('#ts-a-square'), { x, y, width: a, height: a });
    attrs(root.querySelector('#ts-b-square'), { x: x + a, y: y + a, width: b, height: b });
    attrs(root.querySelector('#ts-a-label'), { x: x + a / 2, y: y + a / 2 });
    attrs(root.querySelector('#ts-b-label'), { x: x + a + b / 2, y: y + a + b / 2 });
    placePieces();
    showFinalState();
  }

  function restoreArrangement(value) {
    clearTimeout(motionTimer); solved = value; placePieces(); showFinalState();
  }
  const history = bindPanelHistory(root, {
    read: () => solved, restore: restoreArrangement, reset: () => restoreArrangement(false)
  });
  button.addEventListener('click', () => {
    history.remember();
    if (!geometry) return;
    solved = !solved;
    button.disabled = true;
    root.dataset.phase = 'moving';
    setButtonWord();
    note.textContent = 'Rearranging the same four triangles…';
    placePieces();
    clearTimeout(motionTimer);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    motionTimer = setTimeout(showFinalState, reducedMotion ? 0 : 1250);
  });

  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(figure);
  else window.addEventListener('resize', draw);
  draw();
})();

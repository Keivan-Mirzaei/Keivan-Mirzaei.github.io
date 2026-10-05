import { countBits, pressEffect, vertices } from './lights-out-math.mjs';

const labels = (mask, graph) => vertices(mask, graph.size).map(i => i + 1).join(', ') || 'none';

// The game, editable examples, targets, and proof diagrams share light geometry.
export function lightsOutBoardMarkup(graph, { interactive = true } = {}) {
  const tag = interactive ? 'button' : 'span';
  return `<svg class="glo-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${graph.edges.map(([a, b]) => {
    const [ax, ay] = graph.positions[a], [bx, by] = graph.positions[b];
    return `<path data-edge="${a},${b}" d="M${ax * 100},${ay * 100}L${bx * 100},${by * 100}"/>`;
  }).join('')}</svg>${graph.positions.map(([x, y], i) => `<${tag} class="glo-light" data-light="${i}" ${interactive ? `type="button" tabindex="${i === 0 ? 0 : -1}"` : 'aria-hidden="true"'} style="left:${x * 100}%;top:${y * 100}%"><span class="glo-light-core"><span class="glo-light-number">${i + 1}</span></span><span class="glo-hint-label" aria-hidden="true">hint</span><span class="glo-step" aria-hidden="true" hidden></span></${tag}>`).join('')}`;
}

export function updateLightsOutBoard(holder, graph, lights, { interactive = true, numbered = true, editing = false, order = [], next = -1, omitted = -1, pressed = 0, solved = false } = {}) {
  holder.classList.toggle('glo-grid', Boolean(graph.side));
  holder.style.setProperty('--glo-side', graph.side || 1);
  holder.style.aspectRatio = graph.positions.every(([, y]) => Math.abs(y - .5) < .001) ? '3.5' : '1';
  holder.dataset.numbers = String(numbered);
  holder.setAttribute('role', interactive ? 'group' : 'img');
  holder.setAttribute('aria-label', `${graph.name}. ${countBits(lights)} of ${graph.size} lights on.${interactive ? '' : ` Lights on: ${labels(lights, graph)}. Press set: ${labels(pressed, graph)}.${omitted >= 0 ? ` Light ${omitted + 1} is omitted.` : ''}`}`);
  holder.querySelectorAll('[data-light]').forEach((light, i) => {
    const on = Boolean(lights & (1 << i)), step = order.indexOf(i);
    for (const [name, active] of Object.entries({ 'is-on': on, 'is-plan': step >= 0 || Boolean(pressed & (1 << i)), 'is-next': i === next, 'is-omitted': i === omitted })) light.classList.toggle(name, active);
    const marker = light.querySelector('.glo-step');
    marker.hidden = step < 0; marker.textContent = step < 0 ? '' : String(step + 1);
    if (interactive) {
      light.disabled = solved && !editing;
      light.setAttribute('aria-pressed', String(on));
      light.setAttribute('aria-label', `Light ${i + 1}, ${on ? 'on' : 'off'}. ${editing ? 'Change this starting light.' : `Press to flip lights ${labels(pressEffect(graph, 1 << i), graph)}.`}${step >= 0 ? ` Solution step ${step + 1}.` : ''}`);
    }
  });
  holder.querySelectorAll('[data-edge]').forEach(edge => edge.classList.toggle('is-omitted', edge.dataset.edge.split(',').map(Number).includes(omitted)));
}

export function drawLightsOutBoard(holder, graph, lights, options = {}) {
  const focused = holder.contains(holder.ownerDocument.activeElement) ? holder.ownerDocument.activeElement.dataset.light : undefined;
  holder.innerHTML = lightsOutBoardMarkup(graph, options);
  updateLightsOutBoard(holder, graph, lights, options);
  const buttons = [...holder.querySelectorAll('button[data-light]')];
  const cursor = buttons.find(button => button.dataset.light === focused) || buttons[0];
  buttons.forEach(button => { button.tabIndex = button === cursor ? 0 : -1; });
  if (focused !== undefined && !cursor?.disabled) cursor?.focus({ preventScroll: true });
}

export function lightsOutNeighbor(graph, current, key) {
  const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  if (!directions[key]) return -1;
  const [dx, dy] = directions[key], [x, y] = graph.positions[current];
  const candidates = graph.positions.map(([px, py], index) => {
    const vx = px - x, vy = py - y;
    return { index, forward: vx * dx + vy * dy, score: Math.hypot(vx, vy) + 2 * Math.abs(vx * dy - vy * dx) };
  }).filter(candidate => candidate.forward > .01).sort((a, b) => a.score - b.score);
  return candidates[0]?.index ?? -1;
}

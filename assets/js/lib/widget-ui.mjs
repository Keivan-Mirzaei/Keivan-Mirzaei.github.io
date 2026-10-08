// Native and button disclosures share dismissal without outside-click handling.
const documents = new WeakSet(), disclosures = [];
let openingOrder = 0;
export function disposeWidgetUI(root) {
  for (let i = disclosures.length - 1; i >= 0; i--) {
    if (root.contains(disclosures[i].trigger)) disclosures.splice(i, 1);
  }
}
function registerDisclosure(owner, record) {
  disclosures.push(record);
  if (documents.has(owner)) return;
  documents.add(owner);
  owner.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    const opened = disclosures.filter(item => item.owner === owner && item.isOpen()).sort((a,b) => b.order - a.order)[0];
    if (!opened) return;
    event.preventDefault?.(); opened.close(); opened.trigger.focus();
  });
}

// Presentation adapters keep the established mathematical controllers intact.
export function initializeWidgetUI(widget) {
  if (widget.dataset.uiReady) return;
  widget.dataset.uiReady = 'true';
  const owner = widget.ownerDocument || widget;
  const panels = [...widget.querySelectorAll('details.panel-help, details.graph-values, details[data-widget-disclosure]')];
  const triggers = [...widget.querySelectorAll('[data-widget-disclosure-trigger]')];
  for (const panel of panels) {
    panel.open = false;
    const record = { owner, trigger: panel.querySelector('summary'), order: 0, isOpen: () => panel.open, close: () => { panel.open = false; } };
    registerDisclosure(owner, record);
    panel.addEventListener('toggle', () => {
      if (!panel.open) return;
      record.order = ++openingOrder;
      panels.forEach(other => { if (other !== panel) other.open = false; });
      triggers.forEach(trigger => { if (trigger.getAttribute('aria-expanded') === 'true') trigger.click(); });
    });
  }
  for (const trigger of triggers) {
    const record = { owner, trigger, order: 0, isOpen: () => trigger.getAttribute('aria-expanded') === 'true', close: () => trigger.click() };
    registerDisclosure(owner, record);
    trigger.addEventListener('click', () => queueMicrotask(() => {
      if (!record.isOpen()) return;
      record.order = ++openingOrder;
      panels.forEach(panel => { panel.open = false; });
    }));
  }
}

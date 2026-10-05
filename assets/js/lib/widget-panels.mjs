// Supporting panels share one trigger, release their space, and never save visibility.
let nextInstance = 0;

export function initializeWidgetPanels(root, document = root.ownerDocument) {
  const triggers = [...root.querySelectorAll('[data-widget-panel-trigger]')];
  const panels = [...root.querySelectorAll('[data-widget-panel]')];
  const bindings = triggers.map(trigger => ({ trigger, panel: panels.find(panel => panel.dataset.widgetPanel === trigger.dataset.widgetPanelTrigger) })).filter(binding => binding.panel);
  if (!bindings.length) return () => {};
  const prefix = `widget-panel-${++nextInstance}`, events = new AbortController();
  let opened = null;
  function close(restoreFocus = false) {
    if (!opened) return;
    const { trigger, panel } = opened;
    panel.hidden = true; trigger.setAttribute('aria-expanded', 'false'); opened = null;
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }
  bindings.forEach(({ trigger, panel }, index) => {
    panel.id = `${prefix}-${index}`; panel.hidden = true;
    trigger.setAttribute('aria-controls', panel.id); trigger.setAttribute('aria-expanded', 'false'); trigger.disabled = false;
    trigger.addEventListener('click', () => {
      const wasOpen = opened?.panel === panel;
      close();
      if (!wasOpen) { panel.hidden = false; trigger.setAttribute('aria-expanded', 'true'); opened = { trigger, panel }; }
    }, { signal: events.signal });
  });
  document.addEventListener('pointerdown', event => {
    if (opened && !opened.panel.contains(event.target) && !bindings.some(({ trigger }) => trigger.contains(event.target))) close();
  }, { signal: events.signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && opened) { event.preventDefault(); close(true); }
  }, { signal: events.signal });
  return () => { close(); events.abort(); };
}

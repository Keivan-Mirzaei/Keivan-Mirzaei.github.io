// A deliberate progress reset is separate from an undoable board Reset.
export function initializeProgressReset(root, reset) {
  const get = name => root.querySelector(`[data-widget-progress-${name}]`);
  const button = get('reset'), confirmation = get('confirm');
  if (!button || !confirmation) return () => {};
  const events = new AbortController();
  const listen = (element, handler) => element.addEventListener('click', handler, { signal: events.signal });
  function close() { confirmation.hidden = true; button.hidden = false; button.focus({ preventScroll: true }); }
  button.disabled = false; confirmation.hidden = true;
  listen(button, () => {
    get('message').textContent = '';
    button.hidden = true; confirmation.hidden = false;
    get('apply').focus({ preventScroll: true });
  });
  listen(get('cancel'), close);
  listen(get('apply'), () => {
    reset(); close(); get('message').textContent = 'Progress reset. Your settings are kept.';
  });
  return () => { events.abort(); confirmation.hidden = true; button.hidden = false; };
}

/* The heavy renderer is created only by a deliberate click, and disposed on close. */
export function prepareInteractive(widget, createView) {
  const button = widget.querySelector('[data-open]');
  const preview = widget.querySelector('[data-preview]');
  const view = widget.querySelector('[data-view]');
  const controls = widget.querySelector('[data-controls]');
  const status = widget.querySelector('[data-status]');
  const previewMessage = status.textContent;
  let dispose = null;
  let opening = false;

  function showPreview() {
    dispose?.();
    dispose = null;
    view.replaceChildren();
    view.hidden = true;
    preview.hidden = false;
    controls.hidden = controls.disabled = true;
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Open interactive view';
  }

  button.disabled = false;
  button.addEventListener('click', async () => {
    if (opening) return;
    if (dispose) {
      showPreview();
      status.textContent = previewMessage;
      return;
    }
    // Keep keyboard focus on the button while its renderer loads.
    opening = true;
    button.setAttribute('aria-disabled', 'true');
    button.textContent = 'Opening…';
    status.textContent = 'Loading the interactive view…';
    widget.setAttribute('aria-busy', 'true');
    preview.hidden = true;
    view.hidden = false;
    try {
      dispose = await createView({ view, controls });
      controls.hidden = controls.disabled = false;
      button.setAttribute('aria-expanded', 'true');
      button.textContent = 'Close interactive view';
      status.textContent = 'Interactive view ready. Controls and an explanation are below the graph.';
    } catch (error) {
      showPreview();
      button.textContent = 'Try opening again';
      status.textContent = 'The interactive view could not open. Check your connection and try again. For 3D, your browser also needs graphics support. The static preview is still available.';
      console.warn('Interactive graph could not open:', error);
    } finally {
      opening = false;
      button.removeAttribute('aria-disabled');
      widget.removeAttribute('aria-busy');
    }
  });
}

// ResizeObserver also catches sidebar toggles, not just window resizes.
export function observeSize(element, resize) {
  let frame;
  let previous = '';
  const observer = new ResizeObserver(() => {
    const size = `${element.clientWidth}:${element.clientHeight}`;
    if (size === previous || !element.clientWidth) return;
    previous = size;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(resize);
  });
  observer.observe(element);
  return () => { observer.disconnect(); cancelAnimationFrame(frame); };
}

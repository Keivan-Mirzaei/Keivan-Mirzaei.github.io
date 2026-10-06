// Shared select-only combobox; the native select remains the controller's source.
// Keyboard pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
const instances = new WeakMap(), documents = new WeakMap();
let nextId = 0;

export function commitDropdownSelection(select, index) {
  const option = select.options[index];
  if (select.disabled || !option || option.disabled || option.parentElement?.disabled || index === select.selectedIndex) return false;
  select.selectedIndex = index;
  const EventType = select.ownerDocument?.defaultView?.Event || Event;
  select.dispatchEvent(new EventType('input', { bubbles: true }));
  select.dispatchEvent(new EventType('change', { bubbles: true }));
  return true;
}

function watchProperty(element, name, changed) {
  let prototype = Object.getPrototypeOf(element), descriptor;
  while (prototype && !descriptor) {
    descriptor = Object.getOwnPropertyDescriptor(prototype, name);
    prototype = Object.getPrototypeOf(prototype);
  }
  if (!descriptor?.get || !descriptor?.set || Object.hasOwn(element, name)) return () => {};
  Object.defineProperty(element, name, {
    configurable: true,
    get() { return descriptor.get.call(this); },
    set(value) { descriptor.set.call(this, value); changed(); }
  });
  return () => { delete element[name]; };
}

export function initializeDropdowns(root) {
  const owner = root.ownerDocument || root;
  const triggerTemplate = owner.querySelector('template[data-dropdown-trigger]');
  const optionTemplate = owner.querySelector('template[data-dropdown-option]');
  const configuration = owner.querySelector('[data-dropdown-marks]');
  if (!triggerTemplate || !optionTemplate || !owner.defaultView?.MutationObserver) return;
  let marks = {};
  try { marks = JSON.parse(configuration?.textContent || '{}'); } catch { /* Text controls remain usable. */ }
  let shared = documents.get(owner);
  if (!shared) {
    shared = { active: null, controls: new Set() };
    documents.set(owner, shared);
    owner.addEventListener('pointerdown', event => {
      const active = shared.active;
      if (active && !active.wrapper.contains(event.target) && !active.menu.contains(event.target)) active.close();
    }, true);
    owner.addEventListener('focusin', event => {
      const active = shared.active;
      if (active && !active.wrapper.contains(event.target) && !active.menu.contains(event.target)) active.close();
    });
    owner.addEventListener('reset', () => queueMicrotask(() => shared.controls.forEach(control => control.sync())));
    owner.defaultView.addEventListener('resize', () => shared.active?.position());
    owner.addEventListener('scroll', event => {
      if (shared.active && !shared.active.menu.contains(event.target)) shared.active.position();
    }, true);
    const observer = new owner.defaultView.MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches('select')) enhance(node);
        node.querySelectorAll('select').forEach(enhance);
      }
      for (const control of shared.controls) {
        if (!control.select.isConnected) control.dispose();
      }
      const active = shared.active;
      if (active && active.trigger.closest('[hidden], details:not([open])')) active.close();
    });
    observer.observe(owner.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open'] });
  }
  function enhance(select) {
    if (instances.has(select) || select.multiple || select.size > 1) return;
    const wrapper = owner.createElement('div'); wrapper.className = 'site-dropdown';
    const trigger = triggerTemplate.content.firstElementChild.cloneNode(true);
    const text = trigger.querySelector('[data-dropdown-value]');
    const menu = owner.createElement('div'); menu.className = 'site-dropdown-menu';
    const prefix = `site-dropdown-${++nextId}`;
    trigger.id = `${prefix}-trigger`; text.id = `${prefix}-value`; menu.id = `${prefix}-options`;
    menu.setAttribute('role', 'listbox'); menu.hidden = true;
    trigger.setAttribute('aria-controls', menu.id);
    const labels = [...(select.labels || [])];
    const labelTargets = labels.map(label => label.getAttribute('for'));
    for (const [index, label] of labels.entries()) { if (!label.id) label.id = `${prefix}-label-${index}`; label.htmlFor = trigger.id; }
    const labelIds = select.getAttribute('aria-labelledby') || labels.map(label => label.id).join(' ');
    const name = select.getAttribute('aria-label') || labels.map(label => label.textContent.trim()).join(' ') || 'Choose an option';
    if (labelIds) { trigger.setAttribute('aria-labelledby', labelIds); menu.setAttribute('aria-labelledby', labelIds); }
    else { trigger.setAttribute('aria-label', name); menu.setAttribute('aria-label', name); }
    if (select.hasAttribute('aria-describedby')) trigger.setAttribute('aria-describedby', select.getAttribute('aria-describedby'));
    const usesMarks = select.dataset.dropdown === 'difficulty';
    const triggerMark = usesMarks ? owner.createElement('img') : null;
    if (triggerMark) { triggerMark.className = 'site-dropdown-mark'; triggerMark.alt = ''; triggerMark.setAttribute('aria-hidden', 'true'); trigger.prepend(triggerMark); }
    select.before(wrapper); wrapper.append(select, trigger); owner.body.append(menu);
    // The top layer prevents clipping inside widget frames and disclosures.
    const hasPopover = typeof menu.showPopover === 'function';
    if (hasPopover) menu.setAttribute('popover', 'manual');
    let options = [], rows = [], activeIndex = -1, isOpen = false, query = '', typedAt = 0;
    const restores = [];
    const control = { select, wrapper, trigger, menu, sync, close, position, dispose };
    instances.set(select, control); shared.controls.add(control);

    function build() {
      options = [...select.options]; rows = []; menu.replaceChildren();
      let lastGroup = null, groupContainer = menu;
      for (const [index, option] of options.entries()) {
        const group = option.parentElement?.tagName === 'OPTGROUP' ? option.parentElement : null;
        if (group !== lastGroup) {
          groupContainer = menu;
          if (group) {
            groupContainer = owner.createElement('div'); groupContainer.setAttribute('role', 'group');
            const heading = owner.createElement('div'); heading.className = 'site-dropdown-group'; heading.id = `${prefix}-group-${index}`; heading.textContent = group.label;
            groupContainer.setAttribute('aria-labelledby', heading.id); groupContainer.append(heading); menu.append(groupContainer);
          }
          lastGroup = group;
        }
        const row = optionTemplate.content.firstElementChild.cloneNode(true);
        row.id = `${prefix}-option-${index}`; row.dataset.index = index;
        row.querySelector('[data-dropdown-option-label]').textContent = option.label;
        if (usesMarks && marks[option.value]) {
          const mark = owner.createElement('img'); mark.className = 'site-dropdown-mark'; mark.src = marks[option.value]; mark.alt = ''; mark.setAttribute('aria-hidden', 'true'); row.prepend(mark);
        }
        groupContainer.append(row); rows.push(row);
      }
      if (isOpen) activeIndex = select.selectedIndex;
      sync();
    }
    function enabled(index) { const option = options[index]; return option && !option.disabled && !option.parentElement?.disabled && !option.hidden; }
    function sync() {
      const current = select.options[select.selectedIndex];
      labels.forEach(label => { if (label.htmlFor !== trigger.id) label.htmlFor = trigger.id; });
      text.textContent = current?.label || 'Choose an option';
      trigger.disabled = select.disabled || !options.some((_, index) => enabled(index));
      trigger.setAttribute('aria-disabled', String(trigger.disabled));
      if (triggerMark) {
        triggerMark.hidden = !marks[current?.value];
        if (!triggerMark.hidden) triggerMark.src = marks[current.value];
      }
      rows.forEach((row, index) => {
        row.hidden = options[index].hidden;
        row.setAttribute('aria-selected', String(index === select.selectedIndex));
        row.setAttribute('aria-disabled', String(!enabled(index)));
      });
      if (trigger.disabled) close();
      if (isOpen) { if (!enabled(activeIndex)) activeIndex = firstEnabled(); highlight(); position(); }
    }
    function firstEnabled() { return options.findIndex((_, index) => enabled(index)); }
    function highlight() {
      rows.forEach((row, index) => row.classList.toggle('is-active', index === activeIndex));
      if (rows[activeIndex]) {
        trigger.setAttribute('aria-activedescendant', rows[activeIndex].id);
        if (isOpen) {
          const row = rows[activeIndex].getBoundingClientRect(), bounds = menu.getBoundingClientRect();
          if (row.top < bounds.top + 5) menu.scrollTop -= bounds.top + 5 - row.top;
          else if (row.bottom > bounds.bottom - 5) menu.scrollTop += row.bottom - bounds.bottom + 5;
        }
      } else trigger.removeAttribute('aria-activedescendant');
    }
    function position() {
      if (!isOpen) return;
      const rect = trigger.getBoundingClientRect(), view = owner.defaultView;
      if (!rect.width || rect.bottom < 0 || rect.top > view.innerHeight) { close(); return; }
      const gap = 6, edge = 8, below = view.innerHeight - rect.bottom - gap - edge, above = rect.top - gap - edge;
      const upwards = below < Math.min(menu.scrollHeight, 240) && above > below;
      menu.style.width = `${Math.min(rect.width, view.innerWidth - 2 * edge)}px`;
      menu.style.left = `${Math.max(edge, Math.min(rect.left, view.innerWidth - rect.width - edge))}px`;
      menu.style.maxHeight = `${Math.max(44, Math.min(380, upwards ? above : below))}px`;
      menu.style.top = `${upwards ? Math.max(edge, rect.top - gap - menu.getBoundingClientRect().height) : rect.bottom + gap}px`;
    }
    function open(index = select.selectedIndex) {
      sync(); if (trigger.disabled) return;
      if (shared.active && shared.active !== control) shared.active.close();
      activeIndex = enabled(index) ? index : firstEnabled();
      isOpen = true; shared.active = control; menu.hidden = false;
      if (hasPopover && !menu.matches(':popover-open')) menu.showPopover();
      trigger.setAttribute('aria-expanded', 'true'); position(); highlight();
    }
    function close() {
      if (!isOpen) return;
      isOpen = false; query = ''; menu.hidden = true;
      if (hasPopover && menu.matches(':popover-open')) menu.hidePopover();
      trigger.setAttribute('aria-expanded', 'false'); trigger.removeAttribute('aria-activedescendant');
      rows.forEach(row => row.classList.remove('is-active'));
      if (shared.active === control) shared.active = null;
    }
    function choose(index, focus = true) {
      close(); commitDropdownSelection(select, index); sync();
      if (focus && !trigger.disabled) trigger.focus({ preventScroll: true });
    }
    function move(direction, count = 1) {
      for (let step = 0; step < count; step++) {
        let next = activeIndex + direction;
        while (next >= 0 && next < options.length && !enabled(next)) next += direction;
        if (next < 0 || next >= options.length) break;
        activeIndex = next;
      }
      highlight();
    }
    trigger.addEventListener('click', () => { if (isOpen) close(); else open(); });
    trigger.addEventListener('keydown', event => {
      const key = event.key;
      if (key === 'Escape' && isOpen) {
        event.preventDefault(); event.stopPropagation(); close(); return;
      }
      if (key === 'Tab') { if (isOpen) choose(activeIndex, false); return; }
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(key)) {
        event.preventDefault(); event.stopPropagation();
        if (key === 'Enter' || key === ' ') { if (isOpen) choose(activeIndex); else open(); }
        else if (key === 'Home' || key === 'End') {
          if (!isOpen) open();
          activeIndex = key === 'Home' ? firstEnabled() : options.findLastIndex((_, index) => enabled(index)); highlight();
        } else if (!isOpen) open();
        else if (event.altKey && key === 'ArrowUp') choose(activeIndex);
        else move(key === 'ArrowDown' || key === 'PageDown' ? 1 : -1, key.startsWith('Page') ? 10 : 1);
      } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault(); event.stopPropagation();
        const now = Date.now(); query = now - typedAt > 700 ? key : query + key; typedAt = now;
        if (!isOpen) open();
        const repeated = [...query].every(letter => letter.toLowerCase() === key.toLowerCase());
        const search = (repeated ? key : query).toLocaleLowerCase();
        for (let offset = 1; offset <= options.length; offset++) {
          const index = (activeIndex + offset) % options.length;
          if (enabled(index) && options[index].label.toLocaleLowerCase().startsWith(search)) { activeIndex = index; highlight(); break; }
        }
      }
    });
    menu.addEventListener('pointerdown', event => { if (event.pointerType !== 'touch') event.preventDefault(); });
    menu.addEventListener('click', event => {
      const row = event.target.closest('[data-index]');
      if (row && menu.contains(row) && enabled(Number(row.dataset.index))) choose(Number(row.dataset.index));
    });
    select.addEventListener('input', sync); select.addEventListener('change', sync);
    const observer = new owner.defaultView.MutationObserver(build);
    observer.observe(select, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['id', 'disabled', 'selected', 'label', 'value', 'hidden'] });
    const labelObserver = new owner.defaultView.MutationObserver(sync);
    labels.forEach(label => labelObserver.observe(label, { attributes: true, attributeFilter: ['for'] }));
    for (const name of ['value', 'selectedIndex', 'disabled']) restores.push(watchProperty(select, name, sync));
    function dispose() {
      close(); observer.disconnect(); labelObserver.disconnect(); restores.forEach(restore => restore());
      select.removeEventListener('input', sync); select.removeEventListener('change', sync);
      shared.controls.delete(control); instances.delete(select); menu.remove();
      select.classList.remove('site-dropdown-native'); trigger.remove();
      labels.forEach((label, index) => {
        if (labelTargets[index] === null) label.removeAttribute('for'); else label.htmlFor = select.id || labelTargets[index];
      });
      if (select.parentElement === wrapper) wrapper.replaceWith(select);
    }
    build();
    // Hide the fallback only after enhancement has been fully constructed.
    select.classList.add('site-dropdown-native');
  }
  root.querySelectorAll('select').forEach(enhance);
}

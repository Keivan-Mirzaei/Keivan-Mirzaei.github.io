# Element standards

Keep agreed standards for reusable interface elements here. Add a short section for sliders and other elements as their designs are settled.

## Header and search

- Keep the shared header compact: Home, the current page when away from Home, navigation, search, and any active gadgets. Avoid repeating the site identity in the breadcrumb.
- Retain 44-pixel control targets. Truncate long page titles, simplify search to an icon on phones, and leave space for active timer controls.
- Search opens in a native modal with `/`, `⌘K`, or `Ctrl+K`. Support arrows, Enter, Escape, visible focus, and returning focus to the prior control. Preserve reading position and active gadgets; keep the dedicated search page as the fallback.
- Group active gadget state and the reveal chevron in one bordered control. Reveal a compact card beneath the control, keep Pause/Resume and Stop distinct, and expose sound playback and volume separately. The panel starts closed, stays open while interacting outside, and closes through its trigger, close button, or Escape without shifting the page.

## Dropdowns

- Use one shared dropdown component across articles, lessons, and puzzles for named choices.
- Keep the warm paper surface, forest-green text, fine border, softly rounded corners, and restrained shadow. Highlight the selected row in sage with a checkmark.
- Use text options by default. Add thumbnails only for generic, reusable categories, such as difficulty: Easy uses the circle; Medium, Hard, and Expert use the existing woven-3, woven-5, and woven-7 marks.
- Show a clear label, the current choice, and a chevron. Align the menu with its field and neighbouring controls.
- Start closed. Selection closes the menu; Escape dismisses it without changing the choice. Keep activity state and Undo/Redo synchronized.
- Support keyboard and touch use, visible focus, and a native fallback. Fit phone widths and wrap long labels without clipping.

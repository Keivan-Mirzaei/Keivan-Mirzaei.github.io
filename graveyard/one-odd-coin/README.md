# One Odd Coin — retired

Removed from the active website on 2026-10-18 at the owner's request. Preserved for possible reuse; not published, listed, or searchable. The original implementation is kept without changes.

The folders mirror the repository's original paths. They include the puzzle page, include, stylesheet, controller, mathematics, catalogue, thumbnail, catalogue generator, and dedicated tests. `_data/` contains only this puzzle's former catalogue and widget registry entries.

To restore:

1. Move the files in `puzzles/`, `_includes/`, `assets/`, `scripts/`, and `tests/` back to their matching repository paths. Review any newer shared control or storage APIs before using the controller.
2. Merge the saved entries from `_data/puzzles.yml` and `_data/widgets.yml` into the active registry files; do not overwrite those files.
3. Run the dedicated tests and the site's normal build and validation checks.

The entire `graveyard/` directory is excluded in `_config.yml`. Browser-saved progress was not changed; the original storage key remains in the preserved controller.

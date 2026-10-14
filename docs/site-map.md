# Directory map and maintenance

Start with [README](../README.md) for common edits and [writing](writing.md) for content examples. These are Jekyll's standard folders; keeping their names lets the site build without a custom publishing system.

## Content and settings

| Location | What belongs here |
| --- | --- |
| `_posts/` | Published problems and explorations, named `YYYY-MM-DD-title.md` |
| `_drafts/` | Future post drafts; created when needed and included only with `--drafts` |
| `_research/` | Research summaries, paper metadata, and links |
| `puzzles/`, `gadgets/` | Catalogues and entry pages for games and tools |
| `notes/index.html` | Paginated post archive |
| `index.html`, `about.md`, `research.html` | Main section pages |
| `problems.md`, `explorations.md` | Lists filtered by post format |
| `math.md`, `code.md`, `experiments.md` | Existing subject indexes |
| `search.html`, `search.json` | Search page and template for its generated index |
| `_config.yml` | Site name, contact details, domain, collections, defaults, and exclusions |
| `_data/` | Small editable lists and settings used by templates |

Important data files: `navigation.yml` controls the menu; `home_sections.yml` controls homepage cards; `puzzles.yml` and `gadgets.yml` control their catalogues. `problem_logos.json` maps the four problem marks. `widgets.yml` lists activity assets. `ambient_sounds.yml` and `chimes.yml` list audio choices; `graph_libraries.yml` pins Three.js for the stereographic activity.

The existing posts are enabled for publication.

## Presentation and media

| Location | Purpose |
| --- | --- |
| `_layouts/` | Complete page templates; `default.html` is the shared frame |
| `_includes/` | Reusable cards, navigation, controls, and activity markup |
| `_includes/widgets/`, `_includes/puzzles/` | Article activities and game panels |
| `_includes/gadgets/` | Gadget controls, panels, and persistent header dock |
| `assets/css/` | Shared and activity-specific styles |
| `assets/js/widgets/` | Activity controllers |
| `assets/js/lib/` | Shared mathematics, drawing, history, storage, and workers |
| `assets/js/gadgets/` | Timer, sound, and gadget services |
| `assets/images/` | Logos, catalogue thumbnails, and board previews |
| `assets/figures/` | Mathematical illustrations used within articles |
| `assets/audio/` | Ambient sounds and their credits |
| `assets/papers/`, `assets/explorations/` | Linked PDFs |

Edit finished SVG artwork directly. The website uses the saved image files; it does not need the one-off scripts that originally drew them. Keep paths stable when replacing artwork so existing page references continue to work. See [design standards](element-standards.md#content-artwork).

`pages/` contains redirects for former addresses. `404.html`, `CNAME`, `favicon.ico`, and `apple-touch-icon.png` also belong at the root. The old raster figure has been replaced by the vector illustration used by the trigonometry article.

## Find an activity's files

Start with its name in `_data/widgets.yml`. The record gives the controller, activation selector, and required styles. A page's `widgets: [hex]` field asks `_includes/widget-assets.html` to supply that record to the loader in `assets/js/widgets.js`.

An activity usually has matching names in `_includes/widgets/`, `assets/js/widgets/`, and `assets/css/`. The controller imports its mathematics and drawing helpers from `assets/js/lib/`. The Hex article and standalone game reuse `_includes/puzzles/hex.html`; other shared games follow the same pattern.

Controllers export `mount(root)` and return cleanup for listeners, timers, workers, observers, and renderers. `assets/js/app.mjs` manages page features when navigating between pages. Keep mathematical rules separate from event handling where useful. Shared controls live in `_includes/controls/`; history, panels, and storage helpers live in `assets/js/lib/`.

The persistent site frame lets running timers and sound continue between pages. Ordinary visits use browser navigation; `app.mjs` enables the shared page loader only while a gadget is starting, sound is playing, or a timer is running. Pending visits show loading feedback, repeated clicks keep the same request, and a five-second deadline falls back to browser navigation. `gadgets/service.mjs` owns the active timer and independent sound session; `model.mjs` handles timer calculations; `audio.mjs` owns playback; `ui.mjs` connects the dock and current workspace to that service. Use the existing service for new controls rather than creating another timer or audio player. Search is shared by the header dialog and dedicated page through `site-search.mjs`.

The planar-graphs article uses `stereographic-projection` for its Three.js view. Its controller and `stereographic-math.mjs` share exact geometry; `interactive-view.mjs` handles opening, closing, loading feedback, and disposal. Keep heavy imports inside activation and retain the static SVG preview. Ordinary pages do not download Three.js.

## Maintenance tools

Only recurring tools remain in `scripts/`:

| Script | Purpose |
| --- | --- |
| `new_post.py` | Create content from `docs/templates/` without overwriting saved work |
| `optimize_build.py` | Add content-based asset versions to the generated site |
| `check_site.py` | Validate links, headings, images, search, feed, sitemap, exclusions, and unused assets, including imported modules and computed sound URLs |
| `lights_out_catalogue.mjs` | Rebuild the deterministic Lights Out puzzle catalogue |
| `tiling_catalogue.mjs` | Rebuild the deterministic tiling puzzle catalogue |

Puzzle numbers are tied to saved progress. Regenerate a catalogue only for an intentional catalogue change; ordinary content editing does not require it. `tests/` checks the maintained mathematics, controllers, storage, navigation, authoring, and asset versions. Keep tests for retained behavior.

The three guides in `docs/` and three starter files in `docs/templates/` are maintenance material and are excluded from publication. Historical plans, review transcripts, and completed production scripts belong in Git history rather than the working directory.

## Build files and cleanup

`Gemfile` and `Gemfile.lock` define Ruby dependencies. `.github/workflows/pages.yml` builds, checks, and deploys. `.gitignore` excludes local dependencies and generated files. `.git/` is version history.

`_site/`, `.jekyll-cache/`, and Python caches can be removed when no build is running. They return as needed. Build and check using the commands in [README](../README.md#check-and-publish). For a site with a nonempty `baseurl`, pass it after the destination to both build scripts, for example `python3 scripts/check_site.py _site /repository`.

Before removing a page or asset, search for its filename and URL in content, data, templates, imports, and styles. Keep linked downloads and compatibility URLs. When removing an unused activity, remove its registry entry and dedicated tests too, then rebuild and check the remaining site.

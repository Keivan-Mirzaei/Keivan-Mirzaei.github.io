# Where everything lives

Almost Obvious is a static Jekyll site. You edit Markdown, small data files, and shared templates. Jekyll turns them into the pages served by GitHub Pages. The browser runs the activities locally.

## Directory map

```text
Keivan-Mirzaei.github.io/
├── _posts/                Published problems and explorations, named YYYY-MM-DD-title.md
├── _drafts/               Post drafts; included only with --drafts
├── _modules/              Learning-module overview pages, including derivatives.md
├── _lessons/derivatives/  The five individual derivative lessons
├── _research/             Research summaries and paper metadata
├── learning/              Course overview pages, including introductory-calculus.md
├── notes/index.html       Template for the paginated post archive
├── puzzles/               Puzzle catalogue and small standalone game entry pages
├── gadgets/               Gadget catalogue, exam clock, Pomodoro, and sound workspaces
├── _data/                 Shared lists and activity configuration
│   ├── navigation.yml     Main sidebar links
│   ├── formats.yml        Names and descriptions of content formats
│   ├── courses.yml        Course cards and roadmaps
│   ├── modules.yml        Module order and lesson navigation
│   ├── puzzles.yml        Puzzle cards; add a game here to list it
│   ├── widgets.yml        Activity scripts, activation selectors, and required styles
│   ├── gadgets.yml        Gadget catalogue: stable IDs, titles, routes, descriptions, icons
│   └── graph_libraries.yml  Pinned optional Plotly/Three.js library URLs
├── _layouts/              Whole-page templates
│   ├── default.html       Shared site frame: sidebar, top bar, footer, assets
│   ├── post.html          Problems and explorations
│   ├── page.html          Ordinary Markdown pages
│   ├── puzzle.html        Focused game content inside the shared persistent frame
│   ├── learning.html      Learning index
│   ├── course.html        Course overview
│   ├── module.html        Module and individual lesson pages
│   ├── research.html      Research entry pages
│   ├── format.html        Problem/exploration indexes
│   ├── category.html      Subject indexes retained for existing addresses
│   └── redirect.html      Compatibility redirects
├── _includes/             Reusable pieces of pages
│   ├── controls/          Shared action buttons, Undo/Reset row, and compact Help
│   ├── puzzles/           Game panels and optional progress setting
│   ├── widgets/           Activity markup and small inline SVG previews
│   ├── gadgets/           Persistent dock, active controls, and shared gadget setup
│   ├── icon.html          One source for interface icons
│   ├── site-icons.html    One source for favicon and touch-icon links
│   ├── content-logo.html  Shared problem, exploration, and puzzle logo renderer
│   ├── widget-assets.html One source for activity styles and deferred loading
│   ├── tilted-square.html Homepage visual proof
│   └── *.html             Cards, navigation lists, media embeds, and shared links
├── assets/                Files visitors actually download
│   ├── css/               Main styles, shared controls, and activity-specific styles
│   ├── js/
│   │   ├── app.mjs        Page lifecycle, lazy feature mounting, and MathJax loading
│   │   ├── navigation.js  Sidebar, keyboard search shortcut, bounded page prefetch
│   │   ├── search.js      Search UI; fetches the index when needed
│   │   ├── widgets.js     Activates activities near the reader; games start immediately
│   │   ├── widgets/       Controllers exporting mount(root) and a disposal function
│   │   ├── gadgets/       Timer model, singleton service, audio player, and views
│   │   └── lib/           Shared maths, renderers, undo history, storage, and workers
│   ├── images/            Game boards, course art, and cacheable activity previews
│   ├── figures/           Static mathematical illustrations
│   ├── papers/            Thesis PDF
│   ├── explorations/      Supporting exploration PDF
│   └── favicon.svg        Master vector logo, reused in navigation and browser tabs
├── Figures/1001.png       Original trigonometry figure; kept at its published address
├── pages/                 Redirects for old /pages/ URLs; keep these for existing links
├── docs/
│   ├── site-map.md        This maintenance guide
│   ├── writing.md         Content-authoring instructions and examples
│   ├── logo-roadmap.md    Shared logo standard and reusable problem family
│   ├── gadget-roadmap.md  Agreed Gadgets behaviour, implementation record, and future growth
│   ├── advanced-graphs.md Optional interactive graph authoring
│   ├── introductory-calculus-plan.md  Course planning notes
│   └── templates/         Starter Markdown for each content format
├── scripts/               Authoring, preview generation, build optimization, checks
├── tests/                 Mathematical, controller, authoring, and asset-version tests
├── .github/workflows/     GitHub Pages build, checks, and deployment
├── index.html             Homepage composition
├── about.md               Editable biography and LinkedIn profile link
├── learning.html          Learning index entry page
├── research.html          Research index entry page
├── problems.md, explorations.md  Content-format indexes
├── math.md, code.md, experiments.md  Existing subject indexes
├── search.html            Search page
├── search.json            Search-index template; Jekyll fills it from the content
├── 404.html               Missing-page response
├── _config.yml            Site identity, URL, collections, defaults, build exclusions
├── Gemfile, Gemfile.lock  Ruby dependencies and locked versions
├── CNAME                  Custom domain for GitHub Pages
├── favicon.ico, apple-touch-icon.png  Browser/iOS exports of the vector logo
├── .gitignore             Generated/local files that must stay out of Git
├── LICENSE                Repository licence
└── README.md              Quick start and links to these guides
```

`_site/`, `.jekyll-cache/`, `__pycache__/`, and dependency folders are generated locally, ignored by Git, and safe to remove when no build is running. Do not edit `_site/`: the next build replaces it. `.git/` contains version history and should be left alone. Documentation, scripts, tests, and drafts are excluded from the published site.

## What to edit

| Task | Edit here | What updates automatically |
| --- | --- | --- |
| Publish a problem or exploration | `_posts/` | Archive, relevant format index, search, feed |
| Write privately | `_drafts/`, or `published: false` on a module | Excluded from ordinary builds |
| Revise a lesson | `_lessons/derivatives/` | That lesson page and searchable text |
| Change a course or module roadmap | `_data/courses.yml`, `_data/modules.yml` | Cards and lesson navigation |
| Add or revise research | `_research/` | Research index |
| Update biography or professional profile | `about.md`, `linkedin_url` in `_config.yml` | About page and shared LinkedIn links |
| Change the sidebar | `_data/navigation.yml` | Every ordinary page |
| Change colours or reading-page alignment | `assets/css/site.css` | All ordinary pages |
| Change button sizing or Help behavior | `assets/css/controls.css`, `_includes/controls/`, `assets/js/widgets.js` | Shared activity and game controls |
| Change dropdown appearance or behavior | `assets/css/dropdown.css`, `assets/js/lib/dropdown.mjs`, `_includes/widget-assets.html` | One component for named choices; follow `docs/element-standards.md` |
| Change a particular activity | `_includes/widgets/`, `assets/js/widgets/`, its registered CSS | Every page embedding it |
| Change Hex | `_includes/puzzles/hex.html`, `assets/js/widgets/hex.mjs`, `assets/js/lib/hex-*` | Both the article game and standalone game |
| Add a game to the catalogue | `_data/puzzles.yml` | `/puzzles/` |
| Select a problem's logo | Its front matter `difficulty: 1`–`4` | The shared mark in every list and article heading |
| Change content logo artwork | Family generator and image metadata; see [logo roadmap](logo-roadmap.md) | Every occurrence of the same reusable SVG |
| Plan or extend the Gadgets section | [gadget-roadmap.md](gadget-roadmap.md) | Records decisions, implemented behaviour, validation, and future development phases |
| Change the logo | `assets/favicon.svg`; regenerate the `.ico` and touch exports | Sidebar, top bar, browser tabs; iOS uses its PNG export |

## How shared activities fit together

```text
page front matter: widgets: [hex]
                 │
                 ▼
_data/widgets.yml ──► _includes/widget-assets.html
                       │ required CSS + loading descriptor
                       ▼
                  assets/js/widgets.js
                       │ activates one controller when needed
                       ▼
                  assets/js/widgets/hex.mjs
                       │ imports maths, worker, storage and shared helpers
                       ▼
                  assets/js/lib/

article ──► _includes/widgets/hex-game.html ─┐
                                         ├──► _includes/puzzles/hex.html
standalone puzzle ────────────────────────┘
```

Add an activity to the registry with `script`, `selector`, and `styles`. The selector must match its rendered panel. Register linked diagrams together when one controller updates all of them. List the activity in the page's `widgets` front matter; do not copy script tags into the article. The shared loader downloads each registered controller once, calls its exported `mount(root)` on each visit, and calls the returned cleanup when leaving. Static content and native Help disclosures remain available without JavaScript.

Use `_includes/controls/panel.html` for a compact Undo/Reset/Help row. A controller can use `bindInputHistory` for form-based views, or `bindPanelHistory` for internal state. Undo records one slider edit rather than every animation frame, and shared history keeps at most 60 snapshots. Existing games keep their own turn-aware undo and redo rules.

Keep board renderers and game rules in `assets/js/lib/`; keep browser event handling in `assets/js/widgets/`. The logo and board previews use shared asset paths. Large static diagrams belong in `assets/images/` so they can be cached. Small interactive SVGs may stay inline when their individual elements need to be styled or manipulated.

## Preview, verify, publish

For ordinary editing:

```sh
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000`. Add `--drafts` for draft posts and `--unpublished` for unpublished collection entries. Refresh after editing shared JavaScript. The development server serves the source asset names directly.

To verify the same asset versions used for deployment:

```sh
bundle exec jekyll build --strict_front_matter
python3 scripts/optimize_build.py
python3 scripts/check_site.py
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
```

The optimizer adds a content hash to asset URLs in the generated site, including module imports and workers. Unchanged assets keep the same URL across releases. If a shared dependency changes, its importing controllers get a new version too. You do not need to maintain version numbers or regenerate source files. For a site with `baseurl: /repository`, pass that value as the second argument to both build scripts: `python3 scripts/optimize_build.py _site /repository` and `python3 scripts/check_site.py _site /repository`.

The GitHub Actions workflow runs these steps before publishing pushes to `main`. Pull requests are checked without being published. Existing compatibility pages and the `Figures/` image stay because people may have bookmarked their URLs. `pages/linkedin.html` and `pages/CV.html` send the former CV addresses to the configured LinkedIn profile; the CV content and PDF have been removed.

| Helper script | Purpose |
| --- | --- |
| `new_post.py` | Create content from the starter templates |
| `check_site.py` | Check built page structure, links, lazy activity scripts, search, feed, and sitemap |
| `optimize_build.py` | Version generated browser assets and their dependencies by content |
| `hex_previews.mjs`, `cevian_previews.mjs`, `magician_previews.mjs` | Regenerate the diagrams used by those activities |
| `exploration_thumbnails.mjs` | Regenerate exploration SVG logos using shared geometry, mathematics, and saved formula outlines; see the [logo roadmap](logo-roadmap.md) |
| `problem_logos.mjs` | Regenerate the four shared circle/woven-loop marks from `_data/problem_logos.json` |
| `puzzle_thumbnails.mjs`, `four_regions_preview.mjs` | Regenerate the existing puzzle catalogue marks from their game geometry |
| `advanced_previews.py`, `graph_data.py` | Prepare optional static previews and scientific plot data |
| `tiling_catalogue.mjs` | Generate the deterministic tiling puzzle catalogue |

To regenerate mathematical board or chart previews, run the matching script in `scripts/`: `hex_previews.mjs`, `cevian_previews.mjs`, or `magician_previews.mjs`. The Cevian generator also embeds drawing styles in its standalone landscape SVG. `tiling_catalogue.mjs` regenerates the deterministic tiling catalogue; its tests validate the generated puzzles.


## Gadgets and page navigation

The catalogue is `_data/gadgets.yml`. Entry pages live in `gadgets/`; all have real, searchable URLs and use the existing Jekyll layout. `section: gadgets` selects the workspace style; `gadget: exam`, `pomodoro`, or `sound` identifies a setup page. Add new catalogue entries only when their pages are ready.

`assets/js/app.mjs` loads ordinary page features when needed. `lib/site-navigation.mjs` fetches eligible internal pages and replaces only `[data-page-content]`. The sidebar, header, active-controls panel, and gadget service stay alive. Page styles and configuration are replaced together; titles, descriptions, canonical links, breadcrumbs, history, scroll, focus, and MathJax are maintained. External, download, modified, and new-tab links keep their normal browser behaviour. Failed requests fall back to a document load. Puzzles share this shell with a focused layout and hidden sidebar/footer.

Every activity controller exports `mount(root)` and returns a cleanup function. The root is the incoming content, not the whole document. New controllers should own listeners with an AbortController and release observers, animation frames, timers, workers, and renderers on disposal. Existing legacy activities use `lib/page-environment.mjs` for scoped browser APIs; it does not modify global browser functions. An optional renderer loading after a page has been left must dispose its result immediately. Register new page-level features in `app.mjs`, rather than adding auto-running script tags to layouts.

`gadgets/service.mjs` owns the one active timer and independent sound session. `model.mjs` provides deadline calculations, restoration validation, phase transitions, and safe rule formatting. `audio.mjs` creates one Web Audio context on a user action, uses one looping source, and releases it on pause or stop. `ui.mjs` subscribes the permanent dock and current workspace to the same service. The service is loaded only on Gadgets pages or when saved sessions exist. No timer loop runs without a running timer; hidden pages catch up by deadline when they return. The two noise choices require no audio file transfer.

State uses the versioned local-storage key `almost-obvious:gadgets:v1`. Running timers count elapsed time across reloads; paused timers remain paused. Reopened audio always waits for Play. Storage events synchronize sessions between tabs, and BroadcastChannel discovers a live sound owner. Deliberate playback in another tab pauses the old player. Settings and rules stay on this device. If storage is blocked, the current session still works and the UI reports that it could not save.

Screen awake is a browser request for an active, visible timer. The service releases it on pause, completion, stopping, or hidden-page transitions, and retries on becoming visible. The interface reports actual availability, denial, and release. It cannot override operating-system policy. Presentation mode uses native fullscreen when available and a spacious in-browser view otherwise; it isolates focus and exits through its own button or Escape.

To extend the runtime, add a model and workspace with explicit actions, subscribe to the existing service, and add compact controls only if the gadget has an ongoing session. Keep page setup out of the dock. Update the registry, roadmap, and meaningful transition tests, then run the verification commands above. Publishing remains a separate step.

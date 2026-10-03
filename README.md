# Almost Obvious

A small Jekyll site for problems, explorations, learning modules, and a research showcase. Write posts and pages in Markdown; shared templates build the navigation, article pages, paginated archive, search index, RSS feed, and sitemap.

The browser uses plain HTML, CSS, and a little JavaScript. There is no front-end framework, database, font service, or search service. MathJax loads only on pages with equations. Posts, navigation links, and solution disclosures work without JavaScript; full-text search and sidebar toggling use JavaScript.

## Write

Add problems and explorations in `_posts`, learning modules in `_modules`, and research in `_research`, or run:

```sh
python3 scripts/new_post.py "An interesting problem" --type problem --math
python3 scripts/new_post.py "Following an idea" --type exploration --draft
python3 scripts/new_post.py "A lesson for students" --type module --draft
python3 scripts/new_post.py "My research project" --type research --draft
```

Edit `cv.md` for the CV and `_data/navigation.yml` for sidebar links. See [the writing guide](docs/writing.md) for examples, drafts, equations, new pages, and migration details.

## Preview locally

Install Ruby 3.3 or newer and Bundler, then:

```sh
bundle install
bundle exec jekyll serve
```

Open http://127.0.0.1:4000. For post drafts, add `--drafts`; for unpublished modules, lessons, and research, add `--unpublished`. Generated files go in `_site` and are never committed. If port 4000 is already used, add `--port 4001`.

## Verify

```sh
bundle exec jekyll build --strict_front_matter
python3 scripts/check_site.py
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
```

The check validates local links and anchors, page headings, image descriptions, search coverage, the feed, the sitemap, and exclusion of authoring files. It also runs in GitHub Actions on pull requests and before publishing.

## Publish on GitHub Pages

1. In the repository’s **Settings → Pages**, select **GitHub Actions** as the build source.
2. Keep the custom domain `keivan-mirzaei.com` configured there. `CNAME` and `_config.yml` already use it.
3. Push the reviewed changes to `main`. The included workflow builds, checks, and deploys the site. Pull requests are built and checked without deploying.

No website content has to be generated or pasted by hand. These local changes do not publish until pushed. See GitHub’s [custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

For a project site at `username.github.io/repository`, set `url` to `https://username.github.io`, `baseurl` to `/repository`, and remove or replace `CNAME`. Internal links use `relative_url` so they follow this setting. The current personal domain uses an empty `baseurl`.

## Structure

```text
_posts/                 Published Markdown notes
_drafts/                Unpublished posts
_modules/               Learning-module overviews and single-page modules
_lessons/               Individual pages within learning modules
_research/              Research projects, papers, and thesis work
_data/navigation.yml    Sidebar links
_layouts/, _includes/   Shared templates
assets/                 CSS, JavaScript, widgets, and media
docs/templates/         Starter content for all four entry types
cv.md, about.md          Editable standalone pages
notes/index.html        Paginated archive
search.json             Generated search index template
scripts/                Optional authoring helper and build checks
```

The CV is updated through September 2026, including the Eric Milner Prize, Winter 2026 Graduate Assistant Teaching Excellence Award, Fall 2026 teaching at Bow Valley College and the University of Calgary, recent curriculum development, talks, projects, and skills. It links to the updated September 2026 PDF and lists preprints from the research collection automatically. The notebook contains the five retained original posts and four additional problems. Complete solutions accompany the spaceship detector problem, the expected chord length, and the perfect-cube problem. The duplicate absolute-value problem redirects to the original Conservative Polynomials article. The research section lists two arXiv preprints with author credits, summaries, and PDF links, followed by the 2021 MSc thesis with a verified overview, supervision details, and its original PDF. The newer preprint is featured on the homepage.

Sample posts, demonstration research entries, their unused media, and obsolete copies of the original website have been removed. Earlier versions remain in Git history. Reusable activities support graphing, probability, a card trick, and random walks. Scripts load only where used. Starter content remains in `docs/templates/`.

Learning modules have their own collection and index, separate from posts, the post archive, and the post RSS feed. The derivatives course has a short overview with motivation, objectives, and a table of contents, followed by five separate lesson pages with course-order navigation. It develops the derivative from average rates, derives the rules, introduces implicit, inverse, logarithmic, and parametric techniques, and returns to differentiability as local linearity. Twenty problems include hidden hints and solutions, followed by three synthesis tasks. Secant and magnification activities include rigorous error bounds and explicitly represent rational/irrational branches. The overview is the single entry in the learning-module list; individual lessons remain searchable. Its existing overview and lesson addresses are preserved.

Advanced graphs add two optional components: `scientific-plot` reads Plotly JSON data; `sphere-slice` demonstrates a custom Three.js scene. Both show a static SVG preview first. Plotly, Three.js, and graph data load only after **Open interactive view** is pressed. Closing a view releases its renderer. The 3D dependencies use pinned CDN versions configured in `_data/graph_libraries.yml`, so opening these activities needs a network connection and compatible browser graphics. The ordinary posts and existing SVG activities do not load either library.

The [advanced graph guide](docs/advanced-graphs.md) covers authoring, supported plot types, generating data in Python, and extending the scene. No Node packages or front-end build step are needed. Node.js 18 or newer is used only for the small geometry test suite.

The Lights Out exploration connects the arXiv preprint to eight playable grid and graph boards. It includes minimum-press solutions, alternative press sets and their parity, fixed complement targets, editable starting lights, an impossibility witness, and a step-through of the paper’s inductive construction. The game runs locally in the browser without additional libraries; its binary solver and combinatorial construction are checked against every simple graph through five vertices. The full proofs and a solved static example remain available without JavaScript.

The Hex exploration includes 5 × 5 and 7 × 7 boards, a Hard computer opponent, first-or-second turn selection, and undo. An editable full board traces a coastline between the colours and reveals a winning chain, alongside a complete no-draw proof. The opponent recognizes bridges, shares move statistics across simulated continuations, and solves positions with at most twelve empty cells exactly within its search budget. Computer search gets up to 1.5 seconds on small boards or 2 seconds on larger boards, in a local worker with a cooperative fallback. The rules and static diagrams remain available without JavaScript. Run `node scripts/hex_previews.mjs` to regenerate the two illustrations; the tests exhaust every colouring through 3 × 3, sample larger boards, and compare strategic computer moves with an independent game solver.

The Puzzles section at `/puzzles/` lists standalone games through `_data/puzzles.yml`. Hex at `/puzzles/hex/` uses a quiet game layout with no article, sidebar, or math scripts. Its board-size slider runs from 3 × 3 through 11 × 11, with 5 × 5 as the default. Players can go first as Red, go second as Blue, or play both colours locally. Red always begins. Changing a setting starts a fresh game; undo removes a full human turn against the computer or one move in local play. The standalone game shares the exploration's computer search and board renderer. Hex uses an upright diamond, solid coloured stones, a background tint on the winning path, and a hex outline on the latest move. Board size, turn order, and progress settings are in a compact menu.

Klotski at `/puzzles/klotski/` uses the classic sliding-block board. Select a block and move with the arrows, keyboard, or a drag; bring the marked large block to the bottom exit. Floor tiling at `/puzzles/tiling/` provides six solvable floors with missing squares and exactly enough tiles to fill each floor. Select a tile, rotate or flip it, and place it without crossing the floor boundary or covering another tile. Both games include undo and restart, run locally without additional libraries, and keep the same focused game layout. Per-game styles are listed in the page's `styles` front matter.

The three-utilities problem fits smooth curves through selected path points or traced routes. Selecting an existing pair removes its pipe; choosing a new path replaces it, and Undo restores either change. A single rotatable 3D surface forms the mug, becomes a torus, and opens into a square. Its nine-pipe solution uses cubic curves and adds the two routes through paired edges one at a time. The renderer uses native canvas and SVG without external graphics libraries. Tests check the smoothed routes, editing behavior, seam tangents, and continuous surface deformation; static diagrams and the Euler proof remain available without JavaScript.

The `.gitignore` excludes generated output, dependency folders, caches, local environment files, editor settings, and temporary files. Keep source Markdown, required assets, `Gemfile.lock`, and the thesis PDF in Git. The original trigonometry figure and compatibility redirects remain so existing links continue to work.

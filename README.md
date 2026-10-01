# Almost Obvious

A small Jekyll site for problems, explorations, learning modules, and a research showcase. Write posts and pages in Markdown; shared templates build the navigation, article pages, paginated archive, search index, RSS feed, and sitemap.

The browser uses plain HTML, CSS, and a little JavaScript. There is no front-end framework, database, font service, or search service. MathJax loads only on pages with equations. Posts, navigation links, and solution disclosures work without JavaScript; full-text search and sidebar toggling use JavaScript.

## Write

Add a file in `_posts`, or run:

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

Open http://127.0.0.1:4000. For drafts, add `--drafts`. Generated files go in `_site` and are never committed. If port 4000 is already used, add `--port 4001`.

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

Sample posts, demonstration research entries, their unused media, and obsolete copies of the original website have been removed. Earlier versions remain in Git history. Five reusable activities support graphing, probability, a card trick, and random walks. Scripts load only where used. The learning section is ready for your own lessons; starter content remains in `docs/templates/`.

Advanced graphs add two optional components: `scientific-plot` reads Plotly JSON data; `sphere-slice` demonstrates a custom Three.js scene. Both show a static SVG preview first. Plotly, Three.js, and graph data load only after **Open interactive view** is pressed. Closing a view releases its renderer. The 3D dependencies use pinned CDN versions configured in `_data/graph_libraries.yml`, so opening these activities needs a network connection and compatible browser graphics. The ordinary posts and existing SVG activities do not load either library.

The [advanced graph guide](docs/advanced-graphs.md) covers authoring, supported plot types, generating data in Python, and extending the scene. No Node packages or front-end build step are needed. Node.js 18 or newer is used only for the small geometry test suite.

The `.gitignore` excludes generated output, dependency folders, caches, local environment files, editor settings, and temporary files. Keep source Markdown, required assets, `Gemfile.lock`, and the thesis PDF in Git. The original trigonometry figure and compatibility redirects remain so existing links continue to work.

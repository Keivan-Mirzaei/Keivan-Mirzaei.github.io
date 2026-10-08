# Almost Obvious

A small Jekyll site for problems, explorations, learning modules, a research showcase, and small study gadgets. Write posts and pages in Markdown; shared templates build the navigation, article pages, paginated archive, search index, RSS feed, and sitemap.

The browser uses plain HTML, CSS, and a little JavaScript. There is no front-end framework, database, font service, or search service. MathJax loads only on pages with equations. Posts, navigation links, and solution disclosures work without JavaScript; full-text search, sidebar toggling, and gadgets use JavaScript. Enhanced internal navigation keeps active timers and sound running between pages.

The compact header shows Home and the current page. Click Search, press `/`, or use `⌘K` / `Ctrl+K` to search without leaving the page. Arrow keys move through results; Enter opens a result and Escape closes search. The full search page remains available for longer result lists, and the header link opens it when modal search is unavailable.

## Write

Add problems and explorations in `_posts`, learning modules in `_modules`, and research in `_research`, or run:

```sh
python3 scripts/new_post.py "An interesting problem" --type problem --math --difficulty 2
python3 scripts/new_post.py "Following an idea" --type exploration --draft
python3 scripts/new_post.py "A lesson for students" --type module --draft
python3 scripts/new_post.py "My research project" --type research --draft
```

Edit `about.md` for your biography, `linkedin_url` in `_config.yml` for your LinkedIn profile, and `_data/navigation.yml` for sidebar links. See [the writing guide](docs/writing.md) for examples, drafts, equations, new pages, and migration details.

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
python3 scripts/optimize_build.py
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

## Maintain

Use the [directory map and maintenance guide](docs/site-map.md) to find the source for any page, game, asset, or shared control. The [writing guide](docs/writing.md) covers new content and the [advanced graph guide](docs/advanced-graphs.md) covers optional Plotly and Three.js views.

The logo, interface icons, activity registry, and panel controls each have one shared source. The Hex article and standalone game use the same panel, renderer, rules, computer search, and undo behavior.

For widget changes, follow the [widget requirements](docs/widget-requirements.md) and [element standards](docs/element-standards.md). Keep shared control standards together in the latter as more elements are reviewed.

The [content logo roadmap](docs/logo-roadmap.md) covers problems, explorations, and puzzles. Problems choose one of four reusable circle/woven-loop marks through their internal `difficulty` value. Post headings, post lists, and puzzle cards share one logo renderer.

The [gadgets roadmap](docs/gadget-roadmap.md) records the agreed behaviour and remaining growth ideas. The first release includes an exam clock with formatted rules and presentation mode, Pomodoro, independent ambient sound, and persistent header controls. See [gadget maintenance](docs/site-map.md#gadgets-and-page-navigation) before extending the section.

Activity styles load only where required. Article controllers activate near the reader; standalone games activate immediately. Heavy graph libraries still load only after opening their interactive views. Search downloads its index on demand. Navigation prepares only HTML on a brief mouse hover, keyboard focus, or touch press, and clicks reuse those requests. An in-memory cache retains at most eight pages for five minutes, capped at 256 Ki characters; up to twelve loaded page stylesheets are retained with only the current page's styles active. Speculation is limited to two simultaneous requests and respects reduced-data connections. No widgets, audio or graph libraries are downloaded speculatively.

Production builds run `scripts/optimize_build.py` after Jekyll. It versions generated assets by their content, including imported modules and workers, so unchanged files keep cacheable URLs between releases. No manual cache versions or copied scripts are needed.

Generated output and caches are ignored. Keep source content, needed media, compatibility redirects, `Gemfile.lock`, and the original published figure in Git.

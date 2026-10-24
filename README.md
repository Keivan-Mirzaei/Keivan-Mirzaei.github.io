# Almost Obvious

A Jekyll website for mathematical problems, explorations, research, puzzles, and study gadgets. Edit the source files below; Jekyll builds the pages, navigation, search index, feed, and sitemap.

## Start with the file you want to change

| Change | File or folder |
| --- | --- |
| A problem or exploration | `_posts/` — find the dated filename matching its title |
| Research | `_research/` |
| Biography or contact details | `about.md`, `_config.yml` |
| Homepage | `index.html`, `_data/home_sections.yml` |
| Learning topics | `learning/`, `_layouts/learning-topic.html` — see [the learning guide](docs/learning-roadmap.md) and [starter](docs/templates/learning-topic.md) |
| Menu links | `_data/navigation.yml` |
| Puzzle or gadget catalogue | `_data/puzzles.yml`, `_data/gadgets.yml` |
| Applications and app support | `_data/applications.yml`, `applications/`, `laser-pointer/` |
| Artwork | `assets/images/`, `assets/figures/` — edit the SVG itself |
| Shared appearance | `assets/css/site.css` |

The [directory map](docs/site-map.md) explains the remaining folders and shared code. The [writing guide](docs/writing.md) has copyable examples. The [design standards](docs/element-standards.md) collect the writing, artwork, and interaction conventions.

## Preview

Install Ruby 3.3 or newer and Bundler, then run from this folder:

```sh
bundle install
bundle exec jekyll serve --livereload
```

Open <http://127.0.0.1:4000>. Changes rebuild the site and refresh the browser automatically. Refresh an already-open page once after enabling live reload. Restart after changing `_config.yml`.

## Create content

Copy an existing post or use the optional starter helper:

```sh
python3 scripts/new_post.py "An interesting problem" --type problem --math --difficulty 2
python3 scripts/new_post.py "Following an idea" --type exploration --draft
```

Future post drafts go in `_drafts/`, which the helper creates when needed. Preview with `--drafts`. For unpublished research, use `published: false` and preview with `--unpublished`. See the [writing guide](docs/writing.md#drafts-and-publication) before publishing.

## Check and publish

```sh
bundle exec jekyll build --strict_front_matter
python3 scripts/optimize_build.py
python3 scripts/check_site.py
python3 -m unittest discover -s tests
node --test tests/*.test.mjs
```

The site check also flags assets that no page or runtime dependency uses. GitHub Actions runs these checks on pull requests and pushes. A push to `main` publishes to `keivan-mirzaei.com`; editing locally does not publish. The repository's Pages source must be **GitHub Actions**. `CNAME` and `_config.yml` hold the custom domain.

Keep `Gemfile.lock`, published media, and the compatibility pages in version control. `_site/`, caches, and local dependencies are generated and ignored. Never edit `_site/`; the next build replaces it.

## License

All rights reserved, with limited permission for personal reading and use of the website. Copying, modification, redistribution, and commercial reuse require prior written permission unless separately licensed or otherwise permitted by law. See [LICENSE](LICENSE) for the terms and exceptions, including earlier MIT-licensed versions and separately licensed assets.

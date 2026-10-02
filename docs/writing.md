# Writing and maintaining the notebook

## Choose a format

Problems and explorations are the two post formats. Learning modules have their own section and collection. Topics such as probability, geometry, Python, or mathematical finance belong in `tags` and remain searchable.

| Format | Use it for | What the template adds |
| --- | --- | --- |
| `problem` | A question, with or without a solution | An optional solution that starts closed |
| `exploration` | A short observation or a long investigation | An open-ended article with mixed media |
| `module` | A lesson for students | Objectives, prerequisites, optional duration, and interactive components |
| Research entry | A paper, thesis, or research project | A separate showcase page, resource links, and optional homepage feature |

Problems and explorations live in `_posts/YYYY-MM-DD-short-title.md`. Learning modules live in `_modules/short-title.md`, with new module addresses at `/learning/short-title/`. Research entries live in `_research/short-title.md`. Existing `/notes/.../` addresses stay stable when you change a post's format; the derivatives module and its lessons also retain their existing addresses.

## Create an entry

Create a Markdown file directly in GitHub's editor, or use the optional helper:

```sh
python3 scripts/new_post.py "An interesting problem" --type problem --math
python3 scripts/new_post.py "A challenge to think about" --type problem --without-solution
python3 scripts/new_post.py "Exploring the magician's problem" --type exploration --math --draft
python3 scripts/new_post.py "Understanding a quadratic" --type module --draft
python3 scripts/new_post.py "My research project" --type research --draft
```

The helper copies a starter from `docs/templates/`. Replace its example text before publishing. It never overwrites an existing entry. You can use `--slug` for a custom URL name and `--date YYYY-MM-DD` for a post date. Research URLs do not use dates.

The homepage, format lists, learning index, paginated post archive, search index, RSS feed, and sitemap update at build time. Learning modules appear in the learning index and search, separately from posts and their RSS feed. Do not edit generated files in `_site`.

## Problems: write normally, add a solution if you want

```markdown
---
title: An interesting problem
description: One sentence to introduce the question.
format: problem
tags: [probability]
math: true
---

State the problem here.

<!-- solution -->

Write the solution here using ordinary Markdown.
```

Everything after the single `<!-- solution -->` marker becomes a native disclosure that starts closed. There is no need to write the disclosure's HTML. Omit the marker and solution entirely for a problem without a solution. The disclosure works without JavaScript. This is a reading aid, not access control: the solution is still present in the downloaded page.

For a separate hint, you can use a smaller disclosure before the solution marker:

```html
<details markdown="1">
<summary>A hint</summary>

Write the hint here.

</details>
```

## Explorations: combine the media the idea needs

Use `format: exploration`. The body can be as short or as long as you like; there are no mandatory sections. The starter suggests a question, an investigation, and observations. A magician's problem explored through simulations, diagrams, and mathematics fits here.

- `## A section` makes a heading. The post title already supplies the page's main heading.
- Put code inside triple backticks followed by its language, such as `python`. Highlighting happens at build time.
- Add links and images with ordinary Markdown.
- Use the reusable video and graph components below wherever they help.

```liquid
[My CV]({{ '/cv/' | relative_url }})
![Describe what the diagram shows]({{ '/Figures/1001.png' | relative_url }})
```

### Equations

Set `math: true`. Use `$$x^2$$` for inline math. Display equations need delimiters on their own lines, with blank lines before and after the block:

```text
Here is the identity:

$$
e^{i\pi} + 1 = 0.
$$

Continue the explanation here.
```

Kramdown converts the inline double dollars to MathJax's inline syntax. MathJax loads only on pages that opt in. Long display equations scroll within the article on narrow screens.

Write absolute values as `\lvert x\rvert` inside math. Bare `|` characters can be mistaken for Markdown table separators.

### Video

Place a small video file in `assets/video/`, then include it in an exploration or module:

```liquid
{% include video.html
   src='/assets/video/demonstration.mp4'
   title='A demonstration of the experiment'
   caption='What to look for in this demonstration.'
   captions='/assets/video/demonstration.en.vtt'
   transcript='/assets/video/demonstration-transcript.txt' %}
```

Use real filenames, and supply captions or a transcript for spoken material. `poster`, `caption`, `captions`, and `transcript` are optional; omit unused parameters. Videos use native controls and do not preload their contents. Keep large videos on a video host instead of growing the Git repository.

To embed a hosted video, supply its **embed URL**, not its ordinary watch URL:

```liquid
{% include embed.html src='https://www.youtube-nocookie.com/embed/VIDEO_ID' title='A descriptive video title' %}
```

Embedded players load lazily and contact their host when loaded. No video player is loaded on other pages.

## Learning modules: explain, predict, try, reflect

A module uses the same Markdown authoring workflow and can include any of the media above. Create it in `_modules/`, or use `--type module` with the helper. Add teaching metadata to its front matter:

```yaml
---
title: Understanding a quadratic
description: Discover how three parameters change a curve.
format: module
tags: [algebra, functions]
duration: "20 minutes"
level: Introductory
prerequisites: [Coordinates, Function notation]
objectives:
  - Predict how a horizontal shift changes a graph.
  - Explain the effect of the leading coefficient.
widgets: [quadratic]
---
```

Duration, level, and prerequisites are optional. Write the lesson around explanations, predictions, activities, and checks for understanding. The starter has those sections and a sample graph; adapt them to the subject.

### Add the interactive graph

```liquid
{% include widgets/quadratic.html id='first-graph' %}
```

Also add `widgets: [quadratic]` to the page's front matter. The graph works in modules, explorations, research pages, and other pages. For multiple graphs in one page, give each a different `id`; their controls operate independently.

The component plots `y = a(x − h)² + k`. Native sliders work with the keyboard. A values table and text description update alongside the plot. Without JavaScript, a static graph and values table remain available.

The following components are ready to reuse. Set `widgets: [name]` and include `widgets/name.html`, giving each instance a unique `id`:

| Name | Activity |
| --- | --- |
| `quadratic` | Shape, shift, and reflect a parabola |
| `derivative` | Move a secant toward a tangent; handle the zero step explicitly |
| `differentiability` | Magnify a local graph, choose a candidate slope, and compare rigorous error bounds |
| `bayes` | Change a base rate and inspect expected counts |
| `card-trick` | Play three rounds of the 21-card trick |
| `random-walk` | Reveal, replay, pause, and regenerate a scaled random walk |

Supply a static figure alongside the random-walk component so readers without JavaScript can follow the article.

The `differentiability` component accepts `model='square'` (the default) or `model='absolute'` for its initial static view. Its controls also offer an oscillating function and two rational/irrational examples. It magnifies both coordinates by the same zoom factor and displays the error from a candidate linear approximation. Dense branches use labeled guides and selected points; unresolved oscillations use envelopes. These drawings accompany bounds rather than substitute for proofs.

The graph uses a small local script and SVG; there is no graphing service or plotting library. New activities can follow the same pattern:

1. Put reusable markup in `_includes/widgets/`.
2. Put a script in `assets/js/widgets/` that initializes only that widget's elements.
3. Register the name and script path in `_data/widgets.yml`.
4. List that widget name in the lesson's `widgets` field, then include its markup.

Each script is loaded only on pages that request it. Keep instances independent, provide keyboard controls, and give the visualization a text alternative. New interactive behavior needs a component; ordinary lessons just reuse existing components.

For more complex scientific plots or custom 3D scenes, see [Advanced and 3D graphs](advanced-graphs.md). The `scientific-plot` and `sphere-slice` components show static previews first and load their plotting libraries only when a reader opens them. The guide includes the markup and optional generators needed to create your own graphs.

## Research: showcase work separately from posts

Add `_research/project-name.md`. Its page will be `/research/project-name/` and it will appear in research search results. Here is the metadata supported by the layout:

```yaml
---
title: Your research title
description: An accessible one-sentence summary.
kind: Research project
authors: [Your name, A collaborator]
institution: Your institution
venue: Journal or conference, if applicable
status: Preprint
year: 2026
tags: [probability, stochastic analysis]
featured: true
order: 1
links:
  - label: Paper
    url: /assets/papers/your-paper.pdf
  - label: Code
    url: https://github.com/your-name/your-project
---

## The question

Explain the problem and why it matters.

## Approach and contribution

Describe your contribution and what the work establishes.
```

Replace the example information and URLs with real details. Optional metadata and links can be omitted. Resource labels can be Paper, Preprint, DOI, Code, Slides, Dataset, Poster, or any useful label. Local files use paths beginning with `/`; external links should use full HTTPS URLs. An optional `cover` image also needs a descriptive `cover_alt`.

The research index groups entries with `kind: Paper` under Papers, followed by thesis and other research work. Within each group, entries appear in ascending `order`. The first entry with `featured: true` is shown on the homepage. Research is included in search and the sitemap; the RSS feed contains post summaries, so solutions are not exposed in feed previews. The MSc thesis entry uses its supplied PDF to verify the year, supervision details, and overview. Optional `supervisor` and `assistant_supervisor` fields appear in the research page's metadata; local PDFs can be stored in `assets/papers/` and linked through `links`.

The homepage shows the latest published posts, with separate links to learning modules. Sample posts and demonstration research entries have been removed; use the starters in `docs/templates/` when creating new entries.

For an unpublished research entry, set `published: false` (the helper does this with `--draft`). Remove that line when ready. Such entries are excluded from the public pages, showcase, and search index.

## Drafts and publication

### Modules with several lesson pages

The published derivatives module uses `_modules/derivatives.md` as its overview and `_lessons/derivatives/` for its five lesson pages. The overview holds motivation, objectives, prerequisites, and the table of contents. Each lesson keeps its own content, exercises, and widgets. The `module` layout provides a compact contents disclosure and previous/next navigation in course order; only the overview appears in the learning-module list. Its explicit `/notes/derivatives/` permalink and all lesson permalinks preserve existing links.

Register the course title, overview URL, and ordered lesson titles and URLs in `_data/modules.yml`. Set `module_id` and numeric `module_step` (`0` for the overview, `1` onward for lessons), and give each page a stable `permalink`. Lesson files belong to the `lessons` collection and are included in search when published. Keep `published: false` on every unfinished page.

For a new course, keep its overview in `_modules/` and its unfinished lessons in `_lessons/`, with `published: false` on every page. The helper's `--type module --draft` option sets this on the overview. To preview the complete unpublished course, use:

```sh
bundle exec jekyll serve --unpublished
```

To publish, remove `published: false` from the overview and every lesson. Keep them in their collections. The public build uses no preview flags, so unfinished courses remain excluded until then. Single-page modules use the same publication workflow and do not need a course record or lesson pages.

### Single-page posts and research drafts

Post drafts live in `_drafts/title.md`. Preview them with:

```sh
bundle exec jekyll serve --drafts
```

Publish a post by moving it to `_posts/YYYY-MM-DD-title.md`. Keep the title portion of the filename stable to preserve its URL. Future-dated posts remain excluded until a build after their date. There is no scheduled build: push a change or run the workflow when ready.

Research drafts stay in `_research` and module drafts stay in `_modules`, with `published: false`. To preview all kinds of unfinished work locally:

```sh
bundle exec jekyll serve --drafts --unpublished
```

These options are not used by the deployment workflow. Drafts are still readable in a public source repository, so they are not private storage.

## Maintenance

- `_config.yml`: site identity, domain, pagination, and collections. Restart preview after changing it.
- `_data/navigation.yml`: sidebar links.
- `_data/formats.yml`: post-format and learning-module names, descriptions, and destinations.
- `_layouts/`, `_includes/`: shared presentation.
- `assets/css/site.css`: grouped styles, with colors and dimensions at the top.
- `cv.md`, `about.md`: standalone pages. Add new Markdown pages with a title, permalink, and `search: true` if they should be searchable.
- `search.json`: generated full-text index of posts, modules, lessons, research, and opted-in pages.

Search ranks title matches before topic and body matches. It stays in the browser and loads its index only after a query is entered. Format lists show all matching posts; the combined post archive has numbered pagination. Learning modules are listed separately in title order. The old subject pages remain available for existing links.

The CV's preprint list comes from research entries with `kind: Paper`. Update education, awards, experience, and the `updated` date in `cv.md`. The download uses `assets/cv/keivan-mirzaei-cv.pdf`, compiled from the CV source in `/Users/keivan/CV/CV.tex`. When updating the document, replace that PDF and update the date in the download label. The current document includes both 2026 awards and the Fall 2026 teaching roles.

Run the checks before publishing:

```sh
bundle exec jekyll build --strict_front_matter
python3 scripts/check_site.py
python3 -m unittest discover -s tests
```

The workflow tests create temporary content, check all formats, confirm solution behavior and draft exclusion, and verify that the helper cannot overwrite saved work. They never add test posts to your real site.

## Migration notes

The five retained old articles use April 1, 2024—the first archive commit date—for ordering. Their pages say “From the 2024 archive”; this is not a claim about their original publication day. All five are problems. Original source files remain in Git history. The unfinished probability article remains a draft exploration.

The CV was refreshed from the supplied 2026 document and award announcements. Mathematical typesetting details were repaired in the Hilbert and factorial proofs. The remaining figures, the custom domain, and redirects from `/pages/math.html`, `/pages/code.html`, and `/pages/CV.html` are preserved.

# Writing and publishing

Write Markdown in the source files. Jekyll supplies the shared presentation and rebuilds lists, navigation, search, feed, and sitemap. See [design standards](element-standards.md) for writing and visual conventions and [the directory map](site-map.md) for implementation details.

## Choose a format

| Content | Location | Front matter |
| --- | --- | --- |
| Problem | `_posts/YYYY-MM-DD-title.md` | `format: problem` |
| Exploration | `_posts/YYYY-MM-DD-title.md` | `format: exploration` |
| Chapter or single-page module | `_modules/title.md` | `format: module` |
| Lesson within a chapter | `_lessons/chapter/01-title.md` | `module_id`, `module_step` |
| Research | `_research/title.md` | Paper metadata and `links` |

The title portion of a post filename determines its `/notes/title/` address unless it has an explicit `permalink`. Keep existing filenames and permalinks stable when editing. Topics belong in `tags`; `category` is retained for older subject indexes.

## Create an entry

Copy a suitable existing file or use the optional helper:

```sh
python3 scripts/new_post.py "An interesting problem" --type problem --math --difficulty 2
python3 scripts/new_post.py "A challenge" --type problem --without-solution
python3 scripts/new_post.py "Following an idea" --type exploration --math --draft
python3 scripts/new_post.py "A new chapter" --type module --draft
python3 scripts/new_post.py "My research project" --type research --draft
```

The helper copies a starter from `docs/templates/` and refuses to overwrite an existing entry. Replace the starter text before publication. Use `--slug` to choose the URL name and `--date YYYY-MM-DD` to choose a post date. Its default post date is the computer's local date.

## Problems

```markdown
---
title: An interesting problem
description: One sentence introducing the question.
format: problem
difficulty: 2
tags: [probability]
math: true
---

State the problem here.

<!-- hint -->

Give a useful hint.

<!-- solution -->

Explain the key insight and the argument.
```

Text before the first marker is the visible statement. Each marker creates an independent disclosure row:

| Marker | Label |
| --- | --- |
| `<!-- hint -->` | Hint |
| `<!-- solution -->` | Solution |
| `<!-- alternative -->` | Another solution |
| `<!-- extension -->` | Extension |

Keep this order and omit unnecessary or empty sections. All rows start closed and work without JavaScript. Their contents are in the downloaded page.

Select `difficulty: 1`–`4` to reuse an existing circle or woven mark; see [content artwork](element-standards.md#content-artwork). Without `--difficulty`, the helper writes `difficulty: null`; choose a mark before publishing. Problems do not need a separate `image`.

## Explorations and media

```yaml
---
title: Following an idea
description: The question this article investigates.
format: exploration
tags: [geometry]
math: true
image: /assets/images/exploration-thumbnails/my-idea.svg
image_alt: Describe the mathematical object in the mark.
widgets: [hex]
---
```

Use real image paths and list only widgets actually included in the article. The heading already contains the title: begin body sections with `##`. Let the investigation determine its structure; the starter's headings are suggestions.

Link and illustrate with ordinary Markdown and `relative_url`:

```liquid
[An existing article]({{ '/notes/hex/' | relative_url }})
![Describe the diagram]({{ '/assets/figures/unit-circle-chord.svg' | relative_url }})
```

Store article illustrations in `assets/figures/` and identifying marks in `assets/images/exploration-thumbnails/`. Edit the SVG directly; completed artwork does not require its original generator. Keep filenames stable when replacing media.

Code goes in fenced blocks with a language such as `python`. Add a download or media folder only when an article needs it, and link the files explicitly. A file in `assets/` is copied into the public build even if no page links it, so remove abandoned downloads and draft-only assets when discarding their content. The site check flags unused assets.

For inline video, use native HTML with controls and no preloading:

```liquid
<video controls playsinline preload="none" aria-label="Describe the animation">
  <source src="{{ '/assets/video/my-animation.mp4' | relative_url }}" type="video/mp4">
  <a href="{{ '/assets/video/my-animation.mp4' | relative_url }}">Download the animation</a>
</video>
```

Use an existing filename. Include captions or a transcript for spoken material, and keep large videos on a video host rather than adding them to this repository.

### Equations

Set `math: true`. Use `$$x^2$$` for inline math. Display equations need their delimiters on separate lines and blank lines around the block:

```text
Here is the identity:

$$
e^{i\pi} + 1 = 0.
$$

Continue the explanation here.
```

Kramdown prepares the math and MathJax loads only for pages that opt in. Write absolute values as `\lvert x\rvert`; bare pipes can be mistaken for Markdown table separators. Number only equations cited later and use stable descriptive anchors for figures.

### Activities

Add the activity's registered name to `widgets`, then include its markup:

```liquid
{% include widgets/hex-game.html %}
```

Do not paste script tags into the article. The registry supplies styles and controllers. For components supporting multiple instances, pass a distinct `id` to each include. Use activities only where changing, comparing, or tracing something helps answer the article's question. Keep the main argument usable without interaction.

## Courses, chapters, and lessons

Course cards and outlines come from `_data/courses.yml`. Their overview pages live in `learning/` and use `layout: course` with the matching `course_id`. The Calculus I page reuses the first six chapters of the larger sequence through `module_source` and `module_part`. Its `lesson_outline` describes planned lessons.

A chapter overview lives in `_modules/`; its lessons live in `_lessons/chapter/`. Register chapter and lesson titles, URLs, and order in `_data/modules.yml`. Give each page a stable permalink, matching `module_id`, and numeric `module_step` (`0` for the overview, `1` onward for lessons).

```yaml
---
title: A lesson title
layout: module
module_id: my-chapter
module_step: 1
permalink: /learning/my-chapter/my-lesson/
math: true
widgets: []
published: false
---
```

Use actual chapter IDs and paths. The module layout provides contents and previous/next links; only chapter overviews appear in the module list. Set `course_id` on a chapter to group it under a course. Add its URL to the course outline when ready; entries without a URL are forthcoming labels. Update course lesson counts when publishing new lessons.

Single-page modules need no chapter registration. Their front matter may include `objectives`, `prerequisites`, `duration`, and `level`; the helper supplies examples. New modules start without a widget. Add a maintained activity and its `widgets` entry only when it serves the lesson.

Follow [course standards](element-standards.md#courses) when developing lessons. The current sequence contains one functions lesson and five derivatives lessons. Planned chapters remain in the course data, without placeholder lesson files.

## Research

Research is separate from the post archive and feed. Put metadata and a short readable summary in `_research/`:

```yaml
---
title: A paper title
description: A short accessible description.
kind: Research paper
status: Preprint
featured: false
order: 10
links:
  - label: Read the paper
    url: https://example.org/paper
published: false
---
```

Replace the example link. `featured: true` adds the entry to the homepage research selection; `order` controls listing order. Available optional fields include `authors`, `venue`, and `year`. Put a retained PDF in `assets/papers/`, or link to its external source. Write the question, contribution, and evidence in the body. Remove `published: false` when ready.

## Drafts and publication

Future post drafts live in `_drafts/title.md`; the helper creates this folder when needed. Preview them with:

```sh
bundle exec jekyll serve --drafts
```

Publish by moving the file to `_posts/YYYY-MM-DD-title.md`. Future-dated posts remain excluded until a build after their date; a push or manual workflow run triggers that build.

Unpublished modules, lessons, and research stay in their normal collections with `published: false`. Preview with `--unpublished`, then remove the flag when ready. To preview both kinds:

```sh
bundle exec jekyll serve --drafts --unpublished
```

Deployment uses neither preview flag. Drafts in a public repository are still readable as source. If discarding a draft, remove downloads and media used only by it as well.

## Review and publish

Run the checks in [README](../README.md#check-and-publish). They validate publication, links, anchors, images, search, feed, sitemap, authoring, and maintained interactive behavior. Test fixtures use temporary folders and never add posts to the real site.

For a new ordinary page, give it a `title`, stable `permalink`, and `search: true` if it should be searchable. Set menu links in `_data/navigation.yml`. Update biography in `about.md` and the shared professional-profile link in `_config.yml`.

The five 2024 archive articles use the first archive commit date for ordering; it is not their original publication date. Preserve their article URLs and the old `/pages/` redirects.

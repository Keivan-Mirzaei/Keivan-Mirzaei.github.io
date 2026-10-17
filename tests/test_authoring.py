"""Exercise authoring and rendering without writing test content into the site."""

import json
from html.parser import HTMLParser
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ProblemRows(HTMLParser):
    """Inspect real rendered rows, including accidental nesting or open state."""

    def __init__(self, html):
        super().__init__()
        self.depth = 0
        self.rows = []
        self.labels = []
        self.summary = False
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "details":
            self.depth += 1
            self.rows.append((attrs.get("class"), self.depth, "open" in attrs))
        if tag == "summary":
            self.summary = True
            self.labels.append("")

    def handle_endtag(self, tag):
        if tag == "details":
            self.depth -= 1
        if tag == "summary":
            self.summary = False

    def handle_data(self, data):
        if self.summary:
            self.labels[-1] += data


class ContentWorkflow(unittest.TestCase):
    def test_templates_and_publication(self):
        with tempfile.TemporaryDirectory(prefix="notebook-test-") as directory:
            source = Path(directory) / "source"
            destination = Path(directory) / "output"
            shutil.copytree(ROOT, source, ignore=shutil.ignore_patterns(
                ".git", "_site", ".jekyll-cache", "vendor", ".bundle", "legacy", "__pycache__"
            ))

            def create(title, *options, success=True):
                result = subprocess.run(
                    [sys.executable, str(source / "scripts/new_post.py"), title,
                     "--date", "2024-04-02", *options], capture_output=True, text=True
                )
                self.assertEqual(result.returncode == 0, success, result.stderr)
                return result

            create("Fixture problem", "--type", "problem", "--difficulty", "1")
            create("Fixture challenge", "--type", "problem", "--difficulty", "4", "--without-solution")
            create("Fixture exploration", "--type", "exploration")
            create("Fixture support", "--type", "problem", "--difficulty", "3")
            create("Fixture empty support", "--type", "problem")
            create("Fixture hint only", "--type", "problem", "--difficulty", "2", "--without-solution")
            for slug, body in {
                "fixture-support": """The visible question.

<!-- hint -->

**A strategic hint.**

<!-- solution -->

The main argument.

<!-- alternative -->

A different argument.

<!-- extension -->

A further question.
""",
                "fixture-empty-support": """The visible question.

<!-- hint -->
<!-- solution -->
<!-- alternative -->
<!-- extension -->
""",
                "fixture-hint-only": """The visible question.

<!-- hint -->

A cue without a solution.
""",
            }.items():
                fixture = source / "_posts" / f"2024-04-02-{slug}.md"
                header = fixture.read_text().split("\n\n", 1)[0]
                fixture.write_text(header + "\n\n" + body)
            create("Fixture research", "--type", "research")
            create("Unpublished research sentinel", "--type", "research", "--draft")
            create("Unpublished post sentinel", "--type", "exploration", "--draft")
            create("Invalid slug", "--slug", "../escape", success=False)
            create("Invalid format option", "--type", "exploration", "--without-solution", success=False)
            create("Invalid logo format", "--type", "exploration", "--difficulty", "2", success=False)
            create("Invalid logo difficulty", "--type", "problem", "--difficulty", "5", success=False)
            (source / "_posts/2024-04-02-fixture-graph.md").write_text(r"""---
title: Fixture stereographic graph
description: Check optional graph rendering.
format: exploration
widgets: [stereographic-projection]
math: true
---
For $$\lvert h\rvert \leq 1$$, the slice has radius $$\sqrt{1-h^2}$$.

| Height | Radius |
| --- | --- |
| 0 | 1 |
| 1 | 0 |

{% include widgets/stereographic-projection.html id='fixture-graph' %}
""")

            # Render the reusable topic starter only inside the test checkout.
            starter = (ROOT / "docs/templates/learning-topic.md").read_text()
            (source / "learning/fixture-topic.md").write_text(
                starter.replace("/learning/course/topic/", "/learning/fixture-topic/")
            )

            # A duplicate must never overwrite the author's existing content.
            original = source / "_posts/2024-04-02-fixture-problem.md"
            original.write_text(original.read_text().replace("Write the problem here.", "An author's saved problem."))
            preserved = original.read_text()
            create("Fixture problem", "--type", "problem", success=False)
            self.assertEqual(original.read_text(), preserved)
            original_research = source / "_research/fixture-research.md"
            preserved_research = original_research.read_text()
            create("Fixture research", "--type", "research", success=False)
            self.assertEqual(original_research.read_text(), preserved_research)

            result = subprocess.run(
                ["bundle", "exec", "jekyll", "build", "--strict_front_matter",
                 "--source", str(source), "--config", str(source / "_config.yml"),
                 "--destination", str(destination)], cwd=ROOT,
                env={**os.environ, "BUNDLE_GEMFILE": str(ROOT / "Gemfile")},
                capture_output=True, text=True
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

            def page(slug, section="notes"):
                return (destination / section / slug / "index.html").read_text()

            problem = page("fixture-problem")
            self.assertIn('<details class="problem-solution">', problem)
            self.assertNotIn('<details class="problem-solution" open', problem)
            self.assertIn("saved problem.", problem)
            self.assertIn("Write the solution here.", problem)
            self.assertNotIn('class="problem-solution"', page("fixture-challenge"))
            self.assertNotIn('class="problem-solution"', page("fixture-exploration"))
            # The four grades select shared marks without a public rating legend.
            for slug, asset in {
                "fixture-problem": "circle",
                "fixture-hint-only": "woven-3",
                "fixture-support": "woven-5",
                "fixture-challenge": "woven-7",
            }.items():
                rendered = page(slug)
                self.assertIn(f'/assets/images/problem-logos/{asset}.svg', rendered)
                self.assertIn('class="article-title-row"', rendered)
                self.assertNotIn('data-difficulty=', rendered)
            self.assertNotIn('class="content-logo"', page("fixture-empty-support"))
            self.assertIn('/assets/images/problem-logos/circle.svg', page("simple-but-fun"))
            listing = (destination / "problems/index.html").read_text()
            self.assertIn('/assets/images/problem-logos/woven-7.svg', listing)
            self.assertIn('alt="" aria-hidden="true"', listing)
            support = page("fixture-support")
            rows = ProblemRows(support)
            self.assertEqual(rows.labels, ["Hint", "Solution", "Another solution", "Extension"])
            self.assertEqual([depth for _, depth, _ in rows.rows], [1, 1, 1, 1])
            self.assertFalse(any(is_open for _, _, is_open in rows.rows))
            self.assertIn("<strong>A strategic hint.</strong>", support)
            self.assertNotIn("<!-- alternative -->", support)
            self.assertIn('data-page-problem="true"', support)
            self.assertIn("app.mjs", support)
            self.assertIn('data-page-problem="false"', page("fixture-exploration"))
            self.assertNotIn('class="problem-disclosures"', page("fixture-empty-support"))
            self.assertEqual(ProblemRows(page("fixture-hint-only")).labels, ["Hint"])
            self.assertNotIn('class="problem-solution"', page("fixture-hint-only"))
            # Optional graph modules must stay off ordinary pages.
            # The tiny shared map makes 3D imports available after navigation;
            # it declares URLs but does not load those libraries.
            self.assertIn('type="importmap"', problem)
            self.assertNotIn('src="https://cdn.jsdelivr.net/npm/three', problem)
            self.assertNotIn('stereographic-projection.mjs', problem)
            graph = page("fixture-graph")
            self.assertIn('type="importmap"', graph)
            self.assertIn('type="module"', graph)
            self.assertIn('stereographic-projection.mjs', graph)
            # Absolute-value bars previously became Markdown table separators.
            polynomial = page("conservative-polynomials")
            self.assertNotIn('<table>', polynomial)
            self.assertIn(r'\lvert P\rvert', polynomial)
            self.assertEqual(graph.count('<table>'), 1)
            self.assertTrue((destination / "research/fixture-research/index.html").is_file())
            self.assertFalse((destination / "research/unpublished-research-sentinel").exists())
            self.assertFalse((destination / "notes/unpublished-post-sentinel").exists())
            self.assertTrue((destination / "learning/index.html").is_file())
            self.assertFalse((destination / "learning/topic").exists())
            self.assertFalse((destination / "learning/thumbnail-options").exists())
            self.assertFalse((destination / "learning/problem-layout-options").exists())
            self.assertFalse((destination / "learning/navigation-options").exists())
            catalogue = (destination / "learning/index.html").read_text()
            self.assertIn("Calculus for Engineers and Scientists", catalogue)
            self.assertNotIn("275", catalogue)
            self.assertIn('class="course" href="/learning/calculus/"', catalogue)
            self.assertNotIn('<details>', catalogue)
            self.assertTrue((destination / "learning/calculus/index.html").is_file())
            course = json.loads((source / "_data/learning_courses.json").read_text())["calculus"]
            topics = [topic for module in course["modules"] for topic in module["topics"]]
            positions = {topic["url"]: (m, n, module["slug"])
                         for m, module in enumerate(course["modules"], 1)
                         for n, topic in enumerate(module["topics"], 1)}
            outline = (destination / "learning/calculus/index.html").read_text()
            for module in course["modules"]:
                self.assertIn(f'id="{module["slug"]}"', outline)
                redirect = (destination / "learning/calculus" / module["slug"] / "index.html").read_text()
                self.assertIn(f'/learning/calculus/#{module["slug"]}', redirect)
            for i, topic in enumerate(topics):
                html = (destination / topic["url"].strip("/") / "index.html").read_text()
                self.assertIn('id="sidebar"', html)
                self.assertIn('class="topbar learning-topbar"', html)
                self.assertIn('class="topbar-title learning-breadcrumb"', html)
                breadcrumb = html.partition('<nav class="topbar-title learning-breadcrumb"')[2].partition('</nav>')[0]
                module_number, topic_number, module_slug = positions[topic["url"]]
                self.assertEqual(breadcrumb.count('<a '), 4)
                self.assertIn(f'<span aria-current="page">{module_number}.{topic_number} ', breadcrumb)
                self.assertIn(f'/learning/calculus/#{module_slug}', breadcrumb)
                self.assertIn('href="/learning/" aria-current="true"', html)
                if topic['slug'] in {'limits', 'limit-laws', 'squeeze-theorem', 'infinite-limits-and-limits-at-infinity', 'continuity', 'intermediate-value-theorem', 'definition-and-geometry', 'differentiation-rules', 'chain-rule', 'higher-derivatives', 'trigonometric-derivatives', 'inverse-function-derivatives', 'hyperbolic-functions', 'implicit-differentiation', 'logarithmic-differentiation'}:
                    self.assertIn('id="practice"', html)
                else:
                    self.assertNotIn('id="practice"', html)
                if topic['slug'] == 'problems':
                    self.assertIn('learning-problems.js', html)
                    self.assertIn('learning-problems.css', html)
                    self.assertIn('id="module-problems"', html)
                self.assertNotIn("learning-slope", html)
                self.assertIn('class="topic-chain"', html)
                self.assertIn('learning-topic-navigation.js', html)
                self.assertIn(f'href="{topic["url"]}" aria-current="page"', html)
                for neighbour in topics[max(0, i-1):i+2]:
                    self.assertIn(f'href="{neighbour["url"]}"', html)
            self.assertEqual(len(course["modules"]), 9)
            for module in course["modules"]:
                self.assertEqual(module["topics"][-1]["slug"], "problems")
            module_problems = (destination / "learning/calculus/limits-and-continuity/problems/index.html").read_text()
            problem_disclosures = ProblemRows(module_problems)
            self.assertEqual(problem_disclosures.labels.count("Solution"), 16)
            self.assertTrue(all(not row[2] for row in problem_disclosures.rows if row[0] == "disclosure"))
            self.assertNotIn('id="practice"', module_problems)
            topic_fixture = (destination / "learning/fixture-topic/index.html").read_text()
            self.assertIn('id="practice"', topic_fixture)
            self.assertIn('<p>State the definition precisely.</p>', topic_fixture)
            self.assertIn('class="math-marker"', topic_fixture)
            self.assertIn(r'\(m = \frac{2}{3}\)', topic_fixture)
            self.assertNotIn('&lt;/div&gt;', topic_fixture)
            self.assertEqual(ProblemRows(topic_fixture).labels[0], "Proof (optional)")
            self.assertFalse((destination / "notes/derivatives").exists())
            for html_file in destination.rglob("*.html"):
                html = html_file.read_text()
                self.assertNotIn('href="/notes/derivatives/', html)
            homepage = (destination / "index.html").read_text()
            sidebar = homepage.partition('<nav aria-label="Main">')[2].partition('</nav>')[0]
            self.assertNotIn('<details', sidebar)
            self.assertEqual(sidebar.count('class="nav-link'), 7)
            self.assertIn('href="/gadgets/"', sidebar)
            self.assertIn('href="/learning/"', sidebar)
            self.assertIn('href="/learning/" class="subject-card"', homepage)
            self.assertIn('href="/learning/" aria-current="page"', catalogue)
            self.assertIn('href="/learning/"', page("about", ""))
            posts_sidebar = problem.partition('<nav aria-label="Main">')[2].partition('</nav>')[0]
            self.assertIn('href="/notes/" aria-current="true"', posts_sidebar)
            for archive in [destination / "notes/index.html", *(destination / "notes/page").glob("*/index.html")]:
                archive_content = archive.read_text().partition('<main ')[2].partition('</main>')[0]
                self.assertTrue(archive_content)
                self.assertNotIn("Fixture research", archive_content)
            feed = (destination / "feed.xml").read_text()
            self.assertNotIn("Fixture research", feed)
            index = json.loads((destination / "search.json").read_text())
            self.assertFalse(any("sentinel" in entry["title"].lower() for entry in index))
            self.assertTrue(any(entry["title"] == "Fixture research" for entry in index))
            self.assertTrue(any(entry["url"] == "/learning/" for entry in index))
            self.assertFalse(any((entry["url"].startswith("/learning/") and entry["url"] != "/learning/")
                                 or entry["url"].startswith("/notes/derivatives/") for entry in index))
            self.assertNotIn("Write the solution here.", feed)

            preview = Path(directory) / "preview"
            result = subprocess.run(
                ["bundle", "exec", "jekyll", "build", "--strict_front_matter", "--unpublished",
                 "--source", str(source), "--config", str(source / "_config.yml"),
                 "--destination", str(preview)], cwd=ROOT,
                env={**os.environ, "BUNDLE_GEMFILE": str(ROOT / "Gemfile")},
                capture_output=True, text=True
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertTrue((preview / "research/unpublished-research-sentinel/index.html").is_file())
            self.assertFalse((preview / "notes/unpublished-post-sentinel").exists())
            preview_index = json.loads((preview / "search.json").read_text())
            self.assertTrue(any(entry["title"] == "Unpublished research sentinel" for entry in preview_index))


if __name__ == "__main__":
    unittest.main()

"""Exercise authoring and rendering without writing test content into the site."""

import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


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

            create("Fixture problem", "--type", "problem")
            create("Fixture challenge", "--type", "problem", "--without-solution")
            create("Fixture exploration", "--type", "exploration")
            create("Fixture lesson", "--type", "module")
            create("Fixture research", "--type", "research")
            create("Unpublished research sentinel", "--type", "research", "--draft")
            create("Unpublished module sentinel", "--type", "module", "--draft")
            create("Unpublished post sentinel", "--type", "exploration", "--draft")
            create("Invalid slug", "--slug", "../escape", success=False)
            create("Invalid format option", "--type", "module", "--without-solution", success=False)
            (source / "_modules/fixture-sphere.md").write_text(r"""---
title: Fixture sphere
description: Check optional graph rendering.
format: module
widgets: [sphere-slice]
math: true
---
For $$\lvert h\rvert \leq 1$$, the slice has radius $$\sqrt{1-h^2}$$.

| Height | Radius |
| --- | --- |
| 0 | 1 |
| 1 | 0 |

{% include widgets/sphere-slice.html id='fixture-sphere' %}
""")

            # A duplicate must never overwrite the author's existing content.
            original = source / "_posts/2024-04-02-fixture-problem.md"
            original.write_text(original.read_text().replace("Write the problem here.", "An author's saved problem."))
            preserved = original.read_text()
            create("Fixture problem", "--type", "problem", success=False)
            self.assertEqual(original.read_text(), preserved)
            original_module = source / "_modules/fixture-lesson.md"
            preserved_module = original_module.read_text()
            create("Fixture lesson", "--type", "module", success=False)
            create("Fixture lesson", "--type", "problem", success=False)
            self.assertEqual(original_module.read_text(), preserved_module)

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
            module = page("fixture-lesson", "learning")
            self.assertIn("Before you start", module)
            self.assertIn('data-widget="quadratic"', module)
            self.assertIn('aria-label="More learning modules"', module)
            self.assertIn('← Previous module', module)
            self.assertIn('Next module →', module)
            self.assertIn('href="/notes/derivatives/"', module)
            self.assertIn('href="/learning/fixture-sphere/"', module)
            widget_source = r'src="/assets/js/widgets/quadratic\.js(?:\?[^\"]+)?"'
            self.assertRegex(module, widget_source)
            self.assertNotRegex(problem, widget_source)
            # Optional graph modules must stay off ordinary pages.
            self.assertNotIn('type="importmap"', problem)
            self.assertNotIn('scientific-plot.mjs', problem)
            self.assertNotIn('sphere-slice.mjs', problem)
            sphere = page("fixture-sphere", "learning")
            self.assertIn('type="importmap"', sphere)
            self.assertIn('type="module"', sphere)
            self.assertIn('sphere-slice.mjs', sphere)
            # Absolute-value bars previously became Markdown table separators.
            polynomial = page("conservative-polynomials")
            self.assertNotIn('<table>', polynomial)
            self.assertIn(r'\lvert P\rvert', polynomial)
            self.assertEqual(sphere.count('<table>'), 1)
            self.assertTrue((destination / "research/fixture-research/index.html").is_file())
            self.assertFalse((destination / "research/unpublished-research-sentinel").exists())
            self.assertFalse((destination / "learning/unpublished-module-sentinel").exists())
            self.assertFalse((destination / "notes/unpublished-post-sentinel").exists())
            self.assertTrue((destination / "notes/derivatives/index.html").is_file())
            for lesson_slug in ("rates", "definition", "rules", "techniques", "local-linearity"):
                self.assertTrue((destination / "notes/derivatives" / lesson_slug / "index.html").is_file())
            learning = (destination / "learning/index.html").read_text()
            self.assertIn("Fixture lesson", learning)
            self.assertIn("Derivatives: from rates to local linearity", learning)
            self.assertNotIn('aria-label="Browse post formats"', learning)
            for archive in [destination / "notes/index.html", *(destination / "notes/page").glob("*/index.html")]:
                archive_content = archive.read_text()
                self.assertNotIn("Fixture lesson", archive_content)
                self.assertNotIn("Fixture sphere", archive_content)
                self.assertNotIn("Derivatives: from rates to local linearity", archive_content)
            feed = (destination / "feed.xml").read_text()
            self.assertNotIn("Fixture lesson", feed)
            self.assertNotIn("Derivatives: from rates to local linearity", feed)
            index = json.loads((destination / "search.json").read_text())
            self.assertFalse(any("sentinel" in entry["title"].lower() for entry in index))
            self.assertTrue(any(entry["title"] == "Fixture research" for entry in index))
            module_result = next(entry for entry in index if entry["title"] == "Fixture lesson")
            self.assertEqual(module_result["category"], "Learning module")
            self.assertEqual(module_result["url"], "/learning/fixture-lesson/")
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
            self.assertTrue((preview / "learning/unpublished-module-sentinel/index.html").is_file())
            self.assertFalse((preview / "notes/unpublished-post-sentinel").exists())
            preview_index = json.loads((preview / "search.json").read_text())
            self.assertTrue(any(entry["title"] == "Unpublished module sentinel" for entry in preview_index))


if __name__ == "__main__":
    unittest.main()

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
            create("Unpublished post sentinel", "--type", "module", "--draft")
            create("Invalid slug", "--slug", "../escape", success=False)
            create("Invalid format option", "--type", "module", "--without-solution", success=False)

            # A duplicate must never overwrite the author's existing content.
            original = source / "_posts/2024-04-02-fixture-problem.md"
            original.write_text(original.read_text().replace("Write the problem here.", "An author's saved problem."))
            preserved = original.read_text()
            create("Fixture problem", "--type", "problem", success=False)
            self.assertEqual(original.read_text(), preserved)

            result = subprocess.run(
                ["bundle", "exec", "jekyll", "build", "--strict_front_matter",
                 "--source", str(source), "--config", str(source / "_config.yml"),
                 "--destination", str(destination)], cwd=ROOT,
                env={**os.environ, "BUNDLE_GEMFILE": str(ROOT / "Gemfile")},
                capture_output=True, text=True
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

            def page(slug):
                return (destination / "notes" / slug / "index.html").read_text()

            problem = page("fixture-problem")
            self.assertIn('<details class="problem-solution">', problem)
            self.assertNotIn('<details class="problem-solution" open', problem)
            self.assertIn("saved problem.", problem)
            self.assertIn("Write the solution here.", problem)
            self.assertNotIn('class="problem-solution"', page("fixture-challenge"))
            self.assertNotIn('class="problem-solution"', page("fixture-exploration"))
            module = page("fixture-lesson")
            self.assertIn("Before you start", module)
            self.assertIn('data-widget="quadratic"', module)
            self.assertIn('src="/assets/js/widgets/quadratic.js"', module)
            self.assertNotIn('src="/assets/js/widgets/quadratic.js"', problem)
            # Optional graph modules must stay off ordinary pages.
            self.assertNotIn('type="importmap"', problem)
            self.assertNotIn('scientific-plot.mjs', problem)
            self.assertNotIn('sphere-slice.mjs', problem)
            sphere = page("slicing-a-sphere")
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
            self.assertFalse((destination / "notes/unpublished-post-sentinel").exists())
            index = json.loads((destination / "search.json").read_text())
            self.assertFalse(any("sentinel" in entry["title"].lower() for entry in index))
            self.assertTrue(any(entry["title"] == "Fixture research" for entry in index))
            self.assertNotIn("Write the solution here.", (destination / "feed.xml").read_text())


if __name__ == "__main__":
    unittest.main()

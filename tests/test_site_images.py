"""Keep the built-site image check strict while permitting decorative marks."""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ImageDescriptions(unittest.TestCase):
    def test_informative_and_decorative_images(self):
        cases = [
            ('alt="A repeating probability ripple"', True),
            ('alt="" aria-hidden="true"', True),
            ('alt=""', False),
            ('aria-hidden="true"', False),
            ('', False),
        ]
        with tempfile.TemporaryDirectory(prefix="logo-image-check-") as directory:
            site = Path(directory)
            (site / "logo.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
            (site / "search.json").write_text('[]')
            (site / "feed.xml").write_text('<rss/>')
            (site / "sitemap.xml").write_text('<urlset/>')
            for attributes, accepted in cases:
                with self.subTest(attributes=attributes):
                    (site / "index.html").write_text(f'<h1>A page</h1><img src="logo.svg" {attributes}>')
                    result = subprocess.run(
                        [sys.executable, str(ROOT / "scripts/check_site.py"), str(site)],
                        capture_output=True, text=True,
                    )
                    self.assertEqual(result.returncode == 0, accepted, result.stdout + result.stderr)
                    if not accepted:
                        self.assertIn("image missing alternative text", result.stderr)


if __name__ == "__main__":
    unittest.main()

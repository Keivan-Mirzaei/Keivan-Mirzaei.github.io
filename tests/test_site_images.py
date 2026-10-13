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

    def test_unused_media_is_rejected_but_lazy_dependencies_and_credits_are_kept(self):
        with tempfile.TemporaryDirectory(prefix="asset-check-") as directory:
            site = Path(directory)
            for folder in ("assets/js/gadgets", "assets/css", "assets/images", "assets/audio/ambient"):
                (site / folder).mkdir(parents=True)
            (site / "index.html").write_text(
                '<h1>A page</h1><script type="module" src="/assets/js/app.mjs"></script>'
                '<link rel="stylesheet" href="/assets/css/site.css">'
            )
            (site / "search.json").write_text('[]')
            (site / "feed.xml").write_text('<rss/>')
            (site / "sitemap.xml").write_text('<urlset/>')
            (site / "assets/js/app.mjs").write_text(
                "import('./gadgets/sounds.mjs'); new Worker(new URL('./worker.mjs', import.meta.url));"
            )
            (site / "assets/js/worker.mjs").write_text('export const value = 1;')
            (site / "assets/js/gadgets/sounds.mjs").write_text("export const sounds = { rain: { file: 'rain.mp3' } };")
            (site / "assets/css/site.css").write_text('body { background: url(../images/paper.svg); }')
            (site / "assets/images/paper.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
            (site / "assets/audio/ambient/rain.mp3").write_bytes(b'audio fixture')
            (site / "assets/audio/ambient/CREDITS.md").write_text('Audio attribution.')

            def check(*options):
                return subprocess.run(
                    [sys.executable, str(ROOT / "scripts/check_site.py"), str(site), *options],
                    capture_output=True, text=True,
                )

            result = check()
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            # Deployment versions and project base URLs must not hide dependencies.
            (site / "index.html").write_text(
                '<h1>A page</h1><script type="module" src="/project/assets/js/app.mjs?v=123"></script>'
                '<link rel="stylesheet" href="/project/assets/css/site.css?v=123">'
            )
            result = check('/project')
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            (site / "assets/images/abandoned.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
            result = check('/project')
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('Unused asset: assets/images/abandoned.svg', result.stderr)


if __name__ == "__main__":
    unittest.main()

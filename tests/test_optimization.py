import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("optimize_build", Path(__file__).resolve().parents[1] / "scripts/optimize_build.py")
optimizer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(optimizer)


class AssetVersions(unittest.TestCase):
    def test_dependency_changes_refresh_importers_without_changing_unrelated_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            (root / "assets").mkdir()
            leaf = root / "assets/math.mjs"
            parent = root / "assets/game.mjs"
            style = root / "assets/site.css"
            leaf.write_text("export const value = 1;")
            parent.write_text("import {value} from './math.mjs'; new Worker(new URL('./math.mjs', import.meta.url));")
            style.write_text("body { margin: 0; }")
            page = root / "index.html"
            page.write_text('<script data-widget-src="/notebook/assets/game.mjs"></script><link href="/notebook/assets/site.css"><img src="https://example.com/image.png">')
            first = optimizer.optimize(root, "/notebook")
            self.assertIn(f"math.mjs?v={first[leaf]}", parent.read_text())
            self.assertIn(f"game.mjs?v={first[parent]}", page.read_text())
            self.assertIn('https://example.com/image.png', page.read_text())
            self.assertEqual(first, optimizer.optimize(root, "/notebook"))
            leaf.write_text("export const value = 2;")
            changed = optimizer.optimize(root, "/notebook")
            self.assertNotEqual(first[leaf], changed[leaf])
            self.assertNotEqual(first[parent], changed[parent])
            self.assertEqual(first[style], changed[style])
            self.assertNotIn(f"math.mjs?v={first[leaf]}", parent.read_text())

    def test_modules_are_refreshed_transitively_and_html_urls_never_get_two_queries(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            (root / "assets").mkdir()
            (root / "assets/leaf.mjs").write_text("export const n=1")
            (root / "assets/middle.mjs").write_text("export {n} from './leaf.mjs?v=old'")
            (root / "assets/top.mjs").write_text("import('./middle.mjs?v=old')")
            page = root / "index.html"
            page.write_text('<script src="/assets/top.mjs?v=old"></script>')
            versions = optimizer.optimize(root)
            self.assertIn(versions[root / "assets/top.mjs"], page.read_text())
            self.assertNotIn('old', page.read_text())
            self.assertNotIn('?v=old', (root / "assets/middle.mjs").read_text())

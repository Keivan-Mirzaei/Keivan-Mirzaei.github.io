#!/usr/bin/env python3
"""Give built assets stable content versions, including imported dependencies.

Run after Jekyll, before checking/deploying. Source files are never rewritten.
"""
import hashlib
from pathlib import Path
import re
import sys
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ASSET = re.compile(r'''(["'])([^"'\s]+\.(?:mjs|js|css|svg|png|ico)(?:\?[^"'\s]*)?)\1''')
ATTRIBUTE = re.compile(r'''(\b(?:href|src|data-widget-src)=)(["'])([^"']+)\2''')


def optimize(root, baseurl=""):
    root = Path(root).resolve()
    assets = {p.resolve(): p.read_bytes() for p in (root / "assets").rglob("*") if p.is_file()}
    for name in ("favicon.ico", "apple-touch-icon.png"):
        if (root / name).is_file():
            assets[root / name] = (root / name).read_bytes()
    originals = {}
    for path, data in assets.items():
        if path.suffix in {".js", ".mjs", ".css"}:
            originals[path] = data.decode()
    versions = {}
    visiting = set()

    def target_for(url, source):
        parts = urlsplit(url)
        if parts.scheme or parts.netloc:
            return None
        if parts.path.startswith("/"):
            path = parts.path
            if baseurl:
                if not path.startswith(baseurl + "/"):
                    return None
                path = path[len(baseurl):]
            target = root / path.lstrip("/")
        else:
            target = source.parent / parts.path
        target = target.resolve()
        return target if target in assets else None

    def versioned(url, source):
        target = target_for(url, source)
        if target is None:
            return url
        parts = urlsplit(url)
        query = [(k, v) for k, v in parse_qsl(parts.query) if k != "v"]
        query.append(("v", digest(target)))
        return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))

    def digest(path):
        if path in versions:
            return versions[path]
        if path in visiting:
            raise ValueError(f"Circular asset imports: {path}")
        visiting.add(path)
        if path in originals:
            content = ASSET.sub(lambda m: m[1] + versioned(m[2], path) + m[1], originals[path]).encode()
            path.write_bytes(content)
        else:
            content = assets[path]
        versions[path] = hashlib.sha256(content).hexdigest()[:12]
        visiting.remove(path)
        return versions[path]

    for path in assets:
        digest(path)
    for page in root.rglob("*.html"):
        content = page.read_text()
        content = ATTRIBUTE.sub(lambda m: m[1] + m[2] + versioned(m[3], page) + m[2], content)
        page.write_text(content)
    print(f"Versioned {len(versions)} assets by content; unchanged assets keep their URLs.")
    return versions


if __name__ == "__main__":
    optimize(sys.argv[1] if len(sys.argv) > 1 else "_site", sys.argv[2].rstrip("/") if len(sys.argv) > 2 else "")

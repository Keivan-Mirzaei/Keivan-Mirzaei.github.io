#!/usr/bin/env python3
"""Check a Jekyll build for broken local links, missing content, and draft leaks."""

from html.parser import HTMLParser
import json
from pathlib import Path
import sys
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
BASEURL = sys.argv[2].rstrip("/") if len(sys.argv) > 2 else ""
errors = []


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.links = []
        self.ids = set()
        self.headings = 0
        self.redirect = False
        self.feed(path.read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            if attrs["id"] in self.ids:
                errors.append(f"{self.path}: duplicate id {attrs['id']}")
            self.ids.add(attrs["id"])
        if tag == "h1":
            self.headings += 1
        if tag == "meta" and attrs.get("http-equiv") == "refresh":
            self.redirect = True
        for key in ("href", "src", "action", "data-widget-src"):
            if key in attrs:
                self.links.append(attrs[key])
                if attrs[key].count("?v=") > 1:
                    errors.append(f"{self.path}: asset has duplicate version queries: {attrs[key]}")
        if tag == "img" and not attrs.get("alt", "").strip():
            errors.append(f"{self.path}: image missing alternative text")
        if tag == "iframe" and not attrs.get("title", "").strip():
            errors.append(f"{self.path}: embedded content missing a title")
        if tag == "details" and any(name.startswith("problem-") for name in attrs.get("class", "").split()) and "open" in attrs:
            errors.append(f"{self.path}: problem disclosure must start closed")


def resolve_link(url, source):
    parts = urlsplit(url)
    if parts.scheme or parts.netloc:
        return None, None
    path = unquote(parts.path)
    if path.startswith("/"):
        if BASEURL and not (path == BASEURL or path.startswith(BASEURL + "/")):
            errors.append(f"{source}: link misses baseurl: {url}")
        path = path[len(BASEURL):] if BASEURL else path
        target = ROOT / path.lstrip("/")
    else:
        target = source.parent / path if path else source
    if target.is_dir():
        target /= "index.html"
    return target.resolve(), unquote(parts.fragment)


pages = {p.resolve(): Page(p) for p in ROOT.rglob("*.html")}
if not pages:
    errors.append("No built pages found. Run bundle exec jekyll build first.")
for path, page in pages.items():
    if not page.redirect and page.headings != 1:
        errors.append(f"{path}: expected one main heading, found {page.headings}")
    for link in page.links:
        target, fragment = resolve_link(link, path)
        if target is None:
            continue
        if not target.is_file():
            errors.append(f"{path}: broken local link {link}")
        elif fragment and target in pages and fragment not in pages[target].ids:
            errors.append(f"{path}: missing anchor {link}")

try:
    entries = json.loads((ROOT / "search.json").read_text())
    urls = set()
    for entry in entries:
        if not entry.get("title") or not entry.get("content"):
            errors.append("Search entry is missing a title or content")
        if "{%" in entry["content"] or "{{" in entry["content"]:
            errors.append(f"Search entry contains unrendered templates: {entry['title']}")
        url = entry["url"]
        if url in urls:
            errors.append(f"Duplicate search URL: {url}")
        urls.add(url)
        target, _ = resolve_link(url, ROOT / "search.json")
        if target is None or not target.is_file():
            errors.append(f"Search result has no page: {url}")
    for collection in ("notes", "learning", "research"):
        for entry in (ROOT / collection).glob("*/index.html"):
            if pages[entry.resolve()].redirect:
                continue
            url = BASEURL + "/" + entry.parent.relative_to(ROOT).as_posix() + "/"
            if url not in urls:
                errors.append(f"Entry missing from search: {url}")
except (OSError, ValueError, KeyError) as error:
    errors.append(f"Invalid search index: {error}")

for name in ("feed.xml", "sitemap.xml"):
    try:
        ET.parse(ROOT / name)
    except (OSError, ET.ParseError) as error:
        errors.append(f"Invalid {name}: {error}")
for private in ("legacy", "_drafts", "docs", "scripts", "tests", "Gemfile", "Gemfile.lock", "README.md"):
    if (ROOT / private).exists():
        errors.append(f"Authoring material leaked into the build: {private}")

if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)
print(f"Checked {len(pages)} HTML pages, all local links, search entries, feed, and sitemap.")

#!/usr/bin/env python3
"""Create a problem, exploration, learning module, or research entry in Markdown."""

import argparse
from datetime import date
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "docs" / "templates"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("title", help='For example, "An interesting random walk"')
    parser.add_argument("--type", choices=["problem", "exploration", "module", "research"], default="exploration")
    parser.add_argument("--category", help="Optional legacy subject category; use tags for topics")
    parser.add_argument("--date", type=date.fromisoformat, default=date.today())
    parser.add_argument("--draft", action="store_true")
    parser.add_argument("--math", action="store_true", help="Enable equation rendering")
    parser.add_argument("--without-solution", action="store_true", help="Omit the solution section of a problem")
    parser.add_argument("--slug", help="Optional URL name, using lowercase letters, digits and hyphens")
    args = parser.parse_args()
    if args.without_solution and args.type != "problem":
        parser.error("--without-solution applies only to --type problem.")

    ascii_title = unicodedata.normalize("NFKD", args.title).encode("ascii", "ignore").decode()
    slug = args.slug or re.sub(r"[^a-z0-9]+", "-", ascii_title.lower()).strip("-")
    if not args.title.strip() or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        parser.error("Supply a title and a valid --slug, such as random-walk.")
    if args.type == "research":
        existing = (ROOT / "_research" / f"{slug}.md").exists()
    else:
        existing = list((ROOT / "_posts").glob(f"*-{slug}.md")) or (ROOT / "_drafts" / f"{slug}.md").exists()
    if existing:
        parser.error(f"An entry with the slug '{slug}' already exists.")

    folder = ROOT / ("_research" if args.type == "research" else "_drafts" if args.draft else "_posts")
    folder.mkdir(exist_ok=True)
    filename = f"{slug}.md" if args.draft or args.type == "research" else f"{args.date.isoformat()}-{slug}.md"
    path = folder / filename
    content = ["---", f"title: {json.dumps(args.title, ensure_ascii=False)}",
               'description: "Write a short introduction here."']
    if args.type == "research":
        content += ['kind: Research project', 'featured: false', 'order: 100', 'links: []']
        if args.draft:
            content.append('published: false')
    else:
        content.append(f"format: {args.type}")
    if args.category:
        content.append(f"category: {json.dumps(args.category)}")
    content += ["tags: []", f"math: {str(args.math).lower()}"]
    if args.type == "module":
        content += ['duration: ""', 'level: ""', 'prerequisites: []', 'objectives:',
                    '  - State the first learning objective.', 'widgets: [quadratic]']
    body = (TEMPLATES / f"{args.type}.md").read_text()
    if args.without_solution:
        body = body.split("<!-- solution -->")[0].rstrip() + "\n"
    content += ["---", "", body]
    with path.open("x") as output:
        output.write("\n".join(content))
    print(f"Created {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

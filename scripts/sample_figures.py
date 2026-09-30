"""Rebuild the small SVG figures using only Python's standard library."""

from pathlib import Path
import importlib.util
import csv

ROOT = Path(__file__).resolve().parents[1]
FIGURES = ROOT / "assets/figures"
FIGURES.mkdir(parents=True, exist_ok=True)


def svg(body, width, height, label):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img"><title>{label}</title>{body}</svg>\n'


# Keep the crossed-out corner squares visible, so their colors can be compared.
board = '<rect width="440" height="440" fill="#fcfcf9"/>'
for row in range(8):
    for column in range(8):
        x, y = 20 + column * 50, 20 + row * 50
        color = '#285b46' if (row + column) % 2 == 0 else '#e5ece2'
        board += f'<rect x="{x}" y="{y}" width="50" height="50" fill="{color}"/>'
        if (row, column) in [(0, 0), (7, 7)]:
            board += f'<path d="M{x+10} {y+10}l30 30m0 -30l-30 30" stroke="#fff" stroke-width="4"/>'
(FIGURES / 'missing-corners.svg').write_text(svg(board, 440, 440, 'Two same-colored corners removed from a chessboard'))

# Match the small generator used by the browser activity, including its seed.
state, position = 42, 0.0
values = [position]
for _ in range(256):
    state = (1664525 * state + 1013904223) % 2**32
    position += (-1 if state < 2**31 else 1) / 16
    values.append(position)
plot = '<rect width="640" height="380" fill="#f7f8f3"/>'
for value in [-2, -1, 0, 1, 2]:
    y = 170 - 65 * value
    plot += f'<path d="M55 {y}H610" stroke="#d9dfd2"/><text x="35" y="{y+5}" text-anchor="middle" font-family="monospace" font-size="15" fill="#56644e">{value}</text>'
for time in [0, .25, .5, .75, 1]:
    x = 55 + 555 * time
    plot += f'<text x="{x}" y="328" text-anchor="middle" font-family="monospace" font-size="15" fill="#56644e">{time:g}</text>'
path = ' '.join(f'{"M" if index == 0 else "L"}{55+555*index/256:.2f} {170-65*y:.2f}' for index, y in enumerate(values))
plot += f'<path d="{path}" fill="none" stroke="#285b46" stroke-width="2.5"/>'
plot += '<text x="330" y="361" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#56644e">Time · 256 steps · browser seed 42</text>'
(FIGURES / 'random-walk.svg').write_text(svg(plot, 640, 380, 'A scaled random walk, browser seed 42'))

# The downloadable dataset is produced by the downloadable Python program.
spec = importlib.util.spec_from_file_location('random_walk', ROOT / 'assets/code/random_walk.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
data = ROOT / 'assets/data'
data.mkdir(parents=True, exist_ok=True)
with (data / 'random-walk.csv').open('w', newline='') as output:
    writer = csv.writer(output, lineterminator='\n')
    writer.writerow(['time', 'position'])
    writer.writerows(module.walk())
print('Created two SVG figures and the example dataset.')

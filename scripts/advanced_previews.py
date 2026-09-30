"""Rebuild the advanced graph data and its small, static SVG previews."""

import importlib.util
from math import cos, pi, sin, sqrt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIGURES = ROOT / "assets/figures"
spec = importlib.util.spec_from_file_location("graph_data", ROOT / "scripts/graph_data.py")
data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(data)
data.write_figures(ROOT / "assets/plots")
FIGURES.mkdir(parents=True, exist_ok=True)


def write_svg(name, title, body):
    (FIGURES / f"{name}.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 460" role="img">'
        f'<title>{title}</title><rect width="720" height="460" fill="#f7f8f3"/>'
        f'{body}</svg>\n'
    )


def label(text, x, y, size=16):
    return f'<text x="{x}" y="{y}" text-anchor="middle" fill="#285b46" font-family="sans-serif" font-size="{size}">{text}</text>'


def project(x, y, z, scale=60):
    return 360 + scale * (x - y) / sqrt(2), 225 + scale * (0.5 * (x + y) / sqrt(2) - sqrt(0.75) * z)


def line(points, color, width=1.5, opacity=1):
    path = " ".join(f'{"M" if i == 0 else "L"}{x:.2f} {y:.2f}' for i, (x, y) in enumerate(points))
    return f'<path d="{path}" fill="none" stroke="{color}" stroke-width="{width}" opacity="{opacity}"/>'


surface = data.wave_surface(21)["data"][0]
cells = []
for row in range(20):
    for column in range(20):
        corners = [(surface['x'][column + dx], surface['y'][row + dy], surface['z'][row + dy][column + dx]) for dx, dy in [(0, 0), (1, 0), (1, 1), (0, 1)]]
        height = sum(p[2] for p in corners) / 4
        fraction = (height + 1) / 2
        low, high = (219, 232, 180), (36, 77, 73)
        color = '#' + ''.join(f'{round(a + (b-a) * fraction):02x}' for a, b in zip(low, high))
        points = ' '.join(f'{x:.2f},{y:.2f}' for x, y in [project(*point, scale=65) for point in corners])
        cells.append((sum(p[0] + p[1] for p in corners), f'<polygon points="{points}" fill="{color}" stroke="#527e70" stroke-width="0.35"/>'))
wave = label('z = sin(x) cos(y)', 360, 35, 20) + ''.join(shape for _, shape in sorted(cells))
wave += label('Heights range from −1 to 1 · open to rotate and inspect', 360, 430, 15)
write_svg('wave-surface', 'A sampled wave surface', wave)

portrait = label('A damped oscillator in the phase plane', 360, 30, 20)
sx = lambda x: 360 + x * 78
sy = lambda y: 230 - y * 78
for value in [-2, -1, 0, 1, 2]:
    portrait += line([(sx(-2.3), sy(value)), (sx(2.3), sy(value))], '#d9dfd2')
    portrait += line([(sx(value), sy(-2.3)), (sx(value), sy(2.3))], '#d9dfd2')
    portrait += label(str(value), sx(value), 428, 13)
    portrait += label(str(value), 155, sy(value) + 5, 13)
for trace in data.oscillator()['data']:
    if trace['mode'] == 'lines':
        portrait += line([(sx(x), sy(y)) for x, y in zip(trace['x'], trace['y'])], trace['line']['color'], 2)
    else:
        portrait += f'<circle cx="{sx(trace["x"][0])}" cy="{sy(trace["y"][0])}" r="4" fill="{trace["marker"]["color"]}"/>'
portrait += label('Position x', 360, 453, 14) + label('Velocity v', 82, 230, 14)
write_svg('damped-oscillator', 'Four trajectories approaching equilibrium', portrait)

angles = [2 * pi * index / 120 for index in range(121)]
sphere = label('A plane cuts a circle from a sphere', 360, 35, 20)
for height in [-0.8, -0.5, 0, 0.5, 0.8]:
    radius = sqrt(1 - height * height)
    sphere += line([project(radius * cos(t), radius * sin(t), height, 135) for t in angles], '#8aa996', opacity=0.7)
for azimuth in [index * pi / 6 for index in range(6)]:
    sphere += line([project(cos(t) * cos(azimuth), cos(t) * sin(azimuth), sin(t), 135) for t in angles], '#8aa996', opacity=0.7)
plane = ' '.join(f'{x:.2f},{y:.2f}' for x, y in [project(x, y, 0.5, 135) for x, y in [(-1.3, -1.3), (1.3, -1.3), (1.3, 1.3), (-1.3, 1.3)]])
sphere += f'<polygon points="{plane}" fill="#b5cbd4" fill-opacity="0.3" stroke="#76979c"/>'
sphere += line([project(sqrt(0.75) * cos(t), sqrt(0.75) * sin(t), 0.5, 135) for t in angles], '#a85928', 4)
sphere += label('h = 0.5 · radius = √0.75 ≈ 0.866', 360, 430, 17)
write_svg('sphere-slice', 'The circular slice of a unit sphere at height one half', sphere)
print('Created two plot datasets and three static previews.')

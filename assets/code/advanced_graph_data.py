"""Generate numeric Plotly figures with Python's standard library.

Run: python3 advanced_graph_data.py --output plots
The JSON is data, not executable code; the website loads it on request.
"""

import argparse
import json
from math import cos, exp, pi, sin, sqrt
from pathlib import Path


def wave_surface(samples=41):
    coordinates = [-pi + 2 * pi * index / (samples - 1) for index in range(samples)]
    heights = [[round(sin(x) * cos(y), 6) for x in coordinates] for y in coordinates]
    axis = {"range": [-pi, pi], "tickvals": [-pi, 0, pi], "ticktext": ["−π", "0", "π"]}
    return {
        "data": [{
            "type": "surface", "x": coordinates, "y": coordinates, "z": heights,
            "colorscale": [[0, "#dbe8b4"], [0.5, "#70a99b"], [1, "#244d49"]],
            "cmin": -1, "cmax": 1, "showscale": False,
            "hovertemplate": "x = %{x:.3f}<br>y = %{y:.3f}<br>z = %{z:.3f}<extra></extra>"
        }],
        "layout": {
            "scene": {
                "xaxis": {**axis, "title": {"text": "x"}},
                "yaxis": {**axis, "title": {"text": "y"}},
                "zaxis": {"title": {"text": "z"}, "range": [-1.2, 1.2], "tickvals": [-1, 0, 1]},
                "aspectmode": "manual", "aspectratio": {"x": 1, "y": 1, "z": 0.6},
                "camera": {"eye": {"x": 1.5, "y": 1.5, "z": 1.2}, "up": {"x": 0, "y": 0, "z": 1}}
            },
            "showlegend": False
        }
    }


def oscillator(samples=241):
    omega = sqrt(0.96)
    times = [24 * index / (samples - 1) for index in range(samples)]
    starts = [(2, 0), (0, 2), (-1.5, 0.5), (0.5, -1.5)]
    colors = ["#285b46", "#a85928", "#426f99", "#885c91"]
    traces = []
    for (position, velocity), color in zip(starts, colors):
        coefficient = (velocity + 0.2 * position) / omega
        xs, vs = [], []
        for time in times:
            wave = position * cos(omega * time) + coefficient * sin(omega * time)
            derivative = -position * omega * sin(omega * time) + coefficient * omega * cos(omega * time)
            xs.append(round(exp(-0.2 * time) * wave, 6))
            vs.append(round(exp(-0.2 * time) * (derivative - 0.2 * wave), 6))
        traces.append({
            "type": "scatter", "mode": "lines", "name": f"Start ({position}, {velocity})",
            "x": xs, "y": vs, "customdata": times, "line": {"color": color, "width": 2},
            "hovertemplate": "t = %{customdata:.1f}<br>x = %{x:.3f}<br>v = %{y:.3f}<extra>%{fullData.name}</extra>"
        })
        traces.append({
            "type": "scatter", "mode": "markers", "name": f"Initial state ({position}, {velocity})",
            "x": [position], "y": [velocity], "marker": {"color": color, "size": 9},
            "showlegend": False, "hovertemplate": "Initial x = %{x}<br>Initial v = %{y}<extra></extra>"
        })
    return {
        "data": traces,
        "layout": {
            "xaxis": {"title": {"text": "Position x"}, "range": [-2.3, 2.3], "zerolinecolor": "#a1b09a"},
            "yaxis": {"title": {"text": "Velocity v"}, "range": [-2.3, 2.3], "zerolinecolor": "#a1b09a"},
            "showlegend": False, "hovermode": "closest"
        }
    }


def write_figures(directory):
    directory.mkdir(parents=True, exist_ok=True)
    for name, figure in [("wave-surface", wave_surface()), ("damped-oscillator", oscillator())]:
        (directory / f"{name}.json").write_text(json.dumps(figure, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("plots"))
    write_figures(parser.parse_args().output)

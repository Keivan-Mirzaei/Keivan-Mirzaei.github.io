"""Print a scaled random walk as CSV; uses only Python's standard library."""

import argparse
import csv
from math import sqrt
from random import Random
import sys


def walk(steps=256, seed=42):
    if steps < 1:
        raise ValueError("steps must be positive")
    rng = Random(seed)
    position = 0.0
    points = [(0.0, position)]
    for step in range(1, steps + 1):
        position += rng.choice((-1, 1)) / sqrt(steps)
        points.append((step / steps, position))
    return points


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--steps", type=int, default=256)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    if args.steps < 1:
        parser.error("--steps must be positive")
    writer = csv.writer(sys.stdout, lineterminator="\n")
    writer.writerow(["time", "position"])
    writer.writerows(walk(args.steps, args.seed))

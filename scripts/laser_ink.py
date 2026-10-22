"""Natural ink geometry shared by product illustrations and the walkthrough."""
import math

def spline(anchors):
    """Sample a relaxed hand gesture without faceted joins."""
    points = []
    padded = [anchors[0], *anchors, anchors[-1]]
    for i in range(1, len(padded) - 2):
        a, b, c, d = padded[i - 1:i + 3]
        steps = max(5, int(math.dist(b, c) / 3))
        for j in range(steps):
            t = j / steps
            points.append(tuple(.5 * (2 * b[k] + (-a[k] + c[k]) * t +
                (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t*t +
                (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t*t*t) for k in (0, 1)))
    return [*points, anchors[-1]]


def loop(cx, cy, rx, ry):
    """One open, asymmetric pen loop, with a small overlap at the lift."""
    return [(cx + rx * (1 + .035 * math.sin(3*t)) * math.cos(t),
             cy + ry * (1 + .045 * math.cos(2*t)) * math.sin(t) + 1.8 * math.sin(t*2))
            for t in [-1.05 + i * 6.08 / 90 for i in range(91)]]


def natural_path(points, thickness):
    distances, widths = [0], [1.0]
    for a, b in zip(points, points[1:]):
        distance = math.dist(a, b)
        distances.append(distances[-1] + distance)
        target = max(.78, min(1.15, 1.15 - distance / 8 * .2))
        widths.append(widths[-1] * .8 + target * .2)
    length = distances[-1]
    span = min(18, length / 4)
    radii, left, right = [], [], []
    for i, p in enumerate(points):
        t = max(0, min(1, min(distances[i], length - distances[i]) / span)) if span else 1
        radius = thickness * widths[i] * (.18 + .82 * t*t * (3 - 2*t)) / 2
        radii.append(radius)
        a, b = points[max(0, i-1)], points[min(len(points)-1, i+1)]
        dx, dy = b[0]-a[0], b[1]-a[1]
        norm = math.hypot(dx, dy) or 1
        left.append((p[0] - dy/norm*radius, p[1] + dx/norm*radius))
        right.append((p[0] + dy/norm*radius, p[1] - dx/norm*radius))
    xy = lambda p: f"{p[0]:.2f} {p[1]:.2f}"
    mid = lambda a, b: ((a[0]+b[0])/2, (a[1]+b[1])/2)
    last = len(points)-1
    d = f"M {xy(left[0])}"
    for i in range(1, last):
        d += f" Q {xy(left[i])} {xy(mid(left[i],left[i+1]))}"
    d += f" L {xy(left[-1])} A {radii[-1]:.2f} {radii[-1]:.2f} 0 0 0 {xy(right[-1])}"
    if last > 1:
        d += f" L {xy(mid(right[-2],right[-1]))}"
    for i in range(last-1, 0, -1):
        d += f" Q {xy(right[i])} {xy(right[0] if i == 1 else mid(right[i-1],right[i]))}"
    return d + f" A {radii[0]:.2f} {radii[0]:.2f} 0 0 0 {xy(left[0])} Z"

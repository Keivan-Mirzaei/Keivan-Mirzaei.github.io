"""Build the native SVG supporting artwork and ink underline.

Run: python3 scripts/generate_laser_artwork.py
Ink uses the product's natural width profile and tapered ends. The live replay,
vendor icons, and archived references are maintained separately.
"""

from html import escape
from pathlib import Path

from laser_ink import spline, natural_path

ROOT = Path(__file__).resolve().parents[1]
INCLUDES = ROOT / "_includes/applications"
RED, BLUE, GREEN = "#ff304b", "#007aff", "#238636"
INK, MUTED, LINE, PAPER = "#30392e", "#7d8274", "#dfe1d3", "#faf9f6"
NIGHT, ORBIT = "#16262b", "#c3c7a4"
SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
SERIF = "Georgia,'Times New Roman',serif"
MONO = "ui-monospace,SFMono-Regular,Menlo,monospace"


def rect(x, y, w, h, fill, r=8, stroke=None, extra=""):
    border = f' stroke="{stroke}"' if stroke else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{border} {extra}/>'


def text(x, y, content, size=14, fill=INK, extra="", font=SANS):
    return f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" fill="{fill}" {extra}>{escape(content)}</text>'


def line(d, colour=LINE, width=1, extra=""):
    return f'<path d="{d}" fill="none" stroke="{colour}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'


def stroke(anchors, colour=RED, width=4, extra=""):
    return f'<path d="{natural_path(spline(anchors), width)}" fill="{colour}" {extra}/>'


def dot(x, y, colour=RED, radius=4):
    return (f'<circle cx="{x}" cy="{y}" r="{radius*4}" fill="{colour}" opacity=".035"/>'
            f'<circle cx="{x}" cy="{y}" r="{radius*2}" fill="{colour}" opacity=".13"/>'
            f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{colour}"/>'
            f'<circle cx="{x}" cy="{y}" r="{radius*.35}" fill="white" opacity=".85"/>')


def background(w, h, key, dark=False):
    paper, orbit = (NIGHT, "#789c98") if dark else (PAPER, ORBIT)
    light = "#9ecbc9" if dark else "#edc56d"
    return (f'<defs><radialGradient id="{key}-wash"><stop stop-color="{light}" stop-opacity=".12"/>'
            f'<stop offset="1" stop-color="{light}" stop-opacity="0"/></radialGradient></defs>'
            + rect(0, 0, w, h, paper, 0)
            + f'<ellipse cx="{w*.83}" cy="{h*.22}" rx="{w*.42}" ry="{h*.95}" fill="url(#{key}-wash)"/>'
            + f'<circle cx="{w-18}" cy="30" r="{h*.76}" stroke="{orbit}" stroke-width=".65" opacity=".38"/>'
            + f'<circle cx="{w*.85}" cy="{h*.23}" r="1.6" fill="{orbit}" opacity=".4"/>')


def keycap(label, x, y, w=96, pressed=False):
    face, border = ("#dcebcf", "#829779") if pressed else ("#fff", "#aab8a5")
    depth = 1 if pressed else 4
    return (rect(x, y+depth, w, 40, "#ced8c8", 8)
            + rect(x, y, w, 40, face, 8, border)
            + text(x+w/2, y+25, label, 16, "#304535", 'text-anchor="middle" font-weight="600"', MONO))


def mini_page(x, y, enabled):
    w, h = 164, 120
    body = rect(x, y, w, h, PAPER, 12, LINE)
    body += line(f'M{x+1} {y+26}H{x+w-1}', LINE, .8)
    body += ''.join(f'<circle cx="{x+12+i*7}" cy="{y+13}" r="1.7" fill="#c3c9bd"/>' for i in range(3))
    body += f'<circle cx="{x+w-15}" cy="{y+13}" r="6" stroke="#6b756d" stroke-width="1.4"/>'
    body += f'<circle cx="{x+w-15}" cy="{y+13}" r="1.8" fill="{RED if enabled else "#bfc6bb"}"/>'
    body += text(x+20, y+75, "An idea.", 23, font=SERIF)
    if enabled:
        body += stroke([(x+20, y+87), (x+48, y+85.8), (x+80, y+87), (x+116, y+86)], RED, 3.2)
        body += dot(x+131, y+68, RED, 2.8)
    return body


def write(name, w, h, title, body, view_box=None, extra=""):
    label = escape(title, quote=True)
    bounds = view_box or f"0 0 {w} {h}"
    attributes = f" {extra}" if extra else ""
    source = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
              f'viewBox="{bounds}" fill="none"{attributes} role="img" aria-label="{label}">\n'
              f'<title>{escape(title)}</title>\n{body}\n</svg>\n')
    (INCLUDES / name).write_text(source)


# Ink controls and Esc complement the unchanged replay.
controls = background(480, 240, "controls")
for x, colour in [(206, RED), (240, BLUE), (274, GREEN)]:
    controls += f'<circle cx="{x}" cy="64" r="9" fill="{colour}"/>'
controls += '<circle cx="240" cy="64" r="15" stroke="#007aff" stroke-width="1.2" opacity=".5"/>'
for x, width in [(65, 2), (200, 4), (335, 8)]:
    controls += stroke([(x, 135), (x+24, 132.5), (x+51, 135.5), (x+80, 133)], BLUE, width)
    controls += text(x+40, 178, f"{width} px", 13, MUTED, 'text-anchor="middle"')
write("laser-ink-controls.svg", 480, 240, "Three ink colours and tapered strokes at 2, 4, and 8 pixels.", controls)

escape_art = background(480, 240, "escape")
escape_art += mini_page(48, 30, True) + mini_page(268, 30, False)
escape_art += line("M227 91H253m-5-5 5 5-5 5", "#a2ad9a", 1.2)
escape_art += keycap("Esc", 192, 179, pressed=True)
write("laser-escape.svg", 480, 240, "Press Esc to switch the laser off and clear every annotation.", escape_art)

# The live HTML heading supplies the lettering; its only decoration is product ink.
underline = stroke([(3, 11.3), (25, 10.1), (57, 10.6), (89, 9.6), (117, 10.2)], BLUE, 6)
(INCLUDES / "laser-pencil-underline.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 20" fill="none" '
    'preserveAspectRatio="none" aria-hidden="true" focusable="false">\n'
    + underline + '\n</svg>\n')

print("Generated the two supporting plates and tapered ink underline.")

#!/usr/bin/env python3
"""Draws the Arabic strapline that arcs over the oval on the opening page.

Why this is artwork rather than text on a path
----------------------------------------------
The line was an SVG <textPath>. Chromium lays that out correctly but WebKit does
not: on iOS the run came out in logical order instead of visual order, so the two
words swapped places and each word's letters ran backwards. There is no markup or
CSS switch for it, and the line is decorative (the same words are in the page's
hidden summary for screen readers), so the fix is to take text layout off the arc
altogether.

The glyphs are shaped once here with HarfBuzz, the same shaper the browsers use,
and their outlines are then placed along the arc and written out as one filled
path. Nothing is left for a browser to lay out, so every engine draws the same
curve.

Regenerate after changing `opening.strapline` in scripts/ar-copy.json;
`node scripts/build-ar.mjs` runs this first.
"""

from __future__ import annotations

import json
import math
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
COPY = ROOT / "scripts" / "ar-copy.json"
VAR_FONT = ROOT / "assets" / "fonts" / "CSRk4ydQnPyaDxEXLFF6LZVLKrodrOYFFkCqIzAUWw.woff2"
OUT_SVG = ROOT / "assets" / "images" / "opening" / "strapline-ar.svg"

# The box the English strapline raster occupies, so the arc sits exactly where the
# artwork's own lettering sat. Kept in step with scripts/build-ar.mjs.
VIEW_W, VIEW_H = 346.0, 104.0
CURVE = ((6.0, 115.0), (173.0, -51.0), (340.0, 115.0))  # quadratic control points
FONT_SIZE = 40.0        # user units, as the CSS had it
WORD_SPACING = 14.0     # extra user units on the space, to open the two words up
WEIGHT = 500            # the weight the CSS asked for
INK = "#111"


def die(message: str) -> None:
    sys.exit(f"build-ar-strapline: {message}")


def quad_point(t: float) -> tuple[float, float]:
    (x0, y0), (x1, y1), (x2, y2) = CURVE
    m = 1.0 - t
    return (m * m * x0 + 2 * m * t * x1 + t * t * x2,
            m * m * y0 + 2 * m * t * y1 + t * t * y2)


def quad_tangent(t: float) -> float:
    (x0, y0), (x1, y1), (x2, y2) = CURVE
    dx = 2 * (1 - t) * (x1 - x0) + 2 * t * (x2 - x1)
    dy = 2 * (1 - t) * (y1 - y0) + 2 * t * (y2 - y1)
    return math.atan2(dy, dx)


def arc_table(samples: int = 6000) -> tuple[list[float], list[float]]:
    """Cumulative arc length against t, for mapping a distance back to a t."""
    ts, lengths, total = [0.0], [0.0], 0.0
    prev = quad_point(0.0)
    for i in range(1, samples + 1):
        t = i / samples
        cur = quad_point(t)
        total += math.dist(prev, cur)
        ts.append(t)
        lengths.append(total)
        prev = cur
    return ts, lengths


def t_at(distance: float, ts: list[float], lengths: list[float]) -> float:
    if distance <= 0:
        return 0.0
    if distance >= lengths[-1]:
        return 1.0
    lo, hi = 0, len(lengths) - 1
    while lo + 1 < hi:
        mid = (lo + hi) // 2
        if lengths[mid] <= distance:
            lo = mid
        else:
            hi = mid
    span = lengths[hi] - lengths[lo]
    frac = 0.0 if span == 0 else (distance - lengths[lo]) / span
    return ts[lo] + frac * (ts[hi] - ts[lo])


def shape(text: str, ttf: pathlib.Path) -> list[dict]:
    if not shutil.which("hb-shape"):
        die("hb-shape not found. Install HarfBuzz (brew install harfbuzz).")
    result = subprocess.run(
        ["hb-shape", f"--font-file={ttf}", "--direction=rtl", "--script=Arab",
         "--language=ar", "--output-format=json", "--no-clusters", text],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        die(f"hb-shape failed: {result.stderr.strip()}")
    # HarfBuzz returns an RTL run already in visual order, left to right.
    return json.loads(result.stdout)


def main() -> None:
    try:
        from fontTools.misc.transform import Transform
        from fontTools.pens.svgPathPen import SVGPathPen
        from fontTools.pens.transformPen import TransformPen
        from fontTools.ttLib import TTFont
        from fontTools.varLib.instancer import instantiateVariableFont
    except ImportError:
        die("fontTools is required (pip install fonttools)")

    copy = json.loads(COPY.read_text(encoding="utf-8"))
    text = " ".join(copy["opening"]["strapline"].split())
    if not text:
        die("opening.strapline is empty")

    # HarfBuzz needs a plain TTF and the CSS asked for weight 500, so the variable
    # font is pinned to that instance before both shaping and outline reading, so
    # the two agree.
    font = TTFont(VAR_FONT)
    if "fvar" not in font:
        die("expected a variable font")
    inst = instantiateVariableFont(font, {"wght": WEIGHT}, inplace=False,
                                   updateFontNames=False)
    inst.flavor = None
    tmp_ttf = ROOT / "output" / "kufi-strapline-instance.ttf"
    tmp_ttf.parent.mkdir(parents=True, exist_ok=True)
    inst.save(tmp_ttf)

    glyphs = shape(text, tmp_ttf)
    scale = FONT_SIZE / inst["head"].unitsPerEm
    glyph_set = inst.getGlyphSet()

    def advance(g: dict) -> float:
        """User-unit advance, with the space widened the way the CSS did it."""
        return g["ax"] * scale + (WORD_SPACING if g["g"] == "space" else 0.0)

    total_advance = sum(advance(g) for g in glyphs)
    ts, lengths = arc_table()
    path_length = lengths[-1]
    # `startOffset: 50%` with `text-anchor: middle` centres the run on the arc
    start = path_length / 2.0 - total_advance / 2.0
    if start < 0:
        print(f"  warning: the line overruns the arc by {-2 * start:.1f} units")

    parts: list[str] = []
    pen_distance = 0.0
    for g in glyphs:
        adv = advance(g)
        origin = start + pen_distance + g["dx"] * scale
        # SVG places a glyph by the midpoint of its advance on the path
        t = t_at(origin + adv / 2.0, ts, lengths)
        px, py = quad_point(t)
        theta = quad_tangent(t)
        cos_t, sin_t = math.cos(theta), math.sin(theta)
        # shift back half an advance so the midpoint lands on the point, and lift
        # by the mark's own offset (font y is up, SVG y is down)
        ox = -adv / 2.0
        oy = -g["dy"] * scale
        transform = Transform(
            scale * cos_t, scale * sin_t,          # xx, xy
            scale * sin_t, -scale * cos_t,         # yx, yy
            px + ox * cos_t - oy * sin_t,          # dx
            py + ox * sin_t + oy * cos_t,          # dy
        )
        svg_pen = SVGPathPen(glyph_set, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        glyph_set[g["g"]].draw(TransformPen(svg_pen, transform))
        d = svg_pen.getCommands()
        if d:
            parts.append(d)
        pen_distance += adv

    if not parts:
        die("no outlines produced")

    d = "".join(parts)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEW_W:g} {VIEW_H:g}"'
        ' preserveAspectRatio="none" role="img">\n'
        f'  <title>{text}</title>\n'
        f'  <path fill="{INK}" d="{d}"/>\n'
        "</svg>\n"
    )
    OUT_SVG.parent.mkdir(parents=True, exist_ok=True)
    OUT_SVG.write_text(svg, encoding="utf-8")
    tmp_ttf.unlink(missing_ok=True)
    print(f'  strapline "{text}": {len(glyphs)} glyphs, '
          f"{total_advance:.1f} of {path_length:.1f} units of arc")
    print(f"  wrote {OUT_SVG.relative_to(ROOT)} ({len(svg)} bytes)")


if __name__ == "__main__":
    main()

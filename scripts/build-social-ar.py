#!/usr/bin/env python3
"""Build the Arabic link-preview card.

A guest's first contact with the invitation is a pasted link, so each edition
needs a preview that carries its own opening page. The English card is composed by
scripts/build-social-assets.py straight from the artwork layers, which works
because every piece of its opening scene is a raster file.

The Arabic opening is not: the two names and the connector are live text in Aref
Ruqaa and the strapline is a generated outline, so there is nothing on disk to
paste for them. Rendering the page in a browser was the obvious alternative and
was tried first, but the only headless browser to hand reports a device pixel
ratio of 3 and still hands back CSS-sized pixels, so the card came out of a
430px-wide render and had to be upscaled 2.7x to fill the frame. It looked soft.

So the lettering is drawn here instead: shaped with HarfBuzz, the same shaper the
browsers use, and filled from the font's own outlines at whatever size the card
needs. Everything else is the same artwork the page paints, positioned from the
percentages in assets/images/manifest.json.

Output: assets/images/social/og-invitation-ar.jpg (1200x630)

Run: python3 scripts/build-social-ar.py
Requires Pillow, fontTools and hb-shape (brew install harfbuzz).
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SOCIAL = ROOT / 'assets/images/social'
OUT = SOCIAL / 'og-invitation-ar.jpg'

# The Canva artboard the scene percentages are relative to.
PAGE_W, PAGE_H = 502.1245, 767.625
RENDER_W = 1800          # render this wide, then downsample into the card
SUPERSAMPLE = 2          # extra resolution for the outlines, to smooth their edges
PAPER = (238, 233, 229)

# Roots 4, 5, 7 and 12 are the English lettering: the two names, the strapline
# and the ampersand. The Arabic page replaces all four, so they are skipped here
# and their Arabic counterparts drawn further down.
ENGLISH_LETTERING = {'4', '5', '7', '12'}
# The sailboat's entrance ends at translateX(-205%) of its own width.
BOAT_ROOT, BOAT_REST_SHIFT = '20', -2.05

# Geometry of the Arabic lettering, matching scripts/build-ar.mjs. `centre` and
# `mid` are percentages of the scene; `size` is the font size in cqw, which is a
# percentage of the page width.
NAMES = [
    {'text': 'يوسف', 'centre': 53.0102, 'mid': 38.1382, 'size': 13.2, 'ink': '#111111'},
    {'text': 'لارا', 'centre': 52.0455, 'mid': 53.3314, 'size': 13.2, 'ink': '#111111'},
    {'text': 'و', 'centre': 53.5770, 'mid': 45.1040, 'size': 8.6, 'ink': '#ee9fac'},
]
NAME_FONT = ROOT / 'assets/fonts/aref-ruqaa-arabic-400.woff2'

# Where the strapline artwork sits, matching the box in scripts/build-ar.mjs.
STRAPLINE_SVG = ROOT / 'assets/images/opening/strapline-ar.svg'
STRAPLINE_BOX = {'left': 37.288362, 'top': 25.669695, 'width': 31.931722, 'height': 6.036489}

# CSS puts the baseline this far below the centre of the line box, for a
# line-height of 1.05 and this font's typographic metrics:
#   half-leading = (1.05em - (ascent + descent)) / 2
#   baseline     = centre - 1.05em/2 + half-leading + ascent
# which reduces to ascent - 1.05em/2 below the centre. Verified against the
# browser by overlaying this composition on a screenshot of the page.
BASELINE_BELOW_CENTRE_EM = None    # computed from the font once it is loaded

# The band of the page the card frames, and its margin, as the English card uses.
BAND_TOP, BAND_BOTTOM = 0.145, 0.700
CARD_W, CARD_H, CARD_MARGIN = 1200, 630, 26


def die(message: str) -> None:
    sys.exit(f'build-social-ar: {message}')


# ----------------------------------------------------------------- artwork

def page_render() -> Image.Image:
    """Composite the Arabic opening scene's artwork, minus the English lettering."""
    manifest = json.loads((ROOT / 'assets/images/manifest.json').read_text())
    scale = RENDER_W / PAGE_W
    size = (RENDER_W, round(PAGE_H * scale))
    canvas = Image.new('RGBA', size, (255, 255, 255, 255))

    for element in manifest['elements']:
        if element['sceneIndex'] != 0:
            continue
        box = element['rendered']
        if box['widthPercent'] is None:
            continue                      # the birds carry geometry on their wrapper
        if element['dataRoot'] in ENGLISH_LETTERING:
            continue
        width = box['widthPercent'] / 100 * size[0]
        height = box['heightPercent'] / 100 * size[1]
        left = box['leftPercent'] / 100 * size[0]
        top = box['topPercent'] / 100 * size[1]
        if element['dataRoot'] == BOAT_ROOT:
            left += BOAT_REST_SHIFT * width
        layer = Image.open(ROOT / element['assetPath']).convert('RGBA')
        layer = layer.resize((max(1, round(width)), max(1, round(height))), Image.LANCZOS)
        canvas.alpha_composite(layer, (round(left), round(top)))

    # The hummingbirds are positioned inline, on the Arabic page in this case.
    html = (ROOT / 'ar/index.html').read_text()
    bird = Image.open(ROOT / 'assets/images/opening/hummingbird-1e6a7357.gif').convert('RGBA')
    for match in re.finditer(r'class="bird-wrap bird-\d"\s+style="([^"]+)"', html):
        values = dict(re.findall(r'(--flip|left|top|width)\s*:\s*([-\d.]+)', match.group(1)))
        if not {'left', 'top', 'width'} <= values.keys():
            continue
        side = float(values['width']) / 100 * size[0]
        wings = bird.resize((max(1, round(side)), max(1, round(side))), Image.LANCZOS)
        if float(values.get('--flip', 1)) < 0:
            wings = wings.transpose(Image.FLIP_LEFT_RIGHT)
        canvas.alpha_composite(wings, (round(float(values['left']) / 100 * size[0]),
                                       round(float(values['top']) / 100 * size[1])))
    return canvas


# ---------------------------------------------------------------- lettering

def flatten(contours, steps: int = 12):
    """Turn recorded pen commands into closed polygons.

    These are TrueType outlines, so most segments arrive as `qCurveTo`: a run of
    off-curve points ending on-curve, with an implied on-curve point halfway
    between each pair of consecutive controls. Dropping those, as an earlier
    version did, collapses every curve into a straight jump and the glyphs come
    out as shards.
    """
    polygons, current = [], []

    def cubic(p0, p1, p2, p3):
        for i in range(1, steps + 1):
            t = i / steps
            u = 1 - t
            yield (u**3 * p0[0] + 3*u*u*t * p1[0] + 3*u*t*t * p2[0] + t**3 * p3[0],
                   u**3 * p0[1] + 3*u*u*t * p1[1] + 3*u*t*t * p2[1] + t**3 * p3[1])

    def quad(p0, p1, p2):
        for i in range(1, steps + 1):
            t = i / steps
            u = 1 - t
            yield (u*u * p0[0] + 2*u*t * p1[0] + t*t * p2[0],
                   u*u * p0[1] + 2*u*t * p1[1] + t*t * p2[1])

    def midpoint(a, b):
        return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)

    for op, args in contours:
        if op == 'moveTo':
            if len(current) > 2:
                polygons.append(current)
            current = [args[0]]
        elif op == 'lineTo':
            current.append(args[0])
        elif op == 'curveTo':
            current.extend(cubic(current[-1], *args))
        elif op == 'qCurveTo':
            points = list(args)
            if points[-1] is None:
                # a closed contour with no on-curve point at all: start halfway
                # between the last and first controls and come back round to it
                controls = points[:-1]
                start = midpoint(controls[-1], controls[0])
                if not current:
                    current = [start]
                points = controls + [start]
            controls, end = points[:-1], points[-1]
            for i, control in enumerate(controls):
                stop = midpoint(control, controls[i + 1]) if i + 1 < len(controls) else end
                current.extend(quad(current[-1], control, stop))
        elif op == 'closePath':
            if len(current) > 2:
                polygons.append(current)
            current = []
    if len(current) > 2:
        polygons.append(current)
    return polygons


def shape(text: str, ttf: Path):
    """Shape a right-to-left Arabic run; HarfBuzz returns it in visual order."""
    if not shutil.which('hb-shape'):
        die('hb-shape not found. Install HarfBuzz (brew install harfbuzz).')
    result = subprocess.run(
        ['hb-shape', f'--font-file={ttf}', '--direction=rtl', '--script=Arab',
         '--language=ar', '--output-format=json', '--no-clusters', text],
        capture_output=True, text=True)
    if result.returncode != 0:
        die(f'hb-shape failed: {result.stderr.strip()}')
    return json.loads(result.stdout)


def draw_polygons(mask: Image.Image, polygons) -> None:
    """Fill contours, using even-odd so counters stay open.

    Each contour is XOR-ed into the mask, which is what the even-odd rule does.
    These faces draw their counters in the opposite direction, so this matches the
    non-zero winding the outlines were designed for.
    """
    from PIL import ImageChops

    for polygon in polygons:
        if len(polygon) < 3:
            continue
        patch = Image.new('1', mask.size, 0)
        ImageDraw.Draw(patch).polygon([(round(x), round(y)) for x, y in polygon], fill=1)
        # XOR this contour into what is already there, which is the even-odd rule
        mask.paste(ImageChops.logical_xor(mask, patch))


def name_layer(size, scene_h) -> Image.Image:
    """Draw the two names and the connector at their places in the scene."""
    global BASELINE_BELOW_CENTRE_EM
    from fontTools.misc.transform import Transform
    from fontTools.pens.recordingPen import DecomposingRecordingPen, RecordingPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.ttLib import TTFont

    font = TTFont(NAME_FONT)
    font.flavor = None
    ttf = ROOT / 'output/aref-ruqaa-social.ttf'
    ttf.parent.mkdir(parents=True, exist_ok=True)
    font.save(ttf)

    upem = font['head'].unitsPerEm
    ascent = font['OS/2'].sTypoAscender
    BASELINE_BELOW_CENTRE_EM = ascent / upem - 1.05 / 2
    glyph_set = font.getGlyphSet()
    order = font.getGlyphOrder()

    def resolve(name: str) -> str:
        m = re.fullmatch(r'gid(\d+)', name)
        return order[int(m.group(1))] if m else name

    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    for item in NAMES:
        font_px = item['size'] / 100 * size[0]
        glyphs = shape(item['text'], ttf)
        advance = sum(g['ax'] for g in glyphs) / upem * font_px
        origin_x = item['centre'] / 100 * size[0] - advance / 2
        baseline_y = item['mid'] / 100 * scene_h + BASELINE_BELOW_CENTRE_EM * font_px

        polygons, pen_units = [], 0.0
        for g in glyphs:
            # composite glyphs record addComponent, so decompose to real contours
            record = DecomposingRecordingPen(glyph_set)
            glyph_set[resolve(g['g'])].draw(record)
            scale = font_px / upem
            shift_x = origin_x + (pen_units + g['dx']) * scale
            shift_y = baseline_y - g['dy'] * scale
            placed = RecordingPen()
            record.replay(TransformPen(placed, Transform(scale, 0, 0, -scale, shift_x, shift_y)))
            polygons.extend(flatten(placed.value))
            pen_units += g['ax']

        mask = Image.new('1', size, 0)
        draw_polygons(mask, polygons)
        ink = Image.new('RGBA', size, item['ink'])
        layer.paste(ink, None, mask)
    ttf.unlink(missing_ok=True)
    return layer


def strapline_layer(size, scene_h) -> Image.Image:
    """Fill the generated strapline outline into its box on the page."""
    svg = STRAPLINE_SVG.read_text(encoding='utf-8')
    view = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    d = re.search(r'\sd="([^"]+)"', svg)
    if not (view and d):
        die('could not read the strapline outline')
    vw, vh = float(view.group(1)), float(view.group(2))
    box_w = STRAPLINE_BOX['width'] / 100 * size[0]
    box_h = STRAPLINE_BOX['height'] / 100 * scene_h
    box_x = STRAPLINE_BOX['left'] / 100 * size[0]
    box_y = STRAPLINE_BOX['top'] / 100 * scene_h
    sx, sy = box_w / vw, box_h / vh

    # SVGPathPen writes only M, L, C, Q and Z, in absolute coordinates.
    polygons, current, pos, start = [], [], (0.0, 0.0), (0.0, 0.0)

    def place(x, y):
        return (box_x + x * sx, box_y + y * sy)

    def bez(points, steps=12):
        for i in range(1, steps + 1):
            t = i / steps
            u = 1 - t
            if len(points) == 4:
                p0, p1, p2, p3 = points
                yield (u**3 * p0[0] + 3*u*u*t * p1[0] + 3*u*t*t * p2[0] + t**3 * p3[0],
                       u**3 * p0[1] + 3*u*u*t * p1[1] + 3*u*t*t * p2[1] + t**3 * p3[1])
            else:
                p0, p1, p2 = points
                yield (u*u * p0[0] + 2*u*t * p1[0] + t*t * p2[0],
                       u*u * p0[1] + 2*u*t * p1[1] + t*t * p2[1])

    for cmd, nums in re.findall(r'([MLCQZ])([^MLCQZ]*)', d.group(1)):
        vals = [float(v) for v in re.findall(r'-?\d*\.?\d+(?:e-?\d+)?', nums)]
        if cmd == 'M':
            if len(current) > 2:
                polygons.append(current)
            pos = start = (vals[0], vals[1])
            current = [place(*pos)]
        elif cmd == 'L':
            for i in range(0, len(vals), 2):
                pos = (vals[i], vals[i + 1])
                current.append(place(*pos))
        elif cmd == 'C':
            for i in range(0, len(vals), 6):
                pts = [pos, (vals[i], vals[i+1]), (vals[i+2], vals[i+3]), (vals[i+4], vals[i+5])]
                current.extend(place(*p) for p in bez(pts))
                pos = pts[-1]
        elif cmd == 'Q':
            for i in range(0, len(vals), 4):
                pts = [pos, (vals[i], vals[i+1]), (vals[i+2], vals[i+3])]
                current.extend(place(*p) for p in bez(pts))
                pos = pts[-1]
        elif cmd == 'Z':
            if len(current) > 2:
                polygons.append(current)
            current, pos = [], start
    if len(current) > 2:
        polygons.append(current)

    mask = Image.new('1', size, 0)
    draw_polygons(mask, polygons)
    layer = Image.new('RGBA', size, (0, 0, 0, 0))
    layer.paste(Image.new('RGBA', size, '#111111'), None, mask)
    return layer


# --------------------------------------------------------------------- card

def main() -> None:
    page = page_render()
    big = (page.width * SUPERSAMPLE, page.height * SUPERSAMPLE)
    scene_h_big = page.height * SUPERSAMPLE

    ink = strapline_layer(big, scene_h_big)
    ink.alpha_composite(name_layer(big, scene_h_big))
    page.alpha_composite(ink.resize(page.size, Image.LANCZOS))

    top = round(page.height * BAND_TOP)
    bottom = round(page.height * BAND_BOTTOM)
    band = page.crop((0, top, page.width, bottom)).convert('RGB')
    height = CARD_H - 2 * CARD_MARGIN
    width = round(band.width * height / band.height)
    band = band.resize((width, height), Image.LANCZOS)
    card = Image.new('RGB', (CARD_W, CARD_H), PAPER)
    card.paste(band, ((CARD_W - width) // 2, (CARD_H - height) // 2))
    SOCIAL.mkdir(parents=True, exist_ok=True)
    card.save(OUT, quality=84, optimize=True, progressive=True)
    print(f'  baseline sits {BASELINE_BELOW_CENTRE_EM:.4f} em below each line box centre')
    print(f'  {OUT.relative_to(ROOT)} {card.width}x{card.height} '
          f'({OUT.stat().st_size:,} bytes)')


if __name__ == '__main__':
    main()

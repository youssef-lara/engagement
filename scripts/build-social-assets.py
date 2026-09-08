#!/usr/bin/env python3
"""Build the link-preview image and the site icons from the opening artwork.

A guest's first contact with the invitation is a pasted link in a chat app, so
the preview image has to carry the invitation rather than the browser's default
blank card. Everything here is composed from the original opening-scene artwork:
the same layers the page paints, positioned from the percentages recorded in
assets/images/manifest.json, so the preview cannot drift from the real page.

Outputs (all committed, nothing is generated at request time):
  assets/images/social/og-invitation.jpg   1200x630 link preview
  assets/images/social/apple-touch-icon.png 180x180 home-screen icon
  assets/images/social/icon-192.png         192x192 icon
  favicon.ico                               16/32/48 browser tab icon

Run: python3 scripts/build-social-assets.py
Requires Pillow.
"""

import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOCIAL = ROOT / 'assets/images/social'

# The Canva artboard the scene percentages are relative to.
PAGE_W, PAGE_H = 502.1245, 767.625
# Render the page this wide before cropping, so the preview downsamples.
RENDER_W = 1800
PAPER = (238, 233, 229)

# The sailboat's entrance ends at translateX(-205%) of its own width; the
# preview should show where it comes to rest, not where it starts.
BOAT_ROOT = '20'
BOAT_REST_SHIFT = -2.05


def page_render():
    """Composite the opening scene from its original layers."""
    manifest = json.loads((ROOT / 'assets/images/manifest.json').read_text())
    scale = RENDER_W / PAGE_W
    size = (RENDER_W, round(PAGE_H * scale))
    canvas = Image.new('RGBA', size, (255, 255, 255, 255))

    for element in manifest['elements']:
        if element['sceneIndex'] != 0:
            continue
        box = element['rendered']
        if box['widthPercent'] is None:
            # The hummingbirds carry their geometry on their wrapper, not the
            # image, so they are placed from the page below instead.
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

    # The hummingbirds are positioned inline in the page, not in the manifest.
    html = (ROOT / 'index.html').read_text()
    bird = Image.open(ROOT / 'assets/images/opening/hummingbird-1e6a7357.gif')
    bird = bird.convert('RGBA')
    for match in re.finditer(r'class="bird-wrap bird-\d"\s+style="([^"]+)"', html):
        style = match.group(1)
        values = dict(re.findall(r'(--flip|left|top|width)\s*:\s*([-\d.]+)', style))
        if not {'left', 'top', 'width'} <= values.keys():
            continue
        side = float(values['width']) / 100 * size[0]
        wings = bird.resize((max(1, round(side)), max(1, round(side))), Image.LANCZOS)
        if float(values.get('--flip', 1)) < 0:
            wings = wings.transpose(Image.FLIP_LEFT_RIGHT)
        canvas.alpha_composite(wings, (round(float(values['left']) / 100 * size[0]),
                                       round(float(values['top']) / 100 * size[1])))
    return canvas


def link_preview(page):
    """1200x630 landscape crop around the oval, framed on the paper colour."""
    target = (1200, 630)
    # The invitation is portrait and the preview is landscape, so rather than
    # crop into the artwork, take the full width of the band that carries the
    # strapline, the oval and both names, and rest it on the paper colour.
    top = round(page.height * 0.145)
    bottom = round(page.height * 0.700)
    band = page.crop((0, top, page.width, bottom)).convert('RGB')
    height = target[1] - 2 * 26  # a paper margin, so it reads as a card
    width = round(band.width * height / band.height)
    band = band.resize((width, height), Image.LANCZOS)
    preview = Image.new('RGB', target, PAPER)
    preview.paste(band, ((target[0] - width) // 2, (target[1] - height) // 2))
    out = SOCIAL / 'og-invitation.jpg'
    preview.save(out, quality=84, optimize=True, progressive=True)
    print(f'{out.relative_to(ROOT)} {preview.width}x{preview.height} '
          f'({out.stat().st_size:,} bytes)')


def icons():
    """The watercolour heart from above the couple's names, on paper."""
    heart = Image.open(ROOT / 'assets/images/opening/watercolor-heart-3e25f248.png').convert('RGBA')
    for name, side, inset in [('apple-touch-icon.png', 180, 0.18), ('icon-192.png', 192, 0.18)]:
        icon = Image.new('RGB', (side, side), PAPER)
        room = round(side * (1 - 2 * inset))
        scaled = heart.resize((round(room * heart.width / heart.height), room), Image.LANCZOS)
        icon.paste(scaled, ((side - scaled.width) // 2, (side - scaled.height) // 2), scaled)
        icon.save(SOCIAL / name, optimize=True)
        print(f'{(SOCIAL / name).relative_to(ROOT)} {side}x{side} '
              f'({(SOCIAL / name).stat().st_size:,} bytes)')

    # A tab icon needs the heart to fill the frame to still read at 16px.
    tab = Image.new('RGBA', (96, 96), (0, 0, 0, 0))
    scaled = heart.resize((round(96 * heart.width / heart.height), 96), Image.LANCZOS)
    tab.paste(scaled, ((96 - scaled.width) // 2, 0), scaled)
    tab.save(ROOT / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    print(f'favicon.ico ({(ROOT / "favicon.ico").stat().st_size:,} bytes)')


if __name__ == '__main__':
    SOCIAL.mkdir(parents=True, exist_ok=True)
    page = page_render()
    link_preview(page)
    icons()

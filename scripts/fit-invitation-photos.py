#!/usr/bin/env python3
"""Fit new couple photographs into the invitation collage without moving it.

The invitation scene keeps the Canva composition: every layer is an absolutely
positioned image whose rotation is baked into the PNG, not applied with CSS. To
swap a photograph we therefore have to reproduce the original file's canvas size
and the exact tilted quadrilateral the old artwork occupied inside it. Doing that
means the surrounding lace card, envelope, lilies and floral corners keep their
overlaps and z-order, and no layout or CSS has to change.

Two layers are replaced:

  data-root 32  the standalone polaroid above the envelope (its own white frame
                is part of the artwork)
  data-root 29  the photograph tucked into the polaroid frame of data-root 28,
                so this one is the bare photo with no border of its own

The target quads below were measured from the alpha channel of the original
exports (corner = extreme point of `x+y` / `x-y` over the opaque mask):

  invitation-card-pink-fill-b3bde139.png  302x342  tilt -5.2 deg
  couple-photo-stairs-80d43926.png        136x133  tilt +15.8 deg

Run: python3 scripts/fit-invitation-photos.py
Requires Pillow and NumPy. Outputs are written next to the originals; nothing is
overwritten, so the source exports stay available for rollback.
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
INVITATION = ROOT / 'assets/images/invitation'

# Each job maps the four corners of a rectangular region of the new photograph
# (top-left, top-right, bottom-right, bottom-left) onto the tilted quad the old
# artwork filled, on a canvas of the same proportions as the old export.
JOBS = [
    {
        'name': 'polaroid (data-root 32)',
        'source': INVITATION / 'Polaroid.png',
        # The supplied file is a photographed polaroid centred on black. Crop the
        # paper itself, inset by 3px so no dark edge pixel survives the rotation.
        'source_box': (524, 268, 1076, 929),
        'canvas': (302, 342),
        'quad': [(84, 116), (206, 105), (219, 248), (96, 259)],
        'scale': 3,
        # The new paper photographs as pure white, which disappears against the
        # white page. The replaced export's paper measured (238, 237, 232), so
        # bring the white point back to that warm off-white.
        'white_point': (238, 237, 232),
        # Reuse the original export's own faint drop shadow instead of drawing a
        # new one: every pixel of it below half alpha is that diffuse halo.
        'halo_from': INVITATION / 'invitation-card-pink-fill-b3bde139.png',
        'output': INVITATION / 'couple-polaroid-proposal.png',
    },
    {
        'name': 'overlaid photo (data-root 29)',
        'source': INVITATION / 'Proposal.jpg',
        # Full-width crop, tall enough to match the old photo's 1.039 aspect and
        # placed to keep both figures and the flower bed inside the frame.
        'source_box': (0, 1400, 2774, 4070),
        'canvas': (136, 133),
        'quad': [(29, 0), (135, 30), (106, 132), (0, 102)],
        'scale': 4,
        # The collage's photographs are muted and neutral (the replaced one
        # peaked at 219). Hold the highlights back without tinting them.
        'white_point': (232, 232, 232),
        'output': INVITATION / 'couple-photo-proposal.png',
    },
]

# Supersampling factor used while distorting, removed again by the final resize.
# Bicubic sampling alone leaves the tilted edges visibly stepped at these sizes.
OVERSAMPLE = 2


def perspective_coefficients(destination, source):
    """Solve the PIL PERSPECTIVE coefficients mapping output back to input."""
    rows = []
    values = []
    for (dx, dy), (sx, sy) in zip(destination, source):
        rows.append([dx, dy, 1, 0, 0, 0, -dx * sx, -dy * sx])
        values.append(sx)
        rows.append([0, 0, 0, dx, dy, 1, -dx * sy, -dy * sy])
        values.append(sy)
    solution, *_ = np.linalg.lstsq(np.asarray(rows, dtype=float),
                                   np.asarray(values, dtype=float), rcond=None)
    return solution.tolist()


def build(job):
    photo = Image.open(job['source']).convert('RGB').crop(job['source_box'])
    width, height = photo.size
    # Opaque inside the crop only: the transparent surround is what gives the
    # rotated edges their anti-aliasing once the quad is sampled.
    photo.putalpha(255)

    scale = job['scale'] * OVERSAMPLE
    canvas = (job['canvas'][0] * scale, job['canvas'][1] * scale)
    quad = [(x * scale, y * scale) for x, y in job['quad']]
    corners = [(0, 0), (width, 0), (width, height), (0, height)]
    coefficients = perspective_coefficients(quad, corners)

    placed = photo.transform(canvas, Image.PERSPECTIVE, coefficients,
                             resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0))
    final = placed.resize((job['canvas'][0] * job['scale'],
                           job['canvas'][1] * job['scale']), Image.LANCZOS)

    pixels = np.array(final).astype(np.float32)
    factors = np.asarray(job['white_point'], dtype=np.float32) / 255
    pixels[:, :, :3] = np.clip(pixels[:, :, :3] * factors, 0, 255)
    final = Image.fromarray(pixels.round().astype(np.uint8), 'RGBA')

    halo_source = job.get('halo_from')
    if halo_source:
        halo = Image.open(halo_source).convert('RGBA').resize(final.size, Image.LANCZOS)
        values = np.array(halo)
        values[:, :, 3] = np.where(values[:, :, 3] > 128, 0, values[:, :, 3])
        final = Image.alpha_composite(Image.fromarray(values, 'RGBA'), final)

    final.save(job['output'], optimize=True)

    opaque = np.array(final)[:, :, 3] > 128
    ys, xs = np.nonzero(opaque)
    coverage = opaque.sum() / (0.5 * abs(
        sum(quad[i][0] * quad[(i + 1) % 4][1] - quad[(i + 1) % 4][0] * quad[i][1]
            for i in range(4))) / OVERSAMPLE ** 2)
    print(f"{job['name']}: {job['output'].name} "
          f"{final.width}x{final.height} ({job['output'].stat().st_size:,} bytes), "
          f"opaque bbox {xs.min()},{ys.min()}-{xs.max()},{ys.max()}, "
          f"quad fill {coverage:.1%}")


if __name__ == '__main__':
    for job in JOBS:
        build(job)

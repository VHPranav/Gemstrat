#!/usr/bin/env python3
"""
Trace a blueprint drawing for the Approach page (BlueprintDrawing.tsx).

Takes a flat front-elevation drawing (black ink on off-white paper) and writes:
  public/images/blueprint/<name>.webp  the drawing as white ink on a
                                       transparent sheet (darkness -> opacity)
  src/data/blueprint/<name>.json       its long straight lines and the outline
                                       of each mass, in the image's own pixels,
                                       plus the ground line and a hash of the
                                       image for cache-busting

Usage (needs opencv-python-headless, numpy, pillow):
  python3 scripts/trace-blueprint.py assets/blueprint/taj-mahal.png taj-mahal
"""

import hashlib
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

MIN_RUN = 34  # shortest run of ink kept as a line, px
SHORT = 70  # lines shorter than this must touch another line to stay
TOUCH = 7  # how close two lines must be to touch, px


def runs(mask, horizontal):
    """Centre line of each straight run of ink in an opened mask"""
    n, _, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
    out = []
    for i in range(1, n):
        x, y, w, h, _ = stats[i]
        if horizontal and h <= 8:
            out.append([x, y + h // 2, x + w - 1, y + h // 2])
        elif not horizontal and w <= 8:
            out.append([x + w // 2, y, x + w // 2, y + h - 1])
    return out


def merge(lines, horizontal, gap=10):
    """Join runs that sit on the same line with a small gap between them"""
    key = (lambda l: (l[1], l[0])) if horizontal else (lambda l: (l[0], l[1]))
    lines = sorted(lines, key=key)
    out = []
    for l in lines:
        if out:
            p = out[-1]
            if horizontal and abs(p[1] - l[1]) <= 2 and l[0] - p[2] <= gap:
                p[2] = max(p[2], l[2])
                continue
            if not horizontal and abs(p[0] - l[0]) <= 2 and l[1] - p[3] <= gap:
                p[3] = max(p[3], l[3])
                continue
        out.append(list(l))
    return out


def length(l):
    return abs(l[2] - l[0]) + abs(l[3] - l[1])


def touches(a, b):
    """Does an end of line a lie on (or next to) line b?"""
    for x, y in ((a[0], a[1]), (a[2], a[3])):
        if min(b[0], b[2]) - TOUCH <= x <= max(b[0], b[2]) + TOUCH and min(b[1], b[3]) - TOUCH <= y <= max(b[1], b[3]) + TOUCH:
            return True
    return False


def main(src, name):
    root = Path(__file__).resolve().parent.parent
    out_dir = root / 'public' / 'images' / 'blueprint'
    out_dir.mkdir(parents=True, exist_ok=True)

    img = cv2.imread(src, cv2.IMREAD_GRAYSCALE)
    h, w = img.shape
    ink = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 31, 25)

    hor = cv2.morphologyEx(ink, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (MIN_RUN, 1)))
    ver = cv2.morphologyEx(ink, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (1, MIN_RUN)))
    hs = merge(runs(hor, True), True)
    vs = merge(runs(ver, False), False)

    # Ground: the longest horizontal in the lower part of the drawing
    low = [l for l in hs if l[1] > h * 0.7 and length(l) > w * 0.5]
    ground_y = max(low, key=length)[1] if low else int(h * 0.82)
    ground = [0, ground_y, w, ground_y]

    # The building spans its long horizontals; anything outside is not it
    long_h = [l for l in hs if length(l) > 140 and l[1] < ground_y - 4]
    bx0 = min(l[0] for l in long_h) - 10
    bx1 = max(l[2] for l in long_h) + 10

    lines = [l for l in hs + vs if abs(l[1] - ground_y) > 3 or l[1] != l[3]]
    lines = [l for l in lines if bx0 <= l[0] and l[2] <= bx1 and max(l[1], l[3]) <= ground_y + 2]

    # Short lines that touch nothing are texture, not edges
    kept = []
    for l in lines:
        if length(l) >= SHORT or any(o is not l and touches(l, o) for o in lines):
            kept.append(l)

    # Outline: the outer edge of each solid mass of ink (the dome, minarets
    # and other curves the straight-line pass can't find)
    solid = cv2.morphologyEx(ink, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    solid[ground_y - 1:, :] = 0
    contours, _ = cv2.findContours(solid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    outline = []
    for c in contours:
        if cv2.contourArea(c) < 1500:
            continue
        poly = cv2.approxPolyDP(c, 1.2, True).reshape(-1, 2)
        outline.append([[int(x), int(y)] for x, y in poly])

    # The drawing as white ink on a transparent sheet
    paper = float(np.percentile(img, 90))
    level = np.clip(img.astype(np.float32) * (255.0 / max(paper - 4, 1)), 0, 255)
    alpha = np.clip((255 - level) * (255.0 / (255 - 17)), 0, 255).astype(np.uint8)
    white = np.full_like(alpha, 255)
    rgba = np.dstack([white, white, white, alpha])
    webp = out_dir / f'{name}.webp'
    Image.fromarray(rgba).save(webp, 'WEBP', quality=82, method=6)

    v = hashlib.sha1(webp.read_bytes()).hexdigest()[:8]
    data = {
        'w': w,
        'h': h,
        'v': v,
        'ground': [int(c) for c in ground],
        'building': [int(bx0), int(bx1)],
        'lines': [[int(c) for c in l] for l in kept],
        'outline': outline,
    }
    data_dir = root / 'src' / 'data' / 'blueprint'
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / f'{name}.json').write_text(json.dumps(data, separators=(',', ':')))
    print(f'{name}: {len(kept)} lines, {len(outline)} outlines ({sum(len(o) for o in outline)} pts) ({len(hs)} h, {len(vs)} v found), ground y={ground_y}, '
          f'building x={bx0}..{bx1}, webp {webp.stat().st_size // 1024} KB, v={v}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])

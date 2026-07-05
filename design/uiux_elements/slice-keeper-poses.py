#!/usr/bin/env python3
"""Slice the accurate keeper sheets (10 = examine poses, 11 = adjust beat) into
registered, transparent WebP frames under static/img/hero/keeper/.

The sheets are RGB with the keeper on a light background and thin blue/orange
registration guides. We background-key light low-saturation pixels AND the blue
guide lines to transparent, find each pose via a coverage-thresholded bbox (which
ignores the thin guide lines), then place every frame on a common canvas anchored
by the FEET centre (horizontal centroid of the lowest band + bbox bottom) so all
frames register and crossfade without jumping. Run from the repo root:

    python design/uiux_elements/slice-keeper-poses.py
"""
import os
from PIL import Image

OUT = "static/img/hero/keeper"
CW, CH = 440, 500          # frame canvas
AX, AY = 220, 478          # feet anchor on the canvas


def is_bg(r, g, b):
    mx, mn = max(r, g, b), min(r, g, b)
    lum = (r + g + b) / 3
    sat = 0 if mx == 0 else (mx - mn) / mx
    return lum > 168 and sat < 0.16


def is_blue_guide(r, g, b):
    return b > 120 and b - max(r, g) > 22


def keyed(path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    out = Image.new("RGBA", (w, h))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            op[x, y] = (0, 0, 0, 0) if (is_bg(r, g, b) or is_blue_guide(r, g, b)) else (r, g, b, 255)
    return out


def cover_bbox(out, x0, y0, x1, y1, thr=0.10):
    a = out.load()
    w, h = x1 - x0, y1 - y0
    rowc = [sum(1 for x in range(x0, x1) if a[x, y][3] > 0) for y in range(y0, y1)]
    colc = [sum(1 for y in range(y0, y1) if a[x, y][3] > 0) for x in range(x0, x1)]
    ry = [i for i, c in enumerate(rowc) if c > w * thr]
    rx = [i for i, c in enumerate(colc) if c > h * thr]
    if not ry or not rx:
        return None
    return (x0 + min(rx), y0 + min(ry), x0 + max(rx) + 1, y0 + max(ry) + 1)


def feet_x(sub):
    a = sub.load()
    w, h = sub.size
    b0 = int(h * 0.72)
    xs = [x for y in range(b0, h) for x in range(w) if a[x, y][3] > 0]
    return sum(xs) / len(xs) if xs else w / 2


def emit(out, cells, cols, rows, names):
    w, h = out.size
    cw, ch = w / cols, h / rows
    for (r, c), nm in zip(cells, names):
        bb = cover_bbox(out, int(c * cw), int(r * ch), int((c + 1) * cw), int((r + 1) * ch))
        if not bb:
            continue
        sub = out.crop(bb)
        cv = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
        cv.alpha_composite(sub, (int(AX - feet_x(sub)), AY - sub.height))
        cv.save(f"{OUT}/{nm}.webp", "WEBP", quality=90, method=6)


def main():
    os.makedirs(OUT, exist_ok=True)
    emit(
        keyed("design/uiux_elements/spider_keeper-animation_10_accurate.png"),
        [(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)], 3, 2,
        ["examine-a", "examine-b", "examine-c", "examine-d", "examine-e", "examine-f"],
    )
    emit(
        keyed("design/uiux_elements/spider_keeper-animation_11_accurate.png"),
        [(0, 0), (0, 1), (0, 2)], 3, 2, ["rest", "reach", "touch"],
    )
    print("exported keeper frames to", OUT)


if __name__ == "__main__":
    main()

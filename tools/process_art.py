#!/usr/bin/env python3
"""Turn ChatGPT images into clean pixel-art sprite sheets for the game.

Usage (from the project folder):
    python3 tools/process_art.py            process every new image in assets/img
    python3 tools/process_art.py player_ok  only these (file names without .png)
    python3 tools/process_art.py --redo     re-run everything from assets/originals (after tweaking settings)
    python3 tools/process_art.py --preview  also write assets/originals/preview_<name>.png (8x zoom, grid lines)

Needs Pillow and numpy:  pip3 install pillow numpy

What it does for a sprite sheet (type "sheet" / "tiles" in assets/manifest.json):
  1. keeps the untouched original in assets/originals/ (not in git, not on the website),
  2. removes the flat magenta background (or uses real transparency if the image has it),
  3. finds the frames: rows first, then the frames inside each row, separated by the background gaps
     (falls back to an even grid if ChatGPT's spacing is too messy),
  4. shrinks every frame to real pixel art: one game pixel per ChatGPT "big pixel", all frames of a sheet
     with the same scale, so the character never changes size between frames,
  5. snaps every colour to the shared 16-colour palette (consistent look across all sheets),
  6. lines the frames up: 'bottom' = feet on one baseline + centred on the body, 'center' = centred,
  7. writes a tiny sheet: cols x rows cells of exactly `cell` pixels.
Backgrounds are cropped to 16:9 and shrunk to 640x360 the same way ('seamless': made to repeat left-to-right;
type 'layer': magenta stays see-through, for foreground layers such as the metro platform).
"""
import json, shutil, sys
from pathlib import Path

try:
    import numpy as np
    from PIL import Image, PngImagePlugin
except ImportError:
    sys.exit('Missing libraries. Run:  pip3 install pillow numpy')

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'assets' / 'img'
ORIG = ROOT / 'assets' / 'originals'
MANIFEST = json.loads((ROOT / 'assets' / 'manifest.json').read_text(encoding='utf-8'))['images']
BY_FILE = {Path(d['file']).name: (k, d) for k, d in MANIFEST.items()}
MARK = 'v2-pixel'

PALETTE = np.array([
    (0x1B, 0x1A, 0x2E),  # ink black
    (0x26, 0x29, 0x5A),  # night indigo
    (0x54, 0x68, 0xA8),  # slate blue
    (0x9C, 0xC3, 0xE6),  # sky blue
    (0xF2, 0xE8, 0xD5),  # paper cream
    (0xA3, 0x9E, 0x93),  # warm grey
    (0x5C, 0x5A, 0x63),  # dark grey
    (0xD9, 0x41, 0x2B),  # vermilion
    (0x8C, 0x2A, 0x2A),  # deep red
    (0xE8, 0xB8, 0x4A),  # gold
    (0xB9, 0x7A, 0x2E),  # ochre
    (0x6B, 0x42, 0x26),  # wood brown
    (0x7F, 0xB3, 0xA0),  # celadon green
    (0x3E, 0x6B, 0x4F),  # moss green
    (0xF2, 0xA7, 0xB8),  # sakura pink
    (0xF0, 0xC9, 0xA0),  # peach
], dtype=np.float32)


# ------------------------------------------------------------------ colours
def snap_to_palette(rgb, pal=None):
    """rgb: (..., 3) float array -> palette indices, using the 'redmean' perceptual distance."""
    pal = PALETTE if pal is None else pal
    flat = rgb.reshape(-1, 3)
    out = np.empty(len(flat), dtype=np.uint8)
    for i in range(0, len(flat), 262144):              # chunks keep memory small
        c = flat[i:i + 262144][:, None, :]
        p = pal[None, :, :]
        rm = (c[..., 0] + p[..., 0]) / 2
        d = c - p
        dist = (2 + rm / 256) * d[..., 0] ** 2 + 4 * d[..., 1] ** 2 + (2 + (255 - rm) / 256) * d[..., 2] ** 2
        out[i:i + 262144] = dist.argmin(1)
    return out.reshape(rgb.shape[:-1])


def adaptive_palette(im, colors):
    """Own palette for pictures that need more shades than the shared 16 (backgrounds, floor tiles)."""
    q = im.convert('RGB').quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:colors * 3], dtype=np.float32).reshape(-1, 3)
    return pal


def foreground_mask(im):
    """Boolean mask of the drawing (True) vs background (False)."""
    a = np.asarray(im.convert('RGBA')).astype(np.int32)
    rgb, alpha = a[..., :3], a[..., 3]
    if (alpha < 128).mean() > 0.05:                     # the image really is transparent
        return alpha >= 128
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)                      # usually ~#FF00FF
    near_bg = np.abs(rgb - bg).sum(-1) < 110
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    magenta = (r > 140) & (b > 140) & (g < 0.62 * np.minimum(r, b)) & (np.abs(r - b) < 90)
    return ~(near_bg | magenta)


def clean_specks(mask, min_frac=0.00015):
    """Drop tiny isolated blobs (noise, signatures) using a coarse grid: cells with almost nothing are cleared."""
    h, w = mask.shape
    k = max(4, min(h, w) // 128)
    hh, ww = h // k * k, w // k * k
    m = mask[:hh, :ww].reshape(hh // k, k, ww // k, k).sum((1, 3))
    occupied = m > 0
    # a coarse cell survives if it, or one of its 8 neighbours, is reasonably full
    full = m > (k * k * 0.25)
    pad = np.pad(full, 1)
    near_full = np.zeros_like(full)
    for dy in (0, 1, 2):
        for dx in (0, 1, 2):
            near_full |= pad[dy:dy + full.shape[0], dx:dx + full.shape[1]]
    keep = occupied & near_full
    out = mask.copy()
    out[:hh, :ww] &= np.repeat(np.repeat(keep, k, 0), k, 1)
    if mask.sum() * min_frac > 0:
        pass
    return out


# ------------------------------------------------------------------ grid detection
def runs(profile, min_gap):
    """Occupied runs [(start, end)] of a 1-D profile, closing gaps narrower than min_gap."""
    occ = profile > 0
    out, start, gap = [], None, 0
    for i, v in enumerate(occ):
        if v:
            if start is None:
                start = i
            gap, end = 0, i
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                out.append([start, end + 1]); start = None
    if start is not None:
        out.append([start, end + 1])
    return out


def fit_runs(rs, profile, want):
    """Make exactly `want` runs: drop crumbs, merge the closest neighbours if there are too many,
    split the widest run at its emptiest column if frames touch. None if it can't be done."""
    if not rs:
        return None
    mass = [profile[a:b].sum() for a, b in rs]
    big = max(mass)
    rs = [r for r, m in zip(rs, mass) if m >= big * 0.02]
    while len(rs) > want:
        gaps = [rs[i + 1][0] - rs[i][1] for i in range(len(rs) - 1)]
        i = int(np.argmin(gaps))
        rs[i:i + 2] = [[rs[i][0], rs[i + 1][1]]]
    while len(rs) < want:
        widths = [b - a for a, b in rs]
        i = int(np.argmax(widths))
        a, b = rs[i]
        typical = sum(widths) / want
        if b - a < typical * 1.5:
            return None
        lo, hi = a + int((b - a) * 0.25), b - int((b - a) * 0.25)
        cut = lo + int(np.argmin(profile[lo:hi]))
        rs[i:i + 1] = [[a, cut], [cut, b]]
    return rs


def even(n, size):
    return [[round(i * size / n), round((i + 1) * size / n)] for i in range(n)]


def find_cells(mask, cols, rows):
    """List of rows, each a list of (x0, y0, x1, y1) boxes in reading order."""
    h, w = mask.shape
    gap = max(3, int(min(h, w) * 0.012))
    rws = fit_runs(runs(mask.sum(1), gap), mask.sum(1), rows)
    messy = rws is None
    if messy:
        rws = even(rows, h)
    grid = []
    for y0, y1 in rws:
        band = mask[y0:y1]
        cls = fit_runs(runs(band.sum(0), gap), band.sum(0), cols)
        if cls is None:
            messy = True
            cls = even(cols, w)
        grid.append([(x0, y0, x1, y1) for x0, x1 in cls])
    return grid, messy


# ------------------------------------------------------------------ pixel size + resampling
def estimate_pixel_size(idx, mask):
    """ChatGPT draws 'big pixels'. Estimate their size from runs of identical colour inside the drawing."""
    lengths = []
    for arr, m in ((idx, mask), (idx.T, mask.T)):
        step = max(1, arr.shape[0] // 160)
        for row, mr in zip(arr[::step], m[::step]):
            if mr.sum() < 8:
                continue
            change = np.flatnonzero((row[1:] != row[:-1]) | (mr[1:] != mr[:-1])) + 1
            seg = np.diff(np.concatenate([[0], change, [len(row)]]))
            starts = np.concatenate([[0], change])
            seg = seg[mr[starts]]
            lengths.extend(seg[(seg >= 2) & (seg <= 64)].tolist())
    if len(lengths) < 50:
        return None
    lengths = np.array(lengths)
    # the pixel size is the length that best explains most runs as whole multiples of it
    best, best_score = None, 0
    for p in np.arange(3, 40, 0.25):
        q = lengths / p
        err = np.abs(q - np.round(q))
        score = ((err < 0.18) & (np.round(q) >= 1)).mean() * (1 + 0.15 * np.log(p))
        if score > best_score:
            best, best_score = p, score
    return best


def resample(idx, mask, out_w, out_h, n_colors=None):
    """Shrink a palette-index image to out_w x out_h by majority vote over a 3x3 set of sample points per pixel."""
    h, w = idx.shape
    ys = (np.arange(out_h)[:, None] + np.array([0.3, 0.5, 0.7])[None, :]) * h / out_h
    xs = (np.arange(out_w)[:, None] + np.array([0.3, 0.5, 0.7])[None, :]) * w / out_w
    ys = np.clip(ys.astype(int), 0, h - 1)
    xs = np.clip(xs.astype(int), 0, w - 1)
    yy = ys[:, None, :, None]; xx = xs[None, :, None, :]
    s_idx = idx[yy, xx].reshape(out_h, out_w, 9)
    s_msk = mask[yy, xx].reshape(out_h, out_w, 9)
    alpha = s_msk.sum(-1) >= 5
    votes = np.zeros((out_h, out_w, n_colors or len(PALETTE)), dtype=np.int16)
    for k in range(9):
        np.add.at(votes, (np.arange(out_h)[:, None], np.arange(out_w)[None, :], s_idx[..., k]), s_msk[..., k].astype(np.int16) + 0)
    # if the majority vote is empty (unmasked samples only) fall back to the centre sample
    col = np.where(votes.max(-1) > 0, votes.argmax(-1), s_idx[..., 4])
    return col.astype(np.uint8), alpha


def to_rgba(col, alpha, pal=None):
    rgb = (PALETTE if pal is None else pal)[col].astype(np.uint8)
    a = np.where(alpha, 255, 0).astype(np.uint8)
    return np.dstack([rgb, a])


def add_outline_gaps(rgba):
    """Pixel art reads better when stray single transparent holes inside the sprite are filled."""
    a = rgba[..., 3] > 0
    h, w = a.shape
    pad = np.pad(a, 1)
    n = pad[:-2, 1:-1].astype(int) + pad[2:, 1:-1] + pad[1:-1, :-2] + pad[1:-1, 2:]
    hole = (~a) & (n == 4)
    if hole.any():
        ys, xs = np.nonzero(hole)
        for y, x in zip(ys, xs):
            rgba[y, x] = rgba[y - 1, x] if y > 0 else rgba[y + 1, x]
    # single stray pixels with no neighbours are removed
    lone = a & (n == 0)
    rgba[lone] = 0
    return rgba


# ------------------------------------------------------------------ processing
def process_sheet(name, d, im):
    cols, rows = d['cols'], d['rows']
    cw, ch = d['cell']
    tiles = d['type'] == 'tiles'
    rgba = np.asarray(im.convert('RGBA')).astype(np.float32)
    mask = clean_specks(foreground_mask(im))
    # own palette (if asked) is built from the drawing only, so the magenta background can't steal colours (red → pink)
    pal = PALETTE if d.get('palette', True) else adaptive_palette(
        Image.fromarray(rgba[..., :3][mask].astype(np.uint8)[None]), d.get('colors', 32))
    grid, messy = find_cells(mask, cols, rows)
    idx = snap_to_palette(rgba[..., :3], pal)

    frames = []
    for r, row in enumerate(grid):
        for c, (x0, y0, x1, y1) in enumerate(row):
            m = mask[y0:y1, x0:x1]
            ys, xs = np.nonzero(m)
            if len(xs) == 0:
                frames.append(None); continue
            if tiles:   # a tile fills its whole cell: use the drawn square itself
                bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
            else:
                bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
            frames.append((x0 + bx0, y0 + by0, x0 + bx1, y0 + by1))

    out = np.zeros((rows * ch, cols * cw, 4), dtype=np.uint8)
    if tiles:
        for i, f in enumerate(frames):
            if f is None:
                continue
            x0, y0, x1, y1 = f
            # trim the soft edge where the tile blends into the magenta gap (it would turn into a red line)
            tx, ty = max(1, round((x1 - x0) * 0.03)), max(1, round((y1 - y0) * 0.03))
            x0, y0, x1, y1 = x0 + tx, y0 + ty, x1 - tx, y1 - ty
            col, alpha = resample(idx[y0:y1, x0:x1], mask[y0:y1, x0:x1], cw, ch, len(pal))
            r, c = divmod(i, cols)
            out[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw] = to_rgba(col, alpha, pal)
        return out, messy, None

    # one scale for the whole sheet: the true ChatGPT pixel size if it fits, otherwise shrink to fit the biggest frame
    real = [f for f in frames if f]
    max_w = max(f[2] - f[0] for f in real)
    max_h = max(f[3] - f[1] for f in real)
    fit = max(max_w / cw, max_h / ch)                  # source pixels per game pixel needed to fit
    px = estimate_pixel_size(idx, mask)
    scale = px if px and px >= fit * 0.98 and px <= fit * 2.2 else fit
    scale = max(scale, fit)
    align = d.get('align', 'bottom')
    for i, f in enumerate(frames):
        if f is None:
            continue
        x0, y0, x1, y1 = f
        ow = max(1, min(cw, round((x1 - x0) / scale)))
        oh = max(1, min(ch, round((y1 - y0) / scale)))
        col, alpha = resample(idx[y0:y1, x0:x1], mask[y0:y1, x0:x1], ow, oh, len(pal))
        spr = add_outline_gaps(to_rgba(col, alpha, pal))
        a = spr[..., 3] > 0
        if not a.any():
            continue
        # horizontal anchor = centre of mass of the drawing (steadier than the box when legs move)
        cx = np.nonzero(a)[1].mean() + 0.5
        dx = int(round(cw / 2 - cx))
        dx = min(max(dx, 0), cw - ow)
        if align == 'bottomleft':   # scenes with a fixed object on the left (the futon): pin the left edge
            dx = 0
        if align == 'center':
            cy = np.nonzero(a)[0].mean() + 0.5
            dy = min(max(int(round(ch / 2 - cy)), 0), ch - oh)
        else:
            dy = ch - oh
        r, c = divmod(i, cols)
        out[r * ch + dy:r * ch + dy + oh, c * cw + dx:c * cw + dx + ow] = spr
    return out, messy, scale


def make_seamless_x(rgb, mask, band_frac=0.08):
    """Make a picture repeat left-to-right without a visible seam: cross-fade the last strip into the first one
    and cut that strip off. rgb: float (h, w, 3); mask: bool (h, w) or None."""
    h, w = rgb.shape[:2]
    band = max(4, int(w * band_frac))
    t = np.linspace(0, 1, band)[None, :, None]
    out = rgb[:, :w - band].copy()
    out[:, :band] = rgb[:, w - band:] * (1 - t) + rgb[:, :band] * t
    if mask is None:
        return out, None
    m = mask[:, :w - band].copy()
    m[:, :band] = np.where(t[..., 0] < 0.5, mask[:, w - band:], mask[:, :band])
    return out, m


def process_background(d, im):
    """Full-screen pictures. 'layer' = keeps the magenta parts see-through; 'seamless' = repeats left-to-right."""
    tw, th = d['size']
    layer = d['type'] == 'layer'
    mask = foreground_mask(im) if layer else None
    rgb = np.asarray(im.convert('RGB')).astype(np.float32)
    if d.get('seamless'):
        rgb, mask = make_seamless_x(rgb, mask)
    h, w = rgb.shape[:2]
    s = max(tw / w, th / h)
    cw, chh = tw / s, th / s
    l, t = int((w - cw) / 2), int((h - chh) / 2)
    rgb = rgb[t:t + int(chh), l:l + int(cw)]
    if mask is not None:
        mask = mask[t:t + int(chh), l:l + int(cw)]
    crop = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    if d.get('palette', True):
        pal = PALETTE
    else:   # own palette, built from the drawn part only
        pal = adaptive_palette(crop if mask is None else Image.fromarray(np.clip(rgb[mask], 0, 255).astype(np.uint8)[None]), d.get('colors', 48))
    idx = snap_to_palette(rgb, pal)
    col, alpha = resample(idx, np.ones(idx.shape, bool) if mask is None else mask, tw, th, len(pal))
    if mask is None:
        return to_rgba(col, np.ones_like(alpha), pal)[..., :3]
    return to_rgba(col, alpha, pal)


def save(path, arr, mode):
    meta = PngImagePlugin.PngInfo()
    meta.add_text('ikigai', MARK)
    Image.fromarray(arr, mode).save(path, optimize=True, pnginfo=meta)


def preview(name, arr, d):
    zoom = 8
    im = Image.fromarray(arr if arr.shape[-1] == 4 else np.dstack([arr, np.full(arr.shape[:2], 255, np.uint8)]), 'RGBA')
    bg = Image.new('RGBA', im.size, (60, 60, 70, 255))
    bg.alpha_composite(im)
    big = bg.resize((im.width * zoom, im.height * zoom), Image.NEAREST)
    if 'cell' in d:
        px = big.load()
        cw, ch = d['cell']
        for x in range(0, big.width, cw * zoom):
            for y in range(big.height):
                px[x, y] = (255, 0, 255, 255)
        for y in range(0, big.height, ch * zoom):
            for x in range(big.width):
                px[x, y] = (255, 0, 255, 255)
    ORIG.mkdir(exist_ok=True)
    big.save(ORIG / f'preview_{name}.png')


def main(argv):
    redo = '--redo' in argv
    want_preview = '--preview' in argv
    only = {a.replace('.png', '') for a in argv if not a.startswith('--')}
    ORIG.mkdir(exist_ok=True)
    files = {p.name: p for p in IMG.glob('*.png')}
    if redo:   # originals win over the processed copies
        for p in ORIG.glob('*.png'):
            if p.name in BY_FILE:
                files[p.name] = p
    if not files:
        print('No images in assets/img yet.')
    for fname in sorted(files):
        if fname not in BY_FILE:
            print(f'?  {fname}: not in assets/manifest.json (check the file name)')
            continue
        name, d = BY_FILE[fname]
        if only and name not in only:
            continue
        src = files[fname]
        im = Image.open(src)
        if src.parent == IMG and im.info.get('ikigai') == MARK and not redo:
            continue                                   # already processed
        if im.info.get('ikigai') == 'done' and src.parent == IMG:
            print(f'!  {fname}: old woodblock-style art — replace it with a new pixel-art sheet')
            continue
        backup = ORIG / fname
        if src.parent == IMG:
            shutil.copy2(src, backup)                  # always keep the newest original
            im = Image.open(backup)
        if d['type'] in ('background', 'layer'):
            arr = process_background(d, im)
            save(IMG / fname, arr, 'RGB' if arr.shape[-1] == 3 else 'RGBA')
            kind = 'see-through layer' if d['type'] == 'layer' else 'background'
            print(f'ok {fname}: {kind} {arr.shape[1]}x{arr.shape[0]}' + (' (repeats left-to-right)' if d.get('seamless') else ''))
        else:
            arr, messy, scale = process_sheet(name, d, im)
            save(IMG / fname, arr, 'RGBA')
            note = '  (spacing was messy: used an even grid — check the result!)' if messy else ''
            sc = f', 1 game pixel = {scale:.1f} ChatGPT pixels' if scale else ''
            print(f'ok {fname}: {d["cols"]}x{d["rows"]} frames of {d["cell"][0]}x{d["cell"][1]}{sc}{note}')
        if want_preview:
            preview(name, np.asarray(Image.open(IMG / fname)), d)


if __name__ == '__main__':
    main(sys.argv[1:])

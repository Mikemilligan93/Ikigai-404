#!/usr/bin/env python3
"""Prepare ChatGPT images for the game.

Usage (from the project folder):  python3 tools/process_art.py

For every PNG in assets/img that is listed in assets/manifest.json and not processed yet:
  * the original is moved to assets/originals/ (kept out of git and off the website),
  * sprites: near-invisible alpha noise removed, cropped to the visible drawing, resized to fit 2x the in-game size,
  * "seamless" tiles: edges blended so the tile repeats without visible seams, resized to 2x size,
  * backgrounds: resized to 2x size (cover).
Run it again any time new images are added; already-processed files are skipped.
Needs Pillow (pip install pillow).
"""
import json, shutil, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'assets' / 'img'
ORIG = ROOT / 'assets' / 'originals'
manifest = json.loads((ROOT / 'assets' / 'manifest.json').read_text(encoding='utf-8'))['images']
by_file = {Path(d['file']).name: d for d in manifest.values()}


def make_seamless(im):
    w, h = im.size
    shifted = ImageChops.offset(im, w // 2, h // 2)          # seams now in the middle
    band = max(8, w // 6)
    mask = Image.new('L', (w, h), 0)
    px = mask.load()
    for y in range(h):
        for x in range(w):
            dx = abs(x - w // 2); dy = abs(y - h // 2)
            m = max(1 - dx / band, 1 - dy / band, 0)       # 1 on the centre cross, fading out
            px[x, y] = int(255 * min(1, m))
    mask = mask.filter(ImageFilter.GaussianBlur(band / 6))
    return Image.composite(im, shifted, mask)               # cover the seam cross with original pixels


def process(path, d):
    tw, th = (v * 2 for v in d['size'])
    im = Image.open(path)
    if max(im.size) <= max(tw, th) * 1.05 and im.info.get('ikigai') == 'done':
        return 'skip'
    ORIG.mkdir(exist_ok=True)
    backup = ORIG / path.name
    if not backup.exists():
        shutil.copy2(path, backup)
    note = d.get('note', '')
    if 'seamless' in note:
        im = im.convert('RGB')
        if note.startswith('seamless tile'):
            im = make_seamless(im)
        im = im.resize((tw, th), Image.LANCZOS)
    elif d.get('transparent'):
        im = im.convert('RGBA')
        a = im.split()[3].point(lambda v: 0 if v < 24 else v)
        im.putalpha(a)
        box = a.point(lambda v: 255 if v > 40 else 0).getbbox()
        if box:
            pad = int(max(box[2] - box[0], box[3] - box[1]) * 0.02)
            box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
            im = im.crop(box)
        s = min(tw / im.width, th / im.height)
        im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    else:
        im = im.convert('RGB')
        s = max(tw / im.width, th / im.height)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        l, t = (im.width - tw) // 2, (im.height - th) // 2
        im = im.crop((l, t, l + tw, t + th))
    from PIL import PngImagePlugin
    meta = PngImagePlugin.PngInfo(); meta.add_text('ikigai', 'done')
    im.save(path, optimize=True, pnginfo=meta)
    return f'{im.size[0]}x{im.size[1]}'


for p in sorted(IMG.glob('*.png')):
    d = by_file.get(p.name)
    if not d:
        print(f'?  {p.name}: not in assets/manifest.json (check the file name)')
        continue
    print(f'ok {p.name}: {process(p, d)}')

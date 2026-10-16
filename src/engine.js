// Tiny zero-dependency engine: game loop, scenes, input, assets, audio, drawing helpers.

export const W = 1280;
export const H = 720;

// One shared 16-colour palette (same as tools/process_art.py and docs/PROMPTS.md).
export const PAL = {
  ink: '#1B1A2E', indigo: '#26295A', slate: '#5468A8', sky: '#9CC3E6', cream: '#F2E8D5', grey: '#A39E93',
  dgrey: '#5C5A63', red: '#D9412B', dred: '#8C2A2A', gold: '#E8B84A', ochre: '#B97A2E', wood: '#6B4226',
  celadon: '#7FB3A0', moss: '#3E6B4F', pink: '#F2A7B8', peach: '#F0C9A0',
};
// Older names used around the code, mapped onto the palette.
export const COLORS = {
  indigo: PAL.indigo, night: PAL.ink, paper: PAL.cream, paperDark: PAL.grey, ink: PAL.ink, gold: PAL.gold,
  vermilion: PAL.red, jade: PAL.moss, dawn: PAL.peach, grey: PAL.grey, green: PAL.celadon,
};

export const FONT = '"DotGothic16", "Courier New", monospace';
// Readability pass (2026-10-16): every text size in the game is multiplied by this.
export const TEXT_SCALE = 1.15;
export const font = (px) => `${Math.round(px * TEXT_SCALE)}px ${FONT}`;
// Deeper, solid window colour so text on panels has strong contrast.
export const PANEL = '#171A40';
// Every sprite pixel is drawn as PX×PX screen pixels (no smoothing): 24 px tiles become 48 px.
export const PX = 2;

// ---------- math ----------
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));

// Push a circle out of an axis-aligned rectangle. Returns true if they overlapped.
export function resolveCircleRect(c, r) {
  const nx = clamp(c.x, r.x, r.x + r.w);
  const ny = clamp(c.y, r.y, r.y + r.h);
  let dx = c.x - nx, dy = c.y - ny;
  const d2 = dx * dx + dy * dy;
  if (d2 >= c.r * c.r) return false;
  if (d2 === 0) {
    // centre inside rect: push out along the shortest axis
    const left = c.x - r.x, right = r.x + r.w - c.x, top = c.y - r.y, bottom = r.y + r.h - c.y;
    const m = Math.min(left, right, top, bottom);
    if (m === left) c.x = r.x - c.r; else if (m === right) c.x = r.x + r.w + c.r;
    else if (m === top) c.y = r.y - c.r; else c.y = r.y + r.h + c.r;
    return true;
  }
  const d = Math.sqrt(d2);
  c.x = nx + (dx / d) * c.r;
  c.y = ny + (dy / d) * c.r;
  return true;
}

export function circleRectOverlap(cx, cy, cr, r) {
  const nx = clamp(cx, r.x, r.x + r.w);
  const ny = clamp(cy, r.y, r.y + r.h);
  return (cx - nx) ** 2 + (cy - ny) ** 2 < cr * cr;
}

// ---------- input ----------
export class Input {
  constructor(target) {
    this.down = new Set();
    this.pressed = new Set();
    this.typed = [];
    window.addEventListener('keydown', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (!this.down.has(k)) this.pressed.add(k);
      this.down.add(k);
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') this.typed.push(e.key);
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      this.down.delete(k);
    });
    window.addEventListener('blur', () => this.down.clear());
    target.addEventListener('pointerdown', () => target.focus());
  }
  isDown(...keys) { return keys.some((k) => this.down.has(k)); }
  wasPressed(...keys) { return keys.some((k) => this.pressed.has(k)); }
  axis() {
    let x = 0, y = 0;
    if (this.isDown('a', 'ArrowLeft')) x -= 1;
    if (this.isDown('d', 'ArrowRight')) x += 1;
    if (this.isDown('w', 'ArrowUp')) y -= 1;
    if (this.isDown('s', 'ArrowDown')) y += 1;
    return { x, y };
  }
  endFrame() { this.pressed.clear(); this.typed.length = 0; }
}

// ---------- assets ----------
export class Assets {
  constructor() { this.images = {}; this.meta = {}; this.sounds = {}; this.flash = {}; }

  async load(manifest) {
    const jobs = [];
    for (const [key, def] of Object.entries(manifest.images || {})) {
      this.meta[key] = def;
      jobs.push(new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // only accept processed sheets of the expected size (an unprocessed ChatGPT image would slice wrongly)
          const ok = def.type === 'background' || def.type === 'layer' ? img.width === def.size[0] && img.height === def.size[1]
            : img.width === def.cols * def.cell[0] && img.height === def.rows * def.cell[1];
          if (ok) this.images[key] = img;
          else console.warn(`assets/${def.file}: unexpected size ${img.width}x${img.height} — run python3 tools/process_art.py`);
          resolve();
        };
        img.onerror = () => resolve(); // missing art -> placeholder
        img.src = 'assets/' + def.file;
      }));
    }
    for (const [key, file] of Object.entries(manifest.audio || {})) {
      jobs.push(fetch('assets/' + file, { method: 'HEAD' })
        .then((r) => {
          const type = r.headers.get('content-type') || '';
          if (r.ok && !type.includes('text/html')) this.sounds[key] = 'assets/' + file;
        })
        .catch(() => {}));
    }
    await Promise.all(jobs);
  }
  // Key that actually has art, following manifest "fallback" links (e.g. player_tired → player_ok).
  resolve(key) {
    for (let k = key, i = 0; k && i < 5; k = this.meta[k]?.fallback, i++) if (this.images[k]) return k;
    return null;
  }
  get(key) { const k = this.resolve(key); return k ? this.images[k] : null; }
  has(key) { return !!this.resolve(key); }
  // Sheet geometry from the manifest (also known when the art is missing, for placeholders).
  cell(key) { return this.meta[key]?.cell || [32, 32]; }
  // White silhouette of a sheet, used for the hit flash (ctx.filter is not supported everywhere).
  flashOf(key) {
    if (this.flash[key]) return this.flash[key];
    const img = this.images[key];
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    return (this.flash[key] = c);
  }
}

// ---------- audio ----------
export class Audio {
  constructor(assets, cfg) {
    this.assets = assets; this.cfg = cfg;
    this.music = null; this.musicKey = null; this.musicSrc = null;
    this.lastSfx = {};
    // browsers block sound until the first click / key press: start the music then
    const unlock = () => { if (this.music && this.music.paused) this.music.play().catch(() => {}); };
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);
  }
  // Scenes that use the same file keep it playing (no restart between title → intro → office).
  playMusic(key) {
    const src = this.assets.sounds[key];
    this.musicKey = key;
    if (src && this.music && this.musicSrc === src) return;
    this.stopMusic();
    this.musicKey = key;
    if (!src) return;
    this.musicSrc = src;
    this.music = new window.Audio(src);
    this.music.loop = true;
    this.music.volume = this.cfg.musicVolume;
    this.music.play().catch(() => {});
  }
  stopMusic() {
    if (this.music) { this.music.pause(); this.music = null; }
    this.musicKey = null; this.musicSrc = null;
  }
  // One-shot sound. The same sound can't restart within `gap` seconds (stops 10 hits at once from stacking).
  sfx(key, gap = 0.04) {
    const src = this.assets.sounds[key];
    if (!src) return;
    const now = performance.now();
    if (now - (this.lastSfx[key] || 0) < gap * 1000) return;
    this.lastSfx[key] = now;
    const a = new window.Audio(src);
    a.volume = clamp(this.cfg.sfxVolume * (this.cfg.volumes?.[key] ?? 1), 0, 1);
    a.play().catch(() => {});
  }
}

// ---------- drawing helpers ----------
const PLACEHOLDER_COLORS = {
  player: PAL.cream, enemy: PAL.red, miniboss: PAL.dgrey, boss: PAL.dred, npc: PAL.moss,
  prop: PAL.ochre, pickup: PAL.pink, fx: PAL.gold,
};

/**
 * Draw one frame (col,row) of sprite sheet `key`.
 * (x, y) is the anchor: 'bottom' (default) = the feet / bottom-centre of the cell, 'center' = the cell centre.
 * opts: { scale (default PX), flip, alpha, flash, rot, anchor, kind, color, label, ph: [w,h] placeholder size in sprite px }
 * Without art a pixel-style placeholder block is drawn; it still bobs with the frame so animation is visible.
 */
export function drawFrame(ctx, assets, key, col, row, x, y, opts = {}) {
  const s = opts.scale ?? PX;
  const k = assets.resolve(key);
  const [cw, ch] = assets.cell(k || key);
  const w = cw * s, h = ch * s;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (opts.rot) ctx.rotate(opts.rot);
  if (opts.flip) ctx.scale(-1, 1);
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  const top = opts.anchor === 'center' ? -h / 2 : -h;
  if (k) {
    const img = opts.flash ? assets.flashOf(k) : assets.images[k];
    ctx.drawImage(img, col * cw, row * ch, cw, ch, -w / 2, top, w, h);
  } else {
    const [pw, ph] = opts.ph || [cw * 0.6, ch * 0.75];
    const bw = Math.round(pw) * s, bh = Math.round(ph) * s;
    const bob = col % 2 ? -s : 0;
    const by = (opts.anchor === 'center' ? -bh / 2 : -bh) + bob;
    ctx.fillStyle = PAL.ink; ctx.fillRect(-bw / 2 - s, by - s, bw + 2 * s, bh + 2 * s);
    ctx.fillStyle = opts.flash ? '#fff' : (opts.color || PLACEHOLDER_COLORS[opts.kind] || PAL.grey);
    ctx.fillRect(-bw / 2, by, bw, bh);
    // "eyes" show which way the placeholder faces: row 0 = down, 1 = side, 2 = up
    if (opts.eyes !== false && bh > 8 * s) {
      ctx.fillStyle = PAL.ink;
      const ey = by + Math.min(bh * 0.25, 6 * s);
      if (row === 0) { ctx.fillRect(-bw / 4 - s, ey, 2 * s, 2 * s); ctx.fillRect(bw / 4 - s, ey, 2 * s, 2 * s); }
      else if (row === 1) ctx.fillRect(-bw / 2 + s, ey, 2 * s, 2 * s);
    }
    if (opts.label) {
      if (opts.flip) ctx.scale(-1, 1);
      ctx.fillStyle = PAL.ink;
      ctx.font = `${clamp(Math.floor(bw / 6), 10, 16)}px ${FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      wrapText(ctx, opts.label, 0, by + bh / 2, bw - 4, clamp(Math.floor(bw / 6), 10, 16) + 2);
    }
  }
  ctx.restore();
}

// Backwards-compatible single-picture helper: draws frame (0,0) centred in a w×h box.
export function sprite(ctx, assets, key, x, y, w, h, opts = {}) {
  const [cw, ch] = assets.cell(key);
  const scale = opts.scale ?? Math.max(1, Math.floor(Math.min(w / cw, h / ch)));
  drawFrame(ctx, assets, key, opts.col || 0, opts.row || 0, x, y, { ...opts, scale, anchor: 'center', ph: [w / scale, h / scale] });
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  const startY = y - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineH));
  return lines.length;
}

// Text on screen. shadow = a solid ink outline all round (readable on any background);
// plate = also a dark band behind it (for hints and banners that sit on top of the busy game world).
export function text(ctx, str, x, y, { size = 24, color = COLORS.paper, align = 'center', shadow = true, baseline = 'middle', plate = false } = {}) {
  const px = Math.round(size * TEXT_SCALE);
  ctx.font = `${px}px ${FONT}`;
  ctx.textAlign = align; ctx.textBaseline = baseline;
  if (plate) {
    const w = ctx.measureText(str).width, pad = Math.round(px * 0.45);
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    const yc = baseline === 'middle' ? y : y - px / 2;
    ctx.save(); ctx.globalAlpha *= 0.82; ctx.fillStyle = PANEL;
    ctx.fillRect(Math.round(x0 - pad), Math.round(yc - px * 0.8), Math.round(w + pad * 2), Math.round(px * 1.6));
    ctx.restore();
  }
  if (shadow) {
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(4, Math.round(px / 5)); ctx.strokeStyle = PAL.ink;
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// Classic Japanese-RPG window: indigo panel, cream double border, small red corner studs.
export function windowBox(ctx, x, y, w, h, { fill = PANEL, alpha = 1 } = {}) {
  x = Math.round(x); y = Math.round(y);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PAL.ink; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = PAL.cream;
  ctx.fillRect(x + 3, y + 3, w - 6, 3); ctx.fillRect(x + 3, y + h - 6, w - 6, 3);
  ctx.fillRect(x + 3, y + 3, 3, h - 6); ctx.fillRect(x + w - 6, y + 3, 3, h - 6);
  ctx.fillStyle = PAL.slate;
  ctx.fillRect(x + 9, y + 9, w - 18, 3); ctx.fillRect(x + 9, y + 9, 3, h - 18);
  ctx.fillStyle = PAL.red;
  for (const [cx, cy] of [[x, y], [x + w - 9, y], [x, y + h - 9], [x + w - 9, y + h - 9]]) ctx.fillRect(cx, cy, 9, 9);
  ctx.restore();
}

// Dialogue window at the bottom (or top) of the screen. `shown` = how many characters are revealed (typewriter).
// The box grows with the text (measured on the full line, so it doesn't jump while typing).
export function dialogueBox(ctx, who, line, hint, { top = false, shown = Infinity } = {}) {
  const x = 140, w = W - 280;
  ctx.font = font(24);
  const lineH = Math.round(24 * TEXT_SCALE * 1.45);
  const n = countLines(ctx, String(line), w - 72);
  const h = Math.max(170, 64 + n * lineH + 40), y = top ? 48 : H - h - 32;
  windowBox(ctx, x, y, w, h);
  if (who) {
    ctx.font = font(20);
    const nw = Math.max(170, Math.ceil(ctx.measureText(who).width) + 56);
    windowBox(ctx, x + 24, y - 32, nw, 48, { fill: PAL.dred });
    text(ctx, who, x + 24 + nw / 2, y - 8, { size: 20, color: PAL.gold });
  }
  ctx.fillStyle = PAL.cream; ctx.font = font(24); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  wrapLeft(ctx, String(line).slice(0, shown), x + 36, y + 54, w - 72, lineH);
  if (hint && shown >= String(line).length) text(ctx, hint, x + w - 28, y + h - 28, { size: 16, color: PAL.gold, align: 'right', shadow: false });
}

export function countLines(ctx, str, maxW) {
  let line = '', n = 0;
  for (const w of String(str).split(' ')) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { n++; line = w; } else line = t; }
  return n + (line ? 1 : 0);
}

export function wrapLeft(ctx, str, x, y, maxW, lineH) {
  const words = String(str).split(' ');
  let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lineH; } else line = test;
  }
  if (line) ctx.fillText(line, x, yy);
}

// Segmented pixel bar.
export function bar(ctx, x, y, w, h, frac, color, back = PAL.ink) {
  x = Math.round(x); y = Math.round(y);
  ctx.fillStyle = PAL.ink; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = back === PAL.ink ? PAL.dgrey : back; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, Math.round(w * clamp(frac, 0, 1)), h);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x, y, Math.round(w * clamp(frac, 0, 1)), 3);
  ctx.fillStyle = PAL.ink;
  for (let sx = x + 12; sx < x + w; sx += 12) ctx.fillRect(sx, y, 2, h);
}

// ---------- game & scenes ----------
export class Game {
  constructor(canvas, data) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    Object.assign(this, data); // config, texts, assets, audio, input, leaderboard
    this.scene = null;
    this.fade = 0; this.fadeDir = 0; this.nextScene = null;
    this.session = { name: '', score: null };
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H);
    this.canvas.style.width = `${Math.floor(W * s)}px`;
    this.canvas.style.height = `${Math.floor(H * s)}px`;
  }

  // Switch scenes with a short fade.
  go(scene) {
    if (!this.scene) { this.scene = scene; scene.enter?.(); return; }
    this.nextScene = scene; this.fadeDir = 1;
  }

  // Pixel 'blinds' transition between scenes (classic 8-bit wipe).
  drawWipe(ctx) {
    ctx.fillStyle = PAL.ink;
    const band = 48;
    for (let y = 0; y < H; y += band) ctx.fillRect(0, y, W, Math.ceil(band * this.fade));
  }

  start() {
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      this.tick(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  tick(dt) {
    if (this.fadeDir !== 0) {
      this.fade = clamp(this.fade + this.fadeDir * dt * 3, 0, 1);
      if (this.fade >= 1 && this.nextScene) {
        this.scene?.exit?.();
        this.scene = this.nextScene; this.nextScene = null;
        this.scene.enter?.();
        this.fadeDir = -1;
      } else if (this.fade <= 0 && this.fadeDir === -1) this.fadeDir = 0;
    } else if (this.scene) {
      this.scene.update(dt);
    }
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    this.scene?.draw(ctx);
    if (this.fade > 0) this.drawWipe(ctx);
    this.input.endFrame();
  }
}

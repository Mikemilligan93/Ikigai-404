// Tiny zero-dependency engine: game loop, scenes, input, assets, audio, drawing helpers.

export const W = 1280;
export const H = 720;

export const COLORS = {
  indigo: '#1b1f3b',
  night: '#0d0f1f',
  paper: '#efe3c2',
  paperDark: '#d9c89a',
  ink: '#1a1a1a',
  gold: '#d4a537',
  vermilion: '#c0392b',
  jade: '#3f7f6b',
  dawn: '#f2b36b',
  grey: '#7d7a72',
};

export const FONT = 'Georgia, "Times New Roman", serif';

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
  constructor() { this.images = {}; this.meta = {}; this.sounds = {}; }

  async load(manifest) {
    const jobs = [];
    for (const [key, def] of Object.entries(manifest.images || {})) {
      this.meta[key] = def;
      jobs.push(new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { this.images[key] = img; resolve(); };
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
  has(key) { return !!this.images[key]; }
}

// ---------- audio ----------
export class Audio {
  constructor(assets, cfg) {
    this.assets = assets; this.cfg = cfg; this.music = null; this.musicKey = null;
  }
  playMusic(key) {
    if (this.musicKey === key) return;
    this.stopMusic();
    this.musicKey = key;
    const src = this.assets.sounds[key];
    if (!src) return;
    this.music = new window.Audio(src);
    this.music.loop = true;
    this.music.volume = this.cfg.musicVolume;
    this.music.play().catch(() => {});
  }
  stopMusic() {
    if (this.music) { this.music.pause(); this.music = null; }
    this.musicKey = null;
  }
  sfx(key) {
    const src = this.assets.sounds[key];
    if (!src) return;
    const a = new window.Audio(src);
    a.volume = this.cfg.sfxVolume;
    a.play().catch(() => {});
  }
}

// ---------- drawing helpers ----------
const PLACEHOLDER_COLORS = {
  player: '#e8e2d0', enemy: '#c0392b', miniboss: '#8e44ad', boss: '#b03a2e', npc: '#3f7f6b',
  prop: '#8a7a5c', pickup: '#f5b7c5', fx: '#d4a537',
};

/**
 * Draw an image by key centred on (x, y) with size w×h, or a placeholder if the art is missing.
 * opts: { flip, alpha, rot, sx, sy, kind, label, color }
 */
export function sprite(ctx, assets, key, x, y, w, h, opts = {}) {
  ctx.save();
  ctx.translate(x, y);
  if (opts.rot) ctx.rotate(opts.rot);
  ctx.scale((opts.flip ? -1 : 1) * (opts.sx ?? 1), opts.sy ?? 1);
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  const img = assets.images[key];
  if (img) {
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  } else {
    const color = opts.color || PLACEHOLDER_COLORS[opts.kind] || '#999';
    ctx.fillStyle = color;
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 3;
    roundRect(ctx, -w / 2, -h / 2, w, h, Math.min(w, h) * 0.25);
    ctx.fill(); ctx.stroke();
    if (opts.label) {
      if (opts.flip) ctx.scale(-1, 1);
      ctx.fillStyle = COLORS.ink;
      ctx.font = `bold ${clamp(Math.floor(Math.min(w, h) / 4), 9, 18)}px ${FONT}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      wrapText(ctx, opts.label, 0, 0, w - 6, clamp(Math.floor(Math.min(w, h) / 4), 9, 18) + 2);
    }
  }
  ctx.restore();
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

export function text(ctx, str, x, y, { size = 24, color = COLORS.paper, align = 'center', bold = false, shadow = true, baseline = 'middle' } = {}) {
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`;
  ctx.textAlign = align; ctx.textBaseline = baseline;
  if (shadow) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(str, x + 2, y + 2); }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// Scroll-like dialogue panel at the bottom of the screen.
export function dialogueBox(ctx, who, line, hint, { top = false } = {}) {
  const x = 140, y = top ? 40 : H - 200, w = W - 280, h = 160;
  ctx.fillStyle = COLORS.paper; ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 4;
  roundRect(ctx, x, y, w, h, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = COLORS.gold; ctx.fillRect(x, y, w, 8); ctx.fillRect(x, y + h - 8, w, 8);
  if (who) text(ctx, who, x + 24, y + 34, { size: 22, color: COLORS.vermilion, align: 'left', bold: true, shadow: false });
  ctx.fillStyle = COLORS.ink; ctx.font = `24px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  wrapLeft(ctx, line, x + 24, y + 74, w - 48, 30);
  if (hint) text(ctx, hint, x + w - 20, y + h - 24, { size: 16, color: COLORS.grey, align: 'right', shadow: false });
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

export function bar(ctx, x, y, w, h, frac, color, back = 'rgba(0,0,0,0.5)') {
  ctx.fillStyle = back; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, w * clamp(frac, 0, 1), h);
  ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
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
    ctx.clearRect(0, 0, W, H);
    this.scene?.draw(ctx);
    if (this.fade > 0) { ctx.fillStyle = `rgba(13,15,31,${this.fade})`; ctx.fillRect(0, 0, W, H); }
    this.input.endFrame();
  }
}

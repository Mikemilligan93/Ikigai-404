import { W, H, PAL, text, font } from '../engine.js';

// Opening: "Toxiconsulting2000 presents…" on black, then the cover art, then the title screen.
// Any key skips ahead one step. Texts: texts.json → splash. Timings below.
const STUDIO = 3.4;   // seconds for the studio card (fade in, hold, fade out)
const COVER = 6.5;    // seconds the cover stays before the title screen comes on its own

export class SplashScene {
  constructor(game) {
    this.g = game;
    this.T = game.texts.splash;
    this.phase = 'studio';
    this.t = 0;
    this.left = false;
  }

  enter() { this.g.audio.playMusic('music_title'); }   // same track as the title screen, so it carries on

  next() {
    if (this.phase === 'studio') { this.phase = 'cover'; this.t = 0; return; }
    if (!this.left) { this.left = true; this.g.go(this.g.scenes.title()); }
  }

  update(dt) {
    this.t += dt;
    const anyKey = this.g.input.pressed.size > 0;
    if (anyKey && this.t > 0.25) return this.next();
    if (this.phase === 'studio' && this.t >= STUDIO) this.next();
    else if (this.phase === 'cover' && this.t >= COVER) this.next();
  }

  draw(ctx) {
    ctx.fillStyle = this.phase === 'studio' ? PAL.ink : '#000'; ctx.fillRect(0, 0, W, H);
    if (this.phase === 'studio') { this.drawStudio(ctx); return; }
    // cover: fills the screen width. The art is 3:2 and the screen 16:9, so some height is cropped —
    // mostly from the bottom, so the oni's head and the logo stay whole.
    const img = this.g.assets.get('cover');
    if (img) {
      const s = W / img.width, h = img.height * s;
      ctx.save();
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';   // big painted art: smooth scaling looks right here
      ctx.globalAlpha = Math.min(1, this.t / 0.8);
      ctx.drawImage(img, 0, -Math.round((h - H) * 0.15), W, h);
      ctx.restore();
    } else text(ctx, 'IKIGAI 404', W / 2, H / 2, { size: 72, color: PAL.gold });
    if (this.t > 1.2 && Math.floor(this.t * 2) % 2) text(ctx, this.T.pressKey, W / 2, H - 34, { size: 18, color: PAL.cream, plate: true });
  }

  // The studio card, in the game's pixel style: a bubbling flask of toxic consulting, the name in gold,
  // "2000" on a red hanko-style seal, "presents…" typing out. The flask is drawn on a 10 px pixel grid.
  drawStudio(ctx) {
    const t = this.t, P = 10;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, t / 0.5, (STUDIO - t) / 0.5));
    // faint scanlines, like an old CRT
    ctx.fillStyle = 'rgba(38,41,90,0.35)';
    for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 3);

    // the flask
    const FLASK = [
      '....####....',
      '....#..#....',
      '....#..#....',
      '...##..##...',
      '..#......#..',
      '.#........#.',
      '#..........#',
      '#~~~~~~~~~~#',
      '#~~~~~~~~~~#',
      '#~~~~~~~~~~#',
      '.#~~~~~~~~#.',
      '..########..',
    ];
    const fx = Math.round((W / 2 - FLASK[0].length * P / 2) / P) * P, fy = 210;
    const wave = Math.floor(t * 6) % 2;
    FLASK.forEach((row, j) => [...row].forEach((c, i) => {
      if (c === '.') return;
      const x = fx + i * P, y = fy + j * P;
      if (c === '#') { ctx.fillStyle = PAL.ink; ctx.fillRect(x - 2, y - 2, P + 4, P + 4); }
    }));
    FLASK.forEach((row, j) => [...row].forEach((c, i) => {
      if (c === '.') return;
      const x = fx + i * P, y = fy + j * P;
      if (c === '#') ctx.fillStyle = PAL.cream;
      else ctx.fillStyle = j === 7 ? ((i + wave) % 2 ? PAL.celadon : '#A8D8C2') : j >= 9 ? PAL.moss : PAL.celadon;
      ctx.fillRect(x, y, P, P);
    }));
    // bubbles inside, fumes rising from the neck
    ctx.fillStyle = PAL.cream;
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.9 + k / 3) % 1;
      ctx.fillRect(fx + (3 + k * 3) * P, fy + Math.round((10 - ph * 3) ) * P, P, P);
    }
    for (let k = 0; k < 4; k++) {
      const ph = (t * 0.6 + k / 4) % 1;
      ctx.globalAlpha *= 1;
      ctx.fillStyle = ph < 0.5 ? PAL.celadon : PAL.moss;
      const sway = Math.round(Math.sin((ph + k) * 5) * 2);
      ctx.fillRect(fx + (5 + sway) * P, fy - Math.round(ph * 9 + 1) * P, P * (ph < 0.6 ? 2 : 1), P);
    }

    // the name: gold pixel letters with an ink outline, "2000" on a red seal
    const name = this.T.studio.replace(/2000$/, '').toUpperCase(), year = '2000';
    const ty = 410;
    ctx.font = font(52);
    const nw = ctx.measureText(name).width;
    ctx.font = font(30);
    const yw = ctx.measureText(year).width + 30;
    const total = nw + 18 + yw, x0 = W / 2 - total / 2;
    text(ctx, name, x0, ty, { size: 52, color: PAL.gold, align: 'left' });
    // a light sweep across the name once
    const sweep = (t - 0.6) / 0.9;
    if (sweep > 0 && sweep < 1) {
      ctx.save();
      ctx.beginPath(); ctx.rect(x0, ty - 34, nw, 68); ctx.clip();
      ctx.fillStyle = 'rgba(255,241,184,0.55)';
      const sx = x0 + sweep * (nw + 80) - 40;
      ctx.fillRect(Math.round(sx / 6) * 6, ty - 34, 18, 68);
      ctx.restore();
    }
    const sx0 = x0 + nw + 18, sy0 = ty - 28;
    ctx.fillStyle = PAL.ink; ctx.fillRect(sx0 - 3, sy0 - 3, yw + 6, 62);
    ctx.fillStyle = PAL.red; ctx.fillRect(sx0, sy0, yw, 56);
    ctx.fillStyle = PAL.dred; ctx.fillRect(sx0, sy0 + 49, yw, 7);
    text(ctx, year, sx0 + yw / 2, ty, { size: 30, color: PAL.cream, shadow: false });

    // tagline-style rule and "presents…"
    ctx.fillStyle = PAL.slate;
    for (let x = W / 2 - 180; x < W / 2 + 180; x += 12) ctx.fillRect(x, ty + 52, 6, 4);
    const shown = Math.max(0, Math.floor((t - 0.9) * 16));
    text(ctx, this.T.presents.slice(0, shown), W / 2, ty + 100, { size: 24, color: PAL.cream });
    ctx.restore();
  }
}

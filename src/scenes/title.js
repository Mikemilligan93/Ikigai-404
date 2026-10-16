import { W, H, PX, PAL, COLORS, text, windowBox, drawFrame } from '../engine.js';
import { walkFrame } from '../sprites.js';
import { cleanName } from '../leaderboard.js';

export class TitleScene {
  constructor(game) {
    this.g = game;
    this.name = game.session.name || '';
    this.t = 0;
    this.scores = null;
  }

  enter() {
    this.g.audio.playMusic('music_title');
    this.g.leaderboard.top().then((s) => { this.scores = s; });
  }

  update(dt) {
    this.t += dt;
    const max = this.g.config.leaderboard.nameMaxLength;
    for (const k of this.g.input.typed) {
      if (k === 'Backspace') this.name = this.name.slice(0, -1);
      else if (k === 'Enter') {
        if (this.name.trim()) {
          this.g.session.name = cleanName(this.name, max);
          this.g.go(this.g.scenes.intro());
        }
      } else if (k.length === 1 && this.name.length < max && /[\p{L}\p{N} ._-]/u.test(k)) this.name += k;
    }
    // start music on first interaction (browser autoplay rules)
    if (this.g.input.typed.length && !this.g.audio.music) this.g.audio.playMusic('music_title');
  }

  draw(ctx) {
    const T = this.g.texts.title;
    const a = this.g.assets;
    const bg = a.get('title_bg');
    if (bg) ctx.drawImage(bg, 0, 0, W, H);
    else {
      // pixel dawn: banded sky, sun, Fuji, office tower
      const bands = [PAL.ink, PAL.indigo, PAL.slate, PAL.pink, PAL.peach];
      bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * 96, W, 96); });
      ctx.fillStyle = PAL.gold;
      const sy = 460 - Math.floor(this.t * 2) % 2 * PX;
      ctx.fillRect(W / 2 - 96, sy - 60, 192, 120); ctx.fillRect(W / 2 - 60, sy - 96, 120, 192);
      ctx.fillStyle = PAL.slate;
      for (let i = 0; i < 40; i++) ctx.fillRect(160 + i * 12, 480 - i * 6, (40 - i) * 24 - 0, 6);
      ctx.fillStyle = PAL.cream;
      for (let i = 0; i < 8; i++) ctx.fillRect(160 + (32 + i) * 12, 480 - (32 + i) * 6, (8 - i) * 24, 6);
      ctx.fillStyle = PAL.ink; ctx.fillRect(900, 150, 210, 420);
      ctx.fillStyle = PAL.gold;
      for (let y = 180; y < 540; y += 36) for (let x = 918; x < 1090; x += 36) if ((x * 7 + y * 3) % 5) ctx.fillRect(x, y, 15, 18);
      ctx.fillStyle = PAL.moss; ctx.fillRect(0, 570, W, 150);
      ctx.fillStyle = PAL.ink; ctx.fillRect(0, 570, W, 6);
    }
    // without the title art, a bunny walks in place at the bottom (the art has its own bunny)
    if (!bg) drawFrame(ctx, a, 'player_ok', walkFrame(this.t * 60, 22), 1, 180, 690, { flip: true, scale: PX * 2, kind: 'player', ph: [16, 26] });

    text(ctx, T.gameName, W / 2, 110, { size: 96, color: PAL.gold });
    text(ctx, T.subtitle, W / 2, 182, { size: 28, color: PAL.cream });

    // name entry
    windowBox(ctx, W / 2 - 300, 236, 600, 150);
    text(ctx, T.namePrompt, W / 2, 274, { size: 22, color: PAL.cream });
    const cursor = Math.floor(this.t * 2) % 2 ? '_' : ' ';
    text(ctx, this.name + cursor, W / 2, 330, { size: 40, color: PAL.gold });
    if (this.name.trim()) text(ctx, T.startHint, W / 2, 414, { size: 24, color: PAL.gold });

    text(ctx, T.controls, W / 2, 452, { size: 18, color: PAL.cream });

    // leaderboard
    windowBox(ctx, W / 2 - 230, 484, 460, 220, { alpha: 0.85 });
    text(ctx, T.leaderboardTitle, W / 2, 512, { size: 22, color: PAL.gold });
    if (this.scores) {
      this.scores.slice(0, 5).forEach((s, i) => {
        text(ctx, `${i + 1}. ${s.name}`, W / 2 - 190, 550 + i * 30, { size: 18, align: 'left' });
        text(ctx, String(s.score), W / 2 + 190, 550 + i * 30, { size: 18, align: 'right' });
      });
      if (!this.scores.length) text(ctx, '—', W / 2, 552, { size: 18 });
    }
  }
}

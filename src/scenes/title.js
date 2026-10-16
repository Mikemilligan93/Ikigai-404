import { W, H, COLORS, text, roundRect } from '../engine.js';
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
    if (a.has('title_bg')) ctx.drawImage(a.images.title_bg, 0, 0, W, H);
    else {
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, COLORS.night); grd.addColorStop(0.65, COLORS.indigo); grd.addColorStop(1, COLORS.dawn);
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = COLORS.gold;
      ctx.beginPath(); ctx.arc(W / 2, H + 60, 220 + Math.sin(this.t) * 4, Math.PI, 0); ctx.fill();
    }

    text(ctx, T.gameName, W / 2, 130, { size: 96, color: COLORS.gold, bold: true });
    text(ctx, T.subtitle, W / 2, 200, { size: 28, color: COLORS.paper });

    // name entry
    ctx.fillStyle = COLORS.paper; ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 4;
    roundRect(ctx, W / 2 - 300, 280, 600, 130, 12); ctx.fill(); ctx.stroke();
    text(ctx, T.namePrompt, W / 2, 310, { size: 22, color: COLORS.ink, shadow: false });
    const cursor = Math.floor(this.t * 2) % 2 ? '|' : ' ';
    text(ctx, this.name + cursor, W / 2, 360, { size: 40, color: COLORS.vermilion, bold: true, shadow: false });
    if (this.name.trim()) text(ctx, T.startHint, W / 2, 440, { size: 24, color: COLORS.gold });

    text(ctx, T.controls, W / 2, 485, { size: 18, color: COLORS.paper });

    // leaderboard
    text(ctx, T.leaderboardTitle, W / 2, 535, { size: 22, color: COLORS.gold, bold: true });
    if (this.scores) {
      this.scores.slice(0, 5).forEach((s, i) => {
        text(ctx, `${i + 1}. ${s.name}`, W / 2 - 150, 568 + i * 26, { size: 18, align: 'left' });
        text(ctx, String(s.score), W / 2 + 150, 568 + i * 26, { size: 18, align: 'right' });
      });
      if (!this.scores.length) text(ctx, '—', W / 2, 570, { size: 18 });
    }
  }
}

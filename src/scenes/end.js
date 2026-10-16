import { W, H, COLORS, text, pick, roundRect } from '../engine.js';

// Win ("Level 2 coming soon") or burnout screen + score + leaderboard.
export class EndScene {
  constructor(game, result) {
    this.g = game;
    this.r = result;
    this.T = game.texts.end;
    this.t = 0;
    this.quote = pick(this.T.burnoutLines);
    this.scores = null;
    this.myEntry = null;
  }

  enter() {
    const win = this.r.outcome === 'win';
    this.g.audio.playMusic('music_end');
    this.g.audio.sfx(win ? 'sfx_win' : 'sfx_burnout');
    this.myEntry = { name: this.g.session.name, score: this.r.score };
    this.g.leaderboard.submit({ name: this.g.session.name, score: this.r.score, outcome: this.r.outcome, seconds: this.r.seconds })
      .then((s) => { this.scores = s; });
  }

  update(dt) {
    this.t += dt;
    if (this.t > 1 && this.g.input.wasPressed('Enter')) this.g.go(this.g.scenes.title());
  }

  draw(ctx) {
    const win = this.r.outcome === 'win';
    const grd = ctx.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, win ? COLORS.indigo : '#111');
    grd.addColorStop(1, win ? COLORS.dawn : '#3b2a26');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    if (win) {
      text(ctx, this.T.winTitle, W / 2, 80, { size: 52, color: COLORS.gold, bold: true });
      text(ctx, this.T.comingSoon, W / 2, 140, { size: 26, color: COLORS.paper });
    } else {
      text(ctx, this.T.burnoutTitle, W / 2, 80, { size: 52, color: COLORS.vermilion, bold: true });
      text(ctx, `“${this.quote}”`, W / 2, 145, { size: 32, color: COLORS.paper });
    }

    // score panel
    ctx.fillStyle = 'rgba(13,15,31,0.75)'; roundRect(ctx, 120, 200, 460, 300, 14); ctx.fill();
    text(ctx, `${this.T.scoreLabel}: ${this.r.score}`, 350, 240, { size: 36, color: COLORS.gold, bold: true });
    const b = this.r.breakdown || {};
    const rows = [[this.T.breakdown.kills, b.kills], [this.T.breakdown.damage, b.damage], [this.T.breakdown.timeBonus, b.timeBonus]];
    rows.forEach(([label, v], i) => {
      text(ctx, label, 150, 300 + i * 40, { size: 20, align: 'left' });
      text(ctx, String(v ?? 0), 550, 300 + i * 40, { size: 20, align: 'right' });
    });
    const t = Math.round(this.r.seconds || 0);
    text(ctx, `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, 350, 450, { size: 20, color: COLORS.paperDark });

    // leaderboard
    ctx.fillStyle = 'rgba(13,15,31,0.75)'; roundRect(ctx, 640, 200, 520, 400, 14); ctx.fill();
    text(ctx, this.g.texts.title.leaderboardTitle, 900, 235, { size: 24, color: COLORS.gold, bold: true });
    if (!this.scores) text(ctx, this.T.submitting, 900, 300, { size: 20 });
    else {
      let marked = false;
      this.scores.forEach((s, i) => {
        const mine = !marked && s.name === this.myEntry.name && s.score === this.myEntry.score;
        if (mine) marked = true;
        const c = mine ? COLORS.gold : COLORS.paper;
        text(ctx, `${i + 1}. ${s.name}`, 670, 275 + i * 30, { size: 20, align: 'left', color: c, bold: mine });
        text(ctx, String(s.score), 1130, 275 + i * 30, { size: 20, align: 'right', color: c, bold: mine });
      });
      if (this.g.leaderboard.online === false) text(ctx, this.T.localOnly, 900, 580, { size: 15, color: COLORS.paperDark });
    }

    if (this.t > 1) text(ctx, this.T.playAgain, W / 2, H - 50, { size: 24, color: COLORS.paper });
  }
}

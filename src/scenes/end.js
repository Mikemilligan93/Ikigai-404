import { W, H, PX, PAL, COLORS, text, pick, windowBox, drawFrame, fontOf } from '../engine.js';
import { walkFrame } from '../sprites.js';

// Win ("Level 2 coming soon") or burnout screen + score + leaderboard.
export class EndScene {
  constructor(game, result) {
    this.g = game;
    this.r = result;
    this.T = game.texts.end;
    this.t = 0;
    this.quote = pick(this.T.burnoutLines);
    this.sincere = pick(this.T.burnoutSincere || ['']);
    this.scores = null;
    this.myEntry = null;
  }

  enter() {
    const win = this.r.outcome === 'win';
    if (win) { try { localStorage.setItem('ikigai404.won', '1'); } catch (e) { /* not remembered */ } }
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
    const bands = win ? [PAL.indigo, PAL.slate, PAL.pink, PAL.peach] : [PAL.ink, PAL.ink, PAL.dgrey, PAL.dred];
    bands.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * 180, W, 180); });

    // Level 2 (the canteen) brings its own titles: texts.json → canteen.end
    const LT = this.r.level === 2 ? this.g.texts.canteen.end : this.T;
    if (win) {
      text(ctx, LT.winTitle, W / 2, 72, { size: 52, color: PAL.gold });
      text(ctx, LT.comingSoon, W / 2, 124, { size: 26, color: PAL.cream });
      text(ctx, LT.winClosing, W / 2, 162, { size: 18, color: PAL.gold });
    } else {
      text(ctx, this.T.burnoutTitle, W / 2, 72, { size: 52, color: PAL.red });
      text(ctx, `“${this.quote}”`, W / 2, 128, { size: 30, color: PAL.cream });
      // joke first, then one sincere line
      text(ctx, this.sincere, W / 2, 166, { size: 18, color: PAL.gold });
    }

    // the bunny: walking home happily, or sitting there burnt out with smoke
    const a = this.g.assets;
    if (win) drawFrame(ctx, a, 'player_ok', walkFrame(this.t * 50, 22), 0, 350, 660, { scale: PX * 2, kind: 'player', ph: [16, 26] });
    else {
      drawFrame(ctx, a, 'player_burnt', 1, 0, 350, 660, { scale: PX * 2, kind: 'player', color: PAL.grey, ph: [16, 26] });
      const k = this.t % 1.2;
      drawFrame(ctx, a, 'fx_items', 2, 1, 350 + Math.floor(k * 3) * 6, 440 - k * 60, { scale: PX * 2, anchor: 'center', alpha: 1 - k / 1.2, kind: 'fx', color: PAL.grey, ph: [6, 6], eyes: false });
    }

    // score panel
    windowBox(ctx, 120, 190, 460, 278);
    text(ctx, `${this.T.scoreLabel}: ${this.r.score}`, 350, 228, { size: 34, color: PAL.gold });
    const b = this.r.breakdown || {};
    let rows = [[this.T.breakdown.kills, b.kills], [this.T.breakdown.selfCare, b.selfCare], [this.T.breakdown.damage, b.damage], [this.T.breakdown.timeBonus, b.timeBonus]];
    if (b.morning) rows.unshift([this.T.breakdown.morning, b.morning]);
    if (this.r.rows) rows = this.r.rows;   // a level with its own score rows (the canteen)
    const rowH = rows.length > 5 ? 25 : 32;
    rows.forEach(([label, v], i) => {
      const care = label === this.T.breakdown.selfCare || label === this.g.texts.canteen?.end?.rows?.care;
      const sz = rows.length > 5 ? 17 : 19;
      text(ctx, label, 150, 270 + i * rowH, { size: sz, align: 'left', color: care ? PAL.celadon : PAL.cream });
      text(ctx, String(v ?? 0), 550, 270 + i * rowH, { size: sz, align: 'right', color: care ? PAL.celadon : PAL.cream });
    });
    // what the self-care was made of, plus the time
    const c = this.r.care || { mochi: 0, breaks: 0, helped: 0 }, t = Math.round(this.r.seconds || 0);
    const care = this.T.careLine.replace('{breaks}', c.breaks).replace('{mochi}', c.mochi).replace('{helped}', c.helped);
    const careText = this.r.careLine || `${care} · ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    let cs = 15; ctx.font = fontOf(cs);
    while (cs > 11 && ctx.measureText(careText).width > 420) { cs--; ctx.font = fontOf(cs); }
    text(ctx, careText, 350, 270 + rows.length * rowH + 6, { size: cs, color: PAL.grey, shadow: false });

    // leaderboard
    windowBox(ctx, 640, 190, 520, 420);
    text(ctx, this.g.texts.title.leaderboardTitle, 900, 226, { size: 24, color: PAL.gold });
    if (!this.scores) text(ctx, this.T.submitting, 900, 290, { size: 20 });
    else {
      let marked = false;
      this.scores.forEach((s, i) => {
        const mine = !marked && s.name === this.myEntry.name && s.score === this.myEntry.score;
        if (mine) marked = true;
        const c = mine ? PAL.gold : PAL.cream;
        text(ctx, `${i + 1}. ${s.name}`, 676, 266 + i * 30, { size: 20, align: 'left', color: c });
        text(ctx, String(s.score), 1124, 266 + i * 30, { size: 20, align: 'right', color: c });
      });
      if (this.g.leaderboard.online === false) text(ctx, this.T.localOnly, 900, 584, { size: 15, color: PAL.grey });
    }

    if (this.t > 1 && Math.floor(this.t * 2) % 2) text(ctx, this.T.playAgain, W / 2 + 160, H - 44, { size: 24, color: PAL.cream });
  }
}

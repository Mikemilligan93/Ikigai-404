import { W, H, PX, PAL, text, dialogueBox, drawFrame } from '../engine.js';

// Chest-up dialogue in the lift, after the CEO fight. Lines come from texts.json → lift.lines.
// Portraits are 2-frame sheets (mouth closed / open): the speaker's mouth moves while the text types out.
export class LiftScene {
  constructor(game) {
    this.g = game;
    this.T = game.texts.lift;
    this.A = game.config.animation;
    this.i = 0;
    this.t = 0;
    this.shown = 0;
  }

  enter() { this.g.audio.playMusic('music_lift'); this.g.audio.sfx('sfx_lift_ding'); }

  // after the lift: lunch (Level 2, the canteen). The Level 1 score comes along in session.result.
  done() { this.g.go(this.g.scenes.canteen ? this.g.scenes.canteen({}) : this.g.scenes.end(this.g.session.result)); }

  get line() { return this.T.lines[Math.min(this.i, this.T.lines.length - 1)]; }

  update(dt) {
    this.t += dt;
    const inp = this.g.input;
    const before = Math.floor(this.shown);
    this.shown = Math.min(this.line.text.length, this.shown + dt * this.A.typeSpeed);
    if (Math.floor(this.shown) !== before && Math.floor(this.shown) % 3 === 0) this.g.audio.sfx('sfx_dialogue', 0.07);   // typewriter blips
    if (inp.wasPressed('Escape')) return this.done();
    if (inp.wasPressed('e', ' ', 'Enter') && this.t > 0.2) {
      if (this.shown < this.line.text.length) { this.shown = this.line.text.length; return; }
      this.i++; this.shown = 0;
      if (this.i >= this.T.lines.length) this.done();
    }
  }

  draw(ctx) {
    const a = this.g.assets;
    const bg = a.get('lift_interior');
    if (bg) ctx.drawImage(bg, 0, 0, W, H);
    else {
      ctx.fillStyle = PAL.wood; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = PAL.ochre; for (let x = 0; x < W; x += 160) ctx.fillRect(x + 12, 0, 136, H);
      ctx.fillStyle = PAL.ink; ctx.fillRect(W / 2 - 63, 27, 126, 46);
      ctx.fillStyle = PAL.gold; ctx.fillRect(W / 2 - 60, 30, 120, 40);
      text(ctx, '▼ ' + (Math.floor(this.t) % 9 + 1), W / 2, 50, { size: 24, color: PAL.ink, shadow: false });
    }
    // the lift sways a little: everything moves together by one sprite pixel
    const sway = Math.floor(this.t * 1.5) % 2 ? PX : 0;
    const who = this.line.who;
    const talking = this.shown < this.line.text.length;
    const mouth = (w) => (who === w && talking ? Math.floor(this.t * this.A.talkFps) % 2 : 0);
    const S = 4;  // 96 px portraits at 4x = 384 px
    drawFrame(ctx, a, 'player_portrait', mouth('player'), 0, 290, 512 + sway + (who === 'player' ? 0 : 12), {
      scale: S, alpha: who === 'player' ? 1 : 0.9, kind: 'player', ph: [44, 52], label: 'Bunny',
    });
    drawFrame(ctx, a, 'boss_portrait', mouth('boss'), 0, W - 290, 512 + sway + (who === 'boss' ? 0 : 12), {
      scale: S, alpha: who === 'boss' ? 1 : 0.9, kind: 'boss', ph: [44, 52], label: this.T.bossName,
    });
    const name = who === 'player' ? this.g.session.name : this.T.bossName;
    dialogueBox(ctx, name, this.line.text, this.T.continueHint, { shown: Math.floor(this.shown) });
  }
}

import { W, H, COLORS, sprite, text, dialogueBox } from '../engine.js';

// Chest-up dialogue in the lift, after the CEO fight. Lines come from texts.json → lift.lines.
export class LiftScene {
  constructor(game) {
    this.g = game;
    this.T = game.texts.lift;
    this.i = 0;
    this.t = 0;
  }

  enter() { this.g.audio.playMusic('music_lift'); }

  done() { this.g.go(this.g.scenes.end(this.g.session.result)); }

  update(dt) {
    this.t += dt;
    const inp = this.g.input;
    if (inp.wasPressed('Escape')) return this.done();
    if (inp.wasPressed('e', ' ', 'Enter') && this.t > 0.2) {
      this.i++;
      if (this.i >= this.T.lines.length) this.done();
    }
  }

  draw(ctx) {
    const a = this.g.assets;
    if (a.has('lift_interior')) ctx.drawImage(a.images.lift_interior, 0, 0, W, H);
    else {
      ctx.fillStyle = '#6b5b3e'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#8a7650'; for (let x = 0; x < W; x += 160) ctx.fillRect(x + 10, 0, 140, H);
      ctx.fillStyle = COLORS.gold; ctx.fillRect(W / 2 - 60, 30, 120, 40);
      text(ctx, '▼ ' + (this.i % 9 + 1), W / 2, 50, { size: 24, color: COLORS.ink, bold: true, shadow: false });
    }
    const line = this.T.lines[Math.min(this.i, this.T.lines.length - 1)];
    const speaking = line.who;
    const bob = (who) => (speaking === who ? Math.sin(this.t * 10) * 3 : 0);
    sprite(ctx, a, 'player_portrait', 290, 300 + bob('player'), 400, 400, { kind: 'player', label: 'Bunny (chest-up)', alpha: speaking === 'player' ? 1 : 0.7 });
    sprite(ctx, a, 'boss_portrait', W - 290, 300 + bob('boss'), 400, 400, { kind: 'boss', label: this.T.bossName + ' (chest-up)', flip: true, alpha: speaking === 'boss' ? 1 : 0.7 });
    const who = speaking === 'player' ? this.g.session.name : this.T.bossName;
    dialogueBox(ctx, who, line.text, this.T.continueHint);
  }
}

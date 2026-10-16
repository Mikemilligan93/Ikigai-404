import { W, H, COLORS, clamp, lerp, sprite, text, dialogueBox } from '../engine.js';

const GROUND = 610;
const SEG = { flat: [0, 1280], metro: [1280, 3840], office: [3840, 5120] };
const WORLD_W = 5120;
const INSPECTOR_X = 2700;

export class IntroScene {
  constructor(game) {
    this.g = game;
    this.cfg = game.config.intro;
    this.T = game.texts.intro;
    this.phase = 'nightmare';
    this.t = 0;
    this.px = 380; this.facing = 1; this.walkT = 0;
    this.camX = 0;
    this.inspectorDone = false;
    this.line = 0;
  }

  enter() { this.g.audio.playMusic('music_intro'); }

  update(dt) {
    const inp = this.g.input;
    this.t += dt;
    if (inp.wasPressed('Escape')) { this.g.go(this.g.scenes.office()); return; }

    if (this.phase === 'nightmare' && this.t > this.cfg.nightmareDuration) { this.phase = 'sunrise'; this.t = 0; }
    else if (this.phase === 'sunrise' && this.t > this.cfg.sunriseDuration) { this.phase = 'shake'; this.t = 0; }
    else if (this.phase === 'shake' && this.t > this.cfg.shakeDuration) { this.phase = 'walk'; this.t = 0; }
    else if (this.phase === 'walk') {
      const ax = inp.axis().x;
      if (ax) { this.facing = ax; this.walkT += dt; } else this.walkT = 0;
      let nx = this.px + ax * this.cfg.walkSpeed * dt;
      // the inspector blocks the turnstile until the dialogue is done
      if (!this.inspectorDone && nx > INSPECTOR_X - 120) {
        nx = INSPECTOR_X - 120;
        this.phase = 'dialogue'; this.line = 0;
      }
      this.px = clamp(nx, 60, WORLD_W - 60);
      if (this.px > WORLD_W - 200) this.g.go(this.g.scenes.office());
    } else if (this.phase === 'dialogue') {
      if (inp.wasPressed('e', ' ', 'Enter')) {
        this.line++;
        if (this.line >= this.T.inspectorLines.length) { this.inspectorDone = true; this.phase = 'walk'; }
      }
    }
    this.camX = clamp(this.px - W / 2, 0, WORLD_W - W);
  }

  drawBackground(ctx) {
    const a = this.g.assets;
    for (const [key, [x0, x1]] of Object.entries(SEG)) {
      if (x1 < this.camX || x0 > this.camX + W) continue;
      const imgKey = { flat: 'intro_flat', metro: 'intro_metro', office: 'intro_entrance' }[key];
      if (a.has(imgKey)) {
        for (let x = x0; x < x1; x += W) ctx.drawImage(a.images[imgKey], x, 0, W, H);
        continue;
      }
      if (key === 'flat') {
        ctx.fillStyle = '#5a4a6b'; ctx.fillRect(x0, 0, x1 - x0, H);
        // window with sky
        const sky = this.skyColor();
        ctx.fillStyle = sky; ctx.fillRect(x0 + 760, 150, 300, 220);
        if (this.phase !== 'nightmare') {
          const sunY = this.phase === 'sunrise' ? lerp(380, 250, this.t / this.cfg.sunriseDuration) : 250;
          ctx.save(); ctx.beginPath(); ctx.rect(x0 + 760, 150, 300, 220); ctx.clip();
          ctx.fillStyle = COLORS.gold; ctx.beginPath(); ctx.arc(x0 + 910, sunY, 50, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 8; ctx.strokeRect(x0 + 760, 150, 300, 220);
        // bed and door
        ctx.fillStyle = '#8a6d5a'; ctx.fillRect(x0 + 180, GROUND - 90, 360, 90);
        ctx.fillStyle = COLORS.paper; ctx.fillRect(x0 + 180, GROUND - 120, 110, 40);
        ctx.fillStyle = '#4a3726'; ctx.fillRect(x1 - 120, GROUND - 260, 110, 260);
      } else if (key === 'metro') {
        ctx.fillStyle = '#3d4a52'; ctx.fillRect(x0, 0, x1 - x0, H);
        ctx.fillStyle = '#c8c2b0';
        for (let x = x0; x < x1; x += 80) for (let y = 120; y < GROUND - 60; y += 60) ctx.fillRect(x + 4, y + 4, 72, 52);
        ctx.fillStyle = '#26303a';
        for (let x = x0 + 300; x < x1; x += 700) ctx.fillRect(x, 80, 60, GROUND - 80);
        ctx.fillStyle = COLORS.vermilion; ctx.fillRect(x0 + 200, 70, 400, 50);
        text(ctx, 'メトロ  METRO', x0 + 400, 95, { size: 26, color: COLORS.paper, bold: true });
        // turnstile
        ctx.fillStyle = '#9aa3a8'; ctx.fillRect(INSPECTOR_X - 40, GROUND - 110, 30, 110);
      } else {
        ctx.fillStyle = '#2a3150'; ctx.fillRect(x0, 0, x1 - x0, H);
        ctx.fillStyle = '#f5d98b';
        for (let x = x0 + 60; x < x1; x += 140) for (let y = 60; y < GROUND - 140; y += 120) ctx.fillRect(x, y, 90, 70);
        ctx.fillStyle = '#1c2033'; ctx.fillRect(x1 - 300, GROUND - 300, 220, 300);
        ctx.fillStyle = COLORS.gold; ctx.fillRect(x1 - 300, GROUND - 330, 220, 30);
        text(ctx, 'MITO CORP', x1 - 190, GROUND - 315, { size: 20, color: COLORS.ink, bold: true, shadow: false });
      }
      text(ctx, this.T.locations[key], x0 + 40, 40, { size: 22, align: 'left', color: COLORS.gold });
    }
    ctx.fillStyle = '#2b2522'; ctx.fillRect(this.camX, GROUND, W, H - GROUND);
  }

  skyColor() {
    if (this.phase === 'nightmare') return '#0b0c18';
    const k = this.phase === 'sunrise' ? clamp(this.t / this.cfg.sunriseDuration, 0, 1) : 1;
    const c = (a, b) => Math.round(lerp(a, b, k));
    return `rgb(${c(27, 242)},${c(31, 179)},${c(59, 107)})`;
  }

  draw(ctx) {
    const a = this.g.assets;
    ctx.save();
    ctx.translate(-Math.round(this.camX), 0);
    this.drawBackground(ctx);

    // inspector
    sprite(ctx, a, 'npc_inspector', INSPECTOR_X, GROUND - 64, 96, 128, { kind: 'npc', color: '#34495e', label: this.T.inspectorName, flip: true });

    // player: lying during nightmare/sunrise, shaking, then walking
    let rot = 0, sx = 1, sy = 1, yOff = 0, x = this.px;
    if (this.phase === 'nightmare' || this.phase === 'sunrise') { rot = -Math.PI / 2; yOff = 40; x = 330; }
    if (this.phase === 'nightmare') x += Math.sin(this.t * 40) * 3;
    if (this.phase === 'shake') { sx = 1 + Math.sin(this.t * 50) * 0.12; rot = Math.sin(this.t * 35) * 0.15; }
    if (this.walkT > 0) yOff = -Math.abs(Math.sin(this.walkT * 10)) * 8;
    sprite(ctx, a, 'player_side', x, GROUND - 64 + yOff, 96, 128, { kind: 'player', label: 'Bunny', rot, sx, sy, flip: this.facing < 0 });
    ctx.restore();

    // screen-space overlays
    if (this.phase === 'nightmare') {
      ctx.fillStyle = 'rgba(5,5,15,0.85)'; ctx.fillRect(0, 0, W, H);
      text(ctx, this.T.nightmare, W / 2 + Math.sin(this.t * 13) * 4, H / 2, { size: 34, color: COLORS.vermilion });
    } else if (this.phase === 'sunrise') {
      ctx.fillStyle = `rgba(5,5,15,${0.85 * (1 - this.t / this.cfg.sunriseDuration)})`; ctx.fillRect(0, 0, W, H);
      if (this.t < 1) text(ctx, this.T.wakeUp, W / 2, H / 2, { size: 40, color: COLORS.paper });
    } else if (this.phase === 'walk') {
      text(ctx, this.T.walkHint, W / 2, 40, { size: 20, color: COLORS.paper });
    } else if (this.phase === 'dialogue') {
      dialogueBox(ctx, this.T.inspectorName, this.T.inspectorLines[this.line], this.T.continueHint, { top: true });
    }
    text(ctx, this.T.skipHint, W - 20, H - 20, { size: 16, align: 'right', color: COLORS.paperDark });
  }
}

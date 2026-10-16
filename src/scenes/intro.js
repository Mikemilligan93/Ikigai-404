import { W, H, PX, PAL, COLORS, clamp, lerp, text, dialogueBox, drawFrame } from '../engine.js';
import { SIDE, IDLE, loop } from '../sprites.js';

// Side-view intro: home → metro (ticket inspector) → office entrance.
// Backgrounds are 320×180 pixel art drawn at 4x; the bottom sixth of each is the floor.
const GROUND = 612;
const SEG = { flat: [0, 1280], metro: [1280, 3840], office: [3840, 5120] };
const WORLD_W = 5120;
const INSPECTOR_X = 3440;   // in front of the ticket gates of the second metro screen
const BED_X = 230;           // on the futon in intro_flat
const SIDE_SCALE = 3;        // side-view characters are drawn bigger than in the office (detailed backgrounds)

export class IntroScene {
  constructor(game) {
    this.g = game;
    this.cfg = game.config.intro;
    this.A = game.config.animation;
    this.T = game.texts.intro;
    this.phase = 'nightmare';
    this.t = 0; this.time = 0;
    this.px = BED_X + 90; this.facing = 1; this.walked = 0; this.moving = false;
    this.camX = 0;
    this.inspectorDone = false;
    this.line = 0; this.shown = 0; this.punchT = 0;
  }

  enter() { this.g.audio.playMusic('music_intro'); }

  update(dt) {
    const inp = this.g.input;
    this.t += dt; this.time += dt; this.punchT -= dt;
    if (inp.wasPressed('Escape')) { this.g.go(this.g.scenes.office()); return; }

    if (this.phase === 'nightmare' && this.t > this.cfg.nightmareDuration) { this.phase = 'sunrise'; this.t = 0; }
    else if (this.phase === 'sunrise' && this.t > this.cfg.sunriseDuration) { this.phase = 'shake'; this.t = 0; }
    else if (this.phase === 'shake' && this.t > this.cfg.shakeDuration) { this.phase = 'walk'; this.t = 0; }
    else if (this.phase === 'walk') {
      const ax = inp.axis().x;
      this.moving = !!ax;
      if (ax) this.facing = ax;
      let nx = this.px + ax * this.cfg.walkSpeed * dt;
      // the inspector blocks the turnstile until the dialogue is done
      if (!this.inspectorDone && nx > INSPECTOR_X - 130) {
        nx = INSPECTOR_X - 130;
        this.phase = 'dialogue'; this.line = 0; this.shown = 0; this.punchT = 0.8; this.moving = false;
      }
      nx = clamp(nx, 60, WORLD_W - 60);
      this.walked += Math.abs(nx - this.px);
      this.px = nx;
      if (this.px > WORLD_W - 200) this.g.go(this.g.scenes.office());
    } else if (this.phase === 'dialogue') {
      const full = this.T.inspectorLines[this.line].length;
      this.shown = Math.min(full, this.shown + dt * this.A.typeSpeed);
      if (inp.wasPressed('e', ' ', 'Enter')) {
        if (this.shown < full) this.shown = full;           // first press: show the whole line
        else {
          this.line++; this.shown = 0;
          if (this.line >= this.T.inspectorLines.length) { this.inspectorDone = true; this.phase = 'walk'; }
        }
      }
    }
    this.camX = clamp(this.px - W / 2, 0, WORLD_W - W);
  }

  drawBackground(ctx) {
    const a = this.g.assets;
    for (const [key, [x0, x1]] of Object.entries(SEG)) {
      if (x1 < this.camX || x0 > this.camX + W) continue;
      const imgKey = { flat: 'intro_flat', metro: 'intro_metro', office: 'intro_entrance' }[key];
      const img = a.get(imgKey);
      if (img) {
        for (let x = x0; x < x1; x += W) ctx.drawImage(img, x, 0, W, H);
        if (key === 'flat') this.drawSky(ctx, x0, true);
        continue;
      }
      this.placeholderBackground(ctx, key, x0, x1);
    }
    if (!a.has('intro_flat')) { ctx.fillStyle = PAL.wood; ctx.fillRect(this.camX, GROUND, W, H - GROUND); }
    text(ctx, this.T.locations[this.segAt(this.camX + W / 2)], this.camX + 40, 40, { size: 22, align: 'left', color: PAL.gold });
  }

  segAt(x) { return Object.entries(SEG).find(([, [a, b]]) => x >= a && x < b)?.[0] || 'office'; }

  // Night → dawn tint over the flat's window light (works with or without art).
  drawSky(ctx, x0, overlay) {
    const k = this.phase === 'nightmare' ? 0 : this.phase === 'sunrise' ? clamp(this.t / this.cfg.sunriseDuration, 0, 1) : 1;
    if (overlay) {
      ctx.fillStyle = `rgba(27,26,46,${0.75 * (1 - k)})`;
      ctx.fillRect(x0, 0, 1280, H);
    }
  }

  placeholderBackground(ctx, key, x0, x1) {
    const blk = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    if (key === 'flat') {
      blk(x0, 0, x1 - x0, H, PAL.indigo);
      for (let x = x0; x < x1; x += 48) blk(x, 0, 3, GROUND, 'rgba(27,26,46,0.25)');
      const k = this.phase === 'nightmare' ? 0 : this.phase === 'sunrise' ? clamp(this.t / this.cfg.sunriseDuration, 0, 1) : 1;
      blk(x0 + 744, 144, 312, 228, PAL.ink);
      blk(x0 + 756, 156, 288, 204, k < 0.5 ? PAL.ink : k < 0.8 ? PAL.slate : PAL.peach);
      if (this.phase !== 'nightmare') {
        const sunY = Math.round(lerp(372, 252, k) / PX) * PX;
        ctx.save(); ctx.beginPath(); ctx.rect(x0 + 756, 156, 288, 204); ctx.clip();
        blk(x0 + 870, sunY - 36, 72, 72, PAL.gold); blk(x0 + 858, sunY - 24, 96, 48, PAL.gold);
        ctx.restore();
      }
      blk(x0 + 897, 144, 6, 228, PAL.wood); blk(x0 + 744, 255, 312, 6, PAL.wood);
      blk(x0 + 150, GROUND - 42, 390, 42, PAL.cream); blk(x0 + 150, GROUND - 48, 390, 6, PAL.ink);   // futon
      blk(x0 + 168, GROUND - 66, 96, 24, PAL.cream);                                                 // pillow
      blk(x1 - 150, GROUND - 270, 120, 270, PAL.wood); blk(x1 - 54, GROUND - 150, 12, 12, PAL.gold);
    } else if (key === 'metro') {
      blk(x0, 0, x1 - x0, H, PAL.dgrey);
      for (let x = x0; x < x1; x += 48) for (let y = 120; y < GROUND - 48; y += 48) blk(x + 3, y + 3, 42, 42, PAL.grey);
      for (let x = x0 + 300; x < x1; x += 700) blk(x, 72, 60, GROUND - 72, PAL.indigo);
      blk(x0 + 200, 66, 420, 54, PAL.red);
      text(ctx, 'メトロ  METRO', x0 + 410, 93, { size: 26, color: PAL.cream });
      blk(INSPECTOR_X - 48, GROUND - 108, 30, 108, PAL.grey); blk(INSPECTOR_X - 48, GROUND - 108, 30, 6, PAL.ink);
    } else {
      blk(x0, 0, x1 - x0, H, PAL.slate);
      for (let x = x0 + 60; x < x1 - 320; x += 144) for (let y = 60; y < GROUND - 144; y += 120) blk(x, y, 96, 72, PAL.sky);
      blk(x1 - 300, GROUND - 300, 222, 300, PAL.indigo);
      blk(x1 - 300, GROUND - 336, 222, 36, PAL.gold);
      text(ctx, 'MITO CORP', x1 - 189, GROUND - 318, { size: 20, color: PAL.ink, shadow: false });
      for (const tx of [x0 + 180, x0 + 600]) { blk(tx, GROUND - 180, 18, 180, PAL.wood); blk(tx - 60, GROUND - 270, 138, 96, PAL.pink); }
    }
  }

  draw(ctx) {
    const a = this.g.assets;
    ctx.save();
    ctx.translate(-Math.round(this.camX), 0);
    this.drawBackground(ctx);

    // inspector (faces left, towards the player)
    let icol = loop(IDLE, this.time, this.A.idleFps);
    if (this.phase === 'dialogue') icol = this.punchT > 0 ? 2 : this.shown < this.T.inspectorLines[this.line].length ? loop([3, 0], this.time, this.A.talkFps) : 3;
    drawFrame(ctx, a, 'npc_inspector', icol, 0, INSPECTOR_X, GROUND, { scale: SIDE_SCALE, kind: 'npc', color: PAL.indigo, ph: [18, 40], label: this.T.inspectorName });

    // player
    let [col, row] = SIDE.standing, x = this.px, flip = this.facing < 0, rot = 0;
    if (this.phase === 'nightmare' || this.phase === 'sunrise') {
      [col, row] = SIDE.asleep; x = BED_X; flip = false;
      if (this.phase === 'nightmare' && Math.floor(this.t * 12) % 2) x += PX;        // tossing and turning
    } else if (this.phase === 'shake') {
      const k = this.t / this.cfg.shakeDuration;
      [col, row] = k < 0.3 ? SIDE.startled : SIDE.shaking;
      if (k >= 0.3) flip = Math.floor(this.t * 14) % 2 === 1;                          // shaking it off: quick mirror flips
      x = BED_X + 90;
    } else if (this.moving) { col = Math.floor(this.walked / this.A.sideWalkStride) % 4; row = SIDE.walkRow; }
    else if (this.phase === 'walk' || this.phase === 'dialogue') {
      [col, row] = SIDE.standing;
      if (Math.floor(this.time / this.A.idleBreath) % 2) rot = 0;
    }
    if (!a.has('player_side') && (this.phase === 'nightmare' || this.phase === 'sunrise')) rot = -Math.PI / 2;
    const breathe = !this.moving && this.phase === 'walk' && Math.floor(this.time / this.A.idleBreath) % 2 ? -3 : 0;
    const asleep = this.phase === 'nightmare' || this.phase === 'sunrise';
    drawFrame(ctx, a, 'player_side', col, row, x, GROUND - (rot ? 30 : 0) - (asleep && a.has('intro_flat') ? 118 : 0) + breathe, { scale: SIDE_SCALE, flip, rot, kind: 'player', ph: [16, 30], label: 'Bunny' });
    ctx.restore();

    // screen-space overlays
    if (this.phase === 'nightmare') {
      ctx.fillStyle = 'rgba(27,26,46,0.85)'; ctx.fillRect(0, 0, W, H);
      text(ctx, this.T.nightmare, W / 2 + (Math.floor(this.t * 13) % 2) * 6, H / 2, { size: 34, color: PAL.red });
    } else if (this.phase === 'sunrise') {
      ctx.fillStyle = `rgba(27,26,46,${0.85 * (1 - this.t / this.cfg.sunriseDuration)})`; ctx.fillRect(0, 0, W, H);
      if (this.t < 1) text(ctx, this.T.wakeUp, W / 2, H / 2, { size: 40, color: PAL.cream });
    } else if (this.phase === 'walk') {
      text(ctx, this.T.walkHint, W / 2, 40, { size: 20, color: PAL.cream });
    } else if (this.phase === 'dialogue') {
      dialogueBox(ctx, this.T.inspectorName, this.T.inspectorLines[this.line], this.T.continueHint, { top: true, shown: Math.floor(this.shown) });
    }
    text(ctx, this.T.skipHint, W - 20, H - 24, { size: 16, align: 'right', color: PAL.grey });
  }
}

import { W, H, PX, PAL, COLORS, FONT, clamp, lerp, text, dialogueBox, drawFrame, windowBox } from '../engine.js';
import { SIDE, IDLE, WAKE, FLAT_PROP, METRO_PROP, DEBRIS, loop } from '../sprites.js';

// Side-view intro: home → metro (ticket inspector) → office entrance.
// Backgrounds are 320×180 pixel art drawn at 4x; the bottom sixth of each is the floor.
const GROUND = 662;           // metro platform + office street: feet in the middle of the platform floor, not on the yellow line
const SEG = { flat: [0, 1280], metro: [1280, 3840], office: [3840, 5120] };
const WORLD_W = 5120;
const INSPECTOR_X = 3440;   // in front of the ticket gates of the second metro screen
const BED_X = 230;           // fallback sleeping spot (old art without player_wake)
const SIDE_SCALE = 3;        // side-view characters are drawn bigger than in the office (detailed backgrounds)
const FUTON_X = 40;          // left edge of the futon (player_wake sheet, drawn bottom-left anchored)
// The flat background is drawn at a closer zoom than the metro (its door is ~320 px ≈ 2 m), so things there are bigger.
const FLAT_SCALE = 4;        // bunny + futon in the flat (≈1.3 m bunny next to a 2 m door)
const WAKE_STAND_DX = 264;   // where the bunny stands in the last wake-up frame, measured from FUTON_X (66 sprite px × 4)
const FLAT_GROUND = 560;     // the flat's floor line: just in front of the wall's skirting board
const DOOR_X = 1180;         // walking into the flat's front door starts the fade to the metro
const GATE_EXIT_X = 3700;    // walking through the metro ticket gates starts the fade to the street
// The metro is built from layers (metro_back repeats with parallax, trains pass in front of it,
// metro_platform repeats in front of the trains, props are placed, debris is blown by the draft).
const METRO = {
  parallax: 0.6,            // the back wall + trains scroll slower than the platform → depth
  trainBottom: 590,         // screen y of the train wheels (the platform edge hides them)
  trainScale: 4,            // train drawn at 4x (2x bigger than the rest of the art)
  trainSpeed: 760,          // px/s
  trainGap: [2.5, 5.5],     // seconds between trains
  trainCars: [3, 5],        // middle cars per train
  floorY: GROUND - 6,       // debris rests here
};
const METRO_PROPS = [       // world x on the platform; kind → METRO_PROP in sprites.js
  { kind: 'bench', x: 1700 }, { kind: 'vending', x: 2020 }, { kind: 'bin', x: 2190 },
  { kind: 'billboard', x: 2650 }, { kind: 'timetable', x: 3020 }, { kind: 'gates', x: 3580 },
];

// Things to interact with in the flat (E). x = world position, kind = row/cols in sprites.js → FLAT_PROP.
// scale = size per prop, so they match real-world sizes (mirror ≈1.5 m, plant ≈0.7 m, cat on cushion ≈0.35 m).
const FLAT_PROPS = [
  { kind: 'mirror', x: 525, scale: 4 },
  { kind: 'cat', x: 690, scale: 2, front: true },     // front: a little closer to the camera, drawn over the bunny
  { kind: 'plant', x: 845, scale: 3, front: true },
];

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
    this.props = FLAT_PROPS.map((p) => ({ ...p, done: false, t: 0 }));
    this.say = null;          // speech bubble above the bunny { text, t }
    this.leftFlat = false;
    this.onStreet = false;      // passed the metro ticket gates
    this.doorTo = 'metro';      // where the current fade leads
    this.prompt = null;
    game.session.morningBonus = 0;
    this.hasWake = game.assets.has('player_wake');
    this.wakeTotal = WAKE.sequence.reduce((s, f) => s + f[2], 0);
    this.train = null; this.trainWait = 1.2; this.trainDir = -1;
    this.debris = []; this.draftT = 3; this.wind = 0;
  }

  enter() { this.g.audio.playMusic('music_intro'); }

  update(dt) {
    const inp = this.g.input;
    this.t += dt; this.time += dt; this.punchT -= dt;
    if (inp.wasPressed('Escape')) { this.g.go(this.g.scenes.office()); return; }

    if (this.phase === 'nightmare' && this.t > this.cfg.nightmareDuration) { this.phase = 'sunrise'; this.t = 0; }
    else if (this.phase === 'sunrise' && this.t > this.cfg.sunriseDuration) { this.phase = 'shake'; this.t = 0; }
    else if (this.phase === 'shake' && this.t > (this.hasWake ? this.wakeTotal : this.cfg.shakeDuration)) {
      this.phase = 'walk'; this.t = 0;
      if (this.hasWake) this.px = FUTON_X + WAKE_STAND_DX;
    }
    else if (this.phase === 'door') {
      // fade to black → title card → fade in at the metro
      const D = this.cfg.doorFade, C = this.cfg.doorCard;
      if (this.doorTo === 'metro' && !this.leftFlat && this.t >= D) { this.leftFlat = true; this.px = SEG.metro[0] + 160; this.facing = 1; this.say = null; this.debris = []; }
      if (this.doorTo === 'street' && !this.onStreet && this.t >= D) { this.onStreet = true; this.px = SEG.office[0] + 160; this.facing = 1; this.debris = []; this.train = null; this.wind = 0; }
      if (this.t >= D + C + D) { this.phase = 'walk'; this.t = 0; }
    }
    else if (this.phase === 'walk') {
      const ax = inp.axis().x;
      this.moving = !!ax;
      if (ax) this.facing = ax;
      let nx = this.px + ax * this.cfg.walkSpeed * dt;
      // the flat: walking into the front door fades over to the metro; there is no way back
      if (!this.leftFlat && nx > DOOR_X) { nx = DOOR_X; this.phase = 'door'; this.doorTo = 'metro'; this.t = 0; this.moving = false; }
      // the metro: walking through the ticket gates fades over to the street (only after the inspector)
      if (this.leftFlat && !this.onStreet && this.inspectorDone && nx > GATE_EXIT_X) { nx = GATE_EXIT_X; this.phase = 'door'; this.doorTo = 'street'; this.t = 0; this.moving = false; }
      if (this.leftFlat) nx = Math.max(nx, (this.onStreet ? SEG.office[0] : SEG.metro[0]) + 60);
      if (!this.leftFlat) this.updateFlat(dt, inp);
      // the inspector blocks the turnstile until the dialogue is done
      if (!this.inspectorDone && nx > INSPECTOR_X - 130) {
        nx = INSPECTOR_X - 130;
        this.phase = 'dialogue'; this.line = 0; this.shown = 0; this.punchT = 0.8; this.moving = false;
      }
      nx = clamp(nx, 60, WORLD_W - 60);
      this.walked += Math.abs(nx - this.px);
      this.px = nx;
      const stride = this.A.sideWalkStride * (this.leftFlat ? 1 : FLAT_SCALE / SIDE_SCALE);
      const step = Math.floor(this.walked / (stride * 2));       // one footstep per foot contact
      if (step !== this.step) { this.step = step; this.g.audio.sfx('sfx_step'); }
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
    if (this.say) { this.say.t -= dt; if (this.say.t <= 0) this.say = null; }
    this.updateMetro(dt);
    for (const p of this.props) p.t -= dt;
    this.camX = this.onStreet ? clamp(this.px - W / 2, SEG.office[0], WORLD_W - W)
      : this.leftFlat ? clamp(this.px - W / 2, SEG.metro[0], SEG.metro[1] - W) : 0;
  }

  // ---------------------------------------------------------------- metro life: trains, draft, debris
  updateMetro(dt) {
    const A = this.g.assets, view = this.camX * METRO.parallax;   // trains live in the parallax (back-wall) space
    const carW = A.cell('metro_train')[0] * METRO.trainScale;
    // trains: one at a time, alternating directions, a short pause between them
    if (!this.train) {
      this.trainWait -= dt;
      if (this.trainWait <= 0 && this.leftFlat && !this.onStreet) {   // no trains on the street, only the wind
        const cars = 1 + Math.floor(METRO.trainCars[0] + Math.random() * (METRO.trainCars[1] - METRO.trainCars[0] + 1));
        const len = cars * carW, dir = this.trainDir;
        this.train = { dir, cars, len, x: dir < 0 ? view + W + 40 : view - len - 40, sound: false };
        this.trainDir = -dir;
      }
    } else {
      const tr = this.train;
      tr.x += tr.dir * METRO.trainSpeed * dt;
      const onScreen = tr.x < view + W && tr.x + tr.len > view;
      if (onScreen && !tr.sound) { tr.sound = true; this.g.audio.sfx('sfx_train'); }
      if ((tr.dir < 0 && tr.x + tr.len < view - 60) || (tr.dir > 0 && tr.x > view + W + 60)) {
        this.train = null; this.trainWait = METRO.trainGap[0] + Math.random() * (METRO.trainGap[1] - METRO.trainGap[0]);
      }
    }
    // wind: strong while a train rushes past, otherwise an occasional light draft
    const inMetro = this.leftFlat;   // metro platform and the street outside the office: debris blows in both
    const tr = this.train;
    const rushing = tr && tr.x < view + W + 200 && tr.x + tr.len > view - 200;
    this.draftT -= dt;
    let target = 0;
    if (rushing) target = tr.dir * 1;
    else if (this.draftT < 0) { target = this.draftDir * 0.35; if (this.draftT < -2.5) { this.draftT = 4 + Math.random() * 5; this.draftDir = Math.random() < 0.5 ? -1 : 1; } }
    if (!this.draftDir) this.draftDir = 1;
    this.wind += (target - this.wind) * Math.min(1, dt * 2.5);
    // spawn debris on the upwind edge of the screen
    if (inMetro && Math.abs(this.wind) > 0.2 && this.debris.length < 22 && Math.random() < dt * 10 * Math.abs(this.wind)) {
      const kinds = Object.keys(DEBRIS), kind = kinds[Math.floor(Math.random() * kinds.length)];
      const heavy = DEBRIS[kind].heavy;
      this.debris.push({
        kind, heavy, t: 0, life: 7,
        x: this.wind > 0 ? this.camX - 40 : this.camX + W + 40,
        y: heavy ? METRO.floorY : METRO.floorY - 20 - Math.random() * 140,
        vx: this.wind * 300, vy: 0, phase: Math.random() * 6, rest: 0,
      });
    }
    for (const d of this.debris) {
      d.t += dt;
      const push = this.wind * (d.heavy ? 260 : 560);
      d.vx += (push - d.vx) * Math.min(1, dt * (d.heavy ? 1.2 : 2.2));
      if (!d.heavy) {
        const lift = Math.abs(this.wind) * 110;
        d.vy += (90 - lift) * dt;                                  // gravity vs. lift from the draft
        d.vy += Math.sin(d.t * 5 + d.phase) * 220 * dt * Math.abs(this.wind);   // flutter
        d.vy = clamp(d.vy, -220, 220);
      }
      d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.y >= METRO.floorY) { d.y = METRO.floorY; d.vy = 0; d.vx *= 0.96; }
      if (Math.abs(this.wind) < 0.15 && d.y >= METRO.floorY) d.rest += dt;
    }
    this.debris = this.debris.filter((d) => d.t < d.life && d.rest < 2.5 && d.x > this.camX - 200 && d.x < this.camX + W + 200);
  }

  drawMetro(ctx, x0, x1) {
    const a = this.g.assets;
    const back = a.get('metro_back'), front = a.get('metro_platform');
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, 0, x1 - x0, H); ctx.clip();
    // rumble while a train passes
    const tr = this.train, view = this.camX * METRO.parallax;
    const rumble = tr && tr.x < view + W && tr.x + tr.len > view ? (Math.floor(this.time * 30) % 2) * 2 : 0;
    // back wall: repeats, scrolls slower (parallax)
    const off = this.camX - (view % W);
    for (let k = -1; k <= 1; k++) ctx.drawImage(back, off + k * W, rumble, W, H);
    // the train, in back-wall space
    if (tr) {
      const carW = a.cell('metro_train')[0] * METRO.trainScale;
      for (let i = 0; i < tr.cars; i++) {
        const head = tr.dir < 0 ? i === 0 : i === tr.cars - 1;
        const sx = this.camX + (tr.x - view) + i * carW;
        if (sx > this.camX + W || sx + carW < this.camX) continue;
        drawFrame(ctx, a, 'metro_train', 0, head ? 0 : 1, sx + carW / 2, METRO.trainBottom + rumble, { scale: METRO.trainScale, flip: tr.dir > 0, kind: 'prop', color: PAL.grey, eyes: false });
      }
    }
    // platform: repeats at full speed, in front of the train
    for (let x = x0; x < x1; x += W) if (x + W > this.camX && x < this.camX + W) ctx.drawImage(front, x, 0, W, H);
    for (const p of METRO_PROPS) {
      const [col, row] = METRO_PROP[p.kind];
      drawFrame(ctx, a, 'metro_props', col, row, p.x, GROUND, { kind: 'prop', label: p.kind, eyes: false });
    }
    ctx.restore();
  }

  drawDebris(ctx) {
    const a = this.g.assets;
    for (const d of this.debris) {
      const def = DEBRIS[d.kind];
      const f = def.frames[Math.floor(d.t * (4 + Math.abs(d.vx) / 40)) % def.frames.length];
      const spin = d.heavy ? Math.round((d.x / 18) % 4) * (Math.PI / 2) : 0;           // cans and cups roll in 90° steps
      const alpha = d.rest > 0 ? clamp(1 - d.rest / 2.5, 0, 1) : clamp((d.life - d.t) / 1, 0, 1);
      drawFrame(ctx, a, 'metro_debris', f[0], f[1], d.x, d.y - 12, { anchor: 'center', rot: spin, flip: d.vx < 0, alpha, kind: 'fx', color: def.ph, ph: [8, 6], eyes: false });
    }
  }

  // Interactive props in the flat: stand next to one and press E.
  updateFlat(dt, inp) {
    this.prompt = null;
    const near = this.props.filter((p) => Math.abs(p.x - this.px) < 100).sort((a, b) => Math.abs(a.x - this.px) - Math.abs(b.x - this.px))[0];
    if (!near) return;
    const F = this.T.flat;
    this.prompt = near.done ? null : F.prompts[near.kind];
    if (near.kind === 'cat') near.noticed = true;
    if (inp.wasPressed('e') && !near.done) {
      near.done = true; near.t = 2.5;
      this.facing = near.x < this.px ? -1 : 1;
      const lines = F.lines[near.kind] || ['…'];
      this.say = { text: lines[Math.floor(Math.random() * lines.length)], t: 3.5 };
      this.g.session.morningBonus += this.cfg.interactBonus;
      this.g.audio.sfx('sfx_pickup');
    }
  }

  propFrame(p) {
    const f = FLAT_PROP[p.kind];
    if (p.kind === 'mirror') return p.t > 1.5 ? f.used : f.idle;
    if (p.kind === 'plant') return p.done ? f.used : f.idle;
    if (p.kind === 'cat') {
      if (p.t > 0.8) return f.used;                                   // purring with hearts
      if (p.done) return Math.floor(this.time * 0.5) % 6 === 0 ? f.stretch : f.idle;
      return p.noticed ? f.noticed : f.idle;
    }
    return f.idle;
  }

  drawBackground(ctx) {
    const a = this.g.assets;
    for (const [key, [x0, x1]] of Object.entries(SEG)) {
      if (x1 < this.camX || x0 > this.camX + W) continue;
      if (key === 'metro' && a.has('metro_back') && a.has('metro_platform')) { this.drawMetro(ctx, x0, x1); continue; }
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
      if (!this.hasWake) {
        blk(x0 + 150, GROUND - 42, 390, 42, PAL.cream); blk(x0 + 150, GROUND - 48, 390, 6, PAL.ink);   // futon
        blk(x0 + 168, GROUND - 66, 96, 24, PAL.cream);                                                 // pillow
      }
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

  // Pixel speech bubble above the bunny (world coordinates).
  drawBubble(ctx, say, x, headY) {
    ctx.font = `16px ${FONT}`;
    const words = say.text.split(' '), lines = [];
    let line = '';
    for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > 320 && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line);
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 28, h = lines.length * 22 + 18;
    const bx = clamp(Math.round(x - w / 2), this.camX + 8, this.camX + W - w - 8), by = Math.round(headY - h);
    ctx.globalAlpha = clamp(say.t * 2, 0, 1);
    ctx.fillStyle = PAL.ink; ctx.fillRect(bx - 3, by - 3, w + 6, h + 6); ctx.fillRect(x - 6, by + h, 12, 9);
    ctx.fillStyle = PAL.cream; ctx.fillRect(bx, by, w, h); ctx.fillRect(x - 3, by + h, 6, 6);
    ctx.fillStyle = PAL.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, bx + 14, by + 20 + i * 22));
    ctx.globalAlpha = 1;
  }

  draw(ctx) {
    const a = this.g.assets;
    ctx.save();
    ctx.translate(-Math.round(this.camX), 0);
    this.drawBackground(ctx);

    // flat: futon + interactive props
    if (this.camX < SEG.flat[1]) {
      for (const p of this.props.filter((q) => !q.front)) {
        const [col, row] = this.propFrame(p);
        drawFrame(ctx, a, 'flat_props', col, row, p.x, FLAT_GROUND, { scale: p.scale, kind: 'prop', color: { mirror: PAL.sky, plant: PAL.moss, cat: PAL.ochre }[p.kind], ph: [14, p.kind === 'cat' ? 12 : 26], label: p.kind, eyes: false });
      }
      if (this.hasWake && this.phase !== 'nightmare' && this.phase !== 'sunrise' && this.phase !== 'shake') {
        const [col, row] = WAKE.emptyFuton;
        drawFrame(ctx, a, 'player_wake', col, row, FUTON_X + (a.cell('player_wake')[0] * FLAT_SCALE) / 2, FLAT_GROUND, { scale: FLAT_SCALE });
      }
    }

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
    } else if (this.moving) { col = Math.floor(this.walked / (this.A.sideWalkStride * (this.leftFlat ? 1 : FLAT_SCALE / SIDE_SCALE))) % 4; row = SIDE.walkRow; }
    else if (this.phase === 'walk' || this.phase === 'dialogue') {
      [col, row] = SIDE.standing;
      if (Math.floor(this.time / this.A.idleBreath) % 2) rot = 0;
    }
    if (!a.has('player_side') && (this.phase === 'nightmare' || this.phase === 'sunrise')) rot = -Math.PI / 2;
    const breathe = !this.moving && this.phase === 'walk' && Math.floor(this.time / this.A.idleBreath) % 2 ? -3 : 0;
    const asleep = this.phase === 'nightmare' || this.phase === 'sunrise';
    if (this.hasWake && (asleep || this.phase === 'shake')) {
      // in bed: the wake-up sheet has the futon and the bunny together
      let f = WAKE.asleep[Math.floor(this.time * 1.2) % 2];
      if (this.phase === 'nightmare') f = Math.floor(this.t * 6) % 2 ? WAKE.asleep[0] : WAKE.asleep[1];
      if (this.phase === 'shake') {
        let acc = 0;
        for (const fr of WAKE.sequence) { f = fr; acc += fr[2]; if (this.t < acc) break; }
      }
      const jitter = this.phase === 'nightmare' && Math.floor(this.t * 12) % 2 ? PX : 0;   // tossing and turning
      drawFrame(ctx, a, 'player_wake', f[0], f[1], FUTON_X + (a.cell('player_wake')[0] * FLAT_SCALE) / 2 + jitter, FLAT_GROUND, { scale: FLAT_SCALE });
    } else {
      const ground = this.leftFlat ? GROUND : FLAT_GROUND;
      drawFrame(ctx, a, 'player_side', col, row, x, ground - (rot ? 30 : 0) - (asleep && a.has('intro_flat') ? 118 : 0) + breathe, { scale: this.leftFlat ? SIDE_SCALE : FLAT_SCALE, flip, rot, kind: 'player', ph: [16, 30], label: 'Bunny' });
    }
    if (this.leftFlat) this.drawDebris(ctx);
    if (!this.leftFlat) for (const p of this.props.filter((q) => q.front)) {
      const [col, row] = this.propFrame(p);
      drawFrame(ctx, a, 'flat_props', col, row, p.x, FLAT_GROUND + 18, { scale: p.scale, kind: 'prop', color: { mirror: PAL.sky, plant: PAL.moss, cat: PAL.ochre }[p.kind], ph: [14, p.kind === 'cat' ? 12 : 26], label: p.kind, eyes: false });
    }
    if (this.say) this.drawBubble(ctx, this.say, x, (this.leftFlat ? GROUND : FLAT_GROUND) - a.cell('player_side')[1] * (this.leftFlat ? SIDE_SCALE : FLAT_SCALE) + 30);
    ctx.restore();

    // screen-space overlays
    if (this.phase === 'nightmare') {
      ctx.fillStyle = 'rgba(27,26,46,0.85)'; ctx.fillRect(0, 0, W, H);
      text(ctx, this.T.nightmare, W / 2 + (Math.floor(this.t * 13) % 2) * 6, H / 2, { size: 34, color: PAL.red });
    } else if (this.phase === 'sunrise') {
      ctx.fillStyle = `rgba(27,26,46,${0.85 * (1 - this.t / this.cfg.sunriseDuration)})`; ctx.fillRect(0, 0, W, H);
      if (this.t < 1) text(ctx, this.T.wakeUp, W / 2, H / 2, { size: 40, color: PAL.cream });
    } else if (this.phase === 'walk') {
      text(ctx, this.leftFlat ? this.T.walkHint : this.T.flat.hint, W / 2, 40, { size: 20, color: PAL.cream });
      if (this.prompt) {
        windowBox(ctx, W / 2 - 200, H - 120, 400, 52);
        text(ctx, this.prompt, W / 2, H - 94, { size: 20 });
      }
    } else if (this.phase === 'door') {
      // fade out, show where we are going, fade in
      const D = this.cfg.doorFade, C = this.cfg.doorCard;
      const k = this.t < D ? this.t / D : this.t < D + C ? 1 : 1 - (this.t - D - C) / D;
      ctx.fillStyle = `rgba(27,26,46,${clamp(k, 0, 1)})`; ctx.fillRect(0, 0, W, H);
      if (this.t >= D * 0.8 && this.t < D + C + D * 0.3) {
        const street = this.doorTo === 'street';
        text(ctx, this.T.locations[street ? 'office' : 'metro'], W / 2, H / 2 - 10, { size: 44, color: PAL.gold });
        text(ctx, street ? this.T.streetCardSub : this.T.flat.cardSub, W / 2, H / 2 + 44, { size: 20, color: PAL.cream });
      }
    } else if (this.phase === 'dialogue') {
      dialogueBox(ctx, this.T.inspectorName, this.T.inspectorLines[this.line], this.T.continueHint, { top: true, shown: Math.floor(this.shown) });
    }
    text(ctx, this.T.skipHint, W - 20, H - 24, { size: 16, align: 'right', color: PAL.grey });
  }
}

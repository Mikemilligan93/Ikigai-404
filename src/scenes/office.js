import {
  W, H, COLORS, FONT, clamp, dist, rand, pick, fmt, sprite, text, bar, roundRect, wrapLeft,
  resolveCircleRect, circleRectOverlap,
} from '../engine.js';
import { OFFICE } from '../levels/office.js';

const MB_COLORS = { printer: '#7f8c8d', coffee: '#6e4b3a', fax: '#5d6d7e' };

export class OfficeScene {
  constructor(game) {
    this.g = game;
    this.C = game.config;
    this.T = game.texts.office;
    this.L = OFFICE;

    this.obstacles = [...this.L.walls, ...this.L.cubicles, this.L.ownDesk, this.L.coffeeMachine, ...this.L.props];

    const pc = this.C.player;
    this.player = {
      x: this.L.playerStart.x, y: this.L.playerStart.y, r: pc.radius,
      mental: pc.mentalMax, fx: 1, fy: 0, flip: false,
      meleeCd: 0, rangedCd: 0, invuln: 0, swing: 0, walkT: 0, effects: {},
    };

    this.state = 'explore'; // explore → email → wave → boss → cleared | burnout
    this.stateT = 0;
    this.waveTime = 0;
    this.enemies = [];
    this.shots = [];       // player paper balls
    this.hostile = [];     // boss fireballs
    this.floaters = [];
    this.banners = [];
    this.shake = 0;
    this.boss = null;
    this.defeated = 0;
    this.stats = { killScore: 0, damageTaken: 0 };
    this.coffeeCd = 0;

    this.minibosses = this.L.minibosses.map((m) => ({
      ...m, r: this.C.minibosses.radius, hp: this.C.minibosses.hp, maxHp: this.C.minibosses.hp,
      spawnT: rand(0, 1.5), alive: true, hitFlash: 0,
    }));
    this.npcs = this.L.friendlyNpcs.map((n) => ({ ...n, dwell: 0, rearm: 0 }));

    this.mochi = [];
    const spots = [...this.L.mochiSpots].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(this.C.recovery.mochi.count, spots.length); i++) this.mochi.push({ ...spots[i], respawn: 0 });

    // city lights for the window strip
    this.cityLights = Array.from({ length: 220 }, () => ({ x: rand(0, this.L.width), y: rand(12, 70), c: pick(['#f5d98b', '#d4a537', '#9ec9ff', '#efe3c2']) }));

    this.cam = { x: 0, y: 0 };
    this.banner(this.T.levelName, 3);
    this.banner(this.T.exploreHint, 5);
  }

  enter() { this.g.audio.playMusic('music_office'); }

  banner(msg, time = 2.5) { this.banners.push({ msg, t: time }); }
  float(x, y, msg, color = COLORS.paper) { this.floaters.push({ x, y, msg, color, t: 1.1 }); }

  // ---------------------------------------------------------------- update
  update(dt) {
    const inp = this.g.input;
    this.stateT += dt;
    for (const b of this.banners) b.t -= dt;
    this.banners = this.banners.filter((b) => b.t > 0);
    this.floaters.forEach((f) => { f.t -= dt; f.y -= 40 * dt; });
    this.floaters = this.floaters.filter((f) => f.t > 0);
    this.shake = Math.max(0, this.shake - dt * 2);

    if (this.state === 'email') {
      if (inp.wasPressed('e', ' ', 'Enter') && this.stateT > 0.3) this.startWave();
      return;
    }
    if (this.state === 'burnout') {
      if (this.stateT > 1.8) this.finish('burnout');
      return;
    }
    if (this.state !== 'explore') this.waveTime += dt;

    this.updatePlayer(dt);
    this.updateInteractions(dt);
    this.updateMinibosses(dt);
    this.updateBoss(dt);
    this.updateEnemies(dt);
    this.updateShots(dt);
    this.updateCamera();

    if (this.player.mental <= 0 && !this.C.debug.godMode) {
      this.player.mental = 0;
      this.state = 'burnout'; this.stateT = 0;
      this.g.audio.sfx('sfx_burnout');
    }
  }

  get speedMult() {
    const e = this.player.effects;
    let m = 1;
    if (e.speed) m *= this.C.friendlyNpcs.types.motivator.value;
    if (e.slow) m *= this.C.friendlyNpcs.types.complainer.value;
    return m;
  }
  get damageMult() { return this.player.effects.damage ? this.C.friendlyNpcs.types.mentor.value : 1; }

  updatePlayer(dt) {
    const p = this.player, pc = this.C.player, inp = this.g.input;
    for (const k of Object.keys(p.effects)) { p.effects[k] -= dt; if (p.effects[k] <= 0) delete p.effects[k]; }
    p.meleeCd -= dt; p.rangedCd -= dt; p.invuln -= dt; p.swing -= dt;

    const ax = inp.axis();
    if (ax.x || ax.y) {
      const len = Math.hypot(ax.x, ax.y);
      p.fx = ax.x / len; p.fy = ax.y / len;
      if (ax.x) p.flip = ax.x < 0;
      const sp = pc.speed * this.speedMult;
      p.x += p.fx * sp * dt; p.y += p.fy * sp * dt;
      p.walkT += dt;
    } else p.walkT = 0;
    for (const o of this.obstacles) resolveCircleRect(p, o);
    for (const m of this.minibosses) if (m.alive) pushOutCircle(p, m);

    const blocked = !!p.effects.weaponBlock;
    if (inp.wasPressed('j', ' ') && p.meleeCd <= 0) {
      if (blocked) this.float(p.x, p.y - 40, this.T.weaponBlocked, COLORS.vermilion);
      else this.melee();
    }
    if (inp.wasPressed('k') && p.rangedCd <= 0) {
      if (blocked) this.float(p.x, p.y - 40, this.T.weaponBlocked, COLORS.vermilion);
      else this.throwBall();
    }
  }

  melee() {
    const p = this.player, mc = this.C.player.melee;
    p.meleeCd = mc.cooldown; p.swing = 0.15;
    this.g.audio.sfx('sfx_melee');
    const half = (mc.arcDegrees * Math.PI) / 360;
    const face = Math.atan2(p.fy, p.fx);
    const inArc = (t) => {
      const d = dist(p.x, p.y, t.x, t.y);
      if (d > mc.range + t.r) return false;
      let diff = Math.atan2(t.y - p.y, t.x - p.x) - face;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      return Math.abs(diff) <= half || d < t.r + p.r;
    };
    const dmg = mc.damage * this.damageMult;
    for (const e of this.enemies) if (inArc(e)) { this.hurtEnemy(e, dmg); e.kx = p.fx * 380; e.ky = p.fy * 380; }
    for (const m of this.minibosses) if (m.alive && inArc(m)) this.hurtMiniboss(m, dmg);
    if (this.boss && this.boss.alive && this.boss.active && inArc(this.boss)) this.hurtBoss(dmg);
  }

  throwBall() {
    const p = this.player, rc = this.C.player.ranged;
    p.rangedCd = rc.cooldown;
    this.g.audio.sfx('sfx_throw');
    this.shots.push({ x: p.x + p.fx * p.r, y: p.y + p.fy * p.r, vx: p.fx * rc.speed, vy: p.fy * rc.speed, r: rc.radius, t: rc.lifetime });
  }

  hurtPlayer(amount) {
    const p = this.player;
    if (p.invuln > 0 || this.state === 'burnout') return;
    if (!this.C.debug.godMode) p.mental -= amount;
    p.invuln = this.C.player.invulnerableAfterHit;
    this.stats.damageTaken += amount;
    this.shake = 0.5;
    this.g.audio.sfx('sfx_hurt');
    this.float(p.x, p.y - 30, `-${Math.round(amount)}`, COLORS.vermilion);
  }

  hurtEnemy(e, dmg) {
    e.hp -= dmg; e.hitFlash = 0.12;
    this.g.audio.sfx('sfx_hit');
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      this.stats.killScore += this.C.enemies[e.type].score;
      this.float(e.x, e.y, `+${this.C.enemies[e.type].score}`, COLORS.gold);
    }
  }

  hurtMiniboss(m, dmg) {
    m.hp -= dmg; m.hitFlash = 0.12;
    this.g.audio.sfx('sfx_hit');
    if (m.hp <= 0 && m.alive) {
      m.alive = false;
      this.defeated++;
      this.stats.killScore += this.C.minibosses.score;
      this.shake = 1;
      this.g.audio.sfx('sfx_miniboss_down');
      this.float(m.x, m.y - 50, `+${this.C.minibosses.score}`, COLORS.gold);
      const left = this.minibosses.filter((x) => x.alive).length;
      if (left > 0) this.banner(fmt(this.T.minibossDown, { name: this.T.minibossNames[m.id] }), 3);
      else this.startBoss();
    }
  }

  hurtBoss(dmg) {
    const b = this.boss;
    b.hp -= dmg; b.hitFlash = 0.12;
    this.g.audio.sfx('sfx_hit');
    if (b.hp <= 0 && b.alive) {
      b.alive = false;
      this.stats.killScore += this.C.boss.score;
      this.shake = 1.5;
      this.state = 'cleared'; this.stateT = 0;
      this.enemies.forEach((e) => { e.dead = true; });
      this.hostile = [];
      this.banner(this.T.bossDown, 4);
      this.g.audio.playMusic('music_office');
    }
  }

  updateInteractions(dt) {
    const p = this.player, inp = this.g.input, rc = this.C.recovery;
    this.coffeeCd -= dt;
    this.prompt = null;

    const near = (r, pad) => circleRectOverlap(p.x, p.y, p.r + pad, r);
    if (this.state === 'explore' && near(this.L.ownDesk, 50)) {
      this.prompt = this.T.deskPrompt;
      if (inp.wasPressed('e')) { this.state = 'email'; this.stateT = 0; this.g.audio.sfx('sfx_email'); }
    }
    if (near(this.L.coffeeMachine, 50)) {
      this.prompt = this.coffeeCd > 0 ? this.T.coffeeCooldown : this.T.coffeePrompt;
      if (inp.wasPressed('e') && this.coffeeCd <= 0) {
        this.restore(rc.coffeeMachine.restore);
        this.coffeeCd = rc.coffeeMachine.cooldown;
      }
    }
    if (this.state === 'cleared' && near(this.L.lift, 70)) {
      this.prompt = this.T.liftPrompt;
      if (inp.wasPressed('e')) this.finish('win');
    }

    // mochi
    for (const m of this.mochi) {
      if (m.respawn > 0) {
        m.respawn -= dt;
        if (m.respawn <= 0) Object.assign(m, pick(this.L.mochiSpots));
        continue;
      }
      if (dist(p.x, p.y, m.x, m.y) < p.r + 16) {
        this.restore(rc.mochi.restore, this.T.mochiPickup);
        m.respawn = rc.mochi.respawnTime;
      }
    }

    // friendly NPC auras: stay inside for dwellTime to trigger the effect
    const fc = this.C.friendlyNpcs;
    for (const n of this.npcs) {
      n.rearm -= dt;
      const inside = dist(p.x, p.y, n.x, n.y) < fc.auraRadius;
      if (inside && n.rearm <= 0) {
        n.dwell += dt;
        if (n.dwell >= fc.dwellTime) {
          const def = fc.types[n.type];
          p.effects[def.effect] = def.duration;
          n.dwell = 0; n.rearm = fc.rearmTime;
          const good = def.effect === 'speed' || def.effect === 'damage';
          this.float(n.x, n.y - 50, this.T.effects[def.effect], good ? COLORS.gold : COLORS.vermilion);
        }
      } else n.dwell = Math.max(0, n.dwell - dt * 2);
    }
  }

  restore(amount, label) {
    const p = this.player;
    p.mental = Math.min(this.C.player.mentalMax, p.mental + amount);
    this.g.audio.sfx('sfx_pickup');
    this.float(p.x, p.y - 40, label || `+${amount}`, '#7ddc9a');
  }

  startWave() {
    this.state = 'wave'; this.stateT = 0;
    this.banner(this.T.waveStart, 3);
  }

  startBoss() {
    this.state = 'boss'; this.stateT = 0;
    const bc = this.C.boss, L = this.L.lift;
    this.boss = {
      x: L.x - 40, y: L.y + L.h / 2, r: bc.radius, hp: bc.hp, maxHp: bc.hp, alive: true, active: false,
      fireT: bc.fireRing.interval, chargeT: bc.charge.interval, summonT: bc.summon.interval,
      mode: 'enter', modeT: 0, vx: 0, vy: 0, hitFlash: 0, flip: true,
    };
    this.banner(this.T.bossIncoming, 4);
    this.g.audio.playMusic('music_boss');
    this.g.audio.sfx('sfx_boss_roar');
    this.shake = 1;
  }

  spawnMinion(x, y, strongChance) {
    if (this.enemies.length >= this.C.maxEnemiesAlive) return;
    const type = Math.random() < strongChance ? 'strong' : 'weak';
    const ec = this.C.enemies[type];
    const e = { type, x, y, r: ec.radius, hp: ec.hp, kx: 0, ky: 0, hitFlash: 0, wob: rand(0, 6) };
    for (const o of this.obstacles) resolveCircleRect(e, o);
    this.enemies.push(e);
  }

  updateMinibosses(dt) {
    if (this.state !== 'wave') return;
    const mc = this.C.minibosses, esc = mc.escalationPerDefeat;
    const interval = mc.spawnInterval * Math.pow(esc.spawnIntervalMultiplier, this.defeated);
    const perSpawn = mc.minionsPerSpawn + esc.minionsPerSpawnAdd * this.defeated;
    const strong = Math.min(1, mc.strongChance + esc.strongChanceAdd * this.defeated);
    const p = this.player;
    for (const m of this.minibosses) {
      if (!m.alive) continue;
      m.hitFlash -= dt;
      if (dist(p.x, p.y, m.x, m.y) > mc.spawnActivationDistance) continue;
      m.spawnT -= dt;
      if (m.spawnT <= 0) {
        m.spawnT = interval;
        for (let i = 0; i < perSpawn; i++) {
          const a = rand(0, Math.PI * 2);
          this.spawnMinion(m.x + Math.cos(a) * (m.r + 24), m.y + Math.sin(a) * (m.r + 24), strong);
        }
      }
      if (dist(p.x, p.y, m.x, m.y) < p.r + m.r + 2) this.hurtPlayer(mc.contactDamage);
    }
  }

  updateBoss(dt) {
    const b = this.boss;
    if (!b || !b.alive) return;
    const bc = this.C.boss, p = this.player;
    b.hitFlash -= dt; b.modeT += dt;
    const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy) || 1;
    b.flip = dx < 0;

    if (b.mode === 'enter') {
      // walk out of the lift towards the arena
      const a = this.L.arenaCentre, ex = a.x - b.x, ey = a.y - b.y, ed = Math.hypot(ex, ey);
      if (ed < 20 || b.modeT > 6) { b.mode = 'chase'; b.modeT = 0; b.active = true; }
      else { b.x += (ex / ed) * bc.speed * 2 * dt; b.y += (ey / ed) * bc.speed * 2 * dt; }
      return;
    }

    b.fireT -= dt; b.chargeT -= dt; b.summonT -= dt;
    if (b.mode === 'chase') {
      b.x += (dx / d) * bc.speed * dt; b.y += (dy / d) * bc.speed * dt;
      if (b.fireT <= 0) {
        b.fireT = bc.fireRing.interval;
        const n = bc.fireRing.projectiles, off = rand(0, Math.PI);
        for (let i = 0; i < n; i++) {
          const a = off + (i / n) * Math.PI * 2;
          this.hostile.push({ x: b.x, y: b.y, vx: Math.cos(a) * bc.fireRing.speed, vy: Math.sin(a) * bc.fireRing.speed, r: 12, t: 4 });
        }
        this.g.audio.sfx('sfx_boss_roar');
      }
      if (b.summonT <= 0) {
        b.summonT = bc.summon.interval;
        for (let i = 0; i < bc.summon.count; i++) {
          const a = rand(0, Math.PI * 2);
          this.spawnMinion(b.x + Math.cos(a) * (b.r + 30), b.y + Math.sin(a) * (b.r + 30), bc.summon.strongChance);
        }
      }
      if (b.chargeT <= 0) { b.mode = 'windup'; b.modeT = 0; }
    } else if (b.mode === 'windup') {
      if (b.modeT >= bc.charge.windup) {
        b.mode = 'charge'; b.modeT = 0;
        b.vx = (dx / d) * bc.charge.speed; b.vy = (dy / d) * bc.charge.speed;
      }
    } else if (b.mode === 'charge') {
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.modeT >= bc.charge.duration) { b.mode = 'chase'; b.modeT = 0; b.chargeT = bc.charge.interval; }
    }
    let hitWall = false;
    for (const o of this.obstacles) if (resolveCircleRect(b, o)) hitWall = true;
    if (hitWall && b.mode === 'charge') { b.mode = 'chase'; b.chargeT = bc.charge.interval; this.shake = 0.6; }
    if (d < p.r + b.r) {
      this.hurtPlayer(bc.contactDamage);
      p.x += (dx / d) * 30; p.y += (dy / d) * 30;
    }
  }

  updateEnemies(dt) {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const ec = this.C.enemies[e.type];
      e.hitFlash -= dt; e.wob += dt * 8;
      const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
      let vx = (dx / d) * ec.speed, vy = (dy / d) * ec.speed;
      // separation so they don't stack into one blob
      for (const o of this.enemies) {
        if (o === e || o.dead) continue;
        const sx = e.x - o.x, sy = e.y - o.y, sd = Math.hypot(sx, sy);
        if (sd > 0 && sd < e.r + o.r) { vx += (sx / sd) * 60; vy += (sy / sd) * 60; }
      }
      const bx = e.x, by = e.y;
      e.x += (vx + e.kx) * dt; e.y += (vy + e.ky) * dt;
      e.kx *= 0.85; e.ky *= 0.85;
      let blocked = false;
      for (const o of this.obstacles) if (resolveCircleRect(e, o)) blocked = true;
      // crude unstick: slide sideways around corners
      if (blocked && Math.hypot(e.x - bx, e.y - by) < ec.speed * dt * 0.3) {
        e.x += (-dy / d) * ec.speed * dt; e.y += (dx / d) * ec.speed * dt;
        for (const o of this.obstacles) resolveCircleRect(e, o);
      }
      if (d < p.r + e.r) this.hurtPlayer(ec.contactDamage);
    }
    this.enemies = this.enemies.filter((e) => !e.dead);
  }

  updateShots(dt) {
    const pr = this.C.player.ranged;
    for (const s of this.shots) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt;
      if (this.obstacles.some((o) => circleRectOverlap(s.x, s.y, s.r, o))) { s.t = 0; continue; }
      const dmg = pr.damage * this.damageMult;
      for (const e of this.enemies) if (!e.dead && dist(s.x, s.y, e.x, e.y) < s.r + e.r) { this.hurtEnemy(e, dmg); s.t = 0; break; }
      if (s.t <= 0) continue;
      for (const m of this.minibosses) if (m.alive && dist(s.x, s.y, m.x, m.y) < s.r + m.r) { this.hurtMiniboss(m, dmg); s.t = 0; break; }
      if (s.t > 0 && this.boss?.alive && this.boss.active && dist(s.x, s.y, this.boss.x, this.boss.y) < s.r + this.boss.r) { this.hurtBoss(dmg); s.t = 0; }
    }
    this.shots = this.shots.filter((s) => s.t > 0);

    const p = this.player;
    for (const h of this.hostile) {
      h.x += h.vx * dt; h.y += h.vy * dt; h.t -= dt;
      if (this.L.walls.some((o) => circleRectOverlap(h.x, h.y, h.r, o))) h.t = 0;
      if (h.t > 0 && dist(h.x, h.y, p.x, p.y) < h.r + p.r) { this.hurtPlayer(this.C.boss.fireRing.damage); h.t = 0; }
    }
    this.hostile = this.hostile.filter((h) => h.t > 0);
  }

  updateCamera() {
    const p = this.player;
    this.cam.x = clamp(p.x - W / 2, 0, this.L.width - W);
    this.cam.y = clamp(p.y - H / 2, 0, this.L.height - H);
  }

  get score() {
    return Math.max(0, Math.round(this.stats.killScore - this.stats.damageTaken * this.C.scoring.pointsLostPerMentalDamage));
  }

  finish(outcome) {
    const sc = this.C.scoring;
    const timeBonus = outcome === 'win' ? Math.max(0, Math.round(sc.timeBonusBase - this.waveTime * sc.timeBonusLostPerSecond)) : 0;
    const base = outcome === 'burnout' && !sc.burnoutKeepsScore ? 0 : this.score;
    const result = {
      outcome,
      seconds: this.waveTime,
      score: base + timeBonus,
      breakdown: {
        kills: this.stats.killScore,
        damage: -Math.round(this.stats.damageTaken * sc.pointsLostPerMentalDamage),
        timeBonus,
      },
    };
    this.g.session.result = result;
    if (outcome === 'win') this.g.go(this.g.scenes.lift());
    else this.g.go(this.g.scenes.end(result));
  }

  // ---------------------------------------------------------------- draw
  draw(ctx) {
    const a = this.g.assets;
    const sx = this.shake > 0 ? rand(-1, 1) * this.shake * 8 : 0;
    const sy = this.shake > 0 ? rand(-1, 1) * this.shake * 8 : 0;
    ctx.save();
    ctx.translate(-Math.round(this.cam.x) + sx, -Math.round(this.cam.y) + sy);

    this.drawFloor(ctx);
    this.drawStatic(ctx);

    // auras
    const fc = this.C.friendlyNpcs;
    for (const n of this.npcs) {
      const def = fc.types[n.type];
      const good = def.effect === 'speed' || def.effect === 'damage';
      ctx.fillStyle = good ? 'rgba(212,165,55,0.10)' : 'rgba(192,57,43,0.10)';
      ctx.beginPath(); ctx.arc(n.x, n.y, fc.auraRadius, 0, Math.PI * 2); ctx.fill();
      if (n.dwell > 0) {
        ctx.strokeStyle = good ? COLORS.gold : COLORS.vermilion; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(n.x, n.y, 42, -Math.PI / 2, -Math.PI / 2 + (n.dwell / fc.dwellTime) * Math.PI * 2); ctx.stroke();
      }
    }

    // mochi
    for (const m of this.mochi) if (m.respawn <= 0) sprite(ctx, a, 'mochi', m.x, m.y + Math.sin(this.stateT * 3 + m.x) * 3, 32, 32, { kind: 'pickup', label: 'mochi' });

    // y-sorted characters
    const drawables = [];
    for (const n of this.npcs) drawables.push({ y: n.y, d: () => sprite(ctx, a, 'npc_' + n.type, n.x, n.y, 60, 60, { kind: 'npc', label: n.type }) });
    for (const m of this.minibosses) if (m.alive) drawables.push({ y: m.y, d: () => this.drawMiniboss(ctx, m) });
    for (const e of this.enemies) drawables.push({ y: e.y, d: () => this.drawEnemy(ctx, e) });
    if (this.boss?.alive) drawables.push({ y: this.boss.y, d: () => this.drawBoss(ctx) });
    drawables.push({ y: this.player.y, d: () => this.drawPlayer(ctx) });
    // furniture with real art: drawn standing on the bottom edge of its collision box, sorted with characters
    const L = this.L;
    const standing = [
      ...L.cubicles.map((r) => ({ key: 'cubicle_block', r })),
      { key: 'own_desk', r: L.ownDesk },
      { key: 'coffee_machine', r: L.coffeeMachine, alpha: this.coffeeCd > 0 ? 0.7 : 1 },
      ...L.props.map((r) => ({ key: r.key, r })),
    ];
    for (const f of standing) if (a.has(f.key)) drawables.push({ y: f.r.y + f.r.h, d: () => this.drawStanding(ctx, f.key, f.r, f.alpha) });
    drawables.sort((p, q) => p.y - q.y).forEach((o) => o.d());

    // your-desk marker on top of everything
    if (this.state === 'explore') {
      const d = L.ownDesk;
      ctx.fillStyle = COLORS.vermilion;
      ctx.beginPath(); ctx.arc(d.x + d.w - 10, d.y - 10, 12 + Math.sin(this.stateT * 6) * 2, 0, Math.PI * 2); ctx.fill();
      text(ctx, '!', d.x + d.w - 10, d.y - 9, { size: 18, bold: true, shadow: false });
    }

    for (const s of this.shots) sprite(ctx, a, 'paper_ball', s.x, s.y, 20, 20, { kind: 'fx', color: COLORS.paper });
    for (const h of this.hostile) sprite(ctx, a, 'fireball', h.x, h.y, 24, 24, { kind: 'fx', color: '#e67e22', rot: this.stateT * 10 });

    for (const f of this.floaters) {
      ctx.globalAlpha = clamp(f.t, 0, 1);
      text(ctx, f.msg, f.x, f.y, { size: 20, color: f.color, bold: true });
      ctx.globalAlpha = 1;
    }

    if (this.C.debug.showHitboxes) this.drawDebug(ctx);
    ctx.restore();

    this.drawHud(ctx);
  }

  drawFloor(ctx) {
    const a = this.g.assets, L = this.L;
    if (a.has('office_floor')) {
      const s = a.size('office_floor', 256, 256)[0], x0 = Math.floor(this.cam.x / s) * s, y0 = Math.floor(this.cam.y / s) * s;
      for (let x = x0; x < this.cam.x + W + s; x += s) for (let y = y0; y < this.cam.y + H + s; y += s) ctx.drawImage(a.images.office_floor, x, y, s, s);
      const dim = this.C.visuals?.floorDim ?? 0;
      if (dim > 0) { ctx.fillStyle = `rgba(13,15,31,${dim})`; ctx.fillRect(this.cam.x - 20, this.cam.y - 20, W + 40, H + 40); }
    } else {
      ctx.fillStyle = '#4f5b4a'; ctx.fillRect(0, 0, L.width, L.height);
      ctx.fillStyle = '#566350';
      const s = 64, x0 = Math.floor(this.cam.x / s) * s, y0 = Math.floor(this.cam.y / s) * s;
      for (let x = x0; x < this.cam.x + W + s; x += s) for (let y = y0; y < this.cam.y + H + s; y += s) if (((x + y) / s) % 2 === 0) ctx.fillRect(x, y, s, s);
      // kitchen tiles
      ctx.fillStyle = '#cfc6ad'; ctx.fillRect(40, 80, 600, 440);
      ctx.strokeStyle = '#b5ab90'; ctx.lineWidth = 1;
      for (let x = 40; x < 640; x += 40) { ctx.beginPath(); ctx.moveTo(x, 80); ctx.lineTo(x, 520); ctx.stroke(); }
      for (let y = 80; y < 520; y += 40) { ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(640, y); ctx.stroke(); }
      // meeting area rug
      ctx.fillStyle = 'rgba(192,57,43,0.25)'; ctx.fillRect(1320, 640, 880, 550);
      ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 4; ctx.strokeRect(1340, 660, 840, 510);
    }
  }

  drawStatic(ctx) {
    const a = this.g.assets, L = this.L;
    // walls
    ctx.fillStyle = '#2b2522';
    for (const w of L.walls) ctx.fillRect(w.x, w.y, w.w, w.h);
    // windows with city lights along the top wall
    if (a.has('window_city')) for (let x = 40; x < L.width - 40; x += 512) ctx.drawImage(a.images.window_city, x, 10, 512, 60);
    else {
      ctx.fillStyle = '#0f1430'; ctx.fillRect(40, 10, L.width - 80, 60);
      for (const c of this.cityLights) { ctx.fillStyle = c.c; ctx.fillRect(c.x, c.y, 3, 3); }
      ctx.fillStyle = '#2b2522'; for (let x = 40; x < L.width; x += 200) ctx.fillRect(x, 10, 8, 60);
    }
    // cubicles
    for (const c of L.cubicles) {
      if (a.has('cubicle_block')) continue; // real art is drawn depth-sorted in draw()
      ctx.fillStyle = '#8d8a80'; ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = '#b8b3a3';
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
        const x = c.x + 8 + i * 118, y = c.y + 8 + j * 80;
        ctx.fillRect(x, y, 108, 72);
        ctx.fillStyle = '#d8d2bd'; ctx.fillRect(x + 30, y + (j ? 40 : 6), 48, 26); // desk
        ctx.fillStyle = '#3a3a3a'; ctx.fillRect(x + 42, y + (j ? 44 : 8), 24, 18);  // CRT
        ctx.fillStyle = '#6fd18a'; ctx.fillRect(x + 46, y + (j ? 48 : 12), 16, 10);
        ctx.fillStyle = '#b8b3a3';
      }
    }
    // own desk
    const d = L.ownDesk;
    if (!a.has('own_desk')) sprite(ctx, a, 'own_desk', d.x + d.w / 2, d.y + d.h / 2, d.w, d.h, { kind: 'prop', color: '#c9a66b', label: 'Your desk' });
    // coffee machine
    const cm = L.coffeeMachine;
    if (!a.has('coffee_machine')) sprite(ctx, a, 'coffee_machine', cm.x + cm.w / 2, cm.y + cm.h / 2, cm.w, cm.h, { kind: 'prop', color: this.coffeeCd > 0 ? '#7d6b5d' : '#a0522d', label: 'Coffee' });
    // props
    for (const p of L.props) if (!a.has(p.key)) sprite(ctx, a, p.key, p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, { kind: 'prop', label: p.label });
    // lift
    const lf = L.lift;
    const open = this.state === 'cleared';
    sprite(ctx, a, 'lift_door', lf.x + lf.w / 2, lf.y + lf.h / 2, lf.w, lf.h, { kind: 'prop', color: open ? COLORS.gold : '#7f8c8d', label: 'LIFT', alpha: open ? 0.6 + Math.sin(this.stateT * 4) * 0.4 : 1 });
  }

  // Draw furniture art full-width, bottom-aligned to its collision rectangle (taller art extends upwards = depth).
  drawStanding(ctx, key, r, alpha = 1) {
    const img = this.g.assets.get(key);
    const w = r.w * 1.04, h = (w * img.height) / img.width;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.drawImage(img, r.x + r.w / 2 - w / 2, r.y + r.h + 4 - h, w, h);
    ctx.restore();
  }

  drawPlayer(ctx) {
    const p = this.player, a = this.g.assets, pc = this.C.player;
    const frac = p.mental / pc.mentalMax;
    const posture = frac > pc.postureThresholds.tired ? 'ok' : frac > pc.postureThresholds.burntOut ? 'tired' : 'burnt';
    const bob = p.walkT > 0 ? Math.sin(p.walkT * 14) * 3 : 0;
    const hasArt = !!a.images['player_' + posture];
    const slump = hasArt ? [1, 0] : { ok: [1, 0], tired: [0.92, 0.08], burnt: [0.82, 0.18] }[posture];
    const colors = { ok: '#e8e2d0', tired: '#c9bfa3', burnt: '#8f8a80' };
    let rot = (p.flip ? -1 : 1) * slump[1];
    let alpha = p.invuln > 0 && Math.floor(p.invuln * 20) % 2 ? 0.4 : 1;
    if (this.state === 'burnout') { rot = Math.min(1.4, this.stateT * 2) * (p.flip ? -1 : 1); alpha = 1; }
    const [pw, ph] = a.size('player_ok', 64, 64);
    sprite(ctx, a, 'player_' + posture, p.x, p.y + bob, pw, ph * slump[0], { kind: 'player', color: colors[posture], label: 'Bunny', flip: p.flip, rot, alpha });

    // facing indicator + swing
    const fx = p.x + p.fx * (p.r + 14), fy = p.y + p.fy * (p.r + 14);
    ctx.fillStyle = COLORS.ink; ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2); ctx.fill();
    if (p.swing > 0) {
      const mc = this.C.player.melee, half = (mc.arcDegrees * Math.PI) / 360, face = Math.atan2(p.fy, p.fx);
      if (a.has('briefcase_swing')) sprite(ctx, a, 'briefcase_swing', p.x + p.fx * 45, p.y + p.fy * 45, 80, 80, { rot: face });
      ctx.strokeStyle = `rgba(212,165,55,${p.swing / 0.15})`; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(p.x, p.y, mc.range - 10, face - half, face + half); ctx.stroke();
    }
  }

  drawEnemy(ctx, e) {
    const size = this.g.assets.has('enemy_' + e.type) ? this.g.assets.size('enemy_' + e.type, 36, 36)[0] : e.r * 2.5;
    sprite(ctx, this.g.assets, 'enemy_' + e.type, e.x, e.y + Math.sin(e.wob) * 2, size, size, {
      kind: 'enemy', color: e.hitFlash > 0 ? '#fff' : e.type === 'weak' ? '#e74c3c' : '#922b21',
      label: e.type === 'weak' ? '@' : 'URGENT', rot: Math.sin(e.wob) * 0.1, flash: e.hitFlash > 0,
    });
  }

  drawMiniboss(ctx, m) {
    const s = 110;
    sprite(ctx, this.g.assets, 'miniboss_' + m.id, m.x, m.y, s, s, {
      kind: 'miniboss', color: m.hitFlash > 0 ? '#fff' : MB_COLORS[m.id], label: this.T.minibossNames[m.id], flash: m.hitFlash > 0,
      sx: 1 + Math.sin(this.stateT * 5) * (this.state === 'wave' ? 0.04 : 0),
    });
    bar(ctx, m.x - 50, m.y - 72, 100, 8, m.hp / m.maxHp, COLORS.vermilion);
  }

  drawBoss(ctx) {
    const b = this.boss, s = 150;
    const wind = b.mode === 'windup' && Math.floor(b.modeT * 12) % 2;
    sprite(ctx, this.g.assets, 'boss_ceo', b.x, b.y, s, s, {
      kind: 'boss', color: b.hitFlash > 0 || wind ? '#fff' : '#b03a2e', label: 'CEO DRAGON', flip: b.flip, flash: b.hitFlash > 0 || wind,
      sx: b.mode === 'charge' ? 1.15 : 1, sy: b.mode === 'charge' ? 0.9 : 1,
    });
  }

  drawDebug(ctx) {
    ctx.strokeStyle = 'cyan'; ctx.lineWidth = 1;
    for (const o of this.obstacles) ctx.strokeRect(o.x, o.y, o.w, o.h);
    const circ = (o) => { ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.stroke(); };
    circ(this.player); this.enemies.forEach(circ); this.minibosses.filter((m) => m.alive).forEach(circ);
    if (this.boss?.alive) circ(this.boss);
  }

  drawHud(ctx) {
    const p = this.player, pc = this.C.player, T = this.T;
    const frac = p.mental / pc.mentalMax;
    const posture = frac > pc.postureThresholds.tired ? 'ok' : frac > pc.postureThresholds.burntOut ? 'tired' : 'burntOut';
    // mental health
    ctx.fillStyle = 'rgba(13,15,31,0.7)'; roundRect(ctx, 16, 16, 340, 74, 10); ctx.fill();
    text(ctx, `${T.hud.mental} — ${T.posture[posture]}`, 30, 36, { size: 18, align: 'left' });
    bar(ctx, 30, 52, 310, 22, frac, frac > 0.66 ? '#7ddc9a' : frac > 0.33 ? COLORS.gold : COLORS.vermilion);
    // effects
    let ex = 30;
    for (const [k, v] of Object.entries(p.effects)) {
      const good = k === 'speed' || k === 'damage';
      text(ctx, `${T.effects[k]} ${Math.ceil(v)}s`, ex, 108, { size: 16, align: 'left', color: good ? COLORS.gold : COLORS.vermilion });
      ex += 150;
    }
    // score / time
    ctx.fillStyle = 'rgba(13,15,31,0.7)'; roundRect(ctx, W - 236, 16, 220, 74, 10); ctx.fill();
    text(ctx, `${T.hud.score}: ${this.score}`, W - 30, 38, { size: 22, align: 'right', color: COLORS.gold, bold: true });
    const t = Math.floor(this.waveTime);
    text(ctx, `${T.hud.time}: ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, W - 30, 68, { size: 18, align: 'right' });
    // objective
    if (this.state === 'wave') text(ctx, fmt(T.minibossesLeft, { n: this.minibosses.filter((m) => m.alive).length }), W / 2, H - 24, { size: 20, color: COLORS.paper });
    if (this.boss?.alive && this.boss.active) {
      text(ctx, T.bossName, W / 2, 26, { size: 20, color: COLORS.gold, bold: true });
      bar(ctx, W / 2 - 250, 42, 500, 16, this.boss.hp / this.boss.maxHp, COLORS.vermilion);
    }
    // banners
    this.banners.slice(0, 2).forEach((b, i) => {
      ctx.globalAlpha = clamp(b.t, 0, 1);
      text(ctx, b.msg, W / 2, 130 + i * 40, { size: i === 0 ? 30 : 22, color: i === 0 ? COLORS.gold : COLORS.paper, bold: i === 0 });
      ctx.globalAlpha = 1;
    });
    // interaction prompt
    if (this.prompt && this.state !== 'email') {
      ctx.fillStyle = 'rgba(13,15,31,0.8)'; roundRect(ctx, W / 2 - 180, H - 110, 360, 44, 10); ctx.fill();
      text(ctx, this.prompt, W / 2, H - 88, { size: 20, color: COLORS.paper });
    }
    if (this.state === 'email') this.drawEmail(ctx);
    if (this.state === 'burnout') {
      ctx.fillStyle = `rgba(13,15,31,${Math.min(0.7, this.stateT * 0.5)})`; ctx.fillRect(0, 0, W, H);
    }
  }

  drawEmail(ctx) {
    const E = this.T.email, x = W / 2 - 330, y = 170, w = 660, h = 320;
    ctx.fillStyle = 'rgba(13,15,31,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#d9d4c5'; ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 4;
    roundRect(ctx, x, y, w, h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#000080'; ctx.fillRect(x + 4, y + 4, w - 8, 34);
    text(ctx, 'Inbox (9,999+)', x + 16, y + 21, { size: 18, align: 'left', bold: true, shadow: false });
    text(ctx, E.from, x + 24, y + 70, { size: 20, align: 'left', color: COLORS.ink, shadow: false });
    text(ctx, E.subject, x + 24, y + 100, { size: 20, align: 'left', color: COLORS.vermilion, bold: true, shadow: false });
    ctx.fillStyle = COLORS.ink; ctx.font = `22px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    wrapLeft(ctx, E.body, x + 24, y + 150, w - 48, 30);
    text(ctx, E.hint, x + w - 20, y + h - 24, { size: 16, align: 'right', color: COLORS.grey, shadow: false });
  }
}

function pushOutCircle(c, o) {
  const dx = c.x - o.x, dy = c.y - o.y, d = Math.hypot(dx, dy) || 1, min = c.r + o.r;
  if (d < min) { c.x = o.x + (dx / d) * min; c.y = o.y + (dy / d) * min; }
}

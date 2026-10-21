import {
  W, H, PX, PAL, COLORS, clamp, dist, rand, pick, fmt, text, bar, windowBox, drawFrame, fontOf, TEXT,
  circleRectOverlap, wrapLeft,
} from '../engine.js';
import { OfficeScene } from './office.js';
import { CANTEEN } from '../levels/canteen.js';
import {
  CANTEEN_FLOOR, CANTEEN_WALL, CANTEEN_DECOR, EATERS, PLAYER_EAT, RAMEN, ROKU, ROKU_HEAD, ROKU_NECK, OBACHAN, INTERN,
  TRAY, MEALS, FOOD, FXC, MINION, STAND, walkFrame, loop, rowOf, dirOf,
} from '../sprites.js';

// Level 2 — the canteen. Lunch break 12:00 → 13:00 on a compressed clock.
//   order   → buy a meal ticket (the meal is your buff for the level)
//   collect → the obachan hands you the tray (talk to her first for a bonus side dish)
//   carry   → the Ramen Bowl wakes up; carry the tray (slow, hands full) or set it down on a table and fight
//   eat     → sit on a free seat and hold E to eat, dish by dish
//   boss    → halfway through lunch Rokurokubi cranes his neck over the table ("Quick sync?")
//   back    → beat him, then head for the door (finish the tray first for more points) → Level 3 coming soon
// Tuning: config.json → canteen. Texts: texts.json → canteen. Layout: src/levels/canteen.js.
// Reuses the office scene's map, colleagues, enemies-chasing, drawing and HUD helpers.

const LEVEL = {
  ...CANTEEN, floorTypes: CANTEEN_FLOOR, wallKeys: CANTEEN_WALL, decorKeys: CANTEEN_DECOR,
};

export class CanteenScene extends OfficeScene {
  constructor(game, opts = {}) {
    super(game, { level: LEVEL, texts: { ...game.texts.office, ...game.texts.canteen } });
    const C = this.C.canteen, t = this.tile, L = this.L;
    this.CC = C;
    this.state = 'play';
    this.phase = 'order';           // order → collect → carry → eat → boss → back (head for the door) → done
    this.carry = game.session.result?.score ?? 0;   // the Level 1 score comes along
    this.stats = { ...this.stats, morning: 0, dishes: 0, spilled: 0, lunchOnTime: false, seatTag: null, company: false, bowl: false };
    this.clockT = 0;
    this.late = false;
    this.meal = null;               // 'curry' | 'miso' | 'onigiri' | 'ramen'
    this.menu = null;               // ticket machine screen: { sel, t }
    this.greeted = false;
    this.tray = null;               // { dishes: [{ icon: [col,row], eaten }], where: 'hands' | 'table' | 'seat', x, y }
    this.seat = null;               // the free seat the bunny picked (from levels/canteen.js → playerSeats)
    this.seated = false;
    this.eatP = 0;                  // progress on the current dish, 0..1
    this.roku = null;
    this.bowl = null;               // the defeated Ramen Bowl = a healing bowl of ramen on the floor
    this.steamT = 0;
    this.seats.forEach((s) => { s.act = -1; });
    this.freeSeats = L.playerSeats.map((s) => ({ ...s, px: (s.x + 0.5) * t, py: (s.y + 0.5) * t }));
    this.obachan = { x: L.obachan.x * t, y: L.obachan.y * t, say: null, trayT: 0 };
    this.intern = { x: L.intern.x * t, y: L.intern.y * t, say: null, happy: false };

    // the Ramen Bowl lives in the minibosses list, so the office's melee / paper balls / push-out code hits it
    const rc = C.ramen;
    this.ramen = {
      id: 'ramen', x: L.ramenHome.x * t, y: L.ramenHome.y * t, homeX: L.ramenHome.x * t, homeY: L.ramenHome.y * t,
      r: rc.radius, hp: rc.hp, maxHp: rc.hp, alive: false, deadT: 99, hitFlash: 0, attackT: 0, walked: 0, moving: false, flip: false,
      shotT: 1.5, shotN: 0, whipT: rc.whipInterval, whip: 0, spawnT: rc.spawnInterval, talkT: 2, say: null,
    };
    this.minibosses = [this.ramen];

    this.applyDebug(opts.debug || {});
    if (opts.debug?.step && opts.debug.step !== 'order') this.briefing = null;   // test jumps skip the task window
    this.updateCamera();
    if (this.phase === 'order') {
      this.banner(this.T.levelName, 3);
      this.banner(this.T.hints.order, 5);
    }
  }

  enter() { this.g.audio.playMusic('music_office'); }

  // a new step of lunch: drop the banners that are still waiting (they'd be out of date) and show the new ones
  phaseBanner(...msgs) {
    this.banners = this.banners.filter((b) => b.age > 0).slice(0, 1);
    if (this.banners[0]) this.banners[0].t = Math.min(this.banners[0].t, 0.6);
    for (const m of msgs) if (m) this.banner(m, 3.5);
  }
  retry() { return this.g.scenes.canteen(); }
  get pausable() { return this.state !== 'burnout' && !this.menu; }

  // ?scene=canteen&step=collect|carry|eat|boss|back&meal=ramen jumps straight to a part of the level (see main.js)
  applyDebug(d) {
    const t = this.tile, steps = ['order', 'collect', 'carry', 'eat', 'boss', 'back'];
    const k = steps.indexOf(d.step);
    if (k <= 0) return;
    this.meal = MEALS.includes(d.meal) ? d.meal : 'curry';
    this.greeted = true;
    this.giveTray();
    if (k >= 3) {
      this.ramen.alive = false; this.ramen.deadT = 99;
      const s = this.freeSeats.find((q) => q.tag === (d.seat || 'plain')) || this.freeSeats[0];
      this.sit(s);
      if (k >= 4) { this.tray.dishes[0].eaten = true; this.startRoku(); }
      if (k >= 5) { this.roku.alive = false; this.roku.hp = 0; this.phase = 'back'; this.unseat(); this.player.x = s.px; this.player.y = s.py + 60; this.roku.ext = 0; }
    } else {
      this.player.x = this.obachan.x; this.player.y = this.obachan.y + 2.4 * t;
    }
  }

  // ---------------------------------------------------------------- helpers
  get carrying() { return this.tray?.where === 'hands'; }
  get mealCfg() { return (this.meal && this.CC.meals[this.meal]) || {}; }
  get speedMult() {
    let m = super.speedMult;
    if (this.carrying) m *= this.CC.carrySpeed;
    return m * (this.mealCfg.speed || 1);
  }
  get damageMult() { return super.damageMult * (this.mealCfg.damage || 1); }
  get clockMinute() { return Math.min(60, (this.clockT / (this.CC.clockMinutes * 60)) * 60); }
  get dishesLeft() { return this.tray ? this.tray.dishes.filter((d) => !d.eaten).length : 0; }
  get dishesEaten() { return this.tray ? this.tray.dishes.filter((d) => d.eaten).length : 0; }

  giveTray() {
    const icon = [MEALS.indexOf(this.meal), 0];
    const dishes = [{ icon }, { icon: FOOD.side }, { icon: FOOD.tea }];
    if (this.greeted && this.CC.obachanBonusDish) dishes.push({ icon: FOOD.bonus, bonus: true });
    this.tray = { dishes: dishes.map((d) => ({ ...d, eaten: false })), where: 'hands', x: 0, y: 0 };
    this.phase = 'carry';
    this.ramen.alive = true; this.ramen.deadT = 0; this.ramen.attackT = 0.8;
    for (let i = 0; i < 6; i++) this.fx(i % 2 ? 'smoke' : 'star', this.ramen.x + rand(-50, 50), this.ramen.y - rand(0, 90), 0.7, -50);
  }

  // ---------------------------------------------------------------- update
  update(dt) {
    const inp = this.g.input, C = this.CC;
    if (this.updateBriefing(dt)) return;
    this.stateT += dt; this.time += dt;
    for (const b of this.banners.slice(0, 2)) { b.t -= dt; b.age += dt; }
    this.banners = this.banners.filter((b) => b.t > 0);
    const rise = this.C.text?.floaterRise ?? 28;
    this.floaters.forEach((f) => { f.t -= dt; f.y -= rise * dt; });
    this.floaters = this.floaters.filter((f) => f.t > 0);
    this.particles.forEach((f) => { f.t -= dt; f.y += f.vy * dt; });
    this.particles = this.particles.filter((f) => f.t > 0);
    this.shake = Math.max(0, this.shake - dt * 2);
    this.updateDecor(dt);

    if (this.menu) { this.updateMenu(dt); return; }
    if (this.state === 'burnout') {
      if (Math.random() < dt * 6) this.fx('smoke', this.player.x + rand(-20, 20), this.player.y - 40, 0.8, -50);
      if (this.stateT > 2.2) this.finish('burnout');
      return;
    }
    if (this.phase === 'done') { if (this.stateT > 2.5) this.finish('win'); return; }

    // the lunch clock: 12:00 → 13:00
    this.clockT += dt; this.waveTime += dt;
    if (!this.late && this.clockMinute >= 60) {
      this.late = true;
      this.banner(this.T.late, 4);
      this.kindWord(this.T.lateLines);
    }

    this.fieldT -= dt;
    if (this.fieldT <= 0) { this.fieldT = 0.25; this.updateFields(); }

    if (this.mealCfg.regen) this.player.mental = Math.min(this.C.player.mentalMax, this.player.mental + this.mealCfg.regen * dt);
    this.updatePlayer(dt);
    this.updateInteractions(dt);
    this.updateHazards(dt);
    this.updateMinibosses(dt);
    this.updateRoku(dt);
    this.updateEnemies(dt);
    this.updateShots(dt);
    this.updateCamera();

    if (this.player.mental <= 0 && !this.C.debug.godMode) {
      this.player.mental = 0;
      this.state = 'burnout'; this.stateT = 0;
      this.unseat();
      this.g.audio.sfx('sfx_burnout');
    }
  }

  updatePlayer(dt) {
    const p = this.player, pc = this.C.player, inp = this.g.input;
    for (const k of Object.keys(p.effects)) { p.effects[k].t -= dt; if (p.effects[k].t <= 0) delete p.effects[k]; }
    p.meleeCd -= dt; p.rangedCd -= dt; p.invuln -= dt; p.swing -= dt; p.throwT -= dt;
    const ax = inp.axis();
    if (this.seated) {
      // moving stands you up (the tray stays on the table)
      if (ax.x || ax.y) { this.unseat(); this.eatP = 0; } else { p.moving = false; return; }
    }
    p.moving = !!(ax.x || ax.y);
    if (p.moving) {
      const len = Math.hypot(ax.x, ax.y);
      p.fx = ax.x / len; p.fy = ax.y / len;
      p.dir = dirOf(ax.x, ax.y, p.dir);
      const sp = pc.speed * this.speedMult, ox = p.x, oy = p.y;
      p.x += p.fx * sp * dt; p.y += p.fy * sp * dt;
      this.collide(p);
      for (const m of this.minibosses) if (m.alive) pushOut(p, m);
      if (this.roku?.alive && this.roku.active) pushOut(p, this.roku);
      p.walked += Math.hypot(p.x - ox, p.y - oy);
      const step = Math.floor(p.walked / (this.A.walkStride * 2));
      if (step !== p.step) { p.step = step; this.g.audio.sfx('sfx_step'); }
    }
    const attack = inp.wasPressed('j', ' ') ? 'melee' : inp.wasPressed('k') ? 'throw' : null;
    if (!attack) return;
    if (this.carrying) { if (p.meleeCd <= 0) { p.meleeCd = 0.6; this.float(p.x, p.y - 80, this.T.handsFull, COLORS.vermilion); } return; }
    if (p.effects.weaponBlock) { this.float(p.x, p.y - 80, this.T.weaponBlocked, COLORS.vermilion); return; }
    if (attack === 'melee' && p.meleeCd <= 0) this.melee();
    if (attack === 'throw' && p.rangedCd <= 0) this.throwBall();
  }

  melee() {
    super.melee();
    // Rokurokubi: his body, and his head while it is out on the neck
    const r = this.roku, p = this.player, mc = this.C.player.melee;
    if (!r?.alive || !r.active) return;
    const [fx, fy] = this.aim(), face = Math.atan2(fy, fx), half = (mc.arcDegrees * Math.PI) / 360;
    const inArc = (x, y, rad) => {
      const d = dist(p.x, p.y, x, y);
      if (d > mc.range + rad) return false;
      let diff = Math.atan2(y - p.y, x - p.x) - face;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      return Math.abs(diff) <= half || d < rad + p.r;
    };
    const dmg = mc.damage * this.damageMult;
    if (r.ext > 20 && inArc(r.hx, r.hy + 30, this.CC.roku.headRadius)) this.hurtBoss(dmg, true);
    else if (inArc(r.x, r.y, r.r)) this.hurtBoss(dmg);
  }

  // ---------------------------------------------------------------- interactions
  updateInteractions(dt) {
    const p = this.player, inp = this.g.input, t = this.tile, T = this.T;
    this.prompt = null;
    const e = inp.wasPressed('e');
    const near = (x, y, r) => dist(p.x, p.y, x, y) < r;
    const ob = this.obachan, tk = this.special.tickets;
    if (ob.say) { ob.say.t -= dt; if (ob.say.t <= 0) ob.say = null; }
    if (this.intern.say) { this.intern.say.t -= dt; if (this.intern.say.t <= 0) this.intern.say = null; }
    ob.trayT -= dt;

    // ticket machine
    if (this.phase === 'order' && tk && circleRectOverlap(p.x, p.y, p.r + 50, tk.rect)) {
      this.prompt = T.prompts.ticket;
      if (e) { this.menu = { sel: 0, t: 0 }; this.g.audio.sfx('sfx_ui'); return; }
    }
    // the obachan behind the counter (you talk to her from the front of the counter)
    const counter = this.special.counter;
    if (counter && p.y > ob.y && near(ob.x, ob.y + 1.6 * t, 2.6 * t) && !this.tray) {
      if (this.phase === 'order') {
        this.prompt = this.greeted ? T.prompts.ticketFirst : T.prompts.greet;
        if (e) {
          if (!this.greeted) { this.greeted = true; this.say(ob, pick(T.obachan.greet), 3.5); this.g.audio.sfx('sfx_buff'); this.stats.helped++; }
          else this.say(ob, pick(T.obachan.ticketFirst), 3);
        }
      } else if (this.phase === 'collect') {
        this.prompt = T.prompts.collect;
        if (e) {
          this.giveTray();
          ob.trayT = 1.2;
          this.say(ob, pick(this.greeted ? T.obachan.bonus : T.obachan.tray), 3.5);
          this.g.audio.sfx('sfx_pickup');
          this.phaseBanner(T.ramenWakes);
          this.say(this.ramen, pick(T.ramenLines.wake), 3.5);
          this.g.audio.playMusic('music_wave');
          return;
        }
      }
    }

    // the healing bowl the Ramen Bowl leaves behind
    if (this.bowl && near(this.bowl.x, this.bowl.y, p.r + 40)) {
      this.prompt = T.prompts.bowl;
      if (e) {
        this.restore(this.CC.ramen.bowlHeal, T.bowlPickup);
        this.stats.bowl = true; this.stats.breaks++;
        this.kindWord(T.bowlLines);
        this.bowl = null;
        return;
      }
    }

    // the way out, once Rokurokubi is beaten
    if (this.phase === 'back' && !this.seated && near(this.L.exit.x * t, this.L.exit.y * t, 1.8 * t)) {
      this.prompt = T.prompts.leave;
      if (e) { this.lunchDone(); return; }
    }
    if (this.tray) this.updateTray(e);
    this.updateNpcs(dt);
  }

  updateTray(e) {
    const p = this.player, T = this.T, t = this.tile;
    const tray = this.tray;
    // pick the tray back up
    if (tray.where === 'table' && dist(p.x, p.y, tray.x, tray.y + t) < 1.8 * t) {
      this.prompt = T.prompts.pickUp;
      if (e) { tray.where = 'hands'; this.g.audio.sfx('sfx_pickup'); }
      return;
    }
    // back at your seat after the boss
    if (tray.where === 'seat' && !this.seated && this.seat && dist(p.x, p.y, this.seat.px, this.seat.py) < 1.4 * t) {
      if (this.roku?.alive) { this.prompt = T.prompts.notNow; return; }
      if (!this.dishesLeft) return;
      this.prompt = T.prompts.sitBack;
      if (e) this.sit(this.seat);
      return;
    }
    if (this.seated) {
      this.prompt = this.dishesLeft ? T.prompts.eat : this.phase === 'back' ? T.prompts.standUp : null;
      return;
    }
    if (!this.carrying) return;
    // a free seat nearby?
    const s = this.freeSeats.find((q) => dist(p.x, p.y, q.px, q.py) < 1.2 * t);
    if (s) {
      if (this.ramen.alive) { this.prompt = T.prompts.cantSit; if (e) this.putDown(s.table.x + 0.5, s.table.y); return; }
      this.prompt = fmt(T.prompts.sit, { where: T.seatNames[s.tag] || '' });
      if (e) this.sit(s);
      return;
    }
    // any table: put the tray down to fight
    const table = this.props.find((q) => q.def.table && circleRectOverlap(p.x, p.y, p.r + 34, q.rect));
    if (table) {
      this.prompt = T.prompts.putDown;
      if (e) this.putDown(clamp(p.x / t, table.x + 0.5, table.x + table.def.w - 0.5), table.y);
    }
  }

  // tx, ty = tile coordinates of the table footprint row; the tray sits on the table top, above the footprint
  putDown(tx, ty) {
    const t = this.tile;
    this.tray.where = 'table'; this.tray.x = tx * t; this.tray.y = ty * t - this.CC.look.trayOnTable;
    this.tray.sortY = (ty + 1) * t + 2;
    this.g.audio.sfx('sfx_ui');
  }

  sit(s) {
    const p = this.player, t = this.tile;
    const first = !this.seat;
    this.seat = s; this.seated = true;
    this.tray.where = 'seat';
    this.tray.sortY = (s.table.y + 1) * t + 2;   // drawn after the table, before whoever sits on the far side
    this.tray.x = (s.table.x + 0.5) * t; this.tray.y = s.table.y * t - this.CC.look.trayOnTable;
    p.x = s.px; p.y = s.py; p.dir = s.dir; p.moving = false;
    if (first) {
      this.phase = 'eat'; this.stateT = 0;
      this.stats.seatTag = s.tag;
      // good company: a kind colleague within reach of the seat
      const fc = this.C.friendlyNpcs;
      this.stats.company = this.npcs.some((n) => fc.types[n.type]?.group === 'boost' && dist(n.x, n.y, s.px, s.py) < fc.auraRadius * 1.8);
      this.phaseBanner(this.T.seatLines[s.tag], this.T.hints.eat);
      if (s.tag === 'intern') { this.intern.happy = true; this.say(this.intern, pick(this.T.internLines.joined), 4); }
      this.g.audio.playMusic('music_office');
      if (!this.dishesLeft) this.startRoku();
    }
    this.g.audio.sfx('sfx_ui');
  }

  unseat() {
    if (!this.seated) return;
    this.seated = false;
    const p = this.player, t = this.tile;
    p.y += this.seat.dir === 'up' ? 0.5 * t : -0.4 * t;
    this.collide(p);
  }

  // hold E to eat, one dish at a time
  updateEating(dt) {
    if (!this.seated || !this.dishesLeft) return;
    const p = this.player, C = this.CC;
    if (!this.g.input.isDown('e')) { this.eatP = Math.max(0, this.eatP - dt * 0.5); return; }
    this.eatP += dt / (C.eatTime * (this.mealCfg.eatTimeMult || 1));
    if (this.eatP >= 1) {
      this.eatP = 0;
      const d = this.tray.dishes.find((q) => !q.eaten);
      d.eaten = true;
      this.stats.dishes++;
      this.restore(Math.round(C.healPerDish * (this.mealCfg.healMult || 1)));
      for (let i = 0; i < 4; i++) this.fx('star', p.x + rand(-24, 24), p.y - rand(40, 90), 0.6, -60);
      this.kindWord(this.T.eatLines);
      const total = this.tray.dishes.length;
      const at = this.seat.tag === 'manager' ? C.managerBossAt : C.bossAt;
      if (!this.roku && this.dishesEaten >= Math.max(1, Math.ceil(total * at))) this.startRoku();
      else if (!this.dishesLeft && this.roku && !this.roku.alive) this.phaseBanner(this.T.finished, this.T.hints.back);
    }
  }

  lunchDone() {
    this.phase = 'done'; this.stateT = 0;
    this.stats.lunchOnTime = !this.late;
    this.phaseBanner(this.late ? this.T.doneLate : this.T.done);
    this.g.audio.sfx('sfx_win');
    for (let i = 0; i < 10; i++) this.fx('star', this.player.x + rand(-60, 60), this.player.y - rand(20, 120), 1, -40);
  }

  updateMenu(dt) {
    const m = this.menu, inp = this.g.input;
    m.t += dt;
    if (inp.wasPressed('a', 'ArrowLeft')) { m.sel = (m.sel + MEALS.length - 1) % MEALS.length; this.g.audio.sfx('sfx_ui'); }
    if (inp.wasPressed('d', 'ArrowRight')) { m.sel = (m.sel + 1) % MEALS.length; this.g.audio.sfx('sfx_ui'); }
    if (inp.wasPressed('Escape')) { this.menu = null; return; }
    if (inp.wasPressed('e', ' ', 'Enter') && m.t > 0.25) {
      this.meal = MEALS[m.sel];
      this.menu = null;
      this.phase = 'collect';
      this.g.audio.sfx('sfx_pickup');
      this.phaseBanner(fmt(this.T.ordered, { meal: this.T.meals[this.meal].name }), this.T.hints.collect);
    }
  }

  // rice-cooker steam bursts and the tray-return conveyor
  updateHazards(dt) {
    const C = this.CC, p = this.player, t = this.tile, L = this.L;
    this.steamT = (this.steamT + dt) % C.steam.period;
    const blast = this.steamT > C.steam.period - C.steam.blast;
    if (blast && dist(p.x, p.y, L.steam.x * t, L.steam.y * t) < L.steam.r * t) this.hurtPlayer(C.steam.damage);
    if (blast && Math.random() < dt * 12) this.fx('smoke', L.steam.x * t + rand(-30, 30), (L.steam.y - 1.2) * t, 0.6, -80);
    const c = L.conveyorLane;
    if (!this.seated && p.x > c.x0 * t && p.x < c.x1 * t && p.y > c.y0 * t && p.y < c.y1 * t) {
      p.x += c.push * C.conveyorSpeed * dt;
      this.collide(p);
    }
    this.updateEating(dt);
  }

  // ---------------------------------------------------------------- the Ramen Bowl
  updateMinibosses(dt) {
    const m = this.ramen, rc = this.CC.ramen, p = this.player, t = this.tile;
    m.hitFlash -= dt; m.attackT -= dt; m.whip -= dt;
    if (!m.alive) { m.deadT += dt; return; }
    if (m.say) { m.say.t -= dt; if (m.say.t <= 0) m.say = null; }
    const enraged = m.hp < m.maxHp * 0.5;
    const d = dist(p.x, p.y, m.x, m.y), leash = rc.leashTiles * t;
    const awake = d < rc.activationDistance;
    // walk after the bunny, on a leash around home
    let gx = null, gy = null;
    if (awake && dist(p.x, p.y, m.homeX, m.homeY) < leash + 200 && d > m.r + p.r + 40) { gx = p.x; gy = p.y; }
    else if (dist(m.x, m.y, m.homeX, m.homeY) > 30) { gx = m.homeX; gy = m.homeY; }
    m.moving = false;
    if (gx !== null && m.attackT <= 0 && m.whip <= 0) {
      const dx = gx - m.x, dy = gy - m.y, dd = Math.hypot(dx, dy) || 1, ox = m.x, oy = m.y;
      m.x += (dx / dd) * rc.walkSpeed * dt; m.y += (dy / dd) * rc.walkSpeed * dt;
      if (dist(m.x, m.y, m.homeX, m.homeY) > leash) { m.x = ox; m.y = oy; }
      this.collide(m);
      const moved = Math.hypot(m.x - ox, m.y - oy);
      m.walked += moved; m.moving = moved > 0.2;
      if (Math.abs(dx) > 4) m.flip = dx > 0;
    }
    if (!awake) return;
    m.talkT -= dt;
    if (m.talkT <= 0) { m.talkT = 7 + rand(0, 3); this.say(m, pick(this.T.ramenLines.fight), 3); }
    // tempura shrimp: one aimed shot, then a fan of three
    m.shotT -= dt;
    if (m.shotT <= 0) {
      m.shotT = enraged ? rc.enragedShotInterval : rc.shotInterval;
      m.attackT = 0.35; m.shotN++;
      const a = Math.atan2(p.y - m.y, p.x - m.x);
      const spread = m.shotN % rc.fanEvery === 0 ? [-rc.fanSpread, 0, rc.fanSpread] : [0];
      for (const s of spread) this.hostile.push({ kind: 'shrimp', x: m.x, y: m.y - 10, vx: Math.cos(a + s) * rc.shotSpeed, vy: Math.sin(a + s) * rc.shotSpeed, r: 14, t: 3, dmg: rc.shotDamage, hy: 46 });
      this.g.audio.sfx('sfx_throw');
    }
    // enraged: the noodle whip, a short-range sweep after a wind-up
    if (enraged) {
      m.whipT -= dt;
      if (m.whipT <= 0 && d < rc.whipRange + 80) { m.whipT = rc.whipInterval; m.whip = rc.whipWindup + 0.35; }
      if (m.whip > 0 && m.whip <= 0.35 && !m.whipHit) {
        m.whipHit = true;
        this.fx('spark', m.x, m.y - 40, 0.3);
        this.particles.push({ kind: 'lash', x: m.x + (p.x > m.x ? 60 : -60), y: m.y - 30, t: 0.35, life: 0.35, vy: 0, flip: p.x < m.x });
        if (d < rc.whipRange + p.r) this.hurtPlayer(rc.whipDamage);
      }
      if (m.whip <= 0) m.whipHit = false;
    }
    // minions: rolling narutomaki (weak) and bouncing eggs (strong)
    m.spawnT -= dt;
    if (m.spawnT <= 0) {
      m.spawnT = rc.spawnInterval * (enraged ? 0.75 : 1);
      for (let i = 0; i < rc.spawnCount; i++) {
        const a = rand(0, Math.PI * 2);
        this.spawnEnemy(Math.random() < rc.strongChance ? 'egg' : 'naruto', m.x + Math.cos(a) * (m.r + 24), m.y + Math.sin(a) * (m.r + 24));
      }
    }
    if (d < p.r + m.r + 2) this.hurtPlayer(rc.contactDamage);
  }

  hurtMiniboss(m, dmg) {
    if (!m.alive) return;
    m.hp -= dmg; m.hitFlash = 0.12;
    this.fx('spark', m.x + rand(-30, 30), m.y - 40 + rand(-20, 20), 0.12);
    this.g.audio.sfx('sfx_hit');
    if (m.hp > 0) return;
    m.alive = false; m.deadT = 0;
    this.stats.killScore += this.CC.ramen.score;
    this.shake = 1;
    for (let i = 0; i < 6; i++) this.fx(i % 2 ? 'smoke' : 'star', m.x + rand(-40, 40), m.y - rand(0, 80), 0.7, -60);
    this.g.audio.sfx('sfx_miniboss_down');
    this.float(m.x, m.y - 100, `+${this.CC.ramen.score}`, COLORS.gold);
    this.bowl = { x: m.x, y: m.y };
    this.phaseBanner(this.meal === 'ramen' ? this.T.ramenDownMine : this.T.ramenDown, this.T.hints.seat);
    this.enemies.forEach((e) => { if (e.kind === 'naruto' || e.kind === 'egg') { e.dead = true; this.fx('smoke', e.x, e.y - 10, 0.4, -40); } });
    this.hostile = this.hostile.filter((h) => h.kind !== 'shrimp');
    this.g.audio.playMusic('music_office');
  }

  // ---------------------------------------------------------------- Rokurokubi
  startRoku() {
    const rc = this.CC.roku, t = this.tile, L = this.L;
    this.phase = 'boss'; this.stateT = 0;
    this.roku = {
      x: L.rokuHome.x * t, y: L.rokuHome.y * t, homeX: L.rokuHome.x * t, homeY: L.rokuHome.y * t,
      r: rc.radius, hp: rc.hp, maxHp: rc.hp, alive: true, active: false, hitFlash: 0, headFlash: 0,
      mode: 'enter', modeT: 0, attackT: rc.attackInterval, summonT: rc.summonInterval * 0.5, coilT: rc.coilInterval,
      ext: 0, hx: 0, hy: 0, tx: 0, ty: 0, ang: 0, animT: 0, walked: 0, say: null, struck: false,
    };
    this.placeHead(this.roku);
    // he peers over the bunny's table first: "Quick sync?"
    const p = this.player;
    this.roku.tx = p.x; this.roku.ty = p.y - 70;
    this.say(this.roku, pick(this.T.rokuLines.entry), 3.5);
    this.phaseBanner(this.T.rokuIncoming);
    this.g.audio.playMusic('music_boss');
    this.g.audio.sfx('sfx_boss_roar');
    this.shake = 0.8;
    for (let i = 0; i < 8; i++) this.fx(i % 2 ? 'smoke' : 'star', this.roku.x + rand(-50, 50), this.roku.y - rand(0, 140), 0.8, -50);
  }

  // where the head sits on the neck: base = the collar, then `ext` pixels along the neck towards the target
  neckBase(r) { return { x: r.x, y: r.y - (96 - this.CC.roku.neckCut) * PX }; }
  placeHead(r) {
    const b = this.neckBase(r);
    if (r.mode === 'coil') { r.hx = b.x + Math.cos(r.ang) * r.ext; r.hy = b.y - 20 + Math.sin(r.ang) * r.ext * 0.7; return; }
    const dx = r.tx - b.x, dy = r.ty - b.y, d = Math.hypot(dx, dy) || 1;
    r.hx = b.x + (dx / d) * r.ext; r.hy = b.y - 26 + (dy / d) * r.ext;
  }

  updateRoku(dt) {
    const r = this.roku;
    if (!r) return;
    r.hitFlash -= dt; r.headFlash -= dt; r.modeT += dt; r.animT += dt;
    if (r.say) { r.say.t -= dt; if (r.say.t <= 0) r.say = null; }
    if (!r.alive) { r.ext = Math.max(0, r.ext - 900 * dt); this.placeHead(r); return; }
    const rc = this.CC.roku, p = this.player, t = this.tile;
    const enraged = r.hp < r.maxHp * 0.5;
    const b = this.neckBase(r);
    const reach = (sp) => {   // move the head towards / away from the target (the entrance reaches all the way to your table)
      const full = r.mode === 'enter' ? dist(b.x, b.y, r.tx, r.ty) : Math.min(rc.reach, dist(b.x, b.y, r.tx, r.ty));
      return { full, step: sp * dt };
    };

    if (r.mode === 'enter') {
      const { full, step } = reach(rc.strikeSpeed * 0.6);
      if (r.modeT < 2.2) r.ext = Math.min(full, r.ext + step);
      else { r.ext = Math.max(0, r.ext - rc.retractSpeed * dt); if (r.ext === 0) { r.mode = 'idle'; r.modeT = 0; r.active = true; this.unseatForBoss(); } }
      if (r.modeT > 1.2 && this.seated) this.unseatForBoss();
      this.placeHead(r);
      return;
    }

    r.attackT -= dt; r.summonT -= dt; if (enraged) r.coilT -= dt;
    if (r.mode === 'idle') {
      // walk towards the bunny, but never far from the tatami
      const d = dist(p.x, p.y, r.x, r.y), leash = rc.leashTiles * t;
      if (d > 2.5 * t) {
        const ox = r.x, oy = r.y;
        r.x += (p.x - r.x) / d * rc.walkSpeed * dt; r.y += (p.y - r.y) / d * rc.walkSpeed * dt;
        if (dist(r.x, r.y, r.homeX, r.homeY) > leash) { r.x = ox; r.y = oy; }
        this.collide(r, true);
        r.walked += Math.hypot(r.x - ox, r.y - oy);
      }
      r.ext = Math.max(0, r.ext - rc.retractSpeed * dt);
      if (enraged && r.coilT <= 0) { r.mode = 'coilWarn'; r.modeT = 0; r.coilT = rc.coilInterval; }
      else if (r.attackT <= 0) {
        r.mode = 'windup'; r.modeT = 0; r.struck = false;
        r.tx = p.x; r.ty = p.y - 30;
        if (Math.random() < 0.5) this.say(r, pick(this.T.rokuLines.strike), 2.2);
      }
      if (r.summonT <= 0) {
        r.summonT = rc.summonInterval; r.pointT = 0.6;
        const add = enraged ? rc.enragedSummonAdd : 0;
        for (const [kind, n] of Object.entries(rc.summon)) for (let i = 0; i < n + (kind === 'invite' ? add : 0); i++) {
          const a = rand(0, Math.PI * 2);
          this.spawnEnemy(kind, r.x + Math.cos(a) * (r.r + 40), r.y + Math.sin(a) * (r.r + 40));
        }
        this.say(r, pick(this.T.rokuLines.summon), 2.5);
      }
    } else if (r.mode === 'windup') {
      if (r.modeT >= rc.windup * (enraged ? 0.75 : 1)) { r.mode = 'strike'; r.modeT = 0; this.g.audio.sfx('sfx_melee'); }
    } else if (r.mode === 'strike') {
      const { full, step } = reach(rc.strikeSpeed);
      r.ext = Math.min(full, r.ext + step);
      if (r.ext >= full) { r.mode = 'hold'; r.modeT = 0; this.shake = 0.3; }
    } else if (r.mode === 'hold') {
      if (r.modeT >= rc.hold) { r.mode = 'retract'; r.modeT = 0; }
    } else if (r.mode === 'retract') {
      r.ext = Math.max(0, r.ext - rc.retractSpeed * dt);
      if (r.ext === 0) { r.mode = 'idle'; r.modeT = 0; r.attackT = rc.attackInterval * (enraged ? 0.7 : 1); }
    } else if (r.mode === 'coilWarn') {
      if (r.modeT >= rc.coilTelegraph) { r.mode = 'coil'; r.modeT = 0; r.ang = Math.atan2(p.y - b.y, p.x - b.x); this.say(r, pick(this.T.rokuLines.coil), 2.5); }
    } else if (r.mode === 'coil') {
      // the neck swings round the hall: the head circles further and further out
      const k = r.modeT / rc.coilTime;
      r.ext = 90 + (rc.coilRadius - 90) * Math.min(1, k * 1.4);
      r.ang += dt * 2.6;
      if (k >= 1) { r.mode = 'retract'; r.modeT = 0; r.tx = r.hx; r.ty = r.hy + 26; r.ext = dist(b.x, b.y, r.hx, r.hy + 26); }
    }
    this.placeHead(r);
    // the head hurts when it hits you; so does walking into him
    if ((r.mode === 'strike' || r.mode === 'hold' || r.mode === 'coil') && dist(p.x, p.y - 30, r.hx, r.hy) < rc.headRadius + p.r) {
      this.hurtPlayer(r.mode === 'coil' ? rc.coilDamage : rc.strikeDamage);
    }
    if (dist(p.x, p.y, r.x, r.y) < p.r + r.r) this.hurtPlayer(rc.contactDamage);
  }

  // the boss takes the bunny away from lunch: stand up, the tray stays at the seat
  unseatForBoss() {
    if (!this.seated) return;
    this.unseat();
    this.eatP = 0;
    this.phaseBanner(this.T.hints.boss);
  }

  updateBoss() { /* Rokurokubi has his own update (updateRoku) */ }

  hurtBoss(dmg, head = false) {
    const r = this.roku;
    if (!r?.alive || !r.active) return;
    r.hp -= dmg;
    if (head) r.headFlash = 0.12; else r.hitFlash = 0.12;
    this.fx('spark', (head ? r.hx : r.x) + rand(-20, 20), (head ? r.hy : r.y - 80) + rand(-20, 20), 0.12);
    this.g.audio.sfx('sfx_hit');
    if (r.hp > 0) return;
    r.alive = false; r.mode = 'defeated';
    this.stats.killScore += this.CC.roku.score;
    this.shake = 1.5;
    for (let i = 0; i < 10; i++) this.fx(i % 2 ? 'smoke' : 'star', r.x + rand(-70, 70), r.y - rand(0, 140), 1, -50);
    this.say(r, pick(this.T.rokuLines.defeat), 4);
    this.enemies.forEach((e) => { e.dead = true; this.fx('smoke', e.x, e.y - 10, 0.4, -40); });
    this.hostile = [];
    this.float(r.x, r.y - 150, `+${this.CC.roku.score}`, COLORS.gold);
    this.phaseBanner(this.T.rokuDown);
    this.g.audio.sfx('sfx_lift_ding');
    this.g.audio.playMusic('music_office');
    // lunch break is over: head for the door (sitting back down to finish the tray is optional, for points)
    this.phase = 'back';
    this.banner(this.T.hints.back, 4);
  }

  // ---------------------------------------------------------------- minions
  spawnEnemy(kind, x, y) {
    if (this.enemies.length >= this.CC.maxEnemiesAlive) return;
    const ec = this.CC.enemies[kind], p = this.player;
    const a = Math.atan2(p.y - y, p.x - x);
    const e = {
      kind, type: ec.type, x, y, r: ec.radius, hp: ec.hp, kx: 0, ky: 0, hitFlash: 0, wob: rand(0, 6), walked: 0, dir: 'down',
      animT: rand(0, 1), life: ec.life || 0, vx: Math.cos(a) * ec.speed, vy: Math.sin(a) * ec.speed, shotT: rand(1, ec.shotInterval || 2), hop: 0,
    };
    this.collide(e);
    this.fx('smoke', e.x, e.y - 10, 0.3, -30);
    this.enemies.push(e);
  }

  updateEnemies(dt) {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const ec = this.CC.enemies[e.kind];
      e.hitFlash -= dt; e.wob += dt * 8; e.animT += dt;
      let vx, vy;
      if (e.kind === 'naruto') {
        // rolls in a straight line and bounces off walls, then fades away
        vx = e.vx; vy = e.vy;
        e.life -= dt;
        if (e.life <= 0) { e.dead = true; this.fx('smoke', e.x, e.y - 10, 0.3, -30); continue; }
      } else {
        const [sx, sy] = this.steer(e, this.field);
        let sp = ec.speed;
        if (e.kind === 'egg') { e.hop = (e.hop + dt * 2.2) % 1; sp *= e.hop < 0.55 ? 1.8 : 0.15; }   // bounces in hops
        vx = sx * sp; vy = sy * sp;
        if (e.kind === 'pager') {
          const d = dist(p.x, p.y, e.x, e.y);
          if (d < ec.keepAway) { vx = -vx * 0.6; vy = -vy * 0.6; }
          e.shotT -= dt;
          if (e.shotT <= 0 && d < 700) {
            e.shotT = ec.shotInterval;
            const a = Math.atan2(p.y - e.y, p.x - e.x);
            this.hostile.push({ kind: 'ping', x: e.x, y: e.y, vx: Math.cos(a) * ec.shotSpeed, vy: Math.sin(a) * ec.shotSpeed, r: 12, t: 3, dmg: ec.shotDamage, hy: 30 });
          }
        }
        for (const o of this.enemies) {
          if (o === e || o.dead) continue;
          const ox = e.x - o.x, oy = e.y - o.y, od = Math.hypot(ox, oy);
          if (od > 0 && od < e.r + o.r) { vx += (ox / od) * 60; vy += (oy / od) * 60; }
        }
      }
      const bx = e.x, by = e.y;
      e.x += (vx + e.kx) * dt; e.y += (vy + e.ky) * dt;
      e.kx *= 0.85; e.ky *= 0.85;
      const hit = this.collide(e);
      if (hit && e.kind === 'naruto') {
        // bounce: flip whichever axis got stopped
        if (Math.abs(e.x - (bx + (vx + e.kx) * dt)) > 0.5) e.vx = -e.vx;
        if (Math.abs(e.y - (by + (vy + e.ky) * dt)) > 0.5) e.vy = -e.vy;
      }
      if (this.ramen.alive) pushOut(e, this.ramen);
      e.walked += Math.hypot(e.x - bx, e.y - by);
      e.dir = dirOf(vx, vy, e.dir);
      const d = dist(p.x, p.y, e.x, e.y);
      if (d < p.r + e.r) this.hurtPlayer(ec.contactDamage);
    }
    this.enemies = this.enemies.filter((e) => !e.dead);
  }

  hurtEnemy(e, dmg) {
    e.hp -= dmg; e.hitFlash = 0.12;
    this.fx('spark', e.x + rand(-8, 8), e.y - 20 + rand(-8, 8), 0.12);
    if (e.hp > 0) { this.g.audio.sfx('sfx_hit'); return; }
    if (e.dead) return;
    e.dead = true;
    const sc = this.CC.enemies[e.kind].score;
    this.g.audio.sfx('sfx_enemy_die', 0.05);
    this.fx('smoke', e.x, e.y - 10, 0.4, -40);
    this.stats.killScore += sc;
    this.float(e.x, e.y - 40, `+${sc}`, COLORS.gold);
  }

  // getting hit while carrying spills a dish
  hurtPlayer(amount) {
    const p = this.player, before = p.invuln;
    super.hurtPlayer(amount);
    if (p.invuln > before && this.carrying && this.time > (this.spillUntil || 0)) {
      this.spillUntil = this.time + this.CC.spillCooldown;   // one spill per scare, not one per hit
      const d = [...this.tray.dishes].reverse().find((q) => !q.eaten && !q.spilled);
      if (d) {
        this.tray.dishes = this.tray.dishes.filter((q) => q !== d);
        this.stats.spilled++;
        this.float(p.x, p.y - 120, this.T.spilled, PAL.red);
        this.particles.push({ kind: 'rice', x: p.x + rand(-20, 20), y: p.y + 10, t: 2.5, life: 2.5, vy: 0 });
      }
    }
  }

  updateShots(dt) {
    const pr = this.C.player.ranged;
    for (const s of this.shots) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt;
      if (this.hitsObstacle(s.x, s.y + 24, s.r, true)) { s.t = 0; this.fx('spark', s.x, s.y, 0.1); continue; }
      const dmg = pr.damage * this.damageMult, sy = s.y + 24;
      for (const e of this.enemies) if (!e.dead && dist(s.x, sy, e.x, e.y) < s.r + e.r) { this.hurtEnemy(e, dmg); s.t = 0; break; }
      if (s.t <= 0) continue;
      const m = this.ramen;
      if (m.alive && dist(s.x, sy, m.x, m.y) < s.r + m.r) { this.hurtMiniboss(m, dmg); s.t = 0; continue; }
      const r = this.roku;
      if (r?.alive && r.active) {
        if (r.ext > 20 && dist(s.x, s.y, r.hx, r.hy) < s.r + this.CC.roku.headRadius) { this.hurtBoss(dmg, true); s.t = 0; }
        else if (dist(s.x, sy, r.x, r.y) < s.r + r.r) { this.hurtBoss(dmg); s.t = 0; }
      }
    }
    this.shots = this.shots.filter((s) => s.t > 0);
    const p = this.player;
    for (const h of this.hostile) {
      h.x += h.vx * dt; h.y += h.vy * dt; h.t -= dt;
      if (this.hitsObstacle(h.x, h.y, h.r, true)) { h.t = 0; this.fx('spark', h.x, h.y - h.hy, 0.1); }
      if (h.t > 0 && dist(h.x, h.y, p.x, p.y) < h.r + p.r) { this.hurtPlayer(h.dmg); h.t = 0; }
    }
    this.hostile = this.hostile.filter((h) => h.t > 0);
  }

  // ---------------------------------------------------------------- score + end
  get canteenScore() {
    const st = this.stats, sc = this.CC.scoring;
    return Math.round(st.killScore + st.dishes * sc.dishPoints - st.spilled * sc.spillPenalty
      + (st.mochi + st.breaks + st.helped) * (this.C.scoring.selfCarePoints ?? 0)
      - st.damageTaken * sc.pointsLostPerMentalDamage);
  }
  get score() { return Math.max(0, this.carry + this.canteenScore); }

  finish(outcome) {
    if (this.finished) return;
    this.finished = true;
    const st = this.stats, sc = this.CC.scoring, T = this.T.end;
    const win = outcome === 'win';
    const onTime = win && st.lunchOnTime ? sc.lunchOnTime + Math.round((60 - this.clockMinute) * sc.minutesLeftPoints) : 0;
    // the seat's own bonus, plus 'company' for any seat within reach of a kind colleague (counted once)
    const seat = win ? (st.seatTag === 'company' ? 0 : sc.seatBonus[st.seatTag] || 0) + (st.company ? sc.seatBonus.company : 0) : 0;
    const level = this.canteenScore + onTime + seat;
    const total = Math.max(0, this.carry + level);
    const rows = [
      [T.rows.carry, this.carry],
      [T.rows.work, st.killScore],
      [T.rows.lunch, st.dishes * sc.dishPoints - st.spilled * sc.spillPenalty],
      [T.rows.onTime, onTime],
      [T.rows.seat, seat],
      [T.rows.care, (st.mochi + st.breaks + st.helped) * (this.C.scoring.selfCarePoints ?? 0)],
      [T.rows.damage, -Math.round(st.damageTaken * sc.pointsLostPerMentalDamage)],
    ];
    const result = {
      outcome, level: 2, score: total, seconds: (this.g.session.result?.seconds || 0) + this.waveTime, rows,
      careLine: fmt(T.careLine, { dishes: st.dishes, spilled: st.spilled, clock: this.clockText() }),
    };
    this.g.session.result = result;
    this.g.go(this.g.scenes.end(result));
  }

  clockText() {
    const m = Math.floor(this.clockMinute);
    return m >= 60 ? '13:00' : `12:${String(m).padStart(2, '0')}`;
  }

  // ---------------------------------------------------------------- draw
  draw(ctx) {
    super.draw(ctx);
    if (this.menu) this.drawMenu(ctx);
  }

  fxSprite(kind) { return FXC[kind] || super.fxSprite(kind); }

  // shrimp and pager pings fly at chest height above their shadow
  drawHostile(ctx) {
    const a = this.g.assets;
    for (const h of this.hostile) {
      ctx.fillStyle = 'rgba(27,26,46,0.3)'; ctx.fillRect(h.x - 10, h.y - 3, 20, 6);
      if (h.kind === 'shrimp') {
        const spin = Math.floor(this.time * 10) % 2, ang = Math.atan2(h.vy, h.vx);
        const [k, c, r] = spin ? FXC.shrimp2 : FXC.shrimp;
        drawFrame(ctx, a, k, c, r, h.x, h.y - h.hy, { anchor: 'center', rot: ang, kind: 'fx', color: PAL.ochre, ph: [10, 5], eyes: false });
      } else {
        const [k, c, r] = FXC.ping;
        drawFrame(ctx, a, k, c, r, h.x, h.y - h.hy, { anchor: 'center', rot: Math.atan2(h.vy, h.vx), alpha: 0.6 + 0.4 * (Math.floor(this.time * 10) % 2), kind: 'fx', color: PAL.moss, ph: [8, 8], eyes: false });
      }
    }
  }

  // over the y-sorted world: Rokurokubi's neck and head, the obachan's and the intern's speech bubbles
  drawOverWorld(ctx) {
    this.drawRokuNeck(ctx);
    if (this.phase === 'back' || this.phase === 'done') {
      // the way out glows, like the lift in the office
      const t = this.tile, ex = this.L.exit;
      ctx.globalAlpha = 0.3 + (Math.floor(this.time * 4) % 2) * 0.25;
      ctx.fillStyle = PAL.gold; ctx.fillRect((ex.x - 1.5) * t, (ex.y - 0.5) * t, 3 * t, t);
      ctx.globalAlpha = 1;
      text(ctx, this.T.exitLabel, ex.x * t, (ex.y - 1.1) * t + (Math.floor(this.time * 3) % 2) * 3, { size: 22, color: PAL.gold });
    }
    if (this.obachan.say) this.drawBubble(ctx, { x: this.obachan.x + 240, say: this.obachan.say }, this.obachan.y + 10);
    if (this.intern.say) this.drawBubble(ctx, this.intern, this.intern.y - 60);
    const r = this.roku;
    if (r?.say) this.drawBubble(ctx, { x: r.ext > 14 ? r.hx : r.x, say: r.say }, r.ext > 14 ? r.hy - 50 : r.y - 200);
    // the steam warning: little puffs before the rice cooker blows
    const C = this.CC.steam, t = this.tile, s = this.L.steam;
    if (this.steamT > C.period - C.blast - C.warn) {
      const blast = this.steamT > C.period - C.blast;
      ctx.globalAlpha = blast ? 0.25 : 0.12 + 0.1 * (Math.floor(this.time * 8) % 2);
      ctx.fillStyle = blast ? PAL.cream : PAL.red;
      ctx.beginPath(); ctx.ellipse(s.x * t, s.y * t, s.r * t, s.r * t * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // the office draws its y-sorted world through these hooks; add the canteen's own people and things
  drawProp(ctx, p) {
    if (p.id === 'tickets' && this.phase === 'order' && Math.floor(this.time * 2) % 2) {
      const def = { ...p.def, ...{ sheet: 'props_canteen_misc', col: 1, row: 0 } };
      const t = this.tile;
      drawFrame(ctx, this.g.assets, def.sheet, def.col, def.row, (p.x + def.w / 2) * t, (p.y + def.h) * t, { color: def.ph, ph: [def.w * 16 - 2, def.h * 16 + 6], label: def.label, eyes: false });
      return;
    }
    if (p.id === 'cooker') {
      const C = this.CC.steam, k = this.steamT;
      const col = k > C.period - C.blast ? 2 : k > C.period - C.blast - C.warn ? 1 : k < 0.6 ? 3 : 0;
      const t = this.tile;
      drawFrame(ctx, this.g.assets, 'props_canteen_anim', col, 0, (p.x + p.def.w / 2) * t, (p.y + p.def.h) * t, { color: p.def.ph, ph: [30, 22], eyes: false });
      return;
    }
    super.drawProp(ctx, p);
  }

  drawSeated(ctx, s) {
    const t = this.tile, a = this.g.assets;
    const col = s.act >= 0 ? s.act : loop(EATERS.type, this.time + (s.phase || 0), 3);
    const sheet = s.dir === 'up' ? 'npc_eaters_up' : 'npc_eaters_down';
    const x = (s.x + 0.5) * t, y = (s.y + 1) * t + (s.dir === 'up' ? this.CC.look.eaterUpDy : this.CC.look.eaterDownDy);
    drawFrame(ctx, a, sheet, col, s.worker, x, y, { kind: 'npc', color: [PAL.grey, PAL.wood, PAL.moss, PAL.peach][s.worker], ph: [14, 18], eyes: s.dir !== 'up' });
  }

  // extra y-sorted things: obachan, intern, trays, the defeated bowl, Rokurokubi's body
  worldExtras() {
    const out = [], t = this.tile, a = this.g.assets;
    const ob = this.obachan;
    out.push({ y: ob.y, d: (ctx) => {
      let col = loop(OBACHAN.idle, this.time, 1.5);
      if (ob.trayT > 0) col = OBACHAN.tray; else if (ob.say && ob.say.t > 0.8) col = loop(OBACHAN.talk, this.time, this.A.talkFps / 2);
      drawFrame(ctx, a, 'npc_obachan', col, 0, ob.x, ob.y + 21, { kind: 'npc', color: PAL.cream, ph: [26, 34], label: 'obachan' });
    } });
    const it = this.intern;
    out.push({ y: it.y, d: (ctx) => {
      let col = loop(INTERN.sad, this.time, 1);
      if (it.say && it.say.t > 0.8) col = loop(INTERN.talk, this.time, this.A.talkFps / 2);
      else if (it.happy) col = Math.floor(this.time) % 4 === 0 ? INTERN.wave : 1;
      drawFrame(ctx, a, 'npc_intern', col, 0, it.x, it.y + this.CC.look.internDy, { kind: 'npc', color: PAL.gold, ph: [24, 30], label: 'intern' });
    } });
    // free seats: an empty stool (the bunny's own picture brings its stool once seated)
    const showSeats = this.carrying && !this.ramen.alive;
    for (const s of this.freeSeats) {
      if (this.seated && s === this.seat) continue;
      const y = (s.y + 1) * t + (s.dir === 'up' ? this.CC.look.eaterUpDy : this.CC.look.eaterDownDy);
      out.push({ y: y - 1, d: (ctx) => {
        if (s.tag !== 'rooftop' && s.tag !== 'manager') drawFrame(ctx, a, 'props_chairs', 3, 1, s.px, y, { kind: 'prop', color: PAL.wood, ph: [10, 8], eyes: false });
        if (showSeats) this.drawEnemyArrowGold(ctx, s.px, y - 70);
      } });
    }
    if (this.tray && this.tray.where !== 'hands') {
      const tr = this.tray;
      out.push({ y: tr.sortY ?? tr.y + 30, d: (ctx) => this.drawTray(ctx, tr.x, tr.y) });
    }
    if (this.bowl) {
      const b = this.bowl;
      out.push({ y: b.y, d: (ctx) => {
        drawFrame(ctx, a, 'miniboss_ramen', RAMEN.bowl[0], RAMEN.bowl[1], b.x, b.y + 40 + (Math.floor(this.time * 2) % 2) * -PX, { kind: 'pickup', color: PAL.red, ph: [30, 22], eyes: false });
      } });
    }
    if (this.roku) out.push({ y: this.roku.y, d: (ctx) => this.drawRokuBody(ctx) });
    return out;
  }

  // a small bobbing gold arrow (free seats when you're looking for one)
  drawEnemyArrowGold(ctx, x, y) {
    const bob = (Math.floor(this.time * 3) % 2) * PX * 2, u = 3;
    const top = Math.round((y - 18 - bob) / 3) * 3, cx = Math.round(x / 3) * 3;
    ctx.fillStyle = PAL.ink;
    for (let i = 0; i < 4; i++) ctx.fillRect(cx - (4 - i) * u - u, top + i * u - u, (4 - i) * 2 * u + 2 * u, u + 2 * u);
    ctx.fillStyle = PAL.gold;
    for (let i = 0; i < 4; i++) ctx.fillRect(cx - (4 - i) * u, top + i * u, (4 - i) * 2 * u, u);
  }

  drawTray(ctx, x, y, scale = PX) {
    const tr = this.tray, a = this.g.assets;
    const left = tr.dishes.filter((d) => !d.eaten).length, n = tr.dishes.length;
    let col = MEALS.indexOf(this.meal), row = TRAY.full;
    if (!left) { col = TRAY.empty; row = TRAY.emptyRow; } else if (left < n || this.stats.spilled) row = TRAY.half;
    drawFrame(ctx, a, 'props_trays', col, row, x, y, { anchor: 'center', scale, kind: 'prop', color: PAL.wood, ph: [22, 14], eyes: false });
  }

  drawPlayer(ctx) {
    const p = this.player, a = this.g.assets;
    if (this.seated && this.state !== 'burnout') {
      const row = this.seat.dir === 'up' ? PLAYER_EAT.rowUp : PLAYER_EAT.rowDown;
      let col = PLAYER_EAT.happy;
      if (this.roku?.alive && this.roku.mode === 'enter') col = PLAYER_EAT.startled;
      else if (this.g.input.isDown('e') && this.dishesLeft) col = Math.floor(this.time * 4) % 2 ? PLAYER_EAT.bite : PLAYER_EAT.chew;
      else if (!this.dishesLeft) col = PLAYER_EAT.happy;
      else col = Math.floor(this.time * 0.5) % 3 === 0 ? PLAYER_EAT.sip : PLAYER_EAT.chew;
      const dy = this.seat.dir === 'up' ? this.CC.look.eaterUpDy : this.CC.look.eaterDownDy;
      drawFrame(ctx, a, 'player_eat', col, row, p.x, (this.seat.y + 1) * this.tile + dy, { kind: 'player', ph: [16, 22] });
      return;
    }
    if (this.carrying && this.state !== 'burnout' && p.swing <= 0 && p.throwT <= 0) {
      const [row, flip] = rowOf(p.dir);
      const col = p.moving ? walkFrame(p.walked, this.A.walkStride) : STAND;
      const blink = p.invuln > 0 && Math.floor(p.invuln * 16) % 2;
      ctx.fillStyle = 'rgba(27,26,46,0.35)'; ctx.fillRect(p.x - 21, p.y + p.r - 6, 42, 9);
      drawFrame(ctx, a, 'player_tray', col, row, p.x, p.y + p.r, { flip, alpha: blink ? 0.35 : 1, kind: 'player', ph: [16, 26] });
      return;
    }
    super.drawPlayer(ctx);
  }

  drawEnemy(ctx, e) {
    const a = this.g.assets, key = `minion_${e.kind}_${e.type}`;
    const col = e.hitFlash > 0 ? MINION.hit : loop(e.kind === 'naruto' ? [0, 1, 2] : MINION.move, e.animT, e.kind === 'naruto' ? 12 : this.A.minionFps);
    const opts = { flip: e.dir === 'right' && e.kind !== 'naruto', flash: e.hitFlash > 0.06, kind: 'enemy', ph: e.type === 'weak' ? [20, 16] : [28, 24], eyes: false };
    const hop = e.kind === 'egg' && e.hop < 0.55 ? Math.sin(e.hop / 0.55 * Math.PI) * 24 : 0;
    const fade = e.kind === 'naruto' && e.life < 0.8 ? e.life / 0.8 : 1;
    ctx.fillStyle = 'rgba(27,26,46,0.3)'; ctx.fillRect(e.x - e.r, e.y + e.r - 6, e.r * 2, 6);
    if (e.kind === 'question') {   // floats
      const hover = (Math.floor(e.animT * 3) % 2) * PX;
      drawFrame(ctx, a, key, col, 0, e.x, e.y - 20 - hover, { ...opts, anchor: 'center' });
    } else drawFrame(ctx, a, key, col, 0, e.x, e.y + e.r - hop, { ...opts, alpha: fade });
    const h = a.cell(key)[1] * PX;
    this.drawEnemyArrow(ctx, e.x, e.y + e.r - h * 0.85 - 6 - hop, e.x);
  }

  drawMiniboss(ctx, m) {
    if (!m.alive && m.deadT > 0.6) return;
    const a = this.g.assets;
    const enraged = m.hp < m.maxHp * 0.5;
    let col = loop(RAMEN.idle, this.time, 3), row = 0;
    if (enraged) [col, row] = RAMEN.angry;
    if (m.moving) { row = RAMEN.walkRow; col = RAMEN.walk[Math.floor(m.walked / this.A.walkStride) % 4]; }
    if (m.attackT > 0) { row = 0; col = RAMEN.shoot; }
    if (m.whip > 0.35) [col, row] = RAMEN.windup;
    else if (m.whip > 0) [col, row] = RAMEN.whip;
    if (m.hitFlash > 0 || !m.alive) { row = 0; col = RAMEN.hurt; }
    const alpha = m.alive ? 1 : 1 - m.deadT / 0.6;
    const flip = (row === RAMEN.walkRow && m.flip) || ((row === 0 && col === RAMEN.shoot) || row === 2 ? this.player.x > m.x : false);
    ctx.fillStyle = 'rgba(27,26,46,0.35)'; ctx.fillRect(m.x - m.r, m.y + m.r - 9, m.r * 2, 12);
    drawFrame(ctx, a, 'miniboss_ramen', col, row, m.x, m.y + m.r, {
      alpha, flip, flash: m.hitFlash > 0.06, kind: 'miniboss', color: PAL.red, ph: [52, 46], label: this.T.ramenName,
    });
    if (m.alive) {
      bar(ctx, m.x - 48, m.y - m.r - 110, 96, 9, m.hp / m.maxHp, PAL.red);
      this.drawEnemyArrow(ctx, m.x, m.y - m.r - 118, m.x, 1.5);
    }
  }

  drawRokuBody(ctx) {
    const r = this.roku, a = this.g.assets, rc = this.CC.roku;
    const enraged = r.hp < r.maxHp * 0.5;
    let row = enraged ? 1 : 0, col = loop(ROKU.idle, r.animT, this.A.bossFps);
    if (r.pointT > 0) { r.pointT -= 1 / 60; col = ROKU.point; }
    if (r.hitFlash > 0) { col = ROKU.hurt; row = 0; }
    if (!r.alive) [col, row] = ROKU.defeated;
    ctx.fillStyle = 'rgba(27,26,46,0.4)'; ctx.fillRect(r.x - r.r, r.y - 9, r.r * 2, 12);
    const img = a.get('boss_rokurokubi');
    const headOff = r.ext > 14 || r.mode === 'windup' && false;
    if (img && headOff && r.alive) {
      // the head is out on the neck: draw the body from the collar down
      const [cw, ch] = a.cell('boss_rokurokubi'), cut = rc.neckCut;
      ctx.save();
      if (r.hitFlash > 0.06) ctx.globalAlpha = 0.6;
      ctx.drawImage(img, col * cw, row * ch + cut, cw, ch - cut, Math.round(r.x - cw * PX / 2), Math.round(r.y - (ch - cut) * PX), cw * PX, (ch - cut) * PX);
      ctx.restore();
    } else {
      drawFrame(ctx, a, 'boss_rokurokubi', col, row, r.x, r.y, { flash: r.hitFlash > 0.06, kind: 'boss', color: PAL.dgrey, ph: [30, 46], label: 'ROKUROKUBI' });
    }
    if (r.alive && r.active) this.drawEnemyArrow(ctx, r.x, r.y - 96 * PX - 4, 0, 2);
  }

  // neck + head on top of everything, plus the attack telegraphs
  drawRokuNeck(ctx) {
    const r = this.roku, a = this.g.assets, rc = this.CC.roku;
    if (!r) return;
    const b = this.neckBase(r), enraged = r.hp < r.maxHp * 0.5;
    if (r.alive && r.mode === 'windup') {
      // dashed red line where the head is about to strike
      const k = r.modeT / rc.windup;
      ctx.fillStyle = PAL.red; ctx.globalAlpha = 0.35 + 0.4 * (Math.floor(this.time * 10) % 2);
      const d = Math.min(rc.reach, dist(b.x, b.y, r.tx, r.ty)), dx = (r.tx - b.x) / (d || 1), dy = (r.ty - b.y) / (d || 1);
      for (let s = 30; s < d * Math.min(1, k * 1.5); s += 24) ctx.fillRect(Math.round(b.x + dx * s) - 6, Math.round(b.y + dy * s) - 6, 12, 12);
      ctx.globalAlpha = 1;
    }
    if (r.alive && r.mode === 'coilWarn') {
      ctx.fillStyle = PAL.red; ctx.globalAlpha = 0.5 * (Math.floor(this.time * 8) % 2);
      for (let i = 0; i < 48; i++) {
        const ang = (i / 48) * Math.PI * 2;
        ctx.fillRect(Math.round(b.x + Math.cos(ang) * rc.coilRadius) - 6, Math.round(b.y - 20 + Math.sin(ang) * rc.coilRadius * 0.7) - 6, 12, 12);
      }
      ctx.globalAlpha = 1;
    }
    if (r.ext <= 14) return;
    // the neck: segments from the collar to the head
    const dx = r.hx - b.x, dy = r.hy - b.y, d = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
    for (let s = 0; s < d; s += 18) {
      drawFrame(ctx, a, 'rokurokubi_neck', ROKU_NECK.segment[0], ROKU_NECK.segment[1], b.x + dx * s / d, b.y + dy * s / d, { anchor: 'center', rot: ang - Math.PI / 2, kind: 'boss', color: '#F0E2C8', ph: [6, 12], eyes: false });
    }
    let col = r.mode === 'strike' || r.mode === 'hold' || r.mode === 'coil' ? (enraged ? 1 : ROKU_HEAD.peek) : r.say && r.say.t > 0.8 ? ROKU_HEAD.talk : ROKU_HEAD.look;
    if (r.headFlash > 0) col = ROKU_HEAD.hurt;
    if (!r.alive) col = ROKU_HEAD.hurt;
    drawFrame(ctx, a, 'rokurokubi_head', col, enraged || !r.alive ? 1 : 0, r.hx, r.hy, { anchor: 'center', scale: PX * rc.headScale / 2, flash: r.headFlash > 0.06, kind: 'boss', color: '#F0E2C8', ph: [18, 20], eyes: true });
  }

  // ---------------------------------------------------------------- HUD
  drawHud(ctx) {
    const p = this.player, pc = this.C.player, T = this.T, a = this.g.assets;
    const frac = p.mental / pc.mentalMax;
    const posture = frac > pc.postureThresholds.tired ? 'ok' : frac > pc.postureThresholds.burntOut ? 'tired' : 'burntOut';
    const label = `${T.hud.mental} — ${T.posture[posture]}`;
    ctx.font = fontOf(18);
    const hw = Math.max(360, Math.ceil(ctx.measureText(label).width) + 48);
    windowBox(ctx, 16, 16, hw, 84);
    text(ctx, label, 34, 40, { size: 18, align: 'left' });
    bar(ctx, 34, 60, hw - 40, 21, frac, frac > 0.66 ? PAL.celadon : frac > 0.33 ? PAL.gold : PAL.red);
    // meal + tray, bottom left
    let y0 = 116;
    if (this.meal) {
      const my = H - 84;
      windowBox(ctx, 16, my, 400, 64);
      this.drawMealPanel(ctx, my);
    }
    let ex = 30;
    for (const [k, v] of Object.entries(p.effects)) {
      const good = k === 'speed' || k === 'damage';
      text(ctx, `${T.effects[k]} ${Math.ceil(v.t)}s`, ex, y0 + 6, { size: 16, align: 'left', color: good ? PAL.gold : PAL.red });
      ex += 170;
    }
    this.drawHudRight(ctx);
  }

  drawMealPanel(ctx, y0) {
    const a = this.g.assets, T = this.T;
    {
      drawFrame(ctx, a, 'food_icons', MEALS.indexOf(this.meal), 0, 50, y0 + 32, { anchor: 'center', scale: PX, kind: 'pickup', ph: [14, 12], eyes: false });
      let fs = 15; ctx.font = fontOf(fs);
      while (fs > 11 && ctx.measureText(T.meals[this.meal].buff).width > 310) { fs--; ctx.font = fontOf(fs); }
      text(ctx, T.meals[this.meal].buff, 80, y0 + 20, { size: fs, align: 'left', color: PAL.gold });
      if (this.tray) {
        this.tray.dishes.forEach((d, i) => {
          const ic = d.eaten ? FOOD.empty : d.icon;
          drawFrame(ctx, a, 'food_icons', ic[0], ic[1], 92 + i * 38, y0 + 46, { anchor: 'center', scale: 1.5, alpha: d.eaten ? 0.45 : 1, kind: 'pickup', ph: [12, 10], eyes: false });
        });
        for (let i = 0; i < this.stats.spilled; i++) text(ctx, '×', 92 + (this.tray.dishes.length + i) * 38, y0 + 46, { size: 20, color: PAL.red });
      }
    }
  }

  drawHudRight(ctx) {
    const p = this.player, T = this.T;
    // the clock + score
    windowBox(ctx, W - 250, 16, 234, 84);
    text(ctx, `${T.hud.score}: ${this.score}`, W - 36, 42, { size: 22, align: 'right', color: PAL.gold });
    const late = this.late || this.clockMinute >= 55;
    text(ctx, `${T.hud.clock} ${this.clockText()}`, W - 36, 72, { size: 20, align: 'right', color: late && Math.floor(this.time * 2) % 2 ? PAL.red : PAL.cream });
    // objective
    const goal = T.goals[this.phase === 'carry' && !this.ramen.alive ? 'seat' : this.phase];
    if (goal && this.state !== 'burnout') text(ctx, goal, W / 2 + (this.meal ? 120 : 0), H - 28, { size: 20, plate: true });
    if (this.roku?.alive && this.roku.active) {
      text(ctx, T.rokuName, W / 2, 28, { size: 20, color: PAL.gold });
      bar(ctx, W / 2 - 250, 48, 500, 15, this.roku.hp / this.roku.maxHp, PAL.red);
    }
    // eating progress
    if (this.seated && this.dishesLeft && this.eatP > 0) {
      const sx = p.x - this.cam.x, sy = p.y - this.cam.y - 120;
      bar(ctx, sx - 50, sy, 100, 10, this.eatP, PAL.gold);
    }
    const tc = this.C.text || {};
    this.banners.slice(0, 2).forEach((b, i) => {
      ctx.globalAlpha = Math.min(clamp(b.age / (tc.bannerFadeIn ?? 0.2), 0, 1), clamp(b.t / (tc.bannerFadeOut ?? 0.5), 0, 1));
      const y = 150 + i * 56, main = i === 0;
      const st = { size: main ? 32 : 22 };
      ctx.font = fontOf(st.size);
      while (st.size > 16 && ctx.measureText(b.msg).width > W - 120) { st.size -= 2; ctx.font = fontOf(st.size); }
      const w = ctx.measureText(b.msg).width + 44, h = st.size * TEXT.scale + 24;
      ctx.save(); ctx.globalAlpha *= 0.82; ctx.fillStyle = '#171A40'; ctx.fillRect(Math.round(W / 2 - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h)); ctx.restore();
      text(ctx, b.msg, W / 2, y, { ...st, color: main ? PAL.gold : PAL.cream });
      ctx.globalAlpha = 1;
    });
    if (this.prompt && !this.menu) {
      ctx.font = fontOf(20);
      const w = Math.max(400, ctx.measureText(this.prompt).width + 60);
      windowBox(ctx, W / 2 - w / 2, H - 120, w, 52);
      text(ctx, this.prompt, W / 2, H - 94, { size: 20 });
    }
    if (this.state === 'burnout') { ctx.fillStyle = `rgba(27,26,46,${Math.min(0.7, this.stateT * 0.5)})`; ctx.fillRect(0, 0, W, H); }
  }

  // the ticket machine close-up: pick a meal with ← →, E to buy
  drawMenu(ctx) {
    const a = this.g.assets, T = this.T, m = this.menu;
    ctx.fillStyle = 'rgba(15,16,38,0.8)'; ctx.fillRect(0, 0, W, H);
    const bg = a.get('ticket_machine_closeup');
    if (bg) ctx.drawImage(bg, 0, 0, W, H);
    else { ctx.fillStyle = PAL.cream; ctx.fillRect(140, 60, W - 280, H - 120); }
    const B = this.CC.look.menuButtons;   // button centres as fractions of the picture
    MEALS.forEach((k, i) => {
      const cx = B.x[i] * W, cy = B.y * H, sel = i === m.sel;
      if (sel) {
        // blinking gold frame around the chosen button
        const on = Math.floor(this.time * 4) % 2, x0 = cx - B.size / 2 - 22, y0 = cy - B.size / 2 - 22, s2 = B.size + 44;
        ctx.fillStyle = PAL.ink; ctx.fillRect(x0 - 3, y0 - 3, s2 + 6, 15); ctx.fillRect(x0 - 3, y0 + s2 - 12, s2 + 6, 15);
        ctx.fillRect(x0 - 3, y0 - 3, 15, s2 + 6); ctx.fillRect(x0 + s2 - 12, y0 - 3, 15, s2 + 6);
        ctx.fillStyle = on ? PAL.gold : PAL.red;
        ctx.fillRect(x0, y0, s2, 9); ctx.fillRect(x0, y0 + s2 - 9, s2, 9); ctx.fillRect(x0, y0, 9, s2); ctx.fillRect(x0 + s2 - 9, y0, 9, s2);
      }
      drawFrame(ctx, a, 'food_icons', i, 0, cx, cy + (sel ? -(Math.floor(this.time * 3) % 2) * PX : 0), { anchor: 'center', scale: B.iconScale, kind: 'pickup', ph: [14, 12], eyes: false });
    });
    const meal = T.meals[MEALS[m.sel]];
    windowBox(ctx, W / 2 - 330, H - 190, 660, 150);
    text(ctx, meal.name, W / 2, H - 160, { size: 28, color: PAL.gold });
    text(ctx, meal.buff, W / 2, H - 122, { size: 20, color: PAL.cream });
    text(ctx, T.menuHint, W / 2, H - 76, { size: 16, color: PAL.grey });
    text(ctx, T.menuTitle, W / 2, 40, { size: 26, color: PAL.gold, plate: true });
  }

  drawGuideArrow(ctx) {
    // reuse the office's golden arrow, pointed at the next thing to do
    const t = this.tile, saved = this.state;
    let goal = null;
    if (this.phase === 'order' && this.special.tickets) { const k = this.special.tickets; goal = { x: (k.x + 1) * t, y: (k.y + 1.6) * t }; }
    else if (this.phase === 'collect') goal = { x: this.obachan.x, y: this.obachan.y + 2 * t };
    else if (this.phase === 'carry' && this.tray?.where === 'table') goal = { x: this.tray.x, y: this.tray.y + t };
    else if (this.phase === 'back') goal = { x: this.L.exit.x * t, y: this.L.exit.y * t };
    else if (this.bowl && this.player.mental < 70) goal = { x: this.bowl.x, y: this.bowl.y };
    if (!goal) return;
    this.state = 'explore'; const desk = this.special.desk;
    this.special.desk = { x: goal.x / t - 1.5, y: goal.y / t - 2.6, def: { w: 3, h: 2 } };
    super.drawGuideArrow(ctx);
    this.special.desk = desk; this.state = saved;
  }
}

function pushOut(c, o) {
  const dx = c.x - o.x, dy = c.y - o.y, d = Math.hypot(dx, dy) || 1, min = c.r + o.r;
  if (d < min) { c.x = o.x + (dx / d) * min; c.y = o.y + (dy / d) * min; }
}

import {
  W, H, PX, PAL, COLORS, clamp, dist, rand, pick, fmt, text, bar, wrapLeft, windowBox, drawFrame,
  resolveCircleRect, circleRectOverlap, FONT, fontOf, textPlate, TEXT,
} from '../engine.js';
import { OFFICE } from '../levels/office.js';
import {
  FLOOR, WALL, WALL_DECOR, PROPS, CLUTTER, WORKER_SHEETS, WORKER_ROW, WORKER, WALKER_SHEETS,
  FX, ACTION, IDLE, BOSS, STAND, MINIBOSS, MINION, NPC, walkFrame, loop, dirOf, rowOf,
} from '../sprites.js';

const AURA_GOOD = '#5BC46A';
const MB_COLORS = { client: PAL.moss, printer: PAL.cream, coffee: PAL.wood, ac: PAL.sky };
// a fractional amount of things → a whole number, rounding up by chance (2.6 → 2 or 3, 3 on average 60% of the time)
const chanceRound = (x) => Math.floor(x) + (Math.random() < x - Math.floor(x) ? 1 : 0);
const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) ^ 0x5bd1e995; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

export class OfficeScene {
  constructor(game) {
    this.g = game;
    this.C = game.config;
    this.A = game.config.animation;
    this.T = game.texts.office;
    this.L = OFFICE;
    const t = this.L.T;
    this.tile = t;

    this.buildMap();

    const pc = this.C.player;
    this.player = {
      x: this.L.playerStart.x * t, y: this.L.playerStart.y * t, r: pc.radius,
      mental: pc.mentalMax, fx: 0, fy: 1, dir: 'down',
      meleeCd: 0, rangedCd: 0, invuln: 0, swing: 0, throwT: 0, walked: 0, moving: false, effects: {},
    };

    this.state = 'explore'; // explore → email → wave → boss → cleared | burnout
    this.stateT = 0;
    this.time = 0;
    this.waveTime = 0;
    this.enemies = [];
    this.shots = [];       // player paper balls
    this.hostile = [];     // boss fireballs
    this.floaters = [];
    this.particles = [];   // sparks, smoke, stars (fx_items frames)
    this.banners = [];
    this.shake = 0;
    this.boss = null;
    this.defeated = 0;
    this.stats = { killScore: 0, damageTaken: 0, morning: game.session.morningBonus || 0 };
    this.coffeeCd = 0;

    this.minibosses = this.L.minibosses.map((m) => ({
      ...m, x: m.x * t, y: m.y * t, r: this.C.minibosses.radius, hp: this.C.minibosses.hp, maxHp: this.C.minibosses.hp,
      homeX: m.x * t, homeY: m.y * t, walked: 0, moving: false, flip: false, talkT: rand(2, 6), say: null,
      // not in the office yet: they appear when the day starts (startWave) — can't be seen, hit or bumped into before
      spawnT: rand(0, 1.5), alive: false, hitFlash: 0, attackT: 0, deadT: 99,
    }));
    for (const m of this.minibosses) this.obstacleCircles.push(m);
    this.npcs = this.L.friendlyNpcs.map((n) => ({ ...n, x: n.x * t, y: n.y * t, dwell: 0, rearm: 0, cheer: 0, say: null, wasInside: false }));

    this.mochi = [];
    const spots = [...this.L.mochiSpots].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(this.C.recovery.mochi.count, spots.length); i++) this.mochi.push({ x: spots[i].x * t, y: spots[i].y * t, respawn: 0 });

    this.cam = { x: 0, y: 0 };
    this.updateCamera();
    this.fieldT = 0;
    this.updateFields();
    this.banner(this.T.levelName, 3);
    this.banner(this.T.exploreHint, 5);
  }

  enter() { this.g.audio.playMusic('music_office'); }

  // pause menu (P or ESC): retry restarts the office day from the start
  get pausable() { return this.state !== 'burnout'; }
  get pauseKeys() { return ['p', 'Escape']; }
  retry() { return this.g.scenes.office(); }

  // ---------------------------------------------------------------- map
  buildMap() {
    const L = this.L, t = this.tile;
    const N = L.MAP_W * L.MAP_H;
    this.wall = new Uint8Array(N);         // 1 = wall, 2 = partition
    this.blocked = new Uint8Array(N);      // walls + solid props (for enemy path finding)
    this.floor = new Array(N).fill(null);
    const at = (x, y) => y * L.MAP_W + x;
    this.at = at;
    for (const [type, x0, y0, x1, y1] of L.zones) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.floor[at(x, y)] = type;
    for (const [x0, y0, x1, y1] of L.walls) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.wall[at(x, y)] = 1;
    for (const [x0, y0, x1, y1] of L.doors) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      this.wall[at(x, y)] = 0;
      if (!this.floor[at(x, y)]) this.floor[at(x, y)] = this.floor[at(x + 1, y)] || this.floor[at(x - 1, y)] || 'carpet';
    }
    for (const [x0, x1, y] of L.partitions) for (let x = x0; x <= x1; x++) this.wall[at(x, y)] = 2;

    // collision rectangles, bucketed per tile for fast lookups
    this.buckets = Array.from({ length: N }, () => []);
    this.obstacleCircles = [];
    this.wallRects = [];
    const addRect = (r) => {
      for (let y = Math.max(0, Math.floor(r.y / t)); y <= Math.min(L.MAP_H - 1, Math.floor((r.y + r.h - 1) / t)); y++)
        for (let x = Math.max(0, Math.floor(r.x / t)); x <= Math.min(L.MAP_W - 1, Math.floor((r.x + r.w - 1) / t)); x++) this.buckets[at(x, y)].push(r);
    };
    for (let y = 0; y < L.MAP_H; y++) for (let x = 0; x < L.MAP_W; x++) if (this.wall[at(x, y)]) {
      const r = { x: x * t, y: y * t, w: t, h: t, wall: true };
      this.wallRects.push(r); addRect(r); this.blocked[at(x, y)] = 1;
    }

    // props
    this.props = [];
    this.special = {};
    for (const [name, x, y, o] of L.props) {
      const def = PROPS[name];
      if (!def) { console.warn('unknown prop', name); continue; }
      const opt = typeof o === 'object' ? o : { id: o };
      const id = opt.id;
      const p = { name, def, x, y, id, flip: !!opt.flip, seat: opt.seat, dy: opt.dy || 0, rect: { x: x * t + 4, y: y * t + 4, w: def.w * t - 8, h: def.h * t - 8 } };
      this.checkWall(p);
      this.props.push(p);
      if (id) this.special[id] = p;
      if (def.solid) {
        addRect(p.rect);
        for (let yy = y; yy < y + def.h; yy++) for (let xx = x; xx < x + def.w; xx++) if (xx >= 0 && yy >= 0 && xx < L.MAP_W && yy < L.MAP_H) this.blocked[at(xx, yy)] = 1;
      }
    }
    this.buildDecor();
    this.renderStatic();
  }

  // Furniture that belongs against a wall must touch it (warns in the console while laying out the level).
  checkWall(p) {
    const side = p.def.wall === 'right' && p.flip ? 'left' : p.def.wall;
    if (!side) return;
    const W1 = (x, y) => x < 0 || y < 0 || x >= this.L.MAP_W || y >= this.L.MAP_H || this.wall[this.at(x, y)] === 1;
    let ok = true;
    if (side === 'top') for (let x = p.x; x < p.x + p.def.w; x++) ok = ok && W1(x, p.y - 1);
    if (side === 'right') for (let y = p.y; y < p.y + p.def.h; y++) ok = ok && W1(p.x + p.def.w, y);
    if (side === 'left') for (let y = p.y; y < p.y + p.def.h; y++) ok = ok && W1(p.x - 1, y);
    if (!ok) console.warn(`[office] ${p.name} at ${p.x},${p.y} should stand against the ${side} wall`);
  }

  // Background life: seated colleagues, walkers, clutter, worn carpet along the walkers' routes.
  buildDecor() {
    const L = this.L, t = this.tile;
    // seated colleagues: typing, now and then an action (sip, call, stretch, doze)
    this.seats = (L.seats || []).map((s, i) => ({ ...s, act: -1, actT: 2 + hash(i, 7) * 10, phase: hash(i, 3) * 2 }));
    // walkers
    this.walkers = (L.walkers || []).map((w) => ({
      ...w, sheet: WALKER_SHEETS[w.kind], seg: 0, dirN: 1, wait: 0, walked: 0,
      x: w.route[0][0] * t, y: w.route[0][1] * t, dir: 'down', moving: false,
    }));
    this.worn = new Map();
    for (const w of L.walkers || []) for (let i = 0; i + 1 < w.route.length; i++) {
      const [ax, ay] = w.route[i], [bx, by] = w.route[i + 1];
      const horiz = Math.abs(bx - ax) > Math.abs(by - ay);
      const n = Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)));
      for (let k = 0; k <= n; k++) {
        const x = Math.floor(ax + (bx - ax) * k / n), y = Math.floor(ay + (by - ay) * k / n);
        const i2 = this.at(x, y), want = horiz ? 'wornH' : 'wornV';
        if (this.floor[i2] === 'carpet' && !this.worn.has(i2)) this.worn.set(i2, want);
      }
    }
    // clutter: random free floor tiles, not in doorways, not next to a door, not in the boss arena
    const kinds = Object.keys(CLUTTER);
    const nearDoor = (x, y) => L.doors.some(([x0, y0, x1, y1]) => x >= x0 - 2 && x <= x1 + 2 && y >= y0 - 1 && y <= y1 + 1);
    const used = new Set();
    this.clutter = [];
    let seed = 1;
    for (const z of L.clutter || []) {
      const [x0, y0, x1, y1] = z.area;
      for (let k = 0, tries = 0; k < z.n && tries < 200; tries++) {
        const x = x0 + Math.floor(hash(seed, 11) * (x1 - x0 + 1)), y = y0 + Math.floor(hash(seed, 17) * (y1 - y0 + 1));
        const list = z.kinds || kinds, kind = list[Math.floor(hash(seed, 23) * list.length)];
        seed++;
        const i = this.at(x, y);
        if (this.blocked[i] || this.wall[i] || used.has(i) || nearDoor(x, y) || this.floor[i] === 'carpetWave' || this.worn.has(i)) continue;
        used.add(i);
        this.clutter.push({ kind, x: (x + 0.5) * t + (hash(seed, 5) - 0.5) * 16, y: (y + 0.5) * t + (hash(seed, 9) - 0.5) * 16, flip: hash(seed, 13) < 0.5 });
        k++;
      }
    }
    // steam above hot drinks
    this.steamSpots = this.props.filter((p) => p.name === 'coffee_good' || p.name === 'counter').map((p) => ({ x: (p.x + p.def.w / 2) * t, y: p.y * t - 30 }));
  }

  updateDecor(dt) {
    const t = this.tile;
    for (const s of this.seats) {
      s.actT -= dt;
      if (s.actT <= 0) {
        if (s.act >= 0) { s.act = -1; s.actT = 4 + Math.random() * 10; }
        else { s.act = WORKER.actions[Math.floor(Math.random() * WORKER.actions.length)]; s.actT = 1.5 + Math.random() * 2.5; }
      }
    }
    for (const w of this.walkers) {
      w.moving = false;
      if (w.wait > 0) { w.wait -= dt; continue; }
      const next = w.seg + w.dirN;
      const [tx, ty] = w.route[next];
      const dx = tx * t - w.x, dy = ty * t - w.y, d = Math.hypot(dx, dy), step = w.speed * dt;
      if (d <= step) {
        w.x = tx * t; w.y = ty * t; w.seg = next;
        if (next === 0 || next === w.route.length - 1) { w.dirN = -w.dirN; w.wait = w.pause; w.dir = 'down'; }
      } else {
        w.x += dx / d * step; w.y += dy / d * step; w.walked += step; w.moving = true;
        w.dir = dirOf(dx, dy, w.dir);
      }
    }
  }

  // Obstacles near a circle (walls + solid props), from the tile buckets.
  near(x, y, r, wallsOnly = false) {
    const t = this.tile, L = this.L, out = new Set();
    for (let ty = Math.floor((y - r) / t); ty <= Math.floor((y + r) / t); ty++)
      for (let tx = Math.floor((x - r) / t); tx <= Math.floor((x + r) / t); tx++) {
        if (tx < 0 || ty < 0 || tx >= L.MAP_W || ty >= L.MAP_H) continue;
        for (const o of this.buckets[this.at(tx, ty)]) if (!wallsOnly || o.wall) out.add(o);
      }
    return out;
  }
  collide(c, wallsOnly = false) {
    let hit = false;
    for (const o of this.near(c.x, c.y, c.r + 2, wallsOnly)) if (resolveCircleRect(c, o)) hit = true;
    c.x = clamp(c.x, c.r, this.L.width - c.r); c.y = clamp(c.y, c.r, this.L.height - c.r);
    return hit;
  }
  hitsObstacle(x, y, r, wallsOnly = false) {
    for (const o of this.near(x, y, r, wallsOnly)) if (circleRectOverlap(x, y, r, o)) return true;
    return false;
  }

  // Pre-render floors and walls once into a big offscreen canvas (tiles from tiles_floor / tiles_wall, or placeholders).
  renderStatic() {
    const L = this.L, t = this.tile, a = this.g.assets;
    const c = document.createElement('canvas');
    c.width = L.width; c.height = L.height;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const floorImg = a.get('tiles_floor'), wallImg = a.get('tiles_wall'), decorImg = a.get('wall_decor');
    const sheetImg = (k) => (k ? a.get(k) : floorImg);
    const faces = new Map(L.faces.map(([x, y, k]) => [this.at(x, y), k]));
    const ts = a.cell('tiles_floor')[0];
    const tileAt = (img, col, row, x, y) => ctx.drawImage(img, col * ts, row * ts, ts, ts, x * t, y * t, t, t);

    for (let y = 0; y < L.MAP_H; y++) for (let x = 0; x < L.MAP_W; x++) {
      const i = this.at(x, y);
      let type = this.floor[i];
      if (type && !this.wall[i] && this.worn.has(i)) type = this.worn.get(i);
      if (type && !this.wall[i]) {
        const f = FLOOR[type];
        let [col, row] = f.checker ? f.cells[(x + y) % f.cells.length] : f.cells[0];
        let img = sheetImg(f.sheet);
        const h = hash(x, y);
        let acc = 0;
        for (const [ec, er, p, sh] of f.extra || []) {
          acc += p;
          if (h < acc) { if (!sh || a.get(sh)) { col = ec; row = er; img = sheetImg(sh); } break; }
        }
        if (img) tileAt(img, col, row, x, y);
        else {
          ctx.fillStyle = f.ph; ctx.fillRect(x * t, y * t, t, t);
          ctx.fillStyle = 'rgba(27,26,46,0.12)';
          if (type === 'tatami' || type === 'tatamiEdge') ctx.fillRect(x * t, y * t + ((x + y) % 2 ? 0 : t / 2), t, 3);
          else if (type === 'kitchen') { if ((x + y) % 2) ctx.fillRect(x * t, y * t, t, t); }
          else { ctx.fillRect(x * t, y * t + t - 3, t, 3); ctx.fillRect(x * t + t - 3, y * t, 3, t); }
          if (col !== f.cells[0][0] || row !== f.cells[0][1]) { ctx.fillStyle = 'rgba(27,26,46,0.2)'; ctx.fillRect(x * t + 15, y * t + 15, 15, 12); }
        }
      }
    }
    const dim = this.C.visuals?.floorDim ?? 0;
    if (dim > 0) { ctx.fillStyle = `rgba(27,26,46,${dim})`; ctx.fillRect(0, 0, c.width, c.height); }

    // walls: a wall tile with open floor below shows its FRONT FACE, otherwise its TOP (cap)
    for (let y = 0; y < L.MAP_H; y++) for (let x = 0; x < L.MAP_W; x++) {
      const i = this.at(x, y), w = this.wall[i];
      if (!w) continue;
      const below = y + 1 < L.MAP_H ? this.wall[this.at(x, y + 1)] : 1;
      const showsFace = !below && y + 1 < L.MAP_H;
      let key;
      if (w === 2) {
        const l = x > 0 && this.wall[this.at(x - 1, y)] === 2, r = x + 1 < L.MAP_W && this.wall[this.at(x + 1, y)] === 2;
        key = l && r ? 'partH' : 'partEnd';
      } else key = showsFace ? (faces.get(i) || 'face') : 'cap';
      if (WALL_DECOR[key]) {
        if (decorImg) { tileAt(decorImg, ...WALL_DECOR[key], x, y); continue; }
        if (wallImg) tileAt(wallImg, ...WALL.face, x, y); else this.placeholderWall(ctx, 'face', x * t, y * t, t);
        ctx.fillStyle = PAL.ink; ctx.fillRect(x * t + 12, y * t + 9, 24, 21);
        ctx.fillStyle = { extinguisher: PAL.red, exit: PAL.moss, safety: PAL.moss, hangplant: PAL.moss, clock: PAL.cream, tv: PAL.indigo, aircon: PAL.cream }[key] || PAL.ochre;
        ctx.fillRect(x * t + 15, y * t + 12, 18, 15);
        continue;
      }
      if (wallImg && key === 'cap') {
        // wall tops: a calm solid colour reads better than a repeated tile
        ctx.fillStyle = '#3B3A45'; ctx.fillRect(x * t, y * t, t, t);
        ctx.fillStyle = '#4C4B57';
        if (!(y > 0 && this.wall[this.at(x, y - 1)] === 1)) ctx.fillRect(x * t, y * t, t, 3);
        if (!(x > 0 && this.wall[this.at(x - 1, y)] === 1)) ctx.fillRect(x * t, y * t, 3, t);
        if (!(x + 1 < L.MAP_W && this.wall[this.at(x + 1, y)] === 1)) ctx.fillRect(x * t + t - 3, y * t, 3, t);
      } else if (wallImg) {
        const [col, row] = WALL[key];
        if (w === 2) tileAt(floorImg || wallImg, ...(floorImg ? FLOOR[this.floor[i] || 'carpet'].cells[0] : WALL.cap), x, y);
        tileAt(wallImg, col, row, x, y);
      } else this.placeholderWall(ctx, key, x * t, y * t, t);
    }
    // soft shadow along the foot of walls (things stand IN the room, not on a flat picture)
    ctx.fillStyle = 'rgba(27,26,46,0.22)';
    for (let y = 1; y < L.MAP_H; y++) for (let x = 0; x < L.MAP_W; x++) {
      const i = this.at(x, y);
      if (this.wall[i] || !this.floor[i]) continue;
      if (this.wall[this.at(x, y - 1)] === 1) ctx.fillRect(x * t, y * t, t, 9);
      if (x > 0 && this.wall[this.at(x - 1, y)] === 1) ctx.fillRect(x * t, y * t, 6, t);
    }
    this.staticCanvas = c;
  }

  placeholderWall(ctx, key, x, y, t) {
    if (key === 'cap') {
      ctx.fillStyle = PAL.dgrey; ctx.fillRect(x, y, t, t);
      ctx.fillStyle = PAL.ink; ctx.fillRect(x, y + t - 3, t, 3);
      return;
    }
    if (key === 'partH' || key === 'partEnd') {
      ctx.fillStyle = PAL.grey; ctx.fillRect(x, y + 9, t, t - 15);
      ctx.fillStyle = PAL.dgrey; ctx.fillRect(x, y + t - 9, t, 6);
      ctx.fillStyle = PAL.ink; ctx.fillRect(x, y + 6, t, 3);
      return;
    }
    ctx.fillStyle = PAL.cream; ctx.fillRect(x, y, t, t);
    ctx.fillStyle = PAL.wood; ctx.fillRect(x, y + t - 9, t, 9);
    ctx.fillStyle = PAL.ink; ctx.fillRect(x, y, t, 3);
    if (key === 'window' || key === 'dawnWindow') {
      ctx.fillStyle = PAL.ink; ctx.fillRect(x + 6, y + 6, t - 12, t - 18);
      ctx.fillStyle = key === 'window' ? PAL.indigo : PAL.peach; ctx.fillRect(x + 9, y + 9, t - 18, t - 24);
      ctx.fillStyle = PAL.gold; ctx.fillRect(x + 15, y + 15, 3, 3); ctx.fillRect(x + 27, y + 21, 3, 3);
    } else if (key === 'scroll') {
      ctx.fillStyle = PAL.ink; ctx.fillRect(x + 15, y + 6, 18, 30);
      ctx.fillStyle = PAL.cream; ctx.fillRect(x + 18, y + 9, 12, 24);
      ctx.fillStyle = PAL.dgrey; ctx.fillRect(x + 21, y + 18, 6, 9);
    } else if (key === 'shoji') {
      ctx.fillStyle = PAL.wood; for (let i = 0; i < t; i += 12) ctx.fillRect(x + i, y + 3, 3, t - 12);
      ctx.fillRect(x, y + 18, t, 3);
    } else if (key === 'notice') {
      ctx.fillStyle = PAL.ochre; ctx.fillRect(x + 6, y + 6, t - 12, t - 21);
      ctx.fillStyle = PAL.cream; ctx.fillRect(x + 9, y + 9, 9, 9); ctx.fillRect(x + 24, y + 12, 12, 9);
    } else if (key === 'door' || key === 'noren') {
      ctx.fillStyle = key === 'door' ? PAL.wood : PAL.indigo; ctx.fillRect(x + 6, y + 3, t - 12, t - 12);
    }
  }

  // ---------------------------------------------------------------- path finding (flow fields on the tile grid)
  updateFields() {
    const p = this.player, t = this.tile;
    const px = clamp(Math.floor(p.x / t), 0, this.L.MAP_W - 1), py = clamp(Math.floor(p.y / t), 0, this.L.MAP_H - 1);
    this.field = this.bfs(px, py, this.blocked);
    this.bossField = this.bfs(px, py, this.wall);
  }

  bfs(sx, sy, blocked) {
    const L = this.L, N = L.MAP_W * L.MAP_H;
    const d = new Int32Array(N).fill(-1);
    const q = new Int32Array(N);
    let head = 0, tail = 0;
    d[this.at(sx, sy)] = 0; q[tail++] = this.at(sx, sy);
    while (head < tail) {
      const i = q[head++], x = i % L.MAP_W, y = (i / L.MAP_W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= L.MAP_W || ny >= L.MAP_H) continue;
        const j = this.at(nx, ny);
        if (d[j] >= 0 || blocked[j]) continue;
        d[j] = d[i] + 1; q[tail++] = j;
      }
    }
    return d;
  }

  // Direction to steer towards the player: straight if close, otherwise towards the next tile downhill in the field.
  steer(e, field) {
    const p = this.player, t = this.tile, L = this.L;
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (d < t * 1.6) return [dx / d, dy / d];
    const tx = clamp(Math.floor(e.x / t), 0, L.MAP_W - 1), ty = clamp(Math.floor(e.y / t), 0, L.MAP_H - 1);
    const here = field[this.at(tx, ty)];
    let best = null, bestD = here < 0 ? 1e9 : here;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const nx = tx + ox, ny = ty + oy;
      if (nx < 0 || ny < 0 || nx >= L.MAP_W || ny >= L.MAP_H) continue;
      const v = field[this.at(nx, ny)];
      if (v < 0) continue;
      if (ox && oy && (field[this.at(tx + ox, ty)] < 0 || field[this.at(tx, ty + oy)] < 0)) continue; // no corner cutting
      if (v < bestD) { bestD = v; best = [nx, ny]; }
    }
    if (!best) return [dx / d, dy / d];
    const gx = (best[0] + 0.5) * t - e.x, gy = (best[1] + 0.5) * t - e.y, gd = Math.hypot(gx, gy) || 1;
    return [gx / gd, gy / gd];
  }

  // Banners stay up long enough to read: at least `time`, or minSeconds + perChar × length (config.json → text).
  banner(msg, time = 2.5) {
    const tc = this.C.text || {};
    const t = Math.max(time, (tc.bannerMinSeconds ?? 3) + String(msg).length * (tc.bannerPerChar ?? 0.05));
    this.banners.push({ msg, t, life: t, age: 0 });
  }
  // Floating numbers/labels. Numbers that pop up close together merge (+10 +10 → +20) instead of overlapping.
  float(x, y, msg, color = COLORS.paper) {
    const tc = this.C.text || {}, life = tc.floaterLife ?? 1.6;
    const m = /^([+-])(\d+)$/.exec(msg);
    if (m) {
      const near = this.floaters.find((f) => f.num && f.sign === m[1] && f.color === color && f.life - f.t < 0.5 && Math.abs(f.x - x) < 70 && Math.abs(f.y - y) < 70);
      if (near) { near.num += +m[2]; near.msg = m[1] + near.num; near.t = life; return; }
    }
    this.floaters.push({ x, y, msg, color, t: life, life, num: m ? +m[2] : 0, sign: m ? m[1] : '' });
  }
  fx(kind, x, y, life = 0.25, vy = 0) { this.particles.push({ kind, x, y, t: life, life, vy }); }

  // ---------------------------------------------------------------- update
  update(dt) {
    const inp = this.g.input;
    this.stateT += dt; this.time += dt;
    for (const b of this.banners.slice(0, 2)) { b.t -= dt; b.age += dt; }   // queued banners wait their turn
    this.banners = this.banners.filter((b) => b.t > 0);
    const rise = this.C.text?.floaterRise ?? 28;
    this.floaters.forEach((f) => { f.t -= dt; f.y -= rise * dt; });
    this.floaters = this.floaters.filter((f) => f.t > 0);
    this.particles.forEach((f) => { f.t -= dt; f.y += f.vy * dt; });
    this.particles = this.particles.filter((f) => f.t > 0);
    this.shake = Math.max(0, this.shake - dt * 2);
    this.updateDecor(dt);

    if (this.state === 'email') {
      if (inp.wasPressed('e', ' ', 'Enter') && this.stateT > 0.3) this.startWave();
      return;
    }
    if (this.state === 'burnout') {
      if (Math.random() < dt * 6) this.fx('smoke', this.player.x + rand(-20, 20), this.player.y - 40, 0.8, -50);
      if (this.stateT > 2.2) this.finish('burnout');
      return;
    }
    if (this.state !== 'explore') this.waveTime += dt;

    this.fieldT -= dt;
    if (this.fieldT <= 0) { this.fieldT = 0.25; this.updateFields(); }

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

  // active colleague effects: { speed: {t, v}, slow: {t, v}, damage: {t, v}, weaponBlock: {t} }
  get speedMult() {
    const e = this.player.effects;
    return (e.speed ? e.speed.v : 1) * (e.slow ? e.slow.v : 1);
  }
  get damageMult() { return this.player.effects.damage ? this.player.effects.damage.v : 1; }

  updatePlayer(dt) {
    const p = this.player, pc = this.C.player, inp = this.g.input;
    for (const k of Object.keys(p.effects)) { p.effects[k].t -= dt; if (p.effects[k].t <= 0) delete p.effects[k]; }
    p.meleeCd -= dt; p.rangedCd -= dt; p.invuln -= dt; p.swing -= dt; p.throwT -= dt;

    const ax = inp.axis();
    p.moving = !!(ax.x || ax.y);
    if (p.moving) {
      const len = Math.hypot(ax.x, ax.y);
      p.fx = ax.x / len; p.fy = ax.y / len;
      p.dir = dirOf(ax.x, ax.y, p.dir);
      const sp = pc.speed * this.speedMult;
      const ox = p.x, oy = p.y;
      p.x += p.fx * sp * dt; p.y += p.fy * sp * dt;
      this.collide(p);
      for (const m of this.minibosses) if (m.alive) pushOutCircle(p, m);
      p.walked += Math.hypot(p.x - ox, p.y - oy);   // frames follow real distance → no foot sliding
      const step = Math.floor(p.walked / (this.A.walkStride * 2));   // one footstep per foot contact
      if (step !== p.step) { p.step = step; this.g.audio.sfx('sfx_step'); }
    }

    const blocked = !!p.effects.weaponBlock;
    if (inp.wasPressed('j', ' ') && p.meleeCd <= 0) {
      if (blocked) this.float(p.x, p.y - 80, this.T.weaponBlocked, COLORS.vermilion);
      else this.melee();
    }
    if (inp.wasPressed('k') && p.rangedCd <= 0) {
      if (blocked) this.float(p.x, p.y - 80, this.T.weaponBlocked, COLORS.vermilion);
      else this.throwBall();
    }
  }

  // aim vector from the facing direction (4-way, matches the sprite the player sees)
  aim() {
    const p = this.player;
    return { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] }[p.dir];
  }

  melee() {
    const p = this.player, mc = this.C.player.melee;
    p.meleeCd = mc.cooldown; p.swing = this.A.swingTime;
    this.g.audio.sfx('sfx_melee');
    const half = (mc.arcDegrees * Math.PI) / 360;
    const [fx, fy] = this.aim();
    const face = Math.atan2(fy, fx);
    const inArc = (t) => {
      const d = dist(p.x, p.y, t.x, t.y);
      if (d > mc.range + t.r) return false;
      let diff = Math.atan2(t.y - p.y, t.x - p.x) - face;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      return Math.abs(diff) <= half || d < t.r + p.r;
    };
    const dmg = mc.damage * this.damageMult;
    for (const e of this.enemies) if (inArc(e)) { this.hurtEnemy(e, dmg); e.kx = fx * 380; e.ky = fy * 380; }
    for (const m of this.minibosses) if (m.alive && inArc(m)) this.hurtMiniboss(m, dmg);
    if (this.boss && this.boss.alive && this.boss.active && inArc(this.boss)) this.hurtBoss(dmg);
  }

  throwBall() {
    const p = this.player, rc = this.C.player.ranged;
    p.rangedCd = rc.cooldown; p.throwT = this.A.throwTime;
    const [fx, fy] = this.aim();
    this.g.audio.sfx('sfx_throw');
    this.shots.push({ x: p.x + fx * p.r, y: p.y - 24 + fy * p.r, vx: fx * rc.speed, vy: fy * rc.speed, r: rc.radius, t: rc.lifetime });
  }

  hurtPlayer(amount) {
    const p = this.player;
    if (p.invuln > 0 || this.state === 'burnout') return;
    if (!this.C.debug.godMode) p.mental -= amount;
    p.invuln = this.C.player.invulnerableAfterHit;
    this.stats.damageTaken += amount;
    this.shake = 0.5;
    this.g.audio.sfx('sfx_hurt');
    this.float(p.x, p.y - 90, `-${Math.round(amount)}`, COLORS.vermilion);
  }

  hurtEnemy(e, dmg) {
    e.hp -= dmg; e.hitFlash = 0.12;
    this.fx('spark', e.x + rand(-8, 8), e.y - 20 + rand(-8, 8), 0.12);
    this.g.audio.sfx('sfx_hit');
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      this.fx('smoke', e.x, e.y - 10, 0.4, -40);
      this.stats.killScore += this.C.enemies[e.type].score;
      this.float(e.x, e.y - 40, `+${this.C.enemies[e.type].score}`, COLORS.gold);
    }
  }

  hurtMiniboss(m, dmg) {
    m.hp -= dmg; m.hitFlash = 0.12;
    this.fx('spark', m.x + rand(-30, 30), m.y - 40 + rand(-20, 20), 0.12);
    this.g.audio.sfx('sfx_hit');
    if (m.hp <= 0 && m.alive) {
      m.alive = false;
      this.obstacleCircles = this.obstacleCircles.filter((c) => c !== m);
      this.defeated++;
      this.stats.killScore += this.C.minibosses.score;
      this.shake = 1;
      for (let i = 0; i < 6; i++) this.fx(i % 2 ? 'smoke' : 'star', m.x + rand(-40, 40), m.y - rand(0, 80), 0.7, -60);
      this.g.audio.sfx('sfx_miniboss_down');
      this.float(m.x, m.y - 100, `+${this.C.minibosses.score}`, COLORS.gold);
      const left = this.minibosses.filter((x) => x.alive).length;
      if (left > 0) this.banner(fmt(this.T.minibossDown, { name: this.T.minibossNames[m.id] }), 3);
      else this.startBoss();
    }
  }

  hurtBoss(dmg) {
    const b = this.boss;
    b.hp -= dmg; b.hitFlash = 0.12;
    this.fx('spark', b.x + rand(-40, 40), b.y - 60 + rand(-30, 30), 0.12);
    this.g.audio.sfx('sfx_hit');
    if (b.hp <= 0 && b.alive) {
      b.alive = false;
      this.stats.killScore += this.C.boss.score;
      this.shake = 1.5;
      for (let i = 0; i < 10; i++) this.fx(i % 2 ? 'smoke' : 'star', b.x + rand(-70, 70), b.y - rand(0, 140), 1, -50);
      this.state = 'cleared'; this.stateT = 0;
      this.enemies.forEach((e) => { e.dead = true; this.fx('smoke', e.x, e.y - 10, 0.4, -40); });
      this.hostile = [];
      this.banner(this.T.bossDown, 4);
      this.g.audio.playMusic('music_office');
    }
  }

  updateInteractions(dt) {
    const p = this.player, inp = this.g.input, rc = this.C.recovery, t = this.tile;
    this.coffeeCd -= dt;
    this.prompt = null;

    const near = (r, pad) => circleRectOverlap(p.x, p.y, p.r + pad, r);
    const desk = this.special.desk, coffee = this.special.coffee, lift = this.special.lift;
    if (this.state === 'explore' && desk && near(desk.rect, 40)) {
      this.prompt = this.T.deskPrompt;
      if (inp.wasPressed('e')) { this.state = 'email'; this.stateT = 0; this.g.audio.sfx('sfx_email'); }
    }
    if (coffee && near(coffee.rect, 40)) {
      this.prompt = this.coffeeCd > 0 ? this.T.coffeeCooldown : this.T.coffeePrompt;
      if (inp.wasPressed('e') && this.coffeeCd <= 0) {
        this.restore(rc.coffeeMachine.restore);
        this.coffeeCd = rc.coffeeMachine.cooldown;
        this.fx('smoke', coffee.rect.x + coffee.rect.w / 2, coffee.rect.y - 30, 0.8, -40);
      }
    }
    if (this.state === 'cleared' && lift) {
      const zone = { x: lift.x * t, y: (lift.y + lift.def.h) * t, w: lift.def.w * t, h: t };
      if (near(zone, 50)) {
        this.prompt = this.T.liftPrompt;
        if (inp.wasPressed('e')) this.finish('win');
      }
    }

    // mochi pickups
    for (const m of this.mochi) {
      if (m.respawn > 0) {
        m.respawn -= dt;
        if (m.respawn <= 0) { const s = pick(this.L.mochiSpots); m.x = s.x * t; m.y = s.y * t; }
        continue;
      }
      if (dist(p.x, p.y, m.x, m.y) < p.r + 18) {
        this.restore(rc.mochi.restore, this.T.mochiPickup);
        for (let i = 0; i < 3; i++) this.fx('star', m.x + rand(-16, 16), m.y - rand(10, 30), 0.5, -60);
        m.respawn = rc.mochi.respawnTime;
      }
    }

    // colleagues: entering the aura makes them talk (speech bubble with a line from texts.json),
    // staying inside for dwellTime triggers their effect (config.json → friendlyNpcs.types)
    const fc = this.C.friendlyNpcs;
    for (const n of this.npcs) {
      n.rearm -= dt; n.cheer -= dt;
      if (n.say) { n.say.t -= dt; if (n.say.t <= 0) n.say = null; }
      const inside = dist(p.x, p.y, n.x, n.y) < fc.auraRadius;
      if (inside && !n.wasInside && !n.say) this.say(n, pick(this.T.npcLines[n.type] || ['…']), fc.bubbleTime);
      n.wasInside = inside;
      n.inside = inside;
      if (inside && n.rearm <= 0) {
        n.dwell += dt;
        if (n.dwell >= fc.dwellTime) {
          const def = fc.types[n.type];
          n.dwell = 0; n.rearm = fc.rearmTime; n.cheer = 1.2;
          const good = def.group === 'boost';
          if (def.effect === 'heal') this.restore(def.value, this.T.effects.heal);
          else if (def.effect === 'drain') this.drain(def.value);
          else p.effects[def.effect] = { t: def.duration, v: def.value };
          if (def.effect !== 'heal') this.float(n.x, n.y - 120, this.T.effects[def.effect], good ? PAL.gold : PAL.red);
          for (let i = 0; i < 3; i++) this.fx(good ? 'star' : 'smoke', p.x + rand(-20, 20), p.y - rand(40, 80), 0.6, -50);
        }
      } else n.dwell = Math.max(0, n.dwell - dt * 2);
    }
  }

  say(who, line, time) { who.say = { text: line, t: time, shown: 0 }; }

  drain(amount) {
    const p = this.player;
    if (!this.C.debug.godMode) p.mental = Math.max(1, p.mental - amount);   // a colleague can't burn you out on their own
    this.stats.damageTaken += amount;
    this.float(p.x, p.y - 90, `-${amount}`, PAL.red);
  }

  restore(amount, label) {
    const p = this.player;
    p.mental = Math.min(this.C.player.mentalMax, p.mental + amount);
    this.g.audio.sfx('sfx_pickup');
    this.float(p.x, p.y - 90, label || `+${amount}`, PAL.celadon);
  }

  startWave() {
    this.state = 'wave'; this.stateT = 0;
    this.g.audio.playMusic('music_wave');
    this.banner(this.T.waveStart, 3);
    // the day starts: the minibosses show up in their rooms
    for (const m of this.minibosses) {
      m.alive = true; m.deadT = 0; m.hp = m.maxHp; m.x = m.homeX; m.y = m.homeY;
      m.attackT = 0.6;
      for (let i = 0; i < 6; i++) this.fx(i % 2 ? 'smoke' : 'star', m.x + rand(-50, 50), m.y - rand(0, 90), 0.7, -50);
    }
    this.shake = 0.6;
  }

  startBoss() {
    this.state = 'boss'; this.stateT = 0;
    const bc = this.C.boss, t = this.tile, path = this.L.bossPath.map((q) => ({ x: q.x * t, y: q.y * t }));
    this.boss = {
      x: path[0].x, y: path[0].y - t, r: bc.radius, hp: bc.hp, maxHp: bc.hp, alive: true, active: false,
      fireT: bc.fireRing.interval, chargeT: bc.charge.interval, summonT: bc.summon.interval,
      mode: 'enter', modeT: 0, vx: 0, vy: 0, hitFlash: 0, path, fireAnim: 0, animT: 0, talkT: 1, say: null,
    };
    this.banner(this.T.bossIncoming, 4);
    this.g.audio.playMusic('music_boss');
    this.g.audio.sfx('sfx_boss_roar');
    this.shake = 1;
  }

  spawnMinion(x, y, strongChance, kind) {
    if (this.enemies.length >= this.C.maxEnemiesAlive) return;
    const type = Math.random() < strongChance ? 'strong' : 'weak';
    const ec = this.C.enemies[type];
    const e = { type, kind, x, y, r: ec.radius, hp: ec.hp, kx: 0, ky: 0, hitFlash: 0, wob: rand(0, 6), walked: 0, dir: 'down', animT: rand(0, 1) };
    this.collide(e);
    this.fx('smoke', e.x, e.y - 10, 0.3, -30);
    this.enemies.push(e);
  }

  updateMinibosses(dt) {
    for (const m of this.minibosses) {
      m.hitFlash -= dt; m.attackT -= dt; if (!m.alive) m.deadT += dt;
      if (m.say) { m.say.t -= dt; if (m.say.t <= 0) m.say = null; }
    }
    if (this.state !== 'wave') return;
    const mc = this.C.minibosses, esc = mc.escalationPerDefeat;
    const interval = mc.spawnInterval * Math.pow(esc.spawnIntervalMultiplier, this.defeated);
    const perSpawn = mc.minionsPerSpawn + esc.minionsPerSpawnAdd * this.defeated;
    const strong = Math.min(1, mc.strongChance + esc.strongChanceAdd * this.defeated);
    const p = this.player, leash = mc.leashTiles * this.tile;
    for (const m of this.minibosses) {
      if (!m.alive) continue;
      const near = dist(p.x, p.y, m.x, m.y) <= mc.spawnActivationDistance;
      // walk: after the player while they are close, back home when the leash runs out
      const fromHome = dist(m.x, m.y, m.homeX, m.homeY);
      let gx = null, gy = null;
      if (near && dist(p.x, p.y, m.homeX, m.homeY) < leash + 200 && dist(p.x, p.y, m.x, m.y) > m.r + p.r + 20) { gx = p.x; gy = p.y; }
      else if (fromHome > 30) { gx = m.homeX; gy = m.homeY; }
      m.moving = false;
      if (gx !== null && m.attackT <= 0) {
        const dx = gx - m.x, dy = gy - m.y, d = Math.hypot(dx, dy) || 1;
        const ox = m.x, oy = m.y;
        m.x += (dx / d) * mc.walkSpeed * dt; m.y += (dy / d) * mc.walkSpeed * dt;
        if (dist(m.x, m.y, m.homeX, m.homeY) > leash) { m.x = ox; m.y = oy; }
        this.collide(m);
        const moved = Math.hypot(m.x - ox, m.y - oy);
        m.walked += moved; m.moving = moved > 0.2;
        if (Math.abs(dx) > 4) m.flip = dx > 0;
      }
      if (!near) continue;
      m.talkT -= dt;
      if (m.talkT <= 0) { m.talkT = mc.talkInterval + rand(0, 3); this.say(m, pick(this.T.bossLines[m.id] || ['…']), 3.5); }
      m.spawnT -= dt;
      if (m.spawnT <= 0) {
        m.spawnT = interval; m.attackT = 0.5;
        for (let i = 0, n = chanceRound(perSpawn * (mc.minionAmount ?? 1)); i < n; i++) {
          const a = rand(0, Math.PI * 2);
          this.spawnMinion(m.x + Math.cos(a) * (m.r + 24), m.y + Math.sin(a) * (m.r + 24), strong, mc.minionOf[m.id]);
        }
      }
      if (dist(p.x, p.y, m.x, m.y) < p.r + m.r + 2) this.hurtPlayer(mc.contactDamage);
    }
  }

  updateBoss(dt) {
    const b = this.boss;
    if (!b) return;
    b.hitFlash -= dt; b.modeT += dt; b.fireAnim -= dt; b.animT += dt;
    if (b.say) { b.say.t -= dt; if (b.say.t <= 0) b.say = null; }
    if (!b.alive) return;
    b.talkT -= dt;
    if (b.talkT <= 0) { b.talkT = this.C.boss.talkInterval + rand(0, 3); this.say(b, pick(this.T.bossLines.ceo || ['…']), 3.5); }
    const bc = this.C.boss, p = this.player;
    const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy) || 1;

    if (b.mode === 'enter') {
      // walk out of the lift along the path into the arena
      const goal = b.path[0];
      const ex = goal.x - b.x, ey = goal.y - b.y, ed = Math.hypot(ex, ey);
      if (ed < 12) { b.path.shift(); if (!b.path.length) { b.mode = 'chase'; b.modeT = 0; b.active = true; } }
      else { b.x += (ex / ed) * bc.speed * 2 * dt; b.y += (ey / ed) * bc.speed * 2 * dt; }
      if (b.modeT > 10) { b.mode = 'chase'; b.active = true; }
      return;
    }

    b.fireT -= dt; b.chargeT -= dt; b.summonT -= dt;
    if (b.mode === 'chase') {
      // the dragon flies over furniture: it only follows the walls-only field
      const [sx, sy] = this.steer(b, this.bossField);
      b.x += sx * bc.speed * dt; b.y += sy * bc.speed * dt;
      if (b.fireT <= 0) {
        b.fireT = bc.fireRing.interval; b.fireAnim = 0.6;
        const n = bc.fireRing.projectiles, off = rand(0, Math.PI);
        for (let i = 0; i < n; i++) {
          const a = off + (i / n) * Math.PI * 2;
          this.hostile.push({ x: b.x, y: b.y - 50, vx: Math.cos(a) * bc.fireRing.speed, vy: Math.sin(a) * bc.fireRing.speed, r: 12, t: 4 });
        }
        this.g.audio.sfx('sfx_boss_roar');
      }
      if (b.summonT <= 0) {
        b.summonT = bc.summon.interval; b.fireAnim = 0.4;
        for (let i = 0, n = chanceRound(bc.summon.count * (this.C.minibosses.minionAmount ?? 1)); i < n; i++) {
          const a = rand(0, Math.PI * 2);
          this.spawnMinion(b.x + Math.cos(a) * (b.r + 30), b.y + Math.sin(a) * (b.r + 30), bc.summon.strongChance, bc.minion);
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
      if (Math.random() < dt * 20) this.fx('smoke', b.x - b.vx * 0.05, b.y, 0.4, -20);
      if (b.modeT >= bc.charge.duration) { b.mode = 'chase'; b.modeT = 0; b.chargeT = bc.charge.interval; }
    }
    const hitWall = this.collide(b, true);
    if (hitWall && b.mode === 'charge') { b.mode = 'chase'; b.chargeT = bc.charge.interval; this.shake = 0.6; }
    if (d < p.r + b.r) {
      this.hurtPlayer(bc.contactDamage);
      p.x += (dx / d) * 30; p.y += (dy / d) * 30;
      this.collide(p);
    }
  }

  updateEnemies(dt) {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const ec = this.C.enemies[e.type];
      e.hitFlash -= dt; e.wob += dt * 8; e.animT += dt;
      const [sx, sy] = this.steer(e, this.field);
      let vx = sx * ec.speed, vy = sy * ec.speed;
      // separation so they don't stack into one blob
      for (const o of this.enemies) {
        if (o === e || o.dead) continue;
        const ox = e.x - o.x, oy = e.y - o.y, od = Math.hypot(ox, oy);
        if (od > 0 && od < e.r + o.r) { vx += (ox / od) * 60; vy += (oy / od) * 60; }
      }
      const bx = e.x, by = e.y;
      e.x += (vx + e.kx) * dt; e.y += (vy + e.ky) * dt;
      e.kx *= 0.85; e.ky *= 0.85;
      this.collide(e);
      for (const m of this.minibosses) if (m.alive) pushOutCircle(e, m);
      e.walked += Math.hypot(e.x - bx, e.y - by);
      e.dir = dirOf(vx, vy, e.dir);
      const d = dist(p.x, p.y, e.x, e.y);
      e.close = d < p.r + e.r + 30;
      if (d < p.r + e.r) this.hurtPlayer(ec.contactDamage);
    }
    this.enemies = this.enemies.filter((e) => !e.dead);
  }

  updateShots(dt) {
    const pr = this.C.player.ranged;
    for (const s of this.shots) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt;
      if (this.hitsObstacle(s.x, s.y + 24, s.r)) { s.t = 0; this.fx('spark', s.x, s.y, 0.1); continue; }
      const dmg = pr.damage * this.damageMult;
      const sy = s.y + 24; // the ball flies at chest height; hit tests use the shadow
      for (const e of this.enemies) if (!e.dead && dist(s.x, sy, e.x, e.y) < s.r + e.r) { this.hurtEnemy(e, dmg); s.t = 0; break; }
      if (s.t <= 0) continue;
      for (const m of this.minibosses) if (m.alive && dist(s.x, sy, m.x, m.y) < s.r + m.r) { this.hurtMiniboss(m, dmg); s.t = 0; break; }
      if (s.t > 0 && this.boss?.alive && this.boss.active && dist(s.x, sy, this.boss.x, this.boss.y) < s.r + this.boss.r) { this.hurtBoss(dmg); s.t = 0; }
    }
    this.shots = this.shots.filter((s) => s.t > 0);

    const p = this.player;
    for (const h of this.hostile) {
      h.x += h.vx * dt; h.y += h.vy * dt; h.t -= dt;
      if (this.hitsObstacle(h.x, h.y + 50, h.r, true)) h.t = 0;
      if (h.t > 0 && dist(h.x, h.y + 50, p.x, p.y) < h.r + p.r) { this.hurtPlayer(this.C.boss.fireRing.damage); h.t = 0; }
    }
    this.hostile = this.hostile.filter((h) => h.t > 0);
  }

  updateCamera() {
    const p = this.player;
    this.cam.x = clamp(p.x - W / 2, 0, this.L.width - W);
    this.cam.y = clamp(p.y - 40 - H / 2, 0, this.L.height - H);
  }

  get score() {
    return Math.max(0, Math.round(this.stats.killScore + this.stats.morning - this.stats.damageTaken * this.C.scoring.pointsLostPerMentalDamage));
  }

  finish(outcome) {
    if (this.finished) return;
    this.finished = true;
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
        morning: this.stats.morning,
      },
    };
    this.g.session.result = result;
    if (outcome === 'win') this.g.go(this.g.scenes.lift());
    else this.g.go(this.g.scenes.end(result));
  }

  // ---------------------------------------------------------------- draw
  draw(ctx) {
    const a = this.g.assets, t = this.tile;
    const sx = this.shake > 0 ? Math.round(rand(-1, 1) * this.shake * 3) * PX : 0;
    const sy = this.shake > 0 ? Math.round(rand(-1, 1) * this.shake * 3) * PX : 0;
    ctx.save();
    ctx.translate(-Math.round(this.cam.x) + sx, -Math.round(this.cam.y) + sy);

    ctx.drawImage(this.staticCanvas, this.cam.x, this.cam.y, W, H, this.cam.x, this.cam.y, W, H);

    // auras: dotted pixel rings
    const fc = this.C.friendlyNpcs;
    for (const n of this.npcs) {
      if (!this.onScreen(n.x, n.y, fc.auraRadius + 20)) continue;
      const def = fc.types[n.type];
      const good = def.group === 'boost';           // green = helps you, red = drains you
      const col = good ? AURA_GOOD : PAL.red;
      // soft coloured glow on the floor inside the aura
      ctx.globalAlpha = n.rearm > 0 ? 0.05 : 0.13 + (Math.floor(this.time * 2) % 2) * 0.03;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(n.x, n.y, fc.auraRadius, fc.auraRadius * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col;
      ctx.globalAlpha = n.rearm > 0 ? 0.25 : 0.7;
      const steps = 40, spin = this.time * 0.4;
      for (let i = 0; i < steps; i += 1) {
        if (i % 2) continue;
        const ang = spin + (i / steps) * Math.PI * 2;
        ctx.fillRect(Math.round((n.x + Math.cos(ang) * fc.auraRadius) / 3) * 3, Math.round((n.y + Math.sin(ang) * fc.auraRadius * 0.6) / 3) * 3, 6, 6);
      }
      if (n.dwell > 0) {
        const k = n.dwell / fc.dwellTime;
        for (let i = 0; i < Math.floor(k * steps); i++) {
          const ang = -Math.PI / 2 + (i / steps) * Math.PI * 2;
          ctx.globalAlpha = 1;
          ctx.fillRect(Math.round((n.x + Math.cos(ang) * 30) / 3) * 3, Math.round((n.y - 120 + Math.sin(ang) * 30) / 3) * 3, 6, 6);
        }
      }
      ctx.globalAlpha = 1;
    }

    // flat things on the floor: clutter, mats
    for (const c of this.clutter) if (this.onScreen(c.x, c.y, 40)) {
      const [col, row, sc] = CLUTTER[c.kind];
      drawFrame(ctx, a, 'props_clutter', col, row, c.x, c.y + 18, { scale: sc, flip: c.flip, color: PAL.cream, ph: [8, 4], eyes: false });
    }
    for (const p of this.props) if (p.def.flat && this.onScreen((p.x + p.def.w / 2) * t, (p.y + 1) * t, 200)) this.drawProp(ctx, p);

    // mochi
    for (const m of this.mochi) if (m.respawn <= 0 && this.onScreen(m.x, m.y, 40)) {
      const f = Math.floor(this.time * 3 + m.x) % 4 === 0 ? FX.mochiSparkle : FX.mochi;
      const hop = Math.floor(this.time * 3 + m.x) % 2 ? -PX : 0;
      ctx.fillStyle = 'rgba(27,26,46,0.35)'; ctx.fillRect(m.x - 15, m.y + 9, 30, 6);
      drawFrame(ctx, a, f[0], f[1], f[2], m.x, m.y + hop, { anchor: 'center', kind: 'pickup', ph: [10, 8], eyes: false });
    }

    // y-sorted world: props, characters
    const list = [];
    for (const p of this.props) {
      if (p.def.flat) continue;
      const bottom = (p.y + p.def.h) * t;
      if (!this.onScreen((p.x + p.def.w / 2) * t, bottom - 70, 200)) continue;
      list.push({ y: bottom, d: () => this.drawProp(ctx, p) });
    }
    for (const n of this.npcs) if (this.onScreen(n.x, n.y, 120)) list.push({ y: n.y, d: () => this.drawNpc(ctx, n) });
    for (const s of this.seats) if (s.worker != null && this.onScreen((s.x + 0.5) * t, (s.y + 1) * t, 120)) list.push({ y: (s.y + 1) * t + (s.dir === 'left' || s.dir === 'right' ? 2 : 0), d: () => this.drawSeated(ctx, s) });
    for (const w of this.walkers) if (this.onScreen(w.x, w.y, 120)) list.push({ y: w.y, d: () => this.drawWalker(ctx, w) });
    for (const m of this.minibosses) if (this.onScreen(m.x, m.y, 160) && (m.alive || m.deadT < 0.6)) list.push({ y: m.y, d: () => this.drawMiniboss(ctx, m) });
    for (const e of this.enemies) if (this.onScreen(e.x, e.y, 80)) list.push({ y: e.y, d: () => this.drawEnemy(ctx, e) });
    if (this.boss) list.push({ y: this.boss.y, d: () => this.drawBoss(ctx) });
    list.push({ y: this.player.y, d: () => this.drawPlayer(ctx) });
    list.sort((p, q) => p.y - q.y).forEach((o) => o.d());
    this.drawSteam(ctx);
    for (const n of this.npcs) if (n.say && this.onScreen(n.x, n.y, 200)) this.drawBubble(ctx, n, n.y - 80);
    for (const m of this.minibosses) if (m.alive && m.say && this.onScreen(m.x, m.y, 200)) this.drawBubble(ctx, m, m.y - m.r - 116);
    if (this.boss?.alive && this.boss.say) this.drawBubble(ctx, this.boss, this.boss.y + this.boss.r - 200);

    this.drawGuideArrow(ctx);

    // your-desk balloon on top of everything
    const desk = this.special.desk;
    if (this.state === 'explore' && desk) {
      const bx = (desk.x + 1.5) * t, by = (desk.y - 1) * t - 12 + (Math.floor(this.time * 3) % 2) * 6;
      ctx.fillStyle = PAL.ink; ctx.fillRect(bx - 18, by - 21, 36, 36);
      ctx.fillStyle = PAL.cream; ctx.fillRect(bx - 15, by - 18, 30, 30);
      ctx.fillStyle = PAL.ink; ctx.fillRect(bx - 3, by + 15, 6, 6);
      text(ctx, '!', bx, by - 2, { size: 26, color: PAL.red, shadow: false });
    }
    // open lift glows
    const lift = this.special.lift;
    if (this.state === 'cleared' && lift) {
      ctx.globalAlpha = 0.35 + (Math.floor(this.time * 4) % 2) * 0.25;
      ctx.fillStyle = PAL.gold;
      ctx.fillRect(lift.x * t - 6, lift.y * t - 6, lift.def.w * t + 12, lift.def.h * t + 12);
      ctx.globalAlpha = 1;
      text(ctx, 'LIFT', (lift.x + lift.def.w / 2) * t, (lift.y - 0.5) * t + (Math.floor(this.time * 3) % 2) * 3, { size: 22, color: PAL.gold });
    }

    for (const s of this.shots) {
      ctx.fillStyle = 'rgba(27,26,46,0.35)'; ctx.fillRect(s.x - 9, s.y + 21, 18, 6);
      const [k, c, r] = FX.paper, spin = Math.floor(this.time * 16) % 4;
      drawFrame(ctx, a, k, c, r, s.x, s.y, { anchor: 'center', flip: spin % 2 === 1, rot: spin >= 2 ? Math.PI : 0, kind: 'fx', color: PAL.cream, ph: [5, 5], eyes: false });
    }
    for (const h of this.hostile) {
      const [k, c, r] = Math.floor(this.time * 8) % 2 ? FX.heart1 : FX.heart2;
      drawFrame(ctx, a, k, c, r, h.x, h.y, { anchor: 'center', kind: 'fx', color: PAL.pink, ph: [7, 7], eyes: false });
    }
    for (const f of this.particles) {
      const [k, c, r] = FX[f.kind];
      drawFrame(ctx, a, k, c, r, f.x, f.y, { anchor: 'center', alpha: clamp(f.t / f.life * 1.5, 0, 1), kind: 'fx', color: f.kind === 'smoke' ? PAL.grey : PAL.gold, ph: [5, 5], eyes: false });
    }

    for (const f of this.floaters) {
      ctx.globalAlpha = clamp(f.t / 0.4, 0, 1);   // full strength until the last 0.4 s
      text(ctx, f.msg, Math.round(f.x), Math.round(f.y / 3) * 3, { size: f.num ? 26 : 22, color: f.color, });
      ctx.globalAlpha = 1;
    }

    if (this.C.debug.showHitboxes) this.drawDebug(ctx);
    ctx.restore();

    this.drawHud(ctx);
  }

  onScreen(x, y, m) {
    return x > this.cam.x - m && x < this.cam.x + W + m && y > this.cam.y - m && y < this.cam.y + H + m * 2;
  }

  drawProp(ctx, p) {
    const t = this.tile, a = this.g.assets, def = p.def;
    if (p.seat != null && this.seats[p.seat]?.worker != null) return;   // the colleague's sheet brings its own chair
    let d = def, name = p.name;
    if (def.anim && a.get(def.anim.sheet)) {
      const an = def.anim, cyc = an.frames.length / an.fps + (an.pause || 0);
      const k = Math.min(an.frames.length - 1, Math.floor(((this.time + p.x * 0.37) % cyc) * an.fps));
      const [col, row] = an.frames[k];
      d = { ...def, sheet: an.sheet, col, row };
    }
    if (p.id === 'desk') { name = this.state === 'explore' && Math.floor(this.time * 2) % 2 ? 'own_desk_mail' : 'own_desk'; d = PROPS[name]; }
    // small free-standing things get a tiny fixed nudge so nothing lines up like a ruler
    const loose = def.w === 1 && !def.wall && p.seat == null && def.solid;
    const jx = loose ? Math.round((hash(p.x, p.y) - 0.5) * 6) * PX : 0, jy = loose ? Math.round((hash(p.y, p.x) - 0.5) * 4) * PX : 0;
    const x = (p.x + def.w / 2) * t + jx, y = (p.y + def.h) * t + jy + p.dy;
    const alpha = p.id === 'coffee' && this.coffeeCd > 0 ? 0.75 : 1;
    const ph = [def.w * 16 - 2, def.h * 16 + 6];
    drawFrame(ctx, a, d.sheet, d.col, d.row, x, y, { scale: def.scale || PX, alpha, flip: p.flip, color: d.ph, ph, label: d.label, eyes: false });
  }

  // A background colleague at a desk (decoration, cannot be talked to).
  drawSeated(ctx, s) {
    const t = this.tile, a = this.g.assets;
    const col = s.act >= 0 ? s.act : loop(WORKER.type, this.time + s.phase, 4);
    const x = (s.x + 0.5) * t, y = (s.y + 1) * t + (s.baked ? -6 : s.dy || 0);
    drawFrame(ctx, a, WORKER_SHEETS[s.worker], col, WORKER_ROW[s.dir], x, y, {
      flip: s.dir === 'right', kind: 'npc', color: [PAL.grey, PAL.wood, PAL.moss, PAL.peach][s.worker], ph: [12, 16], eyes: s.dir !== 'up',
    });
  }

  drawWalker(ctx, w) {
    const a = this.g.assets;
    const [row, flip] = rowOf(w.dir);
    const col = w.moving ? walkFrame(w.walked, this.A.walkStride) : STAND;
    ctx.fillStyle = 'rgba(27,26,46,0.3)'; ctx.fillRect(w.x - 15, w.y - 3, 30, 6);
    drawFrame(ctx, a, w.sheet, col, row, w.x, w.y, { flip, kind: 'npc', color: w.kind === 'coffee' ? PAL.grey : PAL.ochre, ph: [12, 22] });
  }

  // Little pixel puffs of steam rising from the coffee machines and the kettle.
  drawSteam(ctx) {
    ctx.fillStyle = PAL.cream;
    for (const s of this.steamSpots) {
      if (!this.onScreen(s.x, s.y, 60)) continue;
      for (let i = 0; i < 3; i++) {
        const k = (this.time * 0.6 + i / 3) % 1;
        ctx.globalAlpha = 0.55 * (1 - k);
        const px = Math.round((s.x + Math.sin((k + i) * 6) * 6) / 3) * 3, py = Math.round((s.y - k * 36) / 3) * 3;
        ctx.fillRect(px - 3, py, 6, 6);
      }
    }
    ctx.globalAlpha = 1;
  }

  drawPlayer(ctx) {
    const p = this.player, a = this.g.assets, pc = this.C.player, A = this.A;
    const frac = p.mental / pc.mentalMax;
    const posture = frac > pc.postureThresholds.tired ? 'ok' : frac > pc.postureThresholds.burntOut ? 'tired' : 'burnt';
    const [row, flip] = rowOf(p.dir);
    let key = 'player_' + posture, col = STAND, yOff = 0;
    if (p.swing > 0) { key = 'player_actions'; col = p.swing > A.swingTime * 0.55 ? ACTION.windup : ACTION.swing; }
    else if (p.throwT > 0) { key = 'player_actions'; col = ACTION.throw; }
    else if (p.moving) col = walkFrame(p.walked, A.walkStride);
    else yOff = Math.floor(this.time / A.idleBreath) % 2 ? -PX : 0;   // breathing: 1 sprite pixel
    const blink = p.invuln > 0 && Math.floor(p.invuln * 16) % 2;
    let rot = 0;
    if (this.state === 'burnout') { key = 'player_burnt'; col = STAND; rot = this.stateT > 0.5 ? (flip ? -1 : 1) * Math.PI / 2 : 0; }
    ctx.fillStyle = 'rgba(27,26,46,0.35)'; ctx.fillRect(p.x - 21, p.y + p.r - 6, 42, 9);
    drawFrame(ctx, a, key, col, row, p.x, p.y + p.r + yOff, {
      flip, rot, alpha: blink && this.state !== 'burnout' ? 0.35 : 1, flash: p.invuln > pc.invulnerableAfterHit - 0.1,
      kind: 'player', color: { ok: PAL.cream, tired: PAL.peach, burnt: PAL.grey }[posture], ph: [16, 26],
    });

    if (p.swing > 0 && p.swing < A.swingTime * 0.55) {
      const mc = this.C.player.melee, half = (mc.arcDegrees * Math.PI) / 360, [fx, fy] = this.aim(), face = Math.atan2(fy, fx);
      ctx.fillStyle = PAL.cream;
      for (let i = 0; i <= 8; i++) {
        const ang = face - half + (i / 8) * half * 2;
        ctx.fillRect(Math.round((p.x + Math.cos(ang) * (mc.range - 8)) / 3) * 3 - 3, Math.round((p.y - 24 + Math.sin(ang) * (mc.range - 8)) / 3) * 3 - 3, 6, 6);
      }
    }
  }

  drawEnemy(ctx, e) {
    const a = this.g.assets, key = `minion_${e.kind}_${e.type}`;
    const col = e.hitFlash > 0 ? MINION.hit : loop(MINION.move, e.animT, this.A.minionFps);
    const opts = { flip: e.dir === 'right', flash: e.hitFlash > 0.06, kind: 'enemy', ph: e.type === 'weak' ? [20, 16] : [28, 24], eyes: false };
    ctx.fillStyle = 'rgba(27,26,46,0.3)'; ctx.fillRect(e.x - e.r, e.y + e.r - 6, e.r * 2, 6);
    if (e.kind === 'email') {   // flies: flaps above its shadow
      const hover = (Math.floor(e.animT * 4) % 2) * PX;
      drawFrame(ctx, a, key, col, 0, e.x, e.y - 24 - hover, { ...opts, anchor: 'center' });
    } else drawFrame(ctx, a, key, col, 0, e.x, e.y + e.r, opts);
    const h = a.cell(key)[1] * PX;
    this.drawEnemyArrow(ctx, e.x, e.kind === 'email' ? e.y - 24 - h / 2 - 6 : e.y + e.r - h * 0.8 - 6, e.x);
  }

  // Golden guide arrow circling the bunny, pointing at where to go next:
  // your desk before the email is opened, the lift once the CEO is beaten. Hidden when you are already there.
  drawGuideArrow(ctx) {
    const t = this.tile, p = this.player;
    let goal = null;
    if (this.state === 'explore' && this.special.desk) { const d = this.special.desk; goal = { x: (d.x + d.def.w / 2) * t, y: (d.y + d.def.h + 0.6) * t }; }
    if (this.state === 'cleared' && this.special.lift) { const l = this.special.lift; goal = { x: (l.x + l.def.w / 2) * t, y: (l.y + l.def.h + 0.6) * t }; }
    if (!goal) return;
    const dx = goal.x - p.x, dy = goal.y - p.y, d = Math.hypot(dx, dy);
    if (d < t * 2.5) return;
    const ang = Math.atan2(dy, dx), cy = p.y - 40;               // circle around the bunny's middle
    const pulse = Math.floor(this.time * 4) % 2 ? 6 : 0;          // little push towards the goal
    const r = 78 + pulse, ax = p.x + Math.cos(ang) * r, ay = cy + Math.sin(ang) * r;
    // pixel arrow drawn cell by cell on a rotated grid, so it stays chunky at every angle
    // shape: a short shaft (cols 0-6, middle rows) and a wide triangular head ending in a point at col 14
    const u = 5, ca = Math.cos(ang), sa = Math.sin(ang), w = 15, h = 11;
    const inArrow = (i, j) => (i <= 6 ? Math.abs(j - 5) <= 2 : Math.abs(j - 5) <= (14 - i) * 5 / 7 + 0.01);
    const cells = [];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (inArrow(i, j)) {
      const lx = (i - w / 2 + 0.5) * u, ly = (j - h / 2 + 0.5) * u;
      cells.push([Math.round(ax + lx * ca - ly * sa), Math.round(ay + lx * sa + ly * ca), j]);
    }
    ctx.fillStyle = PAL.ink;
    for (const [x, y] of cells) ctx.fillRect(x - 6, y - 6, 12, 12);              // thick dark outline
    for (const [x, y, j] of cells) {                                              // gold body, lighter upper half
      ctx.fillStyle = j < 5 ? '#F7D774' : PAL.gold;
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
    ctx.fillStyle = '#FFF1B8';                                    // sparkle highlight on the tip half
  }

  // A small red pixel arrow bobbing over every enemy's head.
  drawEnemyArrow(ctx, x, y, seed = 0, size = 1) {
    const bob = (Math.floor(this.time * 3 + seed * 0.01) % 2) * PX * 2;
    const u = 3 * size, top = Math.round((y - 18 * size - bob) / 3) * 3, cx = Math.round(x / 3) * 3;
    ctx.fillStyle = PAL.ink;
    for (let i = 0; i < 4; i++) ctx.fillRect(cx - (4 - i) * u - u, top + i * u - u, (4 - i) * 2 * u + 2 * u, u + 2 * u);
    ctx.fillStyle = PAL.red;
    for (let i = 0; i < 4; i++) ctx.fillRect(cx - (4 - i) * u, top + i * u, (4 - i) * 2 * u, u);
  }

  drawMiniboss(ctx, m) {
    const a = this.g.assets;
    let col = loop(MINIBOSS.idle, this.time, this.state === 'wave' ? this.A.minibossAngryFps : this.A.idleFps), row = 0;
    if (m.moving) { row = MINIBOSS.walkRow; col = MINIBOSS.walk[Math.floor(m.walked / this.A.walkStride) % 4]; }
    if (m.attackT > 0) { row = 0; col = MINIBOSS.spawn; }
    if (m.hitFlash > 0 || !m.alive) { row = 0; col = MINIBOSS.hurt; }
    const alpha = m.alive ? 1 : 1 - m.deadT / 0.6;
    ctx.fillStyle = 'rgba(27,26,46,0.35)'; ctx.fillRect(m.x - m.r, m.y + m.r - 9, m.r * 2, 12);
    drawFrame(ctx, a, 'miniboss_' + m.id, col, row, m.x, m.y + m.r, {
      alpha, flip: row === MINIBOSS.walkRow && m.flip, flash: m.hitFlash > 0.06, kind: 'miniboss', color: MB_COLORS[m.id], ph: [52, 46], label: this.T.minibossNames[m.id],
    });
    if (m.alive) {
      bar(ctx, m.x - 48, m.y - m.r - 110, 96, 9, m.hp / m.maxHp, PAL.red);
      this.drawEnemyArrow(ctx, m.x, m.y - m.r - 118, m.x, 1.5);
    }
  }

  drawBoss(ctx) {
    const b = this.boss, a = this.g.assets;
    const enraged = b.hp < b.maxHp * 0.5;
    let row = enraged ? 1 : 0, col = loop(BOSS.idle, b.animT, this.A.bossFps);
    let flash = b.hitFlash > 0.06;
    if (b.fireAnim > 0 || b.mode === 'windup') col = BOSS.fire;
    if (b.mode === 'windup' && Math.floor(b.modeT * 12) % 2) flash = true;
    if (b.hitFlash > 0) { col = BOSS.hurt; row = 0; }
    if (!b.alive) { [col, row] = BOSS.defeated; flash = false; }
    const hover = b.alive && b.mode !== 'charge' ? (Math.floor(b.animT * 2) % 2) * PX : 0;
    ctx.fillStyle = 'rgba(27,26,46,0.4)'; ctx.fillRect(b.x - b.r, b.y + b.r - 12, b.r * 2, 15);
    drawFrame(ctx, a, 'boss_ceo', col, row, b.x, b.y + b.r - hover, {
      flash,
      kind: 'boss', color: enraged ? PAL.dred : PAL.red, ph: [48, 46], label: 'CEO DRAGON',
    });
    if (b.alive) this.drawEnemyArrow(ctx, b.x, b.y + b.r - hover - a.cell('boss_ceo')[1] * PX - 4, 0, 2);
  }

  drawNpc(ctx, n) {
    const a = this.g.assets;
    let col = loop(NPC.idle, this.time + n.x, this.A.idleFps);
    if (n.say && n.say.t > 0.8) col = loop(NPC.talk, this.time, this.A.talkFps / 2);
    if (n.cheer > 0) col = NPC.action;
    ctx.fillStyle = 'rgba(27,26,46,0.3)'; ctx.fillRect(n.x - 21, n.y + 15, 42, 9);
    drawFrame(ctx, a, 'npc_' + n.type, col, 0, n.x, n.y + 21, { kind: 'npc', color: this.C.friendlyNpcs.types[n.type]?.group === 'boost' ? PAL.celadon : PAL.dred, ph: [26, 34], label: n.type });
    if (n.inside && !n.say) text(ctx, this.T.npcNames[n.type], n.x, n.y - 92, { size: 16, color: PAL.cream });
  }

  // Pixel speech bubble above a character; text types out.
  drawBubble(ctx, who, headY) {
    const s = who.say;
    if (!s) return;
    s.shown = Math.min(s.text.length, s.shown + 1.2);
    ctx.font = fontOf(17);
    const lh = Math.round(17 * TEXT.scale * 1.4), maxW = 340, words = s.text.slice(0, Math.floor(s.shown)).split(' '), lines = [];
    let line = '';
    for (const w of words) { const tst = line ? line + ' ' + w : w; if (ctx.measureText(tst).width > maxW && line) { lines.push(line); line = w; } else line = tst; }
    if (line) lines.push(line);
    const full = []; { let l2 = ''; for (const w of s.text.split(' ')) { const tst = l2 ? l2 + ' ' + w : w; if (ctx.measureText(tst).width > maxW && l2) { full.push(l2); l2 = w; } else l2 = tst; } if (l2) full.push(l2); }
    const w = Math.min(maxW, Math.max(...full.map((l) => ctx.measureText(l).width))) + 36, h = full.length * lh + 22;
    const x = clamp(Math.round(who.x - w / 2), this.cam.x + 8, this.cam.x + W - w - 8), y = Math.round(headY - h - 14);
    ctx.globalAlpha = clamp(s.t * 2, 0, 1);
    ctx.fillStyle = PAL.ink; ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    ctx.fillStyle = PAL.cream; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#D9CDB4'; ctx.fillRect(x, y + h - 4, w, 4);
    ctx.fillStyle = PAL.ink; ctx.fillRect(who.x - 7, y + h, 14, 7); ctx.fillRect(who.x - 4, y + h + 7, 8, 6);
    ctx.fillStyle = PAL.cream; ctx.fillRect(who.x - 3, y + h, 6, 6);
    ctx.fillStyle = PAL.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, x + 18, y + 11 + lh / 2 + i * lh));
    ctx.globalAlpha = 1;
  }

  drawDebug(ctx) {
    ctx.strokeStyle = 'cyan'; ctx.lineWidth = 1;
    const t = this.tile;
    for (const p of this.props) if (p.def.solid) ctx.strokeRect(p.rect.x, p.rect.y, p.rect.w, p.rect.h);
    for (const r of this.wallRects) if (this.onScreen(r.x, r.y, 60)) ctx.strokeRect(r.x, r.y, r.w, r.h);
    const circ = (o) => { ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.stroke(); };
    circ(this.player); this.enemies.forEach(circ); this.minibosses.filter((m) => m.alive).forEach(circ);
    if (this.boss?.alive) circ(this.boss);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = `12px ${FONT}`;
    for (let y = 0; y < this.L.MAP_H; y++) for (let x = 0; x < this.L.MAP_W; x++) if (this.onScreen(x * t, y * t, 0) && x % 4 === 0 && y % 4 === 0) ctx.fillText(`${x},${y}`, x * t + 2, y * t + 10);
  }

  drawHud(ctx) {
    const p = this.player, pc = this.C.player, T = this.T;
    const frac = p.mental / pc.mentalMax;
    const posture = frac > pc.postureThresholds.tired ? 'ok' : frac > pc.postureThresholds.burntOut ? 'tired' : 'burntOut';
    // mental health
    const label = `${T.hud.mental} — ${T.posture[posture]}`;
    ctx.font = fontOf(18);
    const hw = Math.max(360, Math.ceil(ctx.measureText(label).width) + 48);
    windowBox(ctx, 16, 16, hw, 84);
    text(ctx, label, 34, 40, { size: 18, align: 'left' });
    bar(ctx, 34, 60, hw - 40, 21, frac, frac > 0.66 ? PAL.celadon : frac > 0.33 ? PAL.gold : PAL.red);
    // effects
    let ex = 30;
    for (const [k, v] of Object.entries(p.effects)) {
      const good = k === 'speed' || k === 'damage';
      text(ctx, `${T.effects[k]} ${Math.ceil(v.t)}s`, ex, 122, { size: 16, align: 'left', color: good ? PAL.gold : PAL.red });
      ex += 170;
    }
    // score / time
    windowBox(ctx, W - 250, 16, 234, 84);
    text(ctx, `${T.hud.score}: ${this.score}`, W - 36, 42, { size: 22, align: 'right', color: PAL.gold });
    const t = Math.floor(this.waveTime);
    text(ctx, `${T.hud.time}: ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`, W - 36, 72, { size: 18, align: 'right' });
    // objective
    if (this.state === 'wave') text(ctx, fmt(T.minibossesLeft, { n: this.minibosses.filter((m) => m.alive).length }), W / 2, H - 28, { size: 20, plate: true });
    if (this.boss?.alive && this.boss.active) {
      text(ctx, T.bossName, W / 2, 28, { size: 20, color: PAL.gold });
      bar(ctx, W / 2 - 250, 48, 500, 15, this.boss.hp / this.boss.maxHp, PAL.red);
    }
    // banners
    const tc = this.C.text || {};
    this.banners.slice(0, 2).forEach((b, i) => {
      ctx.globalAlpha = Math.min(clamp(b.age / (tc.bannerFadeIn ?? 0.2), 0, 1), clamp(b.t / (tc.bannerFadeOut ?? 0.5), 0, 1));
      const y = 150 + i * 56, main = i === 0;
      // big arcade font for the headline when it fits on screen, bold body font otherwise
      const st = { size: main ? 32 : 22 };
      textPlate(ctx, b.msg, W / 2, y, st);
      text(ctx, b.msg, W / 2, y, { ...st, color: main ? PAL.gold : PAL.cream });
      ctx.globalAlpha = 1;
    });
    // interaction prompt
    if (this.prompt && this.state !== 'email') {
      windowBox(ctx, W / 2 - 200, H - 120, 400, 52);
      text(ctx, this.prompt, W / 2, H - 94, { size: 20 });
    }
    if (this.state === 'email') this.drawEmail(ctx);
    if (this.state === 'burnout') {
      ctx.fillStyle = `rgba(27,26,46,${Math.min(0.7, this.stateT * 0.5)})`; ctx.fillRect(0, 0, W, H);
    }
  }

  drawEmail(ctx) {
    const E = this.T.email, x = W / 2 - 340, y = 160, w = 680, h = 340;
    ctx.fillStyle = 'rgba(27,26,46,0.6)'; ctx.fillRect(0, 0, W, H);
    // a 90s office PC window, in pixels
    ctx.fillStyle = PAL.ink; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.fillStyle = PAL.grey; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = PAL.cream; ctx.fillRect(x, y, w, 3); ctx.fillRect(x, y, 3, h);
    ctx.fillStyle = PAL.dgrey; ctx.fillRect(x, y + h - 3, w, 3); ctx.fillRect(x + w - 3, y, 3, h);
    ctx.fillStyle = PAL.indigo; ctx.fillRect(x + 6, y + 6, w - 12, 36);
    text(ctx, 'Inbox (9,999+)', x + 18, y + 25, { size: 18, align: 'left', shadow: false });
    ctx.fillStyle = PAL.grey; ctx.fillRect(x + w - 36, y + 12, 24, 24);
    ctx.fillStyle = PAL.ink; ctx.fillRect(x + w - 30, y + 22, 12, 3);
    ctx.fillStyle = PAL.cream; ctx.fillRect(x + 12, y + 54, w - 24, h - 66);
    text(ctx, E.from, x + 28, y + 80, { size: 20, align: 'left', color: PAL.ink, shadow: false });
    text(ctx, E.subject, x + 28, y + 112, { size: 20, align: 'left', color: PAL.red, shadow: false });
    ctx.fillStyle = PAL.ink; ctx.font = fontOf(22); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    wrapLeft(ctx, E.body, x + 28, y + 164, w - 56, Math.round(22 * TEXT.scale * 1.4));
    text(ctx, E.hint, x + w - 28, y + h - 30, { size: 16, align: 'right', color: PAL.dgrey, shadow: false });
  }
}

function pushOutCircle(c, o) {
  const dx = c.x - o.x, dy = c.y - o.y, d = Math.hypot(dx, dy) || 1, min = c.r + o.r;
  if (d < min) { c.x = o.x + (dx / d) * min; c.y = o.y + (dy / d) * min; }
}

import { W, H, PAL, text, windowBox, pick } from '../engine.js';

// Pause menu, drawn over the frozen scene. Opened with P (and ESC in the office), or automatically
// when the browser tab loses focus. Texts: texts.json → pause.
//   Resume · Controls · Music on/off · Sound on/off · (Test menu) · Retry level · Quit to title
// Retry and Quit ask for a second press so nobody loses a run by accident.
// The test menu (jump to any scene / step, god mode, hitboxes, game speed…) only shows when
// config.json → debug.testMenu is true. Turn it off before showing the game to players.

const MEALS = ['curry', 'miso', 'onigiri', 'ramen'];
const SEATS = ['plain', 'company', 'intern', 'window', 'rooftop', 'manager'];
const SPEEDS = [0.5, 1, 2, 4];
// where the test menu can jump to: [id, scene, how to set it up]
const JUMPS = [
  ['title', (g) => g.scenes.title()],
  ['intro', (g) => g.scenes.intro()],
  ['office', (g) => g.scenes.office()],
  ['officeWave', (g) => { const s = g.scenes.office(); s.briefing = null; s.startWave(); return s; }],
  ['officeBoss', (g) => {
    const s = g.scenes.office(); s.briefing = null; s.startWave();
    s.minibosses.forEach((m) => { m.alive = false; m.deadT = 99; });
    s.obstacleCircles = []; s.defeated = s.minibosses.length; s.startBoss(); return s;
  }],
  ['lift', (g) => g.scenes.lift()],
  ['canteen', (g) => g.scenes.canteen({})],
  ...['collect', 'carry', 'eat', 'boss', 'back'].map((step) => ['canteen_' + step, (g) => g.scenes.canteen({ debug: { step, meal: g.test.meal, seat: g.test.seat } })]),
  ['endWin', (g) => g.scenes.end({ outcome: 'win', score: 1234, breakdown: {}, seconds: 100 })],
  ['endLevel2', (g) => g.scenes.end({ outcome: 'win', level: 2, score: 4321, seconds: 400, rows: [['Test', 4321]], careLine: '' })],
  ['endBurnout', (g) => g.scenes.end({ outcome: 'burnout', score: 99, breakdown: {}, seconds: 60 })],
];
export class PauseMenu {
  constructor(game) {
    this.g = game;
    this.T = game.texts.pause;
    this.i = 0;
    this.view = 'menu';     // 'menu' | 'controls'
    this.confirm = null;    // item id waiting for a second press
    this.t = 0;
    this.tip = pick(this.T.tips || ['']);
    this.ti = 0;            // selected row in the test menu
    // test-menu choices are remembered on the game while it runs
    game.test ||= { jump: 0, meal: 'curry', seat: 'plain' };
  }

  get testEnabled() { return !!this.g.config.debug?.testMenu; }

  get testItems() {
    const g = this.g, T = this.T.test, d = g.config.debug, onOff = (v) => (v ? this.T.on : this.T.off);
    return [
      { id: 'jump', label: `${T.jump}: ${T.targets[JUMPS[g.test.jump][0]]}`, cycle: true },
      { id: 'meal', label: `${T.meal}: ${T.meals[g.test.meal]}`, cycle: true },
      { id: 'seat', label: `${T.seat}: ${T.seats[g.test.seat]}`, cycle: true },
      { id: 'god', label: `${T.god}: ${onOff(d.godMode)}` },
      { id: 'hitboxes', label: `${T.hitboxes}: ${onOff(d.showHitboxes)}` },
      { id: 'speed', label: `${T.speed}: ×${g.speed}`, cycle: true },
      { id: 'heal', label: T.heal },
      { id: 'clear', label: T.clear },
      { id: 'back', label: T.back },
    ];
  }

  // returns false when the pause menu should close
  updateTest() {
    const inp = this.g.input, g = this.g, items = this.testItems, n = items.length;
    if (inp.wasPressed('Escape', 'p', 'Backspace')) { this.view = 'menu'; g.audio.sfx('sfx_ui'); return true; }
    if (inp.wasPressed('w', 'ArrowUp')) { this.ti = (this.ti + n - 1) % n; g.audio.sfx('sfx_ui'); }
    if (inp.wasPressed('s', 'ArrowDown')) { this.ti = (this.ti + 1) % n; g.audio.sfx('sfx_ui'); }
    const it = items[this.ti];
    const step = inp.wasPressed('d', 'ArrowRight') ? 1 : inp.wasPressed('a', 'ArrowLeft') ? -1 : 0;
    const cyc = (list, v, k) => list[(list.indexOf(v) + k + list.length) % list.length];
    if (step && it.cycle) {
      g.audio.sfx('sfx_ui');
      if (it.id === 'jump') g.test.jump = (g.test.jump + step + JUMPS.length) % JUMPS.length;
      if (it.id === 'meal') g.test.meal = cyc(MEALS, g.test.meal, step);
      if (it.id === 'seat') g.test.seat = cyc(SEATS, g.test.seat, step);
      if (it.id === 'speed') g.speed = cyc(SPEEDS, g.speed, step);
    }
    if (!inp.wasPressed('e', ' ', 'Enter')) return true;
    g.audio.sfx('sfx_ui');
    const d = g.config.debug, scene = g.scene;
    switch (it.id) {
      case 'jump': {
        if (!g.session.name) g.session.name = 'Debug Bunny';
        g.go(JUMPS[g.test.jump][1](g));
        return false;
      }
      case 'meal': g.test.meal = cyc(MEALS, g.test.meal, 1); break;
      case 'seat': g.test.seat = cyc(SEATS, g.test.seat, 1); break;
      case 'speed': g.speed = cyc(SPEEDS, g.speed, 1); break;
      case 'god': d.godMode = !d.godMode; break;
      case 'hitboxes': d.showHitboxes = !d.showHitboxes; break;
      case 'heal': if (scene?.player) scene.player.mental = g.config.player.mentalMax; break;
      case 'clear': if (scene?.enemies) { scene.enemies.forEach((e) => { e.dead = true; }); scene.enemies = []; scene.hostile = []; } break;
      case 'back': this.view = 'menu'; break;
      default:
    }
    return true;
  }

  get items() {
    const a = this.g.audio, T = this.T;
    return [
      { id: 'resume', label: T.resume },
      { id: 'controls', label: T.controls },
      { id: 'music', label: `${T.music}: ${a.musicMuted ? T.off : T.on}` },
      { id: 'sound', label: `${T.sound}: ${a.sfxMuted ? T.off : T.on}` },
      ...(this.testEnabled ? [{ id: 'test', label: T.test.title }] : []),
      { id: 'retry', label: this.confirm === 'retry' ? T.confirm : T.retry },
      { id: 'quit', label: this.confirm === 'quit' ? T.confirm : T.quit },
    ];
  }

  // returns false when the menu should close
  update(dt) {
    this.t += dt;
    const inp = this.g.input;
    if (this.view === 'controls') {
      if (inp.wasPressed('e', ' ', 'Enter', 'Escape', 'p', 'Backspace')) { this.view = 'menu'; this.g.audio.sfx('sfx_ui'); }
      return true;
    }
    if (this.view === 'test') return this.updateTest();
    if (inp.wasPressed('Escape', 'p') && this.t > 0.1) return false;
    const n = this.items.length;
    if (inp.wasPressed('w', 'ArrowUp')) { this.i = (this.i + n - 1) % n; this.confirm = null; this.g.audio.sfx('sfx_ui'); }
    if (inp.wasPressed('s', 'ArrowDown')) { this.i = (this.i + 1) % n; this.confirm = null; this.g.audio.sfx('sfx_ui'); }
    if (inp.wasPressed('e', ' ', 'Enter')) {
      const id = this.items[this.i].id, a = this.g.audio;
      this.g.audio.sfx('sfx_ui');
      if (id === 'resume') return false;
      if (id === 'controls') this.view = 'controls';
      if (id === 'test') { this.view = 'test'; this.ti = 0; }
      if (id === 'music') a.setMuted('music', !a.musicMuted);
      if (id === 'sound') { a.setMuted('sfx', !a.sfxMuted); a.sfx('sfx_ui'); }
      if (id === 'retry' || id === 'quit') {
        if (this.confirm !== id) { this.confirm = id; return true; }
        const g = this.g, scene = g.scene;
        g.go(id === 'retry' ? scene.retry() : g.scenes.title());
        return false;
      }
    }
    return true;
  }

  draw(ctx) {
    ctx.fillStyle = 'rgba(15,16,38,0.72)';
    ctx.fillRect(0, 0, W, H);
    const T = this.T;
    if (this.view === 'controls') {
      const lines = T.controlLines, w = 760, h = 120 + lines.length * 46, x = (W - w) / 2, y = (H - h) / 2;
      windowBox(ctx, x, y, w, h);
      text(ctx, T.controls, W / 2, y + 46, { size: 28, color: PAL.gold });
      lines.forEach(([key, what], i) => {
        text(ctx, key, x + 60, y + 104 + i * 46, { size: 20, color: PAL.gold, align: 'left' });
        text(ctx, what, x + 300, y + 104 + i * 46, { size: 20, align: 'left' });
      });
      text(ctx, T.back, x + w - 30, y + h - 26, { size: 16, color: PAL.grey, align: 'right', shadow: false });
      return;
    }
    if (this.view === 'test') { this.drawTest(ctx); return; }
    const items = this.items, w = 480, h = 150 + items.length * 52, x = (W - w) / 2, y = (H - h) / 2;
    windowBox(ctx, x, y, w, h);
    text(ctx, T.title, W / 2, y + 50, { size: 34, color: PAL.gold });
    items.forEach((it, i) => {
      const sel = i === this.i, iy = y + 118 + i * 52;
      if (sel) {
        ctx.fillStyle = PAL.indigo; ctx.fillRect(x + 30, iy - 22, w - 60, 44);
        ctx.fillStyle = PAL.gold; ctx.fillRect(x + 30, iy - 22, 6, 44);
        // blinking pointer
        if (Math.floor(this.t * 3) % 2) text(ctx, '▶', x + 62, iy, { size: 18, color: PAL.gold });
      }
      const danger = it.id === this.confirm;
      text(ctx, it.label, W / 2, iy, { size: 22, color: danger ? PAL.red : sel ? PAL.gold : PAL.cream });
    });
    text(ctx, T.hint, W / 2, y + h - 26, { size: 15, color: PAL.grey, shadow: false });
    // a small real-life tip under the menu
    if (this.tip) text(ctx, this.tip, W / 2, y + h + 40, { size: 18, color: PAL.celadon, plate: true });
  }

  drawTest(ctx) {
    const T = this.T.test, items = this.testItems, w = 640, rowH = 44, h = 140 + items.length * rowH, x = (W - w) / 2, y = (H - h) / 2;
    windowBox(ctx, x, y, w, h, { fill: '#2A1630' });
    text(ctx, T.title, W / 2, y + 44, { size: 30, color: PAL.gold });
    items.forEach((it, i) => {
      const sel = i === this.ti, iy = y + 100 + i * rowH;
      if (sel) {
        ctx.fillStyle = PAL.indigo; ctx.fillRect(x + 26, iy - 19, w - 52, 38);
        ctx.fillStyle = PAL.gold; ctx.fillRect(x + 26, iy - 19, 6, 38);
      }
      text(ctx, (it.cycle && sel ? '◀ ' : '') + it.label + (it.cycle && sel ? ' ▶' : ''), W / 2, iy, { size: 19, color: sel ? PAL.gold : PAL.cream });
    });
    text(ctx, T.hint, W / 2, y + h - 22, { size: 14, color: PAL.grey, shadow: false });
  }
}

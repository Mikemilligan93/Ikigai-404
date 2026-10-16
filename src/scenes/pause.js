import { W, H, PAL, text, windowBox } from '../engine.js';

// Pause menu, drawn over the frozen scene. Opened with P (and ESC in the office), or automatically
// when the browser tab loses focus. Texts: texts.json → pause.
//   Resume · Controls · Music on/off · Sound on/off · Retry level · Quit to title
// Retry and Quit ask for a second press so nobody loses a run by accident.
export class PauseMenu {
  constructor(game) {
    this.g = game;
    this.T = game.texts.pause;
    this.i = 0;
    this.view = 'menu';     // 'menu' | 'controls'
    this.confirm = null;    // item id waiting for a second press
    this.t = 0;
  }

  get items() {
    const a = this.g.audio, T = this.T;
    return [
      { id: 'resume', label: T.resume },
      { id: 'controls', label: T.controls },
      { id: 'music', label: `${T.music}: ${a.musicMuted ? T.off : T.on}` },
      { id: 'sound', label: `${T.sound}: ${a.sfxMuted ? T.off : T.on}` },
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
    if (inp.wasPressed('Escape', 'p') && this.t > 0.1) return false;
    const n = this.items.length;
    if (inp.wasPressed('w', 'ArrowUp')) { this.i = (this.i + n - 1) % n; this.confirm = null; this.g.audio.sfx('sfx_ui'); }
    if (inp.wasPressed('s', 'ArrowDown')) { this.i = (this.i + 1) % n; this.confirm = null; this.g.audio.sfx('sfx_ui'); }
    if (inp.wasPressed('e', ' ', 'Enter')) {
      const id = this.items[this.i].id, a = this.g.audio;
      this.g.audio.sfx('sfx_ui');
      if (id === 'resume') return false;
      if (id === 'controls') this.view = 'controls';
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
  }
}

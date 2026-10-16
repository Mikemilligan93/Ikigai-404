// Leaderboard client: the Cloudflare Worker API at config.leaderboard.apiUrl (worker/scores.js),
// falling back to this browser's localStorage when the API is unreachable (e.g. local testing).

const LOCAL_KEY = 'ikigai404.scores';

export class Leaderboard {
  constructor(cfg) {
    this.cfg = cfg;
    this.online = null; // unknown until the first request
  }

  async top() {
    try {
      const r = await fetch(this.cfg.apiUrl, { headers: { accept: 'application/json' } });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.includes('application/json')) throw new Error(`leaderboard API: HTTP ${r.status} ${await r.text().catch(() => '')}`);
      const data = await r.json();
      this.online = true;
      return data.scores.slice(0, this.cfg.showTop);
    } catch (err) {
      console.warn('Leaderboard offline, using this browser only.', err.message);
      this.online = false;
      return this.localTop();
    }
  }

  async submit(entry) {
    const clean = {
      name: cleanName(entry.name, this.cfg.nameMaxLength),
      score: Math.max(0, Math.round(entry.score)),
      outcome: entry.outcome,
      seconds: Math.round(entry.seconds),
    };
    try {
      const r = await fetch(this.cfg.apiUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(clean),
      });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !type.includes('application/json')) throw new Error(`leaderboard API: HTTP ${r.status} ${await r.text().catch(() => '')}`);
      const data = await r.json();
      this.online = true;
      return data.scores.slice(0, this.cfg.showTop);
    } catch (err) {
      console.warn('Score not saved online, kept in this browser.', err.message);
      this.online = false;
      const all = this.localAll();
      all.push({ ...clean, at: Date.now() });
      all.sort((a, b) => b.score - a.score);
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(all.slice(0, 100))); } catch {}
      return all.slice(0, this.cfg.showTop);
    }
  }

  localAll() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
  }
  localTop() { return this.localAll().slice(0, this.cfg.showTop); }
}

export function cleanName(name, max) {
  return String(name || '').replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, max) || 'Anonymous Bunny';
}

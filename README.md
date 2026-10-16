# Ikigai 404

Top-down 2D browser game about burnout — Mito Hackathon 2026.
Plain JavaScript + Canvas, no dependencies, no build step.

## Run locally

The game loads JSON files, so it must be served over HTTP (double-clicking `index.html` won't work):

```bash
cd "Ikigai 404"
python3 -m http.server 8000
# open http://localhost:8000
```

Locally the leaderboard falls back to the browser's own storage ("offline" note on the end screen).

## Controls

WASD move · J / Space briefcase strike · K paper ball · E interact · Esc skip (intro, lift)

## What to edit

| File | What |
|---|---|
| `config.json` | All numbers: speeds, damage, HP, spawn rates, escalation, NPC effects, scoring. `debug.startScene` (`title`, `intro`, `office`, `lift`, `end`), `debug.showHitboxes`, `debug.godMode` help testing. |
| `texts.json` | All on-screen text (English). Lines marked PLACEHOLDER need the team's texts. |
| `assets/manifest.json` | Image/audio file names and sizes. Drop a file with that name into `assets/img` or `assets/audio` — no code change needed. |
| `docs/PROMPTS.md` | ChatGPT prompts for every image. |
| `docs/DESIGN.md` | Design document (living). |
| `src/levels/office.js` | Office layout: walls, cubicles, props, miniboss / NPC / mochi positions. |

## Project structure

```
index.html            entry page
config.json           tunable numbers
texts.json            all text
assets/               manifest.json, img/, audio/
src/engine.js         loop, input, assets, audio, drawing helpers
src/main.js           boot
src/leaderboard.js    leaderboard client (API + local fallback)
src/levels/office.js  level 1 layout
src/scenes/           title, intro, office, lift, end
worker/index.js       Cloudflare Worker entry (serves the game + /api/scores)
worker/scores.js      leaderboard API
wrangler.jsonc        Cloudflare config (no build step)
.assetsignore         files NOT published to the web
docs/                 DESIGN.md, PROMPTS.md
```

## Deploy (GitHub → Cloudflare Workers)

The Cloudflare project is a **Worker with static assets**, configured by `wrangler.jsonc`
(no build step — the repo root is the website).

1. Cloudflare → Workers & Pages → the `ikigai-404` project → Settings → Build:
   Build command **empty**, Deploy command `npx wrangler deploy`. Every push to `main` redeploys.
2. Leaderboard: Workers & Pages → **KV** → Create namespace (e.g. `ikigai404-leaderboard`), copy its ID.
   In `wrangler.jsonc` uncomment the `kv_namespaces` line and paste the ID, then commit + push.
   Until then the leaderboard is saved per browser only.
3. Custom domain: project → Settings → Domains & Routes.

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
functions/api/scores.js  Cloudflare Pages Function (leaderboard API)
docs/                 DESIGN.md, PROMPTS.md
```

## Deploy (GitHub → Cloudflare Pages)

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
   Framework preset: **None**. Build command: *(empty)*. Output directory: `/`.
3. Leaderboard: Workers & Pages → KV → create a namespace (e.g. `ikigai404-leaderboard`).
   Pages project → Settings → Bindings → add **KV namespace**, variable name **`LEADERBOARD`**. Redeploy.
4. Custom domain: Pages project → Custom domains.

`functions/api/scores.js` becomes `/api/scores` automatically.

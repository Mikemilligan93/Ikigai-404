# Ikigai 404

Top-down 2D browser game about burnout — Mito Hackathon 2026. 8-bit Japanese pixel-art style.
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
| `config.json` | All numbers: speeds, damage, HP, spawn rates, escalation, NPC effects, scoring (`canteen` = Level 2). `debug.startScene` (`title`, `intro`, `office`, `lift`, `canteen`, `end`), `debug.showHitboxes`, `debug.godMode` help testing. |
| `texts.json` | All on-screen text (English). Lines marked PLACEHOLDER need the team's texts. |
| `assets/manifest.json` | Sprite sheets (grid size, frame size) and audio file names. Drop a file with that name into `assets/img` or `assets/audio` — no code change needed. |
| `docs/PROMPTS.md` | ChatGPT prompts for every sprite sheet (8-bit pixel style). |
| `tools/process_art.py` | Run `python3 tools/process_art.py` after adding ChatGPT images (needs `pip3 install pillow numpy`): removes the magenta, slices the frames, makes real pixel art, snaps to the palette, aligns frames. Originals are kept in `assets/originals/` (not in git). `--redo` re-runs everything, `--preview` writes zoomed previews. |
| `src/sprites.js` | What each frame of each sheet means (walk cycle, actions, props, tiles). Change here if ChatGPT put a pose in another cell. |
| `config.json → animation` | Walk stride, frame rates, typewriter speed. |
| `docs/DESIGN.md` | Design document (living). |
| `src/levels/office.js` | Office floor plan on a tile grid: zones, walls, doors, props, miniboss / NPC / mochi positions. |
| `src/levels/canteen.js` | Level 2 floor plan: canteen zones, tables, free seats (and what each seat is worth), colleague positions, hazards. |

## Testing

**Test menu:** with `config.json → debug.testMenu` set to `true`, the pause menu (P) has a **Test menu**: jump to any scene or canteen step (with the meal and seat you pick), god mode, hitboxes, game speed ×0.5–×4, refill mental health, remove all enemies. Pause works in the intro, both levels and the lift. Set `testMenu` to `false` before showing the game to players.

The same jumps work as URL parameters (they never show in normal play):

- `?scene=office` / `?scene=lift` / `?scene=canteen` — start in that scene
- `?scene=canteen&step=collect|carry|eat|boss|back` — a step of the canteen level, with `&meal=curry|miso|onigiri|ramen` and `&seat=plain|company|intern|window|rooftop|manager`
- `&god=1` — no damage · `&hitboxes=1` — collision boxes · `&clock=1` — a 1-minute lunch clock

## Project structure

```
index.html            entry page
config.json           tunable numbers
texts.json            all text
assets/               manifest.json, img/, audio/
src/engine.js         loop, input, assets, audio, sprite-sheet drawing, pixel UI
src/sprites.js        frame map for every sheet + animation helpers
src/main.js           boot
src/leaderboard.js    leaderboard client (API + local fallback)
src/levels/office.js  level 1 layout
src/levels/canteen.js level 2 layout
src/scenes/           title, intro, office, lift, canteen, end
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

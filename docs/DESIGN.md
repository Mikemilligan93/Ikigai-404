# Ikigai 404 — Design Document v0.4

*Mito Hackathon 2026 · 24 hours to MVP · living document — decisions are updated here*

Changes vs v0.2: visual style pivot to 8-bit pixel art, sprite-sheet animation, themed office zones, the team's cast wired in, first real art (2026-10-16).

---

## 1. Overview

Top-down 2D browser game about burnout in the world of work. A burnt-out bunny in a suit fights
work-related threats in a 90s Japanese office. Desktop browser only, English language.

## 2. Team & roles

| Who | Role |
|---|---|
| Product owner (B. Tóth) | Decisions, Git commit/push, GitHub ↔ Cloudflare link |
| Teammates | Texts (dialogue, burnout lines), NPC type design, art generation in ChatGPT |
| Claude | Code, config/text structure, asset list, ChatGPT prompt drafts |

Reuse of earlier personal projects (e.g. the top-down tech demo) is allowed.

## 3. Tech & architecture

- **Engine:** plain JavaScript (ES modules) + HTML5 Canvas, no external dependencies, no build step.
  *(Phaser was the first choice but packages/CDNs are not reachable from the build environment;
  the zero-dependency version also deploys trivially.)*
- **Hosting:** project folder → GitHub repo → Cloudflare Workers (static assets, no build) → custom domain later.
- **Leaderboard backend:** Cloudflare Worker (`worker/`) + KV namespace, configured in `wrangler.jsonc`.
  Basic checks only (name length/characters, score range). Falls back to browser-local storage
  when the API is not available (e.g. local testing).
- **Editable data:** `config.json` (all tunable numbers), `texts.json` (all on-screen text).
- **Assets:** `assets/img/*.png` and `assets/audio/*` — file names fixed in `assets/manifest.json`. Missing
  files fall back to coloured placeholder shapes, so code never waits for art.

## 4. Visual style

**Pivot 2026-10-16:** the woodblock / illuminated-manuscript style did not work. New style: **8-bit Japanese pixel art**, in the spirit of the top-down tech demo — chunky pixels, dark outlines, Japanese office details (shoji, noren, tatami, maneki-neko, daruma, bonsai, seigaiha).

- **Camera:** classic Japanese RPG three-quarter top-down view, scrolling camera following the player.
- **Intro:** side view (characters drawn 1.5× bigger there). **Lift:** chest-up pixel portraits.
- **Art pipeline:** the team generates each sheet in ChatGPT (grid of frames on flat magenta); `tools/process_art.py` keys out the magenta, finds the frames, shrinks them to real pixel art, snaps sprites to the shared 16-colour palette (backgrounds and floor/wall tiles get their own adaptive palette so gradients survive) and aligns the frames. Originals are kept in `assets/originals/`.
- **Resolution:** everything is drawn at 2× with no smoothing: characters 48 px (bunny, colleagues, strong minions), weak minions 36, minibosses 72, CEO 96, tiles 24, props 72, portraits 96, backgrounds 640×360.
- **Animation:** real frame animation from the sheets — walk cycles follow the distance walked (no foot sliding), idle breathing, attack / hurt / defeated frames, typewriter speech bubbles with mouth movement. Frame meanings: `src/sprites.js`.
- **Player:** 4 directions (right = mirrored left), separate walk sheets for the 3 postures, plus an action sheet (swing, throw).
- **Cast (from the team's ideas.xlsx):** final boss = CEO "We're a family" oni (throws toxic pink hearts, enraged below half HP); 4 walking minibosses on a leash around their room — Evil Client yōkai (meeting room, spawns emails), Printer (archive, paper), Broken Coffee Machine (kitchen, coffee cups), Air Conditioner (server closet, ice cubes); the CEO spawns pink hearts. Every minion has a weak and a strong version. 10 colleagues (5 energy boost, 5 energy vampire) speak their lines from the Copy columns in a speech bubble when you walk up, and apply their effect if you stay; effects are in `config.json → friendlyNpcs`. Intro: crow ticket inspector. Lift boss portrait: shiba in a suit (the team's art; still labelled "The Boss").
- **Variety — themed zones:** open-plan cubicles (12 variants) around the boss arena, kitchen, manager's corner (tatami), meeting room, lift lobby (lift + the healing coffee machine), server closet, archive. Floor plan: 64×40 tiles in `src/levels/office.js`. Enemies path-find through doors and aisles; the CEO walks over furniture.
- **Office life (decor v2, 2026-10-16):** the open plan is laid out as Japanese desk islands (desks facing each other, the section chief at the head, the department head with his back to the windows) plus rows of partitioned cubicles. Desks and chairs come in up / down / left (mirrored right) versions; furniture marked as wall furniture must touch its wall (front view for back walls, side view for side walls; the game warns in the console otherwise). About two thirds of the seats hold a background colleague (4 kinds) who types and now and then sips, calls, stretches or dozes; two colleagues walk fixed routes (coffee run, paper run) and wear a path into the carpet. Floor clutter, wall decorations (clocks, calendars, extinguishers, AC units, exit signs…), animated aquarium / water cooler / fan, steam from the coffee machines and a soft shadow at the foot of every wall. Background colleagues cannot be talked to.
- Art prompts: `docs/PROMPTS.md` (= `claude/ikigai-404-art-prompts.md` in the project) and the Image prompts tab in `docs/ideas.xlsx`.

## 5. Player character

- Burnt-out bunny in a suit carrying a briefcase.
- **WASD** movement, no jumping.
- **Melee:** briefcase strike (J or Space). **Ranged:** paper ball throw (K). Aim = facing direction.
- **Mental health bar** instead of HP.
- **Posture = mental state**, 3 states: OK (>66%), tired (33–66%), nearly burnt out (<33%).

## 6. Flow

1. **Title / name entry** (needed for the leaderboard).
2. **Intro (side view, playable, skippable with Esc):** wakes from a nightmare, sun rises, shakes
   himself. Walks right: flat → metro station → office entrance. The **ticket inspector** (a jerk)
   speaks to him and "starts the misery". No combat.
3. **Level 1 — The office (top-down):**
   - **Explore phase:** free walking, no enemies.
   - **Wave start:** player opens an email at **his own desk** (interact with E).
   - **3 minibosses** appear (objects: printer, broken coffee machine, …) and spawn minions
     (a weak and a strong type). When one miniboss is defeated, the remaining ones spawn
     more / stronger minions.
   - All 3 minibosses defeated → **final boss: the CEO, a dragon in a suit** appears.
4. **Lift cutscene (after the boss fight):** meets the boss, dialogue, chest-up view.
   Content not decided yet; dialogue choices do not matter for now.
5. **Level 2 — the canteen** (lunch, same day): see section 14. The Level 1 score carries over.
6. **End screen:** "Level 3 — coming soon" + total score → leaderboard. (Burning out in Level 1 still ends the run there.)
6. **Burnout (mental health = 0):** no death — he burns out; random funny line
   ("I'd rather open a café", "I'll become a baker instead") → score → leaderboard.

## 7. Mental health recovery

- **Coffee machine** (interact, cooldown) and **mochi** pickups → restore mental health
  (*mochivation*).

## 8. NPCs

- **Friendly colleagues:** each has an aura (hitbox). Standing in it **for a while** (not instantly)
  applies a buff or debuff, e.g. speed boost, slow, weapon block. *Types are being designed by the
  team; the skeleton has one example of each, defined in `config.json`.*
- **Enemies:** work-related mental-health destroyers (emails, requests, …).
  Minions: 1 weak + 1 strong type in the MVP. *Details TBD.*

## 9. Scoring & leaderboard

- Name entered at the start. Score: points for kills and fast completion, minus points for
  damage taken. **Exact rules decided after the first playable version** — all weights in `config.json`.

## 10. Audio

Soundtrack and SFX provided by the team. File names fixed in `assets/manifest.json`; the game runs silently
until the files exist.

---

## 11. MVP cut line

**Must (MVP):** name entry · skippable side-view intro with ticket inspector · scrolling top-down
office · explore → email → wave · 3 minibosses + 2 minion types + escalation · CEO dragon boss ·
melee + ranged · mental health bar + 3 postures · coffee machine + mochi · burnout screen with
random line · end screen with score · online leaderboard · config.json + texts.json.

**Should:** lift dialogue scene · friendly NPC buffs/debuffs (final types) · real art · audio.

**Could:** ~~Level 2 (the canteen)~~ built, see section 14 · more enemy types · score rule polish · screen shake, juice.

## 12. Task breakdown

| # | Task | Owner | Status |
|---|---|---|---|
| 1 | Playable skeleton with placeholders (all scenes) | Claude | done (v0.1 skeleton) |
| 2 | Asset list + ChatGPT prompts (v2, pixel art) | Claude | done |
| 3 | Generate art from prompts, drop into `assets/img` | Team | done (49 sheets, 2026-10-16) |
| 3a | Sprite-sheet pipeline + frame animation + zoned office + team cast | Claude | done (real art processed and in game) |
| 4 | Write texts (intro, inspector, lift, burnout lines) in `texts.json` | Team | open |
| 5 | Define NPC types (buff/debuff) | Team | open |
| 6 | Define enemy / miniboss / boss behaviour | PO + team | open |
| 7 | GitHub repo + Cloudflare Workers deploy + KV binding | PO | open |
| 8 | Scoring rules (after first playtest) | PO | open |
| 9 | Audio files | Team | open |
| 10 | Lift dialogue scene | Claude | after texts |
| 11 | Balancing pass (config.json) | PO + Claude | after playtest |

## 13. Open items

- NPC types and their exact effects.
- Enemy / minion types, miniboss list (beyond printer and coffee machine), boss attack patterns.
- Lift scene content.
- Scoring rules.
- Fine-tune the floor plan once the real prop art is in (footprints in `src/sprites.js`).

## 14. Level 2 — The Canteen (built 2026-10-21)

*Surface joke:* you just want to eat your lunch, and the whole company won't let you.
*Sincere message:* protect your break — eat properly, sit with people who are good for you, switch off for an hour.

**Flow** (`src/scenes/canteen.js`, layout `src/levels/canteen.js`, numbers `config.json → canteen`, texts `texts.json → canteen`):

1. **Order** at the ticket machine (bottom left). The meal is your buff for the whole level:
   curry = harder briefcase · miso = slow mental-health regen · onigiri = faster · ramen = dishes heal ×2 but eat slowly.
2. **Collect** the tray from the obachan at the counter. Say hello to her *before* buying the ticket → a bonus side dish.
3. **Carry.** Taking the tray wakes the **Ramen Bowl** miniboss (walks the hall on a leash, shoots tempura shrimp — single aimed shot, then a fan of 3; below half HP a noodle whip; spawns rolling narutomaki and bouncing eggs). With the tray in your hands you are slower and can't attack; a hit spills a dish (one spill per 3 s). Put the tray down on any table (E) to fight, pick it up again (E). The defeated Ramen Bowl becomes a healing bowl of ramen.
4. **Sit.** Free seats show an empty stool (gold arrows once the Ramen Bowl is beaten). Seats: plain · next to a kind colleague (bonus) · with the lonely intern (bonus, they cheer up) · window counter · rooftop bench through the stair door (big bonus) · tatami next to the managers (penalty, the boss comes immediately).
5. **Eat:** hold E, dish by dish (each heals). Halfway through, **Rokurokubi** (long-necked department head) cranes his neck over the table — "Quick sync?" — and you stand up. His head strikes along a telegraphed red line, he summons calendar invites, "quick question" spirits and pagers (ranged pings); below half HP his neck coils round the hall after a red ring warning. The head can be hit while it is out.
6. **Back to work:** once he's beaten, head for the canteen door (bottom left, glowing EXIT) and press E → end screen ("Level 3 — coming soon"). Sitting back down to finish the tray first is optional and earns the dish points.

**Clock:** 12:00 → 13:00 in `clockMinutes` real minutes (5). Missing 13:00 doesn't burn you out — it costs the on-time bonus and gives a funny line.
**Hazards:** rice-cooker steam bursts (warning puffs, then a blast) and the tray-return conveyor that pushes you along.
**Scoring** (added to the Level 1 score): defeated work, dishes eaten minus spilled, back by 13:00 + minutes left, where you sat, self-care, minus mental damage.

**Level briefing:** each level opens with a small task window (texts.json → `office.briefing`, `canteen.briefing`); E / Space closes it.

**Test menu:** pause (P) → Test menu, when `config.json → debug.testMenu` is true: jump to any scene / step, canteen meal + seat, god mode, hitboxes, game speed, refill mental health, remove enemies.

**Test links** (`?debug` style URL parameters, handled in `src/main.js`):
`?scene=canteen` · `&step=collect|carry|eat|boss|back` · `&meal=curry|miso|onigiri|ramen` · `&seat=plain|company|intern|window|rooftop|manager` · `&god=1` · `&hitboxes=1` · `&clock=1` (a 1-minute lunch).

**Art:** 31 sheets from `docs/ikigai404_canteen_art_prompts.xlsx` (canteen tiles and walls, props, Health Week leftovers, rooftop, Ramen Bowl + minions, Rokurokubi body / head / neck, obachan, intern, colleagues eating, the bunny with a tray and eating, food icons, effects, ticket-machine close-up). Frame meanings: `src/sprites.js` (Level 2 section).

**Changed 2026-10-21:** after Rokurokubi you leave through the door instead of having to sit back down.

**Open:** final texts (all canteen lines are drafts) · the lift dialogue still says "It's 16:58" although lunch follows it · balance pass after a playtest · canteen music (reuses the office tracks) · `canteen_title` card is not used yet.

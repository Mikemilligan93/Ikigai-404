# Ikigai 404 — ChatGPT image prompts (v2 · 8-bit pixel style)

*Style pivot 2026-10-16: the woodblock / manuscript style is dropped (old images moved to `assets/originals/legacy_v1/`). Everything is now 8-bit Japanese pixel art, in the spirit of the top-down tech demo. All images are **sprite sheets** — several frames or objects in one picture — and the game slices and animates them.*

## How to use

1. Copy one whole grey box into ChatGPT as one message. Nothing else to add (except the attachment tip where it says so).
2. Save the image into `assets/img/` with **exactly** the file name shown.
3. In the project folder run `python3 tools/process_art.py` (first time: `pip3 install pillow numpy`). It removes the magenta, finds the frames, shrinks them to real pixel art (one game pixel per ChatGPT "big pixel"), snaps colours to the shared palette and lines the frames up so the animation does not wobble. Originals go to `assets/originals/`.
4. Reload the game — the code animates the frames (walk cycles follow the distance walked, so feet never slide).

Want to check a sheet up close? `python3 tools/process_art.py player_ok --redo --preview` writes `assets/originals/preview_player_ok.png` (8× zoom with the frame grid). If the script says *"spacing was messy"*, look at the preview — usually ChatGPT made the wrong number of rows/columns.

## Rules that make the pipeline work

- **Magenta background, not transparency.** Every sprite sheet uses a flat magenta (#FF00FF) background; the script turns it into transparency. If ChatGPT adds shading, a floor or a checkerboard, reply: *"The background must be one flat pure magenta colour (#FF00FF), no shading, no floor, no checkerboard. Please output it again."*
- **Grid must match.** Check that the number of rows and columns is exactly what the prompt asks for. If not, reply: *"Please redo it with exactly N columns and M rows, evenly spaced, with wide magenta gaps between cells."*
- **Too smooth?** If the result looks like a smooth illustration instead of chunky pixels, reply: *"Make it much lower resolution, real chunky pixel art with big visible square pixels and no anti-aliasing."*
- **Consistency.** Make `player_ok.png` first and attach it when making every other bunny sheet. Make each prop sheet in the same chat as the previous one so the style stays together.
- Rows that say *facing LEFT* are mirrored in code for *facing right*.

## Palette (the script snaps every image to this)

| Name | Hex | Name | Hex |
|---|---|---|---|
| ink black | `#1B1A2E` | ochre | `#B97A2E` |
| night indigo | `#26295A` | wood brown | `#6B4226` |
| slate blue | `#5468A8` | celadon green | `#7FB3A0` |
| paper cream | `#F2E8D5` | moss green | `#3E6B4F` |
| warm grey | `#A39E93` | sakura pink | `#F2A7B8` |
| dark grey | `#5C5A63` | peach | `#F0C9A0` |
| vermilion | `#D9412B` | gold | `#E8B84A` |
| deep red | `#8C2A2A` | sky blue | `#9CC3E6` |

## Sheet overview

The frame meanings are also listed in `src/sprites.js` — if ChatGPT puts a pose in a different cell, change it there instead of regenerating.


| File | Grid (cols × rows) | Frame size in pixels | Contents |
|---|---|---|---|
| `player_ok.png` | 3 × 3 | 32×32 | Player |
| `player_tired.png` | 3 × 3 | 32×32 | Player |
| `player_burnt.png` | 3 × 3 | 32×32 | Player |
| `player_actions.png` | 3 × 3 | 32×32 | Player |
| `player_side.png` | 4 × 2 | 32×48 | Player |
| `player_portrait.png` | 2 × 1 | 64×64 | Player |
| `player_wake.png` | 4 × 2 | 112×72 | Flat |
| `flat_props.png` | 4 × 2 | 48×72 | Flat |
| `boss_ceo.png` | 4 × 2 | 64×64 | Bosses |
| `boss_portrait.png` | 2 × 1 | 64×64 | Bosses |
| `miniboss_client.png` | 4 × 2 | 48×48 | Minibosses |
| `miniboss_printer.png` | 4 × 2 | 48×48 | Minibosses |
| `miniboss_coffee.png` | 4 × 2 | 48×48 | Minibosses |
| `miniboss_ac.png` | 4 × 2 | 48×48 | Minibosses |
| `minion_email_weak.png` | 4 × 1 | 24×24 | Minions |
| `minion_email_strong.png` | 4 × 1 | 32×32 | Minions |
| `minion_paper_weak.png` | 4 × 1 | 24×24 | Minions |
| `minion_paper_strong.png` | 4 × 1 | 32×32 | Minions |
| `minion_coffee_weak.png` | 4 × 1 | 24×24 | Minions |
| `minion_coffee_strong.png` | 4 × 1 | 32×32 | Minions |
| `minion_ice_weak.png` | 4 × 1 | 24×24 | Minions |
| `minion_ice_strong.png` | 4 × 1 | 32×32 | Minions |
| `minion_heart_weak.png` | 4 × 1 | 24×24 | Minions |
| `minion_heart_strong.png` | 4 × 1 | 32×32 | Minions |
| `npc_dog.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_bestie.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_baker.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_expert.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_meeting_saver.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_shouter.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_karen.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_lazy.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_photos.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_hobby.png` | 4 × 1 | 32×32 | Colleagues |
| `npc_inspector.png` | 4 × 1 | 32×48 | Colleagues |
| `tiles_floor.png` | 4 × 4 | 16×16 | Tiles |
| `tiles_wall.png` | 4 × 4 | 16×16 | Tiles |
| `props_cubicles_a.png` | 3 × 2 | 48×48 | Office props |
| `props_cubicles_b.png` | 3 × 2 | 48×48 | Office props |
| `props_manager.png` | 3 × 2 | 48×48 | Office props |
| `props_kitchen.png` | 3 × 2 | 48×48 | Office props |
| `props_archive.png` | 3 × 2 | 48×48 | Office props |
| `props_meeting.png` | 3 × 2 | 48×48 | Office props |
| `props_server.png` | 3 × 2 | 48×48 | Office props |
| `props_misc.png` | 3 × 2 | 48×48 | Office props |
| `tiles_floor_extra.png` | 4 × 4 | 16×16 | Office decor v2 |
| `wall_decor.png` | 4 × 3 | 16×16 | Office decor v2 |
| `props_desks_a.png` | 3 × 2 | 48×48 | Office decor v2 |
| `props_desks_b.png` | 3 × 2 | 48×48 | Office decor v2 |
| `props_chairs.png` | 4 × 2 | 24×24 | Office decor v2 |
| `props_wall_front.png` | 3 × 2 | 48×48 | Office decor v2 |
| `props_wall_side.png` | 3 × 2 | 48×48 | Office decor v2 |
| `props_lounge.png` | 3 × 2 | 48×48 | Office decor v2 |
| `props_clutter.png` | 4 × 2 | 24×24 | Office decor v2 |
| `props_anim.png` | 4 × 3 | 48×48 | Office decor v2 |
| `npc_worker_mouse.png` | 4 × 3 | 32×32 | Office decor v2 |
| `npc_worker_beaver.png` | 4 × 3 | 32×32 | Office decor v2 |
| `npc_worker_frog.png` | 4 × 3 | 32×32 | Office decor v2 |
| `npc_worker_cat.png` | 4 × 3 | 32×32 | Office decor v2 |
| `npc_walker_coffee.png` | 3 × 3 | 32×32 | Office decor v2 |
| `npc_walker_papers.png` | 3 × 3 | 32×32 | Office decor v2 |
| `fx_items.png` | 4 × 2 | 16×16 | Pickups, projectiles and effects |
| `metro_back.png` | full scene | 320×180 | background |
| `metro_platform.png` | full scene | 320×180 | see-through layer |
| `metro_train.png` | 1 × 2 | 400×100 | Metro station |
| `metro_props.png` | 3 × 2 | 72×72 | Metro station |
| `metro_debris.png` | 4 × 2 | 16×16 | Metro station |
| `npc_beggar.png` | 4 × 1 | 48×40 | Street outside the office |
| `street_props.png` | 3 × 2 | 48×48 | Street outside the office |
| `street_petals.png` | 4 × 2 | 16×16 | Street outside the office |
| `title_bg.png` | full scene | 320×180 | background |
| `intro_flat.png` | full scene | 320×180 | background |
| `intro_metro.png` | full scene | 320×180 | background |
| `intro_entrance.png` | full scene | 320×180 | background |
| `lift_interior.png` | full scene | 320×180 | background |

---

## Player — the bunny

### `player_ok.png` — frames 32×32 · grid 3×3

*Generate this first. It is the reference for every other bunny image.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: The main character: a burnt-out white rabbit office worker with long upright ears (soft pink inside), tired half-closed eyes with red rims, a navy-blue suit, white shirt, vermilion tie and brown shoes, carrying a brown leather briefcase. Mood: tired but holding on, ears up, standing straight.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: facing DOWN (towards the viewer): left foot forward | standing still | right foot forward
- Row 2: facing LEFT (side profile): left foot forward | standing still | right foot forward
- Row 3: facing UP (back to the viewer): left foot forward | standing still | right foot forward

Output: PNG, Square image, 1024×1024.
```

### `player_tired.png` — frames 32×32 · grid 3×3

*Attach player_ok.png and add: "Keep the character identical to the attached sprite sheet, only change the posture."*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: The main character: a burnt-out white rabbit office worker with long upright ears (soft pink inside), tired half-closed eyes with red rims, a navy-blue suit, white shirt, vermilion tie and brown shoes, carrying a brown leather briefcase. Mood: tired — shoulders slumped, one ear drooping, tie loosened, briefcase hanging low.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: facing DOWN (towards the viewer): left foot forward | standing still | right foot forward
- Row 2: facing LEFT (side profile): left foot forward | standing still | right foot forward
- Row 3: facing UP (back to the viewer): left foot forward | standing still | right foot forward

Output: PNG, Square image, 1024×1024.
```

### `player_burnt.png` — frames 32×32 · grid 3×3

*Attach player_ok.png and add: "Keep the character identical to the attached sprite sheet, only change the posture."*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: The main character: a burnt-out white rabbit office worker with long upright ears (soft pink inside), tired half-closed eyes with red rims, a navy-blue suit, white shirt, vermilion tie and brown shoes, carrying a brown leather briefcase. Mood: nearly burnt out — hunched, both ears flopped down, briefcase dragging, small grey smoke wisps above his head.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: facing DOWN (towards the viewer): left foot forward | standing still | right foot forward
- Row 2: facing LEFT (side profile): left foot forward | standing still | right foot forward
- Row 3: facing UP (back to the viewer): left foot forward | standing still | right foot forward

Output: PNG, Square image, 1024×1024.
```

### `player_actions.png` — frames 32×32 · grid 3×3

*Attach player_ok.png and add: "Keep the character identical to the attached sprite sheet."*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: The main character: a burnt-out white rabbit office worker with long upright ears (soft pink inside), tired half-closed eyes with red rims, a navy-blue suit, white shirt, vermilion tie and brown shoes, carrying a brown leather briefcase. Action poses.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: facing DOWN: winding up a briefcase swing (briefcase raised behind) | briefcase swung hard forward | throwing a crumpled paper ball forward
- Row 2: facing LEFT: winding up a briefcase swing | briefcase swung hard forward | throwing a crumpled paper ball forward
- Row 3: facing UP (back to viewer): winding up a briefcase swing | briefcase swung hard forward | throwing a crumpled paper ball forward

Output: PNG, Square image, 1024×1024.
```

### `player_side.png` — frames 32×48 · grid 4×2

*Attach player_ok.png and add: "Keep the character identical to the attached sprite sheet."*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: The main character in side view, for the intro: a burnt-out white rabbit office worker with long upright ears (soft pink inside), tired half-closed eyes with red rims, a navy-blue suit, white shirt, vermilion tie and brown shoes, carrying a brown leather briefcase.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×48 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: walking to the RIGHT, four frames of one walk cycle (contact | passing | contact other foot | passing)
- Row 2: lying curled up asleep on his side | sitting up startled with sweat drops | shaking himself awake, ears flapping | standing upright facing right, weary

Output: PNG, Wide landscape image, 1536×1024.
```

### `player_portrait.png` — frames 64×64 · grid 2×1

*Attach player_ok.png and add: "Keep the character identical to the attached sprite sheet."*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: chest-up character portrait, three-quarter view, like a dialogue portrait in a Japanese RPG.

Subject: Portrait of the main character: a burnt-out white rabbit office worker with long upright ears (soft pink inside), tired half-closed eyes with red rims, a navy-blue suit, white shirt, vermilion tie and brown shoes, carrying a brown leather briefcase. He faces to the right. Weary, slightly sarcastic expression. Head, shoulders and chest only.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 2 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 64×64 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: mouth closed | mouth open (talking), otherwise identical

Output: PNG, Wide landscape image, 1536×1024.
```

## Flat (intro): wake-up and props

### `player_wake.png` — frames 112×72 · grid 4×2

*Attach player_ok.png and add: "Keep the character identical to the attached sprite sheet." The futon must stay in the same place in every cell.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: The main character in his tiny apartment, plain side view: a burnt-out white rabbit office worker with long upright ears (soft pink inside), tired half-closed eyes with red rims, a navy-blue suit, white shirt, vermilion tie and brown shoes, carrying a brown leather briefcase. He fell asleep in his crumpled suit after overtime (tie loosened, his briefcase lying on the floor at the RIGHT end of the futon in every cell). A thin red-and-cream Japanese futon with a cherry-blossom blanket and a small pillow lies on the floor on the LEFT side of every cell, always at exactly the same place and size.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the same little scene drawn at about 112×72 pixel-art resolution (each pixel a big visible square block): the futon is in EXACTLY the same place and size in every cell, touching the left and bottom edges of the cell area; only the character changes. Same character design and size in every cell. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: asleep under the blanket, only the head and ears showing on the pillow | the same, little 'z' shapes above the head | eyes snapped wide open in panic, still under the blanket | sitting up on the futon, blanket slid down to the waist
- Row 2: kneeling beside the futon, getting up | standing right next to the futon, stretching both arms up with a huge yawn | standing next to the futon, shaking himself awake, ears flapping | ONLY the empty futon, blanket thrown back, no bunny

Output: PNG, Wide landscape image, 1536×1024.
```

### `flat_props.png` — frames 48×72 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: Objects in a tiny Tokyo apartment, plain side view, all at the same scale (a standing rabbit character would be about as tall as the mirror).

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 48×72 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: tall standing mirror in a wooden frame | the same mirror with a bright sparkle on the glass | a droopy, thirsty potted plant in a ceramic pot with a wave pattern | the same plant perky and green again, with a few water drops and a little sparkle
- Row 2: a fat ginger house cat asleep, curled up on a round cushion | the same cat sitting up on the cushion, looking up | the same cat purring with eyes closed and little pink hearts around it | the same cat stretching on the cushion

Output: PNG, Wide landscape image, 1536×1024.
```

## Bosses

### `boss_ceo.png` — frames 64×64 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: The CEO, final boss: a huge red Japanese oni demon with two horns and small tusks, wearing an expensive black business suit and a pink heart-patterned tie, a fake loving smile, surrounded by a soft pink aura of little hearts. Facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 64×64 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: normal: idle A | idle B (breathing, slightly raised) | throwing pink hearts forward with both hands | hurt (recoiling, eyes squeezed shut)
- Row 2: enraged (suit torn, eyes glowing, aura turns dark pink): idle A | idle B | roaring with mouth wide open | defeated, slumped on the floor

Output: PNG, Wide landscape image, 1536×1024.
```

### `boss_portrait.png` — frames 64×64 · grid 2×1

*Wait for the team.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: chest-up character portrait, three-quarter view, like a dialogue portrait in a Japanese RPG.

Subject: PLACEHOLDER — the boss in the lift is not decided yet. Wait for the team before generating this one. Faces to the left.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 2 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 64×64 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: mouth closed | mouth open (talking), otherwise identical

Output: PNG, Wide landscape image, 1536×1024.
```

## Minibosses (walking, possessed office things)

### `miniboss_client.png` — frames 48×48 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: The evil client, a Japanese yōkai: a many-armed creature in a smart-casual blazer with one big demanding eye; its hands hold a smartphone, a thick PDF document, a coffee cup and a giant logo.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 48×48 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (shaking, slightly bigger) | spawning minions (mouth / slot wide open) | hurt (flashing, tilted)
- Row 2: walking to the LEFT (side profile), four frames of one walk cycle

Output: PNG, Wide landscape image, 1536×1024.
```

### `miniboss_printer.png` — frames 48×48 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: An evil beige 1990s office laser printer possessed like a Japanese yōkai: paper spewing from its slot like a long tongue, glowing angry eyes on the control panel, small stubby legs.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 48×48 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (shaking, slightly bigger) | spawning minions (mouth / slot wide open) | hurt (flashing, tilted)
- Row 2: walking to the LEFT (side profile), four frames of one walk cycle

Output: PNG, Wide landscape image, 1536×1024.
```

### `miniboss_coffee.png` — frames 48×48 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A broken, evil office coffee machine with a wide grin, possessed like a Japanese yōkai: leaking murky coffee, a cracked glass pot, a sour-milk tube hanging out, steam rising like oni horns, small legs.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 48×48 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (shaking, slightly bigger) | spawning minions (mouth / slot wide open) | hurt (flashing, tilted)
- Row 2: walking to the LEFT (side profile), four frames of one walk cycle

Output: PNG, Wide landscape image, 1536×1024.
```

### `miniboss_ac.png` — frames 48×48 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: An evil walking air-conditioner unit possessed like a Japanese yōkai: a boxy white AC with frosty vents for a mouth, icicles hanging from it, cold mist around it, stubby legs.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 48×48 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (shaking, slightly bigger) | spawning minions (mouth / slot wide open) | hurt (flashing, tilted)
- Row 2: walking to the LEFT (side profile), four frames of one walk cycle

Output: PNG, Wide landscape image, 1536×1024.
```

## Minions (each boss spawns its own; weak + strong)

### `minion_email_weak.png` — frames 24×24 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A weak enemy minion: a small angry flying email envelope with tiny wings and angry eyebrows.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 24×24 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: flapping: wings up | wings level | wings down | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

### `minion_email_strong.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A strong enemy minion: a huge furious flying email envelope with big wings, red 'urgent' seal marks (symbols only, no text) and bared teeth.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: flapping: wings up | wings level | wings down | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

### `minion_paper_weak.png` — frames 24×24 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A weak enemy minion: a small angry sheet of paper with little legs and a frowning face.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 24×24 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: scuttling: step A | step B | step C | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

### `minion_paper_strong.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A strong enemy minion: a big furious crumpled stack of jammed paper with legs, toner smudges and bared teeth.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: scuttling: step A | step B | step C | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

### `minion_coffee_weak.png` — frames 24×24 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A weak enemy minion: a small angry cracked coffee cup sloshing murky coffee and sour milk, with little legs.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 24×24 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: hopping: crouch | in the air | landing | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

### `minion_coffee_strong.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A strong enemy minion: a big furious cracked coffee cup overflowing with murky coffee and curdled milk, with bared teeth and little legs.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: hopping: crouch | in the air | landing | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

### `minion_ice_weak.png` — frames 24×24 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A weak enemy minion: a small angry ice cube with a frosty frowning face.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 24×24 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: sliding: lean left | upright | lean right | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

### `minion_ice_strong.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A strong enemy minion: a big furious block of ice with sharp icicles and bared teeth.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: sliding: lean left | upright | lean right | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

### `minion_heart_weak.png` — frames 24×24 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A weak enemy minion: a small pink heart that looks loving but is clearly poisonous: sweet smile, green toxic drips.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 24×24 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: floating: up | middle | down | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

### `minion_heart_strong.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A strong enemy minion: a big glowing pink heart with a creepy loving smile, green toxic drips and tiny thorns.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: floating: up | middle | down | hit (squashed, little stars)

Output: PNG, Wide landscape image, 1536×1024.
```

## Colleagues (NPCs from the team's list)

### `npc_dog.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A cute friendly office dog (no clothes), standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | wagging its tail in a happy jump | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_bestie.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A cute cat colleague, the player's work bestie, in a casual office outfit (cardigan and blouse), standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | waving 'come with me' with one paw | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_baker.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A cheerful panda colleague in an office shirt and an apron, standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | holding out a tray of fresh cookies | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_expert.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A kind owl expert colleague with round glasses and a sweater vest, standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | showing his laptop screen | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_meeting_saver.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A sharp fox colleague in a neat shirt and tie, standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | tapping his wristwatch | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_shouter.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A loud hyena middle manager in a tight suit with a loosened tie, standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | yelling with both fists up | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_karen.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A smug blobfish colleague in a blazer and a lanyard, standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | smug finger-point | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_lazy.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A lazy sloth colleague in a wrinkled shirt with a coffee mug, standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | a huge yawn | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_photos.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: An overexcited pig colleague in an office shirt, standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | holding up a phone showing photos | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_hobby.png` — frames 32×32 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: A chatty shrew colleague in a cardigan, standing, facing the viewer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A | idle B (breathing) | holding up a sourdough jar | talking (mouth open)

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_inspector.png` — frames 32×48 · grid 4×1

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: A smug crow metro ticket inspector in a stiff dark-blue uniform with a peaked cap, holding a ticket punch, facing to the LEFT.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×48 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A, chin raised | idle B | punching a ticket | talking with beak open, pointing

Output: PNG, Wide landscape image, 1536×1024.
```

## Tiles (floors and walls)

### `tiles_floor.png` — frames 16×16 · grid 4×4

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: seen from directly above, completely flat.

Subject: Floor tiles for the different zones of a 1990s Japanese office. Make them detailed and realistic for pixel art: a subtle 2–3 tone texture in every tile (carpet pile flecks, tatami straw weave, tile grout lines, metal panel screws), but still calm and low contrast so characters stand out.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 4 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell is one square FLOOR TILE drawn at 16×16 pixel-art resolution (each pixel a big visible block), filling its whole cell, seen from directly above, and tiling seamlessly with itself (left edge continues into right, top into bottom). Tiles in the same row belong together and must also fit next to each other. Low contrast so characters stand out. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: open-plan office carpet, muted celadon green: plain | small seigaiha wave pattern | worn spot | coffee stain
- Row 2: manager's corner tatami mats: plain tatami | tatami with dark border | tatami turned 90° | tatami with a cushion mark
- Row 3: kitchen floor: cream-and-indigo checker tiles | plain cream tiles | wet spot | crumbs
- Row 4: archive and server room: grey metal raised floor panel | grey concrete | floor cable cover | indigo rug with gold border

Output: PNG, Square image, 1024×1024.
```

### `tiles_wall.png` — frames 16×16 · grid 4×4

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Wall and partition tiles for a 1990s Japanese office. Make them detailed and realistic for pixel art: the cream wall has a faint plaster texture, a dark wooden skirting board along its bottom and a thin shadow line under the ceiling; partitions show a grey woven fabric texture with an aluminium top rail. Every wall-face tile uses exactly the same plain wall, skirting board and height, so they line up.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 4 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell is one square WALL or PARTITION tile drawn at 16×16 pixel-art resolution (each pixel a big visible block), filling its whole cell, in the three-quarter top-down view. Neighbouring wall tiles must line up edge to edge. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: wall faces: plain cream wall | wall with a night-sky window | wall with a dawn window | wall with a hanging ink-painting scroll (mountains, no writing)
- Row 2: wall faces: closed wooden door | doorway with an indigo noren curtain | shoji paper screen | cork notice board with pinned papers (no readable text)
- Row 3: grey fabric cubicle partition: horizontal piece | vertical piece | corner piece | end piece
- Row 4: wall tops: wall top cap (seen from above) | top inner corner | top outer corner | square pillar

Output: PNG, Square image, 1024×1024.
```

## Office props (one sheet per zone)

### `props_cubicles_a.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Six different single office cubicles (desk, grey partition, rolling chair, beige CRT monitor), each with a distinct personality.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: tidy salaryman cubicle with neatly aligned folders | messy cubicle with a paper avalanche | overtime cubicle with a pillow under the desk and instant-ramen cups
- Row 2: plant-lover cubicle with a bonsai and a maneki-neko | empty cubicle with moving boxes (someone quit) | lucky cubicle with a red daruma and paper charms

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_cubicles_b.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Six more office workplaces, same scale and style as a set.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: two desks pushed together facing each other (Japanese island desks) | tiny intern desk with a single stool | caffeine addict desk covered in coffee cans
- Row 2: desk buried in sticky notes | THE PLAYER'S OWN DESK: messy, beige CRT monitor, cold coffee, a little rabbit figurine | the same player's desk with the monitor glowing bright gold (new email)

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_manager.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Furniture for the manager's corner.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: large dark wooden manager desk | high-backed leather chair | big bonsai on a stand
- Row 2: golden maneki-neko statue | trophy shelf with golden cups | small koi aquarium

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_kitchen.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Furniture for the office kitchen / break area.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: friendly working coffee machine with a warm golden glow and a steaming cup | water cooler with a big blue bottle | small fridge covered in magnets
- Row 2: low kitchen table with two chairs, teapot and cups | drinks vending machine | counter with a rice cooker and an electric kettle

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_archive.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Furniture for the archive / print room.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: ordinary harmless beige office printer | ordinary fax machine | paper shredder with shreds
- Row 2: grey metal filing cabinets | tall shelf full of binders | stack of cardboard archive boxes

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_meeting.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Furniture for the meeting room.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: long meeting table seen from above-front | office chair | whiteboard with scribbled arrows and boxes (no text)
- Row 2: overhead projector on a cart | wall clock on a stand | tall potted plant

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_server.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Equipment for the server closet.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: server rack with tiny green and red lights | server rack with an open door and cables | tangle of cables on the floor
- Row 2: big standing fan | stack of beige computer towers | small Shinto kamidana shelf with offerings (protecting the servers)

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_misc.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Miscellaneous office objects.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: wooden coat rack with a raincoat and umbrella | umbrella stand | wooden shoe locker
- Row 2: small potted bonsai | red paper lantern on a stand | closed brass art-deco lift door with a floor dial above it

Output: PNG, Wide landscape image, 1536×1024.
```

## Office decor v2 — tiles

### `tiles_floor_extra.png` — frames 16×16 · grid 4×4

*Make in the same chat as tiles_floor.png so the colours match.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: seen from directly above, completely flat.

Subject: Extra floor tiles that mix in with the existing office floor tiles (same muted colours, same detail level, attach tiles_floor.png if you have it).

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 4 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell is one square FLOOR TILE drawn at 16×16 pixel-art resolution (each pixel a big visible block), filling its whole cell, seen from directly above, and tiling seamlessly with itself (left edge continues into right, top into bottom). Tiles in the same row belong together and must also fit next to each other. Low contrast so characters stand out. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: open-plan carpet, muted celadon green: carpet tile with the pile turned 90° | carpet tile one shade darker | worn walking path running left to right | worn walking path running top to bottom
- Row 2: open-plan carpet: with a small floor power-outlet box | with a metal air-vent grille | with a grey cable taped down across it | with a few crumbs and a paper clip
- Row 3: lobby and meeting room: polished cream stone tile with faint veins | the same stone tile with different veins | warm wooden floorboards | wooden floorboards with a knot
- Row 4: kitchen, server room, archive: cream linoleum with speckles | kitchen floor drain | server-room raised floor panel with round vent holes | grey concrete with a yellow-and-black safety stripe running left to right

Output: PNG, Square image, 1024×1024.
```

### `wall_decor.png` — frames 16×16 · grid 4×3

*Make in the same chat as tiles_wall.png so the wall matches.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Wall-face tiles with things mounted on the wall. Every cell is the SAME plain cream office wall face as tiles_wall.png (same skirting board, same height, same colours), with one object hanging on it, so they slot into a wall row.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell is one square WALL or PARTITION tile drawn at 16×16 pixel-art resolution (each pixel a big visible block), filling its whole cell, in the three-quarter top-down view. Neighbouring wall tiles must line up edge to edge. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: round wall clock | paper calendar with a red daruma picture | fire extinguisher in a red wall cabinet | split air-conditioner unit high on the wall
- Row 2: framed motivational poster of a sunrise over a mountain | framed group photo of animal coworkers | light switch and a beige intercom phone | green emergency-exit pictogram sign with a running figure (no letters)
- Row 3: wall-mounted TV showing a bar chart | hanging plant in a macramé holder | row of coat hooks with a grey jacket | green-cross safety notice board

Output: PNG, Square image, 1024×1024.
```

## Office decor v2 — props

### `props_desks_a.png` — frames 48×48 · grid 3×2

*Leave the empty floor where the chair would go — no chairs on this sheet.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Open office desks WITHOUT partitions and WITHOUT chairs (chairs and people are added separately), for a Japanese island layout where desks are pushed together facing each other. Grey steel desks with a beige CRT monitor, keyboard, papers and a desk phone.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: desk where the worker faces UP (sits below the desk): we see the desk top and the monitor SCREEN — tidy desk | messy desk with paper piles | desk with a small cactus and a family photo
- Row 2: the same three desks seen from the OTHER side, where the worker faces DOWN (sits above the desk, facing the viewer): we see the FRONT PANEL of the desk and the BACK of the monitor — tidy | messy | with a cactus

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_desks_b.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: More office furniture in the same style as props_desks_a.png, WITHOUT chairs.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: grey steel desk where the worker faces LEFT (sits to the right of it): monitor seen from the side with its screen pointing right — tidy | messy | with a cactus
- Row 2: section chief's wider desk at the head of a desk island, worker faces DOWN: back of the monitor, an in-tray and a red hanko stamp | free-standing grey fabric partition screen on two feet | long planter box with green plants used as a room divider

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_chairs.png` — frames 24×24 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Empty office chairs in different directions, same scale as the office props (a person would be about 32 pixels tall).

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: dark navy rolling office chair seen from BEHIND (facing up) | the same chair seen from the FRONT (facing down) | the same chair facing LEFT | the same chair rolled away and turned at an angle
- Row 2: steel-and-wood meeting chair seen from BEHIND | from the FRONT | facing LEFT | small round folding stool

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_wall_front.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Furniture that stands with its back flat against a wall, seen from the front. The back edge of each object is a straight line at the top so it sits flush against the wall.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: tall bookshelf with binders and a small daruma | grey steel employee lockers | Japanese recycling station: three bins in red, blue and green (no text)
- Row 2: sink counter with a dish rack and a microwave | low cabinet with a potted plant and a desk phone on top | photocopier with paper stacks and a toner box

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_wall_side.png` — frames 48×48 · grid 3×2

*Mirrored in code for the left wall.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: The SAME six objects as props_wall_front.png (attach it), now standing against a wall on the RIGHT side of the room, so their front faces LEFT. Narrow and deep, seen from the side and slightly above. The right edge of each object is straight so it sits flush against the wall.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: tall bookshelf facing LEFT | steel lockers facing LEFT | recycling station facing LEFT
- Row 2: sink counter facing LEFT | low cabinet facing LEFT | photocopier facing LEFT

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_lounge.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Furniture for the lift lobby and the manager's corner.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: wooden reception counter with a bell and a small ikebana | waiting bench facing DOWN | big potted kentia palm
- Row 2: green golf putting mat with a ball and a putter | low coffee table with magazines | two-seat leather sofa facing DOWN

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_clutter.png` — frames 24×24 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Small flat things lying on an office floor, seen from above. Low and flat, so a character can walk over them.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: scattered papers | tangled power cable with a power strip | crumpled paper balls | a dropped tie and a sticky note
- Row 2: an open cardboard box with stuff | a pair of office slippers | a toppled paper coffee cup with a small brown spill | a stack of magazines tied with string

Output: PNG, Wide landscape image, 1536×1024.
```

### `props_anim.png` — frames 48×48 · grid 4×3

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: Three animated office props, 4 animation frames each. The object stays EXACTLY the same size and place in every frame of a row; only the moving part changes.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: small koi aquarium on a cabinet: frame 1 | frame 2 | frame 3 | frame 4 (the orange koi swim slowly from left to right, bubbles rise)
- Row 2: water cooler with a big blue bottle: frame 1 | frame 2 | frame 3 | frame 4 (a big air bubble rises up through the bottle)
- Row 3: big standing electric fan: frame 1 | frame 2 | frame 3 | frame 4 (the blades turn a quarter turn each frame)

Output: PNG, Wide landscape image, 1536×1024.
```

## Office decor v2 — colleagues at their desks (decoration)

### `npc_worker_mouse.png` — frames 32×32 · grid 4×3

*Typing = hands forward at keyboard height, arms move between A and B.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: a small grey mouse office worker in a white shirt and a thin black tie, SITTING on a dark navy rolling office chair (the chair is part of the picture and identical in every cell). Draw ONLY the person and the chair: NO desk, NO computer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: seen from BEHIND (facing UP, working at a desk above them): typing A | typing B | sipping from a teacup | rubbing his tired eyes
- Row 2: facing DOWN (towards the viewer): typing A | typing B | sipping from a teacup | rubbing his tired eyes
- Row 3: facing LEFT (side profile): typing A | typing B | sipping from a teacup | rubbing his tired eyes

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_worker_beaver.png` — frames 32×32 · grid 4×3

*Typing = hands forward at keyboard height, arms move between A and B.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: a stocky beaver office worker in a mustard cardigan and glasses, SITTING on a dark navy rolling office chair (the chair is part of the picture and identical in every cell). Draw ONLY the person and the chair: NO desk, NO computer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: seen from BEHIND (facing UP, working at a desk above them): typing A | typing B | talking on a beige desk phone | stretching both arms up
- Row 2: facing DOWN (towards the viewer): typing A | typing B | talking on a beige desk phone | stretching both arms up
- Row 3: facing LEFT (side profile): typing A | typing B | talking on a beige desk phone | stretching both arms up

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_worker_frog.png` — frames 32×32 · grid 4×3

*Typing = hands forward at keyboard height, arms move between A and B.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: a green frog office worker in a short-sleeved shirt with a pocket of pens, SITTING on a dark navy rolling office chair (the chair is part of the picture and identical in every cell). Draw ONLY the person and the chair: NO desk, NO computer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: seen from BEHIND (facing UP, working at a desk above them): typing A | typing B | stamping a paper with a red hanko | dozing off, head nodding
- Row 2: facing DOWN (towards the viewer): typing A | typing B | stamping a paper with a red hanko | dozing off, head nodding
- Row 3: facing LEFT (side profile): typing A | typing B | stamping a paper with a red hanko | dozing off, head nodding

Output: PNG, Wide landscape image, 1536×1024.
```

### `npc_worker_cat.png` — frames 32×32 · grid 4×3

*Typing = hands forward at keyboard height, arms move between A and B.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: a calico cat office worker in a cream blouse with a hair bun, SITTING on a dark navy rolling office chair (the chair is part of the picture and identical in every cell). Draw ONLY the person and the chair: NO desk, NO computer.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: seen from BEHIND (facing UP, working at a desk above them): typing A | typing B | writing on a notepad | yawning
- Row 2: facing DOWN (towards the viewer): typing A | typing B | writing on a notepad | yawning
- Row 3: facing LEFT (side profile): typing A | typing B | writing on a notepad | yawning

Output: PNG, Wide landscape image, 1536×1024.
```

## Office decor v2 — colleagues walking around (decoration)

### `npc_walker_coffee.png` — frames 32×32 · grid 3×3

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: a hurried weasel office worker in a grey suit, carrying a paper cup of coffee in one hand.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: facing DOWN (towards the viewer): left foot forward | standing still | right foot forward
- Row 2: facing LEFT (side profile): left foot forward | standing still | right foot forward
- Row 3: facing UP (back to the viewer): left foot forward | standing still | right foot forward

Output: PNG, Square image, 1024×1024.
```

### `npc_walker_papers.png` — frames 32×32 · grid 3×3

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: classic Japanese top-down RPG view (three-quarter view from above and in front): you see the top and the front of things; characters show their face when they face down.

Subject: a slow old tortoise office worker in a brown vest, carrying a tall stack of papers in both arms.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 3 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 32×32 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: facing DOWN (towards the viewer): left foot forward | standing still | right foot forward
- Row 2: facing LEFT (side profile): left foot forward | standing still | right foot forward
- Row 3: facing UP (back to the viewer): left foot forward | standing still | right foot forward

Output: PNG, Square image, 1024×1024.
```

## Pickups, projectiles and effects

### `fx_items.png` — frames 16×16 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: seen from directly above, completely flat.

Subject: Small game items and effects.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows one small item, centred, drawn at about 16×16 pixel-art resolution so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: round pink mochi | the same mochi with a gold sparkle | crumpled ball of paper | small poisonous pink heart projectile with a green drip
- Row 2: the same heart projectile, glowing brighter | white-and-gold hit spark burst | small grey smoke puff | golden star

Output: PNG, Wide landscape image, 1536×1024.
```

## Metro station (layered, animated)

### `metro_back.png` — frames 320×180

*Back layer: the train drives in front of it.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: The far side of a 1990s Tokyo metro station seen from the platform, plain side view: the opposite tunnel wall with white tiles, a red stripe, a few framed advertisement posters (pictures only, no text), round wall lamps and dark tunnel shadows; below it the dark track bed with two shiny rails running straight across the whole picture at about two thirds of the image height. NO train, NO platform in the foreground, NO pillars, NO people — just the wall and the empty tracks.

Draw it as low-resolution pixel art, as if the whole picture were only 320×180 pixels scaled up, so each pixel is a big visible square block.

The picture must tile seamlessly from left to right: the left edge must continue exactly into the right edge (same horizon, same floor and ceiling lines, nothing cut in half at the edges). No characters.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `metro_platform.png` — frames 320×180

*Front layer: pillars and platform go in front of the train. Magenta = see-through.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: The FRONT layer of a 1990s Tokyo metro platform, plain side view: the platform floor with grey tiles across the bottom quarter of the picture, its front edge with a bright yellow tactile safety strip, two thick white-tiled pillars with a red band (one at about one quarter and one at about three quarters of the width) reaching from the floor to the top edge, a dark ceiling beam along the very top with hanging fluorescent lights and a hanging station sign with arrows (no letters). Everything between the pillars above the platform floor is magenta (it will show the tracks and passing trains).

Draw it as low-resolution pixel art, as if the whole picture were only 320×180 pixels scaled up, so each pixel is a big visible square block.

Layout: everything that is NOT part of this layer is a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard) — that area will become see-through in the game. The picture must tile seamlessly from left to right: the left edge must continue exactly into the right edge (same heights, same floor line, same ceiling line, nothing cut in half at the edges). No characters, no train.

Output: PNG, Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `metro_train.png` — frames 400×100 · grid 1×2

*Each car is long and low (about 4 times wider than tall). The code chains them into trains.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: A 1990s Tokyo metro train car in plain side view, silver body with a red stripe along the windows, sliding doors, bright windows with the silhouettes of tired standing commuters (dark simple shapes, no faces), wheels on the bogies at the bottom.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 1 column and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 400×100 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: the front (driver) car, facing LEFT: rounded driver cab with a headlight on the left end, the rest of the car to the right
- Row 2: a middle car: the same body without a cab, flat ends on both sides so cars can be chained one after another

Output: PNG, Wide landscape image, 1536×1024.
```

### `metro_props.png` — frames 72×72 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: Objects on a 1990s Tokyo metro platform, plain side view, all at the same scale (a standing person would be about as tall as the ticket gates are wide).

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: a row of three grey automatic ticket gates with small green arrows | a red drinks vending machine | a station rubbish bin with three openings for separate waste
- Row 2: a plain wooden station bench | a timetable board on a pole (lines and dots, no readable text) | a big advertisement billboard on legs showing a smiling salaryman holding coffee (no text)

Output: PNG, Wide landscape image, 1536×1024.
```

### `metro_debris.png` — frames 16×16 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: Small light things that the draft in a metro tunnel blows along the platform.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows one small item, centred, drawn at about 16×16 pixel-art resolution so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: dry orange maple leaf | the same leaf flipped over, tumbling | a sheet of newspaper (scribbles, no readable text) | the same newspaper crumpled, flapping
- Row 2: an empty white plastic shopping bag, puffed | the same bag flattened, fluttering | a crushed drink can | a paper coffee cup lying on its side

Output: PNG, Wide landscape image, 1536×1024.
```

## Street outside the office

### `npc_beggar.png` — frames 48×40 · grid 4×1

*Sitting character; the code shows a speech bubble above him.*

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: A happy, relaxed old tanuki (Japanese raccoon dog) beggar sitting cross-legged on a flattened cardboard box on the pavement, wearing a patched indigo kimono and a worn straw hat, a dented tin cup in front of him, a few cherry petals on his hat. Plain side view, he faces to the LEFT. He looks completely at peace — much happier than any office worker.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 1 row of equal-sized cells with wide plain magenta gaps between the cells. Every cell shows the exact same character (same design, same colours, same size), centred in its cell, feet on the same baseline. Draw each cell at about 48×40 pixel-art resolution, so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: idle A, eyes closed, smiling | idle B, wiggling his toes, smiling | talking: one paw raised wisely, mouth open | laughing heartily, eyes closed, head tilted back

Output: PNG, Wide landscape image, 1536×1024.
```

### `street_props.png` — frames 48×48 · grid 3×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: Objects on a Tokyo pavement in front of an office building in spring, plain side view, all at the same scale (a standing person would be about as tall as the street lamp is half).

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 3 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows a different object, all drawn at the same scale as if standing on the same office floor (a person would be about 32 pixels tall), each centred in its cell and resting on the bottom of the cell. Each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: a round red Japanese post box on a short post | a parked city bicycle with a front basket | a tall dark-green street lamp
- Row 2: a simple stone-and-wood street bench with a few cherry petals on it | a café chalk sandwich board (drawings of a coffee cup and a cake, no text) | a small stone Jizo statue wearing a red knitted bib, with a tiny offering cup

Output: PNG, Wide landscape image, 1536×1024.
```

### `street_petals.png` — frames 16×16 · grid 4×2

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view, like a 2D side-scrolling game; every figure stands on the bottom edge of its cell.

Subject: Cherry blossom petals blown by the wind, soft sakura pink with a slightly darker pink edge and a tiny notch at the tip.

Layout: a sprite sheet on a solid flat magenta background (#FF00FF, one single pure colour, no shading, no checkerboard). An evenly spaced grid of 4 columns and 2 rows of equal-sized cells with wide plain magenta gaps between the cells. Each cell shows one small item, centred, drawn at about 16×16 pixel-art resolution so each pixel is a big visible square block. No grid lines, borders, labels or numbers. Never use magenta or purple on the subjects themselves.

Cells, left to right, top to bottom:
- Row 1: one petal seen flat | the same petal tilted | the same petal seen from the side (thin) | the same petal tilted the other way
- Row 2: a little cluster of three petals | a whole small five-petal blossom | a petal lying flat on the ground | a tiny twig with two blossoms

Output: PNG, Wide landscape image, 1536×1024.
```

## Full-screen backgrounds

### `title_bg.png` — frames 320×180

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: Title screen: a lone white rabbit in a navy suit, small and seen from behind, standing on a hill in front of a tall office tower at golden dawn, Mount Fuji far away. Large empty sky in the centre for the game title.

Draw it as low-resolution pixel art, as if the whole picture were only 320×180 pixels scaled up, so each pixel is a big visible square block.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `intro_flat.png` — frames 320×180

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: The inside of a tiny, cosy Tokyo apartment at dawn: wooden floor, a big window in the middle with the sun rising over the city and Mount Fuji, a bookshelf and a hanging scroll on the left wall, a small kitchenette corner, the front door on the right with a little genkan step and shoes. IMPORTANT: NO bed, NO futon, NO mirror, NO potted plants and NO animals anywhere (they are added separately). Keep the left third of the floor completely empty (a futon will be placed there) and the bottom sixth of the image as plain floor.

Draw it as low-resolution pixel art, as if the whole picture were only 320×180 pixels scaled up, so each pixel is a big visible square block.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `intro_metro.png` — frames 320×180

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: OLD single-picture metro background, replaced by the metro_* layers above — only used until those exist. A 1990s Tokyo metro station platform: tiled walls, pillars, a ticket turnstile, hanging station signs (symbols only). Keep the bottom sixth of the image as plain floor.

Draw it as low-resolution pixel art, as if the whole picture were only 320×180 pixels scaled up, so each pixel is a big visible square block.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `intro_entrance.png` — frames 320×180

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: The street outside a corporate office building in the morning, cherry trees, glass entrance doors on the right side. Keep the bottom sixth of the image as plain pavement.

Draw it as low-resolution pixel art, as if the whole picture were only 320×180 pixels scaled up, so each pixel is a big visible square block.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `lift_interior.png` — frames 320×180

```text
Art style: retro 8-bit pixel art, like a Japanese console game from around 1990, set in a 1990s Japanese office. Chunky square pixels with hard edges: no anti-aliasing, no blur, no soft shading, no gradients, no painterly or paper texture. Every character and object has a 1-pixel dark ink outline. Flat colours from one small palette only: ink black, night indigo, slate blue, paper cream, warm grey, vermilion red, deep red, gold, ochre, wood brown, celadon green, moss green, sakura pink, peach. Subtle Japanese touches where they fit (seigaiha wave patterns, shoji paper screens, paper lanterns, hanko stamps, maneki-neko, daruma, bonsai). Satirical anthropomorphic animals. Clean, readable game asset. No text, letters, numbers, watermark, signature or frame.

Camera: straight-on front view, no characters in the scene.

Subject: The empty interior of an old brass and polished-wood lift (elevator), seen from inside, a floor indicator dial above the closed doors, warm light.

Draw it as low-resolution pixel art, as if the whole picture were only 320×180 pixels scaled up, so each pixel is a big visible square block.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

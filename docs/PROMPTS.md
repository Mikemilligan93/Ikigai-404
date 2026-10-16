# Ikigai 404 — ChatGPT image prompts

How to use:
1. Paste the **style block** at the start of every prompt (or once per chat, then say "same style").
2. Paste the asset prompt. Ask for **PNG, transparent background** where the table says so.
3. Save with the exact **file name** into `assets/img/`. Reload the game — it's picked up automatically.
4. Generate at ~2× the in-game size (e.g. 128×128 for a 64×64 sprite); keep the aspect ratio.

Consistency tips: generate the player first, then keep that chat open and say "same character" for the
posture variants and the portrait. Same for the CEO dragon (top-down sprite + portrait).

---

## Style block (paste first)

> Art style: a modern 1990s Japanese office drawn as if by a medieval artist — Japanese woodblock
> prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink
> outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged
> paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette
> ranges from night indigo to hopeful golden dawn. Clean readable silhouette, game asset, no text,
> no watermark.

Top-down addition (for all in-office sprites):

> Seen from directly above (top-down view, like a classic 2D top-down game), centred, single object,
> transparent background.

---

## Characters

| File | Size | Prompt |
|---|---|---|
| `player_ok.png` | 64×64, transparent | Top-down view of a white rabbit in a dark business suit holding a leather briefcase, upright confident-but-tired posture, ears up. |
| `player_tired.png` | 64×64, transparent | Same rabbit, same suit and briefcase, shoulders slumped, one ear drooping, tie loosened. |
| `player_burnt.png` | 64×64, transparent | Same rabbit, hunched and exhausted, both ears flopped down, briefcase dragging, small smoke wisps above the head. |
| `player_side.png` | 96×128, transparent | Side view, full body, the same rabbit in a suit walking to the right with a briefcase. (Intro scene.) |
| `player_portrait.png` | 420×420, transparent | Chest-up portrait of the same rabbit in a suit, facing right, weary expression. (Lift scene.) |
| `npc_inspector.png` | 96×128, transparent | Side view, full body: a smug crow (or toad) metro ticket inspector in a stiff uniform and cap, holding a ticket punch, facing left, arrogant pose. |
| `boss_ceo.png` | 150×150, transparent | Top-down view of a huge dragon wearing an expensive pinstripe suit and gold cufflinks, wings folded, menacing. |
| `boss_portrait.png` | 420×420, transparent | Chest-up portrait of "the boss" for the lift scene, facing left. *(Character not decided yet — wait for the team.)* |
| `npc_motivator.png` | 60×60, transparent | Top-down view: cheerful monkey colleague at a rolling office chair, giving a thumbs up, golden glow. |
| `npc_mentor.png` | 60×60, transparent | Top-down view: wise old tortoise colleague with reading glasses and a stack of documents. |
| `npc_complainer.png` | 60×60, transparent | Top-down view: grumpy frog colleague with a dark rain cloud above, arms crossed. |
| `npc_meetinger.png` | 60×60, transparent | Top-down view: fox colleague holding a calendar and a whiteboard marker, overly eager. |

*(NPC animals are suggestions — swap once the team finalises NPC types.)*

## Enemies

| File | Size | Prompt |
|---|---|---|
| `enemy_weak.png` | 36×36, transparent | Top-down view: a small angry flying envelope (email) with tiny bat wings and an "@" seal in vermilion wax. |
| `enemy_strong.png` | 52×52, transparent | Top-down view: a hulking scroll-shaped "urgent request" creature with red stamps all over it, angry eyes. |
| `miniboss_printer.png` | 110×110, transparent | Top-down view: a monstrous beige 1990s office printer possessed like a yōkai, paper spewing from its mouth like a tongue, glowing eyes. |
| `miniboss_coffee.png` | 110×110, transparent | Top-down view: a broken office coffee machine yōkai leaking black coffee, steam horns, cracked glass pot. |
| `miniboss_fax.png` | 110×110, transparent | Top-down view: a haunted fax machine yōkai with ghostly paper streamers and a curly phone-cord tail. |
| `fireball.png` | 24×24, transparent | A small ball of dragon fire painted in flat vermilion and gold, woodblock style. |
| `paper_ball.png` | 20×20, transparent | A crumpled ball of paper, ink lines, off-white. |
| `briefcase_swing.png` | 80×80, transparent | A golden motion arc / swoosh with a leather briefcase at its tip, top-down, pointing right. |

## Office (top-down)

| File | Size | Prompt |
|---|---|---|
| `office_floor.png` | 256×256, **seamless tile** | Seamless tileable 1990s office carpet seen from above, muted celadon green with a subtle woodblock pattern. |
| `cubicle_block.png` | 360×170, transparent | Top-down view of a block of 6 grey 1990s office cubicles (2 rows × 3), each with a desk, a big CRT monitor and a rolling chair. |
| `own_desk.png` | 140×80, transparent | Top-down view of a single messy office desk with a CRT monitor, keyboard, sticky notes and a cold cup of coffee. |
| `coffee_machine.png` | 70×70, transparent | Top-down view of a friendly working office coffee machine, warm golden glow (recovery point). |
| `water_cooler.png` | 44×44, transparent | Top-down view of an office water cooler with a blue water bottle. |
| `printer_decor.png` | 70×60, transparent | Top-down view of a normal (harmless) 1990s office printer. |
| `coat_rack.png` | 44×44, transparent | Top-down view of a coat rack with a raincoat and an umbrella. |
| `plant.png` | 48×48, transparent | Top-down view of a potted office plant (bonsai or fern). |
| `kitchen_table.png` | 220×120, transparent | Top-down view of a small office kitchen table with two chairs and tea cups. |
| `lift_door.png` | 120×160, transparent | Front view of a brass art-deco lift (elevator) door with gold leaf ornaments. |
| `mochi.png` | 32×32, transparent | A single cute round pink mochi with a tiny gold sparkle. |
| `window_city.png` | 512×60, **seamless horizontally** | A narrow horizontal strip of night city lights seen through an office window, indigo sky, golden windows, woodblock style. |

## Full-screen backgrounds (16:9, 1280×720, not transparent)

| File | Prompt |
|---|---|
| `title_bg.png` | Title screen: a lone rabbit in a suit standing on a hill before a stylised office tower at golden dawn, empty space in the centre for the title. |
| `intro_flat.png` | Side view interior of a tiny Tokyo apartment at dawn: futon bed on the left, window with rising sun, door on the right. Leave the bottom 110 px as plain floor. |
| `intro_metro.png` | Side view of a 1990s Tokyo metro station platform: tiled walls, pillars, turnstile, station signs. Leave the bottom 110 px as plain floor. |
| `intro_entrance.png` | Side view of a corporate office building entrance at morning, glass doors on the right. Leave the bottom 110 px as plain floor. |
| `lift_interior.png` | Interior of a brass and wood lift (elevator), seen from the front, floor indicator above the door, empty — characters are drawn on top. |

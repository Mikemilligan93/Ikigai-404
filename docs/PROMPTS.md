# Ikigai 404 — ChatGPT image prompts

Every prompt below is **complete** — copy the whole grey box into ChatGPT as one message. Nothing else to add.

After saving:
1. Save the image into `assets/img/` with **exactly** the file name shown.
2. In the project folder run `python3 tools/process_art.py` (crops, resizes, fixes tiles; originals go to `assets/originals/`).
3. Reload the game.

If ChatGPT shows a grey-and-white checkerboard instead of real transparency, reply: *"The background is a checkerboard pattern, not real transparency. Please output it again with a truly transparent background."*

Generate all bunny images in **the same ChatGPT chat** so he stays consistent.

*Style test done 2026-10-16 with player_ok, enemy_weak, office_floor: the high-angle-from-the-front camera works and is used for every office sprite.*

---

## Player — the bunny

Tip: if ChatGPT lets you, also attach `assets/originals/player_ok.png` and add *"Keep the character identical to the attached image."* — that keeps him consistent.

### `player_ok.png` — in game 88×88

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: The main character: a burnt-out white rabbit office worker with long upright ears (pink inside, gold-leaf edges), tired half-closed eyes with red rims, golden whiskers, wearing a navy-blue suit with thin gold trim, a white shirt, a vermilion tie with a gold pattern, brown leather loafers, and carrying a brown leather briefcase in his right hand. Pose: standing upright, tired but holding on, ears up.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `player_tired.png` — in game 88×88

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: The main character: a burnt-out white rabbit office worker with long upright ears (pink inside, gold-leaf edges), tired half-closed eyes with red rims, golden whiskers, wearing a navy-blue suit with thin gold trim, a white shirt, a vermilion tie with a gold pattern, brown leather loafers, and carrying a brown leather briefcase in his right hand. Pose: shoulders slumped, one ear drooping, tie loosened, briefcase hanging low.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `player_burnt.png` — in game 88×88

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: The main character: a burnt-out white rabbit office worker with long upright ears (pink inside, gold-leaf edges), tired half-closed eyes with red rims, golden whiskers, wearing a navy-blue suit with thin gold trim, a white shirt, a vermilion tie with a gold pattern, brown leather loafers, and carrying a brown leather briefcase in his right hand. Pose: hunched and exhausted, both ears flopped down, briefcase dragging on the floor, small grey smoke wisps rising from his head.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `player_side.png` — in game 96×128

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: plain side view, full body, standing on an invisible ground line at the bottom of the image, like a 2D side-scrolling game.

Subject: The main character: a burnt-out white rabbit office worker with long upright ears (pink inside, gold-leaf edges), tired half-closed eyes with red rims, golden whiskers, wearing a navy-blue suit with thin gold trim, a white shirt, a vermilion tie with a gold pattern, brown leather loafers, and carrying a brown leather briefcase in his right hand. Pose: walking to the right, mid-stride, briefcase in hand, weary.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no backdrop). One single subject, centred, filling most of the image height. Portrait image, 1024×1536.
```

### `player_portrait.png` — in game 420×420

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: chest-up portrait, straight-on to three-quarter view, like a character portrait in a visual novel dialogue scene.

Subject: The main character: a burnt-out white rabbit office worker with long upright ears (pink inside, gold-leaf edges), tired half-closed eyes with red rims, golden whiskers, wearing a navy-blue suit with thin gold trim, a white shirt, a vermilion tie with a gold pattern, brown leather loafers, and carrying a brown leather briefcase in his right hand. He faces to the right. Weary, slightly sarcastic expression. Head, shoulders and chest only.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

---

## Bosses

### `boss_ceo.png` — in game 150×150

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: The CEO: a huge, menacing red-and-gold Japanese dragon wearing an expensive black pinstripe business suit with a gold tie and gold cufflinks, long whiskers, smug expression, smoke curling from the nostrils. Pose: wings half spread, coiled and threatening, facing the viewer.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `boss_portrait.png` — in game 420×420 · *Wait for the team*

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: chest-up portrait, straight-on to three-quarter view, like a character portrait in a visual novel dialogue scene.

Subject: PLACEHOLDER — the boss in the lift is not decided yet. Wait for the team before generating this one.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

---

## Minibosses (possessed office machines)

### `miniboss_printer.png` — in game 110×110

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A monstrous beige 1990s office laser printer possessed like a Japanese yōkai: paper spewing from its slot like a long tongue, glowing angry eyes on the control panel, small stubby legs.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `miniboss_coffee.png` — in game 110×110

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A broken office coffee machine possessed like a Japanese yōkai: black coffee leaking everywhere, steam rising like horns, a cracked glass coffee pot, glowing angry eyes.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `miniboss_fax.png` — in game 110×110

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A haunted 1990s fax machine possessed like a Japanese yōkai: ghostly paper streamers floating around it, a curly phone cord as a tail, glowing angry eyes.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

---

## Minions

### `enemy_weak.png` — in game 56×56

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A small angry flying envelope (an email) with tiny bat wings, angry eyebrows and a red wax seal with an @ symbol in the middle.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `enemy_strong.png` — in game 52×52

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A hulking, angry scroll-shaped creature representing an URGENT work request, covered in red ink stamps (symbols only, no readable text), angry eyes and clenched little fists.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

---

## Colleagues (friendly NPCs) — animals are suggestions until the team finalises NPC types

### `npc_motivator.png` — in game 60×60

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A cheerful monkey office colleague in a white shirt sitting on a rolling office chair, giving a big thumbs up, surrounded by a soft golden glow.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `npc_mentor.png` — in game 60×60

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A wise old tortoise office colleague with round reading glasses, a cardigan and a neat stack of documents.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `npc_complainer.png` — in game 60×60

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A grumpy frog office colleague with arms crossed and a small dark rain cloud hanging over his head.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `npc_meetinger.png` — in game 60×60

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: An overly eager fox office colleague holding a calendar and a whiteboard marker, pointing at an invisible meeting invite.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `npc_inspector.png` — in game 96×128

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: plain side view, full body, standing on an invisible ground line at the bottom of the image, like a 2D side-scrolling game.

Subject: A smug crow metro ticket inspector in a stiff dark-blue uniform with a peaked cap, holding a ticket punch, chin raised arrogantly, facing to the left.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no backdrop). One single subject, centred, filling most of the image height. Portrait image, 1024×1536.
```

---

## Office furniture and props

### `own_desk.png` — in game 140×80

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A single messy 1990s office desk: a big beige CRT monitor, keyboard, piles of paper, yellow sticky notes everywhere and a cold cup of coffee. The desk is wider than it is deep.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `cubicle_block.png` — in game 360×170 · *Ask for transparency*

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A block of six grey 1990s office cubicles in two rows of three, each with a desk, a big beige CRT monitor and a rolling chair, low fabric partition walls. Draw the cubicle block only, on a REAL transparent background (no floor around it).

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor). The subject fills most of the width. Wide landscape image, 1536×1024.
```

### `coffee_machine.png` — in game 70×70

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A friendly, working office coffee machine with a warm golden glow and a steaming cup — a place of rest.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `water_cooler.png` — in game 44×44

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: An office water cooler with a big blue water bottle on top.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `printer_decor.png` — in game 70×60

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: An ordinary, harmless beige 1990s office printer.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `coat_rack.png` — in game 44×44

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A wooden coat rack with a beige raincoat and a folded umbrella.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `plant.png` — in game 48×48

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A small potted bonsai tree in a ceramic pot.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `kitchen_table.png` — in game 220×120 · *Ask for transparency*

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A small office kitchen table with two chairs, two tea cups and a teapot. Draw the furniture only, on a REAL transparent background (no floor around it).

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor). The subject fills most of the width. Wide landscape image, 1536×1024.
```

### `lift_door.png` — in game 120×160

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: straight-on front view, no characters in the scene.

Subject: A closed brass art-deco lift (elevator) door with gold-leaf ornaments and a small round floor indicator above it. Only the door and its frame, on a REAL transparent background.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no backdrop). One single subject, centred, filling most of the image height. Portrait image, 1024×1536.
```

### `mochi.png` — in game 32×32

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from a high angle above and slightly from the front, like a classic 2D top-down game where you still see the face (head and face visible near the top, feet at the bottom).

Subject: A single cute round pink mochi with a tiny gold sparkle on top.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `paper_ball.png` — in game 20×20

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from directly above, flat.

Subject: A single crumpled ball of office paper, off-white with ink lines.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `fireball.png` — in game 24×24

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from directly above, flat.

Subject: A small round ball of dragon fire painted in flat vermilion and gold.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

### `briefcase_swing.png` — in game 80×80

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from directly above, flat.

Subject: A golden curved motion arc (a swoosh of a fast swing) with a brown leather briefcase at its tip, the arc sweeping towards the right.

Output: PNG with a REAL transparent background (no checkerboard pattern, no floor, no shadow box, no backdrop). One single subject, centred, filling most of the image. Square image, 1024×1024.
```

---

## Floor and window textures

### `office_floor.png` — in game 512×512 tile

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: seen from directly above, flat.

Subject: 1990s office carpet, muted celadon green with a subtle woodblock pattern of small clouds and lattice shapes, low contrast so characters stand out on it.

Output: a SEAMLESS TILEABLE texture that fills the whole image edge to edge — the left edge must continue into the right edge and the top into the bottom. No border, no vignette, no lighting gradient, no objects. Square image, 1024×1024.
```

### `window_city.png` — in game 512×60 strip

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: A long row of office windows at night: dark indigo sky, the lights of a city skyline with golden lit windows, a few stars. The view should continue seamlessly from the left edge to the right edge.

Output: the scene fills the whole image edge to edge, no border, no vignette. Wide landscape image, 1536×1024.
```

---

## Full-screen backgrounds

### `title_bg.png` — in game 1280×720

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: Title screen: a lone white rabbit in a navy suit, small and seen from behind, standing on a hill in front of a tall stylised office tower at golden dawn. Large empty sky in the centre for the game title.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `intro_flat.png` — in game 1280×720

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: The inside of a tiny Tokyo apartment at dawn: a futon bed on the left, a window in the middle with the sun rising outside, a door on the right. Keep the bottom sixth of the image as plain floor.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `intro_metro.png` — in game 1280×720

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: A 1990s Tokyo metro station platform: tiled walls, pillars, a ticket turnstile, hanging station signs (symbols only, no readable text). Keep the bottom sixth of the image as plain floor.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `intro_entrance.png` — in game 1280×720

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: plain side view of a 2D side-scrolling game stage, horizon level, no characters in the scene.

Subject: The street outside a corporate office building in the morning, glass entrance doors on the right side. Keep the bottom sixth of the image as plain pavement.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

### `lift_interior.png` — in game 1280×720

```text
Art style: a 1990s Japanese office world drawn as if by a medieval artist — Japanese woodblock prints (ukiyo-e) and picture scrolls fused with European illuminated manuscripts. Bold carved ink outlines, flat historical pigments (indigo, vermilion, ochre, celadon), touches of gold leaf, aged paper texture, satirical anthropomorphic animals in the spirit of the Chōjū-giga scrolls. Palette from night indigo to hopeful golden dawn. Clean, readable silhouette; this is a game asset. No text, no letters, no watermark, no signature, no frame.

Camera: straight-on front view, no characters in the scene.

Subject: The empty interior of an old brass and polished-wood lift (elevator), seen from inside, a floor indicator dial above the closed doors, warm halogen light.

Output: the scene fills the whole image edge to edge, no border, no vignette, no text. Wide landscape image, 1536×1024 (it will be cropped to 16:9, so keep important things away from the top and bottom edges).
```

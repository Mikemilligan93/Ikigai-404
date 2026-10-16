// Level 1 — the office, built on a 16 px tile grid (48 world px per tile at 3x).
// Everything here is in TILE coordinates. Edit zones, doors, props and spawn points freely;
// the scene converts to world pixels. Tuning numbers live in config.json.
//
//   x: 0                15                                48                63
//      +-----------------+----------------------------------+-----------------+  y 0-1 outer wall (windows)
//      |  KITCHEN        |                                  |  MANAGER'S      |
//      |  (coffee boss)  door        OPEN-PLAN              door CORNER       |
//      +-----------------+        cubicles                  +-----------------+  y 12-13
//      |  MEETING ROOM   door                               door LIFT LOBBY   |
//      |  (client boss)  |       central arena (boss)       |  (lift, coffee) |
//      +-----------------+        cubicles                  +-----------------+  y 25-26
//      |  SERVER CLOSET  door                               door ARCHIVE      |
//      |  (AC boss)      |                                  |                 |
//      |                 |   your desk · start              |  (printer boss) |
//      +-----------------+----------------------------------+-----------------+  y 39

import { CUBICLE_VARIANTS } from '../sprites.js';

export const T = 48;          // world pixels per tile (24 px tiles drawn at 2x)
export const MAP_W = 64;
export const MAP_H = 40;

// Floor zones: [floor type (see FLOOR in sprites.js), x0, y0, x1, y1] inclusive. Later entries paint over earlier ones.
export const ZONES = [
  ['carpet', 16, 2, 47, 38],
  ['carpetWave', 22, 14, 41, 24],   // the open centre = boss arena
  ['kitchen', 1, 2, 14, 11],
  ['tatami', 49, 2, 62, 10],
  ['lobby', 1, 14, 14, 24],         // meeting room
  ['rug', 3, 17, 8, 21],            // rug under the meeting table
  ['lobby', 49, 14, 62, 24],
  ['server', 1, 27, 14, 38],
  ['archive', 49, 27, 62, 38],
];

// Walls: [x0, y0, x1, y1] inclusive. Horizontal inner walls are 2 tiles thick so their front face shows.
const WALLS = [
  [0, 0, 63, 1],      // top outer wall (cap + face with windows)
  [0, 39, 63, 39],    // bottom
  [0, 0, 0, 39],      // left
  [63, 0, 63, 39],    // right
  [15, 0, 15, 39],    // left column divider
  [48, 0, 48, 39],    // right column divider
  [0, 12, 15, 13], [48, 11, 63, 13],   // between top and middle rooms (3 thick on the right: the lift is set into it)
  [0, 25, 15, 26], [48, 25, 63, 26],   // between middle and bottom rooms
];
// Doorways cut into the walls: [x0, y0, x1, y1]
const DOORS = [
  [15, 5, 15, 8], [15, 17, 15, 21], [15, 30, 15, 34],
  [48, 5, 48, 8], [48, 17, 48, 21], [48, 30, 48, 34],
];

// Low cubicle partitions (grey fabric, waist high): [x0, x1, y] horizontal runs. Solid like walls.
const PARTITIONS = [[17, 21, 25], [42, 46, 25], [17, 21, 13], [42, 46, 13]];

// Decorations on visible wall faces: [x, y, WALL key from sprites.js]. Faces without an entry are plain.
function faceDecor() {
  const d = [];
  for (let x = 17; x <= 46; x += 3) d.push([x, 1, 'window']);           // open-plan windows over Tokyo
  d.push([3, 1, 'dawnWindow'], [7, 1, 'scroll'], [11, 1, 'dawnWindow']); // kitchen
  for (const x of [50, 51, 52, 60, 61, 62]) d.push([x, 1, 'shoji']);    // manager's shoji screens
  d.push([56, 1, 'scroll']);
  d.push([4, 13, 'notice'], [10, 13, 'window']);                          // meeting room
  d.push([51, 13, 'noren'], [60, 13, 'scroll']);                          // lobby (lift drawn on top at 55-56)
  d.push([7, 26, 'door']);                                                // server closet
  d.push([52, 26, 'notice'], [58, 26, 'notice']);                         // archive
  return d;
}

// Props: [prop name from PROPS in sprites.js, x, y] = top-left of its footprint. Optional 4th item = id.
function props() {
  const p = [];
  // --- open plan: blocks of 2×2 cubicles back to back, 2-tile aisles between them
  const cols = [17, 20, 25, 28, 33, 36, 41, 44];
  let n = 0;
  const pick = () => CUBICLE_VARIANTS[(n++ * 7 + 3) % CUBICLE_VARIANTS.length];
  for (const y of [3, 5, 9, 11, 27, 29]) for (const x of cols) p.push([pick(), x, y]);
  for (const x of [25, 28, 33, 36, 41, 44]) p.push([pick(), x, 34]);
  p.push(['own_desk_mail', 18, 34, 'desk']);
  p.push(['bonsai', 22, 14], ['bonsai', 41, 14], ['lantern', 22, 24], ['lantern', 41, 24]);
  p.push(['water_cooler', 31, 32], ['coat_rack', 16, 37], ['umbrellas', 16, 36]);
  // --- kitchen
  p.push(['coffee_good', 2, 2], ['water_cooler', 5, 2], ['fridge', 7, 2], ['counter', 10, 2]);
  p.push(['kitchen_table', 5, 6], ['vending', 12, 9], ['bonsai', 1, 10]);
  // --- manager's corner
  p.push(['manager_desk', 54, 5], ['manager_chair', 55, 3], ['bonsai_big', 49, 2], ['maneki', 62, 2]);
  p.push(['trophies', 58, 2], ['aquarium', 49, 9]);
  // --- meeting room
  p.push(['whiteboard', 2, 14], ['clock', 7, 14], ['meeting_table', 4, 18]);
  p.push(['meeting_chair', 3, 18], ['meeting_chair', 7, 19], ['projector', 11, 15], ['plant_tall', 13, 24]);
  // --- lift lobby
  p.push(['lift_door', 55, 11, 'lift'], ['umbrellas', 49, 14], ['coat_rack', 50, 14], ['shoe_locker', 61, 14], ['coffee_good', 59, 14, 'coffee']);
  p.push(['lantern', 52, 24], ['lantern', 59, 24], ['bonsai', 62, 20]);
  // --- server closet
  for (const x of [1, 4, 7, 10]) p.push(['rack', x, 28]);
  p.push(['rack_open', 12, 28], ['cables', 5, 32], ['fan', 13, 34], ['towers', 1, 37], ['kamidana', 6, 27], ['bonsai', 13, 38]);
  // --- archive / print room
  p.push(['cabinets', 49, 27], ['cabinets', 51, 27], ['binders', 59, 27], ['binders', 61, 27]);
  p.push(['shredder', 49, 37], ['printer', 52, 37], ['fax', 55, 37], ['boxes', 61, 37], ['boxes', 61, 35]);
  return p;
}

export const OFFICE = {
  T, MAP_W, MAP_H,
  width: MAP_W * T,
  height: MAP_H * T,
  zones: ZONES,
  walls: WALLS,
  doors: DOORS,
  partitions: PARTITIONS,
  faces: faceDecor(),
  props: props(),
  playerStart: { x: 22.5, y: 37 },
  arenaCentre: { x: 32, y: 19.5 },
  // the boss walks out of the lift through these points before fighting
  bossPath: [{ x: 56.5, y: 15.5 }, { x: 50, y: 19 }, { x: 46, y: 19.5 }, { x: 32, y: 19.5 }],

  // minibosses walk after the player but stay on a leash around their home (config: minibosses.leashTiles)
  minibosses: [
    { id: 'client', x: 9.5, y: 21.5 },   // meeting room
    { id: 'coffee', x: 10, y: 9 },       // kitchen
    { id: 'printer', x: 56, y: 32.5 },   // archive
    { id: 'ac', x: 8, y: 34 },           // server closet
  ],

  // the team's colleagues (types + effects in config.json → friendlyNpcs)
  friendlyNpcs: [
    { type: 'dog', x: 24, y: 8 },
    { type: 'expert', x: 39.5, y: 8 },
    { type: 'bestie', x: 32, y: 25.5 },
    { type: 'karen', x: 28, y: 32.5 },
    { type: 'baker', x: 3, y: 9.5 },
    { type: 'meeting_saver', x: 12.5, y: 17 },
    { type: 'shouter', x: 52, y: 8 },
    { type: 'photos', x: 53, y: 20.5 },
    { type: 'hobby', x: 60, y: 31 },
    { type: 'lazy', x: 3, y: 35.5 },
  ],

  mochiSpots: [
    { x: 3, y: 9 }, { x: 8, y: 35 }, { x: 52, y: 34 }, { x: 60, y: 9 }, { x: 60, y: 22 },
    { x: 23.5, y: 8 }, { x: 39, y: 20 }, { x: 31.5, y: 26 }, { x: 46, y: 36 }, { x: 12, y: 22 },
    { x: 47.5, y: 15 }, { x: 16.5, y: 15 },
  ],
};

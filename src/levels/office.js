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
  ['wood', 1, 14, 14, 24],          // meeting room
  ['rug', 4, 15, 11, 19],           // rug under the meeting table
  ['lobby', 49, 14, 62, 24],
  ['server', 1, 27, 14, 38],
  ['archive', 49, 27, 62, 38],
  ['archiveStripe', 49, 29, 58, 29], // safety line in front of the print machines
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

// Things on visible wall faces: [x, y, key] — keys from WALL or WALL_DECOR in sprites.js. Faces without an entry are plain.
function faceDecor() {
  const d = [];
  for (let x = 17; x <= 44; x += 3) d.push([x, 1, 'window']);           // open-plan windows over Tokyo
  d.push([22, 1, 'calendar'], [28, 1, 'aircon'], [34, 1, 'clock'], [40, 1, 'aircon'], [46, 1, 'exit'], [19, 1, 'extinguisher']);
  d.push([3, 1, 'clock'], [7, 1, 'dawnWindow'], [10, 1, 'dawnWindow'], [14, 1, 'calendar']);  // kitchen: windows over the counter and sink
  for (const x of [50, 51, 52, 60, 61, 62]) d.push([x, 1, 'shoji']);    // manager's shoji screens
  d.push([56, 1, 'scroll'], [54, 1, 'photo'], [58, 1, 'poster']);
  d.push([4, 13, 'notice'], [7, 13, 'clock'], [10, 13, 'tv'], [12, 13, 'window']);   // meeting room
  d.push([51, 13, 'noren'], [60, 13, 'scroll'], [53, 13, 'exit'], [58, 13, 'hangplant'], [62, 13, 'hooks']);  // lobby (lift at 55-57)
  d.push([3, 26, 'extinguisher'], [7, 26, 'door'], [11, 26, 'safety'], [13, 26, 'switch']);            // server closet
  d.push([50, 26, 'switch'], [52, 26, 'notice'], [55, 26, 'calendar'], [58, 26, 'notice'], [61, 26, 'extinguisher']);  // archive
  return d;
}

// Props: [prop name from PROPS in sprites.js, x, y, opts] = top-left of its footprint.
// opts: an id string, or { id, flip, dy } (flip mirrors it: side desks / side wall furniture for the LEFT wall;
// dy nudges the picture down/up in pixels without moving its footprint).
// Small free-standing things (1 tile wide plants, lanterns, stools…) get a tiny random nudge in the scene so rows don't look ruled.
// Seats: { x, y, dir, worker, dy } — where a background colleague sits (tile of the chair; dir = where they face).
// A chair prop with a colleague on it is not drawn (the colleague sheet includes the chair).
const SEATS = [];
let seatN = 0;
// About 2 of 3 seats are taken; worker = which of the 4 colleague sheets (null = empty seat).
const taken = () => { const n = seatN++; return n % 3 === 2 ? null : (n * 5 + 1) % 4; };
// how far the chair sits from the desk picture: pulled in so people sit AT their desk
const SEAT_DY = { up: -21, down: 9, left: 0, right: 0 };
function seat(p, chair, x, y, dir, opts, who) {
  const worker = who ?? taken(), dy = SEAT_DY[dir];
  // an empty seat sometimes has its chair pushed back and turned, like someone just left
  const left = worker == null && (dir === 'up' || dir === 'down') && seatN % 2 === 0;
  p.push([left ? 'chair_out' : chair, x, y, { ...opts, seat: SEATS.length, dy: left ? dy + (dir === 'up' ? 9 : -6) : dy }]);
  SEATS.push({ x, y, dir, worker, dy });
}

// A Japanese desk island: a row of desks facing down (top) pushed against a row facing up (bottom), chairs on both sides.
const DESK_LOOKS = ['tidy', 'messy', 'cactus'];
function island(p, x0, y, n, look = 0) {
  for (let i = 0; i < n; i++) {
    const x = x0 + i * 3, l = DESK_LOOKS[(look + i) % 3], l2 = DESK_LOOKS[(look + i * 2 + 1) % 3];
    p.push([`desk_down_${l}`, x, y], [`desk_up_${l2}`, x, y + 1]);
    seat(p, 'chair_down', x + 1, y - 1, 'down');
    seat(p, 'chair_up', x + 1, y + 2, 'up');
  }
}
// The section chief at the head of an island: side desk, sits on the right facing left (flip: sits left, faces right).
function chief(p, x, y, flip = false, look = 'tidy') {
  p.push([`desk_left_${look}`, x, y, { flip }]);
  seat(p, 'chair_left', flip ? x - 1 : x + 2, y + 1, flip ? 'right' : 'left', { flip });
}

function props() {
  const p = [];
  let n = 0;
  const pick = () => CUBICLE_VARIANTS[(n++ * 7 + 3) % CUBICLE_VARIANTS.length];
  // partitioned cubicles (3×2, the chair is in the picture, the worker faces up): a colleague may sit in some
  const cubicle = (x, y) => {
    const v = pick();
    p.push([v, x, y]);
    if (v !== 'cubicle_empty' && v !== 'cubicle_island') SEATS.push({ x: x + 1, y: y + 1, dir: 'up', worker: taken(), baked: true });
  };

  // ================= open plan, top half (y 2-12)
  // a few things against the window wall, with gaps so the windows show
  p.push(['bookshelf', 17, 2], ['copier', 20, 2], ['recycling', 23, 2], ['palm', 27, 2], ['lockers', 41, 2], ['cabinet', 44, 2]);
  // the department head sits with his back to the windows, overseeing everyone
  p.push(['chief_desk', 30, 3]);
  seat(p, 'chair_down', 31, 2, 'down');
  island(p, 19, 5, 3, 0); chief(p, 28, 5, false, 'messy');      // island A, three pairs, its chief on the right
  island(p, 37, 5, 2, 1); chief(p, 35, 5, true, 'cactus');      // island B, two pairs, its chief on the left
  // partitioned cubicles in broken runs (not one ruled line)
  for (const x of [17, 20, 23, 30, 33, 41, 44]) cubicle(x, 10);
  p.push(['lockers_side', 16, 10, { flip: true }], ['plant_tall', 27, 11], ['umbrellas', 38, 11], ['bookshelf_side', 47, 9]);

  // ================= open plan, middle: the boss arena keeps a clear core, with soft edges around it
  p.push(['planter', 17, 15], ['bonsai', 22, 14], ['lantern', 23, 20], ['sofa', 18, 22], ['coffee_table', 18, 23], ['copier_side', 16, 22, { flip: true }]);
  p.push(['whiteboard', 43, 15], ['stool', 43, 17], ['stool', 45, 17], ['palm', 47, 16], ['lantern', 40, 14], ['bonsai', 41, 23], ['recycling_side', 47, 22]);

  // ================= open plan, bottom half (y 26-38)
  for (const x of [17, 20, 26, 29, 36, 42, 45]) cubicle(x, 27);
  island(p, 23, 31, 3, 2); chief(p, 32, 31, false, 'tidy');      // island C
  island(p, 38, 31, 2, 1); chief(p, 44, 31, false, 'messy');     // island D
  p.push(['own_desk_mail', 18, 34, 'desk']);
  cubicle(26, 36); cubicle(29, 36);
  p.push(['screen', 32, 37], ['sofa', 40, 36], ['coffee_table', 40, 37], ['palm', 43, 37], ['water_cooler', 46, 35]);
  p.push(['bookshelf_side', 47, 36], ['plant_tall', 47, 38], ['coat_rack', 16, 37], ['umbrellas', 16, 36], ['chair_out', 35, 35]);

  // ================= kitchen: counters along the window wall, two tables, a corner to sit
  p.push(['coffee_good', 1, 2], ['water_cooler', 3, 2], ['fridge', 4, 2], ['counter', 6, 2], ['sink', 9, 2], ['vending', 12, 2]);
  p.push(['kitchen_table', 3, 6], ['kitchen_table', 8, 6], ['stool', 12, 7], ['recycling_side', 1, 9, { flip: true }], ['palm', 13, 10], ['bonsai', 7, 10]);

  // ================= manager's corner
  p.push(['manager_desk', 54, 5], ['manager_chair', 55, 4], ['bonsai_big', 49, 2], ['maneki', 62, 2]);
  p.push(['trophies', 58, 2], ['aquarium', 49, 9], ['putting', 50, 7], ['sofa', 58, 7], ['coffee_table', 58, 8], ['palm', 62, 9]);

  // ================= meeting room: one big boardroom table, chairs waiting by the wall
  p.push(['whiteboard', 2, 14], ['meeting_table_big', 5, 17], ['projector', 12, 19], ['cabinet', 8, 14]);
  p.push(['mchair_down', 5, 14], ['mchair_down', 6, 14], ['plant_tall', 13, 24], ['palm', 1, 24]);

  // ================= lift lobby
  p.push(['lift_door', 55, 11, 'lift'], ['umbrellas', 49, 14], ['coat_rack', 50, 14], ['shoe_locker', 61, 14], ['coffee_good', 59, 14, 'coffee']);
  p.push(['lantern', 52, 24], ['lantern', 58, 24], ['bonsai', 62, 17], ['palm', 49, 23]);
  p.push(['sofa', 50, 18], ['coffee_table', 50, 19]);
  // reception right next to the lift, greeting whoever comes out; the receptionist is always there
  p.push(['reception', 52, 16]);
  seat(p, 'chair_down', 53, 15, 'down', {}, 3);

  // ================= server closet
  for (const x of [1, 4, 7, 10]) p.push(['rack', x, 28]);
  p.push(['rack_open', 12, 28]);
  p.push(['cables', 6, 32], ['fan', 13, 34], ['towers', 1, 37], ['kamidana', 6, 27], ['bonsai', 13, 38]);

  // ================= archive / print room: machines against the back wall, two free-standing shelves
  p.push(['cabinets', 49, 27], ['cabinets', 51, 27], ['printer', 53, 27], ['fax', 55, 27], ['shredder', 56, 27], ['cabinet', 57, 27]);
  p.push(['binders', 59, 27], ['binders', 61, 27], ['binders', 50, 32], ['binders', 52, 32], ['copier_side', 62, 31]);
  p.push(['boxes', 61, 37], ['boxes', 61, 35], ['boxes', 49, 37]);
  return p;
}
const PROP_LIST = props();

// Background colleagues walking fixed routes (tile centres, straight lines). They pause at both ends and walk back.
// Their routes also wear a path into the carpet.
const WALKERS = [
  { kind: 'coffee', speed: 95, pause: 3, route: [[44.5, 8.5], [16.5, 8.5], [14, 8.5], [14, 4.5], [2.5, 4.5]] },
  { kind: 'papers', speed: 38, pause: 5, route: [[54, 28.7], [54, 30.5], [47.5, 30.5], [47.5, 29.5], [22.5, 29.5]] },
];

// Clutter on the floor: how many per zone (placed at random on free floor, never in doorways or the arena).
const CLUTTER_ZONES = [
  { area: [16, 2, 47, 12], n: 7 }, { area: [16, 26, 47, 38], n: 7 }, { area: [1, 2, 14, 11], n: 3, kinds: ['spill', 'slippers', 'balls'] },
  { area: [1, 14, 14, 24], n: 2, kinds: ['papers', 'balls'] }, { area: [1, 27, 14, 38], n: 3, kinds: ['cable', 'box', 'papers'] },
  { area: [49, 27, 62, 38], n: 4, kinds: ['papers', 'box', 'magazines', 'balls'] }, { area: [49, 2, 62, 10], n: 1, kinds: ['magazines'] },
];

export const OFFICE = {
  T, MAP_W, MAP_H,
  width: MAP_W * T,
  height: MAP_H * T,
  zones: ZONES,
  walls: WALLS,
  doors: DOORS,
  partitions: PARTITIONS,
  faces: faceDecor(),
  props: PROP_LIST,
  seats: SEATS,
  walkers: WALKERS,
  clutter: CLUTTER_ZONES,
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
    { type: 'dog', x: 31, y: 8.6 },
    { type: 'expert', x: 39.5, y: 8 },
    { type: 'bestie', x: 32, y: 25.5 },
    { type: 'karen', x: 36, y: 37.5 },
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

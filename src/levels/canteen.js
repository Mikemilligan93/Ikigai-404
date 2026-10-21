// Level 2 — the company canteen at lunch, on the same tile grid as the office (48 world px per tile).
// Everything here is in TILE coordinates; tuning numbers live in config.json → canteen.
//
//   x: 0              15        18          28 29          39
//      +---------------------------------------+-----------+   y 0-1 top wall (serving hatch, menu, windows)
//      | KITCHEN  obachan        |  TATAMI     | ROOFTOP   |
//      | [ counter counter ]     |  (managers, | cherry    |
//      |        rice cooker      |  Rokurokubi)  door  bench |
//      |                         +-------------+-----------+   y 10-11 (rooftop wall, windows on its face)
//      |  long tables                 window counter seats  |
//      |  long tables     intern       Health Week leftovers |
//      |  long tables                                       |
//      | TICKETS  samples      napper     tray return  vending|
//      +----------------------------------------------------+   y 29
//
// The bunny comes in at the bottom left, buys a meal ticket, collects the tray from the obachan at the
// counter, carries it past the Ramen Bowl miniboss and picks a seat. Rokurokubi arrives halfway through lunch.

export const T = 48;
export const MAP_W = 40;
export const MAP_H = 30;

export const ZONES = [
  ['lino', 1, 2, 38, 28],
  ['quarry', 1, 2, 15, 5],          // behind and in front of the serving counter
  ['tatami', 18, 2, 27, 6],         // raised section for the managers
  ['concrete', 30, 2, 38, 9],       // rooftop
  ['deck', 33, 6, 37, 8],           // wooden deck around the bench
  ['grass', 30, 2, 31, 3],          // planter bed under the cherry tree
];

const WALLS = [
  [0, 0, 39, 1],      // top outer wall
  [0, 29, 39, 29],    // bottom
  [0, 0, 0, 29],      // left
  [39, 0, 39, 29],    // right
  [29, 0, 29, 11],    // rooftop: left side
  [29, 10, 39, 11],   // rooftop: bottom (2 thick so its face shows windows into the hall)
];
// the stairs up to the roof: a doorway in the rooftop's left wall
const DOORS = [[29, 7, 29, 8]];
const PARTITIONS = [];

function faceDecor() {
  const d = [];
  d.push([2, 1, 'hatch'], [5, 1, 'menu'], [6, 1, 'menu'], [8, 1, 'hatch'], [11, 1, 'noren'], [13, 1, 'clock'], [15, 1, 'firstAid']);
  for (const x of [17, 20, 23, 26]) d.push([x, 1, 'window']);       // windows over the tatami section
  d.push([22, 1, 'kamidana'], [19, 1, 'lantern'], [25, 1, 'lantern'], [28, 1, 'tv']);
  for (let x = 30; x <= 38; x++) d.push([x, 1, 'railH']);           // rooftop edge: a railing
  for (const x of [30, 32, 34, 36, 38]) d.push([x, 11, 'window']);   // the rooftop wall seen from the hall
  d.push([31, 11, 'carrotPoster'], [35, 11, 'saladPoster'], [37, 11, 'wallFan'], [33, 11, 'bowlPhoto']);
  return d;
}

// Seats. kind: 'eater' = a background colleague eating (worker 0-3 = mouse, beaver, frog, cat)
// 'free' = the bunny can sit and eat here. tag = what is special about the seat (scoring in config.json → canteen.seatBonus):
// plain · company (next to a kind colleague, see friendlyNpcs) · intern · window · rooftop · manager (Rokurokubi comes early)
// dir = where the sitter faces: 'down' = above the table, seen from the front; 'up' = below the table, seen from behind.
const SEATS = [];
const PLAYER_SEATS = [];
function eater(x, y, dir, worker) { SEATS.push({ x, y, dir, worker }); }
function free(x, y, dir, tag, tableX, tableY) { PLAYER_SEATS.push({ x, y, dir, tag, table: { x: tableX, y: tableY } }); }

function props() {
  const p = [];
  // ---- serving counter + kitchen
  p.push(['counter_l', 2, 4], ['counter_m', 5, 4, 'counter'], ['counter_r', 8, 4]);
  p.push(['tea', 11, 4], ['tray_rack', 13, 2], ['rice_cooker', 14, 7, 'cooker']);
  // ---- tatami section (managers)
  p.push(['chabudai', 19, 3], ['chabudai', 23, 3], ['palm_canteen', 27, 2], ['palm_canteen', 18, 2]);
  // ---- long tables: three pieces each (left, middle with soy sauce, right), colleagues on both sides
  let w = 0;
  const longTable = (x0, y, frees = {}) => {
    p.push(['table_l', x0, y, { id: `t${x0}_${y}` }], ['table_m', x0 + 3, y], ['table_r', x0 + 6, y]);
    for (const [i, dx] of [1, 4, 7].entries()) {
      for (const [dir, sy] of [['down', y - 1], ['up', y + 1]]) {
        const key = `${i}${dir}`;
        if (frees[key]) free(x0 + dx, sy, dir, frees[key], x0 + dx, y);
        else if (frees[key] === null) { /* an empty seat */ } else eater(x0 + dx, sy, dir, (w++ * 3 + 1) % 4);
      }
    }
  };
  longTable(3, 9, { '1down': 'plain', '2up': null });
  longTable(14, 9, { '0up': 'company', '2down': null });
  longTable(3, 14, { '2up': 'company', '0down': null });
  longTable(14, 14, { '1up': 'plain' });
  longTable(3, 20, { '1down': 'company', '0up': null });
  longTable(14, 20, { '2down': null });
  // tatami seats: very comfortable, very close to the managers
  free(20, 4, 'up', 'manager', 20, 3);
  free(24, 4, 'up', 'manager', 24, 3);
  eater(20, 2, 'down', 2);
  // ---- window counter (faces the wall, back to everybody)
  p.push(['window_counter', 30, 12], ['window_counter', 33, 12], ['window_counter', 36, 12]);
  free(31, 13, 'up', 'window', 31, 12);
  eater(34, 13, 'up', 1);
  free(37, 13, 'up', 'window', 37, 12);
  // ---- the intern's little table
  p.push(['table_small', 26, 17, 'internTable']);
  free(26, 18, 'up', 'intern', 26, 17);
  // ---- Health Week leftovers
  p.push(['salad_bar', 31, 19], ['fruit_basket', 35, 19], ['balloon_chair', 37, 17], ['pedometers', 31, 23], ['blender', 35, 23]);
  // ---- bottom: entrance, tickets, samples, napper, tray return, vending
  p.push(['ticket_machine', 2, 25, 'tickets'], ['samples', 5, 25], ['palm_canteen', 1, 28]);
  p.push(['napper', 14, 25], ['palm_canteen', 26, 27]);
  p.push(['conveyor', 28, 27, 'conveyor'], ['tray_return', 31, 27], ['bins', 33, 27], ['vending_canteen', 36, 27]);
  // ---- rooftop
  p.push(['cherry_tree', 30, 3], ['water_tank', 36, 3], ['ac_unit', 36, 5], ['roof_plants', 30, 8], ['roof_bench', 34, 7, 'bench']);
  free(35, 6, 'down', 'rooftop', 34, 7);
  return p;
}
const PROP_LIST = props();

// a colleague with a lunch tray looking for a seat, forever
const WALKERS = [
  { kind: 'tray', speed: 70, pause: 2, route: [[12.5, 23.5], [12.5, 12], [25.5, 12], [25.5, 23.5]] },
];

export const CANTEEN = {
  T, MAP_W, MAP_H,
  width: MAP_W * T,
  height: MAP_H * T,
  // tile sheets + tile maps for this level (see CANTEEN_FLOOR / CANTEEN_WALL in sprites.js)
  sheets: { floor: 'tiles_canteen_floor', wall: 'tiles_canteen_wall', decor: 'wall_decor_canteen' },
  defaultFloor: 'lino',
  zones: ZONES,
  walls: WALLS,
  doors: DOORS,
  partitions: PARTITIONS,
  faces: faceDecor(),
  props: PROP_LIST,
  seats: SEATS,
  playerSeats: PLAYER_SEATS,
  walkers: WALKERS,
  clutter: [],
  playerStart: { x: 3.5, y: 27.5 },
  exit: { x: 3.5, y: 28.4 },        // the canteen door (bottom left): after Rokurokubi, back to work from here
  obachan: { x: 6.5, y: 3.6 },
  intern: { x: 26.5, y: 16.4 },
  // the Ramen Bowl walks the hall on a leash around its home; Rokurokubi stands on the tatami
  ramenHome: { x: 13, y: 17.5 },
  rokuHome: { x: 22.5, y: 5.6 },
  // the rice cooker blows steam at this spot; the conveyor pushes you along this strip
  steam: { x: 15, y: 8.2, r: 1.6 },
  conveyorLane: { x0: 28, y0: 27, x1: 31, y1: 28.6, push: 1 },
  minibosses: [],
  // the Level 1 colleagues, out for lunch (types + effects in config.json → friendlyNpcs)
  friendlyNpcs: [
    { type: 'bestie', x: 16.5, y: 11.8 },
    { type: 'baker', x: 12.5, y: 16.6 },
    { type: 'dog', x: 7.5, y: 17.4 },
    { type: 'shouter', x: 5, y: 11.8 },
    { type: 'karen', x: 19.5, y: 17.4 },
    { type: 'photos', x: 28.5, y: 14.5 },
  ],
  mochiSpots: [],
};

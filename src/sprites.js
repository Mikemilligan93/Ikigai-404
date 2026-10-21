// What every frame of every sprite sheet means — the same layout the prompts in docs/PROMPTS.md ask for.
// [sheet, col, row]. Change a frame here if ChatGPT put something in a different cell.

// Character sheets: rows are directions. "right" = the "left" row mirrored.
export const DIR_ROW = { down: 0, left: 1, up: 2 };

// Walk cycle over the 3 columns (left foot, standing, right foot): 0,1,2,1,…
export const WALK = [0, 1, 2, 1];
export const STAND = 1;

// player_actions: per direction row → winding up, swing, throw
export const ACTION = { windup: 0, swing: 1, throw: 2 };

// player_wake (intro, futon + bunny in one sheet): [col, row]; sequence entries are [col, row, seconds]
export const WAKE = {
  asleep: [[0, 0], [1, 0]],
  sequence: [[2, 0, 0.6], [3, 0, 0.6], [0, 1, 0.4], [1, 1, 0.8], [2, 1, 0.6]],   // eyes open, sit up, kneel, stretch, shake
  emptyFuton: [3, 1],
};
// flat_props (intro): mirror / plant / cat, [col, row] per state
export const FLAT_PROP = {
  mirror: { idle: [0, 0], used: [1, 0] },
  plant: { idle: [2, 0], used: [3, 0] },
  cat: { idle: [0, 1], noticed: [1, 1], used: [2, 1], stretch: [3, 1] },
};

// Metro station (intro): props and the debris the draft blows around
export const METRO_PROP = {
  gates: [0, 0], vending: [1, 0], bin: [2, 0],
  bench: [0, 1], timetable: [1, 1], billboard: [2, 1],
};
export const DEBRIS = {           // frames to flip between while it tumbles; heavy = rolls on the floor instead of flying
  leaf: { frames: [[0, 0], [1, 0]], heavy: false, ph: '#D9822B' },
  paper: { frames: [[2, 0], [3, 0]], heavy: false, ph: '#E6E2D6' },
  bag: { frames: [[0, 1], [1, 1]], heavy: false, ph: '#F4F4F4' },
  can: { frames: [[2, 1]], heavy: true, ph: '#B4302A' },
  cup: { frames: [[3, 1]], heavy: true, ph: '#EFE4CC' },
};
// Street (intro end): cherry petals in the wind (street_petals), drawn small (scale 1); street only
export const PETALS = {
  petal: { sheet: 'street_petals', frames: [[0, 0], [1, 0], [2, 0], [3, 0]], heavy: false, light: true, scale: 1, ph: '#F2A7B8' },
  cluster: { sheet: 'street_petals', frames: [[0, 1]], heavy: false, light: true, scale: 1, ph: '#F2A7B8' },
  blossom: { sheet: 'street_petals', frames: [[1, 1]], heavy: false, light: true, scale: 1, ph: '#F2A7B8' },
  twig: { sheet: 'street_petals', frames: [[3, 1]], heavy: false, light: true, scale: 1, ph: '#6B4226' },
};
export const PETAL_ON_GROUND = [2, 1];
export const STREET_PROP = {
  postbox: [0, 0], bicycle: [1, 0], lamp: [2, 0],
  bench: [0, 1], sign: [1, 1], jizo: [2, 1],
};
// npc_beggar (street, sitting, faces LEFT): idle A, idle B, talking, laughing
export const BEGGAR = { idle: [0, 1], talk: [2, 0], laugh: 3 };

// player_side (intro): row 0 = 4-frame walk to the right, row 1 = wake-up sequence
export const SIDE = { walkRow: 0, asleep: [0, 1], startled: [1, 1], shaking: [2, 1], standing: [3, 1] };

// Idle loop for 4-frame sheets
export const IDLE = [0, 1];
// Minibosses (4×2): row 0 = idle A, idle B, spawning minions, hurt · row 1 = 4-frame walk, facing LEFT
export const MINIBOSS = { idle: [0, 1], spawn: 2, hurt: 3, walkRow: 1, walk: [0, 1, 2, 3] };
// Minions (4×1): moving A, B, C, hit
export const MINION = { move: [0, 1, 2, 1], hit: 3 };
// Colleagues (4×1): idle A, idle B, their action, talking
export const NPC = { idle: [0, 1], action: 2, talk: [3, 0] };

// boss_ceo (the oni): row 0 normal, row 1 enraged. cols: idle A, idle B, throwing hearts / roaring, hurt (row 0) / defeated (row 1)
export const BOSS = { idle: [0, 1], fire: 2, hurt: 3, defeated: [3, 1] };

// fx_items
export const FX = {
  mochi: ['fx_items', 0, 0], mochiSparkle: ['fx_items', 1, 0], paper: ['fx_items', 2, 0],
  heart1: ['fx_items', 3, 0], heart2: ['fx_items', 0, 1], spark: ['fx_items', 1, 1],
  smoke: ['fx_items', 2, 1], star: ['fx_items', 3, 1],
};

// Floor tiles (tiles_floor, 16×16): [col, row]. `ph` = placeholder colour when the sheet is missing.
// extra: [col, row, chance, sheet?] — random variants mixed in; X = tiles_floor_extra (skipped while that sheet is missing).
// `sheet` on a type = its base cells come from another sheet.
const X = 'tiles_floor_extra';
export const FLOOR = {
  carpet: { cells: [[0, 0]], extra: [[0, 0, 0.08, X], [1, 0, 0.02], [2, 0, 0.02], [3, 0, 0.01], [0, 1, 0.006, X], [1, 1, 0.006, X], [3, 1, 0.015, X]], ph: '#6E9E8E' },
  carpetWave: { cells: [[1, 0]], ph: '#77A797' },
  tatami: { cells: [[0, 1], [2, 1]], checker: true, extra: [[3, 1, 0.04]], ph: '#C9B77A' },
  tatamiEdge: { cells: [[1, 1]], ph: '#B7A266' },
  kitchen: { cells: [[1, 2]], extra: [[3, 2, 0.04], [2, 2, 0.03], [1, 3, 0.015, X]], ph: '#E4DAC4' },        // plain cream tiles (the checker was too busy)
  lobby: { cells: [[1, 2]], extra: [[0, 2, 0.35, X], [1, 2, 0.3, X]], ph: '#EFE5CF' },
  wood: { sheet: X, cells: [[2, 2]], extra: [[3, 2, 0.12, X]], ph: '#A0723F' },          // meeting room floorboards
  server: { cells: [[0, 3]], extra: [[2, 3, 0.08], [2, 3, 0.05, X]], ph: '#8E8A84' },
  archive: { cells: [[1, 3]], ph: '#9C978D' },
  archiveStripe: { sheet: X, cells: [[3, 3]], ph: '#C9A43A' },                            // safety line in front of the machines
  wornH: { sheet: X, cells: [[2, 0]], ph: '#668F80' },                                   // worn carpet along the walkers' routes
  wornV: { sheet: X, cells: [[3, 0]], ph: '#668F80' },
  rug: { cells: [[3, 3]], ph: '#3A3F78' },
};

// Wall tiles (tiles_wall): faces are the visible fronts, caps the tops seen from above.
export const WALL = {
  face: [0, 0], window: [1, 0], dawnWindow: [2, 0], scroll: [3, 0],
  door: [0, 1], noren: [1, 1], shoji: [2, 1], notice: [3, 1],
  partH: [0, 2], partV: [1, 2], partCorner: [2, 2], partEnd: [3, 2],
  cap: [0, 3], capInner: [1, 3], capOuter: [2, 3], pillar: [3, 3],
};
// Things hanging on walls (wall_decor): full wall-face tiles, used in the level's face list like the WALL keys.
export const WALL_DECOR = {
  clock: [0, 0], calendar: [1, 0], extinguisher: [2, 0], aircon: [3, 0],
  poster: [0, 1], photo: [1, 1], switch: [2, 1], exit: [3, 1],
  tv: [0, 2], hangplant: [1, 2], hooks: [2, 2], safety: [3, 2],
};

// Props: sheet + cell, footprint in tiles (w, h — the solid part at the bottom of the picture),
// solid=false for things you can walk over, ph = placeholder colour.
const P = (sheet, col, row, w, h, ph, extra = {}) => ({ sheet, col, row, w, h, ph, solid: true, ...extra });
export const PROPS = {
  // cubicles (all 3×2 tiles so the floor plan stays a grid)
  cubicle_tidy: P('props_cubicles_a', 0, 0, 3, 2, '#9C978D'),
  cubicle_messy: P('props_cubicles_a', 1, 0, 3, 2, '#A9A293'),
  cubicle_overtime: P('props_cubicles_a', 2, 0, 3, 2, '#8F8A80'),
  cubicle_plants: P('props_cubicles_a', 0, 1, 3, 2, '#8FA88F'),
  cubicle_empty: P('props_cubicles_a', 1, 1, 3, 2, '#B5AE9E'),
  cubicle_lucky: P('props_cubicles_a', 2, 1, 3, 2, '#B08F7F'),
  cubicle_island: P('props_cubicles_b', 0, 0, 3, 2, '#9A958A'),
  cubicle_intern: P('props_cubicles_b', 1, 0, 3, 2, '#A39E93'),
  cubicle_caffeine: P('props_cubicles_b', 2, 0, 3, 2, '#977F6B'),
  cubicle_sticky: P('props_cubicles_b', 0, 1, 3, 2, '#C9B77A'),
  own_desk: P('props_cubicles_b', 1, 1, 3, 2, '#B97A2E', { label: 'Your desk' }),
  own_desk_mail: P('props_cubicles_b', 2, 1, 3, 2, '#E8B84A', { label: 'Your desk' }),
  // manager's corner
  manager_desk: P('props_manager', 0, 0, 3, 2, '#6B4226'),
  manager_chair: P('props_manager', 1, 0, 1, 1, '#1B1A2E'),
  bonsai_big: P('props_manager', 2, 0, 1, 1, '#3E6B4F'),
  maneki: P('props_manager', 0, 1, 1, 1, '#E8B84A'),
  trophies: P('props_manager', 1, 1, 2, 1, '#B97A2E'),
  aquarium: P('props_manager', 2, 1, 2, 1, '#9CC3E6', { anim: { sheet: 'props_anim', frames: [[0, 0], [1, 0], [2, 0], [3, 0]], fps: 3 } }),
  // kitchen
  coffee_good: P('props_kitchen', 0, 0, 2, 1, '#8C2A2A', { label: 'Coffee' }),
  water_cooler: P('props_kitchen', 1, 0, 1, 1, '#9CC3E6', { anim: { sheet: 'props_anim', frames: [[0, 1], [1, 1], [2, 1], [3, 1]], fps: 2, pause: 4 } }),
  fridge: P('props_kitchen', 2, 0, 2, 1, '#F2E8D5'),
  kitchen_table: P('props_kitchen', 0, 1, 3, 2, '#6B4226'),
  vending: P('props_kitchen', 1, 1, 2, 1, '#D9412B'),
  counter: P('props_kitchen', 2, 1, 3, 1, '#A39E93'),
  // archive / print room
  printer: P('props_archive', 0, 0, 2, 1, '#F2E8D5'),
  fax: P('props_archive', 1, 0, 1, 1, '#A39E93'),
  shredder: P('props_archive', 2, 0, 1, 1, '#5C5A63'),
  cabinets: P('props_archive', 0, 1, 2, 1, '#5C5A63'),
  binders: P('props_archive', 1, 1, 2, 1, '#5468A8'),
  boxes: P('props_archive', 2, 1, 2, 1, '#B97A2E'),
  // meeting room
  meeting_table: P('props_meeting', 0, 0, 3, 2, '#6B4226'),
  meeting_table_big: P('props_meeting', 0, 0, 6, 3, '#6B4226', { scale: 4 }),   // the same table drawn at double size: one long boardroom table
  meeting_chair: P('props_meeting', 1, 0, 1, 1, '#1B1A2E'),
  whiteboard: P('props_meeting', 2, 0, 2, 1, '#F2E8D5'),
  projector: P('props_meeting', 0, 1, 1, 1, '#5C5A63'),
  clock: P('props_meeting', 1, 1, 1, 1, '#E8B84A'),
  plant_tall: P('props_meeting', 2, 1, 1, 1, '#3E6B4F'),
  // server closet
  rack: P('props_server', 0, 0, 2, 1, '#1B1A2E'),
  rack_open: P('props_server', 1, 0, 2, 1, '#26295A'),
  cables: P('props_server', 2, 0, 2, 1, '#5C5A63', { solid: false }),
  fan: P('props_server', 0, 1, 1, 1, '#9CC3E6', { anim: { sheet: 'props_anim', frames: [[0, 2], [1, 2], [2, 2], [3, 2]], fps: 10 } }),
  towers: P('props_server', 1, 1, 2, 1, '#F0C9A0'),
  kamidana: P('props_server', 2, 1, 2, 1, '#6B4226'),
  // misc
  coat_rack: P('props_misc', 0, 0, 1, 1, '#6B4226'),
  umbrellas: P('props_misc', 1, 0, 1, 1, '#5468A8'),
  shoe_locker: P('props_misc', 2, 0, 2, 1, '#B97A2E'),
  bonsai: P('props_misc', 0, 1, 1, 1, '#3E6B4F'),
  lantern: P('props_misc', 1, 1, 1, 1, '#D9412B'),
  lift_door: P('props_misc', 2, 1, 3, 3, '#E8B84A', { solid: false, label: 'LIFT' }),

  // ---- office decor v2
  // open island desks (no chairs; chairs are their own props). up = the worker sits below and faces up.
  desk_up_tidy: P('props_desks_a', 0, 0, 3, 1, '#A39E93'),
  desk_up_messy: P('props_desks_a', 1, 0, 3, 1, '#A9A293'),
  desk_up_cactus: P('props_desks_a', 2, 0, 3, 1, '#8FA88F'),
  desk_down_tidy: P('props_desks_a', 0, 1, 3, 1, '#A39E93'),
  desk_down_messy: P('props_desks_a', 1, 1, 3, 1, '#A9A293'),
  desk_down_cactus: P('props_desks_a', 2, 1, 3, 1, '#8FA88F'),
  // side desks: the worker sits to the RIGHT and faces left (flip = sits left, faces right)
  desk_left_tidy: P('props_desks_b', 0, 0, 2, 2, '#A39E93'),
  desk_left_messy: P('props_desks_b', 1, 0, 2, 2, '#A9A293'),
  desk_left_cactus: P('props_desks_b', 2, 0, 2, 2, '#8FA88F'),
  chief_desk: P('props_desks_b', 0, 1, 3, 1, '#6B4226'),
  screen: P('props_desks_b', 1, 1, 2, 1, '#A39E93'),
  planter: P('props_desks_b', 2, 1, 3, 1, '#3E6B4F'),
  // chairs: the direction the sitter faces (left + flip = right)
  chair_up: P('props_chairs', 0, 0, 1, 1, '#26295A'),
  chair_down: P('props_chairs', 1, 0, 1, 1, '#26295A'),
  chair_left: P('props_chairs', 2, 0, 1, 1, '#26295A'),
  chair_out: P('props_chairs', 3, 0, 1, 1, '#26295A'),
  mchair_up: P('props_chairs', 0, 1, 1, 1, '#6B4226'),
  mchair_down: P('props_chairs', 1, 1, 1, 1, '#6B4226'),
  mchair_left: P('props_chairs', 2, 1, 1, 1, '#6B4226'),
  stool: P('props_chairs', 3, 1, 1, 1, '#6B4226'),
  // against a wall. wall: which wall it must touch ('top' = the wall above it, 'right' = the wall to its right; flip → 'left')
  bookshelf: P('props_wall_front', 0, 0, 2, 1, '#6B4226', { wall: 'top' }),
  lockers: P('props_wall_front', 1, 0, 2, 1, '#5C5A63', { wall: 'top' }),
  recycling: P('props_wall_front', 2, 0, 2, 1, '#5468A8', { wall: 'top' }),
  sink: P('props_wall_front', 0, 1, 3, 1, '#A39E93', { wall: 'top' }),
  cabinet: P('props_wall_front', 1, 1, 2, 1, '#6B4226', { wall: 'top' }),
  copier: P('props_wall_front', 2, 1, 2, 1, '#F2E8D5', { wall: 'top' }),
  bookshelf_side: P('props_wall_side', 0, 0, 1, 2, '#6B4226', { wall: 'right' }),
  lockers_side: P('props_wall_side', 1, 0, 1, 2, '#5C5A63', { wall: 'right' }),
  recycling_side: P('props_wall_side', 2, 0, 1, 2, '#5468A8', { wall: 'right' }),
  sink_side: P('props_wall_side', 0, 1, 1, 2, '#A39E93', { wall: 'right' }),
  cabinet_side: P('props_wall_side', 1, 1, 1, 2, '#6B4226', { wall: 'right' }),
  copier_side: P('props_wall_side', 2, 1, 1, 2, '#F2E8D5', { wall: 'right' }),
  // lobby + manager
  reception: P('props_lounge', 0, 0, 3, 1, '#6B4226'),
  bench: P('props_lounge', 1, 0, 2, 1, '#6B4226'),
  palm: P('props_lounge', 2, 0, 1, 1, '#3E6B4F'),
  putting: P('props_lounge', 0, 1, 3, 1, '#3E6B4F', { solid: false, flat: true }),
  coffee_table: P('props_lounge', 1, 1, 2, 1, '#6B4226'),
  sofa: P('props_lounge', 2, 1, 2, 1, '#8C2A2A'),

  // ---- Level 2: the canteen
  counter_l: P('props_canteen_counter', 0, 0, 3, 1, '#A39E93'),
  counter_m: P('props_canteen_counter', 1, 0, 3, 1, '#A39E93'),
  counter_r: P('props_canteen_counter', 2, 0, 3, 1, '#A39E93'),
  samples: P('props_canteen_counter', 0, 1, 2, 1, '#F2E8D5'),
  tray_rack: P('props_canteen_counter', 1, 1, 2, 1, '#6B4226'),
  tea: P('props_canteen_counter', 2, 1, 2, 1, '#3E6B4F'),
  table_l: P('props_canteen_tables', 0, 0, 3, 1, '#E8B84A', { table: true }),
  table_m: P('props_canteen_tables', 1, 0, 3, 1, '#E8B84A', { table: true }),
  table_r: P('props_canteen_tables', 2, 0, 3, 1, '#E8B84A', { table: true }),
  window_counter: P('props_canteen_tables', 0, 1, 3, 1, '#E8B84A', { table: true }),
  chabudai: P('props_canteen_tables', 1, 1, 3, 1, '#8C2A2A', { table: true }),
  table_small: P('props_canteen_tables', 2, 1, 2, 1, '#E8B84A', { table: true }),
  ticket_machine: P('props_canteen_misc', 0, 0, 2, 1, '#F2E8D5', { label: 'Tickets' }),
  ticket_machine_on: P('props_canteen_misc', 1, 0, 2, 1, '#E8B84A', { label: 'Tickets' }),
  vending_canteen: P('props_canteen_misc', 2, 0, 2, 1, '#D9412B'),
  tray_return: P('props_canteen_misc', 0, 1, 2, 1, '#A39E93'),
  bins: P('props_canteen_misc', 1, 1, 2, 1, '#5468A8'),
  palm_canteen: P('props_canteen_misc', 2, 1, 1, 1, '#3E6B4F'),
  rice_cooker: P('props_canteen_anim', 0, 0, 2, 1, '#F2E8D5', { anim: { sheet: 'props_canteen_anim', frames: [[0, 0], [1, 0], [2, 0], [3, 0]], fps: 2, pause: 0 } }),
  conveyor: P('props_canteen_anim', 0, 1, 3, 1, '#A39E93', { anim: { sheet: 'props_canteen_anim', frames: [[0, 1], [1, 1], [2, 1], [3, 1]], fps: 4 } }),
  napper: P('props_canteen_anim', 0, 2, 3, 1, '#6B4226', { anim: { sheet: 'props_canteen_anim', frames: [[0, 2], [1, 2], [2, 2], [3, 2]], fps: 1.2 } }),
  cherry_tree: P('props_rooftop', 0, 0, 2, 1, '#F2A7B8'),
  roof_bench: P('props_rooftop', 1, 0, 2, 1, '#6B4226'),
  water_tank: P('props_rooftop', 2, 0, 2, 1, '#A39E93'),
  ac_unit: P('props_rooftop', 0, 1, 2, 1, '#F2E8D5'),
  roof_plants: P('props_rooftop', 1, 1, 2, 1, '#3E6B4F'),
  stair_hut: P('props_rooftop', 2, 1, 2, 1, '#A39E93'),
  salad_bar: P('props_healthweek', 0, 0, 3, 1, '#7FB3A0'),
  fruit_basket: P('props_healthweek', 1, 0, 1, 1, '#B97A2E'),
  yoga_mat: P('props_healthweek', 2, 0, 1, 1, '#5468A8'),
  balloon_chair: P('props_healthweek', 0, 1, 1, 1, '#F2A7B8'),
  pedometers: P('props_healthweek', 1, 1, 2, 1, '#B97A2E'),
  blender: P('props_healthweek', 2, 1, 1, 1, '#F2E8D5'),
};

// Clutter on the floor (props_clutter): drawn flat under everything, walk over it. Placed at random by the level.
// [col, row, scale] — small things are drawn smaller so they keep their real size next to the furniture.
export const CLUTTER = {
  papers: [0, 0, 1.5], cable: [1, 0, 1.5], balls: [2, 0, 1], tie: [3, 0, 1],
  box: [0, 1, 1.5], slippers: [1, 1, 1], spill: [2, 1, 1], magazines: [3, 1, 1.5],
};

// Background colleagues (decoration only, no interaction).
// npc_worker_*: rows = facing up (seen from behind), down, left; cols = typing A, typing B, action 1, action 2.
export const WORKER_SHEETS = ['npc_worker_mouse', 'npc_worker_beaver', 'npc_worker_frog', 'npc_worker_cat'];
export const WORKER_ROW = { up: 0, down: 1, left: 2, right: 2 };
export const WORKER = { type: [0, 1], actions: [2, 3] };
// npc_walker_*: same layout as the player sheets (rows down/left/up, cols step/stand/step).
export const WALKER_SHEETS = { coffee: 'npc_walker_coffee', papers: 'npc_walker_papers', tray: 'npc_walker_tray' };

export const CUBICLE_VARIANTS = [
  'cubicle_tidy', 'cubicle_messy', 'cubicle_overtime', 'cubicle_plants', 'cubicle_empty', 'cubicle_lucky',
  'cubicle_island', 'cubicle_intern', 'cubicle_caffeine', 'cubicle_sticky',
];

// Walk frame from distance walked (no foot sliding: frames advance with movement, not time).
export function walkFrame(distance, stride) {
  return WALK[Math.floor(distance / stride) % WALK.length];
}

// Looping frame from time.
export function loop(frames, t, fps) {
  return frames[Math.floor(t * fps) % frames.length];
}

// Direction name from a facing vector. Horizontal wins on diagonals so side profiles show while strafing.
export function dirOf(fx, fy, prev = 'down') {
  if (Math.abs(fx) < 0.01 && Math.abs(fy) < 0.01) return prev;
  if (Math.abs(fx) >= Math.abs(fy) - 0.01) return fx < 0 ? 'left' : 'right';
  return fy < 0 ? 'up' : 'down';
}

// Sheet row + mirror flag for a direction (sheets only have down/left/up).
export function rowOf(dir) {
  return dir === 'right' ? [DIR_ROW.left, true] : [DIR_ROW[dir], false];
}

// ---------------------------------------------------------------- Level 2: the canteen
const CF = 'tiles_canteen_floor';
// Canteen floors (tiles_canteen_floor): rows = linoleum, quarry tiles (kitchen), tatami, rooftop.
export const CANTEEN_FLOOR = {
  lino: { sheet: CF, cells: [[0, 0]], extra: [[2, 0, 0.012, CF], [3, 0, 0.004, CF]], ph: '#E9DFC6' },
  linoWorn: { sheet: CF, cells: [[1, 0]], ph: '#DED3B8' },
  quarry: { sheet: CF, cells: [[0, 1]], extra: [[1, 1, 0.12, CF], [3, 1, 0.06, CF]], ph: '#8C2A2A' },
  drain: { sheet: CF, cells: [[2, 1]], ph: '#8C2A2A' },
  tatami: { sheet: CF, cells: [[0, 2], [2, 2]], checker: true, extra: [[3, 2, 0.05, CF]], ph: '#C9B77A' },
  tatamiEdge: { sheet: CF, cells: [[1, 2]], ph: '#B7A266' },
  concrete: { sheet: CF, cells: [[0, 3]], extra: [[1, 3, 0.12, CF]], ph: '#A39E93' },
  deck: { sheet: CF, cells: [[2, 3]], ph: '#6B4226' },
  grass: { sheet: CF, cells: [[3, 3]], ph: '#3E6B4F' },
};
// Canteen walls (tiles_canteen_wall). partH / partEnd = the rooftop railing.
export const CANTEEN_WALL = {
  face: [0, 0], window: [1, 0], menu: [2, 0], bowlPhoto: [3, 0],
  noren: [0, 1], hatch: [1, 1], steelDoor: [2, 1], stairDoor: [3, 1],
  partH: [0, 2], partEnd: [0, 2], railH: [0, 2], railCorner: [2, 2], parapet: [3, 2],
  cap: [0, 3], capInner: [1, 3], capOuter: [2, 3], pillar: [3, 3],
};
export const CANTEEN_DECOR = {
  clock: [0, 0], tv: [1, 0], lantern: [2, 0], wallFan: [3, 0],
  carrotPoster: [0, 1], saladPoster: [1, 1], kamidana: [2, 1], firstAid: [3, 1],
};
// npc_eaters_down / npc_eaters_up: one row per colleague (mouse, beaver, frog, cat); cols eat A, eat B, sip tea, chat
export const EATERS = { type: [0, 1], actions: [2, 3] };
// player_eat: row 0 seen from the front (seat above a table), row 1 from behind (seat below a table)
export const PLAYER_EAT = { bite: 0, chew: 1, sip: 2, happy: 3, startled: 3, rowDown: 0, rowUp: 1 };
// miniboss_ramen (4x3): row 0 idle A, idle B, shooting, hurt · row 1 walk · row 2 whip wind-up, whip, enraged idle, defeated bowl
export const RAMEN = { idle: [0, 1], shoot: 2, hurt: 3, walkRow: 1, walk: [0, 1, 2, 3], windup: [0, 2], whip: [1, 2], angry: [2, 2], bowl: [3, 2] };
// boss_rokurokubi (4x2): row 0 idle A, idle B, pointing, hurt · row 1 (enraged) idle A, idle B, shouting, defeated
export const ROKU = { idle: [0, 1], point: 2, hurt: 3, defeated: [3, 1] };
// rokurokubi_head (4x2): row 0 suspicious, peeking, talking, hurt · row 1 (enraged) glare, bite, talk, dizzy
export const ROKU_HEAD = { look: 0, peek: 1, talk: 2, hurt: 3 };
// rokurokubi_neck (4x1): vertical, horizontal, bend, collar
export const ROKU_NECK = { segment: [0, 0], collar: [3, 0] };
// npc_obachan: idle A, stirring, holding out a tray, talking · npc_intern: sad, poking food, waving, talking
export const OBACHAN = { idle: [0, 1], tray: 2, talk: [3, 0] };
export const INTERN = { sad: [0, 1], wave: 2, talk: [3, 2] };
// props_trays (4x3, cell 36): row 0 full tray per meal, row 1 half eaten, row 2 empty / spilled / chopsticks / tea
export const TRAY = { full: 0, half: 1, emptyRow: 2, empty: 0, spilled: 1 };
// meal order on the ticket machine = column in food_icons row 0 and in props_trays
export const MEALS = ['curry', 'miso', 'onigiri', 'ramen'];
// food_icons: row 0 the four meals · row 1 pickles (side dish), ramen egg (bonus), green tea, empty bowl
export const FOOD = { side: [0, 1], bonus: [1, 1], tea: [2, 1], empty: [3, 1] };
// fx_canteen: shrimp, shrimp turned, pager ping, steam · broth splash, rice splat, noodle lash, sparkle
export const FXC = {
  shrimp: ['fx_canteen', 0, 0], shrimp2: ['fx_canteen', 1, 0], ping: ['fx_canteen', 2, 0], steam: ['fx_canteen', 3, 0],
  splash: ['fx_canteen', 0, 1], rice: ['fx_canteen', 1, 1], lash: ['fx_canteen', 2, 1], sparkle: ['fx_canteen', 3, 1],
};

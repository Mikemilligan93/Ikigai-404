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
export const WALKER_SHEETS = { coffee: 'npc_walker_coffee', papers: 'npc_walker_papers' };

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

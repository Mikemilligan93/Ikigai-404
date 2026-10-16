// What every frame of every sprite sheet means — the same layout the prompts in docs/PROMPTS.md ask for.
// [sheet, col, row]. Change a frame here if ChatGPT put something in a different cell.

// Character sheets: rows are directions. "right" = the "left" row mirrored.
export const DIR_ROW = { down: 0, left: 1, up: 2 };

// Walk cycle over the 3 columns (left foot, standing, right foot): 0,1,2,1,…
export const WALK = [0, 1, 2, 1];
export const STAND = 1;

// player_actions: per direction row → winding up, swing, throw
export const ACTION = { windup: 0, swing: 1, throw: 2 };

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
export const FLOOR = {
  carpet: { cells: [[0, 0]], extra: [[1, 0, 0.06], [2, 0, 0.03], [3, 0, 0.02]], ph: '#6E9E8E' },
  carpetWave: { cells: [[1, 0]], ph: '#77A797' },
  tatami: { cells: [[0, 1], [2, 1]], checker: true, extra: [[3, 1, 0.04]], ph: '#C9B77A' },
  tatamiEdge: { cells: [[1, 1]], ph: '#B7A266' },
  kitchen: { cells: [[0, 2]], extra: [[3, 2, 0.05], [2, 2, 0.02]], ph: '#E4DAC4' },
  lobby: { cells: [[1, 2]], ph: '#EFE5CF' },
  server: { cells: [[0, 3]], extra: [[2, 3, 0.15]], ph: '#8E8A84' },
  archive: { cells: [[1, 3]], ph: '#9C978D' },
  rug: { cells: [[3, 3]], ph: '#3A3F78' },
};

// Wall tiles (tiles_wall): faces are the visible fronts, caps the tops seen from above.
export const WALL = {
  face: [0, 0], window: [1, 0], dawnWindow: [2, 0], scroll: [3, 0],
  door: [0, 1], noren: [1, 1], shoji: [2, 1], notice: [3, 1],
  partH: [0, 2], partV: [1, 2], partCorner: [2, 2], partEnd: [3, 2],
  cap: [0, 3], capInner: [1, 3], capOuter: [2, 3], pillar: [3, 3],
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
  aquarium: P('props_manager', 2, 1, 2, 1, '#9CC3E6'),
  // kitchen
  coffee_good: P('props_kitchen', 0, 0, 2, 1, '#8C2A2A', { label: 'Coffee' }),
  water_cooler: P('props_kitchen', 1, 0, 1, 1, '#9CC3E6'),
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
  fan: P('props_server', 0, 1, 1, 1, '#9CC3E6'),
  towers: P('props_server', 1, 1, 2, 1, '#F0C9A0'),
  kamidana: P('props_server', 2, 1, 2, 1, '#6B4226'),
  // misc
  coat_rack: P('props_misc', 0, 0, 1, 1, '#6B4226'),
  umbrellas: P('props_misc', 1, 0, 1, 1, '#5468A8'),
  shoe_locker: P('props_misc', 2, 0, 2, 1, '#B97A2E'),
  bonsai: P('props_misc', 0, 1, 1, 1, '#3E6B4F'),
  lantern: P('props_misc', 1, 1, 1, 1, '#D9412B'),
  lift_door: P('props_misc', 2, 1, 3, 3, '#E8B84A', { solid: false, label: 'LIFT' }),
};

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

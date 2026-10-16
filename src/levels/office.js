// Level 1 layout. Coordinates in world pixels. Edit positions here; tuning numbers live in config.json.

export const OFFICE = {
  width: 3000,
  height: 1900,
  playerStart: { x: 200, y: 1720 },

  walls: [
    { x: 0, y: 0, w: 3000, h: 80 },       // top (windows)
    { x: 0, y: 1860, w: 3000, h: 40 },    // bottom
    { x: 0, y: 0, w: 40, h: 1900 },       // left
    { x: 2960, y: 0, w: 40, h: 1900 },    // right
    { x: 640, y: 80, w: 24, h: 300 },     // kitchen divider (gap below)
  ],

  // Cubicle blocks (360×170). The centre ones are left out to make an open meeting area = boss arena.
  cubicles: (() => {
    const cols = [800, 1320, 1840, 2360];
    const rows = [260, 640, 1020, 1400];
    const out = [];
    for (const y of rows) for (const x of cols) {
      const centre = (x === 1320 || x === 1840) && (y === 640 || y === 1020);
      if (!centre) out.push({ x, y, w: 360, h: 170 });
    }
    return out;
  })(),

  ownDesk: { x: 330, y: 1480, w: 140, h: 80 },
  coffeeMachine: { x: 90, y: 90, w: 70, h: 70 },
  lift: { x: 2900, y: 830, w: 60, h: 170 },
  arenaCentre: { x: 1760, y: 915 },

  // Decorative obstacles: key = image key in assets/manifest.json
  props: [
    { key: 'kitchen_table', x: 250, y: 250, w: 220, h: 120, label: 'Kitchen table' },
    { key: 'water_cooler', x: 690, y: 560, w: 44, h: 44, label: 'Water' },
    { key: 'water_cooler', x: 2270, y: 1290, w: 44, h: 44, label: 'Water' },
    { key: 'printer_decor', x: 1210, y: 540, w: 70, h: 60, label: 'Printer' },
    { key: 'printer_decor', x: 2760, y: 1050, w: 70, h: 60, label: 'Printer' },
    { key: 'coat_rack', x: 70, y: 1300, w: 44, h: 44, label: 'Coats' },
    { key: 'plant', x: 60, y: 600, w: 48, h: 48, label: 'Plant' },
    { key: 'plant', x: 2890, y: 120, w: 48, h: 48, label: 'Plant' },
    { key: 'plant', x: 1760, y: 1780, w: 48, h: 48, label: 'Plant' },
  ],

  minibosses: [
    { id: 'printer', x: 2820, y: 220 },
    { id: 'coffee', x: 2820, y: 1730 },
    { id: 'fax', x: 1260, y: 1740 },
  ],

  friendlyNpcs: [
    { type: 'motivator', x: 980, y: 470 },
    { type: 'complainer', x: 1500, y: 470 },
    { type: 'mentor', x: 2020, y: 1260 },
    { type: 'meetinger', x: 2540, y: 1260 },
  ],

  mochiSpots: [
    { x: 480, y: 900 }, { x: 1240, y: 900 }, { x: 2280, y: 520 }, { x: 2280, y: 1700 },
    { x: 1000, y: 1290 }, { x: 2800, y: 900 }, { x: 1600, y: 200 }, { x: 600, y: 1700 },
    { x: 1760, y: 720 }, { x: 1760, y: 1110 },
  ],
};

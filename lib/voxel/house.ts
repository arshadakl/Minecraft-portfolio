import { Block } from "./blocks";

/**
 * Two-story cottage scene, all procedural. Mossy-stone ground floor under
 * an oak second story (facade only — rooms stay on the ground floor), log
 * frame columns, banded gable roof, balcony over the door with an outside
 * stair, smoking chimney, lantern-lit garden, pond, crop bed, terraced
 * hills with birch trees — and a back door the camera loops out of for
 * the infinite scroll.
 */

export interface BlockGroup {
  type: Block;
  positions: number[]; // flat [x,y,z, ...]
}

const X1 = -6;
const X2 = 6;
const Z1 = -44;
const Z2 = 8;
const WALL_TOP = 4;
const CEIL_Y = 5;
/** Top plate of the facade-only second story; the roof sits above it. */
const UPPER_TOP = 8;

// Flat lawn bounds; terraced hills rise beyond these
const FLAT_X = 20;
const FLAT_Z_MIN = -52;
const FLAT_Z_MAX = 32;
// Extended world bounds
const EXT_X = 52;
const EXT_Z_MIN = -78;
const EXT_Z_MAX = 54;

const PARTITIONS: { z: number; doorX: [number, number] }[] = [
  { z: 2, doorX: [-1, 0] },
  // Door holes must straddle the camera curve's crossing x or the camera
  // clips through the partition — see lib/path.ts and verify crossings.
  { z: -6, doorX: [-1, 0] },
  { z: -12, doorX: [-1, 0] },
  { z: -20, doorX: [0, 2] }, // 3-wide: camera swings east entering the gallery
  { z: -32, doorX: [-2, -1] },
  { z: -38, doorX: [0, 1] },
];

// Panes are skipped on walls where a content board hangs (a board over
// glass reads wrong, and glass z-fights the backing).
const WINDOW_Z: { z: [number, number]; west: boolean; east: boolean }[] = [
  { z: [4, 5], west: true, east: true },
  { z: [-2, -1], west: true, east: true },
  { z: [-9, -8], west: false, east: true }, // fame board on the west wall
  { z: [-16, -15], west: true, east: false }, // job boards on the east wall
  { z: [-25, -24], west: false, east: false }, // project frames, both walls
  { z: [-29, -28], west: false, east: false }, // project frames, both walls
  { z: [-36, -35], west: true, east: false }, // skills board on the east wall
];

const OAKS: [number, number][] = [
  [-10, 13],
  [9, 20],
  [-8, 27],
  [12, 28],
];

export const LANTERN_LIGHTS: [number, number, number][] = [
  [-3, 2, 10],
  [2, 2, 10],
  [-2, 2, 17],
  [1, 2, 23],
];

/** Pond footprint (west lawn) — used by the scene for placement checks. */
export const POND = { x1: -16, x2: -11, z1: 16, z2: 21 };

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Deterministic 2D hash in [0,1) for terrain wobble. */
function hash2(x: number, z: number): number {
  let h = (x * 374761393 + z * 668265263) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Terraced hill height (in blocks above the lawn) at a column. */
export function hillHeight(x: number, z: number): number {
  const dx = Math.max(-FLAT_X - x, x - FLAT_X, 0);
  const dz = Math.max(FLAT_Z_MIN - z, z - FLAT_Z_MAX, 0);
  const d = Math.max(dx, dz) + (hash2(Math.floor(x / 3), Math.floor(z / 3)) - 0.5) * 4;
  return Math.max(0, Math.min(11, Math.floor((d - 1) / 2.2)));
}

export function buildScene(): BlockGroup[] {
  const map = new Map<string, Block>();
  const decor: [Block, number, number, number][] = []; // may overlap map cells
  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  const put = (x: number, y: number, z: number, b: Block) => map.set(key(x, y, z), b);
  const carve = (x: number, y: number, z: number) => map.delete(key(x, y, z));
  const has = (x: number, y: number, z: number) => map.has(key(x, y, z));
  const fill = (
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    z1: number,
    z2: number,
    b: Block
  ) => {
    for (let x = x1; x <= x2; x++)
      for (let y = y1; y <= y2; y++)
        for (let z = z1; z <= z2; z++) put(x, y, z, b);
  };
  const rand = lcg(20260705);
  const stone = () => (rand() < 0.4 ? Block.MossyBrick : Block.StoneBrick);

  // ================================================================ terrain
  // Base grass across the whole extended field
  fill(-EXT_X, EXT_X, -1, -1, EXT_Z_MIN, EXT_Z_MAX, Block.GrassBlock);

  // Terraced hills ring: dirt risers, grass tops, only exposed blocks
  for (let x = -EXT_X; x <= EXT_X; x++) {
    for (let z = EXT_Z_MIN; z <= EXT_Z_MAX; z++) {
      const h = hillHeight(x, z);
      if (h <= 0) continue;
      const minN = Math.min(
        hillHeight(x - 1, z),
        hillHeight(x + 1, z),
        hillHeight(x, z - 1),
        hillHeight(x, z + 1)
      );
      for (let y = Math.max(0, minN); y < h - 1; y++) put(x, y, z, Block.Dirt);
      put(x, h - 1, z, Block.GrassBlock);
      if (hash2(x, z) < 0.16) decor.push([Block.GrassTuft, x, h, z]);
      else if (hash2(x + 999, z) < 0.03)
        decor.push([hash2(x, z + 999) < 0.5 ? Block.FlowerRose : Block.FlowerBlue, x, h, z]);
    }
  }

  // Birch trees scattered on the terraces
  let birches = 0;
  while (birches < 16) {
    const x = Math.floor(rand() * 2 * EXT_X) - EXT_X;
    const z = Math.floor(rand() * (EXT_Z_MAX - EXT_Z_MIN)) + EXT_Z_MIN;
    const h = hillHeight(x, z);
    if (h < 2 || h > 9) continue;
    if (Math.abs(x) > EXT_X - 4 || z < EXT_Z_MIN + 4 || z > EXT_Z_MAX - 4) continue;
    const base = h; // first trunk block sits on the grass top
    const trunkH = 4 + Math.floor(rand() * 2);
    fill(x, x, base, base + trunkH - 1, z, z, Block.BirchLog);
    const top = base + trunkH;
    for (let dy = -2; dy <= -1; dy++) {
      for (let dx = -2; dx <= 2; dx++)
        for (let dz = -2; dz <= 2; dz++) {
          if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
          if (dx === 0 && dz === 0) continue;
          put(x + dx, top + dy, z + dz, Block.BirchLeaves);
        }
    }
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++) put(x + dx, top, z + dz, Block.BirchLeaves);
    put(x, top + 1, z, Block.BirchLeaves);
    put(x - 1, top + 1, z, Block.BirchLeaves);
    put(x + 1, top + 1, z, Block.BirchLeaves);
    put(x, top + 1, z - 1, Block.BirchLeaves);
    put(x, top + 1, z + 1, Block.BirchLeaves);
    birches++;
  }

  // Lawn features
  fill(-1, 0, -1, -1, 9, 30, Block.Path);
  fill(X1, X2, -1, -1, Z1, Z2, Block.PlankOak); // house floor

  // Pond: dirt bed below, water slabs sunk half a block
  fill(POND.x1, POND.x2, -2, -2, POND.z1, POND.z2, Block.Dirt);
  for (let x = POND.x1; x <= POND.x2; x++)
    for (let z = POND.z1; z <= POND.z2; z++) put(x, -1, z, Block.Water);
  // Stone rim with a few lanterns
  for (let x = POND.x1 - 1; x <= POND.x2 + 1; x++) {
    put(x, -1, POND.z1 - 1, stone());
    put(x, -1, POND.z2 + 1, stone());
  }
  for (let z = POND.z1 - 1; z <= POND.z2 + 1; z++) {
    put(POND.x1 - 1, -1, z, stone());
    put(POND.x2 + 1, -1, z, stone());
  }
  put(POND.x1 - 1, 0, POND.z1 - 1, Block.Lantern);
  put(POND.x2 + 1, 0, POND.z2 + 1, Block.Lantern);

  // ================================================================ shell
  const ring = (y: number, pick: () => Block) => {
    for (let x = X1; x <= X2; x++) {
      put(x, y, Z2, pick());
      put(x, y, Z1, pick());
    }
    for (let z = Z1; z <= Z2; z++) {
      put(X1, y, z, pick());
      put(X2, y, z, pick());
    }
  };
  // Two-story shell: mossy-stone ground floor, log band at the floor
  // line, oak upper story, dark plate under the roof. The upper story is
  // facade only — the interior ceiling stays at CEIL_Y, rooms unchanged.
  for (let y = 0; y <= 2; y++) ring(y, stone);
  ring(3, () => Block.Log);
  for (let y = 4; y <= UPPER_TOP - 1; y++) ring(y, () => Block.PlankOak);
  ring(UPPER_TOP, () => Block.PlankDark);

  // Full-height log frame: corners + columns every 6 cells, both stories
  for (const [cx, cz] of [
    [X1, Z1],
    [X1, Z2],
    [X2, Z1],
    [X2, Z2],
  ] as const) {
    fill(cx, cx, 0, UPPER_TOP, cz, cz, Block.Log);
  }
  for (let z = Z1 + 6; z < Z2; z += 6) {
    fill(X1, X1, 1, UPPER_TOP - 1, z, z, Block.Log);
    fill(X2, X2, 1, UPPER_TOP - 1, z, z, Block.Log);
  }

  // ================================================================ front
  // Farmhouse face: mossy-stone ground with an arched doorway, a covered
  // porch carrying a full-width fenced balcony, timber-framed oak upper
  // story with tall paned windows, and an exterior stair up the east side.

  // ---- Arched stone doorway (ground floor, centered) ----
  for (let y = 0; y <= 2; y++) for (let x = -1; x <= 0; x++) carve(x, y, Z2);
  fill(-2, -2, 0, 3, Z2, Z2, Block.StoneBrick); // stone jambs
  fill(1, 1, 0, 3, Z2, Z2, Block.StoneBrick);
  fill(-1, 0, 3, 3, Z2, Z2, Block.MossyBrick); // arch lintel
  put(0, 4, Z2, Block.MossyBrick); // keystone poking into the oak
  fill(-2, 1, -1, -1, 9, 12, Block.Path); // porch floor slabs
  decor.push([Block.Lantern, -2, 2, Z2 + 0.6]); // door sconces
  decor.push([Block.Lantern, 1, 2, Z2 + 0.6]);

  // ---- Covered porch + full-width balcony deck ----
  // Log posts carry an oak deck at y4 (porch ceiling / balcony floor).
  for (const px of [X1, -3, 3, X2]) {
    fill(px, px, 0, 3, 11, 11, Block.Log);
    decor.push([Block.Lantern, px, 3.4, 10.6]);
  }
  fill(X1, X2, 4, 4, 9, 11, Block.PlankOak); // deck, 3 deep
  // Fence railing around the three open edges; east gap for the stair
  for (let x = X1; x <= X2; x++) if (x < 4) put(x, 5, 11, Block.Fence);
  for (let z = 9; z <= 11; z++) put(X1, 5, z, Block.Fence);
  for (let z = 9; z <= 10; z++) put(X2, 5, z, Block.Fence);

  // ---- Exterior stair up the east side to the balcony ----
  for (const [sy, sz] of [
    [3, 12],
    [2, 13],
    [1, 14],
    [0, 15],
  ] as const) {
    fill(5, 6, 0, sy, sz, sz, Block.PlankDark);
    put(6, sy + 1, sz, Block.Fence); // outer handrail
  }

  // ---- Timber-framed oak upper story (front) ----
  for (const sx of [-3, 1]) fill(sx, sx, 5, 7, Z2, Z2, Block.Log); // studs
  fill(X1, X2, 7, 7, Z2, Z2, Block.Log); // belt rail under the eave

  // ---- Tall paned windows + balcony door (front upper story) ----
  fill(-5, -4, 5, 6, Z2, Z2, Block.Glass); // left tall window
  fill(3, 4, 5, 6, Z2, Z2, Block.Glass); // right tall window
  fill(-1, 0, 5, 6, Z2, Z2, Block.Glass); // balcony door
  fill(-5, -4, 1, 2, Z2, Z2, Block.Glass); // ground window, left of porch

  // ---- Back door (the scroll loop exits here) ----
  for (let y = 0; y <= 2; y++) for (let x = -1; x <= 0; x++) carve(x, y, Z1);
  fill(-2, -2, 0, 3, Z1, Z1, Block.PlankDark);
  fill(1, 1, 0, 3, Z1, Z1, Block.PlankDark);
  fill(-1, 0, 3, 3, Z1, Z1, Block.PlankDark);
  fill(-1, 0, -1, -1, -48, -45, Block.Path);

  // ---- Windows ----
  // Ground floor: framed glass in the stone story, per-wall (skipped
  // where boards hang inside). Upper story: big oak-framed panes on both
  // walls at every bay — there's nothing behind them but the attic.
  for (const { z: [z1, z2], west, east } of WINDOW_Z) {
    const walls: [number, boolean][] = [
      [X1, west],
      [X2, east],
    ];
    for (const [wx, enabled] of walls) {
      if (!enabled) continue;
      fill(wx, wx, 2, 3, z1, z2, Block.Glass);
      fill(wx, wx, 1, 1, z1, z2, Block.PlankDark);
      // Flower boxes on the outside face (slab + flowers share the cell)
      const bx = wx === X1 ? X1 - 1 : X2 + 1;
      for (let z = z1; z <= z2; z++) {
        decor.push([Block.PlankDarkSlab, bx, 1, z]);
        decor.push([rand() < 0.5 ? Block.FlowerRose : Block.FlowerBlue, bx, 1.45, z]);
      }
    }
    for (const wx of [X1, X2]) {
      fill(wx, wx, 5, 6, z1, z2, Block.Glass);
      fill(wx, wx, 4, 4, z1, z2, Block.PlankDark); // sill line
    }
  }
  // Vines climbing the front wall (clear of the pergola canopy x [-3,2])
  for (const [vx, vy] of [
    [-4, 2],
    [3, 3],
    [4, 2],
    [-5, 2],
    [5, 3],
  ] as const) {
    decor.push([Block.Vine, vx, vy, Z2 + 1]);
  }

  // ================================================================ interior
  for (const { z, doorX } of PARTITIONS) {
    fill(X1 + 1, X2 - 1, 0, WALL_TOP, z, z, Block.Plaster);
    for (let x = doorX[0]; x <= doorX[1]; x++)
      for (let y = 0; y <= 2; y++) carve(x, y, z);
    fill(doorX[0] - 1, doorX[0] - 1, 0, 3, z, z, Block.Log);
    fill(doorX[1] + 1, doorX[1] + 1, 0, 3, z, z, Block.Log);
    fill(doorX[0], doorX[1], 3, 3, z, z, Block.PlankDark);
  }

  fill(X1, X2, CEIL_Y, CEIL_Y, Z1, Z2, Block.PlankDark);

  // ================================================================ roof
  // Solid dark-slate gable roof, deep eaves with a warm oak fascia board
  // at the tip, single log ridge cap — reads as one clean shingle plane
  // instead of a striped band.
  const ROOF_HALF = 9;
  const roofY = (x: number) =>
    UPPER_TOP + 1 + Math.max(0, Math.floor((ROOF_HALF - Math.abs(x)) / 2));
  const roofBlock = (ax: number): Block =>
    ax === 0 ? Block.Log : ax >= ROOF_HALF - 1 ? Block.PlankOak : Block.Roof;
  for (let x = -ROOF_HALF; x <= ROOF_HALF; x++) {
    const y = roofY(x);
    if (y === UPPER_TOP + 1 && Math.abs(x) <= X2) continue;
    for (let z = Z1 - 2; z <= Z2 + 2; z++) put(x, y, z, roofBlock(Math.abs(x)));
  }
  // Tall oak gable ends: log rake trim, attic window high in the peak
  for (const gz of [Z1, Z2]) {
    for (let x = X1; x <= X2; x++) {
      for (let y = UPPER_TOP + 1; y < roofY(x); y++)
        put(x, y, gz, y === roofY(x) - 1 ? Block.Log : Block.PlankOak);
    }
    fill(-1, 0, UPPER_TOP + 2, UPPER_TOP + 3, gz, gz, Block.Glass);
  }
  // Light corner + eave trim accents (birch reads as a pale quoin square
  // against the oak body) — floor-line corners on the front gable, plus
  // three points along the eave under the peak.
  for (const cx of [X1, X2]) put(cx, 4, Z2, Block.BirchLog);
  for (const cx of [X1, 0, X2]) put(cx, UPPER_TOP, Z2, Block.BirchLog);
  // Matching trim at each log-frame column along both side walls
  for (let z = Z1 + 6; z < Z2; z += 6) {
    put(X1, 4, z, Block.BirchLog);
    put(X2, 4, z, Block.BirchLog);
  }
  // Chimney: stone hearth base, brick flue stack, flared stone cap ring
  fill(3, 3, CEIL_Y + 1, UPPER_TOP + 3, -29, -28, stone());
  fill(3, 3, UPPER_TOP + 4, UPPER_TOP + 5, -29, -28, Block.BrickRed);
  for (const cz of [-29, -28]) {
    put(2, UPPER_TOP + 6, cz, stone());
    put(4, UPPER_TOP + 6, cz, stone());
  }
  put(3, UPPER_TOP + 6, -30, stone());
  put(3, UPPER_TOP + 6, -27, stone());
  put(3, UPPER_TOP + 6, -29, stone());
  put(3, UPPER_TOP + 6, -28, stone());
  // Smoke puffs drifting off the chimney (jittered small white blocks)
  decor.push([Block.Smoke, 3, UPPER_TOP + 7.2, -28.5]);
  decor.push([Block.Smoke, 3.2, UPPER_TOP + 8.1, -28.2]);
  decor.push([Block.Smoke, 2.8, UPPER_TOP + 9.0, -28.6]);
  decor.push([Block.Smoke, 3.1, UPPER_TOP + 9.8, -28.1]);
  // Hanging lanterns under the eaves — warm dots along both walls
  for (const lz of [-38, -24, -10, 4]) {
    decor.push([Block.Lantern, -7, 8.5, lz]);
    decor.push([Block.Lantern, 7, 8.5, lz]);
  }

  // ================================================================ garden
  for (let z = 11; z <= 28; z++) {
    put(-4, 0, z, stone());
    put(3, 0, z, stone());
  }
  for (const [lx, lz] of [
    [-2, 17],
    [1, 23],
  ] as const) {
    fill(lx, lx, 0, 1, lz, lz, Block.Log);
    put(lx, 2, lz, Block.Lantern);
  }
  for (let z = 11; z <= 28; z++) {
    if (rand() < 0.55) put(-3, 0, z, rand() < 0.5 ? Block.FlowerRose : Block.FlowerBlue);
    if (rand() < 0.55) put(2, 0, z, rand() < 0.5 ? Block.FlowerBlue : Block.FlowerRose);
    if (rand() < 0.4) put(-2, 0, z, Block.GrassTuft);
    if (rand() < 0.4) put(1, 0, z, Block.GrassTuft);
  }
  // Crop bed east of the porch (the farmer works here)
  fill(5, 8, -1, -1, 12, 16, Block.Dirt);
  for (let x = 5; x <= 8; x++)
    for (let z = 12; z <= 16; z++)
      if (x === 5 || x === 8 || z === 12 || z === 16) put(x, 0, z, Block.PlankDark);
      else put(x, 0, z, Block.Wheat);

  // Oak trees (classic shape: 5x5 skirt, 3x3 crown, plus-top)
  for (const [tx, tz] of OAKS) {
    const trunkH = 4 + Math.floor(rand() * 2);
    fill(tx, tx, 0, trunkH - 1, tz, tz, Block.Log);
    for (let y = trunkH - 2; y <= trunkH - 1; y++) {
      for (let dx = -2; dx <= 2; dx++) {
        for (let dz = -2; dz <= 2; dz++) {
          if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && rand() < 0.6) continue;
          if (dx === 0 && dz === 0 && y < trunkH) continue;
          put(tx + dx, y, tz + dz, Block.Leaves);
        }
      }
    }
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++) put(tx + dx, trunkH, tz + dz, Block.Leaves);
    put(tx, trunkH + 1, tz, Block.Leaves);
    put(tx - 1, trunkH + 1, tz, Block.Leaves);
    put(tx + 1, trunkH + 1, tz, Block.Leaves);
    put(tx, trunkH + 1, tz - 1, Block.Leaves);
    put(tx, trunkH + 1, tz + 1, Block.Leaves);
  }

  // Lawn grass tufts + flowers
  let tufts = 0;
  while (tufts < 460) {
    const x = Math.floor(rand() * 39) - 19;
    const z = Math.floor(rand() * 82) - 50;
    if (x >= X1 - 1 && x <= X2 + 1 && z >= Z1 - 2 && z <= Z2 + 3) continue;
    if (x >= -4 && x <= 3 && z >= 9 && z <= 30) continue;
    if (x >= POND.x1 - 1 && x <= POND.x2 + 1 && z >= POND.z1 - 1 && z <= POND.z2 + 1) continue;
    if (hillHeight(x, z) > 0) continue;
    if (has(x, 0, z)) continue;
    const r = rand();
    put(x, 0, z, r < 0.82 ? Block.GrassTuft : r < 0.91 ? Block.FlowerRose : Block.FlowerBlue);
    tufts++;
  }

  // ================================================================ furniture
  put(-5, 0, 4, Block.Barrel);
  put(-5, 1, 4, Block.Barrel);
  put(-5, 0, 3, Block.Barrel);
  put(-4, 0, 3, Block.Lantern);

  // Bookshelf run under the whoami board (portrait hangs at z 0-2, keep clear)
  for (let z = -5; z <= -1; z++) put(5, 0, z, Block.Bookshelf);

  fill(2, 2, 0, 0, -10, -10, Block.StoneBrick);
  put(2, 1, -10, Block.Lantern);
  fill(-5, -5, 0, 1, -11, -11, Block.Bookshelf);
  fill(-5, -5, 0, 1, -7, -7, Block.Bookshelf);

  // Experience room: lantern on the west side only — both job boards hang
  // on the east wall and a post there would stand in front of them.
  put(-4, 0, -18, Block.PlankDark);
  put(-4, 1, -18, Block.Lantern);

  // Projects room: barrels stay low (y<=1) under the raised frames;
  // no wall lanterns — they'd stand in front of the frames.
  for (const z of [-22, -26, -30]) {
    put(-5, 0, z, Block.Barrel);
    put(5, 0, z + 1, Block.Barrel);
  }

  put(-3, 0, -35, Block.CraftingTable);
  put(-4, 0, -36, Block.Barrel);
  put(-3, 1, -35, Block.Lantern);

  put(2, 0, -41, Block.PlankDark);
  put(2, 1, -41, Block.Cake);
  put(3, 0, -40, Block.PlankDark);
  put(3, 1, -40, Block.Lantern);

  // ================================================================ vault
  // Hidden annex behind the back wall, east of the exit door. The 3x3
  // opening (x 2..4, y 0..2) is carved here; the animated seal blocks and
  // the chest render in components/scene/Vault.tsx and must match these
  // cells exactly.
  for (let x = 2; x <= 4; x++) for (let y = 0; y <= 2; y++) carve(x, y, Z1);
  fill(1, 5, 0, 2, -46, -46, Block.MossyBrick); // annex back wall
  fill(1, 1, 0, 2, -45, -45, Block.MossyBrick); // west side
  fill(5, 5, 0, 2, -45, -45, Block.MossyBrick); // east side
  fill(1, 5, 3, 3, -46, -45, Block.PlankDark); // flat roof
  fill(2, 4, -1, -1, -45, -45, Block.StoneBrick); // vault floor
  decor.push([Block.Lantern, 5, 4, -46]); // roof-corner lantern

  // ================================================================ group
  const groups = new Map<Block, number[]>();
  const push = (type: Block, x: number, y: number, z: number) => {
    let arr = groups.get(type);
    if (!arr) {
      arr = [];
      groups.set(type, arr);
    }
    arr.push(x, y, z);
  };
  for (const [k, type] of map) {
    const [x, y, z] = k.split(",").map(Number);
    push(type, x, y, z);
  }
  for (const [type, x, y, z] of decor) push(type, x, y, z);
  return [...groups.entries()].map(([type, positions]) => ({ type, positions }));
}

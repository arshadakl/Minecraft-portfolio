import * as THREE from "three";

/**
 * Procedural 16x16 pixel-art tiles drawn on canvas — no image assets.
 * NearestFilter gives the chunky voxel look. All tiles are seeded so
 * every reload renders identical textures.
 */

type Px = (x: number, y: number, c: string) => void;
type Painter = (px: Px, rand: () => number, size: number) => void;

function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Lighten (amt>0) or darken (amt<0) a hex color. */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `rgb(${r},${g},${b})`;
}

function makeTexture(painter: Painter, seed: number, size = 16): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  const px: Px = (x, y, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, 1, 1);
  };
  painter(px, seededRand(seed), size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Fill the tile with per-pixel brightness noise around a base color. */
function noiseFill(px: Px, rand: () => number, size: number, base: string, variance: number) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      px(x, y, shade(base, Math.floor((rand() - 0.5) * 2 * variance)));
    }
  }
}

// ---------------------------------------------------------------- painters

const grassTop: Painter = (px, rand, s) => noiseFill(px, rand, s, "#74a844", 14);

const dirt: Painter = (px, rand, s) => noiseFill(px, rand, s, "#8a6a45", 13);

const grassSide: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#8a6a45", 13);
  for (let x = 0; x < s; x++) {
    const depth = 2 + Math.floor(rand() * 3);
    for (let y = 0; y < depth; y++) px(x, y, shade("#74a844", Math.floor((rand() - 0.5) * 20)));
  }
};

const pathTop: Painter = (px, rand, s) => noiseFill(px, rand, s, "#b5995f", 11);

const plaster: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#e9e2d3", 5);
  for (let i = 0; i < 5; i++) px(Math.floor(rand() * s), Math.floor(rand() * s), "#d8cfba");
};

function brickPainter(mossy: boolean): Painter {
  return (px, rand, s) => {
    noiseFill(px, rand, s, "#8f9396", 8); // brick body
    // Mortar lines: rows every 4px, staggered verticals
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const row = Math.floor(y / 4);
        const isRowLine = y % 4 === 3;
        const isColLine = (x + (row % 2 === 0 ? 0 : 4)) % 8 === 7;
        if (isRowLine || isColLine) px(x, y, shade("#6a6d70", Math.floor((rand() - 0.5) * 10)));
      }
    }
    if (mossy) {
      for (let i = 0; i < 26; i++) {
        const x = Math.floor(rand() * s);
        const y = Math.floor(rand() * s);
        px(x, y, shade("#6d8f4c", Math.floor((rand() - 0.5) * 16)));
      }
    }
  };
}

const plankOak: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#b08d57", 8);
  for (const y of [3, 7, 11, 15]) for (let x = 0; x < s; x++) px(x, y, "#8a6a3e");
  // Occasional plank end seams
  for (const [sx, sy] of [
    [4, 0],
    [11, 4],
    [7, 8],
    [13, 12],
  ]) {
    for (let y = sy; y < sy + 3 && y < s; y++) px(sx, y, "#8a6a3e");
  }
};

const plankDark: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#67492b", 8);
  for (const y of [3, 7, 11, 15]) for (let x = 0; x < s; x++) px(x, y, "#4c3520");
  for (const [sx, sy] of [
    [6, 0],
    [2, 4],
    [12, 8],
    [8, 12],
  ]) {
    for (let y = sy; y < sy + 3 && y < s; y++) px(sx, y, "#4c3520");
  }
};

const logSide: Painter = (px, rand, s) => {
  for (let x = 0; x < s; x++) {
    const dark = x % 4 === 0 || x % 4 === 3;
    for (let y = 0; y < s; y++) {
      px(x, y, shade(dark ? "#5d411f" : "#6e4f2a", Math.floor((rand() - 0.5) * 12)));
    }
  }
};

const logTop: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#b08d57", 6);
  for (let ring = 1; ring <= 3; ring++) {
    const lo = ring * 2;
    const hi = s - 1 - ring * 2;
    for (let i = lo; i <= hi; i++) {
      px(i, lo, "#8a6a3e");
      px(i, hi, "#8a6a3e");
      px(lo, i, "#8a6a3e");
      px(hi, i, "#8a6a3e");
    }
  }
};

const leaves: Painter = (px, rand, s) => {
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const r = rand();
      px(x, y, r < 0.14 ? "#2f5c1e" : shade("#4c8a33", Math.floor((r - 0.5) * 34)));
    }
  }
};

const roofShingle: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#7c4b30", 9);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const row = Math.floor(y / 4);
      const isRowLine = y % 4 === 0;
      const isColLine = (x + (row % 2 === 0 ? 0 : 3)) % 6 === 0;
      if (isRowLine || (isColLine && y % 4 !== 0)) {
        px(x, y, shade("#59331f", Math.floor((rand() - 0.5) * 8)));
      }
    }
  }
};

const brickRed: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#9c4a3a", 9);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const row = Math.floor(y / 4);
      if (y % 4 === 3 || (x + (row % 2) * 4) % 8 === 7) px(x, y, "#c9b6a4");
    }
  }
};

const glass: Painter = (px, rand, s) => {
  // Mostly transparent pane with a pale frame + sparkle streaks
  for (let i = 0; i < s; i++) {
    px(i, 0, "#dceef2");
    px(i, s - 1, "#dceef2");
    px(0, i, "#dceef2");
    px(s - 1, i, "#dceef2");
  }
  for (let i = 2; i < 7; i++) {
    px(i, 8 - i, "rgba(255,255,255,0.75)");
    px(i + 6, 14 - i, "rgba(255,255,255,0.45)");
  }
};

const bookshelf: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#b08d57", 7);
  const spineColors = ["#b3402e", "#3a5fa8", "#4e8a3a", "#c9a136", "#7a4a90", "#37868a"];
  for (const rowY of [2, 9]) {
    // Shelf cavity
    for (let y = rowY; y < rowY + 5; y++)
      for (let x = 1; x < s - 1; x++) px(x, y, "#3a2a18");
    // Books
    let x = 1;
    while (x < s - 1) {
      const w = 1 + Math.floor(rand() * 2);
      const c = spineColors[Math.floor(rand() * spineColors.length)];
      const h = 4 + Math.floor(rand() * 2);
      for (let dx = 0; dx < w && x + dx < s - 1; dx++)
        for (let y = rowY + 5 - h; y < rowY + 5; y++)
          px(x + dx, y, shade(c, Math.floor((rand() - 0.5) * 20)));
      x += w + (rand() < 0.2 ? 1 : 0);
    }
  }
};

const barrelSide: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#7d5a34", 8);
  for (let x = 0; x < s; x += 4) for (let y = 0; y < s; y++) px(x, y, "#5c3f24");
  for (const y of [2, 13]) for (let x = 0; x < s; x++) px(x, y, "#3d2c1a");
};

const barrelTop: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#8a6a3e", 7);
  for (let i = 0; i < s; i++) {
    px(i, 0, "#3d2c1a");
    px(i, s - 1, "#3d2c1a");
    px(0, i, "#3d2c1a");
    px(s - 1, i, "#3d2c1a");
  }
  for (let i = 3; i <= 12; i++) {
    px(i, 3, "#5c3f24");
    px(i, 12, "#5c3f24");
    px(3, i, "#5c3f24");
    px(12, i, "#5c3f24");
  }
};

const lanternSide: Painter = (px, rand, s) => {
  // Dark metal frame with glowing core
  noiseFill(px, rand, s, "#3a3f4a", 5);
  for (let y = 3; y < 13; y++)
    for (let x = 3; x < 13; x++)
      px(x, y, shade("#ffd98a", Math.floor((rand() - 0.5) * 24)));
  for (let i = 3; i < 13; i++) {
    px(i, 7, "#4a4f5a");
    px(7, i, "#4a4f5a");
  }
};

const cakeTop: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#f2ede2", 4);
  for (let i = 0; i < 7; i++)
    px(2 + Math.floor(rand() * 12), 2 + Math.floor(rand() * 12), "#c94a42");
};

const cakeSide: Painter = (px, rand, s) => {
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < s; x++) px(x, y, shade("#f2ede2", Math.floor((rand() - 0.5) * 8)));
  for (let i = 0; i < 4; i++) px(Math.floor(rand() * s), 1 + Math.floor(rand() * 3), "#c94a42");
  for (let y = 5; y < s; y++)
    for (let x = 0; x < s; x++) px(x, y, shade("#e0b98a", Math.floor((rand() - 0.5) * 10)));
};

const craftingTop: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#a5814c", 7);
  for (const i of [0, 5, 10, 15]) {
    for (let j = 0; j < s; j++) {
      px(j, i, "#5c3f24");
      px(i, j, "#5c3f24");
    }
  }
};

// Cross-plane cutout tiles (transparent background)

const grassTuft: Painter = (px, rand, s) => {
  for (let blade = 0; blade < 9; blade++) {
    let x = 1 + Math.floor(rand() * (s - 2));
    const h = 5 + Math.floor(rand() * 9);
    const c = shade("#5f9038", Math.floor((rand() - 0.5) * 30));
    for (let y = s - 1; y > s - 1 - h; y--) {
      px(x, y, c);
      if (rand() < 0.3) x += rand() < 0.5 ? 1 : -1;
      if (x < 0 || x >= s) break;
    }
  }
};

const wheat: Painter = (px, rand, s) => {
  for (let stalk = 0; stalk < 6; stalk++) {
    const x = 1 + Math.floor(rand() * (s - 3));
    const h = 9 + Math.floor(rand() * 5);
    for (let y = s - 1; y > s - 1 - h; y--) px(x, y, "#c9a136");
    // Grain head
    for (let y = s - h; y < s - h + 4; y++) {
      px(x - 1, y, "#e0bd55");
      px(x + 1, y, "#e0bd55");
    }
  }
};

function flowerPainter(head: string): Painter {
  return (px, rand, s) => {
    const x = 7;
    for (let y = s - 1; y > 6; y--) px(x, y, "#3f6f2f");
    px(x - 1, 10, "#3f6f2f");
    px(x + 2, 9, "#3f6f2f");
    for (let dy = 3; dy <= 6; dy++)
      for (let dx = 6; dx <= 9; dx++)
        if (!(dx === 6 && dy === 3) && !(dx === 9 && dy === 6))
          px(dx, dy, shade(head, Math.floor((rand() - 0.5) * 30)));
    px(7, 4, shade(head, 50));
    px(8, 5, shade(head, 50));
  };
}

const water: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#3f74c4", 9);
  for (const y of [2, 6, 10, 14]) {
    let x = Math.floor(rand() * s);
    for (let i = 0; i < 5; i++) {
      px((x + i) % s, y, "#6d9fe0");
    }
    x = Math.floor(rand() * s);
    px(x, y + 1, "#89b4ea");
  }
};

const vine: Painter = (px, rand, s) => {
  for (let strand = 0; strand < 5; strand++) {
    let x = 1 + Math.floor(rand() * (s - 2));
    const len = 8 + Math.floor(rand() * 8);
    for (let y = 0; y < len && y < s; y++) {
      px(x, y, shade("#4c7a33", Math.floor((rand() - 0.5) * 24)));
      if (rand() < 0.35) {
        px(Math.min(s - 1, x + 1), y, "#5f9038");
      }
      if (rand() < 0.25) x += rand() < 0.5 ? 1 : -1;
      if (x < 0) x = 0;
      if (x >= s) x = s - 1;
    }
  }
};

const birchLog: Painter = (px, rand, s) => {
  noiseFill(px, rand, s, "#e6e1d1", 5);
  for (let i = 0; i < 7; i++) {
    const x = Math.floor(rand() * (s - 3));
    const y = Math.floor(rand() * s);
    const w = 2 + Math.floor(rand() * 2);
    for (let dx = 0; dx < w; dx++) px(x + dx, y, "#3d3d33");
  }
};

const birchLeaves: Painter = (px, rand, s) => {
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const r = rand();
      px(
        x,
        y,
        r < 0.1 ? "#5b7d3a" : r > 0.92 ? "#a3c96a" : shade("#86b053", Math.floor((r - 0.5) * 26))
      );
    }
  }
};

// ---------------------------------------------------------------- pack

export interface TexturePack {
  grassTop: THREE.CanvasTexture;
  grassSide: THREE.CanvasTexture;
  dirt: THREE.CanvasTexture;
  pathTop: THREE.CanvasTexture;
  plaster: THREE.CanvasTexture;
  stoneBrick: THREE.CanvasTexture;
  mossyBrick: THREE.CanvasTexture;
  plankOak: THREE.CanvasTexture;
  plankDark: THREE.CanvasTexture;
  logSide: THREE.CanvasTexture;
  logTop: THREE.CanvasTexture;
  leaves: THREE.CanvasTexture;
  roof: THREE.CanvasTexture;
  brickRed: THREE.CanvasTexture;
  glass: THREE.CanvasTexture;
  bookshelf: THREE.CanvasTexture;
  barrelSide: THREE.CanvasTexture;
  barrelTop: THREE.CanvasTexture;
  lanternSide: THREE.CanvasTexture;
  cakeTop: THREE.CanvasTexture;
  cakeSide: THREE.CanvasTexture;
  craftingTop: THREE.CanvasTexture;
  grassTuft: THREE.CanvasTexture;
  wheat: THREE.CanvasTexture;
  flowerRose: THREE.CanvasTexture;
  flowerBlue: THREE.CanvasTexture;
  water: THREE.CanvasTexture;
  vine: THREE.CanvasTexture;
  birchLog: THREE.CanvasTexture;
  birchLeaves: THREE.CanvasTexture;
}

let pack: TexturePack | null = null;

export function getTexturePack(): TexturePack {
  if (pack) return pack;
  pack = {
    grassTop: makeTexture(grassTop, 11),
    grassSide: makeTexture(grassSide, 12),
    dirt: makeTexture(dirt, 13),
    pathTop: makeTexture(pathTop, 14),
    plaster: makeTexture(plaster, 15),
    stoneBrick: makeTexture(brickPainter(false), 16),
    mossyBrick: makeTexture(brickPainter(true), 17),
    plankOak: makeTexture(plankOak, 18),
    plankDark: makeTexture(plankDark, 19),
    logSide: makeTexture(logSide, 20),
    logTop: makeTexture(logTop, 21),
    leaves: makeTexture(leaves, 22),
    roof: makeTexture(roofShingle, 23),
    brickRed: makeTexture(brickRed, 24),
    glass: makeTexture(glass, 25),
    bookshelf: makeTexture(bookshelf, 26),
    barrelSide: makeTexture(barrelSide, 27),
    barrelTop: makeTexture(barrelTop, 28),
    lanternSide: makeTexture(lanternSide, 29),
    cakeTop: makeTexture(cakeTop, 30),
    cakeSide: makeTexture(cakeSide, 31),
    craftingTop: makeTexture(craftingTop, 32),
    grassTuft: makeTexture(grassTuft, 33),
    wheat: makeTexture(wheat, 34),
    flowerRose: makeTexture(flowerPainter("#c9403a"), 35),
    flowerBlue: makeTexture(flowerPainter("#5a6fd0"), 36),
    water: makeTexture(water, 37),
    vine: makeTexture(vine, 38),
    birchLog: makeTexture(birchLog, 39),
    birchLeaves: makeTexture(birchLeaves, 40),
  };
  return pack;
}

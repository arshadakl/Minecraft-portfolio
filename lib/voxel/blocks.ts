import * as THREE from "three";
import { getTexturePack } from "./textures";

export enum Block {
  GrassBlock = 1,
  Dirt = 2,
  Path = 3,
  StoneBrick = 4,
  MossyBrick = 5,
  Plaster = 6,
  PlankOak = 7,
  PlankDark = 8,
  Log = 9,
  Leaves = 10,
  Glass = 11,
  Roof = 12,
  BrickRed = 13,
  Bookshelf = 14,
  Barrel = 15,
  Lantern = 16,
  CraftingTable = 17,
  Cake = 18,
  BirchLog = 19,
  BirchLeaves = 20,
  Water = 21,
  PlankDarkSlab = 22,
  Smoke = 23,
  Fence = 24,
  // Cross-plane vegetation
  GrassTuft = 30,
  Wheat = 31,
  FlowerRose = 32,
  FlowerBlue = 33,
  Vine = 34,
}

export type GeoKind = "cube" | "slab" | "cross" | "small" | "fence";

export interface BlockDef {
  kind: GeoKind;
  /** Single material or 6-face array [+x,-x,+y,-y,+z,-z]. */
  material: THREE.Material | THREE.Material[];
  castShadow: boolean;
  /** Random Y rotation + scale jitter per instance (vegetation). */
  jitter?: boolean;
}

let defs: Record<Block, BlockDef> | null = null;

/** Lazy client-side material registry (canvas textures need the DOM). */
export function getBlockDefs(): Record<Block, BlockDef> {
  if (defs) return defs;
  const t = getTexturePack();

  const std = (map: THREE.Texture, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
    new THREE.MeshStandardMaterial({ map, roughness: 0.95, metalness: 0, ...opts });

  const cutout = (map: THREE.Texture) =>
    new THREE.MeshStandardMaterial({
      map,
      roughness: 1,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });

  const grassSide = std(t.grassSide);
  const grassTop = std(t.grassTop);
  const dirtMat = std(t.dirt);
  const logSide = std(t.logSide);
  const logTop = std(t.logTop);
  const barrelSide = std(t.barrelSide);
  const barrelTop = std(t.barrelTop);
  const plankOak = std(t.plankOak);
  const plankDark = std(t.plankDark);
  const cakeSide = std(t.cakeSide);
  const cakeTop = std(t.cakeTop);
  const craftingTop = std(t.craftingTop);
  const bookshelfMat = std(t.bookshelf);

  defs = {
    [Block.GrassBlock]: {
      kind: "cube",
      material: [grassSide, grassSide, grassTop, dirtMat, grassSide, grassSide],
      castShadow: true,
    },
    [Block.Dirt]: { kind: "cube", material: dirtMat, castShadow: true },
    [Block.Path]: {
      kind: "cube",
      material: [dirtMat, dirtMat, std(t.pathTop), dirtMat, dirtMat, dirtMat],
      castShadow: true,
    },
    [Block.StoneBrick]: { kind: "cube", material: std(t.stoneBrick), castShadow: true },
    [Block.MossyBrick]: { kind: "cube", material: std(t.mossyBrick), castShadow: true },
    [Block.Plaster]: { kind: "cube", material: std(t.plaster), castShadow: true },
    [Block.PlankOak]: { kind: "cube", material: plankOak, castShadow: true },
    [Block.PlankDark]: { kind: "cube", material: plankDark, castShadow: true },
    [Block.Log]: {
      kind: "cube",
      material: [logSide, logSide, logTop, logTop, logSide, logSide],
      castShadow: true,
    },
    [Block.Leaves]: { kind: "cube", material: std(t.leaves), castShadow: true },
    [Block.Glass]: {
      kind: "cube",
      material: new THREE.MeshStandardMaterial({
        map: t.glass,
        roughness: 0.15,
        transparent: true,
        depthWrite: false,
      }),
      castShadow: false,
    },
    [Block.Roof]: { kind: "cube", material: std(t.roof), castShadow: true },
    [Block.BrickRed]: { kind: "cube", material: std(t.brickRed), castShadow: true },
    [Block.Bookshelf]: {
      kind: "cube",
      material: [bookshelfMat, bookshelfMat, plankOak, plankOak, bookshelfMat, bookshelfMat],
      castShadow: true,
    },
    [Block.Barrel]: {
      kind: "cube",
      material: [barrelSide, barrelSide, barrelTop, barrelSide, barrelSide, barrelSide],
      castShadow: true,
    },
    [Block.Lantern]: {
      kind: "small",
      material: new THREE.MeshStandardMaterial({
        map: t.lanternSide,
        emissive: "#ffb45e",
        emissiveIntensity: 0.9,
        emissiveMap: t.lanternSide,
        roughness: 0.6,
      }),
      castShadow: false,
    },
    [Block.CraftingTable]: {
      kind: "cube",
      material: [plankDark, plankDark, craftingTop, plankOak, plankDark, plankDark],
      castShadow: true,
    },
    [Block.Cake]: {
      kind: "small",
      material: [cakeSide, cakeSide, cakeTop, cakeSide, cakeSide, cakeSide],
      castShadow: true,
    },
    [Block.BirchLog]: {
      kind: "cube",
      material: (() => {
        const side = std(t.birchLog);
        const top = std(t.logTop);
        return [side, side, top, top, side, side];
      })(),
      castShadow: true,
    },
    [Block.BirchLeaves]: { kind: "cube", material: std(t.birchLeaves), castShadow: true },
    [Block.Water]: {
      kind: "slab",
      material: new THREE.MeshStandardMaterial({
        map: t.water,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        depthWrite: false,
      }),
      castShadow: false,
    },
    [Block.PlankDarkSlab]: { kind: "slab", material: plankDark, castShadow: true },
    [Block.Fence]: { kind: "fence", material: plankOak, castShadow: true },
    [Block.Smoke]: {
      kind: "small",
      material: new THREE.MeshStandardMaterial({
        color: "#f2efe9",
        transparent: true,
        opacity: 0.85,
        roughness: 1,
      }),
      castShadow: false,
      jitter: true,
    },
    [Block.GrassTuft]: { kind: "cross", material: cutout(t.grassTuft), castShadow: false, jitter: true },
    [Block.Wheat]: { kind: "cross", material: cutout(t.wheat), castShadow: false, jitter: true },
    [Block.FlowerRose]: { kind: "cross", material: cutout(t.flowerRose), castShadow: false, jitter: true },
    [Block.FlowerBlue]: { kind: "cross", material: cutout(t.flowerBlue), castShadow: false, jitter: true },
    [Block.Vine]: { kind: "cross", material: cutout(t.vine), castShadow: false, jitter: true },
  };
  return defs;
}

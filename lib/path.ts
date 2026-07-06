import * as THREE from "three";

/**
 * Closed camera loop: garden → door → all rooms → out the back door →
 * scenic flyover along the east hills → back to the garden start.
 * With ScrollControls `infinite`, scrolling past the end wraps seamlessly.
 *
 * Closed CatmullRom parameterization: N control points = N segments,
 * point i sits at t = i/N. The projects room spans TWO segments (camera
 * weaves west wall → east wall so all ten frames get faced); the last
 * three segments are the return walk.
 *
 * Door holes in lib/voxel/house.ts are aligned to where this curve
 * crosses each partition — verify crossings if you move waypoints.
 */

export const SEGMENTS = 13;
/** Number of content sections (nav dots). */
export const CONTENT_SECTIONS = 8;

/** Section index (0-7) for each curve segment. */
export const SEGMENT_SECTION = [0, 1, 2, 3, 4, 5, 5, 6, 7, 7, 7, 7, 7] as const;

/** First curve segment of each section — used by NavDots to jump. */
export const SECTION_SEGMENT = [0, 1, 2, 3, 4, 5, 7, 8] as const;

export const cameraCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 2.8, 30), // 0 garden approach
    new THREE.Vector3(-0.5, 2.4, 14), // 1 garden path
    new THREE.Vector3(-0.5, 2.2, 5.5), // 2 through the front door
    new THREE.Vector3(0.5, 2.2, -2), // 3 about
    new THREE.Vector3(0.8, 2.2, -8.8), // 4 hall of fame (west wall — stand east)
    new THREE.Vector3(0.5, 2.2, -15.5), // 5 experience (east wall)
    new THREE.Vector3(2.2, 2.2, -22.8), // 6 projects, facing the west frames
    new THREE.Vector3(-2.2, 2.2, -27.8), // 7 projects, facing the east frames
    new THREE.Vector3(0.5, 2.2, -34.8), // 8 skills
    new THREE.Vector3(0, 2.2, -40.8), // 9 contact
    new THREE.Vector3(0, 3, -50), // 10 out the back door
    new THREE.Vector3(13, 6, -50), // 11 swing wide past the SE corner
    new THREE.Vector3(16, 6.5, -12), // 12 up along the east terraces
  ],
  true,
  "centripetal"
);

export const lookCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 2.3, 14), // toward the house
    new THREE.Vector3(-0.5, 2.1, 8), // the front door
    new THREE.Vector3(0.5, 2.2, -1), // into the hall
    new THREE.Vector3(3.5, 2.8, -3.5), // about panel, east wall
    new THREE.Vector3(-3, 2.5, -8.5), // hall of fame panel, west wall
    new THREE.Vector3(3.5, 2.5, -15), // experience boards, east wall
    new THREE.Vector3(-4.8, 2.7, -23.2), // projects, west frames
    new THREE.Vector3(5.8, 2.7, -27.4), // projects, east frames
    new THREE.Vector3(3.5, 2.5, -34.8), // skills panel, east wall
    new THREE.Vector3(3.5, 2.5, -40.5), // contact panel, east wall
    new THREE.Vector3(4, 3, -46), // glance back at the cottage
    new THREE.Vector3(2, 4, -38), // the cottage from the SE
    new THREE.Vector3(4, 3.5, 6), // sweep over the roof toward the garden
  ],
  true,
  "centripetal"
);

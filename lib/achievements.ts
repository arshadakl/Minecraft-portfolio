/**
 * The explorer meta-game: advancement definitions + hidden bug spawns.
 * Squashing every bug unseals the vault in the contact room's back wall;
 * opening the vault chest tells the real CERT-In disclosure story.
 */

export interface AchievementDef {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "come-on-in",
    icon: "🚪",
    title: "Come On In",
    desc: "Stepped inside the cottage",
  },
  {
    id: "grand-tour",
    icon: "🗺",
    title: "The Grand Tour",
    desc: "Visited every stop on the loop",
  },
  {
    id: "first-bug",
    icon: "🐛",
    title: "Bug Spotted",
    desc: "Squashed your first bug",
  },
  {
    id: "bug-hunter",
    icon: "🛡",
    title: "Certified Bug Hunter",
    desc: "Squashed every bug — the vault is unsealed",
  },
  {
    id: "disclosure",
    icon: "🔓",
    title: "Responsible Disclosure",
    desc: "Opened the vault and read the real story",
  },
  {
    id: "night-owl",
    icon: "🌙",
    title: "Night Owl",
    desc: "Flipped the lever and turned the world to night",
  },
  {
    id: "hacker",
    icon: "💻",
    title: "l33t h4x0r",
    desc: "Ran hack in the coder's terminal",
  },
];

export const ACHIEVEMENT_BY_ID = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
) as Record<string, AchievementDef>;

export interface BugSpawn {
  id: string;
  /** Feet position: on the ground (y=0 plane) or on the wall face. */
  position: [number, number, number];
  /**
   * Surface the bug crawls on. Ground bugs omit this; wall bugs cling to
   * the named wall face ("east" = x wall facing -x, "south" = front
   * facade facing +z). See WALL_ROT in components/scene/Bugs.tsx.
   */
  wall?: "east" | "west" | "south";
  /** Idle animation phase offset so bugs don't move in lockstep. */
  phase: number;
}

/**
 * One bug per stop. Every spot is validated against the camera/look
 * curves (lib/path.ts): at some moment inside the bug's own section it
 * sits within ~28° of the view axis, unoccluded, within ~10 units.
 * Interior bugs crawl the walls beside the content boards because the
 * camera never looks at the floor. Re-check with the audit script if you
 * move one (sample both curves, min angle to the view axis per segment).
 */
export const BUGS: BugSpawn[] = [
  { id: "garden", position: [0.3, 0, 20], phase: 0.0 }, // on the garden walkway
  { id: "crops", position: [1.5, 2.2, 9.02], wall: "south", phase: 0.9 }, // climbing the door jamb
  { id: "about", position: [5.98, 3.2, -1.7], wall: "east", phase: 1.7 }, // wall, beside the whoami board
  { id: "fame", position: [-4.3, 2, -6.7], phase: 2.6 }, // bookshelf top, under the press frame
  { id: "experience", position: [5.98, 2.1, -15.88], wall: "east", phase: 3.4 }, // wall, between the job boards
  { id: "projects", position: [4.3, 0, -27.6], phase: 4.2 }, // east gallery floor
  { id: "skills", position: [5.98, 1.9, -37.3], wall: "east", phase: 5.1 }, // wall, south of the skills board
];

export const BUG_COUNT = BUGS.length;

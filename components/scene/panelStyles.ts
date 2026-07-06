/**
 * Shared Tailwind class strings for the in-world quest boards.
 * System: parchment sheet pinned to oak — beveled edges like an inventory
 * slot, ink text, XP-green accent. Gold is reserved for the Hall of Fame.
 */

/** Parchment sheet: warm gradient + carved bevel (light NW, shade SE). */
export const card =
  "border-4 border-[#4a331f] bg-[linear-gradient(160deg,#f2e4c0_0%,#e9d6a8_55%,#e0c894_100%)] p-5 text-[#3a2a18] shadow-[inset_3px_3px_0_#f9efd2,inset_-3px_-3px_0_#c2a475]";

/** Tiny quest-category label above a heading. */
export const eyebrow =
  "font-pixel text-[8px] uppercase tracking-widest text-[#8a6f47]";

export const heading =
  "font-pixel text-[15px] leading-relaxed text-[#4a331f] [text-shadow:1px_1px_0_#f9efd2]";

export const headingSm =
  "font-pixel text-[12px] leading-relaxed text-[#4a331f] [text-shadow:1px_1px_0_#f9efd2]";

/** Green rule under a heading — the XP-bar accent. */
export const rule = "mb-3 mt-2 h-[3px] w-14 bg-[#4c8f3a]";

/** Gold rule — Hall of Fame only. */
export const ruleGold = "mb-3 mt-2 h-[3px] w-14 bg-[#d9a441]";

export const body = "font-pixel-body text-[17px] leading-tight text-[#463218]";

export const muted = "font-pixel-body text-[15px] text-[#7a6248]";

/** Inventory-slot chip: pressed-in bevel, like an item sitting in a slot. */
export const chip =
  "border-2 border-[#8a6f47] bg-[#d3bd8c] px-1.5 py-0.5 font-pixel-body text-[13px] text-[#3f5c28] shadow-[inset_2px_2px_0_#b89b68,inset_-2px_-2px_0_#efdfb2]";

/** Raised button bevel; presses in on hover like a Minecraft button. */
export const linkBtn =
  "pointer-events-auto border-2 border-[#4a331f] bg-[#d9c294] px-3 py-1.5 font-pixel text-[9px] text-[#4a331f] shadow-[inset_2px_2px_0_#f4e6c0,inset_-2px_-2px_0_#a98f60] transition-colors hover:bg-[#9dbb6d] hover:text-[#22330f] hover:shadow-[inset_-2px_-2px_0_#f4e6c0,inset_2px_2px_0_#6d8a45]";

/** Gold-trimmed variant for the Hall of Fame press clippings. */
export const linkBtnGold =
  "pointer-events-auto border-2 border-[#8a6420] bg-[#e8cd8a] px-3 py-1.5 font-pixel text-[9px] text-[#5c4310] shadow-[inset_2px_2px_0_#f8e8bc,inset_-2px_-2px_0_#c9a655] transition-colors hover:bg-[#f0d998] hover:text-[#2b1d10]";

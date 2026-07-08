"use client";

import { useSiteStore } from "@/lib/store";

/**
 * One-line affordance for drag-to-look; disappears forever (this session)
 * after the first drag. CSS-gated to fine pointers — on touch the drag
 * gesture scrolls the rail instead, so the hint would mislead.
 */
export default function LookHint() {
  const hasLooked = useSiteStore((s) => s.hasLooked);
  if (hasLooked) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-20 hidden border-2 border-[#5c4a2a] bg-black/70 px-3 py-1.5 font-pixel-body text-[15px] text-amber-100 [@media(pointer:fine)]:block">
      🖱 Hold + drag to look around
    </div>
  );
}

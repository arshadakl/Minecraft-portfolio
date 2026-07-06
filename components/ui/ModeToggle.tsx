"use client";

import { useSiteStore } from "@/lib/store";

/**
 * 3D <-> 2D switch. Defaults to the 3D scroll tour on every device; users can
 * opt into the 2D simple view manually with this button.
 */
export default function ModeToggle() {
  const simple = useSiteStore((s) => s.simpleMode);
  const setSimpleMode = useSiteStore((s) => s.setSimpleMode);

  return (
    <button
      onClick={() => setSimpleMode(!simple)}
      className="fixed right-4 top-4 z-40 border-2 border-[#5c3f24] bg-[#2a1d10]/90 px-3 py-1.5 font-pixel text-[9px] text-amber-200 transition-colors hover:border-emerald-400 hover:text-emerald-300"
    >
      {simple ? "⛏ 3D tour" : "📄 Simple view"}
    </button>
  );
}

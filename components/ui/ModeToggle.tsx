"use client";

import { useEffect } from "react";
import { useSiteStore } from "@/lib/store";

/**
 * 3D <-> 2D switch. Also auto-selects the 2D view on coarse-pointer (touch)
 * devices and for users preferring reduced motion — the scroll tour is a
 * desktop experience.
 */
export default function ModeToggle() {
  const simple = useSiteStore((s) => s.simpleMode);
  const setSimpleMode = useSiteStore((s) => s.setSimpleMode);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    if (coarse || reduced || small) setSimpleMode(true);
  }, [setSimpleMode]);

  return (
    <button
      onClick={() => setSimpleMode(!simple)}
      className="fixed right-4 top-4 z-40 border-2 border-[#5c3f24] bg-[#2a1d10]/90 px-3 py-1.5 font-pixel text-[9px] text-amber-200 transition-colors hover:border-emerald-400 hover:text-emerald-300"
    >
      {simple ? "⛏ 3D tour" : "📄 Simple view"}
    </button>
  );
}

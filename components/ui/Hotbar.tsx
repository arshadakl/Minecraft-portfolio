"use client";

import { useEffect } from "react";
import { SECTION_NAMES } from "@/lib/content";
import { SEGMENTS, SECTION_SEGMENT } from "@/lib/path";
import { useSiteStore } from "@/lib/store";

/**
 * Minecraft hotbar navigation: one slot per section, bottom-center.
 * Click a slot or press 1–8 to walk there (smooth scroll, not teleport).
 * The chunky white selector *slides* to the active slot, and — like
 * switching held items in the game — the section name pops up above the
 * bar whenever the camera enters a new room, then fades.
 */
const SECTION_ICONS = ["🌻", "🚪", "🧑‍💻", "🏆", "💼", "🖼", "⚒", "✉"] as const;
const SLOT = 42; // px — 8 slots fit a 360px viewport

/** Digit keys must not fire while the user types (contact form, terminal). */
const typingTarget = () => {
  const el = document.activeElement;
  return el instanceof Element && !!el.closest("input, textarea, select");
};

function jump(i: number) {
  const el = useSiteStore.getState().scrollEl;
  if (!el) return;
  const max = el.scrollHeight - el.clientHeight;
  // Land slightly inside the section's first segment so its panel is in view
  const offset = Math.min(1, (SECTION_SEGMENT[i] + 0.35) / SEGMENTS);
  el.scrollTo({ top: offset * max, behavior: "smooth" });
}

export default function Hotbar() {
  const current = useSiteStore((s) => s.currentSection);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > SECTION_NAMES.length) return;
      if (typingTarget()) return;
      jump(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="fixed bottom-2.5 left-1/2 z-20 -translate-x-1/2"
    >
      {/* Item-name popup — re-animates every time the section changes */}
      <div
        key={current}
        className="hotbar-name pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel-body text-[17px] text-white [text-shadow:2px_2px_0_#000c]"
      >
        {SECTION_NAMES[current]}
      </div>

      <div className="relative flex border-[3px] border-[#0a0a0a]/80 bg-[#141414]/75 p-[3px] shadow-[0_3px_10px_rgba(0,0,0,0.45)]">
        {/* Sliding selector — Minecraft's chunky white frame, overhanging */}
        <div
          aria-hidden
          className="absolute -top-[2px] left-[1px] transition-transform duration-200 ease-out"
          style={{
            width: SLOT + 4,
            height: SLOT + 4,
            transform: `translateX(${current * SLOT}px)`,
          }}
        >
          <div className="h-full w-full border-[3px] border-white shadow-[inset_0_0_0_1px_#0008,0_0_0_1px_#0008]" />
        </div>

        {SECTION_NAMES.map((name, i) => (
          <button
            key={name}
            onClick={() => jump(i)}
            aria-label={`${name} (press ${i + 1})`}
            aria-current={current === i}
            style={{ width: SLOT, height: SLOT }}
            className={`relative flex items-center justify-center border border-[#000]/60 bg-gradient-to-br from-[#3d3d3d] to-[#2a2a2a] shadow-[inset_1.5px_1.5px_0_#1c1c1c,inset_-1.5px_-1.5px_0_#555] transition-[filter] ${
              current === i ? "brightness-125" : "hover:brightness-110"
            }`}
          >
            <span className="text-[19px] leading-none drop-shadow-[1px_1px_0_rgba(0,0,0,0.7)]">
              {SECTION_ICONS[i]}
            </span>
            <span className="absolute bottom-0 right-0.5 font-pixel-body text-[10px] leading-none text-white/50">
              {i + 1}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

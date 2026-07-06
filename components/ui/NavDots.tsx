"use client";

import { SECTION_NAMES } from "@/lib/content";
import { SEGMENTS, SECTION_SEGMENT } from "@/lib/path";
import { useSiteStore } from "@/lib/store";

/**
 * Fixed section dots. Clicking smooth-scrolls ScrollControls' container,
 * so the camera walks to the room instead of teleporting.
 */
export default function NavDots() {
  const current = useSiteStore((s) => s.currentSection);
  const scrollEl = useSiteStore((s) => s.scrollEl);

  const jump = (i: number) => {
    if (!scrollEl) return;
    const max = scrollEl.scrollHeight - scrollEl.clientHeight;
    // Land slightly inside the section's first segment so its panel is in view
    const offset = Math.min(1, (SECTION_SEGMENT[i] + 0.35) / SEGMENTS);
    scrollEl.scrollTo({ top: offset * max, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="Sections"
      className="fixed right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2.5"
    >
      {SECTION_NAMES.map((name, i) => (
        <button
          key={name}
          onClick={() => jump(i)}
          aria-label={name}
          aria-current={current === i}
          className="group relative flex h-4 w-4 items-center justify-center"
        >
          <span
            className={`block border transition-all duration-300 ${
              current === i
                ? "h-3.5 w-3.5 border-emerald-300 bg-emerald-400"
                : "h-2.5 w-2.5 border-white/60 bg-white/25 group-hover:bg-white/60"
            }`}
          />
          <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded bg-black/70 px-2 py-0.5 font-pixel-body text-[13px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            {name}
          </span>
        </button>
      ))}
    </nav>
  );
}


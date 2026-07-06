"use client";

import { useSiteStore } from "@/lib/store";
import { audio } from "@/lib/audio";

/** Single mute/unmute control for background music + sound effects. */
export default function SoundToggle() {
  const muted = useSiteStore((s) => s.muted);
  const setMuted = useSiteStore((s) => s.setMuted);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    audio.setMuted(next); // must run in this click gesture to start playback
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Unmute music" : "Mute music"}
      title={muted ? "Unmute" : "Mute"}
      className="fixed left-4 top-4 z-40 border-2 border-[#5c3f24] bg-[#2a1d10]/90 px-3 py-1.5 font-pixel text-[9px] text-amber-200 transition-colors hover:border-emerald-400 hover:text-emerald-300"
    >
      {muted ? "🔇 Music" : "🔊 Music"}
    </button>
  );
}

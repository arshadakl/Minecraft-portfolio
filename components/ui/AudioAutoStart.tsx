"use client";

import { useEffect } from "react";
import { useSiteStore } from "@/lib/store";
import { audio } from "@/lib/audio";

/**
 * Starts the music on the visitor's FIRST interaction (click / key / touch)
 * — browsers only allow playback inside a user gesture, so this is the
 * earliest legal moment. Renders nothing.
 *
 * Respects the visitor: if they used the sound toggle first (audioTouched),
 * their choice wins and auto-start never fires. Gestures on the toggle
 * itself are ignored so its click doesn't unmute-then-mute in one press.
 */
export default function AudioAutoStart() {
  useEffect(() => {
    const start = (e: Event) => {
      cleanup();
      const site = useSiteStore.getState();
      if (site.audioTouched || !site.muted) return;
      // Let the sound toggle's own click keep its meaning
      if (
        e.target instanceof Element &&
        e.target.closest("[data-sound-toggle]")
      )
        return;
      site.setMuted(false);
      audio.setMuted(false); // inside the gesture — playback allowed
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      window.removeEventListener("touchstart", start);
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    window.addEventListener("touchstart", start);
    return cleanup;
  }, []);

  return null;
}

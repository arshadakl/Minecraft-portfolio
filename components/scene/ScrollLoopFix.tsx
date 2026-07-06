"use client";

import { useEffect } from "react";
import { useScroll } from "@react-three/drei";

/**
 * Fixes a drei `infinite` ScrollControls stick at the loop seam.
 *
 * drei wraps the loop by teleporting the scroll container to the opposite
 * hard edge. Its forward wrap lands at scrollTop = 1 (a 1px buffer) but its
 * backward wrap lands at the exact bottom (scrollLength, clamped to max) with
 * no buffer. At a hard edge a gesture in that same direction produces no
 * scroll delta — the browser is already clamped — so the scroll event that
 * would trigger the next wrap never fires and you get stuck able to move only
 * the other way.
 *
 * We must NOT correct this from a render-loop (rAF) callback: that races
 * drei's own scroll handler and can reset scrollTop out from under it,
 * *robbing* a legitimate wrap. Instead we listen on the wheel/touch gesture
 * itself. The handler runs before the browser's default scroll, so when the
 * container is fully pinned at an edge and the user pushes further in that
 * direction, we inject a few px of room — enough for the gesture to reach
 * drei's wrap threshold. When not pinned it does nothing, so normal wraps are
 * never disturbed.
 */
export default function ScrollLoopFix() {
  const scroll = useScroll();

  useEffect(() => {
    const el = scroll.el;
    if (!el) return;

    const BUFFER = 3;
    const EDGE = 0.5; // treat as "pinned" only within half a pixel of the edge

    const unstick = (dir: number) => {
      const max = el.scrollHeight - el.clientHeight;
      if (max <= BUFFER * 2) return;
      // Pushing forward while pinned at the bottom.
      if (dir > 0 && max - el.scrollTop <= EDGE) el.scrollTop = max - BUFFER;
      // Pushing backward while pinned at the top.
      else if (dir < 0 && el.scrollTop <= EDGE) el.scrollTop = BUFFER;
    };

    const onWheel = (e: WheelEvent) => unstick(Math.sign(e.deltaY));

    let lastY = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? lastY;
      unstick(Math.sign(lastY - y)); // finger up = scroll forward
      lastY = y;
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [scroll]);

  return null;
}

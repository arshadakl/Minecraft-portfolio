import { useEffect, useMemo, useRef } from "react";
import { useSiteStore } from "./store";
import { useProgress } from "./progress";

/**
 * Drag-to-look camera control layered on top of the scroll rail.
 *
 * Without the Pointer Lock API the cursor must stay free for clicking
 * (bugs, links, the coder), so raw mouse-movement look is off the table —
 * instead: hold left mouse and drag to look, Street View style. Arrow keys
 * rotate too (hold to pan). Movement stays on the scroll rail.
 *
 * Feel rules:
 * - Input writes a *target* yaw/pitch; `update()` damps the applied value
 *   toward it every frame (frame-rate independent), so motion is smooth.
 * - While the user scrolls, the offset eases back to zero at a rate
 *   proportional to scroll speed — each room re-frames its authored view.
 *   Standing still, the view stays wherever the user left it.
 * - Target pitch is clamped here; CameraRig clamps the *total* pitch
 *   (rail + offset) so the flyover's downward gaze can't hit a pole.
 */
const SENS = 0.0034; // rad per px of drag (~full screen drag = 180°)
const KEY_SPEED = 1.7; // rad/s while an arrow key is held
const PITCH_LIMIT = 1.0; // ±57° of user pitch offset

const clampPitch = (v: number) => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, v));

/** Drags starting on (and key presses aimed at) UI must not steer the camera. */
const isInteractive = (t: EventTarget | null) =>
  t instanceof Element && !!t.closest("button, a, input, textarea, select, label");

export function useFreelook() {
  /** Where the input wants the view offset to be. */
  const target = useRef({ yaw: 0, pitch: 0 });
  /** Smoothed offset actually applied by CameraRig this frame. */
  const offset = useRef({ yaw: 0, pitch: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (isInteractive(e.target)) return;
      if (useProgress.getState().vaultGuiOpen) return;
      if (useSiteStore.getState().terminalOpen) return;
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      target.current.yaw -= dx * SENS;
      target.current.pitch = clampPitch(target.current.pitch - dy * SENS);
      document.body.style.cursor = "grabbing";
      const site = useSiteStore.getState();
      if (!site.hasLooked) site.setHasLooked(true);
    };

    const endDrag = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "auto";
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.key.startsWith("Arrow")) return;
      if (isInteractive(e.target) || isInteractive(document.activeElement)) return;
      keys.current.add(e.key);
      e.preventDefault(); // keep arrows from scrolling the rail container
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key);

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    window.addEventListener("blur", endDrag);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      window.removeEventListener("blur", endDrag);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      endDrag();
    };
  }, []);

  /** Called by CameraRig each frame with the (wrapped) scroll delta. */
  const update = useMemo(
    () => (delta: number, scrollDelta: number) => {
      const t = target.current;
      const k = keys.current;

      // Arrow keys pan the target — same signs as the mouse
      if (k.has("ArrowLeft")) t.yaw += KEY_SPEED * delta;
      if (k.has("ArrowRight")) t.yaw -= KEY_SPEED * delta;
      if (k.has("ArrowUp")) t.pitch = clampPitch(t.pitch + KEY_SPEED * delta);
      if (k.has("ArrowDown")) t.pitch = clampPitch(t.pitch - KEY_SPEED * delta);

      // Ease back toward the rail's authored view while scrolling
      if (!dragging.current) {
        const speed = Math.min(1, (Math.abs(scrollDelta) / Math.max(delta, 1e-4)) * 6);
        if (speed > 0.02) {
          const decay = 1 - Math.pow(0.03, delta * speed);
          t.yaw -= t.yaw * decay;
          t.pitch -= t.pitch * decay;
        }
      }

      // Damp the applied offset toward the target (≈60ms time constant)
      const follow = 1 - Math.pow(0.00005, delta);
      offset.current.yaw += (t.yaw - offset.current.yaw) * follow;
      offset.current.pitch += (t.pitch - offset.current.pitch) * follow;
    },
    []
  );

  return { offset, update };
}

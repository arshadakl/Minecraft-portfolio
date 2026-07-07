import { useEffect, useRef } from "react";

/**
 * Minecraft-style look control: mouse movement (movementX/Y) + arrow keys.
 * Works like first-person games — no click/drag, just move mouse to look.
 * Yaw unlimited; pitch clamped ±60° to avoid flipping.
 * Arrow keys as fallback on touchscreen (no mouse).
 */
export function useFreelook() {
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const sensitivity = 0.005; // radians per pixel

    const onMouseMove = (e: MouseEvent) => {
      yaw.current -= e.movementX * sensitivity;
      pitch.current -= e.movementY * sensitivity;
      // Clamp pitch to ±60°
      pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Arrow keys apply rotation each frame
  useEffect(() => {
    const step = 0.03; // radians per frame
    const interval = setInterval(() => {
      if (keys.current["arrowleft"]) yaw.current -= step;
      if (keys.current["arrowright"]) yaw.current += step;
      if (keys.current["arrowup"]) {
        pitch.current -= step;
        pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current));
      }
      if (keys.current["arrowdown"]) {
        pitch.current += step;
        pitch.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current));
      }
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  return { yaw, pitch };
}

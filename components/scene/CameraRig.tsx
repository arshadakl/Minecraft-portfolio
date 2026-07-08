"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { cameraCurve, lookCurve, SEGMENTS, SEGMENT_SECTION } from "@/lib/path";
import { useSiteStore } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import { useFreelook } from "@/lib/freelook";

/**
 * Drives the camera along the closed CatmullRom loop from scroll progress.
 * With `infinite` scrolling, offset wraps 0→1→0 and the closed curve makes
 * the hand-off seamless.
 */
export default function CameraRig() {
  const scroll = useScroll();
  const camera = useThree((s) => s.camera);
  const pos = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  // Smoothed idle sway target (lags the raw pointer so motion feels organic)
  const sway = useRef({ x: 0, y: 0 });
  // Freelook: drag or arrow keys rotate the view around the rail direction
  const { offset: lookOffset, update: updateFreelook } = useFreelook();
  const prevOffset = useRef(0);

  useEffect(() => {
    useSiteStore.getState().setScrollEl(scroll.el);
    // Record the section the tour starts in — the frame loop only records
    // section *changes*, so the garden would otherwise never count.
    useProgress.getState().visitSection(useSiteStore.getState().currentSection);
    return () => useSiteStore.getState().setScrollEl(null);
  }, [scroll]);

  useFrame((state, delta) => {
    // Wrap rather than clamp — the path is a closed loop
    const t = ((scroll.offset % 1) + 1) % 1;
    cameraCurve.getPoint(t, pos.current);
    lookCurve.getPoint(t, look.current);

    // Breathing bob — slow vertical rise/fall like an idle stance
    const time = state.clock.elapsedTime;
    const breath = Math.sin(time * 0.8) * 0.035;

    // Ease pointer-driven sway toward the current mouse position
    const damp = 1 - Math.pow(0.001, delta); // frame-rate independent
    sway.current.x += (state.pointer.x - sway.current.x) * damp;
    sway.current.y += (state.pointer.y - sway.current.y) * damp;

    pos.current.x += sway.current.x * 0.08;
    pos.current.y += breath + sway.current.y * 0.05;

    camera.position.copy(pos.current);

    // Feed the freelook the wrapped scroll delta (offset jumps 1→0 at the
    // loop seam) so it can ease the view back to the rail while moving.
    let scrollDelta = scroll.offset - prevOffset.current;
    prevOffset.current = scroll.offset;
    if (scrollDelta > 0.5) scrollDelta -= 1;
    else if (scrollDelta < -0.5) scrollDelta += 1;
    updateFreelook(delta, scrollDelta);

    // Rotate the rail's look direction by the smoothed freelook offset.
    // The TOTAL pitch is clamped (the flyover already looks down) so the
    // combined angle can never reach a pole and flip the camera.
    const direction = look.current.clone().sub(pos.current).normalize();
    const theta = Math.atan2(direction.x, direction.z) + lookOffset.current.yaw;
    const phi = THREE.MathUtils.clamp(
      Math.asin(direction.y) + lookOffset.current.pitch,
      -1.25,
      1.25
    );
    const r = Math.cos(phi);
    look.current.set(
      pos.current.x + r * Math.sin(theta),
      pos.current.y + Math.sin(phi),
      pos.current.z + r * Math.cos(theta)
    );

    camera.lookAt(look.current);

    const seg = Math.min(SEGMENTS - 1, Math.floor(t * SEGMENTS));
    const section = SEGMENT_SECTION[seg];
    const store = useSiteStore.getState();
    if (store.currentSection !== section) {
      store.setCurrentSection(section);
      useProgress.getState().visitSection(section);
    }
  });

  return null;
}

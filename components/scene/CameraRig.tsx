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
  // Freelook: mouse drag or arrow keys rotate the view
  const { yaw, pitch } = useFreelook();

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

    // Freelook: rotate the look direction by yaw/pitch
    const direction = look.current.clone().sub(pos.current).normalize();
    // Direction → spherical coords
    let theta = Math.atan2(direction.x, direction.z); // yaw
    let phi = Math.asin(direction.y); // pitch
    // Apply freelook deltas
    theta += yaw.current;
    phi += pitch.current;
    // Back to Cartesian, apply to lookAt point (1 unit away)
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

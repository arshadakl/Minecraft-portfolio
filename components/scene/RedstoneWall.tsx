"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import WoodSign from "./WoodSign";

/**
 * GitHub contribution graph as a wall of redstone lamps — 26 weeks × 7 days
 * on the contact room's west wall (the only interior wall with no window or
 * board; turning around to find it is what freelook is for). Lamp warmth =
 * contribution level. Data comes from /api/github (edge-cached); if the
 * fetch fails a deterministic placeholder pattern lights up instead, so the
 * wall never renders dark or empty.
 */
const WEEKS = 26;
const DAYS = 7;
const COUNT = WEEKS * DAYS;
const STEP = 0.19;
const WALL_X = -4.9;
const CENTER_Z = -41;
const BASE_Y = 1.7;

// Unlit → bright redstone ramp (basic material: colors ARE the glow)
const LEVEL_COLORS = ["#2a1c12", "#5e2c14", "#a34a1a", "#e0731f", "#ffb14e"].map(
  (c) => new THREE.Color(c)
);

/** Deterministic stand-in pattern when the API is unavailable. */
function placeholderLevel(w: number, d: number): number {
  const h = Math.imul(w * 374761393 + d * 668265263, 1274126177);
  return Math.abs(h >> 8) % 5 > 2 ? Math.abs(h >> 16) % 5 : 0;
}

export default function RedstoneWall() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const [data, setData] = useState<{ weeks: number[][] | null; total: number | null }>();

  useEffect(() => {
    let alive = true;
    fetch("/api/github")
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => alive && setData({ weeks: null, total: null }));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const mat = new THREE.Matrix4();
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS; d++) {
        const i = w * DAYS + d;
        // Oldest week at the south end, newest by the vault-side edge
        mat.setPosition(
          WALL_X,
          BASE_Y + (DAYS - 1 - d) * STEP,
          CENTER_Z - ((WEEKS - 1) / 2) * STEP + w * STEP
        );
        m.setMatrixAt(i, mat);
        const level = data?.weeks?.[w]?.[d] ?? placeholderLevel(w, d);
        m.setColorAt(i, LEVEL_COLORS[level] ?? LEVEL_COLORS[0]);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <group>
      <WoodSign
        text={
          data?.total != null
            ? [`Redstone Commits`, `${data.total} in the past 6 months`]
            : "Redstone Commits"
        }
        position={[-4.9, 3.6, CENTER_Z]}
        rotationY={Math.PI / 2}
        width={2.6}
        height={0.7}
      />
      {/* Dark backing plate so lamps read as a mounted board */}
      <mesh position={[-4.96, BASE_Y + ((DAYS - 1) * STEP) / 2, CENTER_Z]}>
        <boxGeometry args={[0.06, DAYS * STEP + 0.2, WEEKS * STEP + 0.2]} />
        <meshStandardMaterial color="#1c130c" roughness={0.9} />
      </mesh>
      <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
        <boxGeometry args={[0.08, 0.15, 0.15]} />
        {/* Basic material — instance colors render as emissive-looking glow */}
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {/* Faint warm spill so the wall glows onto the floor */}
      <pointLight
        position={[-4.2, 2.4, CENTER_Z]}
        color="#ff8a3c"
        intensity={5}
        distance={5}
        decay={1.8}
      />
    </group>
  );
}

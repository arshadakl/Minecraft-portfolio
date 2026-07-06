"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { getTexturePack } from "@/lib/voxel/textures";
import { SEGMENTS } from "@/lib/path";

/**
 * Front door, hinged on its left post at x=-1, opening inward as the
 * camera approaches (scroll pages ~1.05 to 1.7).
 */
export default function Door() {
  const hinge = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const woodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: getTexturePack().plankDark,
        roughness: 0.8,
      }),
    []
  );

  useFrame(() => {
    if (!hinge.current) return;
    const page = (((scroll.offset % 1) + 1) % 1) * SEGMENTS;
    const t = THREE.MathUtils.smoothstep(page, 1.05, 1.7);
    hinge.current.rotation.y = t * 2.1; // swing inward
  });

  return (
    <group position={[-1, 0, 8.5]} ref={hinge}>
      <mesh position={[1, 1.5, 0]} castShadow material={woodMat}>
        <boxGeometry args={[1.9, 2.95, 0.18]} />
      </mesh>
      {/* Small window pane in the upper half */}
      <mesh position={[1, 2.15, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.2]} />
        <meshStandardMaterial
          map={getTexturePack().glass}
          transparent
          roughness={0.15}
          depthWrite={false}
        />
      </mesh>
      {/* Handle */}
      <mesh position={[1.72, 1.45, 0.14]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshStandardMaterial color="#d9b355" roughness={0.35} metalness={0.4} />
      </mesh>
    </group>
  );
}

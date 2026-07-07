"use client";

import { useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { BUGS, type BugSpawn } from "@/lib/achievements";
import { useProgress } from "@/lib/progress";
import { audio } from "@/lib/audio";

/**
 * The bug hunt: seven blocky critters hidden along the tour, one per stop,
 * each on the surface the camera actually faces there — walkway, shelf top,
 * or crawling the wall beside a content board. Click to squash; squashing
 * them all unseals the vault (scene/Vault.tsx). Squashed bugs stay dead
 * across visits via the persisted progress store.
 */
export default function Bugs() {
  return (
    <group>
      {BUGS.map((b) => (
        <Bug key={b.id} spawn={b} />
      ))}
    </group>
  );
}

/**
 * Orients the bug so its feet sit on the spawn surface: local +y becomes
 * the surface normal ("east" wall faces -x, "west" +x, "south" facade +z),
 * so the idle shuffle and the squash flatten stay in surface space.
 */
const WALL_ROT: Record<NonNullable<BugSpawn["wall"]>, [number, number, number]> = {
  east: [0, 0, Math.PI / 2],
  west: [0, 0, -Math.PI / 2],
  south: [Math.PI / 2, 0, 0],
};

const BODY = "#5f7a52";
const BELLY = "#48603e";
const EYE = "#1c140c";
const GLOW = "#8dff9e";

function Bug({ spawn }: { spawn: BugSpawn }) {
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const antennae = useRef<THREE.Group>(null);
  // Persisted kills render nothing; a live kill plays the squash first.
  // Read once — the Canvas mounts after the store has rehydrated.
  const [deadAtMount] = useState(() =>
    useProgress.getState().squashed.includes(spawn.id)
  );
  const [gone, setGone] = useState(false);
  const dying = useRef(false);
  const dyingSince = useRef<number | null>(null);

  // Wall bugs wander less — the gaps between boards are narrow.
  const ampX = spawn.wall ? 0.12 : 0.25;
  const ampZ = spawn.wall ? 0.15 : 0.2;

  useFrame(({ clock }) => {
    const g = body.current;
    if (!g) return;
    const t = clock.elapsedTime + spawn.phase * 10;

    if (dying.current) {
      // Squash: flatten against the surface, then disappear.
      if (dyingSince.current === null) dyingSince.current = clock.elapsedTime;
      const k = Math.min(1, (clock.elapsedTime - dyingSince.current) / 0.35);
      g.scale.set(1 + k * 0.6, Math.max(0.03, 1 - k), 1 + k * 0.6);
      if (k >= 1) setGone(true);
      return;
    }

    // Idle scuttle in surface space: shuffle a tiny arc, twitch antennae
    g.position.x = Math.sin(t * 0.7) * ampX;
    g.position.z = Math.cos(t * 0.5) * ampZ;
    g.rotation.y = Math.atan2(
      Math.cos(t * 0.7) * 0.7 * ampX,
      -Math.sin(t * 0.5) * 0.4 * ampZ
    );
    g.position.y = Math.abs(Math.sin(t * 6)) * 0.02;
    if (head.current) head.current.rotation.x = Math.sin(t * 3.3) * 0.15;
    if (antennae.current) antennae.current.rotation.z = Math.sin(t * 9) * 0.2;
  });

  if (deadAtMount || gone) return null;

  const squash = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (dying.current) return;
    dying.current = true;
    document.body.style.cursor = "auto";
    audio.playSynth("squish");
    useProgress.getState().squashBug(spawn.id);
  };

  return (
    <group
      position={spawn.position}
      rotation={spawn.wall ? WALL_ROT[spawn.wall] : [0, 0, 0]}
      onClick={squash}
      onPointerOver={() => {
        if (!dying.current) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      <group ref={body}>
        {/* Abdomen, thorax, head — three shrinking segments */}
        <mesh position={[-0.16, 0.09, 0]} castShadow>
          <boxGeometry args={[0.22, 0.16, 0.2]} />
          <meshStandardMaterial color={BELLY} roughness={0.9} emissive={GLOW} emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[0.04, 0.11, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.24]} />
          <meshStandardMaterial color={BODY} roughness={0.9} emissive={GLOW} emissiveIntensity={0.18} />
        </mesh>
        <group ref={head} position={[0.22, 0.12, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.16, 0.16, 0.18]} />
            <meshStandardMaterial color={BODY} roughness={0.9} emissive={GLOW} emissiveIntensity={0.18} />
          </mesh>
          {/* Eyes */}
          <mesh position={[0.08, 0.03, 0.06]}>
            <boxGeometry args={[0.03, 0.04, 0.04]} />
            <meshStandardMaterial color={EYE} roughness={0.5} />
          </mesh>
          <mesh position={[0.08, 0.03, -0.06]}>
            <boxGeometry args={[0.03, 0.04, 0.04]} />
            <meshStandardMaterial color={EYE} roughness={0.5} />
          </mesh>
          {/* Antennae */}
          <group ref={antennae} position={[0.06, 0.1, 0]}>
            <mesh position={[0.04, 0.06, 0.05]} rotation={[0, 0, -0.5]}>
              <boxGeometry args={[0.02, 0.14, 0.02]} />
              <meshStandardMaterial color={BELLY} roughness={0.9} />
            </mesh>
            <mesh position={[0.04, 0.06, -0.05]} rotation={[0, 0, -0.5]}>
              <boxGeometry args={[0.02, 0.14, 0.02]} />
              <meshStandardMaterial color={BELLY} roughness={0.9} />
            </mesh>
          </group>
        </group>
        {/* Six stubby legs */}
        {([-0.14, 0.0, 0.14] as const).map((lx) =>
          ([-0.11, 0.11] as const).map((lz) => (
            <mesh key={`${lx}${lz}`} position={[lx, 0.03, lz]}>
              <boxGeometry args={[0.04, 0.06, 0.04]} />
              <meshStandardMaterial color={BELLY} roughness={0.9} />
            </mesh>
          ))
        )}
        {/* Bigger invisible hitbox so it's clickable at rail distance */}
        <mesh visible={false} position={[0, 0.15, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.6]} />
          <meshBasicMaterial />
        </mesh>
      </group>
    </group>
  );
}

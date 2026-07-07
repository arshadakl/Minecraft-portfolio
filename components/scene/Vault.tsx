"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import WoodSign from "./WoodSign";
import { getTexturePack } from "@/lib/voxel/textures";
import { BUG_COUNT } from "@/lib/achievements";
import { useProgress } from "@/lib/progress";
import { audio } from "@/lib/audio";

/**
 * The hidden vault: a 3x3 sealed opening in the back wall east of the exit
 * door (cells carved in lib/voxel/house.ts — keep in sync). Squashing all
 * bugs crumbles the seal; clicking the chest inside opens the vault GUI
 * (ui/VaultOverlay.tsx). The wall face the camera sees is z=-43; the seal
 * blocks occupy grid cells x 2..4, y 0..2 at z=-44.
 */
const SEAL_Z = -44;
const SEAL_CELLS: [number, number][] = [];
for (let y = 2; y >= 0; y--) for (let x = 2; x <= 4; x++) SEAL_CELLS.push([x, y]);

export default function Vault() {
  const unsealed = useProgress((s) => s.squashed.length >= BUG_COUNT);

  return (
    <group>
      <WoodSign
        text={unsealed ? "The Vault" : "Sealed Vault"}
        position={[3.5, 3.5, -42.94]}
        width={2}
        height={0.5}
      />
      <Seal />
      <Chest unsealed={unsealed} />
      {unsealed && (
        <pointLight
          position={[3.5, 1.8, -44.2]}
          color="#a78bfa"
          intensity={9}
          distance={5}
          decay={1.7}
        />
      )}
    </group>
  );
}

/** Nine mossy blocks plugging the opening; crumble away on unseal. */
function Seal() {
  const unsealed = useProgress((s) => s.squashed.length >= BUG_COUNT);
  // Already unsealed when the scene loads (persisted) — never render.
  const [goneAtMount] = useState(
    () => useProgress.getState().squashed.length >= BUG_COUNT
  );
  const [gone, setGone] = useState(false);
  const crumbleStart = useRef<number | null>(null);
  const cubes = useRef<(THREE.Mesh | null)[]>([]);
  const lockMat = useRef<THREE.MeshStandardMaterial>(null);

  const tex = getTexturePack();
  const mossy = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex.mossyBrick, roughness: 0.9 }),
    [tex]
  );

  useFrame(({ clock }) => {
    // Green "lock rune" pulse on the center block while sealed
    if (lockMat.current && !unsealed) {
      lockMat.current.emissiveIntensity =
        0.22 + Math.sin(clock.elapsedTime * 2.2) * 0.12;
    }
    if (!unsealed) return;
    if (crumbleStart.current === null) {
      crumbleStart.current = clock.elapsedTime;
      audio.playSynth("rumble");
    }
    const elapsed = clock.elapsedTime - crumbleStart.current;
    let allDone = true;
    cubes.current.forEach((m, i) => {
      if (!m) return;
      const k = THREE.MathUtils.clamp((elapsed - i * 0.12) / 0.5, 0, 1);
      if (k < 1) allDone = false;
      const s = 1 - k;
      m.scale.setScalar(Math.max(0.001, s));
      // Sink into the floor as they shrink
      const [, gy] = SEAL_CELLS[i];
      m.position.y = gy + 0.5 - k * 0.4;
    });
    if (allDone) setGone(true);
  });

  if (goneAtMount || gone) return null;

  return (
    <group>
      {SEAL_CELLS.map(([x, y], i) => {
        const isLock = x === 3 && y === 1;
        return (
          <mesh
            key={`${x},${y}`}
            ref={(m) => {
              cubes.current[i] = m;
            }}
            position={[x + 0.5, y + 0.5, SEAL_Z + 0.5]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1, 1, 1]} />
            {isLock ? (
              <meshStandardMaterial
                ref={lockMat}
                map={tex.stoneBrick}
                roughness={0.85}
                emissive="#39d353"
                emissiveIntensity={0.25}
              />
            ) : (
              <primitive object={mossy} attach="material" />
            )}
          </mesh>
        );
      })}
    </group>
  );
}

/** Blocky chest sitting in the alcove; clickable once the seal is gone. */
function Chest({ unsealed }: { unsealed: boolean }) {
  const lid = useRef<THREE.Group>(null);
  const latchMat = useRef<THREE.MeshStandardMaterial>(null);
  const opened = useProgress((s) => s.vaultOpened);

  const tex = getTexturePack();

  useFrame(({ clock }, delta) => {
    if (lid.current) {
      const target = opened ? -1.15 : 0;
      lid.current.rotation.x +=
        (target - lid.current.rotation.x) * (1 - Math.pow(0.002, delta));
    }
    if (latchMat.current && unsealed) {
      latchMat.current.emissiveIntensity =
        0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
    }
  });

  const onOpen = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!unsealed) return;
    useProgress.getState().setVaultGuiOpen(true);
  };

  return (
    <group
      position={[3.5, 0, -44.5]}
      onClick={onOpen}
      onPointerOver={() => {
        if (unsealed) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* Base */}
      <mesh position={[0, 0.275, 0]} castShadow>
        <boxGeometry args={[0.9, 0.55, 0.7]} />
        <meshStandardMaterial map={tex.plankDark} roughness={0.8} />
      </mesh>
      {/* Lid, hinged along the back edge */}
      <group ref={lid} position={[0, 0.55, -0.35]}>
        <mesh position={[0, 0.14, 0.35]} castShadow>
          <boxGeometry args={[0.9, 0.28, 0.7]} />
          <meshStandardMaterial map={tex.plankDark} roughness={0.8} />
        </mesh>
        {/* Latch on the lid's front face */}
        <mesh position={[0, 0.06, 0.72]}>
          <boxGeometry args={[0.12, 0.2, 0.08]} />
          <meshStandardMaterial
            ref={latchMat}
            color="#d9a441"
            metalness={0.6}
            roughness={0.35}
            emissive="#ffd76a"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
      {/* Glowing contents, visible once the lid swings open */}
      {opened && (
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.6, 0.18, 0.45]} />
          <meshStandardMaterial
            color="#a78bfa"
            emissive="#a78bfa"
            emissiveIntensity={0.9}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

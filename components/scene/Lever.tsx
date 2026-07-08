"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import WoodSign from "./WoodSign";
import { useSiteStore } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import { audio } from "@/lib/audio";

/**
 * Day/night lever on the porch post east of the front door — a real
 * redstone-style switch. Click to flip; DuskSky and SceneAtmosphere read
 * the store flag and cross-fade. First flip to night unlocks "Night Owl".
 * The post occupies x 3..4, z 11..12; the lever hangs on its south face.
 */
export default function Lever() {
  const stick = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!stick.current) return;
    const target = useSiteStore.getState().night ? 0.7 : -0.7;
    stick.current.rotation.x +=
      (target - stick.current.rotation.x) * (1 - Math.pow(0.001, delta));
  });

  const flip = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const store = useSiteStore.getState();
    const toNight = !store.night;
    store.setNight(toNight);
    audio.playSynth("lever");
    if (toNight) useProgress.getState().unlockAchievement("night-owl");
  };

  return (
    <group>
      <WoodSign
        text="Day / Night"
        position={[3.5, 2.85, 12.03]}
        width={1.1}
        height={0.32}
      />
      <group
        position={[3.5, 2.25, 12.04]}
        onClick={flip}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        {/* Cobble base plate */}
        <mesh>
          <boxGeometry args={[0.3, 0.42, 0.08]} />
          <meshStandardMaterial color="#6f6f6f" roughness={0.9} />
        </mesh>
        {/* The stick, hinged at the plate center */}
        <mesh ref={stick} position={[0, 0, 0.04]} rotation-x={-0.7}>
          <boxGeometry args={[0.09, 0.09, 0.42]} />
          <meshStandardMaterial color="#8a6a3e" roughness={0.85} />
        </mesh>
        {/* Redstone nub on the tip lights up at night */}
        <Nub />
      </group>
    </group>
  );
}

function Nub() {
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!mat.current) return;
    const target = useSiteStore.getState().night ? 1.6 : 0.15;
    mat.current.emissiveIntensity +=
      (target - mat.current.emissiveIntensity) * (1 - Math.pow(0.001, delta));
  });

  return (
    <mesh position={[0, 0.24, 0.06]}>
      <boxGeometry args={[0.11, 0.06, 0.11]} />
      <meshStandardMaterial
        ref={mat}
        color="#7a1f12"
        emissive="#ff3b1f"
        emissiveIntensity={0.15}
        roughness={0.6}
      />
    </mesh>
  );
}

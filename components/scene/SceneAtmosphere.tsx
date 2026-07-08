"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSiteStore } from "@/lib/store";

/**
 * Fog + ambient + sun/moon light, cross-fading between day and night when
 * the lever flips. Owns what used to be static in Experience.tsx; lantern
 * point lights are untouched — at night they carry the scene, which is
 * exactly the Minecraft look. DOM content boards are unaffected by scene
 * lighting, so panels stay readable at night.
 */
const ATMOS = {
  day: {
    fog: new THREE.Color("#d6a878"),
    fogNear: 46,
    fogFar: 120,
    ambient: new THREE.Color("#c3aeb0"),
    ambientIntensity: 0.5,
    sun: new THREE.Color("#ffcf95"),
    sunIntensity: 2.3,
  },
  night: {
    fog: new THREE.Color("#141b2e"),
    fogNear: 38,
    fogFar: 105,
    ambient: new THREE.Color("#5a6a90"),
    ambientIntensity: 0.28,
    sun: new THREE.Color("#9db4e0"), // moonlight
    sunIntensity: 0.55,
  },
} as const;

export default function SceneAtmosphere() {
  const fog = useRef<THREE.Fog>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);

  useFrame((_, delta) => {
    const t = useSiteStore.getState().night ? ATMOS.night : ATMOS.day;
    const k = 1 - Math.pow(0.2, delta); // match the sky's ~1.6s fade
    if (fog.current) {
      fog.current.color.lerp(t.fog, k);
      fog.current.near += (t.fogNear - fog.current.near) * k;
      fog.current.far += (t.fogFar - fog.current.far) * k;
    }
    if (ambient.current) {
      ambient.current.color.lerp(t.ambient, k);
      ambient.current.intensity += (t.ambientIntensity - ambient.current.intensity) * k;
    }
    if (sun.current) {
      sun.current.color.lerp(t.sun, k);
      sun.current.intensity += (t.sunIntensity - sun.current.intensity) * k;
    }
  });

  return (
    <>
      <fog ref={fog} attach="fog" args={["#d6a878", 46, 120]} />
      <ambientLight ref={ambient} intensity={0.5} color="#c3aeb0" />
      {/* Low golden sun (pale moon at night) raking from behind the house */}
      <directionalLight
        ref={sun}
        position={[34, 20, -58]}
        intensity={2.3}
        color="#ffcf95"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
      />
    </>
  );
}

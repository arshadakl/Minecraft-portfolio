"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSiteStore } from "@/lib/store";

/**
 * Weather system: rain comes and goes on a timer (dry 45–85s, wet 18–33s).
 * The store's `raining` flag drives the couple's umbrella too.
 *
 * Drops are a THREE.Points cloud with fixed x/z columns — columns are
 * spawned OUTSIDE the house footprint so rain never falls through the roof
 * into the rooms; from indoors you still see it through the windows.
 * Fade in/out via material opacity so starts and stops feel natural.
 */
const COUNT = 1100;
const AREA = { x1: -34, x2: 34, z1: -58, z2: 34 };
const HOUSE = { x1: -7, x2: 8, z1: -47, z2: 9 }; // footprint + annex + eaves
const TOP = 15;

function scheduleWeather(setRaining: (on: boolean) => void) {
  let timer: ReturnType<typeof setTimeout>;
  const cycle = (raining: boolean) => {
    setRaining(raining);
    const next = raining
      ? 18_000 + Math.random() * 15_000 // wet spell
      : 45_000 + Math.random() * 40_000; // dry spell
    timer = setTimeout(() => cycle(!raining), next);
  };
  // First shower arrives 25–50s in, so the garden approach stays golden
  timer = setTimeout(() => cycle(true), 25_000 + Math.random() * 25_000);
  return () => {
    clearTimeout(timer);
    setRaining(false);
  };
}

// Deterministic drop columns, built once at module load (seeded LCG like
// lib/voxel/house.ts) — render stays pure for the React Compiler.
function buildDrops() {
  let s = 20260707 >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const speeds = new Float32Array(COUNT);
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    speeds[i] = 9 + rand() * 6;
    // Rejection-sample a column outside the house footprint
    let x = 0;
    let z = 0;
    do {
      x = AREA.x1 + rand() * (AREA.x2 - AREA.x1);
      z = AREA.z1 + rand() * (AREA.z2 - AREA.z1);
    } while (x > HOUSE.x1 && x < HOUSE.x2 && z > HOUSE.z1 && z < HOUSE.z2);
    positions[i * 3] = x;
    positions[i * 3 + 1] = rand() * TOP;
    positions[i * 3 + 2] = z;
  }
  return { speeds, positions };
}
const DROPS = buildDrops();

export default function Rain() {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const { speeds } = DROPS;
  const positions = useMemo(() => DROPS.positions.slice(), []);

  useEffect(
    () => scheduleWeather(useSiteStore.getState().setRaining),
    []
  );

  useFrame((_, delta) => {
    const m = mat.current;
    if (!m) return;
    const target = useSiteStore.getState().raining ? 0.55 : 0;
    m.opacity += (target - m.opacity) * (1 - Math.pow(0.1, delta));

    const geo = points.current?.geometry;
    if (!geo || m.opacity < 0.02) return; // dormant while dry
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      let y = arr[i * 3 + 1] - speeds[i] * delta;
      if (y < 0) y += TOP;
      arr[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        color="#aec6e8"
        size={0.07}
        transparent
        opacity={0}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

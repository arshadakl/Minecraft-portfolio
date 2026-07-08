"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSiteStore } from "@/lib/store";

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 pos = projectionMatrix * mat4(mat3(viewMatrix)) * vec4(position, 1.0);
    gl_Position = pos.xyww;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 midColor;
  uniform vec3 horizonColor;
  uniform vec3 sunColor;
  uniform vec3 glowColor;
  uniform vec3 sunDir;
  varying vec3 vDir;
  void main() {
    vec3 dir = normalize(vDir);
    float t = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 color = mix(horizonColor, midColor, smoothstep(0.42, 0.58, t));
    color = mix(color, topColor, smoothstep(0.58, 0.85, t));

    // Warm the sky toward the low sun, then a tight halo + the sun disc
    float d = dot(dir, normalize(sunDir));
    color = mix(color, glowColor, pow(max(d, 0.0), 6.0) * 0.55);
    color += glowColor * pow(max(d, 0.0), 180.0) * 0.8;
    float disc = smoothstep(0.9989, 0.9995, d);
    color = mix(color, sunColor, disc);

    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Day/night palettes — the lever (scene/Lever.tsx) toggles between them. */
const SKY = {
  day: {
    topColor: new THREE.Color("#55597f"),
    midColor: new THREE.Color("#b98a8f"),
    horizonColor: new THREE.Color("#f0a862"),
    sunColor: new THREE.Color("#fff3cf"),
    glowColor: new THREE.Color("#ffb066"),
  },
  night: {
    topColor: new THREE.Color("#0b1026"),
    midColor: new THREE.Color("#1c2440"),
    horizonColor: new THREE.Color("#2c3a5e"),
    sunColor: new THREE.Color("#e8f1ff"), // the sun disc becomes the moon
    glowColor: new THREE.Color("#9db8e8"),
  },
} as const;

/** Golden-hour dome: warm horizon, dusty-violet zenith, a low sunset sun.
 *  Flipping the lever cross-fades every uniform to the night palette. */
export default function DuskSky() {
  const uniforms = useMemo(
    () => ({
      topColor: { value: SKY.day.topColor.clone() },
      midColor: { value: SKY.day.midColor.clone() },
      horizonColor: { value: SKY.day.horizonColor.clone() },
      sunColor: { value: SKY.day.sunColor.clone() },
      glowColor: { value: SKY.day.glowColor.clone() },
      // Low on the horizon behind the house (-z), angled back-right
      sunDir: { value: new THREE.Vector3(0.55, 0.12, -1).normalize() },
    }),
    []
  );

  useFrame((_, delta) => {
    const target = useSiteStore.getState().night ? SKY.night : SKY.day;
    const k = 1 - Math.pow(0.2, delta); // ~1.6s cross-fade
    uniforms.topColor.value.lerp(target.topColor, k);
    uniforms.midColor.value.lerp(target.midColor, k);
    uniforms.horizonColor.value.lerp(target.horizonColor, k);
    uniforms.sunColor.value.lerp(target.sunColor, k);
    uniforms.glowColor.value.lerp(target.glowColor, k);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[1, 24, 16]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

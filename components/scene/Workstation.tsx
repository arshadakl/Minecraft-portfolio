"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Dev battlestation in the About room — desk under the east window
 * (z [-2,0], between the whoami board and the portrait), dual monitors
 * with glowing "code" screens, tower with an LED strip, chair.
 * Group origin sits on the floor at the east wall; rotY -PI/2 makes
 * local +z face west into the room, local +x run along the wall (+z world).
 */
export default function Workstation() {
  const screenA = useMemo(() => makeCodeScreen(1), []);
  const screenB = useMemo(() => makeCodeScreen(2), []);

  return (
    <group position={[5.5, 0, -1]} rotation-y={-Math.PI / 2}>
      {/* Desk plate + legs (back edge rests on the bookshelf run) */}
      <mesh position={[0, 1.05, 0.45]} castShadow>
        <boxGeometry args={[2.2, 0.07, 0.75]} />
        <meshStandardMaterial color="#7a5a34" roughness={0.8} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 1.0, 0.52, 0.72]}>
          <boxGeometry args={[0.07, 1.04, 0.07]} />
          <meshStandardMaterial color="#4a331f" roughness={0.85} />
        </mesh>
      ))}

      <Monitor texture={screenA} position={[-0.46, 1.09, 0.18]} yaw={0.28} />
      <Monitor texture={screenB} position={[0.46, 1.09, 0.18]} yaw={-0.28} />

      {/* Keyboard, mouse, mug */}
      <mesh position={[0, 1.1, 0.55]} rotation-y={0.04}>
        <boxGeometry args={[0.56, 0.035, 0.19]} />
        <meshStandardMaterial color="#26262e" roughness={0.6} />
      </mesh>
      <mesh position={[0.45, 1.1, 0.57]}>
        <boxGeometry args={[0.08, 0.03, 0.12]} />
        <meshStandardMaterial color="#26262e" roughness={0.6} />
      </mesh>
      <mesh position={[-0.82, 1.15, 0.5]}>
        <cylinderGeometry args={[0.05, 0.045, 0.13, 10]} />
        <meshStandardMaterial color="#4c8f3a" roughness={0.7} />
      </mesh>

      {/* Tower on the floor with a glowing LED strip */}
      <group position={[1.28, 0, 0.5]}>
        <mesh position={[0, 0.31, 0]} castShadow>
          <boxGeometry args={[0.32, 0.62, 0.44]} />
          <meshStandardMaterial color="#1c1c22" roughness={0.55} />
        </mesh>
        <mesh position={[-0.05, 0.31, 0.225]}>
          <planeGeometry args={[0.03, 0.5]} />
          <meshStandardMaterial
            color="#0a0a0a"
            emissive="#43e6b0"
            emissiveIntensity={2}
          />
        </mesh>
      </group>

      {/* Chair facing the desk */}
      <group position={[0, 0, 1.2]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.5, 0.07, 0.5]} />
          <meshStandardMaterial color="#23232b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.0, 0.24]} castShadow>
          <boxGeometry args={[0.5, 0.78, 0.07]} />
          <meshStandardMaterial color="#23232b" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.6, 8]} />
          <meshStandardMaterial color="#3a3a42" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[0.55, 0.05, 0.09]} />
          <meshStandardMaterial color="#3a3a42" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation-y={Math.PI / 2}>
          <boxGeometry args={[0.55, 0.05, 0.09]} />
          <meshStandardMaterial color="#3a3a42" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>

      {/* Cool screen glow against the warm room light */}
      <pointLight
        position={[0, 1.7, 0.7]}
        color="#8fd8ff"
        intensity={3}
        distance={4.5}
        decay={2}
      />
    </group>
  );
}

function Monitor({
  texture,
  position,
  yaw,
}: {
  texture: THREE.CanvasTexture;
  position: [number, number, number];
  yaw: number;
}) {
  return (
    <group position={position} rotation-y={yaw}>
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[0.3, 0.03, 0.2]} />
        <meshStandardMaterial color="#26262e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.11, -0.03]}>
        <boxGeometry args={[0.05, 0.19, 0.05]} />
        <meshStandardMaterial color="#26262e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.05]} />
        <meshStandardMaterial color="#101014" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.42, 0.028]}>
        <planeGeometry args={[0.74, 0.44]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={1.1}
          roughness={0.35}
        />
      </mesh>
    </group>
  );
}

/** 96x64 procedural "code editor" — syntax-colored line bars on dark. */
function makeCodeScreen(seed: number): THREE.CanvasTexture {
  let s = seed * 48271 + 11;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const w = 96;
  const h = 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, w, h);
  // Sidebar
  ctx.fillStyle = "#161b22";
  ctx.fillRect(0, 0, 10, h);
  // Code lines: indent steps + syntax-colored bars
  const colors = ["#7ee787", "#79c0ff", "#d2a8ff", "#ffa657", "#ff7b72", "#c9d1d9"];
  let indent = 0;
  for (let y = 4; y < h - 4; y += 5) {
    indent = Math.max(0, Math.min(4, indent + (rand() < 0.3 ? 1 : rand() < 0.55 ? -1 : 0)));
    let x = 13 + indent * 5;
    const parts = 1 + Math.floor(rand() * 3);
    for (let p = 0; p < parts && x < w - 8; p++) {
      const len = 6 + Math.floor(rand() * 22);
      ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
      ctx.fillRect(x, y, Math.min(len, w - 6 - x), 3);
      x += len + 4;
    }
  }
  // Cursor line highlight + block cursor
  const cy = 4 + 5 * Math.floor(rand() * 11);
  ctx.fillStyle = "rgba(121,192,255,0.12)";
  ctx.fillRect(10, cy - 1, w - 10, 5);
  ctx.fillStyle = "#79c0ff";
  ctx.fillRect(60 + Math.floor(rand() * 20), cy, 3, 3);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

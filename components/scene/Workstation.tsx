"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import SpeechBubble from "./SpeechBubble";
import { useSiteStore } from "@/lib/store";

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
  const canTexture = useMemo(() => makeCanTexture(), []);

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

      {/* Me — sitting in the chair, typing at the keyboard */}
      <Coder canTexture={canTexture} />

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

/** Clicking a screen opens the terminal overlay (ui/TerminalOverlay.tsx). */
function Monitor({
  texture,
  position,
  yaw,
}: {
  texture: THREE.CanvasTexture;
  position: [number, number, number];
  yaw: number;
}) {
  const openTerminal = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
    useSiteStore.getState().setTerminalOpen(true);
  };

  return (
    <group
      position={position}
      rotation-y={yaw}
      onClick={openTerminal}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
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

/**
 * Seated developer (me) in the chair, typing at the keyboard. Placed in the
 * workstation's local frame on the chair (local [0,0,1.2]); the figure faces
 * -z toward the desk. Hands tap the keyboard, head bobs while "thinking".
 */
const CODER_LINES = [
  "Hi there! 👋",
  "Explore my world 🌍",
  "Scroll to walk around ⛏",
  "Thanks for stopping by! ✨",
];

// Energy-drink sip cycle: every SIP_PERIOD seconds the right hand grabs the
// can, raises it to the mouth, head tips back, typing pauses — then back to
// work. All positions are in the Coder's local frame (desk toward -z).
const SIP_PERIOD = 11;
const CAN_DESK = new THREE.Vector3(0.55, 1.17, -0.62);
const CAN_MOUTH = new THREE.Vector3(0.12, 1.62, -0.28);
const HAND_KEYS = new THREE.Vector3(0.2, 1.1, -0.56);
const HAND_SIP = new THREE.Vector3(0.24, 1.5, -0.34);

function Coder({ canTexture }: { canTexture: THREE.CanvasTexture }) {
  const head = useRef<THREE.Group>(null);
  const handL = useRef<THREE.Group>(null);
  const handR = useRef<THREE.Group>(null);
  const can = useRef<THREE.Group>(null);
  const [greeting, setGreeting] = useState(false);
  const [lineIdx, setLineIdx] = useState(-1);
  const greetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onGreet = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setLineIdx((i) => (i + 1) % CODER_LINES.length); // next line each click
    setGreeting(true);
    if (greetTimer.current) clearTimeout(greetTimer.current);
    greetTimer.current = setTimeout(() => setGreeting(false), 2800);
  };

  // Clear the pending timer and release the hover cursor on unmount
  // (e.g. switching to simple mode while hovering / mid-greeting).
  useEffect(
    () => () => {
      if (greetTimer.current) clearTimeout(greetTimer.current);
      document.body.style.cursor = "auto";
    },
    []
  );

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;
    // Sip envelope: 0 while typing, ramps to 1 with the can at the mouth
    const cyc = t % SIP_PERIOD;
    const sip = Math.min(
      THREE.MathUtils.smoothstep(cyc, 7.6, 8.4),
      1 - THREE.MathUtils.smoothstep(cyc, 9.4, 10.2)
    );

    // Alternating finger taps (paused while greeting or sipping)
    const tap = greeting ? 0 : 1 - sip;
    if (handL.current)
      handL.current.position.y = 1.1 + Math.abs(Math.sin(t * 9)) * 0.03 * tap;
    if (handR.current) {
      // Right hand leaves the keyboard to hold the can during a sip
      handR.current.position.lerpVectors(HAND_KEYS, HAND_SIP, sip);
      handR.current.position.y += Math.abs(Math.sin(t * 9 + 1.7)) * 0.03 * tap;
    }
    if (can.current) {
      can.current.position.lerpVectors(CAN_DESK, CAN_MOUTH, sip);
      can.current.rotation.x = -sip * 0.95; // tip it back to drink
    }

    if (head.current) {
      // Greeting: turn head toward the viewer and lift it; else idle bob.
      // A sip tips the head back while the can is up.
      const targetY = greeting ? -1.3 : Math.sin(t * 0.5) * 0.06;
      const targetX = greeting
        ? -0.12
        : 0.08 + Math.sin(t * 0.8) * 0.05 - sip * 0.22;
      head.current.rotation.y = THREE.MathUtils.damp(
        head.current.rotation.y,
        targetY,
        8,
        delta
      );
      head.current.rotation.x = THREE.MathUtils.damp(
        head.current.rotation.x,
        targetX,
        8,
        delta
      );
    }
  });

  const skin = "#c67a3e";
  const hair = "#141414";
  const shirt = "#d8c9a3";
  const pants = "#39465e";
  const shoe = "#241d15";

  return (
    <group
      position={[0, 0, 1.2]}
      onClick={onGreet}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    >
      {/* Thighs (horizontal on the seat) + shins (down to floor) + feet */}
      {([-0.13, 0.13] as const).map((lx) => (
        <group key={lx}>
          <mesh position={[lx, 0.68, -0.2]} castShadow>
            <boxGeometry args={[0.19, 0.18, 0.5]} />
            <meshStandardMaterial color={pants} roughness={0.9} />
          </mesh>
          <mesh position={[lx, 0.34, -0.42]} castShadow>
            <boxGeometry args={[0.18, 0.55, 0.18]} />
            <meshStandardMaterial color={pants} roughness={0.9} />
          </mesh>
          <mesh position={[lx, 0.07, -0.5]} castShadow>
            <boxGeometry args={[0.19, 0.14, 0.26]} />
            <meshStandardMaterial color={shoe} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Torso, leaning slightly toward the screen */}
      <group position={[0, 0.72, 0.05]} rotation-x={0.12}>
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[0.5, 0.72, 0.3]} />
          <meshStandardMaterial color={shirt} roughness={0.95} />
        </mesh>

        {/* Head — faces the desk (-z). Face features on -z, hair back on +z. */}
        <group ref={head} position={[0, 0.92, 0.02]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={skin} roughness={0.85} />
          </mesh>
          {/* Hair — top + sides + back-of-head slab on +z */}
          <mesh position={[0, 0.24, 0.02]}>
            <boxGeometry args={[0.46, 0.16, 0.48]} />
            <meshStandardMaterial color={hair} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.1, 0.24]}>
            <boxGeometry args={[0.46, 0.34, 0.08]} />
            <meshStandardMaterial color={hair} roughness={0.95} />
          </mesh>
          {([-0.24, 0.24] as const).map((hx) => (
            <mesh key={hx} position={[hx, 0.12, 0.02]}>
              <boxGeometry args={[0.08, 0.28, 0.46]} />
              <meshStandardMaterial color={hair} roughness={0.95} />
            </mesh>
          ))}
          {/* Glasses — two lenses + bridge on the face (-z, toward the desk) */}
          {([-0.11, 0.11] as const).map((gx) => (
            <mesh key={gx} position={[gx, -0.01, -0.21]}>
              <boxGeometry args={[0.14, 0.12, 0.03]} />
              <meshStandardMaterial
                color="#9aa0a6"
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>
          ))}
          <mesh position={[0, -0.01, -0.21]}>
            <boxGeometry args={[0.08, 0.03, 0.03]} />
            <meshStandardMaterial color="#9aa0a6" roughness={0.4} metalness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Arms reaching forward to the keyboard, hands tapping */}
      {([-1, 1] as const).map((s) => (
        <group key={s}>
          {/* Upper arm hanging from the shoulder */}
          <mesh position={[s * 0.3, 1.16, 0.04]} castShadow>
            <boxGeometry args={[0.13, 0.3, 0.13]} />
            <meshStandardMaterial color={shirt} roughness={0.95} />
          </mesh>
          {/* Forearm reaching toward the desk (-z) */}
          <mesh position={[s * 0.24, 1.05, -0.26]} castShadow>
            <boxGeometry args={[0.12, 0.12, 0.5]} />
            <meshStandardMaterial color={skin} roughness={0.85} />
          </mesh>
          {/* Hand over the keyboard — bobs while typing */}
          <group ref={s === -1 ? handL : handR} position={[s * 0.2, 1.1, -0.56]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.08, 0.16]} />
              <meshStandardMaterial color={skin} roughness={0.85} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Energy drink — voxel-style can (blue/silver diagonal, red mark),
          lives on the desk and rides to the mouth each sip */}
      <group ref={can} position={CAN_DESK.toArray()}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.13, 0.052]} />
          <meshStandardMaterial map={canTexture} roughness={0.45} metalness={0.25} />
        </mesh>
        {/* Lid + pull tab */}
        <mesh position={[0, 0.069, 0]}>
          <boxGeometry args={[0.072, 0.012, 0.046]} />
          <meshStandardMaterial color="#9aa0a6" roughness={0.35} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.078, 0.008]}>
          <boxGeometry args={[0.02, 0.006, 0.03]} />
          <meshStandardMaterial color="#7d838a" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* Comic speech bubble on click — real 3D geometry (a billboarded
          textured plane), so walls depth-occlude it instead of it drawing
          over other rooms like a DOM overlay does. */}
      {greeting && lineIdx >= 0 && (
        <SpeechBubble text={CODER_LINES[lineIdx]} />
      )}
    </group>
  );
}

/** 32x48 pixel-art energy-drink wrap: blue/silver diagonal quarters with a
 *  red mark — the classic look, voxel style (no wordmark). */
function makeCanTexture(): THREE.CanvasTexture {
  const w = 32;
  const h = 48;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const blue = "#1d4f9e";
  const blueDark = "#173f80";
  const silver = "#cfd4da";
  const silverDark = "#b6bcc4";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Rim bands top and bottom
      if (y < 4 || y >= h - 4) {
        ctx.fillStyle = (x + y) % 3 === 0 ? "#8a9098" : "#9aa0a6";
      } else {
        // Two diagonal stripes → alternating blue/silver quarters
        const band = Math.floor((x + (y - 4) * 0.66) / 12) % 2 === 0;
        const shade = (x * 7 + y * 13) % 11 === 0;
        ctx.fillStyle = band ? (shade ? blueDark : blue) : shade ? silverDark : silver;
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }
  // Red mark across the middle (charging-bulls energy, abstracted)
  ctx.fillStyle = "#d1342a";
  ctx.fillRect(9, 20, 6, 2);
  ctx.fillRect(17, 20, 6, 2);
  ctx.fillRect(13, 22, 6, 2);
  ctx.fillStyle = "#f2b632";
  ctx.fillRect(14, 19, 4, 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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

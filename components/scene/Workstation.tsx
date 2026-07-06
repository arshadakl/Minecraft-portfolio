"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
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

      {/* Me — sitting in the chair, typing at the keyboard */}
      <Coder />

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

function Coder() {
  const head = useRef<THREE.Group>(null);
  const handL = useRef<THREE.Group>(null);
  const handR = useRef<THREE.Group>(null);
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
    // Alternating finger taps (paused while greeting)
    const tap = greeting ? 0 : 1;
    if (handL.current)
      handL.current.position.y = 1.1 + Math.abs(Math.sin(t * 9)) * 0.03 * tap;
    if (handR.current)
      handR.current.position.y =
        1.1 + Math.abs(Math.sin(t * 9 + 1.7)) * 0.03 * tap;

    if (head.current) {
      // Greeting: turn head toward the viewer and lift it; else idle bob.
      const targetY = greeting ? -1.3 : Math.sin(t * 0.5) * 0.06;
      const targetX = greeting ? -0.12 : 0.08 + Math.sin(t * 0.8) * 0.05;
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

      {/* Comic speech bubble on click — real 3D geometry (a billboarded
          textured plane), so walls depth-occlude it instead of it drawing
          over other rooms like a DOM overlay does. */}
      {greeting && lineIdx >= 0 && (
        <SpeechBubble text={CODER_LINES[lineIdx]} />
      )}
    </group>
  );
}

/** Comic speech bubble drawn to a canvas, shown on a billboarded plane so it
 *  is depth-tested (walls hide it) and faces the camera. */
function SpeechBubble({ text }: { text: string }) {
  // Rebuild the texture once the pixel webfont is loaded so the canvas draws
  // with it rather than a fallback.
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => alive && setFontReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // fontReady is an intentional dep: rebuild so the canvas redraws with the
  // pixel webfont once it has loaded (the font is read inside, at call time).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tex = useMemo(() => makeBubbleTexture(text), [text, fontReady]);
  // Free the GPU texture when it's replaced (text change / font load) or on unmount.
  useEffect(() => () => tex.dispose(), [tex]);
  const img = tex.image as HTMLCanvasElement;
  const h = 0.6;
  const w = h * (img.width / img.height);

  return (
    <Billboard position={[0, 2.3, 0.1]}>
      <mesh renderOrder={10}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeBubbleTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  // Use the site's pixel body font (VT323) exposed via CSS variable.
  const pixelFamily =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--font-pixel-body")
      .trim() || "monospace";
  const fontSize = 42;
  const font = `${fontSize}px ${pixelFamily}, monospace`;

  // Measure first, then size the canvas (setting width/height resets ctx).
  ctx.font = font;
  const textW = Math.ceil(ctx.measureText(text).width);
  const padX = 34;
  const padY = 18;
  const border = 7;
  const tailH = 30;
  const bodyW = textW + padX * 2;
  const bodyH = fontSize + padY * 2;

  canvas.width = bodyW + border * 2;
  canvas.height = bodyH + tailH + border * 2;

  // Tail first (a downward triangle), then the body over its base so the
  // seam border disappears.
  const cx = canvas.width / 2;
  const baseY = border + bodyH;
  ctx.beginPath();
  ctx.moveTo(cx - 20, baseY - 6);
  ctx.lineTo(cx, baseY + tailH);
  ctx.lineTo(cx + 20, baseY - 6);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = border;
  ctx.lineJoin = "round";
  ctx.fill();
  ctx.stroke();

  roundRect(ctx, border, border, bodyW, bodyH, 22);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#111111";
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, border + bodyH / 2);

  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
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

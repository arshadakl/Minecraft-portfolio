"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Living touches: a dog playing on the lawn, a farmer working the crops,
 * and a couple sitting under the left oak, chatting.
 */
export default function Figures() {
  return (
    <group>
      <Dog center={[7.5, 0, 24]} radius={2} />
      <Farmer position={[6.5, 0, 17.8]} />
      <Couple />
    </group>
  );
}

/**
 * Two seated people facing each other under the oak nearest the house
 * (tree at -10,13), taking turns "talking" — the gesturing arm and head
 * bob alternate between them via an out-of-phase animation.
 */
function Couple() {
  return (
    <group>
      <SeatedPerson
        position={[-11, 0, 14]}
        faceSign={1}
        phase={0}
        robe="#8a4f6e"
        skin="#e0b088"
        hair="#4a3324"
      />
      <SeatedPerson
        position={[-9, 0, 14]}
        faceSign={-1}
        phase={Math.PI}
        robe="#3f5c7a"
        skin="#d8a877"
        hair="#2f2418"
      />
    </group>
  );
}

function SeatedPerson({
  position,
  faceSign,
  phase,
  robe,
  skin,
  hair,
}: {
  position: [number, number, number];
  /** +1 faces +x, -1 faces -x — the two sit turned toward each other. */
  faceSign: 1 | -1;
  phase: number;
  robe: string;
  skin: string;
  hair: string;
}) {
  const head = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const talk = Math.max(0, Math.sin(t * 3 + phase)); // 0..1, the "speaking" beat
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 2.5 + phase) * 0.07;
      head.current.rotation.x = Math.sin(t * 1.7 + phase) * 0.05;
    }
    if (torso.current) torso.current.rotation.x = Math.sin(t * 1.3 + phase) * 0.04;
    if (arm.current) arm.current.rotation.x = -0.35 - talk * 0.7; // gesture up while talking
  });

  return (
    <group position={position} rotation-y={(faceSign * Math.PI) / 2}>
      {/* Legs resting forward on the grass (local +z) */}
      {([-0.13, 0.13] as const).map((lx) => (
        <group key={lx}>
          <mesh position={[lx, 0.16, 0.28]} castShadow>
            <boxGeometry args={[0.19, 0.19, 0.6]} />
            <meshStandardMaterial color="#4c3a28" roughness={0.9} />
          </mesh>
          <mesh position={[lx, 0.09, 0.6]} castShadow>
            <boxGeometry args={[0.19, 0.14, 0.22]} />
            <meshStandardMaterial color="#3a2c1e" roughness={0.9} />
          </mesh>
        </group>
      ))}

      <group ref={torso} position={[0, 0.28, -0.05]}>
        {/* Torso, upright */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.5, 0.72, 0.3]} />
          <meshStandardMaterial color={robe} roughness={0.95} />
        </mesh>
        {/* Head */}
        <group ref={head} position={[0, 0.95, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial color={skin} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.22, -0.02]}>
            <boxGeometry args={[0.42, 0.1, 0.44]} />
            <meshStandardMaterial color={hair} roughness={0.9} />
          </mesh>
          {/* Nose toward the partner */}
          <mesh position={[0, -0.02, 0.22]}>
            <boxGeometry args={[0.1, 0.14, 0.1]} />
            <meshStandardMaterial color={skin} roughness={0.85} />
          </mesh>
        </group>
        {/* Still arm resting on the knee */}
        <mesh position={[-0.28, 0.18, 0.12]} rotation-x={-0.5} castShadow>
          <boxGeometry args={[0.13, 0.5, 0.13]} />
          <meshStandardMaterial color={robe} roughness={0.95} />
        </mesh>
        {/* Gesturing arm */}
        <group ref={arm} position={[0.28, 0.42, 0.06]}>
          <mesh position={[0, -0.2, 0.08]} castShadow>
            <boxGeometry args={[0.13, 0.5, 0.13]} />
            <meshStandardMaterial color={robe} roughness={0.95} />
          </mesh>
          <mesh position={[0, -0.42, 0.14]}>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color={skin} roughness={0.85} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/**
 * Blocky dog trotting a happy circle: hops, wagging tail, bobbing head.
 */
function Dog({ center, radius }: { center: [number, number, number]; radius: number }) {
  const root = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = root.current;
    if (!g) return;
    const a = t * 0.9;
    g.position.set(
      center[0] + Math.cos(a) * radius,
      center[1] + Math.abs(Math.sin(t * 5)) * 0.14,
      center[2] + Math.sin(a) * radius
    );
    g.rotation.y = -a - Math.PI / 2; // face along the circle tangent
    if (tail.current) tail.current.rotation.y = Math.sin(t * 12) * 0.5;
    if (head.current) head.current.rotation.x = Math.sin(t * 3.1) * 0.12;
  });

  const cream = "#ead9bd";
  const brown = "#b98a5a";
  const dark = "#3a2c1e";

  return (
    <group ref={root}>
      {/* Body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.85, 0.42, 0.4]} />
        <meshStandardMaterial color={cream} roughness={0.9} />
      </mesh>
      {/* Back patch */}
      <mesh position={[-0.1, 0.6, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.42]} />
        <meshStandardMaterial color={brown} roughness={0.9} />
      </mesh>
      {/* Head */}
      <group ref={head} position={[0.52, 0.62, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.38, 0.36, 0.38]} />
          <meshStandardMaterial color={cream} roughness={0.9} />
        </mesh>
        <mesh position={[0.22, -0.06, 0]}>
          <boxGeometry args={[0.16, 0.16, 0.2]} />
          <meshStandardMaterial color={brown} roughness={0.9} />
        </mesh>
        <mesh position={[0.31, -0.06, 0]}>
          <boxGeometry args={[0.05, 0.07, 0.09]} />
          <meshStandardMaterial color={dark} roughness={0.6} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.08, 0.24, 0.12]}>
          <boxGeometry args={[0.1, 0.14, 0.08]} />
          <meshStandardMaterial color={brown} roughness={0.9} />
        </mesh>
        <mesh position={[-0.08, 0.24, -0.12]}>
          <boxGeometry args={[0.1, 0.14, 0.08]} />
          <meshStandardMaterial color={brown} roughness={0.9} />
        </mesh>
      </group>
      {/* Legs */}
      {(
        [
          [0.3, 0.11],
          [0.3, -0.11],
          [-0.3, 0.11],
          [-0.3, -0.11],
        ] as const
      ).map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.11, lz]} castShadow>
          <boxGeometry args={[0.13, 0.22, 0.13]} />
          <meshStandardMaterial color={cream} roughness={0.9} />
        </mesh>
      ))}
      {/* Tail */}
      <group ref={tail} position={[-0.45, 0.58, 0]}>
        <mesh rotation={[0, 0, 0.7]} castShadow>
          <boxGeometry args={[0.3, 0.11, 0.11]} />
          <meshStandardMaterial color={brown} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Blocky farmer hoeing the wheat bed: body leans with each swing.
 */
function Farmer({ position }: { position: [number, number, number] }) {
  const body = useRef<THREE.Group>(null);
  const arms = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const swing = (Math.sin(t * 2.2) + 1) / 2; // 0..1
    if (arms.current) arms.current.rotation.x = -0.4 - swing * 0.9;
    if (body.current) body.current.rotation.x = swing * 0.12;
  });

  const skin = "#d9a877";
  const robe = "#7a5540";
  const hair = "#3f2f22";

  return (
    <group position={position} rotation-y={Math.PI}>
      {/* Legs */}
      <mesh position={[0.12, 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.2]} />
        <meshStandardMaterial color="#4c3a28" roughness={0.9} />
      </mesh>
      <mesh position={[-0.12, 0.3, 0]} castShadow>
        <boxGeometry args={[0.18, 0.6, 0.2]} />
        <meshStandardMaterial color="#4c3a28" roughness={0.9} />
      </mesh>
      <group ref={body} position={[0, 0.6, 0]}>
        {/* Torso robe */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.52, 0.84, 0.32]} />
          <meshStandardMaterial color={robe} roughness={0.95} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.06, 0]} castShadow>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.28, -0.02]}>
          <boxGeometry args={[0.42, 0.1, 0.44]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        {/* Big villager nose */}
        <mesh position={[0, 0.98, 0.22]}>
          <boxGeometry args={[0.1, 0.18, 0.1]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>
        {/* Arms + hoe, swinging as one unit */}
        <group ref={arms} position={[0, 0.72, 0.12]}>
          <mesh position={[0.2, -0.18, 0.1]} castShadow>
            <boxGeometry args={[0.14, 0.5, 0.14]} />
            <meshStandardMaterial color={robe} roughness={0.95} />
          </mesh>
          <mesh position={[-0.2, -0.18, 0.1]} castShadow>
            <boxGeometry args={[0.14, 0.5, 0.14]} />
            <meshStandardMaterial color={robe} roughness={0.95} />
          </mesh>
          {/* Hoe handle + head */}
          <mesh position={[0, -0.42, 0.45]} rotation={[1.15, 0, 0]} castShadow>
            <boxGeometry args={[0.07, 1.1, 0.07]} />
            <meshStandardMaterial color="#8a6a3e" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.62, 0.92]}>
            <boxGeometry args={[0.3, 0.08, 0.14]} />
            <meshStandardMaterial color="#55565a" roughness={0.5} metalness={0.4} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

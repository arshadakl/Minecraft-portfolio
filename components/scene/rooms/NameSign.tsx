"use client";

import WoodSign from "../WoodSign";
import { profile } from "@/lib/content";

/**
 * Wooden name sign beside the garden path. Fully baked into geometry —
 * no HTML, so it stays glued to the world while scrolling.
 */
export default function NameSign() {
  return (
    <group>
      {/* Posts */}
      <mesh position={[-4.7, 1, 16.5]} castShadow>
        <boxGeometry args={[0.25, 2, 0.25]} />
        <meshStandardMaterial color="#6e4f2a" roughness={0.85} />
      </mesh>
      <mesh position={[-2.3, 1, 16.5]} castShadow>
        <boxGeometry args={[0.25, 2, 0.25]} />
        <meshStandardMaterial color="#6e4f2a" roughness={0.85} />
      </mesh>
      <WoodSign
        text={[profile.shortName, "Developer &", "Security Researcher", "· scroll to walk in ·"]}
        position={[-3.5, 2.7, 16.5]}
        rotationY={-0.18}
        width={3.2}
        height={1.7}
      />
    </group>
  );
}

"use client";

import { useTexture } from "@react-three/drei";
import WallPanel from "../WallPanel";
import Workstation from "../Workstation";
import { about, profile, socials } from "@/lib/content";
import { body, card, eyebrow, heading, linkBtn, rule } from "../panelStyles";

/**
 * Section 2 — whoami board, framed portrait, and the dev battlestation.
 * East wall face is x=6; the bookshelf run (y<=1, z -5..0) sits below the
 * board, and the desk sits under the window at z [-2,0].
 */
export default function AboutRoom() {
  return (
    <group>
      {/* Board fills the clear patch z (-5,-2): partition face at -5,
          window at z [-2,0]. Bottom stays above the bookshelf run (y<=1). */}
      <WallPanel
        position={[5.85, 3.0, -3.5]}
        rotationY={-Math.PI / 2}
        width={2.6}
        height={3.4}
        contentWidth={360}
        section={2}
      >
        <div className={card}>
          <p className={eyebrow}>Player profile</p>
          <h2 className={heading}>&gt; {about.title}</h2>
          <div className={rule} />
          <div className={`${body} space-y-2`}>
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className={linkBtn}
                title={s.label}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </WallPanel>

      <Portrait />
      {/* Where the work happens — desk under the window, screens glowing */}
      <Workstation />

      <pointLight
        position={[0, 3.6, -2]}
        color="#ffb45e"
        intensity={26}
        distance={13}
        decay={1.6}
      />
    </group>
  );
}

/** Framed "painting" of the portrait, nearer the door. */
function Portrait() {
  const texture = useTexture(profile.portrait);
  return (
    <group position={[5.85, 2.7, 0.95]} rotation-y={-Math.PI / 2}>
      <mesh castShadow>
        <boxGeometry args={[2.0, 2.0, 0.12]} />
        <meshStandardMaterial color="#5c3f24" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.75, 1.75]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  );
}


"use client";

import WallPanel from "../WallPanel";
import WoodSign from "../WoodSign";
import { skills } from "@/lib/content";
import { card, eyebrow, heading, muted, rule } from "../panelStyles";

/** Section 6 — crafting corner: skills as ingredient badges. */
export default function SkillsRoom() {
  return (
    <group>
      <WoodSign
        text="Crafting"
        position={[5.9, 4.5, -34.7]}
        rotationY={-Math.PI / 2}
        width={2.4}
        height={0.6}
      />

      <WallPanel
        position={[5.85, 2.35, -34.7]}
        rotationY={-Math.PI / 2}
        width={3.9}
        height={3.2}
        contentWidth={450}
        section={6}
      >
        <div className={card}>
          <p className={eyebrow}>Crafting table</p>
          <h2 className={heading}>⚒ Ingredients</h2>
          <div className={rule} />
          <p className={`${muted} mb-3`}>The stack I reach for when building things.</p>
          <div className="grid grid-cols-3 gap-2">
            {skills.map((s) => (
              <div
                key={s}
                className="flex h-12 items-center justify-center border-2 border-[#8a6f47] bg-[#d3bd8c] px-1 text-center font-pixel-body text-[15px] text-[#3f5c28] shadow-[inset_2px_2px_0_#b89b68,inset_-2px_-2px_0_#efdfb2]"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </WallPanel>

      <pointLight
        position={[0, 3.6, -35]}
        color="#ffb45e"
        intensity={24}
        distance={12}
        decay={1.6}
      />
    </group>
  );
}

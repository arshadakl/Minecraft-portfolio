"use client";

import WallPanel from "../WallPanel";
import WoodSign from "../WoodSign";
import { skills } from "@/lib/content";
import { card, eyebrow, heading, muted, rule } from "../panelStyles";

/**
 * Section 6 — crafting corner: skills as a Minecraft inventory grid.
 * Each slot shows the item icon + name; hovering opens an enchantment
 * tooltip (purple, with lore lines) like hovering an enchanted item.
 * Slots re-enable pointer events (WallPanel content is pointer-events-none
 * by default); wheel events still bubble to the scroll container.
 */
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
          <p className={eyebrow}>Inventory</p>
          <h2 className={heading}>⚒ Crafting Ingredients</h2>
          <div className={rule} />
          <p className={`${muted} mb-3`}>Hover an item to inspect its enchantments.</p>
          <div className="grid grid-cols-4 gap-1.5">
            {skills.map((s) => (
              <div
                key={s.name}
                className="group pointer-events-auto relative flex h-16 cursor-help flex-col items-center justify-center gap-0.5 border-2 border-[#373737] bg-[#8b8b8b] shadow-[inset_2px_2px_0_#ffffff59,inset_-2px_-2px_0_#00000059] transition-transform hover:scale-105"
              >
                <span className="text-xl leading-none">{s.icon}</span>
                <span className="px-0.5 text-center font-pixel-body text-[12px] leading-none text-[#1c140c]">
                  {s.name}
                </span>
                {/* Enchantment tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden w-max max-w-44 -translate-x-1/2 border-2 border-[#8b5cf6] bg-[#170817]/95 px-2.5 py-1.5 text-left group-hover:block">
                  <p className="font-pixel-body text-[15px] leading-tight text-[#c4b5fd]">
                    {s.icon} {s.name}
                  </p>
                  {s.lore.map((line) => (
                    <p
                      key={line}
                      className="font-pixel-body text-[13px] italic leading-tight text-[#9ca3af]"
                    >
                      {line}
                    </p>
                  ))}
                </div>
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

"use client";

import WallPanel from "../WallPanel";
import WoodSign from "../WoodSign";
import { achievement } from "@/lib/content";
import { body, card, eyebrow, headingSm, linkBtnGold, ruleGold } from "../panelStyles";

/**
 * Section 3 — trophy room. West wall face is x=-5; bookshelf columns
 * occupy z [-11,-10] and [-7,-6] (y<=2), so the main board sits between
 * them and the two press clippings hang above them.
 */
export default function AchievementsRoom() {
  return (
    <group>
      <WoodSign
        text="Hall of Fame"
        position={[-4.9, 4.45, -8.5]}
        rotationY={Math.PI / 2}
        width={2.8}
        height={0.6}
      />

      {/* Main board between the bookshelf columns (z [-11,-10] and [-7,-6]) */}
      <WallPanel
        position={[-4.85, 2.3, -8.5]}
        rotationY={Math.PI / 2}
        width={2.2}
        height={3.2}
        contentWidth={300}
        section={3}
      >
        <div className={card}>
          <p className={eyebrow}>Achievement unlocked</p>
          <h2 className={headingSm}>🏆 {achievement.title}</h2>
          <div className={ruleGold} />
          <div className={`${body} space-y-2`}>
            {achievement.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </WallPanel>

      {/* Framed news clippings above the bookshelf columns */}
      <PressFrame z={-10.37} outlet={achievement.press[0].outlet} url={achievement.press[0].url} />
      <PressFrame z={-6.63} outlet={achievement.press[1].outlet} url={achievement.press[1].url} />

      {/* Enchanted glow above the pedestal (pedestal blocks come from house.ts) */}
      <pointLight
        position={[2, 2.4, -9.5]}
        color="#a78bfa"
        intensity={11}
        distance={8}
        decay={1.8}
      />

      <pointLight
        position={[-1, 3.6, -8.5]}
        color="#ffb45e"
        intensity={20}
        distance={12}
        decay={1.6}
      />
    </group>
  );
}

function PressFrame({ z, outlet, url }: { z: number; outlet: string; url: string }) {
  return (
    <WallPanel
      position={[-4.85, 3.35, z]}
      rotationY={Math.PI / 2}
      width={0.85}
      height={0.9}
      contentWidth={140}
      section={3}
    >
      <div className={`${card} p-3! text-center`}>
        <p className={`${eyebrow} mb-1`}>In the news</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={`${linkBtnGold} inline-block px-2! py-1! text-[8px]!`}
        >
          📰 {outlet} ↗
        </a>
      </div>
    </WallPanel>
  );
}

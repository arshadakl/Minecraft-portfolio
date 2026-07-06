"use client";

import WallPanel from "../WallPanel";
import WoodSign from "../WoodSign";
import { card, headingSm, muted } from "../panelStyles";

/** Section 1 — just inside the door: warm light + welcome sign. */
export default function EntryHall() {
  return (
    <group>
      {/* "Welcome!" sign on the oak upper wall, above the balcony door */}
      <WoodSign text="Welcome!" position={[0, 7.5, 9.06]} width={2.4} height={0.6} />

      {/* Clear wall patch z [6,8] — the window occupies z [4,6] */}
      <WallPanel
        position={[-4.85, 2.6, 7.0]}
        rotationY={Math.PI / 2}
        width={1.55}
        height={1.4}
        contentWidth={250}
        section={1}
      >
        <div className={`${card} p-3! text-center`}>
          <p className={headingSm}>Come on in!</p>
          <p className={`${muted} mt-1`}>
            Keep scrolling — each room is a chapter.
          </p>
        </div>
      </WallPanel>

      <pointLight
        position={[0, 3.6, 5]}
        color="#ffb45e"
        intensity={22}
        distance={12}
        decay={1.6}
      />
    </group>
  );
}

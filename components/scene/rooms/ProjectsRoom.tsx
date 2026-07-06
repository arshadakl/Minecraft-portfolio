"use client";

import WallPanel from "../WallPanel";
import WoodSign from "../WoodSign";
import { projects } from "@/lib/content";
import type { Project } from "@/lib/content";
import { card, chip, eyebrow, linkBtn } from "../panelStyles";

/**
 * Section 5 — gallery, two camera passes: west wall (1-5) then east (6-10).
 * Frames form one near-contiguous strip per wall: slim glow rims instead of
 * the fat plank backing so neighbors don't overlap. Raised above the barrels
 * (y<=1); the strip stays inside z (-31,-20), clear of both partitions.
 */
const CARD_Z = [-21.25, -23.4, -25.55, -27.7, -29.85];

export default function ProjectsRoom() {
  return (
    <group>
      <WoodSign
        text="Selected Works"
        position={[-4.9, 4.73, -25.55]}
        rotationY={Math.PI / 2}
        width={3.2}
        height={0.5}
      />
      <WoodSign
        text="More Works"
        position={[5.9, 4.73, -25.55]}
        rotationY={-Math.PI / 2}
        width={3.2}
        height={0.5}
      />

      {projects.slice(0, 5).map((p, i) => (
        <ProjectFrame
          key={p.name}
          project={p}
          index={i + 1}
          position={[-4.85, 2.85, CARD_Z[i]]}
          rotationY={Math.PI / 2}
        />
      ))}
      {projects.slice(5, 10).map((p, i) => (
        <ProjectFrame
          key={p.name}
          project={p}
          index={i + 6}
          position={[5.85, 2.85, CARD_Z[i]]}
          rotationY={-Math.PI / 2}
        />
      ))}

      <pointLight
        position={[0, 3.6, -22.5]}
        color="#ffb45e"
        intensity={24}
        distance={12}
        decay={1.6}
      />
      <pointLight
        position={[0, 3.6, -29]}
        color="#ffb45e"
        intensity={24}
        distance={12}
        decay={1.6}
      />
    </group>
  );
}

function ProjectFrame({
  project,
  index,
  position,
  rotationY,
}: {
  project: Project;
  index: number;
  position: [number, number, number];
  rotationY: number;
}) {
  return (
    <group>
      {/* Slim item-frame rim with a soft glow — serves as the backing */}
      <group position={position} rotation-y={rotationY}>
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[2.1, 3.2, 0.08]} />
          <meshStandardMaterial
            color="#8a5a2e"
            emissive="#c98a3e"
            emissiveIntensity={0.25}
            roughness={0.6}
          />
        </mesh>
      </group>
      <WallPanel
        position={position}
        rotationY={rotationY}
        width={1.95}
        height={2.9}
        contentWidth={300}
        section={5}
        noBoard
      >
        <div className={`${card} p-4!`}>
          <p className={eyebrow}>Item {index} / 10</p>
          <h3 className="mb-2 font-pixel text-[10px] leading-relaxed text-[#4a331f]">
            {project.name}
          </h3>
          <p className="mb-2 font-pixel-body text-[15px] leading-tight text-[#463218]">
            {project.desc}
          </p>
          <p className="mb-2 flex flex-wrap gap-1">
            {project.stack.map((s) => (
              <span key={s} className={`${chip} text-[11px]!`}>
                {s}
              </span>
            ))}
          </p>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className={`${linkBtn} px-2! py-1! text-[8px]!`}
            >
              {project.linkLabel ?? project.link} ↗
            </a>
          )}
        </div>
      </WallPanel>
    </group>
  );
}

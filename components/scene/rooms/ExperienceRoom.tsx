"use client";

import WallPanel from "../WallPanel";
import WoodSign from "../WoodSign";
import { experience } from "@/lib/content";
import type { Job } from "@/lib/content";
import { body, card, eyebrow, headingSm, muted, rule } from "../panelStyles";

/**
 * Section 4 — quest log. Both job boards hang on the east wall (face x=6)
 * so the camera's single eastward look covers them: most recent first,
 * backings span roughly [-15.8,-12.2] and [-18.8,-16.0], clear of both
 * partitions and of each other.
 */
export default function ExperienceRoom() {
  return (
    <group>
      <WoodSign
        text="Quest Log"
        position={[5.9, 4.6, -15.7]}
        rotationY={-Math.PI / 2}
        width={2.8}
        height={0.6}
      />

      <JobBoard
        job={experience[0]}
        position={[5.85, 2.25, -14.0]}
        rotationY={-Math.PI / 2}
        big
      />
      <JobBoard
        job={experience[1]}
        position={[5.85, 2.25, -17.4]}
        rotationY={-Math.PI / 2}
      />

      <pointLight
        position={[0, 3.6, -16]}
        color="#ffb45e"
        intensity={26}
        distance={13}
        decay={1.6}
      />
    </group>
  );
}

function JobBoard({
  job,
  position,
  rotationY,
  big = false,
}: {
  job: Job;
  position: [number, number, number];
  rotationY: number;
  big?: boolean;
}) {
  return (
    <WallPanel
      position={position}
      rotationY={rotationY}
      width={big ? 3.2 : 2.5}
      height={big ? 3.6 : 3.0}
      contentWidth={big ? 400 : 320}
      section={4}
    >
      <div className={card}>
        <p className={eyebrow}>{big ? "Active quest" : "Completed quest"}</p>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className={headingSm}>{job.company}</h2>
          <span className={muted}>{job.period}</span>
        </div>
        <p className={`${muted} mt-1`}>
          ⚔ {job.role} · {job.location}
        </p>
        <div className={rule} />
        <ul className={`${body} list-none space-y-1.5`}>
          {job.bullets.map((b, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-[#4c8f3a]">▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </WallPanel>
  );
}

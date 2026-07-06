"use client";

import WallPanel from "../WallPanel";
import ContactForm from "@/components/ui/ContactForm";
import { socials } from "@/lib/content";
import { card, eyebrow, heading, linkBtn, muted, rule } from "../panelStyles";

/** Section 7 — final room: contact form + cake on the table. */
export default function ContactRoom() {
  return (
    <group>
      {/* No sign — the tall form board needs the full wall height */}
      <WallPanel
        position={[5.85, 2.5, -40.5]}
        rotationY={-Math.PI / 2}
        width={4.2}
        height={4.2}
        contentWidth={470}
        section={7}
      >
        <div className={card}>
          <p className={eyebrow}>Final room</p>
          <h2 className={`${heading} mb-1`}>✉ Send a message</h2>
          <div className={rule} />
          <p className={`${muted} mb-3`}>
            End of the tour — say hi, or find me elsewhere below. Have some cake.
          </p>
          <ContactForm />
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t-2 border-[#c9b389] pt-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className={linkBtn}
              >
                {s.label} ↗
              </a>
            ))}
            <a
              href="https://arshadakl.in"
              target="_blank"
              rel="noreferrer"
              className={`${linkBtn} border-[#8a6a3e]! bg-[#efe0bd]!`}
            >
              🌐 arshadakl.in ↗
            </a>
            <a
              href="https://www.arshadakl.in/docs/arshad_2026.pdf"
              target="_blank"
              rel="noreferrer"
              className={`${linkBtn} border-[#4c6b2f]! bg-[#c4d4a0]!`}
            >
              📜 Resume
            </a>
          </div>
        </div>
      </WallPanel>

      <pointLight
        position={[0, 3.6, -41]}
        color="#ffb45e"
        intensity={26}
        distance={13}
        decay={1.6}
      />
    </group>
  );
}

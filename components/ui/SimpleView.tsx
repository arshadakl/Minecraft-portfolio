"use client";

/* eslint-disable @next/next/no-img-element */

import {
  about,
  achievement,
  experience,
  profile,
  projects,
  skills,
  socials,
} from "@/lib/content";
import ContactForm from "./ContactForm";

/** 2D fallback portfolio — mobile / accessibility / reduced-motion path. */
export default function SimpleView() {
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-[#181310] font-pixel-body text-amber-50">
      <div className="mx-auto max-w-2xl space-y-12 px-5 py-12">
        <header className="space-y-2">
          <img
            src={profile.portrait}
            alt="Portrait of Arshad"
            className="mb-4 h-24 w-24 border-4 border-[#5c3f24] object-cover"
          />
          <h1 className="font-pixel text-xl tracking-[0.15em]">{profile.name}</h1>
          <p className="text-lg text-amber-200/80">{profile.tagline}</p>
          <div className="flex gap-2 pt-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="border-2 border-[#6e4f2a] bg-[#3e2c1e] px-2.5 py-1 text-sm font-bold text-amber-200 hover:border-emerald-400 hover:text-emerald-300"
              >
                {s.label}
              </a>
            ))}
          </div>
        </header>

        <Section title={`> ${about.title}`}>
          <div className="space-y-2 text-base leading-relaxed text-amber-100/90">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Section>

        <Section title={`🏆 ${achievement.title}`}>
          <div className="space-y-2 text-base leading-relaxed text-amber-100/90">
            {achievement.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            {achievement.press.map((p) => (
              <a
                key={p.outlet}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="border-2 border-[#6e4f2a] bg-[#3e2c1e] px-2.5 py-1 text-sm font-bold text-amber-200 hover:border-violet-400 hover:text-violet-300"
              >
                📰 {p.outlet}
              </a>
            ))}
          </div>
        </Section>

        <Section title="⚔ Experience">
          <div className="space-y-6">
            {experience.map((job) => (
              <div key={job.company}>
                <div className="flex flex-wrap items-baseline justify-between gap-1">
                  <h3 className="text-lg font-bold text-sky-300">{job.company}</h3>
                  <span className="text-sm text-amber-200/60">{job.period}</span>
                </div>
                <p className="mb-2 text-sm text-amber-200/80">
                  {job.role} · {job.location}
                </p>
                <ul className="space-y-1.5 text-[15px] leading-snug text-amber-100/90">
                  {job.bullets.map((b, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-emerald-400">▸</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="⛏ Projects">
          <div className="space-y-5">
            {projects.map((p, i) => (
              <div key={p.name} className="border-2 border-[#3e2c1e] p-3">
                <h3 className="mb-1 text-base font-bold text-amber-300">
                  {i + 1}. {p.name}
                </h3>
                <p className="mb-2 text-[15px] leading-snug text-amber-100/85">
                  {p.desc}
                </p>
                <p className="flex flex-wrap gap-1">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="border border-[#6e4f2a] bg-[#3e2c1e] px-1 py-0.5 text-xs text-emerald-300/90"
                    >
                      {s}
                    </span>
                  ))}
                </p>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-bold text-sky-300 underline decoration-dotted"
                  >
                    {p.linkLabel ?? p.link} ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="⚒ Skills">
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="border-2 border-[#6e4f2a] bg-[#3e2c1e] px-2.5 py-1 text-sm font-bold text-amber-200"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>

        <Section title="✉ Contact">
          <ContactForm />
        </Section>

        <footer className="pb-8 text-center text-xs text-amber-200/40">
          © {new Date().getFullYear()} {profile.name} · built with Next.js + R3F
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 border-b-2 border-[#3e2c1e] pb-1 font-pixel text-sm text-emerald-300">
        {title}
      </h2>
      {children}
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useSiteStore } from "@/lib/store";
import { useProgress } from "@/lib/progress";
import { profile, projects, skills, socials } from "@/lib/content";

/**
 * Fake terminal on the coder's monitors (click a screen to open). Static
 * command map — nothing is evaluated. `hack` is the easter egg tying into
 * the bug hunt; `ssh` points at the real SSH portfolio.
 */
const PROMPT = "visitor@arshadakl.in:~$";

const banner = [
  "ARSHAD-OS 1.0 — guest shell",
  'Type "help" for commands.',
];

function run(cmd: string): string[] {
  switch (cmd) {
    case "help":
      return [
        "help       this list",
        "whoami     who owns this cottage",
        "projects   selected works",
        "skills     the crafting ingredients",
        "socials    where else to find me",
        "ssh        the OTHER terminal portfolio",
        "hack       [REDACTED]",
        "clear      wipe the screen",
        "exit       close the terminal",
      ];
    case "whoami":
      return [`${profile.name} — ${profile.tagline}`];
    case "projects":
      return projects.map((p) => `• ${p.name}${p.link ? ` → ${p.link}` : ""}`);
    case "skills":
      return [skills.map((s) => s.name).join(", ")];
    case "socials":
    case "contact":
      return socials.map((s) => `${s.label}: ${s.url}`);
    case "ssh":
      return [
        "This site has a sibling that lives entirely in your terminal:",
        "  $ ssh arshadakl.in",
        "Go on. It's real.",
      ];
    case "hack":
      return [
        "ACCESS GRANTED ................ just kidding.",
        "Real intrusions get remediation reports, not shells.",
        "But since you asked: seven bugs crawl this cottage.",
        "Squash them all and the back wall opens.",
      ];
    case "sudo":
    case "rm -rf /":
      return ["nice try."];
    case "":
      return [];
    default:
      return [`${cmd}: command not found (try "help")`];
  }
}

export default function TerminalOverlay() {
  const open = useSiteStore((s) => s.terminalOpen);
  const close = useSiteStore((s) => s.setTerminalOpen);
  const [lines, setLines] = useState<string[]>(banner);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  if (!open) return null;

  const submit = () => {
    const cmd = input.trim().toLowerCase();
    setInput("");
    if (cmd === "clear") {
      setLines([]);
      return;
    }
    if (cmd === "exit") {
      close(false);
      return;
    }
    if (cmd === "hack") useProgress.getState().unlockAchievement("hacker");
    setLines((prev) => [...prev, `${PROMPT} ${cmd}`, ...run(cmd)]);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      onClick={() => close(false)}
    >
      <div
        className="toast-in flex h-[420px] w-full max-w-xl flex-col border-4 border-[#3a3a42] bg-[#0d1117] shadow-[0_8px_30px_rgba(0,0,0,0.7)]"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.focus();
        }}
      >
        <div className="flex items-center justify-between border-b-2 border-[#3a3a42] bg-[#161b22] px-3 py-1.5">
          <span className="font-pixel text-[9px] text-[#7ee787]">
            guest@cottage — zsh
          </span>
          <button
            onClick={() => close(false)}
            aria-label="Close terminal"
            className="border border-[#3a3a42] px-2 font-pixel text-[10px] text-[#c9d1d9] hover:bg-[#21262d]"
          >
            ✕
          </button>
        </div>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 py-2 font-pixel-body text-[16px] leading-snug text-[#c9d1d9]"
        >
          {lines.map((l, i) => (
            <p key={i} className={l.startsWith(PROMPT) ? "text-[#7ee787]" : ""}>
              {l}
            </p>
          ))}
        </div>
        <form
          className="flex items-center gap-2 border-t-2 border-[#3a3a42] px-3 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <span className="font-pixel-body text-[16px] text-[#7ee787]">{PROMPT}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent font-pixel-body text-[16px] text-[#c9d1d9] caret-[#7ee787] outline-none"
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
          />
        </form>
      </div>
    </div>
  );
}

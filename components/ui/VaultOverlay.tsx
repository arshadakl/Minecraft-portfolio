"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/progress";
import { achievement, vault } from "@/lib/content";
import { linkBtnGold } from "@/components/scene/panelStyles";

/**
 * Chest GUI — the reward screen behind the vault. Minecraft treats every
 * container as a 2D overlay on the world, so a DOM modal is the authentic
 * move here. Opens when the vault chest is clicked (see scene/Vault.tsx).
 */
export default function VaultOverlay() {
  const open = useProgress((s) => s.vaultGuiOpen);
  const close = useProgress((s) => s.setVaultGuiOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      onClick={() => close(false)}
    >
      <div
        className="toast-in max-h-[85dvh] w-full max-w-lg overflow-y-auto border-4 border-[#5c4a2a] bg-[#211a12] p-6 shadow-[inset_3px_3px_0_#3a2f1c,inset_-3px_-3px_0_#120d08,0_8px_30px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-start justify-between gap-4">
          <h2 className="font-pixel text-[14px] leading-relaxed text-[#fcfc54]">
            🔓 {vault.title}
          </h2>
          <button
            onClick={() => close(false)}
            aria-label="Close vault"
            className="border-2 border-[#5c4a2a] bg-[#3a2f1c] px-2 py-0.5 font-pixel text-[10px] text-amber-100 hover:bg-[#4c3e26]"
          >
            ✕
          </button>
        </div>
        <p className="mb-3 font-pixel-body text-[16px] text-emerald-300">
          {vault.intro}
        </p>
        <div className="mb-4 h-[3px] w-16 bg-[#d9a441]" />
        <div className="space-y-3 font-pixel-body text-[17px] leading-snug text-amber-50">
          {vault.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {achievement.press.map((p) => (
            <a
              key={p.outlet}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className={linkBtnGold}
            >
              📰 {p.outlet} ↗
            </a>
          ))}
        </div>
        <p className="mt-4 border-t-2 border-[#3a2f1c] pt-3 font-pixel-body text-[15px] text-amber-200/70">
          {vault.outro}
        </p>
      </div>
    </div>
  );
}

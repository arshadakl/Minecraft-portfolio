"use client";

import { useEffect } from "react";
import { useProgress } from "@/lib/progress";
import { ACHIEVEMENT_BY_ID } from "@/lib/achievements";

/**
 * Minecraft-style "Advancement Made!" toasts, top-center. Toasts queue in
 * the progress store; each auto-dismisses after a few seconds.
 */
export default function AchievementToast() {
  const toasts = useProgress((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-30 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <ToastCard key={t.id} id={t.id} />
      ))}
    </div>
  );
}

function ToastCard({ id }: { id: string }) {
  const dismissToast = useProgress((s) => s.dismissToast);
  const def = ACHIEVEMENT_BY_ID[id];

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(id), 4500);
    return () => clearTimeout(timer);
  }, [id, dismissToast]);

  if (!def) return null;

  return (
    <div className="toast-in flex items-center gap-3 border-2 border-[#5c4a2a] bg-[#212121]/95 px-4 py-2.5 shadow-[inset_2px_2px_0_#3a3a3a,inset_-2px_-2px_0_#111,0_4px_12px_rgba(0,0,0,0.5)]">
      <span className="flex h-9 w-9 items-center justify-center border-2 border-[#8a6f47] bg-[#3a2f1c] text-lg shadow-[inset_2px_2px_0_#241c10]">
        {def.icon}
      </span>
      <span>
        <span className="block font-pixel text-[9px] text-[#fcfc54]">
          Advancement Made!
        </span>
        <span className="block font-pixel-body text-[16px] leading-tight text-white">
          {def.title}
        </span>
      </span>
    </div>
  );
}

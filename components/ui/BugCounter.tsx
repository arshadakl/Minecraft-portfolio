"use client";

import { useSyncExternalStore } from "react";
import { useProgress } from "@/lib/progress";
import { BUG_COUNT } from "@/lib/achievements";

const emptySubscribe = () => () => {};

/**
 * Bug-hunt progress chip, bottom-left. Hidden until the first squash so
 * the hunt stays a surprise; once complete it points at the vault until
 * the chest has been opened.
 */
export default function BugCounter() {
  const squashed = useProgress((s) => s.squashed.length);
  const vaultOpened = useProgress((s) => s.vaultOpened);
  // Persisted state isn't in the server HTML — render only after hydration.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted || squashed === 0) return null;
  const done = squashed >= BUG_COUNT;

  return (
    <div className="pointer-events-none fixed bottom-16 left-4 z-20 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 border-2 border-[#5c4a2a] bg-black/70 px-3 py-1.5 font-pixel-body text-[16px] text-amber-100">
        <span>🐛</span>
        <span>
          {squashed} / {BUG_COUNT} bugs squashed
        </span>
      </div>
      {done && !vaultOpened && (
        <div className="vault-hint border-2 border-emerald-500/70 bg-black/70 px-3 py-1.5 font-pixel-body text-[15px] text-emerald-300">
          🔓 Vault unsealed — back wall, last room
        </div>
      )}
    </div>
  );
}

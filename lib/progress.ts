import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ACHIEVEMENT_BY_ID, BUG_COUNT } from "./achievements";
import { SECTION_COUNT } from "./content";
import { audio } from "./audio";

export interface Toast {
  /** Achievement id — doubles as the toast key. */
  id: string;
}

interface ProgressStore {
  /** Ids of squashed bugs (persisted). */
  squashed: string[];
  /** Unlocked achievement ids in unlock order (persisted). */
  achievements: string[];
  /** Section indexes the camera has passed through (persisted). */
  visited: number[];
  /** Vault chest has been opened at least once (persisted). */
  vaultOpened: boolean;
  /** Chest GUI overlay currently on screen (ephemeral). */
  vaultGuiOpen: boolean;
  /** Pending advancement toasts (ephemeral). */
  toasts: Toast[];

  squashBug: (id: string) => void;
  visitSection: (i: number) => void;
  setVaultGuiOpen: (open: boolean) => void;
  dismissToast: (id: string) => void;
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => {
      const unlock = (id: string) => {
        if (!ACHIEVEMENT_BY_ID[id] || get().achievements.includes(id)) return;
        set((s) => ({
          achievements: [...s.achievements, id],
          toasts: [...s.toasts, { id }],
        }));
        audio.playSynth("ding");
      };

      return {
        squashed: [],
        achievements: [],
        visited: [],
        vaultOpened: false,
        vaultGuiOpen: false,
        toasts: [],

        squashBug: (id) => {
          if (get().squashed.includes(id)) return;
          set((s) => ({ squashed: [...s.squashed, id] }));
          unlock("first-bug");
          if (get().squashed.length >= BUG_COUNT) unlock("bug-hunter");
        },

        visitSection: (i) => {
          const { visited } = get();
          if (!visited.includes(i)) set({ visited: [...visited, i] });
          if (i >= 2) unlock("come-on-in");
          if (get().visited.length >= SECTION_COUNT) unlock("grand-tour");
        },

        setVaultGuiOpen: (open) => {
          set({ vaultGuiOpen: open });
          if (open && !get().vaultOpened) {
            set({ vaultOpened: true });
            unlock("disclosure");
          }
        },

        dismissToast: (id) =>
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      };
    },
    {
      name: "mc-portfolio-progress",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        squashed: s.squashed,
        achievements: s.achievements,
        visited: s.visited,
        vaultOpened: s.vaultOpened,
      }),
    }
  )
);

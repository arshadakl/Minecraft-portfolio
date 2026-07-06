import { create } from "zustand";

interface SiteStore {
  /** Index 0-7 of the section the camera is currently in. */
  currentSection: number;
  /** ScrollControls' scroll container — set once by CameraRig, used by NavDots. */
  scrollEl: HTMLElement | null;
  /** 2D fallback mode (mobile / accessibility). */
  simpleMode: boolean;
  /** Global audio mute — starts muted (browsers block autoplay anyway). */
  muted: boolean;

  setCurrentSection: (i: number) => void;
  setScrollEl: (el: HTMLElement | null) => void;
  setSimpleMode: (on: boolean) => void;
  setMuted: (on: boolean) => void;
}

export const useSiteStore = create<SiteStore>((set) => ({
  currentSection: 0,
  scrollEl: null,
  simpleMode: false,
  muted: true,
  setCurrentSection: (i) => set({ currentSection: i }),
  setScrollEl: (el) => set({ scrollEl: el }),
  setSimpleMode: (on) => set({ simpleMode: on }),
  setMuted: (on) => set({ muted: on }),
}));

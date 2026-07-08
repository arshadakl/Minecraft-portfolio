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
  /** User has discovered drag-to-look — hides the hint chip. */
  hasLooked: boolean;
  /** Day/night lever state — swaps sky, fog and lighting. */
  night: boolean;
  /** The coder's terminal overlay is on screen. */
  terminalOpen: boolean;
  /** Weather: rain cycles on a timer (see scene/Rain.tsx). */
  raining: boolean;
  /** User touched the sound toggle — auto-start must not override them. */
  audioTouched: boolean;

  setCurrentSection: (i: number) => void;
  setScrollEl: (el: HTMLElement | null) => void;
  setSimpleMode: (on: boolean) => void;
  setMuted: (on: boolean) => void;
  setHasLooked: (on: boolean) => void;
  setNight: (on: boolean) => void;
  setTerminalOpen: (on: boolean) => void;
  setRaining: (on: boolean) => void;
  setAudioTouched: () => void;
}

export const useSiteStore = create<SiteStore>((set) => ({
  currentSection: 0,
  scrollEl: null,
  simpleMode: false,
  muted: true,
  hasLooked: false,
  night: false,
  terminalOpen: false,
  raining: false,
  audioTouched: false,
  setCurrentSection: (i) => set({ currentSection: i }),
  setScrollEl: (el) => set({ scrollEl: el }),
  setSimpleMode: (on) => set({ simpleMode: on }),
  setMuted: (on) => set({ muted: on }),
  setHasLooked: (on) => set({ hasLooked: on }),
  setNight: (on) => set({ night: on }),
  setTerminalOpen: (on) => set({ terminalOpen: on }),
  setRaining: (on) => set({ raining: on }),
  setAudioTouched: () => set({ audioTouched: true }),
}));

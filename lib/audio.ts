/**
 * Single shared audio manager — background music loop + one-shot sound
 * effects, gated by a global mute. Kept outside React so any component
 * (UI button, in-canvas Door) drives the same instance.
 */

type Sfx = "doorOpen" | "doorClose";

class AudioManager {
  private music: HTMLAudioElement | null = null;
  private sfx: Record<Sfx, HTMLAudioElement> | null = null;
  private muted = true;
  private ready = false;

  /** Lazily create the audio elements on first interaction (client only). */
  private init() {
    if (this.ready || typeof window === "undefined") return;

    this.music = new Audio("/audio/Sweden.mp3");
    this.music.loop = true;
    this.music.volume = 0.35;

    this.sfx = {
      doorOpen: new Audio("/audio/DoorOpening.mp3"),
      doorClose: new Audio("/audio/DoorClosing.mp3"),
    };
    this.sfx.doorOpen.volume = 0.6;
    this.sfx.doorClose.volume = 0.6;

    this.ready = true;
  }

  isMuted() {
    return this.muted;
  }

  /** Toggle all audio. Unmuting must be called from a user gesture so the
   *  browser allows playback. */
  setMuted(muted: boolean) {
    this.init();
    this.muted = muted;
    if (!this.music) return;
    if (muted) {
      this.music.pause();
    } else {
      void this.music.play().catch(() => {});
    }
  }

  /** Fire a one-shot effect (ignored while muted). */
  play(name: Sfx) {
    if (this.muted) return;
    this.init();
    const el = this.sfx?.[name];
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => {});
  }
}

export const audio = new AudioManager();

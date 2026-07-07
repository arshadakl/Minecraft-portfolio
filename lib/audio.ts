/**
 * Single shared audio manager — background music loop + one-shot sound
 * effects, gated by a global mute. Kept outside React so any component
 * (UI button, in-canvas Door) drives the same instance.
 */

type Sfx = "doorOpen" | "doorClose";
/** Synthesized one-shots (WebAudio, no asset files). */
type Synth = "squish" | "ding" | "rumble";

class AudioManager {
  private music: HTMLAudioElement | null = null;
  private sfx: Record<Sfx, HTMLAudioElement> | null = null;
  private muted = true;
  private ready = false;
  private actx: AudioContext | null = null;

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
    // Unmute is a user gesture — the only reliable moment to (re)start the
    // synth context alongside the music element.
    if (!muted) void this.synthCtx()?.resume().catch(() => {});
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

  private synthCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.actx) {
      try {
        this.actx = new AudioContext();
      } catch {
        return null;
      }
    }
    return this.actx;
  }

  /** Fire a synthesized one-shot (ignored while muted). */
  playSynth(name: Synth) {
    if (this.muted) return;
    const ctx = this.synthCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    const t = ctx.currentTime;

    const tone = (
      type: OscillatorType,
      freqFrom: number,
      freqTo: number,
      start: number,
      dur: number,
      vol: number
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqFrom, t + start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqTo), t + start + dur);
      gain.gain.setValueAtTime(vol, t + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + start);
      osc.stop(t + start + dur + 0.02);
    };

    switch (name) {
      case "ding": // Minecraft-ish advancement pling: two rising notes
        tone("triangle", 740, 740, 0, 0.28, 0.22);
        tone("triangle", 1109, 1109, 0.09, 0.5, 0.22);
        break;
      case "squish": // short wet pop, pitch dropping fast
        tone("square", 260, 60, 0, 0.12, 0.18);
        tone("sine", 130, 40, 0.02, 0.14, 0.2);
        break;
      case "rumble": // stone seal grinding open
        tone("sawtooth", 58, 32, 0, 1.3, 0.3);
        tone("sawtooth", 44, 26, 0.15, 1.2, 0.25);
        tone("square", 90, 45, 0.05, 0.5, 0.08);
        break;
    }
  }
}

export const audio = new AudioManager();

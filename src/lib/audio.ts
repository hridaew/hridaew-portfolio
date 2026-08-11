import { isChoomThemeDocument, playChoomClick } from "@/lib/choomUiAudio";

/** Shared Web Audio context — reuse for all procedural UI sounds. */
let audioCtx: AudioContext | null = null;

function prefersReducedUiMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getContext(): AudioContext {
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Soft UI click — filtered noise tick (UI wiki: noise percussion, 5–15ms,
 * bandpass ~3–6kHz, Q 2–5, gain under 1, exponential decay).
 */
function playNoiseClick(opts?: { gain?: number; durationMs?: number; freq?: number }) {
  if (prefersReducedUiMotion()) return;
  try {
    const ctx = getContext();
    const t0 = ctx.currentTime;
    const duration = Math.min(0.015, Math.max(0.005, (opts?.durationMs ?? 10) / 1000));
    const peak = opts?.gain ?? 0.1;
    const freq = opts?.freq ?? 4000;

    const buffer = ctx.createBuffer(
      1,
      Math.max(1, Math.floor(ctx.sampleRate * duration)),
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Fast exponential envelope baked into the buffer
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.35));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq, t0);
    filter.Q.setValueAtTime(3, t0);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peak, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.onended = () => {
      try {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {
        /* ignore */
      }
    };

    source.start(t0);
    source.stop(t0 + duration);
  } catch {
    // Silently fail if audio isn't available
  }
}

let heroSketchPopAudio: HTMLAudioElement | null = null;

/** Preload hero sketch-orb pop (call once on home mount; play only inside user gestures). */
export function preloadHeroSketchPop() {
  if (typeof window === "undefined") return;
  if (heroSketchPopAudio) return;
  heroSketchPopAudio = new Audio("/assets/home/hero-sketch-pop.mp3");
  heroSketchPopAudio.volume = 0.22;
  heroSketchPopAudio.preload = "auto";
  heroSketchPopAudio.load();
}

export function playHeroSketchPop() {
  if (typeof window === "undefined") return;
  if (prefersReducedUiMotion()) return;
  if (!heroSketchPopAudio) {
    heroSketchPopAudio = new Audio("/assets/home/hero-sketch-pop.mp3");
    heroSketchPopAudio.volume = 0.22;
  }
  heroSketchPopAudio.currentTime = 0;
  void heroSketchPopAudio.play().catch(() => {});
}

/** Default site UI click — soft noise tick (or Choom sample when that theme is on). */
export function playClick() {
  if (typeof document !== "undefined" && isChoomThemeDocument()) {
    playChoomClick();
    return;
  }
  playNoiseClick();
}

export function playAlarm() {
  if (prefersReducedUiMotion()) return;
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(420, ctx.currentTime);

    for (let i = 0; i < 12; i++) {
      const t = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(i % 2 === 0 ? 420 : 560, t);
    }

    const vol = 0.01;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime + 1.4);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        /* ignore */
      }
    };

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch {
    // Silently fail
  }
}

/** Real asset boom for destroy cheat; falls back to synthetic if play fails. */
export function playDestroyBoom(preloaded?: HTMLAudioElement | null) {
  if (prefersReducedUiMotion()) return;
  const audio = preloaded ?? new Audio("/assets/cheat-codes/boom.wav");
  audio.volume = 0.75;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    playExplosionBoom();
  });
}

/** Short impact / explosion burst for destroy cheat (fallback when WAV missing / blocked). */
export function playExplosionBoom() {
  if (prefersReducedUiMotion()) return;
  try {
    const ctx = getContext();
    const t0 = ctx.currentTime;
    const duration = 0.45;

    const noiseBuf = ctx.createBuffer(
      1,
      Math.floor(ctx.sampleRate * duration),
      ctx.sampleRate,
    );
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 1.8);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const band = ctx.createBiquadFilter();
    band.type = "lowpass";
    band.frequency.setValueAtTime(2800, t0);
    band.frequency.exponentialRampToValueAtTime(120, t0 + duration);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, t0);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    noise.connect(band);
    band.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.onended = () => {
      try {
        noise.disconnect();
        band.disconnect();
        noiseGain.disconnect();
      } catch {
        /* ignore */
      }
    };
    noise.start(t0);
    noise.stop(t0 + duration);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t0);
    osc.frequency.exponentialRampToValueAtTime(38, t0 + 0.35);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.28, t0);
    og.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
    osc.connect(og);
    og.connect(ctx.destination);
    osc.onended = () => {
      try {
        osc.disconnect();
        og.disconnect();
      } catch {
        /* ignore */
      }
    };
    osc.start(t0);
    osc.stop(t0 + 0.42);
  } catch {
    // Silently fail
  }
}

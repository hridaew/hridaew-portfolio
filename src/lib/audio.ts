import { isChoomThemeDocument, playChoomClick } from "@/lib/choomUiAudio";

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

let heroSketchPopAudio: HTMLAudioElement | null = null;

/** Preload hero sketch-orb pop (call once on home mount; play only inside user gestures). */
export function preloadHeroSketchPop() {
  if (typeof window === "undefined") return;
  if (heroSketchPopAudio) return;
  heroSketchPopAudio = new Audio("/assets/home/hero-sketch-pop.mp3");
  heroSketchPopAudio.volume = 0.38;
  heroSketchPopAudio.preload = "auto";
  heroSketchPopAudio.load();
}

export function playHeroSketchPop() {
  if (typeof window === "undefined") return;
  if (!heroSketchPopAudio) {
    heroSketchPopAudio = new Audio("/assets/home/hero-sketch-pop.mp3");
    heroSketchPopAudio.volume = 0.38;
  }
  heroSketchPopAudio.currentTime = 0;
  void heroSketchPopAudio.play().catch(() => {});
}

export function playClick() {
    if (typeof document !== "undefined" && isChoomThemeDocument()) {
        playChoomClick();
        return;
    }
    try {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.04);
    } catch {
        // Silently fail if audio isn't available
    }
}

export function playAlarm() {
    try {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(440, ctx.currentTime);

        // Oscillate between 440Hz and 880Hz
        for (let i = 0; i < 20; i++) {
            const t = ctx.currentTime + i * 0.1;
            osc.frequency.setValueAtTime(i % 2 === 0 ? 440 : 880, t);
        }

        const vol = 0.012;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime + 1.9);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2);
    } catch {
        // Silently fail
    }
}

/** Real asset boom for destroy cheat; falls back to synthetic if play fails. */
export function playDestroyBoom(preloaded?: HTMLAudioElement | null) {
    const audio = preloaded ?? new Audio("/assets/cheat-codes/boom.wav");
    audio.volume = 0.92;
    audio.currentTime = 0;
    void audio.play().catch(() => {
        playExplosionBoom();
    });
}

/** Short impact / explosion burst for destroy cheat (fallback when WAV missing / blocked). */
export function playExplosionBoom() {
    try {
        const ctx = getContext();
        const t0 = ctx.currentTime;
        const duration = 0.45;

        const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
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
        noiseGain.gain.setValueAtTime(0.22, t0);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
        noise.connect(band);
        band.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(t0);
        noise.stop(t0 + duration);

        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, t0);
        osc.frequency.exponentialRampToValueAtTime(38, t0 + 0.35);
        const og = ctx.createGain();
        og.gain.setValueAtTime(0.35, t0);
        og.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
        osc.connect(og);
        og.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.42);
    } catch {
        // Silently fail
    }
}

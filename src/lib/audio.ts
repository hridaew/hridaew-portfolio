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

export function playClick() {
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

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + 1.9);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 2);
    } catch {
        // Silently fail
    }
}

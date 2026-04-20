import { SKETCH_ORB_IMAGES } from "@/data/sketch-orb-images";

function runIdle(cb: () => void) {
  if (typeof window === "undefined") return;
  const ric = (window as unknown as { requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number })
    .requestIdleCallback;
  if (typeof ric === "function") {
    ric(cb, { timeout: 1500 });
    return;
  }
  window.setTimeout(cb, 250);
}

let started = false;

/** Preload + decode sketch-orb images so spawns don’t flash black on first use. */
export function preloadSketchOrbImages(opts?: { limit?: number }) {
  if (typeof window === "undefined") return;
  if (started) return;
  started = true;

  const limit = Math.max(1, Math.min(SKETCH_ORB_IMAGES.length, opts?.limit ?? SKETCH_ORB_IMAGES.length));
  const urls = SKETCH_ORB_IMAGES.slice(0, limit);

  runIdle(() => {
    for (const src of urls) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      // Hint decode without blocking; ok if unsupported.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      img.decode?.().catch(() => {});
    }
  });
}


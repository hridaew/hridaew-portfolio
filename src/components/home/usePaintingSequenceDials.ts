"use client";

import { useDialKit } from "dialkit";

export function usePaintingSequenceDials() {
  return useDialKit(
    "Domis pull-back",
    {
      canvas: {
        maxHeightVh: [88, 48, 100, 1],
        radius: [4, 0, 28, 1],
      },
      camera: {
        startSize: [0.58, 0.4, 0.8, 0.01],
        startX: [0.11, 0, 0.35, 0.01],
        startY: [0.07, 0, 0.3, 0.01],
      },
      scroll: {
        trackVh: [180, 100, 360, 10],
        holdStart: [0.18, 0.02, 0.45, 0.01],
        holdEnd: [0.16, 0.02, 0.45, 0.01],
        scrub: [0.12, 0, 0.45, 0.01],
      },
    },
    {
      id: "home-painting-domis-pullback",
      persist: true,
    },
  );
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Track progress → camera 0..1 (0 = tight on the hand, 1 = full arm). */
export function progressToPull(
  progress: number,
  holdStart: number,
  holdEnd: number,
) {
  const p = clamp01(progress);
  const start = holdStart;
  const end = Math.max(start + 0.04, 1 - holdEnd);
  if (p <= start) return 0;
  if (p >= end) return 1;
  const t = (p - start) / (end - start);
  return t * t * (3 - 2 * t);
}

"use client";

import { useDialKit } from "dialkit";

export function usePaintingSequenceDials() {
  return useDialKit(
    "Domis → Obscura",
    {
      canvas: {
        maxHeightVh: [88, 48, 100, 1],
        radius: [4, 0, 28, 1],
      },
      scroll: {
        trackVh: [240, 120, 480, 10],
        holdDomis: [0.28, 0.05, 0.55, 0.01],
        holdObscura: [0.22, 0.05, 0.55, 0.01],
        dissolve: [0.18, 0.05, 0.4, 0.01],
        scrub: [0.14, 0, 0.5, 0.01],
      },
    },
    {
      id: "home-painting-domis-obscura",
      persist: true,
    },
  );
}

export function progressToMix(
  progress: number,
  holdDomis: number,
  holdObscura: number,
) {
  const p = Math.min(1, Math.max(0, progress));
  const start = holdDomis;
  const end = Math.max(start + 0.04, 1 - holdObscura);
  if (p <= start) return 0;
  if (p >= end) return 1;
  return (p - start) / (end - start);
}

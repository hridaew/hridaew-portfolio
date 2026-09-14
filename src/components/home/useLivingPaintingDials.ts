"use client";

import { useDialKit } from "dialkit";

export function useLivingPaintingDials() {
  return useDialKit(
    "Living painting",
    {
      canvas: {
        maxHeightVh: [88, 48, 100, 1],
        radius: [4, 0, 28, 1],
        lift: [0.12, 0, 0.45, 0.005],
      },
      paint: {
        displace: [0.2, 0, 0.55, 0.005],
        zoom: [1.03, 1, 1.28, 0.005],
        vignette: [0.14, 0, 0.45, 0.005],
        light: [0.28, 0, 0.8, 0.01],
      },
      motion: {
        tilt: [0.07, 0, 0.22, 0.005],
        follow: [0.07, 0.02, 0.2, 0.005],
        idle: true,
        idleAmount: [0.7, 0, 1.5, 0.01],
        idleSpeed: [0.32, 0.05, 1.4, 0.01],
      },
    },
    {
      id: "home-living-painting",
      persist: true,
    },
  );
}

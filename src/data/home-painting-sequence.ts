export const PAINTING_FRAMES = [
  {
    src: "/assets/home/painting/00-source.webp",
    alt: "Acrylic painting of a sculptural figure seen from behind, by Hridae Walia",
  },
  {
    src: "/assets/home/painting/01-domis.webp",
    alt: "The same painting: a sculptural hand holding a phone with a home-maintenance app",
  },
  {
    src: "/assets/home/painting/02-morph-zoom-out.webp",
    alt: "The painting zooming out from the hand toward a full figure",
  },
  {
    src: "/assets/home/painting/03-virdio.webp",
    alt: "The same painting: the figure in a squat between two purple traffic cones",
  },
  {
    src: "/assets/home/painting/04-morph-turn.webp",
    alt: "The painting turning from the back toward a headset in profile",
  },
  {
    src: "/assets/home/painting/05-obscura.webp",
    alt: "The same painting: a sculptural face wearing a VR headset, hands on either side",
  },
  {
    src: "/assets/home/painting/06-morph-orbit.webp",
    alt: "The painting orbiting behind the head as a screen appears",
  },
  {
    src: "/assets/home/painting/07-mces.webp",
    alt: "The same painting: the figure from behind looking at a large glowing screen",
  },
] as const;

export const PAINTING_MAPS = {
  brush: "/assets/home/painting/brush-map.webp",
  displace: "/assets/home/painting/displace-map.webp",
  weave: "/assets/home/painting/weave.webp",
} as const;

export type PaintingChapterSlug =
  | "domis"
  | "virdio"
  | "obscura"
  | "memory-care";

export interface PaintingChapter {
  slug: PaintingChapterSlug;
  short: string;
  href: `/${PaintingChapterSlug}`;
  kicker: string;
  /** Inclusive start of overlay visibility along the 0–1 painting progress. */
  from: number;
  /** Exclusive end of overlay visibility. */
  until: number;
  /** Scroll target in the hold of this chapter. */
  holdProgress: number;
}

export const PAINTING_CHAPTERS: PaintingChapter[] = [
  {
    slug: "domis",
    short: "Domis",
    href: "/domis",
    kicker: "01",
    from: 0.1,
    until: 0.38,
    holdProgress: 0.22,
  },
  {
    slug: "virdio",
    short: "Virdio",
    href: "/virdio",
    kicker: "02",
    from: 0.38,
    until: 0.64,
    holdProgress: 0.48,
  },
  {
    slug: "obscura",
    short: "Obscura",
    href: "/obscura",
    kicker: "03",
    from: 0.64,
    until: 0.86,
    holdProgress: 0.74,
  },
  {
    slug: "memory-care",
    short: "MCES",
    href: "/memory-care",
    kicker: "04",
    from: 0.86,
    until: 1.001,
    holdProgress: 0.96,
  },
];

/** progress 0–1 → frame index 0–7 (floats during morphs). */
const FRAME_KEYS: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0],
  [0.06, 0],
  [0.16, 1],
  [0.3, 1],
  [0.36, 2],
  [0.42, 3],
  [0.56, 3],
  [0.63, 4],
  [0.7, 5],
  [0.82, 5],
  [0.88, 6],
  [0.94, 7],
  [1.0, 7],
];

export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function paintingProgressToFrame(progress: number): number {
  const t = clamp01(progress);
  for (let i = 1; i < FRAME_KEYS.length; i++) {
    if (t <= FRAME_KEYS[i][0]) {
      const [p0, f0] = FRAME_KEYS[i - 1];
      const [p1, f1] = FRAME_KEYS[i];
      const u = p1 === p0 ? 0 : (t - p0) / (p1 - p0);
      return f0 + (f1 - f0) * u;
    }
  }
  return FRAME_KEYS[FRAME_KEYS.length - 1][1];
}

export function paintingChapterFromProgress(
  progress: number,
): PaintingChapter | null {
  const t = clamp01(progress);
  if (t < 0.08) return null;
  return (
    PAINTING_CHAPTERS.find((ch) => t >= ch.from && t < ch.until) ??
    PAINTING_CHAPTERS[PAINTING_CHAPTERS.length - 1]
  );
}

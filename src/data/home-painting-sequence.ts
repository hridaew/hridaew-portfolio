/**
 * Sequence we are building one transition at a time.
 *
 * ① Domis is the painting you meet first (hand + phone).
 * Then one scroll cut: Domis → Obscura (headset, facing camera, clothed).
 *
 * Later, only the next beat — Virdio, then MCES. Not the whole film.
 */
export const PAINTING_SEQUENCE = [
  {
    id: "domis",
    src: "/assets/home/painting/01-domis.webp",
    label: "Domis",
    alt: "Acrylic painting of a hand holding a phone with a home-maintenance app",
  },
  {
    id: "obscura",
    src: "/assets/home/painting/03-obscura.webp",
    label: "Obscura",
    alt: "Acrylic painting of a face wearing a VR headset, hands on either side",
  },
] as const;

/** One brush map per transition. Index 0 = Domis → Obscura. */
export const PAINTING_BRUSH_MAPS = [
  "/assets/home/painting/brush-map-domis.webp",
] as const;

/** Canvas-weave grain from the original Mighty Hand, mixed into every cut. */
export const PAINTING_GRAIN_MAP = "/assets/home/painting/brush-map.webp";

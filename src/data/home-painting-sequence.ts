/**
 * Sequence we are building one transition at a time.
 *
 * Now: ① Domis (hand + phone) → ③ Obscura (headset, facing camera).
 * Later: Virdio, MCES. All figures clothed, unsexual, storyboard-true.
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

export const PAINTING_BRUSH_MAP = "/assets/home/painting/brush-map.webp";

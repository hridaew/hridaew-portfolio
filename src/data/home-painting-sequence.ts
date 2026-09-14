/**
 * Sequence we are building one increment at a time.
 *
 * Now: Domis only — camera PULLS BACK from the hand+phone to reveal the
 * forearm. Not a crossfade. Obscura is not in this pass.
 */
export const DOMIS_PULLBACK = {
  src: "/assets/home/painting/domis-pullback.webp",
  label: "Domis",
  alt: "Acrylic painting of a hand holding a phone; camera pulls back along the arm",
  /**
   * Start crop as fractions of the plate (3:4). Camera interpolates this
   * rectangle to the full painting.
   */
  startCrop: {
    x: 0.11,
    y: 0.07,
    size: 0.58,
  },
} as const;

/**
 * Sequence we are building one increment at a time.
 *
 * Now: Domis pull-back continues — tight on the hand+phone, camera dollies
 * back until we see the clothed torso still holding the phone.
 * Glass is the real Domis home-tab screenshot.
 * Not a crossfade. Headset / Obscura is the next increment.
 */
export const DOMIS_PULLBACK = {
  src: "/assets/home/painting/domis-pullback.webp",
  label: "Domis",
  alt: "Acrylic painting of a hand holding a phone showing the Domis home tab",
  /**
   * Start crop as fractions of the plate (3:4). Camera interpolates this
   * rectangle to the full painting.
   */
  startCrop: {
    x: 0.16,
    y: 0.055,
    size: 0.5,
  },
} as const;

/** Resolved sheet layout (previously tuned via DialKit; now fixed for production). */
export type ButterChickenRecipeModalDial = {
  modal: {
    maxWidthPx: number;
    maxHeightVh: number;
    maxHeightCapPx: number;
  };
};

/** Defaults match prior DialKit first-tuple values in `butterChickenRecipeModalDialConfig`. */
export const BUTTER_CHICKEN_MODAL_DIAL_DEFAULTS: ButterChickenRecipeModalDial = {
  modal: {
    maxWidthPx: 864,
    maxHeightVh: 91,
    maxHeightCapPx: 1200,
  },
};

/** Page shell blur (GSAP) — tuned to feel close to paired iOS dim. */
export const BUTTER_CHICKEN_SHELL_GSAP = {
  blurPx: 22,
  scaleDown: 0.97,
  openDuration: 0.26,
  closeDuration: 0.32,
} as const;

/** Backdrop: quick ease-out dim. */
const IOS_BACKDROP_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

/**
 * Sheet spring for transform on **open**.
 * Do not animate `opacity` or `filter` on the glass layer: those tweens finish before
 * the scale/y spring, and when Framer clears inline `filter`/`opacity` the browser
 * recomposites `backdrop-filter` + translucent fill — reads as a sudden “opacity pop”.
 */
const SHEET_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.94,
} as const;

export function buildButterChickenModalMotion(d: ButterChickenRecipeModalDial) {
  return {
    modal: {
      maxWidthPx: d.modal.maxWidthPx,
      maxHeightVh: d.modal.maxHeightVh,
      maxHeightCapPx: d.modal.maxHeightCapPx,
    },
    backdropTransition: {
      duration: 0.26,
      ease: IOS_BACKDROP_EASE,
    },
    backdropExitTransition: {
      duration: 0.24,
      ease: IOS_BACKDROP_EASE,
    },
    sheetInitial: {
      scale: 0.92,
      y: 20,
    },
    sheetAnimate: {
      scale: 1,
      y: 0,
    },
    sheetTransition: SHEET_SPRING,
    sheetExit: {
      opacity: 0,
      scale: 0.94,
      y: 12,
      filter: "blur(5px)",
      transition: {
        y: SHEET_SPRING,
        scale: SHEET_SPRING,
        opacity: { type: "tween" as const, duration: 0.2, ease: IOS_BACKDROP_EASE },
        filter: { type: "tween" as const, duration: 0.2, ease: IOS_BACKDROP_EASE },
      },
    },
  };
}

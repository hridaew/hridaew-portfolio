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
  blurPx: 12,
  scaleDown: 0.97,
  openDuration: 0.26,
  closeDuration: 0.32,
} as const;

/** Sheet spring (no shared `layoutId` — avoids shell/portal/transform conflicts). */
const SHEET_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.94,
};

/** Backdrop: quick ease-out dim. */
const IOS_BACKDROP_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

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
      opacity: 0,
      scale: 0.92,
      y: 20,
      filter: "blur(6px)",
    },
    sheetAnimate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    sheetTransition: SHEET_SPRING,
    sheetExit: {
      opacity: 0,
      scale: 0.94,
      y: 12,
      filter: "blur(5px)",
      transition: SHEET_SPRING,
    },
  };
}

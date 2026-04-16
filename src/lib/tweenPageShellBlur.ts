import gsap from "gsap";
import { BUTTER_CHICKEN_SHELL_GSAP } from "@/components/butter-chicken/butterChickenRecipeModalMotionFromDial";

export const PAGE_TRANSITION_SHELL_SELECTOR = "[data-page-transition-shell]";

export type TweenPageShellBlurOptions = {
  /**
   * Called every GSAP update while the shell tweens. Use this to keep UI
   * (e.g. a portaled hero) aligned with in-flow anchors inside the scaled shell.
   */
  onUpdate?: () => void;
  /**
   * When true, only blur is tweened; `scale` stays at 1 so in-flow layout (and
   * portaled UI keyed to anchor rects) does not drift during the hero expand.
   */
  omitScale?: boolean;
  /**
   * Jump to the target blur/scale with no animation. Use when a portaled surface
   * uses `backdrop-filter`: a tweening `filter` on the shell behind it changes what
   * the backdrop samples, so the glass appears to “shift blur” even if the card’s
   * own `backdrop-blur` is constant.
   */
  instant?: boolean;
};

/** Page shell blur + slight scale (same tuning as butter-chicken modal). */
export function tweenPageShellBlur(
  active: boolean,
  opts?: TweenPageShellBlurOptions
) {
  const el = document.querySelector(PAGE_TRANSITION_SHELL_SELECTOR);
  if (!el) return;
  const { blurPx, scaleDown, openDuration, closeDuration } = BUTTER_CHICKEN_SHELL_GSAP;
  const { onUpdate, omitScale, instant } = opts ?? {};
  const useScale = !omitScale;
  gsap.killTweensOf(el);

  if (instant) {
    gsap.set(el, {
      scale: useScale ? (active ? scaleDown : 1) : 1,
      filter: active ? `blur(${blurPx}px)` : "blur(0px)",
    });
    onUpdate?.();
    if (!active) {
      gsap.set(el, { clearProps: "filter,scale" });
    }
    return;
  }

  gsap.to(el, {
    scale: useScale ? (active ? scaleDown : 1) : 1,
    filter: active ? `blur(${blurPx}px)` : "blur(0px)",
    duration: active ? openDuration : closeDuration,
    ease: "power3.out",
    onUpdate: () => {
      onUpdate?.();
    },
    onComplete: () => {
      onUpdate?.();
      if (!active) {
        gsap.set(el, { clearProps: "filter,scale" });
      }
    },
  });
}

/** Instant reset if a tween was killed mid-flight (avoids stuck page blur). */
export function resetPageShellBlurHard() {
  const el = document.querySelector(PAGE_TRANSITION_SHELL_SELECTOR);
  if (!el) return;
  gsap.killTweensOf(el);
  gsap.set(el, { clearProps: "filter,scale" });
}

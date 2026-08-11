"use client";

import { cn } from "@/lib/utils";

/**
 * Rim stroke, eased + lightly blurred so the edge isn't banded.
 *
 * On paper the readable edge cue is the shaded lower lip, not a specular top
 * highlight — light from above leaves the top edge indistinguishable from the
 * surface, so the gradient runs faint-ink upward instead of white downward.
 */
export const SKEUOMORPHIC_RIM_GRADIENT =
  "linear-gradient(0deg, rgb(var(--ink-rgb) / 0.1) 0px, rgb(var(--ink-rgb) / 0.07) 4px, rgb(var(--ink-rgb) / 0.045) 9px, rgb(var(--ink-rgb) / 0.025) 14px, rgb(var(--ink-rgb) / 0.012) 19px, rgb(var(--ink-rgb) / 0) 26px, rgb(var(--ink-rgb) / 0) 100%)";

const SKEUOMORPHIC_RIM_MASK = {
  WebkitMask:
    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)" as const,
  WebkitMaskComposite: "xor" as const,
  mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)" as const,
  maskComposite: "exclude" as const,
};

export function SkeuomorphicRim({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-3xl p-[0.9px]",
        className
      )}
      style={{
        background: SKEUOMORPHIC_RIM_GRADIENT,
        ...SKEUOMORPHIC_RIM_MASK,
        filter: "blur(0.3px)",
        transform: "translateZ(0)",
      }}
    />
  );
}

"use client";

import { cn } from "@/lib/utils";

/** Top rim: eased multi-stop gradient + light blur so the stroke is not banded */
export const SKEUOMORPHIC_RIM_GRADIENT =
  "linear-gradient(180deg, hsla(0, 0%, 100%, 0.14) 0px, hsla(0, 0%, 100%, 0.28) 4px, hsla(0, 0%, 100%, 0.2) 9px, hsla(0, 0%, 100%, 0.1) 14px, hsla(0, 0%, 100%, 0.04) 19px, hsla(0, 0%, 100%, 0.012) 23px, hsla(0, 0%, 100%, 0) 28px, hsla(0, 0%, 100%, 0) 100%)";

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

import { cn } from "@/lib/utils";

/**
 * Shared glass chrome for case-study bottom close + project pill.
 * Uses `html.dark` (Obscura) for theme; light case studies stay on the default branch.
 */
export const caseStudyFloatGlass = cn(
  "rounded-full border backdrop-blur-xl backdrop-saturate-150",
  "bg-white/[0.78] border-neutral-900/[0.08]",
  "shadow-[0_4px_24px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.65)]",
  "hover:bg-white/[0.88] hover:border-neutral-900/[0.1]",
  "dark:bg-neutral-950/[0.78] dark:border-white/[0.14]",
  "dark:shadow-[0_4px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]",
  "dark:hover:bg-neutral-950/[0.88] dark:hover:border-white/[0.18]"
);

/** Label + icons: readable on light; on dark, plus-lighter helps sit on noisy / video backgrounds */
export const caseStudyFloatForeground = cn(
  "type-caption-medium text-neutral-700",
  "dark:text-neutral-100 dark:mix-blend-plus-lighter"
);

export const caseStudyFloatIconStroke = cn(
  "text-neutral-600 dark:text-neutral-100 dark:mix-blend-plus-lighter"
);

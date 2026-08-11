import { cn } from "@/lib/utils";

/** Shared glass chrome for the case-study bottom close button + project pill. */
export const caseStudyFloatGlass = cn(
  "rounded-full border backdrop-blur-xl backdrop-saturate-150",
  "bg-paper-raised/[0.78] border-ink/[0.08] shadow-e2",
  "transition-colors duration-150",
  "hover:bg-paper-raised/[0.9] hover:border-ink/[0.12]"
);

export const caseStudyFloatForeground = "type-caption-medium text-ink-secondary";

export const caseStudyFloatIconStroke = "text-ink-muted";

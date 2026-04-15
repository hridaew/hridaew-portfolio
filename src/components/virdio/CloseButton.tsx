"use client";

import { motion } from "framer-motion";
import { usePageTransition } from "@/components/PageTransition";
import { cn } from "@/lib/utils";
import {
  caseStudyFloatGlass,
  caseStudyFloatIconStroke,
} from "@/components/shared/caseStudyFloatChrome";

const goopySpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 13,
  mass: 0.85,
};

const goopyRelease = {
  type: "spring" as const,
  stiffness: 380,
  damping: 18,
  mass: 0.75,
};

type CaseStudyCloseControlProps = {
    /** When set (e.g. modal), runs instead of navigating home via page transition */
    onClick?: () => void;
};

/** Compact close control for the case-study bottom bar (left of project pill). */
export function CaseStudyCloseControl({ onClick }: CaseStudyCloseControlProps) {
    const { transitionTo } = usePageTransition();

    return (
        <button
            type="button"
            onClick={() => (onClick ? onClick() : transitionTo("/"))}
            aria-label={onClick ? "Close" : "Back to home"}
      className="shrink-0"
    >
      <motion.div
        className={cn(
          caseStudyFloatGlass,
          "flex size-11 items-center justify-center cursor-pointer origin-center"
        )}
        initial={false}
        whileHover={{
          scale: 1.12,
          transition: goopySpring,
        }}
        whileTap={{
          scale: 0.86,
          transition: {
            type: "spring",
            stiffness: 520,
            damping: 22,
            mass: 0.55,
          },
        }}
        transition={goopyRelease}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={caseStudyFloatIconStroke}
          aria-hidden
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </button>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { gridProjects } from "@/data/project-grid";
import { usePageTransition } from "@/components/PageTransition";
import { playClick } from "@/lib/audio";
import { CaseStudyCloseControl } from "@/components/virdio/CloseButton";
import { cn } from "@/lib/utils";
import {
  caseStudyFloatGlass,
  caseStudyFloatForeground,
  caseStudyFloatIconStroke,
} from "@/components/shared/caseStudyFloatChrome";

interface CaseStudyPillProps {
  projectSlug: string;
}

export function CaseStudyPill({ projectSlug }: CaseStudyPillProps) {
  const { transitionTo } = usePageTransition();
  const [atEnd, setAtEnd] = useState(false);
  const [visible, setVisible] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const currentIndex = gridProjects.findIndex((p) => p.slug === projectSlug);
  const current = gridProjects[currentIndex];
  const next = gridProjects[(currentIndex + 1) % gridProjects.length];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setAtEnd(maxScroll > 0 && window.scrollY >= maxScroll - 200);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!current || !next) return null;

  const handleNext = () => {
    playClick();
    transitionTo(next.href);
  };

  const enterExit = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.25, 1, 0.5, 1] as const };
  // mode="wait" nearly doubles perceived time — keep each leg at 0.12s
  const labelSwap = reduceMotion
    ? { duration: 0 }
    : { duration: 0.12, ease: [0.25, 1, 0.5, 1] as const };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={pillRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={enterExit}
          className="fixed bottom-6 left-1/2 z-50 isolate -translate-x-1/2"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute right-full top-1/2 mr-2 sm:mr-3 -translate-y-1/2">
              <CaseStudyCloseControl />
            </div>

            <motion.button
              layout
              type="button"
              onClick={atEnd ? handleNext : undefined}
              className={cn(
                caseStudyFloatGlass,
                "flex h-11 min-h-11 items-center gap-2 px-5",
                atEnd ? "cursor-pointer" : "cursor-default"
              )}
              transition={{
                layout: reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
              }}
              whileTap={atEnd && !reduceMotion ? { scale: 0.97 } : undefined}
            >
              <AnimatePresence mode="wait" initial={false}>
                {atEnd ? (
                  <motion.span
                    key="next"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={labelSwap}
                    className={cn(
                      caseStudyFloatForeground,
                      "flex items-center gap-2 whitespace-nowrap"
                    )}
                  >
                    Next: {next.title}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className={cn(caseStudyFloatIconStroke, "shrink-0")}
                      aria-hidden
                    >
                      <path
                        d="M5.25 3.5L8.75 7L5.25 10.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.span>
                ) : (
                  <motion.span
                    key="current"
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={labelSwap}
                    className={cn(caseStudyFloatForeground, "whitespace-nowrap")}
                  >
                    {current.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

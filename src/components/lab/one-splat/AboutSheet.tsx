"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HeroCardExpandedBody } from "@/components/home/HeroCardExpandedBody";
import styles from "./OneSplat.module.css";

/**
 * The hero card's expanded content (about, experience, education, top 3) in a sheet that slides in
 * from the left, a mirror of the case-study sheet that comes in from the right.
 */
export function AboutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const restore = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      restore?.focus?.();
    };
  }, [open, onClose]);

  const enter = reduceMotion ? { duration: 0.12 } : { duration: 0.24, ease: [0.32, 0.72, 0, 1] as const };
  const exit = { duration: reduceMotion ? 0.1 : 0.18, ease: [0.4, 0, 1, 1] as const };

  return (
    <AnimatePresence>
      {open ? (
        <div className={styles.sheetRoot} role="presentation" key="about-sheet">
          <motion.button
            type="button"
            aria-label="Close about"
            className={styles.sheetBackdrop}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.16, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.14, ease: "easeIn" } }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={styles.sheetPanel}
            initial={{ x: "-100%" }}
            animate={{ x: 0, transition: enter }}
            exit={{ x: "-100%", transition: exit }}
          >
            <header className={styles.sheetHeader}>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className={styles.sheetClose}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                  <path d="M3.5 3.5L11.5 11.5M11.5 3.5L3.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <p id={titleId} className={styles.sheetTitle}>
                About
              </p>
            </header>
            <div className={styles.sheetBody} data-testid="about-sheet-scroll" data-lenis-prevent>
              <HeroCardExpandedBody />
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

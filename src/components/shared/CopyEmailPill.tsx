"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL } from "@/lib/contactEmail";
import { CHOOM } from "@/lib/homeChoomCopy";
import { useChoomLingo } from "@/components/home/HomeChoomLingoContext";

export { CONTACT_EMAIL };

const COPY_TOAST_MS = 1800;

type CopyEmailPillProps = {
  className?: string;
};

export function CopyEmailPill({ className }: CopyEmailPillProps) {
  const choom = useChoomLingo();
  const [showCopied, setShowCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = CONTACT_EMAIL;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    setShowCopied(true);
    copiedTimerRef.current = setTimeout(() => setShowCopied(false), COPY_TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  return (
    <span className={cn("relative inline-block align-middle", className)}>
      <button
        type="button"
        onClick={copyEmail}
        aria-label={
          choom ? CHOOM.copyEmailAria : `Copy ${CONTACT_EMAIL}`
        }
        className="flex h-8 cursor-pointer items-center gap-1 rounded-[38px] bg-[#1c1c1c]/[0.045] pl-2 pr-1 transition-colors hover:bg-[#1c1c1c]/[0.08]"
      >
        <span
          className="font-[family-name:var(--font-geist)] text-xs leading-normal"
          style={{ color: "rgba(28,28,28,0.8)", mixBlendMode: "luminosity" }}
        >
          {CONTACT_EMAIL}
        </span>
        <div className="flex size-6 items-center justify-center rounded-full bg-[#1c1c1c]/[0.06]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path
              d="M7.5 3.75V2.5C7.5 1.81 6.94 1.25 6.25 1.25H2.5C1.81 1.25 1.25 1.81 1.25 2.5V6.25C1.25 6.94 1.81 7.5 2.5 7.5H3.75M3.75 3.75H7.5C8.19 3.75 8.75 4.31 8.75 5V7.5C8.75 8.19 8.19 8.75 7.5 8.75H5C4.31 8.75 3.75 8.19 3.75 7.5V3.75Z"
              stroke="#1c1c1c"
              strokeOpacity="0.8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ mixBlendMode: "luminosity" }}
            />
          </svg>
        </div>
      </button>
      <AnimatePresence>
        {showCopied && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{
              duration: 0.2,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#1c1c1c]/[0.1] bg-[#1c1c1c]/[0.08] px-3 py-1 text-xs backdrop-blur-xl"
            style={{ color: "rgba(28,28,28,0.8)", mixBlendMode: "luminosity" }}
          >
            Copied!
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

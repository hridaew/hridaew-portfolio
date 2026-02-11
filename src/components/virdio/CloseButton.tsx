"use client";

import { motion } from "framer-motion";
import { usePageTransition } from "@/components/PageTransition";

interface CloseButtonProps {
  variant?: "light" | "dark";
}

export function CloseButton({ variant = "light" }: CloseButtonProps) {
  const { transitionTo } = usePageTransition();
  const isLight = variant === "light";

  return (
    <button onClick={() => transitionTo("/")} aria-label="Back to home">
      <motion.div
        className={`fixed top-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer ${
          isLight
            ? "bg-white/40 border border-white/30"
            : "bg-white/10 border border-white/10"
        }`}
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: isLight
            ? "0 2px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -0.5px 0 rgba(0,0,0,0.04)"
            : "0 2px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
        whileHover={{
          scale: 1.12,
          backgroundColor: isLight
            ? "rgba(255,255,255,0.65)"
            : "rgba(255,255,255,0.2)",
          boxShadow: isLight
            ? "0 4px 28px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -0.5px 0 rgba(0,0,0,0.04)"
            : "0 4px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
        whileTap={{ scale: 0.88 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 22,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={isLight ? "text-neutral-500" : "text-neutral-300"}
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

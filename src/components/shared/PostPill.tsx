"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaseStudyCloseControl } from "@/components/virdio/CloseButton";
import { cn } from "@/lib/utils";
import {
  caseStudyFloatGlass,
  caseStudyFloatForeground,
} from "@/components/shared/caseStudyFloatChrome";

export function PostPill({ title, onClose }: { title: string; onClose?: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
          className="fixed bottom-6 left-1/2 z-50 isolate -translate-x-1/2"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute right-full top-1/2 mr-2 sm:mr-3 -translate-y-1/2">
              <CaseStudyCloseControl onClick={onClose} />
            </div>

            <div
              className={cn(
                caseStudyFloatGlass,
                "flex h-11 min-h-11 items-center px-5 cursor-default"
              )}
            >
              <span
                className={cn(
                  caseStudyFloatForeground,
                  "whitespace-nowrap"
                )}
              >
                {title}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


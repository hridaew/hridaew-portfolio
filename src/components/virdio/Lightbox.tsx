"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface LightboxContextType {
  open: (src: string, alt: string) => void;
  close: () => void;
}

const LightboxContext = createContext<LightboxContextType | null>(null);

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useLightbox must be used within a LightboxProvider");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// LightboxOverlay (internal)
// ---------------------------------------------------------------------------

function LightboxOverlay({
  isOpen,
  src,
  alt,
  onClose,
}: {
  isOpen: boolean;
  src: string | null;
  alt: string;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && src && (
        <>
          {/* Backdrop */}
          <motion.div
            key="lightbox-backdrop"
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Image container — uses most of the viewport; object-contain shows the full image */}
          <motion.div
            key="lightbox-container"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 md:p-10 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))] [padding-top:max(1rem,env(safe-area-inset-top))] [padding-bottom:max(1rem,env(safe-area-inset-bottom))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
          >
            {/* Native img only (no radius/shadow/transform) so bitmap edges stay clean */}
            <img
              src={src}
              alt={alt}
              className="pointer-events-auto m-0 block h-auto w-auto max-h-[min(92dvh,92vh)] max-w-[min(96vw,1680px)] border-0 object-contain p-0 shadow-none outline-none ring-0"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
              decoding="async"
            />

            {/* Close button */}
            <motion.button
              className="absolute top-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] right-[max(1rem,calc(env(safe-area-inset-right)+0.5rem))] w-10 h-10 rounded-full bg-ink/[0.05] backdrop-blur-md flex items-center justify-center cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              aria-label="Close lightbox"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6L18 18" />
              </svg>
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// LightboxProvider
// ---------------------------------------------------------------------------

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSrc, setActiveSrc] = useState<string | null>(null);
  const [activeAlt, setActiveAlt] = useState("");

  const open = useCallback((src: string, alt: string) => {
    setActiveSrc(src);
    setActiveAlt(alt);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing src so exit animation can play with the image still visible
    setTimeout(() => {
      setActiveSrc(null);
      setActiveAlt("");
    }, 400);
  }, []);

  return (
    <LightboxContext.Provider value={{ open, close }}>
      {children}
      <LightboxOverlay
        isOpen={isOpen}
        src={activeSrc}
        alt={activeAlt}
        onClose={close}
      />
    </LightboxContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// LightboxImage
// ---------------------------------------------------------------------------

export function LightboxImage({
  className,
  src,
  alt,
  hoverScale = 0.98,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { hoverScale?: number }) {
  const { open } = useLightbox();

  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn("block cursor-zoom-in", className)}
      whileHover={
        hoverScale === 1 ? undefined : { scale: hoverScale }
      }
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() => {
        if (typeof src === "string" && alt !== undefined) {
          open(src, alt ?? "");
        }
      }}
      {...(props as any)}
    />
  );
}

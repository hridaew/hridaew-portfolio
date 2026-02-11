"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LightboxImage } from "@/components/virdio/Lightbox";

const GALLERY_IMAGES = [
  { src: "/assets/virdio/pushup_ar.png", alt: "Push-up with AR tracking overlay" },
  { src: "/assets/virdio/bpu_ar.png", alt: "Barbell push-up with AR overlay" },
  { src: "/assets/virdio/ar_class_live.png", alt: "Live AR fitness class in session" },
  { src: "/assets/virdio/split_squat_ar.png", alt: "Split squat AR exercise view" },
  { src: "/assets/virdio/hurdles_ar.png", alt: "Virtual hurdles AR exercise" },
  { src: "/assets/virdio/bss_ar.png", alt: "Bulgarian split squat AR tracking" },
  { src: "/assets/virdio/ar_class_overlay.png", alt: "AR class with form tracking overlay" },
  { src: "/assets/virdio/pushup_ar_2.png", alt: "Push-up AR alternate angle" },
  { src: "/assets/virdio/split_squat_ar_2.png", alt: "Split squat AR variation" },
  { src: "/assets/virdio/hurdles_ar_2.png", alt: "Virtual hurdles AR alternate view" },
  { src: "/assets/virdio/bss_ar_2.png", alt: "Bulgarian split squat AR alternate" },
  { src: "/assets/virdio/ar_workout_ui.png", alt: "AR workout interface with stats" },
  { src: "/assets/virdio/split_squat_ar_3.png", alt: "Split squat AR close-up" },
  { src: "/assets/virdio/ar_split_squat.png", alt: "AR split squat variation" },
  { src: "/assets/virdio/bpu_a1.png", alt: "Barbell push-up exercise frame A" },
  { src: "/assets/virdio/bpu_a1_alt.png", alt: "Barbell push-up exercise frame A alternate" },
  { src: "/assets/virdio/bpu_b1.png", alt: "Barbell push-up exercise frame B" },
  { src: "/assets/virdio/bss_a1.png", alt: "Bulgarian split squat frame A" },
  { src: "/assets/virdio/bss_a1_alt.png", alt: "Bulgarian split squat frame A alternate" },
  { src: "/assets/virdio/bss_b1.png", alt: "Bulgarian split squat frame B" },
  { src: "/assets/virdio/pushup_a1.png", alt: "Push-up exercise frame A" },
  { src: "/assets/virdio/pushup_a1_alt.png", alt: "Push-up exercise frame A alternate" },
  { src: "/assets/virdio/pushup_b1.png", alt: "Push-up exercise frame B" },
];

const AUTO_ADVANCE_MS = 4000;
const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

interface ARMosaicProps {
  className?: string;
}

export function ARMosaic({ className }: ARMosaicProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = GALLERY_IMAGES.length;

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(((index % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, AUTO_ADVANCE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, next]);

  // Swipe / drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    dragStartRef.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) next();
      else prev();
    }
  }, [next, prev]);

  const img = GALLERY_IMAGES[current];

  return (
    <section className={cn("w-full", className)}>
      <div className="text-center mb-8 md:mb-10">
        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-400 tracking-[0.08em] uppercase">
          The AR Exercise Library
        </p>
      </div>

      <div
        className="relative max-w-[900px] mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Image container */}
        <div
          className="relative overflow-hidden rounded-2xl bg-neutral-900 aspect-video"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <LightboxImage
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Left arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer"
            aria-label="Previous image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors cursor-pointer"
            aria-label="Next image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {current + 1} / {total}
          </div>
        </div>

        {/* Dot indicators — compact, scrollable if needed */}
        <div className="flex justify-center gap-1.5 mt-4 flex-wrap max-w-[400px] mx-auto">
          {GALLERY_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer",
                i === current ? "bg-neutral-900 scale-110" : "bg-neutral-300 hover:bg-neutral-400"
              )}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionTemplate, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";

interface AlbumProps {
  title: string;
  frontSrc: string;
  backSrc: string;
  /** Pass a centralized layout ID prefix to prevent collisions */
  layoutIdBase: string;
}

const SPRING_OPT = { mass: 0.6, stiffness: 120, damping: 18 };

function ParallaxAlbumCard({
  frontSrc,
  backSrc,
  title,
  isFlipped,
  reduceMotion,
  isFocused,
  layoutIdBase,
}: {
  frontSrc: string;
  backSrc: string;
  title: string;
  isFlipped: boolean;
  reduceMotion: boolean | null;
  isFocused: boolean;
  layoutIdBase: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Dummy simple tilt and glare
  const rotateX = useSpring(0, SPRING_OPT);
  const rotateY = useSpring(0, SPRING_OPT);
  const glareX = useSpring(50, { mass: 0.5, stiffness: 200, damping: 20 });
  const glareY = useSpring(50, { mass: 0.5, stiffness: 200, damping: 20 });
  
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, transparent 80%)`;
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    // Normalized from -0.5 to 0.5 (center is 0)
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;

    // Simple robust multiplier for push tilt (e.g. 20 degrees max)
    rotateY.set(xPct * 20); 
    rotateX.set(yPct * -20);

    glareX.set((xPct + 0.5) * 100);
    glareY.set((yPct + 0.5) * 100);
  };

  const handlePointerLeave = () => {
    if (reduceMotion) return;
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`group relative size-full cursor-pointer perspective-1200`}
      whileHover={{ scale: isFocused && !reduceMotion ? 1.02 : 1, y: isFocused ? 0 : -8 }}
      whileTap={{ scale: reduceMotion ? 1 : 0.95 }}
      transition={{ type: "spring", mass: 0.5, stiffness: 200, damping: 20 }}
    >
      {/* Outer wrapper manages the 3D tilt tracking the mouse */}
      <motion.div
        className="relative size-full preserve-3d"
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
      >
        {/* Inner wrapper manages the 3D flip animation */}
        <motion.div
          className="relative size-full preserve-3d"
          animate={{
            rotateY: isFlipped ? -180 : 0
          }}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
          transition={{ 
            type: "spring", 
            duration: 1.8, 
            bounce: 0.12 
          }}
        >
          {/* Front Face */}
          <div 
            className="absolute inset-0 backface-hidden rounded-[4px] shadow-[0px_16px_32px_0px_rgba(0,0,0,0.4)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              alt={title}
              src={frontSrc}
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full rounded-[4px] object-cover"
            />
            {/* Premium Spotlight Glare effect */}
            {!reduceMotion && (
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-[4px] mix-blend-soft-light transition-opacity duration-500"
                style={{
                  background: glareBackground
                }}
              />
            )}
          </div>

          <div 
            className="absolute inset-0 backface-hidden rotate-y-180 rounded-[4px] shadow-[0px_16px_32px_0px_rgba(0,0,0,0.4)] bg-black"
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          >
            <img
              alt={`${title} - tracklist`}
              src={backSrc}
              draggable={false}
              className="pointer-events-none absolute inset-0 size-full rounded-[4px] object-cover"
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function AlbumArt({ title, frontSrc, backSrc, layoutIdBase }: AlbumProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    if (!isFocused) {
      setIsFocused(true);
      setIsFlipped(false);
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  const handleDismiss = () => {
    if (isFlipped) {
      // Flip back to front first, then close after the flip is well underway
      setIsFlipped(false);
      setTimeout(() => setIsFocused(false), 600);
    } else {
      setIsFocused(false);
    }
  };

  return (
    <>
      <div 
        className="group relative size-[178px] shrink-0 overflow-visible rounded-[2px]"
      >
        <span
          className="pointer-events-none absolute top-full left-1/2 z-[1] mt-3 max-w-[min(280px,calc(100vw-32px))] -translate-x-1/2 text-center font-[family-name:var(--font-geist-mono)] text-[10px] font-normal uppercase leading-tight tracking-wide text-white/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        >
          {title}
        </span>

        {/* Mini Grid Anchor — always mounted for correct layoutId target. Hidden behind modal. */}
        <motion.div
           layoutId={`${layoutIdBase}-container`}
           className="relative size-full"
           onClick={isFocused ? undefined : handleClick}
           transition={{ type: "spring", duration: 1.2, bounce: 0.15 }}
           style={{ opacity: isFocused ? 0 : 1, pointerEvents: isFocused ? "none" : "auto" }}
        >
             <ParallaxAlbumCard 
                title={title} 
                frontSrc={frontSrc} 
                backSrc={backSrc} 
                isFlipped={false}
                reduceMotion={reduceMotion}
                isFocused={false}
                layoutIdBase={layoutIdBase}
             />
        </motion.div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isFocused && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={handleDismiss}
              />
              <motion.div
                layoutId={`${layoutIdBase}-container`}
                className="relative z-10 size-[min(85vw,480px)] md:size-[600px] max-h-[85vh] aspect-square"
                onClick={handleClick}
                transition={{ type: "spring", duration: 1.2, bounce: 0.15 }}
              >
                <ParallaxAlbumCard 
                  title={title} 
                  frontSrc={frontSrc} 
                  backSrc={backSrc} 
                  isFlipped={isFlipped}
                  reduceMotion={reduceMotion}
                  isFocused={true}
                  layoutIdBase={layoutIdBase}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

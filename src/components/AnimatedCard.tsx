"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import Image from "next/image";
import { motion } from "framer-motion";

interface CardHandlers {
  xTo: gsap.QuickToFunc;
  yTo: gsap.QuickToFunc;
  el: HTMLDivElement;
}

interface AnimatedCardProps {
  src: string;
  title: string;
  slug: string;
  index: number;
  rotation: number;
  yOffset: number;
  isHovered: number | null;
  selectedCase: number | null;
  registerCard: (index: number, handlers: CardHandlers) => void;
  onHoverChange: (index: number | null) => void;
  onClick: () => void;
}

export function AnimatedCard({
  src,
  title,
  slug,
  index,
  rotation,
  yOffset,
  isHovered,
  selectedCase,
  registerCard,
  onHoverChange,
  onClick,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isThisHovered = isHovered === index;
  const isAnyHovered = isHovered !== null;
  const isSelected = selectedCase === index;

  // Register GSAP quickTo handlers
  useEffect(() => {
    if (!cardRef.current) return;

    // Create optimize setters for x/y
    const xTo = gsap.quickTo(cardRef.current, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(cardRef.current, "y", { duration: 0.6, ease: "power3" });

    registerCard(index, { xTo, yTo, el: cardRef.current });
  }, [index, registerCard]);

  // Handle scale/rotation/z-index state changes
  useEffect(() => {
    if (!cardRef.current || selectedCase !== null) return;

    const el = cardRef.current;
    const baseZ = index + 1; // unique base z-index per card

    if (isThisHovered) {
      // Hover ON: Scale up, straighten — set z-index instantly to avoid flickering
      gsap.set(el, { zIndex: 50 });
      gsap.to(el, {
        rotation: 0,
        scale: 1.15,
        duration: 0.45,
        ease: "back.out(1.4)",
        overwrite: "auto"
      });

    } else if (isAnyHovered) {
      gsap.set(el, { zIndex: baseZ });
      gsap.to(el, {
        scale: 1,
        rotation,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto"
      });
    } else {
      gsap.set(el, { zIndex: baseZ });
      gsap.to(el, {
        scale: 1,
        rotation,
        duration: 0.55,
        ease: "power2.out",
        overwrite: "auto"
      });
    }
  }, [isThisHovered, isAnyHovered, rotation, selectedCase, index]);

  // Tap/Click effects
  const handlePointerDown = () => {
    if (selectedCase !== null || !cardRef.current) return;
    gsap.to(cardRef.current, { scale: 0.97, duration: 0.1, ease: "power1.out" });
  };

  const handlePointerUp = () => {
    if (selectedCase !== null || !cardRef.current) return;
    const targetScale = isThisHovered ? 1.15 : 1;
    gsap.to(cardRef.current, { scale: targetScale, duration: 0.4, ease: "back.out(1.7)" });
  };

  // Entrance animation
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.9, y: 40 },
      {
        opacity: 1,
        scale: 1,
        y: yOffset, // This sets the INITIAL y. The RAF loop will take over shortly.
        rotation,
        duration: 0.8,
        delay: 0.3 + index * 0.1,
        ease: "back.out(1.7)",
      }
    );
  }, [index, rotation, yOffset]);

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 cursor-pointer relative opacity-0 will-change-transform rounded-[20px] md:rounded-[36px]"
      style={{ willChange: "transform", boxShadow: "0px 24px 64px 0px rgba(0,0,0,0.15)" }}
      onMouseEnter={() => selectedCase === null && onHoverChange(index)}
      onMouseLeave={() => selectedCase === null && onHoverChange(null)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={() => selectedCase === null && onClick()}
    >
      <motion.div
        layoutId={`card-image-${slug}`}
        ref={containerRef}
        className="relative rounded-[20px] md:rounded-[36px] w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] md:w-[220px] md:h-[220px] lg:w-[250px] lg:h-[250px] overflow-hidden"
      >
        <Image
          alt={title}
          className="absolute inset-0 object-cover"
          src={src}
          fill
          sizes="(max-width: 768px) 180px, (max-width: 1024px) 220px, 250px"
        />
        <div
          aria-hidden="true"
          className="absolute border-[3px] border-solid border-white inset-0 rounded-[24px] md:rounded-[36px] shadow-[0px_24px_64px_0px_rgba(0,0,0,0.15)] pointer-events-none"
        />

      </motion.div>
    </div>
  );
}

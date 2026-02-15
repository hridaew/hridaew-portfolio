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
  tags?: string[];
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
  tags,
  isHovered,
  selectedCase,
  registerCard,
  onHoverChange,
  onClick,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
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

  // Animate pills on hover
  useEffect(() => {
    if (!pillsRef.current) return;
    const pills = pillsRef.current.children;
    if (!pills.length) return;

    // Kill any in-flight tweens to prevent stranded pills during fast hovering
    gsap.killTweensOf(pills);

    if (isThisHovered) {
      // Staggered entrance: fade + slide up
      gsap.to(pills, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: "back.out(1.4)",
        stagger: 0.06,
        overwrite: true,
      });
    } else {
      // Immediate reset: no stagger on exit to prevent lingering pills
      gsap.to(pills, {
        opacity: 0,
        y: 8,
        duration: 0.15,
        ease: "power2.in",
        overwrite: true,
      });
    }
  }, [isThisHovered]);

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
      role="button"
      tabIndex={0}
      aria-label={`View ${title} case study`}
      className="flex-shrink-0 cursor-pointer relative opacity-0 will-change-transform rounded-[clamp(20px,14.06px+1.524vw,36px)] overflow-visible"
      style={{ willChange: "transform", boxShadow: "0px 24px 64px 0px rgba(0,0,0,0.15)" }}
      onMouseEnter={() => selectedCase === null && onHoverChange(index)}
      onMouseLeave={() => selectedCase === null && onHoverChange(null)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={() => selectedCase === null && onClick()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && selectedCase === null) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Metadata pills — hidden on mobile, float above card */}
      {tags && tags.length > 0 && (
        <div
          ref={pillsRef}
          className="hidden md:flex absolute -top-10 left-1/2 -translate-x-1/2 gap-1.5 pointer-events-none whitespace-nowrap z-10"
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="opacity-0 translate-y-2 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider font-[family-name:var(--font-dm-sans)] border backdrop-blur-md"
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                color: "var(--text-primary)",
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <motion.div
        layoutId={`card-image-${slug}`}
        ref={containerRef}
        className="relative rounded-[clamp(20px,14.06px+1.524vw,36px)] w-[clamp(130px,76.41px+12.057vw,250px)] h-[clamp(130px,76.41px+12.057vw,250px)] overflow-hidden"
      >
        <Image
          alt={title}
          className="absolute inset-0 object-cover"
          src={src}
          fill
          sizes="clamp(130px,76.41px+12.057vw,250px)"
        />
        <div
          aria-hidden="true"
          className="absolute border-[3px] border-solid border-white inset-0 rounded-[clamp(20px,14.06px+1.524vw,36px)] shadow-[0px_24px_64px_0px_rgba(0,0,0,0.15)] pointer-events-none"
        />

      </motion.div>
    </div>
  );
}

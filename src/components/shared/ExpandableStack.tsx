"use client";

import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface StackImage {
  src: string;
  alt: string;
}

interface ExpandableStackProps {
  images: StackImage[];
  className?: string;
  stackHeight?: number;
  /** Override image sizing (fixed height caused distortion on some assets). */
  thumbnailClassName?: string;
  hintClassName?: string;
}

const defaultThumb =
  "max-h-[220px] md:max-h-[260px] w-auto max-w-[min(100%,360px)] object-contain rounded-lg shadow-e2 border border-neutral-200/60";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function ExpandableStack({
  images,
  className,
  stackHeight = 280,
  thumbnailClassName,
  hintClassName,
}: ExpandableStackProps) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = useCallback(() => {
    if (!containerRef.current) return;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    const count = cards.length;
    const reduce = prefersReducedMotion();
    const duration = reduce ? 0 : 0.28;
    const stagger = reduce ? 0 : 0.03;

    if (!expanded) {
      const container = containerRef.current;
      const cardHeight = cards[0]?.offsetHeight || 230;
      const gap = 12;
      const totalHeight = count * cardHeight + (count - 1) * gap;

      gsap.to(container, {
        height: totalHeight,
        duration,
        ease: "power2.out",
      });

      cards.forEach((card, i) => {
        const centerOffset = (totalHeight - cardHeight) / 2;
        const yPos = i * (cardHeight + gap) - centerOffset;

        gsap.to(card, {
          x: 0,
          y: yPos,
          rotation: 0,
          scale: 1,
          duration,
          ease: reduce ? "none" : "power2.out",
          delay: i * stagger,
        });
      });
    } else {
      const stackRotations =
        count === 3
          ? [-4, 1.5, 5]
          : images.map((_, i) => (i - (count - 1) / 2) * 4);
      const stackOffsets =
        count === 3
          ? [-20, 0, 20]
          : images.map((_, i) => (i - (count - 1) / 2) * 16);

      gsap.to(containerRef.current, {
        height: stackHeight,
        duration,
        ease: "power2.out",
      });

      cards.forEach((card, i) => {
        gsap.to(card, {
          x: stackOffsets[i],
          y: 0,
          rotation: stackRotations[i],
          scale: 1,
          duration,
          ease: "power2.out",
          delay: (count - 1 - i) * stagger,
        });
      });
    }

    setExpanded(!expanded);
  }, [expanded, images, stackHeight]);

  const stackRotations =
    images.length === 3
      ? [-4, 1.5, 5]
      : images.map((_, i) => (i - (images.length - 1) / 2) * 4);
  const stackOffsets =
    images.length === 3
      ? [-20, 0, 20]
      : images.map((_, i) => (i - (images.length - 1) / 2) * 16);

  const thumbCls = thumbnailClassName ?? defaultThumb;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="relative flex w-full items-center justify-center cursor-pointer"
        style={{ height: `${stackHeight}px` }}
        onClick={toggle}
      >
        {images.map((img, i) => (
          <div
            key={img.src}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="absolute"
            style={{
              transform: `translateX(${stackOffsets[i]}px) rotate(${stackRotations[i]}deg)`,
              zIndex: i + 1,
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className={thumbCls}
              draggable={false}
            />
          </div>
        ))}
      </div>
      <p
        className={cn(
          "type-caption text-ink-muted mt-4 text-left",
          hintClassName,
        )}
      >
        {expanded ? "Click to collapse" : "Click to expand"}
      </p>
    </div>
  );
}

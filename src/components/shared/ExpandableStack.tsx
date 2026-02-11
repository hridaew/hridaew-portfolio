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
}

export function ExpandableStack({ images, className, stackHeight = 280 }: ExpandableStackProps) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = useCallback(() => {
    if (!containerRef.current) return;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    const count = cards.length;

    if (!expanded) {
      // Expand to vertical list — switch container to flow layout
      const container = containerRef.current;
      const cardHeight = cards[0]?.offsetHeight || 230;
      const gap = 12;
      const totalHeight = count * cardHeight + (count - 1) * gap;

      // Animate container height
      gsap.to(container, {
        height: totalHeight,
        duration: 0.5,
        ease: "power2.out",
      });

      cards.forEach((card, i) => {
        // Calculate vertical position from center
        const centerOffset = (totalHeight - cardHeight) / 2;
        const yPos = i * (cardHeight + gap) - centerOffset;

        gsap.to(card, {
          x: 0,
          y: yPos,
          rotation: 0,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.2)",
          delay: i * 0.06,
        });
      });
    } else {
      // Collapse back to stack
      const stackRotations = count === 3 ? [-4, 1.5, 5] : images.map((_, i) => (i - (count - 1) / 2) * 4);
      const stackOffsets = count === 3 ? [-20, 0, 20] : images.map((_, i) => (i - (count - 1) / 2) * 16);

      gsap.to(containerRef.current, {
        height: stackHeight,
        duration: 0.45,
        ease: "power2.out",
      });

      cards.forEach((card, i) => {
        gsap.to(card, {
          x: stackOffsets[i],
          y: 0,
          rotation: stackRotations[i],
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
          delay: (count - 1 - i) * 0.04,
        });
      });
    }

    setExpanded(!expanded);
  }, [expanded, images, stackHeight]);

  const stackRotations = images.length === 3 ? [-4, 1.5, 5] : images.map((_, i) => (i - (images.length - 1) / 2) * 4);
  const stackOffsets = images.length === 3 ? [-20, 0, 20] : images.map((_, i) => (i - (images.length - 1) / 2) * 16);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="relative flex items-center justify-center cursor-pointer"
        style={{ height: `${stackHeight}px` }}
        onClick={toggle}
      >
        {images.map((img, i) => (
          <div
            key={img.src}
            ref={(el) => { cardsRef.current[i] = el; }}
            className="absolute"
            style={{
              transform: `translateX(${stackOffsets[i]}px) rotate(${stackRotations[i]}deg)`,
              zIndex: i + 1,
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="h-[180px] md:h-[230px] w-auto rounded-lg shadow-lg border border-neutral-200/60"
              draggable={false}
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-neutral-400 text-center mt-4">
        {expanded ? "Click to collapse" : "Click to expand"}
      </p>
    </div>
  );
}

"use client";

import { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(50);
  const isDraggingRef = useRef(false);
  const rafRef = useRef<number>(0);

  const updatePosition = useCallback(() => {
    const container = containerRef.current;
    const slider = sliderRef.current;
    if (!container || !slider) return;

    const pct = positionRef.current;
    // Update clip-path on after image
    const afterImg = container.querySelector("[data-after]") as HTMLElement;
    if (afterImg) {
      afterImg.style.clipPath = `inset(0 0 0 ${pct}%)`;
    }
    // Update slider line position
    slider.style.left = `${pct}%`;
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      positionRef.current = pct;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    },
    [updatePosition]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDraggingRef.current = true;
      handleMove(e.clientX);
    },
    [handleMove]
  );

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      handleMove(e.clientX);
    };
    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMove]);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        positionRef.current = Math.max(0, positionRef.current - 2);
        requestAnimationFrame(updatePosition);
      } else if (e.key === "ArrowRight") {
        positionRef.current = Math.min(100, positionRef.current + 2);
        requestAnimationFrame(updatePosition);
      }
    },
    [updatePosition]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl select-none cursor-ew-resize",
        className
      )}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="Before and after comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={50}
    >
      {/* Before image (full) */}
      <img
        src={beforeSrc}
        alt={beforeLabel}
        className="w-full h-auto block"
        draggable={false}
      />

      {/* After image (clipped) */}
      <img
        data-after
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: "inset(0 0 0 50%)" }}
        draggable={false}
      />

      {/* Slider handle */}
      <div
        ref={sliderRef}
        className="absolute top-0 bottom-0 w-[3px] bg-paper-raised shadow-lg -translate-x-1/2 pointer-events-none"
        style={{ left: "50%" }}
      >
        {/* Drag handle circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper-raised shadow-lg flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-amber-700"
          >
            <path
              d="M7 4L3 10L7 16M13 4L17 10L13 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-left text-ink backdrop-blur-sm site-gallery-caption">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-left text-ink backdrop-blur-sm site-gallery-caption">
        {afterLabel}
      </span>
    </div>
  );
}

"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const EXHIBITION_IMAGES = [
  "/assets/obscura/exhibition_743gm1tgvfizndo7gwveqtjp584.webp",
  "/assets/obscura/exhibition_adnoitrcdwr5rin7vsl73u4pvo.webp",
  "/assets/obscura/exhibition_fuq7mf78aqfsldtgthmlhbik.webp",
  "/assets/obscura/exhibition_lah07hiyl9glxe2jbec80zastu.webp",
  "/assets/obscura/exhibition_lmwbwqiof2i79hqbywhhidrto1o.webp",
  "/assets/obscura/exhibition_mptzvspexc3aj4b2bxr8hwnjxo.webp",
  "/assets/obscura/exhibition_pieaqe7qfretseuxzmrd9r16opc.webp",
  "/assets/obscura/exhibition_uo819xvsekqwozr2ch9mt0tsci.webp",
  "/assets/obscura/exhibition_xrzfa3phi0b8csowvt4ovbrjbi.webp",
  "/assets/obscura/exhibition_zfpsnuur6vt2yepotybrqfuwcia.webp",
];

interface ExhibitionMosaicProps {
  className?: string;
}

export function ExhibitionMosaic({ className }: ExhibitionMosaicProps) {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const tween1Ref = useRef<gsap.core.Tween | null>(null);
  const tween2Ref = useRef<gsap.core.Tween | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag state refs
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragProgress1Ref = useRef(0);
  const dragProgress2Ref = useRef(0);

  // Split images into two rows
  const row1Images = EXHIBITION_IMAGES.slice(0, 5);
  const row2Images = EXHIBITION_IMAGES.slice(5, 10);

  // Double for seamless loop
  const row1Doubled = [...row1Images, ...row1Images];
  const row2Doubled = [...row2Images, ...row2Images];

  useEffect(() => {
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;
    if (!row1 || !row2) return;

    const row1Width = row1.scrollWidth / 2;
    const row2Width = row2.scrollWidth / 2;

    // Row 1 scrolls left
    tween1Ref.current = gsap.to(row1, {
      x: -row1Width,
      duration: 45,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: number) => {
          return parseFloat(x as unknown as string) % row1Width;
        }),
      },
    });

    // Row 2 scrolls right (opposite direction for visual interest)
    gsap.set(row2, { x: -row2Width });
    tween2Ref.current = gsap.to(row2, {
      x: 0,
      duration: 50,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: number) => {
          const val = parseFloat(x as unknown as string);
          // Keep cycling between -row2Width and 0
          return ((val % row2Width) + row2Width) % row2Width - row2Width;
        }),
      },
    });

    return () => {
      tween1Ref.current?.kill();
      tween2Ref.current?.kill();
    };
  }, []);

  const handleMouseEnter = () => {
    if (isDraggingRef.current) return;
    if (tween1Ref.current) {
      gsap.to(tween1Ref.current, { timeScale: 0, duration: 0.6, ease: "power2.out" });
    }
    if (tween2Ref.current) {
      gsap.to(tween2Ref.current, { timeScale: 0, duration: 0.6, ease: "power2.out" });
    }
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      handleDragEnd();
    }
    if (tween1Ref.current) {
      gsap.to(tween1Ref.current, { timeScale: 1, duration: 0.6, ease: "power2.in" });
    }
    if (tween2Ref.current) {
      gsap.to(tween2Ref.current, { timeScale: 1, duration: 0.6, ease: "power2.in" });
    }
  };

  // Drag handlers
  const handleDragStart = useCallback((clientX: number) => {
    isDraggingRef.current = true;
    dragStartXRef.current = clientX;

    if (tween1Ref.current) {
      dragProgress1Ref.current = tween1Ref.current.progress();
      tween1Ref.current.pause();
    }
    if (tween2Ref.current) {
      dragProgress2Ref.current = tween2Ref.current.progress();
      tween2Ref.current.pause();
    }

    if (containerRef.current) {
      containerRef.current.style.cursor = "grabbing";
    }
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;

    const containerWidth = containerRef.current?.offsetWidth || 1;
    const deltaX = clientX - dragStartXRef.current;
    // Map drag distance to timeline progress
    const progressDelta = deltaX / (containerWidth * 2);

    if (tween1Ref.current) {
      let newProgress = (dragProgress1Ref.current - progressDelta) % 1;
      if (newProgress < 0) newProgress += 1;
      tween1Ref.current.progress(newProgress);
    }
    if (tween2Ref.current) {
      let newProgress = (dragProgress2Ref.current + progressDelta) % 1;
      if (newProgress < 0) newProgress += 1;
      tween2Ref.current.progress(newProgress);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }

    // Resume auto-scroll
    if (tween1Ref.current) {
      tween1Ref.current.play();
      gsap.to(tween1Ref.current, { timeScale: 1, duration: 0.6, ease: "power2.in" });
    }
    if (tween2Ref.current) {
      tween2Ref.current.play();
      gsap.to(tween2Ref.current, { timeScale: 1, duration: 0.6, ease: "power2.in" });
    }
  }, []);

  // Mouse drag events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  const onMouseMoveHandler = useCallback((e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  }, [handleDragMove]);

  const onMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch drag events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  }, [handleDragMove]);

  const onTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        ref={containerRef}
        className="relative w-full space-y-3 overflow-hidden"
        style={{
          cursor: "grab",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMoveHandler}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Row 1 */}
        <div ref={row1Ref} className="flex gap-3 will-change-transform">
          {row1Doubled.map((src, i) => (
            <div
              key={`row1-${i}`}
              className="flex-shrink-0 overflow-hidden rounded-lg border border-neutral-800"
            >
              <img
                src={src}
                alt={`Exhibition day photograph ${(i % row1Images.length) + 1}`}
                className="h-[200px] w-auto object-cover"
                loading="eager"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div ref={row2Ref} className="flex gap-3 will-change-transform">
          {row2Doubled.map((src, i) => (
            <div
              key={`row2-${i}`}
              className="flex-shrink-0 overflow-hidden rounded-lg border border-neutral-800"
            >
              <img
                src={src}
                alt={`Exhibition day photograph ${(i % row2Images.length) + 6}`}
                className="h-[200px] w-auto object-cover"
                loading="eager"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <p className="text-center font-[family-name:var(--font-dm-sans)] text-sm text-neutral-400 italic">
        Exhibition Day at MOHAI — September 13, 2025
      </p>
    </div>
  );
}

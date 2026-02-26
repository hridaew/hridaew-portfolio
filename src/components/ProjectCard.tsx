"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import Image from "next/image";
import { type GridProjectData } from "@/types/project-grid";
import { usePageTransition } from "@/components/PageTransition";
import { playClick } from "@/lib/audio";

interface ProjectCardProps extends GridProjectData {}

export function ProjectCard({
  slug,
  title,
  role,
  description,
  timeline,
  accentColor,
  isActive,
  href,
  assets,
}: ProjectCardProps) {
  const { transitionTo } = usePageTransition();
  const cardRef = useRef<HTMLDivElement>(null);
  const assetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const quickToRefs = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc }[]>(
    []
  );

  // Sort assets: non-front (tilted/behind) first, front (straight) second
  const sortedAssets = [...assets].sort((a, b) => (a.isFront ? 1 : 0) - (b.isFront ? 1 : 0));

  // Set up quickTo functions for each asset layer
  useEffect(() => {
    quickToRefs.current = assetRefs.current
      .filter((el): el is HTMLDivElement => el !== null)
      .map((el) => ({
        x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" }),
      }));
  }, []);

  // Mouse tracking + parallax RAF loop
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      };
    };

    const handleMouseEnter = () => {
      isHoveredRef.current = true;

      // Asset spread with anticipation → action → follow-through
      assetRefs.current.forEach((el, i) => {
        if (!el) return;
        const asset = sortedAssets[i];

        // Phase 1: Anticipation — slight gather
        gsap.to(el, {
          scale: 0.97,
          duration: 0.05,
          ease: "power2.in",
          onComplete: () => {
            // Phase 2: Spread with overshoot
            gsap.to(el, {
              x: asset.hoverOffsetX,
              y: asset.hoverOffsetY,
              rotation: asset.hoverRotation,
              scale: 1.02,
              duration: 0.25,
              ease: "back.out(1.4)",
              onComplete: () => {
                // Phase 3: Settle
                gsap.to(el, {
                  scale: 1.0,
                  duration: 0.1,
                  ease: "power2.out",
                });
              },
            });
          },
        });
      });
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      mouseRef.current = { x: 0, y: 0 };

      // Assets return to stacked
      assetRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          x: 0,
          y: 0,
          rotation: sortedAssets[i].rotation,
          scale: 1,
          duration: 0.25,
          ease: "power2.out",
        });
      });

      // Reset quickTo positions
      quickToRefs.current.forEach((qt) => {
        qt.x(0);
        qt.y(0);
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    // RAF loop for parallax + dynamic shadows
    const loop = () => {
      if (isHoveredRef.current) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;

        assetRefs.current.forEach((el, i) => {
          if (!el) return;
          const asset = sortedAssets[i];
          // Back layer moves opposite, front layer moves with mouse
          const parallaxStrength = asset.isFront ? 12 : -8;
          const targetX = asset.hoverOffsetX + mx * parallaxStrength;
          const targetY = asset.hoverOffsetY + my * parallaxStrength;

          quickToRefs.current[i]?.x(targetX);
          quickToRefs.current[i]?.y(targetY);

          // Dynamic shadow direction
          const depthMultiplier = asset.isFront ? 2 : 1;
          const shadowX = -mx * (depthMultiplier * 3);
          const shadowY = -my * (depthMultiplier * 3);
          const blur = 4 + depthMultiplier * 10;
          const opacity = 0.08 + depthMultiplier * 0.04;
          el.style.filter = `drop-shadow(${shadowX}px ${shadowY}px ${blur}px rgba(0,0,0,${opacity}))`;
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [assets, sortedAssets]);

  const handlePointerDown = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { scale: 0.97, duration: 0.12, ease: "power2.out", overwrite: "auto" });
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, { scale: 1, duration: 0.35, ease: "back.out(1.4)", overwrite: "auto" });
  }, []);

  const handleClick = useCallback(() => {
    playClick();
    transitionTo(href);
  }, [href, transitionTo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div
      ref={cardRef}
      role="link"
      tabIndex={0}
      aria-label={`View ${title} project`}
      className="bg-[var(--surface-card)] rounded-[31px] p-6 md:p-8 flex flex-col justify-between cursor-pointer will-change-transform border border-[var(--border-card)]"
      style={{ minHeight: 420 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Top Row: Timeline + Status */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-[family-name:var(--font-dm-sans)] font-semibold text-sm text-[var(--text-muted)] tracking-[-0.5px]">
          {timeline}
        </span>
        {isActive && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(238,107,95,0.1)]">
            <span
              aria-hidden="true"
              className="w-[7px] h-[7px] rounded-full bg-[#ee6b5f]"
            />
            <span className="font-[family-name:var(--font-dm-sans)] font-semibold text-xs text-[#ff4c5c]">
              Now
            </span>
          </span>
        )}
      </div>

      {/* Asset Area — CSS Grid overlay approach from Figma */}
      <div className="flex items-center justify-center flex-1 my-4 min-h-[200px] md:min-h-[260px]">
        <div
          className="inline-grid place-items-start relative"
          style={{
            gridTemplateColumns: "max-content",
            gridTemplateRows: "max-content",
          }}
        >
          {sortedAssets.map((asset, i) => (
            <div
              key={asset.src}
              ref={(el) => {
                assetRefs.current[i] = el;
              }}
              className="will-change-transform"
              style={{
                gridColumn: 1,
                gridRow: 1,
                marginLeft: asset.marginLeft,
                marginTop: asset.marginTop,
                transform: `rotate(${asset.rotation}deg)`,
              }}
            >
              <div
                className={`overflow-hidden relative ${asset.hasBorder ? "border border-white dark:border-[var(--border-card)]" : ""}`}
                style={{
                  width: asset.width,
                  height: asset.height,
                  borderRadius: asset.borderRadius,
                  boxShadow: asset.hasBorder
                    ? "0px 4px 24px rgba(0,0,0,0.1)"
                    : "none",
                }}
              >
                <Image
                  src={asset.src}
                  alt={asset.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 250px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="flex flex-col gap-0.5 mt-4">
        <span
          className="font-[family-name:var(--font-dm-sans)] font-semibold text-base capitalize"
          style={{ color: accentColor }}
        >
          {title}
        </span>
        <span className="font-[family-name:var(--font-dm-sans)] font-semibold text-base text-[#666] dark:text-[var(--text-secondary)]">
          {role}
        </span>
        <span className="font-[family-name:var(--font-dm-sans)] font-semibold text-sm text-[var(--text-muted)] leading-relaxed">
          {description}
        </span>
      </div>
    </div>
  );
}

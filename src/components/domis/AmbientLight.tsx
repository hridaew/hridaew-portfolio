"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Swappable Domis ambient background.
 * Warm interior light at dusk: soft radial blooms, no geometry, no particles.
 */
export function AmbientLight({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const blooms = root.querySelectorAll<HTMLElement>("[data-bloom]");
    const tweens = Array.from(blooms).map((el, i) =>
      gsap.to(el, {
        x: i % 2 === 0 ? 36 : -28,
        y: i % 2 === 0 ? -24 : 32,
        duration: 34 + i * 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      })
    );

    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      aria-hidden
      style={{ pointerEvents: "none" }}
    >
      {/* Warm amber */}
      <div
        data-bloom
        className="absolute -left-[18%] top-[8%] h-[55vmax] w-[55vmax] rounded-full opacity-[0.18] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 136, 0.95) 0%, transparent 68%)",
        }}
      />
      {/* Cooler teal / slate */}
      <div
        data-bloom
        className="absolute -right-[20%] top-[36%] h-[48vmax] w-[48vmax] rounded-full opacity-[0.14] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(148, 163, 184, 0.9) 0%, transparent 70%)",
        }}
      />
      {/* Soft lower wash so glass panels have something to blur */}
      <div
        data-bloom
        className="absolute bottom-[-10%] left-[22%] h-[40vmax] w-[40vmax] rounded-full opacity-[0.12] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 146, 60, 0.65) 0%, transparent 72%)",
        }}
      />
    </div>
  );
}

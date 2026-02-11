"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface EyeTrackingDemoProps {
  className?: string;
}

export function EyeTrackingDemo({ className }: EyeTrackingDemoProps) {
  const erraticBlobRef = useRef<HTMLDivElement>(null);
  const intentionalBlobRef = useRef<HTMLDivElement>(null);
  const erraticTlRef = useRef<gsap.core.Timeline | null>(null);
  const intentionalTlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const erratic = erraticBlobRef.current;
    const intentional = intentionalBlobRef.current;
    if (!erratic || !intentional) return;

    // Erratic blob: chaotic random movement
    const erraticTl = gsap.timeline({ repeat: -1 });
    const bound = 60; // px from center

    for (let i = 0; i < 20; i++) {
      erraticTl.to(erratic, {
        x: gsap.utils.random(-bound, bound),
        y: gsap.utils.random(-bound, bound),
        duration: gsap.utils.random(0.15, 0.4),
        ease: "power1.inOut",
      });
    }
    erraticTlRef.current = erraticTl;

    // Intentional blob: smooth, deliberate path
    const intentionalTl = gsap.timeline({ repeat: -1 });
    const waypoints = [
      { x: -30, y: -20 },
      { x: 20, y: -30 },
      { x: 40, y: 10 },
      { x: 10, y: 30 },
      { x: -20, y: 20 },
      { x: -40, y: -5 },
      { x: 0, y: 0 },
    ];

    waypoints.forEach((pt) => {
      intentionalTl.to(intentional, {
        x: pt.x,
        y: pt.y,
        duration: 1.8,
        ease: "sine.inOut",
      });
    });
    intentionalTlRef.current = intentionalTl;

    return () => {
      erraticTl.kill();
      intentionalTl.kill();
    };
  }, []);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Problem: Erratic Gaze */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div
              ref={erraticBlobRef}
              className="will-change-transform"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "radial-gradient(circle, #f59e0b 0%, #d97706 50%, transparent 100%)",
                boxShadow: "0 0 24px 8px rgba(245, 158, 11, 0.4), 0 0 48px 16px rgba(245, 158, 11, 0.15)",
                filter: "blur(1px)",
              }}
            />
            {/* Faint trail dots for visual context */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.03) 0%, transparent 60%)",
              }}
            />
          </div>
          <span className="font-[family-name:var(--font-dm-sans)] text-xs tracking-wide text-neutral-500 uppercase">
            Erratic Gaze (Eye Tracking)
          </span>
        </div>

        {/* Solution: Intentional Gaze */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-[200px] w-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div
              ref={intentionalBlobRef}
              className="will-change-transform"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "radial-gradient(circle, #fbbf24 0%, #f59e0b 50%, transparent 100%)",
                boxShadow: "0 0 24px 8px rgba(251, 191, 36, 0.4), 0 0 48px 16px rgba(251, 191, 36, 0.15)",
                filter: "blur(1px)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.03) 0%, transparent 60%)",
              }}
            />
          </div>
          <span className="font-[family-name:var(--font-dm-sans)] text-xs tracking-wide text-neutral-500 uppercase">
            Intentional Gaze (Head Tracking)
          </span>
        </div>
      </div>
    </div>
  );
}

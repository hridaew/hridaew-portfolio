"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface HapticsFlowProps {
  className?: string;
}

const nodes = [
  {
    label: "Video",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
  {
    label: "Audio",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    ),
  },
  {
    label: "Haptics",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h2" />
        <path d="M6 8v8" />
        <path d="M10 4v16" />
        <path d="M14 6v12" />
        <path d="M18 8v8" />
        <path d="M22 12h-2" />
      </svg>
    ),
  },
  {
    label: "Footrest",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 21l-2-4" />
        <path d="M17 21l2-4" />
        <path d="M3 17h18" />
        <path d="M12 3c-2.5 0-4.5 2-4.5 4.5S9.5 12 12 12s4.5-2 4.5-4.5S14.5 3 12 3z" />
        <path d="M8 12c-1 1-2 3-2 5h12c0-2-1-4-2-5" />
      </svg>
    ),
  },
];

export function HapticsFlow({ className }: HapticsFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial states
    const nodeEls = container.querySelectorAll("[data-node]");
    const arrowEls = container.querySelectorAll("[data-arrow]");
    const pulseEls = container.querySelectorAll("[data-pulse]");

    gsap.set(nodeEls, { opacity: 0, scale: 0.7, y: 12 });
    gsap.set(arrowEls, { opacity: 0, scaleX: 0 });
    gsap.set(pulseEls, { opacity: 0, x: 0 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;

            const tl = gsap.timeline({ defaults: { ease: "back.out(1.4)" } });

            // Animate nodes sequentially with stagger
            nodeEls.forEach((node, i) => {
              tl.to(
                node,
                { opacity: 1, scale: 1, y: 0, duration: 0.5 },
                i * 0.3
              );

              // Animate the arrow after each node (except last)
              if (i < arrowEls.length) {
                tl.to(
                  arrowEls[i],
                  {
                    opacity: 1,
                    scaleX: 1,
                    duration: 0.35,
                    ease: "power2.out",
                  },
                  i * 0.3 + 0.25
                );
              }
            });

            // After all nodes animate in, start the flowing pulse animation
            const totalNodeTime = (nodeEls.length - 1) * 0.3 + 0.5;
            tl.call(() => {
              // Create looping pulse animation
              const pulseTl = gsap.timeline({ repeat: -1, delay: 0.2 });

              pulseEls.forEach((pulse, i) => {
                pulseTl.fromTo(
                  pulse,
                  { opacity: 0, x: -4 },
                  {
                    opacity: 1,
                    x: 32,
                    duration: 0.6,
                    ease: "power1.inOut",
                    onComplete: () => {
                      gsap.to(pulse, { opacity: 0, duration: 0.2 });
                    },
                  },
                  i * 0.25
                );
              });

              pulseTl.to({}, { duration: 0.6 }); // gap before repeat
            }, undefined, totalNodeTime);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center justify-center gap-2 sm:gap-4 py-10 px-4",
        className
      )}
    >
      {nodes.map((node, i) => (
        <div key={node.label} className="flex items-center gap-2 sm:gap-4">
          {/* Node card */}
          <div
            data-node
            className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-5 sm:px-6 sm:py-6 shadow-sm min-w-[80px] sm:min-w-[100px]"
          >
            <div className="text-neutral-700">{node.icon}</div>
            <span className="text-sm font-medium text-neutral-700 font-[family-name:var(--font-dm-sans)]">
              {node.label}
            </span>
          </div>

          {/* Arrow connector with flowing pulse (except after last node) */}
          {i < nodes.length - 1 && (
            <div
              data-arrow
              className="flex items-center origin-left relative"
            >
              <svg
                width="36"
                height="12"
                viewBox="0 0 36 12"
                fill="none"
                className="text-neutral-400"
              >
                <path
                  d="M0 6h30"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M28 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Flowing pulse dot */}
              <div
                data-pulse
                className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-neutral-500 opacity-0"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

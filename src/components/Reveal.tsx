"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  scroller?: string | Element | null;
}

export function Reveal({ children, delay = 0, className = "", scroller }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    // Initial state
    gsap.set(el, { opacity: 0, y: 32 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      scroller: scroller || window, // Use custom scroller if provided
      start: "top bottom-=50px", // More generous start
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power3.out",
          overwrite: "auto"
        });
      },
      // Fix for fast scroll: if we scroll past before init, show immediately
      onRefresh: (self) => {
        if (self.progress > 0 && self.isActive) {
          gsap.set(el, { opacity: 1, y: 0 });
        }
      }
    });

    // Safety check: if already in view on mount
    if (trigger.isActive) {
      gsap.set(el, { opacity: 1, y: 0 });
    }

    return () => trigger.kill();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

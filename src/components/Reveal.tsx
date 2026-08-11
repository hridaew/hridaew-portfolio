"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScroller } from "@/components/sheet/scroller-context";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  scroller?: string | Element | null;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  scroller: scrollerProp,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const sheetScroller = useScroller();
  const scroller = scrollerProp ?? sheetScroller;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    let revealed = false;
    let trigger: ScrollTrigger | null = null;

    const show = (immediate = false) => {
      if (revealed) return;
      revealed = true;
      if (immediate) {
        gsap.set(el, { opacity: 1, y: 0 });
      } else {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
      trigger?.kill();
      trigger = null;
      io.disconnect();
    };

    const inView = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      // Visible enough that the user can see it (incl. near page end)
      return rect.top < vh - 24 && rect.bottom > 24;
    };

    gsap.set(el, { opacity: 0, y: 32 });

    // IntersectionObserver is reliable with Lenis + bottom-of-page cases
    // where ScrollTrigger start positions go stale after layout above shifts.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) show(false);
      },
      { root: null, rootMargin: "0px 0px -24px 0px", threshold: 0.01 },
    );
    io.observe(el);

    trigger = ScrollTrigger.create({
      trigger: el,
      scroller: scroller || undefined,
      start: "top bottom-=40px",
      once: true,
      onEnter: () => show(false),
      onRefresh: () => {
        if (!revealed && inView()) show(true);
      },
    });

    if (inView()) show(true);

    const onRefresh = () => {
      if (!revealed && inView()) show(true);
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);

    // Late layout (images, live demos) — re-measure a few times after mount.
    const t1 = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    const t2 = window.setTimeout(() => {
      ScrollTrigger.refresh();
      if (!revealed && inView()) show(true);
    }, 700);
    const t3 = window.setTimeout(() => {
      ScrollTrigger.refresh();
      if (!revealed && inView()) show(true);
    }, 1600);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      io.disconnect();
      trigger?.kill();
    };
  }, [delay, scroller]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

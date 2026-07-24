"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SmoothScroll() {
    useEffect(() => {
        // Initialize Lenis
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2,
        });

        // Expose Lenis instance globally for page transitions
        (window as any).__lenis = lenis;

        // Integrity check for GSAP ScrollTrigger
        lenis.on("scroll", ScrollTrigger.update);

        // Sync GSAP ticker with Lenis raf
        const onTick = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        // Re-measure triggers after layout settles / viewport changes so
        // bottom-of-page Reveals don't stay stuck at opacity 0.
        let refreshTimer = 0;
        const scheduleRefresh = () => {
            window.clearTimeout(refreshTimer);
            refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 80);
        };
        window.addEventListener("resize", scheduleRefresh);
        window.addEventListener("load", scheduleRefresh);
        scheduleRefresh();

        return () => {
            (window as any).__lenis = undefined;
            window.clearTimeout(refreshTimer);
            window.removeEventListener("resize", scheduleRefresh);
            window.removeEventListener("load", scheduleRefresh);
            lenis.destroy();
            gsap.ticker.remove(onTick);
        };
    }, []);

    return null;
}

"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { HomePage } from "@/components/home/HomePage";
import { HOME_COLUMN } from "@/components/home/homeGrid";
import { StickyNotes } from "@/components/StickyNotes";
import { ENABLE_HOME_CHEAT_CODES } from "@/lib/site-toggles";

const HomeCheatEasterEggs = dynamic(
  () =>
    import("@/components/home/HomeCheatEasterEggs").then((m) => m.HomeCheatEasterEggs),
  { ssr: false },
);

export default function Home() {
  useEffect(() => {
    const pendingHash = sessionStorage.getItem("pendingHash");
    if (pendingHash) {
      sessionStorage.removeItem("pendingHash");
      requestAnimationFrame(() => {
        const el = document.getElementById(pendingHash.replace("#", ""));
        if (el) {
          const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o: { offset: number; duration: number }) => void } }).__lenis;
          if (lenis) {
            lenis.scrollTo(el, { offset: -80, duration: 1.2 });
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    } else {
      window.scrollTo(0, 0);
      (window as unknown as { __lenis?: { scrollTo: (n: number, o: { immediate: boolean }) => void } }).__lenis?.scrollTo(0, { immediate: true });
    }
  }, []);

  useEffect(() => {
    const { documentElement: root, body } = document;
    root.classList.add("scrollbar-hide");
    body.classList.add("scrollbar-hide");
    return () => {
      root.classList.remove("scrollbar-hide");
      body.classList.remove("scrollbar-hide");
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-[100vw] overflow-x-clip">
      {/* overflow-x-clip: only past the viewport edge—Embla track stays overflow-visible so slides peek inside the screen. */}
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip bg-[#0c0c0e] transition-colors duration-500">
        <HomePage />

        {ENABLE_HOME_CHEAT_CODES && <HomeCheatEasterEggs />}

        <div className="pt-[120px] pb-3">
          <div className={HOME_COLUMN}>
            <div
              className="flex flex-row items-baseline justify-between gap-3 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 font-mono text-[11px] leading-snug text-white/25 md:text-xs"
              role="note"
            >
              <p className="min-w-0 pr-2">
                I built this portfolio website with Figma &rarr; Figma Make &rarr; Claude Code + Cursor + Antigravity (basically wherever I had tokens left)
              </p>
              <p className="shrink-0 tabular-nums text-white/20" aria-label="Site version">
                v2.11.1
              </p>
            </div>
          </div>
        </div>
      </div>

      <StickyNotes page="home" />
    </div>
  );
}

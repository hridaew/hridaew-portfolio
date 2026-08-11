"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HeroCard } from "./HeroCard";
import { BioSection } from "./BioSection";
import { ToolkitSection } from "./ToolkitSection";
import { WorkSection } from "./WorkSection";
import { ObscuraLiquidGlassFilterSvg } from "./ObscuraLiquidGlassFilterSvg";
import { HOME_COLUMN, HOME_HERO_BLEED, HOME_RIGHT_COLUMN } from "./homeGrid";
import {
  ENABLE_HOME_CHEAT_CODES,
  ENABLE_WAFFLINGS_SECTION,
} from "@/lib/site-toggles";
import { RevealOnLoad } from "./RevealOnLoad";
import { useHomeLayoutMode } from "@/hooks/useHomeLayoutMode";
import type { HomeLayoutMode } from "@/lib/home-layout";

const SITE_VERSION = "v3.6.0";

const WafflingsSection = dynamic(
  () => import("./WafflingsSection").then((m) => m.WafflingsSection),
  { ssr: false },
);

const HomeCheatEasterEggs = dynamic(
  () =>
    import("./HomeCheatEasterEggs").then((m) => m.HomeCheatEasterEggs),
  { ssr: false },
);

const PANE_SCROLL =
  "min-h-0 min-w-0 overflow-x-hidden overflow-y-auto overscroll-y-contain scrollbar-hide" as const;

function HomeFooter() {
  return (
    <div
      className={`${HOME_COLUMN} flex shrink-0 flex-row flex-wrap items-center justify-between gap-x-5 gap-y-3 pb-8 pt-10`}
    >
      {ENABLE_HOME_CHEAT_CODES ? <HomeCheatEasterEggs /> : null}
      <p className="shrink-0 font-mono text-[11px] leading-snug tabular-nums text-ink/40 md:text-xs">
        Hridae Walia - {new Date().getFullYear()} - {SITE_VERSION}
      </p>
    </div>
  );
}

/** Skip entrance stagger when swapping split↔stack after first paint. */
function HomeReveal({
  delay,
  enableMotion,
  children,
}: {
  delay: number;
  enableMotion: boolean;
  children: React.ReactNode;
}) {
  if (!enableMotion) return <>{children}</>;
  return <RevealOnLoad delay={delay}>{children}</RevealOnLoad>;
}

function SplitHome({ revealMotion }: { revealMotion: boolean }) {
  const homeRootRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const heroAnchorRef = useRef<HTMLDivElement>(null);
  const [rightPadTop, setRightPadTop] = useState(80);

  const syncRightStartToHero = useCallback(() => {
    const left = leftPaneRef.current;
    const hero = heroAnchorRef.current;
    if (!left || !hero) return;
    const y =
      hero.getBoundingClientRect().top -
      left.getBoundingClientRect().top +
      left.scrollTop;
    const next = Math.max(0, Math.round(y));
    setRightPadTop((prev) => (prev === next ? prev : next));
  }, []);

  useLayoutEffect(() => {
    syncRightStartToHero();
    const left = leftPaneRef.current;
    const hero = heroAnchorRef.current;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncRightStartToHero())
        : null;
    if (ro && left) ro.observe(left);
    if (ro && hero) ro.observe(hero);
    window.addEventListener("resize", syncRightStartToHero);

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      syncRightStartToHero();
      if (now - start < 1000) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", syncRightStartToHero);
      cancelAnimationFrame(raf);
    };
  }, [syncRightStartToHero]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const lenis = (
      window as unknown as { __lenis?: { stop: () => void; start: () => void } }
    ).__lenis;
    lenis?.stop();
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      lenis?.start();
    };
  }, []);

  const onHomePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = homeRootRef.current;
      const left = leftPaneRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const splitX = left ? left.getBoundingClientRect().right : r.left + r.width / 2;
      const rightW = Math.max(1, r.right - splitX);
      const h = Math.max(1, r.height);
      if (e.clientX < splitX) {
        el.style.setProperty("--home-dot-heat", "0");
        return;
      }
      const x = Math.min(100, Math.max(0, ((e.clientX - splitX) / rightW) * 100));
      const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / h) * 100));
      el.style.setProperty("--home-dot-x", `${x}%`);
      el.style.setProperty("--home-dot-y", `${y}%`);
      el.style.setProperty("--home-dot-heat", "1");
    },
    [],
  );

  const onHomePointerLeave = useCallback(() => {
    const el = homeRootRef.current;
    if (!el) return;
    el.style.setProperty("--home-dot-heat", "0");
  }, []);

  return (
    <div
      ref={homeRootRef}
      data-home-cheat-skin
      data-home-split-panes
      className="relative isolate h-dvh min-h-0 w-full min-w-0 overflow-hidden bg-paper text-ink [--home-dot-x:50%] [--home-dot-y:50%] [--home-dot-heat:0]"
      onPointerMove={onHomePointerMove}
      onPointerLeave={onHomePointerLeave}
    >
      <div
        className="home-split-right-mesh pointer-events-none absolute inset-y-0 right-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="home-page-dot-mesh absolute inset-0" />
        <div className="home-page-dot-mesh-pop absolute inset-0" />
      </div>

      <ObscuraLiquidGlassFilterSvg />

      <div className="home-split-grid relative z-[1] grid h-full min-h-0 w-full">
        <div
          ref={leftPaneRef}
          data-home-pane="left"
          className={`${PANE_SCROLL} border-r border-ink/[0.06]`}
        >
          <div className="flex min-h-full flex-col">
            <div
              className={`${HOME_COLUMN} flex flex-1 flex-col justify-center gap-12 py-12`}
            >
              <HomeReveal delay={0.05} enableMotion={revealMotion}>
                <div ref={heroAnchorRef} className={HOME_HERO_BLEED}>
                  <HeroCard />
                </div>
              </HomeReveal>

              <HomeReveal delay={0.2} enableMotion={revealMotion}>
                <div className="relative z-0">
                  <BioSection />
                </div>
              </HomeReveal>

              <HomeReveal delay={0.35} enableMotion={revealMotion}>
                <ToolkitSection />
              </HomeReveal>
            </div>

            <HomeFooter />
          </div>
        </div>

        <div data-home-pane="right" className={PANE_SCROLL}>
          <div
            className={`${HOME_RIGHT_COLUMN} flex flex-col gap-[120px]`}
            style={{ paddingTop: rightPadTop, paddingBottom: rightPadTop }}
          >
            <HomeReveal delay={0.2} enableMotion={revealMotion}>
              <WorkSection />
            </HomeReveal>

            {ENABLE_WAFFLINGS_SECTION && (
              <HomeReveal delay={0.35} enableMotion={revealMotion}>
                <div className="min-w-0">
                  <WafflingsSection />
                </div>
              </HomeReveal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StackHome({ revealMotion }: { revealMotion: boolean }) {
  const homeRootRef = useRef<HTMLDivElement>(null);

  const onHomePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = homeRootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / w) * 100));
      const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / h) * 100));
      el.style.setProperty("--home-dot-x", `${x}%`);
      el.style.setProperty("--home-dot-y", `${y}%`);
      el.style.setProperty("--home-dot-heat", "1");
    },
    [],
  );

  const onHomePointerLeave = useCallback(() => {
    const el = homeRootRef.current;
    if (!el) return;
    el.style.setProperty("--home-dot-heat", "0");
  }, []);

  return (
    <div
      ref={homeRootRef}
      data-home-cheat-skin
      className="relative isolate min-h-screen min-w-0 bg-paper text-ink [--home-dot-x:50%] [--home-dot-y:50%] [--home-dot-heat:0]"
      onPointerMove={onHomePointerMove}
      onPointerLeave={onHomePointerLeave}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 min-h-full"
        aria-hidden
      >
        <div className="home-page-dot-mesh absolute inset-0 min-h-full" />
        <div className="home-page-dot-mesh-pop absolute inset-0 min-h-full" />
      </div>

      <div className="relative z-[1] min-w-0">
        <ObscuraLiquidGlassFilterSvg />
        <div className={HOME_COLUMN}>
          <div className="flex flex-col gap-[72px] pt-[80px]">
            <HomeReveal delay={0.05} enableMotion={revealMotion}>
              <div className={HOME_HERO_BLEED}>
                <HeroCard />
              </div>
            </HomeReveal>

            <HomeReveal delay={0.2} enableMotion={revealMotion}>
              <div className="relative z-0">
                <BioSection />
              </div>
            </HomeReveal>

            <HomeReveal delay={0.35} enableMotion={revealMotion}>
              <WorkSection />
            </HomeReveal>

            <HomeReveal delay={0.5} enableMotion={revealMotion}>
              <ToolkitSection />
            </HomeReveal>

            {ENABLE_WAFFLINGS_SECTION && (
              <HomeReveal delay={0.65} enableMotion={revealMotion}>
                <div className="min-w-0">
                  <WafflingsSection />
                </div>
              </HomeReveal>
            )}

            <HomeFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeShell({
  layoutMode,
  revealMotion,
}: {
  layoutMode: HomeLayoutMode;
  revealMotion: boolean;
}) {
  return layoutMode === "split" ? (
    <SplitHome revealMotion={revealMotion} />
  ) : (
    <StackHome revealMotion={revealMotion} />
  );
}

export function HomePage() {
  const layoutMode = useHomeLayoutMode();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [hasSwitchedLayout, setHasSwitchedLayout] = useState(false);
  const prevModeRef = useRef<HomeLayoutMode | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (prevModeRef.current === null) {
      // Lock the real client mode — do not treat SSR→client as a switch.
      prevModeRef.current = layoutMode;
      return;
    }
    if (prevModeRef.current !== layoutMode) {
      prevModeRef.current = layoutMode;
      setHasSwitchedLayout(true);
    }
  }, [layoutMode, mounted]);

  // Avoid SSR stack → client split flash that kills RevealOnLoad.
  if (!mounted) {
    return <div className="min-h-dvh w-full bg-paper" aria-hidden />;
  }

  const revealMotion = !hasSwitchedLayout;
  const fadeDuration = reduceMotion ? 0 : 0.2;

  // First paint: RevealOnLoad only — no shell opacity crossfade.
  if (!hasSwitchedLayout) {
    return <HomeShell layoutMode={layoutMode} revealMotion={revealMotion} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={layoutMode}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: fadeDuration,
            ease: reduceMotion ? "linear" : [0.22, 1, 0.36, 1],
          },
        }}
        exit={{
          opacity: 0,
          transition: {
            duration: fadeDuration,
            ease: reduceMotion ? "linear" : [0.4, 0, 1, 1],
          },
        }}
        className="min-w-0 w-full"
      >
        <HomeShell layoutMode={layoutMode} revealMotion={revealMotion} />
      </motion.div>
    </AnimatePresence>
  );
}

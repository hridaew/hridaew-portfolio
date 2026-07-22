"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { HeroCard } from "./HeroCard";
import { BioSection } from "./BioSection";
import { ToolkitSection } from "./ToolkitSection";
import { WorkSection } from "./WorkSection";
import { ObscuraLiquidGlassFilterSvg } from "./ObscuraLiquidGlassFilterSvg";
import { HOME_COLUMN, HOME_HERO_BLEED } from "./homeGrid";
import { ENABLE_WAFFLINGS_SECTION } from "@/lib/site-toggles";
import { RevealOnLoad } from "./RevealOnLoad";

const WafflingsSection = dynamic(
  () => import("./WafflingsSection").then((m) => m.WafflingsSection),
  { ssr: false },
);

export function HomePage() {
  const homeRootRef = useRef<HTMLDivElement>(null);

  const onHomePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
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
  }, []);

  const onHomePointerLeave = useCallback(() => {
    const el = homeRootRef.current;
    if (!el) return;
    el.style.setProperty("--home-dot-heat", "0");
  }, []);

  return (
    <div
      ref={homeRootRef}
      data-home-cheat-skin
      className="relative isolate min-h-screen min-w-0 bg-[#0c0c0e] text-white [--home-dot-x:50%] [--home-dot-y:50%] [--home-dot-heat:0]"
      onPointerMove={onHomePointerMove}
      onPointerLeave={onHomePointerLeave}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 min-h-full" aria-hidden>
        <div className="home-page-dot-mesh absolute inset-0 min-h-full" />
        <div className="home-page-dot-mesh-pop absolute inset-0 min-h-full" />
      </div>
      <div className="relative z-[1] min-w-0">
        {/* One shared SVG filter for Obscura liquid lens + hero sketch orbs (Chromium). */}
        <ObscuraLiquidGlassFilterSvg />
        <div className={HOME_COLUMN}>
          {/*
            One flex stack so hero→bio and bio→work share the same gap.
            (Separate mt-* on RevealOnLoad children was collapsing / fighting the portaled hero.)
          */}
          <div className="flex flex-col gap-[72px] pt-[80px]">
            <RevealOnLoad delay={0.05}>
              <div className={HOME_HERO_BLEED}>
                <HeroCard />
              </div>
            </RevealOnLoad>

            <RevealOnLoad delay={0.2}>
              <div className="relative z-0">
                <BioSection />
              </div>
            </RevealOnLoad>

            <RevealOnLoad delay={0.35}>
              <WorkSection />
            </RevealOnLoad>

            <RevealOnLoad delay={0.5}>
              <ToolkitSection />
            </RevealOnLoad>
          </div>

          {/* Wafflings */}
          {ENABLE_WAFFLINGS_SECTION && (
            <RevealOnLoad delay={0.65}>
              <div className="mt-[120px] min-w-0">
                <WafflingsSection />
              </div>
            </RevealOnLoad>
          )}
        </div>
      </div>
    </div>
  );
}

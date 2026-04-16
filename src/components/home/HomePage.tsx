"use client";

import dynamic from "next/dynamic";
import { HeroCard } from "./HeroCard";
import { BioSection } from "./BioSection";
import { ToolkitSection } from "./ToolkitSection";
import { WorkSection } from "./WorkSection";
import { HOME_COLUMN, HOME_HERO_BLEED } from "./homeGrid";
import { ENABLE_WAFFLINGS_SECTION } from "@/lib/site-toggles";
import { RevealOnLoad } from "./RevealOnLoad";

const WafflingsSection = dynamic(
  () => import("./WafflingsSection").then((m) => m.WafflingsSection),
  { ssr: false },
);

export function HomePage() {
  return (
    <div data-home-cheat-skin className="min-h-screen min-w-0 bg-[#0c0c0e] text-white">
      <div className={HOME_COLUMN}>
        {/* Hero card with animated orbs */}
        <RevealOnLoad delay={0.05}>
          <div className="pt-[112px]">
            <div className={HOME_HERO_BLEED}>
              <HeroCard />
            </div>
          </div>
        </RevealOnLoad>

        {/* Bio — stays under hero slot; expanded hero overlays in z-index */}
        <RevealOnLoad delay={0.2}>
          <div className="relative z-0 mt-[64px]">
            <BioSection />
          </div>
        </RevealOnLoad>

        {/* Current Toolkit */}
        <RevealOnLoad delay={0.35}>
          <div className="mt-[72px]">
            <ToolkitSection />
          </div>
        </RevealOnLoad>

        {/* Work — project galleries (mt matches WorkSection gap between "Work" label and first project) */}
        <RevealOnLoad delay={0.5}>
          <div className="mt-[120px]">
            <WorkSection />
          </div>
        </RevealOnLoad>

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
  );
}

"use client";

import dynamic from "next/dynamic";
import { HeroCard } from "./HeroCard";
import { BioSection } from "./BioSection";
import { ToolkitSection } from "./ToolkitSection";
import { WorkSection } from "./WorkSection";
import { HOME_COLUMN, HOME_HERO_BLEED } from "./homeGrid";
import { ENABLE_WAFFLINGS_SECTION } from "@/lib/site-toggles";

const WafflingsSection = dynamic(
  () => import("./WafflingsSection").then((m) => m.WafflingsSection),
  { ssr: false },
);

export function HomePage() {
  return (
    <div className="min-h-screen min-w-0 bg-[#0c0c0e] text-white">
      <div className={HOME_COLUMN}>
        {/* Hero card with animated orbs */}
        <div className="pt-[112px]">
          <div className={HOME_HERO_BLEED}>
            <HeroCard />
          </div>
        </div>

        {/* Bio — stays under hero slot; expanded hero overlays in z-index */}
        <div className="relative z-0 mt-[64px]">
          <BioSection />
        </div>

        {/* Current Toolkit */}
        <div className="mt-[72px]">
          <ToolkitSection />
        </div>

        {/* Work — project galleries (mt matches WorkSection gap between “Work” label and first project) */}
        <div className="mt-[120px]">
          <WorkSection />
        </div>

        {/* Wafflings */}
        {ENABLE_WAFFLINGS_SECTION && (
          <div className="mt-[120px] min-w-0">
            <WafflingsSection />
          </div>
        )}
      </div>
    </div>
  );
}

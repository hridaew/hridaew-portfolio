"use client";

import { useEffect } from "react";
import { LightboxProvider } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { Domis2CaseStudyBody } from "@/components/domis/Domis2CaseStudyBody";
import { DomisLiveFonts, HeroProductShot } from "@/components/domis/live";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { SITE_COLUMN } from "@/components/home/homeGrid";
import "@/components/domis/domis-case-study.css";

const sidebarSections = [
  { id: "hero", label: "Intro", number: "00" },
  { id: "problem", label: "Problem", number: "01" },
  { id: "principle", label: "Principle", number: "02" },
  { id: "known", label: "The home", number: "03" },
  { id: "address", label: "Address", number: "04" },
  { id: "appliance", label: "Appliance", number: "05" },
  { id: "report", label: "Report", number: "06" },
  { id: "systems", label: "Systems", number: "07" },
  { id: "outcome", label: "Outcome", number: "08" },
];

/**
 * Domis case study v2 preview — rewritten arc for comparison with /domis.
 * Not linked from the homepage; open `/domis2` directly.
 */
export default function Domis2Page() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <LightboxProvider>
        <div className="site-editorial min-h-screen w-full relative overflow-x-hidden selection:bg-white/10 selection:text-white font-sans antialiased bg-[#0c0c0e] text-white">
          <StickySidebar sections={sidebarSections} variant="dark" />

          {/* ─── HERO — product craft in the first viewport ─── */}
          <section
            id="hero"
            className="relative pt-32 pb-16 md:pt-40 md:pb-24"
          >
            <div className={SITE_COLUMN}>
              <div className="relative w-full min-w-0 text-left flex flex-col gap-8 md:gap-10">
                <HeroTextAnimation
                  variant="wave"
                  className="type-h1 text-left text-white"
                >
                  Domis
                </HeroTextAnimation>

                <Reveal delay={0.15}>
                  <p className="site-body max-w-[560px] text-white/70">
                    Founding Product Designer on a home maintenance platform —
                    helping people understand their house and take care of it
                    without the busywork getting in the way.
                  </p>
                </Reveal>

                {/* Mobile: real Home tab capture */}
                <Reveal delay={0.2} className="md:hidden">
                  <figure className="m-0 w-full">
                    <div className="overflow-hidden rounded-2xl bg-[#ff5a5b] px-6 py-8">
                      <img
                        src="/assets/domis/hero-mobile.png"
                        alt="Domis home tab — Steph’s Place with upcoming tasks and Domis Recommends"
                        width={473}
                        height={1024}
                        className="mx-auto h-auto w-full max-w-[280px] object-contain"
                        draggable={false}
                      />
                    </div>
                  </figure>
                </Reveal>

                {/* Desktop: product composition in first viewport */}
                <Reveal delay={0.2} className="hidden md:block">
                  <DomisLiveFonts className="domis-cs w-full">
                    <figure className="m-0 w-full">
                      <div className="dcs-media dcs-media-fit">
                        <HeroProductShot />
                      </div>
                    </figure>
                  </DomisLiveFonts>
                </Reveal>

                <Reveal delay={0.3}>
                  <div className="flex flex-wrap justify-start gap-x-8 gap-y-3 site-body text-white/70">
                    <div>
                      <span className="site-label text-white/40 case-study-meta-line-mb block text-left">
                        Role
                      </span>
                      Founding Product Designer
                    </div>
                    <div>
                      <span className="site-label text-white/40 case-study-meta-line-mb block text-left">
                        Timeline
                      </span>
                      2024 &mdash;
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.35}>
                  <div className="flex flex-wrap case-study-grid-gap-dense">
                    {["Consumer App", "AI", "0-to-1", "Shipped"].map((tag) => (
                      <span
                        key={tag}
                        className="site-label rounded-full border border-white/10 px-3 py-1.5 text-white/60 bg-white/5 text-left"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <div className={SITE_COLUMN} aria-hidden>
            <div className="h-px w-full bg-white/10" />
          </div>

          <Domis2CaseStudyBody />

          <div className="h-12" />
        </div>
      </LightboxProvider>
      <CaseStudyPill projectSlug="domis" />
      <StickyNotes page="domis2" />
    </>
  );
}

"use client";

import { useEffect } from "react";
import { LightboxProvider } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { DomisCaseStudyBody } from "@/components/domis/DomisCaseStudyBody";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { SITE_COLUMN } from "@/components/home/homeGrid";

const sidebarSections = [
    { id: "hero", label: "Intro", number: "00" },
    { id: "overview", label: "Overview", number: "01" },
    { id: "principle", label: "Principle", number: "02" },
    { id: "address", label: "Address", number: "03" },
    { id: "appliance", label: "Appliance", number: "04" },
    { id: "report", label: "Report", number: "05" },
];

export default function DomisPage() {
    useEffect(() => {
        // Keep pages visually consistent with the home (dark) palette.
        document.documentElement.classList.add("dark");
    }, []);

    return (
        <>
            <LightboxProvider>
                <div className="site-editorial min-h-screen w-full relative overflow-x-hidden selection:bg-white/10 selection:text-white font-sans antialiased bg-[#0c0c0e] text-white">
                    <StickySidebar sections={sidebarSections} variant="dark" />

                    {/* ─── HERO ─── */}
                    <section
                        id="hero"
                        className="relative pt-32 pb-16 md:pt-40 md:pb-24"
                    >
                        <div className={SITE_COLUMN}>
                        <div className="relative w-full min-w-0 text-left flex flex-col gap-10">
                            <Reveal>
                                <img
                                    src="/assets/domis/domis_icon.png"
                                    alt="Domis app icon"
                                    className="size-20 shrink-0 rounded-[22%] object-cover object-center shadow-lg ring-1 ring-white/10 md:size-24"
                                    draggable={false}
                                />
                            </Reveal>

                            <HeroTextAnimation
                                variant="wave"
                                className="type-h1 text-left text-white"
                            >
                                Domis
                            </HeroTextAnimation>

                            <Reveal delay={0.2}>
                                <p className="site-body max-w-[560px] text-white/70">
                                    I&rsquo;m the Product Designer at Domis
                                    &mdash; creating an AI-powered home
                                    maintenance platform that makes it
                                    delightful for homeowners to take care of
                                    their homes and take pride in doing it
                                    right.
                                </p>
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

                    {/* ─── CASE STUDY BODY (prototype content) ─── */}
                    <DomisCaseStudyBody />

                    {/* Bottom spacer */}
                    <div className="h-12" />
                </div>
            </LightboxProvider>
            <CaseStudyPill projectSlug="domis" />
            <StickyNotes page="domis" />
        </>
    );
}

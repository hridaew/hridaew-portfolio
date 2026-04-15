"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { FeatureCard } from "@/components/domis/FeatureCard";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { SITE_COLUMN } from "@/components/home/homeGrid";

const sidebarSections = [
    { id: "hero", label: "Intro", number: "00" },
    { id: "features", label: "Features", number: "01" },
    { id: "download", label: "Download", number: "02" },
];

type DomisFeature = {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    imageClassName?: string;
};

const features: DomisFeature[] = [
    {
        title: "Personalization",
        description:
            "Domis uses AI to personalize your tasks and the whole experience so the app feels like yours.",
        imageSrc: "/assets/domis/personalization.png",
        imageAlt: "Domis UI: personalized home and tasks tailored to the homeowner",
    },
    {
        title: "Smart Recommendations",
        description:
            "Context-aware nudges from weather, season, and your property so the right upkeep shows up at the right time.",
        imageSrc: "/assets/domis/smart.png",
        imageAlt: "Domis UI: smart recommendations and scheduling",
    },
    {
        title: "Document Processor",
        description:
            "Long inspection reports become clear tasks and highlights in seconds. Less reading, more doing.",
        imageSrc: "/assets/domis/docproc.png",
        imageAlt:
            "Domis: inspection report flows into Tasks Found, core systems, and actionable checklist items",
    },
    {
        title: "Appliance Scanner",
        description:
            "Point the camera at an appliance to log it with AI and pull useful details without typing everything by hand.",
        imageSrc: "/assets/domis/scanner.png",
        imageAlt: "Domis UI: appliance scan and captured item details",
    },
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

                    {/* ─── AI FEATURES ─── */}
                    <section
                        id="features"
                        className={`${SITE_COLUMN} case-study-section-y-b`}
                    >
                        <Reveal>
                            <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                What We&apos;re Building
                            </span>
                            <h2 className="site-chapter-heading case-study-hero-copy-mb text-white">
                                AI for Every Homeowner
                            </h2>
                            <p className="site-body max-w-[600px] text-left text-white/65">
                                Domis uses AI across the product to turn
                                overwhelming home ownership into manageable,
                                personalized action. Here&apos;s what
                                I&apos;ve been designing.
                            </p>
                        </Reveal>

                        <div className="case-study-subsection-mt case-study-grid-gap grid grid-cols-1 items-start md:grid-cols-2">
                            {features.map((feature, i) => (
                                <Reveal key={feature.title} delay={0.05 * i} className="w-full min-w-0">
                                    <FeatureCard
                                        title={feature.title}
                                        description={feature.description}
                                        imageSrc={feature.imageSrc}
                                        imageAlt={feature.imageAlt}
                                        imageClassName={feature.imageClassName}
                                        variant="dark"
                                    />
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* ─── App Store CTA ─── */}
                    <section id="download" className={`${SITE_COLUMN} pb-16 md:pb-24 text-left`}>
                        <Reveal>
                            <a
                                href="https://apps.apple.com/us/app/domis-home-maintenance/id6746832568"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white site-body hover:bg-white/10 transition-colors shadow-lg shadow-black/25"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <span className="site-body">
                                    Download on the App Store
                                </span>
                            </a>
                        </Reveal>
                    </section>

                    {/* Bottom spacer */}
                    <div className="h-12" />
                </div>
            </LightboxProvider>
            <CaseStudyPill projectSlug="domis" />
            <StickyNotes page="domis" />
        </>
    );
}

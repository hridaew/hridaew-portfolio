"use client";

import { LightboxProvider } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { DomisCaseStudyBody } from "@/components/domis/DomisCaseStudyBody";
import { SITE_COLUMN } from "@/components/home/homeGrid";
import "@/components/domis/domis-case-study.css";

export function DomisCaseStudyContent() {
    return (
        <LightboxProvider>
            {/* ─── HERO ─── */}
            <section id="hero" className="relative pt-32 pb-16 md:pt-40 md:pb-24">
                <div className={SITE_COLUMN}>
                    <div className="relative w-full min-w-0 text-left flex flex-col gap-10">
                        <HeroTextAnimation
                            variant="wave"
                            className="type-h1 text-left text-ink"
                        >
                            Domis
                        </HeroTextAnimation>

                        <Reveal delay={0.2}>
                            <p className="site-body max-w-[560px] text-ink-secondary">
                                I&rsquo;m the Product Designer at Domis, a home
                                maintenance platform that helps people understand
                                their house and take care of it without the
                                busywork getting in the way.
                            </p>
                        </Reveal>

                        {/* Mobile hero — real Home tab capture; desktop keeps text-first intro */}
                        <Reveal delay={0.25} className="md:hidden">
                            <figure className="m-0 w-full">
                                <div className="dcs-domis-red overflow-hidden rounded-2xl px-6 py-8">
                                    <img
                                        src="/assets/domis/hero-mobile.png"
                                        alt="Domis home tab — Steph’s Place with upcoming tasks and Domis Recommends"
                                        width={473}
                                        height={1024}
                                        className="relative z-[1] mx-auto h-auto w-full max-w-[280px] object-contain"
                                        draggable={false}
                                    />
                                </div>
                            </figure>
                        </Reveal>

                        <Reveal delay={0.3}>
                            <div className="flex flex-wrap justify-start gap-x-8 gap-y-3 site-body text-ink-secondary">
                                <div>
                                    <span className="site-label text-ink-subtle case-study-meta-line-mb block text-left">
                                        Role
                                    </span>
                                    Founding Product Designer
                                </div>
                                <div>
                                    <span className="site-label text-ink-subtle case-study-meta-line-mb block text-left">
                                        Timeline
                                    </span>
                                    2024 &mdash;
                                </div>
                            </div>
                        </Reveal>
                        <Reveal delay={0.35}>
                            <div className="flex flex-wrap case-study-grid-gap-dense">
                                {["Consumer App", "AI", "0-to-1", "Shipped"].map(
                                    (tag) => (
                                        <span
                                            key={tag}
                                            className="site-label rounded-full border border-ink/[0.1] px-3 py-1.5 text-ink-secondary bg-ink/[0.04] text-left"
                                        >
                                            {tag}
                                        </span>
                                    )
                                )}
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            <div className={SITE_COLUMN} aria-hidden>
                <div className="h-px w-full bg-ink/[0.05]" />
            </div>

            {/* ─── CASE STUDY BODY (prototype content) ─── */}
            <DomisCaseStudyBody />

            {/* Bottom spacer */}
            <div className="h-12" />
        </LightboxProvider>
    );
}

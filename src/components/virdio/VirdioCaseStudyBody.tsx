"use client";

import { cn } from "@/lib/utils";
import { SITE_COLUMN } from "@/components/home/homeGrid";
import { ParallaxHero } from "@/components/virdio/ParallaxHero";
import { ScrollRevealFlow } from "@/components/virdio/ScrollRevealFlow";
import { ConePlayground } from "@/components/virdio/ConePlayground";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { ARMosaic } from "@/components/virdio/ARMosaic";
import { PunchBag } from "@/components/virdio/PunchBag";
import { TextReveal } from "@/components/TextReveal";
import { Reveal } from "@/components/Reveal";
import { TLDRCard } from "@/components/virdio/TLDRCard";
import { MarketComparison } from "@/components/virdio/MarketComparison";
import { PlatformSpectrum } from "@/components/virdio/PlatformSpectrum";
import { DecisionCards } from "@/components/virdio/DecisionCards";
import { DeferredVideo } from "@/components/DeferredVideo";

export function VirdioCaseStudyBody() {
    return (
        <LightboxProvider>
                {/* ═══════════════════════════════════════════════════════
                    SECTION 00 — HERO + TL;DR + VIDEO
                ═══════════════════════════════════════════════════════ */}
                <div className="relative">
                    <ParallaxHero />
                </div>

                {/* TL;DR Card */}
                <section className={cn("relative z-20 -mt-16 md:-mt-20 case-study-subsection-gap", SITE_COLUMN)}>
                    <Reveal>
                        <TLDRCard />
                    </Reveal>
                </section>

                {/* Hero video — same loop + poster as Virdio card on the home page */}
                <section className={cn("relative z-20 case-study-section-gap", SITE_COLUMN)}>
                    <Reveal>
                        <div className="aspect-video overflow-hidden rounded-2xl border border-ink/[0.08] shadow-e3">
                            <DeferredVideo
                                src="/assets/home/virdio-hero-crop.mp4"
                                poster="/assets/home/virdio-ar-desktop.webp"
                                className="work-gallery-card-video h-full w-full select-none object-cover outline-none"
                                loop
                                muted
                                tabIndex={-1}
                                controls={false}
                                controlsList="nodownload nofullscreen noremoteplayback"
                                disablePictureInPicture
                                disableRemotePlayback
                                aria-label="Virdio AR desktop hero video"
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </div>
                    </Reveal>
                </section>


                {/* ═══════════════════════════════════════════════════════
                    SECTION 01 — PROBLEM + CONTEXT
                ═══════════════════════════════════════════════════════ */}
                <div className={SITE_COLUMN}>
                    <section id="problem" className="case-study-section-y border-t border-ink/[0.08]">

                        {/* Section Header */}
                        <div className="w-full min-w-0 text-left flex flex-col case-study-heading-trail-gap case-study-subsection-gap">
                            <Reveal>
                                <span className="site-label text-ink-subtle">01</span>
                            </Reveal>
                            <h2 className="site-chapter-heading text-ink text-left">
                                <TextReveal>Expensive hardware was the barrier to engaging home fitness</TextReveal>
                            </h2>
                        </div>

                        <div className="w-full min-w-0 case-study-block-gap">
                            <Reveal>
                                <div className="rounded-2xl bg-paper-raised ring-1 ring-ink/[0.07] shadow-e2 p-6 md:p-8">
                                    <p className="site-body text-ink-secondary text-left">
                                        &ldquo;<span className="font-bold text-ink">How might we</span> make AR workout overlays usable, readable, and motivating across wildly different screen sizes, processing capabilities, and home environments?&rdquo;
                                    </p>
                                </div>
                            </Reveal>
                        </div>

                        {/* Problem Narrative */}
                        <div className="w-full min-w-0 case-study-prose-stack case-study-block-gap">
                            <Reveal>
                                <p className="site-body text-ink-muted">
                                    In 2021, the most engaging home fitness options were gated by expensive equipment. Peloton needed a $1,500 bike, Mirror needed a $1,500 screen, and everyone else was stuck with passive YouTube videos and zero performance tracking.
                                </p>
                            </Reveal>
                            <Reveal delay={0.05}>
                                <p className="site-body text-ink-muted">
                                    Virdio&rsquo;s machine vision could read body poses through a standard camera and simulate exercise equipment in AR. That meant we could deliver Peloton-grade engagement to anyone with a laptop or phone, no hardware required.
                                </p>
                            </Reveal>
                        </div>

                        {/* Market Comparison */}
                        <Reveal>
                            <MarketComparison className="case-study-block-gap px-0" />
                        </Reveal>

                        {/* ── Context Sub-section ── */}
                        <div className="w-full min-w-0 case-study-block-gap">
                            <Reveal>
                                <h3 className="site-subheading case-study-heading-trail-mb text-ink">
                                    An early-stage startup, one designer, five platforms
                                </h3>
                            </Reveal>
                            <div className="case-study-prose-stack flex flex-col">
                                <Reveal delay={0.05}>
                                    <p className="site-body text-ink-muted">
                                        Virdio had been licensing its machine vision tech to gyms for remote AR classes. I was brought on as the product designer to turn that capability into a direct-to-consumer subscription app, accessible from any device.
                                    </p>
                                </Reveal>
                                <Reveal delay={0.1}>
                                    <p className="site-body text-ink-muted">
                                        I had to ship across iOS, Android, web, desktop, Apple Watch, and smart TV on an aggressive timeline, with no existing design system and an engineering team 12 hours ahead of me on async collaboration.
                                    </p>
                                </Reveal>
                            </div>
                        </div>

                        {/* Device Mockups — Desktop (cone calibration) + Mobile (class browsing) */}
                        <Reveal>
                            <div className="flex flex-col items-start case-study-grid-gap md:flex-row">
                                <div className="rounded-2xl overflow-hidden border border-ink/[0.08]">
                                    <LightboxImage
                                        src="/assets/virdio/desktop_mockup.png"
                                        alt="Desktop app showing room calibration: Diagonal cones step with walk-to-zone instruction"
                                        className="w-full h-auto object-contain"
                                        draggable={false}
                                        hoverScale={1.03}
                                    />
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-ink/[0.08] md:self-stretch flex items-center">
                                    <LightboxImage
                                        src="/assets/virdio/mobile_mockup.png"
                                        alt="Mobile app: class browsing with Live and On-demand tabs and category filters"
                                        className="h-full w-auto object-contain max-h-[500px] md:max-h-none"
                                        draggable={false}
                                        hoverScale={1.03}
                                    />
                                </div>
                            </div>
                        </Reveal>
                    </section>
                </div>


                {/* ═══════════════════════════════════════════════════════
                    SECTION 02 — INSIGHT + DECISION
                ═══════════════════════════════════════════════════════ */}
                <div className={SITE_COLUMN}>
                    <section id="insight" className="case-study-section-y border-t border-ink/[0.08]">

                        {/* Section Header */}
                        <div className="w-full min-w-0 text-left flex flex-col case-study-heading-trail-gap case-study-subsection-gap">
                            <Reveal>
                                <span className="site-label text-ink-subtle">02</span>
                            </Reveal>
                            <h2 className="site-chapter-heading text-ink text-left">
                                <TextReveal>The most accessible device delivered the most compromised experience</TextReveal>
                            </h2>
                        </div>

                        {/* Insight Narrative */}
                        <div className="w-full min-w-0 case-study-prose-stack case-study-block-gap">
                            <Reveal>
                                <p className="site-body text-ink-muted">
                                    I tested prototypes with our internal advisory board of fitness trainers and physicians. The turning point: the mobile phone, our easiest entry point, was inherently the worst platform for the core AR workout.
                                </p>
                            </Reveal>
                            <Reveal delay={0.05}>
                                <p className="site-body text-ink-muted">
                                    On a small screen, AR overlays competed with the video feed, and pose detection needed distance from a camera that users typically placed close or on unstable surfaces.
                                </p>
                            </Reveal>
                            <Reveal delay={0.1}>
                                <p className="site-body text-ink-muted">
                                    If mobile was the front door and mobile delivered the lowest-quality version of our differentiator, first impressions would undermine the whole value proposition.
                                </p>
                            </Reveal>
                        </div>

                        {/* Platform Spectrum Visual */}
                        <Reveal>
                            <PlatformSpectrum className="case-study-section-gap" />
                        </Reveal>

                        {/* ── Decision Sub-section ── */}
                        <div className="w-full min-w-0 case-study-block-gap">
                            <Reveal>
                                <h3 className="site-subheading case-study-heading-trail-mb text-ink">
                                    Platform strategy: launching everywhere vs. focusing on the best experience
                                </h3>
                            </Reveal>
                            <div className="case-study-prose-stack flex flex-col">
                                <Reveal delay={0.05}>
                                    <p className="site-body text-ink-muted">
                                        I pushed for a desktop-first approach, focusing our limited resources on making the larger-screen experience exceptional.
                                    </p>
                                </Reveal>
                                <Reveal delay={0.1}>
                                    <p className="site-body text-ink-muted">
                                        The CEO was adamant about launching on all platforms at once. Multi-platform availability was a competitive differentiator, and mobile was still the most accessible entry point for browsing and booking.
                                    </p>
                                </Reveal>
                            </div>
                        </div>

                        {/* Decision Cards */}
                        <Reveal>
                            <DecisionCards />
                        </Reveal>
                    </section>
                </div>


                {/* ═══════════════════════════════════════════════════════
                    SECTION 03 — SOLUTION
                ═══════════════════════════════════════════════════════ */}
                <section id="solution" className="case-study-section-y-t border-t border-ink/[0.08]">
                    <div className={SITE_COLUMN}>
                        {/* Section Header */}
                        <div className="w-full min-w-0 text-left flex flex-col case-study-heading-trail-gap case-study-subsection-gap">
                            <Reveal>
                                <span className="site-label text-ink-subtle">03</span>
                            </Reveal>
                            <h2 className="site-chapter-heading text-ink text-left">
                                <TextReveal>AR workout classes anyone could set up in their living room</TextReveal>
                            </h2>
                            <Reveal delay={0.1}>
                                <p className="site-body text-ink-muted text-left">
                                    I designed an end-to-end experience that made AR fitness accessible regardless of device or home environment: from browsing and booking to live workouts with AI-powered pose detection and AR equipment overlays, all through an existing camera.
                                </p>
                            </Reveal>
                        </div>

                        {/* ─────────────────────────────────────────────
                            SUB-SECTION 3A — ROOM SETUP
                        ───────────────────────────────────────────── */}
                        <div id="solution-setup">
                            <div className="w-full min-w-0 case-study-block-gap">
                                <Reveal>
                                    <h3 className="site-subheading case-study-heading-trail-mb text-ink">
                                        Room Setup & Calibration
                                    </h3>
                                </Reveal>
                                <div className="case-study-prose-stack flex flex-col">
                                    <Reveal delay={0.05}>
                                        <p className="site-body text-ink-muted">
                                            Users had to calibrate their camera and define their play space. I made it approachable: a visual guide asks users to center themselves on screen with clear tilt indicators.
                                        </p>
                                    </Reveal>
                                    <Reveal delay={0.1}>
                                        <p className="site-body text-ink-muted">
                                            For room calibration, virtual cones appear on screen and users simply walk to the corners of their space, ending in a satisfying green checkmark confirmation.
                                        </p>
                                    </Reveal>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ScrollRevealFlow — Full Width (MUST stay outside max-w container for GSAP pin) */}
                    <div className="case-study-block-gap">
                        <ScrollRevealFlow />
                    </div>

                    <div className={SITE_COLUMN}>
                        {/* Cone-walking moment */}
                        <div className="case-study-block-gap">
                            <Reveal>
                                <div className="flex flex-col gap-4 md:gap-5">
                                    <div className="flex w-full flex-col items-stretch case-study-grid-gap">
                                        <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-ink/[0.08]">
                                            <LightboxImage
                                                src="/assets/virdio/phone_setup_mid.png"
                                                alt="Move to the other cone: directional arrows guide the user between calibration cones"
                                                className="h-auto w-full object-contain"
                                                draggable={false}
                                                hoverScale={1.03}
                                            />
                                        </div>
                                        <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-ink/[0.08]">
                                            <LightboxImage
                                                src="/assets/virdio/phone_setup_end.png"
                                                alt="Room Setup Complete: four purple cones define the workout space"
                                                className="h-auto w-full object-contain"
                                                draggable={false}
                                                hoverScale={1.03}
                                            />
                                        </div>
                                    </div>
                                    <p className="site-gallery-caption w-full min-w-0 text-left text-ink-subtle">
                                        Mobile version of the room calibration had more prominent text and larger UI elements so the user could spot them better on a smaller screen.
                                    </p>
                                </div>
                            </Reveal>
                        </div>

                        {/* What if setup fails */}
                        <div className="case-study-block-gap">
                            <Reveal>
                                <div className="flex w-full flex-col gap-6 md:gap-8">
                                    <div className="mx-auto w-full min-w-0">
                                        <h3 className="site-subheading case-study-heading-trail-mb text-ink">
                                            What if setup fails?
                                        </h3>
                                    </div>
                                    <div className="mx-auto flex w-full min-w-0 flex-col gap-4 md:gap-5">
                                        <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                            <LightboxImage
                                                src="/assets/virdio/calibration_flow.png"
                                                alt="Calibration flow: recovery paths when tracking is lost, skip setup, and in-class failure"
                                                className="block h-auto w-full object-contain"
                                                draggable={false}
                                                hoverScale={1.02}
                                            />
                                        </div>
                                        <p className="site-gallery-caption text-left text-ink-subtle">
                                            This flow covers what happens if calibration fails during a class or if a user skips setup: how the product recovers, what users see next, and when they can retry or continue with degraded AR.
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        </div>

                        {/* No-blame UI (recovery / framing during setup issues) */}
                        <div className="case-study-block-gap">
                            <Reveal>
                                <div className="mx-auto flex w-full min-w-0 flex-col gap-4 md:gap-5">
                                    <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                        <LightboxImage
                                            src="/assets/virdio/step_out_of_frame.png"
                                            alt="Did you step out of frame: non-judgmental prompt with Ignore and Remind options"
                                            className="h-auto w-full object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                    <p className="site-gallery-caption text-left text-ink-subtle">
                                        No-blame UI: &ldquo;Did you step out of frame?&rdquo; frames it as a system state, not a user error. Options let users ignore or get reminded later.
                                    </p>
                                </div>
                            </Reveal>
                        </div>

                        {/* ConePlayground interactive */}
                        <div className="case-study-block-gap">
                            <Reveal>
                                <div className="flex w-full flex-col gap-6 md:gap-8">
                                    <div className="mx-auto w-full min-w-0 text-left">
                                        <p className="site-label case-study-tight-trail-mb text-left text-ink-subtle">
                                            Interactive
                                        </p>
                                        <h3 className="site-subheading case-study-heading-trail-mb text-ink">
                                            Try It: Calibrate Your Space
                                        </h3>
                                    </div>
                                    <div className="mx-auto w-full min-w-0">
                                        <ConePlayground />
                                    </div>
                                </div>
                            </Reveal>
                        </div>

                        {/* ─────────────────────────────────────────────
                            SUB-SECTION 3B — LIVE WORKOUT HUD
                        ───────────────────────────────────────────── */}
                        <div id="solution-hud" className="case-study-block-gap">
                            <div className="w-full min-w-0 case-study-block-gap">
                                <Reveal>
                                    <h3 className="site-subheading case-study-heading-trail-mb text-ink">
                                        Live Workout HUD
                                    </h3>
                                </Reveal>
                                <div className="case-study-prose-stack flex flex-col">
                                    <Reveal delay={0.05}>
                                        <p className="site-body text-ink-muted">
                                            Machine vision read body poses in real time, counting actions like punches, squats, and jumps. AR artifacts doubled as affordances that showed users the move, and as hit boxes that registered each completed rep.
                                        </p>
                                    </Reveal>
                                    <Reveal delay={0.1}>
                                        <p className="site-body text-ink-muted">
                                            I designed platform-specific HUDs. Desktop used the landscape canvas to surface metrics, class info, and participant data at once. Mobile collapsed and expanded contextually to preserve workout visibility on a small screen.
                                        </p>
                                    </Reveal>
                                </div>
                            </div>

                            {/* Hero shot — Desktop HUD at its best */}
                            <Reveal>
                                <div className="case-study-hero-bump-mb flex flex-col gap-4 md:gap-5">
                                    <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                        <LightboxImage
                                            src="/assets/virdio/hero_ui.png"
                                            alt="Desktop AR HUD: split squat with metrics panel, timer, and AR floor track"
                                            className="h-auto w-full object-contain"
                                            draggable={false}
                                            hoverScale={1.02}
                                        />
                                    </div>
                                    <p className="site-gallery-caption text-left text-ink-subtle">
                                        The desktop AR experience at its best: full metrics, timer, and AR equipment track visible at once.
                                    </p>
                                </div>
                            </Reveal>

                            {/* Desktop vs Mobile HUD comparison */}
                            <Reveal>
                                <div className="flex flex-col gap-4 md:gap-5">
                                    <div className="grid grid-cols-1 items-center case-study-grid-gap md:grid-cols-[3fr_2fr]">
                                        <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                            <LightboxImage
                                                src="/assets/virdio/ar_class_live.png"
                                                alt="Desktop HUD: full toolbar, participant buttons, Show stream controls"
                                                className="h-auto w-full object-contain"
                                                draggable={false}
                                            />
                                        </div>
                                        <div className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper-sunken">
                                            <LightboxImage
                                                src="/assets/virdio/mobile_ui.png"
                                                alt="Mobile HUD: condensed metrics, hamburger menu, maximized video"
                                                className="h-auto w-full object-contain"
                                                draggable={false}
                                            />
                                        </div>
                                    </div>
                                    <p className="site-gallery-caption text-left text-ink-subtle">
                                        Desktop shows everything at once. Mobile collapses to preserve workout visibility.
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    {/* AR Exercise Gallery — Full Width */}
                    <ARMosaic className="case-study-block-gap" />

                    <div className={SITE_COLUMN}>
                        {/* ─────────────────────────────────────────────
                            SUB-SECTION 3C — SCHEDULING & DESIGN SYSTEM
                        ───────────────────────────────────────────── */}
                        <div id="solution-system">
                            <div className="w-full min-w-0 case-study-block-gap">
                                <Reveal>
                                    <h3 className="site-subheading case-study-heading-trail-mb text-ink">
                                        Scheduling & Design System
                                    </h3>
                                </Reveal>
                                <div className="case-study-prose-stack flex flex-col">
                                    <Reveal delay={0.05}>
                                        <p className="site-body text-ink-muted">
                                            I built the design system from the ground up so it stayed consistent across all five platforms, governing color, typography, button styles, and component behavior.
                                        </p>
                                    </Reveal>
                                    <Reveal delay={0.1}>
                                        <p className="site-body text-ink-muted">
                                            I used light mode for browsing and discovery, and dark mode for anything class-related. The contrast created a clear psychological shift when users entered the workout.
                                        </p>
                                    </Reveal>
                                </div>
                            </div>

                            {/* Desktop + Mobile scheduling comparison */}
                            <Reveal>
                                <div className="case-study-block-gap">
                                    <div className="grid grid-cols-1 items-start case-study-grid-gap md:grid-cols-[3fr_1fr]">
                                        <div className="rounded-2xl overflow-hidden border border-ink/[0.08] bg-ink/[0.025]">
                                            <LightboxImage
                                                src="/assets/virdio/live_classes_filter.png"
                                                alt="Desktop class browsing: sidebar category filters, day-grouped class list"
                                                className="w-full h-auto object-contain"
                                                draggable={false}
                                            />
                                        </div>
                                        <div className="rounded-2xl overflow-hidden border border-ink/[0.08] bg-ink/[0.025]">
                                            <LightboxImage
                                                src="/assets/virdio/mobile_live_classes.png"
                                                alt="Mobile class browsing: compact class cards with inline category chips"
                                                className="w-full h-auto object-contain"
                                                draggable={false}
                                            />
                                        </div>
                                    </div>
                                    <p className="site-gallery-caption case-study-media-caption-mt text-left text-ink-subtle">
                                        Desktop exposes filters inline for power browsing. Mobile surfaces categories as compact chips.
                                    </p>
                                </div>
                            </Reveal>

                            {/* Schedule View */}
                            <Reveal>
                                <div className="mx-auto w-full min-w-0 case-study-block-gap">
                                    <div className="rounded-2xl overflow-hidden border border-ink/[0.08] bg-ink/[0.025]">
                                        <LightboxImage
                                            src="/assets/virdio/desktop_schedule.png"
                                            alt="My Schedule: calendar widget with booked classes and Join Session CTA"
                                            className="w-full h-auto object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                    <p className="site-gallery-caption case-study-caption-tight-mt text-left text-ink-subtle">
                                        &ldquo;My Schedule&rdquo; connects browsing to action: calendar, booked classes, and a prominent Join Session CTA.
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>


                {/* ═══════════════════════════════════════════════════════
                    SECTION 04 — ROLE & IMPACT
                ═══════════════════════════════════════════════════════ */}
                <div className={SITE_COLUMN}>
                    <section id="role-impact" className="case-study-section-y border-t border-ink/[0.08]">
                        <div className="w-full min-w-0">

                            {/* Section Header */}
                            <div className="text-left flex flex-col case-study-heading-trail-gap case-study-block-gap">
                                <Reveal>
                                    <span className="site-label text-ink-subtle">04</span>
                                </Reveal>
                                <h2 className="site-chapter-heading text-ink text-left">
                                    <TextReveal>Role & Impact</TextReveal>
                                </h2>
                            </div>

                            {/* My Role */}
                            <Reveal>
                                <div className="case-study-block-gap">
                                    <h3 className="site-subheading case-study-heading-trail-mb text-ink">What I Owned</h3>
                                    <ul className="case-study-prose-stack flex flex-col">
                                        {[
                                            "Product designer from concept to launch across iOS, Android, web, desktop, Apple Watch, and smart TV.",
                                            "Built the cross-platform design system from scratch: color, typography, components, and platform-specific adaptations.",
                                            "Led the platform prioritization debate and shaped the desktop-first UX compromise.",
                                            "Wrote detailed interaction and animation specs for async engineering handoff across a 12-hour timezone gap.",
                                        ].map((item, i) => (
                                            <li key={i} className="case-study-grid-gap-dense flex site-body text-ink-muted">
                                                <span className="text-ink-subtle mt-[5px] shrink-0">&#8226;</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>

                            {/* Impact */}
                            <Reveal>
                                <div className="case-study-block-gap">
                                    <h3 className="site-subheading case-study-heading-trail-mb text-ink">Impact</h3>
                                    <div className="case-study-prose-stack">
                                        <p className="site-body text-ink-muted">
                                            The app launched across all planned platforms in mid-2022 to some positive reviews, though consumer adoption stayed modest as the home fitness market cooled from its pandemic peak.
                                        </p>
                                        <p className="site-body text-ink-secondary">
                                            If I could do it over, I would focus on making one platform exceptional with a curated class library, and use that to wow users before expanding.
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </section>
                </div>

                {/* ─── PUNCH BAG INTERACTIVE ─── */}
                <div className={cn("flex justify-center", SITE_COLUMN)}>
                    <Reveal>
                        <PunchBag />
                    </Reveal>
                </div>

                {/* Bottom spacer */}
                <div className="h-32 md:h-40" />
        </LightboxProvider>
    );
}

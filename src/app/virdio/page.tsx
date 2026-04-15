"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SITE_COLUMN } from "@/components/home/homeGrid";
import { ParallaxHero } from "@/components/virdio/ParallaxHero";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { ScrollRevealFlow } from "@/components/virdio/ScrollRevealFlow";
import { ConePlayground } from "@/components/virdio/ConePlayground";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { ARMosaic } from "@/components/virdio/ARMosaic";
import { PunchBag } from "@/components/virdio/PunchBag";
import { TextReveal } from "@/components/TextReveal";
import { Reveal } from "@/components/Reveal";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { TLDRCard } from "@/components/virdio/TLDRCard";
import { MarketComparison } from "@/components/virdio/MarketComparison";
import { PlatformSpectrum } from "@/components/virdio/PlatformSpectrum";
import { DecisionCards } from "@/components/virdio/DecisionCards";

export default function VirdioPage() {
    const pageRootRef = useRef<HTMLDivElement>(null);

    const onPagePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const el = pageRootRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const w = Math.max(1, r.width);
        const h = Math.max(1, r.height);
        const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / w) * 100));
        const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / h) * 100));
        el.style.setProperty("--csp-dot-x", `${x}%`);
        el.style.setProperty("--csp-dot-y", `${y}%`);
        el.style.setProperty("--csp-dot-heat", "1");
    }, []);

    const onPagePointerLeave = useCallback(() => {
        const el = pageRootRef.current;
        if (!el) return;
        el.style.setProperty("--csp-dot-heat", "0");
    }, []);

    useEffect(() => {
        document.documentElement.classList.add("dark");
    }, []);

    return (
        <>
        <LightboxProvider>
            <div
                ref={pageRootRef}
                className="site-editorial isolate relative min-h-screen w-full overflow-x-hidden bg-[#0c0c0e] text-white selection:bg-white/10 selection:text-white font-sans antialiased [--csp-dot-x:50%] [--csp-dot-y:50%] [--csp-dot-heat:0]"
                onPointerMove={onPagePointerMove}
                onPointerLeave={onPagePointerLeave}
            >
                <div className="pointer-events-none absolute inset-0 -z-10 min-h-full" aria-hidden>
                    <div className="case-study-page-dot-mesh absolute inset-0 min-h-full" />
                    <div className="case-study-page-dot-mesh-pop absolute inset-0 min-h-full" />
                </div>

                <div className="relative z-[1] min-h-screen">
                <StickySidebar
                    variant="dark"
                    sections={[
                        { id: "hero", label: "Intro", number: "00" },
                        { id: "problem", label: "Problem", number: "01" },
                        { id: "insight", label: "Insight", number: "02" },
                        { id: "solution", label: "Solution", number: "03" },
                        { id: "role-impact", label: "Role & Impact", number: "04" },
                    ]}
                />

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
                        <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
                            <video
                                src="/assets/home/virdio-hero-crop.mp4"
                                poster="/assets/home/virdio-ar-desktop.png"
                                className="work-gallery-card-video h-full w-full select-none object-cover outline-none"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="auto"
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
                    <section id="problem" className="case-study-section-y border-t border-white/10">

                        {/* Section Header */}
                        <div className="w-full min-w-0 text-left flex flex-col case-study-heading-trail-gap case-study-subsection-gap">
                            <Reveal>
                                <span className="site-label text-white/40">01</span>
                            </Reveal>
                            <h2 className="site-chapter-heading text-white text-left">
                                <TextReveal>Expensive hardware was the barrier to engaging home fitness</TextReveal>
                            </h2>
                        </div>

                        <div className="w-full min-w-0 case-study-block-gap">
                            <Reveal>
                                <p className="site-body font-medium text-white/70 text-left">
                                    &ldquo;How might we make AR workout overlays usable, readable, and motivating across wildly different screen sizes, processing capabilities, and home environments?&rdquo;
                                </p>
                            </Reveal>
                        </div>

                        {/* Problem Narrative */}
                        <div className="w-full min-w-0 case-study-prose-stack case-study-block-gap">
                            <Reveal>
                                <p className="site-body text-white/65">
                                    In 2021, millions of people were working out at home, but the most engaging options required expensive, space-consuming equipment. Peloton needed a $1,500 bike. Mirror needed a $1,500 screen. Everyone else was stuck with pre-recorded YouTube videos and zero performance tracking.
                                </p>
                            </Reveal>
                            <Reveal delay={0.05}>
                                <p className="site-body text-white/65">
                                    Virdio&rsquo;s leadership had machine vision technology that could detect body poses through a standard camera and simulate exercise equipment using AR. The opportunity was enormous: deliver the engagement of a Peloton class to anyone with a laptop or phone, no hardware required.
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
                                <h3 className="site-subheading case-study-heading-trail-mb text-white">
                                    An early-stage startup, one designer, five platforms
                                </h3>
                            </Reveal>
                            <div className="case-study-prose-stack flex flex-col">
                                <Reveal delay={0.05}>
                                    <p className="site-body text-white/65">
                                        Virdio had been licensing its machine vision technology to gyms for remote AR classes. The next step was a direct-to-consumer subscription app, like Peloton but accessible from any device. I was brought on as the sole full-time product designer to take this from zero to launch.
                                    </p>
                                </Reveal>
                                <Reveal delay={0.1}>
                                    <p className="site-body text-white/65">
                                        The product needed to ship on iOS, Android, web, desktop (Mac and Windows), Apple Watch, and smart TVs. The engineering team was fully remote and 12 hours ahead of me, which meant nearly all dev collaboration was asynchronous. There was no existing design system, no prior consumer-facing product, and the timeline was aggressive.
                                    </p>
                                </Reveal>
                            </div>
                        </div>

                        {/* Device Mockups — Desktop (cone calibration) + Mobile (class browsing) */}
                        <Reveal>
                            <div className="flex flex-col items-start case-study-grid-gap md:flex-row">
                                <div className="rounded-2xl overflow-hidden border border-white/10">
                                    <LightboxImage
                                        src="/assets/virdio/desktop_mockup.png"
                                        alt="Desktop app showing room calibration: Diagonal cones step with walk-to-zone instruction"
                                        className="w-full h-auto object-contain"
                                        draggable={false}
                                        hoverScale={1.03}
                                    />
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-white/10 md:self-stretch flex items-center">
                                    <LightboxImage
                                        src="/assets/virdio/mobile_mockup.png"
                                        alt="Mobile app: class browsing with Live and On-demand tabs and category filters"
                                        className="h-full w-auto object-contain max-h-[500px] md:max-h-none"
                                        draggable={false}
                                        hoverScale={1.03}
                                    />
                                </div>
                            </div>
                            <p className="site-gallery-caption case-study-media-caption-mt text-left text-white/45">
                                Desktop is where the AR magic happens. Mobile is the browsing front door.
                            </p>
                        </Reveal>
                    </section>
                </div>


                {/* ═══════════════════════════════════════════════════════
                    SECTION 02 — INSIGHT + DECISION
                ═══════════════════════════════════════════════════════ */}
                <div className={SITE_COLUMN}>
                    <section id="insight" className="case-study-section-y border-t border-white/10">

                        {/* Section Header */}
                        <div className="w-full min-w-0 text-left flex flex-col case-study-heading-trail-gap case-study-subsection-gap">
                            <Reveal>
                                <span className="site-label text-white/40">02</span>
                            </Reveal>
                            <h2 className="site-chapter-heading text-white text-left">
                                <TextReveal>The most accessible device delivered the worst experience</TextReveal>
                            </h2>
                        </div>

                        {/* Insight Narrative */}
                        <div className="w-full min-w-0 case-study-prose-stack case-study-block-gap">
                            <Reveal>
                                <p className="site-body text-white/65">
                                    I started testing prototypes with our internal advisory board of fitness trainers and physicians. What emerged was a turning point: the mobile phone, the easiest way for users to access the app, was inherently the worst platform for the core AR workout experience.
                                </p>
                            </Reveal>
                            <Reveal delay={0.05}>
                                <p className="site-body text-white/65">
                                    On a small screen, AR overlays competed with the video feed for visibility. The pose detection needed distance from the camera, but users placed phones close or on unstable surfaces, leading to inconsistent tracking or difficult visibility. If mobile was the front door for most users, and mobile delivered the lowest-quality version of our differentiating feature, we risked first impressions that undermined the entire value proposition.
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
                                <h3 className="site-subheading case-study-heading-trail-mb text-white">
                                    Platform strategy: launching everywhere vs. focusing on the best experience
                                </h3>
                            </Reveal>
                            <Reveal delay={0.05}>
                                <p className="site-body text-white/65">
                                    This insight forced a critical strategic conversation. I advocated for a desktop-first approach: focus our limited resources on making the larger-screen experience exceptional. The CEO was adamant about launching on all platforms simultaneously. Multi-platform availability was a competitive differentiator, and mobile was the most accessible entry point for browsing and booking classes.
                                </p>
                            </Reveal>
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
                <section id="solution" className="case-study-section-y-t border-t border-white/10">
                    <div className={SITE_COLUMN}>
                        {/* Section Header */}
                        <div className="w-full min-w-0 text-left flex flex-col case-study-heading-trail-gap case-study-subsection-gap">
                            <Reveal>
                                <span className="site-label text-white/40">03</span>
                            </Reveal>
                            <h2 className="site-chapter-heading text-white text-left">
                                <TextReveal>AR workout classes anyone could set up in their living room</TextReveal>
                            </h2>
                            <Reveal delay={0.1}>
                                <p className="site-body text-white/55 text-left">
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
                                    <h3 className="site-subheading case-study-heading-trail-mb text-white">
                                        Room Setup & Calibration
                                    </h3>
                                </Reveal>
                                <div className="case-study-prose-stack flex flex-col">
                                    <Reveal delay={0.05}>
                                        <p className="site-body text-white/65">
                                            Users needed to calibrate their camera and define their play space, which sounds technical. I designed a visual experience to make it approachable. For camera alignment, I created a visual guide that asked users to center themselves on screen with clear tilt indicators.
                                        </p>
                                    </Reveal>
                                    <Reveal delay={0.1}>
                                        <p className="site-body text-white/65">
                                            For room calibration, the system placed virtual cones and users simply walked to the corners of their space. The backend detection handled the rest. The entire setup culminated in a satisfying green checkmark confirmation.
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
                                        <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-white/10">
                                            <LightboxImage
                                                src="/assets/virdio/phone_setup_mid.png"
                                                alt="Move to the other cone: directional arrows guide the user between calibration cones"
                                                className="h-auto w-full object-contain"
                                                draggable={false}
                                                hoverScale={1.03}
                                            />
                                        </div>
                                        <div className="min-w-0 w-full overflow-hidden rounded-2xl border border-white/10">
                                            <LightboxImage
                                                src="/assets/virdio/phone_setup_end.png"
                                                alt="Room Setup Complete: four purple cones define the workout space"
                                                className="h-auto w-full object-contain"
                                                draggable={false}
                                                hoverScale={1.03}
                                            />
                                        </div>
                                    </div>
                                    <p className="site-gallery-caption w-full min-w-0 text-left text-white/45">
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
                                        <h3 className="site-subheading case-study-heading-trail-mb text-white">
                                            What if setup fails?
                                        </h3>
                                    </div>
                                    <div className="mx-auto flex w-full min-w-0 flex-col gap-4 md:gap-5">
                                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
                                            <LightboxImage
                                                src="/assets/virdio/calibration_flow.png"
                                                alt="Calibration flow: recovery paths when tracking is lost, skip setup, and in-class failure"
                                                className="block h-auto w-full object-contain"
                                                draggable={false}
                                                hoverScale={1.02}
                                            />
                                        </div>
                                        <p className="site-gallery-caption text-left text-white/45">
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
                                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                                        <LightboxImage
                                            src="/assets/virdio/step_out_of_frame.png"
                                            alt="Did you step out of frame: non-judgmental prompt with Ignore and Remind options"
                                            className="h-auto w-full object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                    <p className="site-gallery-caption text-left text-white/45">
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
                                        <p className="site-label case-study-tight-trail-mb text-left text-white/40">
                                            Interactive
                                        </p>
                                        <h3 className="site-subheading case-study-heading-trail-mb text-white">
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
                                    <h3 className="site-subheading case-study-heading-trail-mb text-white">
                                        Live Workout HUD
                                    </h3>
                                </Reveal>
                                <div className="case-study-prose-stack flex flex-col">
                                    <Reveal delay={0.05}>
                                        <p className="site-body text-white/65">
                                            The core of the product used machine vision to read body poses in real time, counting actions like punches, squats, and jumps. AR artifacts served as both affordances showing users how to perform exercises and as hit boxes for the system to register completed reps.
                                        </p>
                                    </Reveal>
                                    <Reveal delay={0.1}>
                                        <p className="site-body text-white/65">
                                            I designed platform-specific HUD adaptations. Desktop took advantage of landscape orientation to show more metrics, class info, and participant data simultaneously. Mobile required a dynamic HUD that collapsed and expanded contextually, preserving maximum visibility of the actual workout content on a small screen.
                                        </p>
                                    </Reveal>
                                </div>
                            </div>

                            {/* Hero shot — Desktop HUD at its best */}
                            <Reveal>
                                <div className="case-study-hero-bump-mb flex flex-col gap-4 md:gap-5">
                                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                                        <LightboxImage
                                            src="/assets/virdio/hero_ui.png"
                                            alt="Desktop AR HUD: split squat with metrics panel, timer, and AR floor track"
                                            className="h-auto w-full object-contain"
                                            draggable={false}
                                            hoverScale={1.02}
                                        />
                                    </div>
                                    <p className="site-gallery-caption text-left text-white/45">
                                        The desktop AR experience at its best: full metrics, timer, and AR equipment track visible at once.
                                    </p>
                                </div>
                            </Reveal>

                            {/* Desktop vs Mobile HUD comparison */}
                            <Reveal>
                                <div className="flex flex-col gap-4 md:gap-5">
                                    <div className="grid grid-cols-1 items-center case-study-grid-gap md:grid-cols-[3fr_2fr]">
                                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                                            <LightboxImage
                                                src="/assets/virdio/ar_class_live.png"
                                                alt="Desktop HUD: full toolbar, participant buttons, Show stream controls"
                                                className="h-auto w-full object-contain"
                                                draggable={false}
                                            />
                                        </div>
                                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900">
                                            <LightboxImage
                                                src="/assets/virdio/mobile_ui.png"
                                                alt="Mobile HUD: condensed metrics, hamburger menu, maximized video"
                                                className="h-auto w-full object-contain"
                                                draggable={false}
                                            />
                                        </div>
                                    </div>
                                    <p className="site-gallery-caption text-left text-white/45">
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
                                    <h3 className="site-subheading case-study-heading-trail-mb text-white">
                                        Scheduling & Design System
                                    </h3>
                                </Reveal>
                                <Reveal delay={0.05}>
                                    <p className="site-body text-white/65">
                                        I built the design system from the ground up to maintain consistency across all five platforms. It governed color, typography, button styles, and component behavior. A key design decision was using light mode for browsing and discovery surfaces and dark mode for anything related to attending a class, creating a clear psychological shift when users entered the workout experience.
                                    </p>
                                </Reveal>
                            </div>

                            {/* Desktop + Mobile scheduling comparison */}
                            <Reveal>
                                <div className="case-study-block-gap">
                                    <div className="grid grid-cols-1 items-start case-study-grid-gap md:grid-cols-[3fr_1fr]">
                                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                            <LightboxImage
                                                src="/assets/virdio/live_classes_filter.png"
                                                alt="Desktop class browsing: sidebar category filters, day-grouped class list"
                                                className="w-full h-auto object-contain"
                                                draggable={false}
                                            />
                                        </div>
                                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                            <LightboxImage
                                                src="/assets/virdio/mobile_live_classes.png"
                                                alt="Mobile class browsing: compact class cards with inline category chips"
                                                className="w-full h-auto object-contain"
                                                draggable={false}
                                            />
                                        </div>
                                    </div>
                                    <p className="site-gallery-caption case-study-media-caption-mt text-left text-white/45">
                                        Desktop exposes filters inline for power browsing. Mobile surfaces categories as compact chips.
                                    </p>
                                </div>
                            </Reveal>

                            {/* Schedule View */}
                            <Reveal>
                                <div className="mx-auto w-full min-w-0 case-study-block-gap">
                                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                        <LightboxImage
                                            src="/assets/virdio/desktop_schedule.png"
                                            alt="My Schedule: calendar widget with booked classes and Join Session CTA"
                                            className="w-full h-auto object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                    <p className="site-gallery-caption case-study-caption-tight-mt text-left text-white/45">
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
                    <section id="role-impact" className="case-study-section-y border-t border-white/10">
                        <div className="w-full min-w-0">

                            {/* Section Header */}
                            <div className="text-left flex flex-col case-study-heading-trail-gap case-study-block-gap">
                                <Reveal>
                                    <span className="site-label text-white/40">04</span>
                                </Reveal>
                                <h2 className="site-chapter-heading text-white text-left">
                                    <TextReveal>Role & Impact</TextReveal>
                                </h2>
                            </div>

                            {/* My Role */}
                            <Reveal>
                                <div className="case-study-block-gap">
                                    <h3 className="site-subheading case-study-heading-trail-mb text-white">What I Owned</h3>
                                    <ul className="case-study-prose-stack flex flex-col">
                                        {[
                                            "Sole designer from concept to launch-ready deliverables across iOS, Android, web, desktop, Apple Watch, and smart TV.",
                                            "Built the entire design system from the ground up: color, typography, components, and platform-specific adaptations.",
                                            "Influenced product strategy: led the platform prioritization debate and shaped the desktop-first UX compromise.",
                                            "Created detailed interaction and animation specs for async engineering handoff across a 12-hour timezone gap, critical for AR components that static mockups couldn't convey.",
                                        ].map((item, i) => (
                                            <li key={i} className="case-study-grid-gap-dense flex site-body text-white/65">
                                                <span className="text-white/35 mt-[5px] shrink-0">&#8226;</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>

                            {/* Impact */}
                            <Reveal>
                                <div className="case-study-block-gap">
                                    <h3 className="site-subheading case-study-heading-trail-mb text-white">Impact</h3>
                                    <div className="case-study-prose-stack">
                                        <p className="site-body text-white/65">
                                            The app launched across all planned platforms in mid-2022. I was let go about a month before launch during team reductions, just after completing the final design iterations. The app received some positive reviews but did not achieve significant consumer adoption. The consumer home fitness market was cooling from its pandemic peak by the time we shipped.
                                        </p>
                                        <p className="site-body text-white/70">
                                            If I could do it over, I would focus on making one platform exceptional with a limited, curated class library, and use that to wow users before expanding.
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
                </div>
            </div>
        </LightboxProvider>
        <CaseStudyPill projectSlug="virdio" />
        <StickyNotes page="virdio" />
        </>
    );
}

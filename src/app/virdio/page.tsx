"use client";

import { useEffect } from "react";
import { ParallaxHero } from "@/components/virdio/ParallaxHero";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { ScrollRevealFlow } from "@/components/virdio/ScrollRevealFlow";
import { ConePlayground } from "@/components/virdio/ConePlayground";
import { CloseButton } from "@/components/virdio/CloseButton";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { ParticleIcon } from "@/components/virdio/ParticleIcon";
import { ARMosaic } from "@/components/virdio/ARMosaic";
import { PunchBag } from "@/components/virdio/PunchBag";
import { TextReveal } from "@/components/TextReveal";
import { Reveal } from "@/components/Reveal";
import { ExpandableStack } from "@/components/shared/ExpandableStack";
import { StickyNotes } from "@/components/StickyNotes";

export default function VirdioPage() {
    useEffect(() => {
        document.documentElement.classList.remove("dark");
    }, []);

    return (
        <>
        <LightboxProvider>
            <div className="bg-white min-h-screen w-full relative overflow-x-hidden selection:bg-neutral-200 selection:text-black font-sans antialiased text-neutral-900">

                <CloseButton />
                <StickySidebar
                    sections={[
                        { id: "hero", label: "Intro", number: "00" },
                        { id: "setup", label: "Setup", number: "01" },
                        { id: "resilience", label: "Resilience", number: "02" },
                        { id: "scaling", label: "Scaling", number: "03" },
                        { id: "reflection", label: "Reflection", number: "04" },
                    ]}
                />

                {/* ─── HERO ─── */}
                <div className="relative z-10 bg-white">
                    <ParallaxHero />
                </div>

                {/* ─── YOUTUBE EMBED ─── */}
                <section className="relative z-20 max-w-[1000px] mx-auto px-6 md:px-12 -mt-16 md:-mt-24 mb-24 md:mb-32">
                    <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-neutral-200/60">
                        <iframe
                            src="https://www.youtube.com/embed/3s-tfJ467pc?rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3"
                            title="Virdio — AR Fitness Platform"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                </section>

                {/* ─── THE CHALLENGE ─── */}
                <section className="max-w-[720px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <p className="font-[family-name:var(--font-dm-sans)] text-xl md:text-2xl text-neutral-600 leading-[1.7] font-normal">
                            Virdio was an early stage startup that aimed to democratize home fitness by replacing expensive gym hardware with computer vision. My challenge was to design their consumer apps and reactive AR experiences that provided real-time feedback on form, while ensuring the system worked seamlessly across 5 different platforms and &ldquo;messy&rdquo; real-world living rooms.
                        </p>
                    </Reveal>
                </section>

                {/* ─── DEVICE MOCKUPS SIDE-BY-SIDE ─── */}
                <section className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16 pb-24 md:pb-32">
                    <Reveal>
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center">
                            <div className="rounded-2xl overflow-hidden border border-neutral-200/60">
                                <LightboxImage
                                    src="/assets/virdio/desktop_mockup.png"
                                    alt="Virdio desktop app — laptop mockup showing class scheduling UI"
                                    className="w-full h-auto object-contain"
                                    draggable={false}
                                    hoverScale={1.03}
                                />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-neutral-200/60 md:self-stretch flex items-center">
                                <LightboxImage
                                    src="/assets/virdio/mobile_mockup_2.png"
                                    alt="Virdio mobile app — iPhone mockup with filter button"
                                    className="h-full w-auto object-contain max-h-[500px] md:max-h-none"
                                    draggable={false}
                                    hoverScale={1.03}
                                />
                            </div>
                        </div>
                    </Reveal>
                </section>

                <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">

                    {/* ═══════════════════════════════════════════════════════
                        SECTION 01 — REDUCING COGNITIVE LOAD IN SETUP
                    ═══════════════════════════════════════════════════════ */}
                    <section id="setup" className="py-24 md:py-32 border-t border-neutral-100">
                        {/* Section Header */}
                        <div className="max-w-[720px] mx-auto text-center mb-16 md:mb-24">
                            <Reveal>
                                <span className="text-neutral-400 text-sm font-medium tracking-[0.08em] uppercase">01</span>
                            </Reveal>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl lg:text-6xl leading-tight text-neutral-900 mt-4 mb-6">
                                <TextReveal>Reducing Cognitive Load in Setup</TextReveal>
                            </h2>
                            <Reveal delay={0.1}>
                                <p className="font-[family-name:var(--font-dm-sans)] text-lg md:text-xl text-neutral-500 leading-relaxed">
                                    Ensuring a quality experience for non-technical users across a variety of home setups.
                                </p>
                            </Reveal>
                        </div>

                        {/* Constraint + Solution — Two Column */}
                        <Reveal>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-[900px] mx-auto mb-16 md:mb-24">
                                <div className="space-y-3">
                                    <h3 className="text-neutral-900 text-sm font-semibold uppercase tracking-[0.08em]">The Constraint</h3>
                                    <p className="text-neutral-500 text-base leading-relaxed">
                                        Computer vision requires a precise 2-point diagonal map to function. The backend technology was robust enough to handle &ldquo;messy&rdquo; data, but we needed a way for non-technical users to provide that data without feeling like they were performing a technical calibration.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-neutral-900 text-sm font-semibold uppercase tracking-[0.08em]">The Solution</h3>
                                    <p className="text-neutral-500 text-base leading-relaxed">
                                        I abstracted the technical coordinate mapping into a game of &ldquo;Reach the Cone.&rdquo;
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </section>
                </div>

                {/* Scroll-Driven Calibration Flow — Full Width (outside container for pinning) */}
                <ScrollRevealFlow className="mb-16 md:mb-24" />

                <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
                    {/* Detail Cards with Particle Icons */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-[960px] mx-auto mb-16 md:mb-24">
                            <div className="space-y-4">
                                <ParticleIcon shape="cone" className="mx-auto" />
                                <h3 className="text-neutral-900 text-base font-medium text-center md:text-left">Mental Model Shift</h3>
                                <p className="text-neutral-500 text-[15px] leading-relaxed">
                                    Instead of asking users to &ldquo;scan 4 meters,&rdquo; I placed 2 virtual traffic cones at diagonal corners of the room and asked users to walk to each one. The 2 cones define a rectangular workout zone. &ldquo;Cones&rdquo; are a universally understood symbol for &ldquo;boundary.&rdquo;
                                </p>
                            </div>
                            <div className="space-y-4">
                                <ParticleIcon shape="magnet" className="mx-auto" />
                                <h3 className="text-neutral-900 text-base font-medium text-center md:text-left">Designing for Tolerance</h3>
                                <p className="text-neutral-500 text-[15px] leading-relaxed">
                                    Real living rooms have couches and coffee tables. I designed the system to be &ldquo;fuzzy.&rdquo; If a user couldn&rsquo;t reach the exact spot due to furniture, the system accepted their closest attempt after it no longer detected movement.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <ParticleIcon shape="speaker" className="mx-auto" />
                                <h3 className="text-neutral-900 text-base font-medium text-center md:text-left">Feedback Loop</h3>
                                <p className="text-neutral-500 text-[15px] leading-relaxed">
                                    We used a multi-sensory confirmation loop (Visual &ldquo;Pulse&rdquo; + Audio &ldquo;Ding&rdquo;) so users knew the point was registered without looking back at the screen.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* ConePlayground — Interactive Easter Egg (end of Section 01) */}
                    <Reveal>
                        <div className="max-w-[800px] mx-auto mb-24 md:mb-32">
                            <div className="text-center mb-8">
                                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-400 tracking-wide uppercase mb-2">
                                    Interactive
                                </p>
                                <h3 className="font-[family-name:var(--font-instrument-serif)] text-2xl md:text-3xl text-neutral-900">
                                    Calibrate Your Own Space
                                </h3>
                                <p className="font-[family-name:var(--font-dm-sans)] text-neutral-500 mt-2 text-sm">
                                    Place 2 cones at opposite corners to define your workout zone. Drag to reposition, double-click to remove.
                                </p>
                            </div>
                            <ConePlayground />
                        </div>
                    </Reveal>


                    {/* Setup Exploration Sketches */}
                    <Reveal>
                        <ExpandableStack
                            images={[
                                { src: "/assets/virdio/sketch_angle_calibration.jpg", alt: "Angle calibration sketch" },
                                { src: "/assets/virdio/sketch_box_jump.jpg", alt: "Box jump sketch" },
                                { src: "/assets/virdio/sketch_setup.jpg", alt: "Setup sketch" },
                            ]}
                            className="max-w-[500px] mx-auto mb-24 md:mb-32"
                        />
                    </Reveal>

                    {/* ═══════════════════════════════════════════════════════
                        SECTION 02 — DESIGNING FOR RESILIENCE
                    ═══════════════════════════════════════════════════════ */}
                    <section id="resilience" className="py-24 md:py-32 border-t border-neutral-100">
                        {/* Section Header */}
                        <div className="max-w-[720px] mx-auto text-center mb-16 md:mb-24">
                            <Reveal>
                                <span className="text-neutral-400 text-sm font-medium tracking-[0.08em] uppercase">02</span>
                            </Reveal>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl lg:text-6xl leading-tight text-neutral-900 mt-4 mb-6">
                                <TextReveal>Designing for Resilience</TextReveal>
                            </h2>
                            <Reveal delay={0.1}>
                                <p className="font-[family-name:var(--font-dm-sans)] text-lg md:text-xl text-neutral-500 leading-relaxed">
                                    Handling the &ldquo;unhappy path&rdquo; in a live, un-pausable environment.
                                </p>
                            </Reveal>
                        </div>

                        {/* Two Column — Narrative + Context Image */}
                        <Reveal>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start mb-16 md:mb-24">
                                <div className="space-y-8 md:sticky md:top-24">
                                    <div className="space-y-3">
                                        <h3 className="text-neutral-900 text-sm font-semibold uppercase tracking-[0.08em]">The Constraint</h3>
                                        <p className="text-neutral-500 text-base leading-relaxed">
                                            Virdio classes are live and un-pausable. If the AR tracking fails (e.g., a dog walks in frame, lighting changes), we cannot stop the video or throw a blocking modal in front of a user who is mid-workout. When tracking is lost, the AR layer silently fades away, but the class video continues uninterrupted.
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-neutral-900 text-sm font-semibold uppercase tracking-[0.08em]">The Solution</h3>
                                        <p className="text-neutral-500 text-base leading-relaxed">
                                            I prioritized the user&rsquo;s momentum over the technology&rsquo;s perfection.
                                        </p>
                                    </div>
                                </div>

                                {/* Context Image — in-context.png */}
                                <div className="space-y-3">
                                    <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200/60">
                                        <LightboxImage
                                            src="/assets/virdio/in_context.png"
                                            alt="Live AR class in action — in-gym workout with AR overlay"
                                            className="w-full h-auto object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                    <p className="text-sm text-neutral-400">A live AR class in action — the context where failures happen.</p>
                                </div>
                            </div>
                        </Reveal>

                        {/* Two Detail Cards — No-Blame UI + Graceful Recovery */}
                        <Reveal>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-[960px] mx-auto">
                                {/* No-Blame UI */}
                                <div className="space-y-4">
                                    <div className="bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200/60">
                                        <LightboxImage
                                            src="/assets/virdio/step_out_of_frame.png"
                                            alt="No-Blame UI — passive 'Did you step out of frame?' prompt"
                                            className="w-full h-auto object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-neutral-900 text-base font-medium">No-Blame UI</h3>
                                        <p className="text-neutral-500 text-[15px] leading-relaxed">
                                            The error message is passive (&ldquo;Did you step out of frame?&rdquo;) rather than active (&ldquo;Please Fix This&rdquo;). It frames the issue as a system state, not a user error.
                                        </p>
                                    </div>
                                </div>

                                {/* Graceful Recovery */}
                                <div className="space-y-4">
                                    <div className="bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200/60">
                                        <LightboxImage
                                            src="/assets/virdio/calibration_flow_full.png"
                                            alt="Graceful Recovery — full calibration flow showing error recovery paths"
                                            className="w-full h-auto object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-neutral-900 text-base font-medium">Graceful Recovery</h3>
                                        <p className="text-neutral-500 text-[15px] leading-relaxed">
                                            Users can tap &ldquo;Recalibrate&rdquo; during a rest break to restore AR, or &ldquo;Disable AR&rdquo; to finish in video-only mode.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </section>


                    {/* ═══════════════════════════════════════════════════════
                        SECTION 03 — CONTEXT-AWARE SCALING
                    ═══════════════════════════════════════════════════════ */}
                    <section id="scaling" className="py-24 md:py-32 border-t border-neutral-100">
                        {/* Section Header */}
                        <div className="max-w-[720px] mx-auto text-center mb-16 md:mb-24">
                            <Reveal>
                                <span className="text-neutral-400 text-sm font-medium tracking-[0.08em] uppercase">03</span>
                            </Reveal>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl lg:text-6xl leading-tight text-neutral-900 mt-4 mb-6">
                                <TextReveal>Context-Aware Scaling</TextReveal>
                            </h2>
                            <Reveal delay={0.1}>
                                <p className="font-[family-name:var(--font-dm-sans)] text-lg md:text-xl text-neutral-500 leading-relaxed">
                                    One library, multiple contexts.
                                </p>
                            </Reveal>
                        </div>

                        {/* Constraint + Solution */}
                        <Reveal>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-[900px] mx-auto mb-16 md:mb-24">
                                <div className="space-y-3">
                                    <h3 className="text-neutral-900 text-sm font-semibold uppercase tracking-[0.08em]">The Constraint</h3>
                                    <p className="text-neutral-500 text-base leading-relaxed">
                                        As a solo designer supporting Mobile, Web, and TV simultaneously, I could not design every screen twice. I needed a scalable system that adapted to the &ldquo;thumb-first&rdquo; constraints of mobile and the &ldquo;information-dense&rdquo; capabilities of desktop.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-neutral-900 text-sm font-semibold uppercase tracking-[0.08em]">The Solution</h3>
                                    <p className="text-neutral-500 text-base leading-relaxed">
                                        I built a token-based Design System that handled complexity automatically.
                                    </p>
                                </div>
                            </div>
                        </Reveal>

                        {/* Hero Comparison — Mobile Mockup + Desktop Classes */}
                        <Reveal>
                            <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4 md:gap-6 items-stretch mb-6">
                                <div className="rounded-2xl overflow-hidden border border-neutral-200/60 bg-neutral-100">
                                    <LightboxImage
                                        src="/assets/virdio/mobile_mockup_2.png"
                                        alt="Virdio mobile — class list with floating filter button"
                                        className="w-full h-full object-contain"
                                        draggable={false}
                                    />
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-neutral-200/60 bg-neutral-100">
                                    <LightboxImage
                                        src="/assets/virdio/live_classes_filter.png"
                                        alt="Virdio desktop — live classes with category and duration filters"
                                        className="w-full h-full object-contain"
                                        draggable={false}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400 text-center mb-16 md:mb-24">
                                The same &ldquo;Classes&rdquo; experience — mobile surfaces a floating filter button, while desktop exposes filters inline for power browsing.
                            </p>
                        </Reveal>

                        {/* On-Demand Activity Comparison — Desktop vs Mobile */}
                        <Reveal>
                            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center mb-6">
                                <div className="rounded-2xl overflow-hidden border border-neutral-200/60 bg-neutral-100 flex-1 min-w-0">
                                    <LightboxImage
                                        src="/assets/virdio/virtual_session_mobile.png"
                                        alt="Virdio mobile — on-demand activity view focused on video"
                                        className="w-full h-auto object-contain"
                                        draggable={false}
                                    />
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-neutral-200/60 bg-neutral-100 flex-shrink-0">
                                    <LightboxImage
                                        src="/assets/virdio/virtual_session_desktop.png"
                                        alt="Virdio desktop — on-demand activity with exercise queue and session details"
                                        className="h-auto w-auto max-h-[350px] md:max-h-[420px] object-contain"
                                        draggable={false}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400 text-center mb-16 md:mb-24">
                                On-demand activity view — desktop expands to show the exercise queue and session details; mobile focuses on the video.
                            </p>
                        </Reveal>

                        {/* Three Detail Cards */}
                        <Reveal>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-[960px] mx-auto">
                                <div className="space-y-3">
                                    {/* Adaptive Components Demo — morphing layout blocks */}
                                    <div className="h-[120px] rounded-xl bg-neutral-50 border border-neutral-200/60 overflow-hidden flex items-center justify-center p-4">
                                        <div className="flex gap-2 items-end w-full max-w-[160px]">
                                            <div
                                                className="bg-neutral-300 rounded-md"
                                                style={{
                                                    width: "40%",
                                                    animation: "adaptiveMorph 3s ease-in-out infinite",
                                                }}
                                            />
                                            <div className="flex flex-col gap-2 flex-1">
                                                <div
                                                    className="bg-neutral-200 rounded-sm h-3"
                                                    style={{ animation: "adaptiveWidth 3s ease-in-out infinite" }}
                                                />
                                                <div className="bg-neutral-200 rounded-sm h-3 w-3/4" />
                                                <div
                                                    className="bg-neutral-300 rounded-sm h-5 mt-1"
                                                    style={{ animation: "adaptiveWidth 3s ease-in-out 0.5s infinite" }}
                                                />
                                            </div>
                                        </div>
                                        <style>{`
                                            @keyframes adaptiveMorph {
                                                0%, 100% { height: 60px; border-radius: 6px; }
                                                50% { height: 80px; border-radius: 10px; }
                                            }
                                            @keyframes adaptiveWidth {
                                                0%, 100% { width: 100%; }
                                                50% { width: 60%; }
                                            }
                                        `}</style>
                                    </div>
                                    <h3 className="text-neutral-900 text-base font-medium">Adaptive Components</h3>
                                    <p className="text-neutral-500 text-[15px] leading-relaxed">
                                        A single component library where variants were tokenized for platform norms. A Class View on mobile was focused; on Desktop, the same component expanded to show &ldquo;Next Activity&rdquo; previews and music controls.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {/* Contextual Density Demo — expanding/collapsing rows */}
                                    <div className="h-[120px] rounded-xl bg-neutral-50 border border-neutral-200/60 overflow-hidden flex flex-col items-center justify-center gap-2 p-4">
                                        {[0, 0.4, 0.8].map((delay) => (
                                            <div
                                                key={delay}
                                                className="bg-neutral-200 rounded-sm h-3"
                                                style={{
                                                    width: "80%",
                                                    animation: `densityExpand 2.5s ease-in-out ${delay}s infinite`,
                                                }}
                                            />
                                        ))}
                                        <div
                                            className="bg-neutral-300 rounded-sm h-3"
                                            style={{
                                                width: "60%",
                                                animation: "densityReveal 2.5s ease-in-out infinite",
                                            }}
                                        />
                                        <style>{`
                                            @keyframes densityExpand {
                                                0%, 100% { width: 50%; opacity: 0.6; }
                                                50% { width: 90%; opacity: 1; }
                                            }
                                            @keyframes densityReveal {
                                                0%, 30% { opacity: 0; transform: scaleY(0); }
                                                50% { opacity: 1; transform: scaleY(1); }
                                                70%, 100% { opacity: 0; transform: scaleY(0); }
                                            }
                                        `}</style>
                                    </div>
                                    <h3 className="text-neutral-900 text-base font-medium">Contextual Density</h3>
                                    <p className="text-neutral-500 text-[15px] leading-relaxed">
                                        While mobile required a separate screen for filtering, the Desktop sidebar included category, duration, music, and instructor filters visible alongside the class list — reducing the friction of finding the right class.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {/* Thematic Logic Demo — light-to-dark transition */}
                                    <div
                                        className="h-[120px] rounded-xl border border-neutral-200/60 overflow-hidden flex items-center justify-center p-4"
                                        style={{ animation: "themeShift 4s ease-in-out infinite" }}
                                    >
                                        <div className="flex flex-col gap-2 w-full max-w-[120px]">
                                            <div
                                                className="rounded-md h-10 w-full"
                                                style={{ animation: "themeCard 4s ease-in-out infinite" }}
                                            />
                                            <div className="flex gap-2">
                                                <div
                                                    className="rounded-sm h-3 flex-1"
                                                    style={{ animation: "themeText 4s ease-in-out infinite" }}
                                                />
                                                <div
                                                    className="rounded-sm h-3 w-6"
                                                    style={{ animation: "themeAccent 4s ease-in-out infinite" }}
                                                />
                                            </div>
                                        </div>
                                        <style>{`
                                            @keyframes themeShift {
                                                0%, 20% { background-color: #fafafa; }
                                                50%, 70% { background-color: #171717; }
                                                100% { background-color: #fafafa; }
                                            }
                                            @keyframes themeCard {
                                                0%, 20% { background-color: #e5e5e5; }
                                                50%, 70% { background-color: #404040; }
                                                100% { background-color: #e5e5e5; }
                                            }
                                            @keyframes themeText {
                                                0%, 20% { background-color: #d4d4d4; }
                                                50%, 70% { background-color: #525252; }
                                                100% { background-color: #d4d4d4; }
                                            }
                                            @keyframes themeAccent {
                                                0%, 20% { background-color: #a3a3a3; }
                                                50%, 70% { background-color: #737373; }
                                                100% { background-color: #a3a3a3; }
                                            }
                                        `}</style>
                                    </div>
                                    <h3 className="text-neutral-900 text-base font-medium">Thematic Logic</h3>
                                    <p className="text-neutral-500 text-[15px] leading-relaxed">
                                        I established a strict mode logic — Light Mode for administrative tasks (Booking, Browsing) and Dark Mode for the immersive workout experience. This helped users subconsciously switch between &ldquo;Planning&rdquo; and &ldquo;Doing.&rdquo;
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </section>


                </div>

                {/* ─── AR EXERCISE GALLERY ─── */}
                <ARMosaic className="py-16 md:py-24" />

                <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">

                    {/* ═══════════════════════════════════════════════════════
                        SECTION 04 — REFLECTIONS & IMPACT
                    ═══════════════════════════════════════════════════════ */}
                    <section id="reflection" className="py-24 md:py-32 border-t border-neutral-100">
                        <div className="max-w-[720px] mx-auto space-y-16">
                            <div className="text-center">
                                <h2 className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-5xl lg:text-6xl leading-tight text-neutral-900 mb-6">
                                    <TextReveal>Reflections & Impact</TextReveal>
                                </h2>
                            </div>

                            <Reveal>
                                <div className="space-y-10">
                                    <div className="space-y-3">
                                        <h3 className="text-neutral-900 text-sm font-semibold uppercase tracking-[0.08em]">Outcome</h3>
                                        <p className="text-neutral-600 text-lg leading-[1.7] font-normal">
                                            We successfully shipped a cohesive, end-to-end AR fitness platform to all the App Stores, proving that hardware-free tracking was viable on consumer devices — and paving the way for Virdio&rsquo;s pivot into the physical therapy space where they currently operate.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-neutral-900 text-sm font-semibold uppercase tracking-[0.08em]">Key Lesson</h3>
                                        <p className="text-neutral-600 text-lg leading-[1.7] font-normal">
                                            Technological capability does not equal user utility. If I were to redo this, I would prioritize a Desktop-First approach for AR workouts to ensure a high quality experience to start with, then thoughtfully build out the mobile AR approach as that is not as well-suited for this kind of AR interaction.
                                        </p>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </section>

                </div>

                {/* ─── AR PUNCHING BAG INTERACTIVE ─── */}
                <div className="max-w-[800px] mx-auto px-6 md:px-12 lg:px-16">
                    <Reveal>
                        <PunchBag />
                    </Reveal>
                </div>

                {/* Bottom spacer */}
                <div className="h-24" />
            </div>
        </LightboxProvider>
        <StickyNotes page="virdio" />
        </>
    );
}

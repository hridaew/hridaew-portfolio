"use client";

import { useEffect } from "react";
import { CloseButton } from "@/components/virdio/CloseButton";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { TextReveal } from "@/components/TextReveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { ExpandableStack } from "@/components/shared/ExpandableStack";
import { HapticsFlow } from "@/components/memory-care/HapticsFlow";
import { CatPettingInteractive } from "@/components/memory-care/CatPettingInteractive";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";

export default function MemoryCarePage() {
    useEffect(() => {
        document.documentElement.classList.remove("dark");
    }, []);

    return (
        <>
        <LightboxProvider>
            <div className="bg-[#FAFAFA] min-h-screen w-full relative overflow-x-hidden selection:bg-neutral-200 selection:text-neutral-900 font-sans antialiased">
                <CloseButton />
                <StickySidebar
                    sections={[
                        { id: "hero", label: "Intro", number: "00" },
                        { id: "connection", label: "Connection", number: "01" },
                        { id: "accessibility", label: "Accessibility", number: "02" },
                        { id: "caregiver", label: "Caregiver", number: "03" },
                        { id: "impact", label: "Impact", number: "04" },
                        { id: "reflection", label: "Reflection", number: "05" },
                    ]}
                />

                {/* ─── HERO ─── */}
                <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28">
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-200/30 to-transparent pointer-events-none" />
                    <div className="relative max-w-[720px] mx-auto px-6 md:px-12 text-center">
                        <Reveal>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/60 mb-8">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-500">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Fast Company &ldquo;World Changing Ideas&rdquo; Finalist
                                </span>
                            </div>
                        </Reveal>

                        <HeroTextAnimation variant="typewriter" className="font-[family-name:var(--font-instrument-serif)] text-4xl md:text-6xl text-neutral-900 leading-[1.1] mb-6">
                            Memory Care Experience Station
                        </HeroTextAnimation>

                        <Reveal delay={0.2}>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg md:text-xl text-neutral-600 leading-relaxed mb-10">
                                A multi-sensory pilot program enabling immersive engagement for residents with sensory deprivation.
                            </p>
                        </Reveal>

                        <Reveal delay={0.3}>
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600">
                                <div>
                                    <span className="text-neutral-400 block text-xs uppercase tracking-wider mb-0.5">Role</span>
                                    Interaction Designer (Physical Prototyping & UI)
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-xs uppercase tracking-wider mb-0.5">Timeline</span>
                                    18 Months (Pilot Program)
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-xs uppercase tracking-wider mb-0.5">Team</span>
                                    Maria Mortati, Scott Minneman, SFCJL Staff
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ─── Station Hero Image ─── */}
                <section className="max-w-[1000px] mx-auto px-6 md:px-12 pb-12 md:pb-16">
                    <Reveal>
                        <div className="rounded-2xl overflow-hidden border border-neutral-200/40">
                            <LightboxImage
                                src="/assets/memory-care/mces_hero.avif"
                                alt="The Memory Care Experience Station"
                                className="w-full h-auto object-cover"
                                draggable={false}
                                hoverScale={1.02}
                            />
                        </div>
                    </Reveal>
                </section>

                {/* ─── YouTube Embed ─── */}
                <section className="max-w-[1000px] mx-auto px-6 md:px-12 pb-20 md:pb-28">
                    <Reveal>
                        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-neutral-200/40">
                            <iframe
                                src="https://www.youtube.com/embed/BRHRaoAjPeo?rel=0&modestbranding=1"
                                title="Memory Care Experience Station"
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </Reveal>
                </section>

                {/* ─── CHALLENGE LEAD ─── */}
                <section className="max-w-[720px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <p className="font-[family-name:var(--font-dm-sans)] text-xl md:text-2xl text-neutral-800 leading-[1.7] font-normal">
                            Residents with mid-to-late stage dementia often face sensory deprivation and profound isolation. The San Francisco Campus for Jewish Living (SFCJL) sought to create an &ldquo;Experience Station&rdquo; to provide meaningful stimulation. While stakeholders initially explored Virtual Reality, our research indicated that headsets could cause confusion or fear in this demographic. We followed a &ldquo;Tangible Immersion&rdquo; strategy &mdash; creating a station that served as a window to the world, grounded in multisensory stimulation.
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 01: PROTOTYPING CONNECTION
                ═══════════════════════════════════════════════ */}
                <section id="connection" className="max-w-[920px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="mb-16">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.2em] font-semibold">
                                01
                            </span>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-900 mt-2 mb-3">
                                Prototyping Connection
                            </h2>
                            <p className="font-[family-name:var(--font-dm-sans)] text-neutral-600 text-lg">
                                Bridging the digital-physical gap with &ldquo;hacked&rdquo; hardware.
                            </p>
                        </div>
                    </Reveal>

                    {/* Insight */}
                    <Reveal>
                        <div className="mb-12">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                The Insight
                            </span>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-600 leading-relaxed max-w-[680px]">
                                Existing content was static and passive. We hypothesized that adding a tactile dimension &ndash; giving residents something to hold &ndash; would increase emotional grounding and immersion.
                            </p>
                        </div>
                    </Reveal>

                    {/* Cat Petting Prototype */}
                    <Reveal>
                        <div className="mb-12">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                The Prototype: The Cat Petting Experience
                            </span>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-600 leading-relaxed max-w-[680px]">
                                I &ldquo;hacked&rdquo; three plush cats, embedding them with pressure sensors and haptic vibration motors wired to an Arduino. Petting the toy triggered a &ldquo;purr&rdquo; vibration and played a synchronized video of that cat on the screen.
                            </p>
                        </div>
                    </Reveal>

                    {/* Cat Hero — standalone showcase */}
                    <Reveal>
                        <div className="max-w-[720px] mx-auto mb-12">
                            <LightboxImage
                                src="/assets/memory-care/catpettingresult.avif"
                                alt="The cat petting experience — a plush cat embedded with pressure sensors and haptic motors"
                                className="w-full h-auto rounded-2xl"
                                draggable={false}
                                hoverScale={1.02}
                            />
                            <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-500 text-center mt-3">
                                The cat petting prototype &mdash; a plush toy embedded with pressure sensors and haptic vibration motors.
                            </p>
                        </div>
                    </Reveal>

                    {/* Cat prototype — ExpandableStack */}
                    <Reveal>
                        <ExpandableStack
                            images={[
                                { src: "/assets/memory-care/catpettingresult.avif", alt: "Cat hero — plush cat prototype" },
                                { src: "/assets/memory-care/cat_plush_complete.jpg", alt: "Plush cat with embedded sensors" },
                                { src: "/assets/memory-care/cat_arduino_wiring.jpg", alt: "Arduino wiring for haptic cat prototype" },
                                { src: "/assets/memory-care/cat_sensors.jpg", alt: "Pressure sensors inside plush cat" },
                            ]}
                            className="max-w-[500px] mx-auto mb-16"
                        />
                    </Reveal>

                    {/* Cat Petting Interactive */}
                    <Reveal>
                        <CatPettingInteractive className="mb-16" />
                    </Reveal>

                    {/* Validation */}
                    <Reveal>
                        <div className="bg-white/60 rounded-2xl border border-neutral-200/40 p-8 md:p-10">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                The Validation
                            </span>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-600 leading-relaxed">
                                Early testing revealed a strong emotional response; residents instinctively tried to pick up and hold the animals. This validated the need for &ldquo;Tangible Companionship&rdquo; and informed future iterations to be wireless and robust for daily facility use.
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 02: REDEFINING ACCESSIBILITY
                ═══════════════════════════════════════════════ */}
                <section id="accessibility" className="max-w-[920px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="mb-16">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.2em] font-semibold">
                                02
                            </span>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-900 mt-2 mb-3">
                                Redefining Accessibility
                            </h2>
                            <p className="font-[family-name:var(--font-dm-sans)] text-neutral-600 text-lg">
                                Decoupling technology from furniture to ensure universal access.
                            </p>
                        </div>
                    </Reveal>

                    {/* Constraint / Solution 2-col */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
                            <div>
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Constraint
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-600 leading-relaxed">
                                    Haptic feedback is critical for sensory stimulation. However, the existing prototype was a platform placed under a chair, which was inaccessible to the majority of our residents who use wheelchairs.
                                </p>
                            </div>
                            <div>
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Solution: The Haptic Footrest
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-600 leading-relaxed">
                                    I iterated on the hardware at home, aiming to further mobilize the haptics. I used an existing foot rest since it could adapt to different people and be moved with ease, and attached a strong haptic emitter to the back of it, enabling the experience of haptics without compromising on accessibility and quality.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Side-by-side — Old haptics to Footrest */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start mb-4">
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40 h-fit">
                                <LightboxImage
                                    src="/assets/memory-care/oldhaptics.avif"
                                    alt="Original haptics platform under chair"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40 h-fit">
                                <LightboxImage
                                    src="/assets/memory-care/footrest_prototype.jpg"
                                    alt="Haptic footrest prototype"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-500 text-center mb-16">
                            By changing the form factor from a floor panel to a footrest, we ensured 100% of residents could access the experience without leaving their wheelchairs.
                        </p>
                    </Reveal>

                    {/* Haptics Flow Interactive */}
                    <Reveal>
                        <HapticsFlow className="mb-16" />
                    </Reveal>

                    {/* Driving simulator photos */}
                    <Reveal>
                        <div className="mb-12">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                The Application: Restoring Agency
                            </span>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-600 leading-relaxed max-w-[680px] mb-8">
                                We paired this hardware with a Driving Simulator. I thought it would be great to give the residents a sense of control, by having them play a realistic driving game paired with a Logitech steering wheel with force feedback.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40">
                                <LightboxImage
                                    src="/assets/memory-care/img_3527.jpg"
                                    alt="Haptic footrest setup with driving simulator"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40">
                                <LightboxImage
                                    src="/assets/memory-care/img_3525.jpg"
                                    alt="Haptic system anonymous view"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-500 text-center mb-16">
                            The driving setup paired a Logitech force-feedback wheel with POV driving footage and the haptic footrest.
                        </p>
                    </Reveal>

                    {/* Pivot / Fix / Result — 3-col cards */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/60 rounded-xl border border-neutral-200/40 p-6">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Pivot
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 leading-relaxed">
                                    Initial tests with a video game (Assetto Corsa) failed because the mechanics of driving caused anxiety, and the configuration was cumbersome.
                                </p>
                            </div>
                            <div className="bg-white/60 rounded-xl border border-neutral-200/40 p-6">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Fix
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 leading-relaxed">
                                    I pivoted to &ldquo;Simulated Agency.&rdquo; We synced high-quality POV driving footage with the Logitech force-feedback wheel and my haptic footrest.
                                </p>
                            </div>
                            <div className="bg-white/60 rounded-xl border border-neutral-200/40 p-6">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Result
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 leading-relaxed">
                                    Residents got the tactile satisfaction of steering and &ldquo;feeling&rdquo; the road rumble through their feet, without the risk of failure.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 03: THE CAREGIVER INTERFACE
                ═══════════════════════════════════════════════ */}
                <section id="caregiver" className="max-w-[920px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="mb-16">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.2em] font-semibold">
                                03
                            </span>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-900 mt-2 mb-3">
                                The Caregiver Interface
                            </h2>
                            <p className="font-[family-name:var(--font-dm-sans)] text-neutral-600 text-lg">
                                Transforming medical metadata into a session tool.
                            </p>
                        </div>
                    </Reveal>

                    {/* Operational Barrier */}
                    <Reveal>
                        <div className="mb-12">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                The Operational Barrier
                            </span>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-600 leading-relaxed max-w-[680px]">
                                The station is controlled by facility staff who are often stretched thin. If the digital interface was difficult to configure, the physical station would sit unused. Feedback indicated the original system felt like a static medical database, lacking the flexibility needed for improvised care sessions.
                            </p>
                        </div>
                    </Reveal>

                    {/* Side-by-side — Dashboard + Resident Profile */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40">
                                <LightboxImage
                                    src="/assets/memory-care/ui_dashboard.png"
                                    alt="Dashboard landing page"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40">
                                <LightboxImage
                                    src="/assets/memory-care/ui_resident_profile.jpg"
                                    alt="Individual resident profile"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-500 text-center mb-16">
                            The redesigned interface prioritizes &ldquo;Session Flow&rdquo; over &ldquo;Data Entry,&rdquo; empowering staff to personalize experiences in seconds.
                        </p>
                    </Reveal>

                    {/* 3 Detail Cards */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                            <div className="bg-white/60 rounded-xl border border-neutral-200/40 p-6">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    Reducing Cognitive Load
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 leading-relaxed">
                                    I removed extraneous widgets and filtered the Information Architecture to prioritize &ldquo;Engagement Tips&rdquo; and simple session controls.
                                </p>
                            </div>
                            <div className="bg-white/60 rounded-xl border border-neutral-200/40 p-6">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    Personalization
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 leading-relaxed">
                                    I introduced &ldquo;Quick Add&rdquo; features for improvised content (e.g., specific YouTube requests) and &ldquo;Favorite Playlists&rdquo; based on resident history.
                                </p>
                            </div>
                            <div className="bg-white/60 rounded-xl border border-neutral-200/40 p-6">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    Contextual Notes
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 leading-relaxed">
                                    I replaced buried metadata with prominent staff notes, ensuring critical preferences (e.g., &ldquo;Frank loves Jazz&rdquo;) were visible at a glance.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* WEBUI Screenshot Grid — removed session_forms */}
                    <Reveal>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40">
                                <LightboxImage
                                    src="/assets/memory-care/ui_dashboard.png"
                                    alt="Dashboard landing page"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40">
                                <LightboxImage
                                    src="/assets/memory-care/ui_resident_profile.jpg"
                                    alt="Individual resident profile"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40">
                                <LightboxImage
                                    src="/assets/memory-care/ui_video_player.jpg"
                                    alt="Video player interface"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40 col-span-2 md:col-span-3">
                                <LightboxImage
                                    src="/assets/memory-care/ui_exp_library.png"
                                    alt="Experience library for a specific resident"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    IMPACT STATS
                ═══════════════════════════════════════════════ */}
                <section id="impact" className="relative py-24 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-50" />
                    <div className="relative max-w-[920px] mx-auto px-6 md:px-12">
                        <Reveal>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
                                <div>
                                    <p className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-6xl text-neutral-900 mb-2">
                                        194+
                                    </p>
                                    <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600">
                                        Recorded sessions at SFCJL
                                    </p>
                                </div>
                                <div>
                                    <p className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-6xl text-neutral-900 mb-2">
                                        95%
                                    </p>
                                    <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600">
                                        Positive sentiment (33% Very Positive, 62% Positive)
                                    </p>
                                </div>
                                <div>
                                    <p className="font-[family-name:var(--font-instrument-serif)] text-5xl md:text-6xl text-neutral-900 mb-2">
                                        6+
                                    </p>
                                    <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600">
                                        Major award recognitions
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    TESTIMONIALS
                ═══════════════════════════════════════════════ */}
                <section className="max-w-[920px] mx-auto px-6 md:px-12 py-24 md:py-32">
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/70 rounded-2xl border border-neutral-200/40 p-8 md:p-10">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-200 mb-4">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                                <p className="font-[family-name:var(--font-dm-sans)] text-lg md:text-xl text-neutral-800 leading-relaxed mb-6">
                                    &ldquo;The Experience Station helps bring residents back online. It soothes the parasympathetic nervous system and helps mitigate distressing behaviors.&rdquo;
                                </p>
                                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-500">
                                    Manager of Life Enrichment, SFCJL
                                </p>
                            </div>
                            <div className="bg-white/70 rounded-2xl border border-neutral-200/40 p-8 md:p-10">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-neutral-200 mb-4">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                                <p className="font-[family-name:var(--font-dm-sans)] text-lg md:text-xl text-neutral-800 leading-relaxed mb-6">
                                    &ldquo;The Experience Station is a way to bridge connections, foster relationships for new staff to home in on residents. As well as facilitation for family members with their desire for connection.&rdquo;
                                </p>
                                <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-500">
                                    Life Enrichment Coordinator, SFCJL
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    AWARDS
                ═══════════════════════════════════════════════ */}
                <section className="max-w-[720px] mx-auto px-6 md:px-12 pb-20 md:pb-28">
                    <Reveal>
                        <div className="bg-white/60 rounded-2xl border border-neutral-200/60 p-8 md:p-10">
                            <h3 className="font-[family-name:var(--font-dm-sans)] text-xs text-neutral-400 uppercase tracking-[0.2em] font-semibold mb-6">
                                Recognition
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-neutral-400 mt-0.5">&#9733;</span>
                                    <p className="font-[family-name:var(--font-dm-sans)] text-neutral-800 leading-relaxed">
                                        CABHI (Centre for Aging + Brain Health Innovation) — 2x Award Recipient
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-neutral-400 mt-0.5">&#9733;</span>
                                    <p className="font-[family-name:var(--font-dm-sans)] text-neutral-800 leading-relaxed">
                                        Finalist: Fast Company 2022 World Changing Ideas (Experimental Category)
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-neutral-400 mt-0.5">&#9733;</span>
                                    <p className="font-[family-name:var(--font-dm-sans)] text-neutral-800 leading-relaxed">
                                        SCAN Foundation Innovation Award
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-neutral-400 mt-0.5">&#9733;</span>
                                    <p className="font-[family-name:var(--font-dm-sans)] text-neutral-800 leading-relaxed">
                                        Leading Age Innovation Award
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-neutral-400 mt-0.5">&#9733;</span>
                                    <p className="font-[family-name:var(--font-dm-sans)] text-neutral-800 leading-relaxed">
                                        Sephardic Foundation Grant Recipient
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-neutral-400 mt-0.5">&#9733;</span>
                                    <p className="font-[family-name:var(--font-dm-sans)] text-neutral-800 leading-relaxed">
                                        Invited for journal publication
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    SIDE NOTE
                ═══════════════════════════════════════════════ */}
                <section className="max-w-[720px] mx-auto px-6 md:px-12 pb-20 md:pb-28">
                    <Reveal>
                        <div className="bg-white/50 rounded-2xl border border-neutral-200/30 p-8 md:p-10 relative">
                            <div className="absolute top-4 right-4 text-neutral-300 text-2xl">&#9786;</div>
                            <p className="font-[family-name:var(--font-dm-sans)] text-neutral-600 leading-relaxed italic">
                                Side Note: The haptic footrest prototype was so engaging to use for media consumption that I actually built a second unit to keep for myself!
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    REFLECTION
                ═══════════════════════════════════════════════ */}
                <section id="reflection" className="max-w-[720px] mx-auto px-6 md:px-12 pb-32 md:pb-40">
                    <Reveal>
                        <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-900 mb-8">
                            Reflection
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 items-start mb-8">
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-600 leading-relaxed">
                                I love to work in a hands-on capacity &mdash; screens, toys, games, physical form, all of it. This was a unique chance to stretch my skills and have the independence to create impactful experiences from scratch, as challenging as that was. This project came with a lot of special considerations for our users, and it changed my perspective as a designer to try to always consider the needs of all populations, not just the most common.
                            </p>
                            <div className="rounded-xl overflow-hidden border border-neutral-200/40">
                                <img
                                    src="/assets/memory-care/img_5897_720.jpg"
                                    alt="Reflection — the experience station in action"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    </Reveal>
                </section>
            </div>
        </LightboxProvider>
        <StickyNotes page="memory-care" />
        </>
    );
}

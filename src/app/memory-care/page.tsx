"use client";

import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { CatPrototypeCarousel } from "@/components/memory-care/CatPrototypeCarousel";
import { HapticsFlow } from "@/components/memory-care/HapticsFlow";
import { CatPettingInteractive } from "@/components/memory-care/CatPettingInteractive";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { cn } from "@/lib/utils";
import { SITE_COLUMN } from "@/components/home/homeGrid";

/** One horizontal shell for every MCES section */
const mcesShell = SITE_COLUMN;

const MCES_MORTATI_PROJECT_HREF =
    "https://mortati.com/project/san-francisco-campus-for-jewish-living-memory-care-experience-station/";
const MCES_SFCJL_STATION_HREF =
    "https://www.jhslf.org/innovating-dementia-care-the-memory-care-experience-station/";

const mcesExternalLinkClass =
    "underline decoration-white/35 underline-offset-[0.15em] transition-colors hover:decoration-white/70 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function MemoryCarePage() {
    return (
        <>
        <LightboxProvider>
            <div className="site-editorial relative min-h-screen w-full overflow-x-hidden bg-background text-foreground selection:bg-white/10 selection:text-white font-sans antialiased">
                <StickySidebar
                    variant="dark"
                    sections={[
                        { id: "hero", label: "Intro", number: "00" },
                        { id: "connection", label: "Connection", number: "01" },
                        { id: "accessibility", label: "Adapting haptics", number: "02" },
                        { id: "caregiver", label: "Caregiver", number: "03" },
                        { id: "impact", label: "Impact", number: "04" },
                        { id: "reflection", label: "Reflection", number: "05" },
                    ]}
                />

                {/* ─── HERO ─── */}
                <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
                    <div className={cn("relative", mcesShell)}>
                    <div className="relative w-full min-w-0 text-left">
                        <Reveal>
                            <div className="case-study-hero-bump-mb inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/45">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="site-label text-left text-white/70">
                                    Fast Company &ldquo;World Changing Ideas&rdquo; Finalist
                                </span>
                            </div>
                        </Reveal>

                        <HeroTextAnimation
                            variant="typewriter"
                            className="type-h1 case-study-hero-title-mb-loose text-left text-white"
                        >
                            Memory Care Experience Station
                        </HeroTextAnimation>

                        <Reveal delay={0.2}>
                            <p className="site-body case-study-hero-lead-mb text-left text-white/65">
                                A multi-sensory pilot program enabling immersive engagement for residents with sensory deprivation.
                            </p>
                        </Reveal>

                        <Reveal delay={0.3}>
                            <div className="flex flex-wrap justify-start gap-x-8 gap-y-3 site-body text-white/65">
                                <div>
                                    <span className="site-label text-white/40 case-study-meta-line-mb block text-left">Role</span>
                                    Interaction Designer (Physical Prototyping & UI)
                                </div>
                                <div>
                                    <span className="site-label text-white/40 case-study-meta-line-mb block text-left">Timeline</span>
                                    18 Months (Pilot Program)
                                </div>
                                <div>
                                    <span className="site-label text-white/40 case-study-meta-line-mb block text-left">Team</span>
                                    Maria Mortati, Scott Minneman, SFCJL Staff
                                </div>
                            </div>
                        </Reveal>
                    </div>
                    </div>
                </section>

                {/* ─── Station Hero Image ─── */}
                <section className={cn(mcesShell, "pb-12 md:pb-16")}>
                    <Reveal>
                        <div className="rounded-2xl overflow-hidden border border-white/10">
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
                <section className={cn(mcesShell, "pb-20 md:pb-28")}>
                    <Reveal>
                        <div className="relative w-full min-w-0 aspect-video overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
                            <iframe
                                src="https://www.youtube.com/embed/BRHRaoAjPeo?rel=0&modestbranding=1"
                                title="Memory Care Experience Station"
                                className="absolute inset-0 h-full w-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                            />
                        </div>
                    </Reveal>
                </section>

                {/* ─── CHALLENGE LEAD ─── */}
                <section className={cn(mcesShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="flex flex-col gap-5 text-left md:gap-6">
                            <p className="site-body font-medium text-white/85">
                                The Memory Care Experience Station (MCES) is a large-scale interactive experience from{" "}
                                <a
                                    href={MCES_MORTATI_PROJECT_HREF}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={mcesExternalLinkClass}
                                >
                                    Maria Mortati Experience Design
                                </a>
                                .
                            </p>
                            <p className="site-body text-white/65">
                                Made for people with mid-to-late stage dementia, it is a pilot program that provides engaging experiences via bespoke multi-sensory content. It is meant for life enrichment.
                            </p>
                            <p className="site-body text-white/65">
                                The current iteration is deployed and being enjoyed by residents at the{" "}
                                <a
                                    href={MCES_SFCJL_STATION_HREF}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={mcesExternalLinkClass}
                                >
                                    San Francisco Campus for Jewish Living
                                </a>
                                .
                            </p>
                            <p className="site-body text-white/65">
                                I was brought on to build a research database for Alzheimer&apos;s.
                            </p>
                            <p className="site-body text-white/65">
                                My role quickly grew to include developing proof-of-concept mock-ups, low-fidelity physical prototypes, and digital UI design, all of which were tested with residents and staff.
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 01: PROTOTYPING CONNECTION
                ═══════════════════════════════════════════════ */}
                <section id="connection" className={cn(mcesShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="case-study-subsection-gap flex flex-col case-study-heading-trail-gap">
                            <span className="site-label text-white/40 text-left">
                                01
                            </span>
                            <h2 className="site-chapter-heading text-left text-white">
                                Prototyping Connection
                            </h2>
                            <p className="site-body text-left text-white/65">
                                Bridging the digital-physical gap with &ldquo;hacked&rdquo; hardware.
                            </p>
                        </div>
                    </Reveal>

                    {/* Insight */}
                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                The Insight
                            </span>
                            <p className="site-body text-white/65 text-left">
                                Existing content was static and passive. We hypothesized that adding a tactile dimension &ndash; giving residents something to hold &ndash; would increase emotional grounding and immersion.
                            </p>
                        </div>
                    </Reveal>

                    {/* Cat Petting Prototype */}
                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                The Prototype: The Cat Petting Experience
                            </span>
                            <p className="site-body text-white/65 text-left">
                                I &ldquo;hacked&rdquo; three plush cats, embedding them with pressure sensors and haptic vibration motors wired to an Arduino. Petting the toy triggered a &ldquo;purr&rdquo; vibration and played a synchronized video of that cat on the screen.
                            </p>
                        </div>
                    </Reveal>

                    {/* Cat Hero — standalone showcase */}
                    <Reveal>
                        <div className="w-full min-w-0 case-study-subsection-gap">
                            <LightboxImage
                                src="/assets/memory-care/catpettingresult.avif"
                                alt="The cat petting experience — a plush cat embedded with pressure sensors and haptic motors"
                                className="w-full h-auto rounded-2xl"
                                draggable={false}
                                hoverScale={1.02}
                            />
                            <p className="site-gallery-caption case-study-caption-tight-mt text-left text-white/45">
                                The cat petting prototype &mdash; a plush toy embedded with pressure sensors and haptic vibration motors.
                            </p>
                        </div>
                    </Reveal>

                    {/* Cat prototype — horizontal carousel (same model as home work galleries) */}
                    <Reveal>
                        <CatPrototypeCarousel className="case-study-block-gap w-full min-w-0" />
                    </Reveal>

                    {/* Cat Petting Interactive */}
                    <Reveal>
                        <CatPettingInteractive className="case-study-block-gap" />
                    </Reveal>

                    {/* Validation */}
                    <Reveal>
                        <div className="bg-card rounded-2xl border border-white/10 p-8 md:p-10">
                            <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                The Validation
                            </span>
                            <p className="site-body text-white/65 text-left">
                                Early testing revealed a strong emotional response; residents instinctively tried to pick up and hold the animals. This validated the need for &ldquo;Tangible Companionship&rdquo; and informed future iterations to be wireless and robust for daily facility use.
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 02: REDEFINING ACCESSIBILITY
                ═══════════════════════════════════════════════ */}
                <section id="accessibility" className={cn(mcesShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="case-study-subsection-gap flex flex-col case-study-heading-trail-gap">
                            <span className="site-label text-white/40 text-left">
                                02
                            </span>
                            <h2 className="site-chapter-heading text-left text-white">
                                Adapting Haptics for Accessibility
                            </h2>
                            <p className="site-body text-left text-white/65">
                                Decoupling technology from furniture to ensure universal access.
                            </p>
                        </div>
                    </Reveal>

                    {/* Constraint / Solution 2-col */}
                    <Reveal>
                        <div className="case-study-grid-gap-wide case-study-block-gap grid grid-cols-1 md:grid-cols-2">
                            <div>
                                <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                    The Constraint
                                </span>
                                <p className="site-body text-white/65 text-left">
                                    Haptic feedback is critical for sensory stimulation. However, the existing prototype was a platform placed under a chair, which was inaccessible to the majority of our residents who use wheelchairs.
                                </p>
                            </div>
                            <div>
                                <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                    The Solution: The Haptic Footrest
                                </span>
                                <p className="site-body text-white/65 text-left">
                                    I iterated on the hardware at home, aiming to further mobilize the haptics. I used an existing foot rest since it could adapt to different people and be moved with ease, and attached a strong haptic emitter to the back of it, enabling the experience of haptics without compromising on accessibility and quality.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Side-by-side — Old haptics to Footrest */}
                    <Reveal className="case-study-block-gap">
                        <div className="case-study-grid-gap-dense grid grid-cols-1 items-start md:grid-cols-2">
                            <div className="rounded-xl overflow-hidden border border-white/10 h-fit">
                                <LightboxImage
                                    src="/assets/memory-care/oldhaptics.avif"
                                    alt="Original haptics platform under chair"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-white/10 h-fit">
                                <LightboxImage
                                    src="/assets/memory-care/footrest_prototype.jpg"
                                    alt="Haptic footrest prototype"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className="site-gallery-caption case-study-caption-tight-mt text-left text-white/45">
                            By changing the form factor from a floor panel to a footrest, we ensured 100% of residents could access the experience without leaving their wheelchairs.
                        </p>
                    </Reveal>

                    {/* Haptics Flow Interactive */}
                    <Reveal>
                        <HapticsFlow className="case-study-block-gap" />
                    </Reveal>

                    {/* Driving simulator photos */}
                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                The Application: Restoring Agency
                            </span>
                            <p className="site-body case-study-hero-bump-mb text-left text-white/65">
                                We paired this hardware with a Driving Simulator. I thought it would be great to give the residents a sense of control, by having them play a realistic driving game paired with a Logitech steering wheel with force feedback.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal className="case-study-block-gap">
                        <div className="case-study-grid-gap-dense grid grid-cols-1 md:grid-cols-2">
                            <div className="rounded-xl overflow-hidden border border-white/10">
                                <LightboxImage
                                    src="/assets/memory-care/img_3527.jpg"
                                    alt="Haptic footrest setup with driving simulator"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-white/10">
                                <LightboxImage
                                    src="/assets/memory-care/driving_simulator_desk.png"
                                    alt="Custom plywood driving simulator desk on casters with Logitech wheel, monitor, and under-desk electronics enclosure"
                                    className="w-full h-auto object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className="site-gallery-caption case-study-caption-tight-mt text-left text-white/45">
                            The driving setup paired a Logitech force-feedback wheel with POV driving footage and the haptic footrest.
                        </p>
                    </Reveal>

                    {/* Pivot / Fix / Result — stacked cards */}
                    <Reveal>
                        <div className="case-study-grid-gap flex flex-col">
                            <div className="bg-card rounded-xl border border-white/10 p-6">
                                <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                    The Pivot
                                </span>
                                <p className="site-body text-white/65 text-left">
                                    Initial tests with a video game (Assetto Corsa) failed because it was fundamentally a commercial title, not something purpose-built for our audience. It had no guardrails, which led to confusion, and it was cumbersome to set up.
                                </p>
                            </div>
                            <div className="bg-card rounded-xl border border-white/10 p-6">
                                <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                    The Fix
                                </span>
                                <p className="site-body text-white/65 text-left">
                                    I pivoted to &ldquo;Simulated Agency.&rdquo; We synced high-quality POV driving footage with the Logitech force-feedback wheel and my haptic footrest.
                                </p>
                            </div>
                            <div className="bg-card rounded-xl border border-white/10 p-6">
                                <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                    The Result
                                </span>
                                <p className="site-body text-white/65 text-left">
                                    Residents got the tactile satisfaction of steering and &ldquo;feeling&rdquo; the road rumble through their feet, without the risk of failure.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    SECTION 03: THE CAREGIVER INTERFACE
                ═══════════════════════════════════════════════ */}
                <section id="caregiver" className={cn(mcesShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="case-study-subsection-gap flex flex-col case-study-heading-trail-gap">
                            <span className="site-label text-white/40 text-left">
                                03
                            </span>
                            <h2 className="site-chapter-heading text-left text-white">
                                The Caregiver Interface
                            </h2>
                            <p className="site-body text-left text-white/65">
                                Transforming medical metadata into a session tool.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="case-study-subsection-gap case-study-prose-stack flex flex-col">
                            <p className="site-body text-white/65 text-left">
                                The station is controlled by facility staff who are often stretched thin. If the digital interface was difficult to configure, the physical station would sit unused.
                            </p>
                            <p className="site-body text-white/65 text-left">
                                Maria Mortati had consulted a group of students from CCA&rsquo;s MDes program to design the first iteration and lay the foundations for this part of the project.
                            </p>
                            <p className="site-body text-white/65 text-left">
                                I built off their work to create a simplified IA, design system, and set of high fidelity wireframes ready for dev handoff.
                            </p>
                        </div>
                    </Reveal>

                    {/* Dashboard — full width */}
                    <Reveal className="case-study-block-gap">
                        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-white/10">
                            <LightboxImage
                                src="/assets/memory-care/simple_dash.png"
                                alt="Caregiver dashboard: morning greeting, resident selection, session scheduling, incomplete observation forms, and layered experience guidance with engagement tips"
                                className="h-auto w-full"
                                draggable={false}
                            />
                        </div>
                        <p className="site-gallery-caption case-study-caption-tight-mt text-left text-white/45">
                            The interface prioritizes &ldquo;Session Flow&rdquo; over &ldquo;Data Entry,&rdquo; empowering staff to personalize experiences in seconds.
                        </p>
                    </Reveal>

                    {/* Detail cards — stacked */}
                    <Reveal>
                        <div className="case-study-grid-gap case-study-block-gap flex w-full min-w-0 flex-col">
                            <div className="w-full min-w-0 rounded-xl border border-white/10 bg-card p-6">
                                <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                    Reducing Cognitive Load
                                </span>
                                <div className="case-study-heading-trail-mb w-full min-w-0 overflow-hidden rounded-lg">
                                    <LightboxImage
                                        src="/assets/memory-care/reducingcogload.png"
                                        alt="Dashboard UI after cognitive load work: engagement tips and simplified session controls surfaced first"
                                        className="h-auto w-full"
                                        draggable={false}
                                    />
                                </div>
                                <p className="site-body text-white/65 text-left">
                                    I removed extraneous widgets and filtered the Information Architecture to prioritize &ldquo;Engagement Tips&rdquo; and simple session controls.
                                </p>
                            </div>
                            <div className="w-full min-w-0 rounded-xl border border-white/10 bg-card p-6">
                                <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                    Personalization
                                </span>
                                <div className="case-study-heading-trail-mb w-full min-w-0 overflow-hidden rounded-lg">
                                    <LightboxImage
                                        src="/assets/memory-care/Specific Resident.png"
                                        alt="Experience library for a specific resident: preferences, most played, and recommended videos"
                                        className="h-auto w-full"
                                        draggable={false}
                                    />
                                </div>
                                <p className="site-body text-white/65 text-left">
                                    I introduced &ldquo;Quick Add&rdquo; features for improvised content (e.g., specific YouTube requests) and recommended playlists based on resident history.
                                </p>
                            </div>
                            <div className="w-full min-w-0 rounded-xl border border-white/10 bg-card p-6">
                                <span className="site-label text-white/40 case-study-heading-trail-mb block text-left">
                                    Contextual Notes
                                </span>
                                <div className="case-study-heading-trail-mb w-full min-w-0 overflow-hidden rounded-lg">
                                    <LightboxImage
                                        src="/assets/memory-care/residentprofile.png"
                                        alt="Resident profile with staff notes and preferences surfaced for session planning"
                                        className="h-auto w-full"
                                        draggable={false}
                                    />
                                </div>
                                <p className="site-body text-white/65 text-left">
                                    I replaced buried metadata with prominent staff notes, ensuring critical preferences (e.g., &ldquo;responds to socially interactive experiences&rdquo;) were visible at a glance.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* WEBUI — video detail */}
                    <Reveal>
                        <div className="flex w-full min-w-0 flex-col">
                            <div className="overflow-hidden rounded-xl border border-white/10">
                                <LightboxImage
                                    src="/assets/memory-care/ui_video_player.jpg"
                                    alt="Video player interface"
                                    className="h-auto w-full"
                                    draggable={false}
                                />
                            </div>
                            <p className="site-gallery-caption case-study-caption-tight-mt text-left text-white/45">
                                Experience content page with guidance for caregivers on how to run a session
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    IMPACT STATS
                ═══════════════════════════════════════════════ */}
                <section id="impact" className="relative case-study-section-y overflow-hidden">
                    <div className={cn("relative", mcesShell)}>
                        <Reveal>
                            <div className="case-study-grid-gap-wide grid grid-cols-1 text-center md:grid-cols-3">
                                <div>
                                    <p className="type-h1 case-study-tight-trail-mb text-left text-white/85">
                                        194+
                                    </p>
                                    <p className="site-body text-white/65 text-left">
                                        Recorded sessions at SFCJL
                                    </p>
                                </div>
                                <div>
                                    <p className="type-h1 case-study-tight-trail-mb text-left text-white/85">
                                        95%
                                    </p>
                                    <p className="site-body text-white/65 text-left">
                                        Positive sentiment (33% Very Positive, 62% Positive)
                                    </p>
                                </div>
                                <div>
                                    <p className="type-h1 case-study-tight-trail-mb text-left text-white/85">
                                        6+
                                    </p>
                                    <p className="site-body text-white/65 text-left">
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
                <section className={cn(mcesShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="case-study-grid-gap-wide flex w-full min-w-0 flex-col">
                            <div className="case-study-prose-stack flex w-full min-w-0 flex-col rounded-2xl border border-white/10 bg-card p-8 md:p-10">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-white/12">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                                <p className="site-body text-left text-white/85">
                                    &ldquo;The Experience Station helps bring residents back online. It soothes the parasympathetic nervous system and helps mitigate distressing behaviors.&rdquo;
                                </p>
                                <p className="site-body text-left text-white/45">
                                    Manager of Life Enrichment, SFCJL
                                </p>
                            </div>
                            <div className="case-study-prose-stack flex w-full min-w-0 flex-col rounded-2xl border border-white/10 bg-card p-8 md:p-10">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-white/12">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                </svg>
                                <p className="site-body text-left text-white/85">
                                    &ldquo;The Experience Station is a way to bridge connections, foster relationships for new staff to home in on residents. As well as facilitation for family members with their desire for connection.&rdquo;
                                </p>
                                <p className="site-body text-left text-white/45">
                                    Life Enrichment Coordinator, SFCJL
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    AWARDS
                ═══════════════════════════════════════════════ */}
                <section className={cn(mcesShell, "pb-20 md:pb-28")}>
                    <Reveal>
                        <div className="bg-card rounded-2xl border border-white/10 p-8 md:p-10">
                            <h3 className="site-label case-study-panel-heading-mb text-left text-white/40">
                                Recognition
                            </h3>
                            <div className="case-study-prose-stack flex flex-col">
                                <div className="case-study-grid-gap-dense flex items-start">
                                    <span
                                        aria-hidden
                                        className="flex h-[1.5rem] w-4 shrink-0 items-center justify-center leading-none text-white/40"
                                    >
                                        &#9733;
                                    </span>
                                    <p className="site-body text-white/85 text-left">
                                        CABHI (Centre for Aging + Brain Health Innovation) — 2x Award Recipient
                                    </p>
                                </div>
                                <div className="case-study-grid-gap-dense flex items-start">
                                    <span
                                        aria-hidden
                                        className="flex h-[1.5rem] w-4 shrink-0 items-center justify-center leading-none text-white/40"
                                    >
                                        &#9733;
                                    </span>
                                    <p className="site-body text-white/85 text-left">
                                        Finalist: Fast Company 2022 World Changing Ideas (Experimental Category)
                                    </p>
                                </div>
                                <div className="case-study-grid-gap-dense flex items-start">
                                    <span
                                        aria-hidden
                                        className="flex h-[1.5rem] w-4 shrink-0 items-center justify-center leading-none text-white/40"
                                    >
                                        &#9733;
                                    </span>
                                    <p className="site-body text-white/85 text-left">
                                        SCAN Foundation Innovation Award
                                    </p>
                                </div>
                                <div className="case-study-grid-gap-dense flex items-start">
                                    <span
                                        aria-hidden
                                        className="flex h-[1.5rem] w-4 shrink-0 items-center justify-center leading-none text-white/40"
                                    >
                                        &#9733;
                                    </span>
                                    <p className="site-body text-white/85 text-left">
                                        Leading Age Innovation Award
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    SIDE NOTE
                ═══════════════════════════════════════════════ */}
                <section className={cn(mcesShell, "pb-20 md:pb-28")}>
                    <Reveal>
                        <div className="rounded-2xl border border-white/10 bg-card p-8 md:p-10">
                            <p className="site-body text-left text-white/65 italic">
                                Side Note: The haptic footrest prototype was so engaging to use for media consumption that I actually built a second unit to keep for myself.
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    REFLECTION
                ═══════════════════════════════════════════════ */}
                <section id="reflection" className={cn(mcesShell, "pb-32 md:pb-40")}>
                    <Reveal>
                        <h2 className="site-chapter-heading case-study-hero-bump-mb text-left text-white">
                            Reflection
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <div className="case-study-grid-gap-wide flex flex-col">
                            <p className="site-body text-white/65 text-left">
                                I love to work in a hands-on capacity: screens, toys, games, physical form, all of it. This was a unique chance to stretch my skills and have the independence to create impactful experiences from scratch, as challenging as that was. This project came with a lot of special considerations for our users, and it changed my perspective as a designer to try to always consider the needs of all populations, not just the most common.
                            </p>
                            <div className="rounded-xl overflow-hidden border border-white/10">
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
        <CaseStudyPill projectSlug="memory-care" />
        <StickyNotes page="memory-care" />
        </>
    );
}

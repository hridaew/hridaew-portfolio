"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { GrainOverlay } from "@/components/virdio/GrainOverlay";
import { CloseButton } from "@/components/virdio/CloseButton";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { TextReveal } from "@/components/TextReveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { GazeSimulator } from "@/components/obscura/GazeSimulator";
import { DualPerspective } from "@/components/obscura/DualPerspective";
import { FilmStrip } from "@/components/obscura/FilmStrip";
import { ImagePlaceholder } from "@/components/obscura/ImagePlaceholder";
import { WayneCarousel } from "@/components/obscura/WayneCarousel";
import { EyeTrackingDemo } from "@/components/obscura/EyeTrackingDemo";
import { ExhibitionMosaic } from "@/components/obscura/ExhibitionMosaic";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";

interface DwellData {
    regionId: string;
    label: string;
    time: number;
    color: string;
}

function ObscuraVideo({ src, label }: { src: string; label: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    return (
        <div
            className="relative rounded-xl overflow-hidden border border-neutral-800 group"
            onMouseEnter={() => {
                if (videoRef.current) {
                    videoRef.current.muted = false;
                    setIsMuted(false);
                }
            }}
            onMouseLeave={() => {
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    setIsMuted(true);
                }
            }}
        >
            <video
                ref={videoRef}
                src={src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-white/70 bg-black/40 px-2 py-1 rounded">
                    {label}
                </span>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/40 p-1.5 rounded-full">
                {isMuted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                )}
            </div>
        </div>
    );
}

export default function ObscuraPage() {
    const [dwellData, setDwellData] = useState<DwellData[]>([]);

    useEffect(() => {
        document.documentElement.classList.add("dark");
        return () => {
            document.documentElement.classList.remove("dark");
        };
    }, []);

    const handleDwellUpdate = useCallback((data: DwellData[]) => {
        setDwellData(data);
    }, []);

    return (
        <>
        <LightboxProvider>
            <div className="bg-[#0A0A0A] min-h-screen w-full relative overflow-x-hidden selection:bg-amber-900/40 selection:text-amber-200 font-sans antialiased">
                <GrainOverlay />
                <CloseButton variant="dark" />
                <StickySidebar
                    sections={[
                        { id: "hero", label: "Intro", number: "00" },
                        { id: "overview", label: "Overview", number: "01" },
                        { id: "intent", label: "Intent", number: "02" },
                        { id: "blueprint", label: "Blueprint", number: "03" },
                        { id: "prototyping", label: "Prototyping", number: "04" },
                        { id: "exhibition", label: "Exhibition", number: "05" },
                        { id: "reflection", label: "Reflection", number: "06" },
                    ]}
                    variant="dark"
                />

                {/* ─── DARK HERO ─── */}
                <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
                    {/* Hero background image */}
                    <div className="absolute inset-0">
                        <img
                            src="/assets/obscura/wayne_1946.avif"
                            alt=""
                            className="w-full h-full object-cover opacity-20"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
                        {/* Vignette */}
                        <div className="absolute inset-0" style={{
                            background: "radial-gradient(ellipse at center, transparent 40%, #0A0A0A 100%)"
                        }} />
                    </div>

                    <div className="relative text-center px-6 py-32 md:py-40">
                        <Reveal>
                            <a
                                href="https://mohai.org/event/transpacific-photography-and-the-obscura-project-post-world-war-ii-life-in-japan/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.3em] mb-8 hover:text-amber-200/90 transition-colors inline-flex items-center gap-1.5"
                            >
                                MOHAI &mdash; Museum of History &amp; Industry, Seattle
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline-block">
                                    <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </a>
                        </Reveal>

                        <HeroTextAnimation variant="split-chars" className="font-[family-name:var(--font-instrument-serif)] text-6xl md:text-8xl lg:text-9xl text-neutral-100 leading-[0.95] mb-8">
                            OBSCURA
                        </HeroTextAnimation>

                        <Reveal delay={0.3}>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg md:text-xl text-neutral-400 max-w-[540px] mx-auto leading-relaxed mb-10">
                                A dynamically curated immersive exhibit where your gaze writes the story.
                            </p>
                        </Reveal>

                        <Reveal delay={0.4}>
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 font-[family-name:var(--font-dm-sans)] text-sm text-neutral-500">
                                <div>
                                    <span className="text-neutral-600 block text-xs uppercase tracking-wider mb-0.5">Role</span>
                                    Project Lead, Design, Unity Dev
                                </div>
                                <div>
                                    <span className="text-neutral-600 block text-xs uppercase tracking-wider mb-0.5">Team</span>
                                    Asa Symons, Caiya Wiltshire, Nick Hallin
                                </div>
                                <div>
                                    <span className="text-neutral-600 block text-xs uppercase tracking-wider mb-0.5">Client</span>
                                    MOHAI
                                </div>
                                <div>
                                    <span className="text-neutral-600 block text-xs uppercase tracking-wider mb-0.5">Date</span>
                                    September 13, 2025
                                </div>
                                <div>
                                    <span className="text-neutral-600 block text-xs uppercase tracking-wider mb-0.5">Key Tech</span>
                                    Unity, VR, Head Tracking, Claude Code
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ─── THE PROMPT ─── */}
                <section className="max-w-[720px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <p className="font-[family-name:var(--font-dm-sans)] text-xl md:text-2xl text-neutral-400 leading-[1.7] font-normal">
                            The Museum of History and Industry (MOHAI) approached our team with a hidden archive: hundreds of unexposed 35mm photos taken by Wayne Wong, a Signal Corps soldier rebuilding Japan in 1946. The brief was ambiguous: take these images and &ldquo;create something boundary-pushing.&rdquo;
                        </p>
                    </Reveal>
                </section>

                {/* ─── Wayne Archive Carousel ─── */}
                <section className="pb-20 md:pb-28">
                    <Reveal>
                        <WayneCarousel />
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    EXPERIENCE OVERVIEW
                ═══════════════════════════════════════════════ */}
                <section id="overview" className="max-w-[920px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="mb-12">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                Experience Overview
                            </h2>
                            <p className="font-[family-name:var(--font-dm-sans)] text-neutral-500 text-lg">
                                Obscura is a gaze-driven documentary system consisting of two simultaneous experiences.
                            </p>
                        </div>
                    </Reveal>

                    {/* Dual Perspective Component */}
                    <Reveal>
                        <DualPerspective
                            curatorImage="/assets/obscura/CuratorIMG.png"
                            spectatorImage="/assets/obscura/spectatorIMG.png"
                            className="mb-12"
                        />
                    </Reveal>

                    {/* Curator & Spectator Videos */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ObscuraVideo
                                src="/assets/obscura/curator.mp4"
                                label="Curator View"
                            />
                            <ObscuraVideo
                                src="/assets/obscura/spectator.mp4"
                                label="Spectator View"
                            />
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 text-center mt-4">
                            Hover to unmute — the Curator View (inside the booth) and the Spectator View (audience outside).
                        </p>
                    </Reveal>
                </section>

                {/* ─── VIDEO EMBED ─── */}
                <section className="max-w-[1000px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
                            <video
                                src="/assets/obscura/exhibition_day.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full aspect-video"
                                poster="/assets/obscura/audience_gaze.avif"
                            />
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 text-center mt-4">
                            Exhibition Day at MOHAI
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    INTENT
                ═══════════════════════════════════════════════ */}
                <section id="intent" className="max-w-[920px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="mb-16">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                Intent
                            </h2>
                            <p className="font-[family-name:var(--font-dm-sans)] text-neutral-500 text-lg">
                                We wanted to explore new ways to present images as an orchestrated experience.
                            </p>
                        </div>
                    </Reveal>

                    {/* 4 Editorial Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                        <Reveal>
                            <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
                                <h3 className="font-[family-name:var(--font-dm-sans)] text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-4">
                                    Speak to the Audience While Respecting the Artist
                                </h3>
                                <p className="font-[family-name:var(--font-dm-sans)] text-neutral-400 text-sm leading-relaxed">
                                    Wayne took hundreds of photos but didn&apos;t talk about his intent. The exhibit allows users to view his photos, tracking what parts they dwell on. An external audience views through the first viewer&apos;s eyes, collectively defining the role of intent.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
                                <h3 className="font-[family-name:var(--font-dm-sans)] text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-4">
                                    Build Anticipation
                                </h3>
                                <p className="font-[family-name:var(--font-dm-sans)] text-neutral-400 text-sm leading-relaxed">
                                    The &ldquo;Audience View&rdquo; offered a low-pressure way to engage before entering. People could wonder, &ldquo;Why are they focused on the clothing instead of the temple?&rdquo; This turned waiting into an active, social event.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
                                <h3 className="font-[family-name:var(--font-dm-sans)] text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-4">
                                    Give People Something to Talk About
                                </h3>
                                <p className="font-[family-name:var(--font-dm-sans)] text-neutral-400 text-sm leading-relaxed">
                                    Recognizing the value of conversation before and after an experience, I designed a photo-strip souvenir. This strip visualizes which parts of an image participants looked at most.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={0.3}>
                            <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
                                <h3 className="font-[family-name:var(--font-dm-sans)] text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-4">
                                    Create Space for Meaningful Engagement
                                </h3>
                                <p className="font-[family-name:var(--font-dm-sans)] text-neutral-400 text-sm leading-relaxed">
                                    Today&apos;s image engagement, largely through social media, often overlooks the significance of what we see. By presenting Wayne&apos;s photos individually, the exhibit creates an intimate setting for detailed investigation.
                                </p>
                            </div>
                        </Reveal>
                    </div>

                    {/* Photo strip souvenirs */}
                    <Reveal>
                        <div className="overflow-x-auto pb-4 -mx-6 px-6">
                            <div className="flex gap-4 min-w-max">
                                {[
                                    { src: "/assets/obscura/photostrip_faces.png", alt: "Faces photo strip souvenir" },
                                    { src: "/assets/obscura/photostrip_environments.png", alt: "Environments photo strip souvenir" },
                                    { src: "/assets/obscura/photostrip_clothing.png", alt: "Clothing photo strip souvenir" },
                                    { src: "/assets/obscura/photostrip_occupation.png", alt: "Occupation photo strip souvenir" },
                                    { src: "/assets/obscura/photostrip_wayne.png", alt: "Wayne photo strip souvenir" },
                                ].map((strip) => (
                                    <div key={strip.alt} className="flex-shrink-0 w-[180px] md:w-[220px] rounded-xl overflow-hidden border border-neutral-800">
                                        <LightboxImage
                                            src={strip.src}
                                            alt={strip.alt}
                                            className="w-full h-auto"
                                            draggable={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 text-center mt-4">
                            Photo-strip souvenirs generated based on each viewer&apos;s gaze path &mdash; Faces, Environments, Clothing, Occupation, and Wayne.
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    THE BLUEPRINT
                ═══════════════════════════════════════════════ */}
                <section id="blueprint" className="max-w-[920px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="mb-16">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                The Blueprint: Making Meaning
                            </h2>
                            <p className="font-[family-name:var(--font-dm-sans)] text-neutral-500 text-lg">
                                Designing for Connection, Intent, and Curiosity.
                            </p>
                        </div>
                    </Reveal>

                    {/* Research intro */}
                    <Reveal>
                        <div className="mb-16">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                Research: Finding the Human Narrative
                            </span>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-400 leading-relaxed max-w-[680px]">
                                We began with a blurry image of what to make. To find clarity, we moved away from abstract theory and went directly to the source. We interviewed Subject Matter Experts in museology and history, but most importantly, we conducted deep-dive interviews with younger Asian Americans to understand how they engage with historical imagery in the digital age.
                            </p>
                        </div>
                    </Reveal>

                    {/* 3 Interview Quotes */}
                    <div className="space-y-8 mb-16">
                        <Reveal>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2">
                                <p className="font-[family-name:var(--font-dm-sans)] text-xl md:text-2xl text-neutral-300 leading-relaxed mb-3">
                                    &ldquo;Looking at old family photos can be very emotional. I&apos;m the youngest of a very big family. So there&apos;s a lot of family history that I have no experience of, so getting to engage with photos from that time is really meaningful.&rdquo;
                                </p>
                                <cite className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 not-italic">
                                    Interview Participant &mdash; On Connection &amp; Family History
                                </cite>
                            </blockquote>
                        </Reveal>
                        <Reveal>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2">
                                <p className="font-[family-name:var(--font-dm-sans)] text-xl md:text-2xl text-neutral-300 leading-relaxed mb-3">
                                    &ldquo;He took many pictures of kids. I wonder how he got to know them? Did he ask if he could take the picture? Especially the kids&hellip; Did he know them?&rdquo;
                                </p>
                                <cite className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 not-italic">
                                    Interview Participant &mdash; On The Mystery of Intent
                                </cite>
                            </blockquote>
                        </Reveal>
                        <Reveal>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2">
                                <p className="font-[family-name:var(--font-dm-sans)] text-xl md:text-2xl text-neutral-300 leading-relaxed mb-3">
                                    &ldquo;It&apos;s a really disorienting thing where you&apos;re scrolling, and you&apos;re watching something that&apos;s funny, and then you&apos;re looking at a recipe, and the next picture is of an atrocity.&rdquo;
                                </p>
                                <cite className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 not-italic">
                                    Interview Participant &mdash; On Modern Media Fatigue
                                </cite>
                            </blockquote>
                        </Reveal>
                    </div>

                    {/* Process photos */}
                    <Reveal>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                            <div className="rounded-xl overflow-hidden border border-neutral-800">
                                <LightboxImage
                                    src="/assets/obscura/process_brainstorm.avif"
                                    alt="Team brainstorming session"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800">
                                <LightboxImage
                                    src="/assets/obscura/process_interview.avif"
                                    alt="Community interview"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800">
                                <LightboxImage
                                    src="/assets/obscura/process_sme_interview.avif"
                                    alt="Subject matter expert interview"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800 col-span-2 md:col-span-2">
                                <LightboxImage
                                    src="/assets/obscura/process_ideation.avif"
                                    alt="Ideation — 100+ ideas generated"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 text-center mb-16">
                            Research, interviews, and ideation — generating over 80 concepts before aligning on five &ldquo;North Star&rdquo; adjectives.
                        </p>
                    </Reveal>

                    {/* Ideation text */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
                            <div>
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    Ideation: Finding the North Star
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-base text-neutral-400 leading-relaxed">
                                    We generated over 80 concepts, explicitly filtering out trends like NFTs or AI-modification to focus on the core value of the archive. We aligned on five &ldquo;North Star&rdquo; adjectives: Introspective, Connected, Reflective, Transient, and Enduring.
                                </p>
                            </div>
                            <div>
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    Storyboarding the Invisible
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-base text-neutral-400 leading-relaxed">
                                    Because we were creating an asynchronous experience dictated by attention, standard wireframes failed. I used high-fidelity storyboarding to map the emotional journey, identifying key opportunities like the &ldquo;Souvenir Moment&rdquo; at the exit.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Storyboard image */}
                    <Reveal>
                        <div className="rounded-2xl overflow-hidden border border-neutral-800 mb-4">
                            <LightboxImage
                                src="/assets/obscura/storyboard.png"
                                alt="Hand-drawn storyboards mapping the visitor journey"
                                className="w-full h-auto"
                                draggable={false}
                            />
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 text-center mb-16">
                            Hand-drawn storyboards showcasing key visitor interaction opportunities throughout the experience.
                        </p>
                    </Reveal>

                    {/* Sketches — Click to expand */}
                    <Reveal>
                        <div className="mb-4">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-4">
                                Early Sketches
                            </span>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { src: "/assets/obscura/sketches/IMG_9424.jpg", alt: "Obscura sketch 1" },
                                    { src: "/assets/obscura/sketches/IMG_9445.jpg", alt: "Obscura sketch 2" },
                                    { src: "/assets/obscura/sketches/IMG_9513.jpg", alt: "Obscura sketch 3" },
                                    { src: "/assets/obscura/sketches/IMG_9516.jpg", alt: "Obscura sketch 4" },
                                    { src: "/assets/obscura/sketches/IMG_9518.jpg", alt: "Obscura sketch 5" },
                                    { src: "/assets/obscura/sketches/IMG_9519.jpg", alt: "Obscura sketch 6" },
                                ].map((sketch) => (
                                    <div key={sketch.alt} className="rounded-xl overflow-hidden border border-neutral-800">
                                        <LightboxImage
                                            src={sketch.src}
                                            alt={sketch.alt}
                                            className="w-full h-full object-cover"
                                            draggable={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 text-center">
                            Early concept sketches exploring spatial layout, viewer interaction, and gaze-tracking visualization.
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    PROTOTYPING & THE PIVOT
                ═══════════════════════════════════════════════ */}
                <section id="prototyping" className="max-w-[920px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="mb-16">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                Prototyping &amp; The Pivot
                            </h2>
                        </div>
                    </Reveal>

                    <Reveal>
                        <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-400 leading-relaxed max-w-[680px] mb-12">
                            We role-played with low-fidelity prototypes to test the physical space, creating a cardboard &ldquo;Portola Obscura&rdquo; booth to test light and shadow.
                        </p>
                    </Reveal>

                    {/* Problem / Solution 2-col */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
                            <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-red-400/70 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Problem
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-base text-neutral-400 leading-relaxed">
                                    Our initial concept relied on Eye Tracking (using a Tobii bar) for precision. However, consultations with Meta Reality Labs revealed that displaying raw eye-tracking data to a public audience violated privacy protocols.
                                </p>
                            </div>
                            <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-emerald-400/70 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Solution
                                </span>
                                <p className="font-[family-name:var(--font-dm-sans)] text-base text-neutral-400 leading-relaxed">
                                    We pivoted to Head Tracking. This technical constraint became a design feature: by scaling the images up in the virtual space, we forced users to physically turn their heads, making their intent visible and performative for the audience outside.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Eye Tracking Demo — after Problem/Solution */}
                    <Reveal>
                        <div className="mb-16">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                The Gaze Challenge
                            </span>
                            <p className="font-[family-name:var(--font-dm-sans)] text-base text-neutral-400 leading-relaxed max-w-[680px] mb-8">
                                Eye tracking produces erratic, involuntary data &mdash; saccades and micro-fixations that don&rsquo;t reflect conscious intent. Head tracking, by contrast, captures deliberate, performative movement that audiences can read from outside.
                            </p>
                            <EyeTrackingDemo />
                        </div>
                    </Reveal>

                    {/* Technical diagrams */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="rounded-xl overflow-hidden border border-neutral-800">
                                <LightboxImage
                                    src="/assets/obscura/zone_breakdown.png"
                                    alt="Zone breakdown diagram showing image regions"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800">
                                <LightboxImage
                                    src="/assets/obscura/image_annotations.png"
                                    alt="Image annotations screenshot"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800">
                                <LightboxImage
                                    src="/assets/obscura/zone_labels.png"
                                    alt="Zone labels for annotation system"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className="font-[family-name:var(--font-dm-sans)] text-sm text-neutral-600 text-center">
                            Technical diagrams &mdash; zone breakdown, image annotations, and labeling system for the gaze-driven narrative branching.
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    GAZE SIMULATOR (Interactive)
                ═══════════════════════════════════════════════ */}
                <section className="max-w-[920px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="mb-12">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                Interactive Demo
                            </span>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                Explore Like a Viewer
                            </h2>
                            <p className="font-[family-name:var(--font-dm-sans)] text-neutral-500 text-lg max-w-[600px]">
                                Move your cursor over Wayne&apos;s photograph below. Dwell on regions of interest to see how the system tracks and categorizes your attention.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <GazeSimulator
                            imageSrc="/assets/obscura/zone_breakdown_noui.png"
                            imageAlt="Wayne Wong photograph — zone breakdown for gaze-driven narrative"
                            onDwellUpdate={handleDwellUpdate}
                        />
                    </Reveal>

                    {/* Film Strip souvenir */}
                    <Reveal>
                        <div className="mt-8">
                            <FilmStrip dwellData={dwellData} />
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    EXHIBITION PHOTOS
                ═══════════════════════════════════════════════ */}
                <section id="exhibition" className="max-w-[1000px] mx-auto px-6 md:px-12 pb-24 md:pb-32">
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                            <div className="rounded-xl overflow-hidden border border-neutral-800 h-fit">
                                <LightboxImage
                                    src="/assets/obscura/exhibition_photostrips.avif"
                                    alt="Photo strip souvenirs displayed at exhibition"
                                    className="w-full h-auto object-contain"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800 h-fit">
                                <LightboxImage
                                    src="/assets/obscura/flyer.png"
                                    alt="Obscura exhibition flyer"
                                    className="w-full h-auto object-contain"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    REFLECTION
                ═══════════════════════════════════════════════ */}
                <section id="reflection" className="relative py-24 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-[#0A0A0A]" />
                    <div className="relative max-w-[920px] mx-auto px-6 md:px-12">
                        <Reveal>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-8">
                                Reflection
                            </h2>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-400 leading-relaxed mb-6 max-w-[680px]">
                                The exhibit launched at MOHAI on September 13, 2025. The dynamic nature of the &ldquo;Audience View&rdquo; successfully built anticipation, creating a queue that lasted the entire duration of the event. The project proved that we could bridge the gap between a soldier&rsquo;s 1946 reality and a modern audience&rsquo;s digital curiosity, simply by asking them to look closer.
                            </p>
                        </Reveal>
                        <Reveal delay={0.2}>
                            <p className="font-[family-name:var(--font-dm-sans)] text-lg text-neutral-400 leading-relaxed max-w-[680px]">
                                We are currently in talks for expanding the exhibit to a longer-term installation at MOHAI.
                            </p>
                        </Reveal>
                    </div>
                </section>

                {/* ─── Exhibition Mosaic ─── */}
                <Reveal>
                    <ExhibitionMosaic className="py-16 md:py-24" />
                </Reveal>

                {/* Bottom spacer */}
                <div className="h-20" />
            </div>
        </LightboxProvider>
        <StickyNotes />
        </>
    );
}

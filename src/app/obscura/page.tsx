"use client";

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
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
import { cn } from "@/lib/utils";

/** DM Sans, 18px (`text-lg`), relaxed leading — default body for this case study page */
const obBody = "font-[family-name:var(--font-dm-sans)] text-lg leading-relaxed";

/** Shared content column: max width + horizontal padding + center */
const obscuraSectionShell = "max-w-[920px] mx-auto px-6 md:px-12";

function IntentPrincipleRow({
  children,
  imageAria,
  delay = 0,
  imageSrc,
  imageAlt,
}: {
  children: ReactNode;
  /** Used when `imageSrc` is not set (placeholder). */
  imageAria?: string;
  delay?: number;
  imageSrc?: string;
  imageAlt?: string;
}) {
  const visual =
    imageSrc != null && imageAlt != null ? (
      <LightboxImage
        src={imageSrc}
        alt={imageAlt}
        className="h-full w-full object-cover"
        draggable={false}
      />
    ) : (
      <div className="h-full w-full min-h-0" role="img" aria-label={imageAria ?? ""}>
        <ImagePlaceholder
          variant="frame"
          label="Image coming soon"
          fullBleed
          className="border-0 bg-gradient-to-br from-neutral-900 to-neutral-950"
        />
      </div>
    );

  return (
    <Reveal delay={delay}>
      <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-6 md:items-stretch">
        <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8 min-h-0 flex flex-col md:h-full">
          {children}
        </div>
        <div className="md:flex md:h-full md:min-h-0 md:items-center md:justify-center">
          <div className="relative w-full aspect-square shrink-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 md:max-h-full md:w-full">
            {visual}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

interface DwellData {
    regionId: string;
    label: string;
    time: number;
    color: string;
}

function ObscuraVideo({
    src,
    label,
    objectPosition = "center",
    objectFit = "cover",
}: {
    src: string;
    label: string;
    objectPosition?: "center" | "bottom";
    objectFit?: "cover" | "contain";
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    return (
        <div
            className={cn(
                "relative rounded-xl overflow-hidden border border-neutral-800 group",
                objectFit === "contain" && "bg-neutral-950"
            )}
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
                className={cn(
                    "w-full aspect-square",
                    objectFit === "contain" ? "object-contain" : "object-cover",
                    objectPosition === "bottom" && "object-bottom"
                )}
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
                        { id: "blueprint", label: "Ideation", number: "03" },
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

                    <div className="relative text-center px-6 md:px-12 py-32 md:py-40">
                        <Reveal>
                            <a
                                href="https://mohai.org/event/transpacific-photography-and-the-obscura-project-post-world-war-ii-life-in-japan/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.3em] mb-8 hover:text-amber-200/90 transition-colors inline-flex items-center gap-1.5"
                            >
                                MOHAI &mdash; Museum of History &amp; Industry, Seattle
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="inline-block shrink-0 opacity-80"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <polyline
                                        points="15 3 21 3 21 9"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <line
                                        x1="10"
                                        y1="14"
                                        x2="21"
                                        y2="3"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </a>
                        </Reveal>

                        <HeroTextAnimation variant="split-chars" className="font-[family-name:var(--font-instrument-serif)] text-6xl md:text-8xl lg:text-9xl text-neutral-100 leading-[0.95] mb-8">
                            OBSCURA
                        </HeroTextAnimation>

                        <Reveal delay={0.3}>
                            <p
                                className={cn(
                                    obBody,
                                    "text-neutral-400 max-w-[min(680px,calc(100vw-3rem))] mx-auto mb-10 text-balance [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_2px_16px_rgba(0,0,0,0.65),0_0_40px_rgba(10,10,10,0.55)]"
                                )}
                            >
                                Obscura is an immersive experience that bridges solitary Virtual Reality and public exhibition &mdash; a spatial computing environment where the viewer&apos;s gaze dynamically curates the images they see.
                            </p>
                        </Reveal>
                        <Reveal delay={0.35}>
                            <p
                                className={cn(
                                    obBody,
                                    "text-neutral-400 max-w-[min(680px,calc(100vw-3rem))] mx-auto mb-10 text-balance [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_2px_16px_rgba(0,0,0,0.65),0_0_40px_rgba(10,10,10,0.55)]"
                                )}
                            >
                                I drove the Interaction Design, prototyping, and Unity development. Together, the team and I transformed isolated exploration into a shared social narrative for the broader museum audience.
                            </p>
                        </Reveal>

                        <Reveal delay={0.4}>
                            <div className={cn("flex flex-wrap justify-center gap-x-8 gap-y-3", obBody, "text-neutral-500")}>
                                <div>
                                    <span className="text-neutral-600 block text-xs uppercase tracking-wider mb-0.5">Role</span>
                                    Lead Interaction Designer, Prototyper, &amp; Developer
                                </div>
                                <div>
                                    <span className="text-neutral-600 block text-xs uppercase tracking-wider mb-0.5">Team</span>
                                    Asa Symons, Caiya Wiltshire, Nick Hallin
                                </div>
                                <div>
                                    <span className="text-neutral-600 block text-xs uppercase tracking-wider mb-0.5">Client</span>
                                    <a
                                        href="https://mohai.org/event/transpacific-photography-and-the-obscura-project-post-world-war-ii-life-in-japan/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-500 underline underline-offset-2 decoration-neutral-500/60 hover:text-amber-200/90 hover:decoration-amber-200/70 transition-colors"
                                    >
                                        MOHAI
                                    </a>
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
                <section className={cn(obscuraSectionShell, "pb-24 md:pb-32")}>
                    <Reveal>
                        <p className={cn(obBody, "text-neutral-400")}>
                            The Museum of History and Industry handed us a box of unexposed film &mdash; hundreds of photographs taken by a Signal Corps soldier in 1946 Japan, never developed, never seen. The brief was three words: create something boundary-pushing. We made something that asks: when you look at a photograph, who is really doing the looking?
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
                <section id="overview" className={cn(obscuraSectionShell, "pb-24 md:pb-32")}>
                    <Reveal>
                        <div className="mb-12">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                Experience Overview
                            </h2>
                            <p className={cn(obBody, "text-neutral-500")}>
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
                                objectPosition="bottom"
                                objectFit="contain"
                            />
                        </div>
                        <p className={cn(obBody, "text-neutral-600 text-center mt-4")}>
                            Hover to unmute — the Curator View (inside the booth) and the Spectator View (audience outside).
                        </p>
                    </Reveal>
                </section>

                {/* ─── VIDEO EMBED ─── */}
                <section className={cn(obscuraSectionShell, "pb-24 md:pb-32")}>
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
                        <p className={cn(obBody, "text-neutral-600 text-center mt-4")}>
                            End of Exhibition Day at MOHAI
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    INTENT
                ═══════════════════════════════════════════════ */}
                <section id="intent" className={cn(obscuraSectionShell, "pb-24 md:pb-32")}>
                    <Reveal>
                        <div className="mb-16">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                Intent
                            </h2>
                            <p className={cn(obBody, "text-neutral-500")}>
                                We wanted to explore new ways to present images as an orchestrated experience.
                            </p>
                        </div>
                    </Reveal>

                    <div className="space-y-10">
                        <IntentPrincipleRow
                            imageSrc="/assets/obscura/intent_speak_to_audience.png"
                            imageAlt="Wayne Wong smiling in a square portrait; his name appears as text on the image"
                        >
                            <h3 className="font-[family-name:var(--font-dm-sans)] text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-4">
                                Speak to the Audience While Respecting the Artist
                            </h3>
                            <p className={cn(obBody, "text-neutral-400")}>
                                Wayne took hundreds of photos but didn&apos;t talk about his intent. The exhibit allows users to view his photos, tracking what parts they dwell on. An external audience views through the first viewer&apos;s eyes, collectively defining the role of intent.
                            </p>
                        </IntentPrincipleRow>
                        <IntentPrincipleRow
                            delay={0.05}
                            imageSrc="/assets/obscura/intent_build_anticipation.png"
                            imageAlt="Visitors in the gallery watching the projected audience view, with a historic photograph on screen"
                        >
                            <h3 className="font-[family-name:var(--font-dm-sans)] text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-4">
                                Build Anticipation
                            </h3>
                            <p className={cn(obBody, "text-neutral-400")}>
                                The &ldquo;Audience View&rdquo; offered a low-pressure way to engage before entering. People could wonder, &ldquo;Why are they focused on the clothing instead of the temple?&rdquo;. This turned waiting into an active, social event.
                            </p>
                        </IntentPrincipleRow>
                        <IntentPrincipleRow
                            delay={0.1}
                            imageSrc="/assets/obscura/intent_give_people_something.png"
                            imageAlt="Visitor holding a vertical Obscura photo-strip souvenir, examining the black-and-white frames"
                        >
                            <h3 className="font-[family-name:var(--font-dm-sans)] text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-4">
                                Give People Something to Talk About
                            </h3>
                            <p className={cn(obBody, "text-neutral-400")}>
                                Recognizing the value of conversation before and after an experience, I designed a photo-strip souvenir. This strip visualizes which parts of an image participants looked at most.
                            </p>
                        </IntentPrincipleRow>
                        <IntentPrincipleRow
                            delay={0.15}
                            imageSrc="/assets/obscura/intent_create_space.png"
                            imageAlt="Black-and-white archival photograph: a soldier in uniform stands in a crowded outdoor market in post-war Japan, surrounded by children and adults"
                        >
                            <h3 className="font-[family-name:var(--font-dm-sans)] text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-4">
                                Create Space for Meaningful Engagement
                            </h3>
                            <p className={cn(obBody, "text-neutral-400")}>
                                Today&apos;s image engagement, largely through social media, often overlooks the significance of what we see. Wayne&apos;s photos, from a time when images held gravity, regain that importance in this exhibit.
                            </p>
                        </IntentPrincipleRow>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    THE BLUEPRINT
                ═══════════════════════════════════════════════ */}
                <section id="blueprint" className={cn(obscuraSectionShell, "pb-24 md:pb-32")}>
                    <Reveal>
                        <div className="mb-16">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                Making Meaning
                            </h2>
                            <p className={cn(obBody, "text-neutral-500")}>
                                Designing for Connection, Intent, and Curiosity.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="mb-16 md:mb-20 w-full rounded-2xl border border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center md:px-10 md:py-12">
                            <p className={obBody}>
                                <span className="text-amber-200">How might we</span>{" "}
                                <span className="text-neutral-200">
                                    give an audience a meaningful encounter with photographs whose meaning was never meant for them?
                                </span>
                            </p>
                        </div>
                    </Reveal>

                    {/* Research intro */}
                    <Reveal>
                        <div className="mb-16">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                Research: Finding the Human Narrative
                            </span>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px]")}>
                                We began with a blurry image of what to make. To find clarity, we moved away from abstract theory and went directly to the source. We interviewed Subject Matter Experts in museology and history, but most importantly, we conducted deep-dive interviews with younger Asian Americans to understand how they engage with historical imagery in the digital age. Three themes emerged:
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-16">
                            <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-[4/3]">
                                <LightboxImage
                                    src="/assets/obscura/process_interview.avif"
                                    alt="Community interview"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-[4/3]">
                                <LightboxImage
                                    src="/assets/obscura/process_sme_interview.avif"
                                    alt="Subject matter expert interview"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    </Reveal>

                    {/* 3 Interview Quotes */}
                    <div className="space-y-8 mb-16">
                        <Reveal>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2">
                                <p className={cn(obBody, "text-neutral-300 mb-3")}>
                                    &ldquo;Looking at old family photos can be very emotional. I&apos;m the youngest of a very big family. So there&apos;s a lot of family history that I have no experience of, so getting to engage with photos from that time is really meaningful.&rdquo;
                                </p>
                                <cite className={cn(obBody, "text-neutral-600 not-italic")}>
                                    Interview Participant &mdash; On Connection &amp; Family History
                                </cite>
                            </blockquote>
                        </Reveal>
                        <Reveal>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2">
                                <p className={cn(obBody, "text-neutral-300 mb-3")}>
                                    &ldquo;He took many pictures of kids. I wonder how he got to know them? Did he ask if he could take the picture? Especially the kids&hellip; Did he know them?&rdquo;
                                </p>
                                <cite className={cn(obBody, "text-neutral-600 not-italic")}>
                                    Interview Participant &mdash; On The Mystery of Intent
                                </cite>
                            </blockquote>
                        </Reveal>
                        <Reveal>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2">
                                <p className={cn(obBody, "text-neutral-300 mb-3")}>
                                    &ldquo;It&apos;s a really disorienting thing where you&apos;re scrolling, and you&apos;re watching something that&apos;s funny, and then you&apos;re looking at a recipe, and the next picture is of an atrocity.&rdquo;
                                </p>
                                <cite className={cn(obBody, "text-neutral-600 not-italic")}>
                                    Interview Participant &mdash; On Modern Media Fatigue
                                </cite>
                            </blockquote>
                        </Reveal>
                    </div>

                    {/* Research synthesis */}
                    <Reveal>
                        <div className="max-w-[680px] mb-16 space-y-10">
                            <div>
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    Connection
                                </span>
                                <p className={cn(obBody, "text-neutral-400")}>
                                    People encounter historical imagery through the lens of personal family memory, not historical distance.
                                </p>
                            </div>
                            <div>
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Mystery of Intent
                                </span>
                                <p className={cn(obBody, "text-neutral-400")}>
                                    Viewers project questions onto images when context is absent &mdash; the gap is the engagement.
                                </p>
                            </div>
                            <div>
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    Scroll Fatigue
                                </span>
                                <p className={cn(obBody, "text-neutral-400")}>
                                    The speed and flattening of modern image consumption had made people hungry for slowness and weight, even if they couldn&apos;t name it. These three themes became the design pillars of the exhibit.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Process photos — research & interviews */}
                    <Reveal>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-[4/3]">
                                <LightboxImage
                                    src="/assets/obscura/process_brainstorm.avif"
                                    alt="Team brainstorming session"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-[4/3]">
                                <LightboxImage
                                    src="/assets/obscura/process_ideation.avif"
                                    alt="Ideation — 100+ ideas generated"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className={cn(obBody, "text-neutral-600 text-center mb-16")}>
                            Research, interviews, and ideation &mdash; generating over 80 concepts before aligning on five &ldquo;North Star&rdquo; adjectives.
                        </p>
                    </Reveal>

                    {/* North Star adjectives */}
                    <Reveal>
                        <div className="mb-16">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-6">
                                North Star adjectives
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                                {(
                                    [
                                        "Introspective",
                                        "Connected",
                                        "Reflective",
                                        "Transient",
                                        "Enduring",
                                    ] as const
                                ).map((word) => (
                                    <div
                                        key={word}
                                        className="flex min-h-[5rem] items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/50 px-3 py-4 text-center md:min-h-[5.5rem] md:py-5"
                                    >
                                        <span className="font-[family-name:var(--font-dm-sans)] text-[13px] font-semibold leading-snug text-neutral-300 sm:text-sm md:text-[15px]">
                                            {word}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px]")}>
                                These adjectives became the filter for every design decision from there forward.
                            </p>
                        </div>
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
                        <p className={cn(obBody, "text-neutral-600 text-center mb-16")}>
                            Early concept sketches exploring spatial layout, viewer interaction, and gaze-tracking visualization.
                        </p>
                    </Reveal>

                    {/* Storyboarding */}
                    <Reveal>
                        <div className="mb-6">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                Storyboarding the Invisible
                            </span>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px]")}>
                                Because we were creating an asynchronous experience dictated by attention, standard wireframes failed. I used high-fidelity storyboarding to map the emotional journey: the moment a visitor first sees the audience projection and grows curious, the transition from spectator to participant as they enter the booth, the private act of looking, and the &ldquo;Souvenir Moment&rdquo; at the exit &mdash; where a printed photo-strip gives them something physical to carry out and compare with others.
                            </p>
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
                        <p className={cn(obBody, "text-neutral-600 text-center")}>
                            Hand-drawn storyboards mapping the transition from the &ldquo;Immersed Self&rdquo; to the &ldquo;Audience Self.&rdquo;
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    PROTOTYPING
                ═══════════════════════════════════════════════ */}
                <section id="prototyping" className={cn(obscuraSectionShell, "pb-24 md:pb-32")}>
                    <Reveal>
                        <div className="mb-16">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                Prototyping
                            </h2>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="mb-10">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                The Original Vision: Eye Tracking
                            </span>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px]")}>
                                We wanted to capture how the subconscious mind looks at images &mdash; the involuntary flickers of attention that might surprise even the viewer themselves. To validate this, we ran tests with a Tobii eye tracker in our studio. The results confirmed the premise: participants were genuinely surprised by where their eyes lingered, often focusing on details they hadn&apos;t consciously noticed.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="flex w-full min-w-0 flex-col gap-4 mb-12">
                            <div className="w-full min-w-0 bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-red-400/70 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Problem
                                </span>
                                <p className={cn(obBody, "text-neutral-400")}>
                                    When we explored how to implement eye tracking inside a VR headset apparatus for the exhibit, an advisor from Meta Reality Labs informed us that displaying raw eye-tracking data to a public audience without explicit informed consent from every viewer violated privacy protocols. The core mechanic of the exhibit was gone.
                                </p>
                            </div>
                            <div className="w-full min-w-0 bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
                                <span className="font-[family-name:var(--font-dm-sans)] text-xs text-emerald-400/70 uppercase tracking-[0.15em] font-semibold block mb-3">
                                    The Solution
                                </span>
                                <p className={cn(obBody, "text-neutral-400")}>
                                    We pivoted to head tracking. Less precise &mdash; but fundamentally different in character. Where eye tracking captured involuntary, subconscious attention, head tracking required the viewer to be intentional. To look at something, you had to physically turn toward it. To accommodate this shift, we drastically increased the size of the images in the VR view, forcing users to move their heads deliberately to take in the full photograph. The constraint made the design more honest: intent became visible, physical, and performative for the audience outside.
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Eye Tracking Demo */}
                    <Reveal>
                        <div className="mb-16 w-full min-w-0">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                The Gaze Challenge
                            </span>
                            <p className={cn(obBody, "text-neutral-400 mb-8 w-full")}>
                                Eye tracking produces erratic, involuntary data &mdash; saccades and micro-fixations that don&rsquo;t reflect conscious intent. Head tracking, by contrast, captures deliberate, performative movement that audiences can read from outside.
                            </p>
                            <EyeTrackingDemo className="w-full" />
                        </div>
                    </Reveal>

                    {/* Process: physical prototyping */}
                    <Reveal>
                        <div className="mb-6 mt-16">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                Process: Testing in Physical Space
                            </span>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px]")}>
                                We role-played with low-fidelity prototypes to test the physical space, creating a cardboard &ldquo;Portola Obscura&rdquo; booth to test light and shadow.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal>
                        <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
                            <video
                                src="/assets/obscura/prototyping_booth_recording.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-auto block"
                                aria-label="Screen recording: low-fidelity cardboard Portola Obscura booth prototype (silent, looping)"
                            />
                        </div>
                        <p className={cn(obBody, "text-neutral-600 text-center mt-4 mb-0")}>
                            Cardboard prototyping the booth to test light, shadow, and physical flow before Unity development.
                        </p>
                    </Reveal>

                    {/* Technical diagrams — before Unity implementation (next section) */}
                    <Reveal>
                        <div className="mb-8 mt-16">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                Building the Obscura Engine
                            </span>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px]")}>
                                In order for our self-curating system to work, the images needed to be tagged according to the themes they represent, and the themes they contain. We went through over 300 images and labeled and organized them so they may be used by the system.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-[4/3]">
                                <LightboxImage
                                    src="/assets/obscura/zone_breakdown.png"
                                    alt="Zone breakdown diagram showing image regions"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800 aspect-[4/3]">
                                <LightboxImage
                                    src="/assets/obscura/image_annotations.png"
                                    alt="Image annotations screenshot"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-[4/3] flex items-center justify-center p-2">
                                <LightboxImage
                                    src="/assets/obscura/zone_labels.png"
                                    alt="Zone labels for annotation system"
                                    className="max-h-full max-w-full object-contain"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className={cn(obBody, "text-neutral-600 text-center")}>
                            Technical diagrams &mdash; zone breakdown, image annotations, and labeling system for the gaze-driven narrative branching.
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    GAZE SIMULATOR (Interactive)
                ═══════════════════════════════════════════════ */}
                <section className={cn(obscuraSectionShell, "pb-24 md:pb-32")}>
                    <Reveal>
                        <div className="mb-12 md:mb-16">
                            <div className="rounded-xl overflow-hidden border border-neutral-800 mb-8 aspect-video bg-neutral-950">
                                <LightboxImage
                                    src="/assets/obscura/from_concept_unity.png"
                                    alt="Developer wearing a Meta Quest 3 at a desk; monitor shows Unity with a historical photograph and the head-tracked curator view"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                From Concept to Unity
                            </span>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px]")}>
                                After we had the design and interaction logic laid out, I moved into Unity to prototype a working version of the experience. I used a Unity XR rig and iterated on device with a Meta Quest 3. With help from Gemini and Claude Code, I wrote the C# scripts that acted as the &ldquo;game engine&rdquo; for Obscura &mdash; tracking where the viewer was looking and deciding which image set to surface next.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="mb-12">
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                Interactive Demo
                            </span>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-3">
                                Explore Like a Viewer
                            </h2>
                            <p className={cn(obBody, "text-neutral-500 max-w-[600px]")}>
                                Move your cursor over Wayne&apos;s photograph below. Dwell on regions of interest to see how the system tracks and categorizes your attention.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <GazeSimulator
                            className="w-full"
                            imageSrc="/assets/obscura/zone_breakdown_noui.png"
                            imageAlt="Wayne Wong photograph — zone breakdown for gaze-driven narrative"
                            onDwellUpdate={handleDwellUpdate}
                        />
                    </Reveal>

                    {/* Film Strip souvenir */}
                    <Reveal>
                        <div className="mt-8 w-full min-w-0">
                            <FilmStrip dwellData={dwellData} className="w-full" />
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    EXHIBITION PHOTOS
                ═══════════════════════════════════════════════ */}
                <section id="exhibition" className={cn(obscuraSectionShell, "pb-24 md:pb-32")}>
                    <Reveal>
                        <div className="mb-10 md:mb-12">
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-4">
                                Physical take-home artifacts
                            </h2>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px] mb-6")}>
                                I really wanted viewers to take something home with them &mdash; to remember their experience and to remember Wayne&apos;s story. The photostrip souvenir is distinct because it was given to viewers based on the visual theme they dwelled on the most, so when they take it home and look at it after a while, they won&apos;t just remember the exhibit but also a remnant of what they specifically engaged with.
                            </p>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px]")}>
                                While testing we also discovered that the interaction was so passive, and VR is still unfamiliar enough, that users desired some level of instruction and explanation of what they were experiencing. So I designed and printed instructional cards that were handed out to people waiting in line.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal>
                        <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:h-[min(28vw,440px)] md:min-h-[240px]">
                            <div className="h-[min(52vw,320px)] min-h-[240px] w-full min-w-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 md:h-full md:min-h-0 md:flex-1">
                                <LightboxImage
                                    src="/assets/obscura/exhibition_photostrips.avif"
                                    alt="Photo strip souvenirs displayed at exhibition"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="flex h-[min(52vw,320px)] min-h-[240px] w-full shrink-0 justify-center md:h-full md:min-h-0 md:w-auto">
                                <div className="h-full w-fit max-w-[min(100%,calc(100vw-3rem))] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                                    <LightboxImage
                                        src="/assets/obscura/flyer.png"
                                        alt="Obscura instructional cards and exhibition flyer"
                                        className="block h-full w-auto max-h-full max-w-full object-contain"
                                        draggable={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    REFLECTION
                ═══════════════════════════════════════════════ */}
                <section id="reflection" className="relative py-24 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-[#0A0A0A]" />
                    <div className={cn("relative", obscuraSectionShell)}>
                        <Reveal>
                            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl md:text-4xl text-neutral-100 mb-6">
                                Reflection
                            </h2>
                        </Reveal>
                        <Reveal delay={0.05}>
                            <div className="mb-10 w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
                                <LightboxImage
                                    src="/assets/obscura/reflection_presentation.png"
                                    alt="Obscura team presenting at Microsoft Lakefront Pavilion; projection shows the OBSCURA title slide and sponsors, audience in the foreground"
                                    className="w-full h-auto"
                                    draggable={false}
                                />
                            </div>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                Outcome
                            </span>
                            <p className={cn(obBody, "text-neutral-400 mb-8 max-w-[680px]")}>
                                The exhibit launched at MOHAI on September 13, 2025. The queue for the booth lasted the full duration of the event, and the atmosphere was lively &mdash; but what surprised me most was the audience outside. The projected gaze view, originally designed as a waiting mechanism, became its own destination. Groups stood watching, narrating what the person inside was doing, debating why they kept returning to the same face.
                            </p>
                        </Reveal>
                        <Reveal delay={0.15}>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2 mb-8 max-w-[680px]">
                                <p className={cn(obBody, "text-neutral-300 mb-3")}>
                                    &ldquo;As were all the audience members that I spoke with at the end of the event, I was very impressed with the project and the way it was presented. The team had a very clear rationale for the design of their exhibit, and the execution seemed flawless as far as I can tell.&rdquo;
                                </p>
                                <cite className={cn(obBody, "text-neutral-600 not-italic")}>
                                    Exhibition Viewer
                                </cite>
                            </blockquote>
                        </Reveal>
                        <Reveal delay={0.25}>
                            <span className="font-[family-name:var(--font-dm-sans)] text-xs text-amber-200/60 uppercase tracking-[0.15em] font-semibold block mb-3">
                                Key lesson
                            </span>
                            <p className={cn(obBody, "text-neutral-400 max-w-[680px]")}>
                                If I built it again &mdash; which I intend to, at a larger scale &mdash; I would pay far more attention to the pathfinding and spatial choreography of the audience experience. Exhibition design lives in the transitions: how people approach, how they wait, how they move through, how they leave. I&apos;d like to design the external apparatus with the same care as the internal experience, and explore how the physical space can facilitate more discussion and interaction between visitors before and after they step inside.
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
        <StickyNotes page="obscura" />
        </>
    );
}

"use client";

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { GrainOverlay } from "@/components/virdio/GrainOverlay";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { GazeSimulator } from "@/components/obscura/GazeSimulator";
import { DualPerspective } from "@/components/obscura/DualPerspective";
import { FilmStrip } from "@/components/obscura/FilmStrip";
import { ImagePlaceholder } from "@/components/obscura/ImagePlaceholder";
import { WayneCarousel } from "@/components/obscura/WayneCarousel";
import { EyeTrackingDemo } from "@/components/obscura/EyeTrackingDemo";
import { ExhibitionMosaic } from "@/components/obscura/ExhibitionMosaic";
import { StoryboardCarousel } from "@/components/obscura/StoryboardCarousel";
import { ObscuraPageLiquidCursor } from "@/components/obscura/ObscuraPageLiquidCursor";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { cn } from "@/lib/utils";
import { SITE_COLUMN } from "@/components/home/homeGrid";
import { HelpCircle, Smartphone, UsersRound, type LucideIcon } from "lucide-react";

/** Geist body — home / site benchmark */
const obBody = "site-body";

/** Figure captions under media — same as home work carousels / Wayne ticker (`site-gallery-caption`). */
const obMediaCaption = "site-gallery-caption case-study-media-caption-mt text-left text-neutral-500";

/** Shared content column — same as home */
const obscuraSectionShell = SITE_COLUMN;

const blueprintThemeCards: { title: string; body: string; Icon: LucideIcon }[] = [
    {
        title: "Connection",
        body: "People encounter historical imagery through the lens of personal family memory, not historical distance.",
        Icon: UsersRound,
    },
    {
        title: "The Mystery of Intent",
        body: "Viewers project questions onto images when context is absent — the gap is the engagement.",
        Icon: HelpCircle,
    },
    {
        title: "Scroll Fatigue",
        body: "The speed and flattening of modern image consumption had made people hungry for slowness and weight, even if they couldn't name it. These three themes became the design pillars of the exhibit.",
        Icon: Smartphone,
    },
];

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
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />
    ) : (
      <div className="absolute inset-0 min-h-0" role="img" aria-label={imageAria ?? ""}>
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
      <div className="min-h-0 overflow-hidden border border-neutral-800 bg-neutral-900/50">
        <div className="flex min-h-0 flex-col">
          <div className="px-10 pt-10 md:px-14 md:pt-14">
            <div className="relative aspect-square w-full overflow-hidden bg-neutral-950">
              {visual}
            </div>
          </div>
          <div className="flex min-h-0 flex-col justify-center gap-3 p-10 pt-8 pb-10 md:gap-3.5 md:p-14 md:pt-10 md:pb-14">
            {children}
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
                "relative overflow-hidden border border-neutral-800 group",
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
                <span className="type-caption text-white/70 bg-black/40 px-2 py-1">
                    {label}
                </span>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/40 p-1.5">
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
    }, []);

    const handleDwellUpdate = useCallback((data: DwellData[]) => {
        setDwellData(data);
    }, []);

    return (
        <>
        <LightboxProvider>
            <div
                className={cn(
                    "site-editorial bg-[#0A0A0A] relative min-h-screen w-full overflow-x-hidden font-sans antialiased selection:bg-amber-900/40 selection:text-amber-200",
                    "[&_a]:cursor-pointer [&_button]:cursor-pointer [&_input]:cursor-text [&_textarea]:cursor-text [&_select]:cursor-pointer cursor-none"
                )}
            >
                <GrainOverlay />
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

                    <div className={cn("relative z-10 w-full py-32 md:py-40 text-left", obscuraSectionShell)}>
                        <div className="case-study-prose-stack flex w-full min-w-0 flex-col">
                        <Reveal>
                            <a
                                href="https://mohai.org/event/transpacific-photography-and-the-obscura-project-post-world-war-ii-life-in-japan/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="site-label text-amber-200/60 hover:text-amber-200/90 transition-colors inline-flex items-center gap-1.5 text-left"
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

                        <HeroTextAnimation variant="split-chars" className="type-display-black text-neutral-100 text-left">
                            OBSCURA
                        </HeroTextAnimation>

                        <Reveal delay={0.3}>
                            <p
                                className={cn(
                                    obBody,
                                    "text-neutral-400 text-balance [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_2px_16px_rgba(0,0,0,0.65),0_0_40px_rgba(10,10,10,0.55)]"
                                )}
                            >
                                Obscura is an immersive experience that bridges solitary Virtual Reality and public exhibition &mdash; a spatial computing environment where the viewer&apos;s gaze dynamically curates the images they see.
                            </p>
                        </Reveal>
                        <Reveal delay={0.35}>
                            <p
                                className={cn(
                                    obBody,
                                    "text-neutral-400 text-balance [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_2px_16px_rgba(0,0,0,0.65),0_0_40px_rgba(10,10,10,0.55)]"
                                )}
                            >
                                I drove the Interaction Design, prototyping, and Unity development. Together, the team and I transformed isolated exploration into a shared social narrative for the broader museum audience.
                            </p>
                        </Reveal>

                        <Reveal delay={0.4}>
                            <div className={cn("flex flex-wrap justify-start gap-x-10 gap-y-6", obBody, "text-neutral-500")}>
                                <div>
                                    <span className="site-label text-neutral-600 case-study-meta-line-mb block text-left">Role</span>
                                    Lead Interaction Designer, Prototyper, &amp; Developer
                                </div>
                                <div>
                                    <span className="site-label text-neutral-600 case-study-meta-line-mb block text-left">Team</span>
                                    Asa Symons, Caiya Wiltshire, Nick Hallin
                                </div>
                                <div>
                                    <span className="site-label text-neutral-600 case-study-meta-line-mb block text-left">Client</span>
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
                                    <span className="site-label text-neutral-600 case-study-meta-line-mb block text-left">Date</span>
                                    September 13, 2025
                                </div>
                                <div>
                                    <span className="site-label text-neutral-600 case-study-meta-line-mb block text-left">Key Tech</span>
                                    Unity, VR, Head Tracking, Claude Code
                                </div>
                            </div>
                        </Reveal>
                        </div>
                    </div>
                </section>

                {/* ─── THE PROMPT + Wayne archive carousel ─── */}
                <section className={cn(obscuraSectionShell, "case-study-section-y-b")}>
                    <div className="case-study-prose-stack">
                        <Reveal>
                            <p className={cn(obBody, "text-neutral-400")}>
                                The Museum of History and Industry handed us a box of unexposed film &mdash; hundreds of photographs taken by Wayne Wong, a Signal Corps soldier in 1946 Japan, never developed, never seen. The brief was three words: create something boundary-pushing. We made something that asks: when you look at a photograph, who is really doing the looking?
                            </p>
                        </Reveal>
                        <Reveal>
                            <WayneCarousel />
                        </Reveal>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    EXPERIENCE OVERVIEW
                ═══════════════════════════════════════════════ */}
                <section id="overview" className={cn(obscuraSectionShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
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
                            className="case-study-subsection-gap"
                        />
                    </Reveal>

                    {/* Curator & Spectator Videos */}
                    <Reveal>
                        <div className="case-study-grid-gap-mid grid grid-cols-1 md:grid-cols-2">
                            <ObscuraVideo
                                src="/assets/obscura/curator.mp4"
                                label="Curator View"
                            />
                            <ObscuraVideo
                                src="/assets/obscura/spectator.mp4"
                                label="Spectator View"
                                objectPosition="bottom"
                                objectFit="cover"
                            />
                        </div>
                        <p className={obMediaCaption}>
                            Hover to unmute — the Curator View (inside the booth) and the Spectator View (audience outside).
                        </p>
                    </Reveal>
                </section>

                {/* ─── VIDEO EMBED ─── */}
                <section className={cn(obscuraSectionShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="overflow-hidden border border-neutral-800 bg-neutral-950">
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
                        <p className={obMediaCaption}>
                            End of Exhibition Day at MOHAI
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    INTENT
                ═══════════════════════════════════════════════ */}
                <section id="intent" className={cn(obscuraSectionShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="case-study-block-gap">
                            <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                                Intent
                            </h2>
                            <p className={cn(obBody, "text-neutral-500")}>
                                We wanted to explore new ways to present images as an orchestrated experience.
                            </p>
                        </div>
                    </Reveal>

                    <div className="case-study-prose-stack flex flex-col">
                        <IntentPrincipleRow
                            imageSrc="/assets/obscura/intent_speak_to_audience.png"
                            imageAlt="Wayne Wong smiling in a square portrait; his name appears as text on the image"
                        >
                            <h3 className="site-label text-amber-200/80 text-left">
                                Speak to the Audience While Respecting the Artist
                            </h3>
                            <p className={cn(obBody, "text-neutral-400")}>
                                Wayne took hundreds of photos but didn&apos;t talk about his intent. The exhibit allows users to view his photos, tracking what parts they dwell on. An external audience views through the first viewer&apos;s eyes, collectively defining the role of intent.
                            </p>
                        </IntentPrincipleRow>
                        <IntentPrincipleRow
                            delay={0.05}
                            imageSrc="/assets/obscura/exhibition_lmwbwqiof2i79hqbywhhidrto1o.webp"
                            imageAlt="Visitors in the gallery watching the projected audience view, with a historic photograph on screen"
                        >
                            <h3 className="site-label text-amber-200/80 text-left">
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
                            <h3 className="site-label text-amber-200/80 text-left">
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
                            <h3 className="site-label text-amber-200/80 text-left">
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
                <section id="blueprint" className={cn(obscuraSectionShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="case-study-block-gap">
                            <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                                Making Meaning
                            </h2>
                            <p className={cn(obBody, "text-neutral-500")}>
                                Designing for Connection, Intent, and Curiosity.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="case-study-block-gap w-full border border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center md:px-10 md:py-12">
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
                        <div className="case-study-block-gap">
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                Research: Finding the Human Narrative
                            </span>
                            <p className={cn(obBody, "text-neutral-400 w-full min-w-0 text-left")}>
                                We began with a blurry image of what to make. To find clarity, we moved away from abstract theory and went directly to the source.
                                <br />
                                <br />
                                We interviewed Subject Matter Experts in museology and history, but most importantly, we conducted deep-dive interviews with younger Asian Americans to understand how they engage with historical imagery in the digital age. Three themes emerged:
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="case-study-block-gap case-study-grid-gap-dense grid grid-cols-1 md:grid-cols-2">
                            <div className="overflow-hidden border border-neutral-800 aspect-[4/3]">
                                <LightboxImage
                                    src="/assets/obscura/process_interview.avif"
                                    alt="Community interview"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="overflow-hidden border border-neutral-800 aspect-[4/3]">
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
                    <div className="case-study-block-gap case-study-prose-stack flex flex-col">
                        <Reveal>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2">
                                <p className={cn(obBody, "case-study-heading-trail-mb text-neutral-300")}>
                                    &ldquo;Looking at old family photos can be very emotional. I&apos;m the youngest of a very big family. So there&apos;s a lot of family history that I have no experience of, so getting to engage with photos from that time is really meaningful.&rdquo;
                                </p>
                                <cite className={cn(obBody, "text-neutral-600 not-italic")}>
                                    Interview Participant &mdash; On Connection &amp; Family History
                                </cite>
                            </blockquote>
                        </Reveal>
                        <Reveal>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2">
                                <p className={cn(obBody, "case-study-heading-trail-mb text-neutral-300")}>
                                    &ldquo;He took many pictures of kids. I wonder how he got to know them? Did he ask if he could take the picture? Especially the kids&hellip; Did he know them?&rdquo;
                                </p>
                                <cite className={cn(obBody, "text-neutral-600 not-italic")}>
                                    Interview Participant &mdash; On The Mystery of Intent
                                </cite>
                            </blockquote>
                        </Reveal>
                        <Reveal>
                            <blockquote className="border-l-2 border-amber-200/30 pl-6 py-2">
                                <p className={cn(obBody, "case-study-heading-trail-mb text-neutral-300")}>
                                    &ldquo;It&apos;s a really disorienting thing where you&apos;re scrolling, and you&apos;re watching something that&apos;s funny, and then you&apos;re looking at a recipe, and the next picture is of an atrocity.&rdquo;
                                </p>
                                <cite className={cn(obBody, "text-neutral-600 not-italic")}>
                                    Interview Participant &mdash; On Modern Media Fatigue
                                </cite>
                            </blockquote>
                        </Reveal>
                    </div>

                    {/* Research synthesis — design pillars as cards */}
                    <Reveal>
                        <div className="case-study-block-gap w-full min-w-0">
                            <div className="case-study-prose-stack flex flex-col">
                            {blueprintThemeCards.map(({ title, body, Icon }) => (
                                <div
                                    key={title}
                                    className="case-study-grid-gap-tight flex items-center border border-neutral-800 bg-neutral-900/50 p-5 md:p-6"
                                >
                                    <div
                                        className="flex size-11 shrink-0 items-center justify-center border border-amber-200/15 bg-amber-200/[0.08] text-amber-200/85 md:size-12"
                                        aria-hidden
                                    >
                                        <Icon className="size-[1.35rem] md:size-6" strokeWidth={1.65} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="site-label case-study-tight-trail-mb text-left text-amber-200/60">
                                            {title}
                                        </h3>
                                        <p className={cn(obBody, "m-0 text-left text-neutral-300")}>{body}</p>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    </Reveal>

                    {/* Process photos — research & interviews */}
                    <Reveal className="case-study-block-gap">
                        <div className="case-study-grid-gap-dense grid grid-cols-1 md:grid-cols-2">
                            <div className="overflow-hidden border border-neutral-800 aspect-[4/3]">
                                <LightboxImage
                                    src="/assets/obscura/process_brainstorm.avif"
                                    alt="Team brainstorming session"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="overflow-hidden border border-neutral-800 aspect-[4/3]">
                                <LightboxImage
                                    src="/assets/obscura/process_ideation.avif"
                                    alt="Ideation — 100+ ideas generated"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className={obMediaCaption}>
                            Research, interviews, and ideation &mdash; generating over 80 concepts before aligning on five &ldquo;North Star&rdquo; adjectives.
                        </p>
                    </Reveal>

                    {/* North Star adjectives */}
                    <Reveal>
                        <div className="case-study-block-gap">
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                North Star adjectives
                            </span>
                            <div className="case-study-grid-gap-dense grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
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
                                        className="flex min-h-[5rem] items-center justify-center border border-neutral-800 bg-neutral-900/50 px-3 py-4 text-center md:min-h-[5.5rem] md:py-5"
                                    >
                                        <span className="site-body text-sm text-neutral-300 text-left">
                                            {word}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className={cn(obMediaCaption, "w-full min-w-0")}>
                                These adjectives became the filter for every design decision from there forward.
                            </p>
                        </div>
                    </Reveal>

                    {/* Sketches — Click to expand */}
                    <Reveal className="case-study-block-gap">
                        <div>
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                Early Sketches
                            </span>
                            <div className="case-study-grid-gap-dense grid grid-cols-2 md:grid-cols-3">
                                {[
                                    { src: "/assets/obscura/sketches/IMG_9424.jpg", alt: "Obscura sketch 1" },
                                    { src: "/assets/obscura/sketches/IMG_9445.jpg", alt: "Obscura sketch 2" },
                                    { src: "/assets/obscura/sketches/IMG_9513.jpg", alt: "Obscura sketch 3" },
                                    { src: "/assets/obscura/sketches/IMG_9516.jpg", alt: "Obscura sketch 4" },
                                    { src: "/assets/obscura/sketches/IMG_9518.jpg", alt: "Obscura sketch 5" },
                                    { src: "/assets/obscura/sketches/IMG_9519.jpg", alt: "Obscura sketch 6" },
                                ].map((sketch) => (
                                    <div key={sketch.alt} className="overflow-hidden border border-neutral-800">
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
                        <p className={obMediaCaption}>
                            Early concept sketches exploring spatial layout, viewer interaction, and gaze-tracking visualization.
                        </p>
                    </Reveal>

                    {/* Storyboarding */}
                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                Storyboarding the Invisible
                            </span>
                            <p className={cn(obBody, "text-neutral-400 w-full min-w-0")}>
                                Because we were creating an asynchronous experience dictated by attention, standard wireframes failed. I used high-fidelity storyboarding to map the emotional journey: the moment a visitor first sees the audience projection and grows curious, the transition from spectator to participant as they enter the booth, the private act of looking, and the &ldquo;Souvenir Moment&rdquo; at the exit &mdash; where a printed photo-strip gives them something physical to carry out and compare with others.
                            </p>
                        </div>
                    </Reveal>

                    {/* Storyboard image + individual-panel carousel */}
                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <div className="overflow-hidden border border-neutral-800">
                                <LightboxImage
                                    src="/assets/obscura/storyboard.png"
                                    alt="Hand-drawn storyboards mapping the visitor journey"
                                    className="h-auto w-full"
                                    draggable={false}
                                />
                            </div>
                            <StoryboardCarousel className="mt-8 w-full min-w-0 md:mt-10" />
                            <p className={obMediaCaption}>
                                Full storyboard and individual panels mapping the transition from the &ldquo;Immersed Self&rdquo; to the &ldquo;Audience Self.&rdquo;
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    PROTOTYPING
                ═══════════════════════════════════════════════ */}
                <section id="prototyping" className={cn(obscuraSectionShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="case-study-block-gap">
                            <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                                Prototyping
                            </h2>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                The Original Vision: Eye Tracking
                            </span>
                            <p className={cn(obBody, "text-neutral-400 w-full min-w-0")}>
                                We wanted to capture how the subconscious mind looks at images &mdash; the involuntary flickers of attention that might surprise even the viewer themselves. To validate this, we ran tests with a Tobii eye tracker in our studio. The results confirmed the premise: participants were genuinely surprised by where their eyes lingered, often focusing on details they hadn&apos;t consciously noticed.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="case-study-block-gap case-study-intra-stack flex w-full min-w-0 flex-col">
                            <div className="w-full min-w-0 border border-neutral-800 bg-neutral-900/50 p-8 md:p-10">
                                <span className="site-label text-red-400/70 case-study-heading-trail-mb block text-left">
                                    The Problem
                                </span>
                                <p className={cn(obBody, "text-neutral-400")}>
                                    When we explored how to implement eye tracking inside a VR headset apparatus for the exhibit, an advisor from Meta Reality Labs informed us that displaying raw eye-tracking data to a public audience without explicit informed consent from every viewer violated privacy protocols.
                                </p>
                            </div>
                            <div className="w-full min-w-0 border border-neutral-800 bg-neutral-900/50 p-8 md:p-10">
                                <span className="site-label text-emerald-400/70 case-study-heading-trail-mb block text-left">
                                    The Solution
                                </span>
                                <div className="case-study-heading-trail-gap flex flex-col">
                                    <p className={cn(obBody, "text-neutral-400")}>
                                        We pivoted to head tracking. Less precise, but fundamentally different in character.
                                    </p>
                                    <p className={cn(obBody, "text-neutral-400")}>
                                        Where eye tracking captured involuntary, subconscious attention, head tracking required the viewer to be intentional. To look at something, you had to physically turn toward it.
                                    </p>
                                    <p className={cn(obBody, "text-neutral-400")}>
                                        To accommodate this shift, we drastically increased the size of the images in the VR view, forcing users to move their heads deliberately to take in the full photograph.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* Eye Tracking Demo */}
                    <Reveal>
                        <div className="case-study-block-gap w-full min-w-0">
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                The Gaze Challenge
                            </span>
                            <p className={cn(obBody, "text-neutral-400 w-full")}>
                                Eye tracking produces erratic, involuntary data: saccades and micro-fixations that don&rsquo;t reflect conscious intent. Head tracking, by contrast, captures deliberate, performative movement that audiences can read from outside.
                            </p>
                            <EyeTrackingDemo className="case-study-media-caption-mt w-full" />
                        </div>
                    </Reveal>

                    {/* Process: physical prototyping */}
                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                Process: Testing in Physical Space
                            </span>
                            <p className={cn(obBody, "text-neutral-400 w-full min-w-0")}>
                                We role-played with low-fidelity prototypes to test the physical space, creating a cardboard &ldquo;Portola Obscura&rdquo; booth to test light and shadow.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal>
                        <div className="case-study-block-gap">
                            <div className="overflow-hidden border border-neutral-800 bg-neutral-950">
                                <video
                                    src="/assets/obscura/prototyping_booth_recording.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="block h-auto w-full"
                                    aria-label="Screen recording: low-fidelity cardboard Portola Obscura booth prototype (silent, looping)"
                                />
                            </div>
                            <p className={cn(obMediaCaption, "mb-0")}>
                                Cardboard prototyping the booth to test light, shadow, and physical flow before Unity development.
                            </p>
                        </div>
                    </Reveal>

                    {/* Technical diagrams — before Unity implementation (next section) */}
                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                Building the Obscura Engine
                            </span>
                            <p className={cn(obBody, "text-neutral-400 w-full min-w-0")}>
                                In order for our self-curating system to work, the images needed to be tagged according to the themes they represent, and the themes they contain. We went through over 300 images and labeled and organized them so they may be used by the system.
                            </p>
                        </div>
                        <div className="case-study-subsection-gap case-study-grid-gap-tight grid grid-cols-1 md:grid-cols-[minmax(0,1.55fr)_minmax(0,0.88fr)] md:grid-rows-[auto_auto] md:items-stretch">
                            <div className="relative min-h-0 overflow-hidden border border-neutral-800 aspect-[4/3] md:row-span-2 md:aspect-auto md:h-full md:min-h-[min(52vw,380px)]">
                                <LightboxImage
                                    src="/assets/obscura/zone_breakdown.png"
                                    alt="Zone breakdown diagram showing image regions"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="min-h-0 overflow-hidden border border-neutral-800 aspect-[4/3] md:aspect-[5/4]">
                                <LightboxImage
                                    src="/assets/obscura/image_annotations.png"
                                    alt="Image annotations screenshot"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <div className="flex min-h-[148px] items-center justify-center overflow-hidden border border-neutral-800 bg-neutral-950 p-2 md:min-h-[168px]">
                                <LightboxImage
                                    src="/assets/obscura/zone_labels.png"
                                    alt="Zone labels for annotation system"
                                    className="max-h-full max-w-full object-contain"
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <p className={obMediaCaption}>
                            Technical diagrams &mdash; zone breakdown, image annotations, and labeling system for the gaze-driven narrative branching.
                        </p>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    GAZE SIMULATOR (Interactive)
                ═══════════════════════════════════════════════ */}
                <section className={cn(obscuraSectionShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div className="case-study-block-gap">
                            <div className="case-study-subsection-gap overflow-hidden border border-neutral-800 aspect-video bg-neutral-950">
                                <LightboxImage
                                    src="/assets/obscura/from_concept_unity.png"
                                    alt="Developer wearing a Meta Quest 3 at a desk; monitor shows Unity with a historical photograph and the head-tracked curator view"
                                    className="h-full w-full object-cover"
                                    draggable={false}
                                />
                            </div>
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                From Concept to Unity
                            </span>
                            <p className={cn(obBody, "text-neutral-400 w-full min-w-0")}>
                                After we had the design and interaction logic laid out, I moved into Unity to prototype a working version of the experience. I used a Unity XR rig and iterated on device with a Meta Quest 3. With help from Gemini and Claude Code, I wrote the C# scripts that acted as the &ldquo;game engine&rdquo; for Obscura: tracking where the viewer was looking and deciding which image set to surface next.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal>
                        <div className="case-study-subsection-gap">
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                Interactive Demo
                            </span>
                            <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
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
                        <div className="case-study-media-caption-mt w-full min-w-0">
                            <FilmStrip dwellData={dwellData} className="w-full" />
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    EXHIBITION PHOTOS
                ═══════════════════════════════════════════════ */}
                <section id="exhibition" className={cn(obscuraSectionShell, "case-study-section-y-b")}>
                    <Reveal>
                        <div>
                            <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                                Physical take-home artifacts
                            </h2>
                            <div className="case-study-prose-stack flex w-full min-w-0 flex-col">
                                <p className={cn(obBody, "m-0 text-left text-neutral-400")}>
                                    I really wanted viewers to take something home with them, to remember their experience and to remember Wayne&apos;s story.
                                </p>
                                <p className={cn(obBody, "m-0 text-left text-neutral-400")}>
                                    The photostrip souvenir is distinct because it was given to viewers based on the visual theme they dwelled on the most, so when they take it home and look at it after a while, they won&apos;t just remember the exhibit but also a remnant of what they specifically engaged with.
                                </p>
                                <p className={cn(obBody, "m-0 text-left text-neutral-400")}>
                                    While testing we also discovered that the interaction was so passive, and VR is still unfamiliar enough, that users desired some level of instruction and explanation of what they were experiencing. So I designed and printed instructional cards that were handed out to people waiting in line.
                                </p>
                            </div>
                        </div>
                    </Reveal>
                    <Reveal className="case-study-media-caption-mt">
                        {/*
                          Equal-width columns: flex + w-fit flyer was eating the row and collapsing the left cell.
                          Grid + min-w-0 + object-contain keeps both assets at natural aspect ratio (uncropped).
                        */}
                        <div className="case-study-grid-gap-dense grid w-full min-w-0 grid-cols-1 items-start md:grid-cols-2">
                            <div className="min-w-0 overflow-hidden border border-neutral-800 bg-neutral-950">
                                <LightboxImage
                                    src="/assets/obscura/exhibition_photostrips.avif"
                                    alt="Photo strip souvenirs displayed at exhibition"
                                    className="block h-auto w-full object-contain"
                                    draggable={false}
                                />
                            </div>
                            <div className="min-w-0 overflow-hidden border border-neutral-800 bg-neutral-950">
                                <LightboxImage
                                    src="/assets/obscura/flyer.png"
                                    alt="Obscura instructional cards and exhibition flyer"
                                    className="block h-auto w-full object-contain"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ═══════════════════════════════════════════════
                    REFLECTION
                ═══════════════════════════════════════════════ */}
                <section id="reflection" className="relative case-study-section-y overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-[#0A0A0A]" />
                    <div className={cn("relative", obscuraSectionShell)}>
                        <Reveal>
                            <div className="case-study-hero-bump-mb">
                                <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">Reflection</h2>
                            </div>
                        </Reveal>
                        <Reveal delay={0.05}>
                            <div className="w-full overflow-hidden border border-neutral-800 bg-neutral-950">
                                <LightboxImage
                                    src="/assets/obscura/reflection_presentation.png"
                                    alt="Obscura team presenting at Microsoft Lakefront Pavilion; projection shows the OBSCURA title slide and sponsors, audience in the foreground"
                                    className="w-full h-auto"
                                    draggable={false}
                                />
                            </div>
                        </Reveal>
                        <Reveal delay={0.1} className="case-study-media-caption-mt">
                            <span className="site-label text-amber-200/60 case-study-heading-trail-mb block text-left">
                                Outcome
                            </span>
                            <p className={cn(obBody, "text-neutral-400 w-full min-w-0")}>
                                The exhibit launched at MOHAI on September 13, 2025. The queue for the booth lasted the full duration of the event, and the atmosphere was lively, but what surprised me most was the audience outside. The projected gaze view, originally designed as a waiting mechanism, became its own destination. Groups stood watching, narrating what the person inside was doing, debating why they kept returning to the same face.
                            </p>
                        </Reveal>
                        <Reveal delay={0.15} className="case-study-media-caption-mt">
                            <blockquote className="w-full min-w-0 border-l-2 border-amber-200/30 py-2 pl-6">
                                <p className={cn(obBody, "case-study-heading-trail-mb text-neutral-300")}>
                                    &ldquo;As were all the audience members that I spoke with at the end of the event, I was very impressed with the project and the way it was presented. The team had a very clear rationale for the design of their exhibit, and the execution seemed flawless as far as I can tell.&rdquo;
                                </p>
                                <cite className={cn(obBody, "text-neutral-600 not-italic")}>
                                    Exhibition Viewer
                                </cite>
                            </blockquote>
                        </Reveal>
                        <Reveal delay={0.25} className="case-study-media-caption-mt">
                            <p className={cn(obBody, "text-neutral-400 w-full min-w-0")}>
                                If I built it again, which I intend to do at a larger scale, I would pay far more attention to the pathfinding and spatial choreography of the audience experience. Exhibition design lives in the transitions: how people approach, how they wait, how they move through, how they leave. I&apos;d like to design the external apparatus with the same care as the internal experience, and explore how the physical space can facilitate more discussion and interaction between visitors before and after they step inside.
                            </p>
                        </Reveal>
                        <Reveal delay={0.3} className="case-study-media-caption-mt">
                            <div className="w-full text-left">
                                <p className="site-label mb-6 text-amber-200/60">
                                    Gratitude
                                </p>
                                <div className="flex flex-col gap-5 md:gap-6">
                                    <div>
                                        <p className="mb-1.5 text-sm font-medium text-neutral-300">Wong Family</p>
                                        <p className={cn(obBody, "text-neutral-500")}>
                                            Wayne Wong, Curtis Wong, Anne Rudden
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 text-sm font-medium text-neutral-300">Teammates</p>
                                        <p className={cn(obBody, "text-neutral-500")}>
                                            Asa Symons, Caiya Wiltshire, Nick Hallin
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 text-sm font-medium text-neutral-300">MOHAI</p>
                                        <p className={cn(obBody, "text-neutral-500")}>
                                            Leonard Garfield, Devorah Romanek, Sorana Nance, Rachel Spence
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 text-sm font-medium text-neutral-300">UW</p>
                                        <p className={cn(obBody, "text-neutral-500")}>
                                            Ana Pinto Da Silva, Matt Bartels, Dukes Wooters, Axel Roesler, Kristin N Dew, John Zošák
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-1.5 text-sm font-medium text-neutral-300">External Advisors</p>
                                        <p className={cn(obBody, "text-neutral-500")}>
                                            Saransh Solanki (Meta), Sam Stubblefield, Harri Lin, Maria Mortati
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ─── Exhibition Mosaic (same column as case study sections) ─── */}
                <Reveal>
                    <div className={obscuraSectionShell}>
                        <ExhibitionMosaic className="py-16 md:py-24" />
                    </div>
                </Reveal>

                {/* Bottom spacer */}
                <div className="h-20" />
            </div>
            <ObscuraPageLiquidCursor />
        </LightboxProvider>
        <CaseStudyPill projectSlug="obscura" />
        <StickyNotes page="obscura" />
        </>
    );
}

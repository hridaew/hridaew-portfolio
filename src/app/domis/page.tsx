"use client";

import { useEffect, type ReactNode } from "react";
import { GrainOverlay } from "@/components/virdio/GrainOverlay";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { ImagePlaceholder } from "@/components/obscura/ImagePlaceholder";
import { AmbientLight } from "@/components/domis/AmbientLight";
import { MediaFrame, PhoneSlot } from "@/components/domis/MediaFrame";
import { ApplianceConsensusDemo } from "@/components/domis/ApplianceConsensusDemo";
import { cn } from "@/lib/utils";
import { SITE_COLUMN } from "@/components/home/homeGrid";

/**
 * Domis case study — Build Brief v2.
 * One idea: the system learns the home instead of asking.
 * Peak: Section 05, designing for non-deterministic AI.
 */

const shell = SITE_COLUMN;
const breakout =
  "w-full min-w-0 md:-mx-[104px] md:w-[calc(100%+208px)]";
const body = "site-body text-white/70";
const caption =
  "site-gallery-caption case-study-media-caption-mt text-left text-white/45";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/domis-home-maintenance/id6746832568";

const sidebarSections = [
  { id: "hero", label: "Intro", number: "00" },
  { id: "overview", label: "Overview", number: "01" },
  { id: "product", label: "The Product", number: "02" },
  { id: "address", label: "Address", number: "03" },
  { id: "appliance", label: "Appliance", number: "04" },
  { id: "trust", label: "Trust", number: "05" },
  { id: "now", label: "Now", number: "06" },
];

const TLDR_ITEMS = [
  "Domis only works if it knows your home. Nobody wants to fill out a form about their house, so the profile that makes the product useful is the exact thing that never gets built.",
  "I'm the founding product designer. The bet I made was that the system should learn the home instead of asking about it.",
  "I designed and shipped three versions of that idea: address intelligence at the scale of a house, appliance intelligence at the scale of an object, and progressive profiling at the scale of a single interaction.",
  "The hard part wasn't the features. It was designing around a model that gives you a different answer every time you ask.",
] as const;

const ROLE_ITEMS = [
  "Owning product design end to end across iOS and web",
  "Designing and prototyping AI features in code, then driving them to production",
  "Defining how AI behavior surfaces in the interface: confidence, correction, and failure",
  "Working directly with the founders on what to build and what to cut",
] as const;

const TAGS = [
  "Consumer App",
  "AI-Native",
  "0-to-1",
  "iOS + Web",
  "Shipped",
] as const;

function AppStoreButton({ className }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "glass-panel inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-white transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
        className
      )}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span className="site-body">Download on the App Store</span>
    </a>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="site-label case-study-heading-trail-mb block text-left text-white/45">
      {children}
    </span>
  );
}

function PrincipleBlock({
  title,
  children,
  after,
}: {
  title: string;
  children: ReactNode;
  after?: ReactNode;
}) {
  return (
    <div className="w-full min-w-0">
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        <h3 className="site-body case-study-heading-trail-mb text-white">{title}</h3>
        <div className="case-study-prose-stack flex flex-col">{children}</div>
      </div>
      {after}
    </div>
  );
}

export default function DomisPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <LightboxProvider>
        <div className="site-editorial relative min-h-screen w-full overflow-x-hidden bg-[#0c0c0e] font-sans antialiased selection:bg-amber-900/35 selection:text-amber-100">
          <AmbientLight className="pointer-events-none absolute inset-0 z-0 overflow-hidden" />
          <GrainOverlay />

          <StickySidebar sections={sidebarSections} variant="dark" />

          {/* ─── 00 · HERO ─── */}
          <section
            id="hero"
            className="relative z-10 flex min-h-[92vh] items-center overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28"
          >
            <div className={cn("relative w-full text-left", shell)}>
              <div className="grid w-full min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
                <div className="case-study-prose-stack flex w-full min-w-0 max-w-[560px] flex-col">
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
                    <p className={cn(body, "text-balance")}>
                      An AI-native home maintenance app that learns your home instead of
                      interrogating you about it.
                    </p>
                  </Reveal>

                  <Reveal delay={0.3}>
                    <div className="flex flex-wrap justify-start gap-x-8 gap-y-3 site-body text-white/70">
                      <div>
                        <span className="site-label case-study-meta-line-mb block text-left text-white/40">
                          Role
                        </span>
                        Founding Product Designer
                      </div>
                      <div>
                        <span className="site-label case-study-meta-line-mb block text-left text-white/40">
                          Timeline
                        </span>
                        2024 —
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={0.35}>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map((tag) => (
                        <span
                          key={tag}
                          className="site-label rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-left text-white/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                </div>

                {/* Decorative composition — atmosphere, not explanation */}
                <Reveal delay={0.25} className="relative hidden min-h-[320px] w-full lg:block">
                  <div className="relative mx-auto aspect-[5/4] w-full max-w-xl">
                    <div className="absolute left-[8%] top-[18%] z-[1] w-[38%] overflow-hidden rounded-2xl border border-white/10 bg-[#121214] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]">
                      <ImagePlaceholder
                        label="Home (mobile)"
                        aspectRatio="9/16"
                        variant="frame"
                        className="rounded-2xl border-0"
                      />
                    </div>
                    <div className="absolute bottom-[6%] left-[28%] z-[2] w-[36%] overflow-hidden rounded-2xl border border-white/10 bg-[#121214] shadow-[0_28px_70px_-18px_rgba(0,0,0,0.8)]">
                      <ImagePlaceholder
                        label="Spaces (mobile)"
                        aspectRatio="9/16"
                        variant="frame"
                        className="rounded-2xl border-0"
                      />
                    </div>
                    <div className="absolute right-[2%] top-[8%] z-0 w-[58%] overflow-hidden rounded-2xl border border-white/10 bg-[#121214] opacity-90 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.7)]">
                      <ImagePlaceholder
                        label="Web onboarding"
                        aspectRatio="16/10"
                        variant="frame"
                        className="rounded-2xl border-0"
                      />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ─── 01 · OVERVIEW ─── */}
          <section id="overview" className={cn("relative z-10", shell, "case-study-section-y-b")}>
            <div className="case-study-prose-stack flex w-full min-w-0 flex-col">
              {/* TL;DR */}
              <Reveal>
                <div className="w-full min-w-0">
                  <p className="site-label mb-4 text-left text-white/45">TL;DR</p>
                  <div className="flex flex-col gap-2">
                    {TLDR_ITEMS.map((text) => (
                      <div
                        key={text.slice(0, 32)}
                        className="glass-panel overflow-hidden rounded-3xl"
                      >
                        <p className={cn(body, "p-6 text-left md:p-8")}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Context */}
              <div className="case-study-subsection-mt w-full min-w-0">
                <Reveal>
                  <h2 className="site-chapter-heading case-study-heading-trail-mb text-white">
                    Context
                  </h2>
                </Reveal>
                <div className="case-study-prose-stack flex flex-col">
                  <Reveal delay={0.04}>
                    <p className={body}>
                      Domis helps homeowners keep track of their homes. What needs fixing,
                      what&apos;s about to break, and what that appliance in the garage
                      actually is.
                    </p>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <p className={body}>
                      All of that depends on the app knowing your home. Setting up a home
                      profile means answering questions about square footage, build year,
                      and every appliance you own, and that is close to the least appealing
                      task imaginable.
                    </p>
                  </Reveal>
                  <Reveal delay={0.07}>
                    <p className={body}>
                      So people don&apos;t, and then the product has nothing to work with.
                    </p>
                  </Reveal>
                  <Reveal delay={0.08}>
                    <p className={body}>
                      The bet was that the system should learn the home instead of asking
                      about it.
                    </p>
                  </Reveal>
                </div>
              </div>

              {/* My role */}
              <div className="case-study-subsection-mt w-full min-w-0">
                <Reveal>
                  <h2 className="site-chapter-heading case-study-heading-trail-mb text-white">
                    My role
                  </h2>
                </Reveal>
                <div className="case-study-prose-stack flex flex-col">
                  <Reveal delay={0.04}>
                    <p className={body}>
                      I&apos;m the founding product designer at Domis. I own product design
                      across iOS and web, and I design AI features in code rather than in
                      static mockups, because you can&apos;t evaluate an AI feature from a
                      static frame.
                    </p>
                  </Reveal>
                  <Reveal delay={0.05}>
                    <p className={body}>
                      Trust and failure only show up once the thing is running.
                    </p>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <p className="site-body text-white">This meant:</p>
                  </Reveal>
                  <Reveal delay={0.08}>
                    <ul className="flex flex-col gap-4">
                      {ROLE_ITEMS.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-white/30"
                            aria-hidden
                          />
                          <span className={body}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 02 · THE PRODUCT ─── */}
          <section id="product" className={cn("relative z-10", shell, "case-study-section-y-b")}>
            <div className="case-study-prose-stack flex w-full min-w-0 flex-col">
              <Reveal>
                <SectionEyebrow>The Product</SectionEyebrow>
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-white">
                  Low effort in
                </h2>
              </Reveal>
              <div className="case-study-prose-stack flex flex-col">
                <Reveal delay={0.04}>
                  <p className={body}>
                    Domis is iOS first, web now. You log an issue, track a repair, and keep
                    a record of the things in your home.
                  </p>
                </Reveal>
                <Reveal delay={0.06}>
                  <p className={body}>
                    You never go somewhere to set up your home, because the app learns it
                    while you use it. Log an issue in a room that doesn&apos;t exist yet
                    and the room gets created out of the task, instead of out of a settings
                    screen you had to go find.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.08}>
                <div className={breakout}>
                  <MediaFrame
                    stagger
                    caption="Home, tasks, and spaces. Progressive profiling means the home profile fills itself in as you use the app."
                  >
                    <PhoneSlot offset="up" className="h-[78%]">
                      <ImagePlaceholder
                        label="Home + FAB"
                        aspectRatio="9/16"
                        variant="frame"
                        className="h-full rounded-2xl border-0"
                        fullBleed
                      />
                    </PhoneSlot>
                    <PhoneSlot offset="none" className="h-[86%]">
                      <ImagePlaceholder
                        label="Task page"
                        aspectRatio="9/16"
                        variant="frame"
                        className="h-full rounded-2xl border-0"
                        fullBleed
                      />
                    </PhoneSlot>
                    <PhoneSlot offset="down" className="h-[78%]">
                      <ImagePlaceholder
                        label="Spaces"
                        aspectRatio="9/16"
                        variant="frame"
                        className="h-full rounded-2xl border-0"
                        fullBleed
                      />
                    </PhoneSlot>
                  </MediaFrame>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ─── 03 · ADDRESS ─── */}
          <section id="address" className={cn("relative z-10", shell, "case-study-section-y-b")}>
            <div className="case-study-prose-stack flex w-full min-w-0 flex-col">
              <Reveal>
                <SectionEyebrow>0-to-1 · The house</SectionEyebrow>
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-white">
                  Address intelligence
                </h2>
              </Reveal>
              <div className="case-study-prose-stack flex flex-col">
                <Reveal delay={0.04}>
                  <p className={body}>
                    Onboarding used to mean typing in everything you know about your home.
                    Most people don&apos;t know most of it, and the ones who do aren&apos;t
                    going to type it.
                  </p>
                </Reveal>
                <Reveal delay={0.06}>
                  <p className={body}>
                    Now you type an address. Google Places resolves it, then an agentic
                    search runs through Gemini to enrich it: bedrooms, bathrooms, square
                    footage, year built, and whatever else is out there and reliable.
                  </p>
                </Reveal>
                <Reveal delay={0.07}>
                  <p className={body}>
                    You get a filled-in home profile before you&apos;ve done anything.
                  </p>
                </Reveal>
                <Reveal delay={0.08}>
                  <p className={body}>
                    I designed this flow, prototyped it in code, and shipped it.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.1}>
                <div className={breakout}>
                  <div className="glass-panel overflow-hidden rounded-3xl">
                    <div className="relative aspect-video w-full bg-gradient-to-br from-white/[0.03] to-transparent">
                      {/* Recording placeholder until asset lands; swap for <video> */}
                      <ImagePlaceholder
                        label="Web onboarding recording: address to enriched profile"
                        aspectRatio="16/9"
                        variant="frame"
                        className="rounded-none border-0"
                        fullBleed
                      />
                    </div>
                  </div>
                  <p className={caption}>
                    AI-assisted home profile creation, web. Address in, structured home
                    profile out.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ─── 04 · APPLIANCE ─── */}
          <section id="appliance" className={cn("relative z-10", shell, "case-study-section-y-b")}>
            <div className="case-study-prose-stack flex w-full min-w-0 flex-col">
              <Reveal>
                <SectionEyebrow>Multimodal · The object</SectionEyebrow>
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-white">
                  Appliance intelligence
                </h2>
              </Reveal>

              {/* Side-by-side: copy + phones (not another 16:9 single frame) */}
              <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[2fr_1fr] md:gap-10">
                <div className="case-study-prose-stack flex flex-col">
                  <Reveal delay={0.04}>
                    <p className={body}>
                      Same idea, smaller scale. Photograph an appliance and it gets logged.
                      An agentic search runs in the background and comes back with model
                      details, warranty information, manuals, and support docs.
                    </p>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <p className={body}>
                      The alternative was asking people to type a serial number off a
                      sticker behind their fridge. That was never going to happen.
                    </p>
                  </Reveal>
                  <Reveal delay={0.08}>
                    <p className={caption}>
                      Capture, then an agentic search fills in the record.
                    </p>
                  </Reveal>
                </div>

                <Reveal delay={0.1}>
                  <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
                    <div className="glass-panel overflow-hidden rounded-3xl p-2">
                      <div className="overflow-hidden rounded-2xl">
                        <ImagePlaceholder
                          label="Capture state"
                          aspectRatio="9/16"
                          variant="viewfinder"
                          className="rounded-2xl border-0"
                        />
                      </div>
                    </div>
                    <div className="glass-panel overflow-hidden rounded-3xl p-2">
                      <div className="overflow-hidden rounded-2xl">
                        <ImagePlaceholder
                          label="Enriched record"
                          aspectRatio="9/16"
                          variant="frame"
                          className="rounded-2xl border-0"
                        />
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ─── 05 · TRUST (centerpiece) ─── */}
          <section id="trust" className={cn("relative z-10", shell, "case-study-section-y-b")}>
            <div className="case-study-prose-stack flex w-full min-w-0 flex-col gap-8 md:gap-10">
              <div>
                <Reveal>
                  <SectionEyebrow>Trust</SectionEyebrow>
                  <h2 className="site-chapter-heading case-study-heading-trail-mb text-white">
                    The model is wrong sometimes. Design for that.
                  </h2>
                </Reveal>
                <Reveal delay={0.04}>
                  <p className={body}>
                    Scan the same appliance three times and you can get three different
                    answers. A different model year. A warranty date that appeared out of
                    nowhere. A manual link that looks right and goes nowhere.
                  </p>
                </Reveal>
                <Reveal delay={0.05}>
                  <p className={body}>
                    This is the part of AI work that never shows up in the demo.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={0.06}>
                <PrincipleBlock
                  title="1. Consensus over confidence"
                  after={
                    <div className="mt-4 md:mt-5">
                      <ApplianceConsensusDemo />
                    </div>
                  }
                >
                  <p className={body}>
                    Search calls are cheap, so there&apos;s no reason to only ask once. The
                    backend runs several searches in parallel and reconciles the results,
                    and only the data that survives across passes makes it into the record.
                  </p>
                </PrincipleBlock>
              </Reveal>

              <Reveal delay={0.08}>
                <PrincipleBlock title="2. A confidence floor">
                  <p className={body}>
                    Anything below 70% confidence doesn&apos;t render at all. An empty field
                    is honest. A wrong field is expensive.
                  </p>
                </PrincipleBlock>
              </Reveal>

              <Reveal delay={0.1}>
                <PrincipleBlock title="3. The AI fills the form the same way you would">
                  <p className={body}>
                    No sparkle, no separate AI panel, no special surface. The model writes
                    into the same editable fields a person types into. Correcting it costs
                    nothing, and there&apos;s no second mental model to learn.
                  </p>
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08]">
                    <ImagePlaceholder
                      label="Enriched field + inline edit (optional)"
                      aspectRatio="16/7"
                      variant="frame"
                      className="rounded-2xl border-0"
                    />
                  </div>
                </PrincipleBlock>
              </Reveal>

              <Reveal delay={0.12}>
                <PrincipleBlock title="4. Ship to the reliable edge">
                  <p className={body}>
                    Search was consistently bad at finding a specific product manual and
                    kept returning dead links. Rather than ship a broken promise, the link
                    goes to the product support page. That&apos;s one click further from
                    the goal and it actually works.
                  </p>
                </PrincipleBlock>
              </Reveal>
            </div>
          </section>

          {/* ─── 06 · NOW ─── */}
          <section id="now" className={cn("relative z-10", shell, "pb-20 md:pb-28")}>
            <div className="case-study-prose-stack flex w-full min-w-0 flex-col">
              <Reveal>
                <SectionEyebrow>Now</SectionEyebrow>
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-white">
                  Still shipping
                </h2>
              </Reveal>
              <Reveal delay={0.04}>
                <p className={body}>
                  Domis is out and we ship constantly. Right now I&apos;m working on a
                  generated 3D home avatar, built from the same enriched profile data the
                  address intelligence produces. You give it an address and it gives you
                  your house back.
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <MediaFrame className="max-w-2xl">
                  <PhoneSlot className="h-[82%]" offset="up">
                    <ImagePlaceholder
                      label="Home avatar"
                      aspectRatio="9/16"
                      variant="frame"
                      className="h-full rounded-2xl border-0"
                      fullBleed
                    />
                  </PhoneSlot>
                  <PhoneSlot className="h-[82%]" offset="down">
                    <ImagePlaceholder
                      label="Avatar detail"
                      aspectRatio="9/16"
                      variant="frame"
                      className="h-full rounded-2xl border-0"
                      fullBleed
                    />
                  </PhoneSlot>
                </MediaFrame>
              </Reveal>

              <Reveal delay={0.12}>
                <AppStoreButton />
              </Reveal>
            </div>
          </section>
        </div>
      </LightboxProvider>
      <CaseStudyPill projectSlug="domis" />
      <StickyNotes page="domis" />
    </>
  );
}

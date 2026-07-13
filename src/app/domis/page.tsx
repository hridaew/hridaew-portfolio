"use client";

import { useEffect, type ReactNode } from "react";
import { GrainOverlay } from "@/components/virdio/GrainOverlay";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { ImagePlaceholder } from "@/components/obscura/ImagePlaceholder";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { DocumentProcessorDemo } from "@/components/domis/DocumentProcessorDemo";
import { ApplianceScannerDemo } from "@/components/domis/ApplianceScannerDemo";
import { PersonalizationShowcase } from "@/components/domis/PersonalizationShowcase";
import { cn } from "@/lib/utils";
import { SITE_COLUMN } from "@/components/home/homeGrid";
import { BookOpen, ShieldCheck, Heart, type LucideIcon } from "lucide-react";

const dmBody = "site-body";
const dmMediaCaption =
  "site-gallery-caption case-study-media-caption-mt text-left text-neutral-500";
const dmShell = SITE_COLUMN;
const accentLabel = "text-teal-300/70";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/domis-home-maintenance/id6746832568";

const principles: { title: string; body: string; Icon: LucideIcon }[] = [
  {
    title: "Do the reading for them",
    body: "Ingest the messy document; hand back structured, plain-language action.",
    Icon: BookOpen,
  },
  {
    title: "Earn trust in every AI output",
    body: "A result is only useful if the user believes it — so design for transparency (show the source), editability, and honest confidence states.",
    Icon: ShieldCheck,
  },
  {
    title: "Make it feel like theirs",
    body: "Personalization and small moments of delight so upkeep feels less like a chore and more like pride of ownership.",
    Icon: Heart,
  },
];

const roadmapItems = [
  {
    title: "Proactive prep (weather + location)",
    body: "Predict events near a home — freeze warnings, storms, seasonal shifts — and surface prep tasks before damage. The shift from reactive to proactive maintenance.",
    tension: "Design tension: proactive without being noisy.",
    imageSrc: "/assets/domis/smart.png",
    imageAlt: "Domis smart recommendations based on weather and season",
  },
  {
    title: "Onboarding autofill (Maps / property APIs)",
    body: "Autofill home details from an address to cut onboarding friction and drop-off.",
    tension: "Design tension: autofill vs. confirm; privacy.",
    imageSrc: "/assets/home/domis-home-screen.png",
    imageAlt: "Domis home screen showing property context",
  },
  {
    title: "Cross-platform design system",
    body: "A token-based system so the team can extend from iOS to a web app without rebuilding — consistency plus velocity.",
    tension: "Systems thinking: one language, many surfaces.",
    imageSrc: "/assets/grid/domis-screen-straight.png",
    imageAlt: "Domis UI screens spanning product surfaces",
  },
];

function MediaFrame({
  src,
  alt,
  className,
  aspectClass = "aspect-[4/3]",
  objectContain = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  objectContain?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "overflow-hidden border border-neutral-800 bg-neutral-950",
          aspectClass,
          className
        )}
      >
        <ImagePlaceholder label="Image coming soon" fullBleed className="border-0" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden border border-neutral-800 bg-neutral-950",
        aspectClass,
        className
      )}
    >
      <LightboxImage
        src={src}
        alt={alt}
        className={cn(
          "h-full w-full",
          objectContain ? "object-contain" : "object-cover"
        )}
        draggable={false}
      />
    </div>
  );
}

function PrincipleCard({
  title,
  body,
  Icon,
  delay = 0,
}: {
  title: string;
  body: string;
  Icon: LucideIcon;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="flex h-full min-h-0 flex-col border border-neutral-800 bg-neutral-900/50 p-6 md:p-8">
        <div
          className="mb-5 flex size-11 items-center justify-center border border-teal-300/15 bg-teal-300/[0.08] text-teal-200/85 md:size-12"
          aria-hidden
        >
          <Icon className="size-[1.35rem] md:size-6" strokeWidth={1.65} />
        </div>
        <h3 className={cn("site-label case-study-tight-trail-mb text-left", accentLabel)}>
          {title}
        </h3>
        <p className={cn(dmBody, "m-0 text-left text-neutral-400")}>{body}</p>
      </div>
    </Reveal>
  );
}

function FeatureBeat({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "problem" | "approach" | "decision" | "result";
  children: ReactNode;
}) {
  const toneClass =
    tone === "problem"
      ? "text-rose-400/70"
      : tone === "result"
        ? "text-emerald-400/70"
        : accentLabel;

  return (
    <div className="w-full min-w-0 border border-neutral-800 bg-neutral-900/50 p-6 md:p-8">
      <span className={cn("site-label case-study-heading-trail-mb block text-left", toneClass)}>
        {label}
      </span>
      <div className="case-study-heading-trail-gap flex flex-col">{children}</div>
    </div>
  );
}

function AppStoreButton({ className }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-7 py-3.5 text-white shadow-lg shadow-black/25 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
        className
      )}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span className="site-body">Download on the App Store</span>
    </a>
  );
}

export default function DomisPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <LightboxProvider>
        <div className="site-editorial relative min-h-screen w-full overflow-x-hidden bg-[#0A0A0A] font-sans antialiased selection:bg-teal-900/40 selection:text-teal-100">
          <GrainOverlay />
          <StickySidebar
            sections={[
              { id: "hero", label: "Intro", number: "00" },
              { id: "problem", label: "Problem", number: "01" },
              { id: "role", label: "Role", number: "02" },
              { id: "approach", label: "Approach", number: "03" },
              { id: "research", label: "Research", number: "04" },
              { id: "features", label: "Features", number: "05" },
              { id: "roadmap", label: "What's Next", number: "06" },
              { id: "prototyping", label: "Prototyping", number: "07" },
              { id: "reflection", label: "Reflection", number: "08" },
            ]}
            variant="dark"
          />

          {/* ─── HERO ─── */}
          <section
            id="hero"
            className="relative flex min-h-screen items-center overflow-hidden"
          >
            <div className="absolute inset-0">
              <img
                src="/assets/home/domis-card1-tasks-composite.png"
                alt=""
                className="h-full w-full object-cover opacity-[0.14]"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-transparent to-[#0A0A0A]" />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 40%, #0A0A0A 100%)",
                }}
              />
            </div>

            <div className={cn("relative z-10 w-full py-32 md:py-40 text-left", dmShell)}>
              <div className="case-study-prose-stack flex w-full min-w-0 flex-col">
                <Reveal>
                  <img
                    src="/assets/domis/domis_icon.png"
                    alt="Domis app icon"
                    className="size-16 shrink-0 rounded-[22%] object-cover object-center shadow-lg ring-1 ring-white/10 md:size-20"
                    draggable={false}
                  />
                </Reveal>

                <HeroTextAnimation
                  variant="wave"
                  className="type-h1 text-left text-neutral-100"
                >
                  Domis
                </HeroTextAnimation>

                <Reveal delay={0.25}>
                  <p
                    className={cn(
                      dmBody,
                      "max-w-[640px] text-neutral-400 text-balance [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_2px_16px_rgba(0,0,0,0.65)]"
                    )}
                  >
                    An AI-powered home maintenance app that turns the chaos of owning
                    a home into calm, personalized action.
                  </p>
                </Reveal>

                <Reveal delay={0.35}>
                  <div
                    className={cn(
                      "flex flex-wrap justify-start gap-x-10 gap-y-6",
                      dmBody,
                      "text-neutral-500"
                    )}
                  >
                    <div>
                      <span className="site-label case-study-meta-line-mb block text-left text-neutral-600">
                        Role
                      </span>
                      Founding Product Designer
                    </div>
                    <div>
                      <span className="site-label case-study-meta-line-mb block text-left text-neutral-600">
                        Timeline
                      </span>
                      2024 &mdash; Present
                    </div>
                    <div>
                      <span className="site-label case-study-meta-line-mb block text-left text-neutral-600">
                        Platforms
                      </span>
                      iOS (SwiftUI); web app in progress
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.4}>
                  <div className="flex flex-wrap case-study-grid-gap-dense">
                    {["Consumer", "AI", "0-to-1", "Shipped"].map((tag) => (
                      <span
                        key={tag}
                        className="site-label rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-left text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Reveal>

                <Reveal delay={0.45}>
                  <AppStoreButton />
                </Reveal>
              </div>
            </div>
          </section>

          {/* ─── THE PROBLEM ─── */}
          <section id="problem" className={cn(dmShell, "case-study-section-y-b")}>
            <div className="case-study-prose-stack">
              <Reveal>
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                  The Problem
                </h2>
              </Reveal>
              <Reveal>
                <p className={cn(dmBody, "text-neutral-400")}>
                  Owning a home is a part-time job nobody trained you for. The
                  information arrives unstructured and intimidating &mdash; a 30-page
                  inspection report, a drawer of appliance manuals, warranty paperwork,
                  seasonal upkeep no one remembers until something breaks. Faced with
                  that, most people do the rational thing: they file it away and hope.
                  The small deferred fix becomes the expensive emergency.
                </p>
              </Reveal>
              <Reveal>
                <p className={cn(dmBody, "text-neutral-400")}>
                  The design problem wasn&apos;t &ldquo;make a nicer to-do list.&rdquo;
                  It was:{" "}
                  <span className="text-neutral-200">
                    take scattered, unstructured, anxiety-inducing inputs and turn them
                    into trustworthy, personalized, low-effort action &mdash; using AI
                    only where it genuinely removes work, never as a gimmick.
                  </span>
                </p>
              </Reveal>
              <Reveal>
                <div className="case-study-grid-gap-dense grid grid-cols-1 md:grid-cols-2">
                  <MediaFrame
                    src="/assets/home/domis-document-scan.png"
                    alt="Inspection report document scan in Domis"
                    aspectClass="aspect-[4/3]"
                  />
                  <MediaFrame
                    src="/assets/home/domis-tasks-found.png"
                    alt="Tasks extracted from an inspection report"
                    aspectClass="aspect-[4/3]"
                    objectContain
                  />
                </div>
                <p className={dmMediaCaption}>
                  From overwhelm to action &mdash; the inspection report becomes the
                  product&apos;s front door.
                </p>
              </Reveal>
            </div>
          </section>

          {/* ─── ROLE ─── */}
          <section id="role" className={cn(dmShell, "case-study-section-y-b")}>
            <Reveal>
              <div className="case-study-block-gap">
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                  My Role &amp; How I Work
                </h2>
                <p className={cn(dmBody, "text-neutral-400")}>
                  As founding designer I own research, product and interaction design,
                  and functional prototyping &mdash; and I build the prototypes in code
                  (SwiftUI), not just Figma. That hybrid matters here: AI features
                  can&apos;t be judged from a static mockup, because the experience{" "}
                  <em className="not-italic text-neutral-200">is</em> the model&apos;s
                  behavior. Prototyping on-device let us feel whether an AI interaction
                  was trustworthy before engineering committed to it. I work day-to-day
                  with the founders and engineering, and I set up the design system the
                  product is built on.
                </p>
              </div>
            </Reveal>
          </section>

          {/* ─── APPROACH / PRINCIPLES ─── */}
          <section id="approach" className={cn(dmShell, "case-study-section-y-b")}>
            <Reveal>
              <div className="case-study-block-gap">
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                  Approach
                </h2>
                <p className={cn(dmBody, "text-neutral-500")}>
                  Three principles filtered every product decision.
                </p>
              </div>
            </Reveal>
            <div className="case-study-grid-gap grid grid-cols-1 md:grid-cols-3">
              {principles.map((p, i) => (
                <PrincipleCard
                  key={p.title}
                  title={p.title}
                  body={p.body}
                  Icon={p.Icon}
                  delay={0.05 * i}
                />
              ))}
            </div>
          </section>

          {/* ─── RESEARCH ─── */}
          <section id="research" className={cn(dmShell, "case-study-section-y-b")}>
            <Reveal>
              <div className="case-study-block-gap">
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                  Research &amp; Insight
                </h2>
                <p className={cn(dmBody, "text-neutral-400")}>
                  I mapped the first 30 days of new-home ownership by role-playing the
                  journey end to end and pressure-testing each assumption against how
                  people actually behave. One failure point kept recurring: the moment a
                  homeowner receives their inspection report &mdash; peak intent
                  (&ldquo;I just bought this, I want to do it right&rdquo;) colliding
                  with peak overwhelm &mdash; and it&apos;s exactly where every existing
                  tool abandons them. That became the wedge: intervene at the report, and
                  earn the right to everything after.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="w-full border border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center md:px-10 md:py-12">
                <p className={dmBody}>
                  <span className="text-teal-200">How might we</span>{" "}
                  <span className="text-neutral-200">
                    meet homeowners at the moment of highest intent and turn an
                    intimidating report into the first calm, trusted action?
                  </span>
                </p>
              </div>
            </Reveal>
          </section>

          {/* ─── FEATURE DEEP-DIVES ─── */}
          <section id="features" className={cn(dmShell, "case-study-section-y-b")}>
            <Reveal>
              <div className="case-study-block-gap">
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                  Shipped Features
                </h2>
                <p className={cn(dmBody, "text-neutral-500")}>
                  Three shipped surfaces &mdash; each designed as problem, decision,
                  rationale, result.
                </p>
              </div>
            </Reveal>

            {/* 6a Document Processor */}
            <div className="case-study-prose-stack flex flex-col">
              <Reveal>
                <div className="case-study-subsection-gap">
                  <span className={cn("site-label case-study-heading-trail-mb block text-left", accentLabel)}>
                    Feature 01 · Shipped
                  </span>
                  <h3 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                    Document Processor
                  </h3>
                  <p className={cn(dmBody, "text-neutral-500")}>
                    Inspection report &rarr; prioritized, plain-language tasks.
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <div className="case-study-intra-stack flex w-full min-w-0 flex-col">
                  <FeatureBeat label="The Problem" tone="problem">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      Inspection reports are long, jargon-dense, and non-actionable.
                      Homeowners can&apos;t tell what&apos;s urgent, what&apos;s
                      cosmetic, or what to actually <em className="not-italic text-neutral-200">do</em>.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Approach" tone="approach">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      An AI pipeline that parses the PDF into structured, prioritized,
                      plain-language tasks and highlights, localized to the specific
                      home.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Key Decisions" tone="decision">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      Present AI-extracted tasks so users trust them &mdash; surface the
                      source snippet (&ldquo;found in your report&rdquo;), show
                      severity/priority, make every item editable. Progressive
                      disclosure: summary &rarr; task &rarr; detail. The onboarding
                      &ldquo;aha&rdquo;: upload a report, watch it become a checklist in
                      seconds.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Result" tone="result">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      The report &mdash; formerly the moment people gave up &mdash;
                      becomes the moment they start. This is the product&apos;s front
                      door.
                    </p>
                  </FeatureBeat>
                </div>
              </Reveal>

              <Reveal>
                <div className="w-full min-w-0">
                  <span className={cn("site-label case-study-heading-trail-mb block text-left", accentLabel)}>
                    Signature Interaction
                  </span>
                  <DocumentProcessorDemo />
                  <p className={dmMediaCaption}>
                    Tap &ldquo;Process report&rdquo; &mdash; findings lift out of the
                    dense PDF and assemble into prioritized, editable tasks with source
                    citations.
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <div className="case-study-grid-gap-dense grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <MediaFrame
                    src="/assets/domis/docproc.png"
                    alt="Domis document processor phone UI"
                    aspectClass="aspect-[9/16] max-h-[560px]"
                    objectContain
                  />
                  <MediaFrame
                    src="/assets/home/domis-task-detail.png"
                    alt="Domis task detail with source snippet from the report"
                    aspectClass="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[320px]"
                    objectContain
                  />
                </div>
                <p className={dmMediaCaption}>
                  Shipped UI &mdash; progressive disclosure from summary to task detail,
                  with source snippets for trust.
                </p>
              </Reveal>
            </div>

            {/* 6b Appliance Scanner */}
            <div className="case-study-block-mt case-study-prose-stack flex flex-col">
              <Reveal>
                <div className="case-study-subsection-gap">
                  <span className={cn("site-label case-study-heading-trail-mb block text-left", accentLabel)}>
                    Feature 02 · Shipped
                  </span>
                  <h3 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                    Appliance Scanner
                  </h3>
                  <p className={cn(dmBody, "text-neutral-500")}>
                    Agentic auto-research from a single photo.
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <div className="case-study-intra-stack flex w-full min-w-0 flex-col">
                  <FeatureBeat label="The Problem" tone="problem">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      Logging appliances and hunting down manuals, serial numbers,
                      warranty windows, and common failures is tedious enough that no one
                      does it &mdash; so the data that makes maintenance smart never gets
                      captured.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Approach" tone="approach">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      Point the camera at an appliance; an agentic flow identifies it and
                      auto-researches a guide (manual, common repairs, serial capture,
                      warranty tracking) with no manual data entry.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Key Decisions" tone="decision">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      The capture moment (reticle, guidance, confidence); presenting
                      agent output with trust cues and edit affordances; what to auto-fill
                      vs. ask the user to confirm; graceful low-confidence and failure
                      states.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Origin" tone="approach">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      I found the core insight by role-playing the appliance-logging task
                      myself and validating the agent&apos;s research quality against
                      consumer LLMs before we built it.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Result" tone="result">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      A minute of tedious data entry collapses into one photo.
                    </p>
                  </FeatureBeat>
                </div>
              </Reveal>

              <Reveal>
                <div className="mx-auto w-full max-w-md">
                  <ApplianceScannerDemo
                    caption="Camera capture → agentic research → editable appliance guide. Interactive reticle flow coming; annotated screenshot for now."
                  />
                </div>
              </Reveal>
            </div>

            {/* 6c Personalization */}
            <div className="case-study-block-mt case-study-prose-stack flex flex-col">
              <Reveal>
                <div className="case-study-subsection-gap">
                  <span className={cn("site-label case-study-heading-trail-mb block text-left", accentLabel)}>
                    Feature 03 · Shipped
                  </span>
                  <h3 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                    Personalization
                  </h3>
                  <p className={cn(dmBody, "text-neutral-500")}>
                    AI-generated home identity from day one.
                  </p>
                </div>
              </Reveal>

              <Reveal>
                <div className="case-study-intra-stack flex w-full min-w-0 flex-col">
                  <FeatureBeat label="The Problem" tone="problem">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      Maintenance apps feel generic and transactional; low emotional
                      attachment means low engagement.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Approach" tone="approach">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      Use AI image translation/generation to create a personalized home
                      avatar/icon representing the user&apos;s actual home, so the app
                      feels like <em className="not-italic text-neutral-200">theirs</em>{" "}
                      from the first session.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Key Decisions" tone="decision">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      Turning a real-world input into a consistent generated identity;
                      keeping it delightful, not gimmicky; where personalization shows up
                      across the app.
                    </p>
                  </FeatureBeat>
                  <FeatureBeat label="Result" tone="result">
                    <p className={cn(dmBody, "text-neutral-400")}>
                      Personalization becomes a first-session hook &mdash; the app reads
                      as the user&apos;s own home from the start, not a generic utility.
                    </p>
                  </FeatureBeat>
                </div>
              </Reveal>

              <Reveal>
                <div className="mx-auto w-full max-w-md">
                  <PersonalizationShowcase
                    caption="Generated home identity as a first-session hook. Interactive input→avatar animation coming; static showcase for now."
                  />
                </div>
              </Reveal>
            </div>
          </section>

          {/* ─── WHAT'S NEXT ─── */}
          <section id="roadmap" className={cn(dmShell, "case-study-section-y-b")}>
            <Reveal>
              <div className="case-study-block-gap">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1">
                  <span className="site-label text-amber-200/80">Roadmap · In Progress</span>
                </div>
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                  What&apos;s Next
                </h2>
                <p className={cn(dmBody, "text-neutral-500")}>
                  Forward-looking work &mdash; clearly not shipped yet. Each item has a
                  live design tension we&apos;re actively resolving.
                </p>
              </div>
            </Reveal>

            <div className="case-study-prose-stack flex flex-col">
              {roadmapItems.map((item, i) => (
                <Reveal key={item.title} delay={0.04 * i}>
                  <div className="overflow-hidden border border-neutral-800 bg-neutral-900/40">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
                        <span className="site-label text-amber-200/60">
                          In progress · 0{i + 1}
                        </span>
                        <h3 className="site-subheading text-left text-neutral-100">
                          {item.title}
                        </h3>
                        <p className={cn(dmBody, "text-neutral-400")}>{item.body}</p>
                        <p className={cn(dmBody, "text-neutral-600")}>
                          {item.tension}
                        </p>
                      </div>
                      <div className="min-h-[220px] border-t border-neutral-800 bg-neutral-950 md:border-l md:border-t-0">
                        <LightboxImage
                          src={item.imageSrc}
                          alt={item.imageAlt}
                          className="h-full w-full object-cover object-top"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ─── PROTOTYPING IN CODE ─── */}
          <section id="prototyping" className={cn(dmShell, "case-study-section-y-b")}>
            <Reveal>
              <div className="case-study-block-gap">
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                  Prototyping in Code
                </h2>
                <p className={cn(dmBody, "text-neutral-400")}>
                  Because these features <em className="not-italic text-neutral-200">are</em>{" "}
                  their AI behavior, I prototyped them functionally in SwiftUI and
                  iterated on-device. Building in code let the team judge trust, latency,
                  and failure states on real hardware, and de-risked the AI interactions
                  before engineering scaled them &mdash; the same design-engineer
                  approach I bring to every 0-to-1 surface.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="overflow-hidden border border-neutral-800 bg-neutral-950">
                <video
                  src="/assets/home/domis-card2-anim.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="block h-auto w-full"
                  aria-label="Domis product animation — silent looping preview"
                />
              </div>
              <p className={dmMediaCaption}>
                On-device SwiftUI prototyping &mdash; feel the AI interaction before
                engineering commits.
              </p>
            </Reveal>
            <Reveal>
              <div className="case-study-grid-gap-dense grid grid-cols-1 md:grid-cols-2">
                <MediaFrame
                  src="/assets/grid/domis-screen-tilted.png"
                  alt="Domis product screen in physical context"
                  aspectClass="aspect-[4/3]"
                />
                <MediaFrame
                  src="/assets/home/domis-home-screen.png"
                  alt="Domis home screen prototype"
                  aspectClass="aspect-[4/3]"
                  objectContain
                />
              </div>
            </Reveal>
          </section>

          {/* ─── REFLECTION ─── */}
          <section id="reflection" className="relative case-study-section-y overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-[#0A0A0A]" />
            <div className={cn("relative", dmShell)}>
              <Reveal>
                <div className="case-study-hero-bump-mb">
                  <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                    Reflection
                  </h2>
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <p className={cn(dmBody, "text-neutral-400 w-full min-w-0")}>
                  Designing Domis reset how I think about AI in consumer products. The
                  hard part was never the model &mdash; it was the trust layer around it:
                  how much to automate, how much control to leave the user, and how to
                  show the seams honestly so people believe the result instead of
                  second-guessing it. The features that worked were the ones where AI did
                  the tedious 80% and handed the user a confident, editable draft for the
                  last 20%. Next is the web app &mdash; extending the design system so
                  the same calm, personalized experience follows people to every screen.
                </p>
              </Reveal>
              <Reveal delay={0.15} className="case-study-media-caption-mt">
                <AppStoreButton />
              </Reveal>
            </div>
          </section>

          <div className="h-20" />
        </div>
      </LightboxProvider>
      <CaseStudyPill projectSlug="domis" />
      <StickyNotes page="domis" />
    </>
  );
}

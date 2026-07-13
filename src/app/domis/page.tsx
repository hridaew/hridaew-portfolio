"use client";

import { useEffect, type ReactNode } from "react";
import { GrainOverlay } from "@/components/virdio/GrainOverlay";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { HeroTextAnimation } from "@/components/HeroTextAnimation";
import { StickySidebar } from "@/components/shared/StickySidebar";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { GlassPanel } from "@/components/domis/GlassPanel";
import { DocumentProcessorDemo } from "@/components/domis/DocumentProcessorDemo";
import { ApplianceScannerDemo } from "@/components/domis/ApplianceScannerDemo";
import { PersonalizationShowcase } from "@/components/domis/PersonalizationShowcase";
import { cn } from "@/lib/utils";
import { SITE_COLUMN } from "@/components/home/homeGrid";

const body = "site-body text-neutral-300";
const caption =
  "site-gallery-caption case-study-media-caption-mt text-left text-neutral-500";
const shell = SITE_COLUMN;

const APP_STORE_URL =
  "https://apps.apple.com/us/app/domis-home-maintenance/id6746832568";

const roadmapItems = [
  {
    title: "Proactive prep",
    body: "Weather + location surfaces prep tasks before a freeze or storm hits — reactive to proactive.",
    tension: "Proactive without being noisy.",
  },
  {
    title: "Onboarding autofill",
    body: "Pull home details from an address via Maps / property APIs so people don't type what we already know.",
    tension: "Autofill vs. confirm; privacy.",
  },
  {
    title: "Cross-platform system",
    body: "Token-based design system so iOS and the coming web app share one language without a rebuild.",
    tension: "Consistency plus velocity.",
  },
];

function AmbientBlooms() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute -left-[20%] top-[12%] h-[42vw] w-[42vw] rounded-full opacity-[0.18]"
        style={{
          background:
            "radial-gradient(circle, rgba(45, 212, 191, 0.55) 0%, transparent 68%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute -right-[15%] top-[38%] h-[36vw] w-[36vw] rounded-full opacity-[0.14]"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 136, 0.5) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="absolute bottom-[8%] left-[30%] h-[28vw] w-[28vw] rounded-full opacity-[0.1]"
        style={{
          background:
            "radial-gradient(circle, rgba(94, 234, 212, 0.4) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
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
        "inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-7 py-3.5 text-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.7)] transition-colors hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
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

function FeaturePanel({
  id,
  eyebrow,
  title,
  oneLiner,
  children,
  media,
  mediaCaption,
}: {
  id: string;
  eyebrow: string;
  title: string;
  oneLiner: string;
  children: ReactNode;
  media: ReactNode;
  mediaCaption?: string;
}) {
  return (
    <section id={id} className={cn(shell, "case-study-section-y-b")}>
      <Reveal>
        <GlassPanel padding="lg" className="case-study-prose-stack flex flex-col">
          <div>
            <span className="site-label case-study-heading-trail-mb block text-left text-white/40">
              {eyebrow}
            </span>
            <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
              {title}
            </h2>
            <p className="site-body text-neutral-500">{oneLiner}</p>
          </div>
          <div className="case-study-heading-trail-gap flex flex-col">
            {children}
          </div>
          <div className="w-full min-w-0">
            {media}
            {mediaCaption ? <p className={caption}>{mediaCaption}</p> : null}
          </div>
        </GlassPanel>
      </Reveal>
    </section>
  );
}

export default function DomisPage() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <>
      <LightboxProvider>
        <div className="site-editorial relative min-h-screen w-full overflow-x-hidden bg-[#0c0c0e] font-sans antialiased selection:bg-teal-900/35 selection:text-teal-100">
          <AmbientBlooms />
          <GrainOverlay />

          <StickySidebar
            sections={[
              { id: "hero", label: "Intro", number: "00" },
              { id: "overview", label: "Overview", number: "01" },
              { id: "document-processor", label: "Document Processor", number: "02" },
              { id: "appliance-scanner", label: "Appliance Scanner", number: "03" },
              { id: "personalization", label: "Personalization", number: "04" },
              { id: "whats-next", label: "What's Next", number: "05" },
              { id: "reflection", label: "Reflection", number: "06" },
            ]}
            variant="dark"
          />

          {/* ─── 00 · HERO ─── */}
          <section
            id="hero"
            className="relative flex min-h-[88vh] items-center overflow-hidden"
          >
            <div className={cn("relative z-10 w-full py-28 md:py-36 text-left", shell)}>
              <div className="case-study-prose-stack flex w-full max-w-[640px] min-w-0 flex-col">
                <Reveal>
                  <img
                    src="/assets/domis/domis_icon.png"
                    alt="Domis app icon"
                    className="size-16 shrink-0 rounded-[22%] object-cover object-center shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/10 md:size-[4.5rem]"
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
                  <p className={cn(body, "text-balance text-neutral-400")}>
                    An AI-powered home maintenance app that turns the chaos of owning
                    a home into calm, personalized action.
                  </p>
                </Reveal>

                <Reveal delay={0.35}>
                  <div
                    className={cn(
                      "flex flex-wrap justify-start gap-x-10 gap-y-5",
                      "site-body text-neutral-500"
                    )}
                  >
                    <div>
                      <span className="site-label case-study-meta-line-mb block text-left text-white/35">
                        Role
                      </span>
                      Founding Product Designer
                    </div>
                    <div>
                      <span className="site-label case-study-meta-line-mb block text-left text-white/35">
                        Timeline
                      </span>
                      2024 &mdash; Present
                    </div>
                    <div>
                      <span className="site-label case-study-meta-line-mb block text-left text-white/35">
                        Platforms
                      </span>
                      iOS (SwiftUI); web in progress
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.4}>
                  <div className="flex flex-wrap gap-2">
                    {["Consumer", "AI", "0-to-1", "Shipped"].map((tag) => (
                      <span
                        key={tag}
                        className="site-label rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-left text-white/55"
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

          {/* ─── 01 · SETUP / OVERVIEW ─── */}
          <section id="overview" className={cn(shell, "case-study-section-y-b")}>
            <Reveal>
              <GlassPanel padding="lg" className="case-study-prose-stack flex flex-col">
                <h2 className="site-chapter-heading text-neutral-100">
                  Turning chaos into something you can trust
                </h2>
                <p className={body}>
                  Owning a home is a part-time job nobody trains you for. The information
                  shows up all at once and none of it is structured &mdash; a 30-page
                  inspection report, a drawer of manuals, warranties, seasonal upkeep you
                  only remember when something breaks. Most people file it away and hope,
                  and the small deferred fix becomes the expensive emergency.
                </p>
                <p className={body}>
                  The design problem wasn&apos;t a nicer to-do list. It was taking
                  scattered, intimidating inputs and turning them into trustworthy,
                  low-effort action &mdash; using AI only where it actually removes work.
                </p>
                <p className={body}>
                  As founding designer I own it end to end: research, product and
                  interaction design, and functional prototypes I build in SwiftUI, not
                  just Figma. That mattered more than usual here. With AI features the
                  experience{" "}
                  <span className="text-neutral-100">is</span> the model&apos;s behavior
                  &mdash; you can&apos;t judge trust, latency, or a failure state from a
                  static mockup. So I built the interactions on-device and used how they
                  felt to decide what shipped.
                </p>
                <div className="overflow-hidden rounded-2xl">
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
                <p className={caption}>
                  On-device SwiftUI prototypes — feel the AI interaction before engineering
                  commits.
                </p>
              </GlassPanel>
            </Reveal>
          </section>

          {/* ─── 02 · DOCUMENT PROCESSOR ─── */}
          <FeaturePanel
            id="document-processor"
            eyebrow="Feature 01 · Shipped"
            title="Document Processor"
            oneLiner="Turn the inspection report into the first thing you do, not the thing you avoid."
            media={<DocumentProcessorDemo />}
            mediaCaption='Tap "Process report" — findings lift into prioritized, editable tasks with the source line attached.'
          >
            <p className={body}>
              The report is where every other tool gives up on the homeowner &mdash;
              it&apos;s long, full of jargon, and tells you nothing about what&apos;s
              urgent versus cosmetic. I designed an AI flow that reads the PDF and hands
              back prioritized, plain-language tasks localized to the specific home. What
              made or broke it was trust: extracted tasks are worthless if people
              don&apos;t believe them, so every item shows the source line it came from,
              carries a clear severity, and stays fully editable. Progressive disclosure
              keeps it calm &mdash; summary, then task, then detail. The report went from
              the moment people quit to the moment they start.
            </p>
            <div className="case-study-grid-gap-dense grid grid-cols-1 md:grid-cols-2">
              <div className="overflow-hidden rounded-2xl bg-black/30 ring-1 ring-white/[0.06]">
                <LightboxImage
                  src="/assets/domis/docproc.png"
                  alt="Domis document processor phone UI"
                  className="block h-auto w-full object-contain"
                  draggable={false}
                />
              </div>
              <div className="overflow-hidden rounded-2xl bg-black/30 ring-1 ring-white/[0.06]">
                <LightboxImage
                  src="/assets/home/domis-task-detail.png"
                  alt="Domis task detail with source snippet from the report"
                  className="block h-auto w-full object-contain"
                  draggable={false}
                />
              </div>
            </div>
          </FeaturePanel>

          {/* ─── 03 · APPLIANCE SCANNER ─── */}
          <FeaturePanel
            id="appliance-scanner"
            eyebrow="Feature 02 · Shipped"
            title="Appliance Scanner"
            oneLiner="Photograph an appliance; get a researched guide back."
            media={
              <div className="mx-auto w-full max-w-md">
                <ApplianceScannerDemo />
              </div>
            }
            mediaCaption="One photo → agentic research → editable guide. Interactive reticle flow coming."
          >
            <p className={body}>
              Logging appliances &mdash; chasing manuals, serial numbers, warranty
              windows, common failures &mdash; is tedious enough that nobody does it, so
              the data that would make maintenance smart never gets captured. I designed
              an agentic flow that identifies the appliance from a single photo and
              auto-researches the whole guide, no manual entry. Most of the design work
              lived in the trust cues: what to auto-fill versus ask the user to confirm,
              how to show the agent&apos;s confidence, and how it degrades gracefully
              instead of guessing when it&apos;s unsure. I pressure-tested the
              agent&apos;s research quality against consumer LLMs before we committed to
              building it. A minute of data entry collapses into one photo.
            </p>
          </FeaturePanel>

          {/* ─── 04 · PERSONALIZATION ─── */}
          <FeaturePanel
            id="personalization"
            eyebrow="Feature 03 · Shipped"
            title="Personalization"
            oneLiner="Make the app feel like your home from the first session."
            media={
              <div className="mx-auto w-full max-w-md">
                <PersonalizationShowcase />
              </div>
            }
            mediaCaption="Generated home identity as a quiet, recurring first-session hook."
          >
            <p className={body}>
              Maintenance apps are generic and transactional, and generic means low
              attachment, which means low engagement. I used AI image translation to
              generate a personalized identity for the user&apos;s actual home &mdash; an
              avatar that recurs across the app so it reads as theirs, not a utility. The
              line I kept watching was delight versus gimmick: it had to feel earned, so I
              tied the generated identity to a real input from their home and let it show
              up in small, consistent places rather than shouting. It became a
              first-session hook &mdash; the app feels personal before you&apos;ve done
              any work in it.
            </p>
          </FeaturePanel>

          {/* ─── 05 · WHAT'S NEXT ─── */}
          <section id="whats-next" className={cn(shell, "case-study-section-y-b")}>
            <Reveal>
              <div className="case-study-block-gap">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                  <span className="site-label text-white/50">Roadmap · Not shipped</span>
                </div>
                <h2 className="site-chapter-heading case-study-heading-trail-mb text-neutral-100">
                  What&apos;s next
                </h2>
                <p className="site-body text-neutral-500">
                  Live design tensions we&apos;re still resolving — not launches.
                </p>
              </div>
            </Reveal>
            <div className="case-study-grid-gap grid grid-cols-1 md:grid-cols-3">
              {roadmapItems.map((item, i) => (
                <Reveal key={item.title} delay={0.04 * i}>
                  <GlassPanel padding="md" className="flex h-full flex-col gap-3">
                    <span className="site-label text-white/35">In progress · 0{i + 1}</span>
                    <h3 className="site-subheading text-left text-neutral-100">
                      {item.title}
                    </h3>
                    <p className={cn(body, "flex-1")}>{item.body}</p>
                    <p className="site-body text-neutral-600">{item.tension}</p>
                  </GlassPanel>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ─── 06 · REFLECTION + CTA ─── */}
          <section id="reflection" className={cn(shell, "case-study-section-y-b")}>
            <Reveal>
              <GlassPanel padding="lg" className="case-study-prose-stack flex flex-col">
                <h2 className="site-chapter-heading text-neutral-100">Reflection</h2>
                <p className={body}>
                  Domis reset how I think about AI in consumer products. The hard part was
                  never the model &mdash; it was the trust layer around it: how much to
                  automate, how much control to leave the user, and how to show the seams
                  honestly so people believe a result instead of second-guessing it. The
                  features that worked all shared a shape: AI does the tedious 80% and
                  hands over a confident, editable draft for the last 20%. Next is the web
                  app &mdash; extending the system so the same calm follows people to every
                  screen.
                </p>
                <AppStoreButton />
              </GlassPanel>
            </Reveal>
          </section>

          <div className="h-16 md:h-24" />
        </div>
      </LightboxProvider>
      <CaseStudyPill projectSlug="domis" />
      <StickyNotes page="domis" />
    </>
  );
}

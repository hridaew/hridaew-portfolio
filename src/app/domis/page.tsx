"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { LightboxProvider, LightboxImage } from "@/components/virdio/Lightbox";
import { Reveal } from "@/components/Reveal";
import { StickyNotes } from "@/components/StickyNotes";
import { CaseStudyPill } from "@/components/shared/CaseStudyPill";
import { DocumentProcessorDemo } from "@/components/domis/DocumentProcessorDemo";
import { ApplianceScannerDemo } from "@/components/domis/ApplianceScannerDemo";
import { PersonalizationShowcase } from "@/components/domis/PersonalizationShowcase";
import {
  SimonyTag,
  MediaPlaceholder,
  GradientShell,
} from "@/components/domis/CaseStudyChrome";
import { cn } from "@/lib/utils";
import {
  Brush,
  Layers,
  Code2,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Domis case study — implemented from Figma
 * https://www.figma.com/design/X8X9ZDIa0LBabstsDgxPRX/Domis-Design?node-id=19616-6448
 * Layout: Cam Simony / Kajabi structure. Content + media: Domis.
 * Paragraphs ≤ 3 lines. Missing media → placeholders.
 */

const APP_STORE_URL =
  "https://apps.apple.com/us/app/domis-home-maintenance/id6746832568";

const FIGMA = "/assets/domis/figma";

const prose = "mx-auto w-full max-w-[580px]";
const wide = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";

const GRADIENTS = [
  "linear-gradient(180deg, #ff3e14 0%, #bdb2ff 100%)",
  "linear-gradient(180deg, #ff98b0 0%, #5342b2 100%)",
  "linear-gradient(180deg, #ebf47e 0%, #005f48 100%)",
  "linear-gradient(180deg, #bdb2ff 0%, #006282 100%)",
] as const;

const ICON_SRC = Array.from({ length: 12 }, (_, i) => `${FIGMA}/icon-${i}.png`);

function RoleRow({ Icon, children }: { Icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-center gap-4">
      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0f0f0] text-[#635974]">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-[#e6e6e6]" />
      </span>
      <span className="df-body">{children}</span>
    </li>
  );
}

function Quote({ children, cite }: { children: ReactNode; cite: string }) {
  return (
    <blockquote className="border-l-2 border-[#7c6cf0] py-1 pl-5">
      <p className="df-body">{children}</p>
      <cite className="df-caption mt-2 block not-italic text-[#a1a1aa]">{cite}</cite>
    </blockquote>
  );
}

function CardShell({
  children,
  className,
  bg = "#1a1a1a",
}: {
  children: ReactNode;
  className?: string;
  bg?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.78)]",
        className
      )}
      style={{ background: bg }}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(77,77,77,0.61)]" />
    </div>
  );
}

function ImpactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden rounded-[20px] bg-white/[0.05] shadow-[0_2px_6px_rgba(0,0,0,0.78)]">
      <div className="flex flex-col items-start justify-center gap-1.5 p-5">
        <p className="df-impact-row-label">{label}</p>
        <div className="df-impact-row-body">{children}</div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(77,77,77,0.61)]" />
    </div>
  );
}

export default function DomisPage() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    return () => {
      document.documentElement.classList.add("dark");
    };
  }, []);

  return (
    <>
      <LightboxProvider>
        <div className="domis-cs min-h-screen w-full overflow-x-hidden bg-black font-sans antialiased selection:bg-[#fd9e7b]/35 selection:text-white">
          {/* ═══════════════ DARK HERO (Figma 19616:6450) ═══════════════ */}
          <header className="relative flex flex-col items-center gap-16 px-5 pb-[120px] pt-[100px]">
            <div className="relative w-full max-w-[580px]">
              <Link
                href="/"
                aria-label="Back to home"
                className="absolute -left-[54px] top-[-5px] flex size-[30px] items-center justify-center rounded-[10px] bg-[#292929] shadow-[0_2px_6px_rgba(0,0,0,0.78)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 max-[700px]:static max-[700px]:mb-4"
              >
                <img src={`${FIGMA}/back.png`} alt="" className="size-5" />
                <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_1px_rgba(77,77,77,0.61)]" />
              </Link>

              <Reveal>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <h1 className="df-hero-title">
                      Designing Domis from first principles
                    </h1>
                    <p className="df-hero-sub">
                      2024 · AI-native home maintenance, built in code
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SimonyTag tone="coral">Product design</SimonyTag>
                    <SimonyTag tone="violet">AI</SimonyTag>
                    <SimonyTag tone="mint">0-to-1</SimonyTag>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.08}>
              <div className="flex w-full max-w-[1005px] flex-col gap-4">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="flex gap-6 md:w-[615px]">
                      <div className="flex w-[54px] shrink-0 flex-col justify-between gap-4">
                        {GRADIENTS.map((g, i) => (
                          <div
                            key={g}
                            className={cn(
                              "aspect-square w-full rounded-[14px] border-4 border-black",
                              (i === 1 || i === 2) && "scale-[1.1]"
                            )}
                            style={{ background: g }}
                          />
                        ))}
                      </div>
                      <CardShell bg="#070707" className="min-h-[256px] flex-1">
                        <div className="relative flex h-full min-h-[256px] items-center justify-center">
                          <div
                            className="absolute inset-x-0 bottom-0 h-2/3 opacity-80"
                            style={{
                              background:
                                "radial-gradient(ellipse at 50% 100%, rgba(255,90,95,0.5), transparent 65%)",
                            }}
                          />
                          <img
                            src="/assets/domis/domis_icon.png"
                            alt="Domis"
                            className="relative z-[1] h-16 w-auto drop-shadow-[0_8px_24px_rgba(255,90,95,0.45)] md:h-[72px]"
                            draggable={false}
                          />
                        </div>
                      </CardShell>
                    </div>
                    <CardShell className="min-h-[256px] overflow-hidden md:w-[366px]">
                      <div className="relative flex h-full min-h-[256px] items-center justify-center overflow-hidden">
                        <LightboxImage
                          src="/assets/home/domis-home-screen.png"
                          alt="Domis home screen"
                          className="absolute left-1/2 top-[-8%] h-[160%] w-auto max-w-none -translate-x-1/2 object-cover"
                          draggable={false}
                        />
                      </div>
                    </CardShell>
                  </div>

                  <div className="flex flex-col gap-6 md:flex-row">
                    <CardShell className="relative min-h-[256px] md:w-[261px]">
                      <div className="grid grid-cols-4 gap-0 p-6 pt-10">
                        {ICON_SRC.map((src, i) => (
                          <div
                            key={src}
                            className={cn(
                              "relative flex aspect-square items-center justify-center",
                              i === 1 && "z-[1]"
                            )}
                          >
                            {i === 1 && (
                              <>
                                <span className="df-trust-chip absolute -top-7 left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#635974] bg-[rgba(212,188,255,0.2)] px-1.5 py-[3px]">
                                  ❖ trust
                                </span>
                                <span className="absolute inset-[10%] rounded-sm border border-[#d4bcff] bg-[rgba(212,188,255,0.1)]" />
                                <span className="absolute -left-0.5 -top-0.5 size-1.5 rounded-full border border-[#d4bcff] bg-white" />
                                <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full border border-[#d4bcff] bg-white" />
                                <span className="absolute -bottom-0.5 -left-0.5 size-1.5 rounded-full border border-[#d4bcff] bg-white" />
                                <span className="absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full border border-[#d4bcff] bg-white" />
                              </>
                            )}
                            <img
                              src={src}
                              alt=""
                              className="relative z-[1] size-7 object-contain invert"
                              draggable={false}
                            />
                          </div>
                        ))}
                      </div>
                    </CardShell>

                    <CardShell className="min-h-[256px] flex-1 overflow-hidden md:w-[412px]">
                      <LightboxImage
                        src="/assets/home/domis-document-scan.png"
                        alt="Document scan atmosphere"
                        className="h-full min-h-[256px] w-full object-cover"
                        draggable={false}
                      />
                    </CardShell>

                    <CardShell className="min-h-[256px] overflow-hidden md:w-[281px]">
                      <LightboxImage
                        src="/assets/domis/docproc.png"
                        alt="Document processor marketing frame"
                        className="h-full min-h-[256px] w-full object-cover object-top"
                        draggable={false}
                      />
                    </CardShell>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pr-1">
                  <img src={`${FIGMA}/cursor.png`} alt="" className="size-4" />
                  <span className="df-click">Click around…</span>
                </div>
              </div>
            </Reveal>
          </header>

          {/* ═══════════════ LIGHT BODY (Figma 19616:6584) ═══════════════ */}
          <div className="relative rounded-t-[32px] bg-[#fafafa] pb-24 pt-24 text-black">
            <div className={cn(wide, "flex flex-col items-center gap-[100px]")}>
              <div className="flex w-full flex-col items-center gap-16">
                <Reveal>
                  <div className="relative w-full max-w-[638px] overflow-hidden rounded-[30px] border border-[#272b2d] bg-[#131415] p-5 shadow-[0_4px_4px_rgba(0,0,0,0.45)] sm:p-[30px]">
                    <div className="mb-6 flex items-center gap-4">
                      <span className="df-impact-label">Impact</span>
                      <span
                        className="h-0 flex-1 border-t-2 border-dashed border-white/30"
                        aria-hidden
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <ImpactRow label="Ownership">
                        Founding design for a shipped consumer AI product — research
                        through on-device SwiftUI prototypes.
                      </ImpactRow>
                      <ImpactRow label="Trust layer">
                        Designed transparency, editability, and failure states so AI
                        outputs feel believable, not magical.
                      </ImpactRow>
                      <ImpactRow label="Method">
                        Built interactions on-device to judge latency and confidence
                        before engineering scaled them.
                      </ImpactRow>
                    </div>
                  </div>
                </Reveal>

                <section className={cn(prose, "flex flex-col gap-2")}>
                  <Reveal>
                    <h2 className="df-h2">Context</h2>
                  </Reveal>
                  <Reveal delay={0.04}>
                    <div className="flex flex-col gap-4">
                      <p className="df-body">
                        Owning a home dumps unstructured information on people all at
                        once — inspection reports, manuals, warranties, seasonal upkeep.
                      </p>
                      <p className="df-body">
                        Most people file it away and hope. The small deferred fix becomes
                        the expensive emergency.
                      </p>
                      <p className="df-body">That&apos;s where I came in.</p>
                      <p className="df-body">
                        The design problem wasn&apos;t a nicer to-do list. It was turning
                        scattered inputs into trustworthy, low-effort action — using AI
                        only where it removes work.
                      </p>
                    </div>
                  </Reveal>
                </section>

                <section className={cn(prose, "flex flex-col gap-2")}>
                  <Reveal>
                    <h2 className="df-h2">My role</h2>
                  </Reveal>
                  <Reveal delay={0.04}>
                    <div className="flex flex-col gap-4">
                      <p className="df-body">
                        As{" "}
                        <span className="font-medium text-black">founding designer</span>{" "}
                        I own the work end to end — and I prototype AI interactions in
                        SwiftUI, not just Figma.
                      </p>
                      <p className="df-body">This meant:</p>
                      <ul className="flex flex-col gap-4">
                        <RoleRow Icon={Brush}>
                          Research, product, and interaction design for core AI surfaces
                        </RoleRow>
                        <RoleRow Icon={Layers}>
                          Design system setup the shipped product runs on
                        </RoleRow>
                        <RoleRow Icon={Code2}>
                          Functional on-device prototypes for trust, latency, and failure
                        </RoleRow>
                        <RoleRow Icon={Users}>
                          Day-to-day partnership with founders and engineering
                        </RoleRow>
                      </ul>
                    </div>
                  </Reveal>
                </section>
              </div>

              <Reveal>
                <GradientShell
                  from="#ffa1a8"
                  to="#faf7f2"
                  caption="On-device SwiftUI prototype — feel the AI before engineering commits."
                >
                  <video
                    src="/assets/home/domis-card2-anim.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="block h-auto w-full"
                    aria-label="Domis product animation"
                  />
                </GradientShell>
              </Reveal>

              <section className={cn(prose, "flex flex-col gap-2")}>
                <Reveal>
                  <h2 className="df-h2">A trust layer, not a gimmick</h2>
                </Reveal>
                <Reveal delay={0.04}>
                  <div className="flex flex-col gap-4">
                    <p className="df-body">
                      With AI features the experience{" "}
                      <strong className="font-medium text-black">is</strong> the
                      model&apos;s behavior. You can&apos;t judge trust from a static
                      mockup.
                    </p>
                    <p className="df-body">
                      So I built interactions on-device and used how they felt to decide
                      what shipped. The model does the tedious work — my job was making
                      people trust it.
                    </p>
                  </div>
                </Reveal>
              </section>

              <Reveal>
                <div className="grid w-full max-w-[580px] grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    { src: `${FIGMA}/ds-1.png`, alt: "Color system reference" },
                    { src: `${FIGMA}/ds-2.png`, alt: "Typography reference" },
                    { src: `${FIGMA}/ds-3.png`, alt: "Form and control states" },
                    { src: `${FIGMA}/ds-4.png`, alt: "Component library" },
                  ].map((img) => (
                    <LightboxImage
                      key={img.src}
                      src={img.src}
                      alt={img.alt}
                      className="w-full rounded-[20px] border border-[#e6e6e6] bg-white shadow-sm"
                      draggable={false}
                    />
                  ))}
                </div>
                <p className="df-caption mt-3 text-center">
                  System craft references — Domis-specific sheets swap in when ready.
                </p>
              </Reveal>

              <section className={cn(prose, "flex flex-col gap-2")}>
                <Reveal>
                  <h2 className="df-h2">Document processor</h2>
                </Reveal>
                <Reveal delay={0.04}>
                  <div className="flex flex-col gap-4">
                    <p className="df-body">
                      The inspection report is where other tools give up — long,
                      jargon-dense, and silent on what&apos;s urgent versus cosmetic.
                    </p>
                    <p className="df-body">
                      I designed an AI flow that reads the PDF and returns prioritized,
                      plain-language tasks for that specific home.
                    </p>
                    <p className="df-body">
                      Trust was the hinge: every task shows its source line, carries
                      severity, and stays fully editable.
                    </p>
                  </div>
                </Reveal>
              </section>

              <Reveal>
                <GradientShell
                  from="#ffa1a8"
                  to="#faf7f2"
                  framed={false}
                  showPrototype={false}
                  caption='Tap "Process Documents" in the demo.'
                >
                  <DocumentProcessorDemo />
                </GradientShell>
              </Reveal>

              <Reveal>
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="overflow-hidden rounded-[20px] border border-[#e6e6e6] bg-white shadow-sm">
                    <LightboxImage
                      src="/assets/home/domis-tasks-found.png"
                      alt="Tasks found from inspection report"
                      className="w-full object-contain"
                      draggable={false}
                    />
                  </div>
                  <div className="overflow-hidden rounded-[20px] border border-[#e6e6e6] bg-white shadow-sm">
                    <LightboxImage
                      src="/assets/home/domis-task-detail.png"
                      alt="Task detail with source citation"
                      className="w-full object-contain"
                      draggable={false}
                    />
                  </div>
                </div>
              </Reveal>

              <section className={cn(prose, "flex flex-col gap-2")}>
                <Reveal>
                  <h2 className="df-h2">Appliance scanner</h2>
                </Reveal>
                <Reveal delay={0.04}>
                  <div className="flex flex-col gap-4">
                    <p className="df-body">
                      Logging appliances is tedious enough that nobody does it — so smart
                      maintenance data never gets captured.
                    </p>
                    <p className="df-body">
                      One photo identifies the appliance and auto-researches the guide.
                      Design work lived in auto-fill vs. confirm, confidence, and graceful
                      failure.
                    </p>
                    <p className="df-body">
                      I pressure-tested the agent against consumer LLMs before we committed
                      to building it.
                    </p>
                  </div>
                </Reveal>
              </section>

              <Reveal>
                <GradientShell from="#a1dce5" to="#faf7f2">
                  <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 md:gap-6 md:p-4">
                    <ApplianceScannerDemo />
                    <MediaPlaceholder
                      label="Annotated scanner flow — coming"
                      aspectClass="min-h-[420px] aspect-[9/16]"
                    />
                  </div>
                </GradientShell>
              </Reveal>

              <Reveal>
                <GradientShell
                  from="#a1dce5"
                  to="#faf7f2"
                  framed={false}
                  showPrototype={false}
                >
                  <div className="flex flex-col items-center justify-center gap-4 py-2 md:flex-row md:gap-5">
                    {[
                      {
                        src: "/assets/home/domis-home-screen.png",
                        alt: "Domis home",
                      },
                      {
                        src: "/assets/home/domis-tasks-found.png",
                        alt: "Tasks found",
                      },
                      {
                        src: "/assets/home/domis-task-detail.png",
                        alt: "Task detail",
                      },
                    ].map((phone) => (
                      <div
                        key={phone.src}
                        className="w-full max-w-[260px] overflow-hidden rounded-[30px] border border-black/[0.05] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                      >
                        <LightboxImage
                          src={phone.src}
                          alt={phone.alt}
                          className="block h-auto w-full object-cover"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                </GradientShell>
              </Reveal>

              <section className={cn(prose, "flex flex-col gap-2")}>
                <Reveal>
                  <h2 className="df-h2">Personalization</h2>
                </Reveal>
                <Reveal delay={0.04}>
                  <div className="flex flex-col gap-4">
                    <p className="df-body">
                      Maintenance apps feel generic. Generic means low attachment — and
                      low engagement.
                    </p>
                    <p className="df-body">
                      AI image translation generates a home identity from a real input —
                      an avatar that recurs quietly so the app reads as theirs.
                    </p>
                    <p className="df-body">
                      The line was delight versus gimmick. Keep it earned, small, and
                      consistent.
                    </p>
                  </div>
                </Reveal>
              </section>

              <Reveal>
                <GradientShell from="#bdb2ff" to="#faf7f2">
                  <div className="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 md:gap-6 md:p-4">
                    <PersonalizationShowcase />
                    <MediaPlaceholder
                      label="Generated home gallery — coming"
                      aspectClass="min-h-[420px] aspect-[9/16]"
                    />
                  </div>
                </GradientShell>
              </Reveal>

              <section className={cn(prose, "flex flex-col gap-6")}>
                <Reveal>
                  <h2 className="df-h2">What I kept hearing</h2>
                </Reveal>
                <Reveal delay={0.04}>
                  <div className="flex flex-col gap-8">
                    <Quote cite="Design principle">
                      Extracted tasks are worthless if people don&apos;t believe them —
                      show the source, show severity, stay editable.
                    </Quote>
                    <Quote cite="Build method">
                      You can&apos;t judge trust, latency, or a failure state from a
                      static mockup. Build it on-device.
                    </Quote>
                  </div>
                </Reveal>
              </section>

              <section className={cn(prose, "flex flex-col gap-2")}>
                <Reveal>
                  <h2 className="df-h2">What&apos;s next</h2>
                </Reveal>
                <Reveal delay={0.04}>
                  <p className="df-body">
                    Roadmap — not shipped. Each item still has a live design tension.
                  </p>
                </Reveal>
              </section>

              <Reveal>
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    {
                      title: "Proactive prep",
                      body: "Weather + location surfaces prep before damage.",
                      tension: "Proactive without noise.",
                    },
                    {
                      title: "Onboarding autofill",
                      body: "Home details from an address via Maps / APIs.",
                      tension: "Autofill vs. confirm; privacy.",
                    },
                    {
                      title: "Cross-platform system",
                      body: "Tokens so iOS and web share one language.",
                      tension: "Consistency plus velocity.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[20px] border border-[#e6e6e6] bg-white p-5 shadow-sm"
                    >
                      <span className="df-eyebrow">In progress</span>
                      <h3 className="df-card-title mt-2">{item.title}</h3>
                      <p className="df-card-body mt-2">{item.body}</p>
                      <p className="df-caption mt-2 text-[#a1a1aa]">{item.tension}</p>
                      <div className="mt-4">
                        <MediaPlaceholder
                          label="Mock coming"
                          aspectClass="aspect-[16/10]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <section className={cn(prose, "flex flex-col gap-2")}>
                <Reveal>
                  <h2 className="df-h2">Final thoughts</h2>
                </Reveal>
                <Reveal delay={0.04}>
                  <div className="flex flex-col gap-4">
                    <p className="df-body">
                      Domis reset how I think about AI in consumer products. The hard part
                      was never the model — it was the trust layer around it.
                    </p>
                    <p className="df-body">
                      How much to automate, how much control to leave, how to show the
                      seams so people believe a result instead of second-guessing it.
                    </p>
                    <p className="df-body">
                      Features that worked shared a shape: AI does the tedious 80% and
                      hands over a confident, editable draft for the last 20%.
                    </p>
                    <p className="df-final">
                      Good design isn&apos;t just making things look better. It&apos;s
                      making the model&apos;s behavior feel trustworthy.
                    </p>
                  </div>
                </Reveal>
              </section>

              <Reveal>
                <a
                  href={APP_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="df-cta inline-flex items-center gap-2 rounded-full bg-[#18181b] px-6 py-3 text-[#fafafa] shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]/40"
                >
                  Download on the App Store
                </a>
              </Reveal>

              <Reveal>
                <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                  <MediaPlaceholder
                    label="Before / after — coming"
                    aspectClass="aspect-[16/10] min-h-[240px]"
                  />
                  <MediaPlaceholder
                    label="Prototype recording — coming"
                    aspectClass="aspect-[16/10] min-h-[240px]"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </LightboxProvider>
      <CaseStudyPill projectSlug="domis" />
      <StickyNotes page="domis" />
    </>
  );
}

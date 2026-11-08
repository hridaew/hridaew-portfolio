"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CopyEmailPill } from "@/components/shared/CopyEmailPill";
import { HeroCardExpandedBody } from "@/components/home/HeroCardExpandedBody";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { HomeProjectCard } from "@/components/home/WorkSection";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { homepageProjects } from "@/data/homepage-projects";
import { CV_HREF, LINKEDIN_HREF } from "@/lib/site-identity";
import { cn } from "@/lib/utils";
import { STATIONS, type Station } from "./stations";

type Props = {
  ready: boolean;
  active: string | null;
  showTitle: boolean;
  hovered?: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  /** Opens the case study with the camera move into the room; without it the button is a plain link. */
  onOpen?: (id: string) => void;
};

/** The room that is also About: the bio card lives here. */
const ABOUT_ID = "taste";

/**
 * visionOS-style chrome, kept to the minimum: a name in the corner, one glass ornament for navigation,
 * and a glass window for whatever the camera is looking at. Set in Geist.
 */
const geist = "font-[family-name:var(--font-geist)]";
const glass =
  "bg-[rgba(255,255,255,0.62)] backdrop-blur-[40px] backdrop-saturate-[1.7] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_0_0_1px_rgba(255,255,255,0.4),0_24px_60px_-24px_rgba(40,36,30,0.35)]";
const press = "transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.97]";
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50";

export function EsperInterface({ ready, active, showTitle, hovered, onSelect, onBack, onOpen }: Props) {
  const { openSheet } = useSheetNav();
  const station = STATIONS.find((s) => s.id === active) ?? null;
  // The last place stays on the card while it fades out.
  const [shown, setShown] = useState(station);
  if (station && station !== shown) setShown(station);
  const about = shown?.id === ABOUT_ID;

  return (
    <div
      className={cn(
        // A plain layer over the canvas: no opacity and no fixed/z-index layer of its own. Either one stops the glass
        // inside from blurring the room behind it (Chrome), so each piece fades itself instead.
        "pointer-events-none absolute inset-0 text-[#1d1d1f] antialiased",
        geist,
        !ready && "invisible",
      )}
    >
      {/* Opening credit, lower left */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#ece9e4]/70 to-transparent transition-opacity duration-1000",
          showTitle ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden={!showTitle}
        className={cn(
          "absolute bottom-28 left-6 transition-[opacity,transform] duration-1000 ease-out md:bottom-32 md:left-10",
          showTitle ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        )}
      >
        <h1 className="text-[clamp(34px,4vw,48px)] font-semibold leading-none tracking-[-0.035em]">Hridae Walia</h1>
        <p className="mt-3 max-w-[34ch] text-[16px] leading-[1.45] text-black/75">
          Product designer, designing for interaction models that barely exist yet.
        </p>
      </div>

      {/* Name */}
      <div
        className={cn(
          "absolute left-6 top-6 text-[14px] leading-tight tracking-[-0.01em] transition-opacity duration-700 md:left-8 md:top-7",
          showTitle || !ready ? "opacity-0" : "opacity-100",
        )}
      >
        <p>
          <span className="font-semibold">Hridae Walia</span>
          <span className="ml-2 text-black/60">Product designer</span>
        </p>
        <p className="mt-2 max-w-[min(400px,calc(100vw-48px))] text-[13px] leading-[1.5] text-black/60">
          I&rsquo;m a Product Designer obsessed with making, and I have 6 years of experience designing for interaction
          models that barely exist yet. I focus on the user and learn by making, whether on the canvas, in code, or the
          physical world.
        </p>
        {/* The same strip as the home page's bio card. */}
        <div className="pointer-events-auto mt-3 flex items-center gap-4">
          <CopyEmailPill />
          {[
            { href: CV_HREF, label: "CV" },
            { href: LINKEDIN_HREF, label: "in" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("flex size-8 items-center justify-center rounded-2xl bg-[#1c1c1c]/[0.045] transition-colors hover:bg-[#1c1c1c]/[0.08]", focusRing)}
            >
              <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold" style={{ color: "rgba(28,28,28,0.8)", mixBlendMode: "luminosity" }}>
                {l.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* The one ornament: places in the room, About, and the light */}
      <nav aria-label="Work" className="pointer-events-auto absolute inset-x-0 bottom-5 flex justify-center px-4 md:bottom-7">
        <div className={cn("scrollbar-hide flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1.5 transition-opacity duration-700 ease-out", ready ? "opacity-100" : "opacity-0", glass)}>
          {STATIONS.map((s) => {
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => (isActive ? onBack() : onSelect(s.id))}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-[13.5px] font-medium tracking-[-0.01em]",
                  press,
                  isActive
                    ? "bg-black/[0.22] text-[#1d1d1f] "
                    : hovered === s.id
                      ? "bg-black/[0.1] text-[#1d1d1f]"
                      : "text-black/75 hover:bg-black/[0.1] hover:text-[#1d1d1f]",
                  focusRing,
                )}
              >
                {s.title}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Window */}
      <section
        aria-label={shown ? shown.title : undefined}
        aria-live="polite"
        className={cn(
          "pointer-events-auto absolute inset-x-4 bottom-24 flex max-h-[56vh] flex-col md:inset-x-auto md:bottom-auto md:right-8 md:top-1/2 md:max-h-[calc(100vh-200px)] md:-translate-y-1/2",
          about ? "md:w-[min(600px,calc(100vw-64px))]" : "md:w-[min(500px,calc(100vw-64px))]",
          !station && "pointer-events-none",
        )}
      >
        {/* The glass fades and settles itself (see the wrapper note above). */}
        <div
          className={cn(
            "esper-liquid flex min-h-0 flex-col rounded-[32px] transition-[opacity,scale] duration-300 ease-out",
            station ? "scale-100 opacity-100" : "scale-[0.97] opacity-0",
          )}
        >
        <div className={cn("scrollbar-hide min-h-0 overflow-y-auto overflow-x-hidden rounded-[32px] px-7 pb-7 pt-6", about && "p-8")}>
          {shown && about && <AboutCard onClose={onBack} />}
          {shown && !about && (
            <div key={shown.id} className="esper-dossier-in">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.03em]">{shown.title}</h2>
                <CloseButton onClick={onBack} />
              </div>
              <ProjectMedia station={shown} onOpen={onOpen} />
              {(shown.role || shown.period) && (
                <p className={cn("text-[14px] leading-snug", shown.images ? "mt-4" : "mt-1.5")}>
                  {shown.role && <span className="font-medium text-black/90">{shown.role}</span>}
                  {shown.period && <span className="block text-black/60">{shown.period}</span>}
                </p>
              )}
              <p className="mt-4 text-[15px] leading-[1.55] tracking-[-0.005em] text-black/90">{shown.summary}</p>
              {shown.note && <p className="mt-3 text-[13.5px] leading-[1.5] text-black/60">{shown.note}</p>}
              {shown.links && (
                <ul className="-mx-3 mt-4 flex flex-col">
                  {shown.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                          if (openSheet(l.href)) e.preventDefault();
                        }}
                        className={cn("group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 hover:bg-black/[0.08]", press, focusRing)}>
                        <span>
                          <span className="block text-[14.5px] font-medium">{l.title}</span>
                          <span className="block text-[13px] text-black/60">{l.line}</span>
                        </span>
                        <ArrowIcon />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {shown.href && (
                <Link
                  href={shown.href}
                  onClick={(e) => {
                    if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey) return;
                    e.preventDefault();
                    onOpen(shown.id);
                  }}
                  className={cn("mt-6 inline-flex items-center rounded-full bg-[#1d1d1f] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-black/80", press, focusRing)}
                >
                  Read the case study
                </Link>
              )}
            </div>
          )}
        </div>
        </div>
      </section>
    </div>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={cn("-mr-2 grid size-8 shrink-0 place-items-center rounded-full bg-black/[0.08] text-black/85 hover:bg-black/[0.16] hover:text-[#1d1d1f]", press, focusRing)}
    >
      <CloseIcon />
    </button>
  );
}

/**
 * The home page's own project row: the same Embla carousel and the same three cards. A tap on a card takes the
 * camera into the case study (as the button does) instead of jumping straight to the page.
 */
function ProjectMedia({ station, onOpen }: { station: Station; onOpen?: (id: string) => void }) {
  const project = homepageProjects.find((p) => p.slug === station.id);
  const tap = useRef<{ x: number; y: number } | null>(null);
  let slides: ReactNode[] = [];
  if (project) {
    slides = ([0, 1, 2] as const).map((i) => <HomeProjectCard key={i} project={project} index={i} hideCaption />);
  } else if (station.images) {
    slides = station.images.map((img) => (
      <div key={img.src} className="home-work-card-frame relative overflow-clip rounded-2xl bg-black/[0.04]">
        <Image src={img.src} alt={img.alt} fill sizes="420px" draggable={false} className="pointer-events-none select-none object-cover" />
      </div>
    ));
  }
  if (!slides.length) return null;
  return (
    <div
      className="-mx-7 mt-5"
      style={{ ["--home-work-card-max" as string]: "min(420px, calc(100vw - 88px))" }}
      onPointerDownCapture={(e) => (tap.current = { x: e.clientX, y: e.clientY })}
      onPointerUpCapture={(e) => {
        const s = tap.current;
        tap.current = null;
        if (!project) return;
        e.stopPropagation();
        if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) <= 14 && station.href && onOpen) onOpen(station.id);
      }}
    >
      <ProjectCarousel className="scrollbar-hide overflow-hidden px-7" trackEndPadding="inline" autoplayDelayMs={4500}>
        {slides.map((s, i) => (
          <div key={i} className="flex-[0_0_auto]">
            {s}
          </div>
        ))}
      </ProjectCarousel>
    </div>
  );
}

/** Off hours is also About: the home page's bio card, larger, in the glass of the room's window. */
function AboutCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="esper-dossier-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h2
            className="font-[family-name:var(--font-display)] text-[24px] font-bold leading-normal"
            style={{ color: "rgba(28,28,28,0.8)", mixBlendMode: "luminosity" }}
          >
            Hridae Walia
          </h2>
          <p className="text-base font-semibold leading-normal" style={{ color: "rgba(28,28,28,0.55)", mixBlendMode: "luminosity" }}>
            Product Designer
          </p>
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <div className="mt-5 mb-8 flex items-center gap-4">
        <CopyEmailPill />
        {[
          { href: CV_HREF, label: "CV" },
          { href: LINKEDIN_HREF, label: "in" },
        ].map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("flex size-8 items-center justify-center rounded-2xl bg-[#1c1c1c]/[0.045] transition-colors hover:bg-[#1c1c1c]/[0.08]", focusRing)}
          >
            <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold" style={{ color: "rgba(28,28,28,0.8)", mixBlendMode: "luminosity" }}>
              {l.label}
            </span>
          </a>
        ))}
      </div>
      <HeroCardExpandedBody />
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden className="shrink-0 text-black/45 transition-colors group-hover:text-[#1d1d1f]">
      <path d="M4 10L10 4M5 4h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

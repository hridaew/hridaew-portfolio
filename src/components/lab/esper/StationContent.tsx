"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { HeroCardExpandedBody } from "@/components/home/HeroCardExpandedBody";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { HomeProjectCard } from "@/components/home/WorkSection";
import { CopyEmailPill } from "@/components/shared/CopyEmailPill";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { homepageProjects } from "@/data/homepage-projects";
import { CV_HREF, LINKEDIN_HREF } from "@/lib/site-identity";
import { cn } from "@/lib/utils";
import { press, focusRing } from "./chrome";
import type { Station } from "./stations";

export const BIO =
  "I’m a Product Designer obsessed with making, and I have 6 years of experience designing for novel interaction models. I focus on the user and learn by making, whether on the canvas, in code, or the physical world.";

/** The same strip as the home page's bio card: CV, LinkedIn, and the email that copies itself. */
export function IntroLinks({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
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
          <span className="esper-chip-label font-[family-name:var(--font-geist-mono)] text-xs font-extrabold" style={{ color: "rgba(28,28,28,0.8)", mixBlendMode: "luminosity" }}>
            {l.label}
          </span>
        </a>
      ))}
      <CopyEmailPill />
    </div>
  );
}

/**
 * What a place in the room says about itself, shared by the desktop window (EsperInterface) and the phone's card
 * sheet (PhoneDeck): its pictures, role, summary, links and the way into the case study. Laid out for a container
 * with `px-5` (`md:px-7`) padding: the picture row bleeds to its edges.
 */
export function StationDetails({
  station,
  onOpen,
  className,
  phone,
}: {
  station: Station;
  onOpen?: (id: string) => void;
  className?: string;
  /** The phone's sheet: the role is already on the card above, and the sheet keeps the way in at its foot. */
  phone?: boolean;
}) {
  const { openSheet } = useSheetNav();
  const role = phone ? undefined : station.role;
  return (
    <div className={className}>
      <ProjectMedia station={station} onOpen={onOpen} fill={phone} />
      {(role || station.period) && (
        <p className={cn("type-body-medium", station.images ? "mt-4" : "mt-1.5")}>
          {role && <span className="font-medium text-black/90">{role}</span>}
          {station.period && <span className="block font-normal text-black/60">{station.period}</span>}
        </p>
      )}
      {station.summary && <p className="site-body mt-4 text-black/90">{station.summary}</p>}
      {station.note && <p className="type-caption mt-3 text-black/60">{station.note}</p>}
      {station.links && (
        <ul className="-mx-3 mt-4 flex flex-col">
          {station.links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                  if (openSheet(l.href)) e.preventDefault();
                }}
                className={cn("group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 hover:bg-black/[0.08]", press, focusRing)}
              >
                <span>
                  <span className="type-headline block">{l.title}</span>
                  <span className="type-caption mt-0.5 block text-black/60">{l.line}</span>
                </span>
                <ArrowIcon />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!phone && <CaseStudyButton station={station} onOpen={onOpen} className="mt-6" />}
    </div>
  );
}

/** The way into a place's case study (opened over the room when it can be; a plain link otherwise). */
export function CaseStudyButton({ station, onOpen, className }: { station: Station; onOpen?: (id: string) => void; className?: string }) {
  if (!station.href) return null;
  return (
    <Link
      href={station.href}
      onClick={(e) => {
        if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        onOpen(station.id);
      }}
      className={cn("type-body-medium inline-flex items-center justify-center rounded-full bg-[#1d1d1f] px-5 py-2.5 font-semibold text-white hover:bg-black/80", press, focusRing, className)}
    >
      Read the case study
    </Link>
  );
}

/**
 * The home page's own project row: the same Embla carousel and the same three cards. A tap on a card opens the case
 * study (as the button does) instead of jumping straight to the page.
 */
export function ProjectMedia({ station, onOpen, fill }: { station: Station; onOpen?: (id: string) => void; fill?: boolean }) {
  const project = homepageProjects.find((p) => p.slug === station.id);
  const tap = useRef<{ x: number; y: number } | null>(null);
  let slides: ReactNode[] = [];
  if (project) {
    slides = ([0, 1, 2] as const).map((i) => <HomeProjectCard key={i} project={project} index={i} hideCaption />);
  } else if (station.images) {
    slides = station.images.map((img) => (
      <div key={img.src} className="home-work-card-frame relative overflow-clip rounded-2xl bg-black/[0.04]">
        {img.video ? (
          <video src={img.video} poster={img.src} aria-label={img.alt} autoPlay muted loop playsInline preload="metadata" className="pointer-events-none absolute inset-0 size-full select-none object-cover" />
        ) : (
          <Image src={img.src} alt={img.alt} fill sizes="420px" draggable={false} className="pointer-events-none select-none object-cover" />
        )}
      </div>
    ));
  }
  if (!slides.length) return null;
  return (
    <div
      className="-mx-5 mt-5 md:-mx-7"
      // The phone's sheet: each picture spans the sheet's text column exactly (the screen less 8 + 20 a side).
      style={{ ["--home-work-card-max" as string]: fill ? "calc(100vw - 56px)" : "min(420px, calc(100vw - 64px))" }}
      onPointerDownCapture={(e) => (tap.current = { x: e.clientX, y: e.clientY })}
      onPointerUpCapture={(e) => {
        const s = tap.current;
        tap.current = null;
        if (!project) return;
        e.stopPropagation();
        if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) <= 14 && station.href && onOpen) onOpen(station.id);
      }}
    >
      <ProjectCarousel className="scrollbar-hide overflow-hidden px-5 md:px-7" trackEndPadding="inline" autoplayDelayMs={4500}>
        {slides.map((s, i) => (
          <div key={i} className="flex-[0_0_auto]">
            {s}
          </div>
        ))}
      </ProjectCarousel>
    </div>
  );
}

/**
 * About: the home page's bio card, its story only (the name and links are shown elsewhere): bio, experience,
 * education, the top threes. The body opens with a divider meant to sit under the name; a title row stands in for it.
 */
export function AboutBody({ className }: { className?: string }) {
  return (
    <div className={cn("[&>div>div:first-child]:hidden [&>div>div:nth-child(2)]:pt-0", className)}>
      <HeroCardExpandedBody />
    </div>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={cn("-mr-2 grid size-8 shrink-0 place-items-center rounded-full bg-black/[0.08] text-black/85 hover:bg-black/[0.16] hover:text-[#1d1d1f]", press, focusRing)}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </button>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden className="shrink-0 text-black/45 transition-colors group-hover:text-[#1d1d1f]">
      <path d="M4 10L10 4M5 4h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { STATIONS, type Station } from "./stations";

type Props = {
  ready: boolean;
  active: string | null;
  lightsOn: boolean;
  showTitle: boolean;
  hovered?: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  onLights: (on: boolean) => void;
};

const ABOUT: Station = {
  id: "about",
  title: "About",
  summary:
    "The son of an engineer and an artist, I design things that work and get a response out of people, whether that’s a feeling or simply a task done. Six years of designing for interaction models that barely exist yet.",
  note: "Master of HCI + Design, University of Washington. BFA Interaction Design, California College of the Arts.",
};

const CONTACT = [
  { label: "Email", href: "mailto:hridaew@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/hridae" },
  { label: "CV", href: "https://drive.google.com/file/d/1f11tgSCoo4GY0DuVhdmOVG17lPRpGb3Z/view?usp=sharing" },
];

/**
 * visionOS-style chrome, kept to the minimum: a name in the corner, one glass ornament for navigation,
 * and a glass window for whatever the camera is looking at. Set in Geist.
 */
const geist = "font-[family-name:var(--font-geist)]";
const glass =
  "bg-[rgba(110,110,115,0.26)] backdrop-blur-[40px] backdrop-saturate-[1.7] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.08),0_24px_60px_-20px_rgba(0,0,0,0.6)]";
const press = "transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.97]";
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

export function EsperInterface({ ready, active, lightsOn, showTitle, hovered, onSelect, onBack, onLights }: Props) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const station = aboutOpen ? ABOUT : (STATIONS.find((s) => s.id === active) ?? null);
  const [shown, setShown] = useState(station);
  useEffect(() => {
    if (station) setShown(station);
  }, [station]);
  // Choosing a place in the room closes About.
  useEffect(() => {
    if (active) setAboutOpen(false);
  }, [active]);

  const close = () => {
    if (aboutOpen) setAboutOpen(false);
    else onBack();
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-10 text-white antialiased transition-opacity duration-700 ease-out",
        geist,
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Opening credit, lower left */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-1000",
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
        <p className="mt-3 max-w-[34ch] text-[16px] leading-[1.45] text-white/70">
          Product designer, designing for interaction models that barely exist yet.
        </p>
      </div>

      {/* Name */}
      <p
        className={cn(
          "absolute left-6 top-6 text-[14px] leading-tight tracking-[-0.01em] transition-opacity duration-700 md:left-8 md:top-7",
          showTitle ? "opacity-0" : "opacity-100",
        )}
      >
        <span className="font-semibold">Hridae Walia</span>
        <span className="ml-2 text-white/55">Product designer</span>
      </p>

      {/* The one ornament: places in the room, About, and the light */}
      <nav aria-label="Work" className="pointer-events-auto absolute inset-x-0 bottom-5 flex justify-center px-4 md:bottom-7">
        <div className={cn("scrollbar-hide flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1.5", glass)}>
          {STATIONS.map((s) => {
            const isActive = s.id === active && !aboutOpen;
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
                    ? "bg-white/[0.22] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                    : hovered === s.id
                      ? "bg-white/[0.1] text-white"
                      : "text-white/70 hover:bg-white/[0.1] hover:text-white",
                  focusRing,
                )}
              >
                {s.title}
              </button>
            );
          })}
          <span aria-hidden className="mx-1.5 h-5 w-px shrink-0 bg-white/15" />
          <button
            type="button"
            onClick={() => setAboutOpen((o) => !o)}
            aria-pressed={aboutOpen}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-[13.5px] font-medium tracking-[-0.01em]",
              press,
              aboutOpen ? "bg-white/[0.22] text-white" : "text-white/70 hover:bg-white/[0.1] hover:text-white",
              focusRing,
            )}
          >
            About
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={lightsOn}
            aria-label="Ceiling lights"
            onClick={() => onLights(!lightsOn)}
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full",
              press,
              lightsOn ? "bg-white text-black" : "text-white/70 hover:bg-white/[0.1] hover:text-white",
              focusRing,
            )}
          >
            <BulbIcon on={lightsOn} />
          </button>
        </div>
      </nav>

      {/* Window */}
      <section
        aria-label={shown ? shown.title : undefined}
        aria-live="polite"
        className={cn(
          "pointer-events-auto absolute inset-x-4 bottom-24 flex max-h-[56vh] flex-col md:inset-x-auto md:bottom-auto md:right-8 md:top-1/2 md:max-h-[calc(100vh-220px)] md:w-[360px] md:-translate-y-1/2",
          "transition-[opacity,scale] duration-300 ease-out",
          station ? "scale-100 opacity-100" : "pointer-events-none scale-[0.97] opacity-0",
        )}
      >
        <div className={cn("scrollbar-hide min-h-0 overflow-y-auto rounded-[32px] px-7 pb-7 pt-6", glass)}>
          {shown && (
            <div key={shown.id} className="esper-dossier-in">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.03em]">{shown.title}</h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className={cn("-mr-2 grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white/80 hover:bg-white/[0.16] hover:text-white", press, focusRing)}
                >
                  <CloseIcon />
                </button>
              </div>
              {(shown.role || shown.period) && (
                <p className="mt-1.5 text-[14px] leading-snug">
                  {shown.role && <span className="font-medium text-white/90">{shown.role}</span>}
                  {shown.period && <span className="block text-white/55">{shown.period}</span>}
                </p>
              )}
              <p className="mt-4 text-[15px] leading-[1.55] tracking-[-0.005em] text-white/85">{shown.summary}</p>
              {shown.note && <p className="mt-3 text-[13.5px] leading-[1.5] text-white/55">{shown.note}</p>}
              {shown.links && (
                <ul className="-mx-3 mt-4 flex flex-col">
                  {shown.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={cn("group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/[0.08]", press, focusRing)}>
                        <span>
                          <span className="block text-[14.5px] font-medium">{l.title}</span>
                          <span className="block text-[13px] text-white/55">{l.line}</span>
                        </span>
                        <ArrowIcon />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {shown.id === "about" && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {CONTACT.map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className={cn("rounded-full bg-white/[0.1] px-4 py-2 text-[13.5px] font-medium hover:bg-white/[0.18]", press, focusRing)}
                    >
                      {c.label}
                    </a>
                  ))}
                </div>
              )}
              {shown.href && (
                <Link
                  href={shown.href}
                  className={cn("mt-6 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-black hover:bg-white/90", press, focusRing)}
                >
                  Read the case study
                </Link>
              )}
            </div>
          )}
        </div>
        <span aria-hidden className="mx-auto mt-3 hidden h-[5px] w-14 rounded-full bg-white/35 md:block" />
      </section>
    </div>
  );
}

function BulbIcon({ on }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 21h4" />
      <path
        d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z"
        fill={on ? "currentColor" : "none"}
        fillOpacity={on ? 0.2 : 0}
      />
    </svg>
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
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden className="shrink-0 text-white/40 transition-colors group-hover:text-white">
      <path d="M4 10L10 4M5 4h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

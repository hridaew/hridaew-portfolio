"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { STATIONS } from "./stations";

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

/**
 * visionOS-style chrome over the room: frosted glass windows and ornaments, capsule controls,
 * system type with vibrancy-like secondary text, and hover states that lift and brighten.
 */
const sf = "[font-family:-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text',system-ui,'Segoe_UI_Variable_Text','Segoe_UI',sans-serif]";
// Glass: a light, saturated blur with a bright top edge and a soft drop shadow, as in visionOS windows.
const glass =
  "bg-[rgba(128,128,128,0.28)] backdrop-blur-[40px] backdrop-saturate-[1.8] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_0_0_1px_rgba(255,255,255,0.10),0_24px_70px_-18px_rgba(0,0,0,0.55)]";
const hoverLift = "transition-[background-color,transform] duration-200 ease-out hover:bg-white/[0.14] active:scale-[0.97]";
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";
const secondary = "text-white/[0.62]";

export function EsperInterface({ ready, active, lightsOn, showTitle, hovered, onSelect, onBack, onLights }: Props) {
  const station = STATIONS.find((s) => s.id === active) ?? null;
  const [shown, setShown] = useState(station);
  useEffect(() => {
    if (station) setShown(station);
  }, [station]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-10 text-white antialiased transition-opacity duration-700 ease-out",
        sf,
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      {/* Title card */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[70%] bg-gradient-to-r from-black/70 via-black/35 to-transparent transition-opacity duration-700",
          showTitle ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden={!showTitle}
        className={cn(
          "absolute left-6 top-1/2 max-w-[620px] -translate-y-1/2 transition-[opacity,transform] duration-700 ease-out md:left-14",
          showTitle ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0",
        )}
      >
        <h1 className="text-[clamp(46px,6.6vw,92px)] font-bold leading-[0.98] tracking-[-0.03em] [text-shadow:0_2px_30px_rgba(0,0,0,0.45)]">
          Hridae Walia
        </h1>
        <p className="mt-4 max-w-[30ch] text-[clamp(17px,1.55vw,21px)] font-medium leading-[1.4] text-white/80">
          Product designer, designing for interaction models that barely exist yet.
        </p>
      </div>

      {/* Identity ornament */}
      <div
        className={cn(
          "absolute left-5 top-5 rounded-full px-5 py-2.5 transition-opacity duration-500 md:left-7 md:top-7",
          glass,
          showTitle ? "opacity-0" : "opacity-100",
        )}
      >
        <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">
          Hridae Walia <span className={cn("font-normal", secondary)}>Product designer</span>
        </p>
      </div>

      {/* Contact + lights ornament */}
      <div className={cn("pointer-events-auto absolute right-5 top-5 flex items-center gap-1 rounded-full p-1.5 md:right-7 md:top-7", glass)}>
        <nav aria-label="Contact" className="hidden items-center sm:flex">
          {[
            { label: "Email", href: "mailto:hridaew@gmail.com" },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/hridae" },
            { label: "CV", href: "https://drive.google.com/file/d/1f11tgSCoo4GY0DuVhdmOVG17lPRpGb3Z/view?usp=sharing" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={cn("rounded-full px-3.5 py-1.5 text-[14px] font-medium", hoverLift, focusRing)}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          role="switch"
          aria-checked={lightsOn}
          aria-label="Ceiling lights"
          onClick={() => onLights(!lightsOn)}
          className={cn(
            "grid size-9 place-items-center rounded-full",
            lightsOn ? "bg-white text-black hover:bg-white/90" : hoverLift,
            "transition-[background-color,color,transform] duration-200 active:scale-[0.94]",
            focusRing,
          )}
        >
          <BulbIcon on={lightsOn} />
        </button>
      </div>

      {/* Chapters: a glass tab-bar ornament */}
      <nav aria-label="Work" className="pointer-events-auto absolute inset-x-0 bottom-5 flex justify-center px-4 md:bottom-7">
        <ul className={cn("scrollbar-hide flex max-w-full gap-0.5 overflow-x-auto rounded-full p-1.5", glass)}>
          {STATIONS.map((s) => {
            const isActive = s.id === active;
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => (isActive ? onBack() : onSelect(s.id))}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-[14px] font-medium tracking-[-0.005em] md:px-[18px]",
                    "transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.97]",
                    isActive
                      ? "bg-white/[0.24] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                      : hovered === s.id
                        ? "bg-white/[0.12] text-white"
                        : "text-white/[0.78] hover:bg-white/[0.12] hover:text-white",
                    focusRing,
                  )}
                >
                  {s.title}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Window: what the camera is looking at */}
      <section
        aria-label={shown ? shown.title : undefined}
        aria-live="polite"
        className={cn(
          "pointer-events-auto absolute inset-x-4 bottom-24 flex max-h-[56vh] flex-col md:inset-x-auto md:bottom-auto md:right-8 md:top-24 md:max-h-[calc(100vh-200px)] md:w-[380px]",
          "transition-[opacity,transform] duration-300 ease-out",
          station ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-[0.98] opacity-0",
        )}
      >
        <div className={cn("scrollbar-hide min-h-0 overflow-y-auto rounded-[34px] p-7", glass)}>
          {shown && (
            <div key={shown.id} className="esper-dossier-in">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[clamp(28px,2.9vw,34px)] font-bold leading-[1.05] tracking-[-0.02em]">{shown.title}</h2>
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Back to the room"
                  className={cn("-mr-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.08]", hoverLift, focusRing)}
                >
                  <CloseIcon />
                </button>
              </div>
              {(shown.role || shown.period) && (
                <p className="mt-2 text-[15px] leading-snug">
                  {shown.role && <span className="block font-medium text-white/90">{shown.role}</span>}
                  {shown.period && <span className={cn("block", secondary)}>{shown.period}</span>}
                </p>
              )}
              <p className="mt-4 text-[15px] leading-[1.55] text-white/[0.86] md:text-[16px]">{shown.summary}</p>
              {shown.note && <p className={cn("mt-3 text-[14px] leading-[1.5]", secondary)}>{shown.note}</p>}
              {shown.links && (
                <ul className="-mx-3 mt-4 flex flex-col gap-0.5">
                  {shown.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={cn("group flex items-center justify-between gap-3 rounded-[18px] px-3 py-2.5", hoverLift, focusRing)}>
                        <span>
                          <span className="block text-[15px] font-semibold">{l.title}</span>
                          <span className={cn("block text-[13px]", secondary)}>{l.line}</span>
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
                  className={cn(
                    "mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-black",
                    "transition-[background-color,transform] duration-200 hover:bg-white/90 active:scale-[0.98]",
                    focusRing,
                  )}
                >
                  Read the case study
                </Link>
              )}
            </div>
          )}
        </div>
        {/* Window bar, as under a visionOS window */}
        <span aria-hidden className="mx-auto mt-3 hidden h-[6px] w-16 rounded-full bg-white/40 shadow-[0_1px_8px_rgba(0,0,0,0.3)] md:block" />
      </section>
    </div>
  );
}

function BulbIcon({ on }: { on: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 21h4" />
      <path
        d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z"
        fill={on ? "currentColor" : "none"}
        fillOpacity={on ? 0.25 : 0}
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0 text-white/50 transition-colors group-hover:text-white">
      <path d="M4 10L10 4M5 4h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

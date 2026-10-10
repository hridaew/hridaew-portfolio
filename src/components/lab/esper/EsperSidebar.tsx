"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type Station = {
  id: string;
  title: string;
  line: string;
  href?: string;
  children?: { title: string; href: string }[];
};

export const STATIONS: Station[] = [
  { id: "domis", title: "Domis", line: "Home maintenance, made approachable", href: "/domis" },
  { id: "virdio", title: "Virdio", line: "AR fitness without the hardware", href: "/virdio" },
  { id: "obscura", title: "OBSCURA", line: "An immersive photographic documentary", href: "/obscura" },
  { id: "memory-care", title: "Memory Care", line: "A multi-sensory station for dementia care", href: "/memory-care" },
  {
    id: "wafflings",
    title: "Wafflings",
    line: "Side projects and experiments",
    children: [
      { title: "Orca", href: "/waffling/orca" },
      { title: "Savor", href: "/waffling/savor" },
      { title: "Recorder", href: "/waffling/recorder" },
      { title: "Butter chicken", href: "/butter-chicken" },
    ],
  },
  { id: "taste", title: "Off hours", line: "Records, games and Arsenal" },
];

type Props = {
  active: string | null;
  lightsOn: boolean;
  onSelect: (id: string) => void;
  onBack: () => void;
  onLights: (on: boolean) => void;
};

export function EsperSidebar({ active, lightsOn, onSelect, onBack, onLights }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <aside
        aria-label="Hridae Walia — work"
        className={cn(
          "esper-panel pointer-events-auto fixed z-10 flex flex-col text-[#E6EDF2]",
          "font-[family-name:var(--font-dm-sans)]",
          // Desktop: inset glass column. Mobile: bottom sheet.
          "inset-x-3 bottom-3 max-h-[56vh] rounded-[20px] md:inset-x-auto md:bottom-4 md:left-4 md:top-4 md:max-h-none md:w-[340px]",
          "border border-white/[0.07] bg-[#0C1118]/[0.72] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl",
          "transition-[opacity,transform] duration-300 ease-out",
          open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-4 opacity-0",
        )}
      >
        <header className="flex items-start justify-between gap-4 px-6 pb-5 pt-6">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[30px] font-bold leading-[1.05] tracking-[-0.01em]">
              Hridae Walia
            </h1>
            <p className="mt-1 text-[15px] text-[#93A1AE]">Interaction, product and experience designer</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Hide panel"
            className="-mr-2 mt-1 grid size-9 shrink-0 place-items-center rounded-full text-[#93A1AE] transition-colors hover:bg-white/[0.06] hover:text-[#E6EDF2] focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#8FE3F0]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M9 2 4 7l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </header>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6">
          <p className="max-w-[34ch] text-[15px] leading-[1.6] text-[#C3CDD6]">
            I love making things that work and get a response out of people, whether it&rsquo;s a feeling or simply getting a task done. This is my
            room at 3am. Everything in it is something I made or something I love.
          </p>
          <p className="mt-3 flex gap-4 text-[14px]">
            <a className="text-[#E6EDF2] underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-[#8FE3F0]" href="mailto:hridaew@gmail.com">
              Email
            </a>
            <a
              className="text-[#E6EDF2] underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-[#8FE3F0]"
              href="https://www.linkedin.com/in/hridae"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </p>

          <nav aria-label="Projects" className="mt-7 pb-4">
            <ul className="flex flex-col">
              {STATIONS.map((s) => {
                const isActive = active === s.id;
                return (
                  <li key={s.id} className="relative">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-6 top-3 h-[calc(100%-1.5rem)] w-[2px] rounded-full bg-[#8FE3F0] shadow-[0_0_10px_rgba(143,227,240,0.8)] transition-opacity duration-200",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => onSelect(s.id)}
                      aria-current={isActive ? "true" : undefined}
                      className="group w-full rounded-lg py-3 text-left focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#8FE3F0]"
                    >
                      <span
                        className={cn(
                          "block font-[family-name:var(--font-display)] text-[21px] font-bold leading-tight transition-colors",
                          isActive ? "text-[#8FE3F0]" : "text-[#E6EDF2] group-hover:text-white",
                        )}
                      >
                        {s.title}
                      </span>
                      <span className="mt-0.5 block text-[14px] text-[#93A1AE]">{s.line}</span>
                    </button>
                    {isActive && (s.href || s.children) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-2 pb-3">
                        {s.href && (
                          <Link
                            href={s.href}
                            className="rounded-full bg-[#8FE3F0] px-4 py-1.5 text-[14px] font-medium text-[#071016] transition-transform active:scale-[0.97] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#8FE3F0]"
                          >
                            Open case study
                          </Link>
                        )}
                        {s.children?.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            className="text-[14px] text-[#E6EDF2] underline decoration-white/25 underline-offset-4 hover:decoration-[#8FE3F0]"
                          >
                            {c.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            disabled={!active}
            className="text-[14px] text-[#93A1AE] transition-colors enabled:hover:text-[#E6EDF2] disabled:opacity-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#8FE3F0]"
          >
            Back to the room
          </button>
          <LightSwitch on={lightsOn} onChange={onLights} />
        </footer>
      </aside>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto fixed left-4 top-4 z-10 rounded-full border border-white/[0.08] bg-[#0C1118]/70 px-4 py-2 font-[family-name:var(--font-display)] text-[15px] font-bold text-[#E6EDF2] backdrop-blur-xl transition-colors hover:bg-[#0C1118]/90 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#8FE3F0]"
        >
          Hridae Walia
        </button>
      )}
    </>
  );
}

/** A wall rocker switch: the one physical thing in the panel. */
function LightSwitch({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="group flex items-center gap-3 rounded-lg text-[14px] text-[#C3CDD6] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[#8FE3F0]"
    >
      <span>{on ? "Lights on" : "Lights off"}</span>
      <span className="relative h-9 w-[22px] rounded-[7px] bg-[#05080C] p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)]">
        <span
          className={cn(
            "absolute inset-x-[3px] h-[15px] rounded-[5px] transition-all duration-150 ease-out",
            on
              ? "top-[3px] bg-[#FF4FB8] shadow-[0_0_14px_3px_rgba(255,79,184,0.55)]"
              : "top-[18px] bg-[#2A333D] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]",
          )}
        />
      </span>
    </button>
  );
}

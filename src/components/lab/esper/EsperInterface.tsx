"use client";

import { useEffect, useState } from "react";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { cn } from "@/lib/utils";
import { glass, press, focusRing } from "./chrome";
import { GuestbookList, type GuestNote } from "./Guestbook";
import { PhoneDeck } from "./PhoneDeck";
import { useIsPhone } from "./useIsPhone";
import { AboutBody, BIO, CloseButton, IntroLinks, StationDetails } from "./StationContent";
import { BOARD, STATIONS } from "./stations";

type Props = {
  ready: boolean;
  active: string | null;
  hovered?: string;
  dark?: boolean;
  onSelect: (id: string) => void;
  onBack: () => void;
  onHover?: (id: string) => void;
  onToggleTheme?: () => void;
  /** Opens the case study with the camera move into the room; without it the button is a plain link. */
  onOpen?: (id: string) => void;
  guestbook: { notes: GuestNote[]; highlight: string | null; onDelete: (id: string) => void; onCompose: () => void };
  /** Phone: how much of the screen the card sheet covers (CSS px from the top and bottom), for the room's framing. */
  onInsets?: (top: number, bottom: number) => void;
};


/** The room that is also About: the bio card lives here. */
const ABOUT_ID = "taste";

/**
 * visionOS-style chrome, kept to the minimum: a name in the corner, one glass ornament for navigation,
 * and a glass window for whatever the camera is looking at. Set in Geist.
 */
const geist = "font-[family-name:var(--font-geist)]";

export function EsperInterface({ ready, active, hovered, dark = true, onSelect, onBack, onHover, onToggleTheme, onOpen, onInsets, guestbook }: Props) {
  const { prefetchSheet } = useSheetNav();
  const isPhone = useIsPhone();
  // Warm the case study (route and sheet content) as soon as a room is hovered or its card shows, so "Read the
  // case study" opens at once instead of waiting on the download.
  useEffect(() => {
    for (const id of [hovered, active]) {
      const st = id ? STATIONS.find((x) => x.id === id) : undefined;
      if (st?.href) prefetchSheet(st.href);
      for (const l of st?.links ?? []) prefetchSheet(l.href);
    }
  }, [hovered, active, prefetchSheet]);
  const station = STATIONS.find((s) => s.id === active) ?? (active === BOARD.id ? BOARD : null);
  // The last place stays on the card while it fades out.
  const [shown, setShown] = useState(station);
  if (station && station !== shown) setShown(station);
  const about = shown?.id === ABOUT_ID;

  const themeToggle = onToggleTheme && (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "pointer-events-auto absolute right-[max(16px,env(safe-area-inset-right))] top-[max(16px,env(safe-area-inset-top))] flex size-8 items-center justify-center rounded-2xl bg-[#1c1c1c]/[0.045] text-[#1d1d1f] opacity-40 transition-[opacity,background-color,transform] duration-300 hover:bg-[#1c1c1c]/[0.08] hover:opacity-95 focus-visible:opacity-100 active:scale-[0.96] md:right-8 md:top-7",
        !ready && "pointer-events-none opacity-0",
        focusRing,
      )}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );

  // A phone gets its own layout: the room above, a sheet of cards below (PhoneDeck).
  if (isPhone) {
    return (
      <div className={cn("pointer-events-none absolute inset-0 text-[#1d1d1f] antialiased", geist, !ready && "invisible")}>
        {themeToggle}
        <PhoneDeck ready={ready} active={active} onSelect={onSelect} onBack={onBack} onOpen={onOpen} onInsets={onInsets} guestbook={guestbook} />
      </div>
    );
  }

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
      {/* Name */}
      <div
        className={cn(
          "absolute left-6 top-6 transition-opacity duration-500 md:left-8 md:top-7",
          !ready && "opacity-0",
          // On a phone the card needs the height: the bio steps aside while a room is open.
          // On desktop, it dims back while a room is focused so the 3D vignette and dossier own the hierarchy, rising on hover.
          station && "max-md:pointer-events-none max-md:opacity-0 md:pointer-events-auto md:opacity-35 md:hover:opacity-100 md:focus-within:opacity-100",
        )}
      >
        <h1 className="site-chapter-heading">Hridae Walia</h1>
        <p className="site-body mt-2 max-w-[min(420px,calc(100vw-48px))] text-ink-secondary">{BIO}</p>
        <IntroLinks className="pointer-events-auto mt-3" />
      </div>

      {/* Subtle light/dark room toggle in the top right */}
      {themeToggle}

      {/* The one ornament: places in the room, About, and the light */}
      <nav aria-label="Work" className="pointer-events-auto absolute inset-x-0 bottom-[max(36px,env(safe-area-inset-bottom))] flex justify-center px-2 md:bottom-7 md:px-4">
        <div
          onPointerLeave={(e) => {
            if (e.pointerType !== "touch") onHover?.("");
          }}
          className={cn("esper-pill scrollbar-hide flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full p-1 min-[385px]:p-1.5 transition-opacity duration-700 ease-out", ready ? "opacity-100" : "opacity-0", glass)}
        >
          {STATIONS.map((s) => {
            // The guestbook is a corner of About.
            const isActive = s.id === active || (s.id === ABOUT_ID && active === BOARD.id);
            const isHovered = hovered === s.id || (s.id === ABOUT_ID && hovered === BOARD.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => (isActive ? onBack() : onSelect(s.id))}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "touch") onHover?.(s.id);
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType !== "touch") onHover?.("");
                }}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "type-body-medium shrink-0 rounded-full px-[7px] py-2 min-[385px]:px-[8px] min-[400px]:px-3 md:px-4",
                  press,
                  isActive
                    ? "bg-black/[0.22] text-[#1d1d1f] "
                    : isHovered
                      ? "bg-black/[0.1] text-[#1d1d1f]"
                      : "text-black/75 hover:bg-black/[0.1] hover:text-[#1d1d1f]",
                  focusRing,
                )}
              >
                {s.short ? (
                  <>
                    <span className="min-[400px]:hidden">{s.short}</span>
                    <span className="max-[399px]:hidden">{s.title}</span>
                  </>
                ) : (
                  s.title
                )}
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
          "pointer-events-auto absolute inset-x-3 bottom-[calc(max(36px,env(safe-area-inset-bottom))+54px)] flex max-h-[52dvh] flex-col md:inset-x-auto md:bottom-auto md:right-8 md:top-1/2 md:max-h-[calc(100vh-200px)] md:-translate-y-1/2",
          about ? "md:w-[min(656px,calc(100vw-64px))]" : "md:w-[min(500px,calc(100vw-64px))]",
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
        <div className={cn("scrollbar-hide min-h-0 overflow-y-auto overflow-x-hidden rounded-[32px] px-5 pb-6 pt-5 md:px-7 md:pb-7 md:pt-6")}>
          {shown && about && (
            <div className="esper-dossier-in">
              {/* Titled and closed like every other window. */}
              <div className="flex items-center justify-between gap-4">
                <h2 className="site-chapter-heading">About me</h2>
                <CloseButton onClick={onBack} />
              </div>
              <AboutBody className="mt-5" />
            </div>
          )}
          {shown && shown.id === BOARD.id && (
            <div key="guestbook" className="esper-dossier-in">
              <div className="flex items-center justify-between gap-4">
                <h2 className="site-chapter-heading">{BOARD.title}</h2>
                <CloseButton onClick={onBack} />
              </div>
              <GuestbookList {...guestbook} />
            </div>
          )}
          {shown && !about && shown.id !== BOARD.id && (
            <div key={shown.id} className="esper-dossier-in">
              <div className="flex items-center justify-between gap-4">
                <h2 className="site-chapter-heading">{shown.title}</h2>
                <CloseButton onClick={onBack} />
              </div>
              <StationDetails station={shown} onOpen={onOpen} />
            </div>
          )}
        </div>
        </div>
      </section>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2.5 12h2.2M19.3 12h2.2M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  );
}

"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { CHOOM, CHOOM_WAFFLINGS } from "@/lib/homeChoomCopy";
import { useChoomLingo } from "@/components/home/HomeChoomLingoContext";
import Link from "next/link";
import { homepageWafflings, type WafflingData } from "@/data/homepage-wafflings";
import { FigmaButterChickenWafflingCard } from "./FigmaButterChickenWafflingCard";
import { HOME_WAFFLINGS_EMBLA_VIEWPORT } from "./homeGrid";
import {
  HOME_WAFFLINGS_SECTION_ID,
  rememberHomeScrollForWafflingReturn,
} from "@/lib/scrollHomeWafflings";
import { ProjectCarousel } from "./ProjectCarousel";
import { usePageTransition } from "@/components/PageTransition";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { playClick } from "@/lib/audio";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function WafflingCard({
  waffling,
  choomIndex,
}: {
  waffling: WafflingData;
  choomIndex: number;
}) {
  const choom = useChoomLingo();
  const { transitionTo } = usePageTransition();
  const { prefetchSheet } = useSheetNav();
  const choomRow = CHOOM_WAFFLINGS[choomIndex];
  const displayTitle =
    choom && choomRow ? choomRow.title : waffling.title;
  const displayPreview =
    choom && choomRow ? choomRow.preview : waffling.previewText;

  const isClickable = !!waffling.href && !waffling.isPlaceholder && waffling.opacity === 1;

  const warmWaffling = () => {
    if (waffling.href) prefetchSheet(waffling.href);
  };

  const openWaffling = (e: React.MouseEvent) => {
    if (!waffling.href) return;
    e.preventDefault();
    rememberHomeScrollForWafflingReturn();
    playClick();
    transitionTo(waffling.href);
  };

  // Hooks are declared unconditionally so the call order is stable across renders,
  // regardless of which branch (tapered vs WIP placeholder) we ultimately render.
  // For tapered cards these refs/state are unused — the cost is negligible.
  const shellRef = useRef<HTMLDivElement>(null);
  const [wipHover, setWipHover] = useState(false);
  const [wipPct, setWipPct] = useState({ x: 50, y: 45 });

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = shellRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setWipPct({ x: clamp(x, 14, 86), y: clamp(y, 12, 88) });
  }, []);

  // Real wafflings (Butter Chicken, Recorder-Proto) go through the shared
  // skeuomorphic-rim card. Hover lift + tap-scale on the Link wrapper so both
  // cards animate identically.
  if (waffling.taperedRim) {
    const wafflingForFigma =
      choom && choomRow
        ? { ...waffling, title: displayTitle, previewText: displayPreview }
        : waffling;
    const card = <FigmaButterChickenWafflingCard waffling={wafflingForFigma} />;
    return isClickable ? (
      <Link
        href={waffling.href!}
        scroll={false}
        onPointerEnter={warmWaffling}
        onFocus={warmWaffling}
        onClick={openWaffling}
        className="block rounded-3xl text-left transition-transform duration-150 ease-out will-change-transform hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.4] active:scale-[0.97]"
      >
        {card}
      </Link>
    ) : (
      card
    );
  }

  // Live wafflings sit on raised paper; placeholders stay recessed and flat.
  const surface = waffling.isPlaceholder
    ? "bg-ink/[0.03]"
    : "bg-paper-raised border border-ink/[0.07]";

  // WIP cursor-tracking only fires for non-clickable cards (placeholders). On
  // clickable wafflings the overlay isn't rendered, so attaching the handlers
  // would just churn state on every pointermove.
  const wipHandlers = isClickable
    ? null
    : {
        onPointerEnter: () => setWipHover(true),
        onPointerLeave: () => setWipHover(false),
        onPointerMove,
      };

  const inner = (
    <div
      ref={shellRef}
      data-carousel-allow-select
      {...wipHandlers}
      className={`relative flex w-[176px] shrink-0 flex-col items-start gap-3 overflow-clip rounded-3xl pt-5 px-4 pb-4 ${surface} ${
        waffling.isPlaceholder ? "shadow-none" : "shadow-e1"
      } h-[272px] ${isClickable ? "cursor-pointer transition-transform duration-150 ease-out hover:-translate-y-[1px]" : ""}`}
      style={{ opacity: waffling.opacity }}
    >
      {/* Title */}
      <p
        className={`font-[family-name:var(--font-geist)] font-bold text-base leading-normal w-full ${
          waffling.isPlaceholder ? "text-ink-muted" : "text-ink"
        }`}
      >
        {displayTitle}
      </p>

      {/* Optional thumbnail */}
      {waffling.imageSrc && (
        <div className="relative size-16 shrink-0 overflow-hidden rounded-[1px]">
          <Image
            src={waffling.imageSrc}
            alt=""
            fill
            sizes="64px"
            className="pointer-events-none rounded-[1px] object-cover"
          />
        </div>
      )}

      {/* Preview text */}
      {displayPreview ? (
        <p className="font-[family-name:var(--font-geist)] text-[8px] leading-normal text-ink-secondary whitespace-pre-wrap">
          {displayPreview}
        </p>
      ) : null}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-[136px] bg-gradient-to-b from-transparent to-paper" />

      {/* WIP overlay only on non-clickable cards (the dimmed/placeholder ones).
          Live wafflings — like the recorder — are real links to real prototypes,
          so the dim + cursor-tracking "WIP" badge would be misleading. */}
      {!isClickable && (
        <div
          className="pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded-3xl"
          aria-hidden
        >
          <div
            className="absolute inset-0 bg-black/35 transition-opacity duration-150 ease-out"
            style={{ opacity: wipHover ? 1 : 0 }}
          />
          <div
            className="absolute rounded-md border border-ink/[0.2] bg-ink/[0.06] px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-extrabold uppercase tracking-widest text-ink shadow-lg backdrop-blur-sm transition-opacity duration-150 ease-out"
            style={{
              opacity: wipHover ? 1 : 0,
              left: `${wipPct.x}%`,
              top: `${wipPct.y}%`,
              transform: "translate(-50%, calc(-100% - 10px))",
            }}
          >
            {choom ? CHOOM.wipBadge : "WIP"}
          </div>
        </div>
      )}
    </div>
  );

  return isClickable ? (
    <Link
      href={waffling.href!}
      scroll={false}
      onPointerEnter={warmWaffling}
      onFocus={warmWaffling}
      onClick={openWaffling}
      className="group/waff relative block rounded-3xl transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.4] active:scale-[0.97]"
    >
      {!waffling.isPlaceholder ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-3xl shadow-e2 opacity-0 transition-opacity duration-150 ease-out group-hover/waff:opacity-100"
        />
      ) : null}
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function WafflingsSection() {
  const choom = useChoomLingo();
  return (
    <div id={HOME_WAFFLINGS_SECTION_ID} className="flex w-full min-w-0 flex-col items-start gap-12">
      {/* Section label */}
      <div className="flex w-full items-center gap-4 pr-8">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs leading-6 uppercase text-ink-muted whitespace-nowrap">
          {choom ? CHOOM.wafflingsSectionLabel : "Wafflings"}
        </p>
        <div className="w-[80px] h-px">
          <svg
            width="80"
            height="1"
            viewBox="0 0 80 1"
            fill="none"
            aria-hidden="true"
          >
            <line
              x1="0.5"
              x2="79.5"
              y1="0.5"
              y2="0.5"
              stroke="white"
              strokeOpacity="0.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Embla + wheel like work row; viewport stays on text spine (no −104px breakout). */}
      <ProjectCarousel
        className={HOME_WAFFLINGS_EMBLA_VIEWPORT}
        trackEndPadding="inline"
      >
        {homepageWafflings.map((waffling, i) => (
          <div key={i} className="flex-[0_0_auto]">
            <WafflingCard waffling={waffling} choomIndex={i} />
          </div>
        ))}
      </ProjectCarousel>
    </div>
  );
}

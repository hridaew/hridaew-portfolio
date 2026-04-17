"use client";

import { useCallback, useRef, useState } from "react";
import { CHOOM, CHOOM_WAFFLINGS } from "@/lib/homeChoomCopy";
import { useChoomLingo } from "@/components/home/HomeChoomLingoContext";
import Link from "next/link";
import { homepageWafflings, type WafflingData } from "@/data/homepage-wafflings";
import { useButterChickenRecipeModal } from "@/components/butter-chicken/ButterChickenRecipeModal";
import { FigmaButterChickenWafflingCard } from "./FigmaButterChickenWafflingCard";
import { HOME_WAFFLINGS_EMBLA_VIEWPORT } from "./homeGrid";
import { HOME_WAFFLINGS_SECTION_ID } from "@/lib/scrollHomeWafflings";
import { ProjectCarousel } from "./ProjectCarousel";

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
  const choomRow = CHOOM_WAFFLINGS[choomIndex];
  const displayTitle =
    choom && choomRow ? choomRow.title : waffling.title;
  const displayPreview =
    choom && choomRow ? choomRow.preview : waffling.previewText;

  const isClickable = !!waffling.href && !waffling.isPlaceholder && waffling.opacity === 1;
  const { open: openRecipeModal } = useButterChickenRecipeModal();

  if (waffling.taperedRim) {
    const wafflingForFigma =
      choom && choomRow
        ? { ...waffling, title: displayTitle, previewText: displayPreview }
        : waffling;
    const card = <FigmaButterChickenWafflingCard waffling={wafflingForFigma} />;
    if (waffling.recipeModal) {
      return (
        <button
          type="button"
          onClick={() => openRecipeModal("card")}
          className="block rounded-3xl text-left transition-transform duration-100 ease-out will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:scale-[0.97]"
        >
          {card}
        </button>
      );
    }
    return isClickable ? (
      <Link
        href={waffling.href!}
        className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        {card}
      </Link>
    ) : (
      card
    );
  }

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

  const bgOpacity = waffling.isPlaceholder ? "bg-white/5" : "bg-white/10";

  const inner = (
    <div
      ref={shellRef}
      data-carousel-allow-select
      onPointerEnter={() => setWipHover(true)}
      onPointerLeave={() => setWipHover(false)}
      onPointerMove={onPointerMove}
      className={`relative flex w-[176px] shrink-0 flex-col items-start gap-4 overflow-clip rounded-3xl pt-6 px-4 ${bgOpacity} ${
        waffling.isPlaceholder
          ? "shadow-none"
          : "shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
      } h-[272px] ${isClickable ? "cursor-pointer transition-transform duration-150 ease-out hover:-translate-y-[1px]" : ""}`}
      style={{ opacity: waffling.opacity }}
    >
      {/* Title */}
      <p
        className={`font-[family-name:var(--font-geist)] font-bold text-base leading-normal w-full ${
          waffling.isPlaceholder ? "text-white/50" : "text-white/80"
        }`}
      >
        {displayTitle}
      </p>

      {/* Optional thumbnail */}
      {waffling.imageSrc && (
        <div className="relative size-16 shrink-0 overflow-hidden rounded-[1px]">
          <img
            src={waffling.imageSrc}
            alt=""
            className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[1px] object-cover"
          />
        </div>
      )}

      {/* Preview text */}
      {displayPreview ? (
        <p className="font-[family-name:var(--font-geist)] text-[8px] leading-normal text-white/80 whitespace-pre-wrap">
          {displayPreview}
        </p>
      ) : null}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-[136px] bg-gradient-to-b from-transparent to-[#1b1b1b]" />

      <div
        className="pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded-3xl"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-black/35 transition-opacity duration-150 ease-out"
          style={{ opacity: wipHover ? 1 : 0 }}
        />
        <div
          className="absolute rounded-md border border-white/25 bg-white/[0.12] px-2 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-sm transition-opacity duration-150 ease-out"
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
    </div>
  );

  return isClickable ? (
    <Link
      href={waffling.href!}
      className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
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
        <p className="font-[family-name:var(--font-geist-mono)] text-xs leading-6 uppercase text-white/50 whitespace-nowrap">
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

"use client";

import type { WafflingData } from "@/data/homepage-wafflings";
import { SkeuomorphicRim } from "@/components/shared/SkeuomorphicRim";
import { cn } from "@/lib/utils";

export function FigmaButterChickenWafflingCard({ waffling }: { waffling: WafflingData }) {
  const paragraphs = waffling.previewText.split(/\n\n+/).filter((p) => p.trim().length > 0);

  return (
    <div
      data-carousel-allow-select
      className={cn(
        "relative flex h-[272px] w-[176px] shrink-0 flex-col overflow-hidden rounded-3xl bg-white/10 pt-6 px-4 pb-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-md backdrop-saturate-150",
      )}
      style={{ opacity: waffling.opacity }}
    >
      <SkeuomorphicRim className="z-[3]" />

      {waffling.eyebrow ? (
        <p className="relative z-0 mb-1 min-w-full shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] font-medium uppercase leading-none tracking-[0.12em] text-white/50">
          {waffling.eyebrow}
        </p>
      ) : null}

      <p className="relative z-0 min-w-full shrink-0 font-[family-name:var(--font-geist)] text-[16px] font-bold leading-snug tracking-tight text-white/80">
        {waffling.title}
      </p>

      {waffling.imageSrc ? (
        <div className="relative z-0 mt-4 size-[64px] shrink-0 overflow-hidden rounded-sm ring-1 ring-white/15">
          <img
            src={waffling.imageSrc}
            alt=""
            className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
          />
        </div>
      ) : null}

      <div className="relative z-0 mt-4 min-h-0 w-full min-w-0 flex-1 overflow-hidden font-[family-name:var(--font-geist)] text-[8px] font-normal leading-[1.35] text-white/80">
        {paragraphs.map((block, i) => (
          <p key={i} className="mb-2 whitespace-pre-wrap last:mb-0">
            {block}
          </p>
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 z-[2] h-[136px] w-[calc(100%+2px)] max-w-none -translate-x-1/2 bg-gradient-to-b from-transparent via-[#1b1b1b]/40 to-[#1b1b1b]"
      />
    </div>
  );
}

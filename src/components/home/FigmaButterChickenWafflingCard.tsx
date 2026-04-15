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
        "relative flex h-[272px] w-[176px] shrink-0 flex-col items-start gap-4 overflow-hidden rounded-3xl bg-[rgba(255,255,255,0.1)] pt-6 px-4 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]",
      )}
      style={{ opacity: waffling.opacity }}
    >
      <SkeuomorphicRim className="z-[3]" />

      <p className="relative z-0 min-w-full shrink-0 font-[family-name:var(--font-geist)] text-base font-bold leading-normal text-[rgba(255,255,255,0.8)]">
        {waffling.title}
      </p>

      {waffling.imageSrc ? (
        <div className="relative z-0 size-16 shrink-0 overflow-hidden rounded-[1px]">
          <img
            src={waffling.imageSrc}
            alt=""
            className="pointer-events-none absolute inset-0 size-full max-w-none rounded-[1px] object-cover"
          />
        </div>
      ) : null}

      <div className="relative z-0 min-h-0 w-full min-w-0 flex-1 overflow-hidden pb-[3px] font-[family-name:var(--font-geist)] text-[8px] font-normal leading-[0] text-[rgba(255,255,255,0.8)]">
        {paragraphs.map((block, i) => (
          <p key={i} className="mb-0 whitespace-pre-wrap leading-normal last:mb-0">
            {block}
          </p>
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[calc(50%+0.5px)] z-[2] h-[136px] w-[175px] -translate-x-1/2 bg-gradient-to-b from-[rgba(27,27,27,0)] to-[#1b1b1b]"
      />
    </div>
  );
}

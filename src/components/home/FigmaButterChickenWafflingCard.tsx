"use client";

import Image from "next/image";
import type { WafflingData } from "@/data/homepage-wafflings";
import { SkeuomorphicRim } from "@/components/shared/SkeuomorphicRim";
import { cn } from "@/lib/utils";

/**
 * Shared chrome for "real" waffling cards (Butter Chicken, Recorder-Proto, …):
 * dark frosted glass + `SkeuomorphicRim` outline + bottom fade. Content slot
 * adapts based on `imageHero`:
 *   - `imageHero: false` (Butter Chicken) — 64×64 thumbnail + paragraphs
 *   - `imageHero: true`  (Recorder-Proto) — full-width image + short caption
 *
 * The strong `backdrop-blur-2xl` is load-bearing: at 12px dot spacing a lighter
 * blur can't blot out the home dot-mesh, so the cards read as sitting underneath
 * the grid instead of above it.
 */
export function FigmaButterChickenWafflingCard({ waffling }: { waffling: WafflingData }) {
  const paragraphs = waffling.previewText.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const isHero = !!waffling.imageHero && !!waffling.imageSrc;

  return (
    <div
      data-carousel-allow-select
      className={cn(
        "relative flex h-[272px] w-[176px] shrink-0 flex-col overflow-hidden rounded-3xl border border-ink/[0.07] bg-paper-raised/85 pt-6 px-4 pb-3 shadow-e1 backdrop-blur-2xl backdrop-saturate-150",
      )}
      style={{ opacity: waffling.opacity }}
    >
      <SkeuomorphicRim className="z-[3]" />

      {waffling.eyebrow ? (
        <p className="relative z-0 mb-1 min-w-full shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] font-medium uppercase leading-none tracking-[0.12em] text-ink-muted">
          {waffling.eyebrow}
        </p>
      ) : null}

      <p className="relative z-0 min-w-full shrink-0 font-[family-name:var(--font-geist)] text-[16px] font-bold leading-snug tracking-tight text-ink">
        {waffling.title}
      </p>

      {isHero ? (
        <>
          {/* Hero image — `object-contain object-left` so the mockup sits flush with
              the card's left padding and is never cropped. */}
          <div className="relative z-0 mt-4 w-full shrink-0" style={{ height: 132 }}>
            <Image
              src={waffling.imageSrc!}
              alt=""
              fill
              sizes="176px"
              className="pointer-events-none object-contain object-left"
            />
          </div>

          {/* Short caption — same type spec as butter chicken's paragraphs */}
          {waffling.previewText ? (
            <p className="relative z-0 mt-3 min-w-full font-[family-name:var(--font-geist)] text-[8px] font-normal leading-[1.35] text-ink-secondary whitespace-pre-wrap">
              {waffling.previewText}
            </p>
          ) : null}
        </>
      ) : (
        <>
          {waffling.imageSrc ? (
            <div className="relative z-0 mt-4 size-[64px] shrink-0 overflow-hidden rounded-sm ring-1 ring-ink/[0.12]">
              <Image
                src={waffling.imageSrc}
                alt=""
                fill
                sizes="64px"
                className="pointer-events-none object-cover"
              />
            </div>
          ) : null}

          <div className="relative z-0 mt-4 min-h-0 w-full min-w-0 flex-1 overflow-hidden font-[family-name:var(--font-geist)] text-[8px] font-normal leading-[1.35] text-ink-secondary">
            {paragraphs.map((block, i) => (
              <p key={i} className="mb-2 whitespace-pre-wrap last:mb-0">
                {block}
              </p>
            ))}
          </div>
        </>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 z-[2] h-[136px] w-[calc(100%+2px)] max-w-none -translate-x-1/2 bg-gradient-to-b from-transparent via-paper/40 to-paper"
      />
    </div>
  );
}

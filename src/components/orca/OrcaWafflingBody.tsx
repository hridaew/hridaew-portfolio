"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { DeferredVideo } from "@/components/DeferredVideo";
import {
  ORCA_INTERACTION,
  ORCA_MAKING_P1,
  ORCA_MAKING_P2,
  ORCA_OPENING,
  ORCA_PLAYTEST_P1,
  ORCA_TITLE,
} from "@/data/waffling-article-copy";
import { cn } from "@/lib/utils";

const IMG = {
  finalBooth: "/assets/orca/final-booth.jpg",
  giantControllers: "/assets/orca/giant-controllers.jpg",
  throwTest: "/assets/orca/throw-test.jpg",
  hitGrid: "/assets/orca/hit-grid-proto.jpg",
  slideReturn: "/assets/orca/slide-return.jpg",
  gameUi: "/assets/orca/game-ui.jpg",
  throwReady: "/assets/orca/throw-ready.jpg",
} as const;

/** Same spine as Savor / Butter Chicken. */
const ORCA_COLUMN =
  "mx-auto w-full min-w-0 max-w-[800px] px-4 md:px-[88px]" as const;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="font-[family-name:var(--font-geist)] text-2xl font-bold leading-normal text-white/80">
      {children}
    </h4>
  );
}

function Body({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-[family-name:var(--font-geist)] text-base font-normal leading-[1.5] text-white/80",
        className,
      )}
    >
      {children}
    </p>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-geist-mono)] text-xs font-normal leading-[1.4] text-white/60">
      {children}
    </p>
  );
}

function Figure({
  src,
  alt,
  caption,
  priority,
}: {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative w-full overflow-hidden rounded-xl bg-black/40 shadow-[0px_4px_24px_6px_rgba(0,0,0,0.35)]">
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={1200}
          priority={priority}
          className="block h-auto w-full object-cover"
          sizes="(max-width: 800px) 100vw, 624px"
        />
      </div>
      {caption ? <Caption>{caption}</Caption> : null}
    </div>
  );
}

function FigurePair({
  left,
  right,
}: {
  left: { src: string; alt: string; caption?: string };
  right: { src: string; alt: string; caption?: string };
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {[left, right].map((fig) => (
        <div key={fig.src} className="flex min-w-0 flex-col gap-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/40 shadow-[0px_4px_24px_6px_rgba(0,0,0,0.35)]">
            <Image
              src={fig.src}
              alt={fig.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 300px"
            />
          </div>
          {fig.caption ? <Caption>{fig.caption}</Caption> : null}
        </div>
      ))}
    </div>
  );
}

export function OrcaWafflingBody() {
  return (
    <div
      className={cn(
        ORCA_COLUMN,
        "flex flex-col gap-12 pt-16 pb-24 md:pt-24 md:pb-28",
      )}
    >
      <h1 className="w-full min-w-0 font-[family-name:var(--font-geist)] text-[40px] font-bold leading-normal text-white/80">
        {ORCA_TITLE}
      </h1>

      <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-[0px_4px_24px_6px_rgba(0,0,0,0.35)]">
        <DeferredVideo
          src="/assets/orca/story.mp4"
          poster="/assets/orca/hero-poster.jpg"
          className="block aspect-video h-auto w-full object-cover"
          muted
          loop
          playsInline
          controls
          aria-label="Saving Baby J gameplay video"
        />
      </div>

      <section className="flex w-full flex-col gap-4">
        <SectionTitle>What it is</SectionTitle>
        <Body>{ORCA_OPENING}</Body>
      </section>

      <Figure
        src={IMG.finalBooth}
        alt="Finished booth with projected game and plush return slide"
        caption="Final booth"
        priority
      />

      <section className="flex w-full flex-col gap-4">
        <SectionTitle>Finding the interaction</SectionTitle>
        <Body>{ORCA_INTERACTION}</Body>
      </section>

      <FigurePair
        left={{
          src: IMG.giantControllers,
          alt: "Two large cardboard orca controllers in front of a projected screen",
          caption: "Giant orca controllers",
        }}
        right={{
          src: IMG.throwTest,
          alt: "Person throwing an orca plushie at a projected screen",
          caption: "Throwing plushies",
        }}
      />

      <section className="flex w-full flex-col gap-4">
        <SectionTitle>Making the hit board</SectionTitle>
        <Body>{ORCA_MAKING_P1}</Body>
        <Body>{ORCA_MAKING_P2}</Body>
      </section>

      <FigurePair
        left={{
          src: IMG.hitGrid,
          alt: "Paper grid on a table with an orca plush marking a cell",
          caption: "Hit grid prototype",
        }}
        right={{
          src: IMG.slideReturn,
          alt: "Booth with Throw the orcas sign and plushies at the return slide",
          caption: "Plush slide return",
        }}
      />

      <Figure
        src={IMG.gameUi}
        alt="Top-down game view with a boat, orcas, and boat health bar"
      />

      <section className="flex w-full flex-col gap-4">
        <SectionTitle>Playtesting</SectionTitle>
        <Body>{ORCA_PLAYTEST_P1}</Body>
        <Body>
          I scaled the boat up, pushed the hit feedback harder, and added a
          short celebration before the end screen. The outro also got a clearer
          next step, something people could actually do once the round was over.
        </Body>
      </section>

      <Figure
        src={IMG.throwReady}
        alt="Person holding an orca plushie up toward the game screen"
      />

      <section className="flex w-full flex-col gap-4">
        <Body>
          By the end it was a loud little walk-up game: throw a plush, dent the
          boat, free Baby J.
        </Body>
        <Body>
          The game ended up causing a lot of noise, with people lining up to set
          the high score for number of boats destroyed.
        </Body>
      </section>
    </div>
  );
}

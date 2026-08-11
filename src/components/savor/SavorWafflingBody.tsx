"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { DeferredVideo } from "@/components/DeferredVideo";
import {
  SAVOR_OPENING,
  SAVOR_P3,
  SAVOR_STORY_P1,
  SAVOR_TITLE,
} from "@/data/waffling-article-copy";
import { cn } from "@/lib/utils";

const IMG = {
  handClose: "/assets/savor/mighty-hand-1.jpg",
  handVisit: "/assets/savor/mighty-hand-visit.png",
  handPainting: "/assets/savor/mighty-hand-painting.png",
} as const;

/** Same spine as Butter Chicken recipe column. */
const SAVOR_COLUMN =
  "mx-auto w-full min-w-0 max-w-[800px] px-4 md:px-[88px]" as const;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="font-[family-name:var(--font-geist)] text-2xl font-bold leading-normal text-ink-secondary">
      {children}
    </h4>
  );
}

function Body({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-[family-name:var(--font-geist)] text-base font-normal leading-[1.5] text-ink-secondary",
        className,
      )}
    >
      {children}
    </p>
  );
}

function Subhead({ children }: { children: ReactNode }) {
  return (
    <h5 className="font-[family-name:var(--font-geist)] text-lg font-bold leading-snug text-ink-secondary">
      {children}
    </h5>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-ink/[0.08] bg-ink/[0.02] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-ink-secondary">
      <code>{children}</code>
    </pre>
  );
}

function InstallStep({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-ink/[0.12] font-[family-name:var(--font-geist-mono)] text-[11px] text-ink-muted">
          {n}
        </span>
        <Subhead>{title}</Subhead>
      </div>
      <div className="flex flex-col gap-3 pl-9">{children}</div>
    </div>
  );
}

/** Inline term with a short hover/focus card for non-technical readers. */
function TechTerm({ term, blurb }: { term: string; blurb: string }) {
  return (
    <span className="group/tech relative inline-block">
      <button
        type="button"
        className="cursor-help font-[family-name:var(--font-geist)] text-base font-semibold leading-[1.5] text-ink underline decoration-ink/[0.55] underline-offset-[3px] transition-colors hover:text-ink hover:decoration-ink/[0.88] focus:outline-none focus-visible:text-ink focus-visible:decoration-ink"
        aria-describedby={`tech-${term.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {term}
      </button>
      <span
        id={`tech-${term.replace(/\s+/g, "-").toLowerCase()}`}
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-[min(240px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-ink/[0.08] bg-paper-raised px-3 py-2.5 text-left opacity-0 shadow-e2 transition-opacity duration-150 group-hover/tech:opacity-100 group-focus-within/tech:opacity-100"
      >
        <span className="block font-[family-name:var(--font-geist-mono)] text-[10px] font-medium uppercase tracking-wide text-ink-muted">
          {term}
        </span>
        <span className="mt-1 block font-[family-name:var(--font-geist)] text-[12px] leading-snug text-ink-secondary">
          {blurb}
        </span>
      </span>
    </span>
  );
}

export function SavorWafflingBody() {
  return (
    <div className={cn(SAVOR_COLUMN, "flex flex-col gap-12 pt-16 pb-24 md:pt-24 md:pb-28")}>
      <h1 className="w-full min-w-0 font-[family-name:var(--font-geist)] text-[40px] font-bold leading-normal text-ink-secondary">
        {SAVOR_TITLE}
      </h1>

      {/* Hero trailer */}
      <div className="flex w-full flex-col gap-2">
        <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-e2">
          <DeferredVideo
            src="/assets/savor/trailer.mp4"
            poster="/assets/savor/hero-poster.jpg"
            className="block aspect-video h-auto w-full object-cover"
            muted
            loop
            playsInline
            aria-label="Savor trailer: phone video of Rodin's Mighty Hand becomes a 3D Gaussian splat"
          />
        </div>
        <p className="font-[family-name:var(--font-geist-mono)] text-xs font-normal leading-[1.4] text-ink-muted">
          Demo video
        </p>
      </div>

      {/* What it is */}
      <section className="flex w-full flex-col gap-4">
        <SectionTitle>What it is</SectionTitle>
        <Body>{SAVOR_OPENING}</Body>
        <Body>
          I built a completely Mac-native version. Frames come out through{" "}
          <TechTerm
            term="AVFoundation"
            blurb="Apple's toolkit for pulling frames and audio out of video files on Mac and iPhone."
          />
          , the splat trains in{" "}
          <TechTerm
            term="Metal"
            blurb="Apple's graphics engine. Here it runs the 3D training on your Mac's GPU."
          />
          , cleanup uses{" "}
          <TechTerm
            term="Vision"
            blurb="Apple's computer-vision framework. It finds the subject in each frame so the room can be cut away."
          />
          , and{" "}
          <TechTerm
            term="RealityKit"
            blurb="Apple's 3D framework. It powers the viewer where you orbit and zoom the finished splat."
          />{" "}
          handles the viewer. There&apos;s also a Windows/Linux version that wraps a third-party
          stack. Neither talks to a cloud.
        </Body>
        <Body>{SAVOR_P3}</Body>
      </section>

      {/* The story */}
      <section className="flex w-full flex-col gap-4">
        <SectionTitle>The story</SectionTitle>
        <Body>{SAVOR_STORY_P1}</Body>
        <Body>
          There&apos;s this sculpture at the Legion of Honor: Rodin&apos;s <em>Mighty Hand</em>. I
          love it. I keep going back. Photos don&apos;t do it justice; it&apos;s a 3D sculpture. I
          wanted to capture it properly, so I walked a slow circle with my phone and tried to turn
          that clip into a Gaussian splat.
        </Body>
        <div className="flex w-full gap-4 py-2">
          <div className="relative h-[220px] min-w-0 flex-1 overflow-hidden rounded-lg bg-black/40 sm:h-[280px]">
            <Image
              src={IMG.handClose}
              alt="Rodin's Mighty Hand on its pedestal at the Legion of Honor"
              fill
              sizes="(max-width: 768px) 45vw, 360px"
              quality={78}
              className="object-cover object-center"
            />
          </div>
          <div className="relative h-[220px] min-w-0 flex-1 overflow-hidden rounded-lg bg-black/40 sm:h-[280px]">
            <Image
              src={IMG.handVisit}
              alt="Filming Rodin's Mighty Hand in the gallery"
              fill
              sizes="(max-width: 768px) 45vw, 360px"
              quality={78}
              className="object-cover object-[center_40%]"
            />
          </div>
        </div>
        <Body>
          The annoying part wasn&apos;t the capture. It was everything after: separate installers,
          waiting on processors, then carving the hand out of the gallery in some other tool. I
          wired those steps into one app so I could stay in the loop of filming and looking.
        </Body>

        <div className="flex flex-col gap-3 pt-2">
          <Subhead>Building it for real</Subhead>
          <Body>
            Version one ran on my Windows PC with an RTX graphics card. It worked, but only if you
            also installed a bunch of other apps and tools (things like Postshot and Brush). I wrote
            a script to handle the cleanup automatically, so you weren&apos;t carving the object out
            by hand, and a capture could come back ready in a few minutes. Still, getting everything
            installed was a pain. One missing piece and the whole thing fell over.
          </Body>
        </div>

        <div className="flex flex-col gap-3">
          <Subhead>Going fully native on Apple</Subhead>
          <Body>
            I moved to an Apple-only stack because native means a much easier setup. Apple had
            already done a lot of the hard work in this area, and running the old third-party tools
            on Mac kept hitting dependency issues. A native stack also opens the door to an iPhone
            app later. So I started over: frame extraction, camera tracking, training, cleanup, and
            viewing all on-device. Three of the four pieces already ship in macOS; I wired them
            together and filled the gap with a Metal trainer.
          </Body>
        </div>

        <div className="flex flex-col gap-3">
          <Subhead>The bug that taught the most</Subhead>
          <Body>
            Cleaned mode was supposed to leave just the object. Instead, the whole gallery came
            along for the ride. The unlock: when you walk a circle around something, the subject
            sits inside that path. 43% of the 3D points were sitting outside it. That couldn&apos;t
            be the sculpture. It had to be the room. Later,{" "}
            <TechTerm
              term="Vision"
              blurb="Apple's computer-vision framework. It finds the subject in each frame so the room can be cut away."
            />{" "}
            silhouettes from every angle finished cutting the rest away.
          </Body>
        </div>
      </section>

      {/* Install */}
      <section className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-4">
          <SectionTitle>Installation</SectionTitle>
          <Body>
            The Mac-native version runs from source. Copy the commands below into Terminal and press
            Enter. About ten minutes total.
          </Body>
        </div>

        <div className="flex flex-col gap-3">
          <Subhead>What you need first</Subhead>
          <ul className="list-disc space-y-2 pl-5 font-[family-name:var(--font-geist)] text-base leading-[1.5] text-ink-secondary">
            <li>A Mac with Apple Silicon (M1 or later).</li>
            <li>A recent version of macOS.</li>
            <li>Xcode from the App Store.</li>
          </ul>
        </div>

        <InstallStep n={1} title="Install Xcode">
          <Body>
            Open the App Store, search for Xcode, and click <em>Get</em>. When it finishes, open it
            once, accept the license, then close it.
          </Body>
        </InstallStep>

        <InstallStep n={2} title="Open Terminal">
          <Body>
            Press ⌘ + Space, type Terminal, and press Enter.
          </Body>
        </InstallStep>

        <InstallStep n={3} title="Get the project">
          <Body>Paste this into Terminal and press Enter:</Body>
          <CodeBlock>git clone https://github.com/hridaew/savor-native.git</CodeBlock>
          <Body className="text-ink-muted">
            First time using <code className="text-ink-secondary">git</code>, macOS may ask to install
            command line developer tools. Click <em>Install</em>, wait, then run the line again.
          </Body>
        </InstallStep>

        <InstallStep n={4} title="Go into the folder">
          <CodeBlock>cd savor-native</CodeBlock>
        </InstallStep>

        <InstallStep n={5} title="Run it">
          <CodeBlock>swift run -c release savor-native</CodeBlock>
          <Body>
            The first build takes several minutes. Lots of text will scroll by; that&apos;s normal.
            When it finishes, the Savor window opens on its own. Later launches are nearly instant.
          </Body>
        </InstallStep>

        <div className="flex flex-col gap-3">
          <Subhead>Using it</Subhead>
          <ul className="list-disc space-y-2 pl-5 font-[family-name:var(--font-geist)] text-base leading-[1.5] text-ink-secondary">
            <li>
              Drag a video onto the window, or click New capture to pick one.
            </li>
            <li>
              Film a slow, full circle around one object. Keep it centered, filling about half the
              frame, in even light. Tips live behind the ? button.
            </li>
            <li>
              Watch it train. The splat sharpens as it goes. Hit Finish Now if the preview already
              looks good enough.
            </li>
            <li>
              Drag to orbit, scroll to zoom. Switch between Cleaned (just the object) and Unfiltered
              (raw capture). Export a still, a spinning video, or the 3D file.
            </li>
          </ul>
        </div>

        <aside className="rounded-xl border border-ink/[0.08] bg-ink/[0.02] px-5 py-4">
          <Body className="text-ink-secondary">
            On Windows or Linux, use the cross-platform build at{" "}
            <a
              href="https://github.com/hridaew/savor"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-ink/[0.3] underline-offset-2 transition-colors hover:text-ink hover:decoration-ink/[0.55]"
            >
              github.com/hridaew/savor
            </a>
            . Same pipeline, more setup.
          </Body>
        </aside>
      </section>

      <section className="flex w-full flex-col gap-3">
        <Subhead>Thanks!</Subhead>
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[360px] overflow-hidden rounded-lg bg-black/40">
          <Image
            src={IMG.handPainting}
            alt="Acrylic painting of Rodin's Mighty Hand by Hridae"
            fill
            sizes="(max-width: 768px) 90vw, 360px"
            quality={82}
            className="object-cover"
          />
        </div>
        <p className="text-center font-[family-name:var(--font-geist-mono)] text-xs font-normal leading-[1.4] text-ink-muted">
          Acrylic painting of Rodin&apos;s <em>Mighty Hand</em>, by me.
        </p>
      </section>

      <footer className="border-t border-ink/[0.08] pt-8">
        <Body className="text-ink-muted">
          Native Mac:{" "}
          <a
            href="https://github.com/hridaew/savor-native"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-secondary underline decoration-ink/[0.3] underline-offset-2 transition-colors hover:text-ink hover:decoration-ink/[0.55]"
          >
            github.com/hridaew/savor-native
          </a>
          {" · "}
          Cross-platform:{" "}
          <a
            href="https://github.com/hridaew/savor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-secondary underline decoration-ink/[0.3] underline-offset-2 transition-colors hover:text-ink hover:decoration-ink/[0.55]"
          >
            github.com/hridaew/savor
          </a>
        </Body>
      </footer>
    </div>
  );
}

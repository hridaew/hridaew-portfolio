import type { Metadata } from "next";
import Link from "next/link";
import { HOME_COLUMN } from "@/components/home/homeGrid";
import { TrailerPlayer } from "./TrailerPlayer";

export const metadata: Metadata = {
  title: "Experiment · HyperFrames trailer — Hridae W.",
  description:
    "A ~14-second portfolio trailer authored as an HTML composition and played live via HeyGen's open-source HyperFrames framework.",
};

export default function HyperframesExperimentPage() {
  return (
    <div className="min-h-screen w-full bg-[#0c0c0e] text-white/90">
      <div className={`${HOME_COLUMN} py-24 md:py-32`}>
        <Link
          href="/"
          className="type-caption-medium inline-flex items-center gap-2 text-white/50 transition-colors hover:text-white"
        >
          <span aria-hidden>&larr;</span> Back home
        </Link>

        <header className="mt-10 md:mt-14">
          <p className="type-caption-medium uppercase tracking-widest text-white/35">
            Experiment
          </p>
          <h1 className="type-h1 mt-4 text-white">
            Portfolio trailer, authored in HTML.
          </h1>
          <p className="type-body-lg mt-6 max-w-[52ch] text-white/60">
            A ~14-second trailer for the site, composed as a single HTML file
            with GSAP timelines and played live through{" "}
            <a
              href="https://github.com/heygen-com/hyperframes"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white/70"
            >
              HeyGen&rsquo;s HyperFrames
            </a>
            . No MP4, no render step &mdash; every frame is the browser doing
            its thing.
          </p>
        </header>

        <section className="mt-14 md:mt-20">
          <TrailerPlayer />
          <p className="type-caption mt-4 uppercase tracking-widest text-white/30">
            1920 &times; 1080 &middot; 14 seconds &middot; live composition
          </p>
        </section>

        <section className="mt-20 grid gap-10 md:mt-28 md:grid-cols-2">
          <div>
            <h2 className="type-h3 text-white">What&rsquo;s going on here</h2>
            <p className="type-body mt-4 text-white/55">
              HyperFrames lets you define a video composition as plain HTML
              with <code className="rounded bg-white/5 px-1.5 py-0.5 text-white/75">data-start</code>{" "}
              and <code className="rounded bg-white/5 px-1.5 py-0.5 text-white/75">data-duration</code>{" "}
              attributes and a GSAP timeline. The embedded{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 text-white/75">@hyperframes/player</code>{" "}
              web component loads that HTML in a sandboxed iframe and drives
              playback in real time.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-white">Why it&rsquo;s interesting</h2>
            <p className="type-body mt-4 text-white/55">
              The same GSAP work that drives the hero card on this site can
              also be rendered to a shareable MP4 via the HyperFrames CLI
              (Puppeteer + FFmpeg). One source, two outputs &mdash; live web
              animation and a social-ready video &mdash; without rebuilding the
              motion twice.
            </p>
          </div>
        </section>

        <footer className="mt-20 flex flex-wrap items-center gap-x-6 gap-y-2 md:mt-28">
          <a
            href="/experiments/hyperframes-trailer/index.html"
            target="_blank"
            rel="noreferrer"
            className="type-caption-medium uppercase tracking-widest text-white/30 transition-colors hover:text-white/70"
          >
            View composition source &rarr;
          </a>
          <a
            href="https://hyperframes.heygen.com"
            target="_blank"
            rel="noreferrer"
            className="type-caption-medium uppercase tracking-widest text-white/30 transition-colors hover:text-white/70"
          >
            hyperframes.heygen.com &rarr;
          </a>
        </footer>
      </div>
    </div>
  );
}

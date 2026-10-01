"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { ProjectLink } from "../shared/ProjectLink";
import { useCopyEmail } from "../shared/useCopyEmail";
import {
  BIO,
  PROJECTS,
  RECOGNITION,
  TOOLKIT,
  WAFFLINGS,
  toolIconSrc,
  type VariantMedia,
} from "../shared/work";
import { CV_HREF, GITHUB_HREF, LINKEDIN_HREF } from "@/lib/site-identity";
import "./ledger.css";

/** Everything the floating preview can show, keyed by row id. */
type PreviewItem = { id: string; color: string; media: VariantMedia };

const PREVIEWS: PreviewItem[] = [
  ...PROJECTS.map((p) => ({ id: p.slug, color: p.color, media: p.cover })),
  ...WAFFLINGS.map((w) => ({ id: w.slug, color: "#e9e7e2", media: w.media })),
];

/** Preview card size — keep in sync with `.vl-preview` in ledger.css. */
const PREVIEW_W = 420;
const PREVIEW_H = 300;
const PREVIEW_GAP = 28;

/* ── Live SF clock (client only, minute resolution) ─────────────────── */

function SfClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Los_Angeles",
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{now ? `${now} PT` : " "}</span>;
}

/* ── Preview video: only decodes while its row is active ───────────── */

function PreviewVideo({ media, active }: { media: VariantMedia; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !media.video) return;
    if (active) {
      if (el.dataset.loaded !== "1") {
        el.src = media.video;
        el.dataset.loaded = "1";
      }
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active, media.video]);
  return (
    <video
      ref={ref}
      poster={media.src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className="v-media"
    />
  );
}

/* ── Cursor-following preview (rAF + refs, no per-frame React state) ── */

function useFollowPreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  // ox: horizontal offset so the card sits beside the cursor, flipping sides near the right edge.
  const pos = useRef({ x: 0, y: 0, r: 0, ox: PREVIEW_GAP });
  const seeded = useRef(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!seeded.current) {
        pos.current.x = e.clientX;
        pos.current.y = e.clientY;
        seeded.current = true;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      const card = cardRef.current;
      if (card) {
        const k = reduce ? 1 : 0.16;
        const dx = target.current.x - pos.current.x;
        pos.current.x += dx * k;
        pos.current.y += (target.current.y - pos.current.y) * k;
        // Lean into the direction of travel; settles to 0 when the cursor rests.
        const lean = reduce ? 0 : Math.max(-7, Math.min(7, dx * 0.06));
        pos.current.r += (lean - pos.current.r) * 0.12;
        const flip = target.current.x > window.innerWidth - PREVIEW_W - PREVIEW_GAP * 2;
        const ox = flip ? -PREVIEW_W - PREVIEW_GAP : PREVIEW_GAP;
        pos.current.ox += (ox - pos.current.ox) * (reduce ? 1 : 0.14);
        const x = pos.current.x + pos.current.ox;
        const y = pos.current.y - PREVIEW_H / 2;
        card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${pos.current.r}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { cardRef, active, setActive };
}

/* ── Page ───────────────────────────────────────────────────────────── */

export function LedgerHome() {
  const { cardRef, active, setActive } = useFollowPreview();
  const { email, copied, copy } = useCopyEmail();
  const activeColor = PREVIEWS.find((p) => p.id === active)?.color;

  const rowHandlers = (id: string) => ({
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") setActive(id);
    },
    onPointerLeave: () => setActive((cur) => (cur === id ? null : cur)),
  });

  return (
    <main className="vl">
      {/* Floating preview — desktop pointer only (hidden via CSS on touch). */}
      <div
        ref={cardRef}
        className="vl-preview"
        data-show={active ? "" : undefined}
        aria-hidden
      >
        <div className="vl-preview__card" style={{ background: activeColor }}>
          {PREVIEWS.map((p) => {
            const portrait = p.media.h > p.media.w;
            return (
              <div
                key={p.id}
                className="vl-preview__layer"
                data-active={active === p.id ? "" : undefined}
              >
                <div
                  className="vl-preview__frame"
                  data-portrait={portrait ? "" : undefined}
                  style={{ aspectRatio: `${p.media.w} / ${p.media.h}` }}
                >
                  {p.media.video ? (
                    <PreviewVideo media={p.media} active={active === p.id} />
                  ) : (
                    <Image src={p.media.src} alt="" fill sizes="420px" className="object-cover" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <header className="vl-bar v-mono">
        <span>{BIO.name}</span>
        <span className="vl-bar__mid">
          {BIO.role} · {BIO.location}
        </span>
        <SfClock />
      </header>

      <section className="vl-hero">
        <h1 className="v-display vl-hero__title">
          <span className="vl-rise" style={{ "--d": "0ms" } as React.CSSProperties}>
            Designing for
          </span>
          <span className="vl-rise" style={{ "--d": "70ms" } as React.CSSProperties}>
            interaction models
          </span>
          <span className="vl-rise vl-hero__soft" style={{ "--d": "140ms" } as React.CSSProperties}>
            that barely exist yet.
          </span>
        </h1>

        <div className="vl-hero__aside vl-rise" style={{ "--d": "260ms" } as React.CSSProperties}>
          <p className="v-sans vl-hero__bio">
            I&apos;m Hridae, a product designer with six years of making things for
            screens, rooms, headsets, and hands. I learn by making, on the canvas,
            in code, and in the physical world.
          </p>
          <p className="v-mono vl-hero__now">
            <span className="vl-dot" aria-hidden /> Now: {BIO.now}
          </p>
          <div className="vl-hero__links">
            <button type="button" onClick={copy} className="vl-chip v-mono">
              {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copied ? "Copied" : email}
            </button>
            <a href={CV_HREF} target="_blank" rel="noopener noreferrer" className="vl-chip v-mono">
              CV <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
            <a href={LINKEDIN_HREF} target="_blank" rel="noopener noreferrer" className="vl-chip v-mono">
              LinkedIn <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="vl-work" className="vl-section">
        <div className="vl-thead v-mono">
          <span id="vl-work">No.</span>
          <span>Selected work</span>
          <span className="vl-col-md">Medium</span>
          <span className="vl-col-lg">Role</span>
          <span className="vl-col-sm">Years</span>
        </div>

        <ol className="vl-list">
          {PROJECTS.map((p, i) => (
            <li key={p.slug} className="vl-rise" style={{ "--d": `${360 + i * 60}ms` } as React.CSSProperties}>
              <ProjectLink href={p.href} className="vl-row" {...rowHandlers(p.slug)}>
                <span className="v-mono vl-row__no">0{i + 1}</span>
                <span className="vl-row__main">
                  <span className="v-display vl-row__name">
                    {p.name}
                    <ArrowUpRight className="vl-row__arrow" strokeWidth={2.5} aria-hidden />
                  </span>
                  <span className="v-sans vl-row__title">{p.title}</span>
                  <span
                    className="vl-row__media"
                    style={{ background: p.color }}
                    aria-hidden
                  >
                    <span
                      className="vl-row__media-frame"
                      data-portrait={p.cover.h > p.cover.w ? "" : undefined}
                      style={{ aspectRatio: `${p.cover.w} / ${p.cover.h}` }}
                    >
                      <Image src={p.cover.src} alt="" fill sizes="90vw" className="object-cover" />
                    </span>
                  </span>
                </span>
                <span className="v-mono vl-col-md vl-row__meta">{p.medium}</span>
                <span className="v-mono vl-col-lg vl-row__meta">{p.role}</span>
                <span className="v-mono vl-col-sm vl-row__meta">{p.years}</span>
              </ProjectLink>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Outcomes" className="vl-section vl-outcomes">
        {PROJECTS.map((p) => (
          <div key={p.slug} className="vl-outcome">
            <span className="v-display vl-outcome__value">{p.outcome.value}</span>
            <span className="v-sans vl-outcome__label">{p.outcome.label}</span>
            <span className="v-mono vl-outcome__src">{p.name}</span>
          </div>
        ))}
      </section>

      <section className="vl-section vl-split">
        <div>
          <h2 className="v-mono vl-h">Smaller builds</h2>
          <ul className="vl-mini">
            {WAFFLINGS.map((w) => (
              <li key={w.slug}>
                <ProjectLink href={w.href} className="vl-mini__row" {...rowHandlers(w.slug)}>
                  <span className="v-display vl-mini__name">{w.name}</span>
                  <span className="v-sans vl-mini__line">{w.line}</span>
                  <ArrowUpRight className="vl-mini__arrow" strokeWidth={2.25} aria-hidden />
                </ProjectLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="v-mono vl-h">Recognition</h2>
          <ul className="vl-mini">
            {RECOGNITION.map((r) => (
              <li key={r.label} className="vl-mini__row vl-mini__row--static">
                <span className="v-sans vl-mini__name vl-mini__name--sans">{r.label}</span>
                <span className="v-mono vl-mini__detail">{r.detail}</span>
              </li>
            ))}
          </ul>

          <h2 className="v-mono vl-h vl-h--gap">Toolkit</h2>
          <ul className="vl-tools" aria-label="Current toolkit">
            {TOOLKIT.map((t) => (
              <li key={t.file} title={t.name}>
                <Image src={toolIconSrc(t.file)} alt={t.name} width={36} height={36} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="vl-foot">
        <p className="v-mono vl-foot__kicker">Say hello</p>
        <button type="button" onClick={copy} className="v-display vl-foot__email">
          <span className="vl-foot__swap" data-copied={copied ? "" : undefined}>
            <span>{email}</span>
            <span aria-hidden>Copied to clipboard</span>
          </span>
        </button>
        <div className="vl-foot__row v-mono">
          <span>{BIO.education.join("  ·  ")}</span>
          <span className="vl-foot__links">
            <a href={LINKEDIN_HREF} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={GITHUB_HREF} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href={CV_HREF} target="_blank" rel="noopener noreferrer">CV</a>
          </span>
        </div>
      </footer>
    </main>
  );
}

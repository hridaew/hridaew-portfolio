"use client";

import type { ReactNode } from "react";
import { useScroller } from "@/components/sheet/scroller-context";
import { DOMIS_SECTIONS } from "@/lib/case-study-sections";
import { LightboxImage } from "@/components/virdio/Lightbox";

type LenisLike = {
  scrollTo: (target: HTMLElement, opts?: { offset?: number; duration?: number }) => void;
};

/** Same scroll behaviour as StickySidebar: sheet scroller, then Lenis, then native. */
function useScrollToSection() {
  const scroller = useScroller();
  return (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (scroller) {
      const top =
        scroller.scrollTop +
        (el.getBoundingClientRect().top - scroller.getBoundingClientRect().top) -
        24;
      scroller.scrollTo({ top, behavior: "smooth" });
      return;
    }
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    if (lenis) {
      lenis.scrollTo(el, { offset: -24, duration: 1.1 });
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

/** Chapter list under the glance strip. Labels come from DOMIS_SECTIONS so the rail and index never drift. */
export function DomisChapterIndex() {
  const scrollTo = useScrollToSection();
  const chapters = DOMIS_SECTIONS.filter((s) => s.id !== "hero");
  return (
    <nav aria-label="Chapters" className="dcs-chapter-index">
      <p className="site-label text-ink-subtle">Chapters</p>
      <ol>
        {chapters.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => scrollTo(c.id)}>
              <span className="dcs-ci-num">{c.number}</span>
              <span className="dcs-ci-title">{c.title ?? c.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function DomisChapterHead({
  number,
  title,
  lede,
}: {
  number: string;
  title: string;
  lede?: ReactNode;
}) {
  const total = String(DOMIS_SECTIONS.length - 1).padStart(2, "0");
  return (
    <header className="dcs-chapter-head">
      <p className="site-label dcs-chapter-num">
        Chapter {number} <span aria-hidden="true">/ {total}</span>
      </p>
      <h2 className="type-h2 text-ink">{title}</h2>
      {lede ? <p className="site-body text-ink-muted dcs-chapter-lede">{lede}</p> : null}
    </header>
  );
}

/** Small mono eyebrow above a sub-section heading (e.g. the feature name). */
export function DomisEyebrow({ children }: { children: ReactNode }) {
  return <p className="site-label dcs-eyebrow">{children}</p>;
}

/** The last line of each chapter: names the problem the next chapter solves. */
export function DomisBridge({ children }: { children: ReactNode }) {
  return (
    <p className="dcs-bridge site-body">
      <span aria-hidden="true" className="dcs-bridge-mark" />
      {children}
    </p>
  );
}

/** Closed-by-default disclosure for pipelines and other technical depth. */
export function DomisUnderTheHood({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="dcs-hood">
      <summary>
        <span className="site-label dcs-hood-label">Under the hood</span>
        <span className="dcs-hood-title">{title}</span>
        <span className="dcs-hood-caret" aria-hidden="true" />
      </summary>
      <div className="dcs-hood-body">{children}</div>
    </details>
  );
}

/** A captured screen on a quiet surface; opens in the lightbox. */
export function DomisShot({
  src,
  alt,
  width,
  height,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <div className={`dcs-shot ${className}`}>
      <LightboxImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        hoverScale={1}
        draggable={false}
      />
    </div>
  );
}

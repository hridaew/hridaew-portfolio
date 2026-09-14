"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { homepageProjects } from "@/data/homepage-projects";
import {
  PAINTING_CHAPTERS,
  PAINTING_FRAMES,
  clamp01,
  paintingChapterFromProgress,
  type PaintingChapter,
} from "@/data/home-painting-sequence";
import { usePageTransition } from "@/components/PageTransition";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { playClick } from "@/lib/audio";
import { cn } from "@/lib/utils";

const MovingPainting = dynamic(
  () => import("./MovingPainting").then((m) => m.MovingPainting),
  { ssr: false },
);

const SPLIT_TRACK_VH = 440;

function projectFor(chapter: PaintingChapter) {
  return homepageProjects.find((p) => p.slug === chapter.slug);
}

function readSectionProgress(
  section: HTMLElement,
  viewRoot: HTMLElement | null,
) {
  const viewTop = viewRoot ? viewRoot.getBoundingClientRect().top : 0;
  const viewH = viewRoot
    ? viewRoot.getBoundingClientRect().height
    : window.innerHeight;
  const rect = section.getBoundingClientRect();
  const range = Math.max(1, rect.height - viewH);
  const traveled = viewTop - rect.top;
  return clamp01(traveled / range);
}

function PaintingCopy({
  chapter,
  visible,
}: {
  chapter: PaintingChapter;
  visible: boolean;
}) {
  const project = projectFor(chapter);
  const { transitionTo } = usePageTransition();
  const { prefetchSheet } = useSheetNav();
  if (!project) return null;

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 md:p-8",
        "bg-gradient-to-t from-black/75 via-black/35 to-transparent pt-24",
        "transition-opacity duration-300 ease-out",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!visible}
    >
      <p className="type-caption-medium font-mono uppercase text-[#f4ead8]/55">
        Selected work · {chapter.kicker} / 04
      </p>
      <Link
        href={chapter.href}
        scroll={false}
        tabIndex={visible ? 0 : -1}
        onPointerEnter={() => prefetchSheet(chapter.href)}
        onFocus={() => prefetchSheet(chapter.href)}
        onClick={(e) => {
          e.preventDefault();
          playClick();
          transitionTo(chapter.href);
        }}
        className={cn(
          "group inline-flex max-w-full items-center",
          visible ? "pointer-events-auto" : "pointer-events-none",
          "type-h3 font-semibold text-[#f4ead8]",
          "rounded-sm focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[#f4ead8]/50 focus-visible:ring-offset-2",
          "focus-visible:ring-offset-transparent",
        )}
      >
        <span className="min-w-0">{chapter.short}</span>
        <ArrowRight
          className="ml-2 size-5 shrink-0 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-100"
          aria-hidden
          strokeWidth={2.25}
        />
      </Link>
      {project.contextTags?.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {project.contextTags.map((tag) => (
            <li key={tag}>
              <span className="inline-flex rounded-full border border-[#f4ead8]/18 bg-black/25 px-3 py-1 type-caption text-[#f4ead8]/80">
                {tag}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="max-w-[36rem] type-body text-[#f4ead8]/78">
        {project.slug === "memory-care" ? (
          <>
            R&amp;D for the MCES, a multi-modal installation by Maria Mortati
            for people living with mid-to-late stage dementia.
          </>
        ) : (
          project.description
        )}
      </p>
    </div>
  );
}

export function WorkPaintingPanel({
  variant,
}: {
  variant: "split" | "stack";
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const reduceMotion = useReducedMotion() === true;
  const [chapter, setChapter] = useState<PaintingChapter | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const sync = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const pane =
      variant === "split"
        ? document.querySelector<HTMLElement>('[data-home-pane="right"]')
        : null;
    const p = readSectionProgress(section, pane);
    progressRef.current = p;
    const next = paintingChapterFromProgress(p);
    setChapter((prev) =>
      prev?.slug === next?.slug ? prev : next,
    );
    setScrolled(p > 0.035);
  }, [variant]);

  useEffect(() => {
    const pane =
      variant === "split"
        ? document.querySelector<HTMLElement>('[data-home-pane="right"]')
        : null;
    const target: HTMLElement | Window = pane ?? window;
    const onScroll = () => sync();
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    sync();
    const raf = requestAnimationFrame(sync);
    return () => {
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [sync, variant]);

  const jumpTo = (holdProgress: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const pane =
      variant === "split"
        ? document.querySelector<HTMLElement>('[data-home-pane="right"]')
        : null;
    const viewH = pane ? pane.clientHeight : window.innerHeight;
    const range = Math.max(1, section.offsetHeight - viewH);
    const sectionTop = pane
      ? section.getBoundingClientRect().top -
        pane.getBoundingClientRect().top +
        pane.scrollTop
      : section.getBoundingClientRect().top + window.scrollY;
    const top = sectionTop + range * holdProgress;
    if (pane) {
      pane.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    } else {
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  const onNavKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const i = PAINTING_CHAPTERS.findIndex((c) => c.slug === chapter?.slug);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      const next = PAINTING_CHAPTERS[Math.min(PAINTING_CHAPTERS.length - 1, i + 1)];
      if (next) {
        e.preventDefault();
        jumpTo(next.holdProgress);
      }
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      const prev = PAINTING_CHAPTERS[Math.max(0, i <= 0 ? 0 : i - 1)];
      if (prev) {
        e.preventDefault();
        jumpTo(prev.holdProgress);
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="selected-work-painting"
      data-home-work-section
      className={cn(
        "relative isolate",
        variant === "split" ? "w-full" : "mx-auto w-full max-w-[640px]",
      )}
      aria-label="Selected work, told as a painting"
      onKeyDown={onNavKey}
    >
      <div
        className={cn(
          "sticky top-0 z-[1] overflow-hidden bg-[#120a1c]",
          variant === "split" ? "h-dvh" : "h-[min(72vh,640px)]",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PAINTING_FRAMES[0].src}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
          fetchPriority="high"
          decoding="async"
        />
        <MovingPainting
          progressRef={progressRef}
          reduceMotion={reduceMotion}
          className="absolute inset-0"
        />

        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(226,75,42,0.14)]" />

        <p
          className={cn(
            "pointer-events-none absolute left-6 top-6 type-caption-medium font-mono uppercase text-[#f4ead8]/45 transition-opacity duration-500 md:left-8 md:top-8",
            scrolled ? "opacity-0" : "opacity-100",
          )}
        >
          Scroll
        </p>

        <div
          className="absolute right-4 top-1/2 z-[2] flex -translate-y-1/2 flex-col gap-2 md:right-6"
          role="tablist"
          aria-label="Project frames"
        >
          {PAINTING_CHAPTERS.map((ch) => {
            const active = chapter?.slug === ch.slug;
            return (
              <button
                key={ch.slug}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`${ch.kicker} ${ch.short}`}
                onClick={() => jumpTo(ch.holdProgress)}
                className={cn(
                  "pointer-events-auto h-8 w-1.5 rounded-full transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4ead8]/60",
                  active
                    ? "bg-[#e24b2a] h-11"
                    : "bg-[#f4ead8]/28 hover:bg-[#f4ead8]/55",
                )}
              />
            );
          })}
        </div>

        {PAINTING_CHAPTERS.map((ch) => (
          <PaintingCopy
            key={ch.slug}
            chapter={ch}
            visible={chapter?.slug === ch.slug}
          />
        ))}
      </div>

      <div
        className="pointer-events-none"
        style={{
          height: variant === "split" ? `${SPLIT_TRACK_VH}vh` : "220vh",
        }}
        aria-hidden
      />

      <ol className="sr-only">
        {PAINTING_CHAPTERS.map((ch) => (
          <li key={ch.slug}>
            <a href={ch.href}>{ch.short}</a>
          </li>
        ))}
      </ol>
      <span className="sr-only">{PAINTING_FRAMES[0].alt}</span>
    </section>
  );
}

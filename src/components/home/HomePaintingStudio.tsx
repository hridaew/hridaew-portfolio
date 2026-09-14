"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";
import { useReducedMotion } from "framer-motion";
import { PAINTING_SEQUENCE } from "@/data/home-painting-sequence";
import {
  PaintingSequenceCanvas,
  type SequenceParams,
} from "./PaintingSequenceCanvas";
import {
  holdsForSequence,
  playheadToFrameIndex,
  progressToPlayhead,
  usePaintingSequenceDials,
} from "./usePaintingSequenceDials";

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function readProgress(section: HTMLElement, pane: HTMLElement | null) {
  const viewTop = pane ? pane.getBoundingClientRect().top : 0;
  const viewH = pane ? pane.clientHeight : window.innerHeight;
  const rect = section.getBoundingClientRect();
  const range = Math.max(1, rect.height - viewH);
  return clamp01((viewTop - rect.top) / range);
}

export function HomePaintingStudio() {
  const d = usePaintingSequenceDials();
  const reduceMotion = useReducedMotion() === true;
  const sectionRef = useRef<HTMLElement>(null);
  const playheadTarget = useRef(0);
  const playheadCurrent = useRef(0);
  const paramsRef = useRef<SequenceParams>({
    playhead: 0,
    dissolve: d.scroll.dissolve,
  });
  const [label, setLabel] = useState<string>(PAINTING_SEQUENCE[0].label);

  const sync = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const pane = document.querySelector<HTMLElement>('[data-home-pane="right"]');
    const progress = readProgress(section, pane);
    playheadTarget.current = progressToPlayhead(
      progress,
      holdsForSequence(d.scroll),
    );
  }, [d.scroll]);

  useEffect(() => {
    paramsRef.current.dissolve = d.scroll.dissolve;
  }, [d.scroll.dissolve]);

  useEffect(() => {
    const pane = document.querySelector<HTMLElement>('[data-home-pane="right"]');
    const target: HTMLElement | Window = pane ?? window;
    const onScroll = () => sync();
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    sync();
    return () => {
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sync]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const scrub = reduceMotion ? 1 : d.scroll.scrub;
      const k = scrub <= 0.001 ? 1 : 1 - Math.exp(-0.08 / Math.max(0.001, scrub));
      playheadCurrent.current +=
        (playheadTarget.current - playheadCurrent.current) * k;
      paramsRef.current.playhead = playheadCurrent.current;
      const idx = playheadToFrameIndex(
        playheadCurrent.current,
        PAINTING_SEQUENCE.length,
      );
      const next = PAINTING_SEQUENCE[idx].label;
      setLabel((prev) => (prev === next ? prev : next));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [d.scroll.scrub, reduceMotion]);

  return (
    <>
      <section
        ref={sectionRef}
        aria-label="Painting sequence, Domis then Obscura"
        className="relative"
      >
        <div className="sticky top-0 z-[1] bg-paper pb-3 pt-0">
          <figure className="flex w-full flex-col gap-3">
            <div
              className="relative mx-auto overflow-hidden bg-[#120a1c]"
              style={{
                width: `min(100%, calc(${d.canvas.maxHeightVh}vh * 3 / 4))`,
                aspectRatio: "3 / 4",
                borderRadius: d.canvas.radius,
              }}
            >
              <PaintingSequenceCanvas
                paramsRef={paramsRef}
                reduceMotion={reduceMotion}
              />
            </div>
            <figcaption className="type-caption-medium font-mono uppercase text-ink-muted">
              {label}
            </figcaption>
          </figure>
        </div>
        <div
          className="pointer-events-none"
          style={{ height: `${d.scroll.trackVh}vh` }}
          aria-hidden
        />
      </section>
      <DialRoot productionEnabled position="bottom-left" theme="dark" />
    </>
  );
}

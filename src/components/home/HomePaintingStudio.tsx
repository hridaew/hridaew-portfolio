"use client";

import { useCallback, useEffect, useRef } from "react";
import { DialRoot } from "dialkit";
import "dialkit/styles.css";
import { useReducedMotion } from "framer-motion";
import { DOMIS_PULLBACK } from "@/data/home-painting-sequence";
import {
  PaintingPullback,
  type PullbackParams,
} from "./PaintingPullback";
import {
  progressToPull,
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
  const pullTarget = useRef(0);
  const pullCurrent = useRef(0);
  const paramsRef = useRef<PullbackParams>({
    pull: 0,
    startSize: d.camera.startSize,
    startX: d.camera.startX,
    startY: d.camera.startY,
  });

  const sync = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const pane = document.querySelector<HTMLElement>('[data-home-pane="right"]');
    const progress = readProgress(section, pane);
    pullTarget.current = progressToPull(
      progress,
      d.scroll.holdStart,
      d.scroll.holdEnd,
    );
  }, [d.scroll.holdStart, d.scroll.holdEnd]);

  useEffect(() => {
    paramsRef.current.startSize = d.camera.startSize;
    paramsRef.current.startX = d.camera.startX;
    paramsRef.current.startY = d.camera.startY;
  }, [d.camera.startSize, d.camera.startX, d.camera.startY]);

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
      pullCurrent.current += (pullTarget.current - pullCurrent.current) * k;
      paramsRef.current.pull = pullCurrent.current;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [d.scroll.scrub, reduceMotion]);

  return (
    <>
      <section
        ref={sectionRef}
        aria-label="Domis painting, camera pulls back"
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
              <PaintingPullback
                paramsRef={paramsRef}
                reduceMotion={reduceMotion}
              />
            </div>
            <figcaption className="type-caption-medium font-mono uppercase text-ink-muted">
              {DOMIS_PULLBACK.label}
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

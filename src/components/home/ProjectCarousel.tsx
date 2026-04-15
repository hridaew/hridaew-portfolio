"use client";

import { useCallback, useMemo, useRef, type ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import clsx from "clsx";

/** Softer than Embla defaults: longer settle, higher drag threshold, start-aligned snaps. */
const EMBLA_OPTIONS = {
  axis: "x",
  align: "start",
  dragFree: true,
  containScroll: "trimSnaps",
  duration: 52,
  dragThreshold: 16,
} satisfies EmblaOptionsType;

type Props = {
  children: ReactNode;
  /** Viewport: breakout; overflow visible (page root clips past 100vw only—see `page.tsx`). */
  className?: string;
  /**
   * `gallery` — trailing pad matches work breakout (`md:pr-[104px]`).
   * `inline` — modest end pad when viewport is full column width (wafflings).
   */
  trackEndPadding?: "gallery" | "inline";
  /** When set, advances one slide on this interval (ms). Pauses on hover / interaction. */
  autoplayDelayMs?: number;
};

/**
 * Project image row — Embla drag-free (touch-style inertia) + wheel / trackpad via plugin.
 */
function allowCaptionSelect(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest("[data-carousel-allow-select]"))
  );
}

export function ProjectCarousel({
  children,
  className,
  trackEndPadding = "gallery",
  autoplayDelayMs,
}: Props) {
  const plugins = useMemo(() => {
    const list = [WheelGesturesPlugin()];
    if (autoplayDelayMs != null && autoplayDelayMs > 0) {
      list.push(
        Autoplay({
          delay: autoplayDelayMs,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        })
      );
    }
    return list;
  }, [autoplayDelayMs]);
  const [emblaRef] = useEmblaCarousel(EMBLA_OPTIONS, plugins);
  const detachSelectGuard = useRef<(() => void) | null>(null);

  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      detachSelectGuard.current?.();
      detachSelectGuard.current = null;
      emblaRef(node);
      if (!node) return;
      const onSelectStart = (e: Event) => {
        if (allowCaptionSelect(e.target)) return;
        e.preventDefault();
      };
      node.addEventListener("selectstart", onSelectStart);
      detachSelectGuard.current = () =>
        node.removeEventListener("selectstart", onSelectStart);
    },
    [emblaRef]
  );

  return (
    <div
      ref={setViewportRef}
      data-lenis-prevent
      className={clsx(className, "select-none")}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div
        className={clsx(
          "flex touch-pan-x select-none gap-8 pb-1 pt-0",
          trackEndPadding === "inline"
            ? "pr-6"
            : "pr-4 md:pr-[104px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}

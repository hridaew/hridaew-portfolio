"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import "./domis-ux-diagrams.css";

const SCALE_MIN = 0.75;
const SCALE_MAX = 1.75;
const SCALE_STEP = 0.1;
const SCALE_DEFAULT = 1;
/** Diagram width at 100% zoom — sized so edges clip + scroll on the board. */
const BASE_DIAGRAM_WIDTH_PX = 1924;
/** Slow crawl while the diagram is on screen (~px/sec). */
const AUTO_SCROLL_PX_PER_SEC = 32;
/** Resume auto-scroll after the user stops interacting. */
const AUTO_SCROLL_RESUME_MS = 2200;

type DomisUxDiagramEmbedProps = {
  /** Path under /public, e.g. `/assets/domis/diagrams/address-user-flow.svg` */
  src?: string | null;
  alt: string;
  /** Small uppercase eyebrow above the asset (omit if baked into the export). */
  type?: string;
  /** Board title (omit if baked into the export). */
  heading?: string;
  wide?: boolean;
  caption?: ReactNode;
  /** Horizontal scroll + edge fades for wide canvases. */
  scrollable?: boolean;
  /** Zoom controls that scale the diagram image inside the scroll frame. */
  zoomable?: boolean;
  /**
   * Shown until an authored asset is provided (or if the image fails to load).
   * Use the existing React diagram components as temporary stand-ins.
   */
  fallback?: ReactNode;
  className?: string;
};

function useScrollEdgeFade(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const max = scrollWidth - clientWidth;
      setFade({
        left: scrollLeft > 2,
        right: max > 2 && scrollLeft < max - 2,
      });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [enabled]);

  return { ref, fade };
}

/**
 * Slow ping-pong auto-scroll + mouse/pen drag-to-scroll.
 * Touch / trackpad keep native overflow scrolling (no setPointerCapture).
 */
function useScrollInteractions(
  enabled: boolean,
  scrollRef: RefObject<HTMLDivElement | null>,
) {
  const [grabbing, setGrabbing] = useState(false);
  const pausedUntilRef = useRef(0);
  const directionRef = useRef(1);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let raf = 0;
    let el: HTMLDivElement | null = null;
    let last = performance.now();
    let active = false;
    let startX = 0;
    let startScroll = 0;
    let pointerId = -1;

    const pause = (ms = AUTO_SCROLL_RESUME_MS) => {
      pausedUntilRef.current = performance.now() + ms;
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const isOnScreen = (node: HTMLDivElement) => {
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      if (r.height <= 0 || vh <= 0) return false;
      const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      return visible / r.height >= 0.25;
    };

    const onMove = (e: PointerEvent) => {
      if (!active || !el || e.pointerId !== pointerId) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
    };

    const onUp = (e: PointerEvent) => {
      if (!active || e.pointerId !== pointerId) return;
      active = false;
      draggingRef.current = false;
      setGrabbing(false);
      pause();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    // Only pause for horizontal intent — vertical page scroll over the
    // diagram used to keep auto-scroll permanently paused.
    const onWheel = (e: WheelEvent) => {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) + 2) {
        pause();
      }
    };

    const onDown = (e: PointerEvent) => {
      if (!el) return;
      if (e.pointerType === "touch") {
        pause();
        return;
      }
      if (e.button !== 0) return;
      active = true;
      pointerId = e.pointerId;
      draggingRef.current = true;
      setGrabbing(true);
      pause(60_000);
      startX = e.clientX;
      startScroll = el.scrollLeft;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };

    const bind = (node: HTMLDivElement) => {
      el = node;
      el.addEventListener("wheel", onWheel, { passive: true });
      el.addEventListener("pointerdown", onDown);
    };

    const tick = (now: number) => {
      if (cancelled) return;

      if (!el) {
        const node = scrollRef.current;
        if (node) bind(node);
        last = now;
        raf = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(48, now - last);
      last = now;

      const max = el.scrollWidth - el.clientWidth;
      if (
        !reduceMotion &&
        isOnScreen(el) &&
        !draggingRef.current &&
        now >= pausedUntilRef.current &&
        max > 4
      ) {
        const delta = (AUTO_SCROLL_PX_PER_SEC * dt) / 1000;
        const next = el.scrollLeft + directionRef.current * delta;
        if (next <= 0) {
          directionRef.current = 1;
          el.scrollLeft = 0;
        } else if (next >= max) {
          directionRef.current = -1;
          el.scrollLeft = max;
        } else {
          el.scrollLeft = next;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (el) {
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("pointerdown", onDown);
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [enabled, scrollRef]);

  return { grabbing };
}

/**
 * Embed a designer-authored UX diagram (SVG or PNG) in the Domis case-study
 * figure chrome. Prefer exporting from FigJam / Figma / Illustrator into
 * `public/assets/domis/diagrams/` — see that folder's README.
 */
export function DomisUxDiagramEmbed({
  src,
  alt,
  type,
  heading,
  wide = false,
  caption,
  scrollable = false,
  zoomable = false,
  fallback = null,
  className,
}: DomisUxDiagramEmbedProps) {
  const [failed, setFailed] = useState(false);
  const [scale, setScale] = useState(SCALE_DEFAULT);
  const showAsset = Boolean(src) && !failed;
  const { ref: scrollRef, fade } = useScrollEdgeFade(scrollable && showAsset);
  const { grabbing } = useScrollInteractions(scrollable && showAsset, scrollRef);

  const zoomOut = () =>
    setScale((s) => Math.max(SCALE_MIN, Number((s - SCALE_STEP).toFixed(2))));
  const zoomIn = () =>
    setScale((s) => Math.min(SCALE_MAX, Number((s + SCALE_STEP).toFixed(2))));

  // Re-run edge-fade math when zoom changes scrollWidth
  useEffect(() => {
    if (!scrollable) return;
    const el = scrollRef.current;
    if (!el) return;
    el.dispatchEvent(new Event("scroll"));
  }, [scale, scrollable, scrollRef]);

  if (!showAsset) {
    if (!fallback) return null;
    return (
      <figure
        className={cn(
          "dcs-ux-figure",
          wide && "dcs-ux-figure-wide",
          className,
        )}
      >
        {fallback}
        {caption ? (
          <figcaption className="dcs-caption site-body">{caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  const diagramWidth = Math.round(BASE_DIAGRAM_WIDTH_PX * scale);

  return (
    <figure
      className={cn(
        "dcs-ux-figure",
        wide && "dcs-ux-figure-wide",
        className,
      )}
    >
      <div className="dud dud-board dux-embed" role="region" aria-label={alt}>
        <div className="dux-embed-toolbar">
          {type ? <p className="dud-type dux-embed-type">{type}</p> : <span />}

          {zoomable ? (
            <div className="djm-zoom" role="group" aria-label="Zoom diagram">
              <button
                type="button"
                className="djm-zoom-btn"
                onClick={zoomOut}
                disabled={scale <= SCALE_MIN}
                aria-label="Zoom out"
              >
                −
              </button>
              <span className="djm-zoom-value" aria-live="polite">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                className="djm-zoom-btn"
                onClick={zoomIn}
                disabled={scale >= SCALE_MAX}
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          ) : null}
        </div>

        {heading ? (
          <p className="dud-heading dux-embed-heading">{heading}</p>
        ) : null}

        {scrollable ? (
          <p className="duf-scroll-hint" aria-hidden>
            drag or scroll -&gt;
          </p>
        ) : null}

        <div
          ref={scrollable ? scrollRef : undefined}
          className={cn(
            "dux-embed-frame",
            scrollable && "duf-scroll",
            scrollable && "dux-embed-frame-draggable",
            scrollable && grabbing && "is-dragging",
            scrollable && fade.left && "duf-scroll-fade-left",
            scrollable && fade.right && "duf-scroll-fade-right",
          )}
        >
          <img
            className="dux-embed-img"
            src={src!}
            alt=""
            width={diagramWidth}
            draggable={false}
            style={
              zoomable || scrollable
                ? { width: diagramWidth, maxWidth: "none" }
                : undefined
            }
            onError={() => setFailed(true)}
            onLoad={() => {
              const el = scrollRef.current;
              if (el) el.dispatchEvent(new Event("scroll"));
            }}
          />
        </div>
      </div>
      {caption ? (
        <figcaption className="dcs-caption site-body">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

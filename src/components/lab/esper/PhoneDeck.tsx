"use client";

import useEmblaCarousel from "embla-carousel-react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { focusRing } from "./chrome";
import { GuestbookList, type GuestNote } from "./Guestbook";
import { AboutBody, BIO, IntroLinks, StationDetails } from "./StationContent";
import { BOARD, STATIONS } from "./stations";

const INTRO = "intro";
const ABOUT = "taste";
/** The places, left to right: me (the whole house), then every room in the bar's order. */
const CARDS = [INTRO, ...STATIONS.map((s) => s.id)];
const cardOf = (active: string | null) => (active ? CARDS.indexOf(active === BOARD.id ? ABOUT : active) : 0);
const titleOf = (id: string) => (id === INTRO ? "Hridae Walia" : (STATIONS.find((s) => s.id === id)?.title ?? ""));
const lineOf = (id: string) =>
  id === INTRO ? "Product Designer" : id === ABOUT ? "Painting, basketball, games, Arsenal" : (STATIONS.find((s) => s.id === id)?.role ?? "Experiments and side projects");

/** The sheet's springs: snappy, settling without a wobble you'd notice. */
const SPRING = { type: "spring" as const, stiffness: 320, damping: 34 };
/** The one set of measures everything lines up on: the sheet sits MARGIN in from the screen's edges, and everything
 *  in it (titles, text, the first picture) starts PAD in from the sheet's. */
const MARGIN = 8;
const PAD = 20;
/** How much of the room always stays above the open sheet (under the theme toggle). */
const TOP_GAP = 64;

type Props = {
  ready: boolean;
  active: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onOpen?: (id: string) => void;
  onInsets?: (top: number, bottom: number) => void;
  guestbook: { notes: GuestNote[]; highlight: string | null; onDelete: (id: string) => void; onCompose: () => void };
};

/**
 * The room on a phone. The house has the screen; a glass sheet at the bottom names the place you're at, and swiping
 * the name takes the camera from room to room (the first, me, is the whole house). Open, the sheet is exactly as
 * tall as what it has to say (pictures, dates, the summary), so nothing needs scrolling; a tap on a picture opens the
 * case study. Pull it down, or tap the name, and it folds to just the name. The room is told how much of the screen
 * the sheet covers, so what the camera looks at stays centred in what's left.
 */
export function PhoneDeck({ ready, active, onSelect, onBack, onOpen, onInsets, guestbook }: Props) {
  const reduce = useReducedMotion();
  const [emblaRef, embla] = useEmblaCarousel({ align: () => PAD, containScroll: false, duration: 26 });
  const [card, setCard] = useState(() => cardOf(active));

  // ---- geometry: the sheet floats MARGIN from the bottom and sides, as tall as what it shows: the name alone
  // (folded), or the name and everything under it (open), never taller than the screen less TOP_GAP ----
  const header = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ max: 600, head: 96, safe: 0 });
  const [contentH, setContentH] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      const safe = probe.current?.offsetHeight ?? 0;
      setGeo({ max: Math.round(window.innerHeight - TOP_GAP - MARGIN - safe), head: header.current?.offsetHeight ?? 96, safe });
    };
    measure();
    window.addEventListener("resize", measure);
    // Fonts and pictures settle after the first layout: keep both heights current.
    const ro = new ResizeObserver(() => {
      setContentH(content.current?.offsetHeight ?? 0);
      measure();
    });
    if (content.current) ro.observe(content.current);
    if (header.current) ro.observe(header.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);
  const folded = geo.head;
  const unfolded = Math.min(geo.max, geo.head + contentH);
  const h = useMotionValue(0);
  // It rises into place once, when the room is ready.
  const rise = useMotionValue(140);
  // First look: open on me, so the name, the bio and the links are the first thing read.
  const [open, setOpen] = useState(true);
  const target = open ? unfolded : folded;
  const risen = useRef(false);
  useEffect(() => {
    if (!ready) return;
    if (!risen.current) {
      risen.current = true;
      h.set(target);
      animate(rise, 0, reduce ? { duration: 0.18 } : SPRING);
      return;
    }
    animate(h, target, reduce ? { duration: 0.18 } : SPRING);
  }, [ready, target, h, rise, reduce]);
  const settle = useCallback((toOpen: boolean) => setOpen(toOpen), []);

  // The room keeps what it's looking at in the open space above the sheet.
  const report = useCallback(() => onInsets?.(0, Math.max(0, h.get() - rise.get()) + MARGIN + geo.safe), [onInsets, h, rise, geo.safe]);
  useMotionValueEvent(h, "change", report);
  useMotionValueEvent(rise, "change", report);
  useEffect(() => report(), [report]);
  // What's below the name fades up as the sheet opens.
  const reveal = useTransform(h, [folded, folded + (unfolded - folded) * 0.6], [0, 1]);

  // ---- dragging the sheet by its header (sideways drags belong to the names) ----
  const drag = useRef<{ x: number; y: number; y0: number; axis: "" | "x" | "y"; t: number; v: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, y0: h.get(), axis: "", t: performance.now(), v: 0 };
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.axis) {
        if (Math.hypot(dx, dy) < 7) return;
        d.axis = Math.abs(dy) > Math.abs(dx) ? "y" : "x";
      }
      if (d.axis !== "y") return;
      // The sheet follows the finger (up is taller); past either end it gives a little, like rubber.
      let to = d.y0 - dy;
      if (to > unfolded) to = unfolded + Math.sqrt(to - unfolded) * 3;
      if (to < folded) to = folded - Math.sqrt(folded - to) * 3;
      const now = performance.now();
      d.v = ((to - h.get()) / Math.max(1, now - d.t)) * 1000;
      d.t = now;
      h.set(to);
    };
    const up = () => {
      const d = drag.current;
      drag.current = null;
      if (!d || d.axis !== "y") return;
      const toOpen = Math.abs(d.v) > 400 ? d.v > 0 : h.get() > (folded + unfolded) / 2;
      setOpen(toOpen);
      // The same target again still springs back from wherever the finger left it.
      animate(h, toOpen ? unfolded : folded, reduce ? { duration: 0.18 } : { ...SPRING, velocity: d.v });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [folded, unfolded, h, reduce]);

  // ---- the names and the room, kept in step both ways ----
  const activeRef = useRef(active);
  useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);
  const want = cardOf(active);
  useEffect(() => {
    if (!embla) return;
    const onSel = () => {
      const i = embla.selectedScrollSnap();
      setCard(i);
      if (i === cardOf(activeRef.current)) return; // the room is already there (or the names followed it)
      const id = CARDS[i];
      if (id === INTRO) {
        onBack();
        // From the Visitor Board, one step back is About; the first card is the whole house.
        if (activeRef.current === BOARD.id) onBack();
      } else onSelect(id);
    };
    embla.on("select", onSel);
    return () => {
      embla.off("select", onSel);
    };
  }, [embla, onBack, onSelect]);
  useEffect(() => {
    if (embla && embla.selectedScrollSnap() !== want) embla.scrollTo(want);
  }, [embla, want]);
  // The Visitor Board is read in the open sheet.
  useEffect(() => {
    if (active !== BOARD.id) return;
    const t = window.setTimeout(() => settle(true), 0); // async: not a setState inside the effect itself
    return () => window.clearTimeout(t);
  }, [active, settle]);

  // A tap on the name in front folds or opens the sheet; on the next one along, goes there.
  const tapName = (i: number) => {
    if (i !== card) embla?.scrollTo(i);
    else settle(!open);
  };

  const id = CARDS[card];
  const station = STATIONS.find((s) => s.id === id);

  return (
    <>
      <div ref={probe} aria-hidden className="pointer-events-none invisible absolute" style={{ height: "env(safe-area-inset-bottom)" }} />
      <motion.section
        aria-label="Places in the room"
        className="pointer-events-auto absolute"
        style={{ left: MARGIN, right: MARGIN, bottom: `calc(${MARGIN}px + env(safe-area-inset-bottom))`, height: h, y: rise }}
      >
        {/* The glass is its own layer: .esper-liquid sets position: relative, which would undo the sheet's placement. */}
        <div className="esper-liquid flex h-full flex-col overflow-hidden rounded-[28px]">
          {/* Header: the grabber and the names. Dragged up and down here; the names take sideways swipes. */}
          <div ref={header} onPointerDown={onDown} className="relative z-[2] shrink-0" style={{ touchAction: "none", paddingBottom: PAD }}>
            <button
              type="button"
              aria-label={open ? "Show less" : "Show more"}
              onClick={() => settle(!open)}
              className={cn("mx-auto block h-5 w-16 rounded-full", focusRing)}
            >
              {/* The grabber band is PAD tall, so the name starts PAD from the top, as from the sides and foot. */}
              <span aria-hidden className="mx-auto mt-[7px] block h-[5px] w-9 rounded-full bg-black/[0.22]" />
            </button>
            {/* The next name along shows faintly at the right edge, fading out, so the row reads as swipeable. */}
            <div
              ref={emblaRef}
              className="overflow-hidden"
              style={{ maskImage: "linear-gradient(to right, #000 calc(100% - 56px), transparent)", WebkitMaskImage: "linear-gradient(to right, #000 calc(100% - 56px), transparent)" }}
            >
              <div className="flex">
                {CARDS.map((cid, i) => (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => tapName(i)}
                    aria-current={i === card ? "true" : undefined}
                    className={cn(
                      "min-w-0 shrink-0 grow-0 rounded-xl pr-4 text-left transition-opacity duration-300 ease-out",
                      i === card ? "opacity-100" : "opacity-35",
                      focusRing,
                    )}
                    style={{ flexBasis: `calc(100% - ${PAD * 2 + 24}px)` }}
                  >
                    <span className="site-chapter-heading block truncate">{titleOf(cid)}</span>
                    <span className="type-caption mt-0.5 block truncate text-black/60">{lineOf(cid)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* The place in full: the sheet opens exactly as far as this is tall (scrolling only past the top gap). */}
          <motion.div
            style={{ opacity: reveal, paddingInline: PAD }}
            className="scrollbar-hide relative z-[2] min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
            inert={!open}
          >
            <div ref={content} className="pb-5">
              <div key={id} className="esper-dossier-in">
                {id === INTRO && (
                  <>
                    <p className="site-body text-black/90">{BIO}</p>
                    <IntroLinks className="mt-4" />
                  </>
                )}
                {id === ABOUT && active === BOARD.id && <GuestbookList {...guestbook} />}
                {id === ABOUT && active !== BOARD.id && <AboutBody />}
                {station && id !== ABOUT && <StationDetails station={station} onOpen={onOpen} className="-mt-5" phone />}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
}

"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { DeferredVideo } from "@/components/DeferredVideo";
import {
  homepageProjects,
  virdioCard2ExtraImage,
  virdioCard3ExtraImages,
  obscuraCard2ExtraImages,
  type HomepageProject,
  type ProjectCardData,
} from "@/data/homepage-projects";
import { usePageTransition } from "@/components/PageTransition";
import { useSheetNav } from "@/components/sheet/SheetNav";
import { playClick } from "@/lib/audio";
import {
  detectSvgBackdropFilterUrl,
  isLikelySafari,
} from "@/lib/obscuraLiquidGlass";
import {
  HOME_CARD_CAPTION_PAD,
  HOME_PROJECT_EMBLA_VIEWPORT,
  HOME_TEXT_MEASURE,
} from "./homeGrid";
import {
  OBSCURA_LIQUID_GLASS_FILTER_ID,
  OBSCURA_LIQUID_GLASS_LENS_PX,
} from "./ObscuraLiquidGlassFilterSvg";
import { ProjectCarousel } from "./ProjectCarousel";
import { useBrowserEngine } from "@/lib/useBrowserEngine";
import { useChoomLingo } from "@/components/home/HomeChoomLingoContext";
import {
  CHOOM,
  CHOOM_MEMORY_CHIPS,
  choomCardCaption,
  choomProjectTitle,
  choomProjectDescription,
} from "@/lib/homeChoomCopy";

const ThreeGlassLensFallback = dynamic(
  () =>
    import("../obscura/ThreeGlassLensFallback").then(
      (m) => m.ThreeGlassLensFallback
    ),
  { ssr: false }
);

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function projectPath(slug: string) {
  return `/${slug}`;
}

function ProjectTitleLink({
  slug,
  title,
  displayTitle,
}: {
  slug: string;
  title: string;
  /** Visible title (e.g. choom lingo); falls back to `title`. */
  displayTitle?: string;
}) {
  const href = projectPath(slug);
  const { transitionTo } = usePageTransition();
  const { prefetchSheet } = useSheetNav();
  const label = displayTitle ?? title;

  return (
    <Link
      href={href}
      scroll={false}
      onPointerEnter={() => prefetchSheet(href)}
      onFocus={() => prefetchSheet(href)}
      onClick={(e) => {
        e.preventDefault();
        playClick();
        transitionTo(href);
      }}
      className="group relative inline-flex min-w-0 max-w-full items-center rounded-sm font-[family-name:var(--font-geist)] text-base font-bold leading-normal text-ink transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.28] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]"
    >
      <span className="min-w-0">{label}</span>
      <ArrowRight
        className="pointer-events-none absolute top-1/2 left-full ml-2 size-[1.05rem] shrink-0 -translate-x-1.5 -translate-y-1/2 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden
        strokeWidth={2.25}
      />
    </Link>
  );
}

/* ── Decorative blur orbs (slow drift inside card clip) ── */

function OrbField({
  color1,
  color2,
  driftDelay = 0,
}: {
  color1: string;
  color2: string;
  /** Stagger start so cards in a row are not perfectly in sync */
  driftDelay?: number;
}) {
  const reduceMotion = useReducedMotion();

  const driftTransition = (duration: number, phase = 0) =>
    reduceMotion
      ? { duration: 0 }
      : {
          duration,
          repeat: Infinity,
          ease: "easeInOut" as const,
          delay: driftDelay + phase,
        };

  return (
    <>
      <motion.div
        className="pointer-events-none absolute left-[-100px] top-[-115px] size-[320px] rounded-[244px] blur-[48px] opacity-80 will-change-transform"
        style={{ backgroundColor: color1 }}
        animate={
          reduceMotion
            ? { x: 0, y: 0 }
            : {
                x: [0, 78, -27, 51, -33, 0],
                y: [0, 36, -48, -18, 57, 0],
              }
        }
        transition={driftTransition(23, 0)}
      />
      <motion.div
        className="pointer-events-none absolute left-[50px] top-[-95px] size-[290px] rounded-[244px] blur-[48px] opacity-80 will-change-transform"
        style={{ backgroundColor: color2 }}
        animate={
          reduceMotion
            ? { x: 0, y: 0 }
            : {
                x: [0, -62, 44, -18, 68, 0],
                y: [0, 48, -38, 62, -28, 0],
              }
        }
        transition={driftTransition(20, 0.15)}
      />
      <motion.div
        className="pointer-events-none absolute left-[336px] top-[51px] flex size-[360px] items-center justify-center -rotate-[135deg] will-change-transform"
        animate={
          reduceMotion
            ? { x: 0, y: 0 }
            : {
                x: [0, -56, 68, -32, 20, 0],
                y: [0, 44, -62, 36, -26, 0],
              }
        }
        transition={driftTransition(25, 0.3)}
      >
        <div
          className="size-[320px] rounded-[244px] blur-[48px] opacity-80"
          style={{ backgroundColor: color1 }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-[265px] top-[-33px] flex size-[324px] items-center justify-center -rotate-[135deg] will-change-transform"
        animate={
          reduceMotion
            ? { x: 0, y: 0 }
            : {
                x: [0, 66, -44, 32, -22, 0],
                y: [0, -34, 48, -52, 28, 0],
              }
        }
        transition={driftTransition(21, 0.45)}
      >
        <div
          className="size-[290px] rounded-[244px] blur-[48px] opacity-80"
          style={{ backgroundColor: color2 }}
        />
      </motion.div>
    </>
  );
}

/* ── Single project gallery card (696×392) ── */

function GalleryCard({
  card,
  bgColor,
  orbColor1,
  orbColor2,
  orbDriftDelay = 0,
  extraImages,
  projectHref,
  projectTitle,
  virdioIridescent = false,
  domisDotMatrix = false,
  obscuraLiquidLens = false,
  mcesFog = false,
  fluid = false,
  captionOverride,
}: {
  card: ProjectCardData;
  bgColor: string;
  orbColor1: string;
  orbColor2: string;
  /** Seconds; offsets this card’s orbs from siblings in the horizontal gallery */
  orbDriftDelay?: number;
  extraImages?: { src: string; alt: string; className: string }[];
  /** Case study route, e.g. `/domis` */
  projectHref: string;
  /** Accessible name for the clickable card stack */
  projectTitle: string;
  /** Replaces `card.caption` when set (e.g. choom lingo). */
  captionOverride?: string;
  /** Pearlescent foil overlay on the home work row (Virdio only) */
  virdioIridescent?: boolean;
  /** Subtle animated dot mesh on card bg (Domis only; stays in isolated decoration layer) */
  domisDotMatrix?: boolean;
  /** Tobii-style liquid glass lens cursor over card media (Obscura only) */
  obscuraLiquidLens?: boolean;
  /** Light drifting fog on card bg (MCES / memory-care only; isolated decoration layer) */
  mcesFog?: boolean;
  /** Mobile single-card layout: fluid width + fixed aspect ratio */
  fluid?: boolean;
}) {
  const { transitionTo } = usePageTransition();
  const { prefetchSheet } = useSheetNav();
  const reduceTapMotion = useReducedMotion();
  const cardTapRef = useRef<{ x: number; y: number } | null>(null);
  const cardShellRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement | null>(null);
  const engine = useBrowserEngine();
  const foilRafRef = useRef(0);
  const foilPointerRef = useRef({ x: 50, y: 50 });
  const obscuraLensRafRef = useRef(0);
  const obscuraLensPendingRef = useRef({ x: 348, y: 196 });

  const [obscuraPointerOver, setObscuraPointerOver] = useState(false);
  const [obscuraLens, setObscuraLens] = useState({ x: 348, y: 196 });
  const [obscuraSvgBackdrop, setObscuraSvgBackdrop] = useState(false);
  const [obscuraSafariReticle, setObscuraSafariReticle] = useState(false);

  useEffect(() => {
    if (!obscuraLiquidLens) return;
    const svg = detectSvgBackdropFilterUrl();
    setObscuraSvgBackdrop(svg);
    setObscuraSafariReticle(!svg && isLikelySafari());
  }, [obscuraLiquidLens]);

  const flushFoilCssVars = useCallback(() => {
    const el = cardShellRef.current;
    if (!el) return;
    const p = foilPointerRef.current;
    el.style.setProperty("--virdio-foil-x", `${p.x}%`);
    el.style.setProperty("--virdio-foil-y", `${p.y}%`);
  }, []);

  const onVirdioShellPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!virdioIridescent) return;
      const shell = cardShellRef.current;
      if (!shell) return;
      const r = shell.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      foilPointerRef.current = {
        x: clamp(((e.clientX - r.left) / w) * 100, 6, 94),
        y: clamp(((e.clientY - r.top) / h) * 100, 6, 94),
      };
      if (foilRafRef.current) return;
      foilRafRef.current = requestAnimationFrame(() => {
        foilRafRef.current = 0;
        flushFoilCssVars();
      });
    },
    [flushFoilCssVars, virdioIridescent]
  );

  const onVirdioShellPointerLeave = useCallback(() => {
    if (!virdioIridescent) return;
    if (foilRafRef.current) {
      cancelAnimationFrame(foilRafRef.current);
      foilRafRef.current = 0;
    }
    foilPointerRef.current = { x: 50, y: 50 };
    cardShellRef.current?.style.setProperty("--virdio-foil-x", "50%");
    cardShellRef.current?.style.setProperty("--virdio-foil-y", "50%");
  }, [virdioIridescent]);

  const onDomisDotPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!domisDotMatrix) return;
      const shell = cardShellRef.current;
      if (!shell) return;
      const r = shell.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      const x = clamp(((e.clientX - r.left) / w) * 100, 0, 100);
      const y = clamp(((e.clientY - r.top) / h) * 100, 0, 100);
      shell.style.setProperty("--domis-dot-x", `${x}%`);
      shell.style.setProperty("--domis-dot-y", `${y}%`);
      shell.style.setProperty("--domis-dot-heat", "1");
    },
    [domisDotMatrix]
  );

  const onDomisDotPointerLeave = useCallback(() => {
    if (!domisDotMatrix) return;
    const shell = cardShellRef.current;
    if (!shell) return;
    shell.style.setProperty("--domis-dot-x", "50%");
    shell.style.setProperty("--domis-dot-y", "50%");
    shell.style.setProperty("--domis-dot-heat", "0");
  }, [domisDotMatrix]);

  const onMcesFogPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!mcesFog) return;
      const shell = cardShellRef.current;
      if (!shell) return;
      const r = shell.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      const x = clamp(((e.clientX - r.left) / w) * 100, 0, 100);
      const y = clamp(((e.clientY - r.top) / h) * 100, 0, 100);
      shell.style.setProperty("--mces-fog-x", `${x}%`);
      shell.style.setProperty("--mces-fog-y", `${y}%`);
      shell.style.setProperty("--mces-fog-heat", "1");
    },
    [mcesFog]
  );

  const onMcesFogPointerLeave = useCallback(() => {
    if (!mcesFog) return;
    const shell = cardShellRef.current;
    if (!shell) return;
    shell.style.setProperty("--mces-fog-x", "50%");
    shell.style.setProperty("--mces-fog-y", "50%");
    shell.style.setProperty("--mces-fog-heat", "0");
  }, [mcesFog]);

  const flushObscuraLens = useCallback(() => {
    obscuraLensRafRef.current = 0;
    const p = obscuraLensPendingRef.current;
    setObscuraLens({ x: p.x, y: p.y });
  }, []);

  const onObscuraLensPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!obscuraLiquidLens) return;
      const shell = cardShellRef.current;
      if (!shell) return;
      const r = shell.getBoundingClientRect();
      obscuraLensPendingRef.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
      };
      if (obscuraLensRafRef.current) return;
      obscuraLensRafRef.current = requestAnimationFrame(flushObscuraLens);
    },
    [flushObscuraLens, obscuraLiquidLens]
  );

  const onShellPointerEnter = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (obscuraLiquidLens) {
        setObscuraPointerOver(true);
        const shell = cardShellRef.current;
        if (shell) {
          const r = shell.getBoundingClientRect();
          obscuraLensPendingRef.current = {
            x: e.clientX - r.left,
            y: e.clientY - r.top,
          };
          setObscuraLens({ ...obscuraLensPendingRef.current });
        }
      }
      if (mcesFog) {
        onMcesFogPointerMove(e);
      }
    },
    [obscuraLiquidLens, mcesFog, onMcesFogPointerMove]
  );

  const onShellPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      onVirdioShellPointerMove(e);
      onDomisDotPointerMove(e);
      onObscuraLensPointerMove(e);
      onMcesFogPointerMove(e);
    },
    [
      onVirdioShellPointerMove,
      onDomisDotPointerMove,
      onObscuraLensPointerMove,
      onMcesFogPointerMove,
    ]
  );

  const onShellPointerLeave = useCallback(() => {
    onVirdioShellPointerLeave();
    onDomisDotPointerLeave();
    onMcesFogPointerLeave();
    if (obscuraLensRafRef.current) {
      cancelAnimationFrame(obscuraLensRafRef.current);
      obscuraLensRafRef.current = 0;
    }
    setObscuraPointerOver(false);
  }, [
    onVirdioShellPointerLeave,
    onDomisDotPointerLeave,
    onMcesFogPointerLeave,
  ]);

  useEffect(() => {
    return () => {
      if (foilRafRef.current) cancelAnimationFrame(foilRafRef.current);
      if (obscuraLensRafRef.current) cancelAnimationFrame(obscuraLensRafRef.current);
    };
  }, []);

  const onCardPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    cardTapRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const warmSheet = useCallback(() => {
    prefetchSheet(projectHref);
  }, [prefetchSheet, projectHref]);

  const onCardPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const s = cardTapRef.current;
      cardTapRef.current = null;
      if (!s) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > 14) return;
      playClick();
      transitionTo(projectHref);
    },
    [projectHref, transitionTo]
  );

  const openCaseStudy = useCallback(() => {
    playClick();
    transitionTo(projectHref);
  }, [projectHref, transitionTo]);

  const onCardKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      openCaseStudy();
    },
    [openCaseStudy]
  );

  const cardShellStyle: CSSProperties = {
    backgroundColor: bgColor,
    ...(virdioIridescent
      ? {
          ["--virdio-foil-x"]: "50%",
          ["--virdio-foil-y"]: "50%",
        }
      : {}),
    ...(domisDotMatrix
      ? {
          ["--domis-dot-x"]: "50%",
          ["--domis-dot-y"]: "50%",
          ["--domis-dot-heat"]: "0",
        }
      : {}),
    ...(mcesFog
      ? {
          ["--mces-fog-x"]: "50%",
          ["--mces-fog-y"]: "50%",
          ["--mces-fog-heat"]: "0",
        }
      : {}),
  };

  return (
    <motion.div
      role="link"
      tabIndex={0}
      aria-label={`Open case study: ${projectTitle}`}
      className={`flex shrink-0 snap-center flex-col items-start outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.24] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)] ${
        mcesFog ? "cursor-mces-gallery-card" : "cursor-pointer"
      } ${fluid ? "w-full min-w-0 gap-4" : "gap-4"}`}
      whileTap={reduceTapMotion ? undefined : { scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 520,
        damping: 26,
        mass: 0.85,
      }}
      onPointerDown={onCardPointerDown}
      onPointerUp={onCardPointerUp}
      onPointerEnter={warmSheet}
      onFocus={warmSheet}
      onKeyDown={onCardKeyDown}
    >
      <div
        ref={cardShellRef}
        className={`relative shrink-0 overflow-clip rounded-2xl${
          virdioIridescent ? " group/virdio-card" : ""
        }${obscuraLiquidLens && obscuraPointerOver ? " cursor-none" : ""}${
          mcesFog ? " cursor-mces-gallery-card" : ""
        } ${
          fluid
            ? "h-auto w-full aspect-[696/392]"
            : "home-work-card-frame"
        }`}
        style={cardShellStyle}
        onPointerEnter={
          obscuraLiquidLens || mcesFog ? onShellPointerEnter : undefined
        }
        onPointerMove={
          virdioIridescent ||
          domisDotMatrix ||
          obscuraLiquidLens ||
          mcesFog
            ? onShellPointerMove
            : undefined
        }
        onPointerLeave={
          virdioIridescent ||
          domisDotMatrix ||
          obscuraLiquidLens ||
          mcesFog
            ? onShellPointerLeave
            : undefined
        }
      >
        {/* Desktop: scale 696×392 design stage to the frame (container query). */}
        <div className={fluid ? "contents" : "home-work-card-stage"}>
        {/*
          Decorations (orbs, optional Domis dots, optional MCES fog, optional Virdio foil) sit in
          an isolated layer so mix-blend effects only composite with orbs/bg — not with card
          imagery, which lives in the sibling media layer above (z-10).
        */}
        <div
          className="pointer-events-none absolute inset-0 z-0 isolate overflow-hidden rounded-2xl"
          aria-hidden
        >
          <OrbField
            color1={orbColor1}
            color2={orbColor2}
            driftDelay={orbDriftDelay}
          />

          {domisDotMatrix && (
            <>
              <div
                className="domis-card-dot-mesh pointer-events-none absolute inset-0 rounded-2xl"
                aria-hidden
              />
              <div
                className="domis-card-dot-mesh-pop pointer-events-none absolute inset-0 rounded-2xl"
                aria-hidden
              />
            </>
          )}

          {mcesFog && (
            <>
              <div
                className="mces-card-fog-base pointer-events-none absolute inset-0 rounded-2xl"
                aria-hidden
              />
              <div
                className="mces-card-fog-hover pointer-events-none absolute inset-0 rounded-2xl"
                aria-hidden
              />
            </>
          )}

          {virdioIridescent && (
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute left-1/2 top-1/2 h-[210%] w-[210%] -translate-x-1/2 -translate-y-1/2 transition-[transform] duration-150 ease-out group-hover/virdio-card:scale-[1.05]">
                <div
                  className="virdio-iridescent-foil h-full w-full opacity-[0.42] transition-opacity duration-150 ease-out group-hover/virdio-card:opacity-[0.64] mix-blend-soft-light blur-3xl"
                  style={{
                    background:
                      "conic-gradient(from 0deg at var(--virdio-foil-x, 50%) var(--virdio-foil-y, 50%), rgba(230, 210, 255, 0.42), rgba(120, 200, 255, 0.36), rgba(255, 175, 235, 0.34), rgba(165, 250, 225, 0.28), rgba(210, 175, 255, 0.4), rgba(230, 210, 255, 0.42))",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Screenshots — always above shader/orbs; pass pointer through when shell tracks pointer */}
        <div
          className={`absolute inset-0 z-10${
            virdioIridescent ||
            domisDotMatrix ||
            obscuraLiquidLens ||
            mcesFog
              ? " pointer-events-none"
              : ""
          }`}
        >
          {card.videoSrc ? (
            <DeferredVideo
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={card.videoSrc}
              poster={card.imageSrc}
              className={`work-gallery-card-video ${card.imageClassName} pointer-events-none select-none outline-none`}
              loop
              muted
              tabIndex={-1}
              controls={false}
              controlsList="nodownload nofullscreen noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
              aria-label={card.imageAlt}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <Image
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              src={card.imageSrc}
              alt={card.imageAlt}
              width={1200}
              height={1200}
              sizes="(max-width: 768px) 90vw, 520px"
              draggable={false}
              className={card.imageClassName}
            />
          )}

          {extraImages?.map((img, i) => (
            <Image
              key={i}
              src={img.src}
              alt={img.alt}
              width={800}
              height={800}
              sizes="(max-width: 768px) 40vw, 240px"
              draggable={false}
              className={img.className}
            />
          ))}

          {/* Dev note for future video swap — inside media layer so it never stacks above art */}
          {card.videoNote && (
            <p className="absolute left-1/2 -translate-x-1/2 top-1/2 font-[family-name:var(--font-geist-mono)] text-xs text-ink uppercase whitespace-nowrap pointer-events-none opacity-0">
              {card.videoNote}
            </p>
          )}
        </div>

        {/* Obscura: kube.io-style liquid glass — SVG displacement + backdrop-filter (Chrome); WebGL fallback elsewhere */}
        {obscuraLiquidLens && obscuraPointerOver && engine === "chromium" && (
          <div
            className="pointer-events-none absolute z-[25] h-0 w-0"
            style={{ left: obscuraLens.x, top: obscuraLens.y }}
            aria-hidden
          >
            <div
              className={
                obscuraSvgBackdrop
                  ? "rounded-full border border-ink/[0.096] shadow-[0_4px_12px_rgb(var(--ink-rgb)/0.1),0_16px_48px_rgb(var(--ink-rgb)/0.18)] ring-1 ring-ink/[0.06] will-change-transform"
                  : obscuraSafariReticle
                    ? "rounded-full will-change-transform obscura-liquid-lens-reticle"
                    : "rounded-full border border-ink/[0.096] shadow-[0_4px_12px_rgb(var(--ink-rgb)/0.1),0_16px_48px_rgb(var(--ink-rgb)/0.18)] ring-1 ring-ink/[0.06] will-change-transform obscura-liquid-lens-fallback"
              }
              style={{
                width: OBSCURA_LIQUID_GLASS_LENS_PX,
                height: OBSCURA_LIQUID_GLASS_LENS_PX,
                transform: "translate(-50%, -50%) scale(1.14)",
                ...(obscuraSvgBackdrop
                  ? {
                      backdropFilter: `url(#${OBSCURA_LIQUID_GLASS_FILTER_ID})`,
                      WebkitBackdropFilter: `url(#${OBSCURA_LIQUID_GLASS_FILTER_ID})`,
                    }
                  : {}),
              }}
            />
          </div>
        )}

        {obscuraLiquidLens && obscuraPointerOver && engine !== "chromium" && (
          <ThreeGlassLensFallback
            x={obscuraLens.x}
            y={obscuraLens.y}
            mediaEl={mediaRef.current}
            containerSelector=".home-work-card-frame, .relative.shrink-0.overflow-clip.rounded-2xl"
          />
        )}
        </div>
      </div>

      {/* Caption — 16px inset; select-text so drag on carousel does not block copying caption */}
      <div
        className={`${fluid ? "pl-0" : HOME_CARD_CAPTION_PAD} select-text`}
        data-carousel-allow-select
      >
        <p className="font-[family-name:var(--font-geist-mono)] text-xs leading-6 uppercase text-ink-muted">
          {captionOverride ?? card.caption}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Project group: title + description + horizontal gallery ── */

function ProjectGroup({ project }: { project: HomepageProject }) {
  const choom = useChoomLingo();
  const displayTitle = choom
    ? choomProjectTitle(project.slug, project.title)
    : project.title;

  return (
    <section
      id={project.slug}
      className="flex w-full scroll-mt-[88px] flex-col items-stretch gap-8"
    >
      {/* Title + description — same measure as left-pane bio / hero inner spine */}
      <div
        className={`${HOME_TEXT_MEASURE} flex w-full flex-col gap-4 text-ink-secondary`}
      >
        <ProjectTitleLink
          slug={project.slug}
          title={project.title}
          displayTitle={displayTitle}
        />
        {(project.contextTags?.length || project.recognitionChips?.length) ? (
          <ul
            className="m-0 flex list-none flex-wrap gap-2 p-0"
            aria-label={
              project.recognitionChips?.length
                ? "Project tags and recognition"
                : "Project tags"
            }
          >
            {project.contextTags?.map((tag) => (
              <li key={tag}>
                <span className="inline-flex rounded-full border border-ink/[0.12] bg-ink/[0.03] px-3 py-1.5 font-[family-name:var(--font-geist)] text-[0.8125rem] leading-snug text-ink-secondary backdrop-blur-sm">
                  {tag}
                </span>
              </li>
            ))}
            {project.recognitionChips?.map((chip, i) => (
              <li key={chip.label}>
                <span
                  className="inline-flex max-w-full rounded-full border border-ink/[0.12] bg-ink/[0.03] px-3 py-1.5 font-[family-name:var(--font-geist)] text-[0.8125rem] leading-snug text-ink-secondary backdrop-blur-sm"
                  title={chip.title ?? chip.label}
                  aria-label={chip.title ?? chip.label}
                >
                  {choom && project.slug === "memory-care"
                    ? (CHOOM_MEMORY_CHIPS[i] ?? chip.label)
                    : chip.label}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="font-[family-name:var(--font-geist)] text-base leading-6">
          {project.slug === "memory-care" && !choom ? (
            <>
              R&amp;D for the MCES, a multi-modal interactive installation by{" "}
              <a
                href="https://www.mortatidesign.com/projects/memory-care-experience-station"
                className="underline decoration-solid text-inherit hover:text-ink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Maria Mortati
              </a>{" "}
              aiming to provide life enrichment for people living with
              mid-to-late stage dementia.
            </>
          ) : choom ? (
            choomProjectDescription(project.slug, project.description)
          ) : (
            project.description
          )}
        </p>
      </div>

      {/* Mobile: first card only (no Embla). Desktop: original Embla row + breakout. */}
      <div className="md:hidden">
        <GalleryCard
          fluid
          card={project.cards[0]}
          bgColor={project.bgColor}
          orbColor1={project.orbColor1}
          orbColor2={project.orbColor2}
          orbDriftDelay={project.slug.length * 0.08}
          projectHref={projectPath(project.slug)}
          projectTitle={displayTitle}
          captionOverride={
            choom
              ? choomCardCaption(project.slug, 0, project.cards[0].caption)
              : undefined
          }
          virdioIridescent={project.slug === "virdio"}
          domisDotMatrix={project.slug === "domis"}
          obscuraLiquidLens={project.slug === "obscura"}
          mcesFog={project.slug === "memory-care"}
        />
      </div>

      <div className="hidden md:block">
        <ProjectCarousel className={HOME_PROJECT_EMBLA_VIEWPORT}>
          {project.cards.map((card, i) => {
            let extraImages: { src: string; alt: string; className: string }[] | undefined;

            if (project.slug === "virdio" && i === 1) {
              extraImages = [virdioCard2ExtraImage];
            } else if (project.slug === "virdio" && i === 2) {
              extraImages = virdioCard3ExtraImages;
            } else if (project.slug === "obscura" && i === 1) {
              extraImages = obscuraCard2ExtraImages;
            }

            return (
              <div key={i} className="flex-[0_0_auto]">
                <GalleryCard
                  card={card}
                  bgColor={project.bgColor}
                  orbColor1={project.orbColor1}
                  orbColor2={project.orbColor2}
                  orbDriftDelay={i * 0.55 + project.slug.length * 0.08}
                  extraImages={extraImages}
                  projectHref={projectPath(project.slug)}
                  projectTitle={displayTitle}
                  captionOverride={
                    choom
                      ? choomCardCaption(
                          project.slug,
                          i as 0 | 1 | 2,
                          card.caption,
                        )
                      : undefined
                  }
                  virdioIridescent={project.slug === "virdio"}
                  domisDotMatrix={project.slug === "domis"}
                  obscuraLiquidLens={project.slug === "obscura"}
                  mcesFog={project.slug === "memory-care"}
                />
              </div>
            );
          })}
        </ProjectCarousel>
      </div>
    </section>
  );
}

/* ── Section label with decorative line ── */

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-4">
      <p className="font-[family-name:var(--font-geist-mono)] text-xs leading-6 uppercase text-ink-muted whitespace-nowrap">
        {label}
      </p>
      <div className="w-[80px] h-px" aria-hidden="true">
        <svg width="80" height="1" viewBox="0 0 80 1" fill="none">
          <line
            x1="0.5"
            x2="79.5"
            y1="0.5"
            y2="0.5"
            stroke="white"
            strokeOpacity="0.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* ── Work Section (main export) ── */

export function WorkSection() {
  const choom = useChoomLingo();
  return (
    <div data-home-work-section className="flex w-full flex-col items-stretch">
      <SectionLabel
        label={choom ? CHOOM.workSectionLabel : "Selected Work"}
      />

      <div className="mt-6 flex w-full flex-col items-stretch gap-[120px]">
        {homepageProjects.map((project) => (
          <ProjectGroup key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}

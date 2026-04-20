"use client";

import {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useId,
} from "react";
import { createPortal } from "react-dom";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  HERO_TOGGLE_PATH_COLLAPSED,
  HERO_TOGGLE_PATH_EXPANDED,
} from "@/data/hero-card-toggle-paths";
import {
  resetPageShellBlurHard,
  tweenPageShellBlur,
} from "@/lib/tweenPageShellBlur";
import { CopyEmailPill } from "@/components/shared/CopyEmailPill";
import {
  playChoomClickClosing,
  playChoomHeroExpand,
} from "@/lib/choomUiAudio";
import { HeroCardExpandedBody } from "./HeroCardExpandedBody";
import {
  HeroSketchOrbField,
  type HeroSketchOrbFieldHandle,
} from "./HeroSketchOrbField";
import { pickNextSketchOrbImage } from "@/lib/sketchOrbPick";
import { playHeroSketchPop, preloadHeroSketchPop } from "@/lib/audio";
import { cn } from "@/lib/utils";
import {
  burstBezierPoint,
  createBurstParticleSpecs,
  DEFAULT_BURST_COLORS,
  HERO_BURST_DURATION_S,
  HERO_BURST_EASE,
  type BurstParticleSpec,
} from "@/lib/burstBezier";
import { CHOOM } from "@/lib/homeChoomCopy";
import { useChoomLingo } from "@/components/home/HomeChoomLingoContext";

const LI_HREF = "https://www.linkedin.com/in/hridae";
const CV_HREF =
  "https://drive.google.com/file/d/1Ha7vP0l5HG9IKC4rbd3Y58GZqCIeqGZa/view";

const MOTION_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const MOTION_DURATION = 0.4;

/** Opening height tween — `y` bump waits until this finishes (same pattern as close). */
const OPEN_HEIGHT_DURATION = 0.52;

/** Bump starts 100ms before height tween ends so it intercepts the tail (open + close). */
const BUMP_DELAY_LEAD_S = 0.1;
const OPEN_BUMP_DELAY = OPEN_HEIGHT_DURATION - BUMP_DELAY_LEAD_S;

/** Tiny vertical nudge after height finishes (open or close); same curve for both. */
const COLLAPSE_HEIGHT_DURATION = MOTION_DURATION;
const CLOSE_BUMP_DELAY = COLLAPSE_HEIGHT_DURATION - BUMP_DELAY_LEAD_S;
const CARD_END_BUMP_DURATION = 1.05;
/** Close: slight lift then settle (up → down). */
const CARD_CLOSE_BUMP_Y = [0, -5, 0] as const;
/** Open: inverse — dip then rise (down → up). */
const CARD_OPEN_BUMP_Y = [0, 5, 0] as const;
/** Earlier peak, longer ease-out for a slow return on a long duration. */
const CARD_END_BUMP_TIMES = [0, 0.28, 1] as const;
const CARD_END_BUMP_EASE: [number, number, number, number] = [0.15, 1, 0.38, 1];

type VerticalBumpPhase = "idle" | "playing" | "done";

const AVATAR_BURST_CLEAR_MS = Math.ceil(HERO_BURST_DURATION_S * 1000) + 120;

function createAvatarBurst(): BurstParticleSpec[] {
  return createBurstParticleSpecs(DEFAULT_BURST_COLORS);
}

/** One continuous tween (no Framer keyframe arrays) — progress drives arc + late fade. */
function AvatarBurstParticle({ particle }: { particle: BurstParticleSpec }) {
  const p = particle;
  const progress = useMotionValue(0);

  const x = useTransform(progress, (t) =>
    burstBezierPoint(p.angle, p.dist, p.arch, p.archSign, t).x,
  );
  const y = useTransform(progress, (t) =>
    burstBezierPoint(p.angle, p.dist, p.arch, p.archSign, t).y,
  );

  const opacity = useTransform(progress, (t) => {
    if (t < 0.74) return 1;
    const k = (t - 0.74) / 0.26;
    return Math.max(0, 1 - k);
  });

  const scale = useTransform(progress, (t) => {
    if (t < 0.74) return 1;
    const k = (t - 0.74) / 0.26;
    return Math.max(0.04, 1 - 0.94 * k);
  });

  useEffect(() => {
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: HERO_BURST_DURATION_S,
      ease: HERO_BURST_EASE,
    });
    return () => controls.stop();
  }, [progress]);

  return (
    <motion.span
      className="absolute rounded-full shadow-[0_0_6px_rgba(255,255,255,0.28)]"
      style={{
        width: p.size,
        height: p.size,
        left: "50%",
        top: "50%",
        marginLeft: -p.size / 2,
        marginTop: -p.size / 2,
        backgroundColor: p.color,
        x,
        y,
        opacity,
        scale,
      }}
    />
  );
}

/** Softer blobs: stronger SVG blur */
const ORB_OPACITY = 0.2;
const ORB_BLUR_STDDEV = 52;

/** Above blurred `[data-page-transition-shell]` (z-[1]), below route curtain (z-[100]). */
const PORTAL_Z = 90;

function isHeroInteractiveTarget(el: Element | null): boolean {
  if (!el) return true;
  if (el.closest('[data-testid="hero-card-expanded-scroll"]')) return true;
  return Boolean(
    el.closest("button, a, [role='link'], input, textarea, select"),
  );
}

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  color: string;
}

const ORB_DEFS = [
  { color: "#FF5A5B", startX: 0.05, startY: 0.1 },
  { color: "white", startX: 0.55, startY: 0.4 },
  { color: "#EB8314", startX: 0.25, startY: 0.7 },
  { color: "#CCBAFF", startX: 0.9, startY: 0.1 },
] as const;

/**
 * Bouncing orbs that mutate SVG ellipse elements directly via a ref to a `<g>`.
 * No React re-renders — only the initial mount creates DOM.
 */
function useBouncingOrbs(containerWidth: number, containerHeight: number) {
  const orbsRef = useRef<Orb[]>([]);
  const rafRef = useRef<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const w = Math.max(1, containerWidth);
  const h = Math.max(1, containerHeight);

  useEffect(() => {
    orbsRef.current = ORB_DEFS.map((def) => ({
      x: def.startX * w,
      y: def.startY * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      rx: 35,
      ry: 38,
      color: def.color,
    }));

    const update = () => {
      const orbs = orbsRef.current;
      const wrapper = wrapperRef.current;
      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x - orb.rx < 0) {
          orb.x = orb.rx;
          orb.vx = Math.abs(orb.vx);
        } else if (orb.x + orb.rx > w) {
          orb.x = w - orb.rx;
          orb.vx = -Math.abs(orb.vx);
        }

        if (orb.y - orb.ry < 0) {
          orb.y = orb.ry;
          orb.vy = Math.abs(orb.vy);
        } else if (orb.y + orb.ry > h) {
          orb.y = h - orb.ry;
          orb.vy = -Math.abs(orb.vy);
        }

        // Direct DOM mutation — hardware accelerated CSS translate3d
        const el = wrapper?.children[i] as HTMLDivElement | undefined;
        if (el) {
          el.style.transform = `translate3d(${orb.x - orb.rx}px, ${orb.y - orb.ry}px, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(update);
    };

    // Set initial positions on divs
    const wrapper = wrapperRef.current;
    if (wrapper) {
      const orbs = orbsRef.current;
      for (let i = 0; i < orbs.length; i++) {
        const el = wrapper.children[i] as HTMLDivElement | undefined;
        if (el) {
          el.style.transform = `translate3d(${orbs[i].x - orbs[i].rx}px, ${orbs[i].y - orbs[i].ry}px, 0)`;
        }
      }
    }

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [w, h]);

  return wrapperRef;
}

function ExpandToggle({
  isExpanded,
  onToggle,
  controlsId,
  ariaLabelExpanded = "Hide full bio",
  ariaLabelCollapsed = "Show full bio",
}: {
  isExpanded: boolean;
  onToggle: () => void;
  controlsId: string;
  ariaLabelExpanded?: string;
  ariaLabelCollapsed?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-controls={controlsId}
      className="relative size-8 shrink-0 cursor-pointer rounded-full bg-white/[0.03] transition-colors hover:bg-white/[0.08]"
      aria-label={isExpanded ? ariaLabelExpanded : ariaLabelCollapsed}
    >
      <svg
        className="absolute inset-0 block size-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 32 32"
        aria-hidden
      >
        <circle cx="16" cy="16" fill="white" fillOpacity="0.03" r="16" />
        <motion.g
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ transformOrigin: "16px 16px" }}
        >
          <motion.path
            fill="white"
            fillOpacity={0.8}
            style={{ mixBlendMode: "screen" }}
            initial={false}
            animate={{
              d: isExpanded
                ? HERO_TOGGLE_PATH_EXPANDED
                : HERO_TOGGLE_PATH_COLLAPSED,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </motion.g>
      </svg>
    </button>
  );
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

export function HeroCard() {
  const choom = useChoomLingo();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [closeVerticalBump, setCloseVerticalBump] =
    useState<VerticalBumpPhase>("idle");
  const [openVerticalBump, setOpenVerticalBump] =
    useState<VerticalBumpPhase>("idle");
  const [orbBox, setOrbBox] = useState({ w: 656, h: 192 });
  const [mounted, setMounted] = useState(false);
  /** Bumped on avatar click so animated WebP restarts (play-once file replays from frame 0). */
  const [avatarReplayTick, setAvatarReplayTick] = useState(0);
  const [avatarBurst, setAvatarBurst] = useState<BurstParticleSpec[] | null>(null);
  const burstClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [blankShellPressed, setBlankShellPressed] = useState(false);
  const blankTapRef = useRef<{ x: number; y: number } | null>(null);
  const blankShellPressEndRef = useRef<(() => void) | null>(null);
  const sketchOrbFieldRef = useRef<HeroSketchOrbFieldHandle>(null);
  /** Plain wrapper: Framer must not own `top`/`left` (it resets inline styles each render). */
  const portalFrameRef = useRef<HTMLDivElement>(null);
  const cardShellRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const expandedRegionId = useId();
  const orbFilterId = useId().replace(/:/g, "");
  const isExpandedRef = useRef(isExpanded);
  isExpandedRef.current = isExpanded;
  const prevExpandedRef = useRef(isExpanded);

  useLayoutEffect(() => {
    const was = prevExpandedRef.current;
    if (choom) {
      if (!was && isExpanded) {
        playChoomHeroExpand();
      } else if (was && !isExpanded) {
        playChoomClickClosing();
      }
    }
    if (was && !isExpanded) {
      setCloseVerticalBump("playing");
    }
    if (!was && isExpanded) {
      setOpenVerticalBump("playing");
    }
    if (isExpanded) {
      setCloseVerticalBump("idle");
    } else {
      setOpenVerticalBump("idle");
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, choom]);

  useEffect(() => {
    if (closeVerticalBump !== "playing") return;
    const ms =
      Math.round((CLOSE_BUMP_DELAY + CARD_END_BUMP_DURATION) * 1000) + 150;
    const t = setTimeout(() => {
      setCloseVerticalBump((p) => (p === "playing" ? "done" : p));
    }, ms);
    return () => clearTimeout(t);
  }, [closeVerticalBump]);

  useEffect(() => {
    if (openVerticalBump !== "playing") return;
    const ms =
      Math.round((OPEN_BUMP_DELAY + CARD_END_BUMP_DURATION) * 1000) + 150;
    const t = setTimeout(() => {
      setOpenVerticalBump((p) => (p === "playing" ? "done" : p));
    }, ms);
    return () => clearTimeout(t);
  }, [openVerticalBump]);

  const orbGRef = useBouncingOrbs(orbBox.w, orbBox.h);

  /** Imperative geometry so GSAP `onUpdate` can track every frame (React state batches). */
  const syncPortalPosition = useCallback(() => {
    const anchor = anchorRef.current;
    const frame = portalFrameRef.current;
    if (!anchor || !frame) return;
    const r = anchor.getBoundingClientRect();
    const top = window.scrollY + r.top;
    const left = window.scrollX + r.left;
    const width = Math.min(r.width, 656);
    frame.style.top = `${top}px`;
    frame.style.left = `${left}px`;
    frame.style.width = `${width}px`;
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const shellOpts = {
      onUpdate: syncPortalPosition,
      /** Blur-only: scaling the shell shifts anchor rects and makes the portaled card “step” downward. */
      omitScale: true,
    };
    if (isExpanded) {
      const id = requestAnimationFrame(() => {
        tweenPageShellBlur(true, shellOpts);
      });
      return () => cancelAnimationFrame(id);
    }
    tweenPageShellBlur(false, shellOpts);
    return undefined;
  }, [isExpanded, syncPortalPosition, isMobile]);

  /** Lock document scroll + Lenis while expanded so only the hero panel scrolls. */
  useEffect(() => {
    if (!isExpanded) return;
    const lenis = (
      window as unknown as {
        __lenis?: { stop: () => void; start: () => void };
      }
    ).__lenis;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      lenis?.start();
    };
  }, [isExpanded]);

  /** Jump to top when expanding so the portaled card anchor isn’t clipped mid-page. */
  useLayoutEffect(() => {
    if (!isExpanded) return;
    window.scrollTo(0, 0);
    (
      window as unknown as {
        __lenis?: { scrollTo: (n: number, o: { immediate: boolean }) => void };
      }
    ).__lenis?.scrollTo(0, { immediate: true });
  }, [isExpanded]);

  useEffect(() => {
    return () => {
      if (isExpandedRef.current) resetPageShellBlurHard();
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isMobile) return;
    preloadHeroSketchPop();
  }, [mounted, isMobile]);

  useLayoutEffect(() => {
    if (!mounted) return;
    syncPortalPosition();
  }, [mounted, syncPortalPosition, isExpanded, orbBox.w, orbBox.h]);

  useEffect(() => {
    if (!mounted) return;
    syncPortalPosition();
    window.addEventListener("resize", syncPortalPosition);
    const anchor = anchorRef.current;
    let ro: ResizeObserver | undefined;
    if (anchor && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => syncPortalPosition());
      ro.observe(anchor);
    }
    return () => {
      window.removeEventListener("resize", syncPortalPosition);
      ro?.disconnect();
    };
  }, [mounted, syncPortalPosition]);

  useEffect(() => {
    if (!mounted) return;
    const el = cardShellRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      const w = Math.round(r.width) || 656;
      const h = Math.round(r.height) || 192;
      setOrbBox((prev) =>
        prev.w === w && prev.h === h ? prev : { w, h }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [mounted, isExpanded]);

  const replayHeroAvatarAnimation = useCallback(() => {
    if (burstClearRef.current) {
      clearTimeout(burstClearRef.current);
      burstClearRef.current = null;
    }
    if (!reduceMotion) {
      setAvatarBurst(createAvatarBurst());
      burstClearRef.current = setTimeout(() => {
        setAvatarBurst(null);
        burstClearRef.current = null;
      }, AVATAR_BURST_CLEAR_MS);
    } else {
      setAvatarBurst(null);
    }
    setAvatarReplayTick((n) => n + 1);
  }, [reduceMotion]);

  const onHeroShellPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isExpanded || reduceMotion) return;
      if (e.button !== 0) return;
      const t = e.target as Element | null;
      if (!e.currentTarget.contains(t)) return;
      if (isHeroInteractiveTarget(t)) return;
      blankShellPressEndRef.current?.();
      blankShellPressEndRef.current = null;
      blankTapRef.current = { x: e.clientX, y: e.clientY };
      setBlankShellPressed(true);
      const endBlankPress = () => {
        blankShellPressEndRef.current = null;
        setBlankShellPressed(false);
        window.removeEventListener("pointerup", endBlankPress);
        window.removeEventListener("pointercancel", endBlankPress);
      };
      blankShellPressEndRef.current = () => {
        window.removeEventListener("pointerup", endBlankPress);
        window.removeEventListener("pointercancel", endBlankPress);
      };
      window.addEventListener("pointerup", endBlankPress);
      window.addEventListener("pointercancel", endBlankPress);
    },
    [isExpanded, reduceMotion],
  );

  const onHeroShellPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const s = blankTapRef.current;
      blankTapRef.current = null;
      blankShellPressEndRef.current?.();
      blankShellPressEndRef.current = null;
      setBlankShellPressed(false);
      if (!s || isExpanded || reduceMotion) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > 14) return;
      const t = e.target as Element | null;
      if (!e.currentTarget.contains(t)) return;
      if (isHeroInteractiveTarget(t)) return;
      const shell = cardShellRef.current;
      if (!shell) return;
      const pick = pickNextSketchOrbImage();
      sketchOrbFieldRef.current?.spawnFromCard(shell, pick, {
        cardTopBounce: !isExpanded,
      });
      playHeroSketchPop();
    },
    [isExpanded, reduceMotion],
  );

  const onHeroShellPointerCancel = useCallback(() => {
    blankTapRef.current = null;
    blankShellPressEndRef.current?.();
    blankShellPressEndRef.current = null;
    setBlankShellPressed(false);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      blankShellPressEndRef.current?.();
      blankShellPressEndRef.current = null;
      setBlankShellPressed(false);
    }
  }, [isExpanded]);

  useEffect(
    () => () => {
      blankShellPressEndRef.current?.();
      blankShellPressEndRef.current = null;
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (burstClearRef.current) clearTimeout(burstClearRef.current);
    };
  }, []);

  const orbBlurPad = Math.max(orbBox.w, orbBox.h) * 0.35;

  /* ── Mobile: static inline card, collapsed only, no portal ── */
  if (isMobile) {
    return (
      <div className="relative isolate w-full min-w-0">
        <div className="flex min-h-[192px] w-full min-w-0 flex-col overflow-hidden rounded-[32px] bg-[rgba(29,29,29,0.7)] backdrop-blur-[54.45px]">
          <div
            className="pointer-events-none absolute inset-0 z-0 size-full overflow-hidden [clip-path:inset(0_round_32px)]"
            aria-hidden
          >
            <div ref={orbGRef} className="absolute inset-0 h-0 w-0">
              {ORB_DEFS.map((def, i) => (
                <div
                  key={i}
                  className="absolute left-0 top-0 size-[70px] rounded-full blur-[48px] will-change-transform"
                  style={{
                    backgroundColor: def.color,
                    opacity: ORB_OPACITY,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-col gap-10 overflow-hidden rounded-[inherit] p-8">
            <div className="flex shrink-0 flex-col gap-10">
              <div className="flex items-center">
                <div className="relative h-8 w-[73px] overflow-visible opacity-80">
                  <button
                    type="button"
                    onClick={replayHeroAvatarAnimation}
                    aria-label={
                      choom ? CHOOM.heroReplayAvatar : "Replay portrait animation"
                    }
                    title={choom ? CHOOM.heroReplayTitle : "Replay animation"}
                    className="relative size-full cursor-pointer overflow-visible rounded-sm border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416] touch-manipulation"
                  >
                    <motion.img
                      key={avatarReplayTick}
                      src={
                        avatarReplayTick === 0
                          ? "/assets/home/hero-avatar.gif"
                          : `/assets/home/hero-avatar.gif?replay=${avatarReplayTick}`
                      }
                      alt=""
                      draggable={false}
                      initial={
                        reduceMotion
                          ? { scale: 1, opacity: 1 }
                          : { scale: 0.88, opacity: 0.92 }
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 560, damping: 26, mass: 0.85 }
                      }
                      className="pointer-events-none relative z-0 size-full object-cover select-none"
                    />
                    {avatarBurst ? (
                      <span
                        className="pointer-events-none absolute left-1/2 top-1/2 z-10 block h-0 w-0"
                        aria-hidden
                      >
                        {avatarBurst.map((p) => (
                          <AvatarBurstParticle
                            key={`${avatarReplayTick}-b-${p.id}`}
                            particle={p}
                          />
                        ))}
                      </span>
                    ) : null}
                  </button>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h1
                    className="font-[family-name:var(--font-display)] text-[22px] font-bold leading-normal text-white/80 whitespace-nowrap"
                    style={{
                      fontVariationSettings: "'opsz' 14, 'wdth' 100",
                    }}
                  >
                    {choom ? CHOOM.heroName : "Hridae Walia"}
                  </h1>
                  <p className="font-[family-name:var(--font-geist)] text-base font-semibold leading-normal text-white/60">
                    {choom ? CHOOM.heroRole : "Product Designer"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <CopyEmailPill />

                  <a
                    href={CV_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-2xl bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
                  >
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold text-white/80">
                      {choom ? CHOOM.cvLabel : "CV"}
                    </span>
                  </a>

                  <a
                    href={LI_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-2xl bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
                  >
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold text-white/80">
                      {choom ? CHOOM.liLabel : "in"}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] rounded-[32px] border border-white/10"
          />
        </div>
      </div>
    );
  }

  const glassCard = (
    <>
      {isExpanded ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label={
            choom ? CHOOM.heroCloseExpanded : "Close expanded bio"
          }
          className="fixed inset-0 cursor-default touch-manipulation border-0 bg-transparent p-0 focus:outline-none"
          style={{ zIndex: PORTAL_Z - 1 }}
          onClick={() => setIsExpanded(false)}
        />
      ) : null}
      <div
        ref={portalFrameRef}
        data-testid="hero-card-shell"
        className="absolute w-full min-w-0 max-w-[656px]"
        style={{ zIndex: PORTAL_Z, transformOrigin: "top left" }}
      >
      <motion.div
        ref={cardShellRef}
        className="flex min-h-[192px] w-full min-w-0 max-h-[calc(100vh-224px)] flex-col overflow-hidden rounded-[32px]"
        style={{ transformOrigin: "50% 0" }}
        initial={false}
        onPointerDown={onHeroShellPointerDown}
        onPointerUp={onHeroShellPointerUp}
        onPointerCancel={onHeroShellPointerCancel}
        animate={{
          height: isExpanded ? "auto" : 192,
          y:
            isExpanded && openVerticalBump === "playing"
              ? [...CARD_OPEN_BUMP_Y]
              : !isExpanded && closeVerticalBump === "playing"
                ? [...CARD_CLOSE_BUMP_Y]
                : 0,
        }}
        transition={{
          height: {
            duration: isExpanded ? OPEN_HEIGHT_DURATION : MOTION_DURATION,
            ease: MOTION_EASE,
          },
          y:
            isExpanded && openVerticalBump === "playing"
              ? {
                  delay: OPEN_BUMP_DELAY,
                  duration: CARD_END_BUMP_DURATION,
                  times: [...CARD_END_BUMP_TIMES],
                  ease: CARD_END_BUMP_EASE,
                }
              : !isExpanded && closeVerticalBump === "playing"
                ? {
                    delay: CLOSE_BUMP_DELAY,
                    duration: CARD_END_BUMP_DURATION,
                    times: [...CARD_END_BUMP_TIMES],
                    ease: CARD_END_BUMP_EASE,
                  }
                : { duration: 0.12, ease: MOTION_EASE },
        }}
      >
      <motion.div
        className="flex min-h-0 h-full w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[inherit] bg-[rgba(29,29,29,0.7)] backdrop-blur-[54.45px]"
        style={{ transformOrigin: "50% 9%" }}
        initial={false}
        animate={{
          scale:
            reduceMotion || isExpanded ? 1 : blankShellPressed ? 0.97 : 1,
        }}
        transition={{
          scale: {
            type: "spring",
            stiffness: 400,
            damping: 27,
            mass: 0.95,
          },
        }}
      >
      <div
        className="pointer-events-none absolute inset-0 z-0 size-full overflow-hidden [clip-path:inset(0_round_32px)]"
        aria-hidden
      >
        <div ref={orbGRef} className="absolute inset-0 h-0 w-0">
          {ORB_DEFS.map((def, i) => (
            <div
              key={i}
              className="absolute left-0 top-0 size-[70px] rounded-full blur-[48px] will-change-transform"
              style={{
                backgroundColor: def.color,
                opacity: ORB_OPACITY,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-col gap-10 overflow-hidden rounded-[inherit] p-8">
        <div className="flex shrink-0 flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="relative h-8 w-[73px] overflow-visible opacity-80">
              <button
                type="button"
                onClick={replayHeroAvatarAnimation}
                aria-label={
                  choom ? CHOOM.heroReplayAvatar : "Replay portrait animation"
                }
                title={choom ? CHOOM.heroReplayTitle : "Replay animation"}
                className="relative size-full cursor-pointer overflow-visible rounded-sm border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416] touch-manipulation"
              >
                <motion.img
                  key={avatarReplayTick}
                  src={
                    avatarReplayTick === 0
                      ? "/assets/home/hero-avatar.gif"
                      : `/assets/home/hero-avatar.gif?replay=${avatarReplayTick}`
                  }
                  alt=""
                  draggable={false}
                  initial={
                    reduceMotion
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.88, opacity: 0.92 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 560, damping: 26, mass: 0.85 }
                  }
                  className="pointer-events-none relative z-0 size-full object-cover select-none"
                />
                {avatarBurst ? (
                  <span
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 block h-0 w-0"
                    aria-hidden
                  >
                    {avatarBurst.map((p) => (
                      <AvatarBurstParticle
                        key={`${avatarReplayTick}-b-${p.id}`}
                        particle={p}
                      />
                    ))}
                  </span>
                ) : null}
              </button>
            </div>
            <ExpandToggle
              isExpanded={isExpanded}
              onToggle={() => setIsExpanded((v) => !v)}
              controlsId={expandedRegionId}
              ariaLabelExpanded={
                choom ? CHOOM.heroExpandHide : "Hide full bio"
              }
              ariaLabelCollapsed={
                choom ? CHOOM.heroExpandShow : "Show full bio"
              }
            />
          </div>

          <div className="flex min-w-0 items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5 pr-2">
              <h1
                className={cn(
                  "grid min-w-0 items-baseline gap-x-1.5 font-[family-name:var(--font-display)] text-[24px] font-bold leading-normal text-white/80",
                  showPronunciation
                    ? "grid-cols-[auto_minmax(0,1fr)]"
                    : "grid-cols-[auto_0fr]",
                )}
                style={{
                  fontVariationSettings: "'opsz' 14, 'wdth' 100",
                }}
              >
                <button
                  type="button"
                  id="hero-pronunciation-trigger"
                  aria-expanded={showPronunciation}
                  aria-controls="hero-pronunciation-panel"
                  aria-label={
                    showPronunciation
                      ? choom
                        ? CHOOM.heroPronHide
                        : "Hridae Walia, hide pronunciation"
                      : choom
                        ? CHOOM.heroPronShow
                        : "Hridae Walia, show pronunciation"
                  }
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setShowPronunciation((v) => !v);
                  }}
                  className="min-w-0 border-0 bg-transparent p-0 text-left font-[family-name:var(--font-display)] text-[24px] font-bold leading-normal text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416] touch-manipulation"
                  style={{
                    fontVariationSettings: "'opsz' 14, 'wdth' 100",
                  }}
                >
                  {choom ? CHOOM.heroName : "Hridae Walia"}
                </button>
                <span
                  id="hero-pronunciation-panel"
                  className="min-w-0 overflow-hidden whitespace-nowrap"
                >
                  <motion.span
                    initial={false}
                    aria-hidden={!showPronunciation}
                    animate={{
                      opacity: showPronunciation ? 1 : 0,
                      x: showPronunciation ? 0 : reduceMotion ? 0 : -8,
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.48, ease: [0.15, 1, 0.38, 1] }
                    }
                    className="inline-block font-[family-name:var(--font-dm-sans)] text-[15px] font-semibold tracking-wide text-white/45"
                  >
                    · ri-they waaliaa
                  </motion.span>
                </span>
              </h1>
              <p className="font-[family-name:var(--font-geist)] text-base font-semibold leading-normal text-white/60">
                {choom ? CHOOM.heroRole : "Product Designer"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <CopyEmailPill />

              <a
                href={CV_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-2xl bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
              >
                <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold text-white/80">
                  {choom ? CHOOM.cvLabel : "CV"}
                </span>
              </a>

              <a
                href={LI_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-2xl bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
              >
                <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold text-white/80">
                  {choom ? CHOOM.liLabel : "in"}
                </span>
              </a>
            </div>
          </div>
        </div>

        <motion.div
          id={expandedRegionId}
          initial={false}
          animate={{
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }}
          transition={{ duration: 0.3, delay: isExpanded ? 0.1 : 0 }}
          className="relative min-h-0 w-full min-w-0"
        >
          <div className="relative isolate min-h-0 w-full min-w-0">
            {/*
              Mask fades scroll content to transparent; without a different tone behind it,
              the glass card shows through and the taper disappears. This layer sits under the
              scrollport so masked pixels read as a visible fade (page-toned, not blur).
            */}
            <div
              aria-hidden
              data-testid="hero-expanded-bottom-fade-backdrop"
              className="pointer-events-none absolute inset-x-0 bottom-0 left-0 right-0 z-[1] h-[11rem] bg-gradient-to-t from-[rgba(0,0,0,0.01)] to-transparent"
            />
            <div
              data-testid="hero-card-expanded-scroll"
              className="relative z-[2] scrollbar-hide max-h-[calc(100vh-224px-11rem)] w-full min-w-0 overflow-x-hidden overflow-y-auto overscroll-y-contain"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 0%, black calc(100% - 5rem), rgba(0,0,0,0.5) calc(100% - 2.5rem), transparent 100%)",
                maskImage:
                  "linear-gradient(to bottom, black 0%, black calc(100% - 5rem), rgba(0,0,0,0.5) calc(100% - 2.5rem), transparent 100%)",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                maskMode: "alpha",
              }}
            >
              <div
                data-testid="hero-expanded-scroll-inner"
                className="w-full min-w-0 pb-8"
              >
                <HeroCardExpandedBody />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] rounded-[32px] border border-white/10"
        />
      </motion.div>
      </motion.div>
    </div>
    </>
  );

  return (
    <div
      ref={anchorRef}
      className="relative isolate z-[25] min-h-[192px] w-full min-w-0 max-w-[656px]"
    >
      {mounted && createPortal(glassCard, document.body)}
      {mounted && !isMobile
        ? createPortal(
            <HeroSketchOrbField ref={sketchOrbFieldRef} reduceMotion={!!reduceMotion} />,
            document.body,
          )
        : null}
    </div>
  );
}

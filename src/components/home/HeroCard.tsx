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
  AnimatePresence,
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
import { HeroCardExpandedBody } from "./HeroCardExpandedBody";

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

const AVATAR_BURST_COLORS = ["#ffffff", "#FF5A5B", "#EB8314", "#CCBAFF"] as const;

type AvatarBurstParticle = {
  id: number;
  angle: number;
  dist: number;
  /** Perpendicular lift (px) on the quadratic curve — reads as an arc. */
  arch: number;
  archSign: number;
  size: number;
  color: string;
};

/** Quadratic bezier from origin to (ex,ey) with control point biased perpendicular for an arc. */
function burstBezierPoint(
  angle: number,
  dist: number,
  arch: number,
  archSign: number,
  u: number,
): { x: number; y: number } {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const ex = cosA * dist;
  const ey = sinA * dist;
  const perpX = -sinA * archSign;
  const perpY = cosA * archSign;
  const cx = ex * 0.5 + perpX * arch;
  const cy = ey * 0.5 + perpY * arch;
  const t = u;
  const o = 1 - t;
  return {
    x: 2 * o * t * cx + t * t * ex,
    y: 2 * o * t * cy + t * t * ey,
  };
}

function createAvatarBurst(): AvatarBurstParticle[] {
  const n = 18;
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.35,
    dist: 56 + Math.random() * 44,
    arch: 16 + Math.random() * 18,
    archSign: i % 2 === 0 ? 1 : -1,
    size: 1.15 + Math.random() * 1.15,
    color: AVATAR_BURST_COLORS[i % AVATAR_BURST_COLORS.length] ?? "#ffffff",
  }));
}

const AVATAR_BURST_DURATION_S = 1.22;
const AVATAR_BURST_CLEAR_MS = Math.ceil(AVATAR_BURST_DURATION_S * 1000) + 120;

/** One continuous tween (no Framer keyframe arrays) — progress drives arc + late fade. */
function AvatarBurstParticle({ particle }: { particle: AvatarBurstParticle }) {
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
      duration: AVATAR_BURST_DURATION_S,
      ease: [0.2, 0.95, 0.24, 1],
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

const expandedPanelVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.1 },
  },
  leaving: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
} as const;

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  color: string;
}

function useBouncingOrbs(containerWidth: number, containerHeight: number) {
  const orbsRef = useRef<Orb[]>([]);
  const rafRef = useRef<number>(0);
  const [positions, setPositions] = useState<
    { x: number; y: number; rx: number; ry: number; color: string }[]
  >([]);

  const w = Math.max(1, containerWidth);
  const h = Math.max(1, containerHeight);

  useEffect(() => {
    const orbDefs = [
      { color: "#FF5A5B", startX: 0.05, startY: 0.1 },
      { color: "white", startX: 0.55, startY: 0.4 },
      { color: "#EB8314", startX: 0.25, startY: 0.7 },
      { color: "#CCBAFF", startX: 0.9, startY: 0.1 },
    ];

    orbsRef.current = orbDefs.map((def) => ({
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
      for (const orb of orbs) {
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
      }

      setPositions(
        orbs.map((o) => ({
          x: o.x,
          y: o.y,
          rx: o.rx,
          ry: o.ry,
          color: o.color,
        }))
      );
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [w, h]);

  return positions;
}

function ExpandToggle({
  isExpanded,
  onToggle,
  controlsId,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  controlsId: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-controls={controlsId}
      className="relative size-8 shrink-0 cursor-pointer rounded-full bg-white/[0.03] transition-colors hover:bg-white/[0.08]"
      aria-label={isExpanded ? "Hide full bio" : "Show full bio"}
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
  const isMobile = useIsMobile();
  const [showCopied, setShowCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [closeVerticalBump, setCloseVerticalBump] =
    useState<VerticalBumpPhase>("idle");
  const [openVerticalBump, setOpenVerticalBump] =
    useState<VerticalBumpPhase>("idle");
  const [orbBox, setOrbBox] = useState({ w: 656, h: 192 });
  const [mounted, setMounted] = useState(false);
  /** Bumped on avatar click so animated WebP restarts (play-once file replays from frame 0). */
  const [avatarReplayTick, setAvatarReplayTick] = useState(0);
  const [avatarBurst, setAvatarBurst] = useState<AvatarBurstParticle[] | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
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
  }, [isExpanded]);

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

  const orbPositions = useBouncingOrbs(orbBox.w, orbBox.h);

  /** Imperative geometry so GSAP `onUpdate` can track every frame (React state batches). */
  const syncPortalPosition = useCallback(() => {
    const anchor = anchorRef.current;
    const frame = portalFrameRef.current;
    if (!anchor || !frame) return;
    const r = anchor.getBoundingClientRect();
    const top = r.top;
    const left = r.left;
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

  useEffect(() => {
    return () => {
      if (isExpandedRef.current) resetPageShellBlurHard();
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;
    syncPortalPosition();
  }, [mounted, syncPortalPosition, isExpanded, orbBox.w, orbBox.h]);

  useEffect(() => {
    if (!mounted) return;
    syncPortalPosition();
    const onScroll = () => syncPortalPosition();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", syncPortalPosition);
    const anchor = anchorRef.current;
    let ro: ResizeObserver | undefined;
    if (anchor && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => syncPortalPosition());
      ro.observe(anchor);
    }
    const lenis = (
      window as unknown as {
        __lenis?: { on: (e: "scroll", fn: () => void) => () => void };
      }
    ).__lenis;
    const unsubLenis = lenis?.on("scroll", syncPortalPosition);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", syncPortalPosition);
      ro?.disconnect();
      unsubLenis?.();
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

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("hridaew@gmail.com");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = "hridaew@gmail.com";
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    setShowCopied(true);
    copiedTimerRef.current = setTimeout(() => setShowCopied(false), 1800);
  }, []);

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
          <svg
            className="pointer-events-none absolute inset-0 z-0 size-full [clip-path:inset(0_round_32px)]"
            viewBox={`0 0 ${orbBox.w} ${orbBox.h}`}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            <defs>
              <filter
                id={orbFilterId}
                filterUnits="userSpaceOnUse"
                x={-orbBlurPad}
                y={-orbBlurPad}
                width={orbBox.w + 2 * orbBlurPad}
                height={orbBox.h + 2 * orbBlurPad}
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation={ORB_BLUR_STDDEV} />
              </filter>
            </defs>
            <g filter={`url(#${orbFilterId})`}>
              {orbPositions.map((orb, i) => (
                <ellipse
                  key={i}
                  cx={orb.x}
                  cy={orb.y}
                  rx={orb.rx}
                  ry={orb.ry}
                  fill={orb.color}
                  opacity={ORB_OPACITY}
                />
              ))}
            </g>
          </svg>

          <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-col gap-10 overflow-hidden rounded-[inherit] p-8">
            <div className="flex shrink-0 flex-col gap-10">
              <div className="flex items-center">
                <div className="relative h-8 w-[73px] overflow-visible opacity-80">
                  <button
                    type="button"
                    onClick={replayHeroAvatarAnimation}
                    aria-label="Replay portrait animation"
                    title="Replay animation"
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
                    Hridae Walia
                  </h1>
                  <p className="font-[family-name:var(--font-geist)] text-base font-semibold leading-normal text-white/60">
                    Product Designer
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="flex h-8 cursor-pointer items-center gap-1 rounded-[38px] bg-white/[0.03] pl-2 pr-1 transition-colors hover:bg-white/[0.06]"
                    >
                      <span className="font-[family-name:var(--font-geist)] text-xs leading-normal text-white/80">
                        hridaew@gmail.com
                      </span>
                      <div className="flex size-6 items-center justify-center rounded-full bg-white/5">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M7.5 3.75V2.5C7.5 1.81 6.94 1.25 6.25 1.25H2.5C1.81 1.25 1.25 1.81 1.25 2.5V6.25C1.25 6.94 1.81 7.5 2.5 7.5H3.75M3.75 3.75H7.5C8.19 3.75 8.75 4.31 8.75 5V7.5C8.75 8.19 8.19 8.75 7.5 8.75H5C4.31 8.75 3.75 8.19 3.75 7.5V3.75Z"
                            stroke="white"
                            strokeOpacity="0.8"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </button>
                    <AnimatePresence>
                      {showCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.95 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.25, 1, 0.5, 1],
                          }}
                          className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-xl"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <a
                    href={CV_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-2xl bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
                  >
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold text-white/80">
                      CV
                    </span>
                  </a>

                  <a
                    href={LI_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-2xl bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
                  >
                    <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold text-white/80">
                      in
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
    <div
      ref={portalFrameRef}
      data-testid="hero-card-shell"
      className="fixed w-full min-w-0 max-w-[656px]"
      style={{ zIndex: PORTAL_Z, transformOrigin: "top left" }}
    >
      <motion.div
        ref={cardShellRef}
        className="flex min-h-[192px] w-full min-w-0 max-h-[90vh] flex-col overflow-hidden rounded-[32px] bg-[rgba(29,29,29,0.7)] backdrop-blur-[54.45px]"
        style={{ transformOrigin: "50% 0" }}
        initial={false}
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
      <svg
        className="pointer-events-none absolute inset-0 z-0 size-full [clip-path:inset(0_round_32px)]"
        viewBox={`0 0 ${orbBox.w} ${orbBox.h}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <filter
            id={orbFilterId}
            filterUnits="userSpaceOnUse"
            x={-orbBlurPad}
            y={-orbBlurPad}
            width={orbBox.w + 2 * orbBlurPad}
            height={orbBox.h + 2 * orbBlurPad}
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation={ORB_BLUR_STDDEV} />
          </filter>
        </defs>
        <g filter={`url(#${orbFilterId})`}>
          {orbPositions.map((orb, i) => (
            <ellipse
              key={i}
              cx={orb.x}
              cy={orb.y}
              rx={orb.rx}
              ry={orb.ry}
              fill={orb.color}
              opacity={ORB_OPACITY}
            />
          ))}
        </g>
      </svg>

      <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-col gap-10 overflow-hidden rounded-[inherit] p-8">
        <div className="flex shrink-0 flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="relative h-8 w-[73px] overflow-visible opacity-80">
              <button
                type="button"
                onClick={replayHeroAvatarAnimation}
                aria-label="Replay portrait animation"
                title="Replay animation"
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
            />
          </div>

          <div className="flex min-w-0 items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1.5 pr-2">
              <h1
                className="font-[family-name:var(--font-display)] text-[24px] font-bold leading-normal text-white/80 whitespace-nowrap"
                style={{
                  fontVariationSettings: "'opsz' 14, 'wdth' 100",
                }}
              >
                Hridae Walia
              </h1>
              <p className="font-[family-name:var(--font-geist)] text-base font-semibold leading-normal text-white/60">
                Product Designer
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={copyEmail}
                  className="flex h-8 cursor-pointer items-center gap-1 rounded-[38px] bg-white/[0.03] pl-2 pr-1 transition-colors hover:bg-white/[0.06]"
                >
                  <span className="font-[family-name:var(--font-geist)] text-xs leading-normal text-white/80">
                    hridaew@gmail.com
                  </span>
                  <div className="flex size-6 items-center justify-center rounded-full bg-white/5">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M7.5 3.75V2.5C7.5 1.81 6.94 1.25 6.25 1.25H2.5C1.81 1.25 1.25 1.81 1.25 2.5V6.25C1.25 6.94 1.81 7.5 2.5 7.5H3.75M3.75 3.75H7.5C8.19 3.75 8.75 4.31 8.75 5V7.5C8.75 8.19 8.19 8.75 7.5 8.75H5C4.31 8.75 3.75 8.19 3.75 7.5V3.75Z"
                        stroke="white"
                        strokeOpacity="0.8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
                <AnimatePresence>
                  {showCopied && (
                    <motion.span
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                      className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-xl"
                    >
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <a
                href={CV_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-2xl bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
              >
                <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold text-white/80">
                  CV
                </span>
              </a>

              <a
                href={LI_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-2xl bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
              >
                <span className="font-[family-name:var(--font-geist-mono)] text-xs font-extrabold text-white/80">
                  in
                </span>
              </a>
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="expanded"
              id={expandedRegionId}
              variants={expandedPanelVariants}
              initial="hidden"
              animate="visible"
              exit="leaving"
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
                  className="relative z-[2] scrollbar-hide max-h-[calc(90vh-11rem)] w-full min-w-0 overflow-x-hidden overflow-y-auto overscroll-y-contain"
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
          )}
        </AnimatePresence>
      </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] rounded-[32px] border border-white/10"
        />
      </motion.div>
    </div>
  );

  return (
    <div
      ref={anchorRef}
      className="relative isolate z-[25] min-h-[192px] w-full min-w-0 max-w-[656px]"
    >
      {mounted && createPortal(glassCard, document.body)}
    </div>
  );
}

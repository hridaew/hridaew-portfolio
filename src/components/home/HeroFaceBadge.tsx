"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import { animate, motion, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAchievements } from "@/components/achievements/AchievementProvider";

const BADGE_SRC = "/assets/home/hero-face-badge.webp";
const BADGE_WIDTH = 250;
const BADGE_HEIGHT = 360;

/* ─── Tunables (size / chrome / tilt / pin depth) ─── */
/** Display height in Tailwind terms. */
const BADGE_HEIGHT_CLASS = "h-14"; // 56px
/** How much of the chrome shell the face fills. Higher = thinner rim. */
const FACE_INSET = 0.97; // 97% → ~1.5% rim each side
/**
 * Pin thickness in screen px (2D extrusion).
 * NOTE: True CSS translateZ depth is flattened by the hero card’s
 * overflow:hidden ancestors — so thickness is faked with offset metal slices.
 */
const PIN_DEPTH_PX = 1;
/** Extrusion direction (unit-ish): down-right reads as light from top-left. */
const PIN_EXTRUDE_X = 0.7;
const PIN_EXTRUDE_Y = 0.95;
/** Max look tilt toward the cursor (degrees). */
const MAX_TILT_DEG = 16;
/** How fast tilt eases toward the cursor (0–1 per frame). */
const TILT_LERP = 0.18;
/**
 * Cursor distance from badge center (px) that maps to full tilt.
 * Larger = gentler; smaller = more reactive near the face.
 */
const TILT_LOOK_RADIUS_PX = 320;
/** Face specular strength — keep low so skin doesn’t blow out. */
const FACE_SPECULAR_OPACITY = 0.22;

/* ─── Tunables — Mario 64–style spin ───
 * Edit these to taste; times are fractions of SPIN_DURATION_S (0–1).
 */
/** Total spin choreography length (seconds). */
const SPIN_DURATION_S = 1.05;
/** Wind-up opposite the spin (degrees). Negative = left first. */
const SPIN_ANTICIPATION_DEG = -32;
/** When anticipation ends (0–1 along the timeline). */
const SPIN_T_ANTICIPATION = 0.11;
/** Full turns before overshoot (1 = classic single flip). */
const SPIN_FULL_TURNS = 1;
/** Extra degrees past the landing before settle (follow-through). */
const SPIN_OVERSHOOT_DEG = 22;
/** When the fast spin reaches overshoot (0–1). */
const SPIN_T_OVERSHOOT = 0.72;
/** Squash on anticipation / stretch mid-spin. */
const SPIN_SCALE_SQUASH = 0.94;
const SPIN_SCALE_STRETCH = 1.055;
/** Final settle spring after the keyframed spin lands. */
const SPIN_SETTLE_STIFFNESS = 420;
const SPIN_SETTLE_DAMPING = 14;
const SPIN_SETTLE_MASS = 0.65;

const FACE_MASK: CSSProperties = {
  maskImage: `url(${BADGE_SRC})`,
  WebkitMaskImage: `url(${BADGE_SRC})`,
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
};

/** Mirror chrome — hard specular bands, polished silver. */
const CHROME_MIRROR_BG = [
  "linear-gradient(128deg,",
  "#ffffff 0%,",
  "#d4d9e2 6%,",
  "#ffffff 11%,",
  "#9aa3b2 22%,",
  "#eceff4 34%,",
  "#5c6574 48%,",
  "#f7f8fb 58%,",
  "#aeb6c4 70%,",
  "#ffffff 82%,",
  "#7a8494 92%,",
  "#f0f2f6 100%)",
].join("");

/**
 * Reflective metal bands along the pin side (opaque).
 * Alternating dark / bright chrome so the edge catches light like polished steel.
 */
function extrudeFill(depthFromFront: number): string {
  // Cycle highlight → mid → dark across slices for a mirror edge
  const band = depthFromFront % 3;
  if (band === 0) {
    return [
      "linear-gradient(145deg,",
      "#f4f6f8 0%,",
      "#b8c0cc 35%,",
      "#6a7382 70%,",
      "#d8dde6 100%)",
    ].join("");
  }
  if (band === 1) {
    return [
      "linear-gradient(145deg,",
      "#9aa3b2 0%,",
      "#4a5262 40%,",
      "#2a303c 75%,",
      "#7a8494 100%)",
    ].join("");
  }
  return [
    "linear-gradient(145deg,",
    "#c5ccd8 0%,",
    "#5c6574 30%,",
    "#3a414d 65%,",
    "#aeb6c4 100%)",
  ].join("");
}

type HeroFaceBadgeProps = {
  reduceMotion: boolean | null;
  replayLabel: string;
  replayTitle: string;
  className?: string;
};

export function HeroFaceBadge({
  reduceMotion,
  replayLabel,
  replayTitle,
  className,
}: HeroFaceBadgeProps) {
  const { unlock } = useAchievements();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pinRef = useRef<HTMLSpanElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, has: false });
  const centerRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const pageVisibleRef = useRef(true);
  const inViewRef = useRef(true);
  const spinningRef = useRef(false);
  const [spinning, setSpinning] = useState(false);

  const spinY = useMotionValue(0);
  const spinScale = useMotionValue(1);

  const canTilt = () =>
    !reduceMotion &&
    !spinningRef.current &&
    pageVisibleRef.current &&
    inViewRef.current;

  const syncCenter = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width * 0.5,
      y: rect.top + rect.height * 0.5,
    };
  }, []);

  const updateTargetFromMouse = useCallback(() => {
    if (!mouseRef.current.has) {
      targetRef.current = { x: 0, y: 0 };
      return;
    }
    const { x: mx, y: my } = mouseRef.current;
    const { x: cx, y: cy } = centerRef.current;
    const nx = Math.max(
      -1,
      Math.min(1, (mx - cx) / TILT_LOOK_RADIUS_PX),
    );
    const ny = Math.max(
      -1,
      Math.min(1, (my - cy) / TILT_LOOK_RADIUS_PX),
    );
    targetRef.current = { x: nx, y: ny };
  }, []);

  const ensureRaf = useCallback(() => {
    if (rafRef.current != null) return;

    const tick = () => {
      const pin = pinRef.current;
      if (!pin) {
        rafRef.current = null;
        return;
      }

      if (!canTilt()) {
        pin.style.transform = "rotateX(0deg) rotateY(0deg)";
        rafRef.current = null;
        return;
      }

      updateTargetFromMouse();

      const cur = currentRef.current;
      const tgt = targetRef.current;
      cur.x += (tgt.x - cur.x) * TILT_LERP;
      cur.y += (tgt.y - cur.y) * TILT_LERP;

      const rotateY = cur.x * MAX_TILT_DEG;
      const rotateX = -cur.y * MAX_TILT_DEG;

      pin.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      pin.style.setProperty("--badge-px", `${((cur.x + 1) / 2) * 100}%`);
      pin.style.setProperty("--badge-py", `${((cur.y + 1) / 2) * 100}%`);

      const settled =
        Math.abs(tgt.x - cur.x) < 0.001 && Math.abs(tgt.y - cur.y) < 0.001;
      if (settled) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [reduceMotion, updateTargetFromMouse]);

  // Global look-at: window coords in refs, one rAF lerp, cached badge center.
  useEffect(() => {
    if (reduceMotion) return;

    syncCenter();

    const onPointerMove = (event: PointerEvent) => {
      mouseRef.current = {
        x: event.clientX,
        y: event.clientY,
        has: true,
      };
      if (canTilt()) ensureRaf();
    };

    const onScrollOrResize = () => {
      syncCenter();
      if (mouseRef.current.has && canTilt()) ensureRaf();
    };

    const onVisibility = () => {
      pageVisibleRef.current = document.visibilityState === "visible";
      if (!pageVisibleRef.current) {
        if (rafRef.current != null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }
      syncCenter();
      if (mouseRef.current.has && canTilt()) ensureRaf();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScrollOrResize, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              inViewRef.current = Boolean(entry?.isIntersecting);
              if (inViewRef.current) {
                syncCenter();
                if (mouseRef.current.has && canTilt()) ensureRaf();
              } else if (rafRef.current != null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
              }
            },
            { root: null, threshold: 0 },
          )
        : null;
    if (io && buttonRef.current) io.observe(buttonRef.current);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [ensureRaf, reduceMotion, syncCenter]);

  const playSpin = useCallback(async () => {
    if (spinningRef.current) return;
    unlock("hero-face");

    if (reduceMotion) {
      return;
    }

    spinningRef.current = true;
    setSpinning(true);
    if (pinRef.current) {
      pinRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }

    const landDeg = 360 * SPIN_FULL_TURNS;
    const overshootDeg = landDeg + SPIN_OVERSHOOT_DEG;

    spinY.set(0);
    spinScale.set(1);

    const spinPhaseS = SPIN_DURATION_S * SPIN_T_OVERSHOOT;
    const tAnti = SPIN_T_ANTICIPATION / SPIN_T_OVERSHOOT;

    await Promise.all([
      animate(spinY, [0, SPIN_ANTICIPATION_DEG, overshootDeg], {
        duration: spinPhaseS,
        times: [0, tAnti, 1],
        ease: ["easeOut", [0.33, 0.0, 0.2, 1]],
      }),
      animate(spinScale, [1, SPIN_SCALE_SQUASH, SPIN_SCALE_STRETCH, 1], {
        duration: spinPhaseS,
        times: [0, tAnti, 0.55, 1],
        ease: "easeInOut",
      }),
    ]);

    await animate(spinY, landDeg, {
      type: "spring",
      stiffness: SPIN_SETTLE_STIFFNESS,
      damping: SPIN_SETTLE_DAMPING,
      mass: SPIN_SETTLE_MASS,
    });

    // Normalize so the next spin starts from 0 without a visual jump.
    spinY.set(0);
    spinScale.set(1);
    spinningRef.current = false;
    setSpinning(false);
    syncCenter();
    if (mouseRef.current.has) ensureRaf();
  }, [ensureRaf, reduceMotion, spinScale, spinY, syncCenter, unlock]);

  const facePct = `${FACE_INSET * 100}%`;
  // Deepest first so later slices paint on top toward the face plate.
  const extrudeSlices = Array.from({ length: PIN_DEPTH_PX }, (_, i) => {
    const depth = PIN_DEPTH_PX - i; // PIN_DEPTH_PX … 1
    return {
      key: depth,
      x: depth * PIN_EXTRUDE_X,
      y: depth * PIN_EXTRUDE_Y,
      fill: extrudeFill(depth),
    };
  });

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={playSpin}
      aria-label={replayLabel}
      title={replayTitle}
      disabled={spinning}
      className={cn(
        "relative inline-flex w-auto shrink-0 cursor-pointer items-center justify-center overflow-visible border-0 bg-transparent p-0",
        BADGE_HEIGHT_CLASS,
        "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/[0.28]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        spinning && "cursor-default",
        className,
      )}
      style={{ aspectRatio: `${BADGE_WIDTH} / ${BADGE_HEIGHT}` }}
    >
      <motion.span
        aria-hidden
        className="relative block h-full w-auto overflow-visible"
        style={{
          aspectRatio: `${BADGE_WIDTH} / ${BADGE_HEIGHT}`,
          rotateY: spinY,
          scale: spinScale,
          transformPerspective: 520,
        }}
      >
        {/* Pointer tilt — nested so it doesn't fight the spin rotateY */}
        <span
          ref={pinRef}
          className="relative block h-full w-full overflow-visible will-change-transform"
          style={
            {
              transform: "rotateX(0deg) rotateY(0deg)",
              ["--badge-px" as string]: "38%",
              ["--badge-py" as string]: "22%",
            } as CSSProperties
          }
        >
          {/* Soft ground shadow — light cream sheet: keep contact soft, not heavy */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              ...FACE_MASK,
              transform: `translate(${PIN_DEPTH_PX * PIN_EXTRUDE_X + 0.5}px, ${PIN_DEPTH_PX * PIN_EXTRUDE_Y + 1}px)`,
              background: "#1c1c1c",
              filter: "blur(2.5px)",
              opacity: 0.14,
            }}
          />

          {/* Reflective metal body extrusion (pin thickness) */}
          {extrudeSlices.map(({ key, x, y, fill }) => (
            <span
              key={key}
              className="pointer-events-none absolute inset-0"
              style={{
                ...FACE_MASK,
                transform: `translate(${x}px, ${y}px)`,
                background: fill,
                opacity: 1,
              }}
            />
          ))}

          {/* Front chrome lip — polished silver on the face plane only */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              ...FACE_MASK,
              background: CHROME_MIRROR_BG,
            }}
          />

          {/* Face plate — inset so chrome rim reads as a hairline */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Image
              src={BADGE_SRC}
              alt=""
              width={BADGE_WIDTH}
              height={BADGE_HEIGHT}
              sizes="56px"
              draggable={false}
              priority
              className="w-auto origin-center select-none object-contain"
              style={{
                height: facePct,
                filter: "brightness(0.96) contrast(1.04) saturate(1.05)",
              }}
            />
          </span>

          {/* Soft specular on the front face */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              ...FACE_MASK,
              background:
                "linear-gradient(115deg, transparent 0%, transparent 36%, rgba(255,255,255,0.28) 44%, rgba(255,255,255,0.45) 47%, rgba(255,255,255,0.2) 50%, transparent 60%, transparent 100%)",
              backgroundPosition: "var(--badge-px) var(--badge-py)",
              mixBlendMode: "soft-light",
              opacity: FACE_SPECULAR_OPACITY,
            }}
          />
        </span>
      </motion.span>
    </button>
  );
}

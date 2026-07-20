"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { animate, motion, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

const BADGE_SRC = "/assets/home/hero-face-badge.webp";
const BADGE_WIDTH = 250;
const BADGE_HEIGHT = 360;

/* ─── Tunables (size / chrome / tilt) ─── */
/** Display height in Tailwind terms — bump for a larger pin (was 48 / h-12). */
const BADGE_HEIGHT_CLASS = "h-16"; // 64px
/** How much of the chrome shell the face fills. Higher = thinner rim. */
const FACE_INSET = 0.97; // 97% → ~1.5% rim each side
/** Pointer-follow tilt (idle). */
const MAX_TILT_DEG = 10;
const TILT_LERP = 0.18;

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pinRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const hoveringRef = useRef(false);
  const spinningRef = useRef(false);
  const [spinning, setSpinning] = useState(false);

  const spinY = useMotionValue(0);
  const spinScale = useMotionValue(1);

  const applyTilt = useCallback(() => {
    const pin = pinRef.current;
    if (!pin) {
      rafRef.current = null;
      return;
    }

    if (spinningRef.current || reduceMotion) {
      pin.style.transform = "rotateX(0deg) rotateY(0deg)";
      rafRef.current = null;
      return;
    }

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
    if (!settled || hoveringRef.current) {
      rafRef.current = requestAnimationFrame(applyTilt);
    } else {
      rafRef.current = null;
      pin.style.transform = "rotateX(0deg) rotateY(0deg)";
      pin.style.setProperty("--badge-px", "38%");
      pin.style.setProperty("--badge-py", "22%");
    }
  }, [reduceMotion]);

  const ensureRaf = useCallback(() => {
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(applyTilt);
    }
  }, [applyTilt]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (reduceMotion || spinningRef.current) return;
      const el = buttonRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      targetRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };
      hoveringRef.current = true;
      ensureRaf();
    },
    [ensureRaf, reduceMotion],
  );

  const handlePointerLeave = useCallback(() => {
    if (reduceMotion) return;
    hoveringRef.current = false;
    targetRef.current = { x: 0, y: 0 };
    ensureRaf();
  }, [ensureRaf, reduceMotion]);

  const playSpin = useCallback(async () => {
    if (spinningRef.current) return;

    if (reduceMotion) {
      return;
    }

    spinningRef.current = true;
    setSpinning(true);
    hoveringRef.current = false;
    targetRef.current = { x: 0, y: 0 };
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
  }, [reduceMotion, spinScale, spinY]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const facePct = `${FACE_INSET * 100}%`;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={playSpin}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label={replayLabel}
      title={replayTitle}
      disabled={spinning}
      className={cn(
        "relative inline-flex w-auto shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0",
        BADGE_HEIGHT_CLASS,
        "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416]",
        spinning && "cursor-default",
        className,
      )}
      style={{ aspectRatio: `${BADGE_WIDTH} / ${BADGE_HEIGHT}` }}
    >
      <motion.span
        aria-hidden
        className="relative block h-full w-auto"
        style={{
          aspectRatio: `${BADGE_WIDTH} / ${BADGE_HEIGHT}`,
          rotateY: spinY,
          scale: spinScale,
          transformStyle: "preserve-3d",
          transformPerspective: 480,
        }}
      >
        {/* Pointer tilt — nested so it doesn't fight the spin rotateY */}
        <span
          ref={pinRef}
          className="relative block h-full w-full will-change-transform"
          style={
            {
              transformStyle: "preserve-3d",
              transform: "rotateX(0deg) rotateY(0deg)",
              ["--badge-px" as string]: "38%",
              ["--badge-py" as string]: "22%",
            } as CSSProperties
          }
        >
          <span
            className="pointer-events-none absolute inset-0 translate-y-[1.5px] scale-[1.02]"
            style={{
              ...FACE_MASK,
              background: "rgba(0, 0, 0, 0.55)",
              filter: "blur(2.5px)",
              opacity: 0.5,
            }}
          />

          {/* Thin mirror chrome rim */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              ...FACE_MASK,
              background: CHROME_MIRROR_BG,
            }}
          />

          {/* Face — nearly full size so chrome reads as a hairline */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Image
              src={BADGE_SRC}
              alt=""
              width={BADGE_WIDTH}
              height={BADGE_HEIGHT}
              sizes="64px"
              draggable={false}
              priority
              className="w-auto origin-center select-none object-contain"
              style={{ height: facePct }}
            />
          </span>

          {/* Sharp mirror specular that tracks pointer */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              ...FACE_MASK,
              background:
                "linear-gradient(115deg, transparent 0%, transparent 28%, rgba(255,255,255,0.55) 42%, rgba(255,255,255,0.9) 46%, rgba(255,255,255,0.35) 50%, transparent 62%, transparent 100%)",
              backgroundPosition: "var(--badge-px) var(--badge-py)",
              mixBlendMode: "soft-light",
              opacity: 0.85,
            }}
          />
        </span>
      </motion.span>
    </button>
  );
}

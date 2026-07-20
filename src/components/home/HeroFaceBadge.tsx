"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BADGE_SRC = "/assets/home/hero-face-badge.webp";
const BADGE_WIDTH = 250;
const BADGE_HEIGHT = 360;
const MAX_TILT_DEG = 10;
const LERP = 0.18;

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

/** Outer rim — darker steel so thickness reads at ~48px */
const CHROME_OUTER_BG = [
  "conic-gradient(from 200deg at 40% 30%,",
  "#f4f6f8 0deg,",
  "#a8b0be 55deg,",
  "#5c6574 120deg,",
  "#dce1e8 175deg,",
  "#3d4554 240deg,",
  "#b6becb 300deg,",
  "#f4f6f8 360deg)",
].join("");

/** Inner bevel highlight — brighter lip inside the dark rim */
const CHROME_INNER_BG = [
  "conic-gradient(from 220deg at 45% 25%,",
  "#ffffff 0deg,",
  "#cfd5df 70deg,",
  "#8b94a3 140deg,",
  "#f0f3f7 200deg,",
  "#6a7382 270deg,",
  "#e8ecf2 330deg,",
  "#ffffff 360deg)",
].join("");

type HeroFaceBadgeProps = {
  replayTick: number;
  burstActive: boolean;
  onReplay: () => void;
  reduceMotion: boolean | null;
  replayLabel: string;
  replayTitle: string;
  className?: string;
};

export function HeroFaceBadge({
  replayTick,
  burstActive,
  onReplay,
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

  const applyTilt = useCallback(() => {
    const pin = pinRef.current;
    if (!pin) {
      rafRef.current = null;
      return;
    }

    const cur = currentRef.current;
    const tgt = targetRef.current;
    cur.x += (tgt.x - cur.x) * LERP;
    cur.y += (tgt.y - cur.y) * LERP;

    const rotateY = cur.x * MAX_TILT_DEG;
    const rotateX = -cur.y * MAX_TILT_DEG;

    pin.style.transform = `perspective(400px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    pin.style.setProperty("--badge-px", `${((cur.x + 1) / 2) * 100}%`);
    pin.style.setProperty("--badge-py", `${((cur.y + 1) / 2) * 100}%`);

    const settled =
      Math.abs(tgt.x - cur.x) < 0.001 && Math.abs(tgt.y - cur.y) < 0.001;
    if (!settled || hoveringRef.current) {
      rafRef.current = requestAnimationFrame(applyTilt);
    } else {
      rafRef.current = null;
      pin.style.transform = "perspective(400px) rotateX(0deg) rotateY(0deg)";
      pin.style.setProperty("--badge-px", "42%");
      pin.style.setProperty("--badge-py", "28%");
    }
  }, []);

  const ensureRaf = useCallback(() => {
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(applyTilt);
    }
  }, [applyTilt]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (reduceMotion) return;
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

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onReplay}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label={replayLabel}
      title={replayTitle}
      className={cn(
        "relative inline-flex h-12 w-auto shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0",
        "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[#141416]",
        className,
      )}
      style={{ aspectRatio: `${BADGE_WIDTH} / ${BADGE_HEIGHT}` }}
    >
      <motion.span
        key={replayTick}
        aria-hidden
        initial={
          reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.88, opacity: 0.92 }
        }
        animate={{
          scale: 1,
          opacity: burstActive ? 0 : 1,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 560,
                damping: 26,
                mass: 0.85,
              }
        }
        className="relative block h-full w-auto"
        style={{ aspectRatio: `${BADGE_WIDTH} / ${BADGE_HEIGHT}` }}
      >
        {/* Tilt stack — DOM style only; nested so FM scale doesn't clobber rotate */}
        <span
          ref={pinRef}
          className="relative block h-full w-full will-change-transform"
          style={
            {
              transformStyle: "preserve-3d",
              transform: "perspective(400px) rotateX(0deg) rotateY(0deg)",
              ["--badge-px" as string]: "42%",
              ["--badge-py" as string]: "28%",
            } as CSSProperties
          }
        >
          {/* Soft drop shadow under the pin */}
          <span
            className="pointer-events-none absolute inset-0 translate-y-[2px] scale-[1.04]"
            style={{
              ...FACE_MASK,
              background: "rgba(0, 0, 0, 0.65)",
              filter: "blur(3px)",
              opacity: 0.6,
            }}
          />

          {/* Outer chrome — dark steel silhouette (full size) */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              ...FACE_MASK,
              background: CHROME_OUTER_BG,
              boxShadow:
                "inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -2px 3px rgba(20,24,32,0.55)",
            }}
          />

          {/* Inner chrome bevel — bright lip, slightly inset */}
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <span
              className="block h-[90%] w-auto"
              style={{
                ...FACE_MASK,
                aspectRatio: `${BADGE_WIDTH} / ${BADGE_HEIGHT}`,
                width: "90%",
                height: "90%",
                background: CHROME_INNER_BG,
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(40,48,62,0.4)",
              }}
            />
          </span>

          {/* Face cutout — deeper inset so dual chrome rim reads chunky */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Image
              src={BADGE_SRC}
              alt=""
              width={BADGE_WIDTH}
              height={BADGE_HEIGHT}
              sizes="48px"
              draggable={false}
              priority
              className="h-[78%] w-auto origin-center select-none object-contain"
            />
          </span>

          {/* Specular highlight — tracks pointer via CSS vars */}
          <span
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              ...FACE_MASK,
              background:
                "radial-gradient(ellipse 65% 50% at var(--badge-px) var(--badge-py), rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 34%, rgba(255,255,255,0) 64%)",
              opacity: 0.5,
            }}
          />
        </span>
      </motion.span>
    </button>
  );
}

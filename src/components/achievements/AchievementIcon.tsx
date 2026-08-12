"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACH_ARC_GREEN,
  ACH_FLIP_HOLD_MS,
  ACH_FLIP_IN_MS,
  ACH_FLIP_OUT_MS,
  ACH_GLYPH_SIZE,
  ACH_ORB_SIZE_PX,
  ACH_GLYPH_COLOR,
  ACH_RING_BG,
  ACH_RING_MUTED,
  ACH_RING_NOTCH,
  ACH_RING_RADIUS,
  ACH_RING_STROKE,
  ACH_SITE_MARK_SRC,
  ACH_SPHERE_RADIUS,
} from "./achievementTokens";

type Face = "site" | "glyph";

interface AchievementIconProps {
  Glyph: LucideIcon;
  active: boolean;
  reducedMotion: boolean;
  className?: string;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const start = polar(cx, cy, r, endDeg);
  const end = polar(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

/** Static ring — Player 1 green arc = top-left quadrant (270°–360°, 0 = north). */
function RingChrome() {
  const s = ACH_ORB_SIZE_PX;
  const c = s / 2;
  const r = ACH_RING_RADIUS;
  const stroke = ACH_RING_STROKE;
  const segments: Array<{ d: string; color: string; width: number }> = [
    { d: describeArc(c, c, r, 0, 90), color: ACH_RING_MUTED, width: stroke },
    { d: describeArc(c, c, r, 90, 180), color: ACH_RING_MUTED, width: stroke },
    { d: describeArc(c, c, r, 180, 270), color: ACH_RING_MUTED, width: stroke },
    // Player 1 — top-left
    { d: describeArc(c, c, r, 270, 360), color: ACH_ARC_GREEN, width: stroke },
  ];

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      <circle cx={c} cy={c} r={r + 1.5} fill={ACH_RING_BG} />
      <circle cx={c} cy={c} r={ACH_SPHERE_RADIUS + 0.5} fill={ACH_RING_NOTCH} />
      {segments.map((seg, i) => (
        <path
          key={i}
          d={seg.d}
          fill="none"
          stroke={seg.color}
          strokeWidth={seg.width}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}

/** Chrome sphere with the site favicon mark (replaces Xbox X). */
function SiteMarkFace() {
  const s = ACH_ORB_SIZE_PX;
  const c = s / 2;
  const r = ACH_SPHERE_RADIUS;
  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      <defs>
        <radialGradient id="achSphereFill" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#5a5a5a" />
          <stop offset="55%" stopColor="#2e2e2e" />
          <stop offset="100%" stopColor="#141414" />
        </radialGradient>
        <radialGradient id="achSphereShine" cx="35%" cy="28%" r="45%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <clipPath id="achSphereClip">
          <circle cx={c} cy={c} r={r} />
        </clipPath>
      </defs>
      <circle cx={c} cy={c} r={r} fill="url(#achSphereFill)" />
      <circle cx={c} cy={c} r={r} fill="url(#achSphereShine)" />
      <image
        href={ACH_SITE_MARK_SRC}
        x={c - 11}
        y={c - 11}
        width={22}
        height={22}
        clipPath="url(#achSphereClip)"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}

/**
 * Xbox 360 toast icon: static ring + green top-left (P1) arc; inner disc flips
 * between the site mark and the achievement glyph for the full hold.
 */
export function AchievementIcon({
  Glyph,
  active,
  reducedMotion,
  className,
}: AchievementIconProps) {
  const [face, setFace] = useState<Face>("site");
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [inKey, setInKey] = useState(0);

  useEffect(() => {
    if (!active) {
      setFace("site");
      setPhase("idle");
      return;
    }
    if (reducedMotion) {
      const t = window.setTimeout(() => setFace("glyph"), 400);
      return () => window.clearTimeout(t);
    }

    let cancelled = false;
    let holdTimer: number | undefined;
    let outTimer: number | undefined;
    let inTimer: number | undefined;

    const cycle = (from: Face) => {
      if (cancelled) return;
      holdTimer = window.setTimeout(() => {
        if (cancelled) return;
        setPhase("out");
        outTimer = window.setTimeout(() => {
          if (cancelled) return;
          const next: Face = from === "site" ? "glyph" : "site";
          setFace(next);
          setInKey((k) => k + 1);
          setPhase("in");
          inTimer = window.setTimeout(() => {
            if (cancelled) return;
            setPhase("idle");
            cycle(next);
          }, ACH_FLIP_IN_MS);
        }, ACH_FLIP_OUT_MS);
      }, ACH_FLIP_HOLD_MS);
    };

    setFace("site");
    setPhase("idle");
    cycle("site");

    return () => {
      cancelled = true;
      if (holdTimer) window.clearTimeout(holdTimer);
      if (outTimer) window.clearTimeout(outTimer);
      if (inTimer) window.clearTimeout(inTimer);
    };
  }, [active, reducedMotion]);

  const discStyle: CSSProperties = (() => {
    if (reducedMotion || phase === "idle") {
      return { opacity: 1, transform: "scaleX(1)" };
    }
    if (phase === "out") {
      return {
        opacity: 0,
        transform: "scaleX(1)",
        transition: `opacity ${ACH_FLIP_OUT_MS}ms linear`,
      };
    }
    return {};
  })();

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden rounded-full", className)}
      style={{ width: ACH_ORB_SIZE_PX, height: ACH_ORB_SIZE_PX }}
    >
      <RingChrome />
      <div
        key={phase === "in" ? `in-${inKey}` : `rest-${face}`}
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          phase === "in" && !reducedMotion && "ach-icon-in",
        )}
        style={discStyle}
      >
        {face === "site" ? (
          <SiteMarkFace />
        ) : (
          <Glyph
            size={ACH_GLYPH_SIZE}
            strokeWidth={2.25}
            color={ACH_GLYPH_COLOR}
            absoluteStrokeWidth
          />
        )}
      </div>
    </div>
  );
}

export { ACH_ORB_SIZE_PX as ACHIEVEMENT_ORB_PX };

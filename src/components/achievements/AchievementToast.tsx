"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import type { AchievementDef } from "@/data/achievements";
import { AchievementIcon, ACHIEVEMENT_ORB_PX } from "./AchievementIcon";
import { playAchievementUnlock } from "@/lib/achievementAudio";
import {
  ACH_BOTTOM_OFFSET_PX,
  ACH_ENTER_GROW_MS,
  ACH_ENTER_ORB_MS,
  ACH_ENTER_TEXT_DELAY_MS,
  ACH_ENTER_TEXT_MS,
  ACH_EXIT_MS,
  ACH_EXIT_TEXT_MS,
  ACH_HOLD_MS,
  ACH_PILL_GLOW,
  ACH_PILL_HEIGHT_PX,
  ACH_TEXT_SIZE_PX,
  ACH_Z_INDEX,
} from "./achievementTokens";

/**
 * Xbox 360 notification toast.
 * Entrance ~470ms / hold ~5.25s / exit ~300ms — measured from reference footage.
 * Deliberately exceeds the project's 300ms interaction cap (system announcement).
 */

type Phase = "enter" | "hold" | "exit";

type AchievementToastProps = {
  achievement: AchievementDef;
  onComplete: () => void;
};

function estimateWidth(title: string) {
  // Orb + padding + ~7.2px per glyph for 13px Geist — safe fallback.
  return Math.ceil(
    ACHIEVEMENT_ORB_PX + 28 + Math.max(140, title.length * 7.4),
  );
}

export function AchievementToast({
  achievement,
  onComplete,
}: AchievementToastProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("enter");
  const [panelW, setPanelW] = useState(() => estimateWidth(achievement.title));
  const [orbReady, setOrbReady] = useState(reduceMotion);
  const [grow, setGrow] = useState(reduceMotion);
  const [textOn, setTextOn] = useState(reduceMotion);
  const [exiting, setExiting] = useState(false);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const w = Math.ceil(el.getBoundingClientRect().width);
    if (w > ACHIEVEMENT_ORB_PX) setPanelW(w);
  }, [achievement.id, mounted]);

  // Lifecycle timers — independent of measure (estimate is enough to start).
  useEffect(() => {
    if (!mounted) return;

    setOrbReady(reduceMotion);
    setGrow(reduceMotion);
    setTextOn(reduceMotion);
    setExiting(false);
    setPhase("enter");

    if (reduceMotion) {
      playAchievementUnlock();
      setOrbReady(true);
      setGrow(true);
      setTextOn(true);
      setPhase("hold");
      const hold = window.setTimeout(() => {
        setExiting(true);
        setPhase("exit");
        window.setTimeout(() => onCompleteRef.current(), ACH_EXIT_MS);
      }, ACH_HOLD_MS);
      return () => window.clearTimeout(hold);
    }

    playAchievementUnlock();

    const tOrb = window.setTimeout(() => setOrbReady(true), 16);
    const tGrow = window.setTimeout(() => setGrow(true), ACH_ENTER_ORB_MS);
    const tText = window.setTimeout(
      () => setTextOn(true),
      ACH_ENTER_TEXT_DELAY_MS,
    );
    const tHold = window.setTimeout(
      () => setPhase("hold"),
      ACH_ENTER_ORB_MS + ACH_ENTER_GROW_MS,
    );
    const tExit = window.setTimeout(() => {
      setTextOn(false);
      setExiting(true);
      setPhase("exit");
      window.setTimeout(() => onCompleteRef.current(), ACH_EXIT_MS);
    }, ACH_ENTER_ORB_MS + ACH_ENTER_GROW_MS + ACH_HOLD_MS);

    return () => {
      window.clearTimeout(tOrb);
      window.clearTimeout(tGrow);
      window.clearTimeout(tText);
      window.clearTimeout(tHold);
      window.clearTimeout(tExit);
    };
  }, [achievement.id, mounted, reduceMotion]);

  if (!mounted) return null;

  const targetW = Math.max(panelW, estimateWidth(achievement.title));
  const shownW = grow && !exiting ? targetW : ACHIEVEMENT_ORB_PX;
  const exitW = exiting ? Math.max(ACHIEVEMENT_ORB_PX, targetW * 0.92) : shownW;

  const toast = (
    <div
      className="pointer-events-none fixed inset-x-0 flex justify-center"
      style={{ bottom: ACH_BOTTOM_OFFSET_PX, zIndex: ACH_Z_INDEX }}
      role="status"
      aria-live="polite"
      aria-label={`Achievement unlocked: ${achievement.title}`}
      data-achievement-toast
      data-achievement-id={achievement.id}
      data-phase={phase}
      data-panel-w={targetW}
      data-grow={grow ? "1" : "0"}
    >
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 flex w-max items-center gap-3 whitespace-nowrap opacity-0 pl-1.5 pr-5"
        style={{ height: ACH_PILL_HEIGHT_PX }}
      >
        <div style={{ width: ACHIEVEMENT_ORB_PX, height: ACHIEVEMENT_ORB_PX }} />
        <div className="flex flex-col justify-center leading-tight">
          <span
            className="font-[family-name:var(--font-geist)] font-medium"
            style={{ fontSize: ACH_TEXT_SIZE_PX }}
          >
            Achievement unlocked
          </span>
          <span
            className="font-[family-name:var(--font-geist)]"
            style={{ fontSize: ACH_TEXT_SIZE_PX }}
          >
            {achievement.title}
          </span>
        </div>
      </div>

      <div
        className="relative flex items-center overflow-hidden rounded-full"
        style={{
          height: ACH_PILL_HEIGHT_PX,
          width: exitW,
          background: "var(--ach-pill-fill)",
          boxShadow: ACH_PILL_GLOW,
          transition: reduceMotion
            ? "opacity 150ms linear"
            : exiting
              ? `width ${ACH_EXIT_MS}ms ease-in, opacity ${ACH_EXIT_MS}ms ease-in`
              : `width ${ACH_ENTER_GROW_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          opacity: exiting ? 0 : 1,
        }}
      >
        <div
          className="relative z-[1] shrink-0"
          style={{
            width: ACHIEVEMENT_ORB_PX,
            height: ACHIEVEMENT_ORB_PX,
            marginLeft: (ACH_PILL_HEIGHT_PX - ACHIEVEMENT_ORB_PX) / 2,
            opacity: orbReady && !exiting ? 1 : 0,
            transform:
              orbReady && !exiting
                ? "scale(1)"
                : exiting
                  ? "scale(0.15)"
                  : "scale(0.2)",
            transition: reduceMotion
              ? "opacity 120ms linear"
              : exiting
                ? `transform ${ACH_EXIT_MS}ms ease-in, opacity ${ACH_EXIT_TEXT_MS}ms linear`
                : `transform ${ACH_ENTER_ORB_MS}ms ease-out, opacity ${ACH_ENTER_ORB_MS}ms ease-out`,
          }}
        >
          <AchievementIcon
            Glyph={achievement.icon}
            active={phase === "hold" && !exiting}
            reducedMotion={reduceMotion}
          />
        </div>

        <div
          className="ml-2 mr-5 flex min-w-0 flex-col justify-center leading-tight"
          style={{
            color: "var(--ach-pill-text)",
            opacity: textOn && !exiting ? 1 : 0,
            transition: reduceMotion
              ? "opacity 100ms linear"
              : exiting
                ? `opacity ${ACH_EXIT_TEXT_MS}ms linear`
                : `opacity ${ACH_ENTER_TEXT_MS}ms ease-out`,
          }}
        >
          <span
            className="font-[family-name:var(--font-geist)] font-medium tracking-[0.01em]"
            style={{ fontSize: ACH_TEXT_SIZE_PX }}
          >
            Achievement unlocked
          </span>
          <span
            className="font-[family-name:var(--font-geist)] tracking-[0.01em]"
            style={{ fontSize: ACH_TEXT_SIZE_PX }}
          >
            {achievement.title}
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(toast, document.body);
}
